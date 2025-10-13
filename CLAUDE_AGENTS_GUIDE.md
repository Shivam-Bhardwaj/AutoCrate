# Claude Code Agents Guide for AutoCrate

Complete guide to using Claude Code's custom slash commands and agents for accelerated AutoCrate development.

## Quick Start

AutoCrate includes 12 specialized slash commands. Just type `/command` in Claude Code:

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

## Common Workflows

### Daily Development

**Starting work:**

```
What's the project status?
/verify
```

**After making changes:**

```
/test
```

**Before lunch/end of day:**

```
git status
/verify
```

### Deploying Changes

**Bug fix deployment:**

```
/verify
/deploy
> Select: patch
```

**Feature deployment:**

```
/feature
> [Describe feature]
> [Implement and test]
/verify
/deploy
> Select: minor
```

### Working on Specific Areas

**3D Visualization:**

```
/3d
> I need to add shadows to the crate visualization
```

**STEP Export:**

```
/step
> The front panel isn't showing up in the STEP file
```

**NX Expressions:**

```
/nx
> Add support for 10x10 lumber in skid calculations
```

## Detailed Command Usage

### `/test` - Testing Workflow

Runs comprehensive test suite:

- TypeScript type checking
- Jest unit tests with coverage
- Production build verification
- Security audit

**Example:**

```
/test
```

**When to use:**

- Before committing changes
- After modifying core logic
- Before creating a PR
- During code review

**What it does:**

1. Runs `npm run type-check`
2. Runs `npm test` with coverage
3. Runs `npm run build`
4. Reports results and suggests fixes

### `/build` - Build Verification

Creates and verifies production build:

- Builds with `npm run build`
- Checks for errors/warnings
- Verifies build size
- Tests production server startup

**Example:**

```
/build
```

**When to use:**

- Before deploying
- After dependency updates
- After modifying build config
- Testing performance

**What it reports:**

- Build time
- Bundle size
- Warnings or errors
- Production readiness

### `/deploy` - Deployment Workflow

Manages version bumping and deployment:

- Asks for version type (patch/minor/major)
- Runs full test suite
- Executes deploy script
- Verifies version bump
- Pushes to GitHub (triggers Vercel)

**Example:**

```
/deploy
> What type of release? patch

[Runs tests, bumps version, commits, pushes]

✅ Deployed version 13.2.1
   URL: https://autocrate.vercel.app
```

**When to use:**

- Bug fixes → patch
- New features → minor
- Breaking changes → major

**Safety:** Won't deploy if tests fail

### `/verify` - Health Check

Complete codebase verification:

- Git status (uncommitted changes)
- TypeScript compilation
- ESLint
- Unit tests
- Production build
- Security audit
- Outdated dependencies
- Version consistency

**Example:**

```
/verify

✅ Git: Clean working directory
✅ TypeScript: No errors
✅ Tests: All passing
✅ Build: Successful (1.2MB)
✅ Security: No vulnerabilities
⚠️ Dependencies: 3 outdated packages
✅ Ready for deployment
```

**When to use:**

- Before creating a PR
- Before deploying
- After major refactoring
- Weekly health check

### `/feature` - Feature Development

Guided feature development workflow:

1. Describe the feature
2. Create implementation plan
3. Review plan with user
4. Implement step-by-step
5. Write tests
6. Run test suite
7. Update documentation
8. Create git commit
9. Optionally create PR/deploy

**Example:**

```
/feature
> Add PDF export for crate specifications

Claude creates plan:
1. Create src/lib/pdf-generator.ts
2. Add API route /api/pdf-export
3. Add UI button in main page
4. Write tests
5. Update documentation

Proceed? yes

[Implements each step with tests]

✅ Feature complete: PDF export
   Files changed: 4
   Tests added: 8
   Ready to commit? yes
```

**When to use:**

- Adding new features
- Major enhancements
- Multi-file changes

**Benefits:**

- Structured approach
- Ensures testing
- Maintains documentation

### `/quick-fix` - Rapid Bug Fixes

Fast workflow for small bug fixes:

1. Describe the bug
2. Identify relevant files
3. Propose fix
4. Implement fix
5. Run related tests
6. Create commit
7. Optionally push/deploy

**Example:**

```
/quick-fix
> The klimp placement is off by 1 inch on the left panel

[Analyzes klimp-calculator.ts]
[Proposes fix]
[Implements]
[Runs tests]

✅ Bug fixed
   File: src/lib/klimp-calculator.ts
   Tests: All passing
   Push to GitHub? yes
```

**When to use:**

- Small, focused bugs
- Single-file changes
- Quick hotfixes
- Production issues

**Speed:** Gets fixes out fast while maintaining quality

### `/step` - STEP File Work

Specialized for STEP file generation:

**Key files:**

- `src/lib/step-generator.ts` - Main generator
- `src/lib/klimp-step-integration.ts` - Klimp export
- `src/lib/lag-step-integration.ts` - Lag screws
- `src/lib/__tests__/step-generator.test.ts` - Tests

**Example:**

```
/step
> Add support for custom stencils in STEP assembly

[Claude focuses on STEP files]
[Understands ISO 10303-21 AP242 format]
[Implements changes]
[Tests with sample configurations]
```

**When to use:**

- STEP export bugs
- Adding new components to assembly
- CAD integration issues
- Geometry definitions

### `/nx` - NX Expression Work

Specialized for NX CAD expressions:

**Key files:**

- `src/lib/nx-generator.ts` - Expression generator
- `src/lib/crate-constants.ts` - Constants
- `src/lib/__tests__/nx-generator.test.ts` - Tests
- `src/app/api/nx-export/route.ts` - API

**Example:**

```
/nx
> Support 12x12 lumber in floorboard calculations

[Claude understands parametric modeling]
[Updates two-point diagonal construction]
[Tests with different configurations]
```

**When to use:**

- Adding lumber sizes
- Modifying parametric logic
- Formula updates
- CAD integration

### `/3d` - 3D Visualization Work

Specialized for React Three Fiber rendering:

**Key files:**

- `src/components/CrateVisualizer.tsx` - Main 3D component
- `src/components/KlimpModel.tsx` - Klimp visualization
- `src/app/page.tsx` - State management

**Example:**

```
/3d
> Add shadows and better lighting to the crate

[Claude understands Three.js]
[Updates materials and lights]
[Tests with different scenarios]
[Optimizes performance]
```

**When to use:**

- 3D rendering bugs
- New 3D components
- Material/lighting changes
- Performance optimization

### `/lumber` - Lumber Configuration

Add or modify lumber sizes:

**Key files:**

- `src/lib/crate-constants.ts` - Dimensions
- `src/lib/nx-generator.ts` - Generation logic
- `src/components/CrateVisualizer.tsx` - 3D
- `src/components/LumberCutList.tsx` - Display

**Example:**

```
/lumber
> Add 12x12 lumber support for heavy-duty skids

[Claude adds to all necessary files]
[Updates TypeScript types]
[Adds 3D visualization]
[Tests with heavy crates]
```

**When to use:**

- Adding new lumber sizes
- Modifying dimensions
- Supporting new use cases

### `/hardware` - Hardware Systems

Add or modify hardware (klimps, screws, etc.):

**Key files:**

- `src/lib/klimp-calculator.ts` - Klimp logic
- `src/lib/lag-step-integration.ts` - Lag screws
- `src/components/KlimpModel.tsx` - 3D model

**Example:**

```
/hardware
> Add support for corner brackets

[Creates calculator with spacing rules]
[Creates STEP integration]
[Creates 3D component]
[Adds tests]
[Updates assembly structure]
```

**When to use:**

- Adding new fasteners
- Modifying placement logic
- New hardware types

### `/scenario` - Crate Scenarios

Add or modify preset configurations:

**Key file:**

- `src/components/ScenarioSelector.tsx`

**Example:**

```
/scenario
> Add "Aerospace Equipment" scenario for lightweight, high-precision crates

[Claude asks for dimensions and specs]
[Adds to SCENARIO_PRESETS]
[Tests loading and visualization]
[Verifies STEP/NX export]
```

**When to use:**

- Adding customer presets
- Industry-specific configs
- Common use cases

## Combining Commands

You can chain commands for complex workflows:

**Complete feature workflow:**

```
/feature
> Add temperature markings to panels

[After feature is implemented]

/test
/verify
/deploy
```

**Quick fix and deploy:**

```
/quick-fix
> [Bug description]

[After fix]

/deploy
```

**Pre-PR checklist:**

```
/verify
/test
git status

[Create PR]
```

## Advanced Usage

### Custom Command Chains

Create your own workflows:

**Morning routine:**

```
What changed since yesterday?
/verify
Show me any failed deployments
```

**Before leaving:**

```
/test
git status
Summarize what I worked on today
```

### Scripting Commands

Use in automation:

```bash
# CI/CD pipeline
claude-code /verify || exit 1
claude-code /build || exit 1
```

### Editing Commands

Customize any command by editing `.claude/commands/command-name.md`:

```bash
# Make /test also run E2E tests
vim .claude/commands/test.md
# Add: "Run E2E tests with npm run test:e2e"
```

## Best Practices

### 1. Use Specific Commands

❌ **Don't:** "Test everything"
✅ **Do:** `/verify`

❌ **Don't:** "I want to add a feature for exporting to DXF"
✅ **Do:** `/feature` then describe it

### 2. Verify Before Deploying

Always run `/verify` before `/deploy`:

```
/verify
[Check results]
/deploy
```

### 3. Use Domain Commands

When working in a specific area, use the domain command:

**Working on STEP files:** Start with `/step`
**Working on 3D:** Start with `/3d`
**Working on NX:** Start with `/nx`

This gives Claude context about what you're doing.

### 4. Let Commands Guide You

Commands ask questions - answer them:

```
/deploy
> What type of release? [Claude asks]
> patch [You answer]
```

### 5. Chain for Complex Tasks

```
/feature
> [Feature description]

[After implementation]

/test
/verify
/deploy
```

## Troubleshooting

### Command Not Working

**Try:**

```
Show me all slash commands
What does /command-name do?
```

**Check:**

- File exists: `.claude/commands/command-name.md`
- Restart Claude Code
- Run manually: `cat .claude/commands/command-name.md`

### Tests Failing

```
/test
[See failures]

Fix the issues
/test again
```

### Deploy Blocked

```
/deploy
> Tests failed!

/test
[Fix issues]
/verify
/deploy
```

## Tips & Tricks

### 1. Ask for Command Help

```
What can /step do?
Show me examples of using /feature
```

### 2. Combine with Context

```
/3d
I'm working on adding floor reflections
```

### 3. Use After Tool Usage

After using a tool (Read, Edit, etc.), use a command:

```
[Edit some files]
/test
```

### 4. Get Command Suggestions

```
I want to add a new type of fastener
> Claude suggests: Use /hardware
```

### 5. Check Status

```
What's the current version?
When was the last deployment?
/verify
```

## Performance Tips

Commands are fast because they:

- Focus on specific tasks
- Know the codebase structure
- Run only necessary checks
- Cache results when possible

**Typical times:**

- `/test`: 30 seconds
- `/build`: 25 seconds
- `/verify`: 60 seconds
- `/deploy`: 90 seconds

## Getting Help

### In Claude Code

```
Help with slash commands
What commands are available?
How do I use /feature?
```

### Documentation

- `.claude/README.md` - Configuration guide
- `.claude/commands/` - Command definitions
- `.claude/workflows/` - Workflow docs
- `CLAUDE.md` - Project guide

### Examples

```
Show me an example of using /deploy
Walk me through /feature workflow
What's the best command for fixing a bug?
```

## Summary

**Most used commands:**

1. `/test` - Before committing
2. `/verify` - Before deploying
3. `/deploy` - Ship to production
4. `/feature` - Add new functionality
5. `/quick-fix` - Fix bugs fast

**Domain-specific:**

- `/step` - STEP files
- `/nx` - NX expressions
- `/3d` - 3D visualization
- `/lumber` - Lumber sizes
- `/hardware` - Hardware systems
- `/scenario` - Presets

**Power user:**

- Chain commands for workflows
- Customize in `.claude/commands/`
- Use with context for better results
- Combine with regular Claude conversation

---

**Quick Reference:** Type `/` in Claude Code to see all commands!
