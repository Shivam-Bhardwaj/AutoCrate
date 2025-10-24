# Repository Restructure Plan - Claude's Proposal

## Executive Summary

**Goal:** Organize repository for clarity while preserving the new multi-LLM development workflow.

**Key Principle:** Don't break what we just built. The worktree system and multi-LLM docs are ACTIVE infrastructure, not clutter.

---

## Current State Analysis

### What We Have Now
```
AutoCrate/
├── [Original directory - DEPRECATED, should not be used]
├── repo/                          # Main worktree ✓ ACTIVE
├── issues/                        # LLM worktrees ✓ ACTIVE
│   ├── 119/, 128/, 140/
├── Root-level docs (15+ files)   # Mix of active + legacy
├── scripts/                       # ✓ Well organized
└── src/                           # ✓ Application code
```

### Key Problems
1. **Two competing "roots"** - Original directory AND repo/ both exist
2. **Documentation scattered** - Active workflow docs mixed with legacy
3. **Unclear what's current** - Multiple README variants, overlapping guides
4. **Issue folders persist** - Closed issues leave worktree directories

---

## Proposed Structure

### Phase 1: Establish Clear Hierarchy (Priority: HIGH)

```
AutoCrate/
├── repo/                          # ← PRIMARY workspace (main worktree)
│   ├── src/                       # Application code
│   ├── docs/                      # All documentation
│   │   ├── guides/               # User guides
│   │   ├── architecture/         # Technical specs
│   │   ├── workflow/             # Multi-LLM workflow docs
│   │   ├── archive/              # Historical documents
│   │   └── assets/               # CAD files, images
│   ├── scripts/                  # ✓ Already good
│   ├── tests/                    # Test files
│   ├── .claude/                  # ✓ Already good
│   └── [Active root docs]        # See details below
│
├── issues/                        # ← Issue worktrees (auto-managed)
│   └── [NUMBER]/                 # Cleaned automatically by scripts
│
└── [Original directory]           # ← TO BE REMOVED (see Phase 3)
```

---

## File Organization Strategy

### Keep at Root (Active Workflow)

**Why:** These are entry points for humans AND LLMs. Must be discoverable.

```
repo/
├── README.md                      # Main project readme
├── QUICK_START.md                 # ← NEW: Essential workflow
├── CLAUDE.md                      # ← Development guide
├── package.json, tsconfig.json   # Config files
└── .gitignore, .env.example      # Standard root files
```

### Move to docs/workflow/

**Why:** Detailed workflow docs belong together but not at root.

```
docs/workflow/
├── ASSIGNING_TASKS.md             # From root
├── HOW_TO_USE_MULTI_LLM.md        # From root
├── LLM_ONBOARDING.md              # From root
├── WORKTREE_WORKFLOW.md           # From root
├── WORKTREE_CLEANUP.md            # From root
└── README.md                      # Index of workflow docs
```

### Move to docs/archive/

**Why:** Historical value but not actively used.

```
docs/archive/
├── agent-handoffs/
│   ├── AGENTS.md                  # From root
│   ├── NOTE_FOR_KEELYN.md         # From root
│   ├── LLM_AGENTS_README.md       # From root
│   └── PREVIEW_FINAL_STATE.md     # From root
├── deliverables/
│   ├── B_STYLE_DELIVERY_SUMMARY.md
│   └── OLD_DELIVERY_SUMMARY.md
└── issues/                        # Closed issue workspaces
    └── [NUMBER]/                  # Archived after PR merged
```

### Move to docs/assets/

**Why:** Binary files, CAD exports, large artifacts.

```
docs/assets/
├── cad/
│   ├── CAD FILES/                 # Existing CAD directory
│   ├── debug-output.stp
│   └── [Other .stp, .exp files]
└── images/
    └── [Screenshots, diagrams]
```

### Consolidate Documentation

**Current problems:**
- Multiple README variants (README.md vs docs/README.md)
- Overlapping content (QUICK_REFERENCE.md vs CLAUDE.md vs PROJECT_DNA.md)
- Unclear hierarchy

**Solution:**
```
docs/
├── README.md                      # Doc index with clear navigation
├── guides/
│   ├── development.md             # Merge PROJECT_DNA + dev sections
│   ├── architecture.md            # System architecture
│   ├── testing.md                 # Test guide
│   └── deployment.md              # Deployment guide
├── workflow/                      # Multi-LLM workflow (as above)
├── architecture/
│   ├── ARCHITECTURE.md            # From docs/
│   ├── web-stack-overview.html   # From docs/
│   └── crate-design.md            # Technical specs
└── archive/                       # Historical (as above)
```

---

## What NOT to Move

### Critical: Keep These Systems Intact

**1. Worktree Infrastructure**
```
issues/                            # ✓ KEEP - Auto-managed
.git/worktrees/                    # ✓ KEEP - Git internal
scripts/
├── worktree-issue.sh              # ✓ KEEP - Core workflow
├── assign-issue.sh                # ✓ KEEP - Core workflow
├── work-on-issue.sh               # ✓ KEEP - Core workflow
└── cleanup-worktrees.sh           # ✓ KEEP - Core workflow
```

**2. Active Configuration**
```
.claude/commands/                  # ✓ KEEP - Slash commands
.github/                           # ✓ KEEP - GitHub config
package.json, tsconfig.json, etc   # ✓ KEEP - Standard config
```

**3. Essential Entry Points**
```
README.md                          # ✓ KEEP - First thing people see
CLAUDE.md                          # ✓ KEEP - Dev guide
QUICK_START.md                     # ✓ KEEP - Workflow entry
```

---

## Phase-by-Phase Execution

### Phase 1: Document Consolidation (Low Risk)
**Timeline:** 1-2 days
**Risk:** Low - No code changes

1. Create `docs/workflow/` directory
2. Move workflow docs there (keep symlinks at root if needed)
3. Update `README.md` with new doc locations
4. Test that all scripts still find needed files

**Validation:**
```bash
# All these must still work:
./scripts/assign-issue.sh --help
./scripts/work-on-issue.sh 119 claude
cat QUICK_START.md  # Or symlink to docs/workflow/
```

### Phase 2: Archive Historical Content (Medium Risk)
**Timeline:** 1 day
**Risk:** Medium - Might break old references

1. Create `docs/archive/` structure
2. Move historical agent handoffs
3. Move old delivery summaries
4. Update any scripts that reference these files

**Validation:**
```bash
# Check for broken references:
grep -r "AGENTS.md" scripts/
grep -r "NOTE_FOR_KEELYN" .
```

### Phase 3: Handle Original Directory (High Risk)
**Timeline:** Plan carefully, execute quickly
**Risk:** HIGH - Could break everything

**Problem:** The original `/home/curious/workspace/Shivam-Bhardwaj/AutoCrate/` directory exists alongside `repo/`.

**Options:**

**Option A: Full Migration (Recommended)**
```bash
# 1. Ensure all work is in repo/ and issues/
# 2. Back up original directory
mv /path/to/AutoCrate /path/to/AutoCrate.backup

# 3. Rename repo/ to AutoCrate/
mv /path/to/AutoCrate.backup/repo /path/to/AutoCrate

# 4. Move issues/ alongside
mv /path/to/AutoCrate.backup/issues /path/to/AutoCrate/

# 5. Update all worktree references
git worktree repair
```

**Option B: Documentation Only (Safer)**
- Add clear README in original directory: "DO NOT USE - See repo/ directory"
- Update all documentation to reference repo/
- Gradually phase out over time

### Phase 4: Asset Management (Optional)
**Timeline:** As needed
**Risk:** Low if using Git LFS

1. Evaluate large binary files
2. Set up Git LFS if needed
3. Move large artifacts to LFS or external storage

---

## Comparison with Codex's Plan

### Where We Agree ✅

1. **Root is cluttered** - Too many docs at top level
2. **Historical content needs archiving** - AGENTS.md, old deliveries
3. **CAD files need organization** - Consolidate into docs/assets/
4. **Need clear structure** - Document and enforce it
5. **Phased rollout** - Don't break everything at once

### Where We Disagree ⚠️

| Topic | Codex's View | Claude's View | Recommendation |
|-------|-------------|---------------|----------------|
| **Workflow Docs** | Move to `docs/history/` | Move to `docs/workflow/` (active) | Claude's - these are ACTIVE |
| **Root Entry Points** | Minimize everything | Keep essential guides | Claude's - discoverability matters |
| **Git LFS** | Consider using | Optional, not urgent | Codex's - good for future |
| **CI Checks** | Add file structure linting | Good idea but later | Codex's - prevent future clutter |
| **Timing** | Can do anytime | Wait for quiet period | Claude's - don't disrupt active work |

### Where We Need Clarification 🤔

1. **CAD Files:**
   - Codex: External storage or Git LFS?
   - Claude: Git LFS or keep as-is?
   - **Decision needed:** How are these used? Are they built artifacts or source material?

2. **Historical Agent Outputs:**
   - Codex: Maybe separate branch?
   - Claude: Archive in repo is fine
   - **Decision needed:** Do you need quick access to agent history?

3. **Issue Worktrees:**
   - Codex: Didn't address
   - Claude: Auto-managed, keep system intact
   - **Decision needed:** Is the cleanup script sufficient?

---

## Guardrails & Maintenance

### Prevent Future Clutter

**1. Documentation Rules**
```markdown
docs/README.md should define:
- Root-level docs: Only README.md, QUICK_START.md, CLAUDE.md
- New guides: Always go in docs/guides/
- Workflow docs: Always go in docs/workflow/
- Historical: Always go in docs/archive/
```

**2. Automated Checks (Optional)**
```yaml
# .github/workflows/structure-check.yml
# Warn if new root-level .md files added (except allowed list)
```

**3. CONTRIBUTING.md**
```markdown
## Adding Documentation
- Entry points: Root level (ask first)
- Guides: docs/guides/
- Workflow: docs/workflow/
- Historical: docs/archive/
```

### Regular Maintenance

**Weekly:**
```bash
# Clean up closed issue worktrees
./scripts/cleanup-worktrees.sh
```

**Monthly:**
```bash
# Review docs/ for outdated content
# Archive anything no longer active
```

**Per Release:**
```bash
# Update version docs
# Archive previous release notes
```

---

## Risk Assessment

### Low Risk (Do First)
- ✅ Create new directory structure in docs/
- ✅ Copy (don't move) files to new locations
- ✅ Update README.md with navigation
- ✅ Test all scripts still work

### Medium Risk (Do Carefully)
- ⚠️ Move workflow docs to docs/workflow/
- ⚠️ Archive historical agent outputs
- ⚠️ Consolidate overlapping documentation

### High Risk (Plan Thoroughly)
- 🚨 Resolve original directory vs repo/ situation
- 🚨 Update all worktree paths
- 🚨 Change any absolute paths in scripts

---

## Success Criteria

### Immediate (After Phase 1-2)
- [ ] Clear navigation from README.md
- [ ] Workflow docs organized in docs/workflow/
- [ ] Historical content archived
- [ ] All scripts still functional
- [ ] All worktrees still work

### Long-term (After all phases)
- [ ] Single clear root directory
- [ ] No duplicate/overlapping docs
- [ ] Clear categories for all content
- [ ] Enforced through CONTRIBUTING.md
- [ ] Optional: CI checks for structure

---

## Recommended Approach

### Before Starting ANY Restructure:

1. **Freeze development** - No new features during restructure
2. **Backup everything** - Create git tag + local backup
3. **Get consensus** - Compare this plan with Codex's
4. **Create tracking issue** - Track progress, coordinate changes
5. **Test rollback** - Know how to undo each phase

### Execution Order:

1. ✅ **Create new structure** (no moves yet)
2. ✅ **Copy to new locations** (redundant is safe)
3. ✅ **Update references** (scripts, docs)
4. ✅ **Test everything** (all workflows)
5. ✅ **Remove old locations** (after validation)

### Timeline Estimate:

- **Phase 1:** 2-3 hours (low risk)
- **Phase 2:** 1-2 hours (medium risk)
- **Phase 3:** 4-6 hours (high risk, needs planning)
- **Total:** 1-2 days with testing

---

## Open Questions for You

1. **Do you want to tackle the original directory vs repo/ situation now or later?**
   - This is the biggest structural issue but also highest risk

2. **How important is quick access to historical agent outputs?**
   - Affects whether we archive or keep easily accessible

3. **Are CAD files source material or build artifacts?**
   - Affects Git LFS decision

4. **Is there active development happening that would be disrupted?**
   - Affects timing of restructure

5. **Should we wait for all open issues to close first?**
   - Would make Phase 3 much cleaner

---

## Comparison Summary

**Codex's Plan:** More aggressive, wants to move more to history, suggests advanced solutions (Git LFS, CI checks)

**Claude's Plan:** More conservative, protects active multi-LLM infrastructure, phased with lower risk

**Recommended Hybrid:**
- Use Claude's structure (docs/workflow/ not docs/history/)
- Use Codex's CI idea (prevent future clutter)
- Agree on Phase 1-2 quickly
- Plan Phase 3 carefully together

---

## Next Steps

1. **Review both plans** (yours)
2. **Create consensus document** (merge best of both)
3. **Create GitHub issue** (track restructure work)
4. **Assign to appropriate LLM** (using worktree workflow!)
5. **Execute Phase 1** (low risk, high value)

**Ready for your feedback and decision!**
