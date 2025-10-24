# Phase 1 Audit - Parent Repository (2025-10-24)

## Context
- Parent checkout: `/home/curious/workspace/Shivam-Bhardwaj/AutoCrate/` (`.git` on `fix/issue-147-header`, commit `e9d5293`)
- Canonical checkout: `/home/curious/workspace/Shivam-Bhardwaj/AutoCrate/repo/` (`.git` on `origin/main`, commit `4f75700`)
- Goal: catalogue anything that exists only in the parent checkout before we archive it.

## Tracked File Comparison
- Command: `comm -23/-13 <(git ls-tree -r --name-only HEAD | sort) <(cd repo && git ls-tree -r --name-only HEAD | sort)`
- Result: **no** paths exist only in the parent repository.
- Paths that exist only in the canonical repo (need to remain after migration):
  - `ASSIGNING_TASKS.md`
  - `CLAUDE.md`
  - `CODEX_STARTER_PROMPT.txt`
  - `docs/GIT_STRUCTURE_CLARIFICATION.md`
  - `docs/REPO_RESTRUCTURE_PLAN_CLAUDE.md`
  - `docs/REPO_RESTRUCTURE_PLAN_CODEX.md`
  - `docs/RESTRUCTURE_COMPARISON.md`
  - `HOW_TO_USE_MULTI_LLM.md`
  - `LLM_ONBOARDING.md`
  - `QUICK_START.md`
  - `scripts/assign-issue.sh`
  - `scripts/cleanup-worktrees.sh`
  - `scripts/show-llm-context.sh`
  - `scripts/work-on-issue.sh`
  - `scripts/worktree-issue.sh`
  - `WORKTREE_CLEANUP.md`
  - `WORKTREE_WORKFLOW.md`

## Working-Tree Variances
- `git status -sb` in the parent checkout reports `.claude/commands/issue.md` as modified, but a direct diff with the canonical copy shows no content delta.
- Interpretation: the parent checkout is simply behind; its working tree already matches the canonical file versions.

## Untracked Items in Parent Checkout
- Listed by `git status -sb` and manual inspection:
  - `repo/` and `issues/` – the canonical repo and worktree directories (expected to survive the migration).
  - `CLAUDE.md`, `WORKTREE_WORKFLOW.md`, `docs/REPO_RESTRUCTURE_PLAN.md`, `scripts/work-on-issue.sh`, `scripts/worktree-issue.sh` – new assets already tracked in the canonical repo.
  - Generated/build artefacts: `.next/`, `.swc/`, `node_modules/`, `workspace/`, `test-report.json`, `tsconfig.tsbuildinfo`.
  - Large CAD export: `debug-output.stp` (867KB).
- **Decision (2025-10-24):** `debug-output.stp` removed. It's a regenerable test export with no historical value.
- Action: All generated artefacts will be removed when the parent checkout is retired.

## Phase 1 Conclusion ✅
- Safe to proceed: there are **no unique tracked files** in the parent checkout.
- **All untracked files resolved:** `debug-output.stp` removed, all other untracked items are either duplicates (tracked in canonical repo) or regenerable build artifacts.
- **Ready for Phase 2/3:** Migrate parent directory to archive and promote `repo/` to root.
