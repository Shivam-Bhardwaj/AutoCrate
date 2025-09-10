# AutoCrate Workflow Orchestrator Guide

## Intelligent AI-Assisted Development System for AutoCrate

The AutoCrate Workflow Orchestrator intelligently selects the appropriate development approach and generates specialized prompts based on your request complexity and scope.

---

## Quick Start Guide

### Step 1: Determine Your Change Type

**Simple Questions to Ask:**
- Will this change affect multiple files or systems?
- Does this require comprehensive testing?
- Is this a new feature vs. a bug fix?
- Will this impact 3D rendering, calculations, or UI significantly?

### Step 2: Choose Your Workflow

```
MINOR CHANGES (Single Terminal)
✅ Bug fixes and small improvements
✅ UI tweaks and style adjustments  
✅ Single component modifications
✅ Configuration changes
✅ Content updates

MAJOR CHANGES (Three Terminals)
✅ New features and capabilities
✅ System-wide refactoring
✅ Performance optimizations
✅ 3D visualization enhancements
✅ Calculation system updates
```

### Step 3: Use the Appropriate Prompt

**For Minor Changes**: Use `/docs/agent-prompts/MINOR_CHANGES_WORKFLOW.md`
**For Major Changes**: Use `/docs/agent-prompts/MAJOR_CHANGES_WORKFLOW.md`

---

## AutoCrate-Specific Decision Matrix

### Change Type Classification

| Your Request | Workflow | Primary Agents | Why |
|-------------|----------|----------------|-----|
| "Fix the theme toggle bug" | Minor | UI/UX + State | Single component fix |
| "Add material texture preview" | Major | 3D + Performance + UI | Multi-system feature |
| "Update cost calculation precision" | Minor | Engineering | Focused logic change |
| "Implement advanced skid optimization" | Major | Engineering + 3D + Testing | Complex algorithm |
| "Mobile 3D performance is slow" | Major | Performance + 3D + Testing | Cross-system optimization |
| "Add tooltips to input fields" | Minor | UI/UX | Simple UI enhancement |
| "Refactor entire coordinate system" | Major | 3D + Documentation + Testing | Architectural change |
| "Fix typo in NX instructions" | Minor | Documentation | Content fix |

### Complexity Indicators

**Triggers for Major Changes Workflow:**

🔴 **High Complexity Indicators**
- New 3D visualization features
- Changes to coordinate system or geometry core
- Multi-component integrations
- Performance-critical modifications
- New calculation algorithms
- State management refactoring
- Mobile optimization projects
- Security or accessibility overhauls

🟡 **Medium Complexity (Use Judgment)**
- Significant UI changes affecting multiple components
- New input validation systems
- Theme system modifications
- Cost calculation enhancements
- Documentation restructuring

🟢 **Low Complexity (Minor Changes)**
- Single component bug fixes
- Style and theme adjustments
- Content updates
- Simple configuration changes
- Minor UI improvements
- Input field modifications

---

## Intelligent Agent Selection

### Automatic Agent Assignment

The orchestrator analyzes your request and automatically selects appropriate agents:

```
REQUEST: "Add real-time cost preview as user types"

ANALYSIS:
- Primary: Crate Engineering (cost calculations)
- Secondary: State Management (real-time updates)
- Supporting: Performance (optimization), UI/UX (display)

WORKFLOW: Major Changes (affects calculation engine + state + UI)

AGENTS SELECTED:
Terminal 1: Crate Engineering + State Management  
Terminal 2: Testing + Performance
Terminal 3: Documentation + Deployment
```

### Agent Expertise Mapping

| Request Keywords | Primary Agent | Secondary Agents |
|------------------|---------------|------------------|
| "3D", "visualization", "scene" | 3D Visualization | Performance, UI/UX |
| "cost", "BOM", "materials" | Crate Engineering | State Management |
| "theme", "responsive", "mobile" | UI/UX | Performance |
| "performance", "speed", "optimization" | Performance | 3D Visualization |
| "test", "validation", "quality" | Testing | All relevant agents |
| "documentation", "guides", "help" | Documentation | Domain-specific agent |
| "state", "store", "data flow" | State Management | Testing |
| "deploy", "build", "production" | Deployment | Performance, Testing |

---

## AutoCrate Workflow Integration

### Pre-Development Checklist

Before using either workflow, ensure:

✅ **Environment Setup**
- AutoCrate project is in working state
- `./autocrate dev` successfully starts development server
- All dependencies installed (`npm install`)
- Git working directory is clean

✅ **Project Understanding**
- Familiar with Z-up coordinate system requirements
- Understand floor-centered positioning rule
- Know the NX CAD expression generation purpose
- Aware of mobile-first responsive design approach

✅ **Change Scope Clarity**
- Clear description of what needs to change
- Understanding of success criteria
- Awareness of potential impact areas
- Timeline and complexity expectations

### Workflow Execution Standards

**Both workflows must maintain:**

```
AUTOCRATE CORE PRINCIPLES:
✅ Z-up world coordinate system (never change)
✅ Floor-centered positioning at origin [0,0,0]
✅ All dimensions in inches throughout
✅ NX CAD expression compatibility
✅ Clean codebase (no temporary files)
✅ User-controlled deployment process
✅ Obsidian-compatible documentation
✅ Mobile-first responsive design
✅ Performance optimization for 3D on mobile
✅ Engineering precision in calculations
```

### Quality Gates

**Every change must pass:**

1. **Technical Validation**
   - TypeScript compilation (zero errors)
   - ESLint validation (zero warnings)
   - Build success (`./autocrate prepare`)
   - Unit test coverage maintenance

2. **AutoCrate-Specific Validation**
   - 3D scene renders correctly
   - NX expressions generate properly
   - Cost calculations remain accurate
   - Mobile 3D performance acceptable
   - Both themes work correctly

3. **User Experience Validation**
   - Responsive design maintained
   - Accessibility standards met
   - Loading states appropriate
   - Error handling graceful

---

## Advanced Orchestration Features

### Context-Aware Prompt Generation

The orchestrator tailors prompts based on:

**Project State Analysis**
- Current codebase structure
- Recent changes and patterns
- Performance baseline status
- Known technical debt areas

**Request Analysis**
- Explicit requirements
- Implied dependencies
- Potential side effects
- Risk assessment

**Resource Optimization**
- Agent workload balancing
- Parallel execution opportunities
- Dependency sequencing
- Timeline optimization

### Intelligent Risk Assessment

**Low Risk Changes** (Auto-approve for Minor workflow)
- UI styling adjustments
- Content and text updates
- Simple validation additions
- Configuration parameter changes

**Medium Risk Changes** (Prompt for workflow selection)
- Component logic modifications
- New UI components
- Calculation algorithm tweaks
- Performance optimizations

**High Risk Changes** (Recommend Major workflow)
- Core system modifications
- 3D rendering changes
- State architecture changes
- Breaking API changes

### Success Pattern Recognition

The orchestrator learns from previous executions:

```
SUCCESSFUL PATTERNS IDENTIFIED:
✅ 3D performance changes benefit from Performance + 3D agent pairing
✅ Cost calculation updates require Engineering + Testing validation
✅ UI changes need theme consistency verification
✅ State changes require comprehensive integration testing
✅ Documentation updates should include visual guide updates
```

---

## Common Orchestration Scenarios

### Scenario 1: Performance Issue Report

**User Request**: "3D crate is laggy on mobile devices"

**Orchestrator Analysis**:
```
COMPLEXITY: High (performance + 3D + mobile optimization)
WORKFLOW: Major Changes
PRIMARY CONCERN: 3D rendering performance on resource-constrained devices
AGENTS: Performance (lead) + 3D Visualization + Testing
RISK: Medium (performance changes can introduce bugs)
TESTING FOCUS: Mobile device performance benchmarks
```

### Scenario 2: UI Enhancement

**User Request**: "Make the input section look more professional"

**Orchestrator Analysis**:
```
COMPLEXITY: Medium (could affect multiple components)
WORKFLOW: Minor Changes (single-focused improvement)
PRIMARY CONCERN: Visual design consistency
AGENTS: UI/UX (lead) + Theme knowledge
RISK: Low (styling changes unlikely to break functionality)
TESTING FOCUS: Theme consistency, responsive design
```

### Scenario 3: Feature Addition

**User Request**: "Add ability to save and load crate configurations"

**Orchestrator Analysis**:
```
COMPLEXITY: High (new data persistence + UI + state management)
WORKFLOW: Major Changes
PRIMARY CONCERN: Data architecture and user experience
AGENTS: State Management (lead) + UI/UX + Testing
RISK: High (new data patterns, persistence requirements)
TESTING FOCUS: Data integrity, user workflows, edge cases
```

---

## Troubleshooting Workflow Issues

### When Major Changes Workflow Fails

**Common Issues & Solutions:**

1. **Terminal Coordination Problems**
   - Ensure clear branch naming
   - Use frequent commits with clear messages
   - Communicate blockers immediately between terminals

2. **Agent Knowledge Conflicts**
   - Refer back to `/docs/agent-prompts/SPECIALIZED_AGENTS.md`
   - Clarify primary vs. secondary agent roles
   - Escalate architectural decisions to user

3. **AutoCrate-Specific Failures**
   - Verify Z-up coordinate system maintained
   - Check NX expression generation still works
   - Validate 3D performance hasn't regressed

### When Minor Changes Workflow Stalls

**Recovery Strategies:**

1. **Complex Change Detected Mid-Stream**
   - Stop current workflow
   - Commit current progress
   - Switch to Major Changes workflow
   - Create proper feature branch

2. **Iterative Loop Issues**
   - Break large change into smaller steps
   - Focus on single aspect per iteration
   - Validate each step before continuing

### Emergency Procedures

**If Any Workflow Breaks Core Functionality:**

```bash
# Immediate rollback
git stash
git checkout main
git branch -D [problematic-branch]

# Verify system state
./autocrate dev
# Test basic functionality at localhost:3000
# Verify 3D rendering, calculations, NX expressions

# Restart with clearer requirements
```

---

## Best Practices for Orchestration

### Request Formulation

**Effective Request Examples:**
```
GOOD: "Add material cost breakdown table with expandable details"
- Clear scope, specific component, defined behavior

BETTER: "Add material cost breakdown table with expandable details in BOM section, 
         should update real-time as materials change, needs mobile-friendly layout"
- Clear scope + technical details + constraints

BEST: "Add material cost breakdown table with expandable details in BOM section,
       should update real-time as materials change, needs mobile-friendly layout,
       must maintain current cost calculation accuracy, integrate with existing
       theme system, include accessibility features"
- Complete specification with all requirements and constraints
```

**Avoid Vague Requests:**
- "Make it better" → "Improve 3D rendering performance on mobile"
- "Fix the UI" → "Fix theme toggle animation in dark mode"
- "Update calculations" → "Improve skid dimension precision to nearest half-inch"

### Success Optimization

1. **Start with Clear Objectives**
   - Define success criteria upfront
   - Identify all affected systems
   - Consider edge cases and constraints

2. **Trust the Process**
   - Let agents use their specialized knowledge
   - Don't micro-manage implementation details
   - Focus feedback on outcomes, not methods

3. **Validate Incrementally**
   - Test frequently during development
   - Verify core functionality remains intact
   - Check AutoCrate-specific requirements

4. **Document Learnings**
   - Update orchestration patterns based on successes
   - Note effective agent combinations
   - Record performance impact patterns

The AutoCrate Workflow Orchestrator is designed to maximize development efficiency while maintaining the system's engineering precision and 3D visualization excellence.