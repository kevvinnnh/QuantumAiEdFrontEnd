import { renderWithProviders, screen } from '@/test/helpers'
import ProfileCreation from './ProfileCreation'

vi.mock('@/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('ProfileCreation', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<ProfileCreation />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
