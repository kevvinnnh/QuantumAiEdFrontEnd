import React from 'react';
import { styles } from './QuizStyles';

interface QuizResultsScreenProps {
  score: number;
  totalQuestions: number;
  durationMinutes: number | null;
  durationSeconds: number | null;
}

const QuizResultsScreen: React.FC<QuizResultsScreenProps> = ({
  score,
  totalQuestions,
  durationMinutes,
  durationSeconds,
}) => {
  const percent = Math.round((score / totalQuestions) * 100);
  const circumferenceResults = 2 * Math.PI * 25;
  const rotation = -90 + (360 - (percent * 3.6)) / 2;
  const strokeDashoffsetResults = circumferenceResults * (1 - (percent / 100));

  const progressCircleStyle: React.CSSProperties & Record<string, unknown> = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: '35px 35px',
    '--final-offset': strokeDashoffsetResults,
    '--final-rotation': `${rotation}deg`,
    animation: 'fillFromBottom 1s ease-out forwards',
  };

  return (
    <div style={styles.resultsContainer}>
      <h1 style={styles.resultsTitle}>Lesson complete!</h1>

      <div style={styles.resultsContent}>
        {/* Accuracy Circle */}
        <div style={styles.accuracySection}>
          <div style={styles.accuracyCircle}>
            <svg width="70" height="70" style={styles.accuracySvg}>
              <circle
                cx="35"
                cy="35"
                r="25"
                fill="none"
                stroke="#424E62"
                strokeWidth="4.8"
              />
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
                style={progressCircleStyle}
              />
            </svg>
            <div style={styles.percentageText}>{percent}%</div>
          </div>
          <p style={styles.accuracyLabel}>Accuracy</p>
        </div>

        {/* Time Section */}
        <div style={styles.timeSection}>
          <div style={styles.timeDisplay}>
            {durationMinutes !== null && durationSeconds !== null && (
              <span style={styles.timeNumber}>
                {durationMinutes}:{durationSeconds.toString().padStart(2, '0')}
              </span>
            )}
          </div>
          <p style={styles.timeLabel}>Minutes</p>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsScreen;
