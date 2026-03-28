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
import { useNavigate } from 'react-router-dom';
import TutorialPopup from '../tutorial/TutorialPopup';
import { useAuth } from '@/AuthContext';
import { styles } from './DashboardStyles';
import type { Course } from '@/types/course';
import { useCardFlipAnimation } from '@/hooks/useCardFlipAnimation';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { useDashboardData } from '@/hooks/useDashboardData';


const Dashboard: React.FC = () => {
  const FIRST_TIME_USER_EMAIL = import.meta.env.VITE_FIRST_TIME_USER_EMAIL;
  const { logout: authLogout } = useAuth();

  /* ---------- layout (sidebar / chat / resize) -------------------- */
  const layout = useDashboardLayout();

  /* ---------- view / lesson state -------------------------------- */
  const [view, setView] = useState<'dashboard' | 'course-detail' | 'lesson'>('dashboard');
  const [currentCourse, setCurrentCourse] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  /* ---------- data (progress, courses, lesson content) ----------- */
  const data = useDashboardData({ currentLesson });

  /* ---------- first lesson tutorial state ------------------------ */
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 3>(1);
  const lessonContentsRef = useRef<HTMLDivElement>(null);

  /* ---------- feedback state ------------------------------------- */
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  /* ---------- search state --------------------------------------- */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* ---------- highlight state ------------------------------------- */
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

  /* ---------- card FLIP animation -------------------------------- */
  const { cardRef: flipCardRef } = useCardFlipAnimation({ containerRef: contentRef });

  const goDashboard = useCallback(() => {
    setView('dashboard');
    setCurrentCourse(null);
    setCurrentLesson(null);
    layout.setChatOpen(false);
  }, [layout]);

  const goToCourseDetail = useCallback((courseId: number) => {
    setCurrentCourse(courseId);
    setCurrentLesson(null);
    setView('course-detail');
    layout.setChatOpen(false);
  }, [layout]);

  // Wire sidebar collapse to close profile dropdown
  layout.onSidebarCollapse(() => setShowProfileDropdown(false));

  const handleCollapsedProfileClick = useCallback(() => {
    if (layout.chatOpen) {
      layout.setChatOpen(false);

      setTimeout(() => {
        setShowProfileDropdown(true);
      }, layout.animationDuration + 50);
    } else {
      if (layout.sidebarCollapsed) {
        layout.handleSidebarToggle();
        setTimeout(() => {
          setShowProfileDropdown(true);
        }, layout.animationDuration);
      } else {
        setShowProfileDropdown(!showProfileDropdown);
      }
    }
  }, [layout, showProfileDropdown]);

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

  // Navigation handlers
  const handleNavigateToDashboard = useCallback(() => {
    goDashboard();
  }, [goDashboard]);

  const openLesson = (topicId: number) => {
    if (data.isLoadingProgress) {
        console.log("Still loading progress, cannot open lesson yet.");
        return;
    }
    if (!data.isTopicUnlocked(topicId)) {
      alert('This lesson is locked. Complete the previous lessons first.');
      return;
    }

    // Check if this is the user's first lesson ever
    if (!data.hasViewedFirstLesson) {
      setShowOnboardingPopup(true);
      if (data.userEmail !== FIRST_TIME_USER_EMAIL) {
        data.setHasViewedFirstLesson(true);
        void data.saveFirstLessonView();
      }
    }

    setCurrentLesson(topicId);
    setView('lesson');
    layout.setChatOpen(false);
  };

  /* ---------- highlight callbacks -------------------------------- */
  const handleExplain = (text: string) => {
    setHighlightText(text);
    setHighlightMode('explain');
    layout.setChatOpen(true);
  };

  const handleAnalogy = (text: string) => {
    setHighlightText(text);
    setHighlightMode('analogy');
    layout.setChatOpen(true);
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
      const course = data.activeCourses.find(c => c.id === currentCourse);
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
          await data.fetchUserProgress();

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

  const handleOpenQuiz = useCallback(() => {
    if (currentLesson !== null && data.currentQuiz.length === 0) {
      alert('Quiz not available for this lesson yet.');
      return;
    }
    setQuizOpen(true);
  }, [currentLesson, data.currentQuiz]);

  /* ---------- render helpers ------------------------------------- */
  const renderCourseCard = (c: Course) => (
    <CourseCard
      key={c.id}
      course={c}
      isUnlocked={data.isCourseUnlocked(c.id)}
      progress={data.getCourseProgress(c.id)}
      onSelect={goToCourseDetail}
      cardRef={flipCardRef}
    />
  );

  // Course detail view — delegated to CourseDetailView component

  // Lesson view — delegated to LessonView component

  /* ---------------------------------------------------------------- */
  /* JSX                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div style={styles.container} className={layout.effectiveDuration === 0 ? 'no-transition' : ''}>

      {/* SIDEBAR */}
      <Sidebar
        currentView={view}
        isCollapsed={layout.sidebarCollapsed}
        onToggleCollapse={layout.handleSidebarToggle}
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
        chatWidth={layout.chatWidth}
        screenWidth={layout.screenWidth}
        animationDuration={layout.effectiveDuration}
        animationEasing={layout.animationEasing}
        userEmail={data.userEmail || ''}
        userName={data.userName}
        userPicture={data.userPicture}
      />

      {/* HEADER */}
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        view={view}
        quizOpen={quizOpen}
        onChatToggle={layout.handleChatToggle}
        headerStyle={{
          ...styles.header,
          ...layout.getHeaderStyles(),
        }}
      />

      {/* MAIN PANEL */}
      <main
        style={{
          ...styles.main,
          ...layout.getMainPanelStyles(),
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
          {data.isLoadingProgress ? (
             <p style={styles.loadingText}>Loading your progress...</p>
          ) : view === 'dashboard' ? (
            <>
              <h2 style={styles.title}>Lessons</h2>
              {data.activeSections
                .sort((a, b) => a.order - b.order)
                .map(section => {
                  const sectionCourses = section.courses
                    .map(id => data.activeCourses.find(c => c.id === id))
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
              activeCourses={data.activeCourses}
              completedQuizzes={data.completedQuizzes}
              isTopicUnlocked={data.isTopicUnlocked}
              openLesson={openLesson}
              renderBreadcrumb={renderBreadcrumb}
            />
          ) : (
            <LessonView
              currentLesson={currentLesson}
              activeCourses={data.activeCourses}
              currentQuiz={data.currentQuiz}
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
          isOpen={layout.chatOpen}
          onClose={() => layout.setChatOpen(false)}
          highlightText={highlightText}
          highlightMode={highlightMode}
          courseId={currentLesson ?? 0}
          onWidthChange={layout.handleChatWidthChange}
          sidebarWidth={layout.currentSidebarWidth}
          animationDuration={layout.effectiveDuration}
          animationEasing={layout.animationEasing}
        />
      )}

      {/* QUIZ */}
      {quizOpen && currentLesson !== null && data.currentQuiz.length > 0 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Quiz
              courseId={currentLesson}
              questions={data.currentQuiz}
              lessonContent={data.currentLessonContent ? {
                title: data.currentLessonContent.title,
                paragraphs: data.currentLessonContent.paragraphs.map(p => typeof p === 'string' ? p : p.text),
                interactiveTerms: data.currentLessonContent.interactiveTerms,
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
        onClose={() => { setShowProfileModal(false); void data.fetchUserProgress(); }}
        userName={data.userName}
        userPicture={data.userPicture}
      />

      {/* TUTORIAL POPUP */}
      {showOnboardingPopup && view === 'lesson' && !quizOpen && (
        <TutorialPopup
          step={tutorialStep}
          anchorElement={lessonContentsRef.current}
          onNext={handleTutorialNext}
          onBack={handleTutorialBack}
          onClose={handleTutorialClose}
          chatOpen={layout.chatOpen}
          sidebarCollapsed={layout.sidebarCollapsed}
          animationDuration={layout.animationDuration}
        />
      )}
    </div>
  );
};

export default Dashboard;
