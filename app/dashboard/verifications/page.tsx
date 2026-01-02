'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  FileText, 
  Shield,
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Image as ImageIcon,
  X as CloseIcon
} from 'lucide-react'
import Link from 'next/link'
import { Query } from 'appwrite'
import { useAuthStore } from '@/lib/store'
import { databases } from '@/lib/appwrite'
import { config } from '@/lib/config'
import toast from 'react-hot-toast'

interface VerificationSession {
  $id: string
  sessionId: string
  verificationId: string
  webhookUrl: string
  options: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  completedAt?: string
  results?: any
  webhookSent?: boolean
  webhookStatus?: string
}

export default function VerificationsPage() {
  const { user } = useAuthStore()
  const [verifications, setVerifications] = useState<VerificationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selected, setSelected] = useState<VerificationSession | null>(null)

  useEffect(() => {
    if (user) {
      loadVerifications()
    }
  }, [user])

  const loadVerifications = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // First, get the user's API keys
      let userApiKeys: string[] = []
      try {
        const apiKeysResponse = await fetch('/api/api-keys')
        if (apiKeysResponse.ok) {
          const apiKeysData = await apiKeysResponse.json()
          if (apiKeysData.success && apiKeysData.apiKeys) {
            userApiKeys = apiKeysData.apiKeys.map((key: any) => key.key).filter(Boolean)
          }
        }
      } catch (error) {
        console.error('Error fetching API keys:', error)
      }
      
      // Fetch all verification sessions from Appwrite
      const result = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        [
          Query.orderDesc('createdAt'),
          Query.limit(500) // Increase limit to get more sessions
        ]
      )
      
      // Filter sessions to show only user's own sessions
      // Show sessions where:
      // 1. userId matches the logged-in user's ID, OR
      // 2. apiKeyId contains one of the user's API keys
      const userVerifications = result.documents.filter((doc: any) => {
        // Check if userId matches
        if (doc.userId === user.$id) {
          return true
        }
        
        // Check if apiKeyId matches any of the user's API keys
        if (doc.apiKeyId && userApiKeys.length > 0) {
          const apiKeyIdStr = String(doc.apiKeyId)
          return userApiKeys.some((key: string) => apiKeyIdStr.includes(key))
        }
        
        return false
      })
      
      console.log('📊 Loaded verification sessions for user:', user.$id, userVerifications.length, 'out of', result.documents.length)
      setVerifications(userVerifications as unknown as VerificationSession[])
      
    } catch (error) {
      console.error('Error loading verifications:', error)
      toast.error('Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }

  const filteredVerifications = verifications.filter(verification => {
    const matchesFilter = filter === 'all' || verification.status === filter
    const matchesSearch = searchTerm === '' || 
      verification.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.verificationId.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAnalytics = () => {
    const total = verifications.length
    const completed = verifications.filter(v => v.status === 'completed').length
    const failed = verifications.filter(v => v.status === 'failed').length
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, failed, successRate }
  }

  const analytics = getAnalytics()

  const openDetails = (v: VerificationSession) => {
    setSelected(v)
    setDetailsOpen(true)
  }
  const closeDetails = () => {
    setDetailsOpen(false)
    setSelected(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Verification History</h1>
          </div>
          <Link
            href="/dashboard/verifications/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            New Verification
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search verifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verifications List */}
        {filteredVerifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No verifications found</h3>
            <p className="text-gray-500 mb-6">You haven't performed any verifications yet.</p>
            <Link
              href="/dashboard/verifications/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Your First Verification
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Webhook
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVerifications.map((verification) => (
                    <tr key={verification.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {verification.sessionId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {verification.verificationId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                          {getStatusIcon(verification.status)}
                          <span className="ml-1">{verification.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(verification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {verification.webhookSent ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            verification.webhookStatus === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {verification.webhookStatus === 'success' ? 'Sent' : 'Failed'}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not sent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetails(verification)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {detailsOpen && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Verification Details</h3>
                  <p className="text-sm text-gray-500">Session: {selected.sessionId}</p>
                </div>
                <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selected.status)}`}>
                    {getStatusIcon(selected.status)}
                    <span className="ml-1 capitalize">{selected.status}</span>
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm text-gray-800">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                {selected.completedAt && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-xs text-gray-500 mb-1">Completed</p>
                    <p className="text-sm text-gray-800">{new Date(selected.completedAt).toLocaleString()}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500 mb-1">Webhook URL</p>
                  <p className="text-sm text-gray-800 truncate" title={selected.webhookUrl}>{selected.webhookUrl || '—'}</p>
                </div>
              </div>

              {(() => {
                try {
                  const raw = selected.results
                  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
                  const files = Array.isArray(parsed?.uploadedFiles) ? parsed.uploadedFiles : []
                  if (files.length === 0) return <div className="text-sm text-gray-500">No uploaded files captured for this session.</div>
                  return (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {files.map((f: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {f.type && typeof f.type === 'string' && f.type.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="text-sm text-gray-800 truncate">{f.name || 'document'}</span>
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-3">
                              {f.type && <span>{f.type}</span>}
                              {typeof f.size === 'number' && <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>}
                              {f.url && (
                                <a href={`/api/files/sign`} onClick={(e)=>{e.preventDefault(); fetch('/api/files/sign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileUrl:f.url, ttlSeconds:300})}).then(r=>r.json()).then(d=>{ if(d.success){ window.open(d.url,'_blank'); } });}} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                                  <Download className="h-3 w-3" />
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                } catch {
                  return <div className="text-sm text-red-600">Failed to parse uploaded files.</div>
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 