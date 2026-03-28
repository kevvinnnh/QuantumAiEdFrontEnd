// src/components/Profile.tsx — Profile Settings Modal

import React, { useEffect, useRef, useState, useCallback, ChangeEvent } from 'react';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import api, { BACKEND_URL } from '@/api';
import { highSchoolLevels, collegeLevels, subjects } from '@/constants/formOptions';
import { styles } from './ProfileStyles';
import ProfilePictureUpload from './ProfilePictureUpload';
import ProfileFormFields from './ProfileFormFields';
import PasswordChangeSection from './PasswordChangeSection';

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
    void api
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
    void api
      .post('/save_profile_picture', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => setData(d => ({ ...d, profilePicture: res.data.url })))
      .catch((err: unknown) => { console.error(err); });
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
    void api
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
            <ProfilePictureUpload
              picSrc={picSrc}
              firstName={firstName}
              onPictureChange={handlePicture}
            />

            <h2 style={styles.greeting}>Welcome back, {firstName}!</h2>

            <ProfileFormFields
              educationCategory={data.educationCategory}
              educationLevel={data.educationLevel}
              otherEducationLevel={data.otherEducationLevel}
              subjectsStudied={data.subjectsStudied}
              otherSubject={data.otherSubject}
              codingExperience={data.codingExperience}
              favoriteHobbies={data.favoriteHobbies}
              customHobbies={data.customHobbies}
              hobbyPersonalization={data.hobbyPersonalization}
              onEducationChange={(cat, lvl, other) => setData(d => ({ ...d, educationCategory: cat, educationLevel: lvl, otherEducationLevel: other }))}
              onSubjectToggle={handleSubjectToggle}
              onOtherSubjectChange={(val) => setData(d => ({ ...d, otherSubject: val }))}
              onCodingExperienceChange={(opt) => setData(d => ({ ...d, codingExperience: opt }))}
              onHobbyToggle={handleHobbyToggle}
              onCustomHobbiesChange={(val) => setData(d => ({ ...d, customHobbies: val }))}
              onHobbyPersonalizationToggle={() => setData(d => ({ ...d, hobbyPersonalization: !d.hobbyPersonalization }))}
            />

            <PasswordChangeSection
              hasPassword={data.hasPassword}
              hasGoogle={data.hasGoogle}
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              passwordMessage={passwordMessage}
              changingPassword={changingPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onChangePassword={() => { void handleChangePassword(); }}
            />

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

export default ProfileModal;
