import { Link } from "react-router-dom";
import { Play, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getContinueWatching, type WatchProgress } from "@/hooks/useWatchProgress";
import { animeList } from "@/data/animeData";

const ContinueWatching = () => {
  const [items, setItems] = useState<WatchProgress[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -el.clientWidth * 0.7 : el.clientWidth * 0.7, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto py-5 sm:py-7">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Play size={18} className="text-primary" />
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-display font-bold text-foreground tracking-tight">
            Continua a guardare
          </h2>
        </div>
        <Link to="/history" className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium group">
          Vedi tutto <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="relative group/scroll">
        {canScrollLeft && (
          <button onClick={() => scroll("left")} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-strong border border-border/50 flex items-center justify-center text-foreground hover:text-primary transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg">
            <ChevronLeft size={18} />
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll("right")} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-strong border border-border/50 flex items-center justify-center text-foreground hover:text-primary transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg">
            <ChevronRight size={18} />
          </button>
        )}

        <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
          {items.map((item) => {
            const anime = animeList.find((a) => a.id === item.animeId);
            if (!anime) return null;
            const season = anime.seasons.find((s) => s.id === item.seasonId);
            const episode = season?.episodes.find((e) => e.id === item.episodeId);
            if (!season || !episode) return null;

            const progressPercent = item.duration > 0 ? Math.round((item.currentTime / item.duration) * 100) : 0;
            const minutesLeft = Math.max(0, Math.ceil((item.duration - item.currentTime) / 60));

            return (
              <Link
                key={item.animeId}
                to={`/watch/${anime.id}/${season.id}/${episode.id}`}
                className="group flex-shrink-0 w-[270px] sm:w-[310px] gradient-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all shadow-card hover:shadow-card-hover"
              >
                <div className="relative aspect-video overflow-hidden bg-secondary">
                  <img
                    src={episode.thumbnail || anime.cover}
                    alt={anime.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 group-focus-visible:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="gradient-primary rounded-full p-3 shadow-lg glow-primary transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play size={18} className="text-primary-foreground" fill="currentColor" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/40">
                    <div
                      className="h-full gradient-primary transition-all rounded-r-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 sm:p-3.5">
                  <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {anime.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ep. {episode.number} - {episode.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mt-1.5">
                    <Clock size={10} />
                    <span>{minutesLeft} min rimanenti</span>
                    <span className="ml-auto text-primary/70 font-medium">{progressPercent}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContinueWatching;
