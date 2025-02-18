const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  let stripeEvent;
  try {
    // Get the signature from headers
    const signature = event.headers['stripe-signature'];
    
    if (!signature) {
      console.error('No Stripe signature found');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'No Stripe signature found' 
        })
      };
    }

    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`✅ Webhook verified: ${stripeEvent.type}`);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Invalid signature',
        error: err.message 
      })
    };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const session = stripeEvent.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!customerId) {
          throw new Error('No customer ID in session');
        }

        // Get customer's email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer) {
          throw new Error('Customer not found in Stripe');
        }

        const customerEmail = customer.email;
        console.log(`📧 Processing subscription for customer: ${customerEmail}`);

        // Get user from Supabase using admin auth API
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
          filters: {
            email: customerEmail
          }
        });

        if (usersError || !users || users.length === 0) {
          console.error('User not found in Supabase:', usersError);
          throw new Error('User not found');
        }

        const user = users[0];
        console.log(`✅ Found user in Supabase: ${user.id}`);

        // Update user's premium status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_premium: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to update profile:', updateError);
          throw updateError;
        }

        console.log(`✅ Successfully updated premium status for user: ${user.id}`);
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end':
      case 'invoice.payment_failed': {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;

        if (!customerId) {
          throw new Error('No customer ID in subscription');
        }

        console.log(`💫 Processing subscription event for customer: ${customerId}`);

        // Find user by Stripe customer ID
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profiles) {
          console.error('Profile not found:', profileError);
          throw new Error('Profile not found');
        }

        // Update user's premium status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_premium: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', profiles.id);

        if (updateError) {
          console.error('Failed to update profile:', updateError);
          throw updateError;
        }

        console.log(`✅ Successfully processed subscription event for profile: ${profiles.id}`);
        break;
      }

      default: {
        console.log(`⚠️ Unhandled event type: ${stripeEvent.type}`);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: `Successfully processed ${stripeEvent.type}`
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Error processing webhook',
        error: error.message 
      })
    };
  }
};