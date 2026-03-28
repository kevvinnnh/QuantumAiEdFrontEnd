import React from 'react';
import { colors } from '@/constants/theme';

export const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#030E29',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: 'clip',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'clip',
    minWidth: 300,
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
    zIndex: 1900,
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
    overflowY: 'auto',
    overflowX: 'hidden',
    marginTop: 60,
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
    gridTemplateColumns: 'repeat(auto-fill, 300px)',
    gap: '15px',
    gridAutoRows: '360px',
    alignItems: 'start',
    width: '100%',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    transition: 'box-shadow 0.2s ease-in-out',
    border: `1px solid ${colors.border}`,
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
    height: 'calc(360px - 144px - 24px)',
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
    minHeight: '1.625rem',
    maxHeight: '3.25rem',
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
    height: '4.5rem',
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
    textAlign: 'left',
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
    userSelect: 'none',
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

export const addDashboardStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    button:focus-visible {
      outline: 3px solid #A4C5FF !important;
      outline-offset: 2px !important;
    }

    [role="button"]:focus-visible {
      outline: 3px solid #A4C5FF !important;
      outline-offset: 2px !important;
    }

    input:focus-visible {
      outline: 3px solid #A4C5FF !important;
      outline-offset: 2px !important;
    }

    .highlight-analogy-btn:hover {
      background-color: #9bb0dd !important;
      transform: translateY(-1px);
    }

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

    .breadcrumb-button:hover {
      text-decoration: underline !important;
    }

    .topic-button:hover:not(:disabled) {
      background-color: #212E44 !important;
      border: 2px solid rgba(255,255,255,0.1) !important;
      outline: none !important;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addDashboardStyles();
}
