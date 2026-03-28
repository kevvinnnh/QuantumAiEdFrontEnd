import { useEffect, useRef } from 'react';

const FLIP_DURATION = 120;
const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

interface UseCardFlipAnimationOptions {
  containerRef: React.RefObject<HTMLElement | null>;
}

interface UseCardFlipAnimationReturn {
  cardRef: (courseId: number, el: HTMLElement | null) => void;
}

/**
 * FLIP animation for course cards — uses Web Animations API for
 * interruptible, smooth card reflow when the container resizes.
 */
export function useCardFlipAnimation({
  containerRef,
}: UseCardFlipAnimationOptions): UseCardFlipAnimationReturn {
  const cardElRefs = useRef<Map<number, HTMLElement>>(new Map());
  const cardAnimationsRef = useRef<Map<number, Animation>>(new Map());
  const prevPositionsRef = useRef<Map<number, DOMRect>>(new Map());

  const runFlipRef = useRef<() => void>(() => {});
  runFlipRef.current = () => {
    if (cardElRefs.current.size === 0) return;

    // 1. Snapshot previous positions (from last call) before we overwrite them
    const oldPositions = new Map(prevPositionsRef.current);

    // 2. Capture where each card VISUALLY is right now (includes in-flight animation transforms)
    const visualRects = new Map<number, DOMRect>();
    cardElRefs.current.forEach((el, id) => {
      visualRects.set(id, el.getBoundingClientRect());
    });

    // 3. Cancel all in-flight WAAPI animations (synchronous, no paint yet)
    cardAnimationsRef.current.forEach((anim) => anim.cancel());
    cardAnimationsRef.current.clear();

    // 4. Force reflow — elements are now at clean layout positions
    void document.body.offsetHeight;

    // 5. For each card, compute where to animate FROM
    cardElRefs.current.forEach((el, id) => {
      const layoutRect = el.getBoundingClientRect();

      // Always update previous positions to current layout for the next call
      prevPositionsRef.current.set(id, layoutRect);

      const visualRect = visualRects.get(id);
      if (!visualRect) return;

      // If an animation was in-flight, the visual rect differs from layout rect
      let fromDx = visualRect.left - layoutRect.left;
      let fromDy = visualRect.top - layoutRect.top;

      // If no animation was running, use previous positions (one resize-step behind)
      if (Math.abs(fromDx) < 1 && Math.abs(fromDy) < 1) {
        const prevRect = oldPositions.get(id);
        if (prevRect) {
          fromDx = prevRect.left - layoutRect.left;
          fromDy = prevRect.top - layoutRect.top;
        }
      }

      // No significant movement — skip
      if (Math.abs(fromDx) < 1 && Math.abs(fromDy) < 1) return;

      // 6. Animate from visual/previous position to layout position
      const anim = el.animate(
        [
          { transform: `translate(${fromDx}px, ${fromDy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: FLIP_DURATION, easing: FLIP_EASING, fill: 'none' }
      );

      cardAnimationsRef.current.set(id, anim);
      anim.onfinish = () => {
        cardAnimationsRef.current.delete(id);
      };
    });
  };

  // Set up ResizeObserver once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      runFlipRef.current();
    });
    observer.observe(container);

    // Initialize previous positions
    cardElRefs.current.forEach((el, id) => {
      prevPositionsRef.current.set(id, el.getBoundingClientRect());
    });

    return () => {
      observer.disconnect();
      cardAnimationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [containerRef]);

  const cardRef = (courseId: number, el: HTMLElement | null) => {
    if (el) cardElRefs.current.set(courseId, el);
    else cardElRefs.current.delete(courseId);
  };

  return { cardRef };
}
