import React, { useState, useRef, useEffect } from 'react';
import { quizData } from './QuizQuestions';
import Questions from './Questions';
import { ChatFeaturePopup, FinalResultsPopup, HighlightPopup } from './Popups';
import SideChat from './SideChat';

interface QuizProps {
  concept?: string;
  onComplete: (score: number, passed: boolean) => void;
  onExit: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onExit }) => {
  // === Quiz State ===
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // === Intro State ===
  const [showIntro, setShowIntro] = useState(true);
  const [showChatFeaturePopup, setShowChatFeaturePopup] = useState(true);

  // === Answer State ===
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  // === Highlight State ===
  const [highlightedText, setHighlightedText] = useState('');
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  // Removed 'explanation' state because it is not read elsewhere.
  
  // === Chat State ===
  const [sideChatMessages, setSideChatMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [sideChatInput, setSideChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // === Chat History & Toggle ===
  const [chatHistory, setChatHistory] = useState<
    Array<{ question: number; messages: Array<{ role: string; content: string }> }>
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const toggleHistory = () => {
    console.log("Toggling history from", showHistory, "to", !showHistory);
    setShowHistory(prev => !prev);
  };

  // === Chat Collapse (if needed) ===
  const [chatHidden, setChatHidden] = useState(false);
  const revealChat = () => setChatHidden(false);

  // === Side Effects ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sideChatMessages]);

  useEffect(() => {
    messagesContainerRef.current?.scrollTo(0, 0);
  }, [currentIndex]);

  // === Navigation & Answer Handlers ===
  const handleNext = () => {
    setChatHistory(prev => [...prev, { question: currentIndex, messages: sideChatMessages }]);
    setSideChatMessages([]);
    setShowHistory(false);
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      setSideChatInput('');
    } else {
      setQuizFinished(true);
      setShowResultsPopup(true);
    }
  };

  const handleCloseQuiz = () => {
    onExit();
  };

  const handleStartQuiz = () => {
    setShowIntro(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleSubmitAnswer = () => {
    if (selectedOption !== null) {
      const correctAns = quizData[currentIndex].correctAnswer;
      if (selectedOption === correctAns) {
        setScore(prev => prev + 1);
        setFeedback('Correct!');
      } else {
        setFeedback('Incorrect...');
      }
      setHasSubmitted(true);
    }
  };

  // === Highlight Handlers ===
  const handleIntroMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (text) {
      setHighlightedText(text);
      setShowHighlightPopup(true);
      setPopupPos({ x: e.clientX, y: e.clientY });
    } else {
      setShowHighlightPopup(false);
    }
  };

  const handleExplain = async () => {
    if (!highlightedText) return;
    setShowHighlightPopup(false);
    try {
      const resp = await fetch('http://localhost:5000/explain_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: highlightedText }),
      });
      if (!resp.ok) throw new Error('Failed to fetch explanation');
      const data = await resp.json();
      const explanationText = data.explanation || 'No explanation found.';
      // Instead of setting an unused state, directly add the explanation to the side chat.
      setSideChatMessages(old => [...old, { role: 'assistant', content: explanationText }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatMore = async () => {
    if (!highlightedText) return;
    setShowHighlightPopup(false);
    const userMsg = { role: 'user', content: `Discuss this highlighted text: "${highlightedText}"` };
    const updated = [...sideChatMessages, userMsg];
    setSideChatMessages(updated);
    try {
      const resp = await fetch('http://localhost:5000/chat_about_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ highlighted_text: highlightedText, messages: updated }),
      });
      if (!resp.ok) throw new Error('Failed to chat about text');
      const data = await resp.json();
      const reply = data.assistant_reply || 'No reply.';
      setSideChatMessages(old => [...old, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
    }
  };

  // === Side Chat Handler ===
  const handleSideChatSubmit = async () => {
    if (!sideChatInput.trim()) return;
    const userMsg = { role: 'user', content: sideChatInput.trim() };
    setSideChatInput('');
    setSideChatMessages(old => [...old, userMsg]);
    try {
      const resp = await fetch('http://localhost:5000/chat_about_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ highlighted_text: '', messages: [...sideChatMessages, userMsg] }),
      });
      if (!resp.ok) throw new Error('Failed side chat');
      const data = await resp.json();
      const reply = data.assistant_reply || 'No reply.';
      setSideChatMessages(old => [...old, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Side chat error:', err);
    }
  };

  const handleDiscussQuestion = async () => {
    const questionText = quizData[currentIndex].question;
    const correctAnswerText = quizData[currentIndex].options[quizData[currentIndex].correctAnswer];
    const selectedAnswerText =
      selectedOption !== null ? quizData[currentIndex].options[selectedOption] : "No answer selected";
    const isCorrect =
      selectedOption !== null && selectedOption === quizData[currentIndex].correctAnswer;

    const userMsg = {
      role: 'user',
      content: `I answered ${isCorrect ? "correctly" : "incorrectly"}.
My answer was: "${selectedAnswerText}".
The correct answer is: "${correctAnswerText}".
Please provide a condensed explanation that ${
        isCorrect ? "reinforces why my answer is correct" : "clarifies why my answer was wrong and why the correct answer is right"
      } for the following question:\n\n${questionText}`
    };

    setSideChatMessages(old => [...old, userMsg]);

    try {
      const resp = await fetch('http://localhost:5000/chat_quiz_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_text: questionText,
          messages: [...sideChatMessages, userMsg],
          isCorrect,
          selectedAnswer: selectedAnswerText,
          correctAnswer: correctAnswerText,
        }),
      });
      if (!resp.ok) throw new Error('Failed question chat');
      const data = await resp.json();
      const reply = data.assistant_reply || 'No reply.';
      setSideChatMessages(old => [...old, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* LEFT: Quiz Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
          padding: '20px',
        }}
      >
        <button
          onClick={handleCloseQuiz}
          style={{
            position: 'absolute',
            top: '20px',
            left: '10px',
            background: 'none',
            border: 'none',
            color: '#566395',
            fontSize: '1.5em',
            cursor: 'pointer',
          }}
        >
          X
        </button>

        {showResultsPopup && (
          <FinalResultsPopup
            score={score}
            total={quizData.length}
            onReturn={() => {
              setShowResultsPopup(false);
              onExit();
            }}
          />
        )}
        {showChatFeaturePopup && (
          <ChatFeaturePopup onGotIt={() => setShowChatFeaturePopup(false)} />
        )}
        {showHighlightPopup && (
          <HighlightPopup
            position={popupPos}
            onExplain={handleExplain}
            onChatMore={handleChatMore}
          />
        )}

        <Questions
          showIntro={showIntro}
          question={quizData[currentIndex]}
          selectedOption={selectedOption}
          hasSubmitted={hasSubmitted}
          feedback={feedback}
          onSelectOption={(idx) => setSelectedOption(idx)}
          onSubmitAnswer={handleSubmitAnswer}
          onDiscussQuestion={handleDiscussQuestion}
          onNext={handleNext}
          onIntroMouseUp={handleIntroMouseUp}
          onStartQuiz={handleStartQuiz}
          isLastQuestion={currentIndex === quizData.length - 1}
        />
      </div>

      {/* RIGHT: Side Chat */}
      {(showIntro || hasSubmitted) && !quizFinished && (
        <SideChat
          sideChatMessages={sideChatMessages}
          sideChatInput={sideChatInput}
          setSideChatInput={setSideChatInput}
          handleSideChatSubmit={handleSideChatSubmit}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          chatHidden={chatHidden}
          revealChat={revealChat}
          showHistory={showHistory}
          toggleHistory={toggleHistory}
          chatHistory={chatHistory}
        />
      )}
    </div>
  );
};

export default Quiz;
