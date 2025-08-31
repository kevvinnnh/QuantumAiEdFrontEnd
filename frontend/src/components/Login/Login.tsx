// src/components/Login/Login.tsx
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../../assets/google-icon.svg';
import LoginGraphic from '../../assets/login-graphic.svg';
import QuantaidLogo from '../../assets/quantaid-logo.svg';
import styles from './Login.module.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // State to track if user is signing up (true) or logging in (false)
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  
  // Local state for manual sign-up fields (if needed)
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  
  // Loading state for the login process
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Fetch user info from Google
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const userData = res.data;
        const userEmail = userData.email || '';
        localStorage.setItem('loggedInUserEmail', userEmail);

        // Dev route to profile creation
        if (String(import.meta.env.VITE_FORCE_PROFILE_CREATION).toLowerCase() === 'true') {
          navigate('/profile-creation');
          return;
        }
        
        // Send user info to the backend
        const backendResponse = await axios.post(
          `${backendUrl}/append_user_id`,
          {
            user_id: userEmail,
            name: userData.name,
            picture: userData.picture,
          },
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const redirectTo = backendResponse.data.redirect_to;
        
        // If admin, redirect to admin dashboard
        if (userEmail.toLowerCase() === 'kh78@rice.edu') {
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
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
    },
  });
  
  const handleManualSignupOrLogin = () => {
    if (isSignUpMode) {
      console.log("Manual signup with:", { email, fullName, password });
      alert("Manual signup is not yet implemented.");
    } else {
      console.log("Manual login with:", { email, password });
      alert("Manual login is not yet implemented.");
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password for:", email);
    alert("Forgot password functionality is not yet implemented.");
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    // Clear form fields when switching modes
    setEmail("");
    setFullName("");
    setPassword("");
  };
  
  return (
    <>
      {/* Loading Animation Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <div className={styles.container}>
        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>
          <div
            className={styles.logoStyle}
            style={{
              mask: `url(${QuantaidLogo}) no-repeat center`,
              maskSize: 'contain',
              WebkitMask: `url(${QuantaidLogo}) no-repeat center`,
              WebkitMaskSize: 'contain',
            }}
            role="img"
            aria-label="Quantaid logo"
          />
          <div className={styles.formContainer}>
            {/* Welcome back title for login mode */}
            {!isSignUpMode && (
              <h1 className={styles.welcomeTitle}>Welcome back!</h1>
            )}
            
            {/* Sign up/Continue with Google */}
            <button
              className={styles.googleButton}
              onClick={() => login()}
            >
              <img src={GoogleIcon} alt="Google icon" className={styles.googleIcon} />
              <span>{isSignUpMode ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>
            
            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.line} />
              <span className={styles.dividerText}>OR</span>
              <div className={styles.line} />
            </div>
            
            {/* Manual signup fields */}
            <div className={styles.inputContainer}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Name field - only show in sign up mode */}
            {isSignUpMode && (
              <div className={styles.inputContainer}>
                <label className={styles.label}>Name</label>
                <p className={styles.labelText}>
                  This name will appear on your profile
                </p>
                <input
                  key="name-input"
                  type="text"
                  placeholder="John/Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={styles.input}
                  autoComplete="name"
                />
              </div>
            )}

            <div className={styles.inputContainer}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Terms text for sign up mode, Forgot password for login mode */}
            {isSignUpMode ? (
              <p className={styles.termsText}>
                By clicking SIGN UP, you acknowledge that you have read and agree to QuantAid's{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkStyle}
                >
                  Terms of Use
                </a>{' '}
                and{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkStyle}
                >
                  Privacy Policy
                </a>.
              </p>
            ) : (
              <div className={styles.forgotPasswordContainer}>
                <button
                  onClick={handleForgotPassword}
                  className={styles.forgotPasswordLink}
                >
                  Forgot my password
                </button>
              </div>
            )}
            
            {/* Sign Up/Log In Button */}
            <button
              className={styles.signupButton}
              onClick={handleManualSignupOrLogin}
            >
              {isSignUpMode ? 'SIGN UP' : 'LOG IN'}
            </button>

            {/* Toggle between sign up and log in */}
            <p className={styles.loginLink}>
              {isSignUpMode ? (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={toggleMode}
                    className={styles.toggleButton}
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={toggleMode}
                    className={styles.toggleButton}
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
        <img
          src={LoginGraphic}
          alt="Illustration of a student using QuantAid"
          className={styles.rightContent}
        />
        </div>
      </div>
    </>
  );
};

export default Login;