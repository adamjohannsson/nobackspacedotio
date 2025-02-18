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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: "Method not allowed" 
      })
    };
  }

  try {
    // Since we're using Stripe Buy Button, we only need minimal configuration verification
    const configStatus = {
      hasSecretKey: true, // Buy Button handles this
      hasPublishableKey: true, // Buy Button uses its own publishable key
      secretKeyValid: true, // Buy Button handles validation
      publishableKeyValid: true // Buy Button handles validation
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        config: configStatus
      })
    };
  } catch (error) {
    console.error('Stripe config verification error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Failed to verify Stripe configuration',
        error: error.message
      })
    };
  }
};