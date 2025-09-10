# Contributing to AutoCrate

We welcome contributions to AutoCrate! This guide will help you get started with contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- VS Code or preferred editor
- NX 2022+ (for testing CAD integration)

### Local Development

1. **Clone Repository**
```bash
git clone https://github.com/applied-materials/autocrate.git
cd autocrate
npm install
```

2. **Start Development Server**
```bash
npm run dev
# or use the autocrate script
./autocrate dev
```

3. **Run Tests**
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run lint          # Code linting
npm run type-check    # TypeScript validation
```

### Project Structure

```
autocrate/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── layout/      # Layout components
│   ├── services/        # Business logic services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── docs/                # Documentation
└── scripts/             # Build and utility scripts
```

## Contribution Guidelines

### Code Standards

**Formatting**
- 2 spaces indentation (NO TABS)
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline structures
- Use Prettier for consistent formatting

**Naming Conventions**
- `camelCase`: variables, functions
- `PascalCase`: types, interfaces, components
- `UPPER_SNAKE_CASE`: constants
- `_underscore`: prefix for intentionally unused variables

**TypeScript**
- Never use `any` type without justification
- Provide explicit return types for functions
- Use proper interface definitions
- Import types with `type` keyword

### Component Development

**React Components**
```typescript
// Good component structure
import { type FC } from 'react';

interface ComponentProps {
  title: string;
  isVisible?: boolean;
  onAction?: () => void;
}

export const Component: FC<ComponentProps> = ({
  title,
  isVisible = true,
  onAction,
}) => {
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      {/* Component content */}
    </div>
  );
};
```

**Styling Guidelines**
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Support both dark and light themes
- Maintain consistent spacing and typography

### State Management

Use Zustand for state management:

```typescript
// stores/example-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  value: string;
  setValue: (value: string) => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    {
      name: 'example-storage',
    }
  )
);
```

### Testing Requirements

**Unit Tests**
- Test business logic functions
- Test component behavior
- Mock external dependencies
- Aim for 80%+ code coverage

```typescript
// Example unit test
import { describe, it, expect } from 'vitest';
import { formatInches } from '@/utils/format-inches';

describe('formatInches', () => {
  it('should format decimal inches correctly', () => {
    expect(formatInches(12.5)).toBe('12.5"');
    expect(formatInches(0.75)).toBe('0.75"');
  });
});
```

**Integration Tests**
- Test API interactions
- Test component integration
- Test state management flows

**E2E Tests**
- Test complete user workflows
- Test NX integration flows
- Test export functionality

### Git Workflow

**Branch Naming**
- `feature/description` - New features
- `fix/description` - Bug fixes  
- `docs/description` - Documentation updates
- `test/description` - Test improvements

**Commit Messages**
Follow conventional commit format:
```
type(scope): description

feat(nx): add JT export validation
fix(ui): resolve mobile layout issue
docs(api): update authentication guide
test(e2e): add workflow validation tests
```

**Pull Request Process**

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Write code following standards
- Add/update tests
- Update documentation if needed

3. **Test Changes**
```bash
npm run lint
npm run type-check
npm run test
npm run build
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat(scope): description"
```

5. **Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

6. **PR Requirements**
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)

## NX Integration Development

### Testing NX Features

**Mock NX Services**
For local development without NX:
```typescript
// Use mocks in tests
const mockNXGenerator = {
  generateExpression: vi.fn().mockReturnValue(mockExpression),
  exportJT: vi.fn().mockResolvedValue(mockJTResult),
};
```

**Real NX Testing**
For production validation:
- Use Applied Materials NX test environment
- Test with actual NX 2022+ installations
- Validate JT file imports
- Verify drawing generation

### Coordinate System Standards

Always follow Z-up coordinate system:
```typescript
// Correct positioning
const basePosition = [0, 0, 0]; // Center of footprint on floor
const topPosition = [0, 0, height]; // Top of crate

// Incorrect - don't do this
const geometricCenter = [0, 0, height/2]; // Wrong for CAD
```

## Documentation Contributions

### Documentation Standards

**Markdown Format**
- Use clear headings and structure
- Include code examples where applicable
- Maintain Obsidian compatibility (no nested code blocks)
- Use tables for structured data

**API Documentation**
- Include request/response examples
- Document all parameters
- Provide error handling examples
- Include authentication requirements

**User Guides**
- Step-by-step instructions
- Screenshots where helpful
- Troubleshooting sections
- Cross-references to related topics

### Documentation Structure

```
docs/
├── getting-started.md      # New user guide
├── nx-integration.md       # NX workflow guide
├── api-reference.md        # Complete API docs
├── keyboard-shortcuts.md   # Shortcut reference
├── troubleshooting.md      # Problem solving
├── contributing.md         # This file
└── architecture.md         # System design
```

## Performance Considerations

### Frontend Performance

**Bundle Size**
- Monitor bundle size with `npm run analyze`
- Use dynamic imports for large components
- Optimize images and assets
- Remove unused dependencies

**3D Performance**
- Optimize Three.js scene complexity
- Use appropriate geometry detail levels
- Implement view frustum culling
- Monitor memory usage

**State Management**
- Minimize unnecessary re-renders
- Use proper memoization
- Debounce expensive operations
- Cache calculated values

### Backend Performance

**API Response Times**
- Target <200ms for simple operations
- <2s for NX expression generation
- <3s for JT exports
- Implement proper caching

## Security Guidelines

### Data Protection

**No Sensitive Data**
- Never commit API keys or secrets
- Use environment variables for configuration
- Sanitize user inputs
- Validate all data server-side

**Authentication**
- Use secure token-based authentication
- Implement proper session management
- Follow Applied Materials security policies
- Regular security audit reviews

## Release Process

### Version Management

**Semantic Versioning**
- MAJOR.MINOR.PATCH format
- Breaking changes increment MAJOR
- New features increment MINOR
- Bug fixes increment PATCH

**Release Preparation**
1. Update CHANGELOG.md
2. Run comprehensive tests
3. Update version in package.json
4. Create release branch
5. Deploy to staging
6. Perform integration testing
7. Deploy to production

### Deployment

**Staging Deployment**
```bash
./autocrate prepare    # Run all checks
./autocrate deploy     # Deploy to production
```

**Production Monitoring**
- Monitor error rates
- Check performance metrics
- Validate NX integration
- Monitor user feedback

## Getting Help

### Development Support

**Internal Resources**
- Applied Materials CAD Team
- AutoCrate Development Team
- Technical Architecture Group

**External Resources**
- Next.js Documentation
- Three.js Documentation
- NX API Documentation
- React/TypeScript Resources

### Communication Channels

**Development Team**
- Slack: #autocrate-development
- Email: autocrate-team@amat.com
- Weekly standup meetings

**Bug Reports**
Use GitHub Issues with:
- Clear problem description
- Steps to reproduce
- Expected vs actual behavior
- Browser/system information
- Console error messages

**Feature Requests**
Submit enhancement requests with:
- Business justification
- User stories/requirements
- Technical considerations
- Implementation timeline

## Code Review Guidelines

### Review Checklist

**Functionality**
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Performance considerations addressed

**Code Quality**
- [ ] Follows coding standards
- [ ] Proper TypeScript usage
- [ ] Clear variable/function names
- [ ] Appropriate comments (minimal)

**Testing**
- [ ] Unit tests provided
- [ ] Integration tests if needed
- [ ] Manual testing completed
- [ ] Test coverage maintained

**Documentation**
- [ ] API changes documented
- [ ] User-facing changes documented
- [ ] README updates if needed
- [ ] Changelog updated

### Review Process

1. **Automated Checks**
   - Linting passes
   - Type checking passes
   - All tests pass
   - Build succeeds

2. **Manual Review**
   - Code quality assessment
   - Architecture review
   - Security considerations
   - Performance impact

3. **Testing**
   - Functional testing
   - NX integration testing
   - Cross-browser validation
   - Mobile responsiveness

## Recognition

Contributors will be recognized through:
- Contributor list in README
- Release notes acknowledgments
- Internal team recognition
- Applied Materials innovation awards

---

Thank you for contributing to AutoCrate! Your contributions help improve CAD workflows for Applied Materials engineers worldwide.

**Questions?** Contact the development team at autocrate-team@amat.com

**Last Updated**: January 2025