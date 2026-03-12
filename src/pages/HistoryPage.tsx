import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getContinueWatching, type WatchProgress } from "@/hooks/useWatchProgress";
import { animeList } from "@/data/animeData";
import { Clock, Play, Trash2, Search, X, Calendar, Filter, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type DateFilter = "all" | "today" | "week" | "month";

const HistoryPage = () => {
  const [items, setItems] = useState<WatchProgress[]>(() => {
    try {
      const all = JSON.parse(localStorage.getItem("anistream-watch-progress") || "{}");
      return Object.values(all).sort((a: any, b: any) => b.updatedAt - a.updatedAt) as WatchProgress[];
    } catch { return []; }
  });
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showStats, setShowStats] = useState(false);

  const filtered = useMemo(() => {
    let result = items;
    if (query.length >= 2) {
      const q = query.toLowerCase();
      result = result.filter(item => {
        const anime = animeList.find(a => a.id === item.animeId);
        return anime?.title.toLowerCase().includes(q);
      });
    }
    const now = Date.now();
    if (dateFilter === "today") result = result.filter(i => now - i.updatedAt < 86400000);
    else if (dateFilter === "week") result = result.filter(i => now - i.updatedAt < 604800000);
    else if (dateFilter === "month") result = result.filter(i => now - i.updatedAt < 2592000000);
    return result;
  }, [items, query, dateFilter]);

  const removeItem = (animeId: string, seasonId: string, episodeId: string) => {
    try {
      const all = JSON.parse(localStorage.getItem("anistream-watch-progress") || "{}");
      delete all[`${animeId}__${seasonId}__${episodeId}`];
      localStorage.setItem("anistream-watch-progress", JSON.stringify(all));
      setItems(Object.values(all).sort((a: any, b: any) => b.updatedAt - a.updatedAt) as WatchProgress[]);
      toast.success("Elemento rimosso dalla cronologia");
    } catch {}
  };

  const clearAll = () => {
    localStorage.removeItem("anistream-watch-progress");
    setItems([]);
    toast.success("Cronologia cancellata");
  };

  // Stats
  const totalHours = useMemo(() => {
    const sec = items.reduce((sum, i) => sum + i.currentTime, 0);
    return Math.round(sec / 3600 * 10) / 10;
  }, [items]);

  const uniqueAnime = useMemo(() => new Set(items.map(i => i.animeId)).size, [items]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(item => {
      const date = new Date(item.updatedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Clock size={28} className="text-primary" /> Cronologia
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowStats(!showStats)} className={`p-2 rounded-lg transition-colors ${showStats ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              <BarChart3 size={16} />
            </button>
            {items.length > 0 && (
              <button onClick={clearAll} className="text-xs text-destructive hover:text-destructive/80 bg-destructive/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Trash2 size={12} /> Cancella tutto
              </button>
            )}
          </div>
        </div>

        {/* Stats panel */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in">
            <div className="gradient-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{items.length}</p>
              <p className="text-[10px] text-muted-foreground">Episodi guardati</p>
            </div>
            <div className="gradient-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{uniqueAnime}</p>
              <p className="text-[10px] text-muted-foreground">Anime diversi</p>
            </div>
            <div className="gradient-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{totalHours}h</p>
              <p className="text-[10px] text-muted-foreground">Ore totali</p>
            </div>
            <div className="gradient-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{items.length > 0 ? Math.round(totalHours / Math.max(uniqueAnime, 1) * 10) / 10 : 0}h</p>
              <p className="text-[10px] text-muted-foreground">Ore per anime</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca nella cronologia..." className="w-full bg-secondary text-foreground text-xs pl-9 pr-8 py-2 rounded-lg border border-border focus:border-primary focus:outline-none" />
            {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={12} /></button>}
          </div>
          <div className="flex gap-1">
            {([["all", "Tutto"], ["today", "Oggi"], ["week", "Settimana"], ["month", "Mese"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setDateFilter(val)} className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${dateFilter === val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={40} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nessun elemento nella cronologia</p>
            <Link to="/explore" className="text-primary text-sm hover:underline mt-2 inline-block">Esplora anime</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, groupItems]) => (
              <div key={date}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={12} /> {date}
                </h3>
                <div className="space-y-2">
                  {groupItems.map((item, i) => {
                    const anime = animeList.find(a => a.id === item.animeId);
                    if (!anime) return null;
                    const season = anime.seasons.find(s => s.id === item.seasonId);
                    const episode = season?.episodes.find(e => e.id === item.episodeId);
                    if (!season || !episode) return null;
                    const progress = item.duration > 0 ? Math.round((item.currentTime / item.duration) * 100) : 0;
                    const minutesLeft = Math.max(0, Math.ceil((item.duration - item.currentTime) / 60));

                    return (
                      <div key={`${item.animeId}-${item.episodeId}-${i}`} className="flex items-center gap-3 sm:gap-4 p-3 gradient-card rounded-xl border border-border hover:border-primary/30 transition-all group">
                        <Link to={`/watch/${anime.id}/${season.id}/${episode.id}`} className="w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-secondary flex-shrink-0 relative">
                          <img src={episode.thumbnail || anime.cover} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors flex items-center justify-center">
                            <Play size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground bg-primary rounded-full p-1" fill="currentColor" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/anime/${anime.id}`} className="text-sm font-medium text-foreground hover:text-primary truncate block">{anime.title}</Link>
                          <p className="text-xs text-muted-foreground mt-0.5">Ep. {episode.number} - {episode.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-muted-foreground">{progress}% guardato</span>
                            <span className="text-[10px] text-muted-foreground">{minutesLeft} min rimanenti</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link to={`/watch/${anime.id}/${season.id}/${episode.id}`} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hidden sm:block">
                            Continua
                          </Link>
                          <button onClick={() => removeItem(item.animeId, item.seasonId, item.episodeId)} className="text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
