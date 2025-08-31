// src/components/Dashboard/Dashboard.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaLock, FaCheckCircle } from 'react-icons/fa';
import { MdOutlinePerson } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.scss';
import Sidebar from '../Sidebar/Sidebar';
import Reading from '../Reading/Reading';
import Quiz from '../Quiz/Quiz';
import GlobalChat from '../GlobalChat/GlobalChat';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import HighlightableInstructionsForReading from '../HighlightableInstructionsForReading/HighlightableInstructionsForReading';
import TutorialPopup from '../TutorialPopup/TutorialPopup';
import { allQuizData } from '../QuizQuestion';
import { lessonContents } from '../LessonContents';
import lesson0Img from '../../assets/lessonIcons/lesson-0.svg';
import lesson1Img from '../../assets/lessonIcons/lesson-1.svg';
import lesson2Img from '../../assets/lessonIcons/lesson-2.svg';

// Define BACKEND_URL - Replace with your actual backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Use environment variable

/* ------------------------------------------------------------------ */
/* COURSE DATA                                                        */
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

// Interface for quiz completion data from backend (optional but good practice)
interface CompletedQuiz {
    courseId: number;
    score: number;
    passed: boolean;
    timestamp: string; // ISO date string
}

// Ensure IDs match the backend logic
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

const Dashboard: React.FC = () => {
  const DEV_LOGIN_EMAIL = import.meta.env.DEV_LOGIN_EMAIL;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Animation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const collapsibleSidebarWidth = 1500;
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // View/lesson state
  const [view, setView] = useState<'dashboard' | 'course-detail' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<number | null>(null);
  const [, setUnlocked] = useState<number[]>([]);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]);

  // Tutorial state
  const [hasViewedFirstLesson, setHasViewedFirstLesson] = useState<boolean>(false);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 3>(1);
  const [, setTutorialAnchor] = useState<{ top: number; left: number } | null>(null);
  const lessonContentsRef = useRef<HTMLDivElement>(null);

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Chat & highlight state
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatWidth, setChatWidth] = useState<number>(0);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [highlightMode, setHighlightMode] = useState<'explain' | 'analogy' | null>(null);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
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

  // Highlight callbacks
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

  // Search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Popup tutorial handlers
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

  // Profile dropdown handlers
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

  // Breadcrumb helpers
  const getCurrentTabName = () => {
    if (view === 'course-detail' || view === 'lesson' || view === 'dashboard') {
      return "Lessons";
    }
    
    return "Lessons";
  };

  // Quiz completion
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

  // Quiz availability check
  const currentQuiz = currentLesson !== null ? (allQuizData[currentLesson] || []) : [];
  const currentLessonContent = currentLesson !== null ? lessonContents[currentLesson] : undefined;

  useEffect(() => {
    if (quizOpen && currentLesson !== null && currentQuiz.length === 0) {
      alert(`Quiz not available for this lesson yet.`);
      setQuizOpen(false);
    }
  }, [quizOpen, currentQuiz, currentLesson]);

  // Dashboard course card
  const courseCard = (c: Course) => {
    const isUnlocked = isCourseUnlocked(c.id);
    const progress = getCourseProgress(c.id);

    return (
      <div
        key={c.id}
        className={`${styles.card} ${
          isUnlocked ? styles.cardEnabled : styles.cardDisabled
        }`}
        onClick={() => isUnlocked && goToCourseDetail(c.id)}
      >
        <img src={c.image} alt={c.title} className={styles.cardImg} />
        <div className={styles.cardContent}>
          <h4 className={styles.cardTitle}>{c.title}</h4>
          <p className={styles.cardDescription}>{c.description}</p>
          {isUnlocked && progress > 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {progress}% complete
              </span>
            </div>
          )}
        </div>
        {!isUnlocked && (
          <div className={styles.lockOverlay}>
            <div className={styles.lockIcon}>
              <FaLock />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Breadcrumb navigation (Dashboard > Course > Lesson)
  const renderBreadcrumb = () => {
    if (view === 'dashboard') return null;

    const breadcrumbItems = [];
    const rootTabName = getCurrentTabName();
    
    breadcrumbItems.push(
      <button
        key="root"
        className={styles.breadcrumbButton}
        onClick={goDashboard}
      >
        {rootTabName}
      </button>
    );

    breadcrumbItems.push(
      <span key="separator1" className={styles.breadcrumbSeparator}> &gt; </span>
    );

    if (view === 'lesson' && currentCourse !== null) {
      const course = courses.find(c => c.id === currentCourse);
      if (course) {
        breadcrumbItems.push(
          <button
            key="course"
            className={styles.breadcrumbButton}
            onClick={() => goToCourseDetail(currentCourse)}
          >
            {course.title}
          </button>
        );
        
        breadcrumbItems.push(
          <span key="separator2" className={styles.breadcrumbSeparator}> &gt; </span>
        );
      }
    }

    return (
      <div className={styles.breadcrumbContainer}>
        {breadcrumbItems}
      </div>
    );
  };

  // Course detail view
  const courseDetailView = () => {
    if (currentCourse === null) return <p>Loading course...</p>;
    const course = courses.find(c => c.id === currentCourse);
    if (!course) return <p>Course not found.</p>;

    return (
      <div className={styles.courseDetailContainer}>
        {renderBreadcrumb()}

        <div className={styles.courseDetailHeader}>
          <h1 className={styles.courseDetailTitle}>{course.title}</h1>
          <p className={styles.courseDetailDescription}>{course.description}</p>
        </div>

        <div className={styles.conceptsContainer}>
          {course.concepts.map((concept, conceptIndex) => (
            <div key={concept.id}>
              <div className={styles.conceptHeader}>
                <div className={styles.conceptIcon}>
                  {concept.icon ? (
                    <img src={concept.icon} alt={concept.title} style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <span className={styles.conceptNumber}>{conceptIndex + 1}</span>
                  )}
                </div>
                <h3 className={styles.conceptTitle}>{concept.title}</h3>
              </div>
              
              <div className={styles.topicsList}>
                {concept.topics.map((topic) => {
                  const isTopicCompleted = completedQuizzes.some(quiz => quiz.courseId === topic.id && quiz.passed);
                  const isUnlocked = isTopicUnlocked(topic.id);
                  
                  return (
                    <button
                      key={topic.id}
                      className={styles.topicButton}
                      onClick={() => isUnlocked && openLesson(topic.id)}
                      disabled={!isUnlocked}
                    >
                      <span className={styles.topicTitle}>{topic.title}</span>
                      {isTopicCompleted && (
                        <FaCheckCircle size={24} className={styles.topicCheckmark} />
                      )}
                      {!isUnlocked && (
                        <FaLock size={24} className={styles.topicLock} />
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
    
    let topicInfo = null;
    for (const course of courses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === currentLesson);
        if (topic) {
          topicInfo = topic;
          break;
        }
      }
      if (topicInfo) break;
    }

    return (
      <div className={styles.lessonContainer}>
        <div className={styles.lessonHeader}>
          {renderBreadcrumb()}

          <h2 className={styles.lessonTitle}>{topicInfo?.title || 'Lesson'}</h2>
          {topicInfo?.description && (
            <p className={styles.lessonDescription}>{topicInfo.description}</p>
          )}

          {currentQuiz.length > 0 && (
            <button className={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
              TAKE QUIZ
            </button>
          )}
          {currentQuiz.length === 0 && (
            <p className={styles.noQuizText}>Quiz coming soon for this lesson!</p>
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
          <div className={styles.quizPromptSection}>
            <p className={styles.lessonDescription}>
              Ready to see if you've grasped these concepts? Take this quiz and find out where you stand!
            </p>
            <button className={styles.takeQuizButton} onClick={() => setQuizOpen(true)}>
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
    <div className={styles.container}>

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
        className={`${styles.header} ${styles.mainPanelCoordinated}`}
        style={getHeaderStyles()}
      >
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search Quantaid"
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
        </form>
        
        <div className={styles.headerIcons}>
          {view === 'lesson' && !quizOpen && (
            <button
              className={styles.chatButton}
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
        className={`${styles.main} ${styles.mainPanelCoordinated}`}
        style={getMainPanelStyles()}
      >
        
        <div
          ref={contentRef}
          className={`${styles.content} ${styles.dashboardContent}`}
        >
          {isLoadingProgress ? (
             <p className={styles.loadingText}>Loading your progress...</p>
          ) : view === 'dashboard' ? (
            <>
              <h2 className={styles.title}>Lessons</h2>
              <section className={styles.rowSection}>
                <h2 className={styles.rowTitle}>Foundations</h2>
                <div className={styles.cardGrid}>{courses.slice(0, 3).map(courseCard)}</div>
              </section>

              <section className={styles.rowSection}>
                <h2 className={styles.rowTitle}>Quantum computing in action</h2>
                <div className={styles.cardGrid}>{courses.slice(3, 6).map(courseCard)}</div>
              </section>

              <section className={styles.rowSection}>
                <h2 className={styles.rowTitle}>Deep dive into quantum theory</h2>
                <div className={styles.cardGrid}>{courses.slice(6, 9).map(courseCard)}</div>
              </section>
            </>
          ) : view === 'course-detail' ? (
            courseDetailView()
          ) : (
            lessonView()
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
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

export default Dashboard;