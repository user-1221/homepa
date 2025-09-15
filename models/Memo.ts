import mongoose, { Schema, Document } from 'mongoose'

export interface IMemo extends Document {
  userId: mongoose.Types.ObjectId
  content: string
  tags: string[]
  category: string
  isProcessed: boolean
  extractedInfo?: {
    tasks?: string[]
    events?: string[]
    preferences?: Map<string, any>
  }
  createdAt: Date
  updatedAt: Date
}

const MemoSchema = new Schema<IMemo>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [String],
  category: {
    type: String,
    default: 'general'
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  extractedInfo: {
    tasks: [String],
    events: [String],
    preferences: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }
}, {
  timestamps: true
})

export default mongoose.models.Memo || mongoose.model<IMemo>('Memo', MemoSchema)
