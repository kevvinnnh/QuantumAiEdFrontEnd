// src/components/Sidebar.tsx

import React from 'react';
import { HiUserCircle } from "react-icons/hi2";
import { MdKeyboardArrowUp, MdOutlineSettings, MdHelpOutline, MdOutlineThumbsUpDown } from "react-icons/md";
import { PiSignOutBold } from "react-icons/pi";
import { TfiBookmarkAlt } from "react-icons/tfi";
import QuantaidLogoQ from '../assets/quantaid-logo-q.svg';
import QuantaidLogoUantaid from '../assets/quantaid-logo-uantaid.svg';

const colors = {
  dark: '#010117',
  accent: '#071746',
  primary: '#3B89FF',
  light: '#f8f9fa',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.1)',
};

interface SidebarProps {
  currentView: 'dashboard' | 'course-detail' | 'lesson';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigateToDashboard: () => void;
  onCollapsedProfileClick: () => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  profileDropdownRef: React.RefObject<HTMLDivElement>;
  profileButtonRef: React.RefObject<HTMLButtonElement>;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onSignOutClick: () => void;
  onLeaveFeedbackClick: () => void;
  chatWidth: number;
  screenWidth: number;
  animationDuration: number;
  animationEasing: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isCollapsed,
  onToggleCollapse,
  onNavigateToDashboard,
  onCollapsedProfileClick,
  showProfileDropdown,
  setShowProfileDropdown,
  profileDropdownRef,
  profileButtonRef,
  onProfileClick,
  onSettingsClick,
  onHelpClick,
  onSignOutClick,
  onLeaveFeedbackClick,
  chatWidth,
  screenWidth,
  animationDuration,
  animationEasing
}) => {

  const handleLeaveFeedbackClick = () => {
    onLeaveFeedbackClick();
  };

  const toggleProfileDropdown = () => {
    if (isCollapsed) {
      onCollapsedProfileClick();
    } else {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  const isLessonsActive = currentView === 'dashboard' || currentView === 'course-detail' || currentView === 'lesson';

  const SIDEBAR_EXPANDED_WIDTH = 250;
  const SIDEBAR_COLLAPSED_WIDTH = 70;
  const currentWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  const getSidebarStyles = () => ({
    ...styles.sidebar,
    width: currentWidth,
    transition: `width ${animationDuration}ms ${animationEasing}`,
  });

  const getLogoContainerStyles = () => ({
    ...styles.logoContainer,
    margin: isCollapsed ? '0 auto' : '0 20px',
    marginLeft: isCollapsed ? '15px' : '3rem',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getLogoQStyles = () => ({
    ...styles.logoQ,
    width: '40px',
    height: '40px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getLogoUantaidStyles = () => ({
    ...styles.logoUantaid,
    width: isCollapsed ? '0px' : '100px',
    height: '38px',
    opacity: isCollapsed ? 0 : 1,
    transition: `all ${animationDuration}ms ${animationEasing}`,
    overflow: 'hidden',
    marginLeft: isCollapsed ? '0px' : '0px',
  });

  const getNavStyles = () => ({
    ...styles.nav,
    padding: isCollapsed ? '0 10px' : '0 20px',
    transition: `padding ${animationDuration}ms ${animationEasing}`,
  });

  const getNavButtonStyles = () => ({
    ...styles.navButton,
    ...(isLessonsActive ? styles.navButtonActive : {}),
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    padding: isCollapsed ? '12px' : '12px 16px',
    gap: isCollapsed ? '0px' : '12px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getSidebarBottomStyles = () => ({
    ...styles.sidebarBottom,
    padding: isCollapsed ? '0 10px 20px 10px' : '0 20px 20px 20px',
    transition: `padding ${animationDuration}ms ${animationEasing}`,
  });

  const getProfileButtonStyles = () => ({
    ...styles.profileButton,
    backgroundColor: showProfileDropdown ? '#032242' : 'transparent',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    padding: isCollapsed ? '12px' : '8px 10px',
    gap: isCollapsed ? '0px' : '10px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getFeedbackButtonStyles = () => ({
    ...styles.sidebarFeedbackButton,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    padding: isCollapsed ? '12px' : '12px 16px',
    gap: isCollapsed ? '0px' : '8px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getTextOpacity = () => {
    return isCollapsed ? 0 : 1;
  };

  const getTextStyles = (baseStyles: React.CSSProperties) => ({
    ...baseStyles,
    opacity: getTextOpacity(),
    width: isCollapsed ? '0px' : 'auto',
    transition: `opacity ${animationDuration * 0.6}ms ${animationEasing}`,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'clip' as const,
    minWidth: 0,
  });

  return (
    <aside 
      style={getSidebarStyles()}
      className="sidebar-coordinated"
    >
      <div>
        {/* Q & uantaid Logo SVGs */}
        <div 
          style={getLogoContainerStyles()}
          aria-label="Quantaid Logo"
        >
          <div 
            style={getLogoQStyles()}
          />
          <div 
            style={getLogoUantaidStyles()}
          />
        </div>
        
        <nav style={getNavStyles()}>
          <button
            style={getNavButtonStyles()}
            onClick={onNavigateToDashboard}
            className={`nav-button ${isLessonsActive ? 'nav-button-active' : ''}`}
            title={isCollapsed ? "Lessons" : undefined}
          >
            <TfiBookmarkAlt 
              size={22}
              color={isLessonsActive ? colors.white : '#9D9D9D'}
              style={{
                flexShrink: 0,
                margin: isCollapsed ? '0 0 0 2px' : '0 0 0 0',
                transition: `margin ${animationDuration}ms ${animationEasing}`,
              }}
            />
            <span style={getTextStyles(styles.navButtonText)}>
              Lessons
            </span>
          </button>
        </nav>
      </div>
      
      <div style={getSidebarBottomStyles()}>
        <button
          ref={profileButtonRef}
          onClick={toggleProfileDropdown}
          style={getProfileButtonStyles()}
          className="profile-button"
          title={isCollapsed ? "Profile" : undefined}
        >
          <HiUserCircle
            size={22}
            color="#9D9D9D"
            style={{
              flexShrink: 0,
              margin: isCollapsed ? '0 0 0 1px' : '0 0 0 0',
              transition: `margin ${animationDuration}ms ${animationEasing}`,
            }}
          />
          <>
            <span style={getTextStyles(styles.profileButtonText)}>Profile name</span>
            <MdKeyboardArrowUp 
              size={20} 
              color="#9D9D9D" 
              style={{
                transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: `transform ${animationDuration * 0.5}ms ease`,
                flexShrink: 0,
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? '0px' : '20px',
              }}
            />
          </>
        </button>
        
        <button
          onClick={handleLeaveFeedbackClick}
          style={getFeedbackButtonStyles()}
          className="feedback-button"
          title={isCollapsed ? "Leave feedback" : undefined}
        >
          <MdOutlineThumbsUpDown 
            size={19}
            color="#9D9D9D"
            style={{
              flexShrink: 0,
              margin: isCollapsed ? '0 0 0 4px' : '0 2px 0 -2px',
              transition: `margin ${animationDuration}ms ${animationEasing}`
            }}
          />
          <span style={getTextStyles(styles.sidebarFeedbackText)}>
            Leave feedback
          </span>
        </button>
      </div>

      {showProfileDropdown && !isCollapsed && (
        <div
          ref={profileDropdownRef}
          style={{
            ...styles.profileDropdown,
            animation: 'fadeInUp 200ms ease-out',
          }}
        >
          <button 
            onClick={onProfileClick}
            style={styles.profileDropdownItem}
            className="profile-dropdown-item"
          >
            <HiUserCircle 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span style={getTextStyles(styles.emailText)}>
              email@gmail.com
            </span>
          </button>
          
          <div style={styles.profileDropdownDivider} />
          
          <button 
            onClick={onSettingsClick}
            style={styles.profileDropdownItem}
            className="profile-dropdown-item"
          >
            <MdOutlineSettings 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span style={getTextStyles(styles.profileDropdownItemText)}>
              Settings
            </span>
          </button>
          
          <button 
            onClick={onHelpClick}
            style={styles.profileDropdownItem}
            className="profile-dropdown-item"
          >
            <MdHelpOutline 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span style={getTextStyles(styles.profileDropdownItemText)}>
              Help
            </span>
          </button>
          
          <button 
            onClick={onSignOutClick}
            style={styles.profileDropdownItem}
            className="profile-dropdown-item"
          >
            <PiSignOutBold 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span style={getTextStyles(styles.profileDropdownItemText)}>
              Sign out
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    borderRight: `1px solid ${colors.border}`,
    flexShrink: 0,
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '38px',
    minWidth: '40px',
    padding: '12px 0',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  logoQ: {
    backgroundImage: `url(${QuantaidLogoQ})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    flexShrink: 0,
    display: 'block',
  },
  logoUantaid: {
    backgroundImage: `url(${QuantaidLogoUantaid})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'auto 100%',
    backgroundPosition: 'left center',
    flexShrink: 0,
    display: 'block',
  },
  nav: {
    marginTop: 40,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#030E29',
    borderLeft: 'none',
    border: 'none',
    color: '#9D9D9D',
    fontSize: '18px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '8px',
    width: '100%',
    marginBottom: '4px',
    overflow: 'hidden',
  },
  navButtonText: {
    fontSize: '18px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: 'inherit',
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
  },
  navButtonActive: {
    backgroundColor: '#032242',
    color: colors.white,
  },
  sidebarBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  profileButtonText: {
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
  },
  sidebarFeedbackButton: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    backgroundColor: 'transparent',
    border: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    overflow: 'hidden',
  },
  sidebarFeedbackText: {
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    lineHeight: 1,
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
  },
  profileDropdown: {
    position: 'absolute',
    bottom: '135px',
    left: '20px',
    right: '20px',
    backgroundColor: '#032242',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    padding: '8px 4px',
    zIndex: 1000,
    overflow: 'hidden',
  },
  emailText: {
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
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
    marginBottom: '4px',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease',
    overflow: 'hidden',
  },
  profileDropdownItemText: {
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#9D9D9D',
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
  },
};

// Add CSS animations for profile dropdown
const addSidebarAnimations = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .sidebar-coordinated {
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    /* Enhanced text animation handling */
    .sidebar-coordinated .nav-button span,
    .sidebar-coordinated .profile-button span,
    .sidebar-coordinated .feedback-button span,
    .sidebar-coordinated .profile-dropdown-item span {
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: clip !important;
      min-width: 0 !important;
      transition: opacity 180ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* Ensure icons don't shrink during animations */
    .sidebar-coordinated svg {
      flex-shrink: 0 !important;
      min-width: auto !important;
    }

    /* Smooth button layouts during animations */
    .sidebar-coordinated button {
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      overflow: hidden !important;
    }

    /* Profile dropdown text handling */
    .sidebar-coordinated .profile-dropdown-item {
      overflow: hidden !important;
    }

    .sidebar-coordinated .profile-dropdown-item span {
      opacity: 1 !important; /* Dropdown text should always be visible when dropdown is open */
    }
    
    /* Enhanced logo animation - ensure smooth transitions */
    .sidebar-coordinated [aria-label="Quantaid Logo"] {
      overflow: hidden !important;
    }

    .sidebar-coordinated [aria-label="Quantaid Logo"] > div {
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addSidebarAnimations();
}

export default Sidebar;