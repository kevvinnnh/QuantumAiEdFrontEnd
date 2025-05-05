// src/components/Dashboard.tsx

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import Reading from './Reading';
import Quiz from './Quiz';
import GlobalChat from './GlobalChat';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';
import { allQuizData } from './QuizQuestion'; // Corrected import name casing
import lesson0Img from '../assets/lessonIcons/lesson-0.png';
import lesson1Img from '../assets/lessonIcons/lesson-1.png';
import lesson2Img from '../assets/lessonIcons/lesson-2.png';
import { useNavigate } from 'react-router-dom';

// Define BACKEND_URL - Replace with your actual backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Use environment variable

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
// Ensure IDs match the backend logic (0-based indexing)
const courses = [
  { id: 0, title: 'Introduction to quantum computing', description: 'Discover what quantum computing is and how it differs from classical computing.', image: lesson0Img, progress: 0 }, // Progress needs dynamic update based on completedQuizzes
  { id: 1, title: 'Basic Quantum principles', description: 'Understand wave‑particle duality, superposition, entanglement, and more.', image: lesson1Img , progress: 0 },
  { id: 2, title: 'Quantum Gates and Circuits (Basics)', description: 'Explore how quantum gates form the building blocks of quantum circuits.', image: lesson2Img , progress: 0 },
  { id: 3, title: 'Getting Hands‑on', description: 'Learn practical quantum computing with real‑world examples.', image: lesson0Img, progress: 0 },
  { id: 4, title: 'Foundations for Quantum computing', description: 'Dive deeper into the essential math and physics behind quantum computing.', image: lesson1Img, progress: 0 },
  { id: 5, title: 'Quantum Cryptography & Security', description: 'Learn how quantum computing impacts cryptography, encryption and security protocols.', image: lesson2Img, progress: 0 },
  { id: 6, title: 'Adiabatic Quantum Computing', description: 'Explore the adiabatic model and quantum annealing techniques.', image: lesson0Img, progress: 0 },
  { id: 7, title: 'Quantum Signal Processing & Simulation', description: 'Understand how quantum systems simulate complex physical processes.', image: lesson1Img, progress: 0 },
  { id: 8, title: 'Quantum Hardware & Future Trends', description: 'Discover the cutting‑edge hardware behind quantum computers.', image: lesson2Img , progress: 0 },
];

// Interface for quiz completion data from backend (optional but good practice)
interface CompletedQuiz {
    courseId: number;
    score: number;
    passed: boolean;
    timestamp: string; // ISO date string
}

const Dashboard: React.FC = () => {
  /* ---------- view / lesson state -------------------------------- */
  const [view, setView] = useState<'dashboard' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number | null>(null); // Allow null initially
  // Initialize unlocked as empty, will be populated by fetch
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true); // Loading state
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]); // Store completed quiz details

  /* ---------- chat & highlight state ------------------------------ */
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [highlightMode, setHighlightMode] = useState<'explain' | 'analogy' | null>(null);

  /* ---------- navigation helpers --------------------------------- */
  const navigate = useNavigate();

  const goDashboard = useCallback(() => { // Wrap in useCallback if passed as prop or dependency
    setView('dashboard');
    setCurrentCourse(null); // Clear current course when going to dashboard
    setChatOpen(false); // Close chat when navigating away
  }, []); // No dependencies needed here

  // Function to fetch user progress
  const fetchUserProgress = useCallback(async () => {
    console.log("Fetching user progress...");
    setIsLoadingProgress(true);
    try {
      const response = await fetch(`${BACKEND_URL}/get_user_progress`, {
        method: 'GET',
        credentials: 'include', // Crucial for sending session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) { // Unauthorized
        console.log("User not logged in, redirecting to login.");
        navigate('/'); // Redirect to login page
        return; // Stop execution
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Progress data received:", data);
      setUnlocked(data.unlockedLevels || [0]); // Default to [0] if backend sends null/undefined
      setCompletedQuizzes(data.completedQuizzes || []); // Store completed quiz info
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      // Handle error appropriately, maybe show a message to the user
      // If progress fails, maybe default to basic state or show error message
      setUnlocked([0]); // Fallback to default if fetch fails
      setCompletedQuizzes([]);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [navigate]); // Add navigate as dependency

  // Fetch progress when the component mounts
  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]); // Run whenever fetchUserProgress changes (which is once due to useCallback)


  const openLesson = (id: number) => {
    if (isLoadingProgress) {
        console.log("Still loading progress, cannot open lesson yet.");
        return; // Don't allow opening lessons while loading
    }
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
  const onQuizComplete = async (score: number, passed: boolean) => {
      if (currentCourse === null) return; // Should not happen if quiz is open, but safety check

      setQuizOpen(false); // Close the quiz modal immediately

      // Prepare data to send to backend
      const quizResultData = {
          courseId: currentCourse,
          score: score, // Typically score is 0-100
          passed: passed,
      };

      try {
          console.log("Sending quiz result:", quizResultData);
          const response = await fetch(`${BACKEND_URL}/save_quiz_result`, {
              method: 'POST',
              credentials: 'include', // Send cookies
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(quizResultData),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log("Quiz result saved, backend response:", result);

          // **Update local state based on backend response**
          if (result.unlockedLevels) {
              setUnlocked(result.unlockedLevels);
          }
          // Optionally re-fetch all progress to ensure consistency, or just update unlocked
          // await fetchUserProgress(); // Alternative: Re-fetch everything

          // Show feedback to user AFTER backend confirmation
          if (!passed) {
              alert('You need 70% or higher to pass. Keep learning and try again!');
              // Stay in the current lesson or go back to dashboard?
              // Let's stay in the current lesson for now.
              // If you want to go back: goDashboard();
          } else {
              const nextLevelId = currentCourse + 1;
              if (result.unlockedLevels && result.unlockedLevels.includes(nextLevelId)) {
                  if (nextLevelId < courses.length) {
                      alert(`Great job! Lesson ${courses[nextLevelId].title} unlocked.`);
                      // Automatically open the next lesson
                      openLesson(nextLevelId);
                  } else {
                      alert("Congratulations! You've completed all available courses!");
                      goDashboard(); // Go back to dashboard if all courses are done
                  }
              } else {
                   // This case might happen if they re-take a quiz they already passed
                   alert(`Great job completing the quiz for ${courses[currentCourse].title}!`);
                   goDashboard(); // Or stay in lesson? Let's go to dashboard.
              }
          }

      } catch (error) {
          console.error('Failed to save quiz result:', error);
          alert(`An error occurred while saving your quiz progress: ${error instanceof Error ? error.message : String(error)}. Please try again.`);
          // Decide how to handle failed save: Maybe allow retry? Or just inform user?
      }
  };


  /* ---------- quiz availability check ---------------------------- */
  // Check currentCourse is not null before accessing allQuizData
  const currentQuiz = currentCourse !== null ? (allQuizData[currentCourse] || []) : [];

  useEffect(() => {
    // Ensure currentCourse is valid before checking quiz length
    if (quizOpen && currentCourse !== null && currentQuiz.length === 0) {
      alert(`Quiz not available for "${courses[currentCourse]?.title}" yet.`);
      setQuizOpen(false);
    }
  }, [quizOpen, currentQuiz, currentCourse]); // Add currentCourse dependency

  /* ---------- render helpers ------------------------------------- */
  const courseCard = (c: typeof courses[0]) => {
    const isUnlocked = unlocked.includes(c.id);
    // Find if this course's quiz has been completed and passed
    const completedQuizInfo = completedQuizzes.find(q => q.courseId === c.id && q.passed);
    const progress = completedQuizInfo ? 100 : 0; // Simple progress: 100 if passed, 0 otherwise

    return (
      <div
        key={c.id}
        style={{
          ...styles.card,
          ...(isUnlocked ? styles.cardEnabled : styles.cardDisabled),
        }}
        // Only allow opening if unlocked
        onClick={() => isUnlocked && openLesson(c.id)}
      >
        <img src={c.image} alt={c.title} style={styles.cardImg} />
        <div style={styles.cardContent}>
          <h4 style={styles.cardTitle}>{c.title}</h4>
          <p style={styles.cardDescription}>{c.description}</p>
          {/* Show progress bar only if unlocked */}
          {isUnlocked && progress > 0 && (
            <div style={styles.progressBarContainer}> {/* Added container */}
                <div style={styles.progressBar}>
                 <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <span style={styles.progressText}>{progress}% complete</span>
             </div>
          )}
        </div>
        {!isUnlocked && <div style={styles.lockIcon}>🔒</div>}
      </div>
    );
  };


  const lessonView = () => {
    // Ensure currentCourse is not null and find the course data
    if (currentCourse === null) return <p>Loading lesson...</p>; // Or some placeholder
    const course = courses.find(c => c.id === currentCourse);
    if (!course) return <p>Lesson not found.</p>; // Handle case where course isn't found

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
            courseId={currentCourse} // Pass the valid courseId
            onExplainRequest={handleExplain}
            onViewAnalogy={handleAnalogy}
          />
        </HighlightableInstructionsForReading>

        {/* Only show quiz button if quiz exists for this lesson */}
        {currentQuiz.length > 0 && (
            <button style={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
            Take Quiz
            </button>
        )}
         {currentQuiz.length === 0 && (
            <p style={styles.noQuizText}>Quiz coming soon for this lesson!</p>
        )}
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
        <h1 style={styles.logoText}>QuantAid</h1>
        <nav style={styles.nav}> {/* Use nav element */}
            <button
            style={{
                ...styles.navButton,
                ...(view === 'dashboard' ? styles.navButtonActive : {}),
            }}
            onClick={goDashboard}
            >
            Lessons
            </button>
            {/* Add other navigation buttons here if needed */}
        </nav>
      </aside>

      {/* MAIN PANEL */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>
            {/* Show loading text or current view title */}
            {isLoadingProgress ? 'Loading Progress...' : (view === 'lesson' && currentCourse !== null && courses[currentCourse]) ? courses[currentCourse].title : 'Lessons'}
          </h2>
          <div style={styles.headerIcons}>
            {/* Only show chat button when in a lesson? Or always? Assuming always for now */}
             <button
              style={styles.chatButton}
              onClick={() => setChatOpen((o) => !o)}
              aria-label="Toggle Chat"
            >
              <FaCommentDots size="1.5em" /> <span>Chat</span>
            </button>
            <button
              style={styles.profileBtn}
              onClick={() => navigate('/profile')} // Navigate to profile page
              aria-label="View Profile"
            >
             👤
            </button>
          </div>
        </header>

        <div style={styles.content}>
          {isLoadingProgress ? (
             <p style={styles.loadingText}>Loading your progress...</p> // Show loading indicator
          ) : view === 'dashboard' ? (
            <>
              <section style={styles.rowSection}>
                <h2 style={styles.rowTitle}>Foundations</h2>
                {/* Render cards only if courses data is available */}
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
            // Render lessonView only if not loading and view is 'lesson'
            lessonView()
          )}
        </div>
      </main>

      {/* QUIZ MODAL */}
      {/* Ensure quizOpen is true and currentCourse is valid before rendering Quiz */}
      {quizOpen && currentCourse !== null && currentQuiz.length > 0 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Quiz
              courseId={currentCourse}
              questions={currentQuiz}
              // Ensure goDashboard is stable or wrapped in useCallback if Quiz memoizes props
              onExit={() => { setQuizOpen(false); goDashboard(); }}
              onComplete={onQuizComplete} // Pass the async handler
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
// (Keep existing styles, adding a few for clarity/new elements)
const styles: Record<string, React.CSSProperties> = {
  // ... (previous styles)
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.accent} 100%)`,
    color: colors.light,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Example font
  },
  sidebar: {
    width: 250,
    background: colors.dark,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0', // Adjusted padding
    borderRight: `1px solid ${colors.border}`,
    flexShrink: 0, // Prevent sidebar from shrinking
  },
  logoText: {
    margin: 0,
    padding: '0 20px 20px 20px', // Padding around logo
    fontSize: '2rem',
    fontWeight: 'bold',
    color: colors.white,
    borderBottom: `1px solid ${colors.border}`, // Separator
  },
   nav: { // Style for the navigation container
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  navButton: {
    background: 'none',
    border: 'none',
    color: '#49527a', // Slightly darker than your primary (#566395)
    fontSize: '1.1rem',
    fontWeight: 'bold', // Make it bold
    padding: '12px 20px',
    textAlign: 'left',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    width: '100%',
  },
  
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    fontWeight: 'bold',
    borderLeft: `3px solid ${colors.primary}`,
    color: colors.white, // Ensure active text is bright
  },
   navButtonHover: { // Add hover effect (use :hover in real CSS or manage via state)
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    background: colors.dark, // Use dark background
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    color: colors.white, // Ensure header text is white
  },
  headerTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 600 },
  headerIcons: { display: 'flex', alignItems: 'center', gap: 15 }, // Increased gap
  chatButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8, // Adjusted gap
    padding: '8px 12px',
    background: colors.primary,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: colors.white,
    fontSize: '0.9rem', // Slightly smaller font
     transition: 'background-color 0.2s ease',
  },
   chatButtonHover: { // Example hover
       backgroundColor: '#4a568a', // Slightly darker primary
   },
  profileBtn: {
    background: 'none',
    border: 'none',
    color: colors.white,
    fontSize: '1.8rem', // Slightly larger icon
    cursor: 'pointer',
    padding: 0, // Remove padding
    lineHeight: 1, // Ensure icon aligns well
  },
  content: { padding: 30, flex: 1 }, // Increased padding
  rowSection: { marginBottom: 40 },
  rowTitle: { margin: '0 0 20px', fontSize: '1.5rem', color: colors.white, fontWeight: 600 }, // Bolder title
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 25 },
  card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 10, // Slightly more rounded
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Add transitions
       border: `1px solid ${colors.border}`, // Subtle border
    },
  cardEnabled: {
      cursor: 'pointer',
      // Add hover effect for enabled cards
      // Use pseudo-class :hover in CSS for transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  },
  cardDisabled: { cursor: 'not-allowed', opacity: 0.5 }, // More dimmed
  cardImg: { width: '100%', height: 160, objectFit: 'cover', display: 'block' }, // Ensure img is block
  cardContent: { padding: 20 }, // Increased padding
  cardTitle: { margin: '0 0 10px', fontSize: '1.25rem', color: colors.white, fontWeight: 600 }, // Bolder title
  cardDescription: { margin: '0 0 15px 0', fontSize: '0.95rem', color: colors.light, lineHeight: 1.5 }, // Added line height and bottom margin

  // --- Progress Bar Styles ---
  progressBarContainer: { // Container to manage layout
      marginTop: 15,
      position: 'relative', // Needed for absolute positioning of text
      height: 25, // Allocate space for bar and text
  },
  progressBar: {
     position: 'absolute', // Position bar within container
     bottom: 0, // Align to bottom
     left: 0,
     width: '100%', // Take full width
     height: 8, // Slightly thicker bar
     background: 'rgba(255,255,255,0.15)',
     borderRadius: 4,
     overflow: 'hidden', // Ensure fill stays within bounds
   },
  progressFill: {
      height: '100%',
      background: colors.primary, // Use primary color for fill
      borderRadius: 4,
      transition: 'width 0.5s ease-in-out', // Animate width changes
  },
  progressText: {
      position: 'absolute',
      top: 0, // Position text above the bar
      right: 0,
      fontSize: '0.75rem', // Smaller text
      color: colors.light,
      lineHeight: 1,
  },
  // --- End Progress Bar ---

  lockIcon: { position: 'absolute', top: 10, right: 10, fontSize: '1.4rem', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white },
  lessonContainer: { backgroundColor: colors.lessonBackground, borderRadius: 8, padding: '30px 40px', maxWidth: 900, margin: '20px auto', border: `1px solid ${colors.border}` },
  backButton: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: colors.primary, color: colors.white, border: 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 25, fontSize: '1rem', transition: 'background-color 0.2s ease' },
  // Add hover for backButton in real CSS: backgroundColor: '#4a568a'
  lessonTitle: { fontSize: '2.2rem', margin: '0 0 25px', color: colors.white, borderBottom: `2px solid ${colors.primary}`, paddingBottom: 15, fontWeight: 700 },
  lessonImage: { width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 25, border: `1px solid ${colors.border}` },
  lessonDescription: { fontSize: '1.1rem', marginBottom: 30, color: colors.light, lineHeight: 1.6 },
  takeQuizButton: { display: 'block', margin: '40px auto 10px', padding: '14px 35px', background: colors.primary, color: colors.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1.15rem', fontWeight: 600, transition: 'background-color 0.2s ease' },
  // Add hover for takeQuizButton in real CSS: backgroundColor: '#4a568a'
   noQuizText: { // Style for the "Quiz coming soon" message
       textAlign: 'center',
       marginTop: '40px',
       color: colors.primary, // Use primary color for emphasis
       fontSize: '1rem',
   },
   modalOverlay: {
    position: 'fixed',
    inset: 0,                       // shorthand for top:0; right:0; bottom:0; left:0
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  modalContent: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',    // the Quiz component now draws its own background
  },
};


export default Dashboard;