import { render } from '@testing-library/react'
import QuizProgressBar from './QuizProgressBar'

describe('QuizProgressBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<QuizProgressBar currentIndex={2} totalQuestions={10} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
