import { renderWithProviders, screen, waitFor } from '@/test/helpers'
import AdminDashboard from './AdminDashboard'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { users: [], totalUsers: 0 } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('AdminDashboard', () => {
  it('renders admin view', async () => {
    renderWithProviders(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getByText(/admin/i)).toBeInTheDocument()
    })
  })
})
