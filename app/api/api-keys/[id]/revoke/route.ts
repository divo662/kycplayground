import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite-server'
import { config } from '@/lib/config'

const DATABASE_ID = config.appwrite.database.id
const COLLECTION_ID = (config.appwrite.database.collections as any).apiKeys || 'collection-api_keys'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, params.id, {
      isActive: false,
      revokedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, id: updated.$id })
  } catch (error) {
    console.error('Revoke API key error:', error)
    return NextResponse.json({ success: false, error: 'Failed to revoke API key' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}


