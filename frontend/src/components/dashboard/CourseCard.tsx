import React from 'react';
import { FaLock } from 'react-icons/fa';
import { styles } from './DashboardStyles';
import type { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  isUnlocked: boolean;
  progress: number;
  onSelect: (courseId: number) => void;
  cardRef: (courseId: number, el: HTMLElement | null) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isUnlocked, progress, onSelect, cardRef }) => {
  return (
    <div
      key={course.id}
      ref={(el) => cardRef(course.id, el)}
      role="button"
      tabIndex={isUnlocked ? 0 : -1}
      style={{
        ...styles.card,
        ...(isUnlocked ? styles.cardEnabled : styles.cardDisabled),
      }}
      onClick={() => isUnlocked && onSelect(course.id)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isUnlocked) {
          e.preventDefault();
          onSelect(course.id);
        }
      }}
      aria-label={`${course.title}. ${isUnlocked ? progress > 0 ? `${progress}% complete` : 'Not started' : 'Locked'}`}
      aria-disabled={!isUnlocked}
    >
      <img src={course.image} alt={course.title} style={styles.cardImg} />
      <div style={styles.cardContent}>
        <h4 style={styles.cardTitle}>{course.title}</h4>
        <p style={styles.cardDescription}>{course.description}</p>
        {isUnlocked && progress > 0 && (
          <div style={styles.progressBarContainer}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <span style={styles.progressText}>{progress}% complete</span>
            </div>
        )}
      </div>
      {!isUnlocked &&
        (<div style={styles.lockOverlay}>
          <div style={styles.lockIcon}>
            <FaLock />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
