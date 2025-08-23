import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'

const DATABASE_ID = config.appwrite.database.id
const COLLECTION_ID = (config.appwrite.database.collections as any).apiKeys || 'collection-api_keys'

function generateApiKey(): string {
  const prefix = 'kyc_'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `${prefix}${timestamp}_${random}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const current = await databases.getDocument(DATABASE_ID, COLLECTION_ID, params.id)

    // Create new key with same name + "(rotated)" and same permissions
    const newKey = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      'unique()',
      {
        userId: current.userId,
        name: `${current.name} (rotated ${new Date().toISOString().slice(0,10)})`,
        key: generateApiKey(),
        permissions: current.permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsed: null
      }
    )

    // Revoke old key (keep record with isActive=false)
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, params.id, {
      isActive: false,
      revokedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      rotatedFrom: params.id,
      apiKey: {
        id: newKey.$id,
        userId: newKey.userId,
        name: newKey.name,
        key: newKey.key,
        prefix: (newKey.key as string).slice(0,8),
        permissions: typeof newKey.permissions === 'string' ? JSON.parse(newKey.permissions as string) : newKey.permissions,
        isActive: newKey.isActive,
        createdAt: newKey.$createdAt,
        updatedAt: newKey.$updatedAt
      }
    })
  } catch (error) {
    console.error('Rotate API key error:', error)
    return NextResponse.json({ success: false, error: 'Failed to rotate API key' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}


