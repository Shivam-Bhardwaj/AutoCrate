import { NextResponse } from 'next/server'

/**
 * Validation error class for structured error responses
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    public value: any,
    public constraint: string
  ) {
    super(`Validation failed for ${field}: ${constraint}`)
    this.name = 'ValidationError'
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new ValidationError('input', input, 'must be a string')
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove potentially dangerous HTML/script tags
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<iframe[^>]*\/>/gi, '')
    .replace(/<iframe[^>]*>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')

  return sanitized
}

/**
 * Validate and sanitize numeric input
 */
export function validateNumber(
  value: any,
  field: string,
  options: {
    min?: number
    max?: number
    integer?: boolean
    positive?: boolean
  } = {}
): number {
  const num = Number(value)

  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError(field, value, 'must be a valid number')
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new ValidationError(field, value, 'must be an integer')
  }

  if (options.positive && num <= 0) {
    throw new ValidationError(field, value, 'must be positive')
  }

  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(field, value, `must be at least ${options.min}`)
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(field, value, `must be at most ${options.max}`)
  }

  return num
}

/**
 * Validate dimensions object for crate calculations
 */
export function validateDimensions(dimensions: any): {
  length: number
  width: number
  height: number
} {
  if (!dimensions || typeof dimensions !== 'object') {
    throw new ValidationError('dimensions', dimensions, 'must be an object')
  }

  return {
    length: validateNumber(dimensions.length, 'dimensions.length', {
      min: 1,
      max: 10000,
      positive: true
    }),
    width: validateNumber(dimensions.width, 'dimensions.width', {
      min: 1,
      max: 10000,
      positive: true
    }),
    height: validateNumber(dimensions.height, 'dimensions.height', {
      min: 1,
      max: 10000,
      positive: true
    })
  }
}

/**
 * Validate weight input
 */
export function validateWeight(weight: any): number {
  return validateNumber(weight, 'weight', {
    min: 0.1,
    max: 100000,
    positive: true
  })
}

/**
 * Validate enum values
 */
export function validateEnum<T>(
  value: any,
  field: string,
  allowedValues: readonly T[]
): T {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      field,
      value,
      `must be one of: ${allowedValues.join(', ')}`
    )
  }
  return value as T
}

/**
 * Validate email address
 */
export function validateEmail(email: any): string {
  const sanitized = sanitizeString(email, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    throw new ValidationError('email', email, 'must be a valid email address')
  }

  return sanitized.toLowerCase()
}

/**
 * Validate URL
 */
export function validateUrl(url: any, field: string = 'url'): string {
  const sanitized = sanitizeString(url, 2048)

  try {
    const parsed = new URL(sanitized)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError(field, url, 'must use http or https protocol')
    }

    // Prevent localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase()
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        throw new ValidationError(field, url, 'cannot use local or private addresses')
      }
    }

    return parsed.toString()
  } catch (error) {
    if (error instanceof ValidationError) throw error
    throw new ValidationError(field, url, 'must be a valid URL')
  }
}

/**
 * Validate array input
 */
export function validateArray<T>(
  value: any,
  field: string,
  options: {
    minLength?: number
    maxLength?: number
    itemValidator?: (item: any, index: number) => T
  } = {}
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(field, value, 'must be an array')
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(field, value, `must have at least ${options.minLength} items`)
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(field, value, `must have at most ${options.maxLength} items`)
  }

  if (options.itemValidator) {
    return value.map((item, index) => options.itemValidator!(item, index))
  }

  return value
}

/**
 * Validate boolean input
 */
export function validateBoolean(value: any, field: string): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === 1 || value === '1') return true
  if (value === 'false' || value === 0 || value === '0') return false

  throw new ValidationError(field, value, 'must be a boolean')
}

/**
 * Validate date input
 */
export function validateDate(
  value: any,
  field: string,
  options: {
    min?: Date
    max?: Date
    future?: boolean
    past?: boolean
  } = {}
): Date {
  const date = new Date(value)

  if (isNaN(date.getTime())) {
    throw new ValidationError(field, value, 'must be a valid date')
  }

  const now = new Date()

  if (options.future && date <= now) {
    throw new ValidationError(field, value, 'must be in the future')
  }

  if (options.past && date >= now) {
    throw new ValidationError(field, value, 'must be in the past')
  }

  if (options.min && date < options.min) {
    throw new ValidationError(field, value, `must be after ${options.min.toISOString()}`)
  }

  if (options.max && date > options.max) {
    throw new ValidationError(field, value, `must be before ${options.max.toISOString()}`)
  }

  return date
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      errors: errors.map(e => ({
        field: e.field,
        message: e.constraint,
        value: e.value
      })),
      timestamp: new Date().toISOString()
    },
    { status: 400 }
  )
}

/**
 * Validate request body with multiple validators
 */
export function validateRequestBody<T>(
  body: any,
  validators: { [K in keyof T]: (value: any) => T[K] }
): T {
  const errors: ValidationError[] = []
  const result: Partial<T> = {}

  for (const [field, validator] of Object.entries(validators) as [keyof T, (value: any) => T[keyof T]][]) {
    try {
      result[field] = validator(body[field as string])
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      } else {
        errors.push(new ValidationError(field as string, body[field as string], 'validation failed'))
      }
    }
  }

  if (errors.length > 0) {
    throw errors
  }

  return result as T
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any, maxDepth: number = 10): any {
  if (maxDepth <= 0) {
    throw new ValidationError('object', obj, 'exceeds maximum nesting depth')
  }

  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1))
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = Object.create(null)
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key to prevent prototype pollution
      const sanitizedKey = sanitizeString(key, 100)
      if (!sanitizedKey.startsWith('__') && !sanitizedKey.startsWith('constructor')) {
        sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1)
      }
    }
    return sanitized
  }

  // Unknown type, return as-is but log warning
  console.warn('Unknown type in sanitizeObject:', typeof obj)
  return obj
}
