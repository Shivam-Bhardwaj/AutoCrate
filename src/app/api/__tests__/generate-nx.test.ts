import { NextRequest } from 'next/server'
import { POST } from '../generate-nx/route'
import { defaultCrateConfiguration } from '../../../../types/crate'

// Mock the NX expression generator
jest.mock('../../../../lib/nx/nx-expression-generator', () => ({
  NXExpressionGenerator: jest.fn().mockImplementation(() => ({
    generateExpressions: jest.fn(() => ({
      success: true,
      data: {
        metadata: {
          version: '2.0.0',
          standardsCompliance: 'AMAT-0251-70054',
          templateVersion: 'AUTOCRATE_TEMPLATE_V2.0.0',
          generatedAt: new Date(),
          validationChecksum: 'abc123'
        },
        productSpecs: {
          product_length_in: 46,
          product_width_in: 38,
          product_height_in: 91.5,
          product_weight_lb: 500
        },
        overallDimensions: {
          overall_length_in: 53,
          overall_width_in: 45,
          overall_height_in: 95
        },
        materialSpecs: {
          plywood_thickness_in: 0.75,
          plywood_grade: 'CDX',
          lumber_grade: '#2',
          lumber_moisture_content_percent: 19
        },
        clearanceSpecs: {
          side_clearance_in: 2,
          top_clearance_in: 2,
          bottom_clearance_in: 2
        },
        skidSpecs: {
          skid_count: 1,
          skid_overhang_in: 2,
          skid_length_in: 50
        },
        hardwareSpecs: {
          screw_count: 24,
          screw_length_in: 2.5,
          screw_diameter_in: 0.25
        }
      },
      filename: 'crate-expressions.nx',
      size: 2048,
      metadata: {
        version: '2.0.0',
        standardsCompliance: 'AMAT-0251-70054',
        generatedAt: new Date()
      }
    }))
  }))
}))

describe('/api/generate-nx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate NX expressions successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: {
          includeMaterials: true,
          includeHardware: true,
          includePMI: true
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.filename).toBe('crate-expressions.nx')
    expect(data.size).toBe(2048)
    expect(data.metadata).toBeDefined()
    expect(data.metadata.version).toBe('2.0.0')
    expect(data.metadata.standardsCompliance).toBe('AMAT-0251-70054')
  })

  it('should handle missing configuration', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        options: {
          includeMaterials: true,
          includeHardware: true,
          includePMI: true
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('configuration')
  })

  it('should handle invalid configuration', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
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
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('invalid')
  })

  it('should handle missing options', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('should handle generation failure', async () => {
    // Mock generation failure
    const { NXExpressionGenerator } = require('../../../../lib/nx/nx-expression-generator')
    NXExpressionGenerator.mockImplementationOnce(() => ({
      generateExpressions: jest.fn(() => ({
        success: false,
        error: 'Generation failed due to invalid parameters'
      }))
    }))

    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: {
          includeMaterials: true,
          includeHardware: true,
          includePMI: true
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Generation failed')
  })

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('JSON')
  })

  it('should handle empty request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: ''
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('body')
  })

  it('should handle different generation options', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: {
          includeMaterials: false,
          includeHardware: false,
          includePMI: false
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
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

    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: largeConfig,
        options: {
          includeMaterials: true,
          includeHardware: true,
          includePMI: true
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('should handle concurrent requests', async () => {
    const request1 = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: { includeMaterials: true }
      })
    })

    const request2 = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: { includeMaterials: false }
      })
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
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: {
          includeMaterials: true,
          includeHardware: true,
          includePMI: true
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.metadata).toBeDefined()
    expect(data.data.metadata.version).toBe('2.0.0')
    expect(data.data.metadata.standardsCompliance).toBe('AMAT-0251-70054')
    expect(data.data.metadata.templateVersion).toBe('AUTOCRATE_TEMPLATE_V2.0.0')
    expect(data.data.productSpecs).toBeDefined()
    expect(data.data.overallDimensions).toBeDefined()
    expect(data.data.materialSpecs).toBeDefined()
    expect(data.data.clearanceSpecs).toBeDefined()
    expect(data.data.skidSpecs).toBeDefined()
    expect(data.data.hardwareSpecs).toBeDefined()
  })

  it('should handle Applied Materials standards compliance', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-nx', {
      method: 'POST',
      body: JSON.stringify({
        configuration: defaultCrateConfiguration,
        options: {
          includeMaterials: true,
          includeHardware: true,
          includePMI: true
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.metadata.standardsCompliance).toBe('AMAT-0251-70054')
    expect(data.data.metadata.templateVersion).toContain('AUTOCRATE_TEMPLATE')
  })
})
