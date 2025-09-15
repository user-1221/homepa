// app/api/memos/[id]/route.ts
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Memo from '@/models/Memo'
import { authenticateUser } from '@/lib/auth-middleware'

// PUT - Update a memo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request as any)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || '認証が必要です' },
        { status: 401 }
      )
    }

    // Await params
    const { id } = await params

    // Parse request body
    const body = await request.json()
    const { content, category, tags } = body

    // Validate required fields
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'メモの内容を入力してください' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Find and update the memo (ensure it belongs to the user)
    const updatedMemo = await Memo.findOneAndUpdate(
      { 
        _id: id, 
        userId: auth.user.id 
      },
      {
        content: content.trim(),
        category: category || 'general',
        tags: Array.isArray(tags) ? tags : []
      },
      { new: true, runValidators: true }
    )

    if (!updatedMemo) {
      return NextResponse.json(
        { error: 'メモが見つからないか、編集権限がありません' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedMemo)

  } catch (error: any) {
    console.error('Failed to update memo:', error)
    
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
      { error: 'メモの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a memo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request as any)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || '認証が必要です' },
        { status: 401 }
      )
    }

    // Await params
    const { id } = await params

    // Connect to MongoDB
    await dbConnect()

    // Find and delete the memo (ensure it belongs to the user)
    const deletedMemo = await Memo.findOneAndDelete({
      _id: id,
      userId: auth.user.id
    })

    if (!deletedMemo) {
      return NextResponse.json(
        { error: 'メモが見つからないか、削除権限がありません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'メモが削除されました' 
    })

  } catch (error: any) {
    console.error('Failed to delete memo:', error)
    
    // Handle connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return NextResponse.json(
        { error: 'データベース接続エラーが発生しました。しばらくしてからもう一度お試しください。' },
        { status: 503 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'メモの削除に失敗しました' },
      { status: 500 }
    )
  }
}
