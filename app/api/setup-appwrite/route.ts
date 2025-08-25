import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'

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
    console.log('🔧 Checking Appwrite setup...')
    
    const databaseId = config.appwrite.database.id
    const collectionId = config.appwrite.database.collections.apiKeys
    
    console.log(`📝 Database ID: ${databaseId}`)
    console.log(`📝 Collection ID: ${collectionId}`)
    console.log(`📝 Project ID: ${config.appwrite.projectId}`)
    console.log(`📝 Has API Key: ${!!config.appwrite.apiKey}`)
    
    try {
      // Check if collection exists
      const collections = await databases.listCollections(databaseId)
      const existingCollection = collections.collections.find((col: any) => col.$id === collectionId)
      
      if (existingCollection) {
        console.log(`✅ Collection ${collectionId} already exists`)
        return NextResponse.json({
          success: true,
          message: 'Collection already exists',
          collection: {
            id: existingCollection.$id,
            name: existingCollection.name,
            attributes: existingCollection.attributes?.length || 0
          }
        })
      }
      
      // Collection doesn't exist - provide setup instructions
      console.log(`❌ Collection ${collectionId} not found`)
      return NextResponse.json({
        success: false,
        error: 'API Keys collection not found',
        message: 'Please run the setup script to create the required collections',
        instructions: [
          '1. Run: node scripts/setup-api-keys-collection.js',
          '2. Or manually create the collection in Appwrite console',
          '3. Ensure APPWRITE_API_KEY environment variable is set'
        ],
        config: {
          databaseId,
          collectionId,
          projectId: config.appwrite.projectId,
          hasApiKey: !!config.appwrite.apiKey
        }
      }, { status: 404 })
      
    } catch (dbError: any) {
      console.error('❌ Database connection error:', dbError)
      console.error('Error details:', {
        code: dbError.code,
        type: dbError.type,
        message: dbError.message,
        response: dbError.response
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed', 
          details: dbError.message,
          code: dbError.code,
          type: dbError.type,
          instructions: [
            '1. Check APPWRITE_API_KEY environment variable',
            '2. Verify project ID and endpoint in configuration',
            '3. Ensure Appwrite service is running'
          ]
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ Setup check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check Appwrite setup', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 