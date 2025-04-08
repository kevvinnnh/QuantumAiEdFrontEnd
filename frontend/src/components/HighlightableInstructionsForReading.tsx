// src/components/HighlightableInstructionsForReading.tsx
import React, { useState } from 'react';

interface HighlightableInstructionsForReadingProps {
  onExplain: (highlightedText: string) => void;
  onChatMore: (highlightedText: string) => void;
  children: React.ReactNode;
}

const HighlightableInstructionsForReading: React.FC<HighlightableInstructionsForReadingProps> = ({
  onExplain,
  onChatMore,
  children,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (text) {
      setHighlightedText(text);
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  return (
    <div style={{ position: 'relative' }} onMouseUp={handleMouseUp}>
      {children}
      {showPopup && (
        <div style={popupStyles.container}>
          <button
            style={popupStyles.button}
            onClick={() => {
              onExplain(highlightedText);
              setShowPopup(false);
            }}
          >
            Explain
          </button>
          <button
            style={popupStyles.button}
            onClick={() => {
              onChatMore(highlightedText);
              setShowPopup(false);
            }}
          >
            Chat More
          </button>
        </div>
      )}
    </div>
  );
};

const popupStyles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1C1F2E',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    gap: '8px',
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default HighlightableInstructionsForReading;
