# AutoCrate - Professional Crate Design & NX CAD Integration

AutoCrate is a professional web application for designing industrial shipping crates with integrated NX CAD workflow and 3D visualization capabilities.

## 🚀 Quick Start

```bash
git clone https://github.com/applied-materials/autocrate.git
cd autocrate
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start designing crates.

## ✨ Features

- **Interactive 3D Visualization** - Real-time 3D rendering with Z-up coordinate system
- **NX CAD Integration** - Generate parametric expressions for Siemens NX 2022+
- **Applied Materials Standards** - ASME Y14.5-2009 compliant drawings and part numbering
- **Bill of Materials** - Automatic cost estimates and material specifications
- **JT Export/Import** - Native CAD file exchange with NX
- **Mobile-First Design** - Responsive interface optimized for all devices
- **Professional Testing** - 80% code coverage with comprehensive test suites

## 🎨 Typography & Design System

AutoCrate features a comprehensive semantic typography system with responsive scaling and accessibility-first design:

### Semantic Tokens
- **Typography Scale**: Fluid typography using `clamp()` functions for optimal readability across devices
- **Color System**: WCAG AA compliant color tokens with automated contrast validation
- **3D Label Enhancement**: Canvas stroke and text-shadow techniques for improved 3D readability
- **Variable Font Support**: Optimized font loading with FOUT prevention

### Design Token Locations
- **Typography Tokens**: `src/styles/design-tokens.ts`
- **Color Palette**: `src/app/globals.css` and `tailwind.config.ts`
- **Theme Configuration**: `src/components/ThemeProvider.tsx`

### Accessibility Features
- **Contrast Ratios**: All text combinations meet WCAG AA standards (4.5:1 minimum)
- **Responsive Scaling**: Typography scales fluidly from mobile to desktop
- **Focus Indicators**: Enhanced focus states for keyboard navigation
- **Screen Reader Support**: Proper ARIA labels and semantic HTML structure

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS, Radix UI
- **State**: Zustand with persistence
- **Testing**: Vitest, Playwright, Testing Library
- **Deployment**: Vercel with GitHub Actions CI/CD

## 📚 Documentation

**Complete documentation is available in the `/docs` folder:**

- [Getting Started Guide](./docs/getting-started.md) - Quick start tutorial
- [NX Integration](./docs/nx-integration.md) - CAD workflow and JT export
- [API Reference](./docs/api-reference.md) - Complete API documentation
- [Keyboard Shortcuts](./docs/keyboard-shortcuts.md) - NX-compatible shortcuts
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [Contributing](./docs/contributing.md) - Development guidelines

**[📖 View Full Documentation →](./docs/)**

## 🚀 Production Deployment

AutoCrate is deployed at: **[https://autocrate.vercel.app](https://autocrate.vercel.app)**

### Deploy Your Own

```bash
npm run build     # Build for production
./autocrate deploy # Deploy to Vercel
```

## 🧪 Testing

```bash
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests  
npm run lint           # Code linting
npm run type-check     # TypeScript validation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details on:

- Development setup
- Code standards
- Testing requirements
- Pull request process

## 📋 System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **NX Integration**: NX 2022+ for CAD workflow
- **Node.js**: 18+ for development

## 🔧 Key Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm test           # Run all tests
./autocrate        # Interactive project menu
```

## 📝 License

Proprietary - Applied Materials, Inc. All rights reserved.

## 📞 Support

- **Documentation**: Check the [/docs](./docs/) folder
- **Issues**: [GitHub Issues](https://github.com/applied-materials/autocrate/issues)
- **Technical Support**: Contact Applied Materials CAD team

---

**Version**: 3.0.0 | **Last Updated**: January 2025