import {
  ValidationError,
  sanitizeString,
  validateNumber,
  validateDimensions,
  validateWeight,
  validateEnum,
  validateEmail,
  validateUrl,
  validateArray,
  validateBoolean,
  validateDate,
  validationErrorResponse,
  validateRequestBody,
  sanitizeObject
} from '../input-validation'

describe('ValidationError', () => {
  it('should create validation error with correct properties', () => {
    const error = new ValidationError('testField', 123, 'must be string')

    expect(error.field).toBe('testField')
    expect(error.value).toBe(123)
    expect(error.constraint).toBe('must be string')
    expect(error.message).toBe('Validation failed for testField: must be string')
    expect(error.name).toBe('ValidationError')
  })
})

describe('sanitizeString', () => {
  it('should remove null bytes', () => {
    expect(sanitizeString('hello\0world')).toBe('helloworld')
  })

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('should limit length', () => {
    const longString = 'a'.repeat(2000)
    expect(sanitizeString(longString, 100)).toHaveLength(100)
  })

  it('should remove script tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>hello')).toBe('hello')
  })

  it('should remove iframe tags', () => {
    expect(sanitizeString('<iframe src="evil.com"></iframe>test')).toBe('test')
    expect(sanitizeString('<iframe />test')).toBe('test')
  })

  it('should remove javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)')
  })

  it('should remove inline event handlers', () => {
    expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeString('onload=bad()')).toBe('bad()')
  })

  it('should throw error for non-string input', () => {
    expect(() => sanitizeString(123 as any)).toThrow(ValidationError)
  })
})

describe('validateNumber', () => {
  it('should validate valid numbers', () => {
    expect(validateNumber(42, 'test')).toBe(42)
    expect(validateNumber('42', 'test')).toBe(42)
    expect(validateNumber(3.14, 'test')).toBe(3.14)
  })

  it('should reject NaN', () => {
    expect(() => validateNumber(NaN, 'test')).toThrow(ValidationError)
    expect(() => validateNumber('not a number', 'test')).toThrow(ValidationError)
  })

  it('should reject Infinity', () => {
    expect(() => validateNumber(Infinity, 'test')).toThrow(ValidationError)
  })

  it('should validate min constraint', () => {
    expect(validateNumber(10, 'test', { min: 5 })).toBe(10)
    expect(() => validateNumber(3, 'test', { min: 5 })).toThrow(ValidationError)
  })

  it('should validate max constraint', () => {
    expect(validateNumber(10, 'test', { max: 15 })).toBe(10)
    expect(() => validateNumber(20, 'test', { max: 15 })).toThrow(ValidationError)
  })

  it('should validate integer constraint', () => {
    expect(validateNumber(42, 'test', { integer: true })).toBe(42)
    expect(() => validateNumber(42.5, 'test', { integer: true })).toThrow(ValidationError)
  })

  it('should validate positive constraint', () => {
    expect(validateNumber(5, 'test', { positive: true })).toBe(5)
    expect(() => validateNumber(0, 'test', { positive: true })).toThrow(ValidationError)
    expect(() => validateNumber(-5, 'test', { positive: true })).toThrow(ValidationError)
  })
})

describe('validateDimensions', () => {
  it('should validate valid dimensions', () => {
    const result = validateDimensions({ length: 100, width: 50, height: 75 })
    expect(result).toEqual({ length: 100, width: 50, height: 75 })
  })

  it('should reject non-object input', () => {
    expect(() => validateDimensions(null)).toThrow(ValidationError)
    expect(() => validateDimensions('test')).toThrow(ValidationError)
  })

  it('should reject invalid dimension values', () => {
    expect(() => validateDimensions({ length: -1, width: 50, height: 75 })).toThrow(ValidationError)
    expect(() => validateDimensions({ length: 100, width: 20000, height: 75 })).toThrow(ValidationError)
  })

  it('should accept string numbers', () => {
    const result = validateDimensions({ length: '100', width: '50', height: '75' })
    expect(result).toEqual({ length: 100, width: 50, height: 75 })
  })
})

describe('validateWeight', () => {
  it('should validate valid weights', () => {
    expect(validateWeight(1000)).toBe(1000)
    expect(validateWeight('500')).toBe(500)
  })

  it('should reject negative weights', () => {
    expect(() => validateWeight(-10)).toThrow(ValidationError)
  })

  it('should reject zero weight', () => {
    expect(() => validateWeight(0)).toThrow(ValidationError)
  })

  it('should reject excessive weights', () => {
    expect(() => validateWeight(200000)).toThrow(ValidationError)
  })
})

describe('validateEnum', () => {
  const sizes = ['2x4', '2x6', '2x8'] as const

  it('should validate valid enum values', () => {
    expect(validateEnum('2x4', 'size', sizes)).toBe('2x4')
    expect(validateEnum('2x6', 'size', sizes)).toBe('2x6')
  })

  it('should reject invalid enum values', () => {
    expect(() => validateEnum('2x10', 'size', sizes)).toThrow(ValidationError)
    expect(() => validateEnum('invalid', 'size', sizes)).toThrow(ValidationError)
  })
})

describe('validateEmail', () => {
  it('should validate valid emails', () => {
    expect(validateEmail('test@example.com')).toBe('test@example.com')
    expect(validateEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
  })

  it('should reject invalid emails', () => {
    expect(() => validateEmail('notanemail')).toThrow(ValidationError)
    expect(() => validateEmail('@example.com')).toThrow(ValidationError)
    expect(() => validateEmail('test@')).toThrow(ValidationError)
  })

  it('should sanitize and lowercase', () => {
    expect(validateEmail('  Test@Example.COM  ')).toBe('test@example.com')
  })
})

describe('validateUrl', () => {
  it('should validate valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe('https://example.com/')
    expect(validateUrl('http://example.com/path')).toContain('http://example.com/path')
  })

  it('should reject invalid protocols', () => {
    expect(() => validateUrl('ftp://example.com')).toThrow(ValidationError)
    expect(() => validateUrl('file:///etc/passwd')).toThrow(ValidationError)
  })

  it('should reject malformed URLs', () => {
    expect(() => validateUrl('not a url')).toThrow(ValidationError)
  })

  it('should reject localhost in production', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })

    expect(() => validateUrl('http://localhost:3000')).toThrow(ValidationError)
    expect(() => validateUrl('http://127.0.0.1')).toThrow(ValidationError)
    expect(() => validateUrl('http://192.168.1.1')).toThrow(ValidationError)

    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
  })

  it('should allow localhost in development', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })

    expect(validateUrl('http://localhost:3000')).toContain('localhost')

    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
  })
})

describe('validateArray', () => {
  it('should validate valid arrays', () => {
    expect(validateArray([1, 2, 3], 'test')).toEqual([1, 2, 3])
  })

  it('should reject non-arrays', () => {
    expect(() => validateArray('not array', 'test')).toThrow(ValidationError)
    expect(() => validateArray({}, 'test')).toThrow(ValidationError)
  })

  it('should validate minLength', () => {
    expect(() => validateArray([1], 'test', { minLength: 2 })).toThrow(ValidationError)
    expect(validateArray([1, 2], 'test', { minLength: 2 })).toEqual([1, 2])
  })

  it('should validate maxLength', () => {
    expect(() => validateArray([1, 2, 3], 'test', { maxLength: 2 })).toThrow(ValidationError)
    expect(validateArray([1, 2], 'test', { maxLength: 2 })).toEqual([1, 2])
  })

  it('should apply itemValidator', () => {
    const doubler = (x: number) => x * 2
    expect(validateArray([1, 2, 3], 'test', { itemValidator: doubler })).toEqual([2, 4, 6])
  })
})

describe('validateBoolean', () => {
  it('should validate boolean values', () => {
    expect(validateBoolean(true, 'test')).toBe(true)
    expect(validateBoolean(false, 'test')).toBe(false)
  })

  it('should convert truthy string values', () => {
    expect(validateBoolean('true', 'test')).toBe(true)
    expect(validateBoolean('1', 'test')).toBe(true)
    expect(validateBoolean(1, 'test')).toBe(true)
  })

  it('should convert falsy string values', () => {
    expect(validateBoolean('false', 'test')).toBe(false)
    expect(validateBoolean('0', 'test')).toBe(false)
    expect(validateBoolean(0, 'test')).toBe(false)
  })

  it('should reject invalid values', () => {
    expect(() => validateBoolean('yes', 'test')).toThrow(ValidationError)
    expect(() => validateBoolean(2, 'test')).toThrow(ValidationError)
  })
})

describe('validateDate', () => {
  it('should validate valid dates', () => {
    const date = new Date('2025-01-01')
    expect(validateDate('2025-01-01', 'test')).toEqual(date)
  })

  it('should reject invalid dates', () => {
    expect(() => validateDate('invalid', 'test')).toThrow(ValidationError)
  })

  it('should validate min date', () => {
    const min = new Date('2025-01-01')
    expect(() => validateDate('2024-12-31', 'test', { min })).toThrow(ValidationError)
    expect(validateDate('2025-01-02', 'test', { min })).toBeTruthy()
  })

  it('should validate max date', () => {
    const max = new Date('2025-12-31')
    expect(() => validateDate('2026-01-01', 'test', { max })).toThrow(ValidationError)
    expect(validateDate('2025-12-30', 'test', { max })).toBeTruthy()
  })
})

describe('sanitizeObject', () => {
  it('should sanitize nested objects', () => {
    const input = {
      name: '<script>alert(1)</script>John',
      nested: {
        value: '  test  '
      }
    }
    const result = sanitizeObject(input)
    expect(result.name).toBe('John')
    expect(result.nested.value).toBe('test')
  })

  it('should reject excessive nesting', () => {
    let deep: any = {}
    let current = deep
    for (let i = 0; i < 15; i++) {
      current.next = {}
      current = current.next
    }
    expect(() => sanitizeObject(deep)).toThrow(ValidationError)
  })

  it('should prevent prototype pollution', () => {
    const input = {
      __proto__: { polluted: true },
      constructor: { polluted: true },
      normal: 'value'
    }
    const result = sanitizeObject(input)
    expect(Object.hasOwn(result, '__proto__')).toBe(false)
    expect(Object.hasOwn(result, 'constructor')).toBe(false)
    expect(result.normal).toBe('value')
  })

  it('should handle arrays', () => {
    const input = ['<script>bad</script>', '  trim  ', 'good']
    const result = sanitizeObject(input)
    expect(result).toEqual(['', 'trim', 'good'])
  })

  it('should handle primitives', () => {
    expect(sanitizeObject(null)).toBe(null)
    expect(sanitizeObject(undefined)).toBe(undefined)
    expect(sanitizeObject(42)).toBe(42)
    expect(sanitizeObject(true)).toBe(true)
  })
})

describe('validateRequestBody', () => {
  it('should validate all fields successfully', () => {
    const body = { name: 'John', age: '30', active: true }
    const validators = {
      name: (v: any) => sanitizeString(v),
      age: (v: any) => validateNumber(v, 'age', { min: 0 }),
      active: (v: any) => validateBoolean(v, 'active')
    }

    const result = validateRequestBody(body, validators)
    expect(result).toEqual({ name: 'John', age: 30, active: true })
  })

  it('should collect multiple validation errors', () => {
    const body = { name: 123, age: 'invalid' }
    const validators = {
      name: (v: any) => sanitizeString(v),
      age: (v: any) => validateNumber(v, 'age')
    }

    expect(() => validateRequestBody(body, validators)).toThrow()
  })
})

describe('validationErrorResponse', () => {
  it('should create proper error response', () => {
    const errors = [
      new ValidationError('field1', 'value1', 'constraint1'),
      new ValidationError('field2', 'value2', 'constraint2')
    ]

    const response = validationErrorResponse(errors)
    expect(response.status).toBe(400)
  })
})