# AutoCrate Standalone Prompts

## Project Overview
Prompt: Define and document the core features and requirements for the AutoCrate project, a web-based crate design tool with 3D visualization, to establish a solid development foundation.

## Testing Strategy - UPDATED
### Testing Framework Stack
- **Unit & Integration**: Vitest + React Testing Library
- **E2E Testing**: Puppeteer with Jest runner
- **Coverage**: Vitest coverage with 80% target
- **Test Organization**: 
  - `/tests/unit/` - Business logic and store tests
  - `/tests/integration/` - Component integration tests
  - `/tests/e2e/` - End-to-end user workflow tests

### Master Script Integration
The `autocrate.bat` script now provides complete testing control:
- **Interactive Menu**: Choose from 6 different test modes
- **Queue System**: Queue multiple test tasks for sequential execution
- **Direct Commands**: Run tests directly via CLI

### Testing Commands via autocrate.bat
```cmd
# Workflow commands
.\autocrate test           # Run all tests
.\autocrate test:unit       # Unit tests only
.\autocrate test:integration # Integration tests only
.\autocrate test:e2e        # E2E tests with Puppeteer
.\autocrate test:coverage   # Generate coverage report
.\autocrate test:watch      # Interactive watch mode

# Queue system for batch testing
.\autocrate queue add       # Add tests to queue
.\autocrate queue run       # Execute queued tests
```

### NPM Scripts (called by autocrate.bat)
- `npm test` - Run all Vitest tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:coverage` - Coverage with 80% threshold
- `npm run e2e` - Puppeteer E2E tests (headless)
- `npm run e2e:headed` - Puppeteer E2E tests (with browser)
- `npm run e2e:debug` - Debug E2E tests

### E2E Testing with Puppeteer
- **Configuration**: `tests/e2e/puppeteer.config.js`
- **Test Runner**: Jest with custom setup
- **Modes**: Headless, Headed, Debug
- **Coverage**: User workflows, responsive design, 3D rendering

### Testing Workflow
1. **Development**: Use `.\autocrate local` to run dev server + tests
2. **Pre-commit**: Use `.\autocrate prepare` to run all checks
3. **CI/CD**: GitHub Actions runs full test suite on push
4. **Queue System**: Batch multiple test types for efficiency

### Coverage Requirements
- **Target**: 80% for all metrics (lines, functions, branches, statements)
- **Report Location**: `/coverage/` directory
- **Excluded**: test files, configs, type definitions

### Testing Priorities - COMPLETED
1. ✅ E2E test configuration migrated to Puppeteer
2. ✅ Master script enhanced with full testing capabilities
3. ✅ Queue system implemented for batch testing
4. Next: Add more E2E test scenarios
5. Next: Increase unit test coverage for NX generator

## Planning Phase
### High Priority
Prompt: Implement a secure user authentication system for AutoCrate, including login, registration, and session management to protect user data and designs.

Prompt: Add export functionality to AutoCrate for saving and downloading crate designs in common formats like PDF or STL for 3D printing.

Prompt: Create RESTful API endpoints for AutoCrate to handle design persistence, allowing users to save, load, and manage crate designs on the server.

### Medium Priority
Prompt: Expand material options in AutoCrate's crate construction tool, adding new types like metal or composite with associated properties.

Prompt: Implement design templates and presets in AutoCrate to provide users with pre-built crate designs for quick customization.

Prompt: Add weight calculation functionality to AutoCrate based on selected materials and crate dimensions for accurate BOM generation.

Prompt: Create a print-friendly Bill of Materials (BOM) export feature in AutoCrate, formatting the list for easy printing and sharing.

## Development Phase
### Low Priority
Prompt: Add animation for the crate assembly process in AutoCrate's 3D viewer to demonstrate how parts fit together.

Prompt: Implement design sharing functionality in AutoCrate, allowing users to share crate designs via links or social media.

Prompt: Add multi-language support to AutoCrate's interface, including translations for key UI elements and tooltips.

Prompt: Create mobile-responsive controls for AutoCrate's 3D viewer to ensure usability on touch devices and smaller screens.

## Testing and Bug Fixes
Prompt: Fix viewport resize issues in AutoCrate's 3D viewer to maintain aspect ratio and performance on different screen sizes.

Prompt: Optimize performance for complex crate designs in AutoCrate by improving rendering efficiency and reducing load times.

## Documentation
Prompt: Create a user guide for AutoCrate's crate designer, covering basic usage, features, and troubleshooting.

Prompt: Document all API endpoints for AutoCrate, including request/response formats and authentication requirements.

Prompt: Add contribution guidelines for the AutoCrate project, outlining coding standards, pull request processes, and community involvement.