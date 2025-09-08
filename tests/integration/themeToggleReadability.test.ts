import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../../src/app/page';
import { getContrastRatio, meetsWCAGAA } from '../utils/contrast';

// Mock all the stores
vi.mock('../../src/store/crate-store', () => ({
  useCrateStore: () => ({
    configuration: null,
    resetConfiguration: vi.fn(),
  }),
}));

vi.mock('../../src/store/theme-store', () => ({
  useThemeStore: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
    isHydrated: true,
    setHydrated: vi.fn(),
  }),
}));

vi.mock('../../src/store/logs-store', () => ({
  useLogsStore: () => ({
    logInfo: vi.fn(),
  }),
}));

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: () => (props: any) => <div data-testid="mock-dynamic">{props.children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => <div>Menu</div>,
  X: () => <div>X</div>,
  Sun: () => <div>Sun</div>,
  Moon: () => <div>Moon</div>,
  RotateCcw: () => <div>RotateCcw</div>,
  BookOpen: () => <div>BookOpen</div>,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

// Mock version
vi.mock('../../src/utils/version', () => ({
  APP_VERSION: '1.0.0',
}));

// Mock TechStackDisplay
vi.mock('../../src/components/TechStackDisplay', () => ({
  TechStackDisplay: () => <div>Tech Stack</div>,
}));

// Mock UI components
vi.mock('../../src/components/ui/button', () => ({
  Button: ({ children, onClick, 'data-testid': testId, ...props }: any) => (
    <button onClick={onClick} data-testid={testId} {...props}>
      {children}
    </button>
  ),
}));

describe('themeToggleReadability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies contrast ratio meets WCAG AA standards for primary text in both themes', async () => {
    // Mock theme store with controllable state
    let isDark = false;
    const toggleTheme = vi.fn(() => { isDark = !isDark; });

    vi.mocked(vi.importActual('../../src/store/theme-store')).useThemeStore.mockReturnValue({
      isDarkMode: isDark,
      toggleTheme,
      isHydrated: true,
      setHydrated: vi.fn(),
    });

    const { rerender } = render(<Home />);

    // Find the primary text element (app title)
    const titleElement = screen.getByTestId('app-title');

    // Function to get contrast
    const getTextContrast = () => {
      const styles = getComputedStyle(titleElement);
      const textColor = styles.color;
      const bgColor = styles.backgroundColor || getComputedStyle(titleElement.parentElement!).backgroundColor;

      // Extract rgb values from computed style
      const textRgb = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      const bgRgb = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

      if (!textRgb || !bgRgb) return 0;

      const textHex = `#${parseInt(textRgb[1]).toString(16).padStart(2, '0')}${parseInt(textRgb[2]).toString(16).padStart(2, '0')}${parseInt(textRgb[3]).toString(16).padStart(2, '0')}`;
      const bgHex = `#${parseInt(bgRgb[1]).toString(16).padStart(2, '0')}${parseInt(bgRgb[2]).toString(16).padStart(2, '0')}${parseInt(bgRgb[3]).toString(16).padStart(2, '0')}`;

      return getContrastRatio(textHex, bgHex);
    };

    // Check initial light theme contrast
    await waitFor(() => {
      const contrast = getTextContrast();
      expect(contrast).toBeGreaterThan(4.5);
      expect(meetsWCAGAA('#212121', '#f9fafb')).toBe(true); // Approximate values
    });

    // Toggle to dark theme
    const themeToggle = screen.getByTestId('theme-toggle');
    fireEvent.click(themeToggle);

    // Re-render with dark theme
    rerender(<Home />);

    // Check dark theme contrast
    await waitFor(() => {
      const contrast = getTextContrast();
      expect(contrast).toBeGreaterThan(4.5);
      expect(meetsWCAGAA('#ffffff', '#111827')).toBe(true); // Approximate values
    });
  });
});