// src/components/Reading.tsx
import React, { useState, useRef, useEffect } from 'react';

interface ReadingProps {
  onOpenChat?: (msg: any) => void;
  chatOpen?: boolean;
}

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

  // Renamed event parameter to _event to silence TS warning.
  const handleMouseUp = (_event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const text = selection?.toString() || '';
    if (text.trim() && selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      // We still calculate the vertical position from the selection,
      // but horizontally we'll fix the popup near the left.
      const computedY = rect.bottom + window.scrollY + 5;
      setPopupPosition({ x: 0, y: computedY }); // 'x' is unused from selection now.
      setHighlightedText(text);
      setShowPopup(true);
    } else {
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
    <div style={{ position: 'relative', color: 'inherit' }} onMouseUp={handleMouseUp}>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {instructions}
      </div>
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: popupPosition.y,
            left: "20%", // Fixed horizontal position: adjust as desired
            transform: 'translateX(-50%)',
            backgroundColor: '#2f3d56',
            color: '#fff',
            border: '1px solid #4a5a78',
            borderRadius: '4px',
            padding: '4px 6px',
            zIndex: 2000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            gap: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            onClick={handleExplainClick}
            style={{
              backgroundColor: '#FFC107', // New button color (amber)
              border: 'none',
              padding: '4px 8px',
              color: '#fff',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Explain
          </button>
          <button
            onClick={handleChatMoreClick}
            style={{
              backgroundColor: '#FFC107', // New button color (amber)
              border: 'none',
              padding: '4px 8px',
              color: '#fff',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Chat More
          </button>
        </div>
      )}
    </div>
  );
};

const Reading: React.FC<ReadingProps> = ({ onOpenChat, chatOpen }) => {
  // Chat state is local
  const [isChatOpen, setIsChatOpen] = useState<boolean>(chatOpen ?? true);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [chatInput, setChatInput] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const cleanResponse = (text: string) => {
    return text.replace(/^.*says:\s*/i, '').trim();
  };

  const handleExplain = async (highlightedText: string) => {
    if (!highlightedText.trim()) return;
    const userMsg = { role: 'user', content: `Explain this text:\n${highlightedText}` };
    setChatMessages((prev) => [...prev, userMsg]);
    try {
      const resp = await fetch('http://localhost:5000/explain_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: highlightedText }),
      });
      const data = await resp.json();
      const reply = data.explanation
        ? cleanResponse(data.explanation)
        : "I'm sorry, I couldn't find an explanation.";
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsChatOpen(true);
      if (onOpenChat) onOpenChat(reply);
    } catch (err) {
      console.error('Error explaining:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error fetching explanation.' },
      ]);
      setIsChatOpen(true);
    }
  };

  const handleChatMore = async (highlightedText: string) => {
    if (!highlightedText.trim()) return;
    const userMsg = { role: 'user', content: `Let's chat more about:\n${highlightedText}` };
    setChatMessages((prev) => [...prev, userMsg]);
    try {
      const resp = await fetch('http://localhost:5000/chat_about_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ highlighted_text: highlightedText, messages: [] }),
      });
      const data = await resp.json();
      const reply = data.assistant_reply
        ? cleanResponse(data.assistant_reply)
        : "No chat response received.";
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsChatOpen(true);
      if (onOpenChat) onOpenChat(reply);
    } catch (err) {
      console.error('Error in chat more:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error fetching chat response.' },
      ]);
      setIsChatOpen(true);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    setChatInput('');
    setChatMessages((prev) => [...prev, userMsg]);
    try {
      const resp = await fetch('http://localhost:5000/chat_about_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ highlighted_text: '', messages: [...chatMessages, userMsg] }),
      });
      const data = await resp.json();
      const reply = data.assistant_reply
        ? cleanResponse(data.assistant_reply)
        : 'No reply from assistant.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Error in chat submit:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error sending chat message.' },
      ]);
    }
  };

  const readingText = `
A new era of computing
Quantum computing is a leap forward from classical computing.
-------------------------------------------------------------

For decades, computers used transistors (0s and 1s). Quantum computers harness qubits, 
which can exist in multiple states simultaneously—unlocking extraordinary parallelism.

Why It's Revolutionary:
- Superposition: Explore many possibilities at once.
- Entanglement: Instant coordination between qubits.
- Measurement: Collapsing probabilities into definite outcomes.

Imagine multiple universes working together to solve one problem at once.

Take Quiz:
When you're ready, click "Take Quiz" to test your knowledge!

Resources:
• Brown, Dan, 2015. Principles of Information Architecture.
• Stern, B., 2020. Breaking the Boundaries of Moore’s Law.
• Shor, P., 1994. Algorithms for Quantum Computation.
`;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mainContent}>
        <HighlightableInstructions
          instructions={readingText}
          onExplain={handleExplain}
          onChatMore={handleChatMore}
        />
      </div>
      <style>{`
        @media print {
          .chat-container {
            display: none !important;
          }
        }
      `}</style>
      <div className="chat-container" style={styles.chatContainer}>
        {isChatOpen ? (
          <div style={styles.expandedChat}>
            <div style={styles.chatHeader}>
              <span style={styles.chatHeaderTitle}>Assistant</span>
              <button
                onClick={() => setIsChatOpen(false)}
                style={styles.chatCloseButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.chatMessages}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={
                    msg.role === 'user'
                      ? styles.userMessage
                      : styles.assistantMessage
                  }
                >
                  {msg.content}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputWrapper}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                style={styles.chatInput}
              />
              <button onClick={handleChatSubmit} style={styles.sendButton}>
                Send
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.chatBubble} onClick={() => setIsChatOpen(true)}>
            <span role="img" aria-label="chat" style={styles.chatBubbleIcon}>
              💬
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#1A2433',
    color: '#fff',
    position: 'relative',
    padding: '20px',
  },
  mainContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px',
    backgroundColor: '#2F3D56',
    borderRadius: '8px',
    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
    lineHeight: 1.6,
  },
  chatContainer: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: 1000,
  },
  chatBubble: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4F79D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
  },
  chatBubbleIcon: {
    fontSize: '28px',
    color: '#fff',
  },
  expandedChat: {
    width: '360px',
    height: '460px',
    backgroundColor: '#2F3D56',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    backgroundColor: '#4F79D9',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  chatCloseButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#fff',
  },
  chatMessages: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F79D9',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '16px',
    margin: '6px 0',
    maxWidth: '80%',
    fontSize: '14px',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#394A6D',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '16px',
    margin: '6px 0',
    maxWidth: '80%',
    fontSize: '14px',
  },
  chatInputWrapper: {
    display: 'flex',
    borderTop: '1px solid #4F79D9',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    outline: 'none',
    border: 'none',
    backgroundColor: '#2F3D56',
    color: '#000', // Force user input text to black
  },
  sendButton: {
    backgroundColor: '#4F79D9',
    border: 'none',
    padding: '10px 16px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '14px',
  },
};

export default Reading;
