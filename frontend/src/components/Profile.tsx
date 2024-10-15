import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<any>({
    name: '',
    profilePicture: '',
    educationLevel: '',
    major: '',
    favoriteHobby: '',
  });
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch the user ID and profile data
  useEffect(() => {
    axios
      .get('http://localhost:5000/get_user_id', { withCredentials: true })
      .then((response) => {
        return axios.get('http://localhost:5000/get_user_profile', {
          params: { userId: response.data.user_id },
          withCredentials: true,
        });
      })
      .then((profileResponse) => {
        // Set profile data, fallback to empty string for profilePicture if not present
        setUserData({
          ...profileResponse.data,
          profilePicture: profileResponse.data.profilePicture || '',
        });
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
      })
      .finally(() => {
        setLoading(false); // Once the data is fetched, stop loading
      });
  }, []);

  const handleLogout = () => {
    axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
      .then(() => {
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const openLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const closeLogoutConfirm = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) {
    return <p>Loading...</p>; // You can replace this with a spinner or loading animation
  }

  return (
    <div className="profile-container" style={{ position: 'relative', padding: '20px' }}>
      {/* Back Arrow (top left) */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center' 
        }} 
        onClick={() => (window.location.href = '/map')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ color: '#566395' }}
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span 
          style={{ 
            marginLeft: '8px', 
            fontSize: '1.2em', 
            fontWeight: 'bold', 
            color: '#566395', 
            fontFamily: 'inherit'  
          }}
        >
          Back
        </span>
      </div>

      {/* Spacing between back button and profile info */}
      <div style={{ marginTop: '60px' }}>
        <h2>Welcome back, {userData.name}!</h2>

        {/* Display user profile picture or emoji fallback */}
        {userData.profilePicture ? (
          <img
            src={userData.profilePicture}
            alt="User Profile"
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '80px',
              backgroundColor: '#E0E0E0'
            }}
          >
            👤
          </div>
        )}

        {/* Display user information */}
        <p><strong>Education Level:</strong> {userData.educationLevel}</p>
        <p><strong>Major:</strong> {userData.major}</p>
        <p><strong>Favorite Hobby:</strong> {userData.favoriteHobby}</p>

        {/* Log Out Button */}
        <button
          className="button"
          onClick={openLogoutConfirm}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '1.1em',
            backgroundColor: '#566395',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>

        {/* Logout Confirmation Popup */}
        {showLogoutConfirm && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            width: '300px',
            textAlign: 'center'
          }}>
            <p>Are you sure you want to log out?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                className="button"
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  fontSize: '1.1em',
                  backgroundColor: '#566395',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '45%',
                }}
              >
                Confirm
              </button>
              <button
                className="button"
                onClick={closeLogoutConfirm}
                style={{
                  padding: '10px 20px',
                  fontSize: '1.1em',
                  backgroundColor: '#A487AE',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '45%',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
