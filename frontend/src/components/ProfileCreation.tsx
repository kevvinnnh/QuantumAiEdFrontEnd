// src/components/ProfileCreation.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfileCreation: React.FC = () => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Fetch the user ID from the backend
    axios.get('http://localhost:5000/get_user_id', { withCredentials: true })
      .then((response) => {
        setUserId(response.data.user_id);
      })
      .catch((error) => {
        console.error('Error fetching user ID:', error);
      });
  }, []);

  const handleProfileCreation = () => {
    // Implement profile creation logic here
    console.log('Profile creation for user:', userId);
  };

  return (
    <div>
      <h2>Profile Creation</h2>
      <p>Welcome, {userId}!</p>
      {/* Add form fields for additional profile information */}
      <button onClick={handleProfileCreation}>Create Profile</button>
    </div>
  );
};

export default ProfileCreation;
