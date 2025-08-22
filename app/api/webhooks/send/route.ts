import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'

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

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, payload, verificationId } = await request.json()

    if (!webhookUrl || !payload || !verificationId) {
      return NextResponse.json(
        { error: 'webhookUrl, payload, and verificationId are required' },
        { status: 400 }
      )
    }

    // Check if webhook is configured and active
    let webhookConfig = null
    try {
      const webhookResponse = await databases.listDocuments(
        'kycplayground',
        'webhook_configs',
        [Query.equal('webhookUrl', webhookUrl), Query.equal('isActive', true)]
      )
      
      if (webhookResponse.documents.length > 0) {
        webhookConfig = webhookResponse.documents[0]
      }
    } catch (error) {
      console.log('No webhook configuration found, proceeding with direct webhook')
    }

    // Generate webhook signature
    const signature = generateWebhookSignature(payload, webhookConfig?.secret)

    // Send webhook with retry logic
    let response
    let attemptNumber = 1
    const maxRetries = 3
    
    while (attemptNumber <= maxRetries) {
      try {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'KYCPlayground-Webhook/1.0',
            'X-KYCPlayground-Signature': signature,
            'X-KYCPlayground-Event': 'verification.completed',
            'X-KYCPlayground-Attempt': attemptNumber.toString(),
            'X-KYCPlayground-Timestamp': new Date().toISOString()
          },
          body: JSON.stringify({
            ...payload,
            metadata: {
              sentAt: new Date().toISOString(),
              attemptNumber,
              webhookId: webhookConfig?.$id || 'direct',
              signature: signature
            }
          })
        })

        if (response.ok) {
          break // Success, exit retry loop
        }
        
        attemptNumber++
        if (attemptNumber <= maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attemptNumber - 1) * 1000 // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } catch (fetchError) {
        console.error(`Webhook attempt ${attemptNumber} failed:`, fetchError)
        attemptNumber++
        if (attemptNumber <= maxRetries) {
          const delay = Math.pow(2, attemptNumber - 1) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    const responseBody = await response?.text() || 'No response'
    const success = response?.ok || false
    const finalAttemptNumber = attemptNumber - 1

    // Log webhook attempt
    await databases.createDocument(
      'kycplayground',
      'webhook_logs',
      ID.unique(),
      {
        verificationId,
        webhookUrl,
        payload: JSON.stringify(payload),
        responseStatus: response?.status || 0,
        responseBody: responseBody,
        attemptNumber: finalAttemptNumber,
        success,
        errorMessage: success ? null : `HTTP ${response?.status}: ${responseBody}`,
        sentAt: new Date().toISOString(),
        retryAt: success ? null : new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      }
    )

    if (success) {
      // Update verification record
      await databases.updateDocument(
        'kycplayground',
        'verifications',
        verificationId,
        {
          webhookSent: true,
          lastWebhookAttempt: new Date().toISOString(),
          webhookRetries: finalAttemptNumber
        }
      )

      // Update webhook config last triggered
      if (webhookConfig) {
        await databases.updateDocument(
          'kycplayground',
          'webhook_configs',
          webhookConfig.$id,
          {
            lastTriggered: new Date().toISOString()
          }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook sent successfully',
        responseStatus: response?.status,
        attempts: finalAttemptNumber
      })
    } else {
      // Schedule retry if failed
      const retryAt = new Date()
      retryAt.setMinutes(retryAt.getMinutes() + 5) // Retry in 5 minutes

      await databases.updateDocument(
        'kycplayground',
        'verifications',
        verificationId,
        {
          webhookSent: false,
          webhookRetries: finalAttemptNumber,
          lastWebhookAttempt: new Date().toISOString()
        }
      )

      return NextResponse.json({
        success: false,
        message: `Webhook failed after ${finalAttemptNumber} attempts, will retry`,
        responseStatus: response?.status,
        retryAt: retryAt.toISOString()
      })
    }

  } catch (error) {
    console.error('Error sending webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateWebhookSignature(payload: any, secret?: string): string {
  const webhookSecret = secret || process.env.WEBHOOK_SECRET || (process.env.NODE_ENV === 'development' ? 'default-secret-key' : 'fallback-secret')
    
  const payloadString = JSON.stringify(payload)
  return Buffer.from(payloadString + webhookSecret).toString('base64').slice(0, 32)
} 