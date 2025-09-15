import mongoose, { Schema, Document } from 'mongoose'

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId
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
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: String,
  endTime: String,
  isAllDay: {
    type: Boolean,
    default: false
  },
  isNoDuration: {
    type: Boolean,
    default: false
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: String,
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  }
}, {
  timestamps: true
})

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)
