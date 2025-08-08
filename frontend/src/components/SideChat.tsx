// src/components/SideChat.tsx

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { FaPaperPlane, FaSyncAlt } from 'react-icons/fa';
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

const colors = {
  dark: '#010117',
  accent: '#071746',
  primary: '#566395',
  light: '#f8f9fa',
  white: '#FFFFFF',
  chatBackground: 'rgba(1,1,23,0.97)',
  userMessageBg: '#3a4a78',
  assistantMessageBg: '#071746',
  buttonBackground: '#566395',
  inputBackground: 'rgba(7,23,70,0.9)',
  border: 'rgba(255,255,255,0.2)',
};

const markdownComponents = {
  ul: ({ node, ...props }: any) => (
    <ul style={{ marginLeft: 20, paddingLeft: 20 }} {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li style={{ marginBottom: 5 }} {...props} />
  ),
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
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Resizing state
  const [chatWidth, setChatWidth] = useState(420);
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(chatWidth);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (resizing) {
        const delta = startX.current - e.clientX;
        setChatWidth(Math.max(300, Math.min(startWidth.current + delta, 600)));
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

  // Local copy of messages
  const [localMessages, setLocalMessages] = useState<Message[]>(sideChatMessages);
  useEffect(() => {
    setLocalMessages(sideChatMessages);
  }, [sideChatMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Pull-down reveal
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop < -20) revealChat();
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [revealChat]);

  // Track last assistant message for analogy
  const lastAssistant = localMessages
    .slice()
    .reverse()
    .find(m => m.role === 'assistant');

  const tryAnotherAnalogy = async () => {
    if (!lastAssistant) return;
    try {
      const resp = await axios.post(
        `${backendUrl}/generate_analogy`,
        { text: lastAssistant.content },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const analog = resp.data.analogy || 'No analogy generated.';
      setLocalMessages(prev => [...prev, { role: 'assistant', content: analog }]);
    } catch {
      setLocalMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, couldn’t generate an analogy.' }
      ]);
    }
  };

  const renderMessages = (msgs: Message[]) =>
    msgs.map((m, i) => {
      const isAssistant = m.role === 'assistant';
      return (
        <div key={i} style={isAssistant ? styles.assistantMsg : styles.userMsg}>
          {isAssistant && <img src={assistantIcon} style={styles.avatar} alt="Assistant" />}
          <div style={styles.bubble}>
            <strong style={styles.senderLabel}>
              {isAssistant ? 'QuantumAide:' : 'You:'}
            </strong>
            {isAssistant ? <TypingText text={m.content} /> : <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>}
          </div>
        </div>
      );
    });

  return (
    <div style={{ ...styles.container, width: chatWidth }}>
      <div style={styles.resizer} onPointerDown={handlePointerDown} />

      <div style={styles.historyToggle}>
        <button style={styles.toggleBtn} onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      <div ref={messagesContainerRef} style={styles.body}>
        {chatHidden && (
          <div style={styles.pullDown}>
            <p style={styles.pullText}>Pull down to view chat</p>
          </div>
        )}

        {showHistory &&
          chatHistory.map((h, idx) => (
            <div key={idx} style={styles.historyItem}>
              <p style={styles.historyLabel}>Question {h.question + 1} Chat:</p>
              {renderMessages(h.messages)}
            </div>
          ))}

        {renderMessages(localMessages)}
        <div ref={messagesEndRef} />

        {/* Try another analogy below last assistant response */}
        {lastAssistant && (
          <div style={styles.tryWrap}>
            <button style={styles.tryBtn} onClick={tryAnotherAnalogy}>
              <FaSyncAlt style={{ marginRight: 6 }} />
              Try another explanation
            </button>
          </div>
        )}

        {localMessages.length === 0 && (
          <div style={styles.placeholder}>
            Start by clicking “Discuss” on a question.
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <input
          style={styles.input}
          placeholder="Ask a follow-up question…"
          value={sideChatInput}
          onChange={e => setSideChatInput(e.target.value)}
          onFocus={revealChat}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSideChatSubmit()}
        />
        <button style={styles.sendBtn} onClick={handleSideChatSubmit}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    background: colors.chatBackground,
    borderLeft: `1px solid ${colors.border}`,
    color: colors.white,
    zIndex: 2000,
  },
  resizer: {
    width: 6,
    cursor: 'ew-resize',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.border,
    zIndex: 2,
  },
  historyToggle: {
    padding: '8px',
    background: colors.accent,
    textAlign: 'center',
  },
  toggleBtn: {
    background: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 20,
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  pullDown: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    background: colors.dark,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pullText: {
    color: colors.light,
    fontStyle: 'italic',
    fontSize: '0.9rem',
  },
  historyItem: {
    marginBottom: 12,
  },
  historyLabel: {
    fontWeight: 600,
    marginBottom: 6,
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: colors.userMessageBg,
    color: colors.white,
    padding: '10px 14px',
    borderRadius: '12px 12px 2px 12px',
    maxWidth: '80%',
    whiteSpace: 'pre-wrap',
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    background: colors.assistantMessageBg,
    border: `1px solid ${colors.primary}`,
    color: colors.white,
    padding: '10px 14px',
    borderRadius: '12px 12px 12px 2px',
    maxWidth: '80%',
    whiteSpace: 'pre-wrap',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginRight: 10,
  },
  bubble: {
    display: 'inline-block',
  },
  senderLabel: {
    display: 'block',
    marginBottom: 4,
    color: colors.primary,
    fontSize: '0.9rem',
  },
  tryWrap: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tryBtn: {
    background: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    borderRadius: 20,
    padding: '6px 18px',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
  },
  placeholder: {
    textAlign: 'center',
    color: colors.light,
    opacity: 0.7,
    padding: 20,
  },
  footer: {
    flexShrink: 0,
    display: 'flex',
    padding: '15px 20px',
    background: colors.accent,
    borderTop: `1px solid ${colors.border}`,
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: 20,
    border: `1px solid ${colors.primary}`,
    background: colors.inputBackground,
    color: colors.white,
    fontSize: 16,
    outline: 'none',
  },
  sendBtn: {
    marginLeft: 8,
    width: 44,
    height: 44,
    background: colors.buttonBackground,
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.white,
    cursor: 'pointer',
    fontSize: 18,
  },
};

export default SideChat;
