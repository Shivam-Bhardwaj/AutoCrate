# LLM Onboarding Guide - AutoCrate Project

**For:** Claude Code, OpenAI Codex, or any AI coding assistant

This guide covers everything you need before you touch a file: where you are, what you must read, and how to stay inside the guardrails.

---

## 1. Know Your Workspace

AutoCrate uses **git worktrees** so multiple assistants can work in parallel.

```bash
pwd
git branch --show-current
```

You should be inside `.../AutoCrate/issues/<ISSUE>/` on branch `sbl-<ISSUE>`.

**Rules:**

- ✅ Only edit files in your assigned worktree directory.
- ✅ Commit and push to `sbl-<ISSUE>`.
- ❌ Never `cd` into another `issues/*/` or the root.
- ❌ Never switch to `main`.

Need a refresher? Read [Worktree Workflow](WORKTREE_WORKFLOW.md).

---

## 2. Mandatory Reads

Before making changes, review:

1. `.issue-context.md` (problem statement + acceptance criteria)
2. `CLAUDE.md` (team-wide conventions)
3. Relevant guides in `docs/workflow/`:
   - [Quick Start](QUICK_START.md) — abbreviated checklist
   - [Assigning Tasks](ASSIGNING_TASKS.md) — how issues are triaged and handed off
   - [Worktree Cleanup](WORKTREE_CLEANUP.md) — how to exit cleanly

---

## 3. Slash Commands & Scripts

All automation is driven via slash commands and matching scripts in `scripts/`.

| Command         | Script                           | Purpose                               |
| --------------- | -------------------------------- | ------------------------------------- |
| `/issue`        | `issue-workflow.sh`              | Create worktree & fetch issue details |
| `/assign`       | `assign-issue.sh`                | Track who is working on what          |
| `/work-on`      | `work-on-issue.sh`               | Wrapper to jump into a worktree       |
| `/test`         | `test-runner.js`                 | Run type check, Jest, build, security |
| `/build`        | `deploy.sh`                      | Production build guardrail            |
| `/quick-fix`    | `multi-file-helper.sh quick-fix` | Lightweight bug fix flow              |
| `/feature`      | `multi-file-helper.sh feature`   | Full feature flow                     |
| `/cleanup`      | `cleanup-worktrees.sh`           | Prune old worktrees                   |
| `/show-context` | `show-llm-context.sh`            | Print assignment + context            |

Command definitions live under `.claude/commands/*.md`.

---

## 4. Specialized Agent Profiles

AutoCrate uses 19 pre-configured agent contexts. Pick the agent that matches your task; they preload the right files and heuristics:

| Agent        | Focus                                 |
| ------------ | ------------------------------------- |
| `geometry`   | NX dimensions, coordinate transforms  |
| `3d-viz`     | Three.js / R3F components             |
| `cad-export` | STEP/NX generators                    |
| `ui`         | React UI components                   |
| `testing`    | Jest, Playwright, coverage            |
| `nx`         | NX expressions and tooling            |
| `step`       | STEP assembly integration             |
| `lumber`     | BOM and lumber sizing                 |
| `hardware`   | Fastener placement, Klimp integration |
| `scenario`   | Scenario presets and selectors        |
| `constants`  | Specification constants               |
| `deployment` | CI/CD, Vercel, builds                 |
| `review`     | Code review and architectural checks  |
| `issue`      | Requirement analysis                  |
| `pr`         | Pull request authoring                |
| `quick-fix`  | Small bug fixes                       |
| `feature`    | Large feature workflow                |
| `verify`     | Done criteria validation              |
| `build`      | Build pipeline troubleshooting        |

Start with `geometry`, `ui`, or `cad-export` when in doubt. The rest are for niche issues.

---

## 5. Standard Workflow

1. **Analyze the issue**
   ```bash
   cat .issue-context.md
   ```
2. **Implement changes** (stay in your worktree)
3. **Test**
   ```bash
   npm run test
   npm run build
   ```
4. **Commit**
   ```bash
   git add .
   git commit -m "fix: short description (#ISSUE)"
   ```
5. **Push + PR**
   ```bash
   git push origin sbl-<ISSUE>
   gh pr create --title "fix: ..." --body "Closes #<ISSUE>"
   ```

---

## 6. Cleanup & Handoff

- Run `/cleanup` (or `./scripts/cleanup-worktrees.sh`) after merge.
- Update `/assign` to free the issue.
- Document anything notable in the PR description.

---

## 7. If You Get Confused

- Check `pwd` and `git branch --show-current`.
- If you’re outside `issues/<ISSUE>/`, stop and ask the user.
- Re-read [Worktree Workflow](WORKTREE_WORKFLOW.md) or `docs/workflow/README.md`.
- For agent selection, consult [LLM Optimization Plan](LLM_OPTIMIZATION_PLAN.md).

You now have the full toolkit to operate safely inside AutoCrate. Stay in your sandbox, use the scripts, and keep the automation happy.
