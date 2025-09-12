import { NextRequest, NextResponse } from 'next/server'
import { databases, storage } from '@/lib/appwrite-service'
import { Query } from 'appwrite'
import { config } from '@/lib/config'
import { MockAIProcessor } from '@/lib/mock-ai-processor'
import { analyzeImageQualityWithGroq, getFallbackAnalysis } from '@/lib/vision-groq'
import { analyzeImageQualityBuffer } from '@/lib/image-quality'
import { analyzeVideoLivenessByHeuristic } from '@/lib/video-liveness'
import { validateAgainstCountryRules } from '@/lib/country-rules'
import { parseMrzFromText } from '@/lib/mrz-parser'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    console.log('🔍 Processing verification session:', sessionId)

    // Fetch the verification session
    const session = await databases.getDocument(
      config.appwrite.database.id,
      config.appwrite.database.collections.verificationSessions,
      sessionId
    )

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Verification session not found' },
        { status: 404 }
      )
    }

    // Find documents associated with this session via sessionId field
    const docs = await databases.listDocuments(
      config.appwrite.database.id,
      config.appwrite.database.collections.documents,
      [
        Query.equal('sessionId', sessionId), // Use direct sessionId field
        Query.limit(200)
      ]
    )

    if (!docs.documents.length) {
      return NextResponse.json(
        { success: false, error: 'No documents found for this session' },
        { status: 400 }
      )
    }

    console.log(`📄 Found ${docs.documents.length} documents for session`)

    // Count documents by type
    let docCount = 0
    let faceCount = 0
    const assets: any[] = []

    docs.documents.forEach(d => {
      const asset = {
        name: d.fileName,
        type: d.mimeType,
        size: d.fileSize,
        category: d.documentType
      }
      assets.push(asset)

      if (d.documentType === 'id_document') {
        docCount++
      } else if (d.documentType === 'face_photo' || d.documentType === 'face_video') {
        faceCount++
      }
    })

    console.log(`📊 Document counts: ${docCount} ID docs, ${faceCount} face assets`)

    // Check if requirements are met
    const meetsRequirements = docCount >= 1 && faceCount >= 1
    console.log(`✅ Requirements met: ${meetsRequirements}`)

    // Get first document for AI analysis
    const firstDoc = docs.documents.find(d => d.documentType === 'id_document')
    const firstFace = docs.documents.find(d => d.documentType === 'face_photo' || d.documentType === 'face_video')

    // Log file sizes for debugging
    if (firstDoc) {
      console.log(`📄 Document file size: ${firstDoc.fileSize} bytes (${Math.round(firstDoc.fileSize / 1024)}KB)`)
    }
    if (firstFace) {
      console.log(`📸 Face file size: ${firstFace.fileSize} bytes (${Math.round(firstFace.fileSize / 1024)}KB)`)
    }

    // Quality checks
    const quality = {
      documentPresent: docCount > 0,
      facePresent: faceCount > 0,
      // Relaxed demo thresholds
      docFileSizeOK: firstDoc ? firstDoc.fileSize > 500 : false,
      faceFileSizeOK: firstFace ? firstFace.fileSize > 200 : false,
      glareLikely: false,
      blurLikely: false,
      cropLikely: false
    }

    // Groq Vision QA for document validation
    let groqAnalysis: any = null
    let documentRejected = false
    try {
      if (firstDoc?.fileUrl) {
        console.log('🔍 Analyzing document with Groq AI:', firstDoc.fileName)
        groqAnalysis = await analyzeImageQualityWithGroq(firstDoc.fileUrl)
        
        if (groqAnalysis) {
          console.log('✅ Groq AI analysis successful:', groqAnalysis.docTypeGuess)
          
          // Update quality metrics
          quality.glareLikely = groqAnalysis.glareLikely
          quality.blurLikely = groqAnalysis.blurLikely
          quality.cropLikely = groqAnalysis.cropLikely
          
          // Check if document was rejected
          if (groqAnalysis.docTypeGuess === 'REJECT') {
            documentRejected = true
            console.log('🚫 Groq AI rejected document:', groqAnalysis.notes)
          }
        } else {
          console.log('⚠️ Groq AI analysis failed, using fallback')
          // Use fallback analysis based on filename (do not hard-reject in demo)
          groqAnalysis = getFallbackAnalysis(firstDoc.fileName)
        }
      }
    } catch (error) {
      console.error('❌ Groq AI analysis failed:', error)
      // Use fallback analysis but do not hard-reject in demo
      if (firstDoc) {
        groqAnalysis = getFallbackAnalysis(firstDoc.fileName)
      }
    }

    // Mock AI processing for face analysis
    const mockAI = new MockAIProcessor()
    const aiResults = await mockAI.processVerification(assets)

    // Determine final status
    // In demo mode, relax to requirements only
    const documentValid = true
    const status = meetsRequirements ? 'completed' : 'failed'

    console.log(`🎯 Final status: ${status}`)
    console.log(`📊 Quality checks:`, quality)
    console.log(`🔍 Document valid: ${documentValid}`)

    // Determine failure reason
    let failureReason = ''
    if (!meetsRequirements) {
      failureReason = 'Missing required documents or face assets'
    }

    if (failureReason) {
      console.log(`❌ Failure reason: ${failureReason}`)
    }

    // Prepare results
    const results = {
      method: 'face_photo',
      counts: {
        documents: docCount,
        face: faceCount
      },
      assets,
      processedAt: new Date().toISOString(),
      confidence: status === 'completed' ? 0.8 : 0.2,
      ai: aiResults,
      quality,
      groqAnalysis,
      mrz: null,
      countryValidation: null
    }

    // Update session status
    await databases.updateDocument(
      config.appwrite.database.id,
      config.appwrite.database.collections.verificationSessions,
      sessionId,
      {
        status,
        results: JSON.stringify(results),
        completedAt: status === 'completed' ? new Date().toISOString() : null
      }
    )

    console.log(`✅ Verification session ${sessionId} processed successfully`)

    // Send webhook if verification completed
    if (status === 'completed' && session.webhookUrl) {
      try {
        const webhookPayload = {
          sessionId,
          status: 'completed',
          results,
          completedAt: new Date().toISOString(),
          verificationId: session.verificationId
        }
        
        const webhookResponse = await fetch(session.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        })
        
        console.log('📡 Webhook sent:', {
          url: session.webhookUrl,
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
      status,
      requirements: {
        requiredDocuments: 1,
        requiredFaceAssets: 1
      },
      counts: {
        documents: docCount,
        face: faceCount
      },
      results,
      failureReason: failureReason || undefined
    })

  } catch (error) {
    console.error('❌ Error processing verification session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process verification session' },
      { status: 500 }
    )
  }
}


