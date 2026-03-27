import { render, screen, waitFor } from '@testing-library/react'
import ProfileModal from './Profile'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        name: 'Test User',
        profilePicture: '',
        educationCategory: '',
        educationLevel: '',
        subjectsStudied: [],
        codingExperience: '',
        favoriteHobbies: [],
        customHobbies: '',
        hobbyPersonalization: true,
        hasPassword: false,
        hasGoogle: true,
      },
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('ProfileModal', () => {
  it('renders profile modal when open', async () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={vi.fn()}
        userName="Test User"
      />
    )
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    })
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <ProfileModal
        isOpen={false}
        onClose={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
