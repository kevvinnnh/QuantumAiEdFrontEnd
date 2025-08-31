// src/components/ProfileCreation/ProfileCreation.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";
import { LiaArrowLeftSolid } from "react-icons/lia";
import QuizProgressBar from '../QuizProgressBar/QuizProgressBar';
import welcomeVideo from '../../assets/welcome.mp4';
import styles from './ProfileCreation.module.scss';
// import assistantImage from '../../assets/assistant.png';

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
  //       <div className={styles.container}>
  //         {/* Custom header with different progress bar layout */}
  //         <div className={styles.topBar}>
  //           <div className={styles.backArrowSpace} />
  //           <QuizProgressBar
  //             currentIndex={0}
  //             totalQuestions={commonProps.totalSteps}
  //             className={styles.progressBar}
  //             fillColor="#7BA8ED"
  //             animationDuration={600}
  //           />
  //           <div className={styles.backArrowSpace} />
  //         </div>
  //
  //         {/* Completely custom centered intro content */}
  //         <div className={styles.introCenterWrapper}>
  //           <h1 className={styles.introHeading}>
  //             Hey <span style={{ color: '#6D73FA' }}>User</span>!
  //           </h1>
  //           <p className={styles.introParagraph}>
  //             I'm Kelvin, your chillest guide in the quantum realm.<br />
  //             My job? Keeping qubits cool and making quantum concepts even cooler.<br />
  //             Let's get you set up!
  //           </p>
  //           <img
  //             src={assistantImage}
  //             alt="Kelvin the Quantum Assistant"
  //             className={styles.assistantImage}
  //           />
  //           <button 
  //             className={styles.bigContinueButton} 
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
        <div className={styles.checkList}>
          {whereHeardOptions.map((option) => (
            option === 'Other (please specify)' ? (
              <label 
                key={option} 
                className={`${styles.checkItem} ${styles.checkItemExpanded} ${
                  formData.whereHeard.includes(option) ? styles.selected : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handlers.handleWhereHeardChange(option)}
                  className={styles.checkbox}
                />
                <div className={styles.optionContent}>
                  <span>Other (please specify)</span>
                  {formData.whereHeard.includes(option) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherWhereHeard}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherWhereHeard: e.target.value }))
                      }
                      className={styles.inlineOtherInput}
                      autoFocus
                    />
                  )}
                </div>
              </label>
            ) : (
              <label 
                key={option} 
                className={`${styles.checkItem} ${
                  formData.whereHeard.includes(option) ? styles.selected : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handlers.handleWhereHeardChange(option)}
                  className={styles.checkbox}
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
        <div className={styles.educationContainer}>
          {/* HIGH SCHOOL Section */}
          <div className={styles.educationSection}>
            <h4 className={styles.radioGroupLabel}>HIGH SCHOOL</h4>
            <div className={styles.radioRowGroup}>
              {highSchoolLevels.map((lvl) => (
                <label 
                  key={lvl} 
                  className={`${styles.radioItemCompact} ${
                    (formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl) ? styles.selected : ''
                  }`}
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
                    className={styles.radio}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          {/* COLLEGE Section */}
          <div className={styles.educationSection}>
            <h4 className={styles.radioGroupLabel}>COLLEGE</h4>
            <div className={styles.radioRowGroup}>
              {collegeLevels.map((lvl) => (
                <label 
                  key={lvl} 
                  className={`${styles.radioItemCompact} ${
                    (formData.educationCategory === 'College' && formData.educationLevel === lvl) ? styles.selected : ''
                  }`}
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
                    className={styles.radio}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.educationSection}>
            <h4 className={styles.radioGroupLabel}></h4>
            <div className={styles.radioRowGroup}>
              <label 
                className={`${styles.radioItemCompact} ${styles.radioItemExpanded} ${
                  formData.educationCategory === 'Other' ? styles.selected : ''
                }`}
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
                  className={styles.radio}
                />
                <div className={styles.optionContent}>
                  <span>Other (please specify)</span>
                  {formData.educationCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherEducationLevel}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherEducationLevel: e.target.value }))
                      }
                      className={styles.inlineOtherInput}
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
        <div className={styles.checkList}>
          {subjects.map((subj) => (
            subj === 'Other (please specify)' ? (
              <label 
                key={subj} 
                className={`${styles.checkItem} ${styles.checkItemExpanded} ${
                  formData.subjects.includes(subj) ? styles.selected : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handlers.handleSubjectsChange(subj)}
                  className={styles.checkbox}
                />
                <div className={styles.optionContent}>
                  <span>Other (please specify):</span>
                  {formData.subjects.includes(subj) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherSubject}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherSubject: e.target.value }))
                      }
                      className={styles.inlineOtherInput}
                      autoFocus
                    />
                  )}
                </div>
              </label>
            ) : (
              <label 
                key={subj} 
                className={`${styles.checkItem} ${
                  formData.subjects.includes(subj) ? styles.selected : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handlers.handleSubjectsChange(subj)}
                  className={styles.checkbox}
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
      <div className={styles.radioGroup}>
        {codingExperienceOptions.map((option) => (
          <label 
            key={option} 
            className={`${styles.radioItem} ${
              formData.codingExperience === option ? styles.selected : ''
            }`}
          >
            <input
              type="radio"
              name="codingExp"
              checked={formData.codingExperience === option}
              onChange={() =>
                handlers.setFormData(prev => ({ ...prev, codingExperience: option }))
              }
              className={styles.radio}
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
      <div className={styles.hobbiesMainContainer}>
        <div className={styles.hobbiesContainer}>
          {hobbies.map((hobby) => (
            <button
              key={hobby}
              className={`${styles.hobbyButton} ${
                formData.favoriteHobbies.includes(hobby) ? styles.selected : ''
              }`}
              onClick={() => handlers.handleHobbyToggle(hobby)}
            >
              {hobby}
            </button>
          ))}
        </div>
        
        {/* Custom hobbies section */}
        <div className={styles.customHobbiesSection}>
          <h3 className={styles.formQuestion}>Want to be more specific?</h3>
          <p className={styles.formSubtitle}>Add your own</p>
          <input
            type="text"
            placeholder="(e.g. violin, bird watching, spoken word poetry)"
            value={formData.customHobbies}
            onChange={(e) =>
              handlers.setFormData(prev => ({ ...prev, customHobbies: e.target.value }))
            }
            className={styles.customHobbiesInput}
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
    <div className={styles.container}>
      <div className={styles.topBar}>
        {!stepConfig.isFirst ? (
          <button className={styles.backArrow} onClick={handleBack}>
            <LiaArrowLeftSolid size={24} color={'#FFFFFF'} />
          </button>
        ) : (
          <div className={styles.backArrowSpace} />
        )}
        <QuizProgressBar
          currentIndex={step}
          totalQuestions={totalSteps}
          className={styles.progressBar}
          fillColor="#7BA8ED"
          animationDuration={600}
        />
        <div className={styles.backArrowSpace} />
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className={styles.modalOverlay} onClick={handleModalOverlayClick}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Your answers help Quantaid teach in a way that clicks for <span style={{ fontStyle: 'italic' }}>you</span>.</h2>
              <button onClick={handleCloseSkipModal} className={styles.closeModalButton}>
                <IoMdClose size={24} color="#FFFFFF" />
              </button>
            </div>
            <p className={styles.modalSubtext}>
              Skipping means you'll get a more general experience for now, but you can update your preferences anytime in your profile settings.
            </p>
            <div className={styles.modalButtons}>
              <button
                onClick={handleCloseSkipModal}
                className={styles.goBackButton}
              >
                Go back
              </button>
              <button
                onClick={handleConfirmSkip}
                className={styles.skipAnywayButton}
              >
                Skip anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.quizPane}>
        <h2 className={styles.formQuestion}>{stepConfig.title}</h2>
        {stepConfig.subtitle && (
          <p className={styles.formSubtitle}>{stepConfig.subtitle}</p>
        )}
        <div className={styles.formContent}>
          {stepConfig.renderContent(formData, handlers)}
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.footer}>
          <div className={styles.rightSection}>
            <button
              onClick={handleSkipButtonClick}
              className={styles.skipButton}
            >
              SKIP FOR NOW
            </button>
            <button 
              className={styles.continueButton}
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

    axios
      .post(`${backendUrl}/save_profile`, dataToSend, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('Profile saved:', response.data);
        navigate('/map');
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
      <div className={styles.videoOverlay}>
        <h2>Welcome to QuantumAiEd!</h2>
        <video
          width="80%"
          autoPlay
          playsInline
          controls
          onEnded={() => navigate('/map')}
        >
          <source src={welcomeVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button
          onClick={() => navigate('/map')}
          className={styles.skipVideoButton}
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

export default ProfileCreation;