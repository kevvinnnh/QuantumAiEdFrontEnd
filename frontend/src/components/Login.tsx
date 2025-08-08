// src/components/Login.tsx
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../assets/google-icon.svg';
import LoginGraphic from '../assets/login-graphic.svg';
import QuantaidLogo from '../assets/quantaid-logo.svg';


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
            outline: none !important;
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
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}
      <div style={styles.container}>
        {/* LEFT COLUMN */}
        <div style={styles.leftColumn} className="left-column-responsive">
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
              style={styles.googleButton}
              onClick={() => login()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DFE1E3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F2F2F2';
              }}
            >
              <img src={GoogleIcon} alt="Google icon" style={styles.googleIcon} />
              <span>{isSignUpMode ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>
            
            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.line} />
              <span style={styles.dividerText}>OR</span>
              <div style={styles.line} />
            </div>
            
            {/* Manual signup fields */}
            <div style={styles.inputContainer}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Name field - only show in sign up mode */}
            {isSignUpMode && (
              <div style={styles.inputContainer}>
                <label style={styles.label}>Name</label>
                <p style={styles.labelText}>
                  This name will appear on your profile
                </p>
                <input
                  key="name-input"
                  type="text"
                  placeholder="John/Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={styles.input}
                  autoComplete="name"
                />
              </div>
            )}

            <div style={styles.inputContainer}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Terms text for sign up mode, Forgot password for login mode */}
            {isSignUpMode ? (
              <p style={styles.termsText}>
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
            ) : (
              <div style={styles.forgotPasswordContainer}>
                <button
                  onClick={handleForgotPassword}
                  style={styles.forgotPasswordLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Forgot my password
                </button>
              </div>
            )}
            
            {/* Sign Up/Log In Button */}
            <button
              style={styles.signupButton}
              onClick={handleManualSignupOrLogin}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1F4ADB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2C5CE6'; }}
            >
              {isSignUpMode ? 'SIGN UP' : 'LOG IN'}
            </button>

            {/* Toggle between sign up and log in */}
            <p style={styles.loginLink}>
              {isSignUpMode ? (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={toggleMode}
                    style={styles.toggleButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={toggleMode}
                    style={styles.toggleButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* RIGHT COLUMN */}
        <div style={styles.rightColumn} className="right-column-responsive">
        <img
          src={LoginGraphic}
          alt="Illustration of a student using QuantAid"
          style={styles.rightContent}
        />
        </div>
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  spinner: {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #010117',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    animation: 'spin 2s linear infinite',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    height: '100vh',
  },
  logoStyle: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    height: '19px',
    width: '70px',
    minHeight: '19px',
    minWidth: '70px',
    zIndex: 1000,
    backgroundColor: '#F1E0E0',
    mask: `url(${QuantaidLogo}) no-repeat center`,
    maskSize: 'contain',
    WebkitMask: `url(${QuantaidLogo}) no-repeat center`,
    WebkitMaskSize: 'contain',
  },
  leftColumn: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#1F305F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#030E29',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFF',
    padding: '4rem',
  },
  formContainer: {
    maxWidth: '480px',
    width: '100%',
  },
  welcomeTitle: {
    marginBottom: '3rem',
    fontSize: '2.2rem',
    fontWeight: '400',
    color: '#F1E0E0',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
  },
  brandTitle: {
    marginBottom: '3rem',
    fontSize: '3rem',
    fontWeight: 'bold',
  },
  // Based on GSI button guidelines: https://developers.google.com/identity/branding-guidelines
  googleButton: {
    /* Figma design */
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center',
    // backgroundColor: '#1F305F',
    // color: '#F1E0E0',
    // border: '1px solid #ccc',
    // padding: '1rem',
    // width: '85%',
    // cursor: 'pointer',
    // borderRadius: '5px',
    // borderColor: '787A96',
    // fontSize: '1.2rem',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    WebkitAppearance: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    backgroundColor: '#F2F2F2',
    backgroundImage: 'none',
    border: 'none',
    WebkitBorderRadius: '4px',
    borderRadius: '4px',
    WebkitBoxSizing: 'border-box',
    boxSizing: 'border-box',
    color: '#1F1F1F',
    fontFamily: "'Roboto', arial, sans-serif",
    fontSize: '16px',
    fontWeight: 500,
    letterSpacing: '0.25px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    height: '48px',
    width: '400px',
    maxWidth: '400px',
    minWidth: 'min-content',
    padding: '0 12px',
    position: 'relative',
    verticalAlign: 'middle',
    cursor: 'pointer',
    outline: 'none',
    overflow: 'hidden',
    WebkitTransition: 'background-color .218s, border-color .218s, box-shadow .218s',
    transition: 'background-color .218s, border-color .218s, box-shadow .218s'
  },
  googleIcon: {
    marginRight: '0.7rem',
    height: '26px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '2rem 0',
    marginTop: '3.4rem',
    marginBottom: '3.4rem',
    width: '100%',
  },
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: '#ccc',
    margin: '0 -1rem',
    marginTop: '0.03rem',
  },
  dividerText: {
    margin: '0 1rem',
    color: '#BFC3D9',          // was #888
    fontSize: '.7rem',
    whiteSpace: 'nowrap',
    backgroundColor: '#1F305F',
    padding: '0 0.5rem',
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    textAlign: 'left',
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.3rem',
    // fontWeight: 'bold',
    color: '#F1E0E0',
    fontSize: '1.3rem',
  },
  input: {
    width: '100%',
    padding: '1rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '1.2rem',
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    backgroundColor:'rgba(116, 142, 203, 1)',
    color: '#1F1A2A',
  },
  signupButton: {
    backgroundColor: '#2C5CE6',      // rgb(44, 92, 230)
    color: '#fff',
    padding: '1.2rem',
    width: '100%',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1.3rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    margin: '2rem 0',
    transition: 'all 0.1s ease 0.05s',
  },
  labelText: {
    fontSize: '0.85rem',
    color: '#F1E0E0',
    lineHeight: 1.4,
    marginTop: '-0.4rem',
    marginBottom: '0.4rem',
    textAlign: 'left',
  },
  termsText: {
    fontSize: '0.9rem',
    color: '#B4B6BE',
    lineHeight: 1.4,
    textAlign: 'left',
  },
  forgotPasswordContainer: {
    textAlign: 'left',
    marginBottom: '0.5rem',
  },
  forgotPasswordLink: {
    background: 'none',
    border: 'none',
    color: '#A4C5FF',                // rgb(164, 197, 255)
    textDecoration: 'underline',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    padding: 0,
    fontWeight: '400',
  },
  loginLink: {
    marginTop: '0rem',
    fontSize: '1rem',
    color: '#C1C5D6',
    textAlign: 'center',
    fontWeight: '400',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#A4C5FF',
    textDecoration: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    padding: 0,
    fontWeight: '400',
  },
  linkStyle: {
    color: '#A4C5FF',          // was #7093CD
    textDecoration: 'underline',   // always underlined for WCAG
    fontWeight: '400',
  },
  rightContent: {
    textAlign: 'center',
    maxWidth: '480px',
  },
  // assistantImage: {
  //   width: '420px',
  //   marginBottom: '2.5rem',
  // },
  heading: {
    fontSize: '2.8rem',
    marginBottom: '0.8rem',
    fontWeight: 'bold',
    lineHeight: 1.2,
  },
  subheading: {
    fontSize: '1.8rem',
    lineHeight: 1.4,
  },
};

export default Login;
