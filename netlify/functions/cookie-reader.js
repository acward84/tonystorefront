const ALLOW_ORIGINS = [
  // Put your actual storefront/checkout origins here:
  'https://checkout.testtheedgefun.com',   // if your storefront is here
  'https://www.testtheedgefun.com'        // calling directly from same site is fine too
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

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: allowedOrigin ? corsHeaders(allowedOrigin) : {},
      body: '',
    };
  }

  // Read cookie (set by your proxy) from the incoming request
  const cookieHeader = event.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)edgeeasph=([^;]+)/);
  const edgeeasph = match ? decodeURIComponent(match[1]) : null;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...(allowedOrigin ? corsHeaders(allowedOrigin) : {}),
    },
    body: JSON.stringify({ edgeeasph }),
  };
}
