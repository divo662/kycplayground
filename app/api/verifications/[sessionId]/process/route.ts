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
      docFileSizeOK: firstDoc ? firstDoc.fileSize > 10000 : false, // At least 10KB for documents
      faceFileSizeOK: firstFace ? firstFace.fileSize > 1000 : false, // At least 1KB for face images (much more realistic)
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
          // Use fallback analysis based on filename
          groqAnalysis = getFallbackAnalysis(firstDoc.fileName)
          if (groqAnalysis.docTypeGuess === 'REJECT') {
            documentRejected = true
            console.log('🚫 Fallback analysis rejected document:', groqAnalysis.notes)
          }
        }
      }
    } catch (error) {
      console.error('❌ Groq AI analysis failed:', error)
      // Use fallback analysis
      if (firstDoc) {
        groqAnalysis = getFallbackAnalysis(firstDoc.fileName)
        if (groqAnalysis.docTypeGuess === 'REJECT') {
          documentRejected = true
          console.log('🚫 Fallback analysis rejected document:', groqAnalysis.notes)
        }
      }
    }

    // Mock AI processing for face analysis
    const mockAI = new MockAIProcessor()
    const aiResults = await mockAI.processVerification(assets)

    // Determine final status
    const documentValid = !documentRejected && groqAnalysis?.docTypeGuess && groqAnalysis.docTypeGuess !== 'REJECT'
    const status = meetsRequirements && quality.docFileSizeOK && quality.faceFileSizeOK && documentValid ? 'completed' : 'failed'

    console.log(`🎯 Final status: ${status}`)
    console.log(`📊 Quality checks:`, quality)
    console.log(`🔍 Document valid: ${documentValid}`)

    // Determine failure reason
    let failureReason = ''
    if (!meetsRequirements) {
      failureReason = 'Missing required documents or face assets'
    } else if (documentRejected) {
      failureReason = `Document rejected: ${groqAnalysis?.notes || 'Invalid document type'}`
    } else if (!quality.docFileSizeOK) {
      failureReason = 'ID document file size too small (needs at least 10KB)'
    } else if (!quality.faceFileSizeOK) {
      failureReason = 'Face image file size too small (needs at least 1KB)'
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


