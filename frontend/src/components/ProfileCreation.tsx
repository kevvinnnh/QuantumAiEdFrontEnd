import React, { useEffect, useState } from 'react';
import axios from 'axios';

const educationLevels = [
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'Freshman in College',
  'Sophomore in College',
  'Junior in College',
  'Senior in College',
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

const ProfileCreation: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<any>({
    educationLevel: '',
    major: '',
    otherMajor: '',
    knowsQuantumComputing: '',
    codingExperience: '',
    favoriteHobby: '',
  });

  useEffect(() => {
    axios
      .get('http://localhost:5000/get_user_id', { withCredentials: true })
      .then((response) => {
        setUserId(response.data.user_id);
      })
      .catch((error) => {
        console.error('Error fetching user ID:', error);
      });
  }, []);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.educationLevel.includes('College')) {
        // High school student
        setStep(3); // Skip major selection
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

  const handleSubmit = () => {
    const dataToSend = {
      user_id: userId,
      ...formData,
    };

    axios
      .post('http://localhost:5000/save_profile', dataToSend, {
        withCredentials: true,
      })
      .then((response) => {
        console.log('Profile saved:', response.data);
        window.location.href = '/map';
      })
      .catch((error) => {
        console.error('Error saving profile:', error);
      });
  };

  return (
    <div className="profile-creation-container">
      <h2>Create Your Profile</h2>
      <p>Welcome, {userId} !</p>

      {step === 1 && (
        <div className="step">
          <h3>What is your education level?</h3>
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select your education level</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div className="navigation-buttons">
            <button
              className="button"
              onClick={handleNext}
              disabled={!formData.educationLevel}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && formData.educationLevel.includes('College') && (
        <div className="step">
          <h3>What is your college major?</h3>
          <select
            name="major"
            value={formData.major}
            onChange={handleChange}
            className="form-select"
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
              className="form-input"
            />
          )}
          <div className="navigation-buttons">
            <button className="button" onClick={handleBack}>
              Back
            </button>
            <button
              className="button"
              onClick={handleNext}
              disabled={
                !formData.major ||
                (formData.major === 'Other' && !formData.otherMajor)
              }
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
            <div className="step">
              <h3>Do you have knowledge of quantum computing?</h3>
              <select
                name="knowsQuantumComputing"
                value={formData.knowsQuantumComputing}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <div className="navigation-buttons">
                <button className="button" onClick={handleBack}>
                  Back
                </button>
                <button
                  className="button"
                  onClick={handleNext}
                  disabled={!formData.knowsQuantumComputing}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="step">
              <h3>How much coding experience do you have?</h3>
              <select
                name="codingExperience"
                value={formData.codingExperience}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select your coding experience</option>
                {codingExperienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="navigation-buttons">
                <button className="button" onClick={handleBack}>
                  Back
                </button>
                <button
                  className="button"
                  onClick={handleNext}
                  disabled={!formData.codingExperience}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <div className="step">
          <h3>What is your favorite hobby?</h3>
          <input
            type="text"
            name="favoriteHobby"
            placeholder="Enter your favorite hobby"
            value={formData.favoriteHobby}
            onChange={handleChange}
            className="form-input"
          />
          <div className="navigation-buttons">
            <button className="button" onClick={handleBack}>
              Back
            </button>
            <button
              className="button"
              onClick={handleSubmit}
              disabled={!formData.favoriteHobby}
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
