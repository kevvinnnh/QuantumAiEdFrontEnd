import React from 'react';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { styles } from './DashboardStyles';
import type { Course, CompletedQuiz } from '@/types/course';

interface CourseDetailViewProps {
  currentCourse: number | null;
  activeCourses: Course[];
  completedQuizzes: CompletedQuiz[];
  isTopicUnlocked: (topicId: number) => boolean;
  openLesson: (topicId: number) => void;
  renderBreadcrumb: () => React.ReactNode;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  currentCourse,
  activeCourses,
  completedQuizzes,
  isTopicUnlocked,
  openLesson,
  renderBreadcrumb,
}) => {
  if (currentCourse === null) return <p>Loading course...</p>;
  const course = activeCourses.find(c => c.id === currentCourse);
  if (!course) return <p>Course not found.</p>;

  return (
    <div style={styles.courseDetailContainer}>
      {renderBreadcrumb()}

      <div style={styles.courseDetailHeader}>
        <h1 style={styles.courseDetailTitle}>{course.title}</h1>
        <p style={styles.courseDetailDescription}>{course.description}</p>
      </div>

      <div style={styles.conceptsContainer}>
        {course.concepts.map((concept, conceptIndex) => (
          <div key={concept.id}>
            <div style={styles.conceptHeader}>
              <div style={styles.conceptIcon}>
                {concept.icon ? (
                  <img src={concept.icon} alt={concept.title} style={{ width: '20px', height: '20px' }} />
                ) : (
                  <span style={styles.conceptNumber}>{conceptIndex + 1}</span>
                )}
              </div>
              <h3 style={styles.conceptTitle}>{concept.title}</h3>
            </div>

            <div style={styles.topicsList}>
              {concept.topics.map((topic) => {
                const isTopicCompleted = completedQuizzes.some(quiz => quiz.courseId === topic.id && quiz.passed);
                const isUnlocked = isTopicUnlocked(topic.id);

                return (
                  <button
                    className='topic-button'
                    key={topic.id}
                    style={{
                      ...styles.topicButton,
                      ...(!isUnlocked ? styles.topicButtonDisabled : {}),
                    }}
                    onClick={() => isUnlocked && openLesson(topic.id)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isUnlocked) {
                        e.preventDefault();
                        openLesson(topic.id);
                      }
                    }}
                    disabled={!isUnlocked}
                    aria-label={`${topic.title}. ${isTopicCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}`}
                    aria-disabled={!isUnlocked}
                  >
                    <span style={styles.topicTitle}>{topic.title}</span>
                    {isTopicCompleted && (
                      <FaCheckCircle size={24} style={styles.topicCheckmark} />
                    )}
                    {!isUnlocked && (
                      <FaLock size={24} style={styles.topicLock} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetailView;
