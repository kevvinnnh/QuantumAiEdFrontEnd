import React from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string; // New optional explanation property
}

interface QuestionsProps {
  showIntro: boolean;
  currentIndex: number;
  question: Question;
  selectedOption: number | null;
  hasSubmitted: boolean;
  feedback: string;
  onSelectOption: (index: number) => void;
  onSubmitAnswer: () => void;
  onDiscussQuestion: () => void;
  onNext: () => void;
  onIntroMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onStartQuiz: () => void;
  explanation: string; // This might be used for text explained via the highlight feature
  isLastQuestion: boolean;
}

const Questions: React.FC<QuestionsProps> = ({
  showIntro,
  currentIndex,
  question,
  selectedOption,
  hasSubmitted,
  feedback,
  onSelectOption,
  onSubmitAnswer,
  onDiscussQuestion,
  onNext,
  onIntroMouseUp,
  onStartQuiz,
  explanation,
  isLastQuestion,
}) => {
  if (showIntro) {
    return (
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6em' }}>
          Welcome to the Quantum Computing Quiz
        </h2>
        <div
          style={{
            margin: '20px auto',
            lineHeight: '1.6',
            backgroundColor: '#fcfcfc',
            padding: '15px',
            borderRadius: '6px',
            maxWidth: '700px',
          }}
          onMouseUp={onIntroMouseUp}
        >
          <h2>Introduction to Quantum Computing: Principles and Applications</h2>
          <em>💡 Need help?</em> Highlight text to simplify topics!
          <p style={{ textAlign: 'left' }}>
            <strong>Quantum computing</strong> leverages fascinating principles from quantum physics,
            offering unique capabilities that classical computers cannot match. Here's what you need to know:
          </p>
          <h3>Core Principles</h3>
          <ul style={{ textAlign: 'left' }}>
            <li>
              <strong>Superposition</strong>: A qubit can exist in multiple states (0 and 1) simultaneously,
              enabling parallel processing of possibilities.
            </li>
            <li>
              <strong>Entanglement</strong>: Qubits can share a linked state, allowing changes to one qubit to
              instantaneously influence another, no matter the distance.
            </li>
            <li>
              <strong>Measurement</strong>: Observing a qubit collapses its state into a definite value,
              which is essential to extract meaningful results.
            </li>
          </ul>
          <h3>Potential Applications</h3>
          <p>Quantum computers, though still in their infancy, are already being explored in fields like:</p>
          <ul style={{ textAlign: 'left' }}>
            <li>
              <strong>Cryptography</strong>: Breaking certain classical encryption methods and developing quantum-safe
              alternatives.
            </li>
            <li>
              <strong>Chemical Simulations</strong>: Modeling complex molecules to advance drug discovery and materials
              science.
            </li>
            <li>
              <strong>Machine Learning</strong>: Enhancing algorithms with faster optimization and pattern recognition.
            </li>
            <li>
              <strong>Optimization Problems</strong>: Solving logistical and supply chain challenges more efficiently.
            </li>
          </ul>
          <h3>Why Quantum Computing Matters</h3>
          <ul style={{ textAlign: 'left' }}>
            <li>
              Quantum computing defies classical logic by embracing probabilities, unlocking the potential to solve
              certain <strong>complex problems faster</strong> than traditional machines.
            </li>
            <li>
              While early-stage quantum computers aren't ready for general use, they show promise for revolutionizing
              various industries in the near future.
            </li>
          </ul>
          <h3>What's in the Quiz?</h3>
          <p>The following quiz will test your understanding of:</p>
          <ul style={{ textAlign: 'left' }}>
            <li>
              <strong>Qubit basics</strong>: How they differ from classical bits.
            </li>
            <li>
              <strong>Core principles</strong>: Superposition, entanglement, and measurement.
            </li>
            <li>
              <strong>Applications</strong>: Real-world problems quantum computers aim to tackle.
            </li>
          </ul>
          <p>
            <strong>Let’s Get Started! 🚀</strong>
          </p>
        </div>
       
        <button
          onClick={onStartQuiz}
          style={{
            display: 'block',
            margin: '30px auto',
            padding: '10px 20px',
            backgroundColor: '#566395',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.2em',
          }}
        >
          Start Quiz
        </button>
      </div>
    );
  } else {
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
            // Option styling: if the answer has been submitted and this option is the correct answer,
            // add a green border or background. Optionally, if the user got it wrong, we can highlight their
            // selected answer in red.
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
              // If submitted, mark the correct answer
              if (idx === question.correctAnswer) {
                optionStyle = {
                  ...optionStyle,
                  backgroundColor: '#e0ffe0', // light green background
                  border: '2px solid green',
                  color: '#333',
                };
              }
              // Optionally, if the user selected a wrong answer, you might mark it in red.
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

        {/* Show Submit button if not yet submitted */}
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

        {/* Post–submission immediate feedback and breakdown */}
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

            {/* Reveal correct answer and explanation regardless of whether the user was correct */}
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
  }
};

export default Questions;
