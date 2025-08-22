'use client'

import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Key, 
  Code, 
  Copy, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap,
  Shield,
  Globe,
  Terminal
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function ApiKeysDocsPage() {
  const { user } = useAuthStore()
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript')

  const codeExamples = {
    javascript: {
      setup: `// Install the KYCPlayground SDK
npm install kycplayground

// Initialize the client
import { KYCPlayground } from 'kycplayground';

const client = new KYCPlayground({
  apiKey: 'kyc_sandbox_your_api_key_here',
  environment: 'sandbox'
});`,
      verification: `// Create a verification
const verification = await client.verifications.create({
  documentId: 'document_123',
  options: {
    enableFaceMatch: true,
    enableOCR: true,
    enableFraudCheck: true,
    webhookUrl: 'https://your-app.com/webhooks/kyc'
  }
});

console.log('Verification ID:', verification.id);
console.log('Status:', verification.status);`,
      checkStatus: `// Check verification status
const status = await client.verifications.get('verification_123');
console.log('Status:', status.status);
console.log('Confidence:', status.confidence);
console.log('Processing Time:', status.processingTime);`,
      webhooks: `// Handle webhooks
app.post('/webhooks/kyc', (req, res) => {
  const { type, data, signature } = req.body;
  
  // Verify webhook signature
  if (!verifySignature(signature, req.body)) {
    return res.status(401).send('Invalid signature');
  }
  
  switch (type) {
    case 'verification.completed':
      handleVerificationCompleted(data);
      break;
    case 'verification.failed':
      handleVerificationFailed(data);
      break;
  }
  
  res.status(200).send('OK');
});`
    },
    python: {
      setup: `# Install the KYCPlayground SDK
pip install kycplayground

# Initialize the client
from kycplayground import KYCPlayground

client = KYCPlayground(
    api_key='kyc_sandbox_your_api_key_here',
    environment='sandbox'
)`,
      verification: `# Create a verification
verification = client.verifications.create(
    document_id='document_123',
    options={
        'enable_face_match': True,
        'enable_ocr': True,
        'enable_fraud_check': True,
        'webhook_url': 'https://your-app.com/webhooks/kyc'
    }
)

print(f"Verification ID: {verification.id}")
print(f"Status: {verification.status}")`,
      checkStatus: `# Check verification status
status = client.verifications.get('verification_123')
print(f"Status: {status.status}")
print(f"Confidence: {status.confidence}")
print(f"Processing Time: {status.processing_time}")`,
      webhooks: `# Handle webhooks (Flask example)
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/kyc', methods=['POST'])
def handle_webhook():
    data = request.json
    event_type = data['type']
    event_data = data['data']
    signature = data['signature']
    
    # Verify webhook signature
    if not verify_signature(signature, data):
        return jsonify({'error': 'Invalid signature'}), 401
    
    if event_type == 'verification.completed':
        handle_verification_completed(event_data)
    elif event_type == 'verification.failed':
        handle_verification_failed(event_data)
    
    return jsonify({'status': 'ok'})`
    },
    curl: {
      setup: `# Set your API key as an environment variable
export KYC_API_KEY="kyc_sandbox_your_api_key_here"`,
      verification: `# Create a verification
curl -X POST https://api.kycplayground.com/v1/verifications \\
  -H "Authorization: Bearer $KYC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "documentId": "document_123",
    "options": {
      "enableFaceMatch": true,
      "enableOCR": true,
      "enableFraudCheck": true,
      "webhookUrl": "https://your-app.com/webhooks/kyc"
    }
  }'`,
      checkStatus: `# Check verification status
curl -X GET https://api.kycplayground.com/v1/verifications/verification_123 \\
  -H "Authorization: Bearer $KYC_API_KEY"`,
      webhooks: `# Your webhook endpoint should handle POST requests
# Example webhook payload:
{
  "type": "verification.completed",
  "data": {
    "verificationId": "verification_123",
    "status": "verified",
    "confidence": 0.95,
    "processingTime": 1500
  },
  "signature": "sha256=..."
}`
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access API documentation</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">API Documentation</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard/api-keys"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>Manage API Keys</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
          </div>
          <p className="text-gray-600 mb-4">
            KYCPlayground provides a simple and secure API for integrating identity verification into your SaaS applications. 
            Follow this guide to get started with API keys and basic integration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">Fast Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-600">Global Coverage</span>
            </div>
          </div>
        </div>

        {/* API Key Setup */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">API Key Setup</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create an API Key</h4>
                <p className="text-sm text-gray-600">
                  Go to your <Link href="/dashboard/api-keys" className="text-blue-600 hover:underline">API Keys dashboard</Link> and create a new API key with the required permissions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Install SDK</h4>
                <p className="text-sm text-gray-600">
                  Install the KYCPlayground SDK for your preferred programming language.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Initialize Client</h4>
                <p className="text-sm text-gray-600">
                  Initialize the client with your API key and start making requests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Code Examples</h3>
            <div className="flex space-x-2">
              {(['javascript', 'python', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Setup & Configuration</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples[selectedLanguage].setup}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[selectedLanguage].setup)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Create Verification</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples[selectedLanguage].verification}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[selectedLanguage].verification)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Check Verification Status</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples[selectedLanguage].checkStatus}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[selectedLanguage].checkStatus)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Handle Webhooks</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples[selectedLanguage].webhooks}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[selectedLanguage].webhooks)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Reference */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">API Reference</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://api.kycplayground.com/v1</code>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
              <p className="text-sm text-gray-600 mb-2">
                All API requests must include your API key in the Authorization header:
              </p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">Authorization: Bearer YOUR_API_KEY</code>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Endpoints</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">POST /verifications</span>
                  <span className="text-sm text-gray-600">Create a new verification</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">GET /verifications/{'{id}'}</span>
                  <span className="text-sm text-gray-600">Get verification status</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">POST /documents/upload</span>
                  <span className="text-sm text-gray-600">Upload a document</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">GET /analytics/usage</span>
                  <span className="text-sm text-gray-600">Get usage analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Secure API Key Storage</h4>
                <p className="text-sm text-gray-600">
                  Store your API keys securely using environment variables or a secure configuration management system.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Handle Webhooks</h4>
                <p className="text-sm text-gray-600">
                  Implement webhook endpoints to receive real-time updates about verification status changes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Error Handling</h4>
                <p className="text-sm text-gray-600">
                  Implement proper error handling for API failures and network issues.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Rate Limiting</h4>
                <p className="text-sm text-gray-600">
                  Respect rate limits and implement exponential backoff for retries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 mb-4">
                If you need assistance with integration or have questions about the API, 
                our support team is here to help.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/dashboard/api-keys"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Manage API Keys
                </Link>
                <Link
                  href="/docs"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors text-sm"
                >
                  Full Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 