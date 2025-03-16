import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import welcomeVideo from '../assets/welcome.mp4';
import assistantImage from '../assets/assistant.png'; // Replace with your actual image path

/** STEP DATA:
 *  0 - Kelvin Intro
 *  1 - Where did you hear about us?
 *  2 - Education Level (HS or College)
 *  3 - Subjects studied/experience
 *  4 - Coding experience
 *  5 - Favorite hobbies/interests
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

const ProfileCreation: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [step, setStep] = useState<number>(0); // 0 = Kelvin intro
  const [showVideoPopup, setShowVideoPopup] = useState<boolean>(false);
  const navigate = useNavigate();

  // Data object to store user selections
  const [formData, setFormData] = useState<any>({
    whereHeard: [],
    otherWhereHeard: '',
    educationCategory: '',
    educationLevel: '',
    otherEducationLevel: '',
    subjects: [] as string[],
    otherSubject: '',
    codingExperience: '',
    favoriteHobbies: [] as string[],
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
    };

    console.log('DEBUG: Submitting profile =>', dataToSend);

    axios
      .post(`${backendUrl}/save_profile`, dataToSend, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('Profile saved:', response.data);
        // Show the welcome video popup
        setShowVideoPopup(true);
      })
      .catch((error) => {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. See console logs.');
      });
  };

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

  /** ------------------ PROGRESS BAR ------------------ **/
  const totalSteps = 5; // steps 0..5
  const currentProgress = (step / totalSteps) * 100;

  /** ------------------ RENDER STEPS ------------------ **/

  // STEP 0: Kelvin Intro
  if (step === 0) {
    return (
      <div style={styles.gradientContainer}>
        {/* Header with progress bar & skip */}
        <div style={styles.headerBar}>
          <div style={styles.backArrowSpace} /> {/* Empty space, no back arrow at step 0 */}
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFill, width: `${currentProgress}%` }} />
          </div>
          <button style={styles.skipButton} onClick={() => skipOnboarding()}>
            Skip for now
          </button>
        </div>

        {/* Centered intro content */}
        <div style={styles.introCenterWrapper}>
          <h1 style={styles.introHeading}>
            Hey <span style={{ color: '#6D73FA' }}>{userId}</span>!
          </h1>
          <p style={styles.introParagraph}>
            I’m Kelvin, your chillest guide in the quantum realm.<br />
            My job? Keeping qubits cool and making quantum concepts even cooler.<br />
            Let’s get you set up!
          </p>
          <img
            src={assistantImage}
            alt="Kelvin the Quantum Assistant"
            style={styles.assistantImage}
          />
          <button style={styles.bigContinueButton} onClick={() => setStep(1)}>
            Let’s go!
          </button>
        </div>
      </div>
    );
  }

  // STEP 1: Where did you hear about us?
  if (step === 1) {
    return (
      <div style={styles.gradientContainer}>
        <div style={styles.headerBar}>
          <button style={styles.backArrow} onClick={() => setStep(0)}>
            ←
          </button>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFill, width: `${currentProgress}%` }} />
          </div>
          <button style={styles.skipButton} onClick={() => skipOnboarding()}>
            Skip for now
          </button>
        </div>

        <div style={styles.formContent}>
          <h2 style={styles.formQuestion}>Where did you hear about us?</h2>
          <p style={styles.formSubtitle}>(Select all that apply)</p>
          <div style={styles.checkList}>
            {whereHeardOptions.map((option) => (
              <label key={option} style={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handleWhereHeardChange(option)}
                  style={styles.checkbox}
                />
                {option}
              </label>
            ))}
          </div>

          {formData.whereHeard.includes('Other (please specify)') && (
            <input
              type="text"
              placeholder="Please specify"
              value={formData.otherWhereHeard}
              onChange={(e) =>
                setFormData({ ...formData, otherWhereHeard: e.target.value })
              }
              style={styles.otherInput}
            />
          )}

          <div style={styles.buttonRow}>
            <button style={styles.bigContinueButton} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Education Level
  if (step === 2) {
    return (
      <div style={styles.gradientContainer}>
        <div style={styles.headerBar}>
          <button style={styles.backArrow} onClick={() => setStep(1)}>
            ←
          </button>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFill, width: `${currentProgress}%` }} />
          </div>
          <button style={styles.skipButton} onClick={() => skipOnboarding()}>
            Skip for now
          </button>
        </div>

        <div style={styles.formContent}>
          <h2 style={styles.formQuestion}>What is your education level?</h2>
          <p style={styles.formSubtitle}>(Select one)</p>

          <div style={styles.radioGroup}>
            <h4 style={styles.radioGroupLabel}>HIGH SCHOOL</h4>
            {highSchoolLevels.map((lvl) => (
              <label key={lvl} style={styles.radioItem}>
                <input
                  type="radio"
                  name="educationCategory"
                  checked={
                    formData.educationCategory === 'HighSchool' &&
                    formData.educationLevel === lvl
                  }
                  onChange={() =>
                    setFormData({
                      ...formData,
                      educationCategory: 'HighSchool',
                      educationLevel: lvl,
                      otherEducationLevel: '',
                    })
                  }
                  style={styles.radio}
                />
                {lvl}
              </label>
            ))}
          </div>

          <div style={styles.radioGroup}>
            <h4 style={styles.radioGroupLabel}>COLLEGE</h4>
            {collegeLevels.map((lvl) => (
              <label key={lvl} style={styles.radioItem}>
                <input
                  type="radio"
                  name="educationCategory"
                  checked={
                    formData.educationCategory === 'College' &&
                    formData.educationLevel === lvl
                  }
                  onChange={() =>
                    setFormData({
                      ...formData,
                      educationCategory: 'College',
                      educationLevel: lvl,
                      otherEducationLevel: '',
                    })
                  }
                  style={styles.radio}
                />
                {lvl}
              </label>
            ))}
          </div>

          <div style={styles.radioGroup}>
            <label style={styles.radioItem}>
              <input
                type="radio"
                name="educationCategory"
                checked={formData.educationCategory === 'Other'}
                onChange={() =>
                  setFormData({
                    ...formData,
                    educationCategory: 'Other',
                    educationLevel: '',
                  })
                }
                style={styles.radio}
              />
              OTHER
            </label>
            {formData.educationCategory === 'Other' && (
              <input
                type="text"
                placeholder="Please specify"
                value={formData.otherEducationLevel}
                onChange={(e) =>
                  setFormData({ ...formData, otherEducationLevel: e.target.value })
                }
                style={styles.otherInput}
              />
            )}
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.bigContinueButton} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Subjects studied
  if (step === 3) {
    return (
      <div style={styles.gradientContainer}>
        <div style={styles.headerBar}>
          <button style={styles.backArrow} onClick={() => setStep(2)}>
            ←
          </button>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFill, width: `${currentProgress}%` }} />
          </div>
          <button style={styles.skipButton} onClick={() => skipOnboarding()}>
            Skip for now
          </button>
        </div>

        <div style={styles.formContent}>
          <h2 style={styles.formQuestion}>
            Which subjects have you studied or have experience in?
          </h2>
          <p style={styles.formSubtitle}>(Select all that apply)</p>

          <div style={styles.checkList}>
            {subjects.map((subj) => (
              <label key={subj} style={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handleSubjectsChange(subj)}
                  style={styles.checkbox}
                />
                {subj}
              </label>
            ))}
          </div>

          {formData.subjects.includes('Other (please specify)') && (
            <input
              type="text"
              placeholder="Please specify"
              value={formData.otherSubject}
              onChange={(e) =>
                setFormData({ ...formData, otherSubject: e.target.value })
              }
              style={styles.otherInput}
            />
          )}

          <div style={styles.buttonRow}>
            <button style={styles.bigContinueButton} onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: Coding experience
  if (step === 4) {
    return (
      <div style={styles.gradientContainer}>
        <div style={styles.headerBar}>
          <button style={styles.backArrow} onClick={() => setStep(3)}>
            ←
          </button>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFill, width: `${currentProgress}%` }} />
          </div>
          <button style={styles.skipButton} onClick={() => skipOnboarding()}>
            Skip for now
          </button>
        </div>

        <div style={styles.formContent}>
          <h2 style={styles.formQuestion}>How much coding experience do you have?</h2>
          <div style={styles.radioGroup}>
            {codingExperienceOptions.map((option) => (
              <label key={option} style={styles.radioItem}>
                <input
                  type="radio"
                  name="codingExp"
                  checked={formData.codingExperience === option}
                  onChange={() =>
                    setFormData({ ...formData, codingExperience: option })
                  }
                  style={styles.radio}
                />
                {option}
              </label>
            ))}
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.bigContinueButton} onClick={() => setStep(5)}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 5: Hobbies
  if (step === 5) {
    return (
      <div style={styles.gradientContainer}>
        <div style={styles.headerBar}>
          <button style={styles.backArrow} onClick={() => setStep(4)}>
            ←
          </button>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFill, width: `${currentProgress}%` }} />
          </div>
          <button style={styles.skipButton} onClick={() => skipOnboarding()}>
            Skip for now
          </button>
        </div>

        <div style={styles.formContent}>
          <h2 style={styles.formQuestion}>Select your favourite hobbies and interests</h2>
          <p style={styles.formSubtitle}>(Select all that apply)</p>

          <div style={styles.hobbiesContainer}>
            {hobbies.map((hobby) => (
              <button
                key={hobby}
                style={{
                  ...styles.hobbyButton,
                  backgroundColor: formData.favoriteHobbies.includes(hobby)
                    ? '#6D73FA'
                    : 'transparent',
                  color: formData.favoriteHobbies.includes(hobby) ? '#fff' : '#ccc',
                }}
                onClick={() => handleHobbyToggle(hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>

          <div style={styles.buttonRow}>
            <button
              style={styles.saveButton}
              onClick={handleSubmit}
              disabled={formData.favoriteHobbies.length < 1}
            >
              Save and continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;

  /** ------------------ HANDLER FUNCTIONS ------------------ **/

  function skipOnboarding() {
    // "Skip for now" => Submit partial data or navigate away
    handleSubmit();
  }

  function handleWhereHeardChange(option: string) {
    const { whereHeard } = formData;
    if (whereHeard.includes(option)) {
      const updated = whereHeard.filter((o: string) => o !== option);
      setFormData({ ...formData, whereHeard: updated });
    } else {
      setFormData({ ...formData, whereHeard: [...whereHeard, option] });
    }
  }

  function handleSubjectsChange(subj: string) {
    const currentSubjects = formData.subjects;
    if (currentSubjects.includes(subj)) {
      const updated = currentSubjects.filter((s: string) => s !== subj);
      setFormData({ ...formData, subjects: updated });
    } else {
      setFormData({ ...formData, subjects: [...currentSubjects, subj] });
    }
  }

  function handleHobbyToggle(hobby: string) {
    const currentHobbies = formData.favoriteHobbies;
    if (currentHobbies.includes(hobby)) {
      const updated = currentHobbies.filter((h: string) => h !== hobby);
      setFormData({ ...formData, favoriteHobbies: updated });
    } else {
      setFormData({ ...formData, favoriteHobbies: [...currentHobbies, hobby] });
    }
  }
};

/** ------------------ STYLES ------------------ **/
const styles: { [key: string]: React.CSSProperties } = {
  gradientContainer: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #010117, #071746)',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
  },
  backArrowSpace: {
    width: '2.5rem', // empty space to match arrow size
  },
  backArrow: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    marginRight: '1rem',
  },
  progressBarContainer: {
    flex: 1,
    background: '#2F2F4F',
    height: '10px',
    borderRadius: '5px',
    marginRight: '1rem',
    overflow: 'hidden',
  },
  progressBarFill: {
    background: '#6D73FA',
    height: '10px',
  },
  skipButton: {
    background: 'none',
    border: '1px solid #6D73FA',
    color: '#6D73FA',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  /** Kelvin Intro **/
  introCenterWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    textAlign: 'center',
  },
  introHeading: {
    fontSize: '3rem',
    marginBottom: '1.5rem',
  },
  introParagraph: {
    fontSize: '1.5rem',
    lineHeight: 1.6,
    marginBottom: '2rem',
    maxWidth: '700px',
  },
  assistantImage: {
    width: '350px',
    marginBottom: '2rem',
  },
  bigContinueButton: {
    backgroundColor: '#6D73FA',
    color: '#fff',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1rem',
  },
  /** Form Screens **/
  formContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '3rem',
    alignItems: 'center',
  },
  formQuestion: {
    fontSize: '2.2rem',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  formSubtitle: {
    marginBottom: '2rem',
    fontSize: '1.2rem',
    color: '#ccc',
    textAlign: 'center',
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '1.5rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
  },
  checkbox: {
    marginRight: '8px',
    transform: 'scale(1.3)',
  },
  otherInput: {
    marginTop: '1rem',
    padding: '0.8rem',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '600px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  buttonRow: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  radioGroup: {
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '600px',
  },
  radioGroupLabel: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
  },
  radioItem: {
    display: 'block',
    marginBottom: '0.8rem',
    fontSize: '1.2rem',
  },
  radio: {
    marginRight: '6px',
    transform: 'scale(1.3)',
  },
  hobbiesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    maxWidth: '700px',
    marginBottom: '2rem',
  },
  hobbyButton: {
    border: '1px solid #ccc',
    padding: '0.8rem 1.2rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    backgroundColor: '#6D73FA',
    color: '#fff',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  /** Video Overlay **/
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
  },
};

export default ProfileCreation;
