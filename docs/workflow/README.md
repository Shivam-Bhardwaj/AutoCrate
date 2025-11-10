# Workflow Documentation

Welcome! This directory contains everything an AI assistant or human operator needs to work inside the AutoCrate multi-LLM system.

## Orientation

- [Quick Start](QUICK_START.md) — the minimal set of steps to go from an issue link to committed code.
- [Quick Reference](QUICK_REFERENCE.md) — lightning-fast command crib sheet when you just need the syntax.
- [LLM Onboarding](LLM_ONBOARDING.md) — mandatory first read for any assistant landing in a worktree.
- [Worktree Workflow](WORKTREE_WORKFLOW.md) — deep dive into the git worktree mechanics, cleanup, and maintenance.

## Workflow Operations

- [Assigning Tasks](ASSIGNING_TASKS.md) — how issues get triaged, assigned, and tracked across assistants.
- [How to Use Multi-LLM](HOW_TO_USE_MULTI_LLM.md) — end-to-end orchestration, including approval flows and script usage.
- [Worktree Cleanup](WORKTREE_CLEANUP.md) — reclaim disk space and keep worktrees healthy after handoff.

## Agent Playbooks

- [LLM Optimization Plan](LLM_OPTIMIZATION_PLAN.md) — strategy for agent selection, context sizing, and recovery.
- [Codex Starter Prompt](CODEX_STARTER_PROMPT.txt) — the exact prompt to bootstrap Codex with the right context.

## Slash Commands & Automation

The following commands are available via chat or scripts (full definitions live in the repo under `.claude/commands/`):

| Command      | Purpose                                                        |
| ------------ | -------------------------------------------------------------- |
| `/issue`     | Spin up a new worktree for a GitHub issue and generate context |
| `/assign`    | Update the shared assignment tracker for an issue              |
| `/test`      | Run the curated test suite (type check, Jest, build, security) |
| `/build`     | Execute the Next.js production build front to back             |
| `/deploy`    | Kick off the deployment pipeline                               |
| `/verify`    | Perform the full health check (tests + build + audit)          |
| `/feature`   | Launch the feature workflow template                           |
| `/quick-fix` | Lightweight bug fix workflow                                   |
| `/step`      | STEP export helper commands                                    |
| `/nx`        | NX expression workflow                                         |
| `/3d`        | 3D visualization helper commands                               |
| `/lumber`    | Lumber and BOM helper commands                                 |
| `/hardware`  | Hardware placement utilities                                   |
| `/scenario`  | Scenario configuration scripts                                 |

Each slash command maps to a helper script in `scripts/` and a context file in `.claude/commands/` with detailed behaviour.

## Specialized Agents

AutoCrate ships with 19 pre-configured agent profiles. Use these when you need focused expertise:

1. **geometry** — dimensional math, coordinate transforms (`nx-generator.ts`, `crate-constants.ts`)
2. **3d-viz** — Three.js and React Three Fiber components (`CrateVisualizer.tsx`, `KlimpModel.tsx`)
3. **cad-export** — STEP and NX export logic (`step-generator.ts`, `nx-generator.ts`)
4. **ui** — user interface components and state (`app/page.tsx`, `components/`)
5. **testing** — Jest and Playwright coverage (`__tests__/`, configs)
6. **nx** — NX expression maintenance (`nx-generator.ts`)
7. **step** — STEP assembly structure (`*-step-integration.ts`)
8. **lumber** — BOM and lumber calculations (`LumberCutList.tsx`)
9. **hardware** — fastener placement and Klimp integration (`klimp-*.ts`)
10. **scenario** — preset scenarios and configuration flows (`ScenarioSelector.tsx`)
11. **constants** — specification and constant management (`crate-constants.ts`)
12. **deployment** — CI/CD and hosting (`package.json`, `vercel.json`)
13. **review** — architectural review and refactors (`START_HERE.md`, `ARCHITECTURE.md`)
14. **issue** — backlog triage and requirements (`START_HERE.md`, issue templates)
15. **pr** — PR authoring and validation (`COMMIT_GUIDELINES.md`)
16. **quick-fix** — small fixes with guardrails (`START_HERE.md` common tasks)
17. **feature** — large features with full context (`MODULES.md`, `PROJECT_STATUS.md`)
18. **verify** — validation passes for done criteria (`TESTING_GUIDE.md`)
19. **build** — compile and bundle flows (`next.config.js`, `tsconfig.json`)

When in doubt, start with **geometry**, **ui**, or **cad-export**—they cover most day-to-day work. Use the others when the issue explicitly mentions their domain.

## Need More Help?

- For command usage: open `.claude/commands/` and read the matching file.
- For automation scripts: check `scripts/README.md` (it mirrors this guide).
- For historical context: see `docs/archive/` after we finish the cleanup.

Happy shipping! Every workflow above lets you drop a GitHub issue link into Codex/Claude and let the automation do the heavy lifting.
