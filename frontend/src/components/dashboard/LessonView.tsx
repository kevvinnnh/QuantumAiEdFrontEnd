import React from 'react';
import Reading from '../common/Reading';
import HighlightableInstructionsForReading from '../common/HighlightableInstructionsForReadings';
import { styles } from './DashboardStyles';
import type { Course, Topic } from '@/types/course';
import type { Question } from '@/types/quiz';

interface LessonViewProps {
  currentLesson: number | null;
  activeCourses: Course[];
  currentQuiz: Question[];
  handleOpenQuiz: () => void;
  renderBreadcrumb: () => React.ReactNode;
  handleExplain: (text: string) => void;
  handleAnalogy: (text: string) => void;
  lessonContentsRef: React.Ref<HTMLDivElement>;
}

const LessonView: React.FC<LessonViewProps> = ({
  currentLesson,
  activeCourses,
  currentQuiz,
  handleOpenQuiz,
  renderBreadcrumb,
  handleExplain,
  handleAnalogy,
  lessonContentsRef,
}) => {
  if (currentLesson === null) return <p>Loading lesson...</p>;

  let topicInfo: Topic | null = null;

  for (const course of activeCourses) {
    for (const concept of course.concepts) {
      const topic = concept.topics.find(t => t.id === currentLesson);
      if (topic) {
        topicInfo = topic;
        break;
      }
    }
    if (topicInfo) break;
  }

  return (
    <div style={styles.lessonContainer}>
      <div className='lesson-header' style={styles.lessonHeader}>
        {renderBreadcrumb()}

        <h2 style={styles.lessonTitle}>{topicInfo?.title || 'Lesson'}</h2>
        {topicInfo?.description && (
          <p style={styles.lessonDescription}>{topicInfo.description}</p>
        )}

        {currentQuiz.length > 0 && (
          <button
            style={styles.takeQuizButton}
            onClick={handleOpenQuiz}
            aria-label="Start quiz for this lesson"
          >
            TAKE QUIZ
          </button>
        )}
        {currentQuiz.length === 0 && (
          <p style={styles.noQuizText}>Quiz coming soon for this lesson!</p>
        )}
      </div>

      <div ref={lessonContentsRef}>
        <HighlightableInstructionsForReading
          onExplain={handleExplain}
          onViewAnalogy={handleAnalogy}
        >
          <Reading
            courseId={currentLesson}
            onExplainRequest={handleExplain}
            onViewAnalogy={handleAnalogy}
          />
        </HighlightableInstructionsForReading>
      </div>

      {currentQuiz.length > 0 && (
        <div style={styles.quizPromptSection} className='lesson-header'>
          <p style={styles.lessonDescription}>
            Ready to see if you've grasped these concepts? Take this quiz and find out where you stand!
          </p>
          <button style={styles.takeQuizButton} onClick={handleOpenQuiz}>
            START QUIZ
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonView;
