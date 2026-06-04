import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 72; // px of pull required to trigger

/**
 * Attaches a pull-to-refresh gesture to the provided scrollable ref.
 * Calls `onRefresh` when the threshold is met.
 */
export function usePullToRefresh(onRefresh) {
  const startY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const el = document.querySelector('main') || document.documentElement;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && el.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(delta, THRESHOLD * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
      startY.current = null;
      setPullDistance(0);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, pullDistance, refreshing]);

  return { pullDistance, refreshing };
}