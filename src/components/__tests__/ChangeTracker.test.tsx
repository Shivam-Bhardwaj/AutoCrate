import { render, screen, waitFor } from '@testing-library/react'
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

    const formattedTimestamp = new Date(mockMetadata.timestamp).toLocaleString()

    await waitFor(() => {
      expect(screen.getByText(/Issue #83/)).toBeInTheDocument()
      expect(screen.getByText(/improve dark mode visibility/)).toBeInTheDocument()
      expect(screen.getByText(/v13\.3\.0/)).toBeInTheDocument()
      expect(screen.getByText(/abc1234/)).toBeInTheDocument()
      expect(screen.getAllByText(/by test/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(formattedTimestamp)[0]).toBeInTheDocument()
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

  it('should fall back to issue number in commit message when branch is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockMetadata,
        issueNumber: '0',
        branch: 'main',
        lastChange: 'fix: header shows wrong issue (#147)'
      })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Issue #147/)).toBeInTheDocument()
    })
  })

  it('should fall back to tiNumber when other sources missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockMetadata,
        issueNumber: '0',
        branch: 'main',
        tiNumber: 'TI-205-CUSTOM',
        lastChange: 'docs: update handbook'
      })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Issue #205/)).toBeInTheDocument()
    })
  })

  it('should render placeholder when no issue information is available', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockMetadata,
        issueNumber: '0',
        branch: 'main',
        tiNumber: 'TI-PLACEHOLDER',
        lastChange: 'chore: run cleanup'
      })
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.queryByText(/Issue #/)).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /Issue/ })).not.toBeInTheDocument()
    })
  })

  it('should link to GitHub issue', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      const issueLink = screen.getByRole('link', { name: /Issue #83/ })
      expect(issueLink).toHaveAttribute('href', 'https://github.com/Shivam-Bhardwaj/AutoCrate/issues/83')
      expect(issueLink).toHaveAttribute('target', '_blank')
      expect(issueLink).toHaveAttribute('rel', 'noopener noreferrer')
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
  it('should not render additional sections', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockMetadata
    })

    render(<ChangeTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Issue #83/)).toBeInTheDocument()
    })

    expect(screen.queryByText('Visual Testing Checklist:')).not.toBeInTheDocument()
    expect(screen.queryByText(/Check that the UI displays correctly/)).not.toBeInTheDocument()
    expect(screen.queryByText(mockMetadata.branch)).not.toBeInTheDocument()
  })
})
