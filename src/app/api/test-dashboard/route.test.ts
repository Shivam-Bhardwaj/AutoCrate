import { GET } from './route'

const call = (view?: string) => {
  const url = new URL('http://localhost/api/test-dashboard')
  if (view) {
    url.searchParams.set('view', view)
  }
  return GET({ url: url.toString() } as any)
}

describe('API /api/test-dashboard', () => {
  it('returns summary view by default', async () => {
    const response: any = await call()
    const json = await response.json()
    expect(json.overview.totalTests).toBeGreaterThan(0)
  })

  it('returns detailed results when requested', async () => {
    const response: any = await call('detailed')
    const json = await response.json()
    expect(json.testResults[0].suite).toBe('Standard Crates')
  })

  it('provides coverage data view', async () => {
    const response: any = await call('coverage')
    const json = await response.json()
    expect(json.overall.lines).toBeGreaterThan(0)
  })

  it('provides performance metrics', async () => {
    const response: any = await call('performance')
    const json = await response.json()
    expect(json.endpoints).toHaveLength(4)
  })

  it('returns historical trends', async () => {
    const response: any = await call('history')
    const json = await response.json()
    expect(json.history.length).toBe(30)
    expect(json.statistics.totalRuns).toBeGreaterThan(0)
  })

  it('returns dashboard rollup view', async () => {
    const response: any = await call('dashboard')
    const json = await response.json()
    expect(json.summary.overview.totalSuites).toBeGreaterThan(0)
  })

  it('returns 400 for unknown view', async () => {
    const response: any = await call('unknown')
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain('Invalid view parameter')
  })
})
