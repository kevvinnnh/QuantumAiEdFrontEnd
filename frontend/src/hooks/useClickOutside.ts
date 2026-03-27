import { useEffect, type RefObject } from 'react';

/**
 * Call `handler` when a mousedown occurs outside all provided refs.
 * Only listens when `isActive` is true (defaults to true).
 *
 * Pass the dropdown ref AND the toggle-button ref so that clicking
 * the button to close doesn't also trigger re-opening.
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  isActive = true,
) {
  useEffect(() => {
    if (!isActive) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;

      const isInside = refs.some(
        (ref) => ref.current && ref.current.contains(target),
      );
      if (!isInside) handler();
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [refs, handler, isActive]);
}
