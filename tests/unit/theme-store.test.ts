import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useThemeStore } from '@/store/theme-store';

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({ isDarkMode: false });

    // Clear all mocks
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have light theme as default', () => {
      const { isDarkMode } = useThemeStore.getState();
      expect(isDarkMode).toBe(false);
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from light to dark', () => {
      const store = useThemeStore.getState();
      expect(store.isDarkMode).toBe(false);

      store.toggleTheme();

      const updatedStore = useThemeStore.getState();
      expect(updatedStore.isDarkMode).toBe(true);
    });

    it('should toggle from dark to light', () => {
      useThemeStore.setState({ isDarkMode: true });
      const store = useThemeStore.getState();
      expect(store.isDarkMode).toBe(true);

      store.toggleTheme();

      const updatedStore = useThemeStore.getState();
      expect(updatedStore.isDarkMode).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const store = useThemeStore.getState();

      store.toggleTheme();
      expect(useThemeStore.getState().isDarkMode).toBe(true);

      store.toggleTheme();
      expect(useThemeStore.getState().isDarkMode).toBe(false);

      store.toggleTheme();
      expect(useThemeStore.getState().isDarkMode).toBe(true);
    });
  });

  describe('Set Theme', () => {
    it('should set theme to dark', () => {
      const store = useThemeStore.getState();

      store.setTheme(true);

      const updatedStore = useThemeStore.getState();
      expect(updatedStore.isDarkMode).toBe(true);
    });

    it('should set theme to light', () => {
      useThemeStore.setState({ isDarkMode: true });
      const store = useThemeStore.getState();

      store.setTheme(false);

      const updatedStore = useThemeStore.getState();
      expect(updatedStore.isDarkMode).toBe(false);
    });

    it('should handle setting same theme', () => {
      const store = useThemeStore.getState();

      store.setTheme(false);

      const updatedStore = useThemeStore.getState();
      expect(updatedStore.isDarkMode).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should maintain state across multiple operations', () => {
      const store = useThemeStore.getState();

      store.setTheme(true);
      expect(useThemeStore.getState().isDarkMode).toBe(true);

      store.toggleTheme();
      expect(useThemeStore.getState().isDarkMode).toBe(false);

      store.setTheme(true);
      expect(useThemeStore.getState().isDarkMode).toBe(true);
    });

    it('should handle rapid toggles', () => {
      const store = useThemeStore.getState();

      for (let i = 0; i < 10; i++) {
        store.toggleTheme();
      }

      // After 10 toggles, should be back to original state
      expect(useThemeStore.getState().isDarkMode).toBe(false);
    });
  });

  describe('Multiple Subscriptions', () => {
    it('should notify all subscribers when theme changes', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = useThemeStore.subscribe(listener1);
      const unsubscribe2 = useThemeStore.subscribe(listener2);

      const store = useThemeStore.getState();
      store.toggleTheme();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });
  });
});
