import { NextRequest, NextResponse } from 'next/server'
import { signWebhookPayload } from '@/lib/security-server'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, payload, testData } = await request.json()

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required' },
        { status: 400 }
      )
    }

    // Create a test payload if none provided (support both 'payload' and 'testData' from UI)
    const testPayload = payload || testData || {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook from KYCPlayground',
      testData: {
        verificationId: 'test_verification_id',
        sessionId: 'test_session_id',
        status: 'test',
        confidence: 0.95
      }
    }

    // Send test webhook to SaaS company
    const eventType = typeof testPayload?.event === 'string' ? testPayload.event : 'test'

    const secret = process.env.WEBHOOK_SECRET || (process.env.NODE_ENV === 'development' ? 'default-secret-key' : null)
    
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
    
    const signature = signWebhookPayload(testPayload, secret)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KYCPlayground-Webhook/1.0',
        'X-KYCPlayground-Signature': signature,
        'X-KYCPlayground-Event': eventType
      },
      body: JSON.stringify(testPayload)
    })

    const responseBody = await response.text()
    const success = response.ok

    return NextResponse.json({
      success,
      message: success ? 'Test webhook sent successfully' : 'Test webhook failed',
      webhookUrl,
      responseStatus: response.status,
      responseBody: responseBody,
      sentPayload: testPayload,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error testing webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to test webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500
      }
    )
  }
}