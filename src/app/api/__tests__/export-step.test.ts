import type { NextRequest } from 'next/server'
import { STEPExporter } from '@/lib/step-processor'
import { defaultCrateConfiguration } from '@/types/crate'

let POST: typeof import('../export-step/route').POST

beforeAll(async () => {
  if (typeof globalThis.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = await import('util')
    globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
    if (typeof globalThis.TextDecoder === 'undefined') {
      globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
    }
  }

  if (typeof globalThis.ReadableStream === 'undefined') {
    const streamPrimitives = await import('next/dist/compiled/@edge-runtime/primitives/stream')
    globalThis.ReadableStream = streamPrimitives.ReadableStream as unknown as typeof globalThis.ReadableStream
    if (typeof globalThis.WritableStream === 'undefined') {
      globalThis.WritableStream = streamPrimitives.WritableStream as unknown as typeof globalThis.WritableStream
    }
    if (typeof globalThis.TransformStream === 'undefined') {
      globalThis.TransformStream = streamPrimitives.TransformStream as unknown as typeof globalThis.TransformStream
    }
  }

  if (typeof globalThis.Request === 'undefined' || typeof globalThis.Response === 'undefined') {
    const fetchPrimitives = await import('next/dist/compiled/@edge-runtime/primitives/fetch')

    if (typeof globalThis.fetch === 'undefined') {
      globalThis.fetch = fetchPrimitives.fetch as typeof globalThis.fetch
    }
    if (typeof globalThis.Headers === 'undefined') {
      globalThis.Headers = fetchPrimitives.Headers as typeof globalThis.Headers
    }
    if (typeof globalThis.Request === 'undefined') {
      globalThis.Request = fetchPrimitives.Request as unknown as typeof globalThis.Request
    }
    if (typeof globalThis.Response === 'undefined') {
      globalThis.Response = fetchPrimitives.Response as unknown as typeof globalThis.Response
    }
    if (typeof globalThis.FormData === 'undefined') {
      globalThis.FormData = fetchPrimitives.FormData as typeof globalThis.FormData
    }
    if (typeof globalThis.Blob === 'undefined') {
      globalThis.Blob = fetchPrimitives.Blob as unknown as typeof globalThis.Blob
    }
    if (typeof (globalThis as any).File === 'undefined') {
      (globalThis as any).File = fetchPrimitives.File
    }
  }

  const routeModule = await import('../export-step/route')
  POST = routeModule.POST
})

describe('/api/export-step', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  const createRequest = (payload: unknown): NextRequest => ({
    json: jest.fn().mockResolvedValue(payload)
  }) as unknown as NextRequest

  it('should export STEP file successfully', async () => {
    const request = createRequest(defaultCrateConfiguration)

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/step')
    expect(response.headers.get('Content-Disposition')).toMatch(/attachment; filename="autocrate_assembly_\d{4}-\d{2}-\d{2}\.stp"/)
    expect(response.headers.get('X-STEP-Version')).toBe('AP242')
    expect(response.headers.get('X-PMI-Included')).toBe('true')

    const body = await response.text()
    expect(body).toContain('ISO-10303-21')
    expect(body).toContain('AutoCrate STEP Export with PMI')
  })

  it('should return 400 when configuration is missing', async () => {
    const request = createRequest({})

    const response = await POST(request)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Invalid configuration provided')
  })

  it('should return 500 when exporter fails', async () => {
    jest.spyOn(STEPExporter.prototype, 'exportWithPMI').mockRejectedValueOnce(new Error('Exporter failure'))

    const request = createRequest(defaultCrateConfiguration)

    const response = await POST(request)

    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('Failed to generate STEP file')
  })
})
