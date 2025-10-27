import { NextResponse } from 'next/server'
import { POST, GET } from './route'

describe('API /api/calculate-crate', () => {
  const baseBody = {
    productDimensions: { length: 1000, width: 800, height: 600 },
    productWeight: 2000,
    materialType: 'plywood' as const,
    crateType: 'heavy-duty' as const
  }

  const createRequest = (body: Record<string, unknown>) => ({
    json: () => Promise.resolve(body),
    headers: new Headers({
      'x-forwarded-for': '127.0.0.1'
    }),
    nextUrl: {
      pathname: '/api/calculate-crate'
    }
  })

  it('returns crate calculations and truncated NX payload', async () => {
    const response = (await POST(createRequest(baseBody) as any)) as NextResponse
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.status).toBe('success')
    expect(json.calculations.crateDimensions.length).toBe(baseBody.productDimensions.length + 150)
    expect(json.nxExpressions).toMatch(/\/\/ NX Expressions/)
    expect(json.nxExpressions.length).toBeLessThan(json.fullNxExpressionsLength)
  })

  it('returns 400 when required fields are missing', async () => {
    const response = (await POST(createRequest({ productWeight: 100 }) as any)) as NextResponse
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain('Validation failed')
  })

  it('exposes service health on GET', async () => {
    const response = (await GET({
      headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
      nextUrl: { pathname: '/api/calculate-crate' }
    } as any)) as NextResponse
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.status).toBe('operational')
    expect(json.service).toBe('AutoCrate Calculator API')
  })
})
