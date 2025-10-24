# LLM Agent Execution System - Quick Start

## What This Is

16 issues → 6 ready-to-execute tickets for lightweight LLMs running in parallel on separate servers.

## Files You Need

- **ISSUE_ANALYSIS_AND_TICKETS.md** - All ticket prompts
- **NOTE_FOR_KEELYN.md** - Overview and strategy
- **.github/ISSUE_TEMPLATE/llm_optimized_task.md** - Template for future tickets

## Setup (Each Server)

```bash
# 1. Clone and checkout
git clone https://github.com/Shivam-Bhardwaj/AutoCrate.git
cd AutoCrate
git checkout feature/llm-optimized-issue-system

# 2. Install
npm install

# 3. Verify
npm run type-check
```

## Execute Tickets (6 Servers in Parallel)

### Server 1: Ticket #1 (Datum Frames)

```bash
git checkout -b ticket/1-datum-frames

# Open ISSUE_ANALYSIS_AND_TICKETS.md
# Copy the entire "TICKET 1" section
# Paste into Claude Code or your LLM

# LLM executes, commits, then:
git push origin ticket/1-datum-frames
```

### Server 2: Ticket #2 (PMI Font)

```bash
git checkout -b ticket/2-pmi-font-scaling
# Copy TICKET 2 from ISSUE_ANALYSIS_AND_TICKETS.md → paste to LLM
git push origin ticket/2-pmi-font-scaling
```

### Server 3: Ticket #3 (Weight)

```bash
git checkout -b ticket/3-weight-calculation
# Copy TICKET 3 → paste to LLM
git push origin ticket/3-weight-calculation
```

### Server 4: Ticket #4 (BOM)

```bash
git checkout -b ticket/4-supplier-bom
# Copy TICKET 4 → paste to LLM
git push origin ticket/4-supplier-bom
```

### Server 5: Ticket #5 (Floorboards)

```bash
git checkout -b ticket/5-floorboard-optimization
# Copy TICKET 5 → paste to LLM
git push origin ticket/5-floorboard-optimization
```

### Server 6: Ticket #6 (Markings)

```bash
git checkout -b ticket/6-marking-placement-fix
# Copy TICKET 6 → paste to LLM
git push origin ticket/6-marking-placement-fix
```

## Merge Order (Avoid Conflicts)

1. Ticket #5 (independent)
2. Ticket #3 (independent)
3. Ticket #4 (independent)
4. Ticket #6 (independent)
5. Ticket #1 (first PMI change)
6. Ticket #2 (second PMI change)

## Token Budget

- Each ticket: ~1600-2000 tokens
- Total (6 tickets): ~11,000 tokens
- Designed for: 4K context LLMs
- Execution time: 1-2 hours each (6-12 hours total, or 1-2 hours if parallel)

## That's It

Each ticket is self-contained with exact file paths, code snippets, and step-by-step instructions. No external lookups needed.

---

**Branch**: `feature/llm-optimized-issue-system`
**Pushed**: ✓
**PR Link**: https://github.com/Shivam-Bhardwaj/AutoCrate/pull/new/feature/llm-optimized-issue-system
