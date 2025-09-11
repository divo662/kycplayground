'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Settings, 
  LogOut, 
  User, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  AlertCircle,
  Globe,
  Zap,
  Shield,
  Cpu,
  Database,
  Webhook,

  FileText,
  Code,
  Play,
  Plus,
  Trash2,
  TestTube,
  Key,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { AuthService } from '@/lib/appwrite-service'
import { AnalyticsService, DashboardStats } from '@/lib/analytics-service'
import AuthGuard from '@/components/auth-guard'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts'

interface WebhookConfig {
  $id: string
  name: string
  webhookUrl: string
  events: string[]
  isActive: boolean
  lastTriggered?: Date
  createdAt: Date
}

// Helper function to safely format dates
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalVerifications: 0,
    monthlyVerifications: 0,
    webhooksConfigured: 0,
    successRate: 0,
    averageResponseTime: 0
  })
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  // Edit state
  const [editingId, setEditingId] = useState<string>('')
  const [editForm, setEditForm] = useState<{ name: string; webhookUrl: string; events: string[]; isActive: boolean }>({ name: '', webhookUrl: '', events: [], isActive: true })
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [analyticsSeries, setAnalyticsSeries] = useState<any[]>([])
  
  // Webhook form state
  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [webhookForm, setWebhookForm] = useState({
    name: '',
    webhookUrl: '',
    events: ['verification.completed', 'verification.failed']
  })

  // API key selection for webhook actions
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; prefix?: string; key?: string }>>([])
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('')
  const [manualApiKey, setManualApiKey] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadDashboardData()
      loadAnalytics()
    }
  }, [user])

  useEffect(() => {
    const loadWebhooks = async () => {
      try {
        const res = await fetch('/api/webhooks')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (data.success) {
          const list: WebhookConfig[] = data.webhooks.map((w: any) => ({
            $id: w.$id,
            name: w.name,
            webhookUrl: w.webhookUrl,
            events: w.events,
            isActive: w.isActive,
            lastTriggered: w.lastTriggered ? new Date(w.lastTriggered) : undefined,
            createdAt: new Date(w.createdAt)
          }))
          setWebhooks(list)
          setStats(prev => ({ ...prev, webhooksConfigured: list.length }))
        } else {
          throw new Error(data.error || 'Failed to load webhooks')
        }
      } catch (error) {
        console.error('Error loading webhooks:', error)
        toast.error('Failed to load webhooks')
      }
    }

    loadWebhooks()
  }, [])

  useEffect(() => {
    // Load keys for selection
    const loadKeys = async () => {
      try {
        const res = await fetch('/api/api-keys')
        const data = await res.json()
        if (res.ok && data?.success) {
          setApiKeys(data.apiKeys)
        }
      } catch {}
    }
    loadKeys()
  }, [])

  // Helper to resolve header key
  const resolveApiKey = (): string | null => {
    const pasted = manualApiKey.trim()
    if (pasted) return pasted
    const found = apiKeys.find(k => k.id === selectedApiKeyId)
    if (found?.key) return found.key
    return null
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load real dashboard stats
      const dashboardStats = await AnalyticsService.getDashboardStats(user!.$id)
      setStats(dashboardStats)
      
      // Load webhooks from database
      try {
        const res = await fetch('/api/webhooks')
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            const list: WebhookConfig[] = data.webhooks.map((w: any) => ({
              $id: w.$id,
              name: w.name,
              webhookUrl: w.webhookUrl,
              events: w.events,
              isActive: w.isActive,
              lastTriggered: w.lastTriggered ? new Date(w.lastTriggered) : undefined,
              createdAt: new Date(w.createdAt)
            }))
            setWebhooks(list)
            setStats(prev => ({ ...prev, webhooksConfigured: list.length }))
          }
        }
      } catch {}
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Load analytics series (daily counts for the last 14 days)
  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAnalyticsSeries(data.series)
          return
        }
      }
    } catch {}
    // Fallback to empty data
    setAnalyticsSeries([])
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!webhookForm.name || !webhookForm.webhookUrl) {
      toast.error('Please fill in all required fields')
      return
    }
    const headerKey = resolveApiKey()
    if (!headerKey) {
      toast.error('Select or paste an API key')
      return
    }

    try {
      // Create webhook in database
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': headerKey },
        body: JSON.stringify({
          name: webhookForm.name,
          webhookUrl: webhookForm.webhookUrl,
          events: webhookForm.events,
          isActive: true
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to create webhook')
      const created = data.webhook
      const newWebhook: WebhookConfig = {
        $id: created.$id,
        name: created.name,
        webhookUrl: created.webhookUrl,
        events: created.events,
        isActive: created.isActive,
        createdAt: new Date(created.createdAt),
        lastTriggered: created.lastTriggered ? new Date(created.lastTriggered) : undefined
      }
      setWebhooks(prev => [newWebhook, ...prev])
      setStats(prev => ({ ...prev, webhooksConfigured: prev.webhooksConfigured + 1 }))
      
      // Reset form
      setWebhookForm({ name: '', webhookUrl: '', events: ['verification.completed', 'verification.failed'] })
      setShowWebhookForm(false)
      
      toast.success('Webhook added successfully!')
    } catch (error) {
      console.error('Error adding webhook:', error)
      toast.error('Failed to add webhook.')
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    const headerKey = resolveApiKey()
    if (!headerKey) {
      toast.error('Select or paste an API key')
      return
    }
    try {
      const res = await fetch(`/api/webhooks/${webhookId}`, { method: 'DELETE', headers: { 'X-API-Key': headerKey } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to delete webhook')
      setWebhooks(prev => prev.filter(w => w.$id !== webhookId))
      
      // Update stats
      setStats(prev => ({ ...prev, webhooksConfigured: prev.webhooksConfigured - 1 }))
      
      toast.success('Webhook deleted successfully!')
    } catch (error) {
      console.error('Error deleting webhook:', error)
      toast.error('Failed to delete webhook.')
    }
  }

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    try {
      // Call server-side test endpoint to avoid browser CSP/connect-src
      const testPayload = {
        event: 'verification.completed',
        sessionId: 'test_session_' + Date.now(),
        timestamp: new Date().toISOString(),
        status: 'completed',
        result: {
          score: 0.95,
          confidence: 'high',
          documents: ['passport', 'selfie'],
          extractedInfo: { firstName: 'Test', lastName: 'User' }
        }
      }

      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhook.webhookUrl, testData: testPayload })
      })

      if (response.ok) {
        toast.success('Webhook test successful!')
        setWebhooks(prev => prev.map(w => (
          w.$id === webhook.$id ? { ...w, lastTriggered: new Date() } : w
        )))
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(`Webhook test failed${data.responseStatus ? `: ${data.responseStatus}` : ''}`)
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      toast.error('Failed to test webhook.')
    }
  }

  const toggleWebhookStatus = async (webhookId: string) => {
    const headerKey = resolveApiKey()
    if (!headerKey) {
      toast.error('Select or paste an API key')
      return
    }
    try {
      const current = webhooks.find(w => w.$id === webhookId)
      if (!current) return
      const res = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': headerKey },
        body: JSON.stringify({ isActive: !current.isActive })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to update webhook')
      const saved = data.webhook
      setWebhooks(prev => prev.map(w => w.$id === webhookId ? {
        ...w,
        isActive: saved.isActive,
        name: saved.name,
        events: saved.events,
        webhookUrl: saved.webhookUrl
      } : w))
      
      toast.success('Webhook status updated!')
    } catch (error) {
      console.error('Error updating webhook status:', error)
      toast.error('Failed to update webhook status.')
    }
  }

  const startEditWebhook = (w: WebhookConfig) => {
    setEditingId(w.$id)
    setEditForm({ name: w.name, webhookUrl: w.webhookUrl, events: [...w.events], isActive: w.isActive })
  }

  const cancelEditWebhook = () => {
    setEditingId('')
    setIsSavingEdit(false)
  }

  const saveEditWebhook = async () => {
    const headerKey = resolveApiKey()
    if (!headerKey) {
      toast.error('Select or paste an API key')
      return
    }
    if (!editingId) return
    if (!editForm.name?.trim() || !editForm.webhookUrl?.trim()) {
      toast.error('Name and URL are required')
      return
    }
    try {
      setIsSavingEdit(true)
      const res = await fetch(`/api/webhooks/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': headerKey },
        body: JSON.stringify({
          name: editForm.name.trim(),
          webhookUrl: editForm.webhookUrl.trim(),
          events: editForm.events,
          isActive: editForm.isActive
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${res.status}`)
      }
      const updated = data.webhook
      setWebhooks(prev => prev.map(w => w.$id === editingId ? {
        ...w,
        name: updated.name,
        webhookUrl: updated.webhookUrl,
        events: updated.events,
        isActive: updated.isActive
      } : w))
      toast.success('Webhook updated')
      setEditingId('')
    } catch (e) {
      console.error('Edit webhook error:', e)
      toast.error('Failed to update webhook')
    } finally {
      setIsSavingEdit(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the developer dashboard</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Cpu className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">KYCPlayground Developer Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Manage your KYCPlayground verification system, monitor usage, and configure webhooks.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'webhooks', name: 'Webhooks', icon: Webhook },
              { id: 'api-keys', name: 'API Keys', icon: Key },
      
              { id: 'docs', name: 'Documentation', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
          </div>
        ) : activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Verifications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVerifications.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Verifications</p>
                    <p className="text-2xl font-bold text-green-600">{stats.monthlyVerifications.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.averageResponseTime}ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>



            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link href="/dashboard/webhooks" className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Webhook className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Configure Webhooks</h3>
                    <p className="text-blue-100 text-sm">Set up webhook endpoints</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/api-keys" className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">API Keys</h3>
                    <p className="text-green-100 text-sm">Manage your API keys</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/verifications" className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Verifications</h3>
                    <p className="text-purple-100 text-sm">View verification history</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {stats.totalVerifications === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start using verifications to see activity here.
                    </p>
                    <Link
                      href="/dashboard/verifications"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Verifications
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Dashboard loaded</p>
                          <p className="text-xs text-gray-500">Real-time stats updated</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">Just now</span>
                    </div>
                    
                    {stats.monthlyVerifications > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Verifications processed</p>
                            <p className="text-xs text-gray-500">{stats.monthlyVerifications} verifications this month</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">This month</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'docs' ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documentation</h3>
                <p className="text-gray-600 mb-4">
                  Learn how to integrate KYCPlayground webhooks into your application.
                </p>
                <Link
                  href="/docs"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-sm text-gray-600">Total (14 days)</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsSeries.reduce((a,b)=>a+b.total,0)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-700">{analyticsSeries.reduce((a,b)=>a+b.completed,0)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-700">{analyticsSeries.reduce((a,b)=>a+b.failed,0)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Volume (last 14 days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsSeries} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#16a34a" />
                    <Bar dataKey="failed" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : activeTab === 'webhooks' ? (
          <div className="space-y-6">
            {/* Webhook Header with API key controls */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Webhook Configuration</h3>
                <p className="text-sm text-gray-600">
                  Configure webhooks to receive real-time notifications when verifications are completed.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedApiKeyId}
                    onChange={(e) => setSelectedApiKeyId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">— Select API Key —</option>
                    {apiKeys.map(k => (
                      <option key={k.id} value={k.id}>{k.name}{k.prefix ? ` (${k.prefix}...)` : ''}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or paste API key (kyc_...)"
                    value={manualApiKey}
                    onChange={(e) => setManualApiKey(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56"
                  />
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard/webhooks"
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <TestTube className="h-4 w-4" />
                    <span>Test Webhooks</span>
                  </Link>
                  <button
                    onClick={() => setShowWebhookForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Webhook</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add Webhook Form */}
            {showWebhookForm && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Webhook</h4>
                <form onSubmit={handleAddWebhook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook Name
                    </label>
                    <input
                      type="text"
                      value={webhookForm.name}
                      onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                      placeholder="e.g., Production Webhook"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={webhookForm.webhookUrl}
                      onChange={(e) => setWebhookForm({ ...webhookForm, webhookUrl: e.target.value })}
                      placeholder="https://your-app.com/webhooks/kyc"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Events to Listen For
                    </label>
                    <div className="space-y-2">
                      {['verification.completed', 'verification.failed', 'verification.started'].map((event) => (
                        <label key={event} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={webhookForm.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWebhookForm({ ...webhookForm, events: [...webhookForm.events, event] })
                              } else {
                                setWebhookForm({ ...webhookForm, events: webhookForm.events.filter(e => e !== event) })
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Webhook
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWebhookForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Webhooks List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                {webhooks.length === 0 ? (
                  <div className="text-center py-8">
                    <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks configured</h3>
                    <p className="text-gray-600 mb-4">
                      Add your first webhook to receive real-time notifications when verifications are completed.
                    </p>
                    <button
                      onClick={() => setShowWebhookForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Webhook
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.$id} className="border rounded-lg p-4">
                        {editingId === webhook.$id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                                <input
                                  type="url"
                                  value={editForm.webhookUrl}
                                  onChange={(e) => setEditForm({ ...editForm, webhookUrl: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                              <div className="flex flex-wrap gap-3">
                                {['verification.completed','verification.failed','verification.started','verification.pending'].map(ev => (
                                  <label key={ev} className="inline-flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={editForm.events.includes(ev)}
                                      onChange={() => setEditForm(prev => ({
                                        ...prev,
                                        events: prev.events.includes(ev) ? prev.events.filter(e => e !== ev) : [...prev.events, ev]
                                      }))}
                                    />
                                    <span>{ev}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input id={`active-${webhook.$id}`} type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                              <label htmlFor={`active-${webhook.$id}`} className="text-sm text-gray-700">Active</label>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={saveEditWebhook} disabled={isSavingEdit} className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50">
                                {isSavingEdit ? 'Saving...' : 'Save'}
                              </button>
                              <button onClick={cancelEditWebhook} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {webhook.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{webhook.webhookUrl}</p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {webhook.events.map((event) => (
                                  <span key={event} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {event}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500">
                                Created: {formatDate(webhook.createdAt)}
                                {webhook.lastTriggered && ` • Last triggered: ${formatDate(webhook.lastTriggered)}`}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditWebhook(webhook)}
                                className="text-gray-600 hover:text-gray-900 p-2"
                                title="Edit webhook"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleTestWebhook(webhook)}
                                className="text-blue-600 hover:text-blue-800 p-2"
                                title="Test webhook"
                              >
                                <TestTube className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleWebhookStatus(webhook.$id)}
                                className="text-gray-400 hover:text-gray-600 p-2"
                                title={webhook.isActive ? 'Deactivate Webhook' : 'Activate Webhook'}
                              >
                                {webhook.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteWebhook(webhook.$id)}
                                className="text-red-600 hover:text-red-800 p-2"
                                title="Delete webhook"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'api-keys' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
                <Link
                  href="/dashboard/api-keys"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Key className="h-4 w-4 inline mr-2" />
                  Manage API Keys
                </Link>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your API keys for accessing KYCPlayground services. API keys are required for all API requests.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Quick Access</h4>
                <p className="text-blue-800 text-sm">
                  Click "Manage API Keys" to create, view, and manage your API keys. You'll need these keys to integrate with FinFlow and other applications.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">
                This feature is under development and will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 