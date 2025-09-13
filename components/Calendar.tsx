'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Event } from '@/types'

interface CalendarProps {
  events: Event[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function Calendar({ events, selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 月の最初の日の曜日に合わせて空白を追加
  const startDayOfWeek = getDay(monthStart)
  const emptyDays = Array(startDayOfWeek).fill(null)

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return isSameDay(eventDate, day)
    })
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* カレンダーヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentMonth, 'yyyy年 M月', { locale: ja })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            今日
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 空白の日 */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-24" />
        ))}
        
        {/* 実際の日付 */}
        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`
                h-24 p-2 border rounded-lg cursor-pointer transition
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                ${isToday ? 'bg-yellow-50' : ''}
                ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs bg-gray-200 px-1 rounded">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              {/* イベント表示（最大3件） */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={event.id}
                    className="text-xs truncate flex items-center gap-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${getImportanceColor(event.importance)}`} />
                    <span>{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 3}件
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 選択日の予定詳細 */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-medium text-gray-900 mb-3">
          {format(selectedDate, 'M月d日(E)', { locale: ja })}の予定
        </h3>
        <div className="space-y-2">
          {getEventsForDay(selectedDate).map(event => (
            <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  {!event.isAllDay && event.startTime && (
                    <p className="text-sm text-gray-600">
                      {event.startTime} {event.endTime && `- ${event.endTime}`}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-500">📍 {event.location}</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs text-white ${getImportanceColor(event.importance)}`}>
                  {event.importance === 'critical' && '最重要'}
                  {event.importance === 'high' && '重要'}
                  {event.importance === 'medium' && '普通'}
                  {event.importance === 'low' && '低'}
                </div>
              </div>
            </div>
          ))}
          {getEventsForDay(selectedDate).length === 0 && (
            <p className="text-gray-500 text-sm">予定はありません</p>
          )}
        </div>
      </div>
    </div>
  )
}