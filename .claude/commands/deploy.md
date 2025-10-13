Deploy AutoCrate with proper version management:

Ask the user what type of release this is:

- patch: Bug fixes (13.2.0 → 13.2.1)
- minor: New features (13.2.0 → 13.3.0)
- major: Breaking changes (13.2.0 → 14.0.0)

Then:

1. Run full test suite to ensure everything passes
2. Run the appropriate deploy script (npm run deploy / deploy:minor / deploy:major)
3. Verify the version was bumped in package.json
4. Confirm git commit was created
5. Push to GitHub (triggers Vercel auto-deploy)
6. Report the new version and deployment URL

Do not proceed if tests fail.
