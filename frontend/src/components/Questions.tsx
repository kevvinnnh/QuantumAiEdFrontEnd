// src/components/Questions.tsx

import React from 'react';

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
  questionStyles?: React.CSSProperties;
  optionStyles?: React.CSSProperties;
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
  <div style={styles.container}>
    <div style={styles.questionContainer}>
      <h2 style={{...styles.questionText, ...questionStyles}}>
        {question.question}
      </h2>
    </div>

    <div style={styles.optionsContainer}>
      {/* Try Again Indicator */}
      {showAnswersEnabled && wrongChoices.length > 0 && !questionCompleted && (
        <div style={styles.tryAgainIndicator}>
          Try again
        </div>
      )}

      {question.options.map((opt, idx) => {
        let btnStyle = { ...styles.optionButton };
        let isDisabled = false;

        // Determine the state and styling for each option
        if (!questionCompleted) {
          // Question is still in progress
          if (selectedOption === idx) {
            // Currently selected option (before submission or between attempts)
            btnStyle = { ...btnStyle, ...styles.optionSelected };
          } else if (wrongChoices.includes(idx)) {
            // Previously chosen wrong option - mark as wrong and disable
            btnStyle = { ...btnStyle, ...styles.optionWrong };
            isDisabled = true;
          }
        } else {
          // Question is completed (correct answer found or max attempts reached)
          if (idx === question.correctAnswer) {
            // Always highlight the correct answer when question is completed
            btnStyle = { ...btnStyle, ...styles.optionCorrect };
          } else if (wrongChoices.includes(idx)) {
            // Mark all wrong choices as incorrect
            btnStyle = { ...btnStyle, ...styles.optionWrong };
          } else {
            // Unselected options remain in default disabled state
            btnStyle = { ...btnStyle, ...styles.optionUnselectedDisabled };
          }
          isDisabled = true; // All options are disabled when question is completed
        }

        // also apply font styles to each option button
        btnStyle = { ...btnStyle, ...optionStyles };

        // Override cursor style for disabled options
        if (isDisabled) {
          btnStyle = { ...btnStyle, cursor: 'not-allowed' };
        }

        return (
          <button
            key={`q${currentIndex}-opt${idx}`}
            style={btnStyle}
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: 900,
    textAlign: 'center',
  },
  questionContainer: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
  },
  optionButton: {
    padding: '14px 24px',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textAlign: 'left',
    appearance: 'none',
    opacity: 1,
  },
  optionSelected: {
    backgroundColor: '#253462',
    border: '2px solid #414D61',
  },
  optionCorrect: {
    backgroundColor: 'rgba(29, 55, 35, 0.8)',
    border: '2px solid #407440',
  },
  optionWrong: {
    backgroundColor: 'rgba(51, 24, 27, 0.8)',
    border: '2px solid #85131E',
  },
  optionUnselectedDisabled: {
    backgroundColor: 'transparent',
    border: '2px solid #414D61',
    opacity: 1,
  },
  submitBtn: {
    marginTop: 24,
    padding: '12px 28px',
    fontSize: '1.1rem',
    backgroundColor: '#566395',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  feedbackArea: {
    marginTop: 32,
  },
  feedbackCorrect: {
    color: '#00c800',
    fontSize: '1.3rem',
    fontWeight: 600,
  },
  feedbackWrong: {
    color: '#c80000',
    fontSize: '1.3rem',
    fontWeight: 600,
  },
  answerBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    textAlign: 'left',
  },
  answerLabel: {
    margin: 0,
    marginBottom: 4,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  answerText: {
    margin: 0,
    marginBottom: 8,
    color: '#FFFFFF',
    fontSize: '1.1rem',
  },
  explanationText: {
    margin: 0,
    color: '#DDDDDD',
    fontSize: '0.95rem',
    lineHeight: 1.4,
  },
  postSubmitBtns: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
  },
  aiBtn: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  nextBtn: {
    padding: '10px 20px',
    backgroundColor: '#566395',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  tryAgainIndicator: {
    position: 'absolute',
    top: '-50px',
    left: '0',
    backgroundColor: '#A25313',
    color: '#FFFFFF',
    padding: '4px 8px',
    borderRadius: 16,
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    zIndex: 10,
  },
};

export default Questions;
