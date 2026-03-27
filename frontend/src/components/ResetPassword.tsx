import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      });

      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Your Password</h1>
        <p style={styles.subtitle}>Enter your new password below.</p>

        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <div style={styles.inputContainer}>
            <label htmlFor="new-password" style={styles.label}>New Password</label>
            <input
              id="new-password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div style={styles.inputContainer}>
            <label htmlFor="confirm-password" style={styles.label}>Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message} Redirecting to login...</p>}

          <button
            type="submit"
            disabled={isSubmitting || !!message}
            style={{
              ...styles.button,
              opacity: (isSubmitting || !!message) ? 0.6 : 1,
              cursor: (isSubmitting || !!message) ? 'default' : 'pointer',
            }}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          style={styles.backLink}
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#030E29',
    padding: '2rem',
  },
  card: {
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 400,
    color: '#F1E0E0',
    marginBottom: '0.5rem',
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    color: '#9DA7B7',
    fontSize: 14,
    marginBottom: '2rem',
  },
  inputContainer: {
    marginBottom: '1rem',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    color: '#F1E0E0',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 6,
    fontFamily: "'Inter', sans-serif",
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0A1A3A',
    border: '1px solid #2A3A5C',
    borderRadius: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2C5CE6',
    color: '#FFF',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    marginTop: '0.5rem',
  },
  error: {
    color: '#fa6060',
    fontSize: 14,
    marginBottom: '0.5rem',
  },
  success: {
    color: '#4ade80',
    fontSize: 14,
    marginBottom: '0.5rem',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: '1.5rem',
    fontFamily: "'Inter', sans-serif",
  },
};

export default ResetPassword;
