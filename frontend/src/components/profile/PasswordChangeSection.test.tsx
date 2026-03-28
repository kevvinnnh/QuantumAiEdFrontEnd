import { render, screen } from '@testing-library/react'
import PasswordChangeSection from './PasswordChangeSection'

describe('PasswordChangeSection', () => {
  it('renders set password form for new users', () => {
    render(
      <PasswordChangeSection
        hasPassword={false}
        hasGoogle={true}
        currentPassword=""
        newPassword=""
        confirmPassword=""
        passwordError=""
        passwordMessage=""
        changingPassword={false}
        onCurrentPasswordChange={vi.fn()}
        onNewPasswordChange={vi.fn()}
        onConfirmPasswordChange={vi.fn()}
        onChangePassword={vi.fn()}
      />
    )
    expect(screen.getByText('Set a password')).toBeInTheDocument()
    expect(screen.getByText('Set Password')).toBeInTheDocument()
  })
})
