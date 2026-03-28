import { render, screen } from '@testing-library/react'
import DashboardHeader from './DashboardHeader'

describe('DashboardHeader', () => {
  it('renders search bar', () => {
    render(
      <DashboardHeader
        searchQuery=""
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        view="dashboard"
        quizOpen={false}
        onChatToggle={vi.fn()}
        headerStyle={{}}
      />
    )
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })
})
