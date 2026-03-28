import { render, screen } from '@testing-library/react'
import CourseDetailView from './CourseDetailView'
import type { Course } from '@/types/course'

const mockCourse: Course = {
  id: 0,
  title: 'Intro to Quantum',
  description: 'Basics of quantum computing.',
  image: '/test.svg',
  concepts: [
    {
      id: 'c1',
      title: 'Quantum Basics',
      topics: [{ id: 0, title: 'What is a Qubit?', implemented: true }],
    },
  ],
}

describe('CourseDetailView', () => {
  it('renders course detail with topics', () => {
    render(
      <CourseDetailView
        currentCourse={0}
        activeCourses={[mockCourse]}
        completedQuizzes={[]}
        isTopicUnlocked={() => true}
        openLesson={vi.fn()}
        renderBreadcrumb={() => <span>Breadcrumb</span>}
      />
    )
    expect(screen.getByText('Quantum Basics')).toBeInTheDocument()
    expect(screen.getByText('What is a Qubit?')).toBeInTheDocument()
  })
})
