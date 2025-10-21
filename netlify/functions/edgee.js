// netlify/functions/edgee.js
let log = []; // shared while the function container is warm

export default async (req) => {
  const url = new URL(req.url);

  // --- tracker view ---
  if (url.pathname.endsWith("/tracker")) {
    return new Response(
      `
      <html>
        <head>
          <title>Edgee Tracker</title>
          <meta http-equiv="refresh" content="5"> <!-- auto-refresh every 5s -->
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
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // --- proxy endpoint ---
  if (req.method === "POST") {
    const body = await req.json();
    log.unshift({ ts: new Date().toISOString(), payload: body });
    log = log.slice(0, 100); // keep last 100 entries
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- fallback for GET /
  return new Response("Edgee function ready", {
    headers: { "Content-Type": "text/plain" },
  });
};
