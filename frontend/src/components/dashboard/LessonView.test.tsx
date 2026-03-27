import { render, screen } from '@testing-library/react'
import LessonView from './LessonView'
import type { Course } from '@/types/course'

vi.mock('@/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  setUnauthorizedHandler: vi.fn(),
  BACKEND_URL: 'http://localhost:5000',
}))

const mockCourse: Course = {
  id: 0,
  title: 'Intro to Quantum',
  description: 'Basics.',
  image: '/test.svg',
  concepts: [
    {
      id: 'c1',
      title: 'Basics',
      topics: [{ id: 0, title: 'Qubits', implemented: true }],
    },
  ],
}

describe('LessonView', () => {
  it('renders breadcrumb and lesson content area', () => {
    render(
      <LessonView
        currentLesson={0}
        activeCourses={[mockCourse]}
        currentQuiz={[]}
        handleOpenQuiz={vi.fn()}
        renderBreadcrumb={() => <span>Home &gt; Lesson</span>}
        handleExplain={vi.fn()}
        handleAnalogy={vi.fn()}
        lessonContentsRef={null}
      />
    )
    expect(screen.getByText(/Home/)).toBeInTheDocument()
  })
})
