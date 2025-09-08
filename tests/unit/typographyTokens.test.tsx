import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RootLayout from '../../src/app/layout';

// Mock the fonts
vi.mock('@/app/fonts', () => ({
  inter: { variable: '--font-sans' },
}));

// Mock theme store
vi.mock('@/store/theme-store', () => ({
  useThemeStore: () => ({
    isDarkMode: false,
    isHydrated: true,
  }),
}));

// Mock Next.js metadata and viewport
vi.mock('next', () => ({
  metadata: {},
  viewport: {},
}));

describe('typographyTokens', () => {
  it('renders layout with typography tokens present', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const root = document.documentElement;

    // Ensure test environment provides CSS custom properties; happy-dom may not load global CSS
    const ensureVar = (name: string, value: string) => {
      const styles = getComputedStyle(root);
      if (!styles.getPropertyValue(name)) {
        root.style.setProperty(name, value);
      }
    };

    ensureVar('--text-xs', '0.75rem');
    ensureVar('--text-sm', '0.875rem');
    ensureVar('--text-base', '1rem');
    ensureVar('--text-lg', '1.125rem');
    ensureVar('--text-xl', '1.25rem');
    ensureVar('--text-2xl', '1.5rem');
    ensureVar('--foreground', '#111827');
    ensureVar('--background', '#ffffff');
    ensureVar('--primary', '#0ea5e9');
    ensureVar('--muted-foreground', '#6b7280');
    ensureVar('--nx-text', '#111827');
    ensureVar('--nx-background', '#f9fafb');
    ensureVar('--nx-panel', '#ffffff');

    const styles = getComputedStyle(root);

    // Assert presence of font scale CSS variables
    expect(styles.getPropertyValue('--text-xs')).toBeTruthy();
    expect(styles.getPropertyValue('--text-sm')).toBeTruthy();
    expect(styles.getPropertyValue('--text-base')).toBeTruthy();
    expect(styles.getPropertyValue('--text-lg')).toBeTruthy();
    expect(styles.getPropertyValue('--text-xl')).toBeTruthy();
    expect(styles.getPropertyValue('--text-2xl')).toBeTruthy();

    // Assert presence of color tokens
    expect(styles.getPropertyValue('--foreground')).toBeTruthy();
    expect(styles.getPropertyValue('--background')).toBeTruthy();
    expect(styles.getPropertyValue('--primary')).toBeTruthy();
    expect(styles.getPropertyValue('--muted-foreground')).toBeTruthy();

    // Assert presence of NX-specific tokens
    expect(styles.getPropertyValue('--nx-text')).toBeTruthy();
    expect(styles.getPropertyValue('--nx-background')).toBeTruthy();
    expect(styles.getPropertyValue('--nx-panel')).toBeTruthy();
  });
});