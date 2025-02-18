const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function(event, context) {
  console.log('🚀 Starting Supabase integration test...');
  console.log('📅 Test started at:', new Date().toISOString());
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Connection Test
    console.log('\n🔌 Testing Supabase Connection:');
    console.log('📡 URL:', process.env.SUPABASE_URL);
    console.log('🔑 Service key exists:', !!process.env.SUPABASE_SERVICE_KEY);
    console.log('🔐 Service key length:', process.env.SUPABASE_SERVICE_KEY?.length || 0);

    // Auth Test
    console.log('\n👥 Testing Auth System:');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 10
    });

    if (usersError) {
      console.error('❌ Error accessing auth system:', usersError);
      throw usersError;
    }

    console.log('✅ Successfully accessed auth system');
    console.log('📊 Auth Stats:');
    console.log('- Total users:', users?.users?.length || 0);
    if (users?.users?.length > 0) {
      console.log('- Users by provider:', users.users.reduce((acc, user) => {
        const provider = user.app_metadata?.provider || 'email';
        acc[provider] = (acc[provider] || 0) + 1;
        return acc;
      }, {}));
      console.log('- Confirmed emails:', users.users.filter(u => u.email_confirmed_at).length);
      console.log('- Latest signup:', new Date(Math.max(...users.users.map(u => new Date(u.created_at)))).toISOString());
    }

    // Profiles Test
    console.log('\n👤 Testing Profiles Table:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, is_premium, email_marketing, updated_at')
      .limit(10);

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError);
      throw profilesError;
    }

    console.log('✅ Successfully queried profiles table');
    console.log('📊 Profile Stats:');
    console.log('- Total profiles retrieved:', profiles?.length || 0);
    if (profiles?.length > 0) {
      console.log('- Premium users:', profiles.filter(p => p.is_premium).length);
      console.log('- Marketing opted-in:', profiles.filter(p => p.email_marketing).length);
      console.log('- Users with usernames:', profiles.filter(p => p.username).length);
      console.log('- Most recent update:', new Date(Math.max(...profiles.map(p => new Date(p.updated_at)))).toISOString());
    }

    // Data Integrity Check
    console.log('\n🔍 Checking Data Integrity:');
    const userIds = new Set(users.users.map(u => u.id));
    const profileIds = new Set(profiles.map(p => p.id));
    const orphanedProfiles = profiles.filter(p => !userIds.has(p.id));
    const usersWithoutProfiles = users.users.filter(u => !profileIds.has(u.id));

    console.log('📊 Integrity Stats:');
    console.log('- Orphaned profiles:', orphanedProfiles.length);
    console.log('- Users without profiles:', usersWithoutProfiles.length);
    if (orphanedProfiles.length > 0) {
      console.warn('⚠️ Warning: Found orphaned profiles:', orphanedProfiles.map(p => p.id));
    }
    if (usersWithoutProfiles.length > 0) {
      console.warn('⚠️ Warning: Found users without profiles:', usersWithoutProfiles.map(u => u.id));
    }

    // RLS Policy Test
    console.log('\n🔒 Testing RLS Policies:');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (rlsError) {
      console.log('✅ RLS policies are working (expected error):', rlsError.message);
    } else {
      console.warn('⚠️ Warning: RLS policies might not be enforced properly');
    }

    // Performance Test
    console.log('\n⚡ Testing Query Performance:');
    const startTime = performance.now();
    await Promise.all([
      supabase.from('profiles').select('count').limit(1),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
    ]);
    const endTime = performance.now();
    console.log(`✅ Parallel queries completed in ${Math.round(endTime - startTime)}ms`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Supabase integration test completed successfully',
        timestamp: new Date().toISOString(),
        stats: {
          auth: {
            totalUsers: users?.users?.length || 0,
            confirmedEmails: users?.users?.filter(u => u.email_confirmed_at).length || 0
          },
          profiles: {
            totalProfiles: profiles?.length || 0,
            premiumUsers: profiles?.filter(p => p.is_premium).length || 0,
            marketingOptIn: profiles?.filter(p => p.email_marketing).length || 0
          },
          integrity: {
            orphanedProfiles: orphanedProfiles.length,
            usersWithoutProfiles: usersWithoutProfiles.length
          },
          performance: {
            parallelQueryTime: Math.round(endTime - startTime)
          }
        }
      })
    };

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Supabase integration test failed',
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      })
    };
  }
};