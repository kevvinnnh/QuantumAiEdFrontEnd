import React from 'react';
import { styles } from './QuizStyles';

interface SettingOption {
  label: string;
  key: 'sound' | 'answers' | 'time';
  enabled: boolean;
}

interface QuizSettingsDropdownProps {
  dropdownRef: React.Ref<HTMLDivElement>;
  position: { x: number; y: number };
  settings: SettingOption[];
  onToggle: (key: 'sound' | 'answers' | 'time', currentValue: boolean) => void;
}

const QuizSettingsDropdown: React.FC<QuizSettingsDropdownProps> = ({
  dropdownRef,
  position,
  settings,
  onToggle,
}) => {
  return (
    <div
      ref={dropdownRef}
      style={{
        ...styles.settingsDropdown,
        position: 'fixed',
        left: position.x - 30,
        top: position.y,
        right: 'auto',
      }}
    >
      {settings.map(({ label, key, enabled }) => (
        <div
          key={key}
          style={styles.settingsOption}
          onClick={() => onToggle(key, enabled)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle(key, enabled);
            }
          }}
          aria-label={`${label} ${enabled ? 'on' : 'off'}`}
        >
          <div style={styles.optionLeft}>
            <span style={styles.optionText}>{label}</span>
          </div>
          <div style={styles.toggle}>
            <div style={{
              ...styles.toggleTrack,
              backgroundColor: enabled ? '#7BA8ED' : '#424E62'
            }}>
              <div style={{
                ...styles.toggleThumb,
                transform: enabled ? 'translateX(16px)' : 'translateX(2px)'
              }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizSettingsDropdown;
