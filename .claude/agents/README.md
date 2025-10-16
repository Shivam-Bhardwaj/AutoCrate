# Agent Registry System

**Version**: 1.0.0
**Purpose**: Specialized agent routing for efficient LLM development

---

## Overview

The Agent Registry System enables specialized agents to handle specific types of tasks with optimal context loading and token efficiency. Each agent is pre-configured with:

- **Triggers**: Keywords/labels that activate the agent
- **Context Files**: Specific files to load for this agent's work
- **Token Budget**: Maximum tokens for the task
- **Specialization**: Primary area of expertise

---

## Available Agents (19)

### Core Development

| Agent | Triggers | Specialization | Token Budget |
|-------|----------|----------------|--------------|
| **geometry** | geometry, coordinates, dimensions | Geometric calculations | 30K |
| **3d-viz** | 3d, visualization, three.js, r3f | 3D rendering | 40K |
| **cad-export** | step, export, cad, nx | CAD file generation | 50K |
| **ui** | ui, frontend, react, component | User interface | 40K |
| **testing** | test, jest, playwright, e2e | Testing & QA | 35K |

### Specialized Technical

| Agent | Triggers | Specialization | Token Budget |
|-------|----------|----------------|--------------|
| **nx** | nx expression, parametric | NX CAD expressions | 25K |
| **step** | step file, iso 10303, assembly | STEP file format | 40K |
| **lumber** | lumber, material, bom, cut list | Materials & lumber | 25K |
| **hardware** | hardware, klimp, fastener, cleat | Hardware placement | 30K |
| **scenario** | scenario, preset, configuration | Scenario management | 20K |
| **constants** | constants, specifications | Constants & specs | 15K |

### Workflow & Process

| Agent | Triggers | Specialization | Token Budget |
|-------|----------|----------------|--------------|
| **deployment** | deploy, build, ci, production | Deployment & CI/CD | 25K |
| **review** | review, quality, refactor | Code review | 40K |
| **issue** | issue, bug report, feature request | Issue triage | 20K |
| **pr** | pull request, pr, merge | PR management | 25K |

### Task-Specific

| Agent | Triggers | Specialization | Token Budget |
|-------|----------|----------------|--------------|
| **quick-fix** | quick fix, hotfix, small bug | Rapid bug fixes | 20K |
| **feature** | feature, enhancement | Feature development | 80K |
| **verify** | verify, validate, check | Verification | 20K |
| **build** | build, compile, bundle | Build process | 25K |

---

## Usage

### Automatic Agent Selection (Future)

```bash
# Agent auto-selected based on issue labels/content
"work on issue #123"  # GitHub label "ui" → ui agent activates
"fix STEP export bug" # Keywords "STEP export" → cad-export agent
```

### Manual Agent Invocation (Current)

```bash
# When starting work, specify agent context
"I'm working on 3D visualization issues" → Load 3d-viz context
"Need to fix hardware placement" → Load hardware agent context
```

### Agent Context Loading

Each agent loads only necessary files:

```json
{
  "geometry": [
    "src/lib/nx-generator.ts",
    "src/lib/crate-constants.ts",
    "docs/START_HERE.md#architecture-patterns"
  ]
}
```

**Token Savings**: Loading 3 specific files (5-8K tokens) vs entire codebase (50-100K tokens) = **85-90% reduction**

---

## Agent Selection Guide

### "How do I know which agent to use?"

**By Task Type**:
- Fixing visual bugs → `3d-viz`
- Changing dimensions/coordinates → `geometry`
- STEP file issues → `cad-export` or `step`
- Adding UI elements → `ui`
- Writing tests → `testing`
- Hardware placement → `hardware`

**By File Location**:
- `src/lib/nx-generator.ts` → `nx` or `geometry`
- `src/lib/step-generator.ts` → `step` or `cad-export`
- `src/components/CrateVisualizer.tsx` → `3d-viz`
- `src/lib/klimp-calculator.ts` → `hardware`
- `src/lib/crate-constants.ts` → `constants`

**By Issue Label**:
- `bug` + small scope → `quick-fix`
- `bug` + large scope → `feature` or specialized agent
- `enhancement` → `feature`
- `testing` → `testing`
- `deployment` → `deployment`

---

## Token Efficiency Examples

### Before Agent System
```
Task: Fix klimp placement bug
Files read: 15-20 files (exploring codebase)
Total tokens: 45K-60K
Time: 15-20 minutes
```

### After Agent System
```
Task: Fix klimp placement bug
Agent: hardware
Files loaded: 4 specific files
Total tokens: 12K-18K
Time: 5-10 minutes
Token savings: 70%
```

---

## Adding New Agents

To add a new specialized agent:

1. **Update `registry.json`**:
```json
{
  "new-agent": {
    "name": "Agent Name",
    "description": "What this agent does",
    "triggers": ["keyword1", "keyword2"],
    "contextFiles": ["file1.ts", "file2.ts"],
    "tokenBudget": 30000,
    "specialization": "Area of focus"
  }
}
```

2. **Test the agent**:
- Try a task that matches triggers
- Verify context files are sufficient
- Measure token usage
- Adjust budget if needed

3. **Document usage**:
- Update this README
- Add examples to docs/AGENT_GUIDE.md

---

## Best Practices

### Do's ✅
- Use specialized agents for focused tasks
- Let agents load minimal context
- Respect token budgets
- Chain agents for complex work (geometry → 3d-viz → testing)

### Don'ts ❌
- Don't load unnecessary context
- Don't exceed token budgets without reason
- Don't use feature agent for small fixes
- Don't bypass agent system for repeated tasks

---

## Roadmap

### Phase 1 (Current)
- [x] Agent registry definition
- [x] Agent documentation
- [ ] Manual agent selection

### Phase 2 (Next)
- [ ] Automatic trigger matching
- [ ] Issue label → agent mapping
- [ ] Context preloading
- [ ] Token tracking

### Phase 3 (Future)
- [ ] Multi-agent collaboration
- [ ] Agent performance metrics
- [ ] Smart context caching
- [ ] Agent learning from usage

---

## See Also

- **docs/START_HERE.md** - Main entry point
- **docs/AGENT_GUIDE.md** - Detailed agent usage (coming soon)
- **LLM_OPTIMIZATION_PLAN.md** - Overall optimization plan
