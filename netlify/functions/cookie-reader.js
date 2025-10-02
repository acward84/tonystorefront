const ALLOW_ORIGINS = [
  'https://checkout.testtheedgefun.com',
   'https://testtheedgefun.com',
  'https://www.testtheedgefun.com' // if applicable
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
  const allowed = ALLOW_ORIGINS.includes(origin) ? origin : '';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: allowed ? corsHeaders(allowed) : {}, body: '' };
  }

  const cookieHeader = event.headers.cookie || '';
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(p => {
      const i = p.indexOf('=');
      if (i > -1) cookies[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
    });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', ...(allowed ? corsHeaders(allowed) : {}) },
    body: JSON.stringify({ raw: cookieHeader || null, parsed: cookies }, null, 2)
  };
}
