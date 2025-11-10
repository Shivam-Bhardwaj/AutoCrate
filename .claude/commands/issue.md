Auto-solve any GitHub issue - just say the repo and issue number.

When the user provides an issue number (e.g., "124" or a GitHub issue URL):

1. Run the worktree setup script: `./scripts/worktree-issue.sh [issue-number]`
2. This will:
   - Create an isolated git worktree in `issues/[number]/`
   - Fetch issue details from GitHub
   - Create a branch for the issue
   - Set up an issue context file
3. Change directory to the worktree: `cd issues/[number]`
4. Read the `.issue-context.md` file to understand the issue
5. Analyze the issue and create an implementation plan
6. Implement the fix or feature
7. Run tests and verify the changes
8. Commit with proper message format
9. Push the branch and create a PR

This allows multiple LLMs (Claude Code, Codex, etc.) to work on different issues simultaneously without conflicts.

If the worktree already exists, just cd into it and continue working.
