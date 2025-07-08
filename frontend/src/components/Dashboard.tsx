// src/components/Dashboard.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useCallback and useRef
import { FaSearch, FaLock, FaCheckCircle } from 'react-icons/fa';
import { MdOutlinePerson, MdKeyboardArrowUp, MdOutlineSettings, MdHelpOutline, MdOutlineThumbsUpDown } from "react-icons/md";
import { HiUserCircle } from "react-icons/hi2";
import { PiSignOutBold } from "react-icons/pi";
import { TfiBookmarkAlt } from "react-icons/tfi";
import Reading from './Reading';
import Quiz from './Quiz';
import GlobalChat from './GlobalChat';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';
import { allQuizData } from './QuizQuestion';
import { lessonContents } from './LessonContents';
import QuantaidLogo from '../assets/quantaid-logo.svg';
import lesson0Img from '../assets/lessonIcons/lesson-0.svg';
import lesson1Img from '../assets/lessonIcons/lesson-1.svg';
import lesson2Img from '../assets/lessonIcons/lesson-2.svg';
import { useNavigate } from 'react-router-dom';

// Define BACKEND_URL - Replace with your actual backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Use environment variable

/* ------------------------------------------------------------------ */
/* THEME COLORS                                                       */
/* ------------------------------------------------------------------ */
const colors = {
  dark: '#010117',
  accent: '#071746',
  primary: '#3B89FF',
  light: '#f8f9fa',
  white: '#FFFFFF',
  cardBackground: 'transparent',
  lessonBackground: 'rgba(255,255,255,0.03)',
  modalBackground: '#FFFFFF',
  modalTextColor: '#111111',
  border: 'rgba(255,255,255,0.1)',
};

/* ------------------------------------------------------------------ */
/* STATIC COURSE DATA                                                 */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* ENHANCED COURSE DATA STRUCTURE                                     */
/* ------------------------------------------------------------------ */

// Define topic structure
interface Topic {
  id: number; // This maps to the actual lesson ID in your existing system
  title: string;
  description?: string;
  implemented?: boolean; // Whether this lesson actually exists in LessonContents and QuizData
}

// Define concept structure
interface Concept {
  id: string;
  title: string;
  topics: Topic[];
  icon?: string; // Optional icon property
}

// Enhanced course structure
interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  concepts: Concept[];
}

// Ensure IDs match the backend logic (0-based indexing)
const courses: Course[] = [
  {
    id: 0,
    title: 'Introduction to Quantum Computing',
    description: 'Discover what quantum computing is and how it differs from classical computing.',
    image: lesson0Img,
    concepts: [
      {
        id: 'basics',
        title: 'Quantum Computing Fundamentals',
        topics: [
          { id: 0, title: 'Welcome to Quantum Computing', description: 'Discover what quantum computing is and how it differs from classical computing.' }, // implemented defaults to true
          { id: 50, title: 'Classical Computing Review', description: 'Review the fundamentals of classical computing before diving into quantum.', implemented: false },
          { id: 51, title: 'Quantum Advantage', description: 'Learn about quantum supremacy and where quantum computers excel.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 1,
    title: 'Basic Quantum Principles',
    description: 'Understand wave‑particle duality, superposition, entanglement, and more.',
    image: lesson1Img,
    concepts: [
      {
        id: 'core-concepts',
        title: 'Qubits, Superposition, and Entanglement',
        topics: [
          { id: 1, title: 'Basic Quantum Principles', description: 'Understand wave-particle duality, superposition, entanglement, and more.' }, // implemented defaults to true
          { id: 52, title: 'Qubits: A Quick Recap', description: 'Deep dive into the fundamental unit of quantum information.', implemented: false },
          { id: 53, title: 'Superposition in Detail', description: 'Explore how quantum states can exist in multiple configurations.', implemented: false }
        ]
      },
      {
        id: 'measurements',
        title: 'Quantum Measurements',
        topics: [
          { id: 54, title: 'Measurement Basics', description: 'Learn how quantum measurements collapse superposition states.', implemented: false },
          { id: 55, title: 'Measurement Effects', description: 'Understand the probabilistic nature of quantum measurements.', implemented: false },
          { id: 56, title: 'Practical Measurements', description: 'Explore real-world quantum measurement techniques.', implemented: false }
        ]
      },
      {
        id: 'applications',
        title: 'Real-world Applications',
        topics: [
          { id: 57, title: 'Quantum Sensing', description: 'Discover how quantum mechanics enables ultra-precise measurements.', implemented: false },
          { id: 58, title: 'Quantum Communication', description: 'Learn about quantum teleportation and secure communication.', implemented: false },
          { id: 59, title: 'Early Quantum Computers', description: 'Explore the first generation of quantum computing devices.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Quantum Gates and Circuits (Basics)',
    description: 'Explore how quantum gates form the building blocks of quantum circuits.',
    image: lesson2Img,
    concepts: [
      {
        id: 'single-gates',
        title: 'Single Qubit Gates',
        topics: [
          { id: 2, title: 'Quantum Gates and Circuits (Basics)', description: 'Explore how quantum gates form the building blocks of quantum circuits.' }, // implemented defaults to true
          { id: 60, title: 'Pauli Gates', description: 'Learn about the fundamental X, Y, and Z quantum gates.', implemented: false },
          { id: 61, title: 'Hadamard Gate', description: 'Understand the gate that creates quantum superposition.', implemented: false }
        ]
      },
      {
        id: 'multi-gates',
        title: 'Multi-Qubit Gates',
        topics: [
          { id: 62, title: 'CNOT Gate', description: 'Master the controlled-NOT gate for quantum entanglement.', implemented: false },
          { id: 63, title: 'Toffoli Gate', description: 'Explore reversible quantum computing with the Toffoli gate.', implemented: false },
          { id: 64, title: 'Controlled Operations', description: 'Learn how to build complex controlled quantum operations.', implemented: false }
        ]
      },
      {
        id: 'circuits',
        title: 'Building Circuits',
        topics: [
          { id: 65, title: 'Circuit Basics', description: 'Understand how to construct and read quantum circuits.', implemented: false },
          { id: 66, title: 'Circuit Analysis', description: 'Learn to analyze and optimize quantum circuit performance.', implemented: false },
          { id: 67, title: 'Simple Algorithms', description: 'Build your first quantum algorithms using basic gates.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Getting Hands‑On',
    description: 'Learn practical quantum computing with real‑world examples.',
    image: lesson0Img,
    concepts: [
      {
        id: 'practical',
        title: 'Practical Implementation',
        topics: [
          { id: 3, title: 'Getting Hands-on', description: 'Learn practical quantum computing with real-world examples.' }, // implemented defaults to true
          { id: 68, title: 'Qiskit Basics', description: 'Get started with IBM\'s quantum computing framework.', implemented: false },
          { id: 69, title: 'Running on Real Hardware', description: 'Execute quantum circuits on actual quantum computers.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Foundations for Quantum Computing',
    description: 'Dive deeper into the essential math and physics behind quantum computing.',
    image: lesson1Img,
    concepts: [
      {
        id: 'foundations',
        title: 'Mathematical Foundations',
        topics: [
          { id: 4, title: 'Foundations for Quantum Computing', description: 'Dive deeper into the essential math and physics behind quantum computing.' }, // implemented defaults to true
          { id: 70, title: 'Linear Algebra Review', description: 'Master the mathematical tools needed for quantum mechanics.', implemented: false },
          { id: 71, title: 'Complex Numbers', description: 'Understand complex numbers and their role in quantum states.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Quantum Cryptography & Security',
    description: 'Learn how quantum computing impacts cryptography, encryption and security protocols.',
    image: lesson2Img,
    concepts: [
      {
        id: 'cryptography',
        title: 'Quantum Security',
        topics: [
          { id: 5, title: 'Quantum Cryptography & Security', description: 'Learn how quantum computing impacts cryptography, encryption and security protocols.' }, // implemented defaults to true
          { id: 72, title: 'BB84 Protocol', description: 'Discover the first quantum key distribution protocol.', implemented: false },
          { id: 73, title: 'Post-Quantum Cryptography', description: 'Explore encryption methods that resist quantum attacks.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 6,
    title: 'Adiabatic Quantum Computing',
    description: 'Explore the adiabatic model and quantum annealing techniques.',
    image: lesson0Img,
    concepts: [
      {
        id: 'adiabatic',
        title: 'Adiabatic Computing',
        topics: [
          { id: 6, title: 'Adiabatic Quantum Computing', description: 'Explore the adiabatic model and quantum annealing techniques.' }, // implemented defaults to true
          { id: 74, title: 'D-Wave Systems', description: 'Learn about commercial quantum annealing systems.', implemented: false },
          { id: 75, title: 'Optimization Problems', description: 'Apply quantum annealing to solve complex optimization challenges.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 7,
    title: 'Quantum Signal Processing & Simulation',
    description: 'Understand how quantum systems simulate complex physical processes.',
    image: lesson1Img,
    concepts: [
      {
        id: 'signal-processing',
        title: 'Signal Processing & Simulation',
        topics: [
          { id: 7, title: 'Quantum Signal Processing & Simulation', description: 'Understand how quantum systems simulate complex physical processes.' }, // implemented defaults to true
          { id: 76, title: 'Phase Estimation', description: 'Master the quantum phase estimation algorithm.', implemented: false },
          { id: 77, title: 'Quantum Fourier Transform', description: 'Learn the quantum version of the discrete Fourier transform.', implemented: false }
        ]
      }
    ]
  },
  {
    id: 8,
    title: 'Quantum Hardware & Future Trends',
    description: 'Discover the cutting‑edge hardware behind quantum computers.',
    image: lesson2Img,
    concepts: [
      {
        id: 'hardware',
        title: 'Hardware & Future',
        topics: [
          { id: 8, title: 'Quantum Hardware & Future Trends', description: 'Discover the cutting-edge hardware behind quantum computers.' }, // implemented defaults to true
          { id: 78, title: 'Superconducting Qubits', description: 'Explore superconducting quantum computing architectures.', implemented: false },
          { id: 79, title: 'Trapped Ion Systems', description: 'Learn about trapped ion quantum computing platforms.', implemented: false }
        ]
      }
    ]
  },
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
  const [view, setView] = useState<'dashboard' | 'course-detail' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number | null>(null); // Allow null initially
  const [currentLesson, setCurrentLesson] = useState<number | null>(null); // For actual lesson content
  // Initialize unlocked as empty, will be populated by fetch
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true); // Loading state
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]); // Store completed quiz details

  /* ---------- search state --------------------------------------- */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* ---------- chat & highlight state ------------------------------ */
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [highlightMode, setHighlightMode] = useState<'explain' | 'analogy' | null>(null);

  /* ---------- profile dropdown state ------------------------------ */
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- navigation helpers --------------------------------- */
  const navigate = useNavigate();

  const goDashboard = useCallback(() => { // Wrap in useCallback if passed as prop or dependency
    setView('dashboard');
    setCurrentCourse(null); // Clear current course when going to dashboard
    setCurrentLesson(null);
    setChatOpen(false); // Close chat when navigating away
  }, []); // No dependencies needed here

  const goToCourseDetail = useCallback((courseId: number) => {
    setCurrentCourse(courseId);
    setCurrentLesson(null);
    setView('course-detail');
    setChatOpen(false);
  }, []);

  const goBackFromCourseDetail = useCallback(() => {
    setView('dashboard');
    setCurrentCourse(null);
    setCurrentLesson(null);
  }, []);

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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Calculate course progress based on completed topics
  const getCourseProgress = useCallback((courseId: number): number => {
    const course = courses.find(c => c.id === courseId);
    if (!course || course.concepts.length === 0) return 0;

    // Only count implemented topics in the total
    const implementedTopics = course.concepts.reduce((sum, concept) => {
      return sum + concept.topics.filter(topic => topic.implemented ?? true).length;
    }, 0);
    
    if (implementedTopics === 0) return 0;

    // Only count completed topics that are also implemented
    const completedImplementedTopics = course.concepts.reduce((sum, concept) => {
      return sum + concept.topics.filter(topic => {
        const isImplemented = topic.implemented ?? true;
        const isCompleted = completedQuizzes.some(quiz => quiz.courseId === topic.id && quiz.passed);
        return isImplemented && isCompleted;
      }).length;
    }, 0);

    return Math.round((completedImplementedTopics / implementedTopics) * 100);
  }, [completedQuizzes]);

  // Check if a course is unlocked
  const isCourseUnlocked = useCallback((courseId: number): boolean => {
    if (courseId === 0) return true; // First course is always unlocked
    
    // Check if previous course is completed
    const previousCourse = courses.find(c => c.id === courseId - 1);
    if (!previousCourse) return false;
    
    const previousProgress = getCourseProgress(courseId - 1);
    return previousProgress === 100;
  }, [getCourseProgress]);

  // Check if a topic/lesson is unlocked
  const isTopicUnlocked = useCallback((topicId: number): boolean => {
    // First check if the topic is implemented (defaults to true)
    let topicImplemented = true; // Default to true
    for (const course of courses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === topicId);
        if (topic) {
          topicImplemented = topic.implemented ?? true; // Use nullish coalescing to default to true
          break;
        }
      }
      if (topicImplemented !== true) break;
    }

    // If not implemented, it's locked (note: this is currently the only locked state)
    if (!topicImplemented) return false;

    // If implemented, check if the course is unlocked
    // Find which course this topic belongs to
    for (const course of courses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === topicId);
        if (topic) {
          return isCourseUnlocked(course.id);
        }
      }
    }

    return false;
  }, [courses, isCourseUnlocked]);

  const openLesson = (topicId: number) => {
    if (isLoadingProgress) {
        console.log("Still loading progress, cannot open lesson yet.");
        return;
    }
    if (!isTopicUnlocked(topicId)) {
      alert('This lesson is locked. Complete the previous lessons first.');
      return;
    }
    
    setCurrentLesson(topicId);
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

  /* ---------- search functionality ------------------------------- */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add search functionality here
    console.log('Searching for:', searchQuery);
    // You can implement search logic here
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /* ---------- profile dropdown handlers -------------------------- */
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  };

  const handleHelpClick = () => {
    setShowProfileDropdown(false);
    // TODO: Implement help functionality
    console.log('Help clicked');
  };

  const handleSignOutClick = () => {
    setShowProfileDropdown(false);
    // TODO: Implement sign out functionality
    console.log('Sign out clicked');
  };

  const handleLeaveFeedbackClick = () => {
    // TODO: Implement feedback functionality
    console.log('Leave feedback clicked');
  };

  /* ---------- breadcrumb helpers --------------------------------- */
  const getCurrentTabName = () => {
    // Determine the current tab based on the active navigation state
    // This can be extended when more tabs are added to the dashboard
    
    // For now, since we're in the lessons section, check if we're in lesson-related views
    if (view === 'course-detail' || view === 'lesson' || view === 'dashboard') {
      return "Lessons";
    }
    
    // Future tabs can be added here:
    // if (view === 'practice' || ...) return "Practice";
    // if (view === 'projects' || ...) return "Projects";
    
    // Default fallback
    return "Lessons";
  };

  const renderBreadcrumb = () => {
    if (view === 'dashboard') return null;

    const breadcrumbItems = [];
    
    // Get the current tab name dynamically
    const rootTabName = getCurrentTabName();
    
    // Always add the root tab as the first item (shows on course detail and lesson views)
    breadcrumbItems.push(
      <button
        key="root"
        style={styles.breadcrumbButton}
        onClick={goDashboard}
        className="breadcrumb-button"
      >
        {rootTabName}
      </button>
    );

    // Add separator after root tab
    breadcrumbItems.push(
      <span key="separator1" style={styles.breadcrumbSeparator}> &gt; </span>
    );

    // Only add course name if we're in lesson view (not on course detail view)
    if (view === 'lesson' && currentCourse !== null) {
      const course = courses.find(c => c.id === currentCourse);
      if (course) {
        breadcrumbItems.push(
          <button
            key="course"
            style={styles.breadcrumbButton}
            onClick={() => goToCourseDetail(currentCourse)}
            className="breadcrumb-button"
          >
            {course.title}
          </button>
        );
        
        // Add separator after course name
        breadcrumbItems.push(
          <span key="separator2" style={styles.breadcrumbSeparator}> &gt; </span>
        );
      }
    }

    return (
      <div style={styles.breadcrumbContainer}>
        {breadcrumbItems}
      </div>
    );
  };

  /* ---------- quiz completion ------------------------------------ */
  const onQuizComplete = async (score: number, passed: boolean) => {
      if (currentLesson === null) return; // Should not happen if quiz is open, but safety check

      setQuizOpen(false); // Close the quiz modal immediately

      // Progress is saved in ./Quiz so we just handle navigation and feedback
      try {
          // Optionally re-fetch progress to update UI with latest state from backend
          await fetchUserProgress();

          // Show feedback to user
          if (!passed) {
            alert('You need 70% or higher to pass. Keep learning and try again!');
            // Stay in the current lesson
          } else {
            alert('Great job! Lesson completed.');
            // Go back to course detail view to show updated progress
            if (currentCourse !== null) {
              goToCourseDetail(currentCourse);
            } else {
              goDashboard();
            }
            // const nextLevelId = currentCourse + 1;
            // if (unlocked.includes(nextLevelId) || nextLevelId === currentCourse + 1) {
            //     if (nextLevelId < courses.length) {
            //         alert(`Great job! Lesson ${courses[nextLevelId].title} unlocked.`);
            //         // Automatically open the next lesson
            //         // openLesson(nextLevelId);
            //     } else {
            //         alert("Congratulations! You've completed all available courses!");
            //         // goDashboard(); // Go back to dashboard if all courses are done
            //     }
            // } else {
            //      // This case might happen if they re-take a quiz they already passed
            //      alert(`Great job completing the quiz for ${courses[currentCourse].title}!`);
            //     //  goDashboard(); // Go to dashboard
            // }
            // goDashboard();
          }

      } catch (error) {
          console.error('Failed to save quiz result:', error);
          alert(`An error occurred while saving your quiz progress: ${error instanceof Error ? error.message : String(error)}. Please try again.`);
          // Decide how to handle failed save: Maybe allow retry? Or just inform user?
          goDashboard();
      }
  };


  /* ---------- quiz availability check ---------------------------- */
  // Check currentCourse is not null before accessing allQuizData
  const currentQuiz = currentLesson !== null ? (allQuizData[currentLesson] || []) : [];
  const currentLessonContent = currentLesson !== null ? lessonContents[currentLesson] : undefined;

  useEffect(() => {
    if (quizOpen && currentLesson !== null && currentQuiz.length === 0) {
      alert(`Quiz not available for this lesson yet.`);
      setQuizOpen(false);
    }
  }, [quizOpen, currentQuiz, currentLesson]);

  /* ---------- render helpers ------------------------------------- */
  const courseCard = (c: Course) => {
    const isUnlocked = isCourseUnlocked(c.id);
    const progress = getCourseProgress(c.id);

    return (
      <div
        key={c.id}
        style={{
          ...styles.card,
          ...(isUnlocked ? styles.cardEnabled : styles.cardDisabled),
        }}
        onClick={() => isUnlocked && goToCourseDetail(c.id)}
      >
        <img src={c.image} alt={c.title} style={styles.cardImg} />
        <div style={styles.cardContent}>
          <h4 style={styles.cardTitle}>{c.title}</h4>
          <p style={styles.cardDescription}>{c.description}</p>
          {isUnlocked && progress > 0 && (
            <div style={styles.progressBarContainer}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <span style={styles.progressText}>{progress}% complete</span>
              </div>
          )}
        </div>
        {!isUnlocked &&
          (<div style={styles.lockOverlay}>
            <div style={styles.lockIcon}>
              <FaLock />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Course detail view (intermediate page)
  const courseDetailView = () => {
    if (currentCourse === null) return <p>Loading course...</p>;
    const course = courses.find(c => c.id === currentCourse);
    if (!course) return <p>Course not found.</p>;

    return (
      <div style={styles.courseDetailContainer}>
        {renderBreadcrumb()}

        <div style={styles.courseDetailHeader}>
          <h1 style={styles.courseDetailTitle}>{course.title}</h1>
          <p style={styles.courseDetailDescription}>{course.description}</p>
        </div>

        <div style={styles.conceptsContainer}>
          {course.concepts.map((concept, conceptIndex) => (
            <div key={concept.id}>
              <div style={styles.conceptHeader}>
                <div style={styles.conceptIcon}>
                  {concept.icon ? (
                    <img src={concept.icon} alt={concept.title} style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <span style={styles.conceptNumber}>{conceptIndex + 1}</span>
                  )}
                </div>
                <h3 style={styles.conceptTitle}>{concept.title}</h3>
              </div>
              
              <div style={styles.topicsList}>
                {concept.topics.map((topic) => {
                  const isTopicCompleted = completedQuizzes.some(quiz => quiz.courseId === topic.id && quiz.passed);
                  const isUnlocked = isTopicUnlocked(topic.id);
                  
                  return (
                    <button
                      className='topic-button'
                      key={topic.id}
                      style={{
                        ...styles.topicButton,
                        ...(!isUnlocked ? styles.topicButtonDisabled : {}),
                      }}
                      onClick={() => isUnlocked && openLesson(topic.id)}
                      disabled={!isUnlocked}
                    >
                      <span style={styles.topicTitle}>{topic.title}</span>
                      {isTopicCompleted && (
                        <FaCheckCircle size={24} style={styles.topicCheckmark} />
                      )}
                      {!isUnlocked && (
                        <FaLock size={24} style={styles.topicLock} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

   const lessonView = () => {
  if (currentLesson === null) return <p>Loading lesson...</p>;
  
  // Find the course and topic info for context
  let courseInfo = null;
  let topicInfo = null;
  
  for (const course of courses) {
    for (const concept of course.concepts) {
      const topic = concept.topics.find(t => t.id === currentLesson);
      if (topic) {
        courseInfo = course;
        topicInfo = topic;
        break;
      }
    }
    if (topicInfo) break;
  }

  return (
    <div style={styles.lessonContainer}>
      {renderBreadcrumb()}

      <h2 style={styles.lessonTitle}>{topicInfo?.title || 'Lesson'}</h2>
      {topicInfo?.description && (
        <p style={styles.lessonDescription}>{topicInfo.description}</p>
      )}

      {currentQuiz.length > 0 && (
          <button style={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
          TAKE QUIZ
          </button>
      )}
       {currentQuiz.length === 0 && (
          <p style={styles.noQuizText}>Quiz coming soon for this lesson!</p>
      )}

      <HighlightableInstructionsForReading
        onExplain={handleExplain}
        onViewAnalogy={handleAnalogy}
      >
        <Reading
          courseId={currentLesson}
          onExplainRequest={handleExplain}
          onViewAnalogy={handleAnalogy}
        />
      </HighlightableInstructionsForReading>
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
        <div>
          <div style={styles.logoStyle} aria-label="Quantaid Logo"></div>
          <nav style={styles.nav}>
              {/* Lessons Navigation Button */}
              <button
              style={{
                  ...styles.navButton,
                  ...(view === 'dashboard' || view === 'course-detail' || view === 'lesson' ? styles.navButtonActive : {}),
              }}
              onClick={goDashboard}
              className={`nav-button ${view === 'dashboard' || view === 'course-detail' || view === 'lesson' ? 'nav-button-active' : ''}`}
              >
              <TfiBookmarkAlt size={21} color={view === 'dashboard' || view === 'course-detail' || view === 'lesson' ? colors.white : '#9D9D9D'} />
              <span>Lessons</span>
              </button>
              
              {/* Example Navigation Button (always inactive for demonstration) */}
              {/* <button
              style={styles.navButton}
              onClick={() => console.log('Example clicked')}
              className="nav-button"
              >
              <TfiBookmarkAlt size={21} color="#9D9D9D" />
              <span>Example</span>
              </button> */}
          </nav>
        </div>
        
        {/* Profile and Feedback buttons at bottom of sidebar */}
        <div style={styles.sidebarBottom}>
          {/* Profile Button */}
          <button
            ref={profileButtonRef}
            onClick={toggleProfileDropdown}
            style={{
              ...styles.profileButton,
              backgroundColor: showProfileDropdown ? '#032242' : 'transparent',
            }}
            className="profile-button"
          >
            <HiUserCircle size={21} color="#9D9D9D" />
            <span style={styles.profileButtonText}>Profile name</span>
            <MdKeyboardArrowUp 
              size={20} 
              color="#9D9D9D" 
              style={{
                transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>
          
          {/* Leave Feedback Button */}
          <button
            onClick={handleLeaveFeedbackClick}
            style={styles.sidebarFeedbackButton}
            className="feedback-button"
          >
            <MdOutlineThumbsUpDown size={18} color="#9D9D9D" />
            <span style={styles.sidebarFeedbackText}>Leave feedback</span>
          </button>
        </div>

        {/* Profile Dropdown */}
        {showProfileDropdown && (
          <div
            ref={profileDropdownRef}
            style={styles.profileDropdown}
          >
            {/* Email section */}
            <button 
              onClick={handleProfileClick}
              style={styles.profileDropdownItem}
              className="profile-dropdown-item"
            >
              <HiUserCircle size={21} color="#9D9D9D" />
              <span style={styles.emailText}>email@gmail.com</span>
            </button>
            
            {/* Divider */}
            <div style={styles.profileDropdownDivider} />
            
            {/* Menu items */}
            
            <button 
              onClick={handleSettingsClick}
              style={styles.profileDropdownItem}
              className="profile-dropdown-item"
            >
              <MdOutlineSettings size={21} color="#9D9D9D" />
              <span style={styles.profileDropdownItemText}>Settings</span>
            </button>
            
            <button 
              onClick={handleHelpClick}
              style={styles.profileDropdownItem}
              className="profile-dropdown-item"
            >
              <MdHelpOutline size={21} color="#9D9D9D" />
              <span style={styles.profileDropdownItemText}>Help</span>
            </button>
            
            <button 
              onClick={handleSignOutClick}
              style={styles.profileDropdownItem}
              className="profile-dropdown-item"
            >
              <PiSignOutBold size={21} color="#9D9D9D" />
              <span style={styles.profileDropdownItemText}>Sign out</span>
            </button>
          </div>
        )}
      </aside>

      {/* MAIN PANEL */}
      <main style={styles.main}>
        <header style={styles.header}>
          <form onSubmit={handleSearchSubmit} style={styles.headerSearch}>
            <div style={styles.searchContainer} className="search-container">
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search Quantaid"
                value={searchQuery}
                onChange={handleSearchChange}
                style={styles.searchInput}
                className="search-input"
              />
            </div>
          </form>
          <div style={styles.headerIcons}>
            {/* Only show chat button when in a lesson? Or always? Assuming always for now */}
             <button
              style={styles.chatButton}
              onClick={() => setChatOpen((o) => !o)}
              aria-label="Toggle Chat"
            >
              <MdOutlinePerson size="1.5em" /> <span>Chat</span>
            </button>
          </div>
        </header>

        <div style={styles.content} className="dashboard-content">
          {isLoadingProgress ? (
             <p style={styles.loadingText}>Loading your progress...</p> // Show loading indicator
          ) : view === 'dashboard' ? (
            <>
              <h2 style={styles.title}>Lessons</h2>
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
          ) : view === 'course-detail' ? (
            courseDetailView()
          ) : (
            // Render lessonView only if not loading and view is 'lesson'
            lessonView()
          )}
        </div>
      </main>

      {/* QUIZ MODAL */}
      {/* Ensure quizOpen is true and currentCourse is valid before rendering Quiz */}
      {quizOpen && currentLesson !== null && currentQuiz.length > 0 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Quiz
              courseId={currentLesson}
              questions={currentQuiz}
              lessonContent={currentLessonContent as any}
              // Ensure goDashboard is stable or wrapped in useCallback if Quiz memoizes props
              // onExit={() => { setQuizOpen(false); goDashboard(); }}
              onExit={() => { setQuizOpen(false) }} //NOTE: keep to lesson page now
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
// Updated styles for fixed header/sidebar with scrollable content
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh', // Changed from minHeight to height for fixed layout
    background: '#030E29',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: 'hidden', // Prevent body scrolling
  },
  sidebar: {
    width: 250,
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    borderRight: `1px solid ${colors.border}`,
    flexShrink: 0,
    position: 'fixed', // Make sidebar fixed
    height: '100vh', // Full viewport height
    zIndex: 100, // Ensure it stays above content
    justifyContent: 'space-between', // Distribute space between logo/nav and bottom section
  },
  logoStyle: {
    position: 'relative',
    height: '38px',
    width: '140px', // Restore original logo width
    minHeight: '38px',
    minWidth: '140px',
    margin: '0 20px', // Keep consistent margins with buttons
    marginLeft: '3rem', //TODO: find better solution
    padding: '12px 0', // Only vertical padding, no horizontal padding
    backgroundImage: `url(${QuantaidLogo})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  nav: {
    marginTop: 40, // Add top margin so "Lessons" isn't too close to logo
    display: 'flex',
    flexDirection: 'column',
    flex: 1, // Take up all available space between logo and bottom section
    paddingBottom: 20, // Add some bottom padding so nav doesn't touch profile section
    padding: '0 20px', // Add horizontal padding to match other buttons
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    background: '#030E29',
    borderLeft: 'none',
    border: 'none',
    color: '#9D9D9D',
    fontSize: '18px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    padding: '12px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    width: '100%',
    marginBottom: '4px',
  },
  navButtonActive: {
    backgroundColor: '#032242',
    color: colors.white,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 250, // Account for fixed sidebar width
    height: '100vh', // Full viewport height
    overflow: 'hidden', // Prevent main from scrolling
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 4rem',
    background: 'transparent',
    borderBottom: `1px solid ${colors.border}`,
    position: 'fixed', // Make header fixed
    top: 0,
    left: 250, // Account for sidebar width
    right: 0, // Extend to right edge
    zIndex: 99, // Below sidebar but above content
    color: colors.white,
    backgroundColor: '#030E29', // Match container background
  },
  headerSearch: {
    display: 'flex',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.3rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    color: '#7A7C92',
    backgroundColor: '#032242',
    borderRadius: '8px',
    padding: '8px 12px',
    minWidth: '300px',
    border: 'transparent',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  searchIcon: {
    color: '#7A7C92',
    fontSize: '14px',
    marginRight: '8px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: colors.white,
    fontSize: '14px',
    flex: 1,
  },
  headerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: 15
  },
  chatButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '6px 14px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    backgroundColor: '#032242',
    border: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: 'auto',
  },
  content: {
    padding: '2rem 4rem',
    flex: 1,
    overflowY: 'auto', // Enable vertical scrolling for content only
    overflowX: 'hidden', // Prevent horizontal scrolling
    marginTop: 60, // Account for fixed header height
    height: 'calc(100vh - 80px)', // Subtract header height from viewport
  },
  loadingText: {
    color: colors.white,
    fontSize: '1.2rem',
    textAlign: 'center',
    marginTop: '2rem',
  },
  breadcrumbContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 25,
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
  },
  breadcrumbButton: {
    background: 'none',
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    padding: '0 0',
    textDecoration: 'none',
    transition: 'text-decoration 0.2s ease',
  },
  breadcrumbSeparator: {
    color: colors.white,
    margin: '0 12px',
    fontSize: '0.9rem',
  },
  breadcrumbCurrent: {
    color: colors.white,
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
  },
  rowSection: {
    marginBottom: 40
  },
  title: {
    margin: '0 0 20px',
    fontSize: '2rem',
    color: colors.white,
    fontWeight: 600
  },
  rowTitle: {
    margin: '0 0 20px',
    fontSize: '1.3rem',
    color: colors.white,
    fontWeight: 600
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
    gap: 25
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    border: `1px solid ${colors.border}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardEnabled: {
      cursor: 'pointer',
  },
  cardDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5
  },
  cardImg: {
    width: 'calc(100% - 24px)',
    height: 144,
    minHeight: 144,
    objectFit: 'contain',
    margin: '12px 12px',
    borderRadius: '8px',
    display: 'block'
  },
  cardContent: {
    padding: 20,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 120,
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '1.25rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    color: colors.white,
  },
  cardDescription: {
    margin: '0 0 15px 0',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '400',
    color: '#A2A2B1',
    lineHeight: 1.5
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 5,
    left: 20,
    right: 20,
    height: 25,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressBar: {
    position: 'relative',
    flex: 1,
    height: 8,
    width: '65%',
    background: '#424E62',
    borderRadius: 4,
    overflow: 'hidden',
   },
  progressFill: {
    height: '100%',
    background: colors.primary,
    borderRadius: 4,
    transition: 'width 0.5s ease-in-out',
  },
  progressText: {
    fontSize: '0.75rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '400',
    color: colors.white,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '15px',
  },
  lockIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A7C92',
    fontSize: '1.2rem',
    backgroundColor: 'transparent',
  },
  courseDetailContainer: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '20px 0',
  },
  courseDetailHeader: {
    textAlign: 'left', // Changed from center to left
    marginBottom: 60,

  },
  courseDetailTitle: {
    fontSize: '36',
    color: colors.white,
    fontWeight: 500,
    marginBottom: 15,
    fontFamily: "'Inter', sans-serif",
    cursor: 'text',
  },
  courseDetailDescription: {
    fontSize: '16',
    color: '#F5F5FB',
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    cursor: 'text',
  },
  conceptsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  },
  conceptHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 25,
  },
  conceptIcon: {
    width: 35,
    height: 35,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 10,
  },
  conceptNumber: {
    color: '#030E29',
    fontSize: '24',
    fontWeight: 'bold',
    fontFamily: "'Inter', sans-serif",
  },
  conceptTitle: {
    flex: 1,
    fontSize: '24',
    color: colors.white,
    fontWeight: 500,
    marginBottom: 8,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1,
    cursor: 'text',
  },
  topicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  topicButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    marginBottom: 10,
  },
  topicButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  topicTitle: {
    fontSize: '1rem',
    color: colors.white,
    fontWeight: 400,
    textAlign: 'left',
    flex: 1,
  },
  topicCheckmark: {
    color: colors.primary,
    fontSize: '1rem',
  },
  topicLock: {
    color: '#7A7C92',
    fontSize: '1rem',
  },
  lessonContainer: { 
    maxWidth: 1000,
    margin: '0 auto',
    padding: '20px 0',
  },
  lessonTitle: { 
    fontSize: '36px',
    margin: '0 auto', 
    color: colors.white, 
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    cursor: 'text',
  },
  lessonDescription: { 
    fontSize: '18px',
    color: colors.white, 
    lineHeight: 1.6,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    cursor: 'text',
  },
  takeQuizButton: { 
    display: 'block', 
    margin: '25px 0 70px 0', 
    padding: '8px 12px', 
    background: '#8CBAFF', 
    color: '#030E29', 
    border: 'none', 
    borderRadius: 8, 
    cursor: 'pointer', 
    fontSize: '1.15rem', 
    fontWeight: 600,
    lineHeight: 1.6,
    fontFamily: "'Inter', sans-serif",
    transition: 'background-color 0.2s ease' 
  },
  noQuizText: {
    textAlign: 'center',
    marginTop: '40px',
    color: colors.primary,
    fontSize: '1rem',
   },
   modalOverlay: {
    position: 'fixed',
    inset: 0,
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
    background: 'transparent',
  },
  sidebarBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0 20px 20px 20px',
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '8px 10px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    backgroundColor: 'transparent',
  },
  profileButtonText: {
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    flex: 1,
    textAlign: 'left',
  },
  sidebarFeedbackButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    backgroundColor: 'transparent',
    border: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  sidebarFeedbackText: {
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    lineHeight: 1,
  },
  profileDropdown: {
    position: 'absolute',
    bottom: '135px', // Position above the profile button
    left: '20px',
    right: '20px',
    backgroundColor: '#032242',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    padding: '8px 4px',
    zIndex: 1000,
  },
  emailText: {
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
  },
  profileDropdownDivider: {
    height: '1px',
    backgroundColor: colors.border,
    margin: '6px 6px',
    padding: '0 2px',
  },
  profileDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 6px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
    marginBottom: '4px',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
  },
  profileDropdownItemText: {
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
  },
};

// Add all styles and hover effects
const addAllStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Search Input Styles */
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 400;
      font-size: 14px;
    }
    
    .search-input:focus::placeholder {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .search-container:focus-within {
      border-color: rgba(255, 255, 255, 0.4);
      background-color: rgba(255, 255, 255, 0.15);
    }

    /* Custom Scrollbar Styles */
    .dashboard-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .dashboard-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    
    .dashboard-content::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #3B89FF 0%, #2563eb 100%);
      border-radius: 4px;
      transition: background 0.3s ease;
    }
    
    .dashboard-content::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #4f96ff 0%, #3b82f6 100%);
    }
    
    .dashboard-content::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
    }

    /* Firefox Scrollbar Support */
    .dashboard-content {
      scrollbar-width: thin;
      scrollbar-color: #3B89FF rgba(255, 255, 255, 0.05);
      scroll-behavior: smooth;
    }

    /* Nav button hover effects */
    .nav-button:hover {
      background-color: #032242 !important;
    }

    /* Force active nav button styles with high specificity */
    .nav-button.nav-button-active {
      background-color: #032242 !important;
      color: #FFFFFF !important;
    }

    /* Keep active state on hover */
    .nav-button.nav-button-active:hover {
      background-color: #032242 !important;
      color: #FFFFFF !important;
    }

    /* Breadcrumb button hover effects */
    .breadcrumb-button:hover {
      text-decoration: underline !important;
    }

    /* Profile dropdown item hover effects */
    .profile-dropdown-item:hover {
      background-color: #0B2F54 !important;
    }

    /* Sidebar feedback button hover effects */
    .sidebar-feedback-button:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }

    /* Sidebar lower buttons hover effects */
    .profile-button:hover {
      background-color: #032242 !important;
    }

    .feedback-button:hover:not(:disabled) {
      opacity: 0.9 !important;
      transition: opacity 0.2s ease;
    }

    /* Topic button hover effects */
    .topic-button:hover:not(:disabled) {
      background-color: #212E44 !important;
      border: 2px solid rgba(255,255,255,0.1) !important; /* Force border to stay the same on focus */
      outline: none !important; /* Remove browser default outline */
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addAllStyles();
}

export default Dashboard;