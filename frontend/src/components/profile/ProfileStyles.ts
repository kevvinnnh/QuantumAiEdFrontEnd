import React from 'react';

export const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    position: 'relative',
    backgroundColor: '#182549',
    borderRadius: 16,
    width: 600,
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.5)',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    overflowY: 'auto',
    padding: '32px 36px',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #424E62',
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: '#10204D',
    border: '3px solid #424E62',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    color: '#AAAAC1',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
  },
  uploadLabel: {
    marginTop: 10,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #424E62',
    backgroundColor: 'transparent',
    color: '#AAAAC1',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  greeting: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    margin: '8px 0 28px',
    letterSpacing: '.02em',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    margin: '0 0 6px',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: '0 0 12px',
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: '12px 0 8px',
    letterSpacing: '0.05em',
  },
  radioRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  radioItemFull: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: 8,
  },
  radioItemExpanded: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  radio: {
    appearance: 'none' as const,
    width: 16,
    height: 16,
    border: '2px solid #AAAAC1',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    marginRight: 10,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  radioGroup: {
    marginTop: 8,
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkItemExpanded: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  checkbox: {
    appearance: 'none' as const,
    width: 16,
    height: 16,
    border: '2px solid #AAAAC1',
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginRight: 10,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  },
  inlineInput: {
    padding: '6px 0',
    fontSize: 14,
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #424E62',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  hobbyGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  hobbyBtn: {
    padding: '8px 18px',
    borderRadius: 8,
    border: '2px solid #434F62',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  customHobbiesSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  customHobbiesInput: {
    width: '100%',
    padding: '10px 0',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: 8,
    outline: 'none',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  saveSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
  saveBtn: {
    padding: '12px 40px',
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#142748',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  saveMessage: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
  tooltip: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
    cursor: 'help',
    verticalAlign: 'middle',
  },
  toggleRowFlat: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    cursor: 'pointer',
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    position: 'relative' as const,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.2s ease',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    position: 'absolute' as const,
    top: 3,
    left: 3,
    transition: 'transform 0.2s ease',
  },
  inputLabel: {
    display: 'block',
    fontSize: 13,
    color: '#AAAAC1',
    fontFamily: "'Inter', sans-serif",
    marginBottom: 4,
  },
  passwordInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#10204D',
    border: '2px solid #434F62',
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  secondaryBtn: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#10204D',
    border: '2px solid #434F62',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export const addProfileModalStyles = () => {
  const id = 'profile-modal-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    [aria-label="Profile settings"] input[type="radio"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }
    [aria-label="Profile settings"] input[type="radio"]:checked::after {
      content: '';
      position: absolute;
      left: 0px;
      top: 0px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #3B89FF;
      border: 2px solid #131C46;
    }
    [aria-label="Profile settings"] input[type="radio"]:hover {
      border-color: #3B89FF !important;
    }
    [aria-label="Profile settings"] input[type="checkbox"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }
    [aria-label="Profile settings"] input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 0px;
      width: 4px;
      height: 8px;
      border: solid #0F1F4C;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    [aria-label="Profile settings"] input[type="checkbox"]:hover {
      border-color: #3B89FF !important;
    }
    [aria-label="Profile settings"] label:has(input[type="checkbox"]):hover,
    [aria-label="Profile settings"] label:has(input[type="radio"]):hover {
      border-color: #1E4277 !important;
    }
    [aria-label="Profile settings"] input[type="text"]:focus {
      border-bottom-color: #7BA8ED !important;
    }
    [aria-label="Profile settings"] input[type="text"]::placeholder {
      color: #666 !important;
      font-style: italic;
    }
    [aria-label="Profile settings"] button:hover:not(:disabled) {
      opacity: 0.9;
    }
    [aria-label="Profile settings"] > div:last-child::-webkit-scrollbar {
      width: 6px;
    }
    [aria-label="Profile settings"] > div:last-child::-webkit-scrollbar-track {
      background: transparent;
    }
    [aria-label="Profile settings"] > div:last-child::-webkit-scrollbar-thumb {
      background: #424E62;
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addProfileModalStyles();
}
