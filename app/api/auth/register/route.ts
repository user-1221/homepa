// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { rateLimit } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    // Rate limiting: more lenient in development
    const maxRequests = process.env.NODE_ENV === 'development' ? 10 : 3
    const windowMs = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000 // 5 min in dev, 15 min in prod
    const rateLimitResult = rateLimit(maxRequests, windowMs)(request as any)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: '登録試行回数が上限に達しました。しばらくしてからもう一度お試しください。' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Parse request body
    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // Enhanced password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      )
    }
    
    // Check for at least one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'パスワードは大文字、小文字、数字を含む必要があります' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      )
    }

    // Create new user (password will be hashed automatically by the pre-save hook in the model)
    const newUser = await User.create({
      email: email.toLowerCase(),
      name: name.trim(),
      password: password,
      personalInfo: {
        preferences: new Map(),
        dailyRoutine: [],
        locations: {
          home: '',
          work: '',
          frequentPlaces: []
        }
      }
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', newUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle MongoDB duplicate key error (in case of race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      )
    }
    
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
      { error: 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。' },
      { status: 500 }
    )
  }
}