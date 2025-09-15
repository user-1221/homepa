// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function authenticateUser(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')

    if (!userId) {
      return {
        authenticated: false,
        user: null,
        error: '認証が必要です'
      }
    }

    // Connect to MongoDB
    await dbConnect()

    // Find user by ID
    const user = await User.findById(userId.value).select('-password')
    
    if (!user) {
      // Clear invalid cookie
      cookieStore.delete('userId')
      return {
        authenticated: false,
        user: null,
        error: '無効なセッションです'
      }
    }

    return {
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      },
      error: null
    }

  } catch (error: any) {
    console.error('Auth middleware error:', error)
    return {
      authenticated: false,
      user: null,
      error: '認証エラーが発生しました'
    }
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const auth = await authenticateUser(request)
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    // Add user to request object
    (request as any).user = auth.user
    return handler(request, ...args)
  }
}
