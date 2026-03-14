import { ChevronRight, ChevronLeft, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import AnimeCard from "./AnimeCard";
import type { Anime } from "@/data/animeData";

interface AnimeRowProps {
  title: string;
  icon: LucideIcon;
  animeList: Anime[];
}

const AnimeRow = ({ title, icon: Icon, animeList }: AnimeRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, [animeList]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-5 sm:py-7 lg:py-9 group/section">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon size={18} className="text-primary" />
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-display font-bold text-foreground tracking-tight">{title}</h2>
        </div>
        <Link
          to="/explore"
          className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium group/link"
        >
          Vedi tutto
          <ChevronRight size={14} className="sm:w-4 sm:h-4 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Scrollable row with navigation arrows */}
      <div className="relative group/scroll">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-strong border border-border/50 flex items-center justify-center text-foreground hover:text-primary transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-strong border border-border/50 flex items-center justify-center text-foreground hover:text-primary transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Edge fade gradients */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-2 max-w-[1800px] mx-auto scroll-smooth"
        >
          {animeList.map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimeRow;
