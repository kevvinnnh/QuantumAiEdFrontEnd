import React, { useState, useRef, useCallback } from 'react';
import { IoMdClose } from "react-icons/io";
import { LiaArrowLeftSolid } from "react-icons/lia";
import { useFocusTrap } from '@/hooks/useFocusTrap';
import QuizProgressBar from '../common/QuizProgressBar';
import { styles } from './ProfileCreationStyles';
import type { StepConfig, FormData, FormHandlers, CommonProps } from './profileStepConfigs';

const DefaultStep: React.FC<{
  stepConfig: StepConfig;
  formData: FormData;
  handlers: FormHandlers;
  commonProps: CommonProps;
}> = ({ stepConfig, formData, handlers, commonProps }) => {
  const { step, setStep, totalSteps, skipOnboarding, handleSubmit } = commonProps;
  const hasSelection = stepConfig.hasSelection(formData);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const skipModalRef = useRef<HTMLDivElement>(null);

  const handleContinue = () => {
    if (stepConfig.isLast) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSkipButtonClick = () => {
    setShowSkipModal(true);
  };

  const handleCloseSkipModal = useCallback(() => {
    setShowSkipModal(false);
  }, []);

  const handleConfirmSkip = () => {
    setShowSkipModal(false);
    skipOnboarding();
  };

  const handleModalOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setShowSkipModal(false);
    }
  };

  // Focus trapping + Escape key for skip modal
  useFocusTrap(skipModalRef, showSkipModal, handleCloseSkipModal);

  return (
    <div style={styles.container} role="main" aria-label="Profile creation form">
      <div style={styles.topBar} role="navigation" aria-label="Progress navigation">
        {!stepConfig.isFirst ? (
          <button
            style={styles.backArrow}
            onClick={handleBack}
            aria-label="Go back to previous step"
          >
            <LiaArrowLeftSolid size={24} color={'#FFFFFF'} />
          </button>
        ) : (
          <div style={styles.backArrowSpace} />
        )}
        <QuizProgressBar
          currentIndex={step}
          totalQuestions={totalSteps}
          style={styles.progressBar}
          fillColor="#7BA8ED"
          animationDuration={600}
        />
        <div style={styles.backArrowSpace} />
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div style={styles.modalOverlay} onClick={handleModalOverlayClick} ref={skipModalRef}>
          <div style={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="skip-modal-title">
            <div style={styles.modalHeader}>
              <h2 id="skip-modal-title" style={styles.modalTitle}>Your answers help Quantaid teach in a way that clicks for <span style={{ fontStyle: 'italic' }}>you</span>.</h2>
              <button onClick={handleCloseSkipModal} style={styles.closeModalButton} aria-label="Close">
                <IoMdClose size={24} color="#FFFFFF" />
              </button>
            </div>
            <p style={styles.modalSubtext}>
              Skipping means you'll get a more general experience for now, but you can update your preferences anytime in your profile settings.
            </p>
            <div style={styles.modalButtons}>
              <button
                className='back-button'
                onClick={handleCloseSkipModal}
                style={styles.goBackButton}
              >
                Go back
              </button>
              <button
                className='skip-button'
                onClick={handleConfirmSkip}
                style={styles.skipAnywayButton}
              >
                Skip anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.quizPane}>
        <h2 style={styles.formQuestion}>{stepConfig.title}</h2>
        {stepConfig.subtitle && (
          <p style={styles.formSubtitle}>{stepConfig.subtitle}</p>
        )}
        <div style={styles.formContent}>
          {stepConfig.renderContent(formData, handlers)}
        </div>
      </div>

      <div style={styles.bottomBar}>
        <div style={styles.footer}>
          <div style={styles.rightSection}>
            <button
              className="profile-bottom-buttons"
              onClick={handleSkipButtonClick}
              style={styles.skipButton}
              aria-label="Skip onboarding questions"
            >
              SKIP FOR NOW
            </button>
            <button
              className="profile-bottom-buttons"
              style={{
                ...styles.continueButton,
                opacity: hasSelection ? 1 : 0.5,
                cursor: hasSelection ? 'pointer' : 'not-allowed',
                backgroundColor: hasSelection ? '#142748' : '#2A3A52',
              }}
              onClick={() => hasSelection && handleContinue()}
              disabled={!hasSelection}
              aria-label={stepConfig.isLast ? 'Submit profile' : 'Continue to next step'}
              aria-disabled={!hasSelection}
            >
              {stepConfig.isLast ? 'SAVE AND CONTINUE' : 'CONTINUE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultStep;
