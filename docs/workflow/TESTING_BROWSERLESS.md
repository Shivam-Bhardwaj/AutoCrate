# Browserless Testing Strategy

This repo adopts a browserless-first testing approach for new features. We prefer fast, deterministic, Node‑only tests over headless browsers for most logic.

What “browserless” means here
- Tests run in Node without launching a real browser.
- Focus on pure functions and serializable outputs (e.g., NX expressions, tutorial steps, callouts, targets).
- UI rendering tests are minimized and can use jsdom when necessary.

Core tactics
- Extract logic from UI into pure lib functions (e.g., tutorial step builder, target selection, callout computation).
- Unit test those functions in a Node environment.
- For UI, stick to shallow/snapshot tests sparingly; prefer verifying the shape of data that powers the UI.

Where to look
- Tutorial Engine tests: `src/lib/tutorial/__tests__/schema.test.ts` (Node environment via file header)

When UI tests are needed
- Use jest + jsdom for component snapshots.
- Avoid Playwright unless you are checking cross‑browser layout/interaction.

Guidelines
1) Keep step/data builders pure and deterministic.
2) Add assertions for presence of critical NX expressions names.
3) Prefer Node test environment for lib tests:

```ts
/* @jest-environment node */
```

4) Use fixtures for generator inputs to lock behavior.

