'use client'

import { useState } from 'react'
import { client, account } from '@/lib/appwrite-service'

export default function PingPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  async function sendPing() {
    if (status === 'loading') return
    setStatus('loading')
    
    try {
      // Test connection by getting account info (this will work even if no user is logged in)
      const user = await account.get()
      setResult(JSON.stringify({
        success: true,
        message: 'Connection successful!',
        user: user ? {
          id: user.$id,
          email: user.email,
          name: user.name
        } : null
      }, null, 2))
      setStatus('success')
    } catch (err: any) {
      // If we get a 401, that means the connection works but no user is logged in
      if (err.code === 401) {
        setResult(JSON.stringify({
          success: true,
          message: 'Connection successful! No user logged in.',
          error: 'Authentication required'
        }, null, 2))
        setStatus('success')
      } else {
        setResult(JSON.stringify({
          success: false,
          message: 'Connection failed',
          error: err.message || 'Unknown error'
        }, null, 2))
        setStatus('error')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-5">
      <div className="mt-8 flex w-full max-w-2xl items-center justify-center">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            KYCPlayground - Appwrite Connection Test
          </h1>
          
          <div className="text-center mb-8">
            {status === 'loading' ? (
              <div className="flex flex-row gap-4 justify-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin fill-blue-600 text-gray-200"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
                <span>Testing connection...</span>
              </div>
            ) : status === 'success' ? (
              <h2 className="text-2xl font-light text-green-600">
                Connection Successful!
              </h2>
            ) : (
              <h2 className="text-2xl font-light text-gray-900">
                Check connection
              </h2>
            )}

            <p className="mt-2 mb-8">
              {status === 'success' ? (
                <span>Your Appwrite connection is working properly.</span>
              ) : status === 'error' || status === 'idle' ? (
                <span>Send a ping to verify the connection</span>
              ) : null}
            </p>

            <button
              onClick={sendPing}
              className={`cursor-pointer rounded-md bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors ${status === 'loading' ? 'hidden' : 'visible'}`}
            >
              Test Connection
            </button>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Endpoint</span>
              <span className="truncate font-mono text-sm">
                {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Project-ID</span>
              <span className="truncate font-mono text-sm">
                {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Project name</span>
              <span className="truncate font-mono text-sm">
                {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME}
              </span>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Connection Result</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto">
                <pre>{result}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 