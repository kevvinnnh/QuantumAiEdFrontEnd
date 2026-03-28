import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { styles } from './QuizStyles';

interface ExitConfirmModalProps {
  exitModalRef: React.Ref<HTMLDivElement>;
  onClose: () => void;
  onConfirmExit: () => void;
  onOverlayClick: (e: React.MouseEvent) => void;
}

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  exitModalRef,
  onClose,
  onConfirmExit,
  onOverlayClick,
}) => {
  return (
    <div style={styles.modalOverlay} onClick={onOverlayClick}>
      <div
        ref={exitModalRef}
        style={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
      >
        <div style={styles.modalHeader}>
          <h2 id="exit-modal-title" style={styles.modalTitle}>Exit Quiz?</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Close">
            <IoMdClose size={24} color="#FFFFFF" />
          </button>
        </div>
        <p style={styles.modalSubtext}>
          Leaving now will reset your progress. You'll start fresh next time.
        </p>
        <div style={styles.modalButtons}>
          <button onClick={onClose} style={styles.goBackButton}>
            Go back
          </button>
          <button onClick={onConfirmExit} style={styles.exitQuizButton}>
            Exit quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;
