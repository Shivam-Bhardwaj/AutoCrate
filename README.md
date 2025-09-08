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
- **Typography Scale**:
  - Semantic tokens defined in `src/styles/design-tokens.ts` using `clamp()` for responsive scaling
  - Fluid scaling from mobile to desktop with optimal readability at all viewports
  - Example typography scale:
    ```css
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
    --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
    ```
- **Semantic Color Tokens**: Context-aware color application with theme support
  - Primary, secondary, and accent color families
  - Success, error, warning, and info semantic colors
  - Automated contrast validation ensuring WCAG AA compliance
- **3D Label Enhancement**: Advanced canvas stroke and text-shadow techniques for improved 3D readability
  - Multi-layer stroke rendering for enhanced visibility
  - Dynamic text-shadow effects for depth perception
  - Anti-aliasing and smoothing for professional appearance
- **Variable Font Support**: Optimized font loading strategy with FOUT prevention
  - Font loading in `src/app/fonts.ts` with performance monitoring
  - Fallback font stacks for reliability
  - Variable font weights for optimal loading

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