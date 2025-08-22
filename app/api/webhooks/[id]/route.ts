import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { config } from '@/lib/config'

const DATABASE_ID = config.appwrite.database.id
const COLLECTION_ID = 'webhook_configs'

function normalizeWebhook(doc: any) {
  return {
    $id: doc.$id,
    name: doc.name,
    webhookUrl: doc.webhookUrl,
    events: typeof doc.events === 'string'
      ? (() => { try { return JSON.parse(doc.events) } catch { return [] } })()
      : (Array.isArray(doc.events) ? doc.events : []),
    isActive: !!doc.isActive,
    lastTriggered: doc.lastTriggered || undefined,
    createdAt: doc.$createdAt || doc.createdAt,
    updatedAt: doc.$updatedAt || doc.updatedAt,
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, webhookUrl, events, isActive } = body || {}

    const current = await databases.getDocument(DATABASE_ID, COLLECTION_ID, params.id)

    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      params.id,
      {
        name: name ?? current.name,
        webhookUrl: webhookUrl ?? current.webhookUrl,
        events: events ? JSON.stringify(Array.isArray(events) ? events : [String(events)]) : current.events,
        isActive: isActive ?? current.isActive,
        updatedAt: new Date().toISOString(),
      }
    )

    return NextResponse.json({ success: true, webhook: normalizeWebhook(updated) })
  } catch (error: any) {
    console.error('Error updating webhook:', error)
    return NextResponse.json({ success: false, error: 'Failed to update webhook' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await databases.getDocument(DATABASE_ID, COLLECTION_ID, params.id)

    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, params.id)
    return NextResponse.json({ success: true, id: params.id })
  } catch (error: any) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete webhook' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}


