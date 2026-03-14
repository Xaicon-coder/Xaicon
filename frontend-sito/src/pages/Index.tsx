import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import AnimeRow from "@/components/AnimeRow";
import AnimeRowSkeleton from "@/components/AnimeRowSkeleton";
import ContinueWatching from "@/components/ContinueWatching";
import Footer from "@/components/Footer";
import AccountGate from "@/components/AccountGate";
import { useTopAnime, useSeasonalAnime, useRandomAnime } from "@/hooks/useAnimeApi";
import { popularAnime, topRatedAnime, animeList } from "@/data/animeData";
import { Flame, Star, Shuffle, Swords, Heart, Wand2, Zap, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { useSpatialNavigation } from "@/hooks/useSpatialNavigation";
import { useMemo } from "react";
import type { Anime } from "@/data/animeData";

const GENRE_SECTIONS = [
  { genre: "Azione", icon: Swords, label: "Azione" },
  { genre: "Avventura", icon: Zap, label: "Avventura" },
  { genre: "Fantasy", icon: Wand2, label: "Fantasy" },
  { genre: "Commedia", icon: Heart, label: "Commedia" },
];

const Index = () => {
  useSpatialNavigation();
  const { anime: topAnime, loading: topLoading } = useTopAnime();
  const { anime: seasonalAnime, loading: seasonalLoading } = useSeasonalAnime();
  const { anime: randomAnime, loading: randomLoading } = useRandomAnime();

  const allAnime = useMemo(() => {
    const map = new Map<string, Anime>();
    for (const a of animeList) map.set(a.id, a);
    for (const a of topAnime) if (!map.has(a.id)) map.set(a.id, a);
    for (const a of seasonalAnime) if (!map.has(a.id)) map.set(a.id, a);
    for (const a of randomAnime) if (!map.has(a.id)) map.set(a.id, a);
    return Array.from(map.values());
  }, [topAnime, seasonalAnime, randomAnime]);

  const trending = useMemo(() => {
    return [...(topAnime.length > 0 ? topAnime : topRatedAnime)]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 15);
  }, [topAnime]);

  const genreRows = useMemo(() => {
    return GENRE_SECTIONS.map(({ genre, icon, label }) => {
      const filtered = allAnime
        .filter(a => a.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 15);
      return { genre, icon, label, animeList: filtered };
    }).filter(row => row.animeList.length >= 3);
  }, [allAnime]);

  // New releases (most recent year)
  const newReleases = useMemo(() => {
    return [...allAnime]
      .sort((a, b) => b.year - a.year)
      .slice(0, 15);
  }, [allAnime]);

  return (
    <AccountGate>
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroBanner />
        <main className="pb-4">
          <ContinueWatching />

          {/* Trending */}
          {trending.length > 0 && (
            <AnimeRow title="Trending Ora" icon={TrendingUp} animeList={trending} />
          )}

          {/* Seasonal */}
          {seasonalLoading ? (
            <AnimeRowSkeleton title="Anime della Stagione" icon={Flame} />
          ) : (
            <AnimeRow title="Anime della Stagione" icon={Flame} animeList={seasonalAnime.length > 0 ? seasonalAnime : popularAnime} />
          )}

          {/* New releases */}
          {newReleases.length > 0 && (
            <AnimeRow title="Nuove Uscite" icon={Sparkles} animeList={newReleases} />
          )}

          {/* Top Rated */}
          {topLoading ? (
            <AnimeRowSkeleton title="Più Votati" icon={Star} />
          ) : (
            <AnimeRow title="Più Votati" icon={Star} animeList={topAnime.length > 0 ? topAnime : topRatedAnime} />
          )}

          {/* Genre sections */}
          {genreRows.map(row => (
            <AnimeRow key={row.genre} title={row.label} icon={row.icon} animeList={row.animeList} />
          ))}

          {/* Discover */}
          {randomLoading ? (
            <AnimeRowSkeleton title="Scopri Anime" icon={Shuffle} />
          ) : (
            <AnimeRow title="Scopri Anime" icon={Shuffle} animeList={randomAnime.length > 0 ? randomAnime : popularAnime} />
          )}

          {/* Top of All Time */}
          <AnimeRow title="I Migliori di Sempre" icon={Trophy} animeList={topRatedAnime.slice(0, 15)} />
        </main>
        <Footer />
      </div>
    </AccountGate>
  );
};

export default Index;
