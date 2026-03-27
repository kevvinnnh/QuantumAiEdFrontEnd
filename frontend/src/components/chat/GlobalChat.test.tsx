import { render, screen } from '@testing-library/react'
import GlobalChat from './GlobalChat'

vi.mock('@/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('GlobalChat', () => {
  it('renders when open', () => {
    render(
      <GlobalChat
        isOpen={true}
        onClose={vi.fn()}
        highlightText={null}
        highlightMode={null}
        courseId={0}
      />
    )
    expect(screen.getByPlaceholderText(/message|ask|type/i)).toBeInTheDocument()
  })
})
