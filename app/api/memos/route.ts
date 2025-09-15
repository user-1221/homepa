// app/api/memos/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Memo from '@/models/Memo'
import { authenticateUser } from '@/lib/auth-middleware'

// GET - Fetch all memos for the authenticated user
export async function GET(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request as any)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || '認証が必要です' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Find all memos for the user
    const memos = await Memo.find({ userId: auth.user.id })
      .sort({ createdAt: -1 }) // Most recent first

    return NextResponse.json(memos)

  } catch (error: any) {
    console.error('Failed to fetch memos:', error)
    return NextResponse.json(
      { error: 'メモの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST - Create a new memo
export async function POST(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request as any)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || '認証が必要です' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { content, category = 'general', tags = [] } = body

    // Validate required fields
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'メモの内容を入力してください' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Create new memo
    const newMemo = await Memo.create({
      userId: auth.user.id,
      content: content.trim(),
      category,
      tags: Array.isArray(tags) ? tags : []
    })

    return NextResponse.json(newMemo, { status: 201 })

  } catch (error: any) {
    console.error('Failed to create memo:', error)
    
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
      { error: 'メモの保存に失敗しました' },
      { status: 500 }
    )
  }
}
