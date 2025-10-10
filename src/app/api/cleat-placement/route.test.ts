import { NextResponse } from 'next/server'
import { POST, GET } from './route'

describe('API /api/cleat-placement', () => {
  const baseBody = {
    panelDimensions: { width: 1200, height: 900, thickness: 25 },
    loadCapacity: 800,
    cleatType: 'reinforced' as const,
    material: 'oak' as const
  }

  const createRequest = (body: Record<string, unknown>) => ({
    json: () => Promise.resolve(body)
  })

  it('calculates cleat configuration and structural recommendations', async () => {
    const response = (await POST(createRequest(baseBody) as any)) as NextResponse
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.status).toBe('success')
    expect(json.cleatConfiguration.quantity).toBeGreaterThan(0)
    expect(json.structuralAnalysis.recommendedFasteners.type).toBe('Wood screws')
    expect(json.structuralAnalysis.recommendedFasteners.pattern).toBe('Single row')
  })

  it('returns cleat specification catalog on GET', async () => {
    const response = (await GET({} as any)) as NextResponse
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.cleatTypes.standard.width).toBe(50)
    expect(json.materials.oak.strength).toBe(50)
  })
})
