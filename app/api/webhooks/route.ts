import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { config } from '@/lib/config'
import { rateLimitMiddleware } from '@/lib/security'
import { ID, Query } from 'appwrite'

const DATABASE_ID = config.appwrite.database.id
// Use existing collection id from your schema
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

// GET /api/webhooks - list user's webhooks
export async function GET(request: NextRequest) {
  try {
    const rate = rateLimitMiddleware(request)
    if (rate) return rate

    // Derive userId (from API key or session; for now use demo_user as elsewhere)
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID
    )

    const webhooks = res.documents.map(normalizeWebhook)
    return NextResponse.json({ success: true, webhooks })
  } catch (error: any) {
    console.error('Error listing webhooks:', error)
    return NextResponse.json({ success: false, error: 'Failed to list webhooks' }, { status: 500 })
  }
}

// POST /api/webhooks - create webhook
export async function POST(request: NextRequest) {
  try {
    const rate = rateLimitMiddleware(request)
    if (rate) return rate

    const body = await request.json()
    const { name, webhookUrl, events = ['verification.completed', 'verification.failed'], isActive = true } = body || {}

    if (!name || !webhookUrl) {
      return NextResponse.json({ success: false, error: 'name and webhookUrl are required' }, { status: 400 })
    }

    const created = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        name,
        webhookUrl,
        // stored as string attribute in your schema
        events: JSON.stringify(Array.isArray(events) ? events : [String(events)]),
        isActive: !!isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    )

    return NextResponse.json({ success: true, webhook: normalizeWebhook(created) })
  } catch (error: any) {
    console.error('Error creating webhook:', error)
    return NextResponse.json({ success: false, error: 'Failed to create webhook' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}


