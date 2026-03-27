import { render, screen } from '@testing-library/react'
import QuizFooter from './QuizFooter'

describe('QuizFooter', () => {
  it('renders skip button when question not completed', () => {
    render(
      <QuizFooter
        showResultsScreen={false}
        hasSubmitted={false}
        questionCompleted={false}
        showAnswersEnabled={true}
        isCorrect={null}
        canContinue={false}
        showReviewConcept={false}
        timeModeEnabled={false}
        timeRemaining={60}
        timeLimit={60}
        circumference={100}
        strokeDashoffset={0}
        getTimerColor={() => '#4ade80'}
        onLeaveFeedback={vi.fn()}
        onSkip={vi.fn()}
        onReviewConcept={vi.fn()}
        onCloseReviewConcept={vi.fn()}
        onContinue={vi.fn()}
      />
    )
    expect(screen.getByText(/skip/i)).toBeInTheDocument()
  })
})
