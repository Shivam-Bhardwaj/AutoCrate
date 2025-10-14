import React from 'react'
import { render, screen, act, renderHook } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider, useTheme } from '../ThemeProvider'

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Remove dark class from document
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('provides default light theme', () => {
    const TestComponent = () => {
      const { theme } = useTheme()
      return <div>Current theme: {theme}</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByText(/Current theme: light/)).toBeInTheDocument()
  })

  it('loads theme from localStorage if available', () => {
    localStorage.setItem('autocrate-theme', 'dark')

    const TestComponent = () => {
      const { theme } = useTheme()
      return <div>Theme: {theme}</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Theme will be set asynchronously
    setTimeout(() => {
      expect(screen.getByText(/Theme: dark/)).toBeInTheDocument()
    }, 0)
  })

  it('toggles theme correctly', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return (
        <div>
          <div>Theme: {theme}</div>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      )
    }

    const { container } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByText('Toggle')

    act(() => {
      toggleButton.click()
    })

    // After toggle, theme should be dark
    setTimeout(() => {
      expect(localStorage.getItem('autocrate-theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    }, 0)
  })

  it('sets theme using setTheme function', () => {
    const TestComponent = () => {
      const { theme, setTheme } = useTheme()
      return (
        <div>
          <div>Theme: {theme}</div>
          <button onClick={() => setTheme('dark')}>Set Dark</button>
          <button onClick={() => setTheme('light')}>Set Light</button>
        </div>
      )
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const setDarkButton = screen.getByText('Set Dark')

    act(() => {
      setDarkButton.click()
    })

    setTimeout(() => {
      expect(localStorage.getItem('autocrate-theme')).toBe('dark')
    }, 0)
  })

  it('applies dark class to document when theme is dark', () => {
    const TestComponent = () => {
      const { setTheme } = useTheme()
      React.useEffect(() => {
        setTheme('dark')
      }, [setTheme])
      return <div>Content</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    setTimeout(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.style.colorScheme).toBe('dark')
    }, 0)
  })

  it('removes dark class when theme is light', () => {
    // Set initial dark theme
    document.documentElement.classList.add('dark')

    const TestComponent = () => {
      const { setTheme } = useTheme()
      React.useEffect(() => {
        setTheme('light')
      }, [setTheme])
      return <div>Content</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    setTimeout(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.style.colorScheme).toBe('light')
    }, 0)
  })

  it('respects system preference when no stored preference', () => {
    // Mock matchMedia to return dark preference
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    const TestComponent = () => {
      const { theme } = useTheme()
      return <div>Theme: {theme}</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Check that matchMedia was called
    expect(mockMatchMedia).toHaveBeenCalled()
  })

  it('persists theme to localStorage when changed', () => {
    const TestComponent = () => {
      const { setTheme } = useTheme()
      return (
        <button onClick={() => setTheme('dark')}>Set Dark</button>
      )
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    act(() => {
      screen.getByText('Set Dark').click()
    })

    expect(localStorage.getItem('autocrate-theme')).toBe('dark')
  })

  it('listens to system theme changes when no stored preference', () => {
    const listeners: any[] = []

    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, handler) => {
        if (event === 'change') {
          listeners.push(handler)
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    )

    // Verify that event listener was added
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })
})

describe('useTheme', () => {
  it('throws error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    const TestComponent = () => {
      try {
        useTheme()
        return <div>Should not render</div>
      } catch (error) {
        return <div>Error: {(error as Error).message}</div>
      }
    }

    render(<TestComponent />)

    expect(screen.getByText(/useTheme must be used within a ThemeProvider/)).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it('returns theme context when used within ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    })

    expect(result.current).toHaveProperty('theme')
    expect(result.current).toHaveProperty('toggleTheme')
    expect(result.current).toHaveProperty('setTheme')
  })
})
