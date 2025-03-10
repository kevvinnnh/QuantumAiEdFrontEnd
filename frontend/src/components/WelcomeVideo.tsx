import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeVideo from '../assets/welcome.mp4'; // Adjust the path as needed

const WelcomeVideo: React.FC = () => {
  const navigate = useNavigate();

  const handleVideoEnd = () => {
    // When the video ends, redirect to the map page.
    navigate('/map');
  };

  useEffect(() => {
    // Optionally, set a fallback timeout in case the video fails to load.
    const fallbackTimeout = setTimeout(() => {
      navigate('/map');
    }, 30000); // e.g., 30 seconds fallback

    return () => clearTimeout(fallbackTimeout);
  }, [navigate]);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'black' }}>
      <video
        autoPlay
        onEnded={handleVideoEnd}
        style={{ width: '100%', height: '100%' }}
        controls={false}
      >
        <source src={welcomeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default WelcomeVideo;
