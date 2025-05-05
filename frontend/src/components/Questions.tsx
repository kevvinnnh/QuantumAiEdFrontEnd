// src/components/Questions.tsx

import React from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuestionsProps {
  currentIndex: number;
  question: Question;
  selectedOption: number | null;
  hasSubmitted: boolean;
  feedback: string;
  onSelectOption: (index: number) => void;
  onSubmitAnswer: () => void;
  onDiscussQuestion: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

const Questions: React.FC<QuestionsProps> = ({
  currentIndex,
  question,
  selectedOption,
  hasSubmitted,
  feedback,
  onSelectOption,
  onSubmitAnswer,
  onDiscussQuestion,
  onNext,
  isLastQuestion,
}) => (
  <div style={styles.container}>
    <h2 style={styles.questionText}>{question.question}</h2>

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

        return (
          <button
            key={`q${currentIndex}-opt${idx}`}
            style={btnStyle}
            disabled={hasSubmitted}
            onClick={() => !hasSubmitted && onSelectOption(idx)}
          >
            {opt}
          </button>
        );
      })}
    </div>

    {!hasSubmitted && selectedOption !== null && (
      <button style={styles.submitBtn} onClick={onSubmitAnswer}>
        Submit
      </button>
    )}

    {hasSubmitted && (
      <div style={styles.feedbackArea}>
        <p style={feedback.includes('Correct') ? styles.feedbackCorrect : styles.feedbackWrong}>
          {feedback}
        </p>

        <div style={styles.answerBox}>
          <p style={styles.answerLabel}>Correct Answer:</p>
          <p style={styles.answerText}>{question.options[question.correctAnswer]}</p>
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
    )}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: 700,
    textAlign: 'center',
  },
  questionText: {
    fontSize: '2rem',
    marginBottom: 24,
    lineHeight: 1.3,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  optionButton: {
    padding: '16px 24px',
    fontSize: '1.1rem',
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #FFFFFF',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textAlign: 'left',
    appearance: 'none',
    opacity: 1,
  },
  optionSelected: {
    backgroundColor: 'rgba(86,99,149,0.8)',
    border: '2px solid #FFFFFF',
  },
  optionCorrect: {
    backgroundColor: 'rgba(0,200,0,0.8)',
    border: '2px solid #00c800',
  },
  optionWrong: {
    backgroundColor: 'rgba(200,0,0,0.8)',
    border: '2px solid #c80000',
  },
  optionUnselectedDisabled: {
    backgroundColor: 'transparent',
    border: '2px solid #FFFFFF',
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
