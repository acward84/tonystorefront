// netlify/functions/proxy.js
let log = []; // temporary memory log (resets on redeploy)

export default async (req, context) => {
  try {
    const body = await req.json();

    // Store last 100 payloads
    log.unshift({ ts: new Date().toISOString(), payload: body });
    log = log.slice(0, 100);

    // Optionally forward to Edgee
    await fetch("https://test.testtheedgefun.com/_edgee/sdk.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

// expose in-memory log for tracker function
export { log };
