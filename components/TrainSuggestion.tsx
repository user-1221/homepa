'use client'

import { Train, Clock, MapPin, AlertCircle } from 'lucide-react'
import { Event } from '@/types'
import { format } from 'date-fns'

interface TrainSuggestionProps {
  events: Event[]
  currentLocation: string
}

export default function TrainSuggestion({ events, currentLocation }: TrainSuggestionProps) {
  // 重要度に基づく到着時間の計算
  const calculateArrivalTime = (event: Event) => {
    if (!event.startTime || !event.location) return null

    const bufferMinutes = {
      critical: 30,  // 30分前に到着
      high: 20,      // 20分前に到着
      medium: 10,    // 10分前に到着
      low: 5         // 5分前に到着
    }

    const [hours, minutes] = event.startTime.split(':').map(Number)
    const eventTime = new Date()
    eventTime.setHours(hours, minutes, 0, 0)
    
    const buffer = bufferMinutes[event.importance]
    const arrivalTime = new Date(eventTime.getTime() - buffer * 60000)
    
    return arrivalTime
  }

  // 電車の提案を生成（実際のAPIが使えるまでのモック）
  const generateTrainSuggestion = (event: Event) => {
    const arrivalTime = calculateArrivalTime(event)
    if (!arrivalTime) return null

    // 仮の移動時間（実際はAPIで計算）
    const travelTime = 30 // 30分と仮定
    const departureTime = new Date(arrivalTime.getTime() - travelTime * 60000)

    return {
      event,
      departureTime: format(departureTime, 'HH:mm'),
      arrivalTime: format(arrivalTime, 'HH:mm'),
      suggestedTrain: {
        line: 'JR山手線',
        platform: '3番線',
        duration: travelTime
      }
    }
  }

  // 場所のあるイベントのみフィルタリング
  const eventsWithLocation = events.filter(e => e.location && e.startTime)
  const trainSuggestions = eventsWithLocation.map(generateTrainSuggestion).filter(Boolean)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Train className="w-5 h-5" />
        電車の提案
      </h2>

      {trainSuggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Train className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>今日は電車での移動予定がありません</p>
          <p className="text-sm mt-2">場所が設定された予定がある場合、ここに表示されます</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-900 mb-1">
              <MapPin className="w-4 h-4" />
              現在地: {currentLocation}
            </div>
          </div>

          {trainSuggestions.map((suggestion, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{suggestion!.event.title}</h3>
                  <p className="text-sm text-gray-600">
                    📍 {suggestion!.event.location}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${
                  suggestion!.event.importance === 'critical' ? 'bg-red-500' :
                  suggestion!.event.importance === 'high' ? 'bg-orange-500' :
                  suggestion!.event.importance === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}>
                  {suggestion!.event.importance === 'critical' && '最重要'}
                  {suggestion!.event.importance === 'high' && '重要'}
                  {suggestion!.event.importance === 'medium' && '普通'}
                  {suggestion!.event.importance === 'low' && '低'}
                </span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  <Clock className="w-4 h-4" />
                  推奨出発時刻: {suggestion!.departureTime}
                </div>
                <div className="text-sm text-gray-700">
                  <p>🚃 {suggestion!.suggestedTrain.line} - {suggestion!.suggestedTrain.platform}</p>
                  <p>⏱️ 移動時間: 約{suggestion!.suggestedTrain.duration}分</p>
                  <p>🎯 到着予定: {suggestion!.arrivalTime}</p>
                </div>
              </div>

              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                イベント開始の{
                  suggestion!.event.importance === 'critical' ? '30分前' :
                  suggestion!.event.importance === 'high' ? '20分前' :
                  suggestion!.event.importance === 'medium' ? '10分前' :
                  '5分前'
                }に到着予定
              </div>
            </div>
          ))}

          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            ※ 公共交通オープンデータセンターAPI接続待機中
          </div>
        </div>
      )}
    </div>
  )
}