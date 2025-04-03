// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Quiz from './Quiz';
import Reading from './Reading';

//
// ========= Color Palette =========
//
const colors = {
  dark: "#010117",
  accent: "#071746",
  primary: "#566395",
  light: "#f8f9fa",
  white: "#FFFFFF",
  cardBackground: "rgba(255,255,255,0.1)",
  lessonBackground: "rgba(255,255,255,0.1)",
  modalBackground: "#FFFFFF",
  popupBackground: "#FFFFFF",
  popupText: "#000000",
  border: "rgba(255,255,255,0.2)"
};

//
// ========= Helper Functions =========
//
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

async function saveQuizProgress(completedCourse: number, unlockCourse: number) {
  const response = await fetch('http://localhost:5000/save_quiz_progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ completedQuiz: completedCourse, unlockQuiz: unlockCourse }),
  });
  if (!response.ok) {
    throw new Error(`save_quiz_progress failed, status = ${response.status}`);
  }
  return response.json();
}

//
// ========= Course Data =========
//
const courses = [
  // FOUNDATIONS
  {
    id: 0,
    title: 'Introduction to quantum computing',
    description: 'Discover how quantum computing differs from classical computing.',
    image: 'https://via.placeholder.com/300x200?text=Intro+to+Quantum',
  },
  {
    id: 1,
    title: 'Basic Quantum principles',
    description: 'Understand wave-particle duality, superposition, entanglement, and more.',
    image: 'https://via.placeholder.com/300x200?text=Quantum+Principles',
  },
  {
    id: 2,
    title: 'Quantum Gates and Circuits (Basics)',
    description: 'Explore how quantum gates form the building blocks of quantum circuits.',
    image: 'https://via.placeholder.com/300x200?text=Quantum+Gates',
  },
  // QUANTUM COMPUTING IN ACTION
  {
    id: 3,
    title: 'Getting Hands-on',
    description: 'Learn practical quantum computing with real-world examples.',
    image: 'https://via.placeholder.com/300x200?text=Hands-on',
  },
  {
    id: 4,
    title: 'Foundations for Quantum Computing',
    description: 'Dive deeper into the essential math and physics behind quantum computing.',
    image: 'https://via.placeholder.com/300x200?text=Foundations+QC',
  },
  {
    id: 5,
    title: 'Quantum Workflows',
    description: 'Learn about compilers, simulators, and toolchains for quantum development.',
    image: 'https://via.placeholder.com/300x200?text=Workflows',
  },
  // DEEP DIVE
  {
    id: 6,
    title: 'Adiabatic Quantum Computing',
    description: 'Explore the adiabatic model and quantum annealing techniques.',
    image: 'https://via.placeholder.com/300x200?text=Adiabatic',
  },
  {
    id: 7,
    title: 'Quantum Signal Processing & Simulation',
    description: 'Understand how quantum systems simulate complex physical processes.',
    image: 'https://via.placeholder.com/300x200?text=Signal+Processing',
  },
  {
    id: 8,
    title: 'Quantum Hardware & Future Trends',
    description: 'Discover the cutting-edge hardware behind quantum computers.',
    image: 'https://via.placeholder.com/300x200?text=Hardware+Trends',
  },
];

//
// ========= Dashboard Component =========
//
const Dashboard: React.FC = () => {
  // Removed unused navigate and handleQuizOpen to fix TS error 6133
  const [viewMode, setViewMode] = useState<'dashboard' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number>(0);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [unlockedCourses, setUnlockedCourses] = useState<number[]>([]);
  const [showEncryptionPopup, setShowEncryptionPopup] = useState<boolean>(true);
  const [showQuizPopup, setShowQuizPopup] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        await fakeLogin();
        const result = await fetchQuizProgress();
        setUnlockedCourses(result.unlockedLevels || [0]);
      } catch (error) {
        console.error('Error in useEffect:', error);
        setUnlockedCourses([0]);
      }
    })();

    const hasSeenQuizPopup = localStorage.getItem('seenQuizPopup');
    if (!hasSeenQuizPopup) setShowQuizPopup(false);
  }, []);

  const handleCourseClick = (courseId: number) => {
    if (unlockedCourses.includes(courseId)) {
      setCurrentCourse(courseId);
      setViewMode('lesson');
    } else {
      alert('This course is locked. Complete the previous course(s) first!');
    }
  };

  const renderLessonDetail = () => {
    const course = courses.find((c) => c.id === currentCourse);
    if (!course) return null;
    return (
      <div style={styles.lessonContainer}>
        <button style={styles.backButton} onClick={() => setViewMode('dashboard')}>
          ← Back to Courses
        </button>
        <h2 style={styles.lessonTitle}>{course.title}</h2>
        <img src={course.image} alt={course.title} style={styles.lessonImage} />
        <p style={styles.lessonDescription}>{course.description}</p>

        {course.id === 0 && <Reading />}

        <div style={styles.rereadingsBox}>
          <h3 style={styles.rereadingsTitle}>Rereadings</h3>
          <ul style={styles.rereadingsList}>
            <li>Article: "Quantum Computing 101"</li>
            <li>Video: "Introduction to Qubits"</li>
            <li>Paper: "The Future of Quantum Algorithms"</li>
          </ul>
        </div>
        <button style={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
          Take Quiz
        </button>
      </div>
    );
  };

  const handleQuizCompletion = async (score: number, passed: boolean) => {
    console.log('User final score was:', score);
    setQuizOpen(false);
    if (passed) {
      const nextCourse = currentCourse + 1;
      if (nextCourse < courses.length && !unlockedCourses.includes(nextCourse)) {
        try {
          await saveQuizProgress(currentCourse, nextCourse);
          const updated = await fetchQuizProgress();
          setUnlockedCourses(updated.unlockedLevels || []);
        } catch (error) {
          console.error('Error saving quiz progress:', error);
        }
      }
    }
  };

  const handleQuizExit = () => {
    setQuizOpen(false);
    setViewMode('lesson');
  };

  return (
    <div style={styles.container}>
      {showEncryptionPopup && (
        <div style={styles.encryptionPopupOverlay}>
          <div style={styles.encryptionPopup}>
            <h2 style={{ marginBottom: '10px' }}>Encryption</h2>
            <p style={{ marginBottom: '20px' }}>
              Encryption is like a digital vault with a secret code – without the key, your data stays locked.
            </p>
            <button style={styles.popupButton} onClick={() => setShowEncryptionPopup(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {showQuizPopup && (
        <div style={styles.quizPopupOverlay}>
          <div style={styles.quizPopup}>
            <h2>Quiz</h2>
            <p>
              The quiz tests your understanding. Click below to start the challenge and unlock the next course.
            </p>
            <button
              onClick={() => {
                setShowQuizPopup(false);
                setQuizOpen(true);
              }}
              style={styles.popupButton}
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logoText}>Quantaide</h1>
        </div>
        <nav style={styles.nav}>
          <Link to="/map" style={styles.navLink}>
            Dashboard
          </Link>
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>Courses</h2>
          <div style={styles.headerIcons}>
            <Link to="/profile" style={styles.profileLink}>
              <span role="img" aria-label="user" style={styles.userIcon}>
                👤
              </span>
            </Link>
          </div>
        </header>

        <div style={styles.content}>
          {viewMode === 'dashboard' && (
            <>
              <section style={styles.courseSection}>
                <h3 style={styles.sectionTitle}>Foundations</h3>
                <div style={styles.cardGrid}>
                  {courses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      style={{
                        ...styles.card,
                        opacity: unlockedCourses.includes(course.id) ? 1 : 0.5,
                        cursor: unlockedCourses.includes(course.id) ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <img src={course.image} alt={course.title} style={styles.cardImg} />
                      <h4 style={styles.cardTitle}>{course.title}</h4>
                      <p style={styles.cardDescription}>{course.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.courseSection}>
                <h3 style={styles.sectionTitle}>Quantum computing in action</h3>
                <div style={styles.cardGrid}>
                  {courses.slice(3, 6).map((course) => (
                    <div
                      key={course.id}
                      style={{
                        ...styles.card,
                        opacity: unlockedCourses.includes(course.id) ? 1 : 0.5,
                        cursor: unlockedCourses.includes(course.id) ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <img src={course.image} alt={course.title} style={styles.cardImg} />
                      <h4 style={styles.cardTitle}>{course.title}</h4>
                      <p style={styles.cardDescription}>{course.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.courseSection}>
                <h3 style={styles.sectionTitle}>Deep dive into quantum theory</h3>
                <div style={styles.cardGrid}>
                  {courses.slice(6, 9).map((course) => (
                    <div
                      key={course.id}
                      style={{
                        ...styles.card,
                        opacity: unlockedCourses.includes(course.id) ? 1 : 0.5,
                        cursor: unlockedCourses.includes(course.id) ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <img src={course.image} alt={course.title} style={styles.cardImg} />
                      <h4 style={styles.cardTitle}>{course.title}</h4>
                      <p style={styles.cardDescription}>{course.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {viewMode === 'lesson' && renderLessonDetail()}
        </div>
      </main>

      {quizOpen && (
        <div style={styles.modalStyle}>
          <Quiz onExit={handleQuizExit} onComplete={handleQuizCompletion} />
        </div>
      )}
    </div>
  );
};

//
// ========= STYLES =========
//
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: `linear-gradient(to bottom, ${colors.dark}, ${colors.accent})`,
    color: colors.white,
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  encryptionPopupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 3000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  encryptionPopup: {
    backgroundColor: colors.popupBackground,
    color: colors.popupText,
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '400px',
    textAlign: 'center',
  },
  quizPopupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 3000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizPopup: {
    backgroundColor: colors.popupBackground,
    color: colors.popupText,
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '400px',
    textAlign: 'center',
  },
  popupButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  sidebar: {
    width: '240px',
    background: `linear-gradient(to bottom, ${colors.dark}, ${colors.accent})`,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxSizing: 'border-box',
    borderRight: `1px solid ${colors.border}`,
  },
  logoContainer: {
    marginBottom: '40px',
  },
  logoText: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: colors.white,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  navLink: {
    textDecoration: 'none',
    color: colors.white,
    fontSize: '1.1rem',
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: `linear-gradient(to bottom, ${colors.dark}, ${colors.accent})`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${colors.border}`,
  },
  headerTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    flex: 1,
  },
  headerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  profileLink: {
    textDecoration: 'none',
    color: colors.white,
  },
  userIcon: {
    fontSize: '1.8rem',
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
  },
  courseSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.6rem',
    marginBottom: '20px',
    color: colors.white,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    transition: 'opacity 0.3s ease',
  },
  cardImg: {
    width: '100%',
    height: 'auto',
    borderRadius: '5px',
    marginBottom: '10px',
    objectFit: 'cover',
    backgroundColor: '#ccc',
  },
  cardTitle: {
    fontSize: '1.2rem',
    margin: '0 0 8px 0',
    color: colors.white,
  },
  cardDescription: {
    fontSize: '0.95rem',
    lineHeight: 1.4,
    color: '#E0E0E0',
  },
  lessonContainer: {
    backgroundColor: colors.lessonBackground,
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: colors.primary,
    fontSize: '1.5rem',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  lessonTitle: {
    fontSize: '2.2rem',
    marginBottom: '20px',
  },
  lessonImage: {
    width: '100%',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  lessonDescription: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  rereadingsBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  rereadingsTitle: {
    fontSize: '1.4rem',
    marginBottom: '10px',
  },
  rereadingsList: {
    fontSize: '1rem',
    lineHeight: 1.6,
    margin: 0,
    paddingLeft: '20px',
  },
  takeQuizButton: {
    padding: '15px 25px',
    backgroundColor: colors.primary,
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1rem',
    color: colors.white,
    cursor: 'pointer',
  },
  modalStyle: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: colors.modalBackground,
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    width: '85%',
    maxWidth: '1400px',
    height: '93%',
    overflowY: 'scroll',
  },
};

export default Dashboard;
