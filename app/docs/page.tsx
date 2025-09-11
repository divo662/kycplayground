'use client'

import React, { useState } from 'react'
import { 
  BookOpen, 
  Webhook, 
  Shield, 
  TrendingUp,
  Copy,
  CheckCircle,
  AlertCircle,
  Code,
  Download,
  FileText,
  Activity,
  Zap,
  Globe,
  Terminal
} from 'lucide-react'
import Link from 'next/link'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, key: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(key)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">KYCPlayground Documentation</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/docs"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: BookOpen },
                { id: 'integration', name: 'Integration Guide', icon: Zap },
                { id: 'api-reference', name: 'API Reference', icon: Code },
                { id: 'webhooks', name: 'Webhooks', icon: Webhook },
                { id: 'verification', name: 'Verification Flow', icon: Webhook },
                { id: 'errors', name: 'Errors', icon: AlertCircle },
                { id: 'rate-limits', name: 'Rate Limits', icon: TrendingUp },
                { id: 'security', name: 'Security', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to KYCPlayground</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    The complete developer platform for KYC verification. Integrate powerful identity verification 
                    into your application with our comprehensive API, webhooks, and developer tools.
                  </p>
                </div>

                {/* Quick Start */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Start</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <span className="text-blue-900">Read the <Link href="#integration" onClick={() => setActiveTab('integration')} className="underline">Integration Guide</Link></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <span className="text-blue-900">Review the <Link href="#api-reference" onClick={() => setActiveTab('api-reference')} className="underline">API Reference</Link></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <span className="text-blue-900">Test webhooks in the <Link href="#webhooks" onClick={() => setActiveTab('webhooks')} className="underline">Webhooks</Link> section</span>
                    </div>
                  </div>
                </div>

                {/* Documentation Index */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation Index</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Getting Started</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• <Link href="#integration" onClick={() => setActiveTab('integration')} className="text-blue-600 hover:underline">Integration Guide</Link> - Complete setup instructions</li>
                        <li>• <Link href="#api-reference" onClick={() => setActiveTab('api-reference')} className="text-blue-600 hover:underline">API Reference</Link> - OpenAPI specification</li>
                        <li>• <Link href="#webhooks" onClick={() => setActiveTab('webhooks')} className="text-blue-600 hover:underline">Webhooks</Link> - Event handling</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Developer Tools</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• <Link href="#developer-tools" onClick={() => setActiveTab('developer-tools')} className="text-blue-600 hover:underline">Postman Collection</Link> - API testing</li>
                        <li>• <Link href="#developer-tools" onClick={() => setActiveTab('developer-tools')} className="text-blue-600 hover:underline">cURL Examples</Link> - Command line testing</li>
                        <li>• <Link href="#health" onClick={() => setActiveTab('health')} className="text-blue-600 hover:underline">Health Dashboard</Link> - System monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Webhook className="h-6 w-6 text-purple-500" />
                      <h3 className="font-semibold text-gray-900">Real-time Webhooks</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Get instant notifications when verifications are completed or fail.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="h-6 w-6 text-green-500" />
                      <h3 className="font-semibold text-gray-900">Secure & Reliable</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Enterprise-grade security with webhook signatures and retry logic.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Code className="h-6 w-6 text-orange-500" />
                      <h3 className="font-semibold text-gray-900">Developer First</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      OpenAPI specs, Postman collections, and comprehensive examples.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Activity className="h-6 w-6 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">Health Monitoring</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Built-in diagnostics and system health monitoring.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integration' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Integration Guide</h2>
                  <p className="text-gray-600 mb-6">
                    Complete guide to integrating KYCPlayground into your application.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Integration</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">1. Create API Key</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Generate an API key from your dashboard with appropriate permissions.
                      </p>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <code className="text-green-400 text-sm">
                          {`curl -X POST https://kycplayground.vercel.app/api/api-keys \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Production Key", "permissions": ["verifications:create"]}'`}
                        </code>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">2. Configure Webhook</h4>
                      <p className="text-sm text-green-800 mb-3">
                        Set up webhook endpoint to receive verification notifications.
                      </p>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <code className="text-green-400 text-sm">
                          {`curl -X POST https://kycplayground.vercel.app/api/webhooks \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"name": "My Webhook", "webhookUrl": "https://your-app.com/webhooks/kyc", "events": ["verification.completed"]}'`}
                        </code>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">3. Create Verification</h4>
                      <p className="text-sm text-purple-800 mb-3">
                        Start a verification session for your user.
                      </p>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <code className="text-green-400 text-sm">
                          {`curl -X POST https://kycplayground.vercel.app/api/verifications/create \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"webhookUrl": "https://your-app.com/webhooks/kyc", "returnUrl": "https://your-app.com/callback"}'`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Resources removed */}
              </div>
            )}

            {activeTab === 'api-reference' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">API Reference</h2>
                  <p className="text-gray-600 mb-6">
                    Complete API documentation with OpenAPI specification and examples.
                  </p>
                </div>

                {/* OpenAPI Specification section removed */}

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Verifications</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                                                  <li>• POST /api/verifications/create</li>
                        <li>• GET /api/verifications/{"{sessionId}"}</li>
                        <li>• PUT /api/verifications/{"{sessionId}"}/update</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">API Keys</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• GET /api/api-keys</li>
                          <li>• POST /api/api-keys</li>
                          <li>• PUT /api/api-keys/{"{id}"}/rotate</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Webhooks</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• GET /api/webhooks</li>
                          <li>• POST /api/webhooks</li>
                          <li>• POST /api/webhooks/test</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Files & Analytics</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• POST /api/files/sign</li>
                          <li>• GET /api/analytics</li>
                          <li>• GET /api/health/*</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
                  <p className="text-gray-600 mb-4">
                    All API endpoints require authentication using your API key.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
                      {`Headers:
X-API-Key: YOUR_API_KEY
Content-Type: application/json`}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Webhooks</h2>
                  <p className="text-gray-600">
                    Receive real-time notifications about verification events and status changes.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Events</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">verification.completed</h4>
                      <p className="text-sm text-gray-600 mb-2">Triggered when a verification is successfully completed</p>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <code className="text-green-400 text-sm">
                          {`{
  "type": "verification.completed",
  "data": {
    "verificationId": "ver_123456",
    "status": "completed",
    "result": "verified",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}`}
                        </code>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">verification.failed</h4>
                      <p className="text-sm text-gray-600 mb-2">Triggered when a verification fails or is rejected</p>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <code className="text-green-400 text-sm">
                          {`{
  "type": "verification.failed",
  "data": {
    "verificationId": "ver_123456",
    "status": "failed",
    "reason": "Document validation failed",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}`}
                        </code>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">document.uploaded</h4>
                      <p className="text-sm text-gray-600 mb-2">Triggered when a new document is uploaded</p>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <code className="text-green-400 text-sm">
                          {`{
  "type": "document.uploaded",
  "data": {
    "documentId": "doc_123456",
    "type": "passport",
    "filename": "passport.jpg",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Headers</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">X-KYCPlayground-Signature</span>
                      <span className="text-sm text-gray-600">HMAC signature for verification</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">X-KYCPlayground-Event</span>
                      <span className="text-sm text-gray-600">Event type (e.g., verification.completed)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">X-KYCPlayground-Timestamp</span>
                      <span className="text-sm text-gray-600">Unix timestamp of the event</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Webhooks</h3>
                  <p className="text-gray-600 mb-4">
                    Use our webhook testing endpoint to verify your webhook integration before going live.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Test Endpoint</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      POST /api/webhooks/test
                    </p>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <code className="text-green-400 text-sm">
                        {`{
  "webhookUrl": "https://your-app.com/webhook",
  "payload": {"test": "data"}
}`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Flow</h2>
                  <p className="text-gray-600">
                    Understand the step-by-step process of KYC verification.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Steps</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Document Upload</h4>
                        <p className="text-sm text-gray-600">User uploads identity documents (passport, driver's license, etc.)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">AI Processing</h4>
                        <p className="text-sm text-gray-600">Advanced AI analyzes documents for authenticity and extracts information</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Document Validation</h4>
                        <p className="text-sm text-gray-600">Documents are validated against security features and databases</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Webhook Notification</h4>
                        <p className="text-sm text-gray-600">Results are processed and webhook notifications are sent to your endpoint</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Document Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Government IDs</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Passports</li>
                        <li>• Driver's Licenses</li>
                        <li>• National ID Cards</li>
                        <li>• Residence Permits</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Proof of Address</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Utility Bills</li>
                        <li>• Bank Statements</li>
                        <li>• Rental Agreements</li>
                        <li>• Government Letters</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'developer-tools' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Developer Tools</h2>
                  <p className="text-gray-600 mb-6">
                    Download our developer tools to accelerate your integration.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-4">
                      <Globe className="h-8 w-8 text-orange-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Postman Collection</h3>
                        <p className="text-sm text-gray-600">Ready-to-use API testing collection</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Import our Postman collection to test all API endpoints with pre-configured requests, 
                      environment variables, and example data.
                    </p>
                                          <a 
                        href="/postman-collection.json" 
                        download
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Collection
                      </a>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-4">
                      <Terminal className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">cURL Examples</h3>
                        <p className="text-sm text-gray-600">Command-line API testing</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Complete cURL examples for all API endpoints, perfect for testing from terminal 
                      or integrating into scripts.
                    </p>
                    <a 
                      href="/curl-examples.md" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Examples
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Tools</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Webhook Testing</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Test your webhook endpoints locally using ngrok and our testing tools.
                      </p>
                      <div className="flex space-x-3">
                        <a 
                          href="/ngrok-webhook-guide.md" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Guide
                        </a>
                        <Link
                          href="/dashboard/health"
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Test Webhook
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            )}

            {activeTab === 'health' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Health & Diagnostics</h2>
                  <p className="text-gray-600 mb-6">
                    Monitor your KYCPlayground integration health and diagnose issues.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Dashboard</h3>
                  <p className="text-gray-600 mb-4">
                    Access our comprehensive health monitoring dashboard to check system status, 
                    test webhooks, and verify permissions.
                  </p>
                  <Link
                    href="/dashboard/health"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Open Health Dashboard
                  </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Checks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Environment variables</li>
                        <li>• Appwrite connectivity</li>
                        <li>• Database permissions</li>
                        <li>• Storage access</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">API Testing</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Endpoint responsiveness</li>
                        <li>• Webhook delivery testing</li>
                        <li>• Rate limit status</li>
                        <li>• Authentication checks</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Common Issues</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• API key permissions</li>
                        <li>• Webhook endpoint accessibility</li>
                        <li>• Database connection issues</li>
                        <li>• Environment configuration</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Getting Help</h4>
                      <p className="text-sm text-blue-800">
                        Use the health dashboard to identify issues, then check our documentation 
                        or contact support for additional help.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Error Handling</h2>
                  <p className="text-gray-600">
                    Understand how to handle webhook errors and what they mean.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Response Codes</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">200</span>
                        <span className="font-medium text-gray-900">Success</span>
                      </div>
                      <p className="text-sm text-gray-600">Webhook received and processed successfully</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">400</span>
                        <span className="font-medium text-gray-900">Bad Request</span>
                      </div>
                      <p className="text-sm text-gray-600">Invalid webhook payload or malformed request</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">500</span>
                        <span className="font-medium text-gray-900">Server Error</span>
                      </div>
                      <p className="text-sm text-gray-600">Your webhook endpoint encountered an error</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Retry Logic</h3>
                  <p className="text-gray-600 mb-4">
                    Failed webhook deliveries are automatically retried with exponential backoff.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
{`Retry Schedule:
- 1st retry: 1 minute
- 2nd retry: 2 minutes  
- 3rd retry: 4 minutes
- 4th retry: 8 minutes
- 5th retry: 16 minutes
- Max retries: 5 attempts`}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rate-limits' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Rate Limits</h2>
                  <p className="text-gray-600">
                    Understand our rate limiting policies for webhook delivery.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Rate Limits</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Webhook Delivery</h4>
                      <p className="text-sm text-blue-800">100 webhook deliveries per 15 minutes per endpoint</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900">Sliding Window</h4>
                      <p className="text-sm text-yellow-800">Rate limits are calculated using a sliding 15-minute window</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Per Endpoint</h4>
                      <p className="text-sm text-green-800">Each webhook URL has its own rate limit</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limited Response</h3>
                  <p className="text-gray-600 mb-4">
                    When rate limited, webhook delivery will be delayed until the rate limit resets.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
{`{
  "error": "Rate limit exceeded",
  "message": "Webhook delivery delayed due to rate limiting",
  "retryAfter": 300,
  "nextDelivery": "2024-01-01T00:15:00.000Z"
}`}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Security</h2>
                  <p className="text-gray-600">
                    Learn about the security measures in place to protect your webhook data.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Webhook Signatures</h4>
                      <p className="text-sm text-green-800 mt-1">
                        HMAC signatures to verify webhook authenticity and prevent tampering
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">HTTPS Only</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        All webhook deliveries use HTTPS for encrypted transmission
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">Retry Logic</h4>
                      <p className="text-sm text-purple-800 mt-1">
                        Automatic retry with exponential backoff for failed deliveries
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900">Rate Limiting</h4>
                      <p className="text-sm text-orange-800 mt-1">
                        Protection against abuse and DDoS attacks on webhook endpoints
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Verifying Webhooks</h3>
                  <p className="text-gray-600 mb-4">
                    Always verify webhook signatures to ensure they come from KYCPlayground.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
{`// Example signature verification (pseudo-code)
const signature = request.headers['X-KYCPlayground-Signature'];
const payload = request.body;
const expectedSignature = hmac(secret, payload);

if (signature !== expectedSignature) {
  return 401; // Invalid signature
}`}
                    </code>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900">Security Best Practices</h3>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Always verify webhook signatures</li>
                        <li>• Use HTTPS for your webhook endpoints</li>
                        <li>• Implement proper error handling and logging</li>
                        <li>• Monitor webhook delivery status</li>
                        <li>• Keep your webhook endpoints secure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 