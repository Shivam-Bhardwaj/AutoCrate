# API Reference

AutoCrate provides APIs for integration with CAD systems, PLM tools, and custom applications.

## Overview

AutoCrate's API enables:
- Programmatic crate configuration
- Automated NX expression generation
- Batch processing capabilities
- Integration with enterprise systems
- Custom workflow automation

**Base URL**: `https://autocrate.vercel.app/api`  
**Authentication**: API Key (contact administrator)  
**Rate Limiting**: 1000 requests/hour per key

## Configuration API

### Create Configuration

Create a new crate configuration programmatically.

```http
POST /api/configuration
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "projectName": "CRATE-001",
  "dimensions": {
    "length": 48,
    "width": 36,
    "height": 30
  },
  "weight": {
    "product": 800
  },
  "base": {
    "type": "standard",
    "floorboardThickness": 0.75,
    "skidHeight": 5,
    "skidWidth": 4,
    "skidCount": 3,
    "skidSpacing": 16,
    "requiresRubStrips": true,
    "material": "pine"
  }
}
```

**Response**:
```json
{
  "success": true,
  "configurationId": "conf_1234567890",
  "validation": {
    "isValid": true,
    "warnings": [],
    "errors": []
  }
}
```

### Get Configuration

Retrieve existing configuration details.

```http
GET /api/configuration/{configurationId}
Authorization: Bearer YOUR_API_KEY
```

**Response**:
```json
{
  "success": true,
  "configuration": {
    "id": "conf_1234567890",
    "projectName": "CRATE-001",
    "dimensions": { ... },
    "weight": { ... },
    "base": { ... },
    "cap": { ... },
    "fasteners": { ... },
    "vinyl": { ... },
    "createdAt": "2025-01-08T10:00:00Z",
    "updatedAt": "2025-01-08T10:30:00Z"
  }
}
```

### Update Configuration

Modify existing configuration parameters.

```http
PUT /api/configuration/{configurationId}
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "dimensions": {
    "length": 52,
    "width": 36,
    "height": 30
  }
}
```

### List Configurations

Get list of configurations with filtering and pagination.

```http
GET /api/configurations?page=1&limit=20&project=CRATE&status=active
Authorization: Bearer YOUR_API_KEY
```

**Response**:
```json
{
  "success": true,
  "configurations": [
    {
      "id": "conf_1234567890",
      "projectName": "CRATE-001",
      "status": "active",
      "createdAt": "2025-01-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

## NX Integration API

### Generate Expression

Generate NX parametric expression from configuration.

```http
POST /api/nx/generate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configurationId": "conf_1234567890",
  "options": {
    "coordinateSystem": "z-up",
    "units": "inches",
    "includeComments": true,
    "applyStandards": "amat"
  }
}
```

**Response**:
```json
{
  "success": true,
  "expression": {
    "variables": {
      "crate_length": 48,
      "crate_width": 36,
      "crate_height": 30
    },
    "features": [
      "BLOCK/CREATE_BASE",
      "BLOCK/CREATE_FRONT_PANEL"
    ],
    "constraints": [
      "crate_length > 0",
      "crate_width > 0"
    ],
    "code": "$ AutoCrate NX Expression\np0 = 48\n..."
  },
  "metadata": {
    "partNumber": "0205-12345",
    "tcNumber": "TC2-1234567",
    "generatedAt": "2025-01-08T10:45:00Z"
  }
}
```

### Validate Expression

Validate NX expression syntax and compatibility.

```http
POST /api/nx/validate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "expression": "p0 = 48\np1 = 36\n...",
  "nxVersion": "2022",
  "validationLevel": "strict"
}
```

**Response**:
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "syntax": {
      "errors": [],
      "warnings": ["Parameter p10 not used"]
    },
    "compatibility": {
      "nxVersion": "2022",
      "supported": true,
      "issues": []
    },
    "standards": {
      "asme": true,
      "amat": true,
      "issues": []
    }
  }
}
```

## Export API

### Export JT File

Generate JT file for NX import.

```http
POST /api/export/jt
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configurationId": "conf_1234567890",
  "options": {
    "version": "10.5",
    "units": "inches",
    "precision": 0.001,
    "includeMetadata": true,
    "includeMaterials": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "export": {
    "fileUrl": "https://autocrate.vercel.app/exports/conf_1234567890.jt",
    "fileSize": 2048576,
    "downloadToken": "token_abcd1234",
    "expiresAt": "2025-01-08T18:00:00Z"
  },
  "metadata": {
    "partCount": 15,
    "assemblyCount": 1,
    "exportTime": 1847
  }
}
```

### Export Drawings

Generate technical drawings in various formats.

```http
POST /api/export/drawings
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configurationId": "conf_1234567890",
  "format": "pdf",
  "options": {
    "sheetSize": "B",
    "scale": "1:8",
    "includeDetails": true,
    "includeBOM": true
  }
}
```

### Export Bill of Materials

Generate detailed BOM with pricing.

```http
POST /api/export/bom
Content-Type: application/json  
Authorization: Bearer YOUR_API_KEY

{
  "configurationId": "conf_1234567890",
  "format": "csv",
  "options": {
    "includePricing": true,
    "includeVendors": true,
    "includeLeadTimes": false
  }
}
```

## Batch Operations API

### Batch Configuration Creation

Create multiple configurations in a single request.

```http
POST /api/batch/configurations
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configurations": [
    {
      "projectName": "CRATE-001",
      "dimensions": { "length": 48, "width": 36, "height": 30 }
    },
    {
      "projectName": "CRATE-002", 
      "dimensions": { "length": 60, "width": 48, "height": 40 }
    }
  ]
}
```

### Batch NX Generation

Generate NX expressions for multiple configurations.

```http
POST /api/batch/nx/generate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configurationIds": [
    "conf_1234567890",
    "conf_1234567891"
  ],
  "options": {
    "coordinateSystem": "z-up",
    "units": "inches"
  }
}
```

## Validation API

### Configuration Validation

Validate configuration against business rules.

```http
POST /api/validate/configuration
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configuration": {
    "dimensions": { "length": 300, "width": 150, "height": 100 },
    "weight": { "product": 15000 }
  },
  "validationRules": ["amat-standards", "shipping-limits"]
}
```

### Standards Compliance Check

Check compliance with Applied Materials standards.

```http
POST /api/validate/standards
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "configurationId": "conf_1234567890",
  "standards": ["ASME-Y14.5", "AMAT-CRATE", "ISTA-6A"]
}
```

## Webhook API

### Register Webhook

Register webhook for configuration events.

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://your-system.com/webhook",
  "events": ["configuration.created", "nx.generated", "export.completed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Event Types

Available webhook events:

- `configuration.created` - New configuration created
- `configuration.updated` - Configuration modified
- `configuration.deleted` - Configuration removed
- `nx.generated` - NX expression generated
- `export.completed` - Export process finished
- `validation.failed` - Validation errors detected

## Data Types

### CrateConfiguration

```typescript
interface CrateConfiguration {
  projectName: string;
  dimensions: {
    length: number;    // inches
    width: number;     // inches  
    height: number;    // inches
  };
  weight: {
    product: number;   // pounds
    maxGross?: number; // pounds
  };
  base: BaseConfiguration;
  cap: CapConfiguration;
  fasteners: FastenerConfiguration;
  vinyl: VinylConfiguration;
  specialRequirements?: string[];
}
```

### BaseConfiguration

```typescript
interface BaseConfiguration {
  type: 'standard' | 'heavy-duty';
  floorboardThickness: number;
  skidHeight: number;
  skidWidth: number;
  skidCount: number;
  skidSpacing: number;
  requiresRubStrips: boolean;
  material: 'pine' | 'oak';
}
```

### CapConfiguration

```typescript
interface CapConfiguration {
  topPanel: PanelConfiguration;
  frontPanel: PanelConfiguration;
  backPanel: PanelConfiguration;
  leftPanel: PanelConfiguration;
  rightPanel: PanelConfiguration;
}
```

### PanelConfiguration

```typescript
interface PanelConfiguration {
  thickness: number;
  material: 'plywood' | 'osb';
  reinforcement: boolean;
  ventilation: {
    enabled: boolean;
    type: 'holes' | 'slots';
    count: number;
    size: number;
  };
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid dimensions provided",
    "details": {
      "field": "dimensions.length",
      "value": -10,
      "constraint": "must be positive"
    }
  }
}
```

### Error Codes

- `INVALID_REQUEST` - Malformed request data
- `AUTHENTICATION_ERROR` - Invalid or missing API key
- `AUTHORIZATION_ERROR` - Insufficient permissions  
- `VALIDATION_ERROR` - Configuration validation failed
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Rate limit exceeded
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Temporary service outage

## Rate Limiting

API requests are limited per API key:

- **Standard**: 1,000 requests/hour
- **Premium**: 10,000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641646800
```

## Authentication

### API Key Authentication

Include API key in Authorization header:
```http
Authorization: Bearer YOUR_API_KEY
```

### Obtaining API Keys

Contact your Applied Materials administrator to request API access:

1. Submit API access request form
2. Specify intended use and volume
3. Receive API key and documentation
4. Configure rate limits and permissions

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @autocrate/api-client
```

```typescript
import { AutoCrateClient } from '@autocrate/api-client';

const client = new AutoCrateClient('YOUR_API_KEY');

const config = await client.configurations.create({
  projectName: 'My Crate',
  dimensions: { length: 48, width: 36, height: 30 }
});

const expression = await client.nx.generate(config.id);
```

### Python

```bash
pip install autocrate-api
```

```python
from autocrate import AutoCrateClient

client = AutoCrateClient('YOUR_API_KEY')

config = client.configurations.create({
    'projectName': 'My Crate',
    'dimensions': {'length': 48, 'width': 36, 'height': 30}
})

expression = client.nx.generate(config['id'])
```

## Examples

### Complete Workflow Example

```javascript
// Create configuration
const config = await client.configurations.create({
  projectName: 'INDUSTRIAL-CRATE-001',
  dimensions: { length: 72, width: 48, height: 36 },
  weight: { product: 2000 },
  base: {
    type: 'heavy-duty',
    skidCount: 4,
    material: 'oak'
  }
});

// Generate NX expression
const expression = await client.nx.generate(config.id, {
  coordinateSystem: 'z-up',
  applyStandards: 'amat'
});

// Export JT file
const jtExport = await client.export.jt(config.id, {
  version: '10.5',
  includeMetadata: true
});

// Download file
const fileData = await client.download(jtExport.downloadToken);
```

---

**Support**: For API support, contact technical support with your API key and request details.  
**Last Updated**: January 2025