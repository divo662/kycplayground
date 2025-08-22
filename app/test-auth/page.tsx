'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/appwrite-service'
import { config } from '@/lib/config'
import toast from 'react-hot-toast'

export default function TestAuthPage() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    runAuthTests()
  }, [])

  const runAuthTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Check Appwrite configuration
      results.config = {
        endpoint: config.appwrite.endpoint,
        projectId: config.appwrite.projectId,
        databaseId: config.appwrite.database.id,
        collections: config.appwrite.database.collections
      }

      // Test 2: Check if user is authenticated
      results.currentUser = {
        isAuthenticated,
        userId: user?.$id,
        userEmail: user?.email
      }

      // Test 3: Try to get current user from Appwrite
      try {
        const currentUser = await AuthService.getCurrentUser()
        results.appwriteUser = {
          success: true,
          userId: currentUser?.$id,
          email: currentUser?.email,
          name: currentUser?.name
        }
      } catch (error: any) {
        results.appwriteUser = {
          success: false,
          error: error.message
        }
      }

      // Test 4: Check database connectivity
      try {
        // This will test if we can connect to Appwrite
        const testConnection = await fetch(`${config.appwrite.endpoint}/health`, {
          method: 'GET',
          headers: {
            'X-Appwrite-Project': config.appwrite.projectId
          }
        })
        results.connection = {
          success: testConnection.ok,
          status: testConnection.status
        }
      } catch (error: any) {
        results.connection = {
          success: false,
          error: error.message
        }
      }

    } catch (error: any) {
      results.generalError = error.message
    } finally {
      setLoading(false)
      setTestResults(results)
    }
  }

  const testLogin = async () => {
    try {
      setLoading(true)
      
      // Test with a mock user (you'll need to create this user in Appwrite first)
      const result = await AuthService.signIn('test@example.com', 'testpassword123')
      
      toast.success('Login test completed!')
      setTestResults((prev: any) => ({
        ...prev,
        loginTest: {
          success: true,
          result: result
        }
      }))
      
    } catch (error: any) {
      toast.error(`Login test failed: ${error.message}`)
      setTestResults((prev: any) => ({
        ...prev,
        loginTest: {
          success: false,
          error: error.message
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication System Test</h1>
          
          <div className="space-y-6">
            {/* Test Results */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">Test Results</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>

            {/* Test Actions */}
            <div className="flex space-x-4">
              <button
                onClick={runAuthTests}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </button>
              
              <button
                onClick={testLogin}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test Login
              </button>
            </div>

            {/* Current Status */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">Current Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">Authentication State</h3>
                  <p className="text-sm text-gray-600">
                    Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}
                  </p>
                  {user && (
                    <>
                      <p className="text-sm text-gray-600">
                        User ID: {user.$id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Name: {user.name}
                      </p>
                    </>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">Configuration</h3>
                  <p className="text-sm text-gray-600">
                    Environment: {config.app.env}
                  </p>
                  <p className="text-sm text-gray-600">
                    Appwrite Endpoint: {config.appwrite.endpoint}
                  </p>
                  <p className="text-sm text-gray-600">
                    Project ID: {config.appwrite.projectId}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure you have created the .env.local file with your Appwrite credentials</li>
                <li>• Ensure your Appwrite project has the required collections and buckets</li>
                <li>• Create a test user in Appwrite to test the login functionality</li>
                <li>• Check the console for detailed error messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 