Start work on a GitHub issue:

1. Ask the user for the issue number or describe the task
2. If issue number provided, fetch issue details via GitHub CLI (`gh issue view`)
3. Create an appropriately named branch:
   - Format: `issue-{number}-{brief-description}`
   - Or: `feature/{description}`, `fix/{description}`, etc.

4. Create an implementation plan:
   - Break down the issue into subtasks
   - Identify files that need modification
   - List tests that need to be written
   - Note any dependencies or blockers

5. Update PROJECT_STATUS.md to mark the module as "in progress"
6. Use TodoWrite tool to track subtasks
7. Show the plan to the user and ask if they're ready to proceed

When ready to implement:

- Guide through each subtask
- Write code with tests
- Run tests after each change
- Keep commits atomic and well-documented
