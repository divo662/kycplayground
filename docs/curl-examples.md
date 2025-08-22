# KYCPlayground API - cURL Examples

This guide provides ready-to-use cURL commands for testing all KYCPlayground API endpoints. Replace the placeholder values with your actual data.

## Prerequisites

- Your KYCPlayground API key
- A webhook endpoint URL (for testing webhooks)
- A return URL for verification callbacks

## Environment Variables

Set these variables in your terminal for easier testing:

```bash
export API_KEY="your_api_key_here"
export BASE_URL="http://localhost:3000"
export WEBHOOK_URL="https://your-app.com/webhooks/kyc"
export RETURN_URL="https://your-app.com/kyc/callback"
```

## Authentication

All API requests require the `X-API-Key` header:

```bash
curl -H "X-API-Key: $API_KEY" \
     -H "Content-Type: application/json" \
     "$BASE_URL/api/endpoint"
```

## Verifications

### 1. Create Verification Session

**Basic verification:**
```bash
curl -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "'$WEBHOOK_URL'",
    "returnUrl": "'$RETURN_URL'",
    "options": {
      "enableFaceDetection": true,
      "enableDocumentValidation": true
    },
    "metadata": {
      "userId": "user_123",
      "orderId": "order_456"
    }
  }'
```

**Advanced verification with custom options:**
```bash
curl -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "'$WEBHOOK_URL'",
    "returnUrl": "'$RETURN_URL'",
    "options": {
      "enableFaceDetection": true,
      "enableDocumentValidation": true,
      "requireSelfie": true,
      "documentTypes": ["passport", "drivers_license"],
      "countryCode": "US",
      "language": "en"
    },
    "metadata": {
      "userId": "user_123",
      "orderId": "order_456",
      "customerType": "premium",
      "tags": ["new_user", "high_value"]
    }
  }'
```

### 2. Get Verification Session

```bash
# Replace session_123 with actual session ID
curl -X GET "$BASE_URL/api/verifications/session_123" \
  -H "Content-Type: application/json"
```

### 3. Update Verification Session

```bash
# Replace session_123 with actual session ID
curl -X PUT "$BASE_URL/api/verifications/session_123/update" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "results": {
      "status": "verified",
      "score": 95.5,
      "documentType": "passport",
      "country": "United States",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "faceMatchScore": 98.2,
      "verificationTime": 45.2,
      "completedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
    }
  }'
```

## API Keys

### 1. List API Keys

```bash
curl -X GET "$BASE_URL/api/api-keys" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

### 2. Create API Key

```bash
curl -X POST "$BASE_URL/api/api-keys" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "permissions": ["verifications:create", "webhooks:manage"],
    "expiresAt": "2026-01-21T12:00:00.000Z",
    "metadata": {
      "environment": "production",
      "notes": "Main API key for production use"
    }
  }'
```

### 3. Get API Key Details

```bash
# Replace key_123 with actual key ID
curl -X GET "$BASE_URL/api/api-keys/key_123" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

### 4. Update API Key

```bash
# Replace key_123 with actual key ID
curl -X PUT "$BASE_URL/api/api-keys/key_123" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated API Key Name",
    "permissions": ["verifications:create", "verifications:read", "webhooks:manage"],
    "isActive": true
  }'
```

### 5. Rotate API Key

```bash
# Replace key_123 with actual key ID
curl -X POST "$BASE_URL/api/api-keys/key_123/rotate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

### 6. Revoke API Key

```bash
# Replace key_123 with actual key ID
curl -X POST "$BASE_URL/api/api-keys/key_123/revoke" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

### 7. Delete API Key

```bash
# Replace key_123 with actual key ID
curl -X DELETE "$BASE_URL/api/api-keys/key_123" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

## Webhooks

### 1. List Webhook Configurations

```bash
curl -X GET "$BASE_URL/api/webhooks" \
  -H "Content-Type: application/json"
```

### 2. Create Webhook Configuration

```bash
curl -X POST "$BASE_URL/api/webhooks" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "KYC Verification Webhook",
    "url": "'$WEBHOOK_URL'",
    "events": ["verification.created", "verification.completed", "verification.failed"],
    "isActive": true,
    "secret": "your-webhook-secret",
    "retryCount": 3,
    "metadata": {
      "environment": "production",
      "notes": "Main webhook for KYC verifications"
    }
  }'
```

### 3. Get Webhook Configuration

```bash
# Replace webhook_123 with actual webhook ID
curl -X GET "$BASE_URL/api/webhooks/webhook_123" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

### 4. Update Webhook Configuration

```bash
# Replace webhook_123 with actual webhook ID
curl -X PUT "$BASE_URL/api/webhooks/webhook_123" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated KYC Webhook",
    "url": "'$WEBHOOK_URL'",
    "events": ["verification.created", "verification.completed", "verification.failed", "verification.expired"],
    "isActive": true,
    "retryCount": 5
  }'
```

### 5. Delete Webhook Configuration

```bash
# Replace webhook_123 with actual webhook ID
curl -X DELETE "$BASE_URL/api/webhooks/webhook_123" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json"
```

### 6. Test Webhook Delivery

```bash
# Replace webhook_123 with actual webhook ID
curl -X POST "$BASE_URL/api/webhooks/test" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookId": "webhook_123",
    "eventType": "verification.created",
    "customPayload": {
      "test": true,
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
    }
  }'
```

## Analytics

### 1. Get Verification Analytics

**Default (14 days):**
```bash
curl -X GET "$BASE_URL/api/analytics" \
  -H "Content-Type: application/json"
```

**Custom period:**
```bash
curl -X GET "$BASE_URL/api/analytics?days=30" \
  -H "Content-Type: application/json"
```

**Date range:**
```bash
curl -X GET "$BASE_URL/api/analytics?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Content-Type: application/json"
```

## Files

### 1. Generate Signed File URL

```bash
# Replace file_123 with actual file ID
curl -X POST "$BASE_URL/api/files/sign" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "file_123",
    "ttlSeconds": 3600
  }'
```

## Testing Webhooks Locally

### 1. Start a local webhook server

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

### 2. Test with ngrok (see ngrok guide below)

```bash
# Start ngrok
ngrok http 8080

# Use the ngrok URL in your webhook configuration
export WEBHOOK_URL="https://abc123.ngrok.io/webhooks/kyc"
```

## Error Handling Examples

### Check for specific error codes:

```bash
# Test with invalid API key
curl -X GET "$BASE_URL/api/api-keys" \
  -H "X-API-Key: invalid_key" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

### Test rate limiting:

```bash
# Make multiple requests quickly to test rate limiting
for i in {1..10}; do
  echo "Request $i:"
  curl -X GET "$BASE_URL/api/analytics" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -w "HTTP Status: %{http_code}\n" \
    -s
  echo "---"
  sleep 0.1
done
```

## Complete Integration Example

Here's a complete flow for testing the entire verification process:

```bash
#!/bin/bash

# Set your variables
export API_KEY="your_api_key_here"
export BASE_URL="http://localhost:3000"
export WEBHOOK_URL="https://your-app.com/webhooks/kyc"
export RETURN_URL="https://your-app.com/kyc/callback"

echo "🚀 Starting KYCPlayground integration test..."

# 1. Create verification session
echo "📝 Creating verification session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "'$WEBHOOK_URL'",
    "returnUrl": "'$RETURN_URL'",
    "options": {
      "enableFaceDetection": true,
      "enableDocumentValidation": true
    },
    "metadata": {
      "userId": "test_user_123",
      "orderId": "test_order_456"
    }
  }')

echo "Session response: $SESSION_RESPONSE"

# Extract session ID (requires jq)
if command -v jq &> /dev/null; then
  SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.sessionId')
  echo "✅ Session created with ID: $SESSION_ID"
  
  # 2. Get session details
  echo "📋 Getting session details..."
  curl -s -X GET "$BASE_URL/api/verifications/$SESSION_ID" \
    -H "Content-Type: application/json" | jq '.'
  
  # 3. Update session with results
  echo "🔄 Updating session with results..."
  curl -s -X PUT "$BASE_URL/api/verifications/$SESSION_ID/update" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "results": {
        "status": "verified",
        "score": 95.5,
        "documentType": "passport",
        "country": "United States",
        "firstName": "Test",
        "lastName": "User",
        "dateOfBirth": "1990-01-01",
        "faceMatchScore": 98.2,
        "verificationTime": 45.2,
        "completedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }' | jq '.'
  
  echo "✅ Integration test completed successfully!"
else
  echo "⚠️  jq not installed. Install it to parse JSON responses automatically."
  echo "   Ubuntu/Debian: sudo apt install jq"
  echo "   macOS: brew install jq"
  echo "   Windows: choco install jq"
fi
```

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Check your API key and ensure it has the required permissions
2. **400 Bad Request**: Validate your request body against the API schema
3. **429 Too Many Requests**: You've hit the rate limit - wait before making more requests
4. **CORS issues**: Ensure your webhook endpoint accepts POST requests from KYCPlayground

### Debug Mode:

Enable verbose output to see full request/response details:

```bash
curl -v -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "'$WEBHOOK_URL'", "returnUrl": "'$RETURN_URL'"}'
```

### Testing with Different Data:

```bash
# Test with minimal data
curl -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "'$WEBHOOK_URL'", "returnUrl": "'$RETURN_URL'"}'

# Test with maximum data
curl -X POST "$BASE_URL/api/verifications/create" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "'$WEBHOOK_URL'",
    "returnUrl": "'$RETURN_URL'",
    "options": {
      "enableFaceDetection": true,
      "enableDocumentValidation": true,
      "requireSelfie": true,
      "documentTypes": ["passport", "drivers_license", "national_id", "residence_permit"],
      "countryCode": "US",
      "language": "en"
    },
    "metadata": {
      "userId": "user_123",
      "orderId": "order_456",
      "customerType": "premium",
      "tags": ["new_user", "high_value", "vip"],
      "customField1": "custom_value_1",
      "customField2": "custom_value_2"
    }
  }'
```

## Next Steps

1. **Import the Postman collection** for a visual testing experience
2. **Set up ngrok** for local webhook testing (see ngrok guide)
3. **Create a webhook endpoint** in your application
4. **Test the complete flow** using the integration example above
5. **Check the OpenAPI spec** for detailed API documentation

Need help? Contact support@kycplayground.com or join our Discord community!
