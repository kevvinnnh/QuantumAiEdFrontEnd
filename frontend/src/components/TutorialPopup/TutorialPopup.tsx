// src/components/TutorialPopup/TutorialPopup.tsx

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import AnalogyImg from '../../assets/analogy-tutorial.svg';
import ExplainImg from '../../assets/explain-tutorial.svg';
import styles from './TutorialPopup.module.scss';

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
			className={styles.container}
			style={{
				top: position.top,
				left: position.left,
				opacity: position.visible ? 1 : 0,
				transform: position.visible ? 'scale(1)' : 'scale(0.9)',
			}}
		>
			{/* Arrow */}
			<div className={styles.arrowWrapper}>
				<div className={styles.arrowOuter} />
				<div className={styles.arrowInner} />
			</div>
			
			<div className={styles.popup}>
				{/* Close button */}
				<button
					onClick={onClose}
					className={styles.closeButton}
					aria-label="Close"
				>
					<MdClose size={24} color="#FFFFFF" />
				</button>
				
				{/* Preload both images */}
				<img src={AnalogyImg} alt="" className={styles.hiddenImage} />
				<img src={ExplainImg} alt="" className={styles.hiddenImage} />
				
				{/* Tutorial image */}
				<div className={styles.imageContainer}>
					<img src={image} alt={title} className={styles.image} />
				</div>
				
				<div className={styles.contentContainer}>
					{/* Tutorial text */}
					<div className={styles.tutorialText}>
						<div className={styles.tutorialTitle}>{title}</div>
						<div className={styles.tutorialDescription}>{description}</div>
					</div>
					
					<div className={styles.navRow}>
						<div className={styles.buttonContainer}>
							{/* Back button */}
							<button
								onClick={onBack}
								className={styles.backButton}
								style={{
									visibility: showBack ? 'visible' : 'hidden',
								}}
							>
								Back
							</button>
						</div>
						
						{/* Step indicators */}
						<div className={styles.dotsRow}>
							{[0, 1, 2].map(i => (
								<span
									key={i}
									className={`${styles.dot} ${stepIndex === i ? styles.active : ''}`}
								/>
							))}
						</div>
						
						<div className={styles.buttonContainer}>
							{/* Next/Got it button */}
							<button
								onClick={showNext ? onNext : onClose}
								className={styles.nextButton}
								style={{
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

export default TutorialPopup;