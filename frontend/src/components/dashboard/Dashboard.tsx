// src/components/Dashboard.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../layout/Sidebar';
import DashboardHeader from '../layout/DashboardHeader';
import Quiz from '../quiz/Quiz';
import GlobalChat from '../chat/GlobalChat';
import FeedbackModal from '../common/FeedbackModal';
import ProfileModal from '../profile/Profile';
import CourseCard from './CourseCard';
import CourseDetailView from './CourseDetailView';
import LessonView from './LessonView';
import { allQuizData } from '@/data/quizData';
import { lessonContents } from '@/data/lessonContents';
import { courses } from '@/data/courseData';
import type { Question } from '@/types/quiz';
import type { LessonContent, ParagraphItem } from '@/types/lesson';
import lesson0Img from '@/assets/lessonIcons/lesson-0.svg';
import lesson1Img from '@/assets/lessonIcons/lesson-1.svg';
import lesson2Img from '@/assets/lessonIcons/lesson-2.svg';
import { useNavigate } from 'react-router-dom';
import TutorialPopup from '../tutorial/TutorialPopup';
import { useAuth } from '@/AuthContext';
import { styles } from './DashboardStyles';
import type { Course, CompletedQuiz } from '@/types/course';

import api from '@/api';

const Dashboard: React.FC = () => {
  /* ---------- dev state ----------------------------------------- */
  const FIRST_TIME_USER_EMAIL = import.meta.env.VITE_FIRST_TIME_USER_EMAIL;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userPicture, setUserPicture] = useState<string>('');
  const { logout: authLogout } = useAuth();

  /* ---------- animation state ------------------------------------ */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const collapsibleSidebarWidth = 1500;
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarCollapsedRef = useRef(sidebarCollapsed);
  sidebarCollapsedRef.current = sidebarCollapsed;

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
  const lessonContentsRef = useRef<HTMLDivElement>(null);

  /* ---------- card FLIP animation refs --------------------------- */
  const cardElRefs = useRef<Map<number, HTMLElement>>(new Map());

  /* ---------- API lesson data (quiz/content for current lesson) --- */
  const [apiQuiz, setApiQuiz] = useState<Question[] | null>(null);
  const [apiLessonContent, setApiLessonContent] = useState<LessonContent | null>(null);

  useEffect(() => {
    if (currentLesson === null) {
      setApiQuiz(null);
      setApiLessonContent(null);
      return;
    }
    let cancelled = false;
    api.get(`/api/lessons/${currentLesson}`)
      .then(res => res.data)
      .then(data => {
        if (cancelled) return;
        if (data.quiz && data.quiz.length > 0) {
          setApiQuiz(data.quiz);
        }
        // Convert blocks to LessonContent format for Quiz component compatibility
        if (data.blocks) {
          const blocks: Array<{ type: string; text: string }> = data.blocks;
          const paragraphs: (string | ParagraphItem)[] = blocks
            .filter((b) => b.type !== 'image')
            .map((b) => {
              if (b.type === 'paragraph') return b.text;
              const t = b.type;
              if (t === 'heading' || t === 'subheading') return { text: b.text, type: t };
              return b.text;
            });
          setApiLessonContent({
            title: data.title,
            paragraphs,
            interactiveTerms: data.interactiveTerms || {},
          });
        }
      })
      .catch(() => {
        // Fall back to hardcoded data
      });
    return () => { cancelled = true; };
  }, [currentLesson]);

  /* ---------- dashboard config (sections/courses from API) -------- */
  interface DashboardSection { id: string; title: string; order: number; courses: number[]; }
  interface DashboardConfig { sections: DashboardSection[]; courses: Course[]; }
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/dashboard-config')
      .then(res => res.data)
      .then(data => {
        if (cancelled || !data) return;
        // Map image strings to imported assets
        const imageMap: Record<string, string> = { 'lesson-0': lesson0Img, 'lesson-1': lesson1Img, 'lesson-2': lesson2Img };
        const mappedCourses = (data.courses || []).map((c: Course) => ({
          ...c,
          image: imageMap[c.image] || lesson0Img,
        }));
        setDashboardConfig({ sections: data.sections || [], courses: mappedCourses });
      })
      .catch(() => { /* fall back to hardcoded */ });
    return () => { cancelled = true; };
  }, []);

  // Use API config if available, otherwise fall back to hardcoded
  const activeCourses: Course[] = dashboardConfig?.courses || courses;
  const activeSections: DashboardSection[] = dashboardConfig?.sections || [
    { id: 'foundations', title: 'Foundations', order: 0, courses: [0, 1, 2] },
    { id: 'in-action', title: 'Quantum computing in action', order: 1, courses: [3, 4, 5] },
    { id: 'deep-dive', title: 'Deep dive into quantum theory', order: 2, courses: [6, 7, 8] },
  ];

  /* ---------- feedback state ------------------------------------- */
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  /* ---------- search state --------------------------------------- */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* ---------- chat & highlight state and callback ---------------- */
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatWidth, setChatWidth] = useState<number>(0);
  // Refs for resize handler to access current layout state
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const chatWidthRef = useRef(chatWidth);
  chatWidthRef.current = chatWidth;
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

  // Animation constants
  const ANIMATION_DURATION = 200;
  const ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const [isChatResizing, setIsChatResizing] = useState(false);
  const [isWindowResizing, setIsWindowResizing] = useState(false);
  const windowResizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effective duration: 0 during resize/window-resize, animated otherwise
  const effectiveDuration = (isChatResizing || isWindowResizing) ? 0 : ANIMATION_DURATION;

  // Ref for handleSidebarToggle so the resize handler can call it without stale closures
  const handleSidebarToggleRef = useRef<() => void>(() => {});

  // Track screen size for responsive behavior (suppress transitions during window resize)
  // Also auto-collapses/expands sidebar when screen width crosses threshold while chat is open
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      setIsWindowResizing(true);

      // Auto-collapse/expand sidebar on resize when chat is open
      const shouldCollapse = newWidth < collapsibleSidebarWidth && chatOpenRef.current && chatWidthRef.current > 0;
      if (shouldCollapse && !sidebarCollapsedRef.current) {
        handleSidebarToggleRef.current();
      } else if (!shouldCollapse && sidebarCollapsedRef.current && chatOpenRef.current) {
        handleSidebarToggleRef.current();
      }

      if (windowResizeTimerRef.current) {
        clearTimeout(windowResizeTimerRef.current);
      }
      windowResizeTimerRef.current = setTimeout(() => {
        setIsWindowResizing(false);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (windowResizeTimerRef.current) {
        clearTimeout(windowResizeTimerRef.current);
      }
    };
  }, []);

  // Calculate sidebar dimensions
  const SIDEBAR_EXPANDED_WIDTH = 250;
  const SIDEBAR_COLLAPSED_WIDTH = 70;
  const currentSidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Coordinated sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSidebarCollapsed(prev => {
      if (!prev) setShowProfileDropdown(false); // collapsing → close dropdown
      return !prev;
    });

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  }, [isAnimating, ANIMATION_DURATION]);
  handleSidebarToggleRef.current = handleSidebarToggle;

  // Cleanup animation timeout
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // FLIP animation — Web Animations API for interruptible, smooth card reflow
  const cardAnimationsRef = useRef<Map<number, Animation>>(new Map());
  const prevPositionsRef = useRef<Map<number, DOMRect>>(new Map());

  const FLIP_DURATION = 120;
  const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

  // Stable FLIP function via ref — called by ResizeObserver
  const runFlipRef = useRef<() => void>(() => {});
  runFlipRef.current = () => {
    if (cardElRefs.current.size === 0) return;

    // 1. Snapshot previous positions (from last call) before we overwrite them
    const oldPositions = new Map(prevPositionsRef.current);

    // 2. Capture where each card VISUALLY is right now (includes in-flight animation transforms)
    const visualRects = new Map<number, DOMRect>();
    cardElRefs.current.forEach((el, id) => {
      visualRects.set(id, el.getBoundingClientRect());
    });

    // 3. Cancel all in-flight WAAPI animations (synchronous, no paint yet)
    cardAnimationsRef.current.forEach((anim) => anim.cancel());
    cardAnimationsRef.current.clear();

    // 4. Force reflow — elements are now at clean layout positions
    void document.body.offsetHeight;

    // 5. For each card, compute where to animate FROM
    cardElRefs.current.forEach((el, id) => {
      const layoutRect = el.getBoundingClientRect();

      // Always update previous positions to current layout for the next call
      prevPositionsRef.current.set(id, layoutRect);

      const visualRect = visualRects.get(id);
      if (!visualRect) return;

      // If an animation was in-flight, the visual rect differs from layout rect
      let fromDx = visualRect.left - layoutRect.left;
      let fromDy = visualRect.top - layoutRect.top;

      // If no animation was running, use previous positions (one resize-step behind)
      if (Math.abs(fromDx) < 1 && Math.abs(fromDy) < 1) {
        const prevRect = oldPositions.get(id);
        if (prevRect) {
          fromDx = prevRect.left - layoutRect.left;
          fromDy = prevRect.top - layoutRect.top;
        }
      }

      // No significant movement — skip
      if (Math.abs(fromDx) < 1 && Math.abs(fromDy) < 1) return;

      // 6. Animate from visual/previous position to layout position
      const anim = el.animate(
        [
          { transform: `translate(${fromDx}px, ${fromDy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: FLIP_DURATION, easing: FLIP_EASING, fill: 'none' }
      );

      cardAnimationsRef.current.set(id, anim);
      anim.onfinish = () => {
        cardAnimationsRef.current.delete(id);
      };
    });
  };

  // Set up ResizeObserver once on mount
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      runFlipRef.current();
    });
    observer.observe(container);

    // Initialize previous positions
    cardElRefs.current.forEach((el, id) => {
      prevPositionsRef.current.set(id, el.getBoundingClientRect());
    });

    return () => {
      observer.disconnect();
      cardAnimationsRef.current.forEach((anim) => anim.cancel());
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
      const target: Node | null = event.target instanceof Node ? event.target : null;
      if (
        target &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
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



  // Calculate main panel positioning and dimensions
  const getMainPanelStyles = useCallback(() => {
    return {
      marginLeft: currentSidebarWidth,
      maxWidth: chatOpen && chatWidth > 0
        ? `calc(100vw - ${currentSidebarWidth}px - ${chatWidth}px)`
        : `calc(100vw - ${currentSidebarWidth}px)`,
      flex: 1,
      transition: effectiveDuration > 0 ? `all ${effectiveDuration}ms ${ANIMATION_EASING}` : 'none',
    };
  }, [currentSidebarWidth, chatOpen, chatWidth, effectiveDuration, ANIMATION_EASING]);

  // Calculate header positioning and dimensions
  const getHeaderStyles = useCallback(() => {
    return {
      marginLeft: currentSidebarWidth,
      width: `calc(100vw - ${currentSidebarWidth}px)`,
      flex: 1,
      transition: effectiveDuration > 0 ? `all ${effectiveDuration}ms ${ANIMATION_EASING} !important` : 'none !important',
    };
  }, [currentSidebarWidth, chatOpen, chatWidth, effectiveDuration, ANIMATION_EASING]);

  // Chat width change handler — suppress transitions while actively dragging
  // Also auto-collapses sidebar if chat widens enough on a narrow screen
  const handleChatWidthChange = useCallback((width: number, isResizing?: boolean) => {
    setChatWidth(width);
    setIsChatResizing(!!isResizing);
    // Auto-collapse sidebar if chat is taking space on a narrow screen
    if (width > 0 && screenWidth < collapsibleSidebarWidth && !sidebarCollapsed) {
      handleSidebarToggle();
    }
  }, [screenWidth, sidebarCollapsed, handleSidebarToggle]);

  // Chat toggle — also manages chatWidth and collapses sidebar based on screen width
  const CHAT_DEFAULT_WIDTH = 420;
  const handleChatToggle = useCallback(() => {
    const newChatState = !chatOpen;
    setChatOpen(newChatState);
    setChatWidth(newChatState ? CHAT_DEFAULT_WIDTH : 0);

    if (newChatState && screenWidth < collapsibleSidebarWidth && !sidebarCollapsed) {
      handleSidebarToggle();
    }

    if (!newChatState && screenWidth >= collapsibleSidebarWidth && sidebarCollapsed) {
      setTimeout(() => {
        handleSidebarToggle();
      }, 50);
    }
  }, [chatOpen, screenWidth, sidebarCollapsed, handleSidebarToggle]);

  // Navigation handlers
  const handleNavigateToDashboard = useCallback(() => {
    goDashboard();
  }, [goDashboard]);

  // Function to fetch user progress
  const fetchUserProgress = useCallback(async () => {
    console.log("Fetching user progress...");
    setIsLoadingProgress(true);
    try {
      const response = await api.get('/get_user_progress');
      const data = response.data;
      console.log("Progress data received:", data);
      setUnlocked(data.unlockedLevels || [0]);
      setCompletedQuizzes(data.completedQuizzes || []);
      setHasViewedFirstLesson(data.hasViewedFirstLesson || false);
      if (data.email) setUserEmail(data.email);
      if (data.name) setUserName(data.name);
      if (data.picture) setUserPicture(data.picture);
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      setUnlocked([0]);
      setCompletedQuizzes([]);
      setHasViewedFirstLesson(false);
    } finally {
      setIsLoadingProgress(false);
    }
  }, []);

  // Save first lesson view to backend
  const saveFirstLessonView = useCallback(async () => {
    try {
      await api.post('/save_first_lesson_view');
      console.log("First lesson view saved successfully");
    } catch (error) {
      console.error('Failed to save first lesson view:', error);
      // Don't throw error - this is not critical functionality
    }
  }, []);

  // Fetch progress when the component mounts
  useEffect(() => {
    void fetchUserProgress();
  }, [fetchUserProgress]);

  // Calculate course progress based on completed topics
  const getCourseProgress = useCallback((courseId: number): number => {
    const course = activeCourses.find(c => c.id === courseId);
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
    
    const previousCourse = activeCourses.find(c => c.id === courseId - 1);
    if (!previousCourse) return false;
    
    const previousProgress = getCourseProgress(courseId - 1);
    return previousProgress === 100;
  }, [getCourseProgress]);

  // Check if a topic/lesson is unlocked
  const isTopicUnlocked = useCallback((topicId: number): boolean => {
    let topicImplemented = true;
    for (const course of activeCourses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === topicId);
        if (topic) {
          topicImplemented = topic.implemented ?? true;
          break;
        }
      }
      if (!topicImplemented) break;
    }

    if (!topicImplemented) return false;

    for (const course of activeCourses) {
      for (const concept of course.concepts) {
        const topic = concept.topics.find(t => t.id === topicId);
        if (topic) {
          return isCourseUnlocked(course.id);
        }
      }
    }

    return false;
  }, [activeCourses, isCourseUnlocked]);

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
      if (userEmail !== FIRST_TIME_USER_EMAIL) {
        setHasViewedFirstLesson(true);
        void saveFirstLessonView();
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
    setTutorialStep(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return prev;
    });
  };
  const handleTutorialBack = () => {
    setTutorialStep(prev => {
      if (prev === 3) return 2;
      if (prev === 2) return 1;
      return prev;
    });
  };
  const handleTutorialClose = () => {
    setShowOnboardingPopup(false);
    setTutorialStep(1);
  };

  /* ---------- profile dropdown handlers -------------------------- */
  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };

  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    console.log('Settings clicked');
  };

  const handleHelpClick = () => {
    setShowProfileDropdown(false);
    console.log('Help clicked');
  };

  const handleSignOutClick = async () => {
    setShowProfileDropdown(false);
    await authLogout();
    navigate('/');
  };

  const handleLeaveFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  /* ---------- breadcrumb helpers --------------------------------- */
  const getCurrentTabName = () => {
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
        aria-label="Go back to lessons overview"
      >
        {rootTabName}
      </button>
    );

    breadcrumbItems.push(
      <span key="separator1" style={styles.breadcrumbSeparator}> &gt; </span>
    );

    if (view === 'lesson' && currentCourse !== null) {
      const course = activeCourses.find(c => c.id === currentCourse);
      if (course) {
        breadcrumbItems.push(
          <button
            key="course"
            style={styles.breadcrumbButton}
            onClick={() => goToCourseDetail(currentCourse)}
            className="breadcrumb-button"
            aria-label={`Go back to ${course.title}`}
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
  const currentQuiz = currentLesson !== null
    ? (apiQuiz || allQuizData[currentLesson])
    : [];
  const currentLessonContent = currentLesson !== null
    ? (apiLessonContent || lessonContents[currentLesson])
    : undefined;

  const handleOpenQuiz = useCallback(() => {
    if (currentLesson !== null && currentQuiz.length === 0) {
      alert('Quiz not available for this lesson yet.');
      return;
    }
    setQuizOpen(true);
  }, [currentLesson, currentQuiz]);

  /* ---------- render helpers ------------------------------------- */
  const renderCourseCard = (c: Course) => (
    <CourseCard
      key={c.id}
      course={c}
      isUnlocked={isCourseUnlocked(c.id)}
      progress={getCourseProgress(c.id)}
      onSelect={goToCourseDetail}
      cardRef={(courseId, el) => {
        if (el) cardElRefs.current.set(courseId, el);
        else cardElRefs.current.delete(courseId);
      }}
    />
  );

  // Course detail view — delegated to CourseDetailView component

  // Lesson view — delegated to LessonView component

  /* ---------------------------------------------------------------- */
  /* JSX                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div style={styles.container} className={effectiveDuration === 0 ? 'no-transition' : ''}>

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
        onSignOutClick={() => { void handleSignOutClick(); }}
        onLeaveFeedbackClick={handleLeaveFeedbackClick}
        chatWidth={chatWidth}
        screenWidth={screenWidth}
        animationDuration={effectiveDuration}
        animationEasing={ANIMATION_EASING}
        userEmail={userEmail || ''}
        userName={userName}
        userPicture={userPicture}
      />

      {/* HEADER */}
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        view={view}
        quizOpen={quizOpen}
        onChatToggle={handleChatToggle}
        headerStyle={{
          ...styles.header,
          ...getHeaderStyles(),
        }}
      />
      
      {/* MAIN PANEL */}
      <main
        style={{
          ...styles.main,
          ...getMainPanelStyles(),
        }}
        className="main-panel-coordinated"
        role="main"
        aria-label="Course content"
      >
        
        <div
          ref={contentRef}
          style={styles.content}
          className="dashboard-content default-scrollbar"
          tabIndex={0}
          role="region"
          aria-label="Scrollable content area"
        >
          {isLoadingProgress ? (
             <p style={styles.loadingText}>Loading your progress...</p>
          ) : view === 'dashboard' ? (
            <>
              <h2 style={styles.title}>Lessons</h2>
              {activeSections
                .sort((a, b) => a.order - b.order)
                .map(section => {
                  const sectionCourses = section.courses
                    .map(id => activeCourses.find(c => c.id === id))
                    .filter((c): c is Course => !!c);
                  if (sectionCourses.length === 0) return null;
                  return (
                    <section key={section.id} style={styles.rowSection}>
                      <h2 style={styles.rowTitle}>{section.title}</h2>
                      <div style={styles.cardGrid}>{sectionCourses.map(renderCourseCard)}</div>
                    </section>
                  );
                })}
            </>
          ) : view === 'course-detail' ? (
            <CourseDetailView
              currentCourse={currentCourse}
              activeCourses={activeCourses}
              completedQuizzes={completedQuizzes}
              isTopicUnlocked={isTopicUnlocked}
              openLesson={openLesson}
              renderBreadcrumb={renderBreadcrumb}
            />
          ) : (
            <LessonView
              currentLesson={currentLesson}
              activeCourses={activeCourses}
              currentQuiz={currentQuiz}
              handleOpenQuiz={handleOpenQuiz}
              renderBreadcrumb={renderBreadcrumb}
              handleExplain={handleExplain}
              handleAnalogy={handleAnalogy}
              lessonContentsRef={lessonContentsRef}
            />
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
          courseId={currentLesson ?? 0}
          onWidthChange={handleChatWidthChange}
          sidebarWidth={currentSidebarWidth}
          animationDuration={effectiveDuration}
          animationEasing={ANIMATION_EASING}
        />
      )}

      {/* QUIZ */}
      {quizOpen && currentLesson !== null && currentQuiz.length > 0 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Quiz
              courseId={currentLesson}
              questions={currentQuiz}
              lessonContent={currentLessonContent ? {
                title: currentLessonContent.title,
                paragraphs: currentLessonContent.paragraphs.map(p => typeof p === 'string' ? p : p.text),
                interactiveTerms: currentLessonContent.interactiveTerms,
              } : undefined}
              onExit={() => { setQuizOpen(false) }}
              onComplete={(score: number, passed: boolean) => { void onQuizComplete(score, passed); }}
            />
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      <FeedbackModal
        key={showFeedbackModal ? 'open' : 'closed'}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* PROFILE SETTINGS */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => { setShowProfileModal(false); void fetchUserProgress(); }}
        userName={userName}
        userPicture={userPicture}
      />

      {/* TUTORIAL POPUP */}
      {showOnboardingPopup && view === 'lesson' && !quizOpen && (
        <TutorialPopup
          step={tutorialStep}
          anchorElement={lessonContentsRef.current}
          onNext={handleTutorialNext}
          onBack={handleTutorialBack}
          onClose={handleTutorialClose}
          chatOpen={chatOpen}
          sidebarCollapsed={sidebarCollapsed}
          animationDuration={ANIMATION_DURATION}
        />
      )}
    </div>
  );
};

export default Dashboard;
