// src/components/SideChat/SideChat.tsx

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { FaPaperPlane, FaSyncAlt } from 'react-icons/fa';
import assistantIcon from '../../assets/chat_mascot.png';
import styles from './SideChat.module.scss';

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
        { role: 'assistant', content: 'Sorry, couldn\'t generate an analogy.' }
      ]);
    }
  };

  const renderMessages = (msgs: Message[]) =>
    msgs.map((m, i) => {
      const isAssistant = m.role === 'assistant';
      return (
        <div key={i} className={isAssistant ? styles.assistantMsg : styles.userMsg}>
          {isAssistant && <img src={assistantIcon} className={styles.avatar} alt="Assistant" />}
          <div className={styles.bubble}>
            <strong className={styles.senderLabel}>
              {isAssistant ? 'QuantumAide:' : 'You:'}
            </strong>
            {isAssistant ? <TypingText text={m.content} /> : <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>}
          </div>
        </div>
      );
    });

  return (
    <div className={styles.container} style={{ width: chatWidth }}>
      <div className={styles.resizer} onPointerDown={handlePointerDown} />

      <div className={styles.historyToggle}>
        <button className={styles.toggleBtn} onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      <div ref={messagesContainerRef} className={styles.body}>
        {chatHidden && (
          <div className={styles.pullDown}>
            <p className={styles.pullText}>Pull down to view chat</p>
          </div>
        )}

        {showHistory &&
          chatHistory.map((h, idx) => (
            <div key={idx} className={styles.historyItem}>
              <p className={styles.historyLabel}>Question {h.question + 1} Chat:</p>
              {renderMessages(h.messages)}
            </div>
          ))}

        {renderMessages(localMessages)}
        <div ref={messagesEndRef} />

        {/* Try another analogy below last assistant response */}
        {lastAssistant && (
          <div className={styles.tryWrap}>
            <button className={styles.tryBtn} onClick={tryAnotherAnalogy}>
              <FaSyncAlt style={{ marginRight: 6 }} />
              Try another explanation
            </button>
          </div>
        )}

        {localMessages.length === 0 && (
          <div className={styles.placeholder}>
            Start by clicking "Discuss" on a question.
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <input
          className={styles.input}
          placeholder="Ask a follow-up question…"
          value={sideChatInput}
          onChange={e => setSideChatInput(e.target.value)}
          onFocus={revealChat}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSideChatSubmit()}
        />
        <button className={styles.sendBtn} onClick={handleSideChatSubmit}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default SideChat;