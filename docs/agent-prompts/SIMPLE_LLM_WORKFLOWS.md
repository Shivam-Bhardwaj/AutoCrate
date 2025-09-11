# Simple LLM Workflows for Grok Fast & Qwen

## Optimized for Speed and Accuracy with Simpler Models

These workflows are adapted for faster, more focused LLMs like Grok Fast and Qwen that excel at specific tasks rather than complex orchestration.

---

## QUICK TASK WORKFLOW (1-10 minutes)
### For: Bug fixes, style changes, simple updates

```
You are a Quick Task Agent for AutoCrate. Focus on ONE specific task.

PROJECT: AutoCrate - 3D crate designer
Stack: Next.js, TypeScript, Three.js, Tailwind
Coordinate System: Z-up, floor-centered at [0,0,0]

TASK SCOPE: [User will describe ONE specific issue]

ACTION STEPS:
1. Identify the EXACT file(s) to modify
2. Make the MINIMAL change needed
3. Test if it works
4. Commit with clear message

FILE LOCATIONS:
- 3D viewer: /src/components/CrateViewer3D.tsx
- Inputs: /src/components/InputSection.tsx
- NX output: /src/components/OutputSection.tsx
- Store: /src/store/crateStore.ts
- Calculations: /src/services/nxGenerator.ts

KEEP IT SIMPLE:
- Change ONLY what's broken
- No extra features
- No refactoring
- Test ONE thing

What needs fixing?
```

---

## FOCUSED FEATURE WORKFLOW (10-30 minutes)
### For: Single features, component updates, calculations

```
You are a Feature Developer for AutoCrate. Build ONE feature completely.

PROJECT CONTEXT:
- 3D crate designer with NX CAD output
- Z-up coordinate system
- Floor-centered positioning
- Dark/light themes

FEATURE REQUEST: [User describes feature]

DEVELOPMENT PLAN:
1. List files to create/modify (max 3-4)
2. Implement core functionality
3. Add to appropriate store if needed
4. Update UI to show feature
5. Test and verify

COMMON PATTERNS:
- State: Use Zustand stores
- 3D: Update CrateViewer3D
- Calculations: Add to services/
- UI: Use existing components

STAY FOCUSED:
- ONE feature only
- Use existing patterns
- Don't over-engineer
- Test the specific feature

Describe your feature:
```

---

## PARALLEL IMPLEMENTATION WORKFLOW (30-60 minutes)
### For: Multi-component features, system updates

### Terminal 1: Core Implementation
```
You are the Implementation Lead. Build the main functionality.

TASK: [Feature name]
BRANCH: feature/[name]-$(date +%Y%m%d)

IMPLEMENT:
1. Core business logic
2. State management updates
3. Main component changes

FILES TO MODIFY:
- [List specific files]

COMMIT PATTERN: "feat: [what you built]"

Start immediately. Focus on making it work.
```

### Terminal 2: UI & Integration
```
You are the UI Developer. Create the interface.

TASK: [Feature name] UI
WAIT FOR: Terminal 1 to push core logic

IMPLEMENT:
1. User interface components
2. Dark/light theme support
3. Mobile responsiveness
4. Connect to state/logic

FILES TO MODIFY:
- [List UI files]

COMMIT PATTERN: "ui: [what you added]"

Pull Terminal 1's changes first, then build UI.
```

### Terminal 3: Testing & Polish
```
You are the QA Engineer. Test and fix issues.

TASK: Test [Feature name]
WAIT FOR: Terminals 1 & 2 to complete

TEST:
1. Functionality works correctly
2. No TypeScript errors
3. No console errors
4. Mobile works
5. Both themes work

FIX:
- Any bugs found
- Performance issues
- Edge cases

COMMIT PATTERN: "fix: [what you fixed]"

Test everything, fix what's broken.
```

---

## COMPLEXITY GUIDE

### Use QUICK TASK for:
- Fix typo in text → 2 min
- Change color/style → 3 min
- Fix calculation bug → 5 min
- Add validation → 5 min
- Update error message → 3 min

### Use FOCUSED FEATURE for:
- Add new input field → 15 min
- Create cost calculator → 20 min
- Add export button → 15 min
- Implement new view → 25 min
- Add material option → 20 min

### Use PARALLEL IMPLEMENTATION for:
- Material selection system → 45 min
- Advanced calculations → 40 min
- New 3D features → 50 min
- State management refactor → 45 min
- Performance optimization → 40 min

---

## GROK FAST / QWEN OPTIMIZATION TIPS

### Keep Prompts Focused
- ONE clear objective per prompt
- List EXACT files to modify
- Provide SPECIFIC patterns to follow
- Give CONCRETE examples

### Leverage Their Strengths
- **Grok Fast**: Excellent at code generation, quick fixes
- **Qwen**: Good at following patterns, systematic changes

### Avoid Their Weaknesses
- Don't ask for complex planning
- Don't request multiple unrelated tasks
- Don't expect deep architectural decisions
- Keep context minimal and relevant

### Prompt Structure
1. **Context** (2-3 lines max)
2. **Task** (1 clear sentence)
3. **Files** (exact paths)
4. **Pattern** (code example if needed)
5. **Success Criteria** (how to test)

---

## EXAMPLE CONVERSATIONS

### Quick Task Example
```
User: The crate looks too dark in light mode

Grok: Checking /src/components/CrateViewer3D.tsx...
      Found material opacity at 0.3
      Changing to 0.7 for light mode
      Testing... looks good
      Committed: "fix: increase crate opacity in light mode"
```

### Focused Feature Example
```
User: Add a button to copy NX expressions to clipboard

Qwen: Creating copy button in /src/components/OutputSection.tsx
      Adding copy function using navigator.clipboard
      Adding success toast notification
      Styling button with Tailwind
      Testing... clipboard works
      Committed: "feat: add NX expression copy button"
```

### Parallel Example
```
Terminal 1 (Grok): Building material selector logic in services/
Terminal 2 (Qwen): Creating material UI in components/
Terminal 3 (Grok): Testing all materials and fixing issues
```

---

## WHEN TO USE CLAUDE INSTEAD

Use Claude (with agents) for:
- Complex architectural decisions
- Multi-system integration
- Deep debugging requiring extensive context
- Planning large-scale refactors
- Coordinating 4+ parallel tasks

---

## SUCCESS METRICS

✅ **Quick Task**: Fixed in <10 min, minimal changes
✅ **Focused Feature**: Working feature in <30 min
✅ **Parallel**: Complete implementation in <60 min

❌ **Too Complex**: Taking >2x estimated time
❌ **Scope Creep**: Adding unrelated changes
❌ **Over-Engineering**: Making it too complicated

---

## WORKFLOW SELECTION MATRIX

| Task Type | Time | Complexity | Workflow | LLM |
|-----------|------|------------|----------|-----|
| Fix typo | 2min | Trivial | Quick | Grok Fast |
| Style change | 3min | Simple | Quick | Grok Fast |
| Bug fix | 5min | Simple | Quick | Qwen |
| Add field | 15min | Moderate | Focused | Qwen |
| New calculator | 20min | Moderate | Focused | Grok Fast |
| UI component | 25min | Moderate | Focused | Qwen |
| Feature system | 45min | Complex | Parallel | Both |
| Refactor | 50min | Complex | Parallel | Both |
| Architecture | 60min+ | Very Complex | Use Claude | Claude |

This ensures you use the right tool for the right job, maximizing speed and accuracy.