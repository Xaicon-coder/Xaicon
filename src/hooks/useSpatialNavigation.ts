import { useEffect, useCallback } from "react";

const FOCUSABLE_SELECTOR = '[data-focusable], a[href], button:not([disabled]), input:not([disabled])';

function getVisibleFocusables(): HTMLElement[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return all.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
}

function getRect(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height };
}

function findNext(current: HTMLElement, direction: 'up' | 'down' | 'left' | 'right'): HTMLElement | null {
  const focusables = getVisibleFocusables().filter(el => el !== current);
  if (focusables.length === 0) return null;

  const cur = getRect(current);
  let best: HTMLElement | null = null;
  let bestDist = Infinity;

  for (const el of focusables) {
    const r = getRect(el);
    let valid = false;
    let dist = 0;

    switch (direction) {
      case 'right':
        valid = r.x > cur.x + 5;
        dist = Math.abs(r.x - cur.x) + Math.abs(r.y - cur.y) * 3;
        break;
      case 'left':
        valid = r.x < cur.x - 5;
        dist = Math.abs(r.x - cur.x) + Math.abs(r.y - cur.y) * 3;
        break;
      case 'down':
        valid = r.y > cur.y + 5;
        dist = Math.abs(r.y - cur.y) + Math.abs(r.x - cur.x) * 3;
        break;
      case 'up':
        valid = r.y < cur.y - 5;
        dist = Math.abs(r.y - cur.y) + Math.abs(r.x - cur.x) * 3;
        break;
    }

    if (valid && dist < bestDist) {
      bestDist = dist;
      best = el;
    }
  }

  return best;
}

export function useSpatialNavigation() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't interfere with video player or input fields
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'VIDEO') return;

    let direction: 'up' | 'down' | 'left' | 'right' | null = null;

    switch (e.key) {
      case 'ArrowUp': direction = 'up'; break;
      case 'ArrowDown': direction = 'down'; break;
      case 'ArrowLeft': direction = 'left'; break;
      case 'ArrowRight': direction = 'right'; break;
      case 'Enter':
        // Simulate click on focused element
        if (document.activeElement && document.activeElement !== document.body) {
          (document.activeElement as HTMLElement).click();
          e.preventDefault();
        }
        return;
      default:
        return;
    }

    e.preventDefault();

    const current = document.activeElement as HTMLElement;
    
    // If nothing focused, focus first focusable
    if (!current || current === document.body) {
      const first = getVisibleFocusables()[0];
      if (first) {
        first.focus({ preventScroll: false });
        first.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      return;
    }

    const next = findNext(current, direction);
    if (next) {
      next.focus({ preventScroll: false });
      next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
