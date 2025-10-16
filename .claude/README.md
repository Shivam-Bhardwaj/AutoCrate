# AutoCrate Claude Configuration

This directory contains Claude Code configuration and custom commands to accelerate AutoCrate development.

## Slash Commands

AutoCrate includes specialized slash commands for common development workflows. Just type `/command-name` in Claude Code.

### Development Workflow Commands

#### `/test`

Run the complete test suite including TypeScript checking, Jest tests, and build verification.

**Use when**: Before committing changes or deploying

#### `/build`

Build AutoCrate for production and verify build output.

**Use when**: Testing production readiness

#### `/deploy`

Deploy AutoCrate with proper version management (patch/minor/major).

**Use when**: Ready to ship changes to production

#### `/verify`

Complete health check: git status, tests, build, security audit, dependencies.

**Use when**: Before creating a PR or after major changes

### Feature Development Commands

#### `/feature`

Guided workflow for adding new features with planning, implementation, tests, and documentation.

**Use when**: Building a new feature

#### `/quick-fix`

Rapid bug fix workflow for small, focused fixes.

**Use when**: Need to fix a bug quickly

### GitHub Workflow Commands

#### `/issue`

Create a professional GitHub issue with proper formatting, labels, and acceptance criteria.

**Use when**: You want to track a bug, feature, or task

**Example**:

```
/issue
> Add PDF export for crate specifications
> [Claude drafts a complete issue with sections, checkboxes, labels]
```

#### `/pr`

Create a pull request with comprehensive description, test results, and proper formatting.

**Use when**: Ready to merge your branch to main

**Example**:

```
/pr
> [Claude analyzes your changes and creates a detailed PR description]
```

#### `/start-work`

Begin working on a GitHub issue with proper branch naming, implementation plan, and task tracking.

**Use when**: Starting work on an issue or feature

**Example**:

```
/start-work
> Issue #42: Fix lag screw placement
> [Claude creates branch, makes plan, tracks progress]
```

#### `/review`

Perform an AI code review on your changes before committing or creating a PR.

**Use when**: Want feedback on your code before pushing

**Example**:

```
/review
> [Claude analyzes staged changes for bugs, style, tests, docs]
```

### Domain-Specific Commands

#### `/step`

Work with STEP file generation (ISO 10303-21 AP242 CAD export).

**Use when**: Debugging or enhancing STEP export

#### `/nx`

Work with NX CAD expression generation.

**Use when**: Modifying parametric modeling logic

#### `/3d`

Work with React Three Fiber 3D visualization.

**Use when**: Debugging or enhancing 3D rendering

#### `/geometry`

Work with crate geometry, dimensional calculations, and component positioning.

**Use when**: Issues with dimensions, clearances, or component placement

#### `/lumber`

Add or modify lumber sizes in the crate design.

**Use when**: Adding new lumber dimensions

#### `/hardware`

Add or modify hardware systems (klimps, lag screws, etc.).

**Use when**: Adding new fasteners or hardware

#### `/scenario`

Add or modify predefined crate scenarios.

**Use when**: Creating new preset configurations

## Example Usage

### Quick Bug Fix

```
/quick-fix
> [Describe the bug you found]
> [Claude guides you through fix, test, and commit]
```

### Adding a New Feature

```
/feature
> [Describe the feature]
> [Claude creates a plan and implements it with tests]
```

### Before Deploying

```
/verify
> [Claude runs full health check]

/deploy
> [Claude handles version bump, tests, and deployment]
```

### Working on STEP Export

```
/step
> I need to add support for custom hardware in the STEP assembly
> [Claude helps you modify step-generator.ts and related files]
```

## Configuration Files

### `settings.local.json`

Defines allowed commands that don't require user approval.

Currently auto-approved:

- Git operations (init, add, commit, push, checkout, branch)
- npm test and coverage commands
- npm install
- Playwright E2E tests

### `project-status.json`

Tracks active work streams, module status, and recent changes for coordinating multiple AI agents.

### `version-config.json`

Version management configuration for the project.

### `workflows/`

Contains workflow documentation for deployment, version bumping, and making changes.

## Best Practices

### Use Slash Commands for Common Tasks

Instead of explaining what you want to do, use the appropriate slash command:

[X] **Don't**: "I want to deploy a new version with bug fixes"
[DONE] **Do**: `/deploy` (then select "patch")

[X] **Don't**: "Run all the tests"
[DONE] **Do**: `/test`

### Use Verify Before Deploying

Always run `/verify` before deploying to catch issues early:

```
/verify
/deploy
```

### Use Feature Command for Planning

Let `/feature` help you plan before coding:

```
/feature
> Add PDF export for crate specifications
> [Claude creates detailed plan before implementing]
```

### Domain Commands for Focused Work

When working on a specific part of the codebase, use domain-specific commands:

```
/3d
> The klimp models aren't rendering correctly
> [Claude focuses on 3D visualization files]
```

## Command Development

To add a new custom command:

1. Create a markdown file in `.claude/commands/`
2. Name it `command-name.md`
3. Write the command prompt/instructions
4. Use it with `/command-name`

Example: `.claude/commands/mycommand.md`

```markdown
Do something specific for AutoCrate:

1. Step one
2. Step two
3. Step three

Ask the user for input if needed.
```

Then use with `/mycommand`

## Allowed Commands

The following Bash commands are pre-approved and won't prompt for confirmation:

**Git**: init, remote add, add, commit, push, checkout, branch
**npm**: test, test:coverage, test:e2e, install
**Playwright**: All npx playwright commands

To add more allowed commands, edit `.claude/settings.local.json`.

## Tips

### Chain Commands

You can ask Claude to run multiple commands:

```
Run /verify and if everything passes, run /deploy
```

### Get Help on Commands

Just ask:

```
What does /step do?
Show me all available slash commands
```

### Customize Commands

Edit any `.md` file in `.claude/commands/` to customize behavior.

## Advanced Usage

### Parallel Development

Use `project-status.json` to coordinate when multiple developers or AI agents are working simultaneously.

### CI/CD Integration

Slash commands can be scripted for CI/CD pipelines:

```bash
# In CI environment
claude-code /verify
claude-code /build
```

### Custom Agents

Create specialized agents by combining commands with specific prompts in workflow files.

## Troubleshooting

### Command Not Found

If `/command-name` doesn't work:

1. Check that `.claude/commands/command-name.md` exists
2. Restart Claude Code
3. Try typing the full path: `.claude/commands/command-name.md`

### Permission Denied

Some commands may require approval. To auto-approve, add them to `settings.local.json` permissions.

### Command Errors

If a command fails:

1. Check the error message
2. Run `/verify` to check overall project health
3. Try the command again with more context

## Documentation

For more detailed workflow documentation, see:

- `.claude/workflows/DEPLOYMENT.md` - Deployment workflow
- `.claude/workflows/VERSION_BUMPING.md` - Version management
- `.claude/workflows/MAKING_CHANGES.md` - Development workflow
- `.claude/workflows/REVERTING.md` - Rollback procedures

## Contributing

When adding new commands:

1. Focus on common repetitive tasks
2. Make commands conversational (ask questions)
3. Include validation and error handling
4. Document the command in this README
5. Test with different scenarios

---

**Quick Reference**: Type `/` to see all available commands in Claude Code!
