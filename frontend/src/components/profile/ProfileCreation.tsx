// src/components/ProfileCreation.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { styles } from './ProfileCreationStyles';
import welcomeVideo from '@/assets/welcome.mp4';
import { stepConfigs } from './profileStepConfigs';
import type { FormData, FormHandlers, CommonProps } from './profileStepConfigs';
import DefaultStep from './DefaultStep';

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
