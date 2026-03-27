// src/components/ProfileCreation.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { IoMdClose } from "react-icons/io";
import { LiaArrowLeftSolid } from "react-icons/lia";
import QuizProgressBar from '../common/QuizProgressBar';
import { styles } from './ProfileCreationStyles';
import welcomeVideo from '@/assets/welcome.mp4';

import {
  whereHeardOptions,
  highSchoolLevels,
  collegeLevels,
  subjects,
  codingExperienceOptions,
  hobbies,
} from '@/constants/formOptions';

interface FormData {
  whereHeard: string[];
  otherWhereHeard: string;
  educationCategory: string;
  educationLevel: string;
  otherEducationLevel: string;
  subjects: string[];
  otherSubject: string;
  codingExperience: string;
  favoriteHobbies: string[];
  customHobbies: string;
}

interface StepConfig {
  title: string;
  subtitle?: string;
  hasSelection: (formData: FormData) => boolean;
  renderContent: (formData: FormData, handlers: FormHandlers) => React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  customRender?: (
    stepConfig: StepConfig,
    formData: FormData,
    handlers: FormHandlers,
    commonProps: CommonProps
  ) => React.ReactNode;
}

interface FormHandlers {
  handleWhereHeardChange: (option: string) => void;
  handleSubjectsChange: (subj: string) => void;
  handleHobbyToggle: (hobby: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

interface CommonProps {
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
  skipOnboarding: () => void;
  handleSubmit: () => void;
}

const stepConfigs: StepConfig[] = [
  // {
  //   title: "Kelvin Intro",
  //   isFirst: true,
  //   hasSelection: () => true, // Always has selection since it's just an intro
  //   renderContent: () => null, // Not used when customRender is provided
  //   customRender: (stepConfig, formData, handlers, commonProps) => {
  //     const { setStep } = commonProps;
  //     return (
  //       <div style={styles.container}>
  //         {/* Custom header with different progress bar layout */}
  //         <div style={styles.topBar}>
  //           <div style={styles.backArrowSpace} />
  //           <QuizProgressBar
  //             currentIndex={0}
  //             totalQuestions={commonProps.totalSteps}
  //             style={styles.progressBar}
  //             fillColor="#7BA8ED"
  //             animationDuration={600}
  //           />
  //           <div style={styles.backArrowSpace} />
  //         </div>
  //
  //         {/* Completely custom centered intro content */}
  //         <div style={styles.introCenterWrapper}>
  //           <h1 style={styles.introHeading}>
  //             Hey <span style={{ color: '#6D73FA' }}>User</span>!
  //           </h1>
  //           <p style={styles.introParagraph}>
  //             I'm Kelvin, your chillest guide in the quantum realm.<br />
  //             My job? Keeping qubits cool and making quantum concepts even cooler.<br />
  //             Let's get you set up!
  //           </p>
  //           <img
  //             src={assistantImage}
  //             alt="Kelvin the Quantum Assistant"
  //             style={styles.assistantImage}
  //           />
  //           <button 
  //             style={styles.bigContinueButton} 
  //             onClick={() => setStep(1)}
  //           >
  //             Let's go!
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }
  // },

  {
    title: "Where did you hear about us?",
    subtitle: "(Select all that apply)",
    isFirst: true,
    hasSelection: (formData) => {
      // Check if there are any non-"Other" selections
      const nonOtherSelections = formData.whereHeard.filter(item => item !== 'Other (please specify)');
      // Check if "Other" is selected AND has text entered
      const hasValidOther = formData.whereHeard.includes('Other (please specify)') && formData.otherWhereHeard.trim() !== '';
      // Valid if there are non-Other selections OR valid Other selection
      return nonOtherSelections.length > 0 || hasValidOther;
    },
    renderContent: (formData, handlers) => (
      <>
        <div style={styles.checkList}>
          {whereHeardOptions.map((option) => (
            option === 'Other (please specify)' ? (
              <label 
                key={option} 
                style={{
                  ...styles.checkItem,
                  ...styles.checkItemExpanded,
                  backgroundColor: formData.whereHeard.includes(option) ? '#10204D' : 'transparent',
                  borderColor: formData.whereHeard.includes(option) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handlers.handleWhereHeardChange(option)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleWhereHeardChange(option); } }}
                  style={styles.checkbox}
                />
                <div style={styles.optionContent}>
                  <span>Other (please specify)</span>
                  {formData.whereHeard.includes(option) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherWhereHeard}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherWhereHeard: e.target.value }))
                      }
                      style={styles.inlineOtherInput}
                      autoFocus
                    />
                  )}
                </div>
              </label>
            ) : (
              <label 
                key={option} 
                style={{
                  ...styles.checkItem,
                  backgroundColor: formData.whereHeard.includes(option) ? '#10204D' : 'transparent',
                  borderColor: formData.whereHeard.includes(option) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handlers.handleWhereHeardChange(option)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleWhereHeardChange(option); } }}
                  style={styles.checkbox}
                />
                {option}
              </label>
            )
          ))}
        </div>
      </>
    )
  },
  {
    title: "What is your education level?",
    hasSelection: (formData) => 
      formData.educationCategory !== '' && 
      (formData.educationLevel !== '' || formData.otherEducationLevel !== ''),
    renderContent: (formData, handlers) => (
      <>
        <div style={styles.educationContainer}>
          {/* HIGH SCHOOL Section */}
          <div style={styles.educationSection}>
            <h4 style={styles.radioGroupLabel}>HIGH SCHOOL</h4>
            <div style={styles.radioRowGroup}>
              {highSchoolLevels.map((lvl) => (
                <label
                  key={lvl}
                  style={{
                    ...styles.radioItemCompact,
                    backgroundColor: (formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl) ? '#10204D' : 'transparent',
                    borderColor: (formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl) ? '#1D4177' : '#434F62',
                  }}
                >
                  <input
                    type="radio"
                    checked={formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl}
                    onChange={() =>
                      handlers.setFormData(prev => ({
                        ...prev,
                        educationCategory: 'HighSchool',
                        educationLevel: lvl,
                        otherEducationLevel: '',
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlers.setFormData(prev => ({
                          ...prev,
                          educationCategory: 'HighSchool',
                          educationLevel: lvl,
                          otherEducationLevel: '',
                        }));
                      }
                    }}
                    style={styles.radio}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          {/* COLLEGE Section */}
          <div style={styles.educationSection}>
            <h4 style={styles.radioGroupLabel}>COLLEGE</h4>
            <div style={styles.radioRowGroup}>
              {collegeLevels.map((lvl) => (
                <label
                  key={lvl}
                  style={{
                    ...styles.radioItemCompact,
                    backgroundColor: (formData.educationCategory === 'College' && formData.educationLevel === lvl) ? '#10204D' : 'transparent',
                    borderColor: (formData.educationCategory === 'College' && formData.educationLevel === lvl) ? '#1D4177' : '#434F62',
                  }}
                >
                  <input
                    type="radio"
                    checked={formData.educationCategory === 'College' && formData.educationLevel === lvl}
                    onChange={() =>
                      handlers.setFormData(prev => ({
                        ...prev,
                        educationCategory: 'College',
                        educationLevel: lvl,
                        otherEducationLevel: '',
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlers.setFormData(prev => ({
                          ...prev,
                          educationCategory: 'College',
                          educationLevel: lvl,
                          otherEducationLevel: '',
                        }));
                      }
                    }}
                    style={styles.radio}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.educationSection}>
          <h4 style={styles.radioGroupLabel}></h4>
          <div style={styles.radioRowGroup}>
            <label 
              style={{
                ...styles.radioItemCompact,
                ...styles.radioItemExpanded,
                backgroundColor: formData.educationCategory === 'Other' ? '#10204D' : 'transparent',
                borderColor: formData.educationCategory === 'Other' ? '#1D4177' : '#434F62',
              }}
            >
              <input
                type="radio"
                checked={formData.educationCategory === 'Other'}
                onChange={() =>
                  handlers.setFormData(prev => ({
                    ...prev,
                    educationCategory: 'Other',
                    educationLevel: '',
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlers.setFormData(prev => ({
                      ...prev,
                      educationCategory: 'Other',
                      educationLevel: '',
                    }));
                  }
                }}
                style={styles.radio}
              />
              <div style={styles.optionContent}>
                <span>Other (please specify)</span>
                {formData.educationCategory === 'Other' && (
                  <input
                    type="text"
                    placeholder="Type here..."
                    value={formData.otherEducationLevel}
                    onChange={(e) =>
                      handlers.setFormData(prev => ({ ...prev, otherEducationLevel: e.target.value }))
                    }
                    style={styles.inlineOtherInput}
                    autoFocus
                  />
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    </>
  )
},
  {
    title: "Which subjects have you studied or have experience in?",
    subtitle: "(Select all that apply)",
    hasSelection: (formData) => {
      // Check if there are any non-"Other" selections
      const nonOtherSelections = formData.subjects.filter(item => item !== 'Other (please specify)');
      // Check if "Other" is selected AND has text entered
      const hasValidOther = formData.subjects.includes('Other (please specify)') && formData.otherSubject.trim() !== '';
      // Valid if there are non-Other selections OR valid Other selection
      return nonOtherSelections.length > 0 || hasValidOther;
    },
    renderContent: (formData, handlers) => (
      <>
        <div style={styles.checkList}>
          {subjects.map((subj) => (
            subj === 'Other (please specify)' ? (
              <label 
                key={subj} 
                style={{
                  ...styles.checkItem,
                  ...styles.checkItemExpanded,
                  backgroundColor: formData.subjects.includes(subj) ? '#10204D' : 'transparent',
                  borderColor: formData.subjects.includes(subj) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handlers.handleSubjectsChange(subj)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleSubjectsChange(subj); } }}
                  style={styles.checkbox}
                />
                <div style={styles.optionContent}>
                  <span>Other (please specify):</span>
                  {formData.subjects.includes(subj) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherSubject}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherSubject: e.target.value }))
                      }
                      style={styles.inlineOtherInput}
                      autoFocus
                    />
                  )}
                </div>
              </label>
            ) : (
              <label 
                key={subj} 
                style={{
                  ...styles.checkItem,
                  backgroundColor: formData.subjects.includes(subj) ? '#10204D' : 'transparent',
                  borderColor: formData.subjects.includes(subj) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handlers.handleSubjectsChange(subj)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleSubjectsChange(subj); } }}
                  style={styles.checkbox}
                />
                {subj}
              </label>
            )
          ))}
        </div>
      </>
    )
  },
  {
    title: "How much coding experience do you have?",
    hasSelection: (formData) => formData.codingExperience !== '',
    renderContent: (formData, handlers) => (
      <div style={styles.radioGroup}>
        {codingExperienceOptions.map((option) => (
          <label
            key={option}
            style={{
              ...styles.radioItem,
              backgroundColor: formData.codingExperience === option ? '#10204D' : 'transparent',
              borderColor: formData.codingExperience === option ? '#1D4177' : '#434F62',
            }}
          >
            <input
              type="radio"
              name="codingExperience"
              checked={formData.codingExperience === option}
              onChange={() =>
                handlers.setFormData(prev => ({ ...prev, codingExperience: option }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlers.setFormData(prev => ({ ...prev, codingExperience: option }));
                }
              }}
              style={styles.radio}
            />
            {option}
          </label>
        ))}
      </div>
    )
  },
  {
    title: "Select your favourite hobbies and interests",
    subtitle: "(Select all that apply)",
    isLast: true,
    hasSelection: (formData) => formData.favoriteHobbies.length > 0 || formData.customHobbies.trim() !== '',
    renderContent: (formData, handlers) => (
      <div style={styles.hobbiesMainContainer}>
        <div style={styles.hobbiesContainer}>
          {hobbies.map((hobby) => (
            <button
              key={hobby}
              className="hobby-button"
              style={{
                ...styles.hobbyButton,
                backgroundColor: formData.favoriteHobbies.includes(hobby) ? '#10204D' : 'transparent',
                borderColor: formData.favoriteHobbies.includes(hobby) ? '#1D4177' : '#434F62',
                color: formData.favoriteHobbies.includes(hobby) ? '#FFFFFF' : '#AAAAC1',
              }}
              onClick={() => handlers.handleHobbyToggle(hobby)}
            >
              {hobby}
            </button>
          ))}
        </div>
        
        {/* Custom hobbies section */}
        <div style={styles.customHobbiesSection}>
          <h3 style={styles.formQuestion}>Want to be more specific?</h3>
          <p style={styles.formSubtitle}>Add your own</p>
          <input
            type="text"
            placeholder="(e.g. violin, bird watching, spoken word poetry)"
            value={formData.customHobbies}
            onChange={(e) =>
              handlers.setFormData(prev => ({ ...prev, customHobbies: e.target.value }))
            }
            style={styles.customHobbiesInput}
          />
        </div>
      </div>
    )
  }
];


// Default Step Component
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

  const handleCloseSkipModal = () => {
    setShowSkipModal(false);
  };

  const handleConfirmSkip = () => {
    setShowSkipModal(false);
    skipOnboarding();
  };

  const handleModalOverlayClick = (event: React.MouseEvent) => {
    // Only close if clicking on the overlay itself, not the modal content
    if (event.target === event.currentTarget) {
      setShowSkipModal(false);
    }
  };

  // Focus trapping for skip modal
  useEffect(() => {
    if (showSkipModal) {
      const modalElement = skipModalRef.current;
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
          handleCloseSkipModal();
        }
      };

      // Attach event listeners
      modalElement.addEventListener('keydown', handleTabKeyPress);
      modalElement.addEventListener('keydown', handleEscapeKeyPress);

      // Focus the close button (first element) when modal opens
      firstElement.focus();

      // Cleanup: remove event listeners when modal closes
      return () => {
        modalElement.removeEventListener('keydown', handleTabKeyPress);
        modalElement.removeEventListener('keydown', handleEscapeKeyPress);
      };
    }
  }, [showSkipModal]);

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

const ProfileCreation: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<number>(0);
  const [showVideoPopup, setShowVideoPopup] = useState<boolean>(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    whereHeard: [],
    otherWhereHeard: '',
    educationCategory: '',
    educationLevel: '',
    otherEducationLevel: '',
    subjects: [],
    otherSubject: '',
    codingExperience: '',
    favoriteHobbies: [],
    customHobbies: '',
  });

  const totalSteps = stepConfigs.length;

  // On mount, fetch user ID
  useEffect(() => {
    api
      .get('/get_user_id')
      .then((response) => {
        const uid = response.data.user_id;
        console.log('ProfileCreation: session user_id =', uid);
        setUserId(uid);
      })
      .catch(() => {
        console.warn('No user in session, fallback to localStorage');
        const storedEmail = localStorage.getItem('loggedInUserEmail');
        if (storedEmail) {
          setUserId(storedEmail);
        } else {
          setUserId('');
        }
      });
  }, []);

  if (userId === null) {
    return <p>Loading user info...</p>;
  }
  if (!userId) {
    return (
      <div style={{ color: 'red' }}>
        <p>No user ID found in session or localStorage. Please log in again.</p>
      </div>
    );
  }

  const handlers: FormHandlers = {
    handleWhereHeardChange: (option: string) => {
      const { whereHeard } = formData;
      if (whereHeard.includes(option)) {
        const updated = whereHeard.filter((o: string) => o !== option);
        setFormData({ ...formData, whereHeard: updated });
      } else {
        setFormData({ ...formData, whereHeard: [...whereHeard, option] });
      }
    },

    handleSubjectsChange: (subj: string) => {
      const currentSubjects = formData.subjects;
      if (currentSubjects.includes(subj)) {
        const updated = currentSubjects.filter((s: string) => s !== subj);
        setFormData({ ...formData, subjects: updated });
      } else {
        setFormData({ ...formData, subjects: [...currentSubjects, subj] });
      }
    },

    handleHobbyToggle: (hobby: string) => {
      const currentHobbies = formData.favoriteHobbies;
      if (currentHobbies.includes(hobby)) {
        const updated = currentHobbies.filter((h: string) => h !== hobby);
        setFormData({ ...formData, favoriteHobbies: updated });
      } else {
        setFormData({ ...formData, favoriteHobbies: [...currentHobbies, hobby] });
      }
    },

    setFormData,
  };

  /** ------------------ SUBMIT PROFILE ------------------ **/
  const handleSubmit = () => {
    const dataToSend = {
      user_id: userId,
      whereHeard: formData.whereHeard,
      otherWhereHeard: formData.otherWhereHeard,
      educationCategory: formData.educationCategory,
      educationLevel: formData.educationLevel,
      otherEducationLevel: formData.otherEducationLevel,
      subjects: formData.subjects,
      otherSubject: formData.otherSubject,
      favoriteHobbies: formData.favoriteHobbies,
      customHobbies: formData.customHobbies,
      codingExperience: formData.codingExperience,
      //TODO: hardcoded defaults below should get added to the form? 
      // knowsQuantumComputing: 'No',
      // use_generic_analogies: true,
    };

    api
      .post('/save_profile', dataToSend)
      .then((response) => {
        console.log('Profile saved:', response.data);
        setShowVideoPopup(true);
      })
      .catch((error: unknown) => {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. See console logs.');
      });
  };

  const skipOnboarding = () => {
    handleSubmit();
  };

  const commonProps: CommonProps = {
    step,
    setStep,
    totalSteps,
    skipOnboarding,
    handleSubmit,
  };

  /** ------------------ VIDEO POPUP ------------------ **/
  if (showVideoPopup) {
    return (
      <div style={styles.videoOverlay}>
        <h2 style={{ color: '#FFFFFF', marginBottom: '20px', fontSize: '34px', fontFamily: "'Inter', sans-serif", fontWeight: '400', letterSpacing: '.02em' }}>
          Welcome to Quantaid!
        </h2>
        <video
          width="80%"
          autoPlay
          playsInline
          controls
          onEnded={() => navigate('/map')}
          style={{ borderRadius: '8px' }}
        >
          <source src={welcomeVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button
          onClick={() => navigate('/map')}
          style={styles.skipVideoButton}
          className="skip-button"
        >
          Continue
        </button>
      </div>
    );
  }

  // Render current step
    const currentStepConfig = stepConfigs[step];

    // Use custom render if provided, otherwise use default
    if (currentStepConfig.customRender) {
      return currentStepConfig.customRender(currentStepConfig, formData, handlers, commonProps);
    }

    return (
      <DefaultStep
        stepConfig={currentStepConfig}
        formData={formData}
        handlers={handlers}
        commonProps={commonProps}
      />
    );
  };

export default ProfileCreation;
