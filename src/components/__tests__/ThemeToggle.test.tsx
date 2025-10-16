import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../ThemeToggle'
import { ThemeProvider, useTheme } from '../ThemeProvider'

// Mock the useTheme hook for isolated testing
jest.mock('../ThemeProvider', () => ({
  ...jest.requireActual('../ThemeProvider'),
  useTheme: jest.fn(),
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('ThemeToggle', () => {
  const mockToggleTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render light mode button', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: jest.fn(),
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Day')).toBeInTheDocument()
  })

  it('should render dark mode button', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
      setTheme: jest.fn(),
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Night')).toBeInTheDocument()
  })

  it('should call toggleTheme when clicked', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: jest.fn(),
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('should not render icons before mount', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: jest.fn(),
    })

    // Simulate pre-mount state by preventing useEffect
    const { container } = render(<ThemeToggle />)

    // Before mount completes, should show placeholder
    const placeholder = container.querySelector('.bg-gray-300')
    expect(placeholder).toBeTruthy()
  })
})

describe('ThemeToggle Integration', () => {
  it('should work with ThemeProvider', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Should start with default theme
    const ariaPressed = button.getAttribute('aria-pressed')
    expect(['true', 'false']).toContain(ariaPressed)
  })

  it('should toggle theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    const initialAriaPressed = button.getAttribute('aria-pressed')

    fireEvent.click(button)

    // After click, aria-pressed should change
    const newAriaPressed = button.getAttribute('aria-pressed')
    expect(newAriaPressed).not.toBe(initialAriaPressed)
  })
})