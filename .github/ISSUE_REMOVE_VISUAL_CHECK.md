# Remove Visual Check Section

## Issue Type
Feature Removal / UI Cleanup

## Description
Remove the visual check section from the crate application. The visual check button and its associated checklist functionality should be removed from the user interface.

## Current Behavior
- A "Visual Check" button is displayed in the lower right corner of the application
- Clicking the button opens a visual checklist modal with various verification questions
- The checklist includes questions about panel stops, lag screws, ground clearance, component visibility, 3D view, and exports

## Expected Behavior
- The visual check button should no longer be visible in the UI
- All visual check functionality should be removed from the application

## Motivation
- Simplify the user interface
- Remove unused or unnecessary functionality
- Clean up the codebase

## Acceptance Criteria
- [ ] Visual check button is removed from the UI
- [ ] No visual check related components are rendered
- [ ] Application builds without errors
- [ ] No linting errors are introduced
- [ ] Related imports are cleaned up

## Technical Details
- Component to remove: `VisualChecklistButton` from `@/components/VisualChecklist`
- File to modify: `src/app/page.tsx`
- Related component file: `src/components/VisualChecklist.tsx` (may be kept for reference or removed entirely)

## Labels
- `enhancement`
- `ui`
- `cleanup`

## Priority
Medium

## Related
- PR: #[PR_NUMBER]

