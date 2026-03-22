// src/components/Profile.tsx — Profile Settings Modal

import React, { useEffect, useRef, useState, useCallback, ChangeEvent } from 'react';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import api, { BACKEND_URL } from '../api';

const highSchoolLevels = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];
const collegeLevels = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

const subjects = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Other (please specify)',
];

const codingExperienceOptions = [
  'No experience (0 years)',
  'Less than 1 year',
  '1-2 year',
  '3-4 years',
  '4-5 years',
  'More than 5 years',
];

const hobbies = [
  'Reading', 'Music', 'Dancing', 'Photography',
  'Cooking', 'Gaming', 'Gardening', 'Writing',
  'Sports', 'Art', 'Hiking',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userPicture?: string;
}

interface ProfileData {
  name: string;
  profilePicture: string;
  educationCategory: string;
  educationLevel: string;
  otherEducationLevel: string;
  subjectsStudied: string[];
  otherSubject: string;
  codingExperience: string;
  favoriteHobbies: string[];
  customHobbies: string;
  hobbyPersonalization: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userName: propName, userPicture: propPicture }) => {
  const [data, setData] = useState<ProfileData>({
    name: '',
    profilePicture: '',
    educationCategory: '',
    educationLevel: '',
    otherEducationLevel: '',
    subjectsStudied: [],
    otherSubject: '',
    codingExperience: '',
    favoriteHobbies: [],
    customHobbies: '',
    hobbyPersonalization: true,
    hasPassword: false,
    hasGoogle: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const fetchProfile = useCallback(() => {
    setLoading(true);
    api
      .get('/get_user_profile')
      .then(res => {
        const d = res.data;
        // Parse education: educationLevel is stored as "High School - 10th Grade" or "College - Sophomore" etc
        let eduCategory = d.educationCategory || '';
        let eduLevel = '';
        let otherEdu = '';

        if (eduCategory === 'HighSchool' || eduCategory === 'College' || eduCategory === 'Other') {
          // educationLevel from backend is the processed string like "High School - 10th Grade"
          const rawEdu = d.educationLevel || '';
          if (rawEdu.startsWith('High School - ')) {
            eduCategory = 'HighSchool';
            eduLevel = rawEdu.replace('High School - ', '');
          } else if (rawEdu.startsWith('College - ')) {
            eduCategory = 'College';
            eduLevel = rawEdu.replace('College - ', '');
          } else if (eduCategory === 'Other') {
            otherEdu = rawEdu;
          }
        } else if (d.educationLevel) {
          // Fallback: try to parse from the processed string
          const rawEdu = d.educationLevel;
          if (rawEdu.startsWith('High School - ')) {
            eduCategory = 'HighSchool';
            eduLevel = rawEdu.replace('High School - ', '');
          } else if (rawEdu.startsWith('College - ')) {
            eduCategory = 'College';
            eduLevel = rawEdu.replace('College - ', '');
          } else if (highSchoolLevels.includes(rawEdu)) {
            eduCategory = 'HighSchool';
            eduLevel = rawEdu;
          } else if (collegeLevels.includes(rawEdu)) {
            eduCategory = 'College';
            eduLevel = rawEdu;
          } else if (rawEdu && rawEdu !== 'Not provided') {
            eduCategory = 'Other';
            otherEdu = rawEdu;
          }
        }

        // Parse subjects: separate "Other" entries from known subjects
        const rawSubjects: string[] = d.subjectsStudied || [];
        const knownSubjectNames = subjects.filter(s => s !== 'Other (please specify)');
        const known: string[] = [];
        let otherSubj = '';
        for (const s of rawSubjects) {
          if (knownSubjectNames.includes(s)) {
            known.push(s);
          } else {
            otherSubj = s;
          }
        }
        const subjectsList = [...known];
        if (otherSubj) {
          subjectsList.push('Other (please specify)');
        }

        setData({
          name: d.name || '',
          profilePicture: d.profilePicture || '',
          educationCategory: eduCategory,
          educationLevel: eduLevel,
          otherEducationLevel: otherEdu,
          subjectsStudied: subjectsList,
          otherSubject: otherSubj,
          codingExperience: d.codingExperience || '',
          favoriteHobbies: d.favoriteHobbies || [],
          customHobbies: d.customHobbies || '',
          hobbyPersonalization: d.hobbyPersonalization !== false,
          hasPassword: d.hasPassword || false,
          hasGoogle: d.hasGoogle || false,
        });
      })
      .catch(() => { /* Profile may not be complete yet */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setSaveMessage('');
    }
  }, [isOpen, fetchProfile]);

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const getFocusable = () =>
      modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Focus the close button on open
    const focusable = getFocusable();
    if (focusable.length > 0) focusable[0].focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  const handlePicture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('picture', file);
    api
      .post('/save_profile_picture', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => setData(d => ({ ...d, profilePicture: res.data.url })))
      .catch(console.error);
  };

  const handleSubjectToggle = (subj: string) => {
    setData(d => {
      const current = d.subjectsStudied;
      if (current.includes(subj)) {
        return { ...d, subjectsStudied: current.filter(s => s !== subj) };
      }
      return { ...d, subjectsStudied: [...current, subj] };
    });
  };

  const handleHobbyToggle = (hobby: string) => {
    setData(d => {
      const current = d.favoriteHobbies;
      if (current.includes(hobby)) {
        return { ...d, favoriteHobbies: current.filter(h => h !== hobby) };
      }
      return { ...d, favoriteHobbies: [...current, hobby] };
    });
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordMessage('');

    if (data.hasPassword && !currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const payload: Record<string, string> = { new_password: newPassword };
      if (data.hasPassword) payload.current_password = currentPassword;
      const res = await api.post('/auth/change-password', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setPasswordMessage(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setData(d => ({ ...d, hasPassword: true }));
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setPasswordError(err.response.data.error);
      } else {
        setPasswordError('An error occurred. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    api
      .post(
        '/save_profile',
        {
          educationCategory: data.educationCategory,
          educationLevel: data.educationLevel,
          otherEducationLevel: data.otherEducationLevel,
          subjects: data.subjectsStudied,
          otherSubject: data.otherSubject,
          codingExperience: data.codingExperience,
          favoriteHobbies: data.favoriteHobbies,
          customHobbies: data.customHobbies,
          hobbyPersonalization: data.hobbyPersonalization,
        },
      )
      .then(() => setSaveMessage('Profile saved!'))
      .catch(() => setSaveMessage('Save failed. Please try again.'))
      .finally(() => setSaving(false));
  };

  if (!isOpen) return null;

  const displayNameRaw = data.name || propName || '';
  const firstName = displayNameRaw ? displayNameRaw.split(' ')[0] : 'User';
  const rawPic = data.profilePicture || propPicture || '';
  const picSrc = rawPic
    ? (rawPic.startsWith('http') ? rawPic : `${BACKEND_URL}${rawPic}`)
    : '';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        style={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Profile settings"
      >
        {/* Close button */}
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
          <IoMdClose size={22} color="#AAAAC1" />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#AAAAC1' }}>Loading...</div>
        ) : (
          <div style={styles.content}>
            {/* Header: Avatar + Greeting */}
            <div style={styles.avatarSection}>
              {picSrc ? (
                <img src={picSrc} alt="Profile" style={styles.avatar} />
              ) : (
                <div style={styles.avatarFallback}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <label style={styles.uploadLabel}>
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePicture}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <h2 style={styles.greeting}>Welcome back, {firstName}!</h2>

            {/* Education Level */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                What is your education level?
                <span style={styles.tooltip} title="Helps us tailor content difficulty to your level">&#9432;</span>
              </h3>

              <h4 style={styles.groupLabel}>HIGH SCHOOL</h4>
              <div style={styles.radioRow}>
                {highSchoolLevels.map(lvl => (
                  <label
                    key={lvl}
                    style={{
                      ...styles.radioItem,
                      backgroundColor: (data.educationCategory === 'HighSchool' && data.educationLevel === lvl) ? '#10204D' : 'transparent',
                      borderColor: (data.educationCategory === 'HighSchool' && data.educationLevel === lvl) ? '#1D4177' : '#434F62',
                    }}
                  >
                    <input
                      type="radio"
                      checked={data.educationCategory === 'HighSchool' && data.educationLevel === lvl}
                      onChange={() => setData(d => ({ ...d, educationCategory: 'HighSchool', educationLevel: lvl, otherEducationLevel: '' }))}
                      style={styles.radio}
                    />
                    {lvl}
                  </label>
                ))}
              </div>

              <h4 style={styles.groupLabel}>COLLEGE</h4>
              <div style={styles.radioRow}>
                {collegeLevels.map(lvl => (
                  <label
                    key={lvl}
                    style={{
                      ...styles.radioItem,
                      backgroundColor: (data.educationCategory === 'College' && data.educationLevel === lvl) ? '#10204D' : 'transparent',
                      borderColor: (data.educationCategory === 'College' && data.educationLevel === lvl) ? '#1D4177' : '#434F62',
                    }}
                  >
                    <input
                      type="radio"
                      checked={data.educationCategory === 'College' && data.educationLevel === lvl}
                      onChange={() => setData(d => ({ ...d, educationCategory: 'College', educationLevel: lvl, otherEducationLevel: '' }))}
                      style={styles.radio}
                    />
                    {lvl}
                  </label>
                ))}
              </div>

              <div style={styles.radioRow}>
                <label
                  style={{
                    ...styles.radioItem,
                    ...styles.radioItemExpanded,
                    backgroundColor: data.educationCategory === 'Other' ? '#10204D' : 'transparent',
                    borderColor: data.educationCategory === 'Other' ? '#1D4177' : '#434F62',
                  }}
                >
                  <input
                    type="radio"
                    checked={data.educationCategory === 'Other'}
                    onChange={() => setData(d => ({ ...d, educationCategory: 'Other', educationLevel: '' }))}
                    style={styles.radio}
                  />
                  <div style={styles.optionContent}>
                    <span>Other (please specify)</span>
                    {data.educationCategory === 'Other' && (
                      <input
                        type="text"
                        placeholder="Type here..."
                        value={data.otherEducationLevel}
                        onChange={e => setData(d => ({ ...d, otherEducationLevel: e.target.value }))}
                        style={styles.inlineInput}
                        autoFocus
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Subjects */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Subjects studied or experienced
                <span style={styles.tooltip} title="Helps us understand your background knowledge">&#9432;</span>
              </h3>
              <p style={styles.sectionSubtitle}>(Select all that apply)</p>
              <div style={styles.checkList}>
                {subjects.map(subj =>
                  subj === 'Other (please specify)' ? (
                    <label
                      key={subj}
                      style={{
                        ...styles.checkItem,
                        ...styles.checkItemExpanded,
                        backgroundColor: data.subjectsStudied.includes(subj) ? '#10204D' : 'transparent',
                        borderColor: data.subjectsStudied.includes(subj) ? '#1D4177' : '#434F62',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={data.subjectsStudied.includes(subj)}
                        onChange={() => handleSubjectToggle(subj)}
                        style={styles.checkbox}
                      />
                      <div style={styles.optionContent}>
                        <span>Other (please specify)</span>
                        {data.subjectsStudied.includes(subj) && (
                          <input
                            type="text"
                            placeholder="Type here..."
                            value={data.otherSubject}
                            onChange={e => setData(d => ({ ...d, otherSubject: e.target.value }))}
                            style={styles.inlineInput}
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
                        backgroundColor: data.subjectsStudied.includes(subj) ? '#10204D' : 'transparent',
                        borderColor: data.subjectsStudied.includes(subj) ? '#1D4177' : '#434F62',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={data.subjectsStudied.includes(subj)}
                        onChange={() => handleSubjectToggle(subj)}
                        style={styles.checkbox}
                      />
                      {subj}
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Coding Experience */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                How much coding experience do you have?
                <span style={styles.tooltip} title="Helps us adjust code examples and technical depth">&#9432;</span>
              </h3>
              <div style={styles.radioGroup}>
                {codingExperienceOptions.map(opt => (
                  <label
                    key={opt}
                    style={{
                      ...styles.radioItemFull,
                      backgroundColor: data.codingExperience === opt ? '#10204D' : 'transparent',
                      borderColor: data.codingExperience === opt ? '#1D4177' : '#434F62',
                    }}
                  >
                    <input
                      type="radio"
                      checked={data.codingExperience === opt}
                      onChange={() => setData(d => ({ ...d, codingExperience: opt }))}
                      style={styles.radio}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                Your hobbies &amp; interests
                <span style={styles.tooltip} title="Listed hobbies can influence the personalization of your AI responses when the toggle below is enabled">&#9432;</span>
              </h3>
              <p style={styles.sectionSubtitle}>(Select all that apply)</p>
              <div style={styles.hobbyGrid}>
                {hobbies.map(h => (
                  <button
                    key={h}
                    onClick={() => handleHobbyToggle(h)}
                    style={{
                      ...styles.hobbyBtn,
                      backgroundColor: data.favoriteHobbies.includes(h) ? '#10204D' : 'transparent',
                      borderColor: data.favoriteHobbies.includes(h) ? '#1D4177' : '#434F62',
                      color: data.favoriteHobbies.includes(h) ? '#FFFFFF' : '#AAAAC1',
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div style={styles.customHobbiesSection}>
                <p style={{ ...styles.sectionSubtitle, marginTop: 12 }}>Want to be more specific? Add your own</p>
                <input
                  type="text"
                  placeholder="(e.g. violin, bird watching, spoken word poetry)"
                  value={data.customHobbies}
                  onChange={e => setData(d => ({ ...d, customHobbies: e.target.value }))}
                  style={styles.customHobbiesInput}
                />
              </div>

              {/* Personalization toggle */}
              <div style={{ marginTop: 20 }}>
                <h3 style={styles.sectionTitle}>
                  Allow hobby personalization
                  <span style={styles.tooltip} title="AI responses will use your hobbies to create relatable analogies">&#9432;</span>
                </h3>
                <label style={styles.toggleRowFlat}>
                  <span style={{ color: '#AAAAC1', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                    {data.hobbyPersonalization ? 'Enabled — AI uses your hobbies for analogies' : 'Disabled — AI uses generic examples'}
                  </span>
                  <button
                    type="button"
                    aria-pressed={data.hobbyPersonalization}
                    onClick={() => setData(d => ({ ...d, hobbyPersonalization: !d.hobbyPersonalization }))}
                    style={{
                      ...styles.toggleTrack,
                      backgroundColor: data.hobbyPersonalization ? '#3B89FF' : '#434F62',
                    }}
                  >
                    <div
                      style={{
                        ...styles.toggleThumb,
                        transform: data.hobbyPersonalization ? 'translateX(18px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Change Password / Set Password */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {data.hasPassword ? 'Change password' : 'Set a password'}
                <span
                  style={styles.tooltip}
                  title={data.hasPassword
                    ? 'Update your email/password login credentials'
                    : 'Add a password to also log in with email and password'
                  }
                >&#9432;</span>
              </h3>
              {data.hasGoogle && !data.hasPassword && (
                <p style={{ ...styles.sectionSubtitle, marginBottom: 12 }}>
                  You currently sign in with Google. Set a password to also use email login.
                </p>
              )}
              {data.hasPassword && (
                <div style={{ marginBottom: 12 }}>
                  <label style={styles.inputLabel}>Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={styles.passwordInput}
                    autoComplete="current-password"
                  />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={styles.inputLabel}>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={styles.passwordInput}
                  autoComplete="new-password"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.inputLabel}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={styles.passwordInput}
                  autoComplete="new-password"
                />
              </div>
              {passwordError && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 8 }}>{passwordError}</p>}
              {passwordMessage && <p style={{ color: '#4ade80', fontSize: 13, marginBottom: 8 }}>{passwordMessage}</p>}
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                style={{
                  ...styles.secondaryBtn,
                  opacity: changingPassword ? 0.6 : 1,
                }}
              >
                {changingPassword ? 'Updating...' : (data.hasPassword ? 'Update Password' : 'Set Password')}
              </button>
            </div>

            {/* Auth methods info */}
            <div style={{ marginBottom: 28, fontSize: 13, color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
              <span>Linked sign-in methods: </span>
              {data.hasGoogle && <span style={{ color: '#4ade80', marginRight: 8 }}>Google</span>}
              {data.hasPassword && <span style={{ color: '#60a5fa' }}>Email/Password</span>}
              {!data.hasGoogle && !data.hasPassword && <span>None</span>}
            </div>

            {/* Save */}
            <div style={styles.saveSection}>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveMessage && (
                <p style={{
                  ...styles.saveMessage,
                  color: saveMessage.includes('failed') ? '#ff6b6b' : '#4ade80',
                }}>
                  {saveMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    position: 'relative',
    backgroundColor: '#182549',
    borderRadius: 16,
    width: 600,
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.5)',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    overflowY: 'auto',
    padding: '32px 36px',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #424E62',
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: '#10204D',
    border: '3px solid #424E62',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    color: '#AAAAC1',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
  },
  uploadLabel: {
    marginTop: 10,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #424E62',
    backgroundColor: 'transparent',
    color: '#AAAAC1',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  greeting: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    margin: '8px 0 28px',
    letterSpacing: '.02em',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    margin: '0 0 6px',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: '0 0 12px',
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: '12px 0 8px',
    letterSpacing: '0.05em',
  },
  radioRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  radioItemFull: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: 8,
  },
  radioItemExpanded: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  radio: {
    appearance: 'none' as const,
    width: 16,
    height: 16,
    border: '2px solid #AAAAC1',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    marginRight: 10,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  radioGroup: {
    marginTop: 8,
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkItemExpanded: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  checkbox: {
    appearance: 'none' as const,
    width: 16,
    height: 16,
    border: '2px solid #AAAAC1',
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginRight: 10,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  },
  inlineInput: {
    padding: '6px 0',
    fontSize: 14,
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #424E62',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  hobbyGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  hobbyBtn: {
    padding: '8px 18px',
    borderRadius: 8,
    border: '2px solid #434F62',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  customHobbiesSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  customHobbiesInput: {
    width: '100%',
    padding: '10px 0',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: 8,
    outline: 'none',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  saveSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
  saveBtn: {
    padding: '12px 40px',
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#142748',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  saveMessage: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
  tooltip: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
    cursor: 'help',
    verticalAlign: 'middle',
  },
  toggleRowFlat: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    cursor: 'pointer',
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    position: 'relative' as const,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.2s ease',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    position: 'absolute' as const,
    top: 3,
    left: 3,
    transition: 'transform 0.2s ease',
  },
  inputLabel: {
    display: 'block',
    fontSize: 13,
    color: '#AAAAC1',
    fontFamily: "'Inter', sans-serif",
    marginBottom: 4,
  },
  passwordInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#10204D',
    border: '2px solid #434F62',
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  secondaryBtn: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#10204D',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Inject hover/checked styles matching ProfileCreation
const addProfileModalStyles = () => {
  const id = 'profile-modal-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    /* Radio checked */
    [aria-label="Profile settings"] input[type="radio"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }
    [aria-label="Profile settings"] input[type="radio"]:checked::after {
      content: '';
      position: absolute;
      left: 0px;
      top: 0px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #3B89FF;
      border: 2px solid #131C46;
    }
    [aria-label="Profile settings"] input[type="radio"]:hover {
      border-color: #3B89FF !important;
    }
    /* Checkbox checked */
    [aria-label="Profile settings"] input[type="checkbox"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }
    [aria-label="Profile settings"] input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 0px;
      width: 4px;
      height: 8px;
      border: solid #0F1F4C;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    [aria-label="Profile settings"] input[type="checkbox"]:hover {
      border-color: #3B89FF !important;
    }
    /* Label hover */
    [aria-label="Profile settings"] label:has(input[type="checkbox"]):hover,
    [aria-label="Profile settings"] label:has(input[type="radio"]):hover {
      border-color: #1E4277 !important;
    }
    /* Inline input focus */
    [aria-label="Profile settings"] input[type="text"]:focus {
      border-bottom-color: #7BA8ED !important;
    }
    [aria-label="Profile settings"] input[type="text"]::placeholder {
      color: #666 !important;
      font-style: italic;
    }
    /* Save button hover */
    [aria-label="Profile settings"] button:hover:not(:disabled) {
      opacity: 0.9;
    }
    /* Scrollbar styling */
    [aria-label="Profile settings"] > div:last-child::-webkit-scrollbar {
      width: 6px;
    }
    [aria-label="Profile settings"] > div:last-child::-webkit-scrollbar-track {
      background: transparent;
    }
    [aria-label="Profile settings"] > div:last-child::-webkit-scrollbar-thumb {
      background: #424E62;
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addProfileModalStyles();
}

export default ProfileModal;
