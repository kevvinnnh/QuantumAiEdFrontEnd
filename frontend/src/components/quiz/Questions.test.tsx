import { render, screen } from '@testing-library/react'
import Questions from './Questions'
import type { Question } from '@/types/quiz'

const mockQuestion: Question = {
  question: 'What is a qubit?',
  options: ['A classical bit', 'A quantum bit', 'A byte', 'A register'],
  correctAnswer: 1,
  explanation: 'A qubit is the quantum equivalent of a classical bit.',
}

describe('Questions', () => {
  it('renders question text and options', () => {
    render(
      <Questions
        currentIndex={0}
        question={mockQuestion}
        selectedOption={null}
        hasSubmitted={false}
        feedback=""
        onSelectOption={vi.fn()}
        wrongChoices={[]}
        questionCompleted={false}
        showAnswersEnabled={true}
      />
    )
    expect(screen.getByText('What is a qubit?')).toBeInTheDocument()
    expect(screen.getByText('A quantum bit')).toBeInTheDocument()
  })
})
