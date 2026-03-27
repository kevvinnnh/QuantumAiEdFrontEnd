// src/components/Quiz.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import type { Question, QuestionWithLesson } from '@/types/quiz';
import type { LessonContent } from '@/types/lesson';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import Questions from './Questions';
import QuizProgressBar from '../common/QuizProgressBar';
import FeedbackModal from '../common/FeedbackModal';
import { styles } from './QuizStyles';
import QuizResultsScreen from './QuizResultsScreen';
import ExitConfirmModal from './ExitConfirmModal';
import QuizSettingsDropdown from './QuizSettingsDropdown';
import QuizFooter from './QuizFooter';
import api from '@/api';

interface QuizProps {
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  onExit: () => void;
  courseId: number;
  lessonContent?: LessonContent;
}

function isQuestionWithLesson(q: Question): q is QuestionWithLesson {
  return 'lessonContentIndices' in q;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onExit, courseId, lessonContent }) => {
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
  const exitModalRef = useRef<HTMLDivElement>(null);
  const quizContainerRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useClickOutside(
    [settingsDropdownRef, settingsButtonRef],
    () => setShowSettingsDropdown(false),
    showSettingsDropdown,
  );

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
        console.log('Calling handleSubmitAnswer(true)');
        handleSubmitAnswer(true);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [currentIndex, timeModeEnabled, hasSubmitted, showResultsScreen, timeLimit, showExitModal]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Sound effect functions
  const playSound = (type: 'correct' | 'incorrect' | 'click' | 'timeUp', forcePlay = false) => {
    if (!soundEnabled && !forcePlay) return;
    
    // Create audio context and play synthesized sounds
    const audioContext = new window.AudioContext();
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
      const response = await api.post('/save_quiz_result', quizResultData);
      console.log("Quiz result saved successfully:", response.data);
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
    if (!autoSubmitted && selectedOption === null) return;
    
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
  };

  const handleNext = () => {
    playSound('click');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      setIsCorrect(null);
      setWrongChoices([]);
      setAttemptCount(0);
      setQuestionCompleted(false);
      setShowReviewConcept(false);
      // Reset timer state for new question
      setTimerPaused(false);
      setPausedTimeRemaining(null);
    } else {
      setQuizEndTime(Date.now());
      void saveQuizProgress();
      setShowResultsScreen(true);
    }
  };

   const handleOptionSelect = (index: number) => {
    // Don't allow selection if question is completed or if this option was already chosen incorrectly
    if (questionCompleted || wrongChoices.includes(index)) {
      return;
    }

    setSelectedOption(index);
    playSound('click');
  };


  // Exit modal handlers
  const handleBackButtonClick = () => {
    setShowExitModal(true);
  };

  const handleCloseExitModal = useCallback(() => {
    setShowExitModal(false);
  }, []);

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

  // Exit modal focus trap & Escape key
  useFocusTrap(exitModalRef, showExitModal, handleCloseExitModal);

  // Quiz-level focus trap: keep Tab within the quiz container
  useEffect(() => {
    const containerEl = quizContainerRef.current;
    if (!containerEl) return;

    // Focus the first interactive element when quiz mounts or question changes
    const focusFirst = () => {
      const focusableEls = containerEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]):not([tabindex="-1"]), select, textarea, [tabindex="0"]'
      );
      if (focusableEls.length > 0) {
        focusableEls[0].focus();
      }
    };

    // Small delay to let React render the new question's DOM
    const timerId = setTimeout(focusFirst, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      // Don't interfere if exit modal or feedback modal is open (they have their own traps)
      if (showExitModal || showFeedbackModal) return;

      const focusableEls = containerEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]):not([tabindex="-1"]), select, textarea, [tabindex="0"]'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, hasSubmitted, wrongChoices.length, showResultsScreen, showReviewConcept, showExitModal, showFeedbackModal]);

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

  const handleSkip = () => {
    playSound('click');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      setWrongChoices([]);
      setAttemptCount(0);
      setQuestionCompleted(false);
      setShowReviewConcept(false);
      // Reset timer state for new question
      setTimerPaused(false);
      setPausedTimeRemaining(null);
    } else {
      // Final question
      setHasSubmitted(true);
      setQuizEndTime(Date.now());
      void saveQuizProgress();
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
    
    const currentQuestion = questions[currentIndex];
    const indices = isQuestionWithLesson(currentQuestion)
      ? currentQuestion.lessonContentIndices
      : undefined;
    
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
    if (showResultsScreen) {
      // Results screen: finish quiz and notify parent
      const pct = Math.round((score / questions.length) * 100);
      onComplete(score, pct >= 70);
    } else if (questionCompleted) {
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
  const duration = getQuizDuration();

  return (
    <div ref={quizContainerRef} style={styles.container} role="main" aria-label="Quiz">
      {showResultsScreen ? (
        <div style={styles.resultsScreenContainer}>
          <QuizResultsScreen
            score={score}
            totalQuestions={questions.length}
            durationMinutes={duration?.minutes ?? null}
            durationSeconds={duration?.seconds ?? null}
          />
        </div>
      ) : (
        <>
          <div style={styles.topBar} role="navigation" aria-label="Quiz navigation">
            <button 
              ref={settingsButtonRef}
              onClick={toggleSettingsDropdown} 
              style={styles.dotsButton}
              aria-label="Quiz settings"
              aria-expanded={showSettingsDropdown}
              aria-haspopup="true"
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

            <button 
              onClick={progressSaved ? onExit : handleBackButtonClick} 
              style={styles.backButton}
              aria-label="Exit quiz"
            >
              <IoCloseOutline size={24} color={'#424E62'} />
            </button>
          </div>

          {/* Exit Confirmation Modal */}
          {showExitModal && (
            <ExitConfirmModal
              exitModalRef={exitModalRef}
              onClose={handleCloseExitModal}
              onConfirmExit={handleConfirmExit}
              onOverlayClick={handleModalOverlayClick}
            />
          )}

          {showSettingsDropdown && (
            <QuizSettingsDropdown
              dropdownRef={settingsDropdownRef}
              position={dropdownPosition}
              settings={[
                { label: 'Sound effects', key: 'sound', enabled: soundEnabled },
                { label: 'Show correct answers', key: 'answers', enabled: showAnswersEnabled },
                { label: 'Time mode', key: 'time', enabled: timeModeEnabled },
              ]}
              onToggle={handleSettingToggle}
            />
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
                              {typeof paragraph === 'string' ? paragraph : paragraph.text}
                            </p>
                          ))}
                        </div>
                        <div style={styles.revisitLessonContainer}>
                          <button
                            onClick={progressSaved ? onExit : handleBackButtonClick}
                            className="revisit-lesson-link"
                            style={styles.revisitLessonLink}
                            aria-label="Revisit full lesson"
                          >
                            Revisit full lesson
                          </button>
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
                  questionStyles={styles.questionStyles}
                  optionStyles={styles.optionStyles}
                />
              </>
            )}
          </div>
        </>
      )}

      <QuizFooter
        showResultsScreen={showResultsScreen}
        hasSubmitted={hasSubmitted}
        questionCompleted={questionCompleted}
        showAnswersEnabled={showAnswersEnabled}
        isCorrect={isCorrect}
        canContinue={canContinue}
        showReviewConcept={showReviewConcept}
        timeModeEnabled={timeModeEnabled}
        timeRemaining={timeRemaining}
        timeLimit={timeLimit}
        circumference={circumference}
        strokeDashoffset={strokeDashoffset}
        getTimerColor={getTimerColor}
        onLeaveFeedback={handleLeaveFeedbackClick}
        onSkip={handleSkip}
        onReviewConcept={handleReviewConcept}
        onCloseReviewConcept={handleCloseReviewConcept}
        onContinue={handleContinue}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        key={showFeedbackModal ? 'open' : 'closed'}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        initialCategory="Quizzes"
      />
    </div>
  );
};

export default Quiz;
