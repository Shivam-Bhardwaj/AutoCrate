# Note for Keelyn

## What Was Done

I've analyzed all 16 issues you described and created a comprehensive LLM-optimized ticketing system specifically designed for lightweight, fast-executing LLMs that can work independently in separate terminals.

## Key Deliverables

### 1. **ISSUE_ANALYSIS_AND_TICKETS.md**
This is your main reference document with:
- All 16 issues organized into 9 logical groups
- Priority rankings (HIGH/MEDIUM/LOW) and complexity estimates
- Complete, self-contained prompts for tickets #1-6 (the high-priority ones)
- Token budgets for each ticket (~1600-2000 tokens per task)
- Exact file paths, line numbers, and code examples
- Implementation guides that require ZERO external lookups

### 2. **New GitHub Template**
`.github/ISSUE_TEMPLATE/llm_optimized_task.md`
- Standardized format for creating LLM-executable tickets
- Built-in token budgeting and constraints
- Self-sufficiency checklist

## Issue Groups Created

| Group | Issues | Focus Area | Priority |
|-------|--------|------------|----------|
| A | #1, #8 | PMI & Visualization | HIGH |
| B | #2, #10 | BOM & Weight | HIGH |
| C | #3 | Lumber Optimization | HIGH |
| D | #11 | Markings & Labels | MEDIUM |
| E | #13, #14 | Documentation | MEDIUM |
| F | #4, #15, #16 | GitHub/DevOps | LOW |
| G | #9 | UI/UX | LOW |
| H | #7, #12 | New Features | LOW (complex) |
| I | #6 | Infrastructure | MEDIUM (very complex) |

## Correlations Identified

Your instinct was correct - several issues are related:
- **#1 + #8**: Both modify the same PMI rendering code in CrateVisualizer.tsx
- **#2 + #10**: Weight calculation naturally integrates with BOM restructuring
- **#3**: Standalone (lumber algorithm)
- **#11**: Standalone (marking placement bug)

**Good news**: No blocking dependencies! All high-priority tasks can be executed in parallel.

## How to Use This System

### Option 1: Spawn LLM Agents in Parallel
1. Open 6 separate terminals
2. Copy ticket prompts from `ISSUE_ANALYSIS_AND_TICKETS.md`
3. Paste into lightweight LLMs (each ticket is self-contained)
4. LLMs execute independently, create PRs when done
5. Review and merge

### Option 2: Create GitHub Issues
1. Use the new "LLM-Optimized Task" template
2. Copy ticket content from the analysis doc
3. Label with `llm-task` + category
4. Assign to agents or leave open for distributed execution

### Option 3: Manual Sequential Execution
Follow the recommended order in the analysis doc:
1. Tickets #1-2 (PMI - quick wins)
2. Tickets #3-4 (BOM/Weight - user features)
3. Ticket #5 (Floorboard algorithm)
4. Ticket #6 (Markings bug fix)

## Assumptions I Made (You Said to Assume)

✓ **Floorboard gap threshold**: 2.5" for custom boards
✓ **Datum frame offset**: 15% outside model bounds
✓ **Wood density**: Douglas Fir @ 34 lb/ft³ (industry standard)

If any of these are wrong, they're all defined in constants - easy to change.

## Token Budget Summary

**High-Priority Tickets (#1-6)**:
- Total: ~11,000 tokens
- Designed for 4K context window LLMs
- Estimated execution: 5-9 hours total (or 1-2 hours if parallelized across 6 agents)

**All 15 Tickets**:
- Total: ~25,600 tokens
- Includes major features (test case UI, reverse engineering, automation portal)

## What's Special About These Tickets?

Each ticket includes:
- **Exact file paths with line numbers** - no searching required
- **Code snippets** showing current vs. expected state
- **Type definitions** inline (no need to look them up)
- **Step-by-step guides** - LLM just follows the recipe
- **Test commands** with expected outcomes
- **Token budgets** to ensure lightweight execution
- **Acceptance criteria** that are testable

An LLM can take any of these prompts and execute completely independently without asking questions or looking up additional files.

## Recommended Next Steps

1. **Review** `ISSUE_ANALYSIS_AND_TICKETS.md` (it's detailed but organized)
2. **Pick your execution strategy** (parallel LLMs, GitHub issues, or manual)
3. **Start with tickets #1-2** if you want quick visual improvements
4. **Or start with #3-4** if you want user-facing features first

## Architecture for Future Automation (Issue #6)

I also designed the system for your "automated ticket portal" idea:
- Web form for users to submit tickets with screenshots
- LLM filters and optimizes the prompt against current codebase
- Auto-creates GitHub issues in the optimized format
- See the "Automation System Design" section in the analysis doc

## Manufacturing Context Understanding

I studied your codebase thoroughly and understand:
- Crate construction flow (skids → floorboards → panels → cleats → fasteners)
- PMI/datum planes for manufacturing dimensioning
- Plywood splicing optimization
- Lumber sizing based on weight thresholds
- STEP file export for CAD integration
- Bill of materials for supplier ordering

The tickets reflect real-world manufacturing workflows (e.g., "how would a builder measure from?" for datum planes, "what does a supplier need?" for BOM).

## Files Changed

```
create  ISSUE_ANALYSIS_AND_TICKETS.md
create  .github/ISSUE_TEMPLATE/llm_optimized_task.md
create  NOTE_FOR_KEELYN.md (this file)
```

---

**Branch**: `feature/llm-optimized-issue-system`
**Commit**: `ea76638`

Let me know if you want me to:
- Create the actual GitHub issues now
- Start implementing any tickets immediately
- Adjust priorities or groupings
- Generate full detailed prompts for tickets #7-16

-- Claude Code
