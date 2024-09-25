// src/components/Login.tsx
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

        // Correct the URL here
        await axios.post(
          'http://localhost:5000/append_user_id',
          {
            user_id: userData.email,
            name: userData.name,
            picture: userData.picture,
          },
          { withCredentials: true }
        );

        // Redirect to profile creation page
        navigate('/profile-creation');
      } catch (err) {
        console.error('Error during login:', err);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
    },
  });

  return (
    <div>
      <h2>Login with Google</h2>
      <button onClick={() => login()}>Sign in with Google</button>
    </div>
  );
};

export default Login;
