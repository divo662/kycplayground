# KYCPlayground Webhook Integration Guide

This guide explains how to integrate KYCPlayground's identity verification service into your SaaS application using webhooks.

## Overview

KYCPlayground provides a seamless identity verification flow that integrates with your application through:
1. **API endpoints** to initiate verifications
2. **Webhooks** to receive verification results
3. **Redirect URLs** for user experience flow

## Quick Start

### 1. Get Your API Key

First, create an account and generate an API key from the KYCPlayground dashboard.

### 2. Initiate a Verification

Send a POST request to start the verification process:

```bash
curl -X POST https://your-domain.com/api/verifications/start \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationType": "id_card",
    "redirectUrl": "https://your-app.com/verification-complete",
    "webhookUrl": "https://your-app.com/webhooks/kyc-result",
    "customData": {
      "userId": "user_123",
      "orderId": "order_456"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_abc123",
  "verificationId": "ver_xyz789",
  "verificationUrl": "https://your-domain.com/verify/sess_abc123",
  "expiresAt": "2024-01-15T10:00:00.000Z",
  "message": "Verification session created successfully"
}
```

### 3. Redirect User to Verification

Redirect your user to the `verificationUrl` returned from the API. The user will:
- Upload their identity documents
- Complete the verification process
- Be automatically redirected back to your `redirectUrl`

### 4. Receive Results via Webhook

When verification completes, KYCPlayground will send a webhook to your `webhookUrl`:

```json
{
  "verificationId": "ver_xyz789",
  "sessionId": "sess_abc123",
  "status": "completed",
  "result": {
    "extractedInfo": {
      "documentType": "ID Card",
      "name": "John Doe",
      "idNumber": "123456789",
      "dateOfBirth": "1990-01-01",
      "expiryDate": "2025-12-31"
    },
    "confidence": 0.95,
    "completedAt": "2024-01-15T09:45:00.000Z"
  }
}
```

## API Reference

### Start Verification Endpoint

**URL:** `POST /api/verifications/start`

**Headers:**
- `X-API-Key`: Your API key (required)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "verificationType": "id_card|passport|drivers_license",
  "redirectUrl": "https://your-app.com/verification-complete",
  "webhookUrl": "https://your-app.com/webhooks/kyc-result",
  "customData": {
    "userId": "string",
    "orderId": "string",
    "metadata": "any additional data"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "string",
  "verificationId": "string",
  "verificationUrl": "string",
  "expiresAt": "ISO 8601 datetime",
  "message": "string"
}
```

## Webhook Implementation

### Webhook Endpoint Requirements

Your webhook endpoint should:

1. **Accept POST requests** with JSON payloads
2. **Return 200 OK** to acknowledge receipt
3. **Process the verification result** within 10 seconds
4. **Handle retries gracefully** (webhooks may be retried)

### Webhook Security

KYCPlayground includes security headers:
- `X-KYCPlayground-Signature`: HMAC signature for verification
- `X-KYCPlayground-Event`: Event type identifier

**Verify webhook signature:**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Event Types

- `verification.completed`: Verification successfully completed
- `verification.failed`: Verification failed or was rejected
- `verification.expired`: Verification session expired

## Verification Types

### ID Card Verification
- **Documents:** Government-issued ID cards
- **Extracted Data:** Name, ID number, date of birth, expiry date
- **Use Case:** User registration, account verification

### Passport Verification
- **Documents:** Passport pages
- **Extracted Data:** Name, passport number, nationality, date of birth, expiry date
- **Use Case:** International user verification, travel services

### Driver's License Verification
- **Documents:** Driver's license
- **Extracted Data:** Name, license number, date of birth, expiry date, license class
- **Use Case:** Driving services, age verification

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Invalid or inactive API key"
}
```

**400 Bad Request:**
```json
{
  "error": "redirectUrl is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to start verification",
  "details": "Error description"
}
```

### Webhook Failure Handling

If your webhook endpoint fails:
1. KYCPlayground will retry up to 3 times
2. Retries occur at 5-minute intervals
3. Failed webhooks are logged for debugging
4. Verification results are still available via API

## Best Practices

### 1. User Experience
- Store the `sessionId` in your database
- Show verification status to users
- Handle verification completion gracefully

### 2. Security
- Always verify webhook signatures
- Use HTTPS for all endpoints
- Store API keys securely
- Implement rate limiting

### 3. Error Handling
- Implement proper error logging
- Have fallback mechanisms for webhook failures
- Monitor webhook delivery success rates

### 4. Testing
- Use the webhook test endpoint to verify your implementation
- Test with various verification types
- Verify error handling scenarios

## Testing

### Test Webhook Endpoint

Test your webhook implementation:

```bash
curl -X POST https://your-domain.com/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://your-app.com/webhooks/kyc-result"
  }'
```

### Sandbox Environment

Use the sandbox environment for testing:
- No real documents are processed
- Mock data is returned
- Perfect for development and testing

## Support

For integration support:
- Check the API documentation
- Review webhook logs in the dashboard
- Contact support with specific error details

## Rate Limits

- **API Calls:** 100 requests per minute per API key
- **Webhook Retries:** 3 attempts per failed webhook
- **Session Expiry:** 24 hours from creation

## Pricing

- **Free Tier:** 100 verifications per month
- **Pro Tier:** $0.10 per verification
- **Enterprise:** Custom pricing for high-volume usage

---

**Need Help?** Check our [API documentation](https://your-domain.com/docs) or contact support. 