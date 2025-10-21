exports.handler = async (event, context) => {
  const { shop } = event.queryStringParameters || {};

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome - ClaudeSDK App</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
          padding: 48px;
          text-align: center;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
        }
        h1 {
          color: #1f2937;
          font-size: 32px;
          margin-bottom: 16px;
        }
        .shop-name {
          color: #6b7280;
          font-size: 18px;
          margin-bottom: 32px;
        }
        .features {
          text-align: left;
          margin: 32px 0;
          padding: 24px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .feature {
          display: flex;
          align-items: start;
          margin-bottom: 16px;
        }
        .feature:last-child {
          margin-bottom: 0;
        }
        .feature-icon {
          color: #10b981;
          margin-right: 12px;
          font-size: 20px;
        }
        .feature-text {
          color: #4b5563;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 24px;
          transition: background 0.3s;
        }
        .button:hover {
          background: #5568d3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>Welcome to ClaudeSDK!</h1>
        <p class="shop-name">Successfully installed on ${shop || 'your store'}</p>
        
        <div class="features">
          <div class="feature">
            <span class="feature-icon">📊</span>
            <div class="feature-text">
              <strong>Track Customer Events</strong><br>
              Monitor page views, product views, and purchases in real-time
            </div>
          </div>
          <div class="feature">
            <span class="feature-icon">🎯</span>
            <div class="feature-text">
              <strong>Smart Analytics</strong><br>
              Get insights into customer behavior and shopping patterns
            </div>
          </div>
          <div class="feature">
            <span class="feature-icon">🔒</span>
            <div class="feature-text">
              <strong>Secure & Private</strong><br>
              Your data is encrypted and stored securely
            </div>
          </div>
        </div>

        <p style="color: #6b7280; margin-top: 24px;">
          Your pixel is now active and tracking events on your store!
        </p>

        <a href="https://${shop}/admin/settings/customer_events" class="button">
          View Customer Events
        </a>
      </div>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    },
    body: html
  };
};
