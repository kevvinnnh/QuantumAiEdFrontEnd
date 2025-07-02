// src/components/QuizProgressBar.tsx

import React, { useEffect, useState } from 'react';

interface QuizProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  isLastQuestion?: boolean;
  hasSubmittedLastAnswer?: boolean;
  // onComplete?: () => void; // Called when animation fully completes
  style?: React.CSSProperties; // Custom container styles from parent
  fillColor?: string;
  animationDuration?: number; // in milliseconds
}

const QuizProgressBar: React.FC<QuizProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  isLastQuestion = false,
  hasSubmittedLastAnswer = false,
  // onComplete,
  style = {}, // Accept custom styles from parent
  fillColor = '#4CAF50',
  animationDuration = 600,
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

  // Default container styles that can be overridden
  const defaultContainerStyle: React.CSSProperties = {
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  // Merge default styles with custom styles from parent
  const containerStyle: React.CSSProperties = {
    ...defaultContainerStyle,
    ...style, // Parent styles override defaults
  };

  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${displayProgress}%`,
    backgroundColor: fillColor,
    borderRadius: containerStyle.borderRadius || 4,
    transition: `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    position: 'relative',
    overflow: 'hidden',
  };

  // Add a subtle shimmer effect
  const shimmerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: displayProgress > 0 ? 'shimmer 2s infinite' : 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={fillStyle}>
        <div style={shimmerStyle} />
      </div>
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default QuizProgressBar;