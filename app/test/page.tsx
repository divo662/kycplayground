'use client'

import { useState } from 'react'
import { AuthService, account, client } from '@/lib/appwrite-service'
import toast from 'react-hot-toast'

export default function TestPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  const testConnection = async () => {
    try {
      // Test basic connection by pinging Appwrite
      const result = await client.ping()
      setIsConnected(true)
      setTestResult('✅ Appwrite connection successful! Ping response: ' + JSON.stringify(result))
      toast.success('Appwrite connection successful!')
    } catch (error: any) {
      setIsConnected(false)
      setTestResult('❌ Appwrite connection failed! Error: ' + error.message)
      toast.error('Appwrite connection failed!')
      console.error('Connection error:', error)
    }
  }

  const testAuth = async () => {
    try {
      // Test authentication service
      const user = await AuthService.getCurrentUser()
      if (user) {
        setTestResult('✅ Authentication service working! User: ' + user.email)
        toast.success('Authentication service working!')
      } else {
        setTestResult('ℹ️ No user logged in (this is normal)')
        toast('No user logged in (this is normal)')
      }
    } catch (error: any) {
      setTestResult('❌ Authentication service error!')
      toast.error('Authentication service error!')
      console.error('Auth error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          KYCPlayground - Appwrite Test
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Test Appwrite Connection (Ping)
          </button>
          
          <button
            onClick={testAuth}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Test Authentication Service
          </button>
        </div>

        {testResult && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">{testResult}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Project ID: {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}
          </p>
          <p className="text-sm text-gray-500">
            Endpoint: {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}
          </p>
        </div>
      </div>
    </div>
  )
} 