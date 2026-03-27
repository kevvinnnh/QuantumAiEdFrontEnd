import React from 'react';

export const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    position: 'relative',
    background: '#030E29',
    color: '#FFFFFF',
    overflow: 'hidden',
    margin: '0 auto',
    minHeight: '100vh',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '70%',
    maxWidth: '1350px',
    zIndex: 10,
    marginTop: '3rem',
    marginBottom: '4rem',
  },
  backArrowSpace: {
    height: '24px',
    width: '24px',
  },
  backArrow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    zIndex: 10,
  },
  progressBar: {
    width: '90%',
    height: 10,
    backgroundColor: '#424E62',
    borderRadius: 6,
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    marginLeft: '2.5rem',
    marginRight: '2.5rem',
  },
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    zIndex: 10,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#182549',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '440px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    color: '#FEFEFE',
    margin: '0 0 16px 0',
    lineHeight: '1.3',
    flex: 1,
    textAlign: 'center',
  },
  closeModalButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: -28,
    top: -28,
  },
  modalSubtext: {
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    margin: '0 0 32px 0',
    lineHeight: '1.5',
  },
  modalButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  goBackButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
  skipAnywayButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#3D4C65',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
  quizPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '60px 40px 40px',
    boxSizing: 'border-box',
    width: '62%',
    maxWidth: '1195px',
    margin: '0 auto',
  },
  formQuestion: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '34px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '.02em',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: '1195px',
    width: '100%',
    margin: '0 auto 0 auto',
  },
  formSubtitle: {
    fontSize: '1.2rem',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    marginTop: '-0.1rem',
  },
  formContent: {
    marginTop: '3rem',
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '1.5rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    minWidth: '400px',
    fontSize: '18px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  checkbox: {
    appearance: 'none',
    width: '20px',
    height: '20px',
    border: '2px solid #AAAAC1',
    borderRadius: '2px',
    backgroundColor: 'transparent',
    marginLeft: '-0.6rem',
    marginRight: '16px',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  checkItemExpanded: {
    minHeight: '60px',
    alignItems: 'flex-start',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  inlineOtherInput: {
    padding: '8px 0',
    fontSize: '16px',
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #424E62',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  radioGroup: {
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '600px',
  },
  radioGroupLabel: {
    fontSize: '1.3rem',
    marginBottom: '1rem',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    fontWeight: '600',
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    marginBottom: '16px',
    minWidth: '400px',
    fontSize: '18px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  radio: {
    appearance: 'none',
    width: '20px',
    height: '20px',
    border: '2px solid #AAAAC1',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    marginTop: '-0px',
    marginLeft: '-0.6rem',
    marginRight: '16px',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  radioItemExpanded: {
    minHeight: '60px',
    alignItems: 'flex-start',
    paddingTop: '16px',
    paddingBottom: '16px',
    minWidth: '300px',
  },
  hobbiesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    maxWidth: '700px',
    marginBottom: '2rem',
  },
  hobbyButton: {
    border: '2px solid #424E62',
    padding: '14px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    textAlign: 'center',
    minWidth: '120px',
  },
  customHobbiesSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    gap: '8px',
  },
  customHobbiesInput: {
    width: '100%',
    padding: '14px 0',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    borderBottom: '2px solid #424E62',
    outline: 'none',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    zIndex: 10,
    borderTop: '1px solid rgba(66, 78, 98, 0.3)',
    marginTop: 'auto',
    transition: 'background-color 0.15s ease',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '65%',
    maxWidth: '1350px',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    height: '60px',
  },
  skipButton: {
    padding: '12px 42px',
    fontSize: '22px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#AAABAF',
    backgroundColor: 'transparent',
    border: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px',
  },
  continueButton: {
    padding: '12px 42px',
    fontSize: '22px',
    fontWeight: '500',
    fontFamily: "'Sarabun', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#142748',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px',
  },
  educationContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    width: '100%',
    maxWidth: '800px',
    alignItems: 'flex-start',
  },
  educationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    alignItems: 'flex-start',
  },
  radioRowGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12px',
    width: '100%',
  },
  radioItemCompact: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    backgroundColor: 'transparent',
    border: '2px solid #424E62',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
  },
  otherInputContainer: {
    marginTop: '16px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  otherLabel: {
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif",
    color: '#AAAAC1',
    marginLeft: '4px',
  },
  otherInput: {
    padding: '12px 0',
    fontSize: '16px',
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #424E62',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  hobbiesMainContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '700px',
    marginBottom: '2rem',
  },
  videoOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  skipVideoButton: {
    marginTop: '20px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    color: '#FFFFFF',
    backgroundColor: '#3D4C65',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
};

export const addProfileCreationHoverStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    button:focus-visible {
      outline: 3px solid #A4C5FF !important;
      outline-offset: 2px !important;
    }

    input:focus-visible {
      outline: 3px solid #A4C5FF !important;
      outline-offset: 2px !important;
    }

    .profile-bottom-buttons:hover:not(:disabled) {
      opacity: 0.9 !important;
      transition: opacity 0.2s ease;
    }

    .hobby-button:hover:not(:disabled) {
      opacity: 0.9 !important;
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    label:has(input[type="checkbox"]):hover,
    label:has(input[type="radio"]):hover {
      border-color: #1E4277 !important;
      transition: all 0.2s ease;
    }

    label:has(input[type="checkbox"]:checked):hover,
    label:has(input[type="radio"]:checked):hover {
      background-color: #10204D !important;
      border-color: #1E4277 !important;
    }

    input[type="checkbox"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }

    input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 1px;
      width: 4px;
      height: 10px;
      border: solid #0F1F4C;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    input[type="checkbox"]:hover {
      border-color: #3B89FF !important;
    }

    input[type="radio"]:hover {
      border-color: #3B89FF !important;
    }

    input[type="radio"]:checked {
      background-color: #3B89FF !important;
      border-color: #3B89FF !important;
    }

    input[type="radio"]:checked::after {
      content: '';
      position: absolute;
      left: 0px;
      top: 0px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #3B89FF;
      border: 2px solid #131C46;
    }

    input[type="text"]:focus {
      border-bottom-color: #7BA8ED !important;
      background-color: rgba(37, 52, 98, 0.15) !important;
      padding-left: 4px !important;
      padding-right: 4px !important;
    }

    input[type="text"]::placeholder {
      color: #666 !important;
      font-style: italic;
    }

    input[type="text"]:hover {
      border-bottom-color: #7BA8ED !important;
    }

    .inline-other-input:focus {
      background-color: rgba(37, 52, 98, 0.1) !important;
    }

    input[style*="border-bottom: 2px solid #424E62"]:focus {
      border-bottom-color: #7BA8ED !important;
      background-color: rgba(37, 52, 98, 0.15) !important;
      padding-left: 4px !important;
      padding-right: 4px !important;
    }

    input[style*="border-bottom: 2px solid #424E62"]:hover {
      border-bottom-color: #7BA8ED !important;
    }

    input[style*="border-bottom: 2px solid #424E62"]::placeholder {
      color: #666 !important;
      font-style: italic;
    }

    .back-button:hover {
      background-color: #10204D !important;
      border-color: #1D4177 !important;
      transition: all 0.2s ease;
    }

    button.skip-button:hover:not(:disabled) {
      background-color: #404A5F !important;
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  addProfileCreationHoverStyles();
}
