'use client'

import { useState } from 'react'

export default function TestAppwritePage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health?db=true')
      const data = await response.json()
      setTestResults({ type: 'Health Check', data })
    } catch (error) {
      setTestResults({ type: 'Health Check', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testSetupCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup-appwrite', { method: 'POST' })
      const data = await response.json()
      setTestResults({ type: 'Setup Check', data })
    } catch (error) {
      setTestResults({ type: 'Setup Check', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testApiKeys = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test Key', permissions: ['read'] }) })
      const data = await response.json()
      setTestResults({ type: 'API Keys Test', data })
    } catch (error) {
      setTestResults({ type: 'API Keys Test', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Appwrite Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testHealthCheck}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Health Check'}
          </button>
          
          <button
            onClick={testSetupCheck}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Setup Check'}
          </button>
          
          <button
            onClick={testApiKeys}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Keys'}
          </button>
        </div>

        {testResults && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{testResults.type}</h2>
            
            {testResults.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {testResults.error}
              </div>
            ) : (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <strong>Success!</strong> Check the data below for details.
              </div>
            )}
            
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testResults.data || testResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Troubleshooting Steps</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Check if environment variables are set in Vercel</li>
            <li>Verify Appwrite project ID and API key</li>
            <li>Ensure the API Keys collection exists in Appwrite</li>
            <li>Check Appwrite service status</li>
            <li>Review server logs for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
