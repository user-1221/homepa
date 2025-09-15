'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

interface Memo {
  id: string
  content: string
  tags: string[]
  category: string
  createdAt: Date
}

interface MemoWidgetProps {
  userId?: string
}

export default function MemoWidget({ userId }: MemoWidgetProps) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [newMemo, setNewMemo] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [showForm, setShowForm] = useState(false)

  const handleAddMemo = async () => {
    if (!newMemo.trim()) return

    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMemo,
          category: selectedCategory,
          tags: []
        })
      })

      if (res.ok) {
        const memo = await res.json()
        setMemos(prev => [...prev, memo])
        setNewMemo('')
        setShowForm(false)
      }
    } catch (error) {
      console.error('Failed to add memo:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">メモ</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <textarea
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="メモを入力してください..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="general">一般</option>
              <option value="work">仕事</option>
              <option value="personal">個人</option>
              <option value="idea">アイデア</option>
            </select>
            <button
              onClick={handleAddMemo}
              className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {memos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">メモがありません</p>
        ) : (
          memos.map((memo) => (
            <div key={memo.id} className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-800 mb-2">{memo.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {memo.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 text-gray-400 hover:text-blue-500">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
