import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, Calendar, TrendingUp, Grid3X3, List, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import { animeList, type Anime } from "@/data/animeData";
import { useTopAnime, useSeasonalAnime } from "@/hooks/useAnimeApi";
import { Link } from "react-router-dom";

const STATUSES = ["Tutti", "In corso", "Completato"];
const SORT_OPTIONS = [
  { value: "rating", label: "Valutazione ↓" },
  { value: "rating-asc", label: "Valutazione ↑" },
  { value: "year", label: "Più recenti" },
  { value: "year-asc", label: "Meno recenti" },
  { value: "title", label: "A-Z" },
  { value: "title-desc", label: "Z-A" },
  { value: "episodes", label: "Più episodi" },
];

const PER_PAGE_OPTIONS = [12, 24, 48];

function getAvailableYears(animeArr: Anime[]): number[] {
  const years = new Set(animeArr.map(a => a.year));
  return Array.from(years).sort((a, b) => b - a);
}

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get("genre");

  const { anime: topAnime } = useTopAnime();
  const { anime: seasonalAnime } = useSeasonalAnime();

  const [query, setQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenre ? [initialGenre] : []);
  const [status, setStatus] = useState("Tutti");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [ratingMin, setRatingMin] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(24);

  const allAnime = useMemo(() => {
    const map = new Map<string, Anime>();
    for (const a of animeList) map.set(a.id, a);
    for (const a of topAnime) if (!map.has(a.id)) map.set(a.id, a);
    for (const a of seasonalAnime) if (!map.has(a.id)) map.set(a.id, a);
    return Array.from(map.values());
  }, [topAnime, seasonalAnime]);

  const allGenres = useMemo(() => Array.from(new Set(allAnime.flatMap(a => a.genres))).sort(), [allAnime]);
  const allStudios = useMemo(() => {
    const studios = new Set<string>();
    allAnime.forEach(a => { if (a.folderName) studios.add(a.folderName.split(" ITA")[0]); });
    return Array.from(studios).sort();
  }, [allAnime]);
  const availableYears = useMemo(() => getAvailableYears(allAnime), [allAnime]);

  const filtered = useMemo(() => {
    let result = allAnime;
    if (query.length >= 2) {
      const q = query.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q));
    }
    if (selectedGenres.length > 0) result = result.filter(a => selectedGenres.every(g => a.genres.includes(g)));
    if (status !== "Tutti") result = result.filter(a => a.status === status);
    if (selectedYear !== null) result = result.filter(a => a.year === selectedYear);
    if (ratingMin > 0) result = result.filter(a => a.rating >= ratingMin);

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "rating-asc": return a.rating - b.rating;
        case "year": return b.year - a.year;
        case "year-asc": return a.year - b.year;
        case "title": return a.title.localeCompare(b.title);
        case "title-desc": return b.title.localeCompare(a.title);
        case "episodes": return b.seasons.reduce((s, se) => s + se.episodes.length, 0) - a.seasons.reduce((s, se) => s + se.episodes.length, 0);
        default: return 0;
      }
    });
    return result;
  }, [allAnime, query, selectedGenres, status, sortBy, selectedYear, ratingMin]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedGenres([]); setStatus("Tutti"); setSortBy("rating"); setQuery(""); setSelectedYear(null); setRatingMin(0); setCurrentPage(1);
  };

  const activeFilterCount = selectedGenres.length + (status !== "Tutti" ? 1 : 0) + (selectedYear !== null ? 1 : 0) + (ratingMin > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">Esplora</h1>
          <p className="text-muted-foreground text-sm">Scopri il catalogo completo di anime</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? "" : "hidden lg:hidden"}`}>
            <div className="gradient-card rounded-xl border border-border p-4 sticky top-20 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-semibold text-foreground">Filtri</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] text-primary hover:underline flex items-center gap-1"><X size={10} /> Reset</button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={query} onChange={e => { setQuery(e.target.value); setCurrentPage(1); }} placeholder="Cerca anime..." className="w-full bg-secondary text-foreground text-xs px-9 py-2 rounded-lg border border-border focus:border-primary focus:outline-none" />
                {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={12} /></button>}
              </div>

              {/* Genres */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Generi</h4>
                <div className="flex flex-wrap gap-1">
                  {allGenres.map(genre => (
                    <button key={genre} onClick={() => toggleGenre(genre)} className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${selectedGenres.includes(genre) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Anno</h4>
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => { setSelectedYear(null); setCurrentPage(1); }} className={`text-[10px] px-2 py-0.5 rounded-full ${selectedYear === null ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Tutti</button>
                  {availableYears.slice(0, 10).map(year => (
                    <button key={year} onClick={() => { setSelectedYear(year === selectedYear ? null : year); setCurrentPage(1); }} className={`text-[10px] px-2 py-0.5 rounded-full ${selectedYear === year ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{year}</button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Valutazione minima</h4>
                <div className="flex flex-wrap gap-1">
                  {[0, 7, 7.5, 8, 8.5, 9].map(r => (
                    <button key={r} onClick={() => { setRatingMin(r === ratingMin ? 0 : r); setCurrentPage(1); }} className={`text-[10px] px-2 py-0.5 rounded-full ${ratingMin === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{r === 0 ? "Tutti" : `≥ ${r}`}</button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stato</h4>
                <div className="flex gap-1">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatus(s); setCurrentPage(1); }} className={`text-[10px] px-2 py-0.5 rounded-full ${status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${showFilters ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground border border-border"}`}>
                  <SlidersHorizontal size={14} /> Filtri {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
                </button>
                <span className="text-xs text-muted-foreground">{filtered.length} risultati</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-secondary text-foreground text-xs px-2 py-1.5 rounded-lg border border-border">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={perPage} onChange={e => { setPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="bg-secondary text-foreground text-xs px-2 py-1.5 rounded-lg border border-border">
                  {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} per pagina</option>)}
                </select>
                <button onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")} className="bg-secondary text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border">
                  {viewMode === "grid" ? <List size={14} /> : <Grid3X3 size={14} />}
                </button>
              </div>
            </div>

            {/* Results */}
            {paginated.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-sm">Nessun anime trovato</p>
                <button onClick={clearFilters} className="text-primary text-sm mt-2 hover:underline">Rimuovi filtri</button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                {paginated.map((anime, i) => <AnimeCard key={anime.id} anime={anime} index={i} />)}
              </div>
            ) : (
              <div className="space-y-2">
                {paginated.map(anime => (
                  <Link key={anime.id} to={`/anime/${anime.id}`} className="flex items-center gap-3 p-3 gradient-card rounded-xl border border-border hover:border-primary/30 transition-all">
                    <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img src={anime.cover} alt={anime.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{anime.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{anime.year}</span>
                        <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" className="text-primary" /> {anime.rating}</span>
                        <span>{anime.genres.slice(0, 2).join(", ")}</span>
                        <span className={anime.status === "In corso" ? "text-primary" : ""}>{anime.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1.5 bg-secondary text-foreground text-xs rounded-lg disabled:opacity-30">← Prec</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage >= totalPages - 3 ? totalPages - 6 + i : currentPage - 3 + i;
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-xs font-medium ${currentPage === page ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{page}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-secondary text-foreground text-xs rounded-lg disabled:opacity-30">Succ →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
