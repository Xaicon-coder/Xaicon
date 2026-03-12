import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { useAnimeById } from "@/hooks/useAnimeApi";

const WatchPage = () => {
  const { animeId, seasonId, episodeId } = useParams();
  const { anime } = useAnimeById(animeId || "");

  const season = anime?.seasons.find((s) => s.id === seasonId);
  const episode = season?.episodes.find((e) => e.id === episodeId);
  const episodeIndex = season?.episodes.findIndex((e) => e.id === episodeId) ?? -1;
  const prevEp = episodeIndex > 0 ? season?.episodes[episodeIndex - 1] ?? null : null;
  const nextEp = season && episodeIndex < season.episodes.length - 1 ? season.episodes[episodeIndex + 1] : null;

  if (!anime || !season || !episode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">Episodio non trovato</h1>
          <Link to="/" className="text-primary hover:underline text-sm">Torna alla home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <VideoPlayer
          anime={anime}
          season={season}
          episode={episode}
          prevEp={prevEp}
          nextEp={nextEp}
        />

        {/* Info sotto il video */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-display font-bold text-foreground">{anime.title}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-0.5 sm:mt-1">
                Stagione {season.number} • Episodio {episode.number} - {episode.title}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {prevEp && (
                <Link to={`/watch/${anime.id}/${season.id}/${prevEp.id}`}
                  className="inline-flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors">
                  <ChevronLeft size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> Precedente
                </Link>
              )}
              {nextEp && (
                <Link to={`/watch/${anime.id}/${season.id}/${nextEp.id}`}
                  className="inline-flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors">
                  Prossimo <ChevronRight size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </Link>
              )}
            </div>
          </div>

          <h3 className="text-xs sm:text-sm lg:text-base font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
            Altri episodi
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
            {season.episodes.map((ep) => (
              <Link key={ep.id} to={`/watch/${anime.id}/${season.id}/${ep.id}`}
                className={`rounded-lg p-2 sm:p-3 lg:p-4 text-xs sm:text-sm lg:text-base font-medium transition-all border text-center focus:outline-none focus:ring-2 focus:ring-primary ${
                  ep.id === episodeId
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}>
                Ep. {ep.number}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
