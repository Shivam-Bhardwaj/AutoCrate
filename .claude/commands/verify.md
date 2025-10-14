Run complete verification of AutoCrate codebase:

Perform comprehensive health check:

1. **Git Status**: Check for uncommitted changes
2. **TypeScript**: Run type checking (npm run type-check)
3. **Linting**: Run ESLint (npm run lint)
4. **Unit Tests**: Run Jest tests (npm test)
5. **Build**: Create production build (npm run build)
6. **Security**: Run npm audit
7. **Dependencies**: Check for outdated packages
8. **Version**: Verify version consistency across files

Report:

- Overall health status ([DONE] or [X])
- Any issues found
- Suggestions for fixes
- Whether the codebase is ready for deployment

This is perfect to run before creating a pull request or deploying.
