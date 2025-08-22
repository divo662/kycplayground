import crypto from 'crypto'

export function signWebhookPayload(payload: any, secret: string, timestamp?: number): string {
  const ts = timestamp || Date.now()
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
  const base = `t=${ts}.${body}`
  const hmac = crypto.createHmac('sha256', secret).update(base).digest('hex')
  return `t=${ts},v1=${hmac}`
}

export function encryptField(plain: string): string {
  const key = (process.env.ENCRYPTION_KEY || '').slice(0, 32).padEnd(32, '0')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptField(encb64: string): string {
  try {
    const buf = Buffer.from(encb64, 'base64')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const enc = buf.subarray(28)
    const key = (process.env.ENCRYPTION_KEY || '').slice(0, 32).padEnd(32, '0')
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv)
    decipher.setAuthTag(tag)
    const dec = Buffer.concat([decipher.update(enc), decipher.final()])
    return dec.toString('utf8')
  } catch {
    return encb64
  }
}


