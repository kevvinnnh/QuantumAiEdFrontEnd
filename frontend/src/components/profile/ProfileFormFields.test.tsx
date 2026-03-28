import { render, screen } from '@testing-library/react'
import ProfileFormFields from './ProfileFormFields'

describe('ProfileFormFields', () => {
  it('renders education, subjects, coding, and hobbies sections', () => {
    render(
      <ProfileFormFields
        educationCategory=""
        educationLevel=""
        otherEducationLevel=""
        subjectsStudied={[]}
        otherSubject=""
        codingExperience=""
        favoriteHobbies={[]}
        customHobbies=""
        hobbyPersonalization={true}
        onEducationChange={vi.fn()}
        onSubjectToggle={vi.fn()}
        onOtherSubjectChange={vi.fn()}
        onCodingExperienceChange={vi.fn()}
        onHobbyToggle={vi.fn()}
        onCustomHobbiesChange={vi.fn()}
        onHobbyPersonalizationToggle={vi.fn()}
      />
    )
    expect(screen.getByText(/education level/i)).toBeInTheDocument()
    expect(screen.getByText(/subjects studied/i)).toBeInTheDocument()
    expect(screen.getByText(/coding experience/i)).toBeInTheDocument()
    expect(screen.getByText(/Your hobbies & interests/)).toBeInTheDocument()
  })
})
