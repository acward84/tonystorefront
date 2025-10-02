const ALLOW_ORIGINS = [
  // Your storefront (theme) domain(s)
  'https://<your-shop>.myshopify.com',
  'https://www.<your-custom-shop-domain>.com',

  // Shopify checkout can come from a different origin depending on your setup
  // Add it if different from the storefront origin
  'https://checkout.<your-custom-shop-domain>.com',
  // or sometimes
  'https://checkout.shopify.com', // include only if you actually see this as Origin
  // For local testing (optional)
  // 'http://localhost:3000',
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function handler(event) {
  const origin = event.headers.origin || '';
  const allowedOrigin = ALLOW_ORIGINS.includes(origin) ? origin : '';

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: allowedOrigin ? corsHeaders(allowedOrigin) : {},
      body: '',
    };
  }

  // Read cookie from request
  const cookieHeader = event.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)edgeeasph=([^;]+)/);
  const edgeeasph = match ? decodeURIComponent(match[1]) : null;

  // Optional server-side logging to verify hits in Netlify logs
  console.log('cookie-reader hit', {
    origin,
    hasCookie: Boolean(edgeeasph),
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...(allowedOrigin ? corsHeaders(allowedOrigin) : {}),
    },
    body: JSON.stringify({ edgeeasph }),
  };
}
