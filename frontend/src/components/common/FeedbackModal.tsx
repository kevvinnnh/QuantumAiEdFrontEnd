// src/components/FeedbackModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdArrowBackIos } from 'react-icons/md';

import api from '@/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string; // For quiz modal to start at 'Quizzes'
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialCategory
}) => {
  const [currentStep, setCurrentStep] = useState<'category' | 'feedback'>(
    initialCategory ? 'feedback' : 'category'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Analogies and chat responses',
    'Lessons',
    'Quizzes',
    'Something didn\'t work as expected',
    'General thoughts or questions'
  ];

  useEffect(() => {
    if (isOpen) {
      const modalElement = modalRef.current;
      if (!modalElement) return;

      // Query all focusable elements within the modal
      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle Tab key for circular navigation
      const handleTabKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          // Shift+Tab on first element: go to last
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } 
          // Tab on last element: go to first
          else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      // Handle Escape key to close modal
      const handleEscapeKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };

      // Attach event listeners
      modalElement.addEventListener('keydown', handleTabKeyPress);
      modalElement.addEventListener('keydown', handleEscapeKeyPress);

      // Focus first element when modal opens
      firstElement.focus();

      // Cleanup: remove event listeners when modal closes
      return () => {
        modalElement.removeEventListener('keydown', handleTabKeyPress);
        modalElement.removeEventListener('keydown', handleEscapeKeyPress);
      };
    }
  }, [isOpen, currentStep]);

  const handleModalOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep('category');
    setSelectedCategory('');
    setFeedbackText('');
    setSelectedFile(null);
    onClose();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep('feedback');
  };

  const handleBack = () => {
    if (initialCategory) {
      // If opened from quiz with initial category, close entirely
      handleClose();
    } else {
      // Otherwise go back to category selection
      setCurrentStep('category');
      setSelectedCategory('');
      setFeedbackText('');
      setSelectedFile(null);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    const submit = async () => {
      try {
        if (selectedFile) {
          const formData = new FormData();
          formData.append('category', selectedCategory);
          formData.append('feedback', feedbackText);
          formData.append('screenshot', selectedFile);
          await api.post('/submit_feedback', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await api.post('/submit_feedback', { category: selectedCategory, feedback: feedbackText });
        }
        alert('Thank you for your feedback!');
        handleClose();
      } catch (err: unknown) {
        alert('An error occurred while submitting feedback.');
        console.error(err);
      }
    };
    void submit();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={handleModalOverlayClick} ref={modalRef}>
      <div style={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
        {currentStep === 'category' ? (
          // Category Selection Step
          <>
            <div style={styles.modalHeader}>
              <h2 id="feedback-modal-title" style={styles.modalTitle}>Help us improve Quantaid</h2>
              <button onClick={handleClose} style={styles.closeButton} aria-label="Close">
                <MdClose size={24} color="#FFFFFF" />
              </button>
            </div>
            
            <p style={styles.modalBody}>What would you like to give feedback on?</p>
            
            <div style={styles.categoryButtons}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  style={styles.categoryButton}
                  className="feedback-category-button"
                >
                  {category}
                </button>
              ))}
            </div>
          </>
        ) : (
          // Feedback Form Step
          <>
            <div style={styles.modalHeader}>
              <button onClick={handleBack} style={styles.backButton} aria-label="Go back to categories">
                <MdArrowBackIos size={18} color="#FFFFFF" />
              </button>
              <h2 id="feedback-modal-title" style={styles.modalTitle}>{selectedCategory}</h2>
              <button onClick={handleClose} style={styles.closeButton} aria-label="Close">
                <MdClose size={24} color="#FFFFFF" />
              </button>
            </div>
            
            <p style={styles.modalBody}>Tell us how we can improve</p>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Describe your experience here."
              style={styles.feedbackTextarea}
              className="feedback-textarea"
              aria-label="Feedback description"
            />
            
            <div style={styles.actionButtons}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.hiddenFileInput}
              />
              
              <button
                onClick={handleFileUpload}
                style={styles.screenshotButton}
                className="feedback-screenshot-button"
              >
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Add a screen shot'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!feedbackText.trim()}
                style={{
                  ...styles.submitButton,
                  opacity: feedbackText.trim() ? 1 : 0.5,
                  cursor: feedbackText.trim() ? 'pointer' : 'not-allowed'
                }}
                className="feedback-submit-button"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
    backgroundColor: '#17213A',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
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
    fontSize: '24px',
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
  backButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -28,
    top: -24,
  },
  modalBody: {
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    margin: '0 0 32px 0',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  categoryButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  categoryButton: {
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '1px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
  },
  feedbackTextarea: {
    width: '100%',
    minHeight: '120px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#9DA7B7',
    backgroundColor: '#030E29',
    border: '1px solid #353E56',
    borderRadius: '8px',
    resize: 'vertical',
    outline: 'none',
    marginBottom: '24px',
    boxSizing: 'border-box',
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hiddenFileInput: {
    display: 'none',
  },
  screenshotButton: {
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '1px solid #353E54',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: '1',
    minWidth: '150px',
  },
  submitButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#353E54',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px',
  },
};

// Add hover effects
const addFeedbackHoverStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .feedback-category-button:hover {
      background-color: rgba(66, 78, 98, 0.2) !important;
      border-color: #566591 !important;
    }
    
    .feedback-screenshot-button:hover {
      background-color: rgba(53, 62, 84, 0.3) !important;
      border-color: #566591 !important;
    }
    
    .feedback-submit-button:hover:not(:disabled) {
      background-color: #404A5F !important;
    }
    
    .feedback-textarea:focus {
      border-color: #566591 !important;
    }
    
    .feedback-textarea::placeholder {
      color: #6B7280;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addFeedbackHoverStyles();
}

export default FeedbackModal;