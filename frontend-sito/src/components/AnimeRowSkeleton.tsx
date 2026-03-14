import type { LucideIcon } from "lucide-react";

interface AnimeRowSkeletonProps {
  title: string;
  icon?: LucideIcon;
}

const AnimeRowSkeleton = ({ title, icon: Icon }: AnimeRowSkeletonProps) => {
  return (
    <section className="py-5 sm:py-7 lg:py-9">
      <div className="flex items-center gap-2.5 mb-4 sm:mb-5 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon size={18} className="text-primary" />
          </div>
        )}
        <h2 className="text-base sm:text-lg lg:text-xl font-display font-bold text-foreground tracking-tight">{title}</h2>
      </div>
      <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[135px] sm:w-[155px] md:w-[175px] lg:w-[195px] xl:w-[210px]">
            <div className="aspect-[2/3] rounded-xl shimmer mb-2.5" />
            <div className="h-3.5 sm:h-4 shimmer rounded-lg mb-1.5 w-3/4" />
            <div className="h-2.5 sm:h-3 shimmer rounded-lg w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnimeRowSkeleton;
