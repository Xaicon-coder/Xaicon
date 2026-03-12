export interface WatchProgress {
  animeId: string;
  seasonId: string;
  episodeId: string;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

const STORAGE_KEY = "anistream-watch-progress";

function getAll(): Record<string, WatchProgress> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(
  animeId: string,
  seasonId: string,
  episodeId: string,
  currentTime: number,
  duration: number
) {
  const all = getAll();
  const key = `${animeId}__${seasonId}__${episodeId}`;
  all[key] = { animeId, seasonId, episodeId, currentTime, duration, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getProgress(animeId: string, seasonId: string, episodeId: string): WatchProgress | null {
  const all = getAll();
  return all[`${animeId}__${seasonId}__${episodeId}`] || null;
}

// Returns the most recent episode per anime, sorted by most recent
export function getContinueWatching(): WatchProgress[] {
  const all = getAll();
  const entries = Object.values(all);

  // Keep only the most recent per anime
  const byAnime = new Map<string, WatchProgress>();
  for (const entry of entries) {
    const existing = byAnime.get(entry.animeId);
    if (!existing || entry.updatedAt > existing.updatedAt) {
      // Skip if basically finished (within 60s of end)
      if (entry.duration > 0 && entry.currentTime < entry.duration - 60) {
        byAnime.set(entry.animeId, entry);
      }
    }
  }

  return Array.from(byAnime.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}
