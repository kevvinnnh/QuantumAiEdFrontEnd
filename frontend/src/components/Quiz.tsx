// src/components/Quiz.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Question } from './QuizQuestions';
import Questions from './Questions';
import SideChat from './SideChat';
import { FinalResultsPopup } from './Popups';

// Chat message type
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// History item type for SideChat
interface SideHistoryItem {
  question: number;
  messages: ChatMessage[];
}

interface QuizProps {
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  onExit: () => void;
  courseId: number;
}

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

const Quiz: React.FC<QuizProps> = ({ questions, onExit, onComplete, courseId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  // Side chat state
  const [sideChatMessages, setSideChatMessages] = useState<ChatMessage[]>([]);
  const [sideChatInput, setSideChatInput] = useState('');
  const [chatHidden, setChatHidden] = useState(false);
  const [chatHistory, setChatHistory] = useState<SideHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sideChatMessages]);

  useEffect(() => {
    messagesContainerRef.current?.scrollTo(0, 0);
  }, [currentIndex]);

  // Handle answer submission
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const handleSubmitAnswer = () => {
    if (hasSubmitted || selectedOption === null) return;
    const correctIdx = questions[currentIndex].correctAnswer;
    if (selectedOption === correctIdx) {
      setScore(s => s + 1);
      setFeedback('Correct!');
    } else {
      setFeedback('Incorrect...');
    }
    setHasSubmitted(true);
  };

  // Handle Next or Finish
  const handleNext = () => {
    // Push current chat to history with correct property name
    setChatHistory(h => [
      ...h,
      { question: currentIndex, messages: sideChatMessages },
    ]);
    setSideChatMessages([]);
    setSideChatInput('');
    setShowHistory(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
    } else {
      setShowResultsPopup(true);
    }
  };

  // Free-form chat submit
  const handleSideChatSubmit = async () => {
    const text = sideChatInput.trim();
    if (!text) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...sideChatMessages, userMsg];
    setSideChatMessages(newMessages);
    setSideChatInput('');

    try {
      const res = await fetch(buildUrl('/chat_about_text'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ highlighted_text: '', messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.assistant_reply || 'No response from AI.';
      setSideChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  // AI follow-up on question
  const handleDiscussQuestion = async () => {
    if (!hasSubmitted || selectedOption === null) return;
    const q = questions[currentIndex];
    const userAns = q.options[selectedOption];
    const correctAns = q.options[q.correctAnswer];
    const basePrompt = `Question: "${q.question}"\n`;
    const prompt =
      selectedOption === q.correctAnswer
        ? basePrompt +
          `I answered "${userAns}" and that is correct. Please explain why this answer is correct.`
        : basePrompt +
          `I answered "${userAns}" but the correct answer is "${correctAns}". ` +
          `Please explain why my answer is incorrect and why the correct answer is correct.`;

    const initial: ChatMessage = { role: 'user', content: prompt };
    setSideChatMessages([initial]);
    setChatHidden(false);

    try {
      const res = await fetch(buildUrl('/chat_about_text'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ highlighted_text: '', messages: [initial] }),
      });
      const data = await res.json();
      const reply = data.assistant_reply || 'No response from AI.';
      setSideChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Discuss error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onExit} style={styles.backButton}>
        <FaArrowLeft /> Back to Courses
      </button>
      <div style={styles.quizPane}>
        <h2 style={styles.header}>Quiz: Lesson {courseId + 1}</h2>
        <p style={styles.subheader}>
          Question {currentIndex + 1} of {questions.length}
        </p>
        {showResultsPopup ? (
          <FinalResultsPopup
            score={score}
            total={questions.length}
            onReturn={() => {
              setShowResultsPopup(false);
              const pct = Math.round((score / questions.length) * 100);
              onComplete(score, pct >= 70);
            }}
          />
        ) : (
          <Questions
            question={questions[currentIndex]}
            selectedOption={selectedOption}
            hasSubmitted={hasSubmitted}
            feedback={feedback}
            onSelectOption={i => !hasSubmitted && setSelectedOption(i)}
            onSubmitAnswer={handleSubmitAnswer}
            onDiscussQuestion={handleDiscussQuestion}
            onNext={handleNext}
            isLastQuestion={currentIndex === questions.length - 1}
          />
        )}
      </div>
      {!showResultsPopup && (
        <SideChat
          sideChatMessages={sideChatMessages}
          sideChatInput={sideChatInput}
          setSideChatInput={setSideChatInput}
          handleSideChatSubmit={handleSideChatSubmit}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          chatHidden={chatHidden}
          revealChat={() => setChatHidden(false)}
          showHistory={showHistory}
          toggleHistory={() => setShowHistory(h => !h)}
          chatHistory={chatHistory}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' },
  backButton: {
    position: 'absolute', top: 10, left: 10,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#566395', color: '#fff', border: 'none',
    borderRadius: 6, padding: '8px 12px', cursor: 'pointer', zIndex: 10,
  },
  quizPane: { flex: 1, padding: 20, background: '#f9f9f9', overflowY: 'auto' },
  header: { textAlign: 'center', marginBottom: 20 },
  subheader: { textAlign: 'center', marginBottom: 30 },
};

export default Quiz;