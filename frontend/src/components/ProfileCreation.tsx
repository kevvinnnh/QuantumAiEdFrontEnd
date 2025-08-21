// src/components/ProfileCreation.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";
import { LiaArrowLeftSolid } from "react-icons/lia";
import QuizProgressBar from './QuizProgressBar';
import welcomeVideo from '../assets/welcome.mp4';
// import assistantImage from '../assets/assistant.png';

/** STEP DATA:
 *  (Removed) 0 - Kelvin Intro
 *  0 - Where did you hear about us?
 *  1 - Education Level (HS or College)
 *  2 - Subjects studied/experience
 *  3 - Coding experience
 *  4 - Favorite hobbies/interests
 */

// "Where did you hear about us?" checkboxes
const whereHeardOptions = [
  'Google Search',
  'Referred by a Friend or Colleague',
  'Invited by a Researcher or Team Member',
  'Participated in a Previous Study',
  'Academic Paper or Journal',
  'Other (please specify)',
];

// Education sub-levels
const highSchoolLevels = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];
const collegeLevels = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

// Example subjects
const subjects = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Other (please specify)',
];

// Coding experience
const codingExperienceOptions = [
  'No experience (0 years)',
  'Less than 1 year',
  '1-2 year',
  '3-4 years',
  '4-5 years',
  'More than 5 years',
];

// Hobbies
const hobbies = [
  'Reading',
  'Music',
  'Dancing',
  'Photography',
  'Cooking',
  'Gaming',
  'Gardening',
  'Writing',
  'Sports',
  'Art',
  'Hiking',
];

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
                    name="educationCategory"
                    checked={formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl}
                    onChange={() =>
                      handlers.setFormData(prev => ({
                        ...prev,
                        educationCategory: 'HighSchool',
                        educationLevel: lvl,
                        otherEducationLevel: '',
                      }))
                    }
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
                    name="educationCategory"
                    checked={formData.educationCategory === 'College' && formData.educationLevel === lvl}
                    onChange={() =>
                      handlers.setFormData(prev => ({
                        ...prev,
                        educationCategory: 'College',
                        educationLevel: lvl,
                        otherEducationLevel: '',
                      }))
                    }
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
                name="educationCategory"
                checked={formData.educationCategory === 'Other'}
                onChange={() =>
                  handlers.setFormData(prev => ({
                    ...prev,
                    educationCategory: 'Other',
                    educationLevel: '',
                  }))
                }
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
              name="codingExp"
              checked={formData.codingExperience === option}
              onChange={() =>
                handlers.setFormData(prev => ({ ...prev, codingExperience: option }))
              }
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

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        {!stepConfig.isFirst ? (
          <button style={styles.backArrow} onClick={handleBack}>
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
        <div style={styles.modalOverlay} onClick={handleModalOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Your answers help Quantaid teach in a way that clicks for <span style={{ fontStyle: 'italic' }}>you</span>.</h2>
              <button onClick={handleCloseSkipModal} style={styles.closeModalButton}>
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
  const [userId, setUserId] = useState<string>('');
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const totalSteps = stepConfigs.length;

  // On mount, fetch user ID
  useEffect(() => {
    axios
      .get(`${backendUrl}/get_user_id`, { withCredentials: true })
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
  }, [backendUrl]);

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
    // Example data transformation if your backend expects certain fields:
    let finalEducationLevel = '';
    let finalMajor = formData.subjects.join(', ');
    let finalKnowsQuantum = 'No'; // Example placeholder
    let finalCodingExp = formData.codingExperience;
    let finalHobbies = formData.favoriteHobbies || [];

    // If user selected "HighSchool"
    if (formData.educationCategory === 'HighSchool') {
      finalEducationLevel = formData.educationLevel;
    } else if (formData.educationCategory === 'College') {
      finalEducationLevel = formData.educationLevel;
    } else {
      finalEducationLevel = formData.otherEducationLevel;
    }

    if (
      formData.subjects.includes('Other (please specify)') &&
      formData.otherSubject
    ) {
      finalMajor += `, ${formData.otherSubject}`;
    }

    const dataToSend = {
      user_id: userId,
      whereHeard: formData.whereHeard,
      otherWhereHeard: formData.otherWhereHeard,
      educationLevel: finalEducationLevel,
      major: finalMajor,
      knowsQuantumComputing: finalKnowsQuantum,
      codingExperience: finalCodingExp,
      favoriteHobbies: finalHobbies,
      customHobbies: formData.customHobbies,
    };

    console.log('DEBUG: Submitting profile =>', dataToSend);

    axios
      .post(`${backendUrl}/save_profile`, dataToSend, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('Profile saved:', response.data);
        navigate('/map')
        // Show the welcome video popup
        setShowVideoPopup(true);
      })
      .catch((error) => {
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

  // Loading states
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

  /** ------------------ VIDEO POPUP ------------------ **/
  if (showVideoPopup) {
    return (
      <div style={styles.videoOverlay}>
        <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '2rem' }}>
          Welcome to QuantumAiEd!
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
        >
          Skip Video
        </button>
      </div>
    );
  }

  // Render current step
    const currentStepConfig = stepConfigs[step];
    if (!currentStepConfig) {
      return null;
    }

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

/** ------------------ STYLES ------------------ **/
const styles: { [key: string]: React.CSSProperties } = {
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
    minHeight: '100vh',
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
  backArrowSpace: {
    height: '24px',
    width: '24px',
  },
  backArrow: {
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
    marginLeft: '2.5rem',
    marginRight: '2.5rem',
  },
  closeButton: {
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
    position: 'relative',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    color: '#FEFEFE',
    margin: '0 0 16px 0',
    lineHeight: '1.3',
    flex: 1,
    textAlign: 'center',
  },
  closeModalButton: {
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
    fontSize: '14px',
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
  skipAnywayButton: {
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
  formQuestion: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '34px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '.02em',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: '1195px',
    width: '100%',
    margin: '0 auto 0 auto',
  },
  formSubtitle: {
    fontSize: '1.2rem',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    marginTop: '-0.1rem',
  },
  formContent: {
    marginTop: '3rem',
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '1.5rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    minWidth: '400px',
    fontSize: '18px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  checkbox: {
    appearance: 'none',
    width: '20px',
    height: '20px',
    border: '2px solid #AAAAC1',
    borderRadius: '2px',
    backgroundColor: 'transparent',
    marginLeft: '-0.6rem',
    marginRight: '16px',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  checkItemExpanded: {
    minHeight: '60px',
    alignItems: 'flex-start',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  inlineOtherInput: {
    padding: '8px 0',
    fontSize: '16px',
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #424E62',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  radioGroup: {
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '600px',
  },
  radioGroupLabel: {
    fontSize: '1.3rem',
    marginBottom: '1rem',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    fontWeight: '600',
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    marginBottom: '16px',
    minWidth: '400px',
    fontSize: '18px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  radio: {
    appearance: 'none',
    width: '20px',
    height: '20px',
    border: '2px solid #AAAAC1',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    marginTop: '-0px',
    marginLeft: '-0.6rem',
    marginRight: '16px',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  radioItemExpanded: {
    minHeight: '60px',
    alignItems: 'flex-start',
    paddingTop: '16px',
    paddingBottom: '16px',
    minWidth: '300px',
  },
  hobbiesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    maxWidth: '700px',
    marginBottom: '2rem',
  },
  hobbyButton: {
    border: '2px solid #424E62',
    padding: '14px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    textAlign: 'center',
    minWidth: '120px',
  },
  customHobbiesSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    gap: '8px',
  },
  customHobbiesInput: {
    width: '100%',
    padding: '14px 0',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    borderBottom: '2px solid #424E62',
    outline: 'none',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
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
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '65%',
    maxWidth: '1350px',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    height: '60px',
  },
  skipButton: {
    padding: '12px 42px',
    fontSize: '22px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#AAABAF',
    backgroundColor: 'transparent',
    border: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px',
  },
  continueButton: {
    padding: '12px 42px',
    fontSize: '22px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#142748',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px',
  },
  educationContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    width: '100%',
    maxWidth: '800px',
    alignItems: 'flex-start',
  },
  educationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    alignItems: 'flex-start',
  },
  radioRowGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12px',
    width: '100%',
  },
  radioItemCompact: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
  },
  otherInputContainer: {
    marginTop: '16px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  otherLabel: {
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    marginLeft: '4px',
  },
  otherInput: {
    padding: '12px 0',
    fontSize: '16px',
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #424E62',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  hobbiesMainContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '700px',
    marginBottom: '2rem',
  },
  videoOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  skipVideoButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontFamily: "'Inter', sans-serif",
  },
};

const addHoverStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .profile-bottom-buttons:hover:not(:disabled) {
      opacity: 0.9 !important;
      transition: opacity 0.2s ease;
    }

    .hobby-button:hover:not(:disabled) {
      opacity: 0.9 !important;
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    label:has(input[type="checkbox"]):hover,
    label:has(input[type="radio"]):hover {
      border-color: #1E4277 !important;
      transition: all 0.2s ease;
    }

    label:has(input[type="checkbox"]:checked):hover,
    label:has(input[type="radio"]:checked):hover {
      background-color: #10204D !important;
      border-color: #1E4277 !important;
    }

    input[type="checkbox"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }

    input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 1px;
      width: 4px;
      height: 10px;
      border: solid #0F1F4C;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    input[type="checkbox"]:hover {
      border-color: #3B89FF !important;
    }

    input[type="radio"]:hover {
      border-color: #3B89FF !important;
    }

    input[type="radio"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }

    input[type="radio"]:checked::after {
      content: '';
      position: absolute;
      left: 0px;
      top: 0px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #3B89FF;
      border: 2px solid #131C46;
    }

    input[type="text"]:focus {
      border-bottom-color: #7BA8ED !important;
      background-color: rgba(37, 52, 98, 0.15) !important;
      padding-left: 4px !important;
      padding-right: 4px !important;
    }

    input[type="text"]::placeholder {
      color: #666 !important;
      font-style: italic;
    }

    input[type="text"]:hover {
      border-bottom-color: #7BA8ED !important;
    }

    .inline-other-input:focus {
      background-color: rgba(37, 52, 98, 0.1) !important;
    }
    
    input[style*="border-bottom: 2px solid #424E62"]:focus {
      border-bottom-color: #7BA8ED !important;
      background-color: rgba(37, 52, 98, 0.15) !important;
      padding-left: 4px !important;
      padding-right: 4px !important;
    }

    input[style*="border-bottom: 2px solid #424E62"]:hover {
      border-bottom-color: #7BA8ED !important;
    }

    input[style*="border-bottom: 2px solid #424E62"]::placeholder {
      color: #666 !important;
      font-style: italic;
    }

    .back-button:hover {
      background-color: #10204D !important;
      border-color: #1D4177 !important;
      transition: all 0.2s ease;
    }
    
    button.skip-button:hover:not(:disabled) {
      background-color: #404A5F !important;
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addHoverStyles();
}

export default ProfileCreation;
