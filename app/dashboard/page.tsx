'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import EventForm from '@/components/EventForm'
import TrainSuggestion from '@/components/TrainSuggestion'
import MemoWidget from '@/components/MemoWidget'
import UniversalSuggestionBox from '@/components/UniversalSuggestionBox'
import PersonalInfoIndicator from '@/components/PersonalInfoIndicator'
import { Event } from '@/types'
import { LogOut, Plus, LayoutGrid, Settings } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [currentLocation] = useState('東京駅')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Check authentication
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

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear client-side storage regardless of API call result
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  const handleEventCreate = async (eventData: Partial<Event>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HomePA Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                {user?.name}さん | 📍 {currentLocation}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                イベント追加
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className={`${layoutMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'space-y-6'}`}>
          {/* Left Column - Calendar & Train Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            <Calendar
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <TrainSuggestion
              events={todayEvents}
              currentLocation={currentLocation}
            />
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            {/* Universal Suggestion Box */}
            <UniversalSuggestionBox />
            
            {/* Memo Widget */}
            <MemoWidget />
            
            {/* Personal Info Indicator */}
            <PersonalInfoIndicator />
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <EventForm
              initialDate={selectedDate}
              onSubmit={handleEventCreate}
              onClose={() => setShowEventForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Add animations to globals.css
/*
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
*/