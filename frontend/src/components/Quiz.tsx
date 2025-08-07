// src/components/Quiz.tsx

import React, { useState, useRef, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlineThumbsUpDown } from "react-icons/md";
import { Question } from './QuizQuestions';
import Questions from './Questions';
import QuizProgressBar from './QuizProgressBar';
import FeedbackModal from './FeedbackModal';
// import SideChat from './SideChat';
// import { FinalResultsPopup } from './Popups';

// interface ChatMessage {
//   role: 'user' | 'assistant';
//   content: string;
// }

// interface SideHistoryItem {
//   question: number;
//   messages: ChatMessage[];
// }

interface QuizProps {
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  onExit: () => void;
  courseId: number;
  lessonContent?: LessonContent; // Optional lesson content for review
}

interface LessonContent {
  title: string;
  paragraphs: string[];
  interactiveTerms?: Record<string, string>;
}

// Extended Question interface to include lesson content reference
interface QuestionWithLesson extends Question {
  lessonContentIndices?: number[]; // Array of paragraph indices from lesson content
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Quiz: React.FC<QuizProps> = ({ questions, onExit, courseId, lessonContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizStartTime] = useState<number>(Date.now()); // Track quiz start time
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
  const [progressSaved, setProgressSaved] = useState(false); // Track if progress has been saved

  // Show Correct Answers functionality state
  const [wrongChoices, setWrongChoices] = useState<number[]>([]); // Track wrong choices for current question
  const [attemptCount, setAttemptCount] = useState(0); // Track number of attempts for current question
  const [questionCompleted, setQuestionCompleted] = useState(false); // Track if question is finished (correct answer or max attempts)

  // Review concept state
  const [showReviewConcept, setShowReviewConcept] = useState(false);

  // Quiz Settings State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAnswersEnabled, setShowAnswersEnabled] = useState(true);
  const [timeModeEnabled, setTimeModeEnabled] = useState(true);
  const [, setQuestionStartTime] = useState<number>(Date.now());
  const [timeLimit] = useState(30); // 30 seconds per question in time mode
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerPaused, setTimerPaused] = useState(false);
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(null);

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Refs for options
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showExitModal, setShowExitModal] = useState(false);

  // // Side chat state
  // const [sideChatMessages, setSideChatMessages] = useState<ChatMessage[]>([]);
  // const [sideChatInput, setSideChatInput] = useState('');
  // const [chatHidden, setChatHidden] = useState(true);
  // const [chatHistory, setChatHistory] = useState<SideHistoryItem[]>([]);
  // const [showHistory, setShowHistory] = useState(false);

  // const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [sideChatMessages]);

  // useEffect(() => {
  //   messagesContainerRef.current?.scrollTo(0, 0);
  // }, [currentIndex]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsDropdownRef.current && 
        !settingsDropdownRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsDropdown]);

  // Update timer for footer animation
  useEffect(() => {
    if (!timeModeEnabled || hasSubmitted || showResultsScreen) return;

    // Check if we should pause the timer
    const shouldPause = showExitModal;

    if (shouldPause) {
      setTimerPaused(true);
      setPausedTimeRemaining(timeRemaining);
      return;
    }

    // If we're resuming from a pause, use the paused time
    let startTime: number;
    let initialTimeRemaining: number;
    
    if (timerPaused && pausedTimeRemaining !== null) {
      // Resume from pause
      startTime = Date.now();
      initialTimeRemaining = pausedTimeRemaining;
      setTimerPaused(false);
      setPausedTimeRemaining(null);
    } else {
      // Fresh start (new question or first time)
      startTime = Date.now();
      initialTimeRemaining = timeLimit;
    }
    
    setQuestionStartTime(startTime);
    setTimeRemaining(initialTimeRemaining);

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, initialTimeRemaining - elapsed);
      setTimeRemaining(remaining);

      // Auto-submit when time runs out
      if (remaining <= 0) {
        console.log('Timer expired! hasSubmitted:', hasSubmitted);
        clearInterval(interval);
        if (!hasSubmitted) {
          console.log('Calling handleSubmitAnswer(true)');
          handleSubmitAnswer(true);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [currentIndex, timeModeEnabled, hasSubmitted, showResultsScreen, timeLimit, showExitModal]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Sound effect functions
  const playSound = (type: 'correct' | 'incorrect' | 'click' | 'timeUp', forcePlay = false) => {
    if (!soundEnabled && !forcePlay) return;
    
    // Create audio context and play synthesized sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'correct':
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
      case 'incorrect':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.2); // G3
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.015);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.035);
        gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
        break;
      case 'timeUp':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  };

  // Save quiz progress to backend when final question is completed
  const saveQuizProgress = async () => {
    if (progressSaved) return; // Prevent duplicate saves
    
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;

    const quizResultData = {
      courseId: courseId,
      score: score,
      passed: passed,
    };

    try {
      console.log("Sending quiz result:", quizResultData);
      const response = await fetch(`${backendUrl}/save_quiz_result`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizResultData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Quiz result saved successfully:", result);
      setProgressSaved(true); // Mark as saved
      
    } catch (error) {
      console.error('Failed to save quiz result:', error);
      // Don't show alert here since user might be navigating away
    }
  };

  const handleSubmitAnswer = (autoSubmitted = false) => {
    // If question is already completed (correct answer found or max attempts reached), don't process further
    if (questionCompleted) return;

    // Auto-submission via timer or no selection
    if (!autoSubmitted && selectedOption == null) return;
    
    const correctIdx = questions[currentIndex].correctAnswer;
    const isAnswerCorrect = selectedOption === correctIdx;
    
    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    if (!showAnswersEnabled) {
      // When Show Correct Answers is DISABLED: just score and move on, no feedback or marking
      if (isAnswerCorrect) {
        setScore(s => s + 1);
      }
      // Immediately move to next question without any visual feedback
      handleNext();
      return;
    }
    
    if (isAnswerCorrect) {
      // Correct answer - award points only on first attempt
      if (newAttemptCount === 1) {
        setScore(s => s + 1);
      }
      setFeedback('Correct!');
      setIsCorrect(true);
      setQuestionCompleted(true); // Mark question as completed
      setHasSubmitted(true);
      playSound('correct');
    } else {
      // Wrong answer
      if (selectedOption !== null) {
        setWrongChoices(prev => [...prev, selectedOption]); // Add to wrong choices
      }
      
      playSound(autoSubmitted ? 'timeUp' : 'incorrect');
      
      if (newAttemptCount >= 2 || autoSubmitted) {
        // Max attempts reached or time expired
        setFeedback(autoSubmitted ? 'Time\'s up! Incorrect...' : 'Incorrect...');
        setIsCorrect(false);
        setQuestionCompleted(true); // Mark question as completed
        setHasSubmitted(true);
      } else {
        // First wrong attempt - allow retry
        setFeedback('Try again...');
        setIsCorrect(false);
        setSelectedOption(null); // Clear selection for retry
        // Don't set hasSubmitted to true - allow another attempt
      }
    }
    
    // Un-hide side chat when answer is submitted (only when question is completed)
    // if (questionCompleted || isAnswerCorrect || newAttemptCount >= 2 || autoSubmitted) {
    //   setChatHidden(false);
    // }
  };

  const handleNext = () => {
    playSound('click');
    // setChatHistory(h => [...h, { question: currentIndex, messages: sideChatMessages }]);
    // setSideChatMessages([]);
    // setSideChatInput('');
    // setShowHistory(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      setIsCorrect(null);
      // Reset Show Correct Answers state for new question
      setWrongChoices([]);
      setAttemptCount(0);
      setQuestionCompleted(false);
      // setChatHidden(true);
      setShowReviewConcept(false); // Reset review concept for new question
      // Reset timer state for new question
      setTimerPaused(false);
      setPausedTimeRemaining(null);
    } else {
      setQuizEndTime(Date.now());
      saveQuizProgress();
      setShowResultsScreen(true);
    }
  };

   const handleOptionSelect = (index: number) => {
    // Don't allow selection if question is completed or if this option was already chosen incorrectly
    if (questionCompleted || wrongChoices.includes(index)) {
      return;
    }

    if (!hasSubmitted || (!questionCompleted && showAnswersEnabled)) {
      setSelectedOption(index);
      playSound('click');
    }
  };

  // const handleSideChatSubmit = async () => {
  //   const text = sideChatInput.trim();
  //   if (!text) return;
  //   const userMsg: ChatMessage = { role: 'user', content: text };
  //   const newMessages = [...sideChatMessages, userMsg];
  //   setSideChatMessages(newMessages);
  //   setSideChatInput('');

  //   try {
  //     const res = await axios.post(
  //       `${backendUrl}/chat_about_text`,
  //       { highlighted_text: '', messages: newMessages },
  //       { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
  //     );
  //     const reply = res.data.assistant_reply || 'No response from AI.';
  //     setSideChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
  //   } catch (err) {
  //     console.error('Chat error:', err);
  //   }
  // };

  // const handleDiscussQuestion = async () => {
  //   if (!hasSubmitted || selectedOption === null) return;
  //   const q = questions[currentIndex];
  //   const userAns = q.options[selectedOption];
  //   const correctAns = q.options[q.correctAnswer];
  //   const basePrompt = `Question: "${q.question}"\n`;
  //   const prompt =
  //     selectedOption === q.correctAnswer
  //       ? basePrompt + `I answered "${userAns}" and that is correct. Please explain why this answer is correct.`
  //       : basePrompt +
  //         `I answered "${userAns}" but the correct answer is "${correctAns}". Please explain why my answer is incorrect and why the correct answer is correct.`;

  //   const initial: ChatMessage = { role: 'user', content: prompt };
  //   setSideChatMessages([initial]);
  //   setChatHidden(false);

  //   try {
  //     const res = await axios.post(
  //       `${backendUrl}/chat_about_text`,
  //       { highlighted_text: '', messages: [initial] },
  //       { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
  //     );
  //     const reply = res.data.assistant_reply || 'No response from AI.';
  //     setSideChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
  //   } catch (err) {
  //     console.error('Discuss error:', err);
  //   }
  // };

  // Exit modal handlers
  const handleBackButtonClick = () => {
    setShowExitModal(true);
  };

  const handleCloseExitModal = () => {
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onExit();
  };

  const handleModalOverlayClick = (event: React.MouseEvent) => {
    // Only close if clicking on the overlay itself, not the modal content
    if (event.target === event.currentTarget) {
      setShowExitModal(false);
    }
  };

  // Feedback modal handler
  const handleLeaveFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  // Settings handlers
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    if (enabled) playSound('click', true);
  };

  const handleShowAnswersToggle = (enabled: boolean) => {
    setShowAnswersEnabled(enabled);
    playSound('click');
  };

  const handleTimeModeToggle = (enabled: boolean) => {
    setTimeModeEnabled(enabled);
    playSound('click');
    if (enabled && !hasSubmitted) {
      // When re-enabling timer mode, start fresh if we don't have paused time
      if (!timerPaused && pausedTimeRemaining === null) {
        setQuestionStartTime(Date.now());
        setTimeRemaining(timeLimit);
      }
    } else if (!enabled) {
      // When disabling timer mode, clear any pause state
      setTimerPaused(false);
      setPausedTimeRemaining(null);
    }
  };

  // Update dropdown position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showSettingsDropdown && settingsButtonRef.current) {
        const rect = settingsButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          x: rect.left + rect.width / 2, // Center horizontally on the button
          y: rect.bottom + 8 // 8px below the button
        });
      }
    };

    if (showSettingsDropdown) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showSettingsDropdown]);

  // Also update the toggleSettingsDropdown function to use a common position calculation
  const calculateDropdownPosition = () => {
    if (settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8
      };
    }
    return { x: 0, y: 0 };
  };

  const toggleSettingsDropdown = (_event: React.MouseEvent) => {
    if (!showSettingsDropdown) {
      setDropdownPosition(calculateDropdownPosition());
    }
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleSettingToggle = (type: 'sound' | 'answers' | 'time', currentValue: boolean) => {
    const newValue = !currentValue;
    
    switch (type) {
      case 'sound':
        handleSoundToggle(newValue);
        break;
      case 'answers':
        handleShowAnswersToggle(newValue);
        break;
      case 'time':
        handleTimeModeToggle(newValue);
        break;
    }
  };

  // Footer handlers
  const handleSkip = () => {
    playSound('click');
    // Skip means we don't submit an answer, just move to next question
    // setChatHistory(h => [...h, { question: currentIndex, messages: sideChatMessages }]);
    // setSideChatMessages([]);
    // setSideChatInput('');
    // setShowHistory(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      // Reset Show Correct Answers state for new question
      setWrongChoices([]);
      setAttemptCount(0);
      setQuestionCompleted(false);
      // setChatHidden(true);
      setShowReviewConcept(false); // Reset review concept for new question
      // Reset timer state for new question
      setTimerPaused(false);
      setPausedTimeRemaining(null);
    } else {
      // Final question
      setHasSubmitted(true);
      setQuizEndTime(Date.now());
      saveQuizProgress();
      setShowResultsScreen(true);
    }
  };

  // Review concept handlers
  const handleReviewConcept = () => {
    playSound('click');
    setShowReviewConcept(true);
  };

  const handleCloseReviewConcept = () => {
    playSound('click');
    setShowReviewConcept(false);
  };

  // Get relevant lesson content for current question
  const getRelevantLessonContent = () => {
    if (!lessonContent || !questions[currentIndex]) return null;
    
    const currentQuestion = questions[currentIndex] as QuestionWithLesson;
    const indices = currentQuestion.lessonContentIndices;
    
    if (!indices || indices.length === 0) {
      // Default: show first few paragraphs if no specific indices
      return {
        title: lessonContent.title,
        paragraphs: lessonContent.paragraphs.slice(0, 3)
      };
    }
    
    // Return paragraphs at specified indices
    const relevantParagraphs = indices
      .filter(index => index < lessonContent.paragraphs.length)
      .map(index => lessonContent.paragraphs[index]);
    
    return {
      title: lessonContent.title,
      paragraphs: relevantParagraphs
    };
  };

  const handleContinue = () => {
    if (questionCompleted) {
      // If question is completed (correct answer or max attempts), this acts like "Next"
      handleNext();
    } else {
      // If not submitted, this acts like "Submit"
      handleSubmitAnswer();
    }
  };

  // Calculate quiz completion time
  const getQuizDuration = () => {
    if (!quizEndTime) return null;
    const durationMs = quizEndTime - quizStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return { minutes, seconds };
  };

  // Footer timer calculations
  const circumference = 2 * Math.PI * 12; // radius = 12
  const strokeDashoffset = circumference * (1 - (timeRemaining / timeLimit));

  // Determine timer color based on remaining time
  const getTimerColor = () => {
    if (!timeModeEnabled) return '#FFFFFF';
    const percentage = timeRemaining / timeLimit;
    if (percentage > 0.5) return '#FFFFFF'; // White
    if (percentage > 0.25) return '#FFA500'; // Orange
    return '#FF4444'; // Red
  };

  const canContinue = selectedOption !== null && (!showAnswersEnabled || !questionCompleted);

  // Results screen component
  const ResultsScreen = () => {
    const percent = Math.round((score / questions.length) * 100);
    const duration = getQuizDuration();
    const circumferenceResults = 2 * Math.PI * 25; // radius = 25
    const rotation = -90 + (360 - (percent * 3.6)) / 2; // Center the gap at the top
    const strokeDashoffsetResults = circumferenceResults * (1 - (percent / 100));

    return (
      <div style={styles.resultsContainer}>
        <h1 style={styles.resultsTitle}>Lesson complete!</h1>
        
        <div style={styles.resultsContent}>
          {/* Accuracy Circle */}
          <div style={styles.accuracySection}>
            <div style={styles.accuracyCircle}>
              <svg width="70" height="70" style={styles.accuracySvg}>
                {/* Background circle */}
                <circle
                  cx="35"
                  cy="35"
                  r="25"
                  fill="none"
                  stroke="#424E62"
                  strokeWidth="4.8"
                />
                {/* Progress circle */}
                <circle
                  cx="35"
                  cy="35"
                  r="25"
                  fill="none"
                  stroke="#92B03C"
                  strokeWidth="4.8"
                  strokeDasharray={circumferenceResults}
                  strokeDashoffset={strokeDashoffsetResults}
                  strokeLinecap="round"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: '35px 35px',
                    '--final-offset': strokeDashoffsetResults,
                    '--final-rotation': `${rotation}deg`,
                    animation: 'fillFromBottom 1s ease-out forwards'
                  } as React.CSSProperties}
                />
              </svg>
              <div style={styles.percentageText}>{percent}%</div>
            </div>
            <p style={styles.accuracyLabel}>Accuracy</p>
          </div>

          {/* Time Section */}
          <div style={styles.timeSection}>
            <div style={styles.timeDisplay}>
              {duration && (
                <>
                  <span style={styles.timeNumber}>
                    {duration.minutes}:{duration.seconds.toString().padStart(2, '0')}
                  </span>
                </>
              )}
            </div>
            <p style={styles.timeLabel}>Minutes</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {showResultsScreen ? (
        <div style={styles.resultsScreenContainer}>
          <ResultsScreen />
        </div>
      ) : (
        <>
          <div style={styles.topBar}>
            <button 
              ref={settingsButtonRef}
              onClick={toggleSettingsDropdown} 
              style={styles.dotsButton}
            >
              <BsThreeDots size={24} color={'#424E62'} />
            </button>
            
            <QuizProgressBar
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              isLastQuestion={currentIndex === questions.length - 1}
              hasSubmittedLastAnswer={hasSubmitted && currentIndex === questions.length - 1}
              style={styles.progressBar}
              fillColor="#7BA8ED"
              animationDuration={600}
            />

            <button onClick={progressSaved ? onExit : handleBackButtonClick} style={styles.backButton}>
              <IoCloseOutline size={24} color={'#424E62'} />
            </button>
          </div>

          {/* Exit Confirmation Modal */}
          {showExitModal && (
            <div style={styles.modalOverlay} onClick={handleModalOverlayClick}>
              <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>Exit Quiz?</h2>
                  <button onClick={handleCloseExitModal} style={styles.closeButton}>
                    <IoMdClose size={24} color="#FFFFFF" />
                  </button>
                </div>
                <p style={styles.modalSubtext}>
                  Leaving now will reset your progress. You'll start fresh next time.
                </p>
                <div style={styles.modalButtons}>
                  <button 
                    onClick={handleCloseExitModal}
                    style={styles.goBackButton}
                  >
                    Go back
                  </button>
                  <button 
                    onClick={handleConfirmExit}
                    style={styles.exitQuizButton}
                  >
                    Exit quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSettingsDropdown && (
            <div
              ref={settingsDropdownRef}
              style={{
                ...styles.settingsDropdown,
                position: 'fixed',
                left: dropdownPosition.x - 30, // Align the 250px wide dropdown
                top: dropdownPosition.y,
                right: 'auto',
              }}
            >
              {/* Sound Effects Option */}
              <div 
                style={styles.settingsOption}
                onClick={() => handleSettingToggle('sound', soundEnabled)}
              >
                <div style={styles.optionLeft}>
                  <span style={styles.optionText}>Sound effects</span>
                </div>
                <div style={styles.toggle}>
                  <div style={{
                    ...styles.toggleTrack,
                    backgroundColor: soundEnabled ? '#7BA8ED' : '#424E62'
                  }}>
                    <div style={{
                      ...styles.toggleThumb,
                      transform: soundEnabled ? 'translateX(16px)' : 'translateX(2px)'
                    }} />
                  </div>
                </div>
              </div>

              {/* Show Correct Answers Option */}
              <div 
                style={styles.settingsOption}
                onClick={() => handleSettingToggle('answers', showAnswersEnabled)}
              >
                <div style={styles.optionLeft}>
                  <span style={styles.optionText}>Show correct answers</span>
                </div>
                <div style={styles.toggle}>
                  <div style={{
                    ...styles.toggleTrack,
                    backgroundColor: showAnswersEnabled ? '#7BA8ED' : '#424E62'
                  }}>
                    <div style={{
                      ...styles.toggleThumb,
                      transform: showAnswersEnabled ? 'translateX(16px)' : 'translateX(2px)'
                    }} />
                  </div>
                </div>
              </div>

              {/* Time Mode Option */}
              <div 
                style={styles.settingsOption}
                onClick={() => handleSettingToggle('time', timeModeEnabled)}
              >
                <div style={styles.optionLeft}>
                  <span style={styles.optionText}>Time mode</span>
                </div>
                <div style={styles.toggle}>
                  <div style={{
                    ...styles.toggleTrack,
                    backgroundColor: timeModeEnabled ? '#7BA8ED' : '#424E62'
                  }}>
                    <div style={{
                      ...styles.toggleThumb,
                      transform: timeModeEnabled ? 'translateX(16px)' : 'translateX(2px)'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={styles.quizPane}>
            {showReviewConcept ? (
              // Review Concept Content Display
              <div style={styles.reviewConceptContainer}>
                <div style={styles.reviewConceptContent}>
                  {(() => {
                    const content = getRelevantLessonContent();
                    if (!content) return <p>No lesson content available.</p>;
                    
                    return (
                      <>
                        <h2 style={styles.reviewConceptTitle}>{content.title}</h2>
                        <div style={styles.reviewConceptParagraphs}>
                          {content.paragraphs.map((paragraph, index) => (
                            <p key={index} style={styles.reviewConceptParagraph}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        <div style={styles.revisitLessonContainer}>
                          <span 
                            onClick={progressSaved ? onExit : handleBackButtonClick}
                            className="revisit-lesson-link"
                            style={styles.revisitLessonLink}
                          >
                            Revisit full lesson
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <>
                <Questions
                  currentIndex={currentIndex}
                  question={questions[currentIndex]}
                  selectedOption={selectedOption}
                  hasSubmitted={hasSubmitted}
                  feedback={feedback}
                  onSelectOption={handleOptionSelect}
                  wrongChoices={wrongChoices}
                  questionCompleted={questionCompleted}
                  showAnswersEnabled={showAnswersEnabled}
                  // onSubmitAnswer={handleSubmitAnswer}
                  // onDiscussQuestion={handleDiscussQuestion}
                  // onNext={handleNext}
                  // isLastQuestion={currentIndex === questions.length - 1}
                  questionStyles={styles.questionStyles}
                  optionStyles={styles.optionStyles}
                />
              </>
            )}
          </div>
        </>
      )}

      <div style={{
        ...styles.bottomBar,
        backgroundColor: !showResultsScreen && hasSubmitted ? '#1A2540' : 'transparent'
      }}>
        <div style={styles.footer}>
          {/* Left side - Timer, Result Icon, or Leave Feedback */}
          <div style={styles.timerSection}>
            {showResultsScreen ? (
              // Show Leave Feedback button on results screen
              <button
                className="quiz-bottom-buttons"
                onClick={handleLeaveFeedbackClick}
                style={styles.leaveFeedbackButton}
              >
                <MdOutlineThumbsUpDown size={17} color="#9D9D9D" />
                <span style={styles.leaveFeedbackText}>Leave Feedback</span>
              </button>
            ) : questionCompleted && showAnswersEnabled ? (
              // Show result icon when submitted
              <div style={styles.resultIconContainer}>
                <svg width="60" height="60" style={styles.resultSvg}>
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill='#03123A'
                    stroke={isCorrect ? '#407440' : '#03123A'}
                    strokeWidth="3"
                  />
                  {isCorrect ? (
                    // Larger Green checkmark - centered in circle
                    <path
                      d="M18 30 L26 38 L42 22"
                      stroke="#407440"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    // Larger Red X - centered in circle
                    <g stroke="#C61325" strokeWidth="5" strokeLinecap="round">
                      <path d="M20 20 L40 40" />
                      <path d="M40 20 L20 40" />
                    </g>
                  )}
                </svg>
              </div>
            ) : (
            timeModeEnabled && (
              <div style={styles.timerContainer}>
                <svg width="40" height="40" style={styles.timerSvg}>
                  <defs>
                    {/* Define a mask that drains the timer */}
                    <mask id="timer-mask">
                      <rect width="40" height="40" fill="black" />
                      <circle
                        cx="20"
                        cy="20"
                        r="12"
                        fill="none"
                        stroke="white"
                        strokeWidth="24"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transform: 'rotate(90deg) scaleX(-1)',
                          transformOrigin: '20px 20px',
                          transition: 'stroke-dashoffset 0.1s ease-out'
                        }}
                      />
                    </mask>
                  </defs>
                  
                  {/* Outer ring */}
                  <circle
                    cx="20"
                    cy="20"
                    r="17"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                  />
                  {/* Inner progress circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="12"
                    fill={getTimerColor()}
                    mask="url(#timer-mask)"
                    style={{
                      transition: 'fill 0.3s ease'
                    }}
                  />
                </svg>
              </div>
              )
            )}
          </div>

          {/* Right side - Action buttons */}
          <div style={styles.actionsSection}>
            <button
              className="quiz-bottom-buttons"
              onClick={showResultsScreen ? onExit : 
                      ((!questionCompleted && showAnswersEnabled) || (!showAnswersEnabled && !showResultsScreen)) ? handleSkip : 
                      (showReviewConcept ? handleCloseReviewConcept : handleReviewConcept)}
              style={styles.actionButton}
            >
              {showResultsScreen ? 'REVIEW LESSON' : 
              ((!questionCompleted && showAnswersEnabled) || (!showAnswersEnabled && !showResultsScreen)) ? 'SKIP' : 
              (showReviewConcept ? 'CLOSE CONCEPT' : 'REVIEW CONCEPT')}
            </button>
            
            <button
              className={`quiz-bottom-buttons ${showResultsScreen ? 'results-continue' : ''}`}
              onClick={showResultsScreen ? onExit : handleContinue}
              disabled={!canContinue && !questionCompleted}
              style={{
                ...styles.continueButton,
                opacity: (!canContinue && !questionCompleted) ? 0.5 : 1,
                cursor: (!canContinue && !questionCompleted) ? 'not-allowed' : 'pointer',
                color: showResultsScreen ? '#0D103F' : (canContinue || questionCompleted ? '#FFFFFF' : '#AAABAF'),
                backgroundColor: showResultsScreen
                  ? '#3B6BBB'
                  : (!showAnswersEnabled 
                  ? (canContinue ? '#142748' : '#2A3A52')
                  : (questionCompleted 
                  ? (isCorrect ? '#406440' : '#A20F1D')
                  : (canContinue ? '#142748' : '#2A3A52'))),
              }}
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>

      {/* SideChat only appears after submitting an answer */}
      {/* {!showResultsPopup && !chatHidden && hasSubmitted && (
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
          // style={styles.sideChatOverlay}
        />
      )} */}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        initialCategory="Quizzes"
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    position: 'relative',
    background: '#030E29',
    color: '#FFFFFF',
    overflow: 'hidden',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '70%',
    maxWidth: '1350px',
    zIndex: 10,
    marginTop: '3rem',
    marginBottom: '4rem',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    zIndex: 10,
  },
  progressBar: {
    width: '90%',
    height: 10,
    backgroundColor: '#424E62',
    borderRadius: 6,
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    marginRight: '2.5rem',
  },
  dotsButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    zIndex: 10,
    marginRight: '2.5rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#182549',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '440px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    position: 'relative',
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    margin: 0,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: -28,
    top: -28,
  },
  modalSubtext: {
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: '0 0 32px 0',
    lineHeight: '1.5',
  },
  modalButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  goBackButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
  exitQuizButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#3D4C65',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
  quizPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '60px 40px 40px',
    boxSizing: 'border-box',
    width: '62%',
    maxWidth: '1195px',
    margin: '0 auto',
  },
  questionStyles: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '28px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '.02em',
    color: '#FFFFFF',
    textAlign: 'left' as const,
    maxWidth: '1195px',
    width: '100%',
    margin: '0 auto 5.5rem auto' ,
  },
  optionStyles: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '18px',
    fontWeight: 'normal',
    lineHeight: '1.4',
    color: '#AAAAC1',
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
  settingsDropdown: {
    backgroundColor: '#1a2332',
    border: '1px solid #424E62',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    padding: '12px',
    minWidth: '250px',
    zIndex: 1000,
  },
  settingsOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2px 2px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
    marginBottom: '4px',
  },
  optionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  optionText: {
    color: '#7A7C92',
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
  },
  toggleTrack: {
    width: '32px',
    height: '16px',
    borderRadius: '8px',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  },
  toggleThumb: {
    width: '12px',
    height: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    transition: 'transform 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    zIndex: 10,
    borderTop: '1px solid rgba(66, 78, 98, 0.3)',
    marginTop: 'auto',
    transition: 'background-color 0.15s ease',
  },
  resultIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
  },
  resultSvg: {
    // filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '65%',
    maxWidth: '1350px',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  timerSection: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '60px',
    height: '60px',
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSvg: {
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  leaveFeedbackButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 36px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#9D9D9D',
    backgroundColor: 'transparent',
    border: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px',
    height: 'auto',
  },
  leaveFeedbackText: {
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#9D9D9D',
    lineHeight: 1,
  },
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  actionButton: {
    padding: '12px 42px',
    fontSize: '22px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#AAABAF',
    backgroundColor: 'transparent',
    border: 'transparent',
    // border: '2px solid #424E62',
    // borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px',
  },
  reviewConceptContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  reviewConceptTitle: {
    // fontSize: '24px',
    // fontWeight: '600',
    // fontFamily: "'Inter', sans-serif",
    // color: '#FFFFFF',
    // marginBottom: '20px',
  },
  reviewConceptContent: {
    fontSize: '20px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    flex: 1,
    overflowY: 'auto',
    padding: '0 20px',
    scrollBehavior: 'smooth',
  },
  reviewConceptParagraphs: {
    marginBottom: '30px',
  },
  reviewConceptParagraph: {
    fontSize: '18px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  revisitLessonContainer: {
    marginTop: '30px',
    textAlign: 'left' as const,
  },
  revisitLessonLink: {
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#AFAFAF',
    textDecoration: 'underline',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    lineHeight: '1.4',
  },
  continueButton: {
    padding: '12px 42px',
    fontSize: '22px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    // color: '#FFFFFF',
    border: 'none',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    minWidth: '100px',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '40px',
    marginTop: '50%',
  },
  resultsTitle: {
    fontSize: '36px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    marginBottom: '50px',
    textAlign: 'center',
  },
  resultsContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '80px',
    marginBottom: '60px',
  },
  accuracySection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  accuracyCircle: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0',
  },
  accuracySvg: {
    // transform: 'rotate(-90deg)',
  },
  percentageText: {
    position: 'absolute',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  accuracyLabel: {
    fontSize: '18px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: 0,
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2%',
    marginBottom: '-2%',
    height: '70px',
  },
  timeNumber: {
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: '18px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: 0,
  },
  sideChatOverlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '400px',
    zIndex: 1000,
    pointerEvents: 'auto',
  },
};

// Add hover effects
const addHoverStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .quiz-bottom-buttons:hover:not(:disabled) {
      opacity: 0.9 !important;
      transition: opacity 0.2s ease;
    }

    .revisit-lesson-link:hover:not(:disabled) {
      opacity: 0.9 !important;
      transition: opacity 0.2s ease;
    }
    
    @keyframes fillFromBottom {
      0% {
        stroke-dashoffset: ${2 * Math.PI * 25}; /* Full circumference - starts empty */
        transform: rotate(90deg); /* Start from bottom */
      }
      100% {
        stroke-dashoffset: var(--final-offset); /* Final calculated offset */
        transform: rotate(var(--final-rotation)); /* Final rotation for symmetry */
      }
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addHoverStyles();
}

export default Quiz;
