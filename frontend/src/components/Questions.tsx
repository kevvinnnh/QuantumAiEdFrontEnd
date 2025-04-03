// src/components/Questions.tsx
import React from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuestionsProps {
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
  question,
  selectedOption,
  hasSubmitted,
  feedback,
  onSelectOption,
  onSubmitAnswer,
  onDiscussQuestion,
  onNext,
  isLastQuestion,
}) => {
  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.4em' }}>
        {question.question}
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '15px',
        }}
      >
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const disabled = hasSubmitted;
          let optionStyle: React.CSSProperties = {
            backgroundColor: isSelected ? '#566395' : '#f8f9fa',
            color: isSelected ? '#f8f9fa' : '#111',
            border: '1px solid #ccc',
            borderRadius: '25px',
            margin: '5px',
            padding: '10px 20px',
            width: '80%',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled && !isSelected ? 0.7 : 1,
            transition: 'background-color 0.3s',
            fontSize: '1.1em',
          };

          if (hasSubmitted) {
            if (idx === question.correctAnswer) {
              optionStyle = {
                ...optionStyle,
                backgroundColor: '#e0ffe0',
                border: '2px solid green',
                color: '#333',
              };
            }
            if (selectedOption !== question.correctAnswer && idx === selectedOption) {
              optionStyle = {
                ...optionStyle,
                backgroundColor: '#ffe0e0',
                border: '2px solid red',
                color: '#333',
              };
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !disabled && onSelectOption(idx)}
              disabled={disabled}
              style={optionStyle}
            >
              {option}
            </button>
          );
        })}
      </div>

      {!hasSubmitted && selectedOption !== null && (
        <button
          onClick={onSubmitAnswer}
          style={{
            display: 'block',
            margin: '15px auto 0',
            padding: '10px 20px',
            backgroundColor: '#566395',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.1em',
          }}
        >
          Submit
        </button>
      )}

      {hasSubmitted && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p
            style={{
              color: feedback.includes('Correct') ? 'green' : 'red',
              fontWeight: 'bold',
              fontSize: '1.2em',
            }}
          >
            {feedback}
          </p>

          <div
            style={{
              margin: '20px auto',
              maxWidth: '700px',
              textAlign: 'left',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: '#f0f0f0',
            }}
          >
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Correct Answer:
            </p>
            <div
              style={{
                padding: '8px',
                backgroundColor: '#e0ffe0',
                borderRadius: '4px',
                fontSize: '1.1em',
              }}
            >
              {question.options[question.correctAnswer]}
            </div>
            {question.explanation && (
              <p style={{ marginTop: '10px', fontSize: '1em', color: '#555' }}>
                {question.explanation}
              </p>
            )}
          </div>

          <button
            onClick={onDiscussQuestion}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: '#866395',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1.1em',
            }}
          >
            Follow up with AI
          </button>
          <button
            onClick={onNext}
            style={{
              padding: '10px 20px',
              backgroundColor: '#566395',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1.1em',
            }}
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Questions;
