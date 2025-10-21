import crypto from 'crypto';

const {
  SHOPIFY_API_KEY = 'fe96bd42fbd6cefd2545913ab634120d',
  SHOPIFY_API_SECRET,
  SHOPIFY_HOST = 'https://edgee.testtheedgefun.com'
} = process.env;

export async function handler(event, context) {
  const { code, shop, state, hmac, host } = event.queryStringParameters || {};

  if (!code || !shop || !state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters' })
    };
  }

  // Verify HMAC
  const queryParams = { ...event.queryStringParameters };
  delete queryParams.hmac;
  delete queryParams.signature;

  const message = Object.keys(queryParams)
    .sort()
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');

  if (generatedHash !== hmac) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'HMAC validation failed' })
    };
  }

  try {
    // Exchange code for access token
    const accessTokenUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    };

    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accessTokenPayload)
    });

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('Failed to get access token');
    }

    console.log('✅ App installed successfully for shop:', shop);

    // TODO: Store access token in your database
    // For now, we'll just log it (DO NOT DO THIS IN PRODUCTION)
    console.log('Access token received (store this securely!)');

    // Redirect to success page or app
    const redirectUrl = host 
      ? `https://${shop}/admin/apps/${SHOPIFY_API_KEY}?host=${encodeURIComponent(host)}`
      : `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`;

    return {
      statusCode: 302,
      headers: {
        'Location': redirectUrl
      },
      body: ''
    };

  } catch (error) {
    console.error('Error during OAuth callback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed', details: error.message })
    };
  }
}
