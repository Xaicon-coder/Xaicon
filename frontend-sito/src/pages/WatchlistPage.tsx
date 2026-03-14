import { Bookmark, Trash2, Search, Grid3X3, List, BarChart3, Eye, Clock, Trophy, TrendingUp, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import { animeList } from "@/data/animeData";
import { useWatchlist } from "@/hooks/useLocalWatchlist";
import { useTopAnime, useSeasonalAnime } from "@/hooks/useAnimeApi";
import type { Anime } from "@/data/animeData";
import { Link } from "react-router-dom";

type WatchStatus = "all" | "watching" | "completed" | "planned" | "on-hold" | "dropped";

const STATUS_OPTIONS: { value: WatchStatus; label: string; color: string }[] = [
  { value: "all", label: "Tutti", color: "text-foreground" },
  { value: "watching", label: "In corso", color: "text-primary" },
  { value: "completed", label: "Completati", color: "text-green-400" },
  { value: "planned", label: "Pianificati", color: "text-blue-400" },
  { value: "on-hold", label: "In pausa", color: "text-yellow-400" },
  { value: "dropped", label: "Abbandonati", color: "text-destructive" },
];

const SORT_OPTIONS = [
  { value: "added", label: "Data aggiunta" },
  { value: "rating", label: "Valutazione" },
  { value: "title", label: "Titolo A-Z" },
  { value: "year", label: "Anno" },
];

const WATCHLIST_STATUS_KEY = "anistream-watchlist-status";

function getAnimeStatus(animeId: string): WatchStatus {
  try {
    const all = JSON.parse(localStorage.getItem(WATCHLIST_STATUS_KEY) || "{}");
    return all[animeId] || "planned";
  } catch { return "planned"; }
}

function setAnimeStatus(animeId: string, status: WatchStatus) {
  try {
    const all = JSON.parse(localStorage.getItem(WATCHLIST_STATUS_KEY) || "{}");
    all[animeId] = status;
    localStorage.setItem(WATCHLIST_STATUS_KEY, JSON.stringify(all));
  } catch {}
}

const WatchlistPage = () => {
  const { watchlist, toggleWatchlist } = useWatchlist();
  const { anime: topAnime } = useTopAnime();
  const { anime: seasonalAnime } = useSeasonalAnime();
  const [statusFilter, setStatusFilter] = useState<WatchStatus>("all");
  const [sortBy, setSortBy] = useState("added");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, WatchStatus>>(() => {
    try { return JSON.parse(localStorage.getItem(WATCHLIST_STATUS_KEY) || "{}"); } catch { return {}; }
  });

  const allAnime = useMemo(() => {
    const map = new Map<string, Anime>();
    for (const a of animeList) map.set(a.id, a);
    for (const a of topAnime) if (!map.has(a.id)) map.set(a.id, a);
    for (const a of seasonalAnime) if (!map.has(a.id)) map.set(a.id, a);
    return map;
  }, [topAnime, seasonalAnime]);

  const watchlistAnime = useMemo(() => {
    let items = watchlist.map(id => allAnime.get(id)).filter((a): a is Anime => !!a);

    // Search
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      items = items.filter(a => a.title.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== "all") {
      items = items.filter(a => (statusMap[a.id] || "planned") === statusFilter);
    }

    // Sort
    items = [...items].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "year") return b.year - a.year;
      return 0; // added order (default)
    });

    return items;
  }, [watchlist, allAnime, statusFilter, sortBy, searchQuery, statusMap]);

  const handleStatusChange = (animeId: string, status: WatchStatus) => {
    setAnimeStatus(animeId, status);
    setStatusMap(prev => ({ ...prev, [animeId]: status }));
  };

  // Stats
  const stats = useMemo(() => {
    const all = watchlist.map(id => allAnime.get(id)).filter((a): a is Anime => !!a);
    const totalEps = all.reduce((sum, a) => sum + a.seasons.reduce((s, sea) => s + sea.episodes.length, 0), 0);
    const byStatus = { watching: 0, completed: 0, planned: 0, "on-hold": 0, dropped: 0 };
    all.forEach(a => {
      const s = (statusMap[a.id] || "planned") as keyof typeof byStatus;
      if (byStatus[s] !== undefined) byStatus[s]++;
    });
    return { total: all.length, totalEps, ...byStatus };
  }, [watchlist, allAnime, statusMap]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-1 flex items-center gap-3">
              <Bookmark size={28} className="text-primary" />
              La Mia Lista
            </h1>
            <p className="text-muted-foreground text-sm">
              {watchlistAnime.length} anime nella lista
            </p>
          </div>
          <button onClick={() => setShowStats(!showStats)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showStats ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground border border-border"}`}>
            <BarChart3 size={16} /> Statistiche
          </button>
        </div>

        {/* Stats panel */}
        {showStats && (
          <div className="gradient-card rounded-xl border border-border p-4 sm:p-6 mb-6 animate-fade-in">
            <h3 className="text-sm font-display font-semibold text-foreground mb-4">Le tue statistiche</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Anime totali</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-foreground">{stats.totalEps}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Episodi totali</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.watching}</p>
                <p className="text-[10px] text-muted-foreground mt-1">In corso</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Completati</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{stats.planned}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Pianificati</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">{stats["on-hold"]}</p>
                <p className="text-[10px] text-muted-foreground mt-1">In pausa</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cerca nella lista..." className="w-full bg-secondary text-foreground text-sm px-10 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2.5 rounded-lg border border-border">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")} className="bg-secondary text-muted-foreground hover:text-foreground p-2.5 rounded-lg border border-border">
            {viewMode === "grid" ? <List size={16} /> : <Grid3X3 size={16} />}
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
          {STATUS_OPTIONS.map(s => {
            const count = s.value === "all" ? watchlistAnime.length : watchlist.filter(id => (statusMap[id] || "planned") === s.value).length;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === s.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
                <span className={`text-[10px] ${statusFilter === s.value ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {watchlistAnime.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm mb-2">{statusFilter === "all" ? "La tua lista è vuota" : "Nessun anime in questa categoria"}</p>
            <Link to="/explore" className="text-primary text-sm hover:underline">Esplora il catalogo</Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
            {watchlistAnime.map((anime, i) => (
              <div key={anime.id} className="relative group/card">
                <AnimeCard anime={anime} index={i} />
                {/* Status badge */}
                <select
                  value={statusMap[anime.id] || "planned"}
                  onChange={e => handleStatusChange(anime.id, e.target.value as WatchStatus)}
                  onClick={e => e.stopPropagation()}
                  className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded border-none focus:outline-none cursor-pointer z-10"
                >
                  {STATUS_OPTIONS.filter(s => s.value !== "all").map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatchlist(anime.id); }}
                  className="absolute top-1 right-1 bg-destructive/90 hover:bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                  title="Rimuovi dalla lista"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {watchlistAnime.map(anime => (
              <div key={anime.id} className="flex items-center gap-3 sm:gap-4 p-3 gradient-card rounded-xl border border-border hover:border-primary/30 transition-all">
                <Link to={`/anime/${anime.id}`} className="w-12 sm:w-16 aspect-[2/3] rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img src={anime.cover} alt={anime.title} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/anime/${anime.id}`} className="text-sm font-medium text-foreground hover:text-primary truncate block">{anime.title}</Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{anime.year}</span>
                    <span>⭐ {anime.rating}</span>
                    <span>{anime.genres.slice(0, 2).join(", ")}</span>
                  </div>
                </div>
                <select value={statusMap[anime.id] || "planned"} onChange={e => handleStatusChange(anime.id, e.target.value as WatchStatus)} className="bg-secondary text-xs text-foreground px-2 py-1 rounded border border-border">
                  {STATUS_OPTIONS.filter(s => s.value !== "all").map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button onClick={() => toggleWatchlist(anime.id)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
