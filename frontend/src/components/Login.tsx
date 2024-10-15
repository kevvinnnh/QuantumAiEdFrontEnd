import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google API
        const res = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userData = res.data;

        // Send the user data to backend to check if they already have an account
        const backendResponse = await axios.post(
          'http://localhost:5000/append_user_id',
          {
            user_id: userData.email,
            name: userData.name,
            picture: userData.picture,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const redirectTo = backendResponse.data.redirect_to;

        // Redirect based on server response
        if (redirectTo === 'map') {
          navigate('/map'); // User has an existing account, go to map
        } else {
          navigate('/profile-creation'); // New user or profile incomplete
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
    <div className="login-container">
      <h2>Welcome to QuantumAiEd</h2>
      <p>Please sign in to continue</p>
      <button className="login-button" onClick={() => login()}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
