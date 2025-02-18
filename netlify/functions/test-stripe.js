exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
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
    // Since we're using Stripe Buy Button, we don't need to test the connection
    // Just return success as the button handles its own validation
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Stripe Buy Button is ready to use"
      })
    };
  } catch (error) {
    console.error('Stripe configuration error:', error);
    
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