import React from 'react';
import { styles } from './LoginStyles';

interface SignupFormProps {
  email: string;
  fullName: string;
  password: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  emailInputRef: React.Ref<HTMLInputElement>;
  nameInputRef: React.Ref<HTMLInputElement>;
  passwordInputRef: React.Ref<HTMLInputElement>;
}

const SignupForm: React.FC<SignupFormProps> = ({
  email,
  fullName,
  password,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  emailInputRef,
  nameInputRef,
  passwordInputRef,
}) => {
  return (
    <>
      <div style={styles.inputContainer}>
        <label htmlFor="email-input" style={styles.label}>Email</label>
        <input
          id="email-input"
          ref={emailInputRef}
          type="email"
          placeholder="Name@gmail.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          style={styles.input}
          required
          aria-required="true"
          autoComplete="email"
        />
      </div>

      <div style={styles.inputContainer}>
        <label htmlFor="name-input" style={styles.label}>Name</label>
        <p style={styles.labelText} id="name-description">
          This name will appear on your profile
        </p>
        <input
          id="name-input"
          key="name-input"
          ref={nameInputRef}
          type="text"
          placeholder="John/Jane Doe"
          value={fullName}
          onChange={(e) => onNameChange(e.target.value)}
          style={styles.input}
          autoComplete="name"
          required
          aria-required="true"
          aria-describedby="name-description"
        />
      </div>

      <div style={styles.inputContainer}>
        <label htmlFor="password-input" style={styles.label}>Password</label>
        <input
          id="password-input"
          ref={passwordInputRef}
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          style={styles.input}
          required
          aria-required="true"
          autoComplete="new-password"
        />
      </div>

      <p style={styles.termsText} id="terms-text">
        By clicking SIGN UP, you acknowledge that you have read and agree to QuantAid's{' '}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Terms of Use
        </a>{' '}
        and{' '}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Privacy Policy
        </a>.
      </p>
    </>
  );
};

export default SignupForm;
