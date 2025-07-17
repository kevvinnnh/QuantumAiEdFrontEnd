// src/components/GlobalChat.tsx

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MdClose, MdArrowUpward, MdHistory } from "react-icons/md";

// Base URL for API calls (uses same env var as Login and Quiz)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const colors = {
  dark: '#010117',
  accent: '#071746',
  primary: '#566395',
  light: '#f8f9fa',
  white: '#FFFFFF',
  chatBackground: '#181F31',
  userMessageBg: '#2F3D68',
  assistantMessageBg: '#181F31',
  buttonBackground: '#7B99C9',
  inputBackground: '#2A2E46',
  border: '#424E62',
  loadingSpinner: '#FFC107',
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'explanation' | 'analogy' | 'general';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlightText: string | null;
  highlightMode: 'explain' | 'analogy' | null;
  onWidthChange?: (width: number) => void;
}

const GlobalChat: React.FC<Props> = ({ isOpen, onClose, highlightText, highlightMode, onWidthChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastKey = useRef<string>('');

  // Resizing state
  const [chatWidth, setChatWidth] = useState(420);
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(chatWidth);

  // Notify parent component of width changes
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isOpen ? chatWidth : 0);
    }
  }, [chatWidth, isOpen, onWidthChange]);

  // Handle resizing
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault(); // Prevent text selection during resize
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (resizing) {
        const delta = startX.current - e.clientX;
        const newWidth = Math.max(300, Math.min(startWidth.current + delta, 600));
        setChatWidth(newWidth);
      }
    };
    
    const onUp = () => {
      if (resizing) {
        setResizing(false);
      }
    };
    
    if (resizing) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [resizing]);

  // Auto-scroll when open or new message arrives
  useEffect(() => {
    if (!isOpen) return;
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [messages, isOpen]);

  // Trigger on highlight changes
  useEffect(() => {
    if (!isOpen || !highlightText || !highlightMode) return;
    const key = `${highlightMode}:${highlightText}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (highlightMode === 'explain') {
      requestExplanation(highlightText);
    } else {
      requestAnalogy(highlightText);
    }
  }, [highlightText, highlightMode, isOpen]);

  const append = (msg: ChatMessage | ChatMessage[]) =>
    setMessages(prev => prev.concat(msg));

  const requestExplanation = async (text: string) => {
    setIsLoading(true);
    // Don't add user message for highlights - just process directly
    // append({ role: 'user', content: text, type: 'general' });
    try {
      const res = await axios.post(
        `${backendUrl}/explain_text`,
        { text },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const explanation = res.data.explanation;
      append({ role: 'assistant', content: explanation, type: 'explanation' });
      setLastTopic(null);
    } catch (err) {
      console.error('Explanation error:', err);
      alert(`Unable to explain text: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAnalogy = async (text: string) => {
    setIsLoading(true);
    // Don't add user message for highlights - just process directly
    // append({ role: 'user', content: text, type: 'general' });
    try {
      const res = await axios.post(
        `${backendUrl}/generate_analogy`,
        { text },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const analogy = res.data.analogy;
      append({ role: 'assistant', content: analogy, type: 'analogy' });
      setLastTopic(text);
    } catch (err) {
      console.error('Analogy error:', err);
      alert(`Unable to generate analogy: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tryAnotherAnalogy = async () => {
    if (lastTopic) await requestAnalogy(lastTopic);
  };

  const sendFreeForm = async () => {
    if (!draft.trim() || isLoading) return;
    const userMsg = draft.trim();
    setDraft('');
    append({ role: 'user', content: userMsg, type: 'general' });

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/chat_about_text`,
        { highlighted_text: lastTopic ?? '', messages: messages.concat({ role: 'user', content: userMsg }) },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const reply = res.data.assistant_reply;
      append({ role: 'assistant', content: reply, type: 'general' });
      setLastTopic(null);
    } catch (err) {
      console.error('Chat error:', err);
      alert(`Chat error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatHistoryClick = () => {
    // TODO: Implement chat history functionality
    console.log('Chat history clicked');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{
          ...styles.container,
          width: chatWidth,
          zIndex: 2000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          visibility: isOpen ? 'visible' : 'hidden',
          opacity: isOpen ? 1 : 0,
        }}>
        <div 
          style={{
            ...styles.resizer,
            backgroundColor: resizing ? colors.primary : colors.border,
          }} 
          onPointerDown={handlePointerDown}
        />
        <div style={styles.header}>
          <button 
            style={styles.historyBtn} 
            onClick={handleChatHistoryClick} 
            aria-label="Chat History"
          >
            <MdHistory size={24} />
          </button>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <MdClose size={24} />
          </button>
        </div>

        <div ref={bodyRef} style={styles.body}>
          <div style={styles.messagesContainer}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === 'user' ? styles.userMsg : styles.assistantMsg}>
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div style={styles.loader}>
                <div style={styles.spinner} />
                Thinking…
              </div>
            )}

            {messages.length === 0 && !isLoading && (
              <div style={styles.placeholder}>
                Highlight lesson text or ask a question to get started.
              </div>
            )}
          </div>

          {/* Try Another Analogy Button - positioned at bottom */}
          {!isLoading && lastTopic && messages.slice(-1)[0]?.type === 'analogy' && (
            <div style={styles.tryWrap}>
              <button style={styles.tryBtn} onClick={tryAnotherAnalogy}>
                Try another analogy
              </button>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.inputContainer}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Ask me anything"
              value={draft}
              disabled={isLoading}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendFreeForm()}
            />
            <button
              style={styles.sendBtn}
              onClick={sendFreeForm}
              disabled={isLoading || !draft.trim()}
              aria-label="Send"
            >
              <MdArrowUpward size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: colors.chatBackground,
    color: colors.white,
    boxShadow: '0 0 10px rgba(0,0,0,0.4)',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    flexShrink: 0,
    minWidth: 300,
    maxWidth: 600,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  resizer: {
    width: 1,
    cursor: 'ew-resize',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    transition: 'background-color 0.2s ease',
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '12px 20px',
    background: colors.chatBackground,
  },
  historyBtn: {
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: 24,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '0 4px',
    lineHeight: 1,
  },
  closeBtn: { 
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: 28,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '0 4px',
    lineHeight: 1,
  },
  body: {
    flex: 1,
    padding: '15px 20px',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 0,
  },
  messagesContainer: {
    flex: 1,
    padding: '15px 20px',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 0,
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: colors.userMessageBg,
    borderRadius: '12px 12px 2px 12px',
    padding: '10px 15px',
    maxWidth: '80%',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    flexShrink: 0,
    color: colors.white,
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    background: colors.assistantMessageBg,
    border: 'none',
    padding: '10px 15px',
    maxWidth: '100%',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    flexShrink: 0,
    color: colors.white,
  },
  loader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10, 
    color: colors.light, 
    fontStyle: 'italic',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `3px solid ${colors.border}`,
    borderTop: `3px solid ${colors.loadingSpinner}`,
    animation: 'spin 1s linear infinite',
    flexShrink: 0,
  },
  tryWrap: { 
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    padding: '15px 20px',
    display: 'flex', 
    justifyContent: 'flex-start',
    pointerEvents: 'none', // Allow clicks to pass through gradient
  },
  tryBtn: {
    background: colors.chatBackground,
    color: colors.white,
    border: `1px solid ${colors.white}`,
    borderRadius: 8,
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    pointerEvents: 'auto', // Re-enable clicks for the button
  },
  placeholder: { 
    textAlign: 'center', 
    opacity: 0.7, 
    color: colors.light, 
    padding: 30,
    flexShrink: 0,
  },
  footer: {
    flexShrink: 0,
    padding: '15px 20px',
    marginTop: '25px',
    background: '#181F31',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 50px 14px 15px', // Right padding for send button
    borderRadius: 8,
    border: 'none',
    background: colors.inputBackground,
    color: colors.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    minHeight: 48,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  sendBtn: {
    position: 'absolute',
    right: 8,
    width: 36,
    height: 36,
    background: colors.buttonBackground,
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000',
    cursor: 'pointer',
    fontSize: 16,
    flexShrink: 0,
    transition: 'background-color 0.2s ease',
  },
};

export default GlobalChat;
