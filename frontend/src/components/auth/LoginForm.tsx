import React from 'react';
import { styles } from './LoginStyles';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  emailInputRef: React.Ref<HTMLInputElement>;
  passwordInputRef: React.Ref<HTMLInputElement>;
  forgotCooldown: boolean;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  emailInputRef,
  passwordInputRef,
  forgotCooldown,
  onForgotPassword,
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
          autoComplete="current-password"
        />
      </div>

      <div style={styles.forgotPasswordContainer}>
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={forgotCooldown}
          style={{
            ...styles.forgotPasswordLink,
            opacity: forgotCooldown ? 0.5 : 1,
            cursor: forgotCooldown ? 'default' : 'pointer',
          }}
          className="text-button"
          onMouseEnter={(e) => {
            if (!forgotCooldown) e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
          aria-label="Forgot password"
        >
          {forgotCooldown ? 'Reset link sent \u2014 check your email' : 'Forgot my password'}
        </button>
      </div>
    </>
  );
};

export default LoginForm;
