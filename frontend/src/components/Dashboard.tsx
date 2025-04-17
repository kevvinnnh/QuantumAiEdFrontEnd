// src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import Reading from './Reading';
import Quiz from './Quiz';
import GlobalChat from './GlobalChat';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';
import { allQuizData } from './QuizQuestion';
import lesson0Img from '../assets/lessonIcons/lesson-0.png';
import lesson1Img from '../assets/lessonIcons/lesson-1.png';
import lesson2Img from '../assets/lessonIcons/lesson-2.png';
import { useNavigate } from 'react-router-dom';


/* ------------------------------------------------------------------ */
/* THEME COLORS                                                       */
/* ------------------------------------------------------------------ */
const colors = {
  dark: '#010117',
  accent: '#071746',
  primary: '#566395',
  light: '#f8f9fa',
  white: '#FFFFFF',
  cardBackground: 'rgba(255,255,255,0.05)',
  lessonBackground: 'rgba(255,255,255,0.03)',
  modalBackground: '#FFFFFF',
  modalTextColor: '#111111',
  border: 'rgba(255,255,255,0.1)',
};

/* ------------------------------------------------------------------ */
/* STATIC COURSE DATA                                                 */
/* ------------------------------------------------------------------ */
const courses = [
  { id: 0, title: 'Introduction to quantum computing', description: 'Discover what quantum computing is and how it differs from classical computing.', image: lesson0Img, progress: 30 },
  { id: 1, title: 'Basic Quantum principles', description: 'Understand wave‑particle duality, superposition, entanglement, and more.', image: lesson1Img , progress: 0 },
  { id: 2, title: 'Quantum Gates and Circuits (Basics)', description: 'Explore how quantum gates form the building blocks of quantum circuits.', image: lesson2Img , progress: 0 },
  { id: 3, title: 'Getting Hands‑on', description: 'Learn practical quantum computing with real‑world examples.', image: lesson0Img, progress: 0 },
  { id: 4, title: 'Foundations for Quantum computing', description: 'Dive deeper into the essential math and physics behind quantum computing.', image: lesson1Img, progress: 0 },
  { id: 5, title: 'Quantum Cryptography & Security', description: 'Learn how quantum computing impacts cryptography, encryption and security protocols.', image: lesson2Img, progress: 0 },
  { id: 6, title: 'Adiabatic Quantum Computing', description: 'Explore the adiabatic model and quantum annealing techniques.', image: lesson0Img, progress: 0 },
  { id: 7, title: 'Quantum Signal Processing & Simulation', description: 'Understand how quantum systems simulate complex physical processes.', image: lesson1Img, progress: 0 },
  { id: 8, title: 'Quantum Hardware & Future Trends', description: 'Discover the cutting‑edge hardware behind quantum computers.', image: lesson2Img , progress: 0 },
];

const Dashboard: React.FC = () => {
  /* ---------- view / lesson state -------------------------------- */
  const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number>(0);
  const [unlocked, setUnlocked] = useState<number[]>([0]);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);

  /* ---------- chat & highlight state ------------------------------ */
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [highlightMode, setHighlightMode] = useState<'explain' | 'analogy' | null>(null);

  /* ---------- navigation helpers --------------------------------- */
  const goDashboard = () => {
    setView('dashboard');
    setChatOpen(false);
  };
  const navigate = useNavigate();

  const openLesson = (id: number) => {
    if (!unlocked.includes(id)) {
      alert('This course is locked. Complete the previous course first.');
      return;
    }
    setCurrentCourse(id);
    setView('lesson');
    setChatOpen(false);
  };

  /* ---------- highlight callbacks -------------------------------- */
  const handleExplain = (text: string) => {
    setHighlightText(text);
    setHighlightMode('explain');
    setChatOpen(true);
  };

  const handleAnalogy = (text: string) => {
    setHighlightText(text);
    setHighlightMode('analogy');
    setChatOpen(true);
  };

  /* ---------- quiz completion ------------------------------------ */
  const onQuizComplete = (_score: number, passed: boolean) => {
    setQuizOpen(false);
    if (!passed) {
      alert('You need 70% or higher to pass. Keep learning and try again!');
      return;
    }
    const next = currentCourse + 1;
    setUnlocked((prev) => (prev.includes(next) ? prev : [...prev, next].sort((a, b) => a - b)));
    if (next < courses.length) {
      alert(`Great job! Lesson ${next + 1} unlocked.`);
      openLesson(next);
    } else {
      alert("Congratulations! You've completed all courses!");
      goDashboard();
    }
  };

  /* ---------- quiz availability check ---------------------------- */
  const currentQuiz = allQuizData[currentCourse] || [];
  useEffect(() => {
    if (quizOpen && currentQuiz.length === 0) {
      alert('Quiz not available for this lesson yet.');
      setQuizOpen(false);
    }
  }, [quizOpen, currentQuiz]);

  /* ---------- render helpers ------------------------------------- */
  const courseCard = (c: typeof courses[0]) => (
    <div
      key={c.id}
      style={{
        ...styles.card,
        ...(unlocked.includes(c.id) ? styles.cardEnabled : styles.cardDisabled),
      }}
      onClick={() => openLesson(c.id)}
    >
      <img src={c.image} alt={c.title} style={styles.cardImg} />
      <div style={styles.cardContent}>
        <h4 style={styles.cardTitle}>{c.title}</h4>
        <p style={styles.cardDescription}>{c.description}</p>
        {c.progress > 0 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${c.progress}%` }} />
            <span style={styles.progressText}>{c.progress}% complete</span>
          </div>
        )}
      </div>
      {!unlocked.includes(c.id) && <div style={styles.lockIcon}>🔒</div>}
    </div>
  );

  const lessonView = () => {
    const course = courses[currentCourse];
    return (
      <div style={styles.lessonContainer}>
        <button style={styles.backButton} onClick={goDashboard}>
          <FaArrowLeft style={{ marginRight: 8 }} />
          Back to Courses
        </button>

        <h2 style={styles.lessonTitle}>{course.title}</h2>
        <img src={course.image} alt={course.title} style={styles.lessonImage} />
        <p style={styles.lessonDescription}>{course.description}</p>

        <HighlightableInstructionsForReading
          onExplain={handleExplain}
          onViewAnalogy={handleAnalogy}
        >
          <Reading
            courseId={currentCourse}
            onExplainRequest={handleExplain}
            onViewAnalogy={handleAnalogy}
          />
        </HighlightableInstructionsForReading>

        <button style={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
          Take Quiz
        </button>
      </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* JSX                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div style={styles.container}>
      {/* LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        <h1 style={styles.logoText}>Quantaide</h1>
        <button
          style={{
            ...styles.navButton,
            ...(view === 'dashboard' ? styles.navButtonActive : {}),
          }}
          onClick={goDashboard}
        >
          Lessons
        </button>
      </aside>

      {/* MAIN PANEL */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>
            {view === 'lesson' ? courses[currentCourse].title : 'Lessons'}
          </h2>
          <div style={styles.headerIcons}>
            <button
              style={styles.chatButton}
              onClick={() => setChatOpen((o) => !o)}
              aria-label="Toggle Chat"
            >
              <FaCommentDots size="1.5em" /> <span>Chat</span>
            </button>
            <button
   style={styles.profileBtn}
   onClick={() => navigate('/profile')}
 >
   👤
 </button>
          </div>
        </header>

        <div style={styles.content}>
          {view === 'dashboard' ? (
            <>
              <section style={styles.rowSection}>
                <h2 style={styles.rowTitle}>Foundations</h2>
                <div style={styles.cardGrid}>{courses.slice(0, 3).map(courseCard)}</div>
              </section>

              <section style={styles.rowSection}>
                <h2 style={styles.rowTitle}>Quantum computing in action</h2>
                <div style={styles.cardGrid}>{courses.slice(3, 6).map(courseCard)}</div>
              </section>

              <section style={styles.rowSection}>
                <h2 style={styles.rowTitle}>Deep dive into quantum theory</h2>
                <div style={styles.cardGrid}>{courses.slice(6, 9).map(courseCard)}</div>
              </section>
            </>
          ) : (
            lessonView()
          )}
        </div>
      </main>

      {/* QUIZ MODAL */}
      {quizOpen && currentQuiz.length > 0 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Quiz
              courseId={currentCourse}
              questions={currentQuiz}
              onExit={() => { setQuizOpen(false); goDashboard(); }}
              onComplete={onQuizComplete}
            />
          </div>
        </div>
      )}

      {/* GLOBAL CHAT DRAWER */}
      <GlobalChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        highlightText={highlightText}
        highlightMode={highlightMode}
      />
    </div>
  );
};
/* ------------------------------------------------------------------ */
/* INLINE STYLES                                                     */
/* ------------------------------------------------------------------ */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.accent} 100%)`,
    color: colors.light,
  },
  sidebar: {
    width: 250,
    background: colors.dark,
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    borderRight: `1px solid ${colors.border}`,
  },
  logoText: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    color: colors.white,
  },
  navButton: {
    background: 'none',
    border: 'none',
    color: colors.dark,
    fontSize: '1.1rem',
    padding: '12px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    fontWeight: 'bold',
    borderLeft: `3px solid ${colors.primary}`,
    color: colors.light,
    
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    background: colors.dark,
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 600 },
  headerIcons: { display: 'flex', alignItems: 'center', gap: 12 },
  chatButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    background: colors.primary,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: colors.white,
  },
  profileBtn: {
    background: 'none',
    border: 'none',
    color: colors.white,
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  content: { padding: 25, flex: 1 },
  rowSection: { marginBottom: 40 },
  rowTitle: { margin: '0 0 15px', fontSize: '1.4rem', color: colors.white },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 25 },
  card: { backgroundColor: colors.cardBackground, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  cardEnabled: { cursor: 'pointer' },
  cardDisabled: { cursor: 'not-allowed', opacity: 0.6 },
  cardImg: { width: '100%', height: 160, objectFit: 'cover' },
  cardContent: { padding: 15 },
  cardTitle: { margin: '0 0 8px', fontSize: '1.2rem', color: colors.white },
  cardDescription: { margin: 0, fontSize: '0.95rem', color: colors.light },
  progressBar: { position: 'relative', height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 4, marginTop: 10 },
  progressFill: { height: '100%', background: colors.primary, borderRadius: 4 },
  progressText: { position: 'absolute', top: -22, right: 0, fontSize: 12, color: colors.light },
  lockIcon: { position: 'absolute', top: 10, right: 10, fontSize: '1.4rem', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white },
  lessonContainer: { backgroundColor: colors.lessonBackground, borderRadius: 8, padding: '30px 40px', maxWidth: 900, margin: '20px auto' },
  backButton: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: colors.primary, color: colors.white, border: 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 20 },
  lessonTitle: { fontSize: '2.2rem', margin: '0 0 20px', color: colors.white, borderBottom: `2px solid ${colors.primary}`, paddingBottom: 10 },
  lessonImage: { width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 5, marginBottom: 20 },
  lessonDescription: { fontSize: '1.1rem', marginBottom: 30, color: colors.light },
  takeQuizButton: { display: 'block', margin: '30px auto 0',	padding: '12px 30px', background: colors.primary, color: colors.white, border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '1.1rem' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 },
  modalContent: { background: colors.modalBackground, color: colors.modalTextColor, borderRadius: 10, overflow: 'hidden', width: 'clamp(300px,90%,1200px)', height: 'clamp(400px,80vh,800px)' },
};

export default Dashboard;
