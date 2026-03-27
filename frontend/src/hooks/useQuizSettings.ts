import { useState, useEffect, useRef } from 'react';
import { useClickOutside } from './useClickOutside';

export interface UseQuizSettingsReturn {
  soundEnabled: boolean;
  showAnswersEnabled: boolean;
  timeModeEnabled: boolean;
  setTimeModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  showSettingsDropdown: boolean;
  dropdownPosition: { x: number; y: number };
  settingsDropdownRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  toggleSettingsDropdown: (event: React.MouseEvent) => void;
  handleSettingToggle: (type: 'sound' | 'answers' | 'time', currentValue: boolean) => void;
  playSound: (type: 'correct' | 'incorrect' | 'click' | 'timeUp', forcePlay?: boolean) => void;
}

/**
 * Manages quiz settings (sound, show answers, time mode),
 * settings dropdown positioning, and synthesized sound effects.
 */
export function useQuizSettings(): UseQuizSettingsReturn {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAnswersEnabled, setShowAnswersEnabled] = useState(true);
  const [timeModeEnabled, setTimeModeEnabled] = useState(true);

  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(
    [settingsDropdownRef, settingsButtonRef],
    () => setShowSettingsDropdown(false),
    showSettingsDropdown,
  );

  const playSound = (type: 'correct' | 'incorrect' | 'click' | 'timeUp', forcePlay = false) => {
    if (!soundEnabled && !forcePlay) return;

    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'incorrect':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.015);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.035);
        gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
        break;
      case 'timeUp':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  };

  // Dropdown position recalculation on resize
  useEffect(() => {
    const handleResize = () => {
      if (showSettingsDropdown && settingsButtonRef.current) {
        const rect = settingsButtonRef.current.getBoundingClientRect();
        setDropdownPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
      }
    };

    if (showSettingsDropdown) {
      window.addEventListener('resize', handleResize);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [showSettingsDropdown]);

  const calculateDropdownPosition = () => {
    if (settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.bottom + 8 };
    }
    return { x: 0, y: 0 };
  };

  const toggleSettingsDropdown = (_event: React.MouseEvent) => {
    if (!showSettingsDropdown) {
      setDropdownPosition(calculateDropdownPosition());
    }
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleSettingToggle = (type: 'sound' | 'answers' | 'time', currentValue: boolean) => {
    const newValue = !currentValue;
    switch (type) {
      case 'sound':
        setSoundEnabled(newValue);
        if (newValue) playSound('click', true);
        break;
      case 'answers':
        setShowAnswersEnabled(newValue);
        playSound('click');
        break;
      case 'time':
        setTimeModeEnabled(newValue);
        playSound('click');
        break;
    }
  };

  return {
    soundEnabled,
    showAnswersEnabled,
    timeModeEnabled,
    setTimeModeEnabled,
    showSettingsDropdown,
    dropdownPosition,
    settingsDropdownRef,
    settingsButtonRef,
    toggleSettingsDropdown,
    handleSettingToggle,
    playSound,
  };
}
