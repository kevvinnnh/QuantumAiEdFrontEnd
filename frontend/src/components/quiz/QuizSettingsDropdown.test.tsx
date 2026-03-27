import { render, screen } from '@testing-library/react'
import QuizSettingsDropdown from './QuizSettingsDropdown'

describe('QuizSettingsDropdown', () => {
  it('renders without crashing', () => {
    render(
      <QuizSettingsDropdown
        dropdownRef={null}
        position={{ x: 100, y: 200 }}
        settings={[
          { label: 'Sound Effects', key: 'sound', enabled: true },
          { label: 'Show Answers', key: 'answers', enabled: false },
          { label: 'Time Mode', key: 'time', enabled: true },
        ]}
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByText('Sound Effects')).toBeInTheDocument()
    expect(screen.getByText('Show Answers')).toBeInTheDocument()
  })
})
