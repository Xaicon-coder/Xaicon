import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// ── Watchlist (anime da vedere) ──

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!user) { setWatchlist([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('watchlist')
      .select('anime_id')
      .eq('user_id', user.id);
    setWatchlist(data?.map(d => d.anime_id) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  const toggleWatchlist = async (animeId: string) => {
    if (!user) return;
    const inList = watchlist.includes(animeId);
    if (inList) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('anime_id', animeId);
      setWatchlist(prev => prev.filter(id => id !== animeId));
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, anime_id: animeId });
      setWatchlist(prev => [...prev, animeId]);
    }
  };

  const isInWatchlist = (animeId: string) => watchlist.includes(animeId);

  return { watchlist, loading, toggleWatchlist, isInWatchlist, refetch: fetchWatchlist };
}

// ── Watched Episodes (episodi visti) ──

export function useWatchedEpisodes(animeId?: string) {
  const { user } = useAuth();
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWatched = useCallback(async () => {
    if (!user || !animeId) { setWatched(new Set()); return; }
    setLoading(true);
    const { data } = await supabase
      .from('watched_episodes')
      .select('episode_id')
      .eq('user_id', user.id)
      .eq('anime_id', animeId);
    setWatched(new Set(data?.map(d => d.episode_id) || []));
    setLoading(false);
  }, [user, animeId]);

  useEffect(() => { fetchWatched(); }, [fetchWatched]);

  const toggleWatched = async (episodeId: string, seasonId: string) => {
    if (!user || !animeId) return;
    const isWatched = watched.has(episodeId);
    if (isWatched) {
      await supabase.from('watched_episodes').delete()
        .eq('user_id', user.id).eq('anime_id', animeId).eq('episode_id', episodeId);
      setWatched(prev => { const n = new Set(prev); n.delete(episodeId); return n; });
    } else {
      await supabase.from('watched_episodes').insert({
        user_id: user.id, anime_id: animeId, season_id: seasonId, episode_id: episodeId,
      });
      setWatched(prev => new Set(prev).add(episodeId));
    }
  };

  const markWatched = async (episodeId: string, seasonId: string) => {
    if (!user || !animeId || watched.has(episodeId)) return;
    await supabase.from('watched_episodes').upsert({
      user_id: user.id, anime_id: animeId, season_id: seasonId, episode_id: episodeId,
    }, { onConflict: 'user_id,anime_id,episode_id' });
    setWatched(prev => new Set(prev).add(episodeId));
  };

  const isWatched = (episodeId: string) => watched.has(episodeId);

  return { watched, loading, toggleWatched, markWatched, isWatched, refetch: fetchWatched };
}
