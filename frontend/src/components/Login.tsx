// src/components/Login.tsx
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/google-icon.png';
import assistantImage from '../assets/assistant.png';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
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
        localStorage.setItem('loggedInUserEmail', userEmail);
        
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
  
  const handleManualSignup = () => {
    console.log("Manual signup with:", { email, fullName, password });
    alert("Manual signup is not yet implemented.");
  };
  
  return (
    <>
      {/* Global style for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
        <div style={styles.leftColumn}>
          <div style={styles.formContainer}>
            <h1 style={styles.brandTitle}>QuantAid</h1>
            
            {/* Sign up with Google */}
            <button style={styles.googleButton} onClick={() => login()}>
              <img src={googleIcon} alt="Google icon" style={styles.googleIcon} />
              <span>Sign up with Google</span>
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
            <div style={styles.inputContainer}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                placeholder="John/Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            
            {/* Sign Up Button */}
            <button style={styles.signupButton} onClick={handleManualSignup}>
              SIGN UP
            </button>
            
            <p style={styles.termsText}>
              By clicking SIGN UP, you acknowledge that you have read and agree to QuantAid’s{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={styles.linkStyle}>
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={styles.linkStyle}>
                Privacy Policy
              </a>.
            </p>
            <p style={styles.loginLink}>
              Already have an account?{' '}
              <a href="/login" style={styles.linkStyle}>
                Log in
              </a>
            </p>
          </div>
        </div>
        
        {/* RIGHT COLUMN */}
        <div style={styles.rightColumn}>
          <div style={styles.rightContent}>
          <img src={assistantImage} alt="Assistant" style={styles.assistantImage} />
          <h2 style={styles.heading}>Learn quantum computing your way:</h2>
            <p style={styles.subheading}>simple, free, and at your own pace.</p>
          </div>
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
    backgroundColor: '#FFFFFF',
    height: '100vh',
  },
  leftColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  rightColumn: {
    flex: 1,
    background: 'linear-gradient(to bottom, #010117, #071746)',
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
  brandTitle: {
    marginBottom: '3rem',
    fontSize: '3rem',
    fontWeight: 'bold',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    color: '#000',
    border: '1px solid #ccc',
    padding: '1.2rem',
    width: '100%',
    cursor: 'pointer',
    borderRadius: '5px',
    fontWeight: 600,
    fontSize: '1.2rem',
  },
  googleIcon: {
    marginRight: '0.5rem',
    height: '26px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '2rem 0',
    width: '100%',
  },
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: '#ccc',
  },
  dividerText: {
    margin: '0 1rem',
    color: '#888',
    fontSize: '1rem',
    whiteSpace: 'nowrap',
  },
  inputContainer: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  input: {
    width: '100%',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1.1rem',
  },
  signupButton: {
    background: 'linear-gradient(to bottom, #010117, #071746)',
    color: '#fff',
    padding: '1.2rem',
    width: '100%',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.3rem',
    margin: '2rem 0',
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: '1rem',
    color: '#555',
    lineHeight: 1.4,
  },
  loginLink: {
    marginTop: '1.5rem',
    fontSize: '1rem',
  },
  linkStyle: {
    color: '#566395',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  rightContent: {
    textAlign: 'center',
    maxWidth: '480px',
  },
  assistantImage: {
    width: '420px',
    marginBottom: '2.5rem',
  },
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
