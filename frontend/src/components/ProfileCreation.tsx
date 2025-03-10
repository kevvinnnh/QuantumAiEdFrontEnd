import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import welcomeVideo from '../assets/welcome.mp4';

const educationLevels = [
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'Freshman in College',
  'Sophomore in College',
  'Junior in College',
  'Senior in College',
  'Other Education Level',
];

const majors = [
  'Computer Science',
  'Physics',
  'Mathematics',
  'Engineering',
  'Biology',
  'Chemistry',
  'Other',
];

const codingExperienceOptions = [
  '0 years',
  '<1 year',
  '1-2 years',
  '3-4 years',
  '4-5 years',
  '6+ years',
];

const hobbies = [
  'Reading',
  'Math',
  'Cooking',
  'Sports',
  'Music',
  'Art',
  'Photography',
  'Gardening',
  'Writing',
  'Dancing',
  'Gaming',
  'Hiking',
];

const ProfileCreation: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  // step: 1, 2, 3, 4 for the form; once finished, we show the video popup by setting showVideoPopup=true.
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<any>({
    educationLevel: '',
    major: '',
    otherMajor: '',
    knowsQuantumComputing: '',
    codingExperience: '',
    favoriteHobbies: [],
  });
  const [showVideoPopup, setShowVideoPopup] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/get_user_id', { withCredentials: true })
      .then((response) => {
        const uid = response.data.user_id;
        console.log('ProfileCreation: session user_id =', uid);
        setUserId(uid);
      })
      .catch((error) => {
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.educationLevel.includes('College')) {
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step === 4) {
      setStep(3);
    } else if (step === 3) {
      if (!formData.educationLevel.includes('College')) {
        setStep(1);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHobbyChange = (hobby: string) => {
    setFormData((prev: any) => {
      const { favoriteHobbies } = prev;
      if (favoriteHobbies.includes(hobby)) {
        return {
          ...prev,
          favoriteHobbies: favoriteHobbies.filter((h: string) => h !== hobby),
        };
      } else {
        if (favoriteHobbies.length < 4) {
          return {
            ...prev,
            favoriteHobbies: [...favoriteHobbies, hobby],
          };
        } else {
          return prev;
        }
      }
    });
  };

  const handleSubmit = () => {
    const dataToSend = {
      user_id: userId,
      educationLevel: formData.educationLevel,
      college_major: formData.major,
      other_major: formData.otherMajor,
      knowsQuantumComputing: formData.knowsQuantumComputing,
      codingExperience: formData.codingExperience,
      favoriteHobbies: formData.favoriteHobbies,
    };

    console.log('DEBUG: Submitting profile =>', dataToSend);

    axios
      .post('http://localhost:5000/save_profile', dataToSend, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('Profile saved:', response.data);
        // Instead of redirecting immediately, show the welcome video popup.
        setShowVideoPopup(true);
      })
      .catch((error) => {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. See console logs.');
      });
  };

  // Render the welcome video popup if showVideoPopup is true.
  if (showVideoPopup) {
    return (
      <div
        style={{
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
        }}
      >
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Welcome to QuantumAiEd!</h2>
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
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#566395',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
          }}
        >
          Skip Video
        </button>
      </div>
    );
  }

  return (
    <div className="profile-creation-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Create Your Profile</h2>
      <p style={{ textAlign: 'center' }}>Welcome, {userId}!</p>

      {step === 1 && (
        <div className="step" style={{ marginBottom: '20px' }}>
          <h3>What is your education level?</h3>
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', fontSize: '1em' }}
          >
            <option value="">Select your education level</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={handleNext}
              disabled={!formData.educationLevel}
              style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && formData.educationLevel.includes('College') && (
        <div className="step" style={{ marginBottom: '20px' }}>
          <h3>What is your college major?</h3>
          <select
            name="major"
            value={formData.major}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', fontSize: '1em' }}
          >
            <option value="">Select your major</option>
            {majors.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
          {formData.major === 'Other' && (
            <input
              type="text"
              name="otherMajor"
              placeholder="Please specify your major"
              value={formData.otherMajor}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', fontSize: '1em', marginTop: '10px' }}
            />
          )}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={handleBack}
              style={{ padding: '10px 20px', fontSize: '1em', marginRight: '10px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.major || (formData.major === 'Other' && !formData.otherMajor)}
              style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {formData.educationLevel.includes('College') &&
          formData.major === 'Computer Science' ? (
            <div className="step" style={{ marginBottom: '20px' }}>
              <h3>Do you have knowledge of quantum computing?</h3>
              <select
                name="knowsQuantumComputing"
                value={formData.knowsQuantumComputing}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', fontSize: '1em' }}
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  onClick={handleBack}
                  style={{ padding: '10px 20px', fontSize: '1em', marginRight: '10px', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.knowsQuantumComputing}
                  style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="step" style={{ marginBottom: '20px' }}>
              <h3>How much coding experience do you have, if any?</h3>
              <select
                name="codingExperience"
                value={formData.codingExperience}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', fontSize: '1em' }}
              >
                <option value="">Select your coding experience</option>
                {codingExperienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  onClick={handleBack}
                  style={{ padding: '10px 20px', fontSize: '1em', marginRight: '10px', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.codingExperience}
                  style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <div className="step" style={{ marginBottom: '20px' }}>
          <h3>Select your hobbies (2-4):</h3>
          <div className="hobbies-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {hobbies.map((hobby) => (
              <label key={hobby} className="hobby-item" style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="favoriteHobbies"
                  value={hobby}
                  checked={formData.favoriteHobbies.includes(hobby)}
                  onChange={() => handleHobbyChange(hobby)}
                  style={{ marginRight: '5px' }}
                />
                <span>{hobby}</span>
              </label>
            ))}
          </div>
          <p style={{ marginTop: '10px' }}>
            Selected: {formData.favoriteHobbies.join(', ')} ({formData.favoriteHobbies.length} total)
          </p>
          <p style={{ fontStyle: 'italic' }}>
            You must have between 2 and 4 hobbies selected.
          </p>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={handleBack}
              style={{ padding: '10px 20px', fontSize: '1em', marginRight: '10px', cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                formData.favoriteHobbies.length < 2 ||
                formData.favoriteHobbies.length > 4
              }
              style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCreation;
