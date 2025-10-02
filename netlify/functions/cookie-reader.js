export async function handler(event) {
  const cookieHeader = event.headers.cookie || '';

  // Parse cookies into an object
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(pair => {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        cookies[key] = decodeURIComponent(val);
      }
    });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw: cookieHeader || null,
      parsed: cookies
    }, null, 2)
  };
}
