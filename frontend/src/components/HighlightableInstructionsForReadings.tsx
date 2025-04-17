// src/components/HighlightableInstructionsForReading.tsx

import React, { useState } from 'react';

interface Props {
  onExplain:     (highlightedText: string) => void;
  onViewAnalogy: (highlightedText: string) => void;
  children:       React.ReactNode;
}

const HighlightableInstructionsForReading: React.FC<Props> = ({
  onExplain,
  onViewAnalogy,
  children,
}) => {
  const [showPopup,       setShowPopup]      = useState(false);
  const [highlightedText, setHighlightedText] = useState('');
  const [popupPos,        setPopupPos]       = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';
    if (text && sel?.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();

      // Nudge up by 10px, left by 20px
      const TOP_NUDGE  = -370;
      const LEFT_NUDGE = -730;

      setPopupPos({
        top:  rect.bottom + window.scrollY + TOP_NUDGE,
        left: rect.left   + window.scrollX + rect.width / 2 + LEFT_NUDGE,
      });

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
        <div
          style={{
            position:        'absolute',
            top:             popupPos.top,
            left:            popupPos.left,
            transform:       'translateX(-50%)',
            backgroundColor: '#1C1F2E',
            padding:         '8px',
            borderRadius:    '8px',
            display:         'flex',
            gap:             '8px',
            zIndex:          1000,
            boxShadow:       '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <button
            style={buttonStyle}
            onClick={() => {
              onExplain(highlightedText);
              setShowPopup(false);
            }}
          >
            Explain
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              onViewAnalogy(highlightedText);
              setShowPopup(false);
            }}
          >
            View Analogy
          </button>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#566395',
  color:           '#fff',
  border:          'none',
  borderRadius:    '4px',
  padding:         '6px 10px',
  cursor:          'pointer',
  fontSize:        '0.9rem',
};

export default HighlightableInstructionsForReading;
