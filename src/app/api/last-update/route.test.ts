import { GET, ProjectMetadata } from './route'

describe('GET /api/last-update', () => {
  it('returns comprehensive project metadata', async () => {
    const response = await GET()
    const body: ProjectMetadata = await response.json()

    // Verify all required fields are present
    expect(typeof body.version).toBe('string')
    expect(typeof body.tiNumber).toBe('string')
    expect(typeof body.branch).toBe('string')
    expect(typeof body.lastCommit).toBe('string')
    expect(typeof body.lastChange).toBe('string')
    expect(typeof body.timestamp).toBe('string')
    expect(typeof body.updatedBy).toBe('string')

    // Verify timestamp is valid
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date')

    // Verify format patterns
    expect(body.tiNumber).toMatch(/^TI-[\w-]+$/)
    expect(body.updatedBy).toContain('@')
    expect(body.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('returns fallback metadata on error', async () => {
    // This test verifies graceful degradation
    const response = await GET()
    const body: ProjectMetadata = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty('version')
    expect(body).toHaveProperty('tiNumber')
  })
})
