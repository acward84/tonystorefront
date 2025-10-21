// netlify/functions/edgee.js
let log = []; // shared while the function container is warm

export default async (req) => {
  const url = new URL(req.url);

  // Common CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",            // or specify your domain
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // --- handle preflight (CORS OPTIONS) ---
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // --- tracker view ---
  if (url.pathname.endsWith("/tracker")) {
    return new Response(
      `
      <html>
        <head>
          <title>Edgee Tracker</title>
          <meta http-equiv="refresh" content="5">
          <style>
            body { font-family: sans-serif; margin: 2rem; }
            pre { background:#f7f7f7; padding:1rem; border-radius:8px; overflow-x:auto; }
          </style>
        </head>
        <body>
          <h1>Recent Pixel Calls (${log.length})</h1>
          ${log
            .map(
              (e) => `
                <h3>${e.ts}</h3>
                <pre>${JSON.stringify(e.payload, null, 2)}</pre>
              `
            )
            .join("")}
        </body>
      </html>
      `,
      { headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  // --- proxy endpoint ---
  if (req.method === "POST") {
    const body = await req.json();
    log.unshift({ ts: new Date().toISOString(), payload: body });
    log = log.slice(0, 100);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- fallback for GET /
  return new Response("Edgee function ready", {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
};
