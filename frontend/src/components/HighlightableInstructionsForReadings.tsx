// src/components/HighlightableInstructionsForReading.tsx

import React, { useState, useEffect } from 'react';
import { MdLightbulbOutline, MdOutlineChat } from 'react-icons/md';

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
  const [selectionDocumentPos, setSelectionDocumentPos] = useState<{ bottom: number; right: number } | null>(null);

  // Update popup position when scrolling
  useEffect(() => {
    const updatePopupPosition = () => {
      if (showPopup && selectionDocumentPos) {
        // Use requestAnimationFrame for smoother, more responsive updates
        requestAnimationFrame(() => {
          // Recalculate position based on current scroll
          const VERTICAL_OFFSET = 0;
          const HORIZONTAL_OFFSET = -200;
          const HEADER_HEIGHT = 60;
          const POPUP_HEIGHT = 48;
          
          // Find the scrollable content container
          const contentContainer = document.querySelector('.content-animated.dashboard-content');
          const scrollTop = contentContainer ? contentContainer.scrollTop : 0;
          
          // Convert document coordinates back to viewport coordinates
          // For container scrolling, we need to account for container scroll instead of window scroll
          const currentTop = selectionDocumentPos.bottom - scrollTop;
          const currentLeft = selectionDocumentPos.right;
          
          // Calculate new popup position
          const preferredTop = currentTop + VERTICAL_OFFSET;
          const preferredLeft = currentLeft + HORIZONTAL_OFFSET;
          
          // Basic bounds checking
          const viewportHeight = window.innerHeight;
          const contentTop = HEADER_HEIGHT;
          
          let finalTop = preferredTop;
          let finalLeft = Math.max(10, preferredLeft);
          
          // Ensure popup stays below header and within viewport
          if (finalTop < contentTop) {
            finalTop = contentTop + 10;
          } else if (finalTop + POPUP_HEIGHT > viewportHeight) {
            finalTop = viewportHeight - POPUP_HEIGHT - 10;
          }
          
          setPopupPos({
            top: finalTop,
            left: finalLeft,
          });
        });
      }
    };

    if (showPopup) {
      // Attach to the content container instead of window
      const contentContainer = document.querySelector('.content-animated.dashboard-content');
      if (contentContainer) {
        // Use passive: true for better scroll performance
        contentContainer.addEventListener('scroll', updatePopupPosition, { passive: true });
        return () => contentContainer.removeEventListener('scroll', updatePopupPosition);
      }
    }
  }, [showPopup, selectionDocumentPos]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';
    
    // Only show popup if we have meaningful text selected (more than just whitespace)
    if (text && text.length > 0 && sel?.rangeCount) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Additional check: make sure the selection actually has visible content
      // by checking if the bounding rect has meaningful dimensions
      if (rect.width > 0 && rect.height > 0) {
        // Store the selection position in document coordinates for scroll updates
        // For container scrolling, we need to use container scroll offset
        const contentContainer = document.querySelector('.content-animated.dashboard-content');
        const scrollTop = contentContainer ? contentContainer.scrollTop : 0;
        
        setSelectionDocumentPos({
          bottom: rect.bottom + scrollTop,
          right: rect.right + window.scrollX, // Horizontal scrolling still uses window
        });
        
        // Popup dimensions (approximate)
        const POPUP_HEIGHT = 48;
        
        // Your preferred offsets
        const VERTICAL_OFFSET = 0;
        const HORIZONTAL_OFFSET = -200;
        
        // Account for fixed header
        const HEADER_HEIGHT = 60;
        
        // Get viewport dimensions
        const viewportHeight = window.innerHeight;
        const contentTop = HEADER_HEIGHT;
        
        // Calculate preferred position (using viewport coordinates for fixed positioning)
        const preferredTop = rect.bottom + VERTICAL_OFFSET;
        const preferredLeft = rect.right + HORIZONTAL_OFFSET;
        
        // Check if preferred position would be visible (considering header)
        const wouldFitBottom = (preferredTop + POPUP_HEIGHT) <= viewportHeight && preferredTop >= contentTop;
        const wouldFitLeft = preferredLeft >= 0;
        
        let finalTop = preferredTop;
        let finalLeft = preferredLeft;
        
        // If bottom position doesn't fit, try top
        if (!wouldFitBottom) {
          const alternateTop = rect.top - POPUP_HEIGHT + VERTICAL_OFFSET;
          const wouldFitTop = alternateTop >= contentTop;
          
          if (wouldFitTop) {
            finalTop = alternateTop;
          } else {
            // If neither position works, scroll to make bottom position work
            const neededSpace = (rect.bottom + POPUP_HEIGHT + VERTICAL_OFFSET) - viewportHeight;
            const scrollTarget = Math.max(0, neededSpace);
            
            if (scrollTarget > 0) {
              // Smooth scroll the content container to make room for the popup
              const contentContainer = document.querySelector('.content-animated.dashboard-content');
              if (contentContainer) {
                contentContainer.scrollTo({
                  top: contentContainer.scrollTop + scrollTarget + 20,
                  behavior: 'smooth'
                });
              }
              
              // Use preferred position after scroll
              finalTop = preferredTop;
            } else {
              // Position within available space
              finalTop = Math.min(preferredTop, viewportHeight - POPUP_HEIGHT - 10);
              finalTop = Math.max(finalTop, contentTop + 10);
            }
          }
        }
        
        // Handle horizontal positioning
        if (!wouldFitLeft) {
          finalLeft = Math.max(10, preferredLeft);
        }
        
        setPopupPos({
          top: finalTop,
          left: finalLeft,
        });

        setHighlightedText(text);
        setShowPopup(true);
        return;
      }
    }
    
    // Hide popup if no valid selection
    setShowPopup(false);
    setSelectionDocumentPos(null);
  };

  // Add a global mouseup handler to catch selections that end outside our container
  useEffect(() => {
    const globalMouseUpHandler = (event: MouseEvent) => {
      // Only handle if we don't already have a popup showing (avoid double-triggering)
      if (!showPopup) {
        handleMouseUp();
      }
    };

    // Add global listener to catch selections that end outside our container
    document.addEventListener('mouseup', globalMouseUpHandler);
    
    return () => {
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [showPopup]); // Include showPopup in dependencies to avoid stale closure

  const handleClick = () => {
    // Hide popup on any click (unless it's on the popup itself)
    const sel = window.getSelection();
    if (!sel?.toString().trim()) {
      setShowPopup(false);
      setSelectionDocumentPos(null);
    }
  };

  // Add global click handler to hide popup when clicking outside
  useEffect(() => {
    const globalClickHandler = (event: MouseEvent) => {
      // Check if click is on the popup itself
      const popupElement = document.querySelector('[data-highlight-popup="true"]');
      if (popupElement && popupElement.contains(event.target as Node)) {
        return; // Don't hide if clicking on popup
      }

      // Hide popup if no text is selected
      const sel = window.getSelection();
      if (!sel?.toString().trim()) {
        setShowPopup(false);
        setSelectionDocumentPos(null);
      }
    };

    if (showPopup) {
      document.addEventListener('click', globalClickHandler);
      return () => document.removeEventListener('click', globalClickHandler);
    }
  }, [showPopup]);

  return (
    <div style={{ position: 'relative' }} onMouseUp={handleMouseUp} onClick={handleClick}>
      {children}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: popupPos.top,
            left: popupPos.left,
            border: '2px solid #0B54A7',
            borderRadius: '8px',
            display: 'flex',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}
        >
          <button
            style={explainButtonStyle}
            onClick={() => {
              onExplain(highlightedText);
              setShowPopup(false);
              setSelectionDocumentPos(null);
            }}
          >
            <MdOutlineChat size={20} style={{ marginRight: '8px' }} />
            Explain
          </button>
          <button
            style={analogyButtonStyle}
            onClick={() => {
              onViewAnalogy(highlightedText);
              setShowPopup(false);
              setSelectionDocumentPos(null);
            }}
          >
            <MdLightbulbOutline size={20} style={{ marginRight: '8px' }} />
            View Analogy
          </button>
        </div>
      )}
    </div>
  );
};

const explainButtonStyle: React.CSSProperties = {
  backgroundColor: '#E6F1FB',
  color: '#07073D',
  border: 'none',
  padding: '8px 8px',
  gap: '0',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: '500',
  fontFamily: "'Inter', sans-serif",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '1',
  transition: 'all 0.2s ease',
  borderRadius: '0',
  whiteSpace: 'nowrap',
};

const analogyButtonStyle: React.CSSProperties = {
  backgroundColor: '#A7BAE2',
  color: '#07073D',
  border: 'none',
  padding: '8px 8px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: '500',
  fontFamily: "'Inter', sans-serif",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '1.3',
  transition: 'all 0.2s ease',
  borderRadius: '0',
  whiteSpace: 'nowrap',
};

export default HighlightableInstructionsForReading;
