import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/security'
import { databases } from '@/lib/appwrite'
import { config } from '@/lib/config'

const DATABASE_ID = config.appwrite.database.id
const COLLECTION_ID = (config.appwrite.database.collections as any).apiKeys || 'collection-api_keys'

// Generate a new API key
function generateApiKey(): string {
  const prefix = 'kyc_'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `${prefix}${timestamp}_${random}`
}

// GET /api/api-keys - List all API keys for the current user
export async function GET(request: NextRequest) {
  try {
    console.log('🔑 GET /api/api-keys - Fetching API keys from Appwrite database')
    
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request)
    if (rateLimitResult) {
      console.log('🚫 Rate limit blocked request')
      return rateLimitResult
    }
    
    // TODO: Get user ID from authentication
    // For now, we'll return all keys (in production, filter by user)
    const userId = 'demo_user' // Replace with actual user ID from auth
    
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID)
      const userKeys = response.documents.filter((doc: any) => doc.userId === userId)

      // Normalize and parse permissions; expose stable id and prefix
      const normalizedKeys = userKeys.map((doc: any) => {
        const perms = typeof doc.permissions === 'string' ? JSON.parse(doc.permissions) : doc.permissions
        const keyValue: string = doc.key || ''
        const prefix = keyValue ? keyValue.slice(0, 8) : ''
        return {
          id: doc.$id,
          userId: doc.userId,
          name: doc.name,
          key: keyValue,
          prefix,
          permissions: Array.isArray(perms) ? perms : [],
          isActive: !!doc.isActive,
          createdAt: doc.$createdAt || doc.createdAt,
          updatedAt: doc.$updatedAt || doc.updatedAt,
          lastUsed: doc.lastUsed || undefined
        }
      })

      console.log(`✅ Found ${normalizedKeys.length} API keys for user ${userId} in database`)

      return NextResponse.json({
        success: true,
        apiKeys: normalizedKeys
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch API keys from database' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    console.log('🔑 POST /api/api-keys - Creating new API key in Appwrite database')
    
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request)
    if (rateLimitResult) {
      console.log('🚫 Rate limit blocked request')
      return rateLimitResult
    }
    
    const body = await request.json()
    const { name, permissions } = body
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Name and permissions are required' },
        { status: 400 }
      )
    }
    
    // TODO: Get user ID from authentication
    const userId = 'demo_user' // Replace with actual user ID from auth
    
    const newApiKey = {
      userId,
      name,
      key: generateApiKey(),
      permissions: JSON.stringify(permissions), // Convert array to JSON string for String type
      isActive: true,
      createdAt: new Date().toISOString() // Add the required createdAt attribute
    }
    
    try {
      console.log('📝 Creating document with data:', newApiKey)
      
      // Store the API key in Appwrite database
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        'unique()', // Let Appwrite generate the ID
        newApiKey
      )
      
      console.log(`✅ API key created in database: ${newApiKey.name} (${newApiKey.key})`)
      console.log('📝 Response:', response)
      
      const prefix = (response.key as string).slice(0, 8)
      return NextResponse.json({
        success: true,
        apiKey: {
          id: response.$id,
          userId: response.userId,
          name: response.name,
          key: response.key,
          prefix,
          permissions: JSON.parse(response.permissions), // Parse JSON string back to array
          isActive: response.isActive,
          createdAt: response.$createdAt,
          updatedAt: response.$updatedAt
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      console.error('Error details:', {
        code: dbError.code,
        type: dbError.type,
        message: dbError.message,
        response: dbError.response
      })
      return NextResponse.json(
        { error: 'Failed to save API key to database' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
} 