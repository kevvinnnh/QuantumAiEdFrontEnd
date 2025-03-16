import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import assistantIcon from '../assets/chat_mascot.png';

interface Message {
  role: string;
  content: string;
}

interface HistoryItem {
  question: number;
  messages: Message[];
}

interface SideChatProps {
  sideChatMessages: Message[];
  sideChatInput: string;
  setSideChatInput: (value: string) => void;
  handleSideChatSubmit: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  chatHidden: boolean;
  revealChat: () => void;
  showHistory: boolean;
  toggleHistory: () => void;
  chatHistory: HistoryItem[];
}

const markdownComponents = {
  ul: ({ node, ...props }: any) => (
    <ul style={{ marginLeft: '20px', paddingLeft: '20px' }} {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li style={{ marginBottom: '5px' }} {...props} />
  ),
};

const TypingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[index]);
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <ReactMarkdown components={markdownComponents}>
      {displayedText}
    </ReactMarkdown>
  );
};

const SideChat: React.FC<SideChatProps> = ({
  sideChatMessages,
  sideChatInput,
  setSideChatInput,
  handleSideChatSubmit,
  messagesEndRef,
  messagesContainerRef,
  chatHidden,
  revealChat,
  showHistory,
  toggleHistory,
  chatHistory,
}) => {
  // State for adjustable width
  const [chatWidth, setChatWidth] = useState<number>(550);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  // Refs to store the initial pointer X and initial width when drag starts
  const initialPointerX = useRef<number>(0);
  const initialWidth = useRef<number>(550);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsResizing(true);
    initialPointerX.current = e.clientX;
    initialWidth.current = chatWidth;
    // Capture pointer events
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isResizing && containerRef.current) {
        // Reverse the delta: newWidth = initialWidth - (e.clientX - initialPointerX)
        const delta = e.clientX - initialPointerX.current;
        const newWidth = initialWidth.current - delta;
        setChatWidth(Math.max(300, Math.min(newWidth, 800)));
      }
    };

    const handlePointerUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing]);

  const renderMessages = (messages: Message[]) =>
    messages.map((msg, i) => {
      const isAssistant = msg.role === 'assistant';
      return (
        <div key={i}>
          <div style={isAssistant ? styles.assistantWrapper : styles.userWrapper}>
            {isAssistant ? (
              <img src={assistantIcon} alt="Assistant" style={styles.avatar} />
            ) : (
              <div style={styles.userAvatar}>🙂</div>
            )}
            <div style={styles.bubble}>
              <strong style={styles.senderLabel}>
                {isAssistant ? 'QuantumAide:' : 'You:'}
              </strong>
              {isAssistant ? (
                <TypingText text={msg.content} />
              ) : (
                <ReactMarkdown components={markdownComponents}>
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
          {i === messages.length - 1 && isAssistant && (
            <div style={styles.analogyButtonContainer}>
              <button
                onClick={() => handleGenerateAnalogy(msg.content)}
                style={styles.analogyButton}
              >
                Get Analogy
              </button>
            </div>
          )}
        </div>
      );
    });

  const handleGenerateAnalogy = async (text: string) => {
    try {
      const response = await fetch('http://localhost:5000/generate_analogy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Failed to generate analogy');
      const data = await response.json();
      const analogyText = data.analogy || 'No analogy generated.';
      setSideChatMessages((old) => [...old, { role: 'assistant', content: analogyText }]);
    } catch (err) {
      console.error(err);
    }
  };

  const [localMessages, setSideChatMessages] = useState<Message[]>(sideChatMessages);
  useEffect(() => {
    setSideChatMessages(sideChatMessages);
  }, [sideChatMessages]);

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, width: `${chatWidth}px` }}
    >
      {/* Resizer Handle */}
      <div
        style={styles.resizer}
        onPointerDown={handlePointerDown}
      />
      {/* History Toggle Button */}
      <div style={styles.historyToggle}>
        <button onClick={toggleHistory} style={styles.toggleButton}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      <div
        ref={messagesContainerRef}
        style={styles.messagesContainer}
        onScroll={(e) => {
          if (e.currentTarget.scrollTop < -30) {
            revealChat();
          }
        }}
      >
        {chatHidden && (
          <div style={styles.pullDownBanner} onClick={revealChat}>
            <p style={styles.pullDownText}>
              Pull down to view previous conversation
            </p>
          </div>
        )}
        <div style={styles.messagesInner}>
          {showHistory && (
            <>
              <h3 style={styles.historyTitle}>Chat History</h3>
              {chatHistory.length === 0 ? (
                <p style={styles.historyEmpty}>No history yet.</p>
              ) : (
                chatHistory.map((historyItem, index) => (
                  <div key={index} style={styles.historyItem}>
                    <p style={styles.historyLabel}>
                      Question {historyItem.question + 1} Chat:
                    </p>
                    {renderMessages(historyItem.messages)}
                  </div>
                ))
              )}
            </>
          )}
          <h3 style={styles.currentChatTitle}>Current Chat</h3>
          {renderMessages(localMessages)}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          type="text"
          style={styles.inputField}
          placeholder="Type your message..."
          value={sideChatInput}
          onChange={(e) => setSideChatInput(e.target.value)}
          onFocus={revealChat}
        />
        <button onClick={handleSideChatSubmit} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#f8f8f8',
    borderLeft: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  resizer: {
    width: '8px',
    cursor: 'ew-resize',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#ddd',
  },
  historyToggle: {
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#eee',
  },
  toggleButton: {
    fontSize: '1rem',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    cursor: 'pointer',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    transition: 'height 0.3s ease',
    position: 'relative',
    paddingTop: '10px',
  },
  pullDownBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248,248,248,0.9)',
    zIndex: 1,
  },
  pullDownText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: '1rem',
  },
  messagesInner: {
    padding: '10px',
  },
  historyTitle: {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '1.5rem',
  },
  historyEmpty: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: '1rem',
  },
  historyItem: {
    marginBottom: '10px',
  },
  historyLabel: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '1.1rem',
  },
  currentChatTitle: {
    textAlign: 'center',
    margin: '10px 0',
    color: '#2a2a2a',
    fontSize: '1.5rem',
  },
  assistantWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  userWrapper: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  avatar: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    margin: '0 10px',
    objectFit: 'cover',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    margin: '0 10px',
    backgroundColor: '#ddd',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2em',
  },
  bubble: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '12px',
    maxWidth: '850px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '1.1rem',
  },
  senderLabel: {
    fontSize: '0.9em',
    color: '#566395',
    marginBottom: '6px',
    display: 'block',
  },
  analogyButtonContainer: {
    marginLeft: '120px',
    marginBottom: '10px',
  },
  analogyButton: {
    fontSize: '0.9rem',
    padding: '8px 16px',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  inputArea: {
    borderTop: '1px solid #ccc',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  inputField: {
    flex: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1.1rem',
  },
  sendButton: {
    marginLeft: '12px',
    padding: '12px 20px',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.1rem',
  },
};

export default SideChat;
