// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    
    return NextResponse.json({
      success: true,
      message: 'ログアウトしました'
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'ログアウト中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
