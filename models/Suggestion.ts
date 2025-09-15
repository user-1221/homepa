import mongoose, { Schema, Document } from 'mongoose'

export interface ISuggestion extends Document {
  userId: mongoose.Types.ObjectId
  type: 'universal' | 'train' | 'task' | 'event'
  content: string
  context: {
    source: string[]  // ['memo', 'calendar', 'location', 'routine']
    confidence: number
    timestamp: Date
  }
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  metadata?: Map<string, any>
  createdAt: Date
  updatedAt: Date
}

const SuggestionSchema = new Schema<ISuggestion>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['universal', 'train', 'task', 'event'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  context: {
    source: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

export default mongoose.models.Suggestion || mongoose.model<ISuggestion>('Suggestion', SuggestionSchema)
