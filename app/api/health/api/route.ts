import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const endpoints = [
      '/api/verifications/create',
      '/api/webhooks',
      '/api/api-keys',
      '/api/analytics'
    ];

    const results = [];
    let healthyCount = 0;

    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const responseTime = Date.now() - startTime;

        const isHealthy = response.status < 500; // Consider 4xx responses as healthy (endpoint exists)
        if (isHealthy) healthyCount++;

        results.push({
          endpoint,
          status: response.status,
          responseTime,
          healthy: isHealthy
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          responseTime: 0,
          healthy: false,
          error: error instanceof Error ? error.message : 'Network error'
        });
      }
    }

    const overallStatus = healthyCount === endpoints.length ? 'healthy' : 
                         healthyCount > endpoints.length / 2 ? 'warning' : 'error';

    return NextResponse.json({
      status: overallStatus,
      totalEndpoints: endpoints.length,
      healthyEndpoints: healthyCount,
      failedEndpoints: endpoints.length - healthyCount,
      endpoints: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check API endpoints',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        totalEndpoints: 0,
        healthyEndpoints: 0,
        failedEndpoints: 0,
        endpoints: []
      },
      { status: 500 }
    );
  }
}
