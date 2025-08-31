// src/components/GlobalChat/GlobalChat.tsx

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MdClose, MdArrowUpward, MdHistory } from "react-icons/md";
import styles from './GlobalChat.module.scss';

// Base URL for API calls (uses same env var as Login and Quiz)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
    width: width,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform ${animationDuration}ms ${animationEasing}`,
  });

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} global-chat-coordinated`}
      style={getContainerStyles()}
    >
      {isOpen && (
        <div
          className={`${styles.resizer} resizer`}
          onMouseDown={handleResizeStart}
        />
      )}

      <div className={styles.header}>
        <button 
          className={`${styles.historyBtn} global-chat-icon-btn`}
          onClick={handleChatHistoryClick} 
          aria-label="Chat History"
        >
          <MdHistory size={24} />
        </button>
        <button 
          className={`${styles.closeBtn} global-chat-icon-btn`}
          onClick={onClose} 
          aria-label="Close"
        >
          <MdClose size={24} />
        </button>
      </div>

      <div ref={bodyRef} className={styles.body}>
        <div className={styles.messagesContainer}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? styles.userMsg : styles.assistantMsg}>
              {m.content}
            </div>
          ))}

          {isLoading && (
            <div className={styles.loader}>
              <div className={styles.spinner} />
              Thinking…
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className={styles.placeholder}>
              Highlight lesson text or ask a question to get started.
            </div>
          )}
        </div>

        {!isLoading && lastTopic && messages.slice(-1)[0]?.type === 'analogy' && (
          <div className={styles.tryWrap}>
            <button 
              className={`${styles.tryBtn} global-chat-try-btn`}
              onClick={tryAnotherAnalogy}
            >
              Try another analogy
            </button>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            className={`${styles.input} global-chat-input`}
            placeholder="Ask me anything"
            value={draft}
            disabled={isLoading}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendFreeForm()}
          />
          <button
            className={`${styles.sendBtn} global-chat-send-btn`}
            onClick={sendFreeForm}
            disabled={isLoading || !draft.trim()}
            aria-label="Send"
          >
            <MdArrowUpward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;