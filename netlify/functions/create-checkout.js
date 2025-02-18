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

  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ 
      success: false,
      message: 'This endpoint is deprecated. Please use the Stripe Buy Button for checkout.'
    })
  };
};