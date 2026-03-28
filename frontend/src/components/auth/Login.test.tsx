import { renderWithProviders, screen } from '@/test/helpers'
import Login from './Login'

vi.mock('@/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('Login', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />)
    expect(screen.getByText(/log in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
