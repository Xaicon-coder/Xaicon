import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useProfile } from "@/hooks/useProfile";
import { useWatchlist } from "@/hooks/useLocalWatchlist";
import { getContinueWatching } from "@/hooks/useWatchProgress";
import { animeList } from "@/data/animeData";
import { User, BarChart3, BookOpen, Star, Activity, Clock, Trophy, TrendingUp, Eye, Calendar, Edit3, Save } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import { toast } from "sonner";

type Tab = "overview" | "watchlist" | "reviews" | "activity";

const RATINGS_KEY = "anistream-personal-ratings";
const BIO_KEY = "anistream-bio";
const ACTIVITY_KEY = "anistream-activity";

function getRatings(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"); } catch { return {}; }
}

function getActivity(): { type: string; animeId: string; date: number; detail?: string }[] {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]"); } catch { return []; }
}

function getWatchedEpisodesTotal(): number {
  try {
    const data = JSON.parse(localStorage.getItem("anistream-watched-episodes") || "{}");
    return (Object.values(data) as any[]).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  } catch { return 0; }
}

function getWatchHours(): number {
  try {
    const data = JSON.parse(localStorage.getItem("anistream-watch-progress") || "{}");
    const totalSec = Object.values(data).reduce((sum: number, p: any) => sum + (p.currentTime || 0), 0);
    return Math.round((totalSec as number) / 3600 * 10) / 10;
  } catch { return 0; }
}

const ProfilePage = () => {
  const { activeProfile } = useProfile();
  const { watchlist } = useWatchlist();
  const [tab, setTab] = useState<Tab>("overview");
  const [bio, setBio] = useState(() => localStorage.getItem(BIO_KEY) || "");
  const [editingBio, setEditingBio] = useState(false);

  const ratings = useMemo(() => getRatings(), []);
  const activity = useMemo(() => getActivity(), []);
  const continueWatching = useMemo(() => getContinueWatching(), []);
  const watchedEps = getWatchedEpisodesTotal();
  const watchHours = getWatchHours();

  const ratingValues = Object.values(ratings);
  const avgRating = ratingValues.length > 0 ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1) : "—";

  const watchlistAnime = useMemo(() => {
    const all = [...animeList];
    return all.filter(a => watchlist.includes(a.id));
  }, [watchlist]);

  const topRated = useMemo(() => {
    return Object.entries(ratings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => animeList.find(a => a.id === id))
      .filter(Boolean);
  }, [ratings]);

  // Genre stats
  const genreStats = useMemo(() => {
    const counts: Record<string, number> = {};
    watchlistAnime.forEach(a => a.genres.forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [watchlistAnime]);

  const saveBio = () => {
    localStorage.setItem(BIO_KEY, bio);
    setEditingBio(false);
    toast.success("Bio aggiornata!");
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "overview", label: "Panoramica", icon: BarChart3 },
    { id: "watchlist", label: "La mia lista", icon: BookOpen },
    { id: "reviews", label: "Voti e Recensioni", icon: Star },
    { id: "activity", label: "Attività", icon: Activity },
  ];

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Seleziona un profilo per continuare</p>
          <Link to="/" className="text-primary hover:underline">Vai alla home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        {/* Profile header */}
        <div className="gradient-card rounded-2xl border border-border p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-primary/30 bg-secondary flex-shrink-0">
              <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{activeProfile.name}</h1>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                <Calendar size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Membro dal {new Date(activeProfile.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {/* Bio */}
              <div className="mt-3">
                {editingBio ? (
                  <div className="flex items-center gap-2">
                    <input value={bio} onChange={e => setBio(e.target.value)} maxLength={200} className="flex-1 bg-secondary text-foreground text-sm px-3 py-1.5 rounded-lg border border-border focus:border-primary focus:outline-none" placeholder="Scrivi qualcosa su di te..." />
                    <button onClick={saveBio} className="text-primary hover:text-primary/80"><Save size={16} /></button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setEditingBio(true)}>
                    {bio || "Clicca per aggiungere una bio..."} <Edit3 size={12} className="inline ml-1" />
                  </p>
                )}
              </div>
            </div>
            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={Eye} label="Anime" value={String(watchlist.length)} />
              <StatCard icon={Trophy} label="Episodi" value={String(watchedEps)} />
              <StatCard icon={Clock} label="Ore" value={String(watchHours)} />
              <StatCard icon={Star} label="Voto medio" value={String(avgRating)} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="gradient-card rounded-xl border border-border p-5 sm:p-6">
          {tab === "overview" && (
            <div className="space-y-8">
              {/* Genre breakdown */}
              {genreStats.length > 0 && (
                <div>
                  <h3 className="text-sm font-display font-bold text-foreground mb-3">Generi preferiti</h3>
                  <div className="space-y-2">
                    {genreStats.slice(0, 5).map(([genre, count]) => (
                      <div key={genre} className="flex items-center gap-3">
                        <span className="text-xs text-foreground w-24 truncate">{genre}</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(count / (genreStats[0]?.[1] || 1)) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue watching */}
              {continueWatching.length > 0 && (
                <div>
                  <h3 className="text-sm font-display font-bold text-foreground mb-3">Continua a guardare</h3>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {continueWatching.slice(0, 6).map(item => {
                      const anime = animeList.find(a => a.id === item.animeId);
                      if (!anime) return null;
                      return (
                        <Link key={item.animeId} to={`/watch/${item.animeId}/${item.seasonId}/${item.episodeId}`} className="flex-shrink-0 w-36">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-secondary mb-1.5">
                            <img src={anime.cover} alt={anime.title} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-medium text-foreground truncate">{anime.title}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top rated */}
              {topRated.length > 0 && (
                <div>
                  <h3 className="text-sm font-display font-bold text-foreground mb-3">I tuoi preferiti</h3>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {topRated.map((anime: any) => anime && <AnimeCard key={anime.id} anime={anime} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "watchlist" && (
            <div>
              <h3 className="text-sm font-display font-bold text-foreground mb-4">La mia lista ({watchlistAnime.length} anime)</h3>
              {watchlistAnime.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessun anime nella lista. <Link to="/explore" className="text-primary hover:underline">Esplora il catalogo</Link></p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {watchlistAnime.map((anime, i) => <AnimeCard key={anime.id} anime={anime} index={i} />)}
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div>
              <h3 className="text-sm font-display font-bold text-foreground mb-4">I tuoi voti ({ratingValues.length})</h3>
              {ratingValues.length === 0 ? (
                <p className="text-sm text-muted-foreground">Non hai ancora votato nessun anime.</p>
              ) : (
                <div className="space-y-6">
                  {/* Distribution */}
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-2">Distribuzione voti</h4>
                    <div className="flex items-end gap-1 h-20">
                      {[1, 2, 3, 4, 5].map(star => {
                        const count = ratingValues.filter(v => v === star).length;
                        const max = Math.max(...[1, 2, 3, 4, 5].map(s => ratingValues.filter(v => v === s).length), 1);
                        return (
                          <div key={star} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-secondary rounded-t" style={{ height: `${(count / max) * 100}%`, minHeight: 4 }}>
                              <div className="w-full h-full bg-primary/60 rounded-t" />
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Star size={10} className="text-primary" fill="currentColor" />
                              <span className="text-[10px] text-muted-foreground">{star}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rated anime list */}
                  <div className="space-y-2">
                    {Object.entries(ratings).sort(([, a], [, b]) => b - a).map(([id, rating]) => {
                      const anime = animeList.find(a => a.id === id);
                      if (!anime) return null;
                      return (
                        <Link key={id} to={`/anime/${id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="w-8 h-12 rounded overflow-hidden bg-secondary flex-shrink-0">
                            <img src={anime.cover} alt={anime.title} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-foreground flex-1 truncate">{anime.title}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} size={12} className={i < rating ? "text-primary" : "text-muted-foreground/30"} fill={i < rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "activity" && (
            <div>
              <h3 className="text-sm font-display font-bold text-foreground mb-4">Attività recente</h3>
              {activity.length === 0 && continueWatching.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna attività recente.</p>
              ) : (
                <div className="space-y-3">
                  {continueWatching.slice(0, 20).map((item, i) => {
                    const anime = animeList.find(a => a.id === item.animeId);
                    if (!anime) return null;
                    const season = anime.seasons.find(s => s.id === item.seasonId);
                    const episode = season?.episodes.find(e => e.id === item.episodeId);
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                        <Eye size={14} className="text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">
                            Hai guardato <span className="font-medium">{anime.title}</span> - Ep. {episode?.number}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-3 text-center">
      <Icon size={16} className="text-primary mx-auto mb-1" />
      <p className="text-lg font-display font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default ProfilePage;
