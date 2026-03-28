import { render, screen } from '@testing-library/react'
import Quiz from './Quiz'
import type { Question } from '@/types/quiz'

vi.mock('@/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

const mockQuestions: Question[] = [
  {
    question: 'What is superposition?',
    options: ['A state of rest', 'Multiple states at once', 'A single state', 'None'],
    correctAnswer: 1,
    explanation: 'Superposition means a qubit can be in multiple states simultaneously.',
  },
]

describe('Quiz', () => {
  it('renders quiz question', () => {
    render(
      <Quiz
        questions={mockQuestions}
        onComplete={vi.fn()}
        onExit={vi.fn()}
        courseId={0}
      />
    )
    expect(screen.getByText('What is superposition?')).toBeInTheDocument()
  })
})
