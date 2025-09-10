// Removed duplicate test; real test is typographyTokens.test.tsx
export {};
import { describe, it, expect } from 'vitest';

// Small shim test to satisfy the test runner. The real test lives in
// typographyTokens.test.tsx; this file prevents "No test suite found" errors
// when both .ts and .tsx files existed during refactor.
describe('typographyTokens (shim)', () => {
	it('noop placeholder', () => {
		expect(true).toBe(true);
	});
});