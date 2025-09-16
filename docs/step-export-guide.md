# AutoCrate STEP Export Guide

## Overview

AutoCrate provides comprehensive STEP AP242 export functionality with Product Manufacturing Information (PMI) annotations. This enables seamless integration with downstream manufacturing systems and CAD software.

## Features

### ✅ STEP AP242 Compliance
- Full ISO-10303-21 compliance
- Automotive design schema support
- Semantic PMI annotations
- Manufacturing metadata integration

### ✅ PMI Annotations
- **Dimensional Annotations**: Product, crate, and clearance dimensions with tolerances
- **Geometric Tolerances**: GD&T symbols for flatness, perpendicularity, etc.
- **Manufacturing Notes**: Assembly instructions, material specs, quality requirements
- **Datum Features**: Primary, secondary, and tertiary datum planes

### ✅ Applied Materials Standards
- AMAT-0251-70054 compliance
- Material specifications
- Hardware requirements
- Quality standards

## API Usage

### Export STEP File

```typescript
POST /api/export-step
Content-Type: application/json

{
  "product": {
    "length": 46,
    "width": 38,
    "height": 91.5,
    "weight": 600,
    "centerOfGravity": { "x": 0, "y": 0, "z": 0 }
  },
  "clearances": {
    "width": 2,
    "length": 2,
    "height": 2
  },
  "skids": {
    "overhang": { "front": 2, "back": 2 },
    "count": 1,
    "pitch": 16
  },
  "materials": {
    "lumber": {
      "grade": "Standard",
      "treatment": "Untreated",
      "thickness": 1.5,
      "width": 3.5
    },
    "plywood": {
      "grade": "CDX",
      "thickness": 0.75
    },
    "hardware": {
      "coating": "Galvanized"
    }
  },
  "standards": {
    "appliedMaterials": true,
    "version": "AMAT-0251-70054"
  }
}
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/step
Content-Disposition: attachment; filename="autocrate_assembly_2025-01-13.stp"
X-STEP-Version: AP242
X-PMI-Included: true
X-Standards-Compliance: AMAT-0251-70054

ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('AutoCrate STEP Export with PMI'),'2;1');
FILE_NAME('autocrate_assembly_2025-01-13.stp','2025-01-13T...','${currentProductLabel}','Applied Materials','','','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;

DATA;
/* AutoCrate Configuration Data with PMI Annotations */
/* Generated: 2025-01-13T... */
/* Standard: AMAT-0251-70054 */
/* Version: 2.0.0 */
/* STEP Version: AP242 */
/* PMI Included: TRUE */

#1 = CARTESIAN_POINT('Crate Origin',(0.0,0.0,0.0));
#2 = CARTESIAN_POINT('Product Dimensions',(46.0,38.0,91.5));
#3 = CARTESIAN_POINT('Center of Gravity',(0.0,0.0,0.0));
#4 = DIMENSIONAL_SIZE('DIM_PRODUCT_LENGTH',46.0,'DIMENSIONAL_SIZE');
#5 = TOLERANCE_VALUE('DIM_PRODUCT_LENGTH_TOL',46.125,45.875,'INCH');
#6 = SEMANTIC_REFERENCE('PRODUCT_OVERALL_LENGTH','DIM_PRODUCT_LENGTH');
...

ENDSEC;
END-ISO-10303-21;
```

> **Note:** `${currentProductLabel}` resolves to the latest release label defined in
> `src/data/product-metadata.ts` (for example, `Autocrate 14.0.0`). Updating the
> changelog there keeps both the STEP exporter and documentation aligned.

## PMI Annotation Types

### Dimensional Annotations

| ID | Type | Description | Tolerance |
|---|---|---|---|
| `DIM_PRODUCT_LENGTH` | DIMENSIONAL_SIZE | Product overall length | ±0.125" |
| `DIM_PRODUCT_WIDTH` | DIMENSIONAL_SIZE | Product overall width | ±0.125" |
| `DIM_PRODUCT_HEIGHT` | DIMENSIONAL_SIZE | Product overall height | ±0.125" |
| `DIM_CRATE_LENGTH` | DIMENSIONAL_SIZE | Crate overall length | ±0.25" |
| `DIM_CRATE_WIDTH` | DIMENSIONAL_SIZE | Crate overall width | ±0.25" |
| `DIM_CRATE_HEIGHT` | DIMENSIONAL_SIZE | Crate overall height | ±0.25" |
| `DIM_CLEARANCE_WIDTH` | DIMENSIONAL_SIZE | Internal clearance width | - |
| `DIM_CLEARANCE_LENGTH` | DIMENSIONAL_SIZE | Internal clearance length | - |
| `DIM_CLEARANCE_HEIGHT` | DIMENSIONAL_SIZE | Internal clearance height | - |

### Geometric Tolerances

| ID | Type | Tolerance | Description |
|---|---|---|---|
| `GTOL_SKID_FLATNESS` | FLATNESS | 0.125" | Skid top surface flatness |
| `GTOL_PANEL_PERPENDICULARITY` | PERPENDICULARITY | 0.25" | Panel perpendicularity to datum A |

### Manufacturing Notes

| ID | Type | Description |
|---|---|---|
| `NOTE_MATERIAL_SPECS` | MANUFACTURING_NOTE | Material specifications and standards |
| `NOTE_ASSEMBLY_INSTRUCTIONS` | ASSEMBLY_NOTE | Step-by-step assembly procedures |
| `NOTE_QUALITY_REQUIREMENTS` | QUALITY_NOTE | Quality assurance requirements |

### Datum Features

| ID | Name | Type | Description |
|---|---|---|---|
| `DATUM_A` | A | DATUM_PLANE | Primary datum (bottom of crate) |
| `DATUM_B` | B | DATUM_PLANE | Secondary datum (front face) |
| `DATUM_C` | C | DATUM_PLANE | Tertiary datum (left face) |

## Semantic References

All PMI annotations include semantic references for downstream manufacturing integration:

- `PRODUCT_OVERALL_LENGTH` - Product length specification
- `CRATE_OVERALL_LENGTH` - Crate length specification
- `INTERNAL_CLEARANCE_WIDTH` - Internal clearance specification
- `SKID_FLATNESS_REQUIREMENT` - Skid flatness tolerance
- `PANEL_PERPENDICULARITY_REQUIREMENT` - Panel perpendicularity tolerance
- `MATERIAL_SPECIFICATION_REQUIREMENTS` - Material specifications
- `ASSEMBLY_PROCEDURE_REQUIREMENTS` - Assembly instructions
- `QUALITY_ASSURANCE_REQUIREMENTS` - Quality requirements

## Testing

### Run Demo Script

```bash
node scripts/demo-step-export.js
```

### Test API Endpoint

```bash
# Start development server
npm run dev

# In another terminal
node scripts/test-step-api.js
```

### Unit Tests

```bash
npm test -- --testPathPattern=step-exporter.test.ts
```

## Integration Examples

### JavaScript/TypeScript

```typescript
import { STEPExporter } from '@/lib/step-processor'
import { generatePMIAnnotations } from '@/lib/step-processor/pmi-annotations'

const config = { /* crate configuration */ }
const dimensions = calculateCrateDimensions(config)
const pmiAnnotations = generatePMIAnnotations(config, dimensions)

const stepExporter = new STEPExporter()
const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)

// Download file
const blob = new Blob([stepFile.content], { type: 'application/step' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = stepFile.filename
a.click()
```

### React Component

```tsx
import { useState } from 'react'
import { useCrateStore } from '@/stores/crate-store'

export function STEPExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const config = useCrateStore(state => state.configuration)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `autocrate_assembly_${new Date().toISOString().split('T')[0]}.stp`
      a.click()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {isExporting ? 'Exporting...' : 'Export STEP'}
    </button>
  )
}
```

## File Structure

```
src/lib/step-processor/
├── index.ts                 # Main exports
├── step-types.ts           # TypeScript definitions
├── step-exporter.ts        # STEP AP242 exporter
├── pmi-annotations.ts      # PMI annotation generator
└── __tests__/
    └── step-exporter.test.ts # Unit tests
```

## Standards Compliance

- **ISO-10303-21**: STEP file format standard
- **STEP AP242**: Managed model-based 3D engineering
- **AMAT-0251-70054**: Applied Materials shipping crate standards
- **GD&T**: Geometric dimensioning and tolerancing (ASME Y14.5)

## Performance

- **File Size**: Typically 5-15KB for standard crate configurations
- **Generation Time**: <100ms for typical configurations
- **Memory Usage**: Minimal, generates file in streaming fashion
- **Browser Compatibility**: All modern browsers with fetch API support

## Troubleshooting

### Common Issues

1. **Large File Sizes**: Reduce PMI annotations or simplify geometry
2. **Slow Generation**: Check for complex configurations with many components
3. **Import Errors**: Ensure CAD software supports STEP AP242 with PMI
4. **Missing Annotations**: Verify configuration includes all required fields

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=step-processor npm run dev
```

## Future Enhancements

- [ ] Support for additional STEP schemas (AP203, AP214)
- [ ] Advanced GD&T symbols and tolerances
- [ ] Custom annotation templates
- [ ] Batch export capabilities
- [ ] Cloud storage integration
- [ ] Real-time collaboration annotations
