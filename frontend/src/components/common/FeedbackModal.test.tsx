import { render, screen } from '@testing-library/react'
import FeedbackModal from './FeedbackModal'

vi.mock('@/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('FeedbackModal', () => {
  it('renders when open', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText(/feedback/i)).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <FeedbackModal
        isOpen={false}
        onClose={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
