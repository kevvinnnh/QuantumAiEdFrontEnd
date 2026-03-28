import React from 'react';
import { styles } from './ProfileCreationStyles';

import {
  whereHeardOptions,
  highSchoolLevels,
  collegeLevels,
  subjects,
  codingExperienceOptions,
  hobbies,
} from '@/constants/formOptions';

export interface FormData {
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

export interface StepConfig {
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

export interface FormHandlers {
  handleWhereHeardChange: (option: string) => void;
  handleSubjectsChange: (subj: string) => void;
  handleHobbyToggle: (hobby: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export interface CommonProps {
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
  skipOnboarding: () => void;
  handleSubmit: () => void;
}

export const stepConfigs: StepConfig[] = [
  {
    title: "Where did you hear about us?",
    subtitle: "(Select all that apply)",
    isFirst: true,
    hasSelection: (formData) => {
      const nonOtherSelections = formData.whereHeard.filter(item => item !== 'Other (please specify)');
      const hasValidOther = formData.whereHeard.includes('Other (please specify)') && formData.otherWhereHeard.trim() !== '';
      return nonOtherSelections.length > 0 || hasValidOther;
    },
    renderContent: (formData, handlers) => (
      <>
        <div style={styles.checkList}>
          {whereHeardOptions.map((option) => (
            option === 'Other (please specify)' ? (
              <label
                key={option}
                style={{
                  ...styles.checkItem,
                  ...styles.checkItemExpanded,
                  backgroundColor: formData.whereHeard.includes(option) ? '#10204D' : 'transparent',
                  borderColor: formData.whereHeard.includes(option) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handlers.handleWhereHeardChange(option)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleWhereHeardChange(option); } }}
                  style={styles.checkbox}
                />
                <div style={styles.optionContent}>
                  <span>Other (please specify)</span>
                  {formData.whereHeard.includes(option) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherWhereHeard}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherWhereHeard: e.target.value }))
                      }
                      style={styles.inlineOtherInput}
                      autoFocus
                    />
                  )}
                </div>
              </label>
            ) : (
              <label
                key={option}
                style={{
                  ...styles.checkItem,
                  backgroundColor: formData.whereHeard.includes(option) ? '#10204D' : 'transparent',
                  borderColor: formData.whereHeard.includes(option) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.whereHeard.includes(option)}
                  onChange={() => handlers.handleWhereHeardChange(option)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleWhereHeardChange(option); } }}
                  style={styles.checkbox}
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
        <div style={styles.educationContainer}>
          {/* HIGH SCHOOL Section */}
          <div style={styles.educationSection}>
            <h4 style={styles.radioGroupLabel}>HIGH SCHOOL</h4>
            <div style={styles.radioRowGroup}>
              {highSchoolLevels.map((lvl) => (
                <label
                  key={lvl}
                  style={{
                    ...styles.radioItemCompact,
                    backgroundColor: (formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl) ? '#10204D' : 'transparent',
                    borderColor: (formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl) ? '#1D4177' : '#434F62',
                  }}
                >
                  <input
                    type="radio"
                    checked={formData.educationCategory === 'HighSchool' && formData.educationLevel === lvl}
                    onChange={() =>
                      handlers.setFormData(prev => ({
                        ...prev,
                        educationCategory: 'HighSchool',
                        educationLevel: lvl,
                        otherEducationLevel: '',
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlers.setFormData(prev => ({
                          ...prev,
                          educationCategory: 'HighSchool',
                          educationLevel: lvl,
                          otherEducationLevel: '',
                        }));
                      }
                    }}
                    style={styles.radio}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          {/* COLLEGE Section */}
          <div style={styles.educationSection}>
            <h4 style={styles.radioGroupLabel}>COLLEGE</h4>
            <div style={styles.radioRowGroup}>
              {collegeLevels.map((lvl) => (
                <label
                  key={lvl}
                  style={{
                    ...styles.radioItemCompact,
                    backgroundColor: (formData.educationCategory === 'College' && formData.educationLevel === lvl) ? '#10204D' : 'transparent',
                    borderColor: (formData.educationCategory === 'College' && formData.educationLevel === lvl) ? '#1D4177' : '#434F62',
                  }}
                >
                  <input
                    type="radio"
                    checked={formData.educationCategory === 'College' && formData.educationLevel === lvl}
                    onChange={() =>
                      handlers.setFormData(prev => ({
                        ...prev,
                        educationCategory: 'College',
                        educationLevel: lvl,
                        otherEducationLevel: '',
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlers.setFormData(prev => ({
                          ...prev,
                          educationCategory: 'College',
                          educationLevel: lvl,
                          otherEducationLevel: '',
                        }));
                      }
                    }}
                    style={styles.radio}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.educationSection}>
          <h4 style={styles.radioGroupLabel}></h4>
          <div style={styles.radioRowGroup}>
            <label
              style={{
                ...styles.radioItemCompact,
                ...styles.radioItemExpanded,
                backgroundColor: formData.educationCategory === 'Other' ? '#10204D' : 'transparent',
                borderColor: formData.educationCategory === 'Other' ? '#1D4177' : '#434F62',
              }}
            >
              <input
                type="radio"
                checked={formData.educationCategory === 'Other'}
                onChange={() =>
                  handlers.setFormData(prev => ({
                    ...prev,
                    educationCategory: 'Other',
                    educationLevel: '',
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlers.setFormData(prev => ({
                      ...prev,
                      educationCategory: 'Other',
                      educationLevel: '',
                    }));
                  }
                }}
                style={styles.radio}
              />
              <div style={styles.optionContent}>
                <span>Other (please specify)</span>
                {formData.educationCategory === 'Other' && (
                  <input
                    type="text"
                    placeholder="Type here..."
                    value={formData.otherEducationLevel}
                    onChange={(e) =>
                      handlers.setFormData(prev => ({ ...prev, otherEducationLevel: e.target.value }))
                    }
                    style={styles.inlineOtherInput}
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
      const nonOtherSelections = formData.subjects.filter(item => item !== 'Other (please specify)');
      const hasValidOther = formData.subjects.includes('Other (please specify)') && formData.otherSubject.trim() !== '';
      return nonOtherSelections.length > 0 || hasValidOther;
    },
    renderContent: (formData, handlers) => (
      <>
        <div style={styles.checkList}>
          {subjects.map((subj) => (
            subj === 'Other (please specify)' ? (
              <label
                key={subj}
                style={{
                  ...styles.checkItem,
                  ...styles.checkItemExpanded,
                  backgroundColor: formData.subjects.includes(subj) ? '#10204D' : 'transparent',
                  borderColor: formData.subjects.includes(subj) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handlers.handleSubjectsChange(subj)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleSubjectsChange(subj); } }}
                  style={styles.checkbox}
                />
                <div style={styles.optionContent}>
                  <span>Other (please specify):</span>
                  {formData.subjects.includes(subj) && (
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={formData.otherSubject}
                      onChange={(e) =>
                        handlers.setFormData(prev => ({ ...prev, otherSubject: e.target.value }))
                      }
                      style={styles.inlineOtherInput}
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
                  backgroundColor: formData.subjects.includes(subj) ? '#10204D' : 'transparent',
                  borderColor: formData.subjects.includes(subj) ? '#1D4177' : '#434F62',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subj)}
                  onChange={() => handlers.handleSubjectsChange(subj)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleSubjectsChange(subj); } }}
                  style={styles.checkbox}
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
      <div style={styles.radioGroup}>
        {codingExperienceOptions.map((option) => (
          <label
            key={option}
            style={{
              ...styles.radioItem,
              backgroundColor: formData.codingExperience === option ? '#10204D' : 'transparent',
              borderColor: formData.codingExperience === option ? '#1D4177' : '#434F62',
            }}
          >
            <input
              type="radio"
              name="codingExperience"
              checked={formData.codingExperience === option}
              onChange={() =>
                handlers.setFormData(prev => ({ ...prev, codingExperience: option }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlers.setFormData(prev => ({ ...prev, codingExperience: option }));
                }
              }}
              style={styles.radio}
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
      <div style={styles.hobbiesMainContainer}>
        <div style={styles.hobbiesContainer}>
          {hobbies.map((hobby) => (
            <button
              key={hobby}
              className="hobby-button"
              style={{
                ...styles.hobbyButton,
                backgroundColor: formData.favoriteHobbies.includes(hobby) ? '#10204D' : 'transparent',
                borderColor: formData.favoriteHobbies.includes(hobby) ? '#1D4177' : '#434F62',
                color: formData.favoriteHobbies.includes(hobby) ? '#FFFFFF' : '#AAAAC1',
              }}
              onClick={() => handlers.handleHobbyToggle(hobby)}
            >
              {hobby}
            </button>
          ))}
        </div>

        {/* Custom hobbies section */}
        <div style={styles.customHobbiesSection}>
          <h3 style={styles.formQuestion}>Want to be more specific?</h3>
          <p style={styles.formSubtitle}>Add your own</p>
          <input
            type="text"
            placeholder="(e.g. violin, bird watching, spoken word poetry)"
            value={formData.customHobbies}
            onChange={(e) =>
              handlers.setFormData(prev => ({ ...prev, customHobbies: e.target.value }))
            }
            style={styles.customHobbiesInput}
          />
        </div>
      </div>
    )
  }
];
