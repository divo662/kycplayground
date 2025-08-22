# Testing Webhooks Locally with ngrok

This guide shows you how to test KYCPlayground webhooks locally using ngrok, a tool that creates secure tunnels to your local development environment.

## What is ngrok?

ngrok is a free tool that creates secure tunnels from the public internet to your local machine. This allows you to:

- Test webhooks locally without deploying your application
- Share your local development work with others
- Debug webhook integrations in real-time
- Avoid CORS issues during development

## Prerequisites

- A local webhook endpoint running on your machine
- ngrok installed (see installation instructions below)
- Basic knowledge of your local development environment

## Installation

### Option 1: Download from ngrok.com (Recommended)

1. Go to [ngrok.com](https://ngrok.com)
2. Sign up for a free account
3. Download ngrok for your operating system
4. Extract the executable to a directory in your PATH

### Option 2: Package Managers

**macOS (using Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Windows (using Chocolatey):**
```bash
choco install ngrok
```

**Linux (using snap):**
```bash
sudo snap install ngrok
```

### Option 3: Manual Installation

**macOS/Linux:**
```bash
# Download ngrok
curl -O https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip

# Unzip and move to PATH
unzip ngrok-stable-darwin-amd64.zip
sudo mv ngrok /usr/local/bin/

# Make executable
chmod +x /usr/local/bin/ngrok
```

**Windows:**
1. Download the Windows zip file from ngrok.com
2. Extract to a folder (e.g., `C:\ngrok`)
3. Add the folder to your system PATH
4. Or run from the folder: `C:\ngrok\ngrok.exe http 8080`

## Authentication (Required for Free Plan)

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your authtoken from the dashboard
3. Run the authentication command:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## Setting Up Your Local Webhook Server

### Option 1: Simple HTTP Server (Python)

Create a file called `webhook-server.py`:

```python
from flask import Flask, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/webhooks/kyc', methods=['POST'])
def kyc_webhook():
    """Handle KYCPlayground webhooks"""
    
    # Log the incoming webhook
    print(f"[{datetime.now()}] Webhook received:")
    print(f"Headers: {dict(request.headers)}")
    print(f"Body: {request.get_json()}")
    
    # Verify HMAC signature if you have a secret
    # (See security section below)
    
    # Process the webhook data
    data = request.get_json()
    
    if data.get('event') == 'verification.created':
        print("✅ New verification session created")
        # Handle verification.created event
        # e.g., update your database, send notifications, etc.
        
    elif data.get('event') == 'verification.completed':
        print("✅ Verification completed")
        # Handle verification.completed event
        # e.g., update user status, trigger next steps, etc.
        
    elif data.get('event') == 'verification.failed':
        print("❌ Verification failed")
        # Handle verification.failed event
        # e.g., notify support, retry logic, etc.
    
    # Always return 200 OK to acknowledge receipt
    return jsonify({
        "status": "received",
        "timestamp": datetime.now().isoformat(),
        "event": data.get('event')
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    print("🚀 Starting webhook server on http://localhost:8080")
    print("📡 Webhook endpoint: http://localhost:8080/webhooks/kyc")
    print("💚 Health check: http://localhost:8080/health")
    app.run(host='0.0.0.0', port=8080, debug=True)
```

**Install Flask and run:**
```bash
pip install flask
python webhook-server.py
```

### Option 2: Simple HTTP Server (Node.js)

Create a file called `webhook-server.js`:

```javascript
const express = require('express');
const app = express();
const port = 8080;

// Parse JSON bodies
app.use(express.json());

// Webhook endpoint
app.post('/webhooks/kyc', (req, res) => {
    console.log(`[${new Date().toISOString()}] Webhook received:`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const { event, data } = req.body;
    
    switch (event) {
        case 'verification.created':
            console.log('✅ New verification session created');
            // Handle verification.created event
            break;
            
        case 'verification.completed':
            console.log('✅ Verification completed');
            // Handle verification.completed event
            break;
            
        case 'verification.failed':
            console.log('❌ Verification failed');
            // Handle verification.failed event
            break;
            
        default:
            console.log(`ℹ️ Unknown event: ${event}`);
    }
    
    // Always return 200 OK
    res.json({
        status: 'received',
        timestamp: new Date().toISOString(),
        event: event
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`🚀 Webhook server running on http://localhost:${port}`);
    console.log(`📡 Webhook endpoint: http://localhost:${port}/webhooks/kyc`);
    console.log(`💚 Health check: http://localhost:${port}/health`);
});
```

**Install dependencies and run:**
```bash
npm init -y
npm install express
node webhook-server.js
```

### Option 3: Simple HTTP Server (PHP)

Create a file called `webhook-server.php`:

```php
<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/webhooks/kyc') {
    // Get the request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Log the webhook
    error_log("[" . date('Y-m-d H:i:s') . "] Webhook received: " . $input);
    
    $event = $data['event'] ?? 'unknown';
    
    switch ($event) {
        case 'verification.created':
            error_log("✅ New verification session created");
            break;
            
        case 'verification.completed':
            error_log("✅ Verification completed");
            break;
            
        case 'verification.failed':
            error_log("❌ Verification failed");
            break;
            
        default:
            error_log("ℹ️ Unknown event: $event");
    }
    
    // Return success response
    echo json_encode([
        'status' => 'received',
        'timestamp' => date('c'),
        'event' => $event
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/health') {
    // Health check endpoint
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('c')
    ]);
    
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>
```

**Run with PHP built-in server:**
```bash
php -S localhost:8080 webhook-server.php
```

## Starting ngrok

1. **Start your local webhook server** (one of the options above)
2. **In a new terminal, start ngrok:**

```bash
# Basic tunnel to port 8080
ngrok http 8080

# Or specify a custom subdomain (requires paid plan)
ngrok http 8080 --subdomain=mykycwebhook

# Or specify a custom domain (requires paid plan)
ngrok http 8080 --hostname=webhook.mydomain.com
```

3. **ngrok will display a dashboard with your public URL:**

```
Session Status                online
Account                       your-email@example.com
Version                       3.5.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8080
```

## Testing Your Webhook

### 1. Update Your Environment Variables

```bash
# Use the ngrok URL as your webhook endpoint
export WEBHOOK_URL="https://abc123.ngrok.io/webhooks/kyc"
export BASE_URL="http://localhost:3000"
export API_KEY="your_api_key_here"
```

### 2. Create a Webhook Configuration

```bash
curl -X POST "$BASE_URL/api/webhooks" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Local Test Webhook",
    "url": "'$WEBHOOK_URL'",
    "events": ["verification.created", "verification.completed", "verification.failed"],
    "isActive": true,
    "secret": "test-secret-123",
    "retryCount": 3,
    "metadata": {
      "environment": "local_development",
      "notes": "Testing webhooks locally with ngrok"
    }
  }'
```

### 3. Test Webhook Delivery

```bash
# Get your webhook ID from the create response
WEBHOOK_ID="webhook_123"  # Replace with actual ID

# Test the webhook
curl -X POST "$BASE_URL/api/webhooks/test" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookId": "'$WEBHOOK_ID'",
    "eventType": "verification.created"
  }'
```

### 4. Create a Test Verification

```bash
curl -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "'$WEBHOOK_URL'",
    "returnUrl": "https://example.com/callback",
    "options": {
      "enableFaceDetection": true,
      "enableDocumentValidation": true
    },
    "metadata": {
      "userId": "test_user_123",
      "orderId": "test_order_456"
    }
  }'
```

## Monitoring and Debugging

### 1. ngrok Web Interface

Visit `http://127.0.0.1:4040` to see:
- All HTTP requests and responses
- Request/response headers and bodies
- Timing information
- Error logs

### 2. Local Server Logs

Watch your local webhook server console for:
- Incoming webhook requests
- Request data processing
- Any errors or issues

### 3. Real-time Testing

```bash
# Watch webhook requests in real-time
tail -f /path/to/your/log/file

# Or use ngrok's web interface for live monitoring
```

## Security Considerations

### 1. HMAC Signature Verification

KYCPlayground sends webhooks with HMAC signatures. Verify them:

```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    """Verify webhook HMAC signature"""
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# In your webhook handler
@app.route('/webhooks/kyc', methods=['POST'])
def kyc_webhook():
    payload = request.get_data(as_text=True)
    signature = request.headers.get('X-KYCPlayground-Signature', '')
    
    if not verify_webhook_signature(payload, signature, 'your-webhook-secret'):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process webhook...
```

### 2. Environment Isolation

- Use different webhook secrets for development vs. production
- Never commit secrets to version control
- Use environment variables for configuration

### 3. Rate Limiting

- Implement rate limiting on your webhook endpoint
- Handle duplicate webhook deliveries gracefully
- Log all webhook attempts for debugging

## Troubleshooting

### Common Issues:

1. **ngrok not starting:**
   - Check if port 8080 is already in use
   - Verify your authtoken is configured
   - Try a different port: `ngrok http 8081`

2. **Webhooks not reaching your server:**
   - Check ngrok status: `ngrok status`
   - Verify the forwarding URL is correct
   - Check your local server is running
   - Test with a simple GET request first

3. **CORS issues:**
   - ngrok handles CORS automatically
   - Ensure your local server accepts POST requests
   - Check request headers and content-type

4. **ngrok URL changes on restart:**
   - Free ngrok URLs change each time you restart
   - Update your webhook configuration with the new URL
   - Consider upgrading to a paid plan for static URLs

### Debug Commands:

```bash
# Check ngrok status
ngrok status

# Check local server
curl http://localhost:8080/health

# Test ngrok tunnel
curl https://abc123.ngrok.io/health

# View ngrok logs
ngrok http 8080 --log=stdout
```

## Advanced Usage

### 1. Custom Subdomains (Paid Plan)

```bash
# Use a custom subdomain
ngrok http 8080 --subdomain=mykycwebhook

# This gives you: https://mykycwebhook.ngrok.io
```

### 2. Custom Domains (Paid Plan)

```bash
# Use your own domain
ngrok http 8080 --hostname=webhook.mydomain.com

# This gives you: https://webhook.mydomain.com
```

### 3. Multiple Tunnels

```bash
# Create multiple tunnels
ngrok http 8080 --subdomain=webhook1
ngrok http 8081 --subdomain=webhook2
ngrok http 8082 --subdomain=webhook3
```

### 4. ngrok Configuration File

Create `~/.ngrok2/ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  kyc-webhook:
    addr: 8080
    subdomain: mykycwebhook
    proto: http
  kyc-admin:
    addr: 3000
    subdomain: mykycadmin
    proto: http
```

Then start with:
```bash
ngrok start kyc-webhook kyc-admin
```

## Best Practices

1. **Always verify webhook signatures** in production
2. **Handle webhook failures gracefully** with retry logic
3. **Log all webhook activity** for debugging and auditing
4. **Use environment-specific webhook secrets**
5. **Test webhook handling with various event types**
6. **Monitor webhook delivery success rates**
7. **Have a fallback mechanism** for failed webhooks

## Next Steps

1. **Set up your local webhook server** using one of the examples above
2. **Start ngrok** and get your public URL
3. **Configure webhooks** in KYCPlayground using the ngrok URL
4. **Test webhook delivery** with the test endpoint
5. **Create verification sessions** to trigger real webhooks
6. **Monitor and debug** using ngrok's web interface
7. **Implement proper webhook handling** in your application

## Support

- **ngrok Documentation**: [docs.ngrok.com](https://docs.ngrok.com)
- **ngrok Community**: [community.ngrok.com](https://community.ngrok.com)
- **KYCPlayground Support**: support@kycplayground.com
- **KYCPlayground Discord**: [discord.gg/kycplayground](https://discord.gg/kycplayground)

Happy webhook testing! 🚀
