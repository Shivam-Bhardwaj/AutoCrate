import type { NextRequest } from 'next/server'
import { defaultCrateConfiguration } from '@/types/crate'
import { releaseIdentity } from '@/config/release'

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body
    }))
  }
}))

// Mock the NX expression generator
jest.mock('@/lib/nx/nx-expression-generator', () => ({
  NXExpressionGenerator: jest.fn().mockImplementation(() => ({
    generateExpressions: jest.fn(() => ({
      metadata: {
        version: releaseIdentity.version,
        templateVersion: releaseIdentity.templateVersion,
        standardsCompliance: 'AMAT-0251-70054',
        generatedAt: new Date().toISOString(),
        validationChecksum: 'abc123'
      },
      productSpecs: {
        product_length_in: 46,
        product_width_in: 38,
        product_height_in: 91.5,
        product_weight_lb: 500,
        product_center_of_gravity_x: 10,
        product_center_of_gravity_y: 12,
        product_center_of_gravity_z: 14
      },
      calculatedDimensions: {
        crate_overall_length_OD_in: 53,
        crate_overall_width_OD_in: 45,
        crate_overall_height_OD_in: 95,
        internal_clearance_length: 4,
        internal_clearance_width: 4,
        internal_clearance_height: 3
      },
      skidSpecs: {
        skid_lumber_size_callout: '4x4',
        skid_actual_height_in: 3.5,
        skid_actual_width_in: 3.5,
        skid_count: 3,
        skid_pitch_in: 24,
        skid_overhang_front_in: 2,
        skid_overhang_back_in: 2
      },
      panelSpecs: {
        bottom_panel_width_in: 40,
        bottom_panel_length_in: 60,
        bottom_panel_thickness_in: 0.75,
        side_panel_width_in: 50,
        side_panel_length_in: 70,
        side_panel_thickness_in: 0.75,
        end_panel_width_in: 35,
        end_panel_length_in: 45,
        end_panel_thickness_in: 0.75,
        top_panel_width_in: 40,
        top_panel_length_in: 60,
        top_panel_thickness_in: 0.75
      },
      hardwareSpecs: {
        lag_screw_count: 24,
        klimp_count: 12,
        flat_washer_count: 48,
        cleat_screw_count: 64,
        fastening_pattern: '16" OC'
      },
      materialSpecs: {
        lumber_grade: '#2',
        lumber_treatment: 'HT',
        plywood_grade: 'CDX',
        plywood_thickness: 0.75,
        hardware_coating: 'Zinc'
      }
    })),
    generateExpressionFile: jest.fn(() => '# MOCK_EXPRESSION_FILE')
  }))
}))

const { POST } = require('../generate-nx/route') as typeof import('../generate-nx/route')

const createMockRequest = (body: unknown): NextRequest => {
  return {
    json: jest.fn(async () => {
      if (typeof body === 'string') {
        if (body.trim().length === 0) {
          throw new SyntaxError('Request body is empty')
        }

        try {
          return JSON.parse(body)
        } catch {
          throw new SyntaxError('Invalid JSON payload')
        }
      }

      if (body instanceof Error) {
        throw body
      }

      return body
    })
  } as unknown as NextRequest
}

describe('/api/generate-nx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate NX expressions successfully', async () => {
    const request = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.expressions).toBeDefined()
    expect(data.expressions.content).toBe('# MOCK_EXPRESSION_FILE')
    expect(data.expressions.filename).toContain('autocrate-expressions-')
    expect(data.expressions.metadata).toBeDefined()
    expect(data.expressions.metadata.version).toBe(releaseIdentity.version)
    expect(data.expressions.metadata.templateVersion).toBe(releaseIdentity.templateVersion)
    expect(data.expressions.metadata.standardsCompliance).toBe('AMAT-0251-70054')
  })

  it('should handle missing configuration', async () => {
    const request = createMockRequest({
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('configuration')
  })

  it('should handle invalid configuration', async () => {
    const request = createMockRequest({
      configuration: {
        product: {
          length: -10, // Invalid negative dimension
          width: 0,    // Invalid zero dimension
          height: 1000 // Too large
        }
      },
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid product dimensions provided')
  })

  it('should handle missing options', async () => {
    const request = createMockRequest({
      configuration: defaultCrateConfiguration
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.expressions).toBeDefined()
  })

  it('should handle generation failure', async () => {
    // Mock generation failure
    const { NXExpressionGenerator } = require('@/lib/nx/nx-expression-generator')
    NXExpressionGenerator.mockImplementationOnce(() => ({
      generateExpressions: jest.fn(() => {
        throw new Error('Generation failed due to invalid parameters')
      }),
      generateExpressionFile: jest.fn()
    }))

    const request = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to generate NX expressions')
  })

  it('should handle malformed JSON', async () => {
    const request = createMockRequest('invalid json')

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('JSON')
  })

  it('should handle empty request body', async () => {
    const request = createMockRequest('')

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('body')
  })

  it('should handle different generation options', async () => {
    const request = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: {
        includeMaterials: false,
        includeHardware: false,
        includePMI: false
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.expressions).toBeDefined()
  })

  it('should handle large configuration', async () => {
    const largeConfig = {
      ...defaultCrateConfiguration,
      product: {
        ...defaultCrateConfiguration.product,
        weight: 5000,
        length: 200,
        width: 150,
        height: 100
      },
      materials: {
        ...defaultCrateConfiguration.materials,
        plywood: {
          ...defaultCrateConfiguration.materials.plywood,
          thickness: 1.5,
          grade: 'Marine'
        }
      }
    }

    const request = createMockRequest({
      configuration: largeConfig,
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.expressions).toBeDefined()
  })

  it('should handle concurrent requests', async () => {
    const request1 = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: { includeMaterials: true }
    })

    const request2 = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: { includeMaterials: false }
    })

    const [response1, response2] = await Promise.all([
      POST(request1),
      POST(request2)
    ])

    expect(response1.status).toBe(200)
    expect(response2.status).toBe(200)
    
    const data1 = await response1.json()
    const data2 = await response2.json()
    
    expect(data1.success).toBe(true)
    expect(data2.success).toBe(true)
  })

  it('should validate NX expression structure', async () => {
    const request = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.expressions.metadata).toBeDefined()
    expect(data.expressions.metadata.version).toBe(releaseIdentity.version)
    expect(data.expressions.metadata.standardsCompliance).toBe('AMAT-0251-70054')
    expect(data.expressions.metadata.templateVersion).toBe(releaseIdentity.templateVersion)
  })

  it('should handle Applied Materials standards compliance', async () => {
    const request = createMockRequest({
      configuration: defaultCrateConfiguration,
      options: {
        includeMaterials: true,
        includeHardware: true,
        includePMI: true
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.expressions.metadata.standardsCompliance).toBe('AMAT-0251-70054')
    expect(data.expressions.metadata.templateVersion).toContain('AUTOCRATE_TEMPLATE')
  })
})
