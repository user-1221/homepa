export interface User {
  id: string
  email: string
  name: string
  password?: string
}

export interface Event {
  id: string
  userId: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  isAllDay: boolean
  isNoDuration: boolean
  importance: 'low' | 'medium' | 'high' | 'critical'
  location?: string
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
  createdAt: Date
}

export interface TrainSuggestion {
  departureTime: string
  arrivalTime: string
  line: string
  platform?: string
  duration: number
}