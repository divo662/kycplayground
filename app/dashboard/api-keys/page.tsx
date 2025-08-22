'use client'

import React, { useState, useEffect } from 'react'
import { Key, Copy, Trash2, Plus, Eye, EyeOff, RotateCcw, Lock } from 'lucide-react'
import Link from 'next/link'

interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string
  createdAt: string
  lastUsed?: string
  isActive: boolean
  permissions: string[]
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['verifications:read', 'verifications:write'])
  const [showCopiedMessage, setShowCopiedMessage] = useState<string | null>(null)
  const [showRevealedKey, setShowRevealedKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load API keys from database
      loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/api-keys')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setApiKeys(data.apiKeys)
      } else {
        throw new Error(data.error || 'Failed to load API keys')
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
      setError(error.message || 'Failed to load API keys')
      setApiKeys([])
    } finally {
      setLoading(false)
    }
  }

  const generateNewApiKey = async () => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        // Add the new key to the list
        setApiKeys(prev => [data.apiKey, ...prev])
        setShowNewKeyForm(false)
        setNewKeyName('')
        setNewKeyPermissions(['verifications:read', 'verifications:write'])
        
        // Show the new key for copying
        setShowRevealedKey(data.apiKey.key)
        setTimeout(() => setShowRevealedKey(null), 10000) // Hide after 10 seconds
        
        // Show success message
        alert('API key created successfully! Copy it now - it will only be shown once.')
      } else {
        throw new Error(data.error || 'Failed to create API key')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      alert(`Failed to create API key: ${error.message}`)
    }
  }

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowCopiedMessage(keyId)
      setTimeout(() => setShowCopiedMessage(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleKeyStatus = async (keyId: string) => {
    try {
      const apiKey = apiKeys.find(key => key.id === keyId)
      if (!apiKey) return
      
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !apiKey.isActive
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setApiKeys(prev => prev.map(key => 
          key.id === keyId ? { ...key, isActive: !key.isActive } : key
        ))
      } else {
        throw new Error(data.error || 'Failed to update API key')
      }
    } catch (error) {
      console.error('Error updating API key status:', error)
      alert(`Failed to update API key: ${error.message}`)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/api-keys/${keyId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        if (data.success) {
          setApiKeys(prev => prev.filter(key => key.id !== keyId))
        } else {
          throw new Error(data.error || 'Failed to delete API key')
        }
      } catch (error) {
        console.error('Error deleting API key:', error)
        alert(`Failed to delete API key: ${error.message}`)
      }
    }
  }

  const rotateApiKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/api-keys/${keyId}/rotate`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        setApiKeys(prev => [data.apiKey, ...prev.map(k => k.id === keyId ? { ...k, isActive: false } : k)])
        setShowRevealedKey(data.apiKey.key)
        setTimeout(() => setShowRevealedKey(null), 10000)
        alert('Key rotated. Copy the new key now; it will only be shown once.')
      } else {
        throw new Error(data.error || 'Failed to rotate key')
      }
    } catch (e: any) {
      alert(`Rotate failed: ${e.message}`)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Revoke this key? It will immediately stop working.')) return
    try {
      const res = await fetch(`/api/api-keys/${keyId}/revoke`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, isActive: false } : k))
      } else {
        throw new Error(data.error || 'Failed to revoke key')
      }
    } catch (e: any) {
      alert(`Revoke failed: ${e.message}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPermissionBadgeColor = (permission: string) => {
    if (permission.includes('write')) return 'bg-green-100 text-green-800'
    if (permission.includes('manage')) return 'bg-purple-100 text-purple-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
              <p className="text-gray-600 mt-2">
                Manage your API keys for accessing KYCPlayground services
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* New Key Form */}
        {showNewKeyForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New API Key</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['verifications:read', 'verifications:write', 'webhooks:manage'].map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions(prev => [...prev, permission])
                          } else {
                            setNewKeyPermissions(prev => prev.filter(p => p !== permission))
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={generateNewApiKey}
                disabled={!newKeyName.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Generate API Key
              </button>
              <button
                onClick={() => setShowNewKeyForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* New Key Button */}
        {!showNewKeyForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowNewKeyForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create New API Key
            </button>
        </div>
      )}

        {/* API Keys List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your API Keys</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading && (
              <div className="p-6 text-center text-gray-500">Loading API keys...</div>
            )}
            {error && (
              <div className="p-6 text-center text-red-500">{error}</div>
            )}
            {!loading && !error && apiKeys.length === 0 && (
              <div className="p-6 text-center text-gray-500">No API keys found. Create one to get started!</div>
            )}
            {!loading && !error && apiKeys.length > 0 && (
              apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Key className="h-5 w-5 text-gray-400" />
                        <h4 className="text-lg font-medium text-gray-900">{apiKey.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </span>
              </div>
              
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Key:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {showRevealedKey === apiKey.key ? apiKey.key : `${apiKey.prefix}••••••••••••••••`}
                          </code>
                          <button
                            onClick={() => setShowRevealedKey(showRevealedKey === apiKey.key ? null : apiKey.key)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showRevealedKey === apiKey.key ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {showCopiedMessage === apiKey.id && (
                            <span className="text-sm text-green-600">Copied!</span>
                          )}
                        </div>
                </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>Created: {formatDate(apiKey.createdAt)}</span>
                        {apiKey.lastUsed && (
                          <span>Last used: {formatDate(apiKey.lastUsed)}</span>
              )}
            </div>
            
                      <div className="flex flex-wrap gap-2">
                        {apiKey.permissions.map((permission, idx) => (
                          <span
                            key={`${apiKey.id}-${permission}-${idx}`}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPermissionBadgeColor(permission)}`}
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleKeyStatus(apiKey.id)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          apiKey.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {apiKey.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => rotateApiKey(apiKey.id)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        title="Rotate key"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => revokeApiKey(apiKey.id)}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        title="Revoke key"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use Your API Keys</h3>
          <div className="text-blue-800 space-y-2">
            <p>• Include your API key in the <code className="bg-blue-100 px-1 rounded">X-API-Key</code> header with all requests</p>
            <p>• Example: <code className="bg-blue-100 px-1 rounded">X-API-Key: kyc_your_key_here</code></p>
            <p>• Keep your API keys secure and never share them publicly</p>
            <p>• You can deactivate keys at any time if you suspect they've been compromised</p>
          </div>
        </div>
      </div>
    </div>
  )
} 