import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Ensure you have a Google icon image at the provided path
import googleIcon from '../assets/google-icon.png';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userData = res.data;
        const userEmail = userData.email || '';

        // Append user info to the backend
        const backendResponse = await axios.post(
          'http://localhost:5000/append_user_id',
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

        // Redirect based on backend response
        if (redirectTo === 'map') {
          navigate('/map');
        } else {
          navigate('/profile-creation');
        }
      } catch (err) {
        console.error('Error during login:', err);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
    },
  });

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Welcome! Let's set you up.</h2>
        <p>Please log in to continue</p>
        <button className="login-button" onClick={() => login()}>
          <img src={googleIcon} alt="Google icon" className="google-icon" />
          LOG IN
        </button>
        <p className="terms">
          By clicking LOG IN, you acknowledge that you have read and agree to Quantum aide’s{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
