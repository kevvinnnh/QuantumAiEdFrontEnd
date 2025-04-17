import React, { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaSyncAlt } from 'react-icons/fa';

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://quantaide-api.vercel.app');

const buildUrl = (endpoint: string): string => {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const base = API_BASE.replace(/\/+$/, '');
  const ep = endpoint.replace(/^\/+/, '');
  return `${base}/${ep}`;
};

const postJson = async <T extends Record<string, unknown>, R>(
  endpoint: string,
  payload: T,
): Promise<R> => {
  const url = buildUrl(endpoint);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const isJson = res.headers.get('content-type')?.includes('application/json') ?? false;

  let data: (R & { error?: string }) | null = null;
  if (isJson && res.status !== 204) {
    data = (await res.json()) as R & { error?: string };
  }
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status} ${res.statusText}`);
  }
  if (data === null) {
    throw new Error('Empty JSON response from server');
  }
  return data;
};

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
}

const GlobalChat: React.FC<Props> = ({ isOpen, onClose, highlightText, highlightMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!isOpen) return;
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [messages, isOpen]);

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
    setMessages((prev) => prev.concat(msg));

  const requestExplanation = async (text: string) => {
    setIsLoading(true);
    append({ role: 'user', content: text, type: 'general' });
    try {
      const { explanation } = await postJson<{ text: string }, { explanation: string }>(
        '/explain_text',
        { text },
      );
      append({ role: 'assistant', content: explanation, type: 'explanation' });
      setLastTopic(null);
    } catch (err) {
      console.error(err);
      alert(`Unable to explain text: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAnalogy = async (text: string) => {
    setIsLoading(true);
    append({ role: 'user', content: text, type: 'general' });
    try {
      const { explanation } = await postJson<{ text: string }, { explanation: string }>(
        '/explain_text',
        { text: `Create an analogy for: ${text}` },
      );
      append({ role: 'assistant', content: explanation, type: 'analogy' });
      setLastTopic(text);
    } catch (err) {
      console.error(err);
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
      const { assistant_reply } = await postJson<
        { highlighted_text: string; messages: ChatMessage[] },
        { assistant_reply: string }
      >('/chat_about_text', {
        highlighted_text: lastTopic ?? '',
        messages: messages.concat({ role: 'user', content: userMsg }),
      });
      append({ role: 'assistant', content: assistant_reply, type: 'general' });
      setLastTopic(null);
    } catch (err) {
      console.error(err);
      alert(`Chat error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={styles.overlay}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h3 style={styles.title}>Quantaide Chat</h3>
            <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div ref={bodyRef} style={styles.body}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={m.role === 'user' ? styles.userMsg : styles.assistantMsg}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div style={styles.loader}>
                <div style={styles.spinner} />
                Thinking…
              </div>
            )}

            {!isLoading && lastTopic && messages.slice(-1)[0]?.type === 'analogy' && (
              <div style={styles.tryWrap}>
                <button style={styles.tryBtn} onClick={tryAnotherAnalogy}>
                  <FaSyncAlt style={{ marginRight: 6 }} />
                  Try another analogy
                </button>
              </div>
            )}

            {messages.length === 0 && !isLoading && (
              <div style={styles.placeholder}>
                Highlight lesson text or ask a question to get started.
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Ask a follow‑up question…"
              value={draft}
              disabled={isLoading}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendFreeForm()}
            />
            <button
              style={styles.sendBtn}
              onClick={sendFreeForm}
              disabled={isLoading || !draft.trim()}
              aria-label="Send"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
const styles:Record<string,React.CSSProperties>={
  overlay:{position:'fixed',inset:0,zIndex:1999},
  container:{position:'absolute',top:0,right:0,width:420,height:'100vh',display:'flex',flexDirection:'column',background:colors.chatBackground,borderLeft:`1px solid ${colors.border}`,color:colors.white,boxShadow:'0 0 10px rgba(0,0,0,0.4)'},
  header:{flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',background:colors.accent,borderBottom:`1px solid ${colors.border}`},
  title:{margin:0,fontSize:'1.3rem',fontWeight:600},
  closeBtn:{background:'none',border:'none',color:'#aaa',fontSize:28,cursor:'pointer'},
  body:{flex:1,padding:'15px 20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:12},
  userMsg:{alignSelf:'flex-end',background:colors.userMessageBg,borderRadius:'12px 12px 2px 12px',padding:'10px 15px',maxWidth:'80%',whiteSpace:'pre-wrap'},
  assistantMsg:{alignSelf:'flex-start',background:colors.assistantMessageBg,border:`1px solid ${colors.primary}`,borderRadius:'12px 12px 12px 2px',padding:'10px 15px',maxWidth:'80%',whiteSpace:'pre-wrap'},
  loader:{display:'flex',alignItems:'center',gap:10,color:colors.light,fontStyle:'italic'},
  spinner:{width:18,height:18,borderRadius:'50%',border:`3px solid ${colors.border}`,borderTop:`3px solid ${colors.loadingSpinner}`,animation:'spin 1s linear infinite'},
  tryWrap:{display:'flex',justifyContent:'center',paddingTop:10},
  tryBtn:{background:'transparent',color:colors.primary,border:`1px solid ${colors.primary}`,borderRadius:20,padding:'6px 18px',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center'},
  placeholder:{textAlign:'center',opacity:0.7,color:colors.light,padding:30},
  footer:{flexShrink:0,display:'flex',padding:'15px 20px',background:colors.accent,borderTop:`1px solid ${colors.border}`},
  input:{flex:1,padding:'12px 15px',borderRadius:20,border:`1px solid ${colors.primary}`,background:colors.inputBackground,color:colors.white,fontSize:16,outline:'none'},
  sendBtn:{width:44,height:44,background:colors.buttonBackground,border:'none',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:colors.white,cursor:'pointer',fontSize:18}
};

export default GlobalChat;