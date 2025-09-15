// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { rateLimit } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const rateLimitResult = rateLimit(5, 15 * 60 * 1000)(request as any)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'ログイン試行回数が上限に達しました。しばらくしてからもう一度お試しください。' },
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
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください' },
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

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() })
    
    // Check if user exists
    if (!user) {
      // Use the same error message for security (don't reveal if email exists)
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    // Verify password using the comparePassword method from the User model
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      // Use the same error message for security
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', user._id.toString(), {
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
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Login error:', error)
    
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

// Optional: Add GET method to check authentication status
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')

    if (!userId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await dbConnect()

    // Find user by ID
    const user = await User.findById(userId.value).select('-password')
    
    if (!user) {
      // Clear invalid cookie
      const cookieStore = await cookies()
      cookieStore.delete('userId')
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}