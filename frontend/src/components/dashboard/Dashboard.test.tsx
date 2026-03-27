import { renderWithProviders } from '@/test/helpers'
import Dashboard from './Dashboard'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { completedQuizzes: [], activeCourses: [] } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('Dashboard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Dashboard />)
    expect(container.querySelector('aside')).toBeInTheDocument()
  })
})
