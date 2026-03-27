import { render, screen } from '@testing-library/react'
import ProfilePictureUpload from './ProfilePictureUpload'

describe('ProfilePictureUpload', () => {
  it('renders avatar fallback when no picture', () => {
    render(
      <ProfilePictureUpload
        picSrc=""
        firstName="Alice"
        onPictureChange={vi.fn()}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('Change Photo')).toBeInTheDocument()
  })
})
