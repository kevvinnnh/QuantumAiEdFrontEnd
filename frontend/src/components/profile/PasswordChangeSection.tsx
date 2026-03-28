import React from 'react';
import { styles } from './ProfileStyles';

interface PasswordChangeSectionProps {
  hasPassword: boolean;
  hasGoogle: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordError: string;
  passwordMessage: string;
  changingPassword: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onChangePassword: () => void;
}

const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({
  hasPassword,
  hasGoogle,
  currentPassword,
  newPassword,
  confirmPassword,
  passwordError,
  passwordMessage,
  changingPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onChangePassword,
}) => {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        {hasPassword ? 'Change password' : 'Set a password'}
        <span
          style={styles.tooltip}
          title={hasPassword
            ? 'Update your email/password login credentials'
            : 'Add a password to also log in with email and password'
          }
        >&#9432;</span>
      </h3>
      {hasGoogle && !hasPassword && (
        <p style={{ ...styles.sectionSubtitle, marginBottom: 12 }}>
          You currently sign in with Google. Set a password to also use email login.
        </p>
      )}
      {hasPassword && (
        <div style={{ marginBottom: 12 }}>
          <label style={styles.inputLabel}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => onCurrentPasswordChange(e.target.value)}
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
          onChange={e => onNewPasswordChange(e.target.value)}
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
          onChange={e => onConfirmPasswordChange(e.target.value)}
          style={styles.passwordInput}
          autoComplete="new-password"
        />
      </div>
      {passwordError && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 8 }}>{passwordError}</p>}
      {passwordMessage && <p style={{ color: '#4ade80', fontSize: 13, marginBottom: 8 }}>{passwordMessage}</p>}
      <button
        onClick={onChangePassword}
        disabled={changingPassword}
        style={{
          ...styles.secondaryBtn,
          opacity: changingPassword ? 0.6 : 1,
        }}
      >
        {changingPassword ? 'Updating...' : (hasPassword ? 'Update Password' : 'Set Password')}
      </button>
    </div>
  );
};

export default PasswordChangeSection;
