// src/components/QuizProgressBar/QuizProgressBar.tsx

import React, { useEffect, useState } from 'react';
import styles from './QuizProgressBar.module.scss';

interface QuizProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  isLastQuestion?: boolean;
  hasSubmittedLastAnswer?: boolean;
  // onComplete?: () => void; // Called when animation fully completes
  style?: React.CSSProperties; // Custom container styles from parent
  fillColor?: string;
  animationDuration?: number; // in milliseconds
  className?: string; // Allow parent to pass className
}

const QuizProgressBar: React.FC<QuizProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  isLastQuestion = false,
  hasSubmittedLastAnswer = false,
  // onComplete,
  style = {}, // Accept custom styles from parent
  fillColor = "#7BA8ED",
  animationDuration = 600,
  className = '', // Default to empty string
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Calculate the actual progress percentage
  const actualProgress = ((currentIndex) / totalQuestions) * 100;
  
  // For the last question, we want to show progress as if we're at the question
  // but not 100% until the answer is submitted
  const targetProgress = isLastQuestion && hasSubmittedLastAnswer 
    ? 100 
    : actualProgress;

  useEffect(() => {
    // Smooth animation to the target progress
    const timer = setTimeout(() => {
      setDisplayProgress(targetProgress);
    }, 100); // Small delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, [targetProgress]);

  // Combine module class with any parent className
  const containerClasses = `${styles.container} ${className}`.trim();

  const fillStyle: React.CSSProperties = {
    width: `${displayProgress}%`,
    backgroundColor: fillColor,
    transitionDuration: `${animationDuration}ms`,
  };

  const shimmerClasses = `${styles.shimmer} ${displayProgress > 0 ? styles.active : ''}`.trim();

  return (
    <div 
      className={containerClasses}
      style={style} // Apply any custom styles from parent
    >
      <div 
        className={styles.fill}
        style={fillStyle}
      >
        <div className={shimmerClasses} />
      </div>
    </div>
  );
};

export default QuizProgressBar;