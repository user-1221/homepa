'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Clock, Settings } from 'lucide-react'

interface PersonalInfo {
  preferences: Record<string, any>
  dailyRoutine: string[]
  locations: {
    home?: string
    work?: string
    frequentPlaces: string[]
  }
}

interface PersonalInfoIndicatorProps {
  userId?: string
}

export default function PersonalInfoIndicator({ userId }: PersonalInfoIndicatorProps) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    preferences: {},
    dailyRoutine: [],
    locations: {
      home: '',
      work: '',
      frequentPlaces: []
    }
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Load personal info from user data
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.personalInfo) {
          setPersonalInfo(user.personalInfo)
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [])

  const getInfoCompleteness = () => {
    let completed = 0
    let total = 0

    // Check locations
    total += 2
    if (personalInfo.locations.home) completed++
    if (personalInfo.locations.work) completed++

    // Check routine
    total += 1
    if (personalInfo.dailyRoutine.length > 0) completed++

    // Check preferences
    total += 1
    if (Object.keys(personalInfo.preferences).length > 0) completed++

    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const completeness = getInfoCompleteness()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">個人情報</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">情報の完成度</span>
          <span className="text-sm font-medium text-gray-900">
            {completeness.completed}/{completeness.total} ({completeness.percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">自宅:</span>
          <span className="text-gray-900">
            {personalInfo.locations.home || '未設定'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">職場:</span>
          <span className="text-gray-900">
            {personalInfo.locations.work || '未設定'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">ルーチン:</span>
          <span className="text-gray-900">
            {personalInfo.dailyRoutine.length}件
          </span>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">詳細情報</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自宅住所
              </label>
              <input
                type="text"
                value={personalInfo.locations.home || ''}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  locations: { ...prev.locations, home: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="自宅住所を入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                職場住所
              </label>
              <input
                type="text"
                value={personalInfo.locations.work || ''}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  locations: { ...prev.locations, work: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="職場住所を入力"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
