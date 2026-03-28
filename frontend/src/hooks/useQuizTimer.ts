import { useEffect, useRef, useState } from 'react';

interface UseQuizTimerOptions {
  enabled: boolean;
  duration: number;
  isPaused: boolean;
  hasSubmitted: boolean;
  showResults: boolean;
  questionIndex: number;
  onTimeUp: () => void;
}

interface UseQuizTimerReturn {
  timeRemaining: number;
  questionStartTime: number;
}

/**
 * Manages a per-question countdown timer for the quiz.
 * Pauses when `isPaused` is true (e.g. exit modal open), resumes with remaining time.
 * Calls `onTimeUp` when time reaches zero.
 */
export function useQuizTimer({
  enabled,
  duration,
  isPaused,
  hasSubmitted,
  showResults,
  questionIndex,
  onTimeUp,
}: UseQuizTimerOptions): UseQuizTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const pausedRemainingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || hasSubmitted || showResults) return;

    if (isPaused) {
      pausedRemainingRef.current = timeRemaining;
      return;
    }

    const startTime = Date.now();
    const initialRemaining = pausedRemainingRef.current ?? duration;
    pausedRemainingRef.current = null;

    setQuestionStartTime(startTime);
    setTimeRemaining(initialRemaining);

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, initialRemaining - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 16);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, enabled, hasSubmitted, showResults, duration, isPaused]);

  return { timeRemaining, questionStartTime };
}
