'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  TestTube,
  Database,
  Shield,
  Globe,
  Settings,
  Activity
} from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  details?: string;
  timestamp: string;
}

interface EnvironmentInfo {
  nodeEnv: string;
  appwriteEndpoint: string;
  appwriteProjectId: string;
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
  databaseCollections: string[];
  storageBuckets: string[];
}

interface WebhookTest {
  webhookId: string;
  name: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
  responseCode?: number;
  responseTime?: number;
  error?: string;
}

export default function HealthPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [environmentInfo, setEnvironmentInfo] = useState<EnvironmentInfo | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    setIsLoading(true);
    const checks: HealthCheck[] = [];

    try {
      // Check environment variables
      checks.push(await checkEnvironmentVariables());
      
      // Check Appwrite connectivity
      checks.push(await checkAppwriteConnectivity());
      
      // Check database collections
      checks.push(await checkDatabaseCollections());
      
      // Check storage buckets
      checks.push(await checkStorageBuckets());
      
      // Check API endpoints
      checks.push(await checkApiEndpoints());
      
      // Check webhook configurations
      checks.push(await checkWebhookConfigurations());
      
      // Check file permissions
      checks.push(await checkFilePermissions());
      
      // Check rate limiting
      checks.push(await checkRateLimiting());
      
    } catch (error) {
      console.error('Health check error:', error);
      checks.push({
        name: 'Health Check System',
        status: 'error',
        message: 'Failed to run health checks',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    setHealthChecks(checks);
    setIsLoading(false);
    setLastRefresh(new Date());
  };

  const checkEnvironmentVariables = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/environment');
      if (response.ok) {
        const data = await response.json();
        setEnvironmentInfo(data);
        return {
          name: 'Environment Variables',
          status: 'healthy',
          message: 'All required environment variables are configured',
          details: `Found ${Object.keys(data).length} environment configurations`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Environment Variables',
          status: 'error',
          message: 'Failed to check environment variables',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Environment Variables',
        status: 'error',
        message: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkAppwriteConnectivity = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/appwrite');
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Appwrite Connectivity',
          status: 'healthy',
          message: 'Successfully connected to Appwrite',
          details: `Project: ${data.projectId || 'Unknown'}, Endpoint: ${data.endpoint}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Appwrite Connectivity',
          status: 'error',
          message: 'Failed to connect to Appwrite',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Appwrite Connectivity',
        status: 'error',
        message: 'Appwrite connectivity check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkDatabaseCollections = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/database');
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Database Collections',
          status: 'healthy',
          message: 'All required database collections are accessible',
          details: `Found ${data.collections.length} collections: ${data.collections.join(', ')}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Database Collections',
          status: 'warning',
          message: 'Some database collections may not be accessible',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Database Collections',
        status: 'error',
        message: 'Database check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkStorageBuckets = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/storage');
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Storage Buckets',
          status: 'healthy',
          message: 'All required storage buckets are accessible',
          details: `Found ${data.buckets.length} buckets: ${data.buckets.join(', ')}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Storage Buckets',
          status: 'warning',
          message: 'Some storage buckets may not be accessible',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Storage Buckets',
        status: 'error',
        message: 'Storage check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkApiEndpoints = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/api');
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'API Endpoints',
          status: 'healthy',
          message: 'All API endpoints are responding',
          details: `Tested ${data.endpoints.length} endpoints successfully`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'API Endpoints',
          status: 'warning',
          message: 'Some API endpoints may not be responding',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'API Endpoints',
        status: 'error',
        message: 'API endpoint check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkWebhookConfigurations = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.map((webhook: any) => ({
          webhookId: webhook.id,
          name: webhook.name,
          url: webhook.url,
          status: 'pending' as const
        })));
        return {
          name: 'Webhook Configurations',
          status: 'healthy',
          message: 'Webhook configurations are accessible',
          details: `Found ${data.length} webhook configurations`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Webhook Configurations',
          status: 'warning',
          message: 'Webhook configurations may not be accessible',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Webhook Configurations',
        status: 'error',
        message: 'Webhook configuration check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkFilePermissions = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/permissions');
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'File Permissions',
          status: 'healthy',
          message: 'File permissions are correctly configured',
          details: `All required permissions are granted`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'File Permissions',
          status: 'warning',
          message: 'Some file permissions may be missing',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'File Permissions',
        status: 'error',
        message: 'File permission check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const checkRateLimiting = async (): Promise<HealthCheck> => {
    try {
      const response = await fetch('/api/health/rate-limit');
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Rate Limiting',
          status: 'healthy',
          message: 'Rate limiting is properly configured',
          details: `Current limit: ${data.currentLimit}, Remaining: ${data.remaining}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Rate Limiting',
          status: 'warning',
          message: 'Rate limiting may not be properly configured',
          details: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'error',
        message: 'Rate limiting check failed',
        details: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookId,
          eventType: 'verification.created'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(prev => prev.map(webhook => 
          webhook.webhookId === webhookId 
            ? { 
                ...webhook, 
                status: 'success' as const,
                responseCode: data.responseCode,
                responseTime: data.responseTime
              }
            : webhook
        ));
      } else {
        setWebhooks(prev => prev.map(webhook => 
          webhook.webhookId === webhookId 
            ? { 
                ...webhook, 
                status: 'failed' as const,
                error: `HTTP ${response.status}`
              }
            : webhook
        ));
      }
    } catch (error) {
      setWebhooks(prev => prev.map(webhook => 
        webhook.webhookId === webhookId 
          ? { 
              ...webhook, 
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Network error'
            }
          : webhook
      ));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Healthy</span>;
      case 'warning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Warning</span>;
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">Unknown</span>;
    }
  };

  const getWebhookStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">Pending</span>;
      case 'success':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Success</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">Unknown</span>;
    }
  };

  const healthyCount = healthChecks.filter(check => check.status === 'healthy').length;
  const warningCount = healthChecks.filter(check => check.status === 'warning').length;
  const errorCount = healthChecks.filter(check => check.status === 'error').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health & Diagnostics</h1>
          <p className="text-gray-600">
            Monitor system health, test connectivity, and diagnose issues
          </p>
        </div>
        <button 
          onClick={runHealthChecks} 
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Total Checks</h3>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{healthChecks.length}</div>
          <p className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Healthy</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
          <p className="text-xs text-gray-500">
            {healthChecks.length > 0 ? `${Math.round((healthyCount / healthChecks.length) * 100)}%` : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Warnings</h3>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
          <p className="text-xs text-gray-500">
            {warningCount > 0 ? 'Needs attention' : 'All good'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Errors</h3>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <p className="text-xs text-gray-500">
            {errorCount > 0 ? 'Critical issues' : 'No errors'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button className="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">Overview</button>
          <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700">Environment</button>
          <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700">Webhook Testing</button>
          <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700">Detailed Checks</button>
        </div>

        {/* Overview Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">System Status</h2>
            <p className="text-gray-600 mb-4">
              Overall health status of your KYCPlayground system
            </p>
            <div className="space-y-4">
              {errorCount > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">
                      {errorCount} critical issue{errorCount !== 1 ? 's' : ''} detected. 
                      Please review the detailed checks below and take action.
                    </p>
                  </div>
                </div>
              )}

              {warningCount > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      {warningCount} warning{warningCount !== 1 ? 's' : ''} detected. 
                      These may not affect functionality but should be monitored.
                    </p>
                  </div>
                </div>
              )}

              {errorCount === 0 && warningCount === 0 && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800">
                      All systems are healthy! Your KYCPlayground instance is running optimally.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthChecks.map((check, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(check.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{check.name}</p>
                        {getStatusBadge(check.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      {check.details && (
                        <p className="text-xs text-gray-500 mt-1">{check.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(check.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Environment Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Environment Configuration</h2>
            <p className="text-gray-600 mb-4">
              Current environment settings and configuration details
            </p>
            {environmentInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Node Environment:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">{environmentInfo.nodeEnv}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Key:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${environmentInfo.hasApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {environmentInfo.hasApiKey ? "Configured" : "Missing"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Webhook Secret:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${environmentInfo.hasWebhookSecret ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {environmentInfo.hasWebhookSecret ? "Configured" : "Missing"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Appwrite Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Endpoint:</span>
                        <span className="text-gray-500">{environmentInfo.appwriteEndpoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Project ID:</span>
                        <span className="text-gray-500">{environmentInfo.appwriteProjectId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr className="border-gray-200" />
                
                <div>
                  <h4 className="font-medium mb-2">Database Collections</h4>
                  <div className="flex flex-wrap gap-2">
                    {environmentInfo.databaseCollections.map((collection, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">collection</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Storage Buckets</h4>
                  <div className="flex flex-wrap gap-2">
                    {environmentInfo.storageBuckets.map((bucket, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{bucket}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Environment information not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Webhook Testing Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Webhook Testing</h2>
            <p className="text-gray-600 mb-4">
              Test your webhook endpoints to ensure they're working correctly
            </p>
            {webhooks.length > 0 ? (
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.webhookId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{webhook.name}</h4>
                        {getWebhookStatusBadge(webhook.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{webhook.url}</p>
                      {webhook.responseCode && (
                        <p className="text-xs text-gray-500 mt-1">
                          Response: {webhook.responseCode} • Time: {webhook.responseTime}ms
                        </p>
                      )}
                      {webhook.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {webhook.error}</p>
                      )}
                    </div>
                    <button
                      onClick={() => testWebhook(webhook.webhookId)}
                      disabled={webhook.status === 'pending'}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No webhook configurations found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Configure webhooks in the Webhooks section to test them here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Checks Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Detailed Health Checks</h2>
            <p className="text-gray-600 mb-4">
              Comprehensive breakdown of all system health checks
            </p>
            <div className="space-y-4">
              {healthChecks.map((check, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <h4 className="font-medium">{check.name}</h4>
                        <p className="text-sm text-gray-600">{check.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(check.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(check.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {check.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium mb-1">Details:</p>
                      <p className="text-sm text-gray-600">{check.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
