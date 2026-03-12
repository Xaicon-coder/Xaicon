import { useParams, Link } from "react-router-dom";
import { Play, Star, ArrowLeft, Clock, Calendar, Loader2, Bookmark, BookmarkCheck, CheckCircle2, Share2, Eye, EyeOff, ChevronDown, ChevronUp, Grid3X3, List, Copy, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { type Anime } from "@/data/animeData";
import { useAnimeById } from "@/hooks/useAnimeApi";
import { useSpatialNavigation } from "@/hooks/useSpatialNavigation";
import { useWatchlist, useWatchedEpisodes } from '@/hooks/useLocalWatchlist';
import { toast } from "sonner";

const RATING_LABELS = ["", "Terribile", "Mediocre", "Buono", "Ottimo", "Capolavoro"];

const AnimeDetail = () => {
  useSpatialNavigation();
  const { id } = useParams();
  const { anime, loading } = useAnimeById(id || "");
  const [selectedSeason, setSelectedSeason] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { isWatched, toggleWatched, watched } = useWatchedEpisodes(id);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [episodeFilter, setEpisodeFilter] = useState<"all" | "watched" | "unwatched">("all");
  const [showShare, setShowShare] = useState(false);
  const [personalRating, setPersonalRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [personalNote, setPersonalNote] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">Anime non trovato</h1>
          <Link to="/" className="text-primary hover:underline text-sm">Torna alla home</Link>
        </div>
      </div>
    );
  }

  const currentSeason = anime.seasons[selectedSeason];
  const totalEps = anime.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
  const watchedCount = watched.size;
  const progressPercent = currentSeason.episodes.length > 0 ? Math.round((watchedCount / currentSeason.episodes.length) * 100) : 0;

  const filteredEpisodes = useMemo(() => {
    let eps = [...currentSeason.episodes];
    if (episodeFilter === "watched") eps = eps.filter(ep => isWatched(ep.id));
    if (episodeFilter === "unwatched") eps = eps.filter(ep => !isWatched(ep.id));
    if (sortOrder === "desc") eps.reverse();
    return eps;
  }, [currentSeason.episodes, episodeFilter, sortOrder, isWatched, watched]);

  const shareUrl = window.location.href;
  const handleShare = async (type: string) => {
    if (type === "copy") {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiato!");
    } else if (type === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=Guarda ${anime.title} su AniStream!&url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (type === "whatsapp") {
      window.open(`https://wa.me/?text=Guarda ${anime.title} su AniStream! ${shareUrl}`, "_blank");
    }
    setShowShare(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero with blur */}
      <div className="relative h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] min-h-[250px] max-h-[600px] overflow-hidden">
        <img src={anime.banner} alt={anime.title} className="absolute inset-0 w-full h-full object-cover object-center blur-[2px] scale-105" />
        <div className="absolute inset-0 gradient-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 lg:-mt-48 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-xs sm:text-sm">
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Torna indietro
        </Link>

        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-36 sm:w-44 md:w-48 lg:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-border bg-secondary">
              <img src={anime.cover} alt={anime.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 animate-fade-in text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-2 sm:mb-3">{anime.title}</h1>

            {/* Rating stars */}
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-wrap justify-center sm:justify-start">
              {anime.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => {
                    const filled = anime.rating / 2 >= star;
                    const half = anime.rating / 2 >= star - 0.5 && anime.rating / 2 < star;
                    return (
                      <Star key={star} size={16} className={`sm:w-[18px] sm:h-[18px] ${filled || half ? "text-primary" : "text-muted-foreground/30"}`} fill={filled ? "currentColor" : half ? "currentColor" : "none"} />
                    );
                  })}
                  <span className="font-semibold text-sm sm:text-base text-primary ml-1">{anime.rating}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span>{anime.year}</span>
              </div>
              <span className={`text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${anime.status === "In corso" ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground"}`}>
                {anime.status}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {totalEps} episodi • {anime.seasons.length} stagion{anime.seasons.length > 1 ? "i" : "e"}
              </span>
            </div>

            {/* Genres */}
            <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-3 sm:mb-4 justify-center sm:justify-start">
              {anime.genres.map((g) => (
                <Link key={g} to={`/explore?genre=${encodeURIComponent(g)}`} className="text-[10px] sm:text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-colors">{g}</Link>
              ))}
            </div>

            {/* Description */}
            <div className="mb-4 sm:mb-6 max-w-2xl mx-auto sm:mx-0">
              <p className={`text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed ${expandedDesc ? "" : "line-clamp-3"}`}>
                {anime.description}
              </p>
              {anime.description.length > 200 && (
                <button onClick={() => setExpandedDesc(!expandedDesc)} className="text-primary text-xs mt-1 hover:underline flex items-center gap-1">
                  {expandedDesc ? <><ChevronUp size={12} /> Mostra meno</> : <><ChevronDown size={12} /> Mostra di più</>}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start flex-wrap">
              <Link
                to={`/watch/${anime.id}/${currentSeason.id}/${currentSeason.episodes[0].id}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all glow-primary text-sm sm:text-base"
              >
                <Play size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" />
                Guarda ora
              </Link>
              <button
                onClick={() => toggleWatchlist(anime.id)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${
                  isInWatchlist(anime.id)
                    ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
              >
                {isInWatchlist(anime.id) ? <><BookmarkCheck size={16} /> Nella lista</> : <><Bookmark size={16} /> Aggiungi</>}
              </button>
              <div className="relative">
                <button onClick={() => setShowShare(!showShare)} className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2.5 sm:py-3 rounded-lg text-sm">
                  <Share2 size={16} /> Condividi
                </button>
                {showShare && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-2xl p-2 min-w-[160px] animate-fade-in z-50">
                    <button onClick={() => handleShare("copy")} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-lg"><Copy size={14} /> Copia link</button>
                    <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-lg"><ExternalLink size={14} /> Twitter</button>
                    <button onClick={() => handleShare("whatsapp")} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-lg"><ExternalLink size={14} /> WhatsApp</button>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Rating */}
            <div className="mt-4 sm:mt-6 flex items-center gap-3 justify-center sm:justify-start">
              <span className="text-xs text-muted-foreground">Il tuo voto:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setPersonalRating(star === personalRating ? 0 : star)}
                    className="p-0.5"
                  >
                    <Star size={20} className={`transition-colors ${(hoverRating || personalRating) >= star ? "text-primary" : "text-muted-foreground/30"}`} fill={(hoverRating || personalRating) >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              {(hoverRating || personalRating) > 0 && (
                <span className="text-xs text-primary font-medium">{RATING_LABELS[hoverRating || personalRating]}</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {watchedCount > 0 && (
          <div className="mt-6 gradient-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progresso</span>
              <span className="text-xs text-primary font-medium">{watchedCount}/{currentSeason.episodes.length} episodi ({progressPercent}%)</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Episodes section */}
        <div className="mt-8 sm:mt-10 lg:mt-12 mb-12 sm:mb-16">
          {/* Season tabs */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-2">
              {anime.seasons.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeason(i)}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSeason === i
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Filter */}
              <select
                value={episodeFilter}
                onChange={e => setEpisodeFilter(e.target.value as any)}
                className="bg-secondary text-xs text-foreground px-2 py-1.5 rounded-lg border border-border"
              >
                <option value="all">Tutti</option>
                <option value="watched">Visti</option>
                <option value="unwatched">Non visti</option>
              </select>
              {/* Sort */}
              <button onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} className="bg-secondary text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border" title="Ordine">
                {sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {/* View mode */}
              <button onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")} className="bg-secondary text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border">
                {viewMode === "grid" ? <List size={14} /> : <Grid3X3 size={14} />}
              </button>
            </div>
          </div>

          {/* Episodes */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredEpisodes.map((ep, i) => {
                const epWatched = isWatched(ep.id);
                return (
                  <div key={ep.id} className="relative group">
                    <Link
                      to={`/watch/${anime.id}/${currentSeason.id}/${ep.id}`}
                      className={`block gradient-card rounded-lg sm:rounded-xl overflow-hidden border transition-all duration-150 animate-fade-in ${
                        epWatched ? 'border-primary/30 opacity-80' : 'border-border hover:border-primary/40'
                      }`}
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <div className="relative aspect-video overflow-hidden bg-secondary">
                        <img src={ep.thumbnail} alt={ep.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary rounded-full p-1.5 sm:p-2">
                            <Play size={12} className="text-primary-foreground sm:w-4 sm:h-4" fill="currentColor" />
                          </div>
                        </div>
                        {epWatched && (
                          <div className="absolute top-1.5 right-1.5 bg-primary rounded-full p-0.5">
                            <CheckCircle2 size={14} className="text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-3">
                        <h4 className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">E{ep.number} - {ep.title}</h4>
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                          <Clock size={10} className="sm:w-3 sm:h-3" /><span>{ep.duration}</span>
                        </div>
                      </div>
                    </Link>
                    <button onClick={() => toggleWatched(ep.id, currentSeason.id)} className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 p-1 rounded-full transition-all z-10 ${epWatched ? 'bg-primary text-primary-foreground' : 'bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground'}`} title={epWatched ? 'Segna come non visto' : 'Segna come visto'}>
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEpisodes.map((ep) => {
                const epWatched = isWatched(ep.id);
                return (
                  <Link key={ep.id} to={`/watch/${anime.id}/${currentSeason.id}/${ep.id}`}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 gradient-card rounded-xl border transition-all ${
                      epWatched ? 'border-primary/30 opacity-80' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">Episodio {ep.number} - {ep.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock size={11} /> {ep.duration}</span>
                        {epWatched && <span className="flex items-center gap-1 text-primary"><CheckCircle2 size={11} /> Visto</span>}
                      </div>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); toggleWatched(ep.id, currentSeason.id); }} className={`p-2 rounded-full transition-all ${epWatched ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground'}`}>
                      <CheckCircle2 size={16} />
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {filteredEpisodes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nessun episodio corrisponde al filtro selezionato
            </div>
          )}
        </div>

        {/* Personal note */}
        <div className="mb-12 gradient-card rounded-xl border border-border p-4 sm:p-6 max-w-2xl">
          <h3 className="text-sm font-display font-semibold text-foreground mb-2">Note personali</h3>
          <textarea
            value={personalNote}
            onChange={e => setPersonalNote(e.target.value)}
            placeholder="Scrivi le tue note su questo anime..."
            className="w-full bg-secondary text-foreground text-sm px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none resize-none h-24"
            maxLength={500}
          />
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{personalNote.length}/500</p>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;
