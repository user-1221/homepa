import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'
import { authenticateUser } from '@/lib/auth-middleware'

export async function GET() {
  try {
    // Authenticate user
    const auth = await authenticateUser({} as any)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || '認証が必要です' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Find all events for the user
    const events = await Event.find({ userId: auth.user.id })
      .sort({ date: 1, startTime: 1 }) // Sort by date and time

    return NextResponse.json(events)

  } catch (error: any) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser({} as any)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || '認証が必要です' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, date, startTime, endTime, isAllDay, isNoDuration, importance, location, recurrence } = body

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { error: 'タイトルと日付は必須です' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Create new event
    const newEvent = await Event.create({
      userId: auth.user.id,
      title: title.trim(),
      date,
      startTime,
      endTime,
      isAllDay: isAllDay || false,
      isNoDuration: isNoDuration || false,
      importance: importance || 'medium',
      location,
      recurrence: recurrence || 'none'
    })

    return NextResponse.json(newEvent, { status: 201 })

  } catch (error: any) {
    console.error('Failed to create event:', error)
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      )
    }

    // Handle connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return NextResponse.json(
        { error: 'データベース接続エラーが発生しました。しばらくしてからもう一度お試しください。' },
        { status: 503 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'イベントの保存に失敗しました' },
      { status: 500 }
    )
  }
}