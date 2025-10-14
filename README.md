# AutoCrate NX Generator

A web-based tool for generating NX CAD expressions for shipping crate design. Creates parametric crate models using the Two Diagonal Points method with real-time 3D visualization.

## Features

- **NX Expression Generation** - Generate parametric expressions compatible with NX CAD
- **3D Visualization** - Real-time preview of crate design
- **BOM Calculator** - Automatic Bill of Materials generation
- **Smart Sizing** - Automatic component sizing based on product weight
- **Export Options** - Download expressions as .exp files and BOM as CSV

## Quick Setup

### Universal Linux Setup (One Prompt!)

See **[UNIVERSAL_SETUP_PROMPT.md](UNIVERSAL_SETUP_PROMPT.md)** - One prompt works on Ubuntu, Debian, Arch, WSL, Raspberry Pi, etc.

### Raspberry Pi 5 Specific

See **[RPI5_SETUP.md](RPI5_SETUP.md)** and **[RPI5_CLAUDE_PROMPTS.md](RPI5_CLAUDE_PROMPTS.md)** for Armbian/ARM64 setup.

### Manual Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

### Claude Code Development Agents

AutoCrate includes 12 custom slash commands for accelerated development:

```
/test       - Run complete test suite
/build      - Production build verification
/deploy     - Version bump and deploy
/verify     - Full health check
/feature    - Add new feature workflow
/quick-fix  - Rapid bug fix workflow
/step       - Work with STEP files
/nx         - Work with NX expressions
/3d         - Work with 3D visualization
/lumber     - Modify lumber sizes
/hardware   - Add/modify hardware
/scenario   - Add/modify scenarios
```

See **[CLAUDE_AGENTS_GUIDE.md](CLAUDE_AGENTS_GUIDE.md)** for complete usage guide.

## Usage

1. **Enter Product Dimensions**
   - Length (Y-axis): Front to back dimension
   - Width (X-axis): Left to right dimension
   - Height (Z-axis): Vertical dimension
   - Weight: Product weight in pounds

2. **View Results**
   - **3D Visualization**: Interactive 3D model of the crate
   - **NX Expressions**: Copy or download expressions for NX import

- **BOM**: View and download Bill of Materials

## Documentation

- [Documentation index](docs/README.md)
- [STEP to Web Conversion guide](docs/STEP_TO_WEB_CONVERSION.md)
- [Web stack primer (HTML)](docs/web-stack-overview.html)

3. **Export Files**
   - Click "Download NX Expressions" for .exp file
   - Click "Download BOM" for CSV file

## NX Integration

1. Open NX CAD
2. Create new part file or open crate template
3. Go to Tools > Expressions
4. Import the downloaded .exp file
5. Update/regenerate model

## Coordinate System

- **Origin**: Center of crate at floor level
- **X-axis**: Width (red) - left/right
- **Y-axis**: Length (blue) - front/back
- **Z-axis**: Height (green) - vertical
- **Symmetry**: Crate is symmetric about Z-Y plane (X=0)

## Component Structure

### SHIPPING_BASE

- Skids (2-4 based on weight)
- Floorboard

### CRATE_CAP

- Front Panel
- Back Panel
- Left End Panel
- Right End Panel
- Top Panel
- Cleats (reinforcement)

## Technical Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Three.js/React Three Fiber** - 3D visualization
- **Tailwind CSS** - Styling

## Development

### Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   └── CrateVisualizer.tsx
├── lib/             # Core logic
│   └── nx-generator.ts
```

### Key Files

- `nx-generator.ts` - NX expression generation logic
- `CrateVisualizer.tsx` - 3D visualization component
- `page.tsx` - Main application interface

## License

Proprietary - Applied Materials

## Support

For issues or questions, contact the engineering team.
