'use client'

import { useState } from 'react'
import { Lightbulb, Check, X, Clock } from 'lucide-react'

interface Suggestion {
  id: string
  type: 'universal' | 'train' | 'task' | 'event'
  content: string
  context: {
    source: string[]
    confidence: number
    timestamp: Date
  }
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
}

interface UniversalSuggestionBoxProps {
  userId?: string
}

export default function UniversalSuggestionBox({ userId }: UniversalSuggestionBoxProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  const handleSuggestionAction = async (suggestionId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' })
      })

      if (res.ok) {
        setSuggestions(prev => 
          prev.map(s => 
            s.id === suggestionId 
              ? { ...s, status: action === 'accept' ? 'accepted' : 'rejected' }
              : s
          )
        )
      }
    } catch (error) {
      console.error('Failed to update suggestion:', error)
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'train': return '🚊'
      case 'task': return '📝'
      case 'event': return '📅'
      default: return '💡'
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'train': return 'bg-blue-100 text-blue-800'
      case 'task': return 'bg-green-100 text-green-800'
      case 'event': return 'bg-purple-100 text-purple-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">AI提案</h3>
      </div>

      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">新しい提案はありません</p>
            <p className="text-sm text-gray-400 mt-1">
              メモや予定を追加すると、AIが提案を生成します
            </p>
          </div>
        ) : (
          suggestions
            .filter(s => s.status === 'pending')
            .map((suggestion) => (
              <div key={suggestion.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSuggestionColor(suggestion.type)}`}>
                        {suggestion.type === 'train' ? '電車' : 
                         suggestion.type === 'task' ? 'タスク' :
                         suggestion.type === 'event' ? 'イベント' : '提案'}
                      </span>
                      <span className="text-xs text-gray-500">
                        信頼度: {Math.round(suggestion.context.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-gray-800 mb-3">{suggestion.content}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Check className="w-3 h-3" />
                        採用
                      </button>
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        <X className="w-3 h-3" />
                        却下
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
