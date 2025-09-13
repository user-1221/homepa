'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { X, Calendar, Clock, MapPin, Flag, Repeat } from 'lucide-react'
import { Event } from '@/types'

interface EventFormProps {
  onClose: () => void
  onSubmit: (event: Partial<Event>) => void
  initialDate: Date
}

export default function EventForm({ onClose, onSubmit, initialDate }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: format(initialDate, 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    isAllDay: false,
    isNoDuration: false,
    importance: 'medium' as Event['importance'],
    location: '',
    recurrence: 'none' as Event['recurrence']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">新しい予定</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              イベント名 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="会議、病院、買い物など"
            />
          </div>

          {/* 日付 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4" />
              日付 *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 時間オプション */}
          <div className="space-y-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isAllDay: e.target.checked,
                    isNoDuration: false
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">終日</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNoDuration}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isNoDuration: e.target.checked,
                    isAllDay: false
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">時間指定なし</span>
              </label>
            </div>

            {!formData.isAllDay && !formData.isNoDuration && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4" />
                    開始時刻
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4" />
                    終了時刻
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 重要度 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Flag className="w-4 h-4" />
              重要度 *
            </label>
            <select
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value as Event['importance'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="low">低（遅れても大丈夫）</option>
              <option value="medium">普通（できれば時間通り）</option>
              <option value="high">高（時間厳守）</option>
              <option value="critical">最重要（絶対に遅れられない）</option>
            </select>
          </div>

          {/* 場所 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4" />
              場所（オプション）
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 品川駅、東京ドーム"
            />
          </div>

          {/* 繰り返し */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Repeat className="w-4 h-4" />
              繰り返し
            </label>
            <select
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as Event['recurrence'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">なし</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}