import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('renders the appropriate theme icon after mount', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: jest.fn(),
    })

    const { container } = render(<ThemeToggle />)

    // After mount completes, should render the sun icon and no placeholder
    expect(container.querySelector('svg')).toBeTruthy()
    expect(container.querySelector('.bg-gray-300')).toBeNull()
  })
})

describe('ThemeToggle Integration', () => {
  const actualThemeModule = jest.requireActual('../ThemeProvider')

  beforeAll(() => {
    mockUseTheme.mockReset()
    mockUseTheme.mockImplementation(actualThemeModule.useTheme)
  })

  afterAll(() => {
    mockUseTheme.mockReset()
  })

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

  it('should toggle theme on click', async () => {
    window.localStorage.clear()

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    const initialAriaPressed = button.getAttribute('aria-pressed')

    // Wait for ThemeProvider effects to apply initial theme
    await waitFor(() => {
      expect(document.documentElement.style.colorScheme).toBeTruthy()
    })

    fireEvent.click(button)

    // After click, aria-pressed should change to reflect new theme
    await waitFor(() => {
      expect(window.localStorage.getItem('autocrate-theme')).toBe(initialAriaPressed === 'true' ? 'light' : 'dark')
    })

    const updatedButton = screen.getByRole('button')
    expect(updatedButton.getAttribute('aria-label')).toBe('Switch to light mode')
  })
})
