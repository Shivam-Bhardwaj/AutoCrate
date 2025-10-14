import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests?: number  // Maximum requests allowed in window
  windowMs?: number     // Time window in milliseconds
  identifier?: (req: NextRequest) => string  // Custom identifier function
  message?: string      // Custom error message
  skipSuccessfulRequests?: boolean  // Only count failed requests
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,        // 10 requests
  windowMs: 60 * 1000,    // per minute
  message: 'Too many requests, please try again later',
  skipSuccessfulRequests: false
}

/**
 * Rate limiter middleware for API routes
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function rateLimit(config: RateLimitConfig = {}) {
  const options = { ...DEFAULT_CONFIG, ...config }

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Get client identifier (IP address by default)
    const identifier = options.identifier
      ? options.identifier(request)
      : getClientIp(request)

    const now = Date.now()
    const key = `${request.nextUrl.pathname}:${identifier}`

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {  // 1% chance on each request
      cleanupExpiredEntries(now)
    }

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + options.windowMs!
      }
      rateLimitStore.set(key, entry)
    } else {
      // Increment counter
      entry.count++
    }

    // Check if rate limit exceeded
    if (entry.count > options.maxRequests!) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

      return NextResponse.json(
        {
          error: options.message,
          retryAfter: `${retryAfter} seconds`
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': options.maxRequests!.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
          }
        }
      )
    }

    // Process request
    const response = await handler(request)

    // Add rate limit headers to response
    const remaining = Math.max(0, options.maxRequests! - entry.count)
    response.headers.set('X-RateLimit-Limit', options.maxRequests!.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString())

    // If skipSuccessfulRequests is true and request was successful, decrement counter
    if (options.skipSuccessfulRequests && response.status < 400) {
      entry.count = Math.max(0, entry.count - 1)
    }

    return response
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Create rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authRateLimit = rateLimit({
  maxRequests: 5,           // 5 attempts
  windowMs: 15 * 60 * 1000,  // per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
  skipSuccessfulRequests: true  // Only count failed attempts
})

/**
 * Create rate limiter for general API endpoints
 */
export const apiRateLimit = rateLimit({
  maxRequests: 30,          // 30 requests
  windowMs: 60 * 1000,      // per minute
  message: 'API rate limit exceeded. Please slow down your requests.'
})

/**
 * Create rate limiter for expensive operations (STEP export, etc.)
 */
export const heavyRateLimit = rateLimit({
  maxRequests: 5,           // 5 requests
  windowMs: 5 * 60 * 1000,  // per 5 minutes
  message: 'This operation is resource-intensive. Please wait before trying again.'
})