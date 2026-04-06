import { useState, useEffect, useCallback } from 'react';
import api from '@/api';
import type { Question } from '@/types/quiz';
import type { LessonContent, ParagraphItem } from '@/types/lesson';
import type { Course, CompletedQuiz } from '@/types/course';
import lesson0Img from '@/assets/lessonIcons/lesson-0.svg';
import lesson1Img from '@/assets/lessonIcons/lesson-1.svg';
import lesson2Img from '@/assets/lessonIcons/lesson-2.svg';

interface DashboardSection {
  id: string;
  title: string;
  order: number;
  courses: number[];
}

interface DashboardConfig {
  sections: DashboardSection[];
  courses: Course[];
}

interface UseDashboardDataOptions {
  currentLesson: number | null;
}

export interface UseDashboardDataReturn {
  contentError: unknown;
  userEmail: string | null;
  userName: string;
  userPicture: string;
  isLoadingProgress: boolean;
  completedQuizzes: CompletedQuiz[];
  hasViewedFirstLesson: boolean;
  setHasViewedFirstLesson: React.Dispatch<React.SetStateAction<boolean>>;
  activeCourses: Course[];
  activeSections: DashboardSection[];
  currentQuiz: Question[];
  currentLessonContent: LessonContent | undefined;
  fetchUserProgress: () => Promise<void>;
  saveFirstLessonView: () => Promise<void>;
  getCourseProgress: (courseId: number) => number;
  isCourseUnlocked: (courseId: number) => boolean;
  isTopicUnlocked: (topicId: number) => boolean;
}

/**
 * Manages all API data fetching (user progress, lesson content, dashboard config)
 * and derived progress computations (course unlock, topic unlock, progress %).
 */
export function useDashboardData({ currentLesson }: UseDashboardDataOptions): UseDashboardDataReturn {
  const [contentError, setContentError] = useState<unknown>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]);
  const [, setUnlocked] = useState<number[]>([]);
  const [hasViewedFirstLesson, setHasViewedFirstLesson] = useState(false);

  // API lesson data for current lesson
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
      .catch((err) => { setContentError(err); });
    return () => { cancelled = true; };
  }, [currentLesson]);

  // Dashboard config (sections/courses from API)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/dashboard-config')
      .then(res => res.data)
      .then(data => {
        if (cancelled || !data) return;
        const imageMap: Record<string, string> = { 'lesson-0': lesson0Img, 'lesson-1': lesson1Img, 'lesson-2': lesson2Img };
        const mappedCourses = (data.courses || []).map((c: Course) => ({
          ...c,
          image: imageMap[c.image] || lesson0Img,
        }));
        setDashboardConfig({ sections: data.sections || [], courses: mappedCourses });
      })
      .catch((err) => { setContentError(err); });
    return () => { cancelled = true; };
  }, []);

  const activeCourses: Course[] = dashboardConfig?.courses ?? [];
  const activeSections: DashboardSection[] = dashboardConfig?.sections ?? [];

  // Fetch user progress
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

  const saveFirstLessonView = useCallback(async () => {
    try {
      await api.post('/save_first_lesson_view');
      console.log("First lesson view saved successfully");
    } catch (error) {
      console.error('Failed to save first lesson view:', error);
    }
  }, []);

  // Fetch progress on mount
  useEffect(() => {
    void fetchUserProgress();
  }, [fetchUserProgress]);

  // Progress computations
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
  }, [completedQuizzes, activeCourses]);

  const isCourseUnlocked = useCallback((courseId: number): boolean => {
    if (courseId === 0) return true;
    const previousCourse = activeCourses.find(c => c.id === courseId - 1);
    if (!previousCourse) return false;
    return getCourseProgress(courseId - 1) === 100;
  }, [getCourseProgress, activeCourses]);

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

  // Resolved quiz/lesson content from API
  const currentQuiz: Question[] = currentLesson !== null ? (apiQuiz ?? []) : [];
  const currentLessonContent: LessonContent | undefined = currentLesson !== null
    ? (apiLessonContent ?? undefined)
    : undefined;

  return {
    contentError,
    userEmail,
    userName,
    userPicture,
    isLoadingProgress,
    completedQuizzes,
    hasViewedFirstLesson,
    setHasViewedFirstLesson,
    activeCourses,
    activeSections,
    currentQuiz,
    currentLessonContent,
    fetchUserProgress,
    saveFirstLessonView,
    getCourseProgress,
    isCourseUnlocked,
    isTopicUnlocked,
  };
}
