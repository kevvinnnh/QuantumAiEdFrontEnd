import React from 'react';
import {
  highSchoolLevels,
  collegeLevels,
  subjects,
  codingExperienceOptions,
  hobbies,
} from '@/constants/formOptions';
import { styles } from './ProfileStyles';

interface ProfileFormFieldsProps {
  educationCategory: string;
  educationLevel: string;
  otherEducationLevel: string;
  subjectsStudied: string[];
  otherSubject: string;
  codingExperience: string;
  favoriteHobbies: string[];
  customHobbies: string;
  hobbyPersonalization: boolean;
  onEducationChange: (category: string, level: string, other: string) => void;
  onSubjectToggle: (subject: string) => void;
  onOtherSubjectChange: (value: string) => void;
  onCodingExperienceChange: (value: string) => void;
  onHobbyToggle: (hobby: string) => void;
  onCustomHobbiesChange: (value: string) => void;
  onHobbyPersonalizationToggle: () => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  educationCategory,
  educationLevel,
  otherEducationLevel,
  subjectsStudied,
  otherSubject,
  codingExperience,
  favoriteHobbies,
  customHobbies,
  hobbyPersonalization,
  onEducationChange,
  onSubjectToggle,
  onOtherSubjectChange,
  onCodingExperienceChange,
  onHobbyToggle,
  onCustomHobbiesChange,
  onHobbyPersonalizationToggle,
}) => {
  return (
    <>
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
                backgroundColor: (educationCategory === 'HighSchool' && educationLevel === lvl) ? '#10204D' : 'transparent',
                borderColor: (educationCategory === 'HighSchool' && educationLevel === lvl) ? '#1D4177' : '#434F62',
              }}
            >
              <input
                type="radio"
                checked={educationCategory === 'HighSchool' && educationLevel === lvl}
                onChange={() => onEducationChange('HighSchool', lvl, '')}
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
                backgroundColor: (educationCategory === 'College' && educationLevel === lvl) ? '#10204D' : 'transparent',
                borderColor: (educationCategory === 'College' && educationLevel === lvl) ? '#1D4177' : '#434F62',
              }}
            >
              <input
                type="radio"
                checked={educationCategory === 'College' && educationLevel === lvl}
                onChange={() => onEducationChange('College', lvl, '')}
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
              backgroundColor: educationCategory === 'Other' ? '#10204D' : 'transparent',
              borderColor: educationCategory === 'Other' ? '#1D4177' : '#434F62',
            }}
          >
            <input
              type="radio"
              checked={educationCategory === 'Other'}
              onChange={() => onEducationChange('Other', '', otherEducationLevel)}
              style={styles.radio}
            />
            <div style={styles.optionContent}>
              <span>Other (please specify)</span>
              {educationCategory === 'Other' && (
                <input
                  type="text"
                  placeholder="Type here..."
                  value={otherEducationLevel}
                  onChange={e => onEducationChange('Other', '', e.target.value)}
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
                  backgroundColor: subjectsStudied.includes(subj) ? '#10204D' : 'transparent',
                  borderColor: subjectsStudied.includes(subj) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={subjectsStudied.includes(subj)}
                  onChange={() => onSubjectToggle(subj)}
                  style={styles.checkbox}
                />
                <div style={styles.optionContent}>
                  <span>Other (please specify)</span>
                  {subjectsStudied.includes(subj) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={otherSubject}
                      onChange={e => onOtherSubjectChange(e.target.value)}
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
                  backgroundColor: subjectsStudied.includes(subj) ? '#10204D' : 'transparent',
                  borderColor: subjectsStudied.includes(subj) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={subjectsStudied.includes(subj)}
                  onChange={() => onSubjectToggle(subj)}
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
                backgroundColor: codingExperience === opt ? '#10204D' : 'transparent',
                borderColor: codingExperience === opt ? '#1D4177' : '#434F62',
              }}
            >
              <input
                type="radio"
                checked={codingExperience === opt}
                onChange={() => onCodingExperienceChange(opt)}
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
              onClick={() => onHobbyToggle(h)}
              style={{
                ...styles.hobbyBtn,
                backgroundColor: favoriteHobbies.includes(h) ? '#10204D' : 'transparent',
                borderColor: favoriteHobbies.includes(h) ? '#1D4177' : '#434F62',
                color: favoriteHobbies.includes(h) ? '#FFFFFF' : '#AAAAC1',
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
            value={customHobbies}
            onChange={e => onCustomHobbiesChange(e.target.value)}
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
              {hobbyPersonalization ? 'Enabled \u2014 AI uses your hobbies for analogies' : 'Disabled \u2014 AI uses generic examples'}
            </span>
            <button
              type="button"
              aria-pressed={hobbyPersonalization}
              onClick={onHobbyPersonalizationToggle}
              style={{
                ...styles.toggleTrack,
                backgroundColor: hobbyPersonalization ? '#3B89FF' : '#434F62',
              }}
            >
              <div
                style={{
                  ...styles.toggleThumb,
                  transform: hobbyPersonalization ? 'translateX(18px)' : 'translateX(0)',
                }}
              />
            </button>
          </label>
        </div>
      </div>
    </>
  );
};

export default ProfileFormFields;
