import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import mascot from '../assets/mascot_celebrate.png';
import mascotFail from '../assets/mascot_fail.png';

interface FinalResultsPopupProps {
  score: number;
  total: number;
  onReturn: () => void;
}

export const FinalResultsPopup: React.FC<FinalResultsPopupProps> = ({
  score,
  total,
  onReturn,
}) => {
  const percent = Math.round((score / total) * 100);
  const passed = percent >= 70;

  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        <h2 style={titleStyle}>Quiz Results</h2>

        <img
          src={passed ? mascot : mascotFail}
          alt="Quiz Mascot"
          style={mascotStyle}
        />

        <div style={scoreBoxStyle}>
          <p style={scoreText}>You got <strong>{score}</strong> out of <strong>{total}</strong> correct.</p>
          <p style={scoreText}>Your Score: <strong>{percent}%</strong></p>
        </div>

        <p style={passed ? passTextStyle : failTextStyle}>
          {passed
            ? '✅ Great job! You’ve passed this lesson.'
            : '❌ You didn’t reach 70%. Review and try again soon.'}
        </p>

        <button style={buttonStyle} onClick={onReturn}>
          <FaArrowLeft /> Back to Courses
        </button>
      </div>
    </div>
  );
};

// Styling
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const popupStyle: React.CSSProperties = {
  background: 'linear-gradient(to bottom, #ffffff, #f9f9fb)',
  borderRadius: '20px',
  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
  padding: '50px 40px',
  width: '95%',
  maxWidth: '750px',
  textAlign: 'center',
  fontFamily: "'Inter', sans-serif",
  color: '#333',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.2rem',
  color: '#566395',
  marginBottom: '25px',
};

const mascotStyle: React.CSSProperties = {
  width: '300px',
  height: 'auto',
  margin: '0 auto 30px',
  display: 'block',
};

const scoreBoxStyle: React.CSSProperties = {
  backgroundColor: '#f0f2f5',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '25px',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
};

const scoreText: React.CSSProperties = {
  fontSize: '1.3rem',
  margin: '8px 0',
};

const passTextStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 600,
  color: '#2e7d32',
  marginBottom: '25px',
};

const failTextStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 600,
  color: '#c62828',
  marginBottom: '25px',
};

const buttonStyle: React.CSSProperties = {
  padding: '16px 28px',
  fontSize: '1.2rem',
  backgroundColor: '#566395',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  transition: 'background 0.2s',
};
