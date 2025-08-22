import { NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { config } from '@/lib/config'
import { Query } from 'appwrite'

export async function GET() {
  try {
    const days = 14
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (days - 1))
    const startISO = start.toISOString()

    const result = await databases.listDocuments(
      config.appwrite.database.id,
      config.appwrite.database.collections.verificationSessions,
      [
        Query.greaterThanEqual('createdAt', startISO),
        Query.limit(1000),
        Query.offset(0),
        Query.orderAsc('createdAt')
      ]
    )

    const docs = result.documents as any[]

    const byDay: Record<string, { date: string; total: number; completed: number; failed: number }> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      byDay[key] = { date: key, total: 0, completed: 0, failed: 0 }
    }

    docs.forEach((d: any) => {
      const key = new Date(d.createdAt || d.$createdAt).toISOString().slice(0, 10)
      if (!byDay[key]) return
      byDay[key].total += 1
      if (d.status === 'completed') byDay[key].completed += 1
      if (d.status === 'failed') byDay[key].failed += 1
    })

    return NextResponse.json({ success: true, series: Object.values(byDay) })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 })
  }
}


