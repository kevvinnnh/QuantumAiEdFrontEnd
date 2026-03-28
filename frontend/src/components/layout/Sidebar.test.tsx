import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'
import React from 'react'

vi.mock('@/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

describe('Sidebar', () => {
  it('renders without crashing', () => {
    const dropdownRef = React.createRef<HTMLDivElement>()
    const buttonRef = React.createRef<HTMLButtonElement>()
    render(
      <Sidebar
        currentView="dashboard"
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onNavigateToDashboard={vi.fn()}
        onCollapsedProfileClick={vi.fn()}
        showProfileDropdown={false}
        setShowProfileDropdown={vi.fn()}
        profileDropdownRef={dropdownRef}
        profileButtonRef={buttonRef}
        onProfileClick={vi.fn()}
        onSettingsClick={vi.fn()}
        onHelpClick={vi.fn()}
        onSignOutClick={vi.fn()}
        onLeaveFeedbackClick={vi.fn()}
        chatWidth={0}
        screenWidth={1200}
        animationDuration={300}
        animationEasing="ease"
        userEmail="test@example.com"
        userName="Test User"
        userPicture=""
      />
    )
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
