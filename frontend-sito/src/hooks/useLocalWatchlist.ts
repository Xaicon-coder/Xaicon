import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'anistream-watchlist';
const WATCHED_KEY = 'anistream-watched-episodes';

function getStoredList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function setStoredList(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

function getStoredSet(key: string): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function setStoredSet(key: string, data: Record<string, string[]>) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Watchlist (anime da vedere) ──
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => getStoredList(WATCHLIST_KEY));

  const toggleWatchlist = useCallback((animeId: string) => {
    setWatchlist(prev => {
      const inList = prev.includes(animeId);
      const next = inList ? prev.filter(id => id !== animeId) : [...prev, animeId];
      setStoredList(WATCHLIST_KEY, next);
      return next;
    });
  }, []);

  const isInWatchlist = useCallback((animeId: string) => watchlist.includes(animeId), [watchlist]);

  return { watchlist, toggleWatchlist, isInWatchlist };
}

// ── Watched Episodes (episodi visti) ──
export function useWatchedEpisodes(animeId?: string) {
  const [watched, setWatched] = useState<Set<string>>(() => {
    if (!animeId) return new Set();
    const all = getStoredSet(WATCHED_KEY);
    return new Set(all[animeId] || []);
  });

  useEffect(() => {
    if (!animeId) { setWatched(new Set()); return; }
    const all = getStoredSet(WATCHED_KEY);
    setWatched(new Set(all[animeId] || []));
  }, [animeId]);

  const toggleWatched = useCallback((episodeId: string, _seasonId: string) => {
    if (!animeId) return;
    setWatched(prev => {
      const next = new Set(prev);
      if (next.has(episodeId)) {
        next.delete(episodeId);
      } else {
        next.add(episodeId);
      }
      const all = getStoredSet(WATCHED_KEY);
      all[animeId] = Array.from(next);
      setStoredSet(WATCHED_KEY, all);
      return next;
    });
  }, [animeId]);

  const markWatched = useCallback((episodeId: string, _seasonId: string) => {
    if (!animeId) return;
    setWatched(prev => {
      if (prev.has(episodeId)) return prev;
      const next = new Set(prev);
      next.add(episodeId);
      const all = getStoredSet(WATCHED_KEY);
      all[animeId] = Array.from(next);
      setStoredSet(WATCHED_KEY, all);
      return next;
    });
  }, [animeId]);

  const isWatched = useCallback((episodeId: string) => watched.has(episodeId), [watched]);

  return { watched, toggleWatched, markWatched, isWatched };
}
