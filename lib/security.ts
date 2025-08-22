import { NextRequest, NextResponse } from 'next/server'
import { config } from './config'

// Rate limit store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clear rate limit store (useful for development)
export function clearRateLimitStore() {
  rateLimitStore.clear()
  console.log('🧹 Rate limit store cleared')
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(rateLimitStore.entries())
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RequestLog {
  timestamp: string
  method: string
  url: string
  ip: string
  userAgent: string
  apiKey?: string
  responseTime: number
  statusCode: number
  error?: string
}

// CORS middleware
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  const allowedOrigins = config.cors.origins
  
  // Debug logging
  console.log('🔍 CORS Debug:', {
    origin,
    allowedOrigins,
    configLoaded: !!config,
    configCors: !!config?.cors
  })
  
  // Allow requests with no origin (like direct API calls)
  if (!origin) {
    return null
  }
  
  // In development, be more permissive with localhost origins
  if (config.app.env === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log(`✅ CORS allowed for localhost origin in development: ${origin}`)
      return null
    }
  }
  
  // Check if origin is in allowed list
  if (!allowedOrigins.includes(origin)) {
    console.log(`🚫 CORS blocked: ${origin} not in allowed origins:`, allowedOrigins)
    return new NextResponse(
      JSON.stringify({ error: 'CORS not allowed', origin, allowedOrigins }),
      { 
        status: 403, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, x-api-key',
        } 
      }
    )
  }
  
  console.log(`✅ CORS allowed for origin: ${origin}`)
  return null
}



// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown'
  const pathname = request.nextUrl.pathname
  
  // Skip rate limiting for demo pages and static assets
  if (pathname.startsWith('/demo') || 
      pathname.startsWith('/verify/demo_') ||
      pathname.includes('.well-known') ||
      pathname.includes('site.webmanifest')) {
    if (config.app.env === 'development') {
      console.log(`🔄 Rate limiting skipped for: ${pathname}`)
    }
    return null
  }
  
  const now = Date.now()
  
  // Much more permissive rate limiting for development
  const windowMs = config.app.env === 'development' ? 60 * 1000 : 15 * 60 * 1000 // 1 min in dev, 15 min in prod
  const maxRequests = config.app.env === 'development' ? 1000 : 100 // 1000 requests per minute in dev, 100 per 15 min in prod
  
  const key = `${ip}:${Math.floor(now / windowMs)}`
  const current = rateLimitStore.get(key)
  
  if (current) {
    if (current.count >= maxRequests) {
      if (config.app.env === 'development') {
        console.log(`🚫 Rate limit exceeded for ${ip}: ${current.count}/${maxRequests} requests in ${windowMs/1000}s`)
      }
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
          } 
        }
      )
    }
    current.count++
    if (config.app.env === 'development' && current.count % 100 === 0) {
      console.log(`📊 Rate limit status for ${ip}: ${current.count}/${maxRequests} requests`)
    }
  } else {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
  }
  
  return null
}

// API key validation middleware
export async function apiKeyMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Skip API key validation for public endpoints
  const publicEndpoints = [
    '/api/health', 
    '/api/ping',
    '/api/api-keys',
    '/api/webhooks/test',
    '/api/verifications/create',
    '/api/verifications/session_',  // Allow verification session access and updates
    '/api/verifications/demo_',     // Allow demo verification sessions
    '/api/analytics',
    // '/api/webhooks' // now protected
  ]
  
  // Check if the path matches any public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => {
    if (request.nextUrl.pathname === endpoint) return true
    
    // For endpoints that end with _, check if path starts with that pattern
    if (endpoint.endsWith('_')) {
      return request.nextUrl.pathname.startsWith(endpoint)
    }
    
    // For other endpoints, check if path starts with endpoint + '/'
    return request.nextUrl.pathname.startsWith(endpoint + '/')
  })
  
  // Debug logging for development
  if (config.app.env === 'development') {
    console.log('🔍 API Key Middleware Debug:', {
      pathname: request.nextUrl.pathname,
      publicEndpoints,
      isPublicEndpoint,
      matchedEndpoint: publicEndpoints.find(endpoint => {
        if (request.nextUrl.pathname === endpoint) return true
        if (endpoint.endsWith('_')) {
          return request.nextUrl.pathname.startsWith(endpoint)
        }
        return request.nextUrl.pathname.startsWith(endpoint + '/')
      })
    })
  }
  
  if (isPublicEndpoint) {
    return null
  }
  
  const apiKey = request.headers.get('X-API-Key')

  // Allow GET /api/webhooks (list) without API key for dashboard UI
  const path = request.nextUrl.pathname
  const method = request.method.toUpperCase()
  if (path === '/api/webhooks' && method === 'GET') {
    return null
  }
  
  if (!apiKey) {
    return new NextResponse(
      JSON.stringify({ error: 'API key required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  try {
    // Validate API key format
    if (!apiKey.startsWith('kyc_')) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid API key format' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Lightweight scope handling in middleware (no DB calls in edge)
    // Assume broad scopes in development; endpoints can enforce stricter checks server-side
    const scopes: string[] = ['verifications:create', 'webhooks:read', 'webhooks:manage']

    // Per-key rate limit (basic)
    const now = Date.now()
    const windowMs = 60 * 1000
    const maxPerMinute = 120
    const rlKey = `key:${apiKey}:${Math.floor(now / windowMs)}`
    const current = rateLimitStore.get(rlKey)
    if (current) {
      if (current.count >= maxPerMinute) {
        return new NextResponse(JSON.stringify({ error: 'Key rate limit exceeded' }), { status: 429 })
      }
      current.count++
    } else {
      rateLimitStore.set(rlKey, { count: 1, resetTime: now + windowMs })
    }

    // Scope mapping per route/method
    // Scope mapping per route/method
    const requiredScopes: string[] = []
    if (path.startsWith('/api/verifications/create')) requiredScopes.push('verifications:create')
    if (path.startsWith('/api/webhooks')) {
      if (method === 'GET') requiredScopes.push('webhooks:read')
      else requiredScopes.push('webhooks:manage')
    }

    if (requiredScopes.length && !requiredScopes.some(s => scopes.includes(s))) {
      return new NextResponse(
        JSON.stringify({ error: 'Insufficient scope', required: requiredScopes, scopes }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return null
  } catch (error) {
    console.error('API key validation error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'API key validation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Request logging middleware
export function requestLoggingMiddleware(request: NextRequest, response: NextResponse, startTime: number): void {
  const endTime = Date.now()
  const responseTime = endTime - startTime
  
  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    ip: request.ip || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    apiKey: request.headers.get('X-API-Key') || undefined,
    responseTime,
    statusCode: response.status,
  }
  
  // Log in development
  if (config.app.env === 'development') {
    console.log(`📝 ${log.method} ${log.url} - ${log.statusCode} (${log.responseTime}ms)`)
  }
  
  // TODO: Send to logging service in production
  // You could send this to a logging service like DataDog, LogRocket, etc.
}

// Security headers middleware
export function securityHeadersMiddleware(response: NextResponse, request?: NextRequest): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Check if this is a verification page that needs camera access
  const isVerificationPage = request?.nextUrl.pathname.startsWith('/verify/')
  
  if (isVerificationPage) {
    // Allow camera and microphone for verification pages
    response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()')
  } else {
    // Block camera and microphone for other pages
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  }
  
  // Add CORS headers if origin is present and allowed
  if (request) {
    const origin = request.headers.get('origin')
    if (origin) {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://localhost:8000']
      
      // In development, allow any localhost origin
      if (allowedOrigins.includes(origin) || (config.app.env === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1')))) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, x-api-key')
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
    }
  }
  
  // Content Security Policy - Updated to allow Appwrite connections and camera access
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://fra.cloud.appwrite.io https://cloud.appwrite.io",
    "frame-ancestors 'none'",
    "media-src 'self' blob:",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

// Combined security middleware
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Apply CORS
  const corsResponse = corsMiddleware(request)
  if (corsResponse) return corsResponse
  
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request)
  if (rateLimitResponse) {
    // Add CORS headers to rate limit response
    const origin = request.headers.get('origin')
    if (origin) {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://localhost:8000']
      if (allowedOrigins.includes(origin) || (config.app.env === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1')))) {
        rateLimitResponse.headers.set('Access-Control-Allow-Origin', origin)
        rateLimitResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        rateLimitResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, x-api-key')
        rateLimitResponse.headers.set('Access-Control-Allow-Credentials', 'true')
      }
    }
    return rateLimitResponse
  }
  
  // Apply API key validation for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKeyResponse = await apiKeyMiddleware(request)
    if (apiKeyResponse) {
      // Add CORS headers to API key response
      const origin = request.headers.get('origin')
      if (origin) {
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://localhost:8000']
        if (allowedOrigins.includes(origin) || (config.app.env === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1')))) {
          apiKeyResponse.headers.set('Access-Control-Allow-Origin', origin)
          apiKeyResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          apiKeyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, x-api-key')
          apiKeyResponse.headers.set('Access-Control-Allow-Credentials', 'true')
        }
      }
      return apiKeyResponse
    }
  }
  
  return null
}

// Utility functions
export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateApiKey(): string {
  return `kyc_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
}

export function hashApiKey(apiKey: string): string {
  // In production, use a proper hashing library like bcrypt
  return Buffer.from(apiKey).toString('base64')
} 