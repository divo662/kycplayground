import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function createSignature(fileId: string, exp: number, secret: string) {
  const base = `${fileId}.${exp}`
  return crypto.createHmac('sha256', secret).update(base).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileUrl, ttlSeconds } = await request.json()
    if (!fileId && !fileUrl) {
      return NextResponse.json({ success: false, error: 'fileId or fileUrl required' }, { status: 400 })
    }
    const parts = String(fileUrl).split('/').filter((p: string) => p && p !== 'view')
    const id = fileId || (parts.length > 0 ? parts[parts.length - 1] : '') || ''
    if (!id) return NextResponse.json({ success: false, error: 'Unable to determine fileId' }, { status: 400 })
    const ttl = Math.max(30, Math.min(3600, Number(ttlSeconds) || 300))
    const exp = Math.floor(Date.now() / 1000) + ttl
    const secret = process.env.SIGNED_URL_SECRET || process.env.ENCRYPTION_KEY || (process.env.NODE_ENV === 'development' ? 'dev-secret' : 'fallback-secret')
    const sig = createSignature(id, exp, secret)
    const url = `/api/files/view?fileId=${encodeURIComponent(id)}&exp=${exp}&sig=${sig}`
    return NextResponse.json({ success: true, url, expiresIn: ttl })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to sign URL' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}


