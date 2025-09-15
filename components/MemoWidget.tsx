'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react'

interface Memo {
  _id: string
  content: string
  tags: string[]
  category: string
  createdAt: Date
  userId: string
  isProcessed: boolean
  extractedInfo?: {
    tasks: string[]
    events: string[]
    preferences?: any
  }
}

interface MemoWidgetProps {
  userId?: string
}

export default function MemoWidget({ userId }: MemoWidgetProps) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [newMemo, setNewMemo] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingMemo, setEditingMemo] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('general')

  // Load memos when component mounts
  useEffect(() => {
    loadMemos()
  }, [])

  const loadMemos = async () => {
    try {
      const res = await fetch('/api/memos')
      if (res.ok) {
        const data = await res.json()
        setMemos(data)
      } else {
        console.error('Failed to load memos')
      }
    } catch (error) {
      console.error('Failed to load memos:', error)
    }
  }

  const handleAddMemo = async () => {
    if (!newMemo.trim()) return

    setLoading(true)
    setError('')

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
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'メモの保存に失敗しました')
      }
    } catch (error) {
      console.error('Failed to add memo:', error)
      setError('メモの保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo._id)
    setEditContent(memo.content)
    setEditCategory(memo.category)
  }

  const handleSaveEdit = async () => {
    if (!editingMemo || !editContent.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/memos/${editingMemo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          category: editCategory,
          tags: []
        })
      })

      if (res.ok) {
        const updatedMemo = await res.json()
        setMemos(prev => prev.map(memo => 
          memo._id === editingMemo ? updatedMemo : memo
        ))
        setEditingMemo(null)
        setEditContent('')
        setEditCategory('general')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'メモの更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update memo:', error)
      setError('メモの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMemo = async (memoId: string) => {
    if (!confirm('このメモを削除しますか？')) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/memos/${memoId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMemos(prev => prev.filter(memo => memo._id !== memoId))
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'メモの削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete memo:', error)
      setError('メモの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingMemo(null)
    setEditContent('')
    setEditCategory('general')
    setError('')
  }

  // Simple, clean styling
  const containerClass = 'bg-white rounded-lg shadow-sm border p-6'
  const headerClass = 'text-lg font-semibold text-gray-900'
  const buttonClass = 'flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={headerClass}>メモ</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={buttonClass}
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
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
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
              disabled={loading}
              className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setError('')
                setNewMemo('')
              }}
              className="px-4 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {memos.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            メモがありません
          </p>
        ) : (
          memos.map((memo) => (
            <div key={memo._id} className="p-3 bg-gray-50 rounded-lg border">
              {editingMemo === memo._id ? (
                // Edit mode
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="general">一般</option>
                      <option value="work">仕事</option>
                      <option value="personal">個人</option>
                      <option value="idea">アイデア</option>
                    </select>
                    <button
                      onClick={handleSaveEdit}
                      disabled={loading}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <>
                  <p className="text-gray-800 mb-2">
                    {memo.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {memo.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditMemo(memo)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo._id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}