import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    console.log('🔍 Fetching verification session:', sessionId)
    
    // Get verification session from database
    const session = await databases.getDocument(
      config.appwrite.database.id,
      config.appwrite.database.collections.verificationSessions,
      sessionId
    )
    
    console.log('✅ Verification session found:', session)
    
    return NextResponse.json({
      success: true,
      data: session
    })
    
  } catch (error) {
    console.error('❌ Error fetching verification session:', error)
    return NextResponse.json(
      { success: false, error: 'Verification session not found' },
      { status: 404 }
    )
  }
} 