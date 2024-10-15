import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Quiz from './Quiz';


const Map: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [bookOpen, setBookOpen] = useState<boolean>(false);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([0]); // Starts with only the first level unlocked

  const levels = [
    { id: 0, name: 'Why Quantum Computing?', unlocked: true },
    { id: 1, name: 'Quantum Computing in Cryptography', unlocked: false },
    { id: 2, name: 'Quantum Computing in Scientific Simulation', unlocked: false },
    { id: 3, name: 'Quantum Computing in Optimization', unlocked: false },
    { id: 4, name: 'Quantum Computing in Machine Learning', unlocked: false },
  ];

  const handleLevelClick = (levelId: number) => {
    if (unlockedLevels.includes(levelId)) {
      setCurrentLevel(levelId);
      setQuizOpen(true);
    }
  };

  const handleQuizCompletion = (score: number) => {
    setQuizOpen(false);

    if (score >= 8) {
      const nextLevel = currentLevel + 1;

      if (nextLevel < levels.length && !unlockedLevels.includes(nextLevel)) {
        setUnlockedLevels([...unlockedLevels, nextLevel]); // Unlock the next level
      }
    }
  };

  const handleBookOpen = () => {
    setBookOpen(true);
  };

  const handleBookClose = () => {
    setBookOpen(false);
  };

  const handleQuizExit = () => {
    setQuizOpen(false); // Exit the quiz
  };

  return (
    <div id="root" style={{ position: 'relative', height: '100vh', overflowY: 'scroll', background: '#F5F5F5' }}>
      {/* Current Chapter Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '20px 10px',
        padding: '10px',
        backgroundColor: '#F0F0F0',
        borderRadius: '10px',
        position: 'sticky',
        top: '0',
        zIndex: 1000
      }}>
        <h2 style={{ margin: '0', fontSize: '1.2em' }}>Chapter 1: {levels[currentLevel].name}</h2>
        <button className="button" style={{ fontSize: '1.2em' }} onClick={handleBookOpen}>📖</button>
      </div>

      {/* Map of Levels */}
      <div style={{ position: 'relative', marginTop: '30px' }}>
        {levels.map((level, index) => (
          <React.Fragment key={index}>
            {/* Circle representing the level */}
            <button
              className="button"
              style={{
                margin: '0 auto',
                display: 'block',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 
                  currentLevel === level.id ? '#566395' : // Dark blue/purple for the current level
                  unlockedLevels.includes(level.id) ? '#A487AE' : // Light purple for completed levels
                  '#E8E3F3', // Grayish for locked levels
                cursor: unlockedLevels.includes(level.id) ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.8em',
                color: '#E8E3F3',
                textAlign: 'center',
                lineHeight: '1.2em',
                padding: '5px',
              }}
              onClick={() => handleLevelClick(level.id)}
              disabled={!unlockedLevels.includes(level.id)}
            >
              <span style={{ wordWrap: 'break-word' }}>{level.name}</span>
            </button>

            {/* Trail to next level */}
            {index < levels.length - 1 && (
              <div style={{
                width: '5px',
                height: '40px',
                backgroundColor: '#A487AE',
                margin: '10px auto'
              }}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Quiz Modal */}
      {quizOpen && (
        <div style={modalStyle}>
          <Quiz concept={levels[currentLevel].name} onComplete={handleQuizCompletion} onExit={handleQuizExit} />
        </div>
      )}

      {/* Concept Book Modal */}
      {bookOpen && (
        <div style={modalStyle}>
          <h3>Concept Book for {levels[currentLevel].name}</h3>
          <p>Here you can study the concepts for {levels[currentLevel].name}.</p>
          {/* Concept Book Exit Button (X) */}
<button
  onClick={handleBookClose}
  style={{
    position: 'absolute',
    top: '5px',
    left: '5px',  // Exit button aligned to the left
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    color: '#070F14'
  }}
>
  ✖
</button>

        </div>
      )}

      {/* Profile Link */}
      <Link to="/profile" style={profileLinkStyle}>👤</Link>
    </div>
  );
};

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  width: '80%',
  height: '80%',
  overflowY: 'scroll'
};

const profileLinkStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '10px',
  right: '10px',
  backgroundColor: '#566395',
  color: '#E8E3F3',
  padding: '15px',
  borderRadius: '50%',
  textDecoration: 'none',
  width: '50px',
  height: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default Map;
