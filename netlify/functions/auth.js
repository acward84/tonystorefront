import crypto from 'crypto';

const {
  SHOPIFY_API_KEY = 'fe96bd42fbd6cefd2545913ab634120d',
  SHOPIFY_API_SECRET,
  SHOPIFY_HOST = 'https://edgee.testtheedgefun.com'
} = process.env;

const SCOPES = 'write_pixels,read_pixels,read_customer_events,read_customers,read_orders,read_analytics';

export async function handler(event, context) {
  const { shop, host } = event.queryStringParameters || {};

  if (!shop) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing shop parameter' })
    };
  }

  // Validate shop format
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shopRegex.test(shop)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid shop parameter' })
    };
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  
  // Build OAuth URL
  const redirectUri = `${SHOPIFY_HOST}/api/auth/callback`;
  
  const authUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}` +
    (host ? `&host=${encodeURIComponent(host)}` : '');

  console.log('Initiating OAuth for shop:', shop);

  return {
    statusCode: 302,
    headers: {
      'Location': authUrl,
      'Set-Cookie': `shopify_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=300`
    },
    body: ''
  };
}
