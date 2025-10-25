import { render, screen, waitFor } from '@testing-library/react'
import Mermaid from '../../components/Mermaid'

describe('Mermaid component', () => {
  afterEach(() => {
    // @ts-ignore
    delete window.mermaid
  })

  it('renders fallback code block when Mermaid is not ready', async () => {
    render(<Mermaid chart={`graph LR\nA-->B`} />)
    expect(screen.getByText(/graph LR/)).toBeInTheDocument()
  })

  it('renders SVG when Mermaid is available', async () => {
    // @ts-ignore
    window.mermaid = {
      initialize: jest.fn(),
      render: jest.fn().mockResolvedValue({ svg: '<svg role="img" aria-label="mermaid-diagram"></svg>' })
    }
    render(<Mermaid chart={`graph LR\nA-->B`} />)
    await waitFor(() => {
      // The container innerHTML is replaced; look for a rendered SVG
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })
})

