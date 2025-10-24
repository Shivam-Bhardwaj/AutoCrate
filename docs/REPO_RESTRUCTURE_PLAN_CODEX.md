## Repository Restructure Plan (Codex's Proposal)

**NOTE:** This plan was originally created in `/AutoCrate/docs/` (parent directory) before the dual-repository situation was discovered. User has since decided that `repo/` is the authoritative repository and the parent directory will be archived. This plan should be interpreted with that context in mind.

### Objectives
- Reduce root-level clutter so contributors see only active app, docs, automation, and config assets.
- Preserve prior agent handoffs and CAD artifacts without deleting them, moving them into clearly labeled archives.
- Document the new layout and add guardrails that keep future additions organized.

### Proposed Actions
1. **Audit & Categorize**
   - Inventory every root asset and tag it as core app, documentation, automation, legacy, or exploratory.
   - Assign owners to verify whether each item remains needed in the active tree.

2. **Streamline Root**
   - Relocate handoff and agent notes (`AGENTS.md`, `LLM_*`, `PREVIEW_FINAL_STATE.md`, `WORKTREE_WORKFLOW.md`) into `docs/history/`, prefixing filenames with dates for context.
   - Move legacy CAD artifacts (`CAD FILES/`, `debug-output.stp`, long-form delivery summaries) into `docs/assets/` or a new `storage/` directory with an explanatory README.

3. **Consolidate Documentation**
   - Merge overlapping guides (`B_STYLE_DELIVERY_SUMMARY.md`, `NOTE_FOR_KEELYN.md`, `QUICK_REFERENCE.md`) into refreshed topics under `docs/guides/`.
   - Update `docs/README.md` with links to the new sections and archive resolved issues from `issues/` into `docs/history/issues/`.

4. **Normalize Automation**
   - Move stray helpers such as `create-pr.sh` into `scripts/`, adopting a consistent naming pattern.
   - Add or update `scripts/README.md` with a table outlining each script’s purpose and usage.

5. **Handle Samples & Artifacts**
   - Group sandbox or demo content (`projects/`, experimental exports) into `samples/`.
   - Ensure large binaries and generated outputs (`test-report.json`, `workspace/` artifacts) are ignored via `.gitignore` or managed with Git LFS; route future outputs into an `artifacts/` directory.

6. **Update Guardrails**
   - Record the final structure in `README.md` and `CONTRIBUTING.md`.
   - Optionally add a lint or CI check that flags unexpected new root-level files so the structure stays clean.

### Rollout Strategy
- Share the categorized inventory for sign-off before moving files.
- Execute the relocation in focused PRs (docs, assets, automation) to keep diffs reviewable.
- Run the existing test suite after each batch move to ensure no scripts or paths break.

### Open Questions
- Confirm which CAD assets must remain version-controlled versus stored externally.
- Decide whether historical agent outputs should remain in the main repo or move to a separate archival branch.
- Validate that pushing artifacts to Git LFS aligns with the team’s workflow and hosting limits.
