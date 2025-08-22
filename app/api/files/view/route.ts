import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { storage } from '@/lib/appwrite'
import { DOCUMENTS_BUCKET_ID } from '@/lib/appwrite-service'

function verifySignature(fileId: string, exp: number, sig: string, secret: string) {
  const base = `${fileId}.${exp}`
  const expected = crypto.createHmac('sha256', secret).update(base).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId') || ''
    const exp = Number(searchParams.get('exp') || 0)
    const sig = searchParams.get('sig') || ''
    if (!fileId || !exp || !sig) return NextResponse.json({ error: 'Invalid link' }, { status: 400 })
    if (Math.floor(Date.now() / 1000) > exp) return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    const secret = process.env.SIGNED_URL_SECRET || process.env.ENCRYPTION_KEY || process.env.NODE_ENV === 'development' ? 'dev-secret' : null
    if (!verifySignature(fileId, exp, sig, secret)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

    // Redirect to Appwrite file view URL (no permanent leak because this route guards access)
    const viewUrl = storage.getFileView(DOCUMENTS_BUCKET_ID, fileId)
    return NextResponse.redirect(viewUrl, { status: 302 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}


