# KYCPlayground Integration Guide

This comprehensive guide shows you how to integrate KYCPlayground identity verification into your application. Whether you're building a web app, mobile app, or backend service, this guide covers everything you need to know.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication & Setup](#authentication--setup)
3. [Core Integration](#core-integration)
4. [Webhook Handling](#webhook-handling)
5. [Advanced Features](#advanced-features)
6. [Security Best Practices](#security-best-practices)
7. [Testing & Debugging](#testing--debugging)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Examples & Templates](#examples--templates)

## Quick Start

### 1. Get Your API Key

1. Sign up at [KYCPlayground](https://kycplayground.com)
2. Go to Dashboard → API Keys
3. Create a new API key with `verifications:create` permission
4. Copy your API key (you'll only see it once!)

### 2. Basic Integration

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
      userId: 'user_123',
      orderId: 'order_456'
    }
  })
});

const { sessionId, redirectUrl } = await response.json();

// Redirect user to verification
window.location.href = redirectUrl;
```

### 3. Handle the Callback

```javascript
// In your callback page (/kyc/callback)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId');
const status = urlParams.get('status');

if (status === 'completed') {
  // User completed verification successfully
  console.log('Verification completed for session:', sessionId);
  // Redirect to success page or update UI
} else if (status === 'failed') {
  // Verification failed
  console.log('Verification failed for session:', sessionId);
  // Show error message or retry option
}
```

## Authentication & Setup

### Environment Variables

Create a `.env` file in your project:

```bash
# Required
KYC_API_KEY=kyc_your_api_key_here
KYC_BASE_URL=https://api.kycplayground.com

# Optional (for webhook verification)
WEBHOOK_SECRET=your_webhook_secret_here

# Your app URLs
APP_URL=https://your-app.com
WEBHOOK_URL=https://your-app.com/webhooks/kyc
CALLBACK_URL=https://your-app.com/kyc/callback
```

### API Key Management

```javascript
// Store API key securely
const API_KEY = process.env.KYC_API_KEY;

// For client-side apps, use environment variables or secure storage
const API_KEY = process.env.NEXT_PUBLIC_KYC_API_KEY; // Next.js
const API_KEY = import.meta.env.VITE_KYC_API_KEY; // Vite
```

## Core Integration

### Creating Verification Sessions

#### Basic Verification

```javascript
async function createVerification(userId, orderId) {
  try {
    const response = await fetch(`${KYC_BASE_URL}/api/verifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        webhookUrl: `${APP_URL}/webhooks/kyc`,
        returnUrl: `${APP_URL}/kyc/callback`,
        options: {
          enableFaceDetection: true,
          enableDocumentValidation: true
        },
        metadata: {
          userId,
          orderId,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create verification:', error);
    throw error;
  }
}
```

#### Advanced Verification with Custom Options

```javascript
async function createAdvancedVerification(userId, options = {}) {
  const verificationOptions = {
    enableFaceDetection: true,
    enableDocumentValidation: true,
    requireSelfie: options.requireSelfie || false,
    documentTypes: options.documentTypes || ['passport', 'drivers_license'],
    countryCode: options.countryCode || 'US',
    language: options.language || 'en',
    ...options
  };

  const response = await fetch(`${KYC_BASE_URL}/api/verifications/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      webhookUrl: `${APP_URL}/webhooks/kyc`,
      returnUrl: `${APP_URL}/kyc/callback`,
      options: verificationOptions,
      metadata: {
        userId,
        orderId: options.orderId || `order_${Date.now()}`,
        customerType: options.customerType || 'standard',
        tags: options.tags || [],
        customFields: options.customFields || {}
      }
    })
  });

  return response.json();
}
```

### Checking Verification Status

```javascript
async function getVerificationStatus(sessionId) {
  try {
    const response = await fetch(`${KYC_BASE_URL}/api/verifications/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get verification status:', error);
    throw error;
  }
}

// Usage
const status = await getVerificationStatus('session_123');
console.log('Verification status:', status.status);
console.log('Results:', status.results);
```

## Webhook Handling

### Setting Up Webhook Endpoints

#### Express.js Example

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Webhook endpoint
app.post('/webhooks/kyc', (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-kycplayground-signature'];
    const payload = JSON.stringify(req.body);
    const secret = process.env.WEBHOOK_SECRET;
    
    if (!verifyWebhookSignature(payload, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data, timestamp } = req.body;
    
    // Handle different webhook events
    switch (event) {
      case 'verification.created':
        handleVerificationCreated(data);
        break;
        
      case 'verification.completed':
        handleVerificationCompleted(data);
        break;
        
      case 'verification.failed':
        handleVerificationFailed(data);
        break;
        
      case 'verification.expired':
        handleVerificationExpired(data);
        break;
        
      default:
        console.log('Unknown webhook event:', event);
    }

    // Always return 200 OK
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function handleVerificationCreated(data) {
  console.log('New verification created:', data.sessionId);
  // Update your database, send notifications, etc.
}

function handleVerificationCompleted(data) {
  console.log('Verification completed:', data.sessionId);
  console.log('Results:', data.results);
  
  // Update user status, trigger next steps, etc.
  updateUserVerificationStatus(data.metadata.userId, 'verified');
  sendVerificationSuccessEmail(data.metadata.userId);
}

function handleVerificationFailed(data) {
  console.log('Verification failed:', data.sessionId);
  console.log('Error:', data.error);
  
  // Handle failure, notify support, etc.
  notifySupport(data);
  updateUserVerificationStatus(data.metadata.userId, 'failed');
}

function handleVerificationExpired(data) {
  console.log('Verification expired:', data.sessionId);
  
  // Clean up expired sessions, notify users, etc.
  cleanupExpiredVerification(data.sessionId);
  sendExpirationNotification(data.metadata.userId);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

#### Next.js API Route Example

```typescript
// pages/api/webhooks/kyc.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-kycplayground-signature'] as string;
    const payload = JSON.stringify(req.body);
    const secret = process.env.WEBHOOK_SECRET;

    if (!verifyWebhookSignature(payload, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data, timestamp } = req.body;

    // Process webhook based on event type
    await processWebhook(event, data);

    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function processWebhook(event: string, data: any) {
  switch (event) {
    case 'verification.created':
      await handleVerificationCreated(data);
      break;
    case 'verification.completed':
      await handleVerificationCompleted(data);
      break;
    case 'verification.failed':
      await handleVerificationFailed(data);
      break;
    case 'verification.expired':
      await handleVerificationExpired(data);
      break;
    default:
      console.log('Unknown webhook event:', event);
  }
}

async function handleVerificationCreated(data: any) {
  // Implementation for verification.created
  console.log('Verification created:', data.sessionId);
}

async function handleVerificationCompleted(data: any) {
  // Implementation for verification.completed
  console.log('Verification completed:', data.sessionId);
}

async function handleVerificationFailed(data: any) {
  // Implementation for verification.failed
  console.log('Verification failed:', data.sessionId);
}

async function handleVerificationExpired(data: any) {
  // Implementation for verification.expired
  console.log('Verification expired:', data.sessionId);
}
```

### Webhook Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `verification.created` | New verification session created | `{ sessionId, status, metadata }` |
| `verification.started` | User started verification process | `{ sessionId, status, timestamp }` |
| `verification.completed` | Verification completed successfully | `{ sessionId, status, results, metadata }` |
| `verification.failed` | Verification failed | `{ sessionId, status, error, metadata }` |
| `verification.expired` | Verification session expired | `{ sessionId, status, metadata }` |

### Webhook Security

```javascript
// Always verify webhook signatures
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Use environment variables for secrets
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Implement rate limiting
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many webhook requests'
});

app.use('/webhooks/kyc', webhookLimiter);
```

## Advanced Features

### Custom Verification Options

```javascript
const advancedOptions = {
  enableFaceDetection: true,
  enableDocumentValidation: true,
  requireSelfie: true,
  documentTypes: ['passport', 'drivers_license', 'national_id'],
  countryCode: 'US',
  language: 'en',
  customValidation: {
    minAge: 18,
    maxAge: 100,
    allowedCountries: ['US', 'CA', 'UK'],
    requiredFields: ['firstName', 'lastName', 'dateOfBirth']
  }
};

const verification = await createVerification(userId, {
  options: advancedOptions,
  metadata: {
    customerType: 'premium',
    riskLevel: 'low',
    tags: ['new_user', 'high_value']
  }
});
```

### Batch Verification

```javascript
async function createBatchVerifications(users) {
  const verifications = [];
  
  for (const user of users) {
    try {
      const verification = await createVerification(user.id, {
        orderId: user.orderId,
        metadata: {
          batchId: `batch_${Date.now()}`,
          userId: user.id
        }
      });
      
      verifications.push(verification);
    } catch (error) {
      console.error(`Failed to create verification for user ${user.id}:`, error);
    }
  }
  
  return verifications;
}

// Usage
const users = [
  { id: 'user_1', orderId: 'order_1' },
  { id: 'user_2', orderId: 'order_2' },
  { id: 'user_3', orderId: 'order_3' }
];

const batchVerifications = await createBatchVerifications(users);
console.log(`Created ${batchVerifications.length} verifications`);
```

### Verification Results Processing

```javascript
function processVerificationResults(results) {
  const {
    status,
    score,
    documentType,
    country,
    firstName,
    lastName,
    dateOfBirth,
    faceMatchScore,
    verificationTime
  } = results;

  // Determine verification confidence
  let confidence = 'low';
  if (score >= 90) confidence = 'high';
  else if (score >= 70) confidence = 'medium';

  // Check if verification meets requirements
  const meetsRequirements = score >= 70 && faceMatchScore >= 80;

  // Extract key information
  const extractedData = {
    personalInfo: {
      firstName,
      lastName,
      dateOfBirth,
      country
    },
    document: {
      type: documentType,
      verified: true
    },
    verification: {
      status,
      confidence,
      score,
      faceMatchScore,
      processingTime: verificationTime,
      meetsRequirements
    }
  };

  return extractedData;
}

// Usage in webhook handler
function handleVerificationCompleted(data) {
  const results = processVerificationResults(data.results);
  
  if (results.verification.meetsRequirements) {
    // Approve user
    approveUser(data.metadata.userId, results);
  } else {
    // Flag for manual review
    flagForReview(data.metadata.userId, results);
  }
}
```

## Security Best Practices

### API Key Security

```javascript
// Never expose API keys in client-side code
// ❌ Bad - Client-side
const API_KEY = 'kyc_abc123...'; // Exposed in browser

// ✅ Good - Server-side only
const API_KEY = process.env.KYC_API_KEY;

// ✅ Good - Client-side with proper security
const API_KEY = process.env.NEXT_PUBLIC_KYC_API_KEY; // Only if necessary
```

### Webhook Security

```javascript
// Always verify webhook signatures
app.post('/webhooks/kyc', (req, res) => {
  const signature = req.headers['x-kycplayground-signature'];
  
  if (!verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Process webhook...
});

// Use HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Webhook rate limiting
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many webhook requests',
});

app.use('/webhooks/kyc', webhookLimiter);
```

### Input Validation

```javascript
const Joi = require('joi');

const verificationSchema = Joi.object({
  webhookUrl: Joi.string().uri().required(),
  returnUrl: Joi.string().uri().required(),
  options: Joi.object({
    enableFaceDetection: Joi.boolean().default(true),
    enableDocumentValidation: Joi.boolean().default(true),
    requireSelfie: Joi.boolean().default(false),
    documentTypes: Joi.array().items(Joi.string()).default(['passport', 'drivers_license']),
    countryCode: Joi.string().length(2).default('US'),
    language: Joi.string().length(2).default('en')
  }),
  metadata: Joi.object({
    userId: Joi.string().required(),
    orderId: Joi.string().optional(),
    customerType: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }).required()
});

app.post('/api/verifications/create', async (req, res) => {
  try {
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Process validated data...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Testing & Debugging

### Local Development with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL for webhooks
export WEBHOOK_URL="https://abc123.ngrok.io/webhooks/kyc"
```

### Test Webhook Delivery

```javascript
// Test webhook endpoint
app.post('/api/test-webhook', async (req, res) => {
  try {
    const { webhookId, eventType } = req.body;
    
    const response = await fetch(`${KYC_BASE_URL}/api/webhooks/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        webhookId,
        eventType: eventType || 'verification.created'
      })
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Debug Mode

```javascript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Usage
debugLog('Creating verification', { userId, options });
debugLog('Webhook received', { event, data });
```

## Production Deployment

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
KYC_API_KEY=kyc_production_key_here
KYC_BASE_URL=https://api.kycplayground.com
WEBHOOK_SECRET=production_webhook_secret_here
APP_URL=https://your-app.com
WEBHOOK_URL=https://your-app.com/webhooks/kyc
CALLBACK_URL=https://your-app.com/kyc/callback
```

### Monitoring & Logging

```javascript
// Add comprehensive logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Log all verification activities
function logVerificationActivity(action, data) {
  logger.info('Verification activity', {
    action,
    sessionId: data.sessionId,
    userId: data.metadata?.userId,
    timestamp: new Date().toISOString(),
    data
  });
}

// Usage
logVerificationActivity('created', verificationData);
logVerificationActivity('completed', webhookData);
```

### Error Handling

```javascript
// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Specific error handling for verification endpoints
app.post('/api/verifications/create', async (req, res, next) => {
  try {
    // Verification logic...
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    if (error.name === 'AuthenticationError') {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    next(error);
  }
});
```

## Troubleshooting

### Common Issues

#### 1. API Key Errors

```javascript
// Check API key format
const API_KEY_REGEX = /^kyc_[a-zA-Z0-9]{32,}$/;
if (!API_KEY_REGEX.test(process.env.KYC_API_KEY)) {
  throw new Error('Invalid API key format');
}

// Check API key permissions
const response = await fetch(`${KYC_BASE_URL}/api/api-keys`, {
  headers: { 'X-API-Key': API_KEY }
});

if (response.status === 401) {
  console.error('API key is invalid or expired');
}
```

#### 2. Webhook Delivery Issues

```javascript
// Check webhook endpoint accessibility
async function testWebhookEndpoint(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook endpoint test failed:', error);
    return false;
  }
}

// Verify webhook configuration
const webhooks = await fetch(`${KYC_BASE_URL}/api/webhooks`, {
  headers: { 'X-API-Key': API_KEY }
}).then(r => r.json());

console.log('Configured webhooks:', webhooks);
```

#### 3. CORS Issues

```javascript
// Configure CORS properly
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-app.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: true
};

app.use(cors(corsOptions));
```

### Debug Checklist

- [ ] API key is valid and has correct permissions
- [ ] Webhook endpoint is publicly accessible
- [ ] Webhook signature verification is working
- [ ] Environment variables are set correctly
- [ ] Network connectivity to KYCPlayground API
- [ ] Rate limits are not exceeded
- [ ] Error logs are being captured
- [ ] Webhook events are being processed

## Examples & Templates

### Complete React Component

```jsx
import React, { useState } from 'react';

const KYCVerification = ({ userId, onComplete, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kyc/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to start verification');
      }

      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (error) {
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kyc-verification">
      <h2>Identity Verification Required</h2>
      <p>Please complete identity verification to continue.</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <button
        onClick={startVerification}
        disabled={isLoading}
        className="verification-button"
      >
        {isLoading ? 'Starting...' : 'Start Verification'}
      </button>
    </div>
  );
};

export default KYCVerification;
```

### Complete Node.js Server

```javascript
const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-app.com']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', apiLimiter);

// Routes
app.post('/api/kyc/start', async (req, res) => {
  try {
    const { userId, options = {} } = req.body;
    
    const response = await fetch(`${process.env.KYC_BASE_URL}/api/verifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.KYC_API_KEY
      },
      body: JSON.stringify({
        webhookUrl: `${process.env.APP_URL}/webhooks/kyc`,
        returnUrl: `${process.env.APP_URL}/kyc/callback`,
        options: {
          enableFaceDetection: true,
          enableDocumentValidation: true,
          ...options
        },
        metadata: { userId }
      })
    });

    if (!response.ok) {
      throw new Error(`KYC API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Verification start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
app.post('/webhooks/kyc', (req, res) => {
  try {
    const signature = req.headers['x-kycplayground-signature'];
    const payload = JSON.stringify(req.body);
    
    if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    console.log(`Webhook received: ${event}`, data);
    
    // Process webhook based on event type
    switch (event) {
      case 'verification.completed':
        handleVerificationCompleted(data);
        break;
      case 'verification.failed':
        handleVerificationFailed(data);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function handleVerificationCompleted(data) {
  console.log('Verification completed:', data.sessionId);
  // Update user status, send notifications, etc.
}

function handleVerificationFailed(data) {
  console.log('Verification failed:', data.sessionId);
  // Handle failure, notify support, etc.
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`KYC server running on port ${PORT}`);
});
```

### Environment Configuration Files

#### `.env.example`
```bash
# KYCPlayground Configuration
KYC_API_KEY=kyc_your_api_key_here
KYC_BASE_URL=https://api.kycplayground.com
WEBHOOK_SECRET=your_webhook_secret_here

# Application URLs
APP_URL=https://your-app.com
WEBHOOK_URL=https://your-app.com/webhooks/kyc
CALLBACK_URL=https://your-app.com/kyc/callback

# Security
ALLOWED_ORIGINS=https://your-app.com,https://admin.your-app.com
NODE_ENV=production

# Database (if applicable)
DATABASE_URL=your_database_url_here
```

#### `docker-compose.yml`
```yaml
version: '3.8'
services:
  kyc-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - KYC_API_KEY=${KYC_API_KEY}
      - KYC_BASE_URL=${KYC_BASE_URL}
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
      - APP_URL=${APP_URL}
    env_file:
      - .env
    restart: unless-stopped
```

## Support & Resources

### Getting Help

- **Documentation**: [docs.kycplayground.com](https://docs.kycplayground.com)
- **API Reference**: [api.kycplayground.com](https://api.kycplayground.com)
- **Support Email**: support@kycplayground.com
- **Discord Community**: [discord.gg/kycplayground](https://discord.gg/kycplayground)

### Additional Resources

- **Postman Collection**: Import our collection for easy API testing
- **cURL Examples**: Ready-to-use command line examples
- **ngrok Guide**: Local webhook testing setup
- **Health Dashboard**: Monitor your system health
- **Integration Templates**: Complete code examples for popular frameworks

### Best Practices Summary

1. **Security First**: Always verify webhook signatures and use HTTPS
2. **Error Handling**: Implement comprehensive error handling and logging
3. **Rate Limiting**: Protect your endpoints from abuse
4. **Testing**: Test thoroughly in development before production
5. **Monitoring**: Monitor webhook delivery and API usage
6. **Documentation**: Keep your integration documentation up to date
7. **Backup Plans**: Have fallback mechanisms for failed verifications

---

**Ready to integrate?** Start with the [Quick Start](#quick-start) section and build your way up to a production-ready implementation. If you run into any issues, our support team is here to help!
