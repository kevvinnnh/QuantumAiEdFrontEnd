import React from 'react';
import highlightDemo from '../assets/highlight-demo.mov';
import {  FaArrowLeft } from 'react-icons/fa';

interface ChatFeaturePopupProps {
  onGotIt: () => void;
}

export const ChatFeaturePopup: React.FC<ChatFeaturePopupProps> = ({ onGotIt }) => (
  <div style={popupOverlayStyle}>
    <div style={popupContentStyle}>
      <h2 style={headerStyle}>✨ Chat &amp; Explain Features ✨</h2>
      <video
        src={highlightDemo}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          maxWidth: '800px',
          borderRadius: '10px',
          marginBottom: '20px',
        }}
      >
        Your browser does not support the video tag.
      </video>
      <ul style={{ padding: 0, listStyle: 'none', lineHeight: 1.8, fontSize: '1.1em' }}>
        <li>
          <strong>Explain:</strong> Highlight any text, then click <em>Explain</em> for bullet‑point summaries.
        </li>
        <li>
          <strong>Chat More:</strong> Highlight text and click <em>Chat More</em> to learn more about a topic.
        </li>
        <li>
          <strong>Ask Anything:</strong> Use the side chat to ask your own questions or click <em>Follow up with AI</em> for quiz help.
        </li>
      </ul>
      <button
        onClick={onGotIt}
        style={{
          marginTop: '30px',
          padding: '15px 25px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#566395',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1.2em',
          width: '150px',
        }}
      >
        Got it!
      </button>
    </div>
  </div>
);

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
    <div style={popupOverlayStyle}>
      <div style={popupContentStyle}>
        <h2 style={headerStyle}>Quiz Results</h2>
        <p style={{ fontSize: '1.2em' }}>
          You answered <strong>{score}</strong> out of <strong>{total}</strong> correctly.
        </p>
        <p style={{ fontSize: '1.2em' }}>That’s <strong>{percent}%</strong>!</p>
        {passed ? (
          <p style={{ color: 'green', fontWeight: 'bold', fontSize: '1.3em' }}>
            Congratulations! You passed!
          </p>
        ) : (
          <p style={{ color: 'red', fontWeight: 'bold', fontSize: '1.3em' }}>
            You didn’t reach 70%. Keep learning and try again!
          </p>
        )}
        <button
          onClick={onReturn}
          style={{
            marginTop: '30px',
            padding: '15px 25px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#566395',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.2em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FaArrowLeft /> Back to Courses
        </button>
      </div>
    </div>
  );
};

interface HighlightPopupProps {
  position: { x: number; y: number };
  onExplain: () => void;
  onChatMore: () => void;
}

export const HighlightPopup: React.FC<HighlightPopupProps> = ({
  position,
  onExplain,
  onChatMore,
}) => (
  <div
    style={{
      position: 'fixed',
      top: position.y + 10,
      left: position.x + 10,
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      zIndex: 999,
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    }}
  >
    <button
      onClick={onExplain}
      style={{
        marginRight: '10px',
        backgroundColor: '#566395',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
      }}
    >
      Explain
    </button>
    <button
      onClick={onChatMore}
      style={{
        backgroundColor: '#566395',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
      }}
    >
      Chat More
    </button>
  </div>
);

export const popupOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

export const popupContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '15px',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
  width: '95%',
  maxWidth: '800px',
  textAlign: 'center',
};

export const headerStyle: React.CSSProperties = {
  marginBottom: '20px',
  fontSize: '1.8em',
  color: '#566395',
  textAlign: 'center',
};
