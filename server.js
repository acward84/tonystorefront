import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_HOST,
  PORT = 3000
} = process.env;

// In-memory storage (replace with database in production)
const sessionStorage = new Map();

// ==============================================
// ROUTE: GET /api/auth
// Initiates OAuth flow
// ==============================================
app.get('/api/auth', (req, res) => {
  const { shop, host } = req.query;

  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  // Validate shop format
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shopRegex.test(shop)) {
    return res.status(400).send('Invalid shop parameter');
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store state temporarily (expires in 5 minutes)
  sessionStorage.set(state, {
    shop,
    host,
    timestamp: Date.now()
  });

  // Build OAuth URL
  const redirectUri = `${SHOPIFY_HOST}/api/auth/callback`;
  const scopes = SHOPIFY_SCOPES;
  
  const authUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  console.log('Redirecting to OAuth:', authUrl);
  res.redirect(authUrl);
});

// ==============================================
// ROUTE: GET /api/auth/callback
// Handles OAuth callback
// ==============================================
app.get('/api/auth/callback', async (req, res) => {
  const { code, shop, state, host } = req.query;

  if (!code || !shop || !state) {
    return res.status(400).send('Missing required parameters');
  }

  // Verify state (CSRF protection)
  const storedSession = sessionStorage.get(state);
  if (!storedSession || storedSession.shop !== shop) {
    return res.status(403).send('Invalid state or shop mismatch');
  }

  // Clean up state
  sessionStorage.delete(state);

  // Verify HMAC (security check)
  const hmac = req.query.hmac;
  const queryParams = { ...req.query };
  delete queryParams.hmac;
  delete queryParams.signature;

  const message = Object.keys(queryParams)
    .sort()
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');

  if (generatedHash !== hmac) {
    return res.status(403).send('HMAC validation failed');
  }

  try {
    // Exchange code for access token
    const accessTokenUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code
    };

    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accessTokenPayload)
    });

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('Failed to get access token');
    }

    // Store access token (replace with database in production)
    sessionStorage.set(shop, {
      accessToken: data.access_token,
      scope: data.scope,
      installedAt: Date.now()
    });

    console.log('✅ App installed successfully for shop:', shop);
    console.log('Access token stored');

    // Redirect to app (or success page)
    const redirectUrl = `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
});

// ==============================================
// ROUTE: POST /webhooks/app/uninstalled
// Handles app uninstallation
// ==============================================
app.post('/webhooks/app/uninstalled', (req, res) => {
  const shop = req.get('X-Shopify-Shop-Domain');
  const hmac = req.get('X-Shopify-Hmac-Sha256');

  // Verify webhook authenticity
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  if (hash !== hmac) {
    return res.status(403).send('Webhook verification failed');
  }

  console.log('🗑️ App uninstalled from shop:', shop);
  
  // Clean up shop data
  sessionStorage.delete(shop);
  
  // TODO: Remove from your database
  // await db.shops.delete(shop);

  res.status(200).send('OK');
});

// ==============================================
// ROUTE: POST /webhooks/app/scopes_update
// Handles scope updates
// ==============================================
app.post('/webhooks/app/scopes_update', (req, res) => {
  const shop = req.get('X-Shopify-Shop-Domain');
  const hmac = req.get('X-Shopify-Hmac-Sha256');

  // Verify webhook authenticity
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  if (hash !== hmac) {
    return res.status(403).send('Webhook verification failed');
  }

  console.log('🔄 Scopes updated for shop:', shop);
  console.log('New scopes:', req.body);

  // TODO: Update scopes in your database
  // await db.shops.update(shop, { scopes: req.body.scopes });

  res.status(200).send('OK');
});

// ==============================================
// OPTIONAL: POST /api/track
// Receives tracking events from pixel
// ==============================================
app.post('/api/track', (req, res) => {
  const { eventName, eventData, accountID, timestamp } = req.body;

  console.log('📊 Tracking event received:');
  console.log('Event:', eventName);
  console.log('Account ID:', accountID);
  console.log('Timestamp:', timestamp);

  // TODO: Store in your database
  // await db.events.create({
  //   eventName,
  //   eventData,
  //   accountID,
  //   timestamp
  // });

  res.status(200).json({ success: true });
});

// ==============================================
// Health check
// ==============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==============================================
// Start server
// ==============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Auth URL: ${SHOPIFY_HOST}/api/auth`);
  console.log(`📧 Callback URL: ${SHOPIFY_HOST}/api/auth/callback`);
});
