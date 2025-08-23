import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'
import { encryptField } from '@/lib/security-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    
    console.log('🔄 Updating verification session:', sessionId, body)
    
    // Validate required fields
    if (!body.status || !body.results) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: status and results' },
        { status: 400 }
      )
    }
    
    // Prepare results; encrypt PII (documentNumber) and serialize (max 5000 chars)
    const resultsString = (() => {
      try {
        const raw = body.results || {}
        const piiSafe = {
          ...raw,
          ...(raw && raw.documentNumber ? { documentNumber: encryptField(String(raw.documentNumber)) } : {})
        }
        const str = JSON.stringify(piiSafe)
        return str.length > 5000 ? str.slice(0, 5000) : str
      } catch {
        return '{}'
      }
    })()

    // Update verification session
    const updatedSession = await databases.updateDocument(
      config.appwrite.database.id,
      config.appwrite.database.collections.verificationSessions,
      sessionId,
      {
        status: body.status,
        results: resultsString,
        completedAt: body.status === 'completed' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      }
    )
    
    console.log('✅ Verification session updated:', updatedSession)
    
    // If verification is completed, send webhook
    if (body.status === 'completed' && body.webhookUrl) {
      try {
        const webhookPayload = {
          sessionId,
          status: 'completed',
          results: body.results,
          completedAt: new Date().toISOString(),
          verificationId: updatedSession.verificationId
        }
        
        const webhookResponse = await fetch(body.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        })
        
        console.log('📡 Webhook sent:', {
          url: body.webhookUrl,
          status: webhookResponse.status,
          success: webhookResponse.ok
        })
        
        // Update webhook status in database
        await databases.updateDocument(
          config.appwrite.database.id,
          config.appwrite.database.collections.verificationSessions,
          sessionId,
          {
            webhookSent: true,
            webhookStatus: webhookResponse.ok ? 'success' : 'failed',
            webhookResponse: webhookResponse.ok ? 'Webhook sent successfully' : `Webhook failed: ${webhookResponse.status}`,
            updatedAt: new Date().toISOString()
          }
        )
        
      } catch (webhookError) {
        console.error('❌ Webhook error:', webhookError)
        
        // Update webhook status in database
        await databases.updateDocument(
          config.appwrite.database.id,
          config.appwrite.database.collections.verificationSessions,
          sessionId,
          {
            webhookSent: true,
            webhookStatus: 'failed',
            webhookResponse: `Webhook error: ${webhookError}`,
            updatedAt: new Date().toISOString()
          }
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification updated successfully',
      data: updatedSession
    })
    
  } catch (error) {
    console.error('❌ Error updating verification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update verification' },
      { status: 500 }
    )
  }
} 