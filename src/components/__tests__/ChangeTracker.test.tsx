import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChangeTracker } from '../ChangeTracker'

// Mock fetch
global.fetch = jest.fn()

const mockMetadata = {
  version: '13.3.0',
  tiNumber: 'TI-83',
  issueNumber: '83',
  branch: 'feature/issue-83-dark-mode',
  lastCommit: 'abc1234',
  lastChange: 'fix: improve dark mode visibility',
  timestamp: '2025-10-16T12:00:00Z',
  updatedBy: 'test@example.com',
  testInstructions: ['Check dark mode', 'Verify datum planes visible']
}

describe('ChangeTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing when metadata fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed'))

    const { container } = render(<ChangeTracker />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('should render banner with metadata', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Issue #83/)).toBeInTheDocument()
      expect(screen.getByText(/improve dark mode visibility/)).toBeInTheDocument()
      expect(screen.getByText(/v13\.3\.0/)).toBeInTheDocument()
      expect(screen.getByText(/abc1234/)).toBeInTheDocument()
    })
  })

  it('should extract issue number from branch name', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ ...mockMetadata, issueNumber: '0' })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Issue #83/)).toBeInTheDocument()
    })
  })

  it('should toggle expanded state on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText(/improve dark mode visibility/)).toBeInTheDocument()
    })

    // Should not show checklist initially
    expect(screen.queryByText('Visual Testing Checklist:')).not.toBeInTheDocument()

    // Click to expand
    const banner = screen.getByText(/improve dark mode visibility/).closest('div')
    if (banner) {
      fireEvent.click(banner)
    }

    // Should show checklist
    await waitFor(() => {
      expect(screen.getByText('Visual Testing Checklist:')).toBeInTheDocument()
    })
  })

  it('should generate test items based on change title', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockMetadata,
        lastChange: 'feat: add 3D visualization export button'
      })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      const banner = screen.getByText(/3D visualization export/).closest('div')
      if (banner) {
        fireEvent.click(banner)
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/Verify 3D crate visualization renders properly/)).toBeInTheDocument()
      expect(screen.getByText(/Verify file export\/download works/)).toBeInTheDocument()
    })
  })

  it('should track checked items', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      const banner = screen.getByText(/improve dark mode visibility/).closest('div')
      if (banner) {
        fireEvent.click(banner)
      }
    })

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Should show 0/N tested initially
      expect(screen.getByText(/0\/\d+ tested/)).toBeInTheDocument()

      // Check first checkbox
      fireEvent.click(checkboxes[0])

      // Should update counter
      expect(screen.getByText(/1\/\d+ tested/)).toBeInTheDocument()
    })
  })

  it('should link to GitHub issue', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      const link = screen.getByText(/Issue #83/).closest('a')
      expect(link).toHaveAttribute('href', 'https://github.com/Shivam-Bhardwaj/AutoCrate/issues/83')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('should display branch and author information when expanded', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      const banner = screen.getByText(/improve dark mode visibility/).closest('div')
      if (banner) {
        fireEvent.click(banner)
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/feature\/issue-83-dark-mode/)).toBeInTheDocument()
      expect(screen.getByText(/by test/)).toBeInTheDocument()
    })
  })

  it('should remove conventional commit prefixes from title', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockMetadata,
        lastChange: 'feat: amazing new feature'
      })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText('amazing new feature')).toBeInTheDocument()
      expect(screen.queryByText('feat:')).not.toBeInTheDocument()
    })
  })

  it('should handle UI-related changes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockMetadata,
        lastChange: 'update UI components and display'
      })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      const banner = screen.getByText(/UI components/).closest('div')
      if (banner) {
        fireEvent.click(banner)
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/Check that the UI displays correctly/)).toBeInTheDocument()
    })
  })
})