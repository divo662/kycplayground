import { NextRequest, NextResponse } from 'next/server'

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
  const origin = request.headers.get('origin')
  
  return NextResponse.json(
    { 
      status: 'ok', 
      message: 'CORS test endpoint working',
      timestamp: new Date().toISOString(),
      origin: origin,
      cors: 'enabled'
    },
    {
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    }
  )
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const body = await request.json()
  
  return NextResponse.json(
    { 
      status: 'ok', 
      message: 'POST request received',
      timestamp: new Date().toISOString(),
      origin: origin,
      body: body,
      cors: 'enabled'
    },
    {
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    }
  )
} 