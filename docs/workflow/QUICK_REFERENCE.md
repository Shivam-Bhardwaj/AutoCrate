# Quick Reference - AutoCrate Workflows

Use this when you already know the flow and just need commands.

## Environment Checks

```bash
pwd                           # Ensure you're in issues/<ISSUE>/
git branch --show-current      # Should be sbl-<ISSUE>
git status                    # Verify clean tree before switching tasks
```

## Core Scripts & Commands

| Task                       | Command                                             |
| -------------------------- | --------------------------------------------------- | ------- |
| Create worktree from issue | `./scripts/issue-workflow.sh <ISSUE                 | URL>`   |
| Jump back into issue       | `./scripts/work-on-issue.sh <ISSUE> [claude         | codex]` |
| Show assignment tracker    | `./scripts/assign-issue.sh --list`                  |
| Free / reassign issue      | `./scripts/assign-issue.sh <ISSUE> <llm> [--start]` |
| Show loaded context        | `./scripts/show-llm-context.sh`                     |
| Clean stale worktrees      | `./scripts/cleanup-worktrees.sh`                    |

## Testing & QA

```bash
npm run lint                   # ESLint checks
npm run type-check             # TypeScript compile check
npm test                       # Jest unit tests
npm run test:all               # Full gauntlet (Jest + Playwright + build)
npm run build                  # Next.js production build
```

## Commit & PR

```bash
git add -A
git commit -m "fix: summary (#ISSUE)"
git push origin sbl-<ISSUE>
gh pr create --title "fix: summary" --body "Closes #<ISSUE>" --base main
```

## Slash Commands (Chat Shortcuts)

- `/issue <#>` — run `issue-workflow.sh`
- `/assign <#> <agent>` — update assignment tracker
- `/test` — run test gauntlet (`test-runner.js`)
- `/build` — run Next build only
- `/feature` — scaffold feature workflow
- `/quick-fix` — start light bugfix workflow
- `/cleanup` — prune merged worktrees

Definitions live in `.claude/commands/*.md`.

## File Groups (multi-file helper)

```bash
./scripts/multi-file-helper.sh core      # app/page.tsx, CrateVisualizer.tsx, nx-generator.ts
./scripts/multi-file-helper.sh ui        # components/
./scripts/multi-file-helper.sh tests     # __tests__/ directories
./scripts/multi-file-helper.sh hardware  # fasteners & cleats
./scripts/multi-file-helper.sh search "pattern"   # ripgrep helper
```

## Emergency Playbook

1. Recon: `pwd`, `git status`
2. Reset: `git restore --staged . && git checkout -- .` (if authorized)
3. Ask for help: leave note in issue, ping owner
4. Don’t guess—stop if unsure

## Handy Aliases (optional)

Add to `~/.bashrc`/`~/.zshrc` for speed:

```bash
alias ac-issue="$PWD/scripts/issue-workflow.sh"
alias ac-work="$PWD/scripts/work-on-issue.sh"
alias ac-test="$PWD/scripts/test-runner.js"
```

Keep this sheet beside you; follow the deeper guides if you need context.
