import { Play, Plus, Star, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTopAnime } from "@/hooks/useAnimeApi";
import { featuredAnime } from "@/data/animeData";
import { useState, useEffect, useCallback } from "react";
import type { Anime } from "@/data/animeData";

const HeroBanner = () => {
  const { anime: topAnime } = useTopAnime();
  const [featured, setFeatured] = useState<Anime>(featuredAnime);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const heroAnime = topAnime.length > 0 ? topAnime.slice(0, 6) : [featuredAnime];

  useEffect(() => {
    if (topAnime.length > 0) {
      setFeatured(topAnime[0]);
    }
  }, [topAnime]);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setFeatured(heroAnime[index]);
      setTimeout(() => setIsTransitioning(false), 400);
    }, 200);
  }, [heroAnime, isTransitioning]);

  useEffect(() => {
    if (heroAnime.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % heroAnime.length;
      goTo(next);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroAnime.length, currentIndex, isPaused, goTo]);

  return (
    <section
      className="relative w-full h-[56vh] sm:h-[62vh] md:h-[68vh] lg:h-[75vh] xl:h-[80vh] min-h-[420px] max-h-[900px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner image with ken burns effect */}
      <div className="absolute inset-0">
        <img
          key={featured.id}
          src={featured.banner}
          alt={featured.title}
          className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
            isTransitioning ? "opacity-0 scale-105" : "opacity-100 animate-hero-zoom"
          }`}
        />
      </div>

      {/* Multi-layer gradient overlays */}
      <div className="absolute inset-0 gradient-hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div
          className={`max-w-lg sm:max-w-xl lg:max-w-2xl transition-all duration-500 ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
          key={featured.id}
        >
          {/* Badges */}
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
            <span className="gradient-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider">
              In Evidenza
            </span>
            {featured.rating > 0 && (
              <div className="flex items-center gap-1.5 glass px-2.5 py-1 rounded-full">
                <Star size={12} fill="currentColor" className="text-primary sm:w-[14px] sm:h-[14px]" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">{featured.rating}</span>
              </div>
            )}
            {featured.status === "In corso" && (
              <span className="text-[10px] sm:text-xs text-primary font-medium glass px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                In onda
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-3 sm:mb-4 leading-[1.1] tracking-tight">
            {featured.title}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
            {featured.description}
          </p>

          {/* Genres */}
          <div className="flex items-center gap-2 mb-5 sm:mb-7 flex-wrap">
            {featured.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="text-[10px] sm:text-xs text-secondary-foreground glass px-3 py-1 rounded-full border border-border/50">
                {genre}
              </span>
            ))}
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {featured.year} • {featured.seasons.reduce((s, se) => s + se.episodes.length, 0)} episodi
            </span>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to={`/watch/${featured.id}/${featured.seasons[0].id}/${featured.seasons[0].episodes[0].id}`}
              className="inline-flex items-center gap-2 gradient-primary hover:opacity-90 text-primary-foreground font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all glow-primary text-sm sm:text-base group"
            >
              <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
              Guarda ora
            </Link>
            <Link
              to={`/anime/${featured.id}`}
              className="inline-flex items-center gap-2 glass hover:bg-secondary/80 text-foreground font-semibold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-all border border-border/50 text-sm sm:text-base"
            >
              <Info size={16} />
              Dettagli
            </Link>
          </div>

          {/* Dots + progress indicator */}
          {heroAnime.length > 1 && (
            <div className="flex items-center gap-2 mt-6 sm:mt-8">
              {heroAnime.map((anime, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="group relative"
                  aria-label={`Vai a ${anime.title}`}
                >
                  <div className={`h-1 rounded-full transition-all duration-500 ${
                    i === currentIndex ? "w-10 sm:w-12 bg-primary" : "w-2.5 sm:w-3 bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
                  }`} />
                </button>
              ))}
              <span className="text-[10px] text-muted-foreground/50 ml-3 font-medium tabular-nums">
                {currentIndex + 1}/{heroAnime.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
