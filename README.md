# AutoCrate - NX CAD Expression Generator

AutoCrate is a professional web application for designing industrial shipping crates and generating NX CAD expressions. The system provides real-time 3D visualization and automated generation of parametric CAD models compatible with Siemens NX.

## Features

- **Interactive 3D Visualization**: Real-time 3D rendering of crate design matching CAD specifications
- **Parametric Design**: Fully configurable crate components including base, panels, fasteners, and vinyl wrapping
- **NX Expression Generation**: Automated creation of NX CAD expression files for direct import
- **Bill of Materials**: Automatic calculation of required materials and estimated costs
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **3D Rendering**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: Zustand
- **Validation**: Zod, React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/autocrate.git
cd autocrate
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
AutoCrate/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── CrateViewer3D.tsx
│   │   ├── InputForms.tsx
│   │   └── OutputSection.tsx
│   ├── lib/             # Utility functions
│   ├── services/        # Business logic
│   │   └── nx-generator.ts
│   ├── store/           # State management
│   │   └── crate-store.ts
│   └── types/           # TypeScript definitions
│       └── crate.ts
├── public/              # Static assets
└── docs/               # Documentation
```

## Usage Guide

### 1. Configure Crate Dimensions

- Enter length, width, and height
- Select measurement unit (mm or inches)
- Specify product weight and maximum gross weight

### 2. Design Base Configuration

- Choose base type (standard, heavy-duty, export)
- Set floorboard thickness and skid dimensions
- Select material (pine, oak, plywood, OSB)

### 3. Configure Panels

- Set thickness for each panel (top, front, back, left, right)
- Choose materials and reinforcement options
- Enable ventilation with customizable patterns

### 4. Select Fasteners

- Choose fastener type (Klimp connectors, nails, screws, bolts)
- Set size and spacing
- Select material (steel, stainless, galvanized)

### 5. Optional Vinyl Wrapping

- Enable waterproof, vapor barrier, or cushion vinyl
- Set thickness and coverage options

### 6. Generate Output

- View real-time 3D preview
- Download NX expression file
- Review bill of materials and cost estimates

## NX Expression File Format

The generated expression files contain:

- Parametric variables for all dimensions
- Feature creation commands for base, panels, and accessories
- Material calculations and constraints
- Fastener placement patterns
- Optional vinyl wrapping specifications

## API Reference

### NXExpressionGenerator

```typescript
const generator = new NXExpressionGenerator(configuration);
const expression = generator.generateExpression();
const blob = generator.exportToFile();
```

### Store Actions

```typescript
updateDimensions(dimensions: Partial<CrateDimensions>)
updateBase(base: Partial<ShippingBase>)
updatePanel(panelKey: keyof CrateCap, panel: Partial<PanelConfig>)
updateFasteners(fasteners: Partial<Fasteners>)
updateVinyl(vinyl: Partial<VinylConfig>)
```

## Deployment

The application is deployed on Vercel at [https://autocrate.vercel.app/](https://autocrate.vercel.app/)

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Testing

```bash
npm run test        # Run tests
npm run lint        # Lint code
npm run type-check  # Type checking
```

## License

Proprietary - All rights reserved

## Support

For support and questions, contact the engineering team.

## Changelog

### Version 1.0.0
- Initial release with core functionality
- 3D visualization engine
- NX expression generator
- Material calculator
- Responsive UI design