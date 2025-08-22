'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [demoData, setDemoData] = useState({
    verificationType: 'id_card',
    redirectUrl: 'https://your-app.com/verification-complete',
    webhookUrl: 'https://your-app.com/webhooks/kyc-result'
  })

  const startDemoVerification = async () => {
    setIsLoading(true)
    
    try {
      console.log('Starting demo verification with:', demoData)
      
      const requestBody = {
        verificationType: demoData.verificationType,
        redirectUrl: demoData.redirectUrl,
        webhookUrl: demoData.webhookUrl,
        isDemo: true // Mark as demo session
      }
      
      console.log('Sending request to API:', requestBody)
      
      // Create a real verification session via the API
      const response = await fetch('/api/verifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Failed to create verification session: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success && result.sessionId) {
        console.log('Demo verification session created:', result.sessionId)
        alert(`✅ Demo verification session created successfully!\n\nSession ID: ${result.sessionId}\n\nRedirecting to verification page...`)
        // Redirect to the actual verification page
        router.push(`/verify/${result.sessionId}`)
      } else {
        console.error('API returned success: false:', result)
        throw new Error(`Failed to create verification session: ${result.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Demo verification error:', error)
      alert('Demo verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: demoData.webhookUrl
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('✅ Test webhook sent successfully!\n\nCheck your webhook endpoint for the test payload.')
      } else {
        alert('❌ Test webhook failed. Check the console for details.')
      }
      
      console.log('Webhook test result:', result)
    } catch (error) {
      console.error('Webhook test error:', error)
      alert('Failed to test webhook. Check the console for details.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              KYCPlayground Integration Demo
            </h1>
            <p className="text-lg text-gray-600">
              See how easy it is to integrate identity verification into your SaaS application
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Integration Demo */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🚀 Start Verification Demo
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Type
                </label>
                <select
                  value={demoData.verificationType}
                  onChange={(e) => setDemoData({
                    ...demoData,
                    verificationType: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="id_card">ID Card</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL (After Verification)
                </label>
                <input
                  type="url"
                  value={demoData.redirectUrl}
                  onChange={(e) => setDemoData({
                    ...demoData,
                    redirectUrl: e.target.value
                  })}
                  placeholder="https://your-app.com/verification-complete"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (For Results)
                </label>
                <input
                  type="url"
                  value={demoData.webhookUrl}
                  onChange={(e) => setDemoData({
                    ...demoData,
                    webhookUrl: e.target.value
                  })}
                  placeholder="https://your-app.com/webhooks/kyc-result"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
              <button
                  onClick={startDemoVerification}
                disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-md font-medium ${
                  isLoading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                  {isLoading ? 'Starting...' : 'Start Demo Verification'}
              </button>

                    <button
                  onClick={testWebhook}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                  Test Webhook
                    </button>
                  </div>
                </div>
            </div>

          {/* Integration Flow */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔄 Integration Flow
            </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                  <h3 className="font-medium text-gray-800">User Clicks Verify</h3>
                  <p className="text-sm text-gray-600">
                    User initiates verification from your app
                  </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                  <h3 className="font-medium text-gray-800">API Call to KYCPlayground</h3>
                  <p className="text-sm text-gray-600">
                    Your app calls our API with user details and webhook URL
                  </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                  <h3 className="font-medium text-gray-800">User Redirected to Verification</h3>
                  <p className="text-sm text-gray-600">
                    User is redirected to our secure verification page
                  </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                  <h3 className="font-medium text-gray-800">Document Upload & Processing</h3>
                  <p className="text-sm text-gray-600">
                    User uploads documents, AI processes them
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Webhook Sent to Your App</h3>
                  <p className="text-sm text-gray-600">
                    Results sent via webhook to your endpoint
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  6
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">User Redirected Back</h3>
                  <p className="text-sm text-gray-600">
                    User returns to your app with verification complete
                  </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            💻 Code Examples
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frontend Integration */}
          <div>
              <h3 className="font-medium text-gray-800 mb-3">Frontend (React)</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
{`import React, { useState } from 'react';

function KYCVerification() {
  const [isLoading, setIsLoading] = useState(false);

  const startVerification = async () => {
    setIsLoading(true);
    
    try {
  const response = await fetch('/api/verifications/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key'
    },
    body: JSON.stringify({
      verificationType: 'id_card',
          redirectUrl: 'https://your-app.com/complete',
          webhookUrl: 'https://your-app.com/webhooks/kyc'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    window.location.href = data.verificationUrl;
  }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={startVerification}
      disabled={isLoading}
    >
      {isLoading ? 'Starting...' : 'Verify Identity'}
    </button>
  );
}`}
                  </pre>
            </div>

            {/* Backend Webhook */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Backend Webhook (Node.js)</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
{`const express = require('express');
const app = express();

app.post('/webhooks/kyc', (req, res) => {
  const { verificationId, sessionId, status, result } = req.body;
  
  if (status === 'completed') {
    // Update user verification status
    updateUserVerification(sessionId, {
      verified: true,
      verificationId,
      extractedInfo: result.extractedInfo,
      confidence: result.confidence
    });
  }
  
  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

function updateUserVerification(sessionId, data) {
  // Update your database
  console.log('Verification completed:', { sessionId, data });
}`}
                </pre>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">
            🎯 Next Steps
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-blue-800">Get your API key from the dashboard</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-blue-800">Implement the verification start endpoint</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-blue-800">Create your webhook endpoint</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <span className="text-blue-800">Test the integration in sandbox mode</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </div>
              <span className="text-blue-800">Go live with real verifications</span>
          </div>
        </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => router.push('/dashboard/api-keys')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Get API Key
            </button>
            
            <button
              onClick={() => router.push('/docs')}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 