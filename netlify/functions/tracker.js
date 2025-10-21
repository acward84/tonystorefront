// netlify/functions/tracker.js
import { log } from "./proxy.js";

export default async () => {
  return new Response(`
    <html>
      <head>
        <title>Edgee Tracker</title>
        <style>
          body { font-family: sans-serif; margin: 2rem; }
          pre { background: #f7f7f7; padding: 1rem; border-radius: 8px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>Recent Pixel Calls (${log.length})</h1>
        ${log.map(e => `
          <h3>${e.ts}</h3>
          <pre>${JSON.stringify(e.payload, null, 2)}</pre>
        `).join('')}
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
};
