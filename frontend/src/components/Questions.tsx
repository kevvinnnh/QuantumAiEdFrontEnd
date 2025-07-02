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
  // onSubmitAnswer: () => void;
  // onDiscussQuestion: () => void;
  // onNext: () => void;
  // isLastQuestion: boolean;
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
  hasSubmitted,
  // feedback,
  onSelectOption,
  // onSubmitAnswer,
  // onDiscussQuestion,
  // onNext,
  // isLastQuestion,
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
      {question.options.map((opt, idx) => {
        let btnStyle = { ...styles.optionButton };

        if (!hasSubmitted) {
          // Pre-submit: highlight selection
          if (selectedOption === idx) {
            btnStyle = { ...btnStyle, ...styles.optionSelected };
          }
        } else {
          // Post-submit: style correct, wrong, and unselected
          if (idx === question.correctAnswer) {
            btnStyle = { ...btnStyle, ...styles.optionCorrect };
          } else if (selectedOption === idx && idx !== question.correctAnswer) {
            btnStyle = { ...btnStyle, ...styles.optionWrong };
          } else {
            // unselected choices remain transparent with white border
            btnStyle = { ...btnStyle, ...styles.optionUnselectedDisabled };
          }
        }

        // also apply font styles to each option button
        btnStyle = { ...btnStyle, ...optionStyles };

        return (
          <button
            key={`q${currentIndex}-opt${idx}`}
            style={btnStyle}
            disabled={hasSubmitted}
            onClick={() => onSelectOption(idx)}
          >
            {opt}
          </button>
        );
      })}
    </div>

    {/* {!hasSubmitted && selectedOption !== null && (
      <button style={styles.submitBtn} onClick={onSubmitAnswer}>
        Submit
      </button>
    )} */}

    {/* {hasSubmitted && (
      <div style={styles.feedbackArea}>
        <p style={feedback.includes('Correct') ? styles.feedbackCorrect : styles.feedbackWrong}>
          {feedback}
        </p>

        <div style={styles.answerBox}>
          <p style={styles.answerLabel}>Correct Answer:</p>
          <p style={{...styles.answerText, ...optionStyles}}>{question.options[question.correctAnswer]}</p>
          {question.explanation && (
            <p style={styles.explanationText}>{question.explanation}</p>
          )}
        </div>

        <div style={styles.postSubmitBtns}>
          <button style={styles.aiBtn} onClick={onDiscussQuestion}>
            Discuss with QuantAid
          </button>
          <button style={styles.nextBtn} onClick={onNext}>
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    )} */}
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
  },
  optionButton: {
    padding: '14px 24px',
    // fontSize: '1.1rem',
    // color: '#FFFFFF',
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
};

export default Questions;
