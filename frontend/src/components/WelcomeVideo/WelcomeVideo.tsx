// src/components/WelcomeVideo/WelcomeVideo.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeVideo from '../../assets/welcome.mp4'; // Adjust the path as needed
import styles from './WelcomeVideo.module.scss';

const WelcomeVideo: React.FC = () => {
  const navigate = useNavigate();

  const handleVideoEnd = () => {
    // When the video ends, redirect to the map page.
    navigate('/map');
  };

  const handleSkipVideo = () => {
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
    <div className={styles.container}>
      <video
        autoPlay
        onEnded={handleVideoEnd}
        className={styles.video}
        controls={false}
      >
        <source src={welcomeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button
        onClick={handleSkipVideo}
        className={styles.skipButton}
      >
        Skip Video
      </button>
    </div>
  );
};

export default WelcomeVideo;