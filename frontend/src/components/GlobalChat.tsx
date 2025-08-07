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
  onWidthChange?: (width: number, isResizing?: boolean) => void;
  sidebarWidth?: number;
  animationDuration?: number;
  animationEasing?: string;
  isAnimating?: boolean;
}

const GlobalChat: React.FC<Props> = ({
  isOpen,
  onClose,
  highlightText,
  highlightMode,
  onWidthChange,
  sidebarWidth = 250,
  animationDuration = 300,
  animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [width, setWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastKey = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resizing with parent notification
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = Math.min(600, window.innerWidth - sidebarWidth - 100);
      
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(constrainedWidth);

      // Notify parent that we're actively resizing
      if (onWidthChange) {
        onWidthChange(constrainedWidth, true); // isResizing = true
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);

      // Notify parent that resizing has stopped
      if (onWidthChange) {
        onWidthChange(width, false); // isResizing = false
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth, width, onWidthChange]);

  // Notify parent of width changes
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isOpen ? width : 0, false); // isResizing = false for open/close
    }
  }, [isOpen, width, onWidthChange]);

  // Auto-scroll when new messages arrive or chat opens
  useEffect(() => {
    if (!isOpen) return;
    
    // Use setTimeout to ensure DOM has updated after state changes
    const scrollToBottom = () => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({ 
          top: bodyRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }
    };
    
    // Immediate scroll
    scrollToBottom();
    
    // Delayed scroll to handle any async rendering
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    // Focus input when chat is open
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => clearTimeout(timeoutId);
  }, [messages, isOpen, isLoading]);

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
    append({ role: 'user', content: 'Explain', type: 'explanation' });

    setIsLoading(true);
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
    append({ role: 'user', content: 'View Analogy', type: 'analogy' });

    setIsLoading(true);
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
    if (!lastTopic) return;
    
    append({ role: 'user', content: 'Try another analogy', type: 'analogy' });
    
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/generate_analogy`,
        { text: lastTopic },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const analogy = res.data.analogy;
      append({ role: 'assistant', content: analogy, type: 'analogy' });
      // Keep lastTopic the same since we're generating another analogy for the same topic
    } catch (err) {
      console.error('Analogy error:', err);
      alert(`Unable to generate analogy: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFreeForm = async () => {
    if (!draft.trim() || isLoading) return;
    const userMsg = draft.trim();
    setDraft('');
    
    // Add user message
    const newUserMessage = { role: 'user' as const, content: userMsg, type: 'general' as const };
    append(newUserMessage);

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/chat_about_text`,
        { highlighted_text: lastTopic ?? '', messages: messages.concat(newUserMessage) },
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
    console.log('Chat history clicked');
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const getContainerStyles = (): React.CSSProperties => ({
    ...styles.container,
    width: width,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform ${animationDuration}ms ${animationEasing}`,
    backfaceVisibility: 'hidden' as const,
    willChange: 'transform',
  });

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div ref={containerRef} style={getContainerStyles()} className="global-chat-coordinated">
        {isOpen && (
          <div
            style={styles.resizer}
            onMouseDown={handleResizeStart}
            className="resizer"
          />
        )}

        <div style={styles.header}>
          <button 
            style={styles.historyBtn} 
            onClick={handleChatHistoryClick} 
            aria-label="Chat History"
            className="global-chat-icon-btn"
          >
            <MdHistory size={24} />
          </button>
          <button 
            style={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Close"
            className="global-chat-icon-btn"
          >
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

          {!isLoading && lastTopic && messages.slice(-1)[0]?.type === 'analogy' && (
            <div style={styles.tryWrap}>
              <button 
                style={styles.tryBtn} 
                onClick={tryAnotherAnalogy}
                className="global-chat-try-btn"
              >
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
              className="global-chat-input"
            />
            <button
              style={styles.sendBtn}
              onClick={sendFreeForm}
              disabled={isLoading || !draft.trim()}
              aria-label="Send"
              className="global-chat-send-btn"
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
  },
  resizer: {
    width: 4,
    cursor: 'ew-resize',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    transition: 'background-color 150ms ease',
    zIndex: 1,
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
    pointerEvents: 'none',
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
    pointerEvents: 'auto',
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
    padding: '14px 50px 14px 15px',
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