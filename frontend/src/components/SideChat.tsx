import React, { useState, useEffect } from 'react';
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
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  revealChat: () => void;
  showHistory: boolean;
  toggleHistory: () => void;
  chatHistory: HistoryItem[];
}

// Markdown renderers to ensure proper formatting for bullet points
const markdownComponents = {
  ul: ({ node, ...props }: any) => (
    <ul style={{ marginLeft: '20px', paddingLeft: '20px' }} {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li style={{ marginBottom: '5px' }} {...props} />
  ),
};

// Typing animation component for assistant messages
const TypingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[index]);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 20); // Adjust typing speed as needed
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
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  revealChat,
  showHistory,
  toggleHistory,
  chatHistory,
}) => {
  // Increased width by 200px (from 350px to 550px)
  const containerStyle: React.CSSProperties = {
    height: chatHidden ? '50px' : '100%',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    transition: 'height 0.3s ease',
    position: 'relative',
    overscrollBehavior: 'contain',
    paddingTop: chatHidden ? '50px' : '0',
    width: '550px',
  };

  const messageWrapper: React.CSSProperties = {
    display: 'flex',
    marginBottom: '10px',
  };

  // Styles for assistant messages (left-aligned)
  const assistantWrapper: React.CSSProperties = {
    ...messageWrapper,
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  // Styles for user messages (right-aligned)
  const userWrapper: React.CSSProperties = {
    ...messageWrapper,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  };

  const avatarStyle: React.CSSProperties = {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    margin: '0 10px',
    objectFit: 'cover',
  };

  const emojiAvatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    margin: '0 10px',
    backgroundColor: '#ddd',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2em',
  };

  // Increased bubble width by 200px (from 250px to 450px)
  const bubbleStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    maxWidth: '450px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const toggleButtonStyle: React.CSSProperties = {
    fontSize: '0.9em',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    cursor: 'pointer',
  };

  // Handler to generate an analogy from the last assistant message
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
      // Append the analogy as a new assistant message
      setSideChatMessages((old) => [...old, { role: 'assistant', content: analogyText }]);
    } catch (err) {
      console.error(err);
    }
  };

  // We'll manage sideChatMessages state locally to allow appending new messages
  const [localMessages, setSideChatMessages] = useState<Message[]>(sideChatMessages);

  useEffect(() => {
    setSideChatMessages(sideChatMessages);
  }, [sideChatMessages]);

  const renderMessages = (messages: Message[]) =>
    messages.map((msg, i) => {
      const isAssistant = msg.role === 'assistant';
      return (
        <div key={i}>
          <div style={isAssistant ? assistantWrapper : userWrapper}>
            {isAssistant ? (
              <img src={assistantIcon} alt="Assistant" style={avatarStyle} />
            ) : (
              <div style={emojiAvatarStyle}>🙂</div>
            )}
            <div style={bubbleStyle}>
              <strong style={{ fontSize: '0.85em', color: '#566395' }}>
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
          {/* Render the Analogy button below the very last assistant message */}
          {i === messages.length - 1 && isAssistant && (
            <div style={{ marginLeft: '120px', marginBottom: '10px' }}>
              <button
                onClick={() => handleGenerateAnalogy(msg.content)}
                style={{
                  fontSize: '0.8em',
                  padding: '6px 12px',
                  backgroundColor: '#566395',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Get Analogy
              </button>
            </div>
          )}
        </div>
      );
    });

  return (
    <div
      style={{
        backgroundColor: '#f8f8f8',
        borderLeft: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* History Toggle Button */}
      <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#eee' }}>
        <button onClick={toggleHistory} style={toggleButtonStyle}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      <div
        ref={messagesContainerRef}
        style={containerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onScroll={(e) => {
          if (e.currentTarget.scrollTop < -30) {
            revealChat();
          }
        }}
      >
        {chatHidden && (
          <div
            style={{
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
            }}
            onClick={revealChat}
          >
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Pull down to view previous conversation
            </p>
          </div>
        )}
        <div style={{ padding: '10px' }}>
          {showHistory && (
            <>
              <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Chat History</h3>
              {chatHistory.length === 0 ? (
                <p style={{ textAlign: 'center', fontStyle: 'italic' }}>No history yet.</p>
              ) : (
                chatHistory.map((historyItem, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <p style={{ fontWeight: 'bold' }}>
                      Question {historyItem.question + 1} Chat:
                    </p>
                    {renderMessages(historyItem.messages)}
                  </div>
                ))
              )}
            </>
          )}
          <h3 style={{ textAlign: 'center', margin: '10px 0', color: '#2a2a2a' }}>
            Current Chat
          </h3>
          {renderMessages(localMessages)}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div
        style={{
          borderTop: '1px solid #ccc',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
          placeholder="Type your message..."
          value={sideChatInput}
          onChange={(e) => setSideChatInput(e.target.value)}
          onFocus={revealChat}
        />
        <button
          onClick={handleSideChatSubmit}
          style={{
            marginLeft: '8px',
            padding: '10px 16px',
            backgroundColor: '#566395',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SideChat;
