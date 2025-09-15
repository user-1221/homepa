// lib/rate-limiter.ts
import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  keyGenerator?: (request: NextRequest) => string
) {
  return (request: NextRequest) => {
    const key = keyGenerator 
      ? keyGenerator(request) 
      : request.ip || 'unknown'
    
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
    
    // Get or create entry for this key
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      }
    }
    
    // Increment count
    store[key].count++
    
    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: store[key].resetTime
      }
    }
    
    return {
      allowed: true,
      remaining: maxRequests - store[key].count,
      resetTime: store[key].resetTime
    }
  }
}
