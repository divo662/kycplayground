import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/security'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/verifications/create - Request received')
    console.log('🔍 Origin header:', request.headers.get('origin'))
    
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request)
    if (rateLimitResult) {
      console.log('🚫 Rate limit blocked request')
      return rateLimitResult
    }
    
    console.log('✅ Rate limit passed')

    // Parse request body
    const body = await request.json()
    const { webhookUrl, options, returnUrl, isDemo, verificationType } = body

    // Extract optional identifiers from headers
    const apiKeyHeader = request.headers.get('x-api-key') || request.headers.get('X-API-Key')
    const userIdHeader = request.headers.get('x-user-id') || request.headers.get('X-User-Id')

    // Validate required fields (webhookUrl is optional for demo sessions)
    if (!webhookUrl && !isDemo) {
      return NextResponse.json(
        { error: 'webhookUrl is required for non-demo sessions' },
        { status: 400 }
      )
    }

    // Generate unique IDs
    const verificationId = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sessionId = isDemo 
      ? `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create verification record in database (include required attributes for schema)
    const appBaseUrl = 'https://kycplayground.vercel.app'
    const redirectUrl = returnUrl
      ? `${appBaseUrl}/verify/${sessionId}?returnUrl=${encodeURIComponent(returnUrl)}`
      : `${appBaseUrl}/verify/${sessionId}`
    const defaultOptions = { enableFaceDetection: true, enableDocumentValidation: true }
    const optionsString = (() => {
      try {
        const str = JSON.stringify(options || defaultOptions)
        return str.length > 1000 ? str.slice(0, 1000) : str
      } catch {
        return JSON.stringify(defaultOptions)
      }
    })()
    const verification = {
      id: verificationId,
      sessionId: sessionId,
      verificationId: verificationId,
      apiKeyId: apiKeyHeader || 'public',
      userId: userIdHeader || 'external',
      verificationType: verificationType || (options && options.verificationType) || 'standard',
      redirectUrl,
      webhookUrl: webhookUrl || (isDemo ? 'https://demo.kycplayground.com/webhooks' : ''),
      options: optionsString, // schema requires string
      status: 'pending',
      webhookSent: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Persist to Appwrite (document ID = sessionId for easy lookup)
    try {
      await databases.createDocument(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        sessionId,
        verification as any
      )
      console.log('✅ Verification session persisted to database:', sessionId)
    } catch (dbError) {
      console.error('❌ Failed to persist verification session:', dbError)
      // Continue response; external clients may still proceed via redirect URL
    }

    // Log verification creation (for debugging)
    console.log('🔍 Verification created:', {
      verificationId,
      sessionId,
      webhookUrl,
      timestamp: new Date().toISOString()
    })

    // Test webhook endpoint (only for non-demo sessions with valid webhook URLs)
    if (webhookUrl && !isDemo) {
      try {
        const webhookTest = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-KYCPlayground-Signature': `test_${Date.now()}`,
            'X-KYCPlayground-Event': 'verification.created'
          },
          body: JSON.stringify({
            type: 'verification.created',
            data: {
              verificationId: verificationId,
              sessionId: sessionId,
              status: 'pending',
              webhookUrl: webhookUrl,
              timestamp: new Date().toISOString()
            }
          })
        })

        if (!webhookTest.ok) {
          console.warn(`Webhook test failed: ${webhookTest.status}`)
        }
      } catch (webhookError) {
        console.warn('Webhook test failed:', webhookError)
      }
    } else if (isDemo) {
      console.log('🔄 Demo session - skipping webhook test')
    }

    // Return success response
    return NextResponse.json({
      success: true,
      verificationId: verificationId,
      sessionId: sessionId,
      redirectUrl,
      message: 'Verification created successfully',
      verification: verification
    })

  } catch (error) {
    console.error('Error creating verification:', error)
    return NextResponse.json(
      { error: 'Failed to create verification' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200
  })
} 