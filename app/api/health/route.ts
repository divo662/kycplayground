import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const healthStatus: any = {
      status: 'ok', 
      message: 'KYCPlayground API is running',
      timestamp: new Date().toISOString(),
      cors: 'enabled',
      endpoint: '/api/health'
    }

    // Check if database connection is requested
    const url = new URL(request.url)
    if (url.searchParams.get('db') === 'true') {
      try {
        console.log('🔍 Testing database connection...')
        
        // Test database connection by listing collections
        const databaseId = config.appwrite.database.id
        const collections = await databases.listCollections(databaseId)
        
        healthStatus.database = {
          status: 'connected',
          databaseId,
          collectionsCount: collections.collections.length,
          collections: collections.collections.map((col: any) => ({
            id: col.$id,
            name: col.name,
            attributes: col.attributes?.length || 0
          }))
        }
        
        console.log('✅ Database connection successful')
      } catch (dbError: any) {
        console.error('❌ Database connection failed:', dbError)
        healthStatus.database = {
          status: 'error',
          error: dbError.message,
          code: dbError.code,
          type: dbError.type
        }
        healthStatus.status = 'warning'
      }
    }

    return NextResponse.json(healthStatus, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    )
  }
} 