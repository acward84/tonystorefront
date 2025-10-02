// /netlify/functions/cookie-reader.js

// allow-list (you can add more if needed)
const ALLOW_ORIGINS = new Set([
  'https://checkout.testtheedgefun.com',
  'https://testtheedgefun.com',
  'https://www.testtheedgefun.com',
  'null' // <-- allow sandbox/iframe pixels that send Origin: null
]);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function parseCookies(header = '') {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) {
      const key = p.slice(0, i).trim();
      const val = p.slice(i + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}

export async function handler(event) {
  const origin = (event.headers.origin ?? '').toString(); // could be 'null'
  const allowed = ALLOW_ORIGINS.has(origin) ? origin : '';

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: allowed ? corsHeaders(allowed) : { Vary: 'Origin' },
      body: ''
    };
  }

  const cookieHeader = event.headers.cookie || '';
  const cookies = parseCookies(cookieHeader);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...(allowed ? corsHeaders(allowed) : { Vary: 'Origin' })
    },
    body: JSON.stringify({ raw: cookieHeader || null, parsed: cookies }, null, 2)
  };
}
