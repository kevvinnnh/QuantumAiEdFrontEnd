// src/components/Profile/Profile.tsx

import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import styles from './Profile.module.scss';

// Base URL for API (uses same env var across your app)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const HOBBIES = [
  'Reading', 'Music', 'Dancing', 'Photography',
  'Cooking', 'Gaming', 'Gardening', 'Writing',
  'Sports', 'Art', 'Hiking'
];

const EDUCATION_LEVELS = [
  '9th Grade', '10th Grade', '11th Grade', '12th Grade',
  'Freshman', 'Sophomore', 'Junior', 'Senior', 'Other'
];

const CODING_EXP = [
  'No experience (0 years)',
  'Less than 1 year',
  '1–2 years',
  '3–4 years',
  '4–5 years',
  'More than 5 years'
];

interface ProfileData {
  name: string;
  profilePicture: string;
  educationLevel: string;
  otherEducation?: string;
  major: string;
  otherMajor?: string;
  codingExperience: string;
  favoriteHobbies: string[];
}

const Profile: React.FC = () => {
  const [data, setData] = useState<ProfileData>({
    name: '',
    profilePicture: '',
    educationLevel: '',
    otherEducation: '',
    major: '',
    otherMajor: '',
    codingExperience: '',
    favoriteHobbies: []
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${backendUrl}/get_user_profile`, { withCredentials: true })
      .then(res => {
        const d = res.data;
        setData({
          name: d.name,
          profilePicture: d.profilePicture,
          educationLevel: EDUCATION_LEVELS.includes(d.educationLevel)
            ? d.educationLevel
            : 'Other',
          otherEducation: EDUCATION_LEVELS.includes(d.educationLevel)
            ? ''
            : d.educationLevel,
          major: d.major || '',
          otherMajor: '',
          codingExperience: d.codingExperience || '',
          favoriteHobbies: Array.isArray(d.favoriteHobbies)
            ? d.favoriteHobbies
            : []
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange =
    (k: keyof ProfileData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData(d => ({ ...d, [k]: e.target.value }));

  const handleHobbyToggle = (hobby: string) => {
    setData(d => {
      const fav = d.favoriteHobbies.includes(hobby)
        ? d.favoriteHobbies.filter(h => h !== hobby)
        : [...d.favoriteHobbies, hobby];
      return { ...d, favoriteHobbies: fav };
    });
  };

  const handlePicture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('picture', file);
    axios
      .post(
        `${backendUrl}/save_profile_picture`,
        form,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      .then(res => setData(d => ({ ...d, profilePicture: res.data.url })))
      .catch(console.error);
  };

  const handleSave = () => {
    setSaving(true);
    axios
      .post(
        `${backendUrl}/save_profile`,
        {
          educationLevel:
            data.educationLevel === 'Other'
              ? data.otherEducation
              : data.educationLevel,
          college_major:
            data.major !== 'Other' ? data.major : undefined,
          other_major:
            data.major === 'Other' ? data.otherMajor : undefined,
          codingExperience: data.codingExperience,
          favoriteHobbies: data.favoriteHobbies
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )
      .then(() => alert('Profile saved!'))
      .catch(err => {
        console.error(err);
        alert('Save failed');
      })
      .finally(() => setSaving(false));
  };

  const handleLogout = () => {
    axios
      .post(
        `${backendUrl}/logout`,
        {},
        { withCredentials: true }
      )
      .then(() => (window.location.href = '/'))
      .catch(console.error);
  };

  if (loading) return <div className={styles.page}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div
          className={styles.back}
          onClick={() => (window.location.href = '/map')}
        >
          ← Back
        </div>

        <h2 className={styles.heading}>Welcome back, {data.name}!</h2>

        <div className={styles.avatarSection}>
          {data.profilePicture ? (
            <img
              src={data.profilePicture}
              alt="Profile"
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>👤</div>
          )}
          <label className={styles.uploadLabel}>
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePicture}
              className={styles.fileInput}
            />
          </label>
        </div>

        {/* Education */}
        <div className={styles.section}>
          <div className={styles.label}>Education level</div>
          <div className={styles.optionsGrid}>
            {EDUCATION_LEVELS.map(lvl => (
              <label key={lvl} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="education"
                  value={lvl}
                  checked={data.educationLevel === lvl}
                  onChange={handleChange('educationLevel')}
                />
                {lvl}
              </label>
            ))}
          </div>
          {data.educationLevel === 'Other' && (
            <input
              placeholder="Please specify"
              value={data.otherEducation}
              onChange={handleChange('otherEducation')}
              className={styles.textInput}
            />
          )}
        </div>

        {/* Major */}
        <div className={styles.section}>
          <div className={styles.label}>Major / Field of study</div>
          <input
            type="text"
            placeholder="Your major"
            value={
              data.major !== 'Other' ? data.major : data.otherMajor || ''
            }
            onChange={e => {
              const v = e.target.value;
              if (EDUCATION_LEVELS.includes(v))
                setData(d => ({
                  ...d,
                  major: v,
                  otherMajor: ''
                }));
              else
                setData(d => ({
                  ...d,
                  major: 'Other',
                  otherMajor: v
                }));
            }}
            className={styles.textInput}
          />
        </div>

        {/* Coding Experience */}
        <div className={styles.section}>
          <div className={styles.label}>Coding experience</div>
          <div className={styles.optionsGrid}>
            {CODING_EXP.map(opt => (
              <label key={opt} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="coding"
                  value={opt}
                  checked={data.codingExperience === opt}
                  onChange={handleChange('codingExperience')}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Hobbies */}
        <div className={styles.section}>
          <div className={styles.label}>Your hobbies & interests</div>
          <div className={styles.hobbyGrid}>
            {HOBBIES.map(h => (
              <button
                key={h}
                onClick={() => handleHobbyToggle(h)}
                className={`${styles.hobby} ${
                  data.favoriteHobbies.includes(h) ? styles.selected : ''
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={handleSave}
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={styles.logoutBtn}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <button
                onClick={handleLogout}
                className={styles.saveBtn}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;