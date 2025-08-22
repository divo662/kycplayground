# KYCPlayground Documentation

Welcome to the complete KYCPlayground documentation! This repository contains everything you need to integrate identity verification into your application.

## 🚀 Quick Start

1. **Get Your API Key**: Sign up at [KYCPlayground](https://kycplayground.com) and create an API key
2. **Basic Integration**: Use our [Integration Guide](integration-guide.md) to get started in minutes
3. **Test Locally**: Set up webhook testing with [ngrok](ngrok-webhook-guide.md)
4. **Go Live**: Deploy with our production best practices

## 📚 Documentation Index

### Core Documentation
- **[Integration Guide](integration-guide.md)** - Complete integration walkthrough
- **[API Reference](openapi-spec.yaml)** - OpenAPI 3.0 specification
- **[Verification System Overview](verification-system-overview.md)** - System architecture and flow

### Developer Tools
- **[Postman Collection](postman-collection.json)** - Import for easy API testing
- **[cURL Examples](curl-examples.md)** - Command-line testing examples
- **[ngrok Webhook Guide](ngrok-webhook-guide.md)** - Local webhook testing setup

### Dashboard Features
- **Health & Diagnostics** - Monitor system health and test connectivity
- **Webhook Management** - Configure and test webhook endpoints
- **API Key Management** - Create, rotate, and revoke API keys
- **Verification History** - View and manage verification sessions

## 🔧 Getting Started

### 1. Basic Integration

```javascript
// Create a verification session
const response = await fetch('https://api.kycplayground.com/api/verifications/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
  },
  body: JSON.stringify({
    webhookUrl: 'https://your-app.com/webhooks/kyc',
    returnUrl: 'https://your-app.com/kyc/callback',
    options: {
      enableFaceDetection: true,
      enableDocumentValidation: true
    },
    metadata: {
      userId: 'user_123'
    }
  })
});

const { sessionId, redirectUrl } = await response.json();
window.location.href = redirectUrl;
```

### 2. Handle Webhooks

```javascript
// Express.js webhook endpoint
app.post('/webhooks/kyc', (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'verification.completed':
      console.log('Verification completed:', data.sessionId);
      // Update user status, trigger next steps
      break;
    case 'verification.failed':
      console.log('Verification failed:', data.sessionId);
      // Handle failure, notify support
      break;
  }
  
  res.status(200).json({ status: 'received' });
});
```

### 3. Test Locally

```bash
# Start ngrok for webhook testing
ngrok http 3000

# Use the ngrok URL in your webhook configuration
export WEBHOOK_URL="https://abc123.ngrok.io/webhooks/kyc"
```

## 🛠️ Development Tools

### Postman Collection
Import our [Postman collection](postman-collection.json) for easy API testing:
1. Open Postman
2. Click "Import"
3. Select the `postman-collection.json` file
4. Update the collection variables with your API key and URLs

### cURL Examples
Use our [cURL examples](curl-examples.md) for command-line testing:
```bash
# Test API connectivity
curl -H "X-API-Key: your_api_key" \
     https://api.kycplayground.com/api/analytics

# Create verification session
curl -X POST https://api.kycplayground.com/api/verifications/create \
     -H "X-API-Key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{"webhookUrl":"https://your-app.com/webhooks/kyc","returnUrl":"https://your-app.com/callback"}'
```

### Health Dashboard
Access the health dashboard at `/dashboard/health` to:
- Monitor system health
- Test webhook endpoints
- Check environment configuration
- Diagnose connectivity issues

## 🔒 Security Features

- **API Key Authentication** - Secure API access with scoped permissions
- **Webhook Signatures** - HMAC verification for webhook authenticity
- **Rate Limiting** - Per-key rate limiting to prevent abuse
- **PII Encryption** - Sensitive data encrypted at rest
- **Signed URLs** - Time-limited access to stored files

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/verifications/create` | POST | Create verification session |
| `/api/verifications/{id}` | GET | Get session details |
| `/api/verifications/{id}/update` | PUT | Update session results |
| `/api/webhooks` | GET/POST | Manage webhook configurations |
| `/api/api-keys` | GET/POST | Manage API keys |
| `/api/analytics` | GET | Get verification analytics |
| `/api/files/sign` | POST | Generate signed file URLs |

## 🌐 Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `verification.created` | New session created | Session details |
| `verification.started` | User started verification | Session status |
| `verification.completed` | Verification successful | Results + metadata |
| `verification.failed` | Verification failed | Error details |
| `verification.expired` | Session expired | Session info |

## 🧪 Testing

### Local Development
1. **Set up ngrok** for webhook testing
2. **Configure webhooks** with ngrok URLs
3. **Test webhook delivery** using the dashboard
4. **Monitor logs** for debugging

### Production Testing
1. **Verify webhook signatures** are working
2. **Test error handling** with invalid requests
3. **Monitor rate limiting** and API usage
4. **Check webhook delivery** success rates

## 🚀 Production Deployment

### Environment Variables
```bash
# Required
KYC_API_KEY=kyc_your_production_key
KYC_BASE_URL=https://api.kycplayground.com
WEBHOOK_SECRET=your_webhook_secret

# Your app URLs
APP_URL=https://your-app.com
WEBHOOK_URL=https://your-app.com/webhooks/kyc
CALLBACK_URL=https://your-app.com/kyc/callback
```

### Best Practices
- **Always verify webhook signatures**
- **Use HTTPS for all endpoints**
- **Implement rate limiting**
- **Monitor webhook delivery**
- **Log all verification activities**
- **Have fallback mechanisms**

## 📞 Support & Community

### Getting Help
- **Documentation**: [docs.kycplayground.com](https://docs.kycplayground.com)
- **API Reference**: [api.kycplayground.com](https://api.kycplayground.com)
- **Support Email**: support@kycplayground.com
- **Discord Community**: [discord.gg/kycplayground](https://discord.gg/kycplayground)

### Resources
- **Integration Examples** - Complete code samples
- **Troubleshooting Guide** - Common issues and solutions
- **Security Checklist** - Production security requirements
- **Performance Tips** - Optimization recommendations

## 🔄 What's New

### Latest Features
- **Health Dashboard** - System monitoring and diagnostics
- **Webhook Testing** - Built-in webhook endpoint testing
- **API Key Rotation** - Secure key management
- **Signed File URLs** - Secure file access
- **PII Encryption** - Enhanced data security

### Coming Soon
- **SDK Libraries** - Node.js, Python, and JavaScript SDKs
- **Webhook Retry Logic** - Automatic retry with backoff
- **Advanced Analytics** - Detailed verification insights
- **Multi-language Support** - Internationalization features

## 📝 Contributing

We welcome contributions to improve our documentation! Please:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Submit a pull request**

### Documentation Standards
- Use clear, concise language
- Include practical examples
- Follow the established structure
- Test all code examples
- Update related sections

## 📄 License

This documentation is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

---

**Ready to get started?** Begin with our [Integration Guide](integration-guide.md) for a step-by-step walkthrough, or jump straight to the [API Reference](openapi-spec.yaml) for technical details.

**Questions?** Join our [Discord community](https://discord.gg/kycplayground) or email us at support@kycplayground.com.

Happy integrating! 🚀
