// src/components/Quiz.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import type { Question, QuestionWithLesson } from '@/types/quiz';
import type { LessonContent } from '@/types/lesson';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useQuizSettings } from '@/hooks/useQuizSettings';
import { useQuizTimer } from '@/hooks/useQuizTimer';
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

const TIME_LIMIT = 30;

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onExit, courseId, lessonContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizStartTime] = useState<number>(Date.now());
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);

  // Show Correct Answers functionality state
  const [wrongChoices, setWrongChoices] = useState<number[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [questionCompleted, setQuestionCompleted] = useState(false);

  // Review concept state
  const [showReviewConcept, setShowReviewConcept] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const exitModalRef = useRef<HTMLDivElement>(null);
  const quizContainerRef = useRef<HTMLDivElement>(null);

  /* ---------- settings (sound, show answers, time mode, dropdown) ---------- */
  const settings = useQuizSettings();

  /* ---------- per-question countdown timer -------------------------------- */
  const { timeRemaining } = useQuizTimer({
    enabled: settings.timeModeEnabled,
    duration: TIME_LIMIT,
    isPaused: showExitModal,
    hasSubmitted,
    showResults: showResultsScreen,
    questionIndex: currentIndex,
    onTimeUp: () => handleSubmitAnswer(true),
  });

  // Save quiz progress to backend when final question is completed
  const saveQuizProgress = async () => {
    if (progressSaved) return;

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
      setProgressSaved(true);
    } catch (error) {
      console.error('Failed to save quiz result:', error);
    }
  };

  const handleSubmitAnswer = (autoSubmitted = false) => {
    if (questionCompleted) return;
    if (!autoSubmitted && selectedOption === null) return;

    const correctIdx = questions[currentIndex].correctAnswer;
    const isAnswerCorrect = selectedOption === correctIdx;

    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    if (!settings.showAnswersEnabled) {
      if (isAnswerCorrect) {
        setScore(s => s + 1);
      }
      handleNext();
      return;
    }

    if (isAnswerCorrect) {
      if (newAttemptCount === 1) {
        setScore(s => s + 1);
      }
      setFeedback('Correct!');
      setIsCorrect(true);
      setQuestionCompleted(true);
      setHasSubmitted(true);
      settings.playSound('correct');
    } else {
      if (selectedOption !== null) {
        setWrongChoices(prev => [...prev, selectedOption]);
      }

      settings.playSound(autoSubmitted ? 'timeUp' : 'incorrect');

      if (newAttemptCount >= 2 || autoSubmitted) {
        setFeedback(autoSubmitted ? 'Time\'s up! Incorrect...' : 'Incorrect...');
        setIsCorrect(false);
        setQuestionCompleted(true);
        setHasSubmitted(true);
      } else {
        setFeedback('Try again...');
        setIsCorrect(false);
        setSelectedOption(null);
      }
    }
  };

  const handleNext = () => {
    settings.playSound('click');

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
    } else {
      setQuizEndTime(Date.now());
      void saveQuizProgress();
      setShowResultsScreen(true);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (questionCompleted || wrongChoices.includes(index)) {
      return;
    }
    setSelectedOption(index);
    settings.playSound('click');
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

    const focusFirst = () => {
      const focusableEls = containerEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]):not([tabindex="-1"]), select, textarea, [tabindex="0"]'
      );
      if (focusableEls.length > 0) {
        focusableEls[0].focus();
      }
    };

    const timerId = setTimeout(focusFirst, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
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

  const handleLeaveFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  const handleSkip = () => {
    settings.playSound('click');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setFeedback('');
      setWrongChoices([]);
      setAttemptCount(0);
      setQuestionCompleted(false);
      setShowReviewConcept(false);
    } else {
      setHasSubmitted(true);
      setQuizEndTime(Date.now());
      void saveQuizProgress();
      setShowResultsScreen(true);
    }
  };

  // Review concept handlers
  const handleReviewConcept = () => {
    settings.playSound('click');
    setShowReviewConcept(true);
  };

  const handleCloseReviewConcept = () => {
    settings.playSound('click');
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
      return {
        title: lessonContent.title,
        paragraphs: lessonContent.paragraphs.slice(0, 3)
      };
    }

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
      const pct = Math.round((score / questions.length) * 100);
      onComplete(score, pct >= 70);
    } else if (questionCompleted) {
      handleNext();
    } else {
      handleSubmitAnswer();
    }
  };

  const getQuizDuration = () => {
    if (!quizEndTime) return null;
    const durationMs = quizEndTime - quizStartTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return { minutes, seconds };
  };

  // Footer timer calculations
  const circumference = 2 * Math.PI * 12;
  const strokeDashoffset = circumference * (1 - (timeRemaining / TIME_LIMIT));

  const getTimerColor = () => {
    if (!settings.timeModeEnabled) return '#FFFFFF';
    const percentage = timeRemaining / TIME_LIMIT;
    if (percentage > 0.5) return '#FFFFFF';
    if (percentage > 0.25) return '#FFA500';
    return '#FF4444';
  };

  const canContinue = selectedOption !== null && (!settings.showAnswersEnabled || !questionCompleted);
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
              ref={settings.settingsButtonRef}
              onClick={settings.toggleSettingsDropdown}
              style={styles.dotsButton}
              aria-label="Quiz settings"
              aria-expanded={settings.showSettingsDropdown}
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

          {settings.showSettingsDropdown && (
            <QuizSettingsDropdown
              dropdownRef={settings.settingsDropdownRef}
              position={settings.dropdownPosition}
              settings={[
                { label: 'Sound effects', key: 'sound', enabled: settings.soundEnabled },
                { label: 'Show correct answers', key: 'answers', enabled: settings.showAnswersEnabled },
                { label: 'Time mode', key: 'time', enabled: settings.timeModeEnabled },
              ]}
              onToggle={settings.handleSettingToggle}
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
                  showAnswersEnabled={settings.showAnswersEnabled}
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
        showAnswersEnabled={settings.showAnswersEnabled}
        isCorrect={isCorrect}
        canContinue={canContinue}
        showReviewConcept={showReviewConcept}
        timeModeEnabled={settings.timeModeEnabled}
        timeRemaining={timeRemaining}
        timeLimit={TIME_LIMIT}
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
