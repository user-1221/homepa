// lib/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/homepa'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Fix: Properly type the global cache
declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

let cached = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect

// models/User.ts
import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  name: string
  password: string
  personalInfo: {
    preferences: Map<string, any>
    dailyRoutine: string[]
    locations: {
      home?: string
      work?: string
      frequentPlaces: string[]
    }
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  personalInfo: {
    preferences: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map()
    },
    dailyRoutine: [String],
    locations: {
      home: String,
      work: String,
      frequentPlaces: [String]
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

// models/Memo.ts
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

// models/Suggestion.ts
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