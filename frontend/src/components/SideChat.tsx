// src/components/SideChat.tsx

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import assistantIcon from '../assets/chat_mascot.png';

interface Message {
  role: 'user' | 'assistant';
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

// Build API URL helper
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://quantaide-api.vercel.app');
const buildUrl = (endpoint: string) => {
  const base = API_BASE.replace(/\/+$/, '');
  const ep = endpoint.replace(/^\/+/, '');
  return `${base}/${ep}`;
};

const TypingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const iv = setInterval(() => {
      setDisplayed(prev => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 20);
    return () => clearInterval(iv);
  }, [text]);
  return <ReactMarkdown components={markdownComponents}>{displayed}</ReactMarkdown>;
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
  // Resize
  const [chatWidth, setChatWidth] = useState(550);
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(550);
  const containerRef = useRef<HTMLDivElement|null>(null);

  // Local copy of messages for analogy updates
  const [localMessages, setLocalMessages] = useState<Message[]>(sideChatMessages);
  useEffect(() => setLocalMessages(sideChatMessages), [sideChatMessages]);

  // Pointer events for resizing
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (resizing) {
        const delta = e.clientX - startX.current;
        const newW = startWidth.current - delta;
        setChatWidth(Math.max(300, Math.min(newW, 800)));
      }
    };
    const onUp = () => resizing && setResizing(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [resizing]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Reveal on scroll up
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop < -30) revealChat();
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [revealChat]);

  // Generate analogy
  const handleGenerateAnalogy = async (text: string) => {
    if (chatHidden) revealChat();
    const userMsg: Message = { role: 'user', content: text };
    setLocalMessages(prev => [...prev, userMsg]);
    try {
      const res = await fetch(buildUrl('/generate_analogy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      const analog = data.analogy || 'No analogy generated.';
      setLocalMessages(prev => [...prev, { role: 'assistant', content: analog }]);
    } catch (err) {
      console.error('Analogy error:', err);
    }
  };

  const renderMessages = (msgs: Message[]) =>
    msgs.map((m, i) => {
      const isAssistant = m.role === 'assistant';
      return (
        <div key={i}>
          <div style={isAssistant ? styles.assistantWrapper : styles.userWrapper}>
            {isAssistant ? (
              <img src={assistantIcon} style={styles.avatar} alt="Assistant" />
            ) : (
              <div style={styles.userAvatar}>🙂</div>
            )}
            <div style={styles.bubble}>
              <strong style={styles.senderLabel}>
                {isAssistant ? 'QuantumAide:' : 'You:'}
              </strong>
              {isAssistant ? <TypingText text={m.content} /> : (
                <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
              )}
            </div>
          </div>
          {i === msgs.length - 1 && isAssistant && (
            <div style={styles.analogyButtonContainer}>
              <button
                style={styles.analogyButton}
                onClick={() => handleGenerateAnalogy(m.content)}
              >
                Get Analog​y
              </button>
            </div>
          )}
        </div>
      );
    });

  return (
    <div ref={containerRef} style={{ ...styles.container, width: chatWidth }}>
      <div style={styles.resizer} onPointerDown={handlePointerDown} />
      <div style={styles.historyToggle}>
        <button style={styles.toggleButton} onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      <div ref={messagesContainerRef} style={styles.messagesContainer}>
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
                chatHistory.map((h, idx) => (
                  <div key={idx} style={styles.historyItem}>
                    <p style={styles.historyLabel}>
                      Question {h.question + 1} Chat:
                    </p>
                    {renderMessages(h.messages)}
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
      <div style={styles.inputArea}>
        <input
          style={styles.inputField}
          placeholder="Type your message..."
          value={sideChatInput}
          onChange={e => setSideChatInput(e.target.value)}
          onFocus={revealChat}
        />
        <button style={styles.sendButton} onClick={handleSideChatSubmit}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#f8f8f8',
    borderLeft: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%'
  },
  resizer: {
    width: 8,
    cursor: 'ew-resize',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#ddd',
  },
  historyToggle: {
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#eee',
  },
  toggleButton: {
    fontSize: '1rem',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    padding: '10px 20px',
    cursor: 'pointer',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
    paddingTop: '10px',
  },
  pullDownBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
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
    padding: 10,
  },
  historyTitle: { textAlign: 'center', marginBottom: 10, fontSize: '1.5rem' },
  historyEmpty: { textAlign: 'center', fontStyle: 'italic', fontSize: '1rem' },
  historyItem: { marginBottom: 10 },
  historyLabel: { fontWeight: 'bold', marginBottom: 5, fontSize: '1.1rem' },
  currentChatTitle: { textAlign: 'center', margin: '10px 0', fontSize: '1.5rem' },
  assistantWrapper: { display: 'flex', alignItems: 'flex-start', marginBottom: 15 },
  userWrapper: { display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 15 },
  avatar: { width: 110, height: 110, borderRadius: '50%', margin: '0 10px', objectFit: 'cover' },
  userAvatar: { width: 40, height: 40, borderRadius: '50%', margin: '0 10px', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em' },
  bubble: { backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 12, maxWidth: 850, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '1.1rem', color: '#000' },
  senderLabel: { fontSize: '0.9em', color: '#566395', marginBottom: 6, display: 'block' },
  analogyButtonContainer: { marginLeft: 120, marginBottom: 10 },
  analogyButton: { fontSize: '0.9rem', padding: '8px 16px', backgroundColor: '#566395', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  inputArea: { borderTop: '1px solid #ccc', padding: 12, display: 'flex', alignItems: 'center', backgroundColor: '#f8f8f8' },
  inputField: { flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd', fontSize: '1.1rem', color: '#000' },
  sendButton: { marginLeft: 12, padding: '12px 20px', backgroundColor: '#566395', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1.1rem' },
};

export default SideChat;