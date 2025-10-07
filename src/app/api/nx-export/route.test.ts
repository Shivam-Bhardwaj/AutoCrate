import { NextResponse } from 'next/server'
import { POST, GET } from './route'

describe('API /api/nx-export', () => {
  const baseBody = {
    crateId: 'CRATE-123',
    dimensions: { length: 1000, width: 800, height: 600 },
    weight: 2500,
    exportFormat: 'expressions' as const,
    units: 'mm' as const
  }

  const createRequest = (body: Record<string, unknown>) => ({
    json: () => Promise.resolve(body)
  })

  it('generates NX export metadata and content', async () => {
    const response = (await POST(createRequest(baseBody) as any)) as NextResponse
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.status).toBe('success')
    expect(json.export.content).toMatch(/# NX Expressions/)
    expect(json.export.expressionCount).toBeGreaterThan(0)
    expect(json.export.units).toBe('mm')
  })

  it('supports inch conversions', async () => {
    const response = (await POST(createRequest({ ...baseBody, units: 'inch' }) as any)) as NextResponse
    const json = await response.json()
    expect(json.export.units).toBe('inch')
    expect(json.export.dimensions.length).toBeCloseTo(baseBody.dimensions.length * 0.0393701)
  })

  it('returns capabilities overview on GET without exportId', async () => {
    const response = (await GET({ url: 'http://localhost/api/nx-export' } as any)) as NextResponse
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.supportedFormats).toContain('step')
  })

  it('returns raw export content when exportId provided', async () => {
    const response = (await GET({ url: 'http://localhost/api/nx-export?exportId=123' } as any)) as NextResponse
    expect(response.status).toBe(200)
    const text = await response.json()
    expect(String(text)).toContain('Export ID: 123')
  })
})
