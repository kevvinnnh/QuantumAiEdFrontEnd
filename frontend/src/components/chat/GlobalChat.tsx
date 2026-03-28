// src/components/GlobalChat.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdClose, MdArrowUpward, MdHistory, MdDeleteOutline, MdArrowBack } from "react-icons/md";
import api from '@/api';

const MAX_STORED_MESSAGES = 50;
const STORAGE_PREFIX = 'quantaid:chat:';

import { colors as baseColors } from '@/constants/theme';

const colors = {
  ...baseColors,
  // Chat-specific overrides and additions
  primary: '#566395',
  border: '#424E62',
  chatBackground: '#181F31',
  userMessageBg: '#2F3D68',
  assistantMessageBg: '#181F31',
  buttonBackground: '#7B99C9',
  inputBackground: '#2A2E46',
  loadingSpinner: '#FFC107',
  dangerRed: '#e74c3c',
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'explanation' | 'analogy' | 'general';
}

interface StoredSession {
  id: string;
  messages: ChatMessage[];
  lastTopic: string | null;
  timestamp: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlightText: string | null;
  highlightMode: 'explain' | 'analogy' | null;
  courseId: number;
  onWidthChange?: (width: number, isResizing?: boolean) => void;
  sidebarWidth?: number;
  animationDuration?: number;
  animationEasing?: string;
}

// --- localStorage helpers ---

function getStorageKey(courseId: number): string {
  return `${STORAGE_PREFIX}${courseId}`;
}

function loadSessions(courseId: number): StoredSession[] {
  try {
    const raw = localStorage.getItem(getStorageKey(courseId));
    if (!raw) return [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns unknown
    const parsed: StoredSession[] = JSON.parse(raw);
    return parsed;
  } catch {
    return [];
  }
}

function saveSessions(courseId: number, sessions: StoredSession[]) {
  try {
    localStorage.setItem(getStorageKey(courseId), JSON.stringify(sessions));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function capMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.length > MAX_STORED_MESSAGES
    ? messages.slice(-MAX_STORED_MESSAGES)
    : messages;
}

const GlobalChat: React.FC<Props> = ({
  isOpen,
  onClose,
  highlightText,
  highlightMode,
  courseId,
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
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastKey = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a unique session ID
  const newSessionId = useCallback(
    () => `${courseId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    [courseId]
  );

  // Load sessions from localStorage when courseId changes
  useEffect(() => {
    const stored = loadSessions(courseId);
    setSessions(stored);

    // Start a fresh session
    const id = newSessionId();
    setActiveSessionId(id);
    setMessages([]);
    setLastTopic(null);
    setShowHistory(false);
    lastKey.current = '';
  }, [courseId, newSessionId]);

  // Persist current session to localStorage whenever messages change
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;

    setSessions(prev => {
      const existing = prev.findIndex(s => s.id === activeSessionId);
      const updated: StoredSession = {
        id: activeSessionId,
        messages: capMessages(messages),
        lastTopic,
        timestamp: Date.now(),
      };

      let next: StoredSession[];
      if (existing >= 0) {
        next = [...prev];
        next[existing] = updated;
      } else {
        next = [...prev, updated];
      }

      // Keep at most 20 sessions per lesson
      if (next.length > 20) {
        next = next.slice(-20);
      }

      saveSessions(courseId, next);
      return next;
    });
  }, [messages, lastTopic, activeSessionId, courseId]);

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
        onWidthChange(constrainedWidth, true);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);

      // Notify parent that resizing has stopped
      if (onWidthChange) {
        onWidthChange(width, false);
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

  // Auto-scroll when new messages arrive or chat opens
  useEffect(() => {
    if (!isOpen) return;

    const scrollToBottom = () => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);

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
      void requestExplanation(highlightText);
    } else {
      void requestAnalogy(highlightText);
    }
  }, [highlightText, highlightMode, isOpen]);

  const append = (msg: ChatMessage | ChatMessage[]) =>
    setMessages(prev => prev.concat(msg));

  const requestExplanation = async (text: string) => {
    append({ role: 'user', content: 'Explain', type: 'explanation' });

    setIsLoading(true);
    try {
      const res = await api.post(
        `/explain_text`,
        { text },
      );
      const explanation = res.data.explanation;
      append({ role: 'assistant', content: explanation, type: 'explanation' });
      setLastTopic(null);
    } catch (err) {
      console.error('Explanation error:', err);
      alert(`Unable to explain text: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAnalogy = async (text: string) => {
    append({ role: 'user', content: 'View Analogy', type: 'analogy' });

    setIsLoading(true);
    try {
      const res = await api.post(
        `/generate_analogy`,
        { text },
      );
      const analogy = res.data.analogy;
      append({ role: 'assistant', content: analogy, type: 'analogy' });
      setLastTopic(text);
    } catch (err) {
      console.error('Analogy error:', err);
      alert(`Unable to generate analogy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tryAnotherAnalogy = async () => {
    if (!lastTopic) return;

    append({ role: 'user', content: 'Try another analogy', type: 'analogy' });

    setIsLoading(true);
    try {
      const res = await api.post(
        `/generate_analogy`,
        { text: lastTopic },
      );
      const analogy = res.data.analogy;
      append({ role: 'assistant', content: analogy, type: 'analogy' });
    } catch (err) {
      console.error('Analogy error:', err);
      alert(`Unable to generate analogy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFreeForm = async () => {
    if (!draft.trim() || isLoading) return;
    const userMsg = draft.trim();
    setDraft('');

    const newUserMessage: ChatMessage = { role: 'user', content: userMsg, type: 'general' };
    append(newUserMessage);

    setIsLoading(true);
    try {
      const res = await api.post(
        `/chat_about_text`,
        { highlighted_text: lastTopic ?? '', messages: messages.concat(newUserMessage) },
      );
      const reply = res.data.assistant_reply;
      append({ role: 'assistant', content: reply, type: 'general' });
      setLastTopic(null);
    } catch (err) {
      console.error('Chat error:', err);
      alert(`Chat error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- History actions ---

  const handleChatHistoryClick = () => {
    setSessions(loadSessions(courseId));
    setShowHistory(true);
  };

  const handleRestoreSession = (session: StoredSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setLastTopic(session.lastTopic);
    setShowHistory(false);
    lastKey.current = '';
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    saveSessions(courseId, updated);

    // If we deleted the active session, start a new one
    if (sessionId === activeSessionId) {
      const id = newSessionId();
      setActiveSessionId(id);
      setMessages([]);
      setLastTopic(null);
    }
  };

  const handleNewChat = () => {
    const id = newSessionId();
    setActiveSessionId(id);
    setMessages([]);
    setLastTopic(null);
    setShowHistory(false);
    lastKey.current = '';
  };

  const handleClearAllHistory = () => {
    saveSessions(courseId, []);
    setSessions([]);
    handleNewChat();
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
    backfaceVisibility: 'hidden',
    willChange: 'transform',
  });

  const formatSessionDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (isYesterday) return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ` ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getSessionPreview = (session: StoredSession): string => {
    const firstUser = session.messages.find(m => m.role === 'user');
    if (!firstUser) return 'Empty conversation';
    const text = firstUser.content;
    return text.length > 60 ? text.slice(0, 57) + '...' : text;
  };

  // Filter out the active session from history (it's the current chat)
  const pastSessions = sessions
    .filter(s => s.id !== activeSessionId && s.messages.length > 0)
    .sort((a, b) => b.timestamp - a.timestamp);

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
          {showHistory ? (
            <>
              <button
                style={styles.historyBtn}
                onClick={() => setShowHistory(false)}
                aria-label="Back to chat"
                className="global-chat-icon-btn"
              >
                <MdArrowBack size={24} />
              </button>
              <span style={styles.headerTitle}>Chat History</span>
              <button
                style={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
                className="global-chat-icon-btn"
              >
                <MdClose size={24} />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {showHistory ? (
          <div style={styles.historyPanel}>
            <button
              style={styles.newChatBtn}
              onClick={handleNewChat}
              className="global-chat-new-chat-btn"
            >
              + New Chat
            </button>

            {pastSessions.length === 0 ? (
              <div style={styles.placeholder}>
                No previous conversations for this lesson.
              </div>
            ) : (
              <div style={styles.sessionList}>
                {pastSessions.map(session => (
                  <div
                    key={session.id}
                    style={styles.sessionItem}
                    onClick={() => handleRestoreSession(session)}
                    className="global-chat-session-item"
                  >
                    <div style={styles.sessionInfo}>
                      <div style={styles.sessionPreview}>{getSessionPreview(session)}</div>
                      <div style={styles.sessionMeta}>
                        {formatSessionDate(session.timestamp)} · {session.messages.length} messages
                      </div>
                    </div>
                    <button
                      style={styles.sessionDeleteBtn}
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      aria-label="Delete conversation"
                      className="global-chat-icon-btn"
                    >
                      <MdDeleteOutline size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pastSessions.length > 0 && (
              <button
                style={styles.clearAllBtn}
                onClick={handleClearAllHistory}
                className="global-chat-clear-btn"
              >
                Clear all history
              </button>
            )}
          </div>
        ) : (
          <>
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
                    Thinking...
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
                    onClick={() => { void tryAnotherAnalogy(); }}
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
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { void sendFreeForm(); } }}
                  className="global-chat-input"
                />
                <button
                  style={styles.sendBtn}
                  onClick={() => { void sendFreeForm(); }}
                  disabled={isLoading || !draft.trim()}
                  aria-label="Send"
                  className="global-chat-send-btn"
                >
                  <MdArrowUpward size={20} />
                </button>
              </div>
            </div>
          </>
        )}
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
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: colors.white,
    textAlign: 'center',
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
  // --- History panel styles ---
  historyPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 20px 20px',
    overflowY: 'auto',
    gap: 8,
  },
  newChatBtn: {
    width: '100%',
    padding: '12px 16px',
    background: colors.buttonBackground,
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    marginBottom: 8,
    transition: 'opacity 0.2s ease',
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    overflowY: 'auto',
  },
  sessionItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    background: colors.inputBackground,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    gap: 8,
  },
  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },
  sessionPreview: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    color: colors.white,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sessionMeta: {
    fontSize: 12,
    color: '#8899AA',
    fontFamily: "'Inter', sans-serif",
    marginTop: 4,
  },
  sessionDeleteBtn: {
    background: 'none',
    border: 'none',
    color: '#8899AA',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease',
    flexShrink: 0,
  },
  clearAllBtn: {
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    color: colors.dangerRed,
    border: `1px solid ${colors.dangerRed}`,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    marginTop: 12,
    transition: 'background 0.15s ease, color 0.15s ease',
  },
};

export default GlobalChat;
