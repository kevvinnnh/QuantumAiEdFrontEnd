// src/components/ReadingChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import assistantIcon from '../assets/chat_mascot.png';

interface Message {
  role: string;
  content: string;
}

interface ReadingChatProps {
  initialMessage: string;
  onClose: () => void;
}

const ReadingChat: React.FC<ReadingChatProps> = ({ initialMessage, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', content: initialMessage },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Simulate an assistant reply (replace with your API call if needed)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'This is a reading chat reply.' }]);
    }, 1000);
  };

  return (
    <div style={chatStyles.overlay}>
      <div style={chatStyles.chatWindow}>
        <div style={chatStyles.header}>
          <h3>Reading Chat</h3>
          <button style={chatStyles.closeButton} onClick={onClose}>X</button>
        </div>
        <div style={chatStyles.body}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.role === 'assistant' ? chatStyles.assistantMsg : chatStyles.userMsg}>
              {msg.role === 'assistant' ? (
                <img src={assistantIcon} alt="Assistant" style={chatStyles.avatar} />
              ) : (
                <div style={chatStyles.userAvatar}>🙂</div>
              )}
              <div style={chatStyles.bubble}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={chatStyles.footer}>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            style={chatStyles.input}
          />
          <button style={chatStyles.sendButton} onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

const chatStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 3000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  chatWindow: {
    width: '400px',
    height: '100%',
    backgroundColor: '#f8f8f8',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-2px 0 6px rgba(0,0,0,0.2)',
  },
  header: {
    padding: '10px',
    backgroundColor: '#566395',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  body: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
    backgroundColor: '#f9f9f9',
  },
  assistantMsg: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  userMsg: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '10px',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    margin: '0 10px',
    objectFit: 'cover',
  },
  userAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    margin: '0 10px',
    backgroundColor: '#ddd',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1rem',
  },
  bubble: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    maxWidth: '300px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '1rem',
  },
  footer: {
    padding: '10px',
    borderTop: '1px solid #ccc',
    display: 'flex',
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  sendButton: {
    marginLeft: '10px',
    padding: '8px 12px',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ReadingChat;
