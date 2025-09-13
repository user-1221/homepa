import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'

// 仮のユーザーストレージ（registerと共有）
declare const users: any[]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // ユーザーを検索
    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    // パスワードを検証
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    // セッションクッキーを設定
    cookies().set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1週間
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}