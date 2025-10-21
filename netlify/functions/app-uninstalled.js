import crypto from 'crypto';

const { SHOPIFY_API_SECRET } = process.env;

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const shop = event.headers['x-shopify-shop-domain'];
  const hmac = event.headers['x-shopify-hmac-sha256'];

  // Verify webhook authenticity
  const hash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(event.body, 'utf8')
    .digest('base64');

  if (hash !== hmac) {
    console.error('Webhook verification failed for shop:', shop);
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Webhook verification failed' })
    };
  }

  console.log('🗑️ App uninstalled from shop:', shop);
  
  // TODO: Clean up shop data from your database
  // await deleteShopData(shop);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Webhook processed' })
  };
}
