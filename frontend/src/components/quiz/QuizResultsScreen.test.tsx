import { render, screen } from '@testing-library/react'
import QuizResultsScreen from './QuizResultsScreen'

describe('QuizResultsScreen', () => {
  it('renders without crashing', () => {
    render(
      <QuizResultsScreen
        score={8}
        totalQuestions={10}
        durationMinutes={2}
        durationSeconds={30}
      />
    )
    expect(screen.getByText(/80%/)).toBeInTheDocument()
  })
})
