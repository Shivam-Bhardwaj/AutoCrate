# Issue: Prevent Duplicate Expression Declarations in NX Export

## Problem

When importing NX expressions into a template part file, users encounter "Rule already exists" errors for expressions that are already defined in the template (e.g., `SKID_WIDTH`, `SKID_HEIGHT`). This causes import failures and requires manual cleanup.

### Error Example

```
Errors importing expressions into part __TEMPLATE

[Inch]SKID_WIDTH = 5.500 - Rule already exists
[Inch]SKID_HEIGHT = 5.500 - Rule already exists
```

## Root Cause

The `NXGenerator.exportNXExpressions()` method exports all generated expressions without checking if they already exist in the template part. Template parts often have predefined constants (like skid dimensions) that should not be overwritten.

## Solution

Implement an exclusion mechanism that:

1. Maintains a list of template-defined expressions that should not be exported
2. Automatically filters out excluded expressions before generating the export file
3. Provides clear documentation in the exported file about which expressions were excluded
4. Makes it easy to add more expressions to the exclusion list as needed

## Acceptance Criteria

- [x] Expressions already defined in template (`SKID_WIDTH`, `SKID_HEIGHT`) are excluded from export
- [x] Exclusion list is easily configurable for future additions
- [x] Exported file includes a comment listing excluded expressions
- [x] Case-insensitive matching for expression names
- [x] No breaking changes to existing functionality
- [x] All tests pass

## Implementation Details

### Changes Made

1. **Added `EXCLUDED_EXPRESSIONS` Set** in `NXGenerator` class:
   - Static readonly Set containing template-defined expressions
   - Currently includes: `skid_width`, `skid_height`
   - Case-insensitive matching

2. **Updated `exportNXExpressions()` method**:
   - Filters expressions against exclusion list before export
   - Tracks excluded expressions and adds informative comments
   - Maintains all existing functionality for non-excluded expressions

3. **Documentation**:
   - Added inline comments explaining how to add more expressions
   - Export file includes note about excluded expressions

### Files Changed

- `src/lib/nx-generator.ts`
  - Added `EXCLUDED_EXPRESSIONS` static property
  - Updated `exportNXExpressions()` to filter excluded expressions

## Testing

- [x] Verify excluded expressions are not in exported file
- [x] Verify non-excluded expressions are still exported correctly
- [x] Verify case-insensitive matching works
- [x] Verify exported file includes exclusion comments
- [x] Run linting: `npm run lint`
- [x] Run type checking: `npm run type-check`

## Future Enhancements

- Consider making exclusion list configurable via `CrateConfig` interface
- Add validation to warn if excluded expressions are referenced but not defined in template
- Consider auto-detecting duplicates if NX API becomes available

## Related Issues

None
