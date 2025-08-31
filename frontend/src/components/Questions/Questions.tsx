// src/components/Questions/Questions.tsx

import React from 'react';
import styles from './Questions.module.scss';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  lessonContentIndices?: number[];
}

interface QuestionsProps {
  currentIndex: number;
  question: Question;
  selectedOption: number | null;
  hasSubmitted: boolean;
  feedback: string;
  onSelectOption: (index: number) => void;
  wrongChoices: number[];
  questionCompleted: boolean;
  showAnswersEnabled: boolean;
  questionStyles?: string;
  optionStyles?: string;
  showCorrectAnswers?: boolean;
  timeMode?: boolean;
  timeLimit?: number;
  questionStartTime?: number;
}

const Questions: React.FC<QuestionsProps> = ({
  currentIndex,
  question,
  selectedOption,
  onSelectOption,
  wrongChoices,
  questionCompleted,
  showAnswersEnabled,
  questionStyles,
  optionStyles,
}) => (
  <div className={styles.container}>
    <div className={styles.questionContainer}>
      <h2 
        className={`${styles.questionText} ${questionStyles || ''}`}
      >
        {question.question}
      </h2>
    </div>

    <div className={styles.optionsContainer}>
      {/* Try Again Indicator */}
      {showAnswersEnabled && wrongChoices.length > 0 && !questionCompleted && (
        <div className={styles.tryAgainIndicator}>
          Try again
        </div>
      )}

      {question.options.map((opt, idx) => {
        let buttonClassName = styles.optionButton;
        let isDisabled = false;

        // Determine the state and styling for each option
        if (!questionCompleted) {
          // Question is still in progress
          if (selectedOption === idx) {
            // Currently selected option (before submission or between attempts)
            buttonClassName += ` ${styles.optionSelected}`;
          } else if (wrongChoices.includes(idx)) {
            // Previously chosen wrong option - mark as wrong and disable
            buttonClassName += ` ${styles.optionWrong}`;
            isDisabled = true;
          }
        } else {
          // Question is completed (correct answer found or max attempts reached)
          if (idx === question.correctAnswer) {
            // Always highlight the correct answer when question is completed
            buttonClassName += ` ${styles.optionCorrect}`;
          } else if (wrongChoices.includes(idx)) {
            // Mark all wrong choices as incorrect
            buttonClassName += ` ${styles.optionWrong}`;
          } else {
            // Unselected options remain in default disabled state
            buttonClassName += ` ${styles.optionUnselectedDisabled}`;
          }
          isDisabled = true; // All options are disabled when question is completed
        }

        // Apply custom option styles if provided
        if (optionStyles) {
          buttonClassName += ` ${optionStyles}`;
        }

        return (
          <button
            key={`q${currentIndex}-opt${idx}`}
            className={buttonClassName}
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) {
                onSelectOption(idx);
              }
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

export default Questions;