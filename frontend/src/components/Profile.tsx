// src/components/Profile.tsx
import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';

const API_BASE =
  (import.meta as any).env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://quantaide-api.vercel.app');

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
      .get(`${API_BASE}/get_user_profile`, { withCredentials: true })
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
      .post(`${API_BASE}/save_profile_picture`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(res => setData(d => ({ ...d, profilePicture: res.data.url })))
      .catch(console.error);
  };

  const handleSave = () => {
    setSaving(true);
    axios
      .post(
        `${API_BASE}/save_profile`,
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
        { withCredentials: true }
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
      .post(`${API_BASE}/logout`, {}, { withCredentials: true })
      .then(() => (window.location.href = '/'))
      .catch(console.error);
  };

  if (loading) return <div style={styles.page}>Loading…</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Back link */}
        <div
          style={styles.back}
          onClick={() => (window.location.href = '/map')}
        >
          ← Back
        </div>

        <h2 style={styles.heading}>Welcome back, {data.name}!</h2>

        {/* Profile Picture */}
        <div style={styles.avatarSection}>
          {data.profilePicture ? (
            <img
              src={data.profilePicture}
              alt="Profile"
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarFallback}>👤</div>
          )}
          <label style={styles.uploadLabel}>
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePicture}
              style={styles.fileInput}
            />
          </label>
        </div>

        {/* Education */}
        <div style={styles.section}>
          <div style={styles.label}>Education level</div>
          <div style={styles.optionsGrid}>
            {EDUCATION_LEVELS.map(lvl => (
              <label key={lvl} style={styles.radioLabel}>
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
              style={styles.textInput}
            />
          )}
        </div>

        {/* Major */}
        <div style={styles.section}>
          <div style={styles.label}>Major / Field of study</div>
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
            style={styles.textInput}
          />
        </div>

        {/* Coding Experience */}
        <div style={styles.section}>
          <div style={styles.label}>Coding experience</div>
          <div style={styles.optionsGrid}>
            {CODING_EXP.map(opt => (
              <label key={opt} style={styles.radioLabel}>
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
        <div style={styles.section}>
          <div style={styles.label}>Your hobbies & interests</div>
          <div style={styles.hobbyGrid}>
            {HOBBIES.map(h => (
              <button
                key={h}
                onClick={() => handleHobbyToggle(h)}
                style={{
                  ...styles.hobby,
                  ...(data.favoriteHobbies.includes(h)
                    ? styles.hobbySelected
                    : {})
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={styles.saveBtn}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={styles.logoutBtn}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p>Are you sure you want to log out?</p>
            <div style={styles.modalActions}>
              <button
                onClick={handleLogout}
                style={styles.saveBtn}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={styles.cancelBtn}
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#071746',
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  card: {
    width: 600,
    background: '#1C1F2E',
    borderRadius: 10,
    padding: 30,
    color: '#f8f8fa',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  back: {
    cursor: 'pointer',
    color: '#A487AE',
    fontSize: '1.1rem',
    marginBottom: 20
  },
  heading: {
    margin: 0,
    fontSize: '1.8rem',
    marginBottom: 30
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: 10,
    border: '3px solid #566395'
  },
  avatarFallback: {
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: '#394a6d',
    fontSize: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  uploadLabel: {
    background: '#566395',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  fileInput: {
    display: 'none'
  },
  section: {
    marginBottom: 25
  },
  label: {
    fontWeight: 600,
    marginBottom: 8
  },
  optionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.05)',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  textInput: {
    width: '100%',
    padding: '10px',
    borderRadius: 6,
    border: '1px solid #566395',
    background: '#0F1233',
    color: '#f8f8fa',
    fontSize: '1rem',
    marginTop: 8
  },
  hobbyGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
  },
  hobby: {
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid #566395',
    background: 'transparent',
    color: '#f8f8fa',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  hobbySelected: {
    background: '#566395'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 30
  },
  saveBtn: {
    flex: 1,
    marginRight: 10,
    padding: '12px',
    background: '#566395',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '1rem'
  },
  logoutBtn: {
    flex: 1,
    marginLeft: 10,
    padding: '12px',
    background: '#A487AE',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '1rem'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    background: '#fff',
    color: '#111',
    padding: 24,
    borderRadius: 8,
    width: 320,
    textAlign: 'center'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelBtn: {
    flex: 1,
    marginLeft: 8,
    background: '#ddd',
    color: '#111',
    border: 'none',
    borderRadius: 6,
    padding: '12px',
    cursor: 'pointer'
  }
};

export default Profile;
