import { useState, useCallback, useEffect, useRef } from 'react';

const SIDEBAR_EXPANDED_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 70;
const COLLAPSIBLE_SIDEBAR_WIDTH = 1500;
const ANIMATION_DURATION = 200;
const ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const CHAT_DEFAULT_WIDTH = 420;

export interface UseDashboardLayoutReturn {
  sidebarCollapsed: boolean;
  isAnimating: boolean;
  currentSidebarWidth: number;
  handleSidebarToggle: () => void;
  chatOpen: boolean;
  chatWidth: number;
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleChatToggle: () => void;
  handleChatWidthChange: (width: number, isResizing?: boolean) => void;
  screenWidth: number;
  effectiveDuration: number;
  animationEasing: string;
  animationDuration: number;
  getMainPanelStyles: () => React.CSSProperties;
  getHeaderStyles: () => React.CSSProperties;
  onSidebarCollapse: (callback: () => void) => void;
}

/**
 * Manages sidebar/chat panel layout, resize coordination, and animation state.
 * Auto-collapses sidebar when chat is open on narrow screens.
 */
export function useDashboardLayout(): UseDashboardLayoutReturn {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(0);
  const [isChatResizing, setIsChatResizing] = useState(false);
  const [isWindowResizing, setIsWindowResizing] = useState(false);

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarCollapsedRef = useRef(sidebarCollapsed);
  sidebarCollapsedRef.current = sidebarCollapsed;
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const chatWidthRef = useRef(chatWidth);
  chatWidthRef.current = chatWidth;
  const windowResizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSidebarToggleRef = useRef<() => void>(() => {});

  // Callback invoked when sidebar collapses (used by modals to close dropdowns)
  const onCollapseCallbackRef = useRef<() => void>(() => {});
  const onSidebarCollapse = useCallback((callback: () => void) => {
    onCollapseCallbackRef.current = callback;
  }, []);

  const effectiveDuration = (isChatResizing || isWindowResizing) ? 0 : ANIMATION_DURATION;
  const currentSidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Coordinated sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSidebarCollapsed(prev => {
      if (!prev) onCollapseCallbackRef.current(); // collapsing -> fire callback
      return !prev;
    });

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  }, [isAnimating]);
  handleSidebarToggleRef.current = handleSidebarToggle;

  // Cleanup animation timeout
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Track screen size; auto-collapse/expand sidebar when chat is open
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      setIsWindowResizing(true);

      const shouldCollapse = newWidth < COLLAPSIBLE_SIDEBAR_WIDTH && chatOpenRef.current && chatWidthRef.current > 0;
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

  const getMainPanelStyles = useCallback((): React.CSSProperties => {
    return {
      marginLeft: currentSidebarWidth,
      maxWidth: chatOpen && chatWidth > 0
        ? `calc(100vw - ${currentSidebarWidth}px - ${chatWidth}px)`
        : `calc(100vw - ${currentSidebarWidth}px)`,
      flex: 1,
      transition: effectiveDuration > 0 ? `all ${effectiveDuration}ms ${ANIMATION_EASING}` : 'none',
    };
  }, [currentSidebarWidth, chatOpen, chatWidth, effectiveDuration]);

  const getHeaderStyles = useCallback((): React.CSSProperties => {
    return {
      marginLeft: currentSidebarWidth,
      width: `calc(100vw - ${currentSidebarWidth}px)`,
      flex: 1,
      transition: effectiveDuration > 0 ? `all ${effectiveDuration}ms ${ANIMATION_EASING} !important` : 'none !important',
    };
  }, [currentSidebarWidth, chatOpen, chatWidth, effectiveDuration]);

  const handleChatWidthChange = useCallback((width: number, isResizing?: boolean) => {
    setChatWidth(width);
    setIsChatResizing(!!isResizing);
    if (width > 0 && screenWidth < COLLAPSIBLE_SIDEBAR_WIDTH && !sidebarCollapsed) {
      handleSidebarToggle();
    }
  }, [screenWidth, sidebarCollapsed, handleSidebarToggle]);

  const handleChatToggle = useCallback(() => {
    const newChatState = !chatOpen;
    setChatOpen(newChatState);
    setChatWidth(newChatState ? CHAT_DEFAULT_WIDTH : 0);

    if (newChatState && screenWidth < COLLAPSIBLE_SIDEBAR_WIDTH && !sidebarCollapsed) {
      handleSidebarToggle();
    }

    if (!newChatState && screenWidth >= COLLAPSIBLE_SIDEBAR_WIDTH && sidebarCollapsed) {
      setTimeout(() => {
        handleSidebarToggle();
      }, 50);
    }
  }, [chatOpen, screenWidth, sidebarCollapsed, handleSidebarToggle]);

  return {
    sidebarCollapsed,
    isAnimating,
    currentSidebarWidth,
    handleSidebarToggle,
    chatOpen,
    chatWidth,
    setChatOpen,
    handleChatToggle,
    handleChatWidthChange,
    screenWidth,
    effectiveDuration,
    animationEasing: ANIMATION_EASING,
    animationDuration: ANIMATION_DURATION,
    getMainPanelStyles,
    getHeaderStyles,
    onSidebarCollapse,
  };
}
