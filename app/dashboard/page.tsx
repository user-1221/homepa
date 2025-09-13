'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import EventForm from '@/components/EventForm'
import TrainSuggestion from '@/components/TrainSuggestion'
import { Event } from '@/types'
import { LogOut, Plus } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [currentLocation] = useState('東京駅') // 仮の位置情報

  useEffect(() => {
    // ユーザー確認
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleEventCreate = async (eventData: Partial<Event>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          userId: user.id
        })
      })

      if (res.ok) {
        const newEvent = await res.json()
        setEvents([...events, newEvent])
        setShowEventForm(false)
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HomePA カレンダー</h1>
              <p className="text-sm text-gray-600">
                ようこそ、{user?.name}さん | 現在地: {currentLocation}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                予定を追加
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-2">
            <Calendar
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 今日の予定と電車提案 */}
            <TrainSuggestion
              events={todayEvents}
              currentLocation={currentLocation}
            />
          </div>
        </div>
      </main>

      {/* イベント作成フォーム */}
      {showEventForm && (
        <EventForm
          onClose={() => setShowEventForm(false)}
          onSubmit={handleEventCreate}
          initialDate={selectedDate}
        />
      )}
    </div>
  )
}