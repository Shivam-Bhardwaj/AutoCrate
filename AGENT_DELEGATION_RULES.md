# Agent Delegation Rules for AutoCrate Development

## Core Principle
Split tasks by specialization and run multiple agents in parallel to maximize development speed. Not every task needs Opus - use the right agent for the right job.

## Agent Specializations

### 1. UI/UX Agent (Haiku/Sonnet)
**Best for:**
- CSS styling and Tailwind classes
- Component layout and responsive design
- Dark/light mode theming
- Animation and transitions
- UI component creation (buttons, cards, forms)
- Mobile responsiveness
- Visual debugging

**Example tasks:**
- "Fix button alignment in mobile view"
- "Update color scheme for dark mode"
- "Create loading skeleton components"
- "Improve form validation UI feedback"

### 2. Math/Engineering Agent (Sonnet/Opus)
**Best for:**
- Complex calculations (skid sizing, load distribution)
- Engineering formulas implementation
- Physics simulations
- Algorithm optimization
- Data structure design
- Performance calculations

**Example tasks:**
- "Implement beam deflection calculations"
- "Calculate optimal skid spacing algorithm"
- "Create floorboard distribution logic"
- "Implement weight distribution formulas"

### 3. Web Development Agent (Haiku/Sonnet)
**Best for:**
- API routes and endpoints
- Database queries
- Authentication logic
- File I/O operations
- Build configuration
- Package management
- Environment setup

**Example tasks:**
- "Set up API endpoint for data export"
- "Configure webpack optimization"
- "Implement file upload functionality"
- "Set up environment variables"

### 4. Testing Agent (Haiku)
**Best for:**
- Unit test creation
- Integration tests
- E2E test scenarios
- Test data generation
- Coverage reports
- Test maintenance

**Example tasks:**
- "Write unit tests for calculator functions"
- "Create E2E tests for user workflow"
- "Generate test fixtures"
- "Fix failing test cases"

### 5. Documentation Agent (Haiku)
**Best for:**
- README updates
- Code comments
- API documentation
- User guides
- Changelog updates
- Type definitions

**Example tasks:**
- "Document new API endpoints"
- "Update installation instructions"
- "Create user guide for NX expressions"
- "Add JSDoc comments to functions"

### 6. 3D/Graphics Agent (Sonnet/Opus)
**Best for:**
- Three.js implementations
- WebGL debugging
- 3D model manipulation
- Camera controls
- Lighting and materials
- Performance optimization for 3D

**Example tasks:**
- "Fix 3D rendering on mobile devices"
- "Add exploded view for crate"
- "Implement hover effects on 3D models"
- "Optimize 3D scene performance"

## Delegation Strategy

### When to use parallel agents:
1. **Independent tasks** - Tasks that don't depend on each other
2. **Different domains** - UI task + backend task + testing
3. **Large features** - Break into UI, logic, and testing components
4. **Bug fixes** - Multiple unrelated bugs can be fixed in parallel

### How to delegate:
```markdown
Task: "Implement export functionality with PDF and Excel support"

Split into:
1. [UI Agent] - Create export button and modal UI
2. [Web Dev Agent] - Set up jsPDF and xlsx libraries
3. [Math Agent] - Format calculations for export
4. [Testing Agent] - Write tests for export functions
5. [Doc Agent] - Document export feature usage
```

### Parallel Execution Example:
```markdown
// Launch all agents simultaneously
Agent 1: "Create the export button UI with download icon in the output section"
Agent 2: "Implement PDF generation logic using jsPDF for crate specifications"
Agent 3: "Write unit tests for the export functionality"
Agent 4: "Update README with export feature documentation"
```

## Task Complexity Guidelines

### Haiku-level tasks (Simple, 1-2 files):
- Fix typos or small bugs
- Update styles or colors
- Add simple UI elements
- Write basic tests
- Update documentation

### Sonnet-level tasks (Medium, 3-5 files):
- Implement new components
- Add form validation
- Create API endpoints
- Refactor existing code
- Complex styling updates

### Opus-level tasks (Complex, 5+ files):
- Architecture decisions
- Complex algorithm implementation
- Major feature development
- Performance optimization
- Complex debugging

## Implementation Rules

1. **Always identify task type first** - Determine which agent is best suited
2. **Batch similar tasks** - Group UI tasks together, math tasks together
3. **Define clear boundaries** - Each agent should know exactly what files to modify
4. **Avoid overlap** - Agents shouldn't modify the same files simultaneously
5. **Use TODO.md for coordination** - Track which agent is handling what

## Current Task Distribution Template

```markdown
## Parallel Task Execution Plan

### Stream 1: UI Improvements (UI Agent)
- [ ] Fix mobile navigation menu
- [ ] Update button hover states
- [ ] Improve form input styling

### Stream 2: Calculations (Math Agent)  
- [ ] Implement new load calculations
- [ ] Optimize floorboard algorithm
- [ ] Add safety factor calculations

### Stream 3: Backend (Web Dev Agent)
- [ ] Set up export API
- [ ] Configure build optimization
- [ ] Implement data validation

### Stream 4: Testing (Testing Agent)
- [ ] Write unit tests for new features
- [ ] Update integration tests
- [ ] Fix broken test cases

### Stream 5: Documentation (Doc Agent)
- [ ] Update API documentation
- [ ] Write user guides
- [ ] Update changelog
```

## Benefits

1. **5x faster development** - Multiple tasks completed simultaneously
2. **Cost optimization** - Haiku for simple tasks, Opus only when needed
3. **Better specialization** - Each agent focuses on their strength
4. **Reduced context switching** - Agents stay in their domain
5. **Improved quality** - Specialized agents make fewer mistakes in their domain

## When NOT to parallelize

1. **Sequential dependencies** - Task B requires Task A to complete first
2. **Same file conflicts** - Multiple agents editing the same file
3. **Architecture decisions** - Need consensus before implementation
4. **Critical bug fixes** - Need focused attention from best agent

## Monitoring Parallel Execution

- Use `TodoWrite` tool to track all parallel tasks
- Check agent outputs regularly
- Merge completed work incrementally
- Run tests after each merge
- Keep CHANGELOG.md updated with all changes