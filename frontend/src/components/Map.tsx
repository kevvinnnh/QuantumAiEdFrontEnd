// src/components/Map.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Quiz from './Quiz';
import ConceptBook from './ConceptBook'

async function fakeLogin() {
  try {
    const response = await fetch('http://localhost:5000/append_user_id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user_id: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      }),
    });
    if (!response.ok) {
      throw new Error(`fakeLogin failed, status = ${response.status}`);
    }
    const data = await response.json();
    console.log('fakeLogin response:', data);
  } catch (error) {
    console.error('fakeLogin error:', error);
  }
}

async function fetchQuizProgress() {
  const response = await fetch('http://localhost:5000/get_quiz_progress', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch quiz progress, status = ${response.status}`);
  }
  return response.json();
}

async function saveQuizProgress(completedQuiz: number, unlockQuiz: number) {
  const response = await fetch('http://localhost:5000/save_quiz_progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ completedQuiz, unlockQuiz }),
  });
  if (!response.ok) {
    throw new Error(`save_quiz_progress failed, status = ${response.status}`);
  }
  return response.json();
}

const definitions: Record<string, string> = {
  qubit:
    'A qubit is the quantum version of a classical bit, capable of representing 0, 1, or both simultaneously through superposition.',
  superposition:
    'The ability of a qubit to be in multiple states (0 and 1) simultaneously.',
  entanglement:
    'A quantum phenomenon where two or more qubits are linked, so the state of one affects the other.',
  measurement:
    'The act of observing a qubit, which collapses it into a definite state of either 0 or 1.',
};

const handleWordClick = (term: string) => {
  alert(definitions[term] || 'Definition not found.');
};

const Map: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [bookOpen, setBookOpen] = useState<boolean>(false);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);
  const navigate = useNavigate();
  const [showBookPopup, setShowBookPopup] = useState<boolean>(false);
  const [showQuizPopup, setShowQuizPopup] = useState<boolean>(false);

  // Guide popups for this page:
  const [showEncryptionPopup, setShowEncryptionPopup] = useState<boolean>(true);
  const [showConceptGuidePopup, setShowConceptGuidePopup] = useState<boolean>(true);
  const [showQuizGuidePopup, setShowQuizGuidePopup] = useState<boolean>(true);

  const levels = [
    { id: 0, name: 'Why Quantum Computing?' },
    { id: 1, name: 'Quantum Computing in Cryptography' },
    { id: 2, name: 'Quantum Computing in Scientific Simulation' },
    { id: 3, name: 'Quantum Computing in Optimization' },
    { id: 4, name: 'Quantum Computing in Machine Learning' },
  ];

  useEffect(() => {
    (async () => {
      try {
        await fakeLogin();
        const result = await fetchQuizProgress();
        setUnlockedLevels(result.unlockedLevels || [0]);
      } catch (error) {
        console.error('Error in useEffect:', error);
        setUnlockedLevels([0]);
      }
    })();

    const hasSeenBookPopup = localStorage.getItem('seenBookPopup');
    const hasSeenQuizPopup = localStorage.getItem('seenQuizPopup');
    if (!hasSeenBookPopup) setShowBookPopup(true);
    if (!hasSeenQuizPopup) setShowQuizPopup(false);
  }, []);

  const handleLevelClick = (levelId: number) => {
    if (unlockedLevels.includes(levelId)) {
      setCurrentLevel(levelId);
      setQuizOpen(true);
    }
  };

  const handleQuizCompletion = async (score: number, passed: boolean) => {
    console.log('User final score was:', score);
    setQuizOpen(false);
    if (passed) {
      const nextLevel = currentLevel + 1;
      if (nextLevel < levels.length && !unlockedLevels.includes(nextLevel)) {
        try {
          await saveQuizProgress(currentLevel, nextLevel);
          const updated = await fetchQuizProgress();
          setUnlockedLevels(updated.unlockedLevels || []);
        } catch (error) {
          console.error('Error saving quiz progress:', error);
        }
      }
    }
  };

  const handleQuizExit = () => {
    setQuizOpen(false);
    navigate('/map');
  };

  const handleBookOpen = () => {
    if (!localStorage.getItem('seenBookPopup')) {
      localStorage.setItem('seenBookPopup', 'true');
      setShowBookPopup(true);
    } else {
      setBookOpen(true);
    }
  };

  const handleQuizOpen = () => {
    if (!localStorage.getItem('seenQuizPopup')) {
      localStorage.setItem('seenQuizPopup', 'true');
      setShowQuizPopup(true);
    } else {
      setQuizOpen(true);
    }
  };

  const closePopup = () => {
    setShowBookPopup(false);
    setShowQuizPopup(false);
  };

  const handleBookClose = () => setBookOpen(false);

  // Guide popup content definitions:
  const encryptionPopupContent = {
    title: 'Encryption',
    message:
      'Encryption is like a digital vault with a secret code – without the key, your data stays locked.',
  };

  const conceptGuidePopupContent = {
    message:
      'Tap this button to open your Concept Book – an in-depth, interactive learning space that provides textbook-style explanations, key concepts, and insights to deepen your understanding',
  };

  const quizGuidePopupContent = {
    message:
      'Tap this circle to start the quiz for this chapter – test your knowledge and unlock the next level!',
  };

  return (
    <div
      id="root"
      style={{
        position: 'relative',
        height: '100vh',
        overflowY: 'scroll',
        background: '#F5F5F5',
      }}
    >
      {/* Full-Screen Encryption Popup */}
      {showEncryptionPopup && (
        <div style={fullScreenPopupStyle}>
          <h2 style={{ color: '#fff', marginBottom: '10px' }}>
            {encryptionPopupContent.title}
          </h2>
          <p style={fullScreenPopupTextStyle}>
            {encryptionPopupContent.message}
          </p>
          <button style={fullScreenPopupButtonStyle} onClick={() => setShowEncryptionPopup(false)}>
            Next
          </button>
        </div>
      )}

      {/* Header with Concept Book Button Right-Aligned */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 10px',
          padding: '10px',
          backgroundColor: '#F0F0F0',
          borderRadius: '10px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2em' }}>
          Chapter {currentLevel + 1}: {levels[currentLevel].name}
        </h2>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button
            className="button"
            style={{
              fontSize: '1em',
              padding: '10px 10px',
              borderRadius: '8px',
              backgroundColor: '#566395',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              width: '200px', 
              height: '70px'
            }}
            onClick={handleBookOpen}
          >
            📖 Concept Book
          </button>
          {showConceptGuidePopup && (
            <div style={conceptPopupStyle}>
              <p style={{ fontSize: '0.9em', margin: 0 }}>
                {conceptGuidePopupContent.message}
              </p>
              <button onClick={() => setShowConceptGuidePopup(false)} style={popupButtonStyle}>
                Got It
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map of Levels */}
      <div style={{ position: 'relative', marginTop: '30px' }}>
        {levels.map((level, index) => {
          const isCurrent = level.id === currentLevel;
          return (
            <React.Fragment key={index}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className="button"
                  style={{
                    margin: '0 auto',
                    display: 'block',
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? '#566395' : unlockedLevels.includes(level.id) ? '#A487AE' : '#E8E3F3',
                    cursor: unlockedLevels.includes(level.id) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    fontSize: '1em',
                    color: '#E8E3F3',
                    textAlign: 'center',
                    lineHeight: '1.2em',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                  onClick={() => handleLevelClick(level.id)}
                  disabled={!unlockedLevels.includes(level.id)}
                >
                  {level.name}
                </button>
                {isCurrent && showQuizGuidePopup && (
                  <div style={quizPopupStyle}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>
                      {quizGuidePopupContent.message}
                    </p>
                    <button onClick={() => setShowQuizGuidePopup(false)} style={popupButtonStyle}>
                      Got It
                    </button>
                  </div>
                )}
              </div>
              {index < levels.length - 1 && (
                <div
                  style={{
                    width: '5px',
                    height: '40px',
                    backgroundColor: '#A487AE',
                    margin: '10px auto',
                  }}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Existing Concept Book Popup */}
      {showBookPopup && (
        <div style={modalStyle}>
          <h2>Concept Book</h2>
          <p>
            This is your pocket guide to quantum computing concepts. Tap the Concept Book button (located in the header) to view detailed explanations, tips, and further resources.
          </p>
          <button onClick={() => { closePopup(); setBookOpen(true); }} style={modalButtonStyle}>
            Got It!
          </button>
        </div>
      )}

      {/* Existing Quiz Popup */}
      {showQuizPopup && (
        <div style={modalStyle}>
          <h2>Quiz</h2>
          <p>
            The quiz tests your understanding of the chapter’s ideas. Tap the quiz button (the current level’s circle) to start the challenge and unlock the next level.
          </p>
          <button onClick={() => { closePopup(); setQuizOpen(true); }} style={modalButtonStyle}>
            Got It!
          </button>
        </div>
      )}

      {/* Quiz Modal */}
      {quizOpen && (
        <div style={modalStyle}>
          <Quiz onExit={handleQuizExit} onComplete={handleQuizCompletion} />
        </div>
      )}
{bookOpen && (
  <ConceptBook currentLevel={currentLevel} onClose={() => setBookOpen(false)} />
)}


      <Link
        to="/profile"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: '#566395',
          color: '#E8E3F3',
          padding: '15px',
          borderRadius: '50%',
          textDecoration: 'none',
          width: '65px',
          height: '65px',
          fontSize: '1.35em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        👤
      </Link>
    </div>
  );
};

const fullScreenPopupStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 3000,
  padding: '20px',
};

const fullScreenPopupTextStyle: React.CSSProperties = {
  color: '#ddd',
  textAlign: 'center',
  maxWidth: '500px',
  marginBottom: '20px',
};

const fullScreenPopupButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#566395',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
};

const conceptPopupStyle: React.CSSProperties = {
  position: 'absolute',
  top: '110%',
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  padding: '10px',
  borderRadius: '5px',
  width: '220px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  zIndex: 1500,
};

const quizPopupStyle: React.CSSProperties = {
  position: 'absolute',
  top: '110%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  padding: '10px',
  borderRadius: '5px',
  width: '220px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  zIndex: 1500,
};

const popupButtonStyle: React.CSSProperties = {
  marginTop: '5px',
  fontSize: '0.8em',
  padding: '5px 10px',
  backgroundColor: '#566395',
  color: '#fff',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
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
  width: '85%',
  maxWidth: '1400px',
  height: '93%',
  overflowY: 'scroll',
};

const modalButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#566395',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
};

export default Map;
