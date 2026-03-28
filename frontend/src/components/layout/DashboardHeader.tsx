import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { MdOutlinePerson } from 'react-icons/md';
import { styles } from '@/components/dashboard/DashboardStyles';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  view: 'dashboard' | 'course-detail' | 'lesson';
  quizOpen: boolean;
  onChatToggle: () => void;
  headerStyle: React.CSSProperties;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  view,
  quizOpen,
  onChatToggle,
  headerStyle,
}) => {
  return (
    <header
      style={headerStyle}
      className='main-panel-coordinated'
      role="banner"
    >
      <form onSubmit={onSearchSubmit} style={styles.headerSearch} role="search">
        <div style={styles.searchContainer} className="search-container">
          <FaSearch style={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search Quantaid"
            value={searchQuery}
            onChange={onSearchChange}
            style={styles.searchInput}
            className="search-input"
            aria-label="Search Quantaid"
          />
        </div>
      </form>

      <div style={styles.headerIcons}>
        {view === 'lesson' && !quizOpen && (
          <button
            className="chat-button"
            style={styles.chatButton}
            onClick={onChatToggle}
            aria-label="Toggle Chat"
          >
            <MdOutlinePerson size="1.5em" /> <span>Chat</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
