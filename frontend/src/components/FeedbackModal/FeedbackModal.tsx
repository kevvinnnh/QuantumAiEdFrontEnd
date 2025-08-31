// src/components/FeedbackModal/FeedbackModal.tsx

import React, { useState, useRef } from 'react';
import { MdClose, MdArrowBackIos } from 'react-icons/md';
import styles from './FeedbackModal.module.scss';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
  const [currentStep, setCurrentStep] = useState<'category' | 'feedback'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Analogies and chat responses',
    'Lessons',
    'Quizzes',
    'Something didn\'t work as expected',
    'General thoughts or questions'
  ];

  // Initialize at feedback step if initialCategory is provided
  React.useEffect(() => {
    if (initialCategory && isOpen) {
      setSelectedCategory(initialCategory);
      setCurrentStep('feedback');
    } else if (isOpen) {
      setCurrentStep('category');
      setSelectedCategory('');
    }
  }, [initialCategory, isOpen]);

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

  const handleSubmit = async () => {
    try {
      let response;
      if (selectedFile) {
        // Send as multipart/form-data if screenshot is included
        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('feedback', feedbackText);
        formData.append('screenshot', selectedFile);

        response = await fetch(`${BACKEND_URL}/submit_feedback`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } else {
        // Send as JSON if no screenshot
        response = await fetch(`${BACKEND_URL}/submit_feedback`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: selectedCategory,
            feedback: feedbackText,
          }),
        });
      }

      const result = await response.json();
      if (response.ok) {
        alert('Thank you for your feedback!');
        handleClose();
      } else {
        alert(result.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      alert('An error occurred while submitting feedback.');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleModalOverlayClick}>
      <div className={styles.modalContent}>
        {currentStep === 'category' ? (
          // Category Selection Step
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Help us improve Quantaid</h2>
              <button onClick={handleClose} className={styles.closeButton}>
                <MdClose size={24} color="#FFFFFF" />
              </button>
            </div>
            
            <p className={styles.modalBody}>What would you like to give feedback on?</p>
            
            <div className={styles.categoryButtons}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={styles.categoryButton}
                >
                  {category}
                </button>
              ))}
            </div>
          </>
        ) : (
          // Feedback Form Step
          <>
            <div className={styles.modalHeader}>
              <button onClick={handleBack} className={styles.backButton}>
                <MdArrowBackIos size={18} color="#FFFFFF" />
              </button>
              <h2 className={styles.modalTitle}>{selectedCategory}</h2>
              <button onClick={handleClose} className={styles.closeButton}>
                <MdClose size={24} color="#FFFFFF" />
              </button>
            </div>
            
            <p className={styles.modalBody}>Tell us how we can improve</p>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Describe your experience here."
              className={styles.feedbackTextarea}
            />
            
            <div className={styles.actionButtons}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenFileInput}
              />
              
              <button
                onClick={handleFileUpload}
                className={styles.screenshotButton}
              >
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Add a screen shot'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!feedbackText.trim()}
                className={styles.submitButton}
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

export default FeedbackModal;