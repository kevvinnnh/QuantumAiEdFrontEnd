// src/components/Quiz.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { Question } from './QuizQuestions';
import Questions from './Questions';
import SideChat from './SideChat';
import { FinalResultsPopup } from './Popups';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Quiz: React.FC<QuizProps> = ({ questions, onExit, onComplete, courseId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  // Side chat state
  const [sideChatMessages, setSideChatMessages] = useState<ChatMessage[]>([]);
  const [sideChatInput, setSideChatInput] = useState('');
  const [chatHidden, setChatHidden] = useState(true);
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
    // Un-hide side chat when answer is submitted
    setChatHidden(false);
  };

  const handleNext = () => {
    setChatHistory(h => [...h, { question: currentIndex, messages: sideChatMessages }]);
    setSideChatMessages([]);
    setSideChatInput('');
    setShowHistory(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      setChatHidden(true);
    } else {
      setShowResultsPopup(true);
    }
  };

  const handleSideChatSubmit = async () => {
    const text = sideChatInput.trim();
    if (!text) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...sideChatMessages, userMsg];
    setSideChatMessages(newMessages);
    setSideChatInput('');

    try {
      const res = await axios.post(
        `${backendUrl}/chat_about_text`,
        { highlighted_text: '', messages: newMessages },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const reply = res.data.assistant_reply || 'No response from AI.';
      setSideChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleDiscussQuestion = async () => {
    if (!hasSubmitted || selectedOption === null) return;
    const q = questions[currentIndex];
    const userAns = q.options[selectedOption];
    const correctAns = q.options[q.correctAnswer];
    const basePrompt = `Question: "${q.question}"\n`;
    const prompt =
      selectedOption === q.correctAnswer
        ? basePrompt + `I answered "${userAns}" and that is correct. Please explain why this answer is correct.`
        : basePrompt +
          `I answered "${userAns}" but the correct answer is "${correctAns}". Please explain why my answer is incorrect and why the correct answer is correct.`;

    const initial: ChatMessage = { role: 'user', content: prompt };
    setSideChatMessages([initial]);
    setChatHidden(false);

    try {
      const res = await axios.post(
        `${backendUrl}/chat_about_text`,
        { highlighted_text: '', messages: [initial] },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const reply = res.data.assistant_reply || 'No response from AI.';
      setSideChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Discuss error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onExit} style={styles.backButton}>
        <FaArrowLeft /> Back
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
            currentIndex={currentIndex}
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

      {/* SideChat only appears after submitting an answer */}
      {!showResultsPopup && !chatHidden && hasSubmitted && (
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
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
    background: 'linear-gradient(180deg, #010117 0%, #071746 100%)',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    zIndex: 10,
    fontSize: '0.9rem',
  },
  quizPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '60px 40px 40px',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '1.8rem',
    margin: 0,
    marginBottom: 8,
  },
  subheader: {
    fontSize: '1rem',
    margin: 0,
    marginBottom: 32,
    opacity: 0.8,
  },
};

export default Quiz;
