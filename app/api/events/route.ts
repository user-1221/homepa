import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 仮のイベントストレージ（本番ではデータベース使用）
const events: any[] = []

export async function GET() {
  const userId = cookies().get('userId')?.value
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEvents = events.filter(e => e.userId === userId)
  return NextResponse.json(userEvents)
}

export async function POST(request: Request) {
  const userId = cookies().get('userId')?.value
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventData = await request.json()
  const event = {
    id: Date.now().toString(),
    ...eventData,
    userId,
    createdAt: new Date()
  }

  events.push(event)
  return NextResponse.json(event)
}