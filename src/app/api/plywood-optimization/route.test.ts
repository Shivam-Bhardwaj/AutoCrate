jest.mock('@/lib/plywood-splicing', () => ({
  calculatePlywoodPieces: jest.fn(() => ({
    panelName: 'FRONT_PANEL',
    panelWidth: 96,
    panelHeight: 48,
    sheetCount: 2,
    splices: [],
    sheets: [
      { id: 'S0', x: 0, y: 0, width: 48, height: 24, sheetX: 0, sheetY: 0, sheetId: 0 }
    ],
    pieces: [{ id: 'P1' }],
    hasRotations: false
  }))
}))

import { NextResponse } from 'next/server'
import { POST, GET } from './route'
import { calculatePlywoodPieces } from '@/lib/plywood-splicing'

describe('API /api/plywood-optimization', () => {
  const baseBody = {
    panelDimensions: { width: 96, height: 48 },
    minimizeWaste: true,
    allowRotation: true
  }

  const createRequest = (body: Record<string, unknown>) => ({
    json: () => Promise.resolve(body)
  })

  it('returns optimization summary with recommendations', async () => {
    const response = (await POST(createRequest(baseBody) as any)) as NextResponse
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.status).toBe('success')
    expect(json.optimization.sheetCount).toBeDefined()
    expect(Array.isArray(json.recommendations)).toBe(true)
    expect(calculatePlywoodPieces).toHaveBeenCalledWith(baseBody.panelDimensions, 'PANEL')
  })

  it('exposes standard sheet catalog via GET', async () => {
    const response = (await GET({} as any)) as NextResponse
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.standardSheets).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: '4x8 feet' })
    ]))
  })
})
