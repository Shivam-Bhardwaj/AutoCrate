# AutoCrate - LLM Quick Reference

**ULTRA-CONDENSED** - For lightweight LLM consumption

```json
{
  "workflow": "work on issue N → EVERYTHING AUTOMATED",
  "docs_to_read": ["START_HERE.md", "this_file"],
  "token_budget": "7K total",
  "human_involvement": "ZERO"
}
```

---

## 1-COMMAND WORKFLOW

```bash
# User provides:
work on https://github.com/Shivam-Bhardwaj/AutoCrate/issues/N

# System does:
gh issue view N → analyze → select agent → create branch →
implement → test → build → commit → push → create PR → done
```

---

## CRITICAL FILES (EXACT PATHS)

```json
{
  "core_generator": "src/lib/nx-generator.ts",
  "3d_visualizer": "src/components/CrateVisualizer.tsx",
  "main_ui": "src/app/page.tsx",
  "step_exporter": "src/lib/step-generator.ts",
  "agent_registry": ".claude/agents/registry.json"
}
```

---

## COMMAND CHEAT SHEET

```bash
npm test                    # Tests (automated pre-commit)
npm run build              # Build (automated pre-push)
npm run type-check         # TypeScript (automated)
git commit                 # Auto-runs: type-check + tests + lint
git push                   # Auto-runs: tests + build
```

---

## AGENT AUTO-SELECTION

```json
{
  "labels": {
    "3d": "3d-viz agent",
    "step": "cad-export agent",
    "bug": "quick-fix agent",
    "enhancement": "feature agent"
  },
  "keywords": {
    "visualization": "3d-viz",
    "export": "cad-export",
    "klimp": "hardware",
    "test": "testing"
  }
}
```

---

## COMMIT FORMAT (AUTO-GENERATED)

```
type: description (max 50 chars)

[details]

Closes #N

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## COORDINATE SYSTEM (CRITICAL)

```
NX CAD  →  Three.js
X       →  X
Y       →  -Z (NEGATIVE!)
Z       →  Y
Scale   →  0.1
```

---

## CRITICAL PATTERNS

```typescript
// PMI MUST have key prop
<ScenePMIOverlays key={`pmi-${w}-${l}-${h}`} />

// Position conversion
[x * 0.1, z * 0.1, -y * 0.1]  // Note: -y!

// Debounce all inputs
setTimeout(() => setConfig(...), 500)
```

---

## TEST EXECUTION

```json
{
  "pre_commit": "tsc + jest --related",
  "pre_push": "npm test + npm run build",
  "pre_pr": "npm run test:all + npm run test:e2e",
  "known_failures": ["security.test.ts (5)", "api headers (7)"],
  "ignore_known": true
}
```

---

## BRANCH NAMING

```
fix/issue-N-description
feature/issue-N-description
refactor/description
docs/description
```

---

## FILE MODIFICATION PRIORITY

```
1. ALWAYS Edit existing files first
2. NEVER Write unless absolutely necessary
3. Read file before editing
4. Update tests when changing logic
```

---

## AUTOMATION BLOCKERS

```json
{
  "commit_blocked_if": ["tsc errors", "test failures", "lint errors"],
  "push_blocked_if": ["tests fail", "build fails"],
  "pr_blocked_if": ["all tests don't pass", "build fails", "e2e fails"]
}
```

---

## QUICK DECISIONS

```
Bug in 3D? → CrateVisualizer.tsx
Bug in calculation? → nx-generator.ts
Bug in export? → step-generator.ts
Add hardware? → hardware agent
Add lumber size? → lumber agent
UI change? → ui agent
```

---

## VERSION BUMPS

```bash
npm run version:patch  # Bug fix
npm run version:minor  # Feature
npm run version:major  # Breaking
```

---

## DEPLOY TRIGGER

```
Merge to main → Vercel auto-deploys
/deploy command → runs tests + bumps version + pushes
```

---

## FULL DOCS (IF NEEDED)

```
docs/START_HERE.md       # Entry point (5K tokens)
docs/AGENT_GUIDE.md      # Automation details
docs/ARCHITECTURE.md     # Technical deep dive
docs/TESTING_GUIDE.md    # Test automation
docs/CONTRIBUTING.md     # Workflows
```

---

## ISSUE → PR TEMPLATE

```
1. Fetch: gh issue view N
2. Branch: git checkout -b fix/issue-N-...
3. Agent: Select based on labels/keywords
4. Implement: Fix/feature with tests
5. Test: npm test (must pass)
6. Build: npm run build (must pass)
7. Commit: type: description\nCloses #N
8. Push: git push -u origin branch
9. PR: gh pr create --title "..." --body "..."
10. Done: Return PR URL
```

---

## CRITICAL GOTCHAS

```
❌ DON'T change scale factor (0.1)
❌ DON'T remove negative Y (-y)
❌ DON'T remove PMI key prop
❌ DON'T commit without tests passing
❌ DON'T force push to main
✅ DO use Edit over Write
✅ DO run tests before commit
✅ DO follow commit format
✅ DO close issues in footer
```

---

**TOTAL**: ~2K tokens | **PURPOSE**: Instant LLM context | **UPDATE**: When critical patterns change
