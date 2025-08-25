import { NextRequest, NextResponse } from 'next/server'
import { 
  securityMiddleware, 
  securityHeadersMiddleware, 
  requestLoggingMiddleware 
} from './lib/security'
import { config as appConfig } from './lib/config'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Middleware: ${request.method} ${request.nextUrl.pathname}`)
    console.log(`🔍 Origin: ${request.headers.get('origin')}`)
    console.log(`🔍 User-Agent: ${request.headers.get('user-agent')}`)
  }
  
  // Handle OPTIONS requests with proper CORS headers
  if (request.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS request with CORS headers')
    const origin = request.headers.get('origin')
    
    // Check if origin is allowed
    if (origin) {
      const allowedOrigins = appConfig.cors.origins
      
      if (allowedOrigins.includes(origin) || (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1')))) {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, x-api-key',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
          },
        })
      }
    }
    
    // Default OPTIONS response
    return new NextResponse(null, { status: 200 })
  }
  
  // Apply security middleware
  const securityResponse = await securityMiddleware(request)
  if (securityResponse) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚫 Security middleware blocked request: ${securityResponse.status}`)
    }
    return securityResponse
  }
  
  // Continue with the request
  const response = NextResponse.next()
  
  // Apply security headers
  securityHeadersMiddleware(response, request)
  
  // Log the request
  requestLoggingMiddleware(request, response, startTime)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 