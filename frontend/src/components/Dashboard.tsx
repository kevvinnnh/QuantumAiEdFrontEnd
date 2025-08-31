// src/components/Dashboard.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaLock, FaCheckCircle } from 'react-icons/fa';
import { MdOutlinePerson } from "react-icons/md";
import Sidebar from './Sidebar';
import Reading from './Reading';
import Quiz from './Quiz';
import GlobalChat from './GlobalChat';
import FeedbackModal from './FeedbackModal';
import HighlightableInstructionsForReading from './HighlightableInstructionsForReadings';
import { allQuizData } from './QuizQuestion';
import { lessonContents } from './LessonContents';
import lesson0Img from '../assets/lessonIcons/lesson-0.svg';
import lesson1Img from '../assets/lessonIcons/lesson-1.svg';
import lesson2Img from '../assets/lessonIcons/lesson-2.svg';
import { useNavigate } from 'react-router-dom';
import TutorialPopup from './TutorialPopup';

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
  /* ---------- dev state ----------------------------------------- */
  const DEV_LOGIN_EMAIL = import.meta.env.DEV_LOGIN_EMAIL;
  const [userEmail, setUserEmail] = useState<string | null>(null);

  /* ---------- animation state ------------------------------------ */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const collapsibleSidebarWidth = 1500;
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------- view / lesson state -------------------------------- */
  const [view, setView] = useState<'dashboard' | 'course-detail' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<number | null>(null);
  const [, setUnlocked] = useState<number[]>([]);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]);

  /* ---------- first lesson tutorial state ------------------------ */
  const [hasViewedFirstLesson, setHasViewedFirstLesson] = useState<boolean>(false);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 3>(1);
  const [, setTutorialAnchor] = useState<{ top: number; left: number } | null>(null);
  const lessonContentsRef = useRef<HTMLDivElement>(null);

  /* ---------- feedback state ------------------------------------- */
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  /* ---------- search state --------------------------------------- */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* ---------- chat & highlight state and callback ---------------- */
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatWidth, setChatWidth] = useState<number>(0);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [highlightMode, setHighlightMode] = useState<'explain' | 'analogy' | null>(null);

  /* ---------- profile dropdown state ------------------------------ */
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  /* ---------- navigation helpers --------------------------------- */
  const navigate = useNavigate();

  /* ---------- scrolling content ref --------------------------------- */
  const contentRef = useRef<HTMLDivElement>(null);

  const goDashboard = useCallback(() => {
    setView('dashboard');
    setCurrentCourse(null);
    setCurrentLesson(null);
    setChatOpen(false);
  }, []);

  const goToCourseDetail = useCallback((courseId: number) => {
    setCurrentCourse(courseId);
    setCurrentLesson(null);
    setView('course-detail');
    setChatOpen(false);
  }, []);

  // const goBackFromCourseDetail = useCallback(() => {
  //   setView('dashboard');
  //   setCurrentCourse(null);
  //   setCurrentLesson(null);
  // }, []);

  // Animation constants
  const ANIMATION_DURATION = 300;
  const ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

  // Track screen size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate sidebar dimensions
  const SIDEBAR_EXPANDED_WIDTH = 250;
  const SIDEBAR_COLLAPSED_WIDTH = 70;
  const currentSidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Auto-collapse logic
  useEffect(() => {
    const shouldCollapse = screenWidth < collapsibleSidebarWidth && chatOpen && chatWidth > 0;
    
    if (shouldCollapse !== sidebarCollapsed) {
      handleSidebarToggle();
    }
  }, [screenWidth, chatOpen, chatWidth, sidebarCollapsed]);

  // Coordinated sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSidebarCollapsed(prev => !prev);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  }, [isAnimating, ANIMATION_DURATION]);

  // Cleanup animation timeout
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleCollapsedProfileClick = useCallback(() => {
    if (chatOpen) {
      setChatOpen(false);
      
      setTimeout(() => {
        setShowProfileDropdown(true);
      }, ANIMATION_DURATION + 50);
    } else {
      if (sidebarCollapsed) {
        handleSidebarToggle();
        setTimeout(() => {
          setShowProfileDropdown(true);
        }, ANIMATION_DURATION);
      } else {
        setShowProfileDropdown(!showProfileDropdown);
      }
    }
  }, [chatOpen, sidebarCollapsed, showProfileDropdown, handleSidebarToggle, ANIMATION_DURATION]);

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

  // Close dropdown when sidebar collapses
  useEffect(() => {
    if (sidebarCollapsed && showProfileDropdown) {
      setShowProfileDropdown(false);
    }
  }, [sidebarCollapsed, showProfileDropdown]);

  // Calculate main panel positioning and dimensions
  const getMainPanelStyles = useCallback(() => {
    return {
      marginLeft: currentSidebarWidth,
      maxWidth: chatOpen && chatWidth > 0 
        ? `calc(100vw - ${currentSidebarWidth}px - ${chatWidth}px)`
        : `calc(100vw - ${currentSidebarWidth}px)`,
      flex: 1,
      transition: `all ${ANIMATION_DURATION}ms ${ANIMATION_EASING}`,
    };
  }, [currentSidebarWidth, chatOpen, chatWidth, ANIMATION_DURATION, ANIMATION_EASING]);

  // Calculate header positioning and dimensions
  const getHeaderStyles = useCallback(() => {
    return {
      marginLeft: currentSidebarWidth,
      width: `calc(100vw - ${currentSidebarWidth}px)`,
      flex: 1,
      transition: `all ${ANIMATION_DURATION}ms ${ANIMATION_EASING} !important`,
    };
  }, [currentSidebarWidth, chatOpen, chatWidth, ANIMATION_DURATION, ANIMATION_EASING]);

  // Chat width change handler (simple for now, can update for zero transition time during resize?)
  const handleChatWidthChange = useCallback((width: number) => {
    setChatWidth(width);
  }, []);

  // Chat toggle also collapses sidebar based on screen width
  const handleChatToggle = useCallback(() => {

    const newChatState = !chatOpen;
    setChatOpen(newChatState);

    if (newChatState && screenWidth < collapsibleSidebarWidth && !sidebarCollapsed) {
      handleSidebarToggle();
    }
    
    if (!newChatState && screenWidth >= collapsibleSidebarWidth && sidebarCollapsed) {
      setTimeout(() => {
        handleSidebarToggle();
      }, 50);
    }
  }, [chatOpen, screenWidth, sidebarCollapsed, handleSidebarToggle]);

  // Set tutorial popup anchor position
  const handlePositionUpdate = () => {
    if (lessonContentsRef.current) {
      const rect = lessonContentsRef.current.getBoundingClientRect();
      setTutorialAnchor({
        top: rect.top,
        left: rect.left,
      });
    } else {
      setTutorialAnchor(null);
    }
  };

  useEffect(() => {
    handlePositionUpdate();
    return () => {
      window.removeEventListener('resize', handlePositionUpdate);
      window.removeEventListener('scroll', handlePositionUpdate);
    };
  }, [view, showOnboardingPopup, chatOpen, chatWidth, sidebarCollapsed, screenWidth]);

  // Navigation handlers
  const handleNavigateToDashboard = useCallback(() => {
    goDashboard();
  }, [goDashboard]);

  // Function to fetch user progress
  const fetchUserProgress = useCallback(async () => {
    console.log("Fetching user progress...");
    setIsLoadingProgress(true);
    try {
      const response = await fetch(`${BACKEND_URL}/get_user_progress`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log("User not logged in, redirecting to login.");
        navigate('/');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Progress data received:", data);
      setUnlocked(data.unlockedLevels || [0]);
      setCompletedQuizzes(data.completedQuizzes || []);
      setHasViewedFirstLesson(data.hasViewedFirstLesson || false);
      if (data.email) setUserEmail(data.email);
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      setUnlocked([0]);
      setCompletedQuizzes([]);
      setHasViewedFirstLesson(false);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [navigate]);

  // Save first lesson view to backend
  const saveFirstLessonView = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/save_first_lesson_view`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("First lesson view saved successfully");
    } catch (error) {
      console.error('Failed to save first lesson view:', error);
      // Don't throw error - this is not critical functionality
    }
  }, []);

  // Fetch progress when the component mounts
  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

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

    const implementedTopics = course.concepts.reduce((sum, concept) => {
      return sum + concept.topics.filter(topic => topic.implemented ?? true).length;
    }, 0);
    
    if (implementedTopics === 0) return 0;

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
    if (courseId === 0) return true;
    
    const previousCourse = courses.find(c => c.id === courseId - 1);
    if (!previousCourse) return false;
    
    const previousProgress = getCourseProgress(courseId - 1);
    return previousProgress === 100;
  }, [getCourseProgress]);

  // Check if a topic/lesson is unlocked
  const isTopicUnlocked = useCallback((topicId: number): boolean => {
    let topicImplemented = true;
    for (const course of courses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === topicId);
        if (topic) {
          topicImplemented = topic.implemented ?? true;
          break;
        }
      }
      if (topicImplemented !== true) break;
    }

    if (!topicImplemented) return false;

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

    // Check if this is the user's first lesson ever
    if (!hasViewedFirstLesson) {
      setShowOnboardingPopup(true);
      if (userEmail !== DEV_LOGIN_EMAIL) {
        setHasViewedFirstLesson(true);
        saveFirstLessonView();
    }
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
    console.log('Searching for:', searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /* ---------- popup tutorial handlers ---------------------------- */
  const handleTutorialNext = () => {
    setTutorialStep(prev => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
  };
  const handleTutorialBack = () => {
    setTutorialStep(prev => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  };
  const handleTutorialClose = () => {
    setShowOnboardingPopup(false);
    setTutorialStep(1);
  };

  /* ---------- profile dropdown handlers -------------------------- */
  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    console.log('Settings clicked');
  };

  const handleHelpClick = () => {
    setShowProfileDropdown(false);
    console.log('Help clicked');
  };

  const handleSignOutClick = () => {
    setShowProfileDropdown(false);
    console.log('Sign out clicked');
  };

  const handleLeaveFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  /* ---------- breadcrumb helpers --------------------------------- */
  const getCurrentTabName = () => {
    if (view === 'course-detail' || view === 'lesson' || view === 'dashboard') {
      return "Lessons";
    }
    
    return "Lessons";
  };

  const renderBreadcrumb = () => {
    if (view === 'dashboard') return null;

    const breadcrumbItems = [];
    
    const rootTabName = getCurrentTabName();
    
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

    breadcrumbItems.push(
      <span key="separator1" style={styles.breadcrumbSeparator}> &gt; </span>
    );

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
  const onQuizComplete = async (_score: number, passed: boolean) => {
      if (currentLesson === null) return;

      setQuizOpen(false);

      try {
          await fetchUserProgress();

          if (!passed) {
            alert('You need 70% or higher to pass. Keep learning and try again!');
          } else {
            alert('Great job! Lesson completed.');
            if (currentCourse !== null) {
              goToCourseDetail(currentCourse);
            } else {
              goDashboard();
            }
          }

      } catch (error) {
          console.error('Failed to save quiz result:', error);
          alert(`An error occurred while saving your quiz progress: ${error instanceof Error ? error.message : String(error)}. Please try again.`);
          goDashboard();
      }
  };

  /* ---------- quiz availability check ---------------------------- */
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

  // Course detail view
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
    
    // let courseInfo = null;
    let topicInfo = null;
    
    for (const course of courses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === currentLesson);
        if (topic) {
          // courseInfo = course;
          topicInfo = topic;
          break;
        }
      }
      if (topicInfo) break;
    }

    return (
      <div style={styles.lessonContainer}>
        <div className='lesson-header' style={styles.lessonHeader}>
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
        </div>
        
        <div ref={lessonContentsRef}>
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
        
        {currentQuiz.length > 0 && (
          <div style={styles.quizPromptSection} className='lesson-header'>
            <p style={styles.lessonDescription}>
              Ready to see if you've grasped these concepts? Take this quiz and find out where you stand!
            </p>
            <button style={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
              START QUIZ
            </button>
          </div>
        )}
      </div>
    );
  };

  /* ---------------------------------------------------------------- */
  /* JSX                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <Sidebar
        currentView={view}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        onNavigateToDashboard={handleNavigateToDashboard}
        onCollapsedProfileClick={handleCollapsedProfileClick}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        profileDropdownRef={profileDropdownRef}
        profileButtonRef={profileButtonRef}
        onProfileClick={handleProfileClick}
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
        onSignOutClick={handleSignOutClick}
        onLeaveFeedbackClick={handleLeaveFeedbackClick}
        chatWidth={chatWidth}
        screenWidth={screenWidth}
        animationDuration={ANIMATION_DURATION}
        animationEasing={ANIMATION_EASING}
      />
      
      {/* HEADER */}
      <header 
        style={{
          ...styles.header,
          ...getHeaderStyles(),
        }}
        className='main-panel-coordinated'
      >
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
          {view === 'lesson' && !quizOpen && (
            <button
              className="chat-button"
              style={styles.chatButton}
              onClick={handleChatToggle}
              aria-label="Toggle Chat"
            >
              <MdOutlinePerson size="1.5em" /> <span>Chat</span>
            </button>
          )}
        </div>
      </header>
      
      {/* MAIN PANEL */}
      <main
        style={{
          ...styles.main,
          ...getMainPanelStyles(),
        }}
        className="main-panel-coordinated"
      >
        
        <div
          ref={contentRef}
          style={styles.content}
          className="dashboard-content default-scrollbar"
        >
          {isLoadingProgress ? (
             <p style={styles.loadingText}>Loading your progress...</p>
          ) : view === 'dashboard' ? (
            <>
              <h2 style={styles.title}>Lessons</h2>
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
          ) : view === 'course-detail' ? (
            courseDetailView()
          ) : (
            <>
              {lessonView()}
            </>
          )}
        </div>
      </main>
      
      {/* CHAT */}
      {view === 'lesson' && (
        <GlobalChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          highlightText={highlightText}
          highlightMode={highlightMode}
          onWidthChange={handleChatWidthChange}
          sidebarWidth={currentSidebarWidth}
          animationDuration={ANIMATION_DURATION}
          animationEasing={ANIMATION_EASING}
          isAnimating={isAnimating}
        />
      )}

      {/* QUIZ */}
      {quizOpen && currentLesson !== null && currentQuiz.length > 0 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Quiz
              courseId={currentLesson}
              questions={currentQuiz}
              lessonContent={currentLessonContent as any}
              onExit={() => { setQuizOpen(false) }}
              onComplete={onQuizComplete}
            />
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* TUTORIAL POPUP */}
      {showOnboardingPopup && view === 'lesson' && !quizOpen && (
        <TutorialPopup
          step={tutorialStep}
          anchorElement={lessonContentsRef.current}
          onNext={handleTutorialNext}
          onBack={handleTutorialBack}
          onClose={handleTutorialClose}
        />
      )}
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
    height: '100vh',
    background: '#030E29',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: 'hidden', // Prevent body scrolling
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden', // Prevent main from scrolling
    minWidth: 300,
    // Transition is now handled dynamically in getMainPanelStyles
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 4rem',
    background: 'transparent',
    borderBottom: `1px solid ${colors.border}`,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    color: colors.white,
    backgroundColor: '#030E29',
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
    gap: 15,
  },
  chatButton: {
    position: 'fixed',
    top: '0.9rem',
    right: '4rem',
    zIndex: 1900, // 1900 over header, 3000 over GlobalChat
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
    height: 'calc(100vh - 80px)',
    transition: 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    cursor: 'default',
  },
  breadcrumbCurrent: {
    color: colors.white,
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
  },
  rowSection: {
    marginBottom: 40,
  },
  title: {
    margin: '0 0 20px',
    fontSize: '2rem',
    color: colors.white,
    fontWeight: 600,
  },
  rowTitle: {
    margin: '0 0 20px',
    fontSize: '1.3rem',
    color: colors.white,
    fontWeight: 600,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
    gridAutoRows: '360px',
    alignItems: 'start',
    justifyItems: 'stretch',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease-in-out',border: `1px solid ${colors.border}`,
    height: '360px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    width: '100%',
    minWidth: '300px',
    maxWidth: '300px',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  },
  cardEnabled: {
    cursor: 'pointer',
  },
  cardDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  cardImg: {
    width: 'calc(100% - 24px)',
    height: 144,
    minHeight: 144,
    maxHeight: 144,
    objectFit: 'contain',
    margin: '12px 12px 0 12px',
    borderRadius: '8px',
    display: 'block',
    flexShrink: 0,
  },
  cardContent: {
    padding: 20,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 'calc(360px - 144px - 24px)', // Total height - image height - image margins
    minHeight: 'calc(360px - 144px - 24px)',
    maxHeight: 'calc(360px - 144px - 24px)',
    overflow: 'hidden',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '1.25rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    color: colors.white,
    lineHeight: '1.3',
    height: '3.25rem',
    minHeight: '1.625rem', // Approximately 1.3 * 1.25rem
    maxHeight: '3.25rem', // Allow for 2 lines max
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  cardDescription: {
    margin: '0 0 15px 0',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '400',
    color: '#A2A2B1',
    lineHeight: 1.5,
    height: '4.5rem', // 3 lines * 1.5 line-height * 0.9rem font-size
    minHeight: '4.5rem',
    maxHeight: '4.5rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
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
    flexShrink: 0,
  },
  progressBar: {
    position: 'relative',
    flex: 1,
    height: 8,
    width: '65%',
    background: '#424E62',
    borderRadius: 4,
    overflow: 'hidden',
    flexShrink: 0,
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
    flexShrink: 0,
    minWidth: 'fit-content',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    minHeight: '80px',
    maxHeight: '80px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '15px',
    flexShrink: 0,
  },
  lockIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A7C92',
    fontSize: '1.2rem',
    backgroundColor: 'transparent',
    flexShrink: 0,
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
    cursor: 'default',
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
  lessonHeader: {
    userSelect: 'none', // Make this section non-selectable
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    marginBottom: '2rem',
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
    transition: 'background-color 0.2s ease',
  },
  noQuizText: {
    textAlign: 'center',
    marginTop: '40px',
    color: colors.primary,
    fontSize: '1rem',
  },
  quizPromptSection: {
    margin: '70px 0 0 0',
    cursor: 'text',
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
};

// Add all styles and hover effects
const addAllStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Make lesson header non-selectable */
    .lesson-header {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      pointer-events: auto; /* Keep interactions like button clicks */
    }

    .lesson-header * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }

    /* Ensure buttons in header remain clickable */
    .lesson-header button {
      pointer-events: auto !important;
    }

    /* Text selection highlighting */
    ::selection {
      background-color: #23316A !important;
      color: white !important;
    }

    ::-moz-selection {
      background-color: #23316A !important;
      color: white !important;
    }

    /* Hover effects for the popup buttons */
    .highlight-explain-btn:hover {
      background-color: #d6e7f7 !important;
      transform: translateY(-1px);
    }

    .highlight-analogy-btn:hover {
      background-color: #9bb0dd !important;
      transform: translateY(-1px);
    }

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

    /* Breadcrumb button hover effects */
    .breadcrumb-button:hover {
      text-decoration: underline !important;
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