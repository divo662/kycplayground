'use client'

import { useState } from 'react'
import { Shield, Database, CheckCircle, AlertCircle } from 'lucide-react'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const runSetup = async () => {
    setIsLoading(true)
    setStatus('loading')
    setResult('')

    try {
      const response = await fetch('/api/setup-appwrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setResult(data.message || 'Setup completed successfully!')
      } else {
        setStatus('error')
        setResult(data.error || 'Setup failed')
      }
    } catch (error) {
      setStatus('error')
      setResult('Failed to run setup. Please check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">KYCPlayground</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Appwrite Setup
          </h1>
          <p className="text-gray-600">
            Automatically create all required databases and collections
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Database: kycplayground</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">Collections: users, documents, verifications, api_keys</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-800">Storage: documents bucket</span>
          </div>
        </div>

        <button
          onClick={runSetup}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Setting up...</span>
            </div>
          ) : (
            'Run Setup'
          )}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            status === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {status === 'success' ? 'Setup Successful!' : 'Setup Failed'}
                </p>
                <p className={`text-sm mt-1 ${
                  status === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Make sure you have set APPWRITE_API_KEY in your .env.local file
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Your app is running on: http://localhost:3000
          </p>
        </div>
      </div>
    </div>
  )
} 