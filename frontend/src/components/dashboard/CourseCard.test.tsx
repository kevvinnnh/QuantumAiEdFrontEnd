import { render, screen } from '@testing-library/react'
import CourseCard from './CourseCard'
import type { Course } from '@/types/course'

const mockCourse: Course = {
  id: 0,
  title: 'Introduction to Quantum Computing',
  description: 'Learn the basics of quantum computing.',
  image: '/test-image.svg',
  concepts: [],
}

describe('CourseCard', () => {
  it('renders course title', () => {
    render(
      <CourseCard
        course={mockCourse}
        isUnlocked={true}
        progress={50}
        onSelect={vi.fn()}
        cardRef={vi.fn()}
      />
    )
    expect(screen.getByText('Introduction to Quantum Computing')).toBeInTheDocument()
  })
})
