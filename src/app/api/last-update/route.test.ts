import { GET } from './route'

describe('GET /api/last-update', () => {
  it('returns a last update timestamp', async () => {
    const response = await GET()
    const body = await response.json()

    expect(typeof body.lastUpdate).toBe('string')
    expect(new Date(body.lastUpdate).toString()).not.toBe('Invalid Date')
  })
})
