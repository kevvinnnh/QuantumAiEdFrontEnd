// src/components/TutorialPopup.tsx

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import AnalogyImg from '../assets/analogy-tutorial.svg';
import ExplainImg from '../assets/explain-tutorial.svg';

interface TutorialPopupProps {
	step: 1 | 2 | 3;
	anchorElement?: HTMLElement | null;
	onNext?: () => void;
	onBack?: () => void;
	onClose?: () => void;
}

const tutorialSteps = [
	{
		title: 'Need more clarity?',
		description: "Highlight any text and select 'Explain' to explore it further.",
		buttonLabel: 'Next',
		showBack: false,
		showNext: true,
		image: ExplainImg,
	},
	{
		title: 'Need more clarity?',
		description: "Select 'Explain' on terms and short phrases for precise definitions.",
		buttonLabel: 'Next',
		showBack: true,
		showNext: true,
		image: ExplainImg,
	},
	{
		title: 'Want a relatable example?',
		description: "Use 'View Analogy' to see complex ideas in a new light.",
		buttonLabel: 'Got it',
		showBack: true,
		showNext: false,
		image: AnalogyImg,
	},
];

const TutorialPopup: React.FC<TutorialPopupProps> = ({
	step,
	anchorElement,
	onNext,
	onBack,
	onClose,
}) => {
	const [position, setPosition] = useState({ top: 0, left: 0, visible: false });
	const popupRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number>();

	// Calculate position relative to anchor element
	const updatePosition = React.useCallback(() => {
		if (!anchorElement) {
			setPosition(prev => ({ ...prev, visible: false }));
			return;
		}

		const rect = anchorElement.getBoundingClientRect();
		const popupWidth = 300;
		const popupHeight = 300; // Approximate height
		const offset = 20;

		// Check if anchor is visible in viewport
		const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
		
		if (!isVisible) {
			setPosition(prev => ({ ...prev, visible: false }));
			return;
		}

		// Calculate position - try to place to the left of the anchor
		let left = rect.left - popupWidth - offset;
		let top = rect.top + offset;

		// Adjust if popup would go off-screen
		if (left < 0) {
			left = rect.right + offset; // Place to the right instead
		}
		if (left + popupWidth > window.innerWidth) {
			left = window.innerWidth - popupWidth - 20;
		}
		if (top + popupHeight > window.innerHeight) {
			top = window.innerHeight - popupHeight - 20;
		}
		if (top < 0) {
			top = 20;
		}

		setPosition({ top, left, visible: true });
	}, [anchorElement]);

	// Update position on scroll or resize
	useEffect(() => {
		const handleUpdate = () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			animationFrameRef.current = requestAnimationFrame(updatePosition);
		};

		// Initial position
		updatePosition();

		// Listen for scroll events on the scrollable container
		const scrollContainer = document.querySelector('.dashboard-content');
		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleUpdate, { passive: true });
		}

		// Listen for window resize
		window.addEventListener('resize', handleUpdate, { passive: true });
		window.addEventListener('scroll', handleUpdate, { passive: true });

		return () => {
			if (scrollContainer) {
				scrollContainer.removeEventListener('scroll', handleUpdate);
			}
			window.removeEventListener('resize', handleUpdate);
			window.removeEventListener('scroll', handleUpdate);
			
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [updatePosition]);

	const stepIndex = step - 1;
	const { title, description, buttonLabel, showBack, showNext, image } = tutorialSteps[stepIndex];

	// Create portal to render outside the scrollable content
	const portalRoot = document.body;

	if (!position.visible) {
		return null;
	}

	return createPortal(
		<div
			ref={popupRef}
			className="tutorial-popup"
			style={{
				...styles.container,
				top: position.top,
				left: position.left,
				opacity: position.visible ? 1 : 0,
				transform: position.visible ? 'scale(1)' : 'scale(0.9)',
				transition: 'opacity 0.2s ease, transform 0.2s ease',
			}}
		>
			{/* Arrow */}
			<div style={styles.arrowWrapper}>
				<div style={styles.arrowOuter} />
				<div style={styles.arrowInner} />
			</div>
			
			<div className="popup" style={styles.popup}>
				{/* Close button */}
				<button
					onClick={onClose}
					style={styles.closeButton}
					aria-label="Close"
				>
					<MdClose size={24} color="#FFFFFF" />
				</button>
				
				{/* Preload both images */}
				<img src={AnalogyImg} alt="" style={{ display: 'none' }} />
				<img src={ExplainImg} alt="" style={{ display: 'none' }} />
				
				{/* Tutorial image */}
				<div style={styles.imageContainer}>
					<img src={image} alt={title} style={styles.image} />
				</div>
				
				<div style={styles.contentContainer}>
					{/* Tutorial text */}
					<div style={styles.tutorialText}>
						<div style={styles.tutorialTitle}>{title}</div>
						<div style={styles.tutorialDescription}>{description}</div>
					</div>
					
					<div style={styles.navRow}>
						<div style={styles.buttonContainer}>
							{/* Back button */}
							<button
								onClick={onBack}
								style={{
									...styles.backButton,
									visibility: showBack ? 'visible' : 'hidden',
								}}
							>
								Back
							</button>
						</div>
						
						{/* Step indicators */}
						<div style={styles.dotsRow}>
							{[0, 1, 2].map(i => (
								<span
									key={i}
									style={{
										...styles.dot,
										background: stepIndex === i ? '#A8BAD8' : '#525D67',
									}}
								/>
							))}
						</div>
						
						<div style={styles.buttonContainer}>
							{/* Next/Got it button */}
							<button
								onClick={showNext ? onNext : onClose}
								style={{
									...styles.nextButton,
									visibility: (showNext || buttonLabel === 'Got it') ? 'visible' : 'hidden',
								}}
							>
								{buttonLabel}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>,
		portalRoot
	);
};

const styles: Record<string, React.CSSProperties> = {
	container: {
		position: 'fixed',
		width: 300,
		border: '1px solid #2F3C57',
		borderRadius: '10px',
		zIndex: 3000,
		pointerEvents: 'auto',
	},
	arrowWrapper: {
		position: 'absolute',
		top: 35,
		left: 290,
		width: 0,
		height: 0,
		pointerEvents: 'none',
	},
	arrowOuter: {
		position: 'absolute',
		top: 0,
		left: 8,
		borderLeft: '16px solid #2B3854',
		borderTop: '16px solid transparent',
		borderRight: '16px solid transparent',
		borderBottom: '12px solid transparent',
	},
	arrowInner: {
		position: 'absolute',
		top: 0,
		left: 6,
		borderLeft: '16px solid #030C34',
		borderTop: '16px solid transparent',
		borderRight: '16px solid transparent',
		borderBottom: '12px solid transparent',
	},
	popup: {
		position: 'relative',
		alignItems: 'center',
		borderRadius: '10px',
		overflow: 'hidden',
	},
	closeButton: {
		background: 'transparent',
		border: 'none',
		cursor: 'pointer',
		padding: '4px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		right: 0,
		top: 0,
		zIndex: 1,
	},
	imageContainer: {
		minHeight: 200,
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'center',
		background: '#030C34',
	},
	image: {
		width: 'calc(100% - 48px)',
		height: 128,
		minHeight: 128,
		maxHeight: 128,
		margin: '12px auto 12px auto',
		borderRadius: '8px',
		objectFit: 'contain',
		display: 'block',
	},
	contentContainer: {
		padding: '14px 14px 16px 14px',
		background: '#253655',
	},
	tutorialText: {
		marginBottom: 18,
	},
	tutorialTitle: {
		color: '#F2F2F2',
		fontFamily: "'Inter', sans-serif",
		fontWeight: 500,
		fontSize: '16px',
		marginBottom: 8,
	},
	tutorialDescription: {
		color: '#9CB0BC',
		fontFamily: "'Inter', sans-serif",
		fontSize: '14px',
	},
	navRow: {
		display: 'flex',
		position: 'relative',
		justifyContent: 'space-between',
		minHeight: 40,
	},
	buttonContainer: {
		minWidth: 60,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	backButton: {
		background: 'transparent',
		color: '#A8BAD8',
		border: '1px solid #A8BAD8',
		borderRadius: 6,
		padding: '6px 8px',
		fontFamily: "'Inter', sans-serif",
		fontWeight: 500,
		fontSize: '16px',
		cursor: 'pointer',
	},
	nextButton: {
		background: '#A8BAD8',
		color: '#030C34',
		border: 'none',
		borderRadius: 4,
		padding: '6px 8px',
		fontFamily: "'Inter', sans-serif",
		fontWeight: 500,
		fontSize: '16px',
		cursor: 'pointer',
	},
	dotsRow: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 3,
		margin: '30px 0 0 0',
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: '50%',
		background: '#525D67',
		transition: 'background 0.2s',
		display: 'inline-block',
	},
};

export default TutorialPopup;