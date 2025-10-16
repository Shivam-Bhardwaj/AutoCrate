import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, authRateLimit, apiRateLimit, heavyRateLimit } from '../rate-limiter'

// Mock handler that returns success
const mockHandler = jest.fn(async (req: NextRequest) => {
  return NextResponse.json({ success: true })
})

// Mock handler that returns error
const mockErrorHandler = jest.fn(async (req: NextRequest) => {
  return NextResponse.json({ error: 'test error' }, { status: 400 })
})

// Helper to create mock NextRequest
function createMockRequest(pathname: string = '/api/test', ip: string = '192.168.1.1'): NextRequest {
  return {
    nextUrl: { pathname },
    headers: new Map([['x-forwarded-for', ip]]) as any,
    url: `http://localhost${pathname}`
  } as NextRequest
}

describe('rateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear rate limit store between tests
    jest.resetModules()
  })

  it('should allow requests within limit', async () => {
    const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 })
    const req = createMockRequest()

    const response = await limiter(req, mockHandler)

    expect(response.status).toBe(200)
    expect(mockHandler).toHaveBeenCalledWith(req)
  })

  it('should add rate limit headers to response', async () => {
    const limiter = rateLimit({ maxRequests: 10, windowMs: 60000 })
    const req = createMockRequest()

    const response = await limiter(req, mockHandler)

    expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
    expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })

  it('should block requests exceeding limit', async () => {
    const limiter = rateLimit({ maxRequests: 2, windowMs: 60000 })
    const req = createMockRequest()

    // Make 2 successful requests
    await limiter(req, mockHandler)
    await limiter(req, mockHandler)

    // Third request should be blocked
    const response = await limiter(req, mockHandler)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeTruthy()
    expect(mockHandler).toHaveBeenCalledTimes(2) // Should not call handler for 3rd request
  })

  it('should return 429 error with proper message', async () => {
    const limiter = rateLimit({
      maxRequests: 1,
      windowMs: 60000,
      message: 'Custom rate limit message'
    })
    const req = createMockRequest()

    await limiter(req, mockHandler) // First request
    const response = await limiter(req, mockHandler) // Second request (blocked)

    const data = await response.json()
    expect(data.error).toBe('Custom rate limit message')
    expect(data.retryAfter).toBeTruthy()
  })

  it('should use custom identifier function', async () => {
    const customIdentifier = (req: NextRequest) => 'custom-id'
    const limiter = rateLimit({
      maxRequests: 1,
      windowMs: 60000,
      identifier: customIdentifier
    })

    const req1 = createMockRequest('/api/test', '192.168.1.1')
    const req2 = createMockRequest('/api/test', '192.168.1.2') // Different IP

    await limiter(req1, mockHandler)
    const response = await limiter(req2, mockHandler)

    // Should be blocked even with different IP because custom identifier returns same ID
    expect(response.status).toBe(429)
  })

  it('should track different endpoints separately', async () => {
    const limiter = rateLimit({ maxRequests: 1, windowMs: 60000 })

    const req1 = createMockRequest('/api/endpoint1')
    const req2 = createMockRequest('/api/endpoint2')

    await limiter(req1, mockHandler)
    const response = await limiter(req2, mockHandler)

    // Second request to different endpoint should succeed
    expect(response.status).toBe(200)
  })

  it('should track different IPs separately', async () => {
    const limiter = rateLimit({ maxRequests: 1, windowMs: 60000 })

    const req1 = createMockRequest('/api/test', '192.168.1.1')
    const req2 = createMockRequest('/api/test', '192.168.1.2')

    await limiter(req1, mockHandler)
    const response = await limiter(req2, mockHandler)

    // Second request from different IP should succeed
    expect(response.status).toBe(200)
  })

  it('should respect skipSuccessfulRequests option', async () => {
    const limiter = rateLimit({
      maxRequests: 2,
      windowMs: 60000,
      skipSuccessfulRequests: true
    })
    const req = createMockRequest()

    // Make 5 successful requests (should not count)
    await limiter(req, mockHandler)
    await limiter(req, mockHandler)
    await limiter(req, mockHandler)

    // All should succeed because successful requests don't count
    const response = await limiter(req, mockHandler)
    expect(response.status).toBe(200)
  })

  it('should count failed requests when skipSuccessfulRequests is true', async () => {
    const limiter = rateLimit({
      maxRequests: 2,
      windowMs: 60000,
      skipSuccessfulRequests: true
    })
    const req = createMockRequest()

    // Make 2 failed requests (should count)
    await limiter(req, mockErrorHandler)
    await limiter(req, mockErrorHandler)

    // Third request should be blocked
    const response = await limiter(req, mockErrorHandler)
    expect(response.status).toBe(429)
  })
})

describe('authRateLimit', () => {
  it('should have strict limits for auth endpoints', async () => {
    const req = createMockRequest('/api/auth/login')

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await authRateLimit(req, mockErrorHandler)
    }

    // 6th request should be blocked
    const response = await authRateLimit(req, mockErrorHandler)
    expect(response.status).toBe(429)
  })
})

describe('apiRateLimit', () => {
  it('should allow moderate traffic', async () => {
    const req = createMockRequest('/api/calculate')

    // Should allow at least 10 requests
    for (let i = 0; i < 10; i++) {
      const response = await apiRateLimit(req, mockHandler)
      expect(response.status).toBe(200)
    }
  })
})

describe('heavyRateLimit', () => {
  it('should have very strict limits for expensive operations', async () => {
    const req = createMockRequest('/api/step-export')

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await heavyRateLimit(req, mockHandler)
    }

    // 6th request should be blocked
    const response = await heavyRateLimit(req, mockHandler)
    expect(response.status).toBe(429)
  })
})