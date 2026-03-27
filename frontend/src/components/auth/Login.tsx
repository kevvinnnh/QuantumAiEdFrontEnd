// src/components/Login.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@/assets/google-icon.svg';
import LoginGraphic from '@/assets/login-graphic.svg';
import { useAuth } from '@/AuthContext';
import { styles } from './LoginStyles';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import api from '@/api';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();


  // State to track if user is signing up (true) or logging in (false)
  // Returning users (have logged in before) start in login mode
  const [isSignUpMode, setIsSignUpMode] = useState(() => !localStorage.getItem('loggedInUserEmail'));
  
  // Local state for manual sign-up fields (if needed)
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  
  // Loading state for the login process
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [forgotCooldown, setForgotCooldown] = useState(false);
  
  // Refs for managing focus
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const googleButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => { void (async () => {
      setIsLoading(true);
      try {
        // Send access token to backend — it verifies with Google server-side
        const backendResponse = await api.post(
          '/append_user_id',
          { access_token: tokenResponse.access_token },
        );
        const { redirect_to: redirectTo, is_admin: isAdmin, email: userEmail } = backendResponse.data;
        localStorage.setItem('loggedInUserEmail', userEmail ?? '');

        // Update auth context
        authLogin(userEmail, isAdmin);

        // Dev route to profile creation (after auth/session is established)
        if (String(import.meta.env.VITE_FORCE_PROFILE_CREATION).toLowerCase() === 'true') {
          navigate('/profile-creation');
          return;
        }

        // If admin, redirect to admin dashboard
        if (isAdmin) {
          navigate('/admin-dashboard');
        } else if (redirectTo === 'map') {
          navigate('/map');
        } else {
          navigate('/profile-creation');
        }
      } catch (err) {
        console.error('Error during login:', err);
      } finally {
        setIsLoading(false);
      }
    })(); },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
    },
  });
  
  const handleManualSignupOrLogin = async () => {
    setFormError("");
    setFormMessage("");

    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    if (isSignUpMode) {
      if (!fullName.trim()) {
        setFormError("Please enter your name.");
        return;
      }
      if (password.length < 8) {
        setFormError("Password must be at least 8 characters.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.post('/auth/signup', {
          email: email.trim(),
          name: fullName.trim(),
          password,
        });

        const { redirect_to: redirectTo, is_admin: isAdmin } = res.data;
        localStorage.setItem('loggedInUserEmail', email.trim().toLowerCase());
        authLogin(email.trim().toLowerCase(), isAdmin);

        if (isAdmin) {
          navigate('/admin-dashboard');
        } else if (redirectTo === 'map') {
          navigate('/map');
        } else {
          navigate('/profile-creation');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.error) {
          setFormError(err.response.data.error);
        } else {
          setFormError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!password) {
        setFormError("Please enter your password.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.post('/auth/login', {
          email: email.trim(),
          password,
        });

        const { redirect_to: redirectTo, is_admin: isAdmin } = res.data;
        localStorage.setItem('loggedInUserEmail', email.trim().toLowerCase());
        authLogin(email.trim().toLowerCase(), isAdmin);

        if (isAdmin) {
          navigate('/admin-dashboard');
        } else if (redirectTo === 'map') {
          navigate('/map');
        } else {
          navigate('/profile-creation');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.error) {
          setFormError(err.response.data.error);
        } else {
          setFormError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const forgotPasswordTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (forgotPasswordTimeoutRef.current !== null) {
        clearTimeout(forgotPasswordTimeoutRef.current);
        forgotPasswordTimeoutRef.current = null;
      }
    };
  }, []);

  const handleForgotPassword = async () => {
    setFormError("");
    setFormMessage("");

    if (!email.trim()) {
      setFormError("Please enter your email address first.");
      return;
    }

    // Clear any existing cooldown timeout before starting a new one
    if (forgotPasswordTimeoutRef.current !== null) {
      clearTimeout(forgotPasswordTimeoutRef.current);
      forgotPasswordTimeoutRef.current = null;
    }

    setForgotCooldown(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      setFormMessage(res.data.message);
    } catch {
      setFormMessage("If an account exists with that email, a reset link has been sent.");
    }

    // 30-second cooldown to prevent spam
    forgotPasswordTimeoutRef.current = window.setTimeout(() => {
      setForgotCooldown(false);
      forgotPasswordTimeoutRef.current = null;
    }, 30000);
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setEmail("");
    setFullName("");
    setPassword("");
    setFormError("");
    setFormMessage("");
  };
  
  // Handle keyboard navigation for form submission
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleManualSignupOrLogin();
    }
  };

  return (
    <>
      
      {/* Global style for spinner animation and input consistency */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Force consistent input styling and alignment */
          input[type="text"], input[type="email"], input[type="password"] {
            background-color: rgba(116, 142, 203, 1) !important;
            color: #1F1A2A !important;
            outline: none !important;
            border: none !important;
            font-style: normal !important;
            text-align: left !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            box-sizing: border-box !important;
          }
          
          input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus {
            background-color: rgba(116, 142, 203, 1) !important;
            color: #1F1A2A !important;
            outline: 3px solid #A4C5FF !important;
            outline-offset: 2px !important;
            border: none !important;
            font-style: normal !important;
            text-align: left !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          /* Fix placeholder text styling and alignment */
          input[type="text"]::placeholder, input[type="email"]::placeholder, input[type="password"]::placeholder {
            color: #1F1A2A !important;
            opacity: 0.6 !important;
            font-style: normal !important;
            font-weight: normal !important;
            text-align: left !important;
            padding-left: 0 !important;
            text-indent: 0 !important;
          }
          
          /* Prevent browser autofill styling */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(116, 142, 203, 1) inset !important;
            -webkit-text-fill-color: #1F1A2A !important;
            background-color: rgba(116, 142, 203, 1) !important;
            text-align: left !important;
            padding-left: 1rem !important;
          }
          
          /* Focus visible styles for buttons */
          button:focus-visible {
            outline: 3px solid #A4C5FF !important;
            outline-offset: 2px !important;
          }
          
          /* Focus visible styles for text buttons */
          button.text-button:focus-visible {
            outline: 2px solid #A4C5FF !important;
            outline-offset: 1px !important;
            border-radius: 2px;
          }

          /* Responsive breakpoint - hide right column on screens smaller than 768px */
          @media screen and (max-width: 768px) {
            .right-column-responsive {
              display: none !important;
            }
            .left-column-responsive {
              flex: 1 !important;
              width: 100% !important;
            }
          }
        `}
      </style>
      {/* Loading Animation Overlay */}
      {isLoading && (
        <div 
          style={styles.loadingOverlay}
          role="status"
          aria-live="polite"
          aria-label="Loading, please wait"
        >
          <div style={styles.spinner}></div>
          <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
            Loading...
          </span>
        </div>
      )}
      <div style={styles.container}>
        {/* LEFT COLUMN */}
        <main 
          style={styles.leftColumn} 
          className="left-column-responsive"
          role="main"
          aria-label={isSignUpMode ? "Sign up form" : "Login form"}
        >
        <div
          style={styles.logoStyle}
          role="img"
          aria-label="Quantaid logo"
        />
          <div style={styles.formContainer}>
            {/* Welcome back title for login mode */}
            {!isSignUpMode && (
              <h1 style={styles.welcomeTitle}>Welcome back!</h1>
            )}
            
            {/* Sign up/Continue with Google */}
            <button
              ref={googleButtonRef}
              style={styles.googleButton}
              onClick={() => login()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DFE1E3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F2F2F2';
              }}
              aria-label={isSignUpMode ? 'Sign up with Google' : 'Continue with Google'}
            >
              <img src={GoogleIcon} alt="" style={styles.googleIcon} aria-hidden="true" />
              <span>{isSignUpMode ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>
            
            {/* Divider */}
            <div style={styles.divider} aria-hidden="true">
              <div style={styles.line} />
              <span style={styles.dividerText}>OR</span>
              <div style={styles.line} />
            </div>
            
            {/* Manual signup fields */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                void handleManualSignupOrLogin();
              }}
              onKeyDown={handleFormKeyDown}
            >
            {isSignUpMode ? (
              <SignupForm
                email={email}
                fullName={fullName}
                password={password}
                onEmailChange={setEmail}
                onNameChange={setFullName}
                onPasswordChange={setPassword}
                emailInputRef={emailInputRef}
                nameInputRef={nameInputRef}
                passwordInputRef={passwordInputRef}
              />
            ) : (
              <LoginForm
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                emailInputRef={emailInputRef}
                passwordInputRef={passwordInputRef}
                forgotCooldown={forgotCooldown}
                onForgotPassword={() => { void handleForgotPassword(); }}
              />
            )}
            
            {/* Error/success messages */}
            {formError && <p style={styles.formError} role="alert">{formError}</p>}
            {formMessage && <p style={styles.formMessage} role="status">{formMessage}</p>}

            {/* Sign Up/Log In Button */}
            <button
              ref={submitButtonRef}
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.signupButton,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'default' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1F4ADB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2C5CE6'; }}
              aria-describedby={isSignUpMode ? "terms-text" : undefined}
            >
              {isLoading ? (isSignUpMode ? 'SIGNING UP...' : 'LOGGING IN...') : (isSignUpMode ? 'SIGN UP' : 'LOG IN')}
            </button>
            </form>

            {/* Toggle between sign up and log in */}
            <p style={styles.loginLink}>
              {isSignUpMode ? (
                <>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    style={styles.toggleButton}
                    className="text-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                    aria-label="Switch to login mode"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    style={styles.toggleButton}
                    className="text-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                    aria-label="Switch to sign up mode"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </main>
        
        {/* RIGHT COLUMN */}
        <aside 
          style={styles.rightColumn} 
          className="right-column-responsive"
          aria-label="Decorative illustration"
        >
        <img
          src={LoginGraphic}
          alt="Illustration of a student using QuantAid to learn quantum computing"
          style={styles.rightContent}
        />
        </aside>
      </div>
    </>
  );
};

export default Login;
