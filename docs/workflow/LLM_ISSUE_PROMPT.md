# Generic LLM Issue Prompt

Use this prompt with any LLM (Claude, Codex, etc.) to work on GitHub issues.

## Full Prompt Template

```
Work on issue #[NUMBER]. Follow this workflow:

SETUP:
1. Check issue details: gh issue view [NUMBER]
2. Create/use worktree:
   - If issues/[NUMBER]/ exists: cd issues/[NUMBER] && git pull origin main
   - If not: ./scripts/worktree-issue.sh [NUMBER] && cd issues/[NUMBER]
3. Assign to yourself: ./scripts/assign-issue.sh [NUMBER] [llm-name]
4. Read .issue-context.md for requirements

IMPLEMENT:
5. Analyze the current code
6. Implement the fix (don't ask for permission - just do it)
7. Test your changes: npm test && npm run type-check

COMPLETE:
8. Commit: git add -A && git commit -m "fix: [description] (#[NUMBER])"
9. Push: git push origin sbl-[NUMBER]
10. Create PR: gh pr create --fill
11. Report: Show me the PR URL

IMPORTANT: Be proactive. Don't ask for approval at each step - execute the plan, test it, and create the PR. Only ask questions if requirements are unclear.
```

## Short Version

```
Work on #[NUMBER].

Workflow: Check issue → Setup worktree (./scripts/worktree-issue.sh [NUMBER] or cd issues/[NUMBER] if exists) → Assign yourself → Read .issue-context.md → Implement fix → Test (npm test && npm run type-check) → Commit → Push → Create PR (gh pr create --fill).

Be proactive: Don't ask permission, just execute, test, and create the PR. Ask only if requirements are unclear.
```

## Examples

### For Claude:

```
Work on #149.

Workflow: Check issue → Setup worktree (./scripts/worktree-issue.sh 149 or cd issues/149 if exists) → Assign yourself (./scripts/assign-issue.sh 149 claude) → Read .issue-context.md → Implement fix → Test → Commit → Push → Create PR (gh pr create --fill).

Be proactive: Don't ask permission, just execute, test, and create the PR.
```

### For Codex:

```
Work on #140.

Workflow: Check issue → Setup worktree (./scripts/worktree-issue.sh 140 or cd issues/140 if exists) → Assign yourself (./scripts/assign-issue.sh 140 codex) → Read .issue-context.md → Implement fix → Test → Commit → Push → Create PR (gh pr create --fill).

Be proactive: Don't ask permission, just execute, test, and create the PR.
```

## Key Points

1. **Generic**: Works with any LLM (Claude, Codex, GPT, etc.)
2. **Proactive**: Tells LLM not to ask for permission
3. **Handles existing worktrees**: Checks if worktree exists first
4. **Complete workflow**: From issue to PR
5. **Testing included**: Always test before committing
6. **Clear end goal**: Create PR and report URL

## Usage

Just replace `[NUMBER]` with the issue number and `[llm-name]` with the LLM you're using:

- `claude` for Claude Code
- `codex` for Codex
- `cursor` for Cursor AI
- etc.
