import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/security'
import { databases } from '@/lib/appwrite'
import { config } from '@/lib/config'

const DATABASE_ID = config.appwrite.database.id
const COLLECTION_ID = (config.appwrite.database.collections as any).apiKeys || 'collection-api_keys'

// PUT /api/api-keys/[id] - Update API key
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔑 PUT /api/api-keys/${params.id} - Updating API key in database`)
    
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request)
    if (rateLimitResult) {
      console.log('🚫 Rate limit blocked request')
      return rateLimitResult
    }
    
    const body = await request.json()
    const { name, permissions, isActive } = body
    
    // TODO: Get user ID from authentication and verify ownership
    const userId = 'demo_user' // Replace with actual user ID from auth
    
    try {
      // Get the current API key to verify ownership
      const currentKey = await databases.getDocument(DATABASE_ID, COLLECTION_ID, params.id)
      
      if (currentKey.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      
      // Update the API key in database
      const updatedApiKey = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        params.id,
        {
          name: name || currentKey.name,
          permissions: permissions ? JSON.stringify(permissions) : currentKey.permissions, // Convert to JSON string
          isActive: isActive !== undefined ? isActive : currentKey.isActive
        }
      )
      
      console.log(`✅ API key updated in database: ${updatedApiKey.name}`)
      
      // Normalize response
      const parsedApiKey = {
        id: updatedApiKey.$id,
        userId: updatedApiKey.userId,
        name: updatedApiKey.name,
        key: updatedApiKey.key,
        prefix: (updatedApiKey.key as string).slice(0, 8),
        permissions: typeof updatedApiKey.permissions === 'string' ? JSON.parse(updatedApiKey.permissions as string) : updatedApiKey.permissions,
        isActive: updatedApiKey.isActive,
        createdAt: updatedApiKey.$createdAt,
        updatedAt: updatedApiKey.$updatedAt,
        lastUsed: updatedApiKey.lastUsed || undefined
      }
      
      return NextResponse.json({
        success: true,
        apiKey: parsedApiKey
      })
      
    } catch (dbError: any) {
      if (dbError.code === 404) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update API key in database' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    )
  }
}

// DELETE /api/api-keys/[id] - Delete API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔑 DELETE /api/api-keys/${params.id} - Deleting API key from database`)
    
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request)
    if (rateLimitResult) {
      console.log('🚫 Rate limit blocked request')
      return rateLimitResult
    }
    
    // TODO: Get user ID from authentication and verify ownership
    const userId = 'demo_user' // Replace with actual user ID from auth
    
    try {
      // Get the current API key to verify ownership
      const currentKey = await databases.getDocument(DATABASE_ID, COLLECTION_ID, params.id)
      
      if (currentKey.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      
      // Delete the API key from database
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, params.id)
      
      console.log(`✅ API key deleted from database: ${currentKey.name}`)
      
      return NextResponse.json({
        success: true,
        id: params.id
      })
      
    } catch (dbError: any) {
      if (dbError.code === 404) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to delete API key from database' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
} 