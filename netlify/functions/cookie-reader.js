export async function handler(event) {
  const cookieHeader = event.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)edgeeasph=([^;]+)/);
  const edgeeasph = match ? decodeURIComponent(match[1]) : null;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://www.testtheedgefun.com",
      "Access-Control-Allow-Credentials": "true"
    },
    body: JSON.stringify({ edgeeasph })
  };
}
