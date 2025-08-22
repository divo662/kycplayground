'use client'

import React, { useState } from 'react'
import { ArrowLeft, TestTube, Send, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import AuthGuard from '@/components/auth-guard'
import toast from 'react-hot-toast'

interface TestResult {
  id: string
  webhookUrl: string
  status: 'success' | 'error' | 'pending'
  responseTime?: number
  responseStatus?: number
  error?: string
  timestamp: Date
  testData: any
}

export default function WebhookTestPage() {
  return (
    <AuthGuard>
      <WebhookTestContent />
    </AuthGuard>
  )
}

function WebhookTestContent() {
  const { user } = useAuthStore()
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('verification.completed')
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const eventTypes = [
    { 
      value: 'verification.completed', 
      label: 'Verification Completed',
      description: 'When a KYC verification is successfully completed'
    },
    { 
      value: 'verification.failed', 
      label: 'Verification Failed',
      description: 'When a KYC verification fails or is rejected'
    },
    { 
      value: 'verification.started', 
      label: 'Verification Started',
      description: 'When a KYC verification process begins'
    },
    { 
      value: 'verification.pending', 
      label: 'Verification Pending',
      description: 'When a KYC verification is awaiting review'
    }
  ]

  const generateTestData = (eventType: string) => {
    const baseData = {
      event: eventType,
      sessionId: 'test-session-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user?.$id || 'test-user',
      verificationId: 'verification-' + Date.now()
    }

    switch (eventType) {
      case 'verification.completed':
        return {
          ...baseData,
          status: 'completed',
          result: {
            score: 0.95,
            confidence: 'high',
            documents: ['passport', 'selfie'],
            extractedInfo: {
              firstName: 'John',
              lastName: 'Doe',
              dateOfBirth: '1990-01-01',
              nationality: 'US'
            }
          }
        }
      case 'verification.failed':
        return {
          ...baseData,
          status: 'failed',
          reason: 'Document quality too low',
          errorCode: 'DOC_QUALITY_LOW'
        }
      case 'verification.started':
        return {
          ...baseData,
          status: 'started',
          documentsRequested: ['passport', 'selfie', 'proof_of_address']
        }
      case 'verification.pending':
        return {
          ...baseData,
          status: 'pending',
          estimatedCompletionTime: '2-4 hours'
        }
      default:
        return baseData
    }
  }

  const handleTestWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!webhookUrl) {
      toast.error('Please enter a webhook URL')
      return
    }

    setIsLoading(true)
    const testData = generateTestData(selectedEvent)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          testData
        })
      })

      const responseTime = Date.now() - startTime
      const result: TestResult = {
        id: Date.now().toString(),
        webhookUrl,
        status: response.ok ? 'success' : 'error',
        responseTime,
        responseStatus: response.status,
        timestamp: new Date(),
        testData
      }

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`
      }

      setTestResults([result, ...testResults])
      
      if (response.ok) {
        toast.success('Webhook test successful!')
      } else {
        toast.error('Webhook test failed')
      }

    } catch (error) {
      const result: TestResult = {
        id: Date.now().toString(),
        webhookUrl,
        status: 'error',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        testData,
        error: error instanceof Error ? error.message : 'Network error'
      }
      
      setTestResults([result, ...testResults])
      toast.error('Webhook test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <TestTube className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Webhook Testing</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Test Your Webhook</h2>
          <form onSubmit={handleTestWebhook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhooks/kyc"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {eventTypes.map((event) => (
                  <option key={event.value} value={event.value}>
                    {event.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {eventTypes.find(e => e.value === selectedEvent)?.description}
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Testing...' : 'Test Webhook'}</span>
            </button>
          </form>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
                <button
                  onClick={clearResults}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Results
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : result.status === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {result.status === 'success' ? 'Success' : 
                             result.status === 'error' ? 'Error' : 'Pending'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Response Time: {result.responseTime}ms
                        </div>
                        {result.responseStatus && (
                          <div className="text-sm text-gray-500">
                            Status: {result.responseStatus}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Webhook URL:</p>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{result.webhookUrl}</p>
                    </div>
                    
                    {result.error && (
                      <div className="mb-3">
                        <p className="text-sm text-red-600 mb-1">Error:</p>
                        <p className="text-sm bg-red-50 text-red-700 p-2 rounded">{result.error}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Test Data Sent:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.testData, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Webhook Testing Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Make sure your webhook endpoint is publicly accessible</li>
            <li>• Your endpoint should respond with a 2xx status code</li>
            <li>• Test with different event types to ensure proper handling</li>
            <li>• Check your server logs for incoming webhook requests</li>
            <li>• Use tools like ngrok for local development testing</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 