import { Star, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import type { Anime } from "@/data/animeData";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

const AnimeCard = ({ anime, index = 0 }: AnimeCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group relative flex-shrink-0 w-[135px] sm:w-[155px] md:w-[175px] lg:w-[195px] xl:w-[210px] 2xl:w-[220px] animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2.5 bg-secondary shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
        {!imgError ? (
          <img
            src={anime.cover}
            alt={anime.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-focus-visible:scale-110 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs text-center p-3 gradient-card">
            {anime.title}
          </div>
        )}

        {/* Shimmer placeholder */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 shimmer" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center justify-center mb-auto mt-auto">
            <div className="gradient-primary rounded-full p-3 shadow-lg glow-primary transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={18} className="text-primary-foreground" fill="currentColor" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/80 mt-2">
            <span>{anime.year}</span>
            <span>•</span>
            <span>{anime.genres[0]}</span>
          </div>
        </div>

        {/* Rating badge */}
        {anime.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 glass rounded-lg px-2 py-0.5 border border-border/30">
            <Star size={9} className="text-primary" fill="currentColor" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-foreground">{anime.rating}</span>
          </div>
        )}

        {/* Status badge */}
        {anime.status === "In corso" && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 text-[9px] font-bold gradient-primary text-primary-foreground px-2 py-0.5 rounded-md uppercase tracking-wider">
              <span className="w-1 h-1 bg-primary-foreground rounded-full animate-pulse" />
              Live
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary group-focus-visible:text-primary transition-colors duration-200">
        {anime.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
        {anime.year} • {anime.seasons.length} Stagion{anime.seasons.length > 1 ? "i" : "e"}
      </p>
    </Link>
  );
};

export default AnimeCard;
