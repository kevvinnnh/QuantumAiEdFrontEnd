// src/components/Sidebar/Sidebar.tsx

import React from 'react';
import { HiUserCircle } from "react-icons/hi2";
import { MdKeyboardArrowUp, MdOutlineSettings, MdHelpOutline, MdOutlineThumbsUpDown } from "react-icons/md";
import { PiSignOutBold } from "react-icons/pi";
import { TfiBookmarkAlt } from "react-icons/tfi";
import QuantaidLogoQ from '../../assets/quantaid-logo-q.svg';
import QuantaidLogoUantaid from '../../assets/quantaid-logo-uantaid.svg';
import styles from './Sidebar.module.scss';

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
    width: currentWidth,
    transition: `width ${animationDuration}ms ${animationEasing}`,
  });

  const getLogoContainerStyles = () => ({
    margin: isCollapsed ? '0 auto' : '0 20px',
    marginLeft: isCollapsed ? '15px' : '3rem',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getLogoQStyles = () => ({
    backgroundImage: `url(${QuantaidLogoQ})`,
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getLogoUantaidStyles = () => ({
    backgroundImage: `url(${QuantaidLogoUantaid})`,
    width: isCollapsed ? '0px' : '100px',
    opacity: isCollapsed ? 0 : 1,
    transition: `all ${animationDuration}ms ${animationEasing}`,
    marginLeft: isCollapsed ? '0px' : '0px',
  });

  const getNavStyles = () => ({
    padding: isCollapsed ? '0 10px' : '0 20px',
    transition: `padding ${animationDuration}ms ${animationEasing}`,
  });

  const getNavButtonStyles = () => ({
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    padding: isCollapsed ? '12px' : '12px 16px',
    gap: isCollapsed ? '0px' : '12px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getSidebarBottomStyles = () => ({
    padding: isCollapsed ? '0 10px 20px 10px' : '0 20px 20px 20px',
    transition: `padding ${animationDuration}ms ${animationEasing}`,
  });

  const getProfileButtonStyles = () => ({
    justifyContent: isCollapsed ? 'center' : 'space-between',
    padding: isCollapsed ? '12px' : '8px 10px',
    gap: isCollapsed ? '0px' : '10px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getFeedbackButtonStyles = () => ({
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    padding: isCollapsed ? '12px' : '12px 16px',
    gap: isCollapsed ? '0px' : '8px',
    transition: `all ${animationDuration}ms ${animationEasing}`,
  });

  const getTextOpacity = () => {
    return isCollapsed ? 0 : 1;
  };

  const getTextStyles = () => ({
    opacity: getTextOpacity(),
    width: isCollapsed ? '0px' : 'auto',
    transition: `opacity ${animationDuration * 0.6}ms ${animationEasing}`,
  });

  return (
    <aside 
      className={`${styles.sidebar} sidebar-coordinated`}
      style={getSidebarStyles()}
    >
      <div>
        {/* Q & uantaid Logo SVGs */}
        <div 
          className={styles.logoContainer}
          style={getLogoContainerStyles()}
          aria-label="Quantaid Logo"
        >
          <div 
            className={styles.logoQ}
            style={getLogoQStyles()}
          />
          <div 
            className={styles.logoUantaid}
            style={getLogoUantaidStyles()}
          />
        </div>
        
        <nav className={styles.nav} style={getNavStyles()}>
          <button
            className={`${styles.navButton} nav-button ${isLessonsActive ? `${styles.active} nav-button-active` : ''}`}
            style={getNavButtonStyles()}
            onClick={onNavigateToDashboard}
            title={isCollapsed ? "Lessons" : undefined}
          >
            <TfiBookmarkAlt 
              size={22}
              color={isLessonsActive ? '#FFFFFF' : '#9D9D9D'}
              style={{
                flexShrink: 0,
                margin: isCollapsed ? '0 0 0 2px' : '0 0 0 0',
                transition: `margin ${animationDuration}ms ${animationEasing}`,
              }}
            />
            <span className={styles.navButtonText} style={getTextStyles()}>
              Lessons
            </span>
          </button>
        </nav>
      </div>
      
      <div className={styles.sidebarBottom} style={getSidebarBottomStyles()}>
        <button
          ref={profileButtonRef}
          onClick={toggleProfileDropdown}
          className={`${styles.profileButton} profile-button ${showProfileDropdown ? styles.active : ''}`}
          style={getProfileButtonStyles()}
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
            <span className={styles.profileButtonText} style={getTextStyles()}>Profile name</span>
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
          className={`${styles.sidebarFeedbackButton} feedback-button`}
          style={getFeedbackButtonStyles()}
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
          <span className={styles.sidebarFeedbackText} style={getTextStyles()}>
            Leave feedback
          </span>
        </button>
      </div>

      {showProfileDropdown && !isCollapsed && (
        <div
          ref={profileDropdownRef}
          className={styles.profileDropdown}
        >
          <button 
            onClick={onProfileClick}
            className={`${styles.profileDropdownItem} profile-dropdown-item`}
          >
            <HiUserCircle 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span className={styles.emailText}>
              email@gmail.com
            </span>
          </button>
          
          <div className={styles.profileDropdownDivider} />
          
          <button 
            onClick={onSettingsClick}
            className={`${styles.profileDropdownItem} profile-dropdown-item`}
          >
            <MdOutlineSettings 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span className={styles.profileDropdownItemText}>
              Settings
            </span>
          </button>
          
          <button 
            onClick={onHelpClick}
            className={`${styles.profileDropdownItem} profile-dropdown-item`}
          >
            <MdHelpOutline 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span className={styles.profileDropdownItemText}>
              Help
            </span>
          </button>
          
          <button 
            onClick={onSignOutClick}
            className={`${styles.profileDropdownItem} profile-dropdown-item`}
          >
            <PiSignOutBold 
              size={21} 
              color="#9D9D9D" 
              style={{ flexShrink: 0 }}
            />
            <span className={styles.profileDropdownItemText}>
              Sign out
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;