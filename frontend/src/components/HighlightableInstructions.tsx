import React, { useState } from 'react';

interface HighlightableInstructionsProps {
  instructions: string;
  onExplain: (highlightedText: string) => void;
  onChatMore: (highlightedText: string) => void;
}

const HighlightableInstructions: React.FC<HighlightableInstructionsProps> = ({
  instructions,
  onExplain,
  onChatMore,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const text = selection?.toString() || '';

    // If the user highlighted something
    if (text.trim()) {
      setHighlightedText(text);
      setShowPopup(true);

      // Option A: Position the popup near the mouse
      setPopupPosition({
        x: event.pageX,
        y: event.pageY,
      });

      // Option B (alternative approach): 
      // Position the popup near the selected text boundingClientRect
      // const range = selection?.getRangeAt(0);
      // const rect = range?.getBoundingClientRect();
      // if (rect) {
      //   setPopupPosition({
      //     x: rect.left + window.scrollX,
      //     y: rect.top + window.scrollY - 40, // adjust as needed
      //   });
      // }

    } else {
      // If user deselected or clicked outside, hide the popup
      setShowPopup(false);
    }
  };

  const handleExplainClick = () => {
    onExplain(highlightedText);
    setShowPopup(false);
  };

  const handleChatMoreClick = () => {
    onChatMore(highlightedText);
    setShowPopup(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* This div displays the “instructions” text. 
          Whenever the mouse is released, we check if something was highlighted. */}
      <div onMouseUp={handleMouseUp} style={{ whiteSpace: 'pre-wrap' }}>
        {instructions}
      </div>

      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: popupPosition.y,
            left: popupPosition.x,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 8px',
            zIndex: 999,
          }}
        >
          <button onClick={handleExplainClick} style={{ marginRight: '8px' }}>
            Explain
          </button>
          <button onClick={handleChatMoreClick}>Chat More</button>
        </div>
      )}
    </div>
  );
};

export default HighlightableInstructions;
