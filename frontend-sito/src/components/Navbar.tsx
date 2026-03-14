import { Search, Menu, X, Bookmark, Compass, LogOut, Settings, Clock, User, Crown, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAnimeSearch } from "@/hooks/useAnimeApi";
import { useProfile } from "@/hooks/useProfile";
import NotificationCenter from "@/components/NotificationCenter";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: null },
  { to: "/explore", label: "Esplora", icon: Compass },
  { to: "/watchlist", label: "La Mia Lista", icon: Bookmark },
  { to: "/history", label: "Cronologia", icon: Clock },
];

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { results, loading } = useAnimeSearch(query);
  const { activeProfile, logout } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "glass-strong border-b border-border/50 shadow-lg" : "bg-gradient-to-b from-background/80 to-transparent"
    }`}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-5 sm:gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl sm:text-2xl font-display font-bold text-gradient-primary group-hover:opacity-80 transition-opacity">
              AniStream
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search */}
          {searchOpen ? (
            <div className="relative flex items-center gap-2 animate-slide-in">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca anime..."
                  className="bg-secondary text-foreground text-sm pl-9 pr-4 py-2 rounded-xl border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 w-44 sm:w-56 md:w-72 transition-all"
                  autoFocus
                />
              </div>
              <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X size={16} />
              </button>

              {/* Search results dropdown */}
              {query.length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 glass-strong border border-border/50 rounded-2xl shadow-2xl overflow-hidden max-h-80 sm:max-h-96 overflow-y-auto z-50 scrollbar-thin">
                  {loading && <div className="p-5 text-center text-muted-foreground text-sm">Cercando...</div>}
                  {!loading && results.length === 0 && <div className="p-5 text-center text-muted-foreground text-sm">Nessun risultato</div>}
                  {results.map((anime) => (
                    <button
                      key={anime.id}
                      onClick={() => { navigate(`/anime/${anime.id}`); setSearchOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-secondary/60 transition-colors text-left group"
                    >
                      <div className="w-9 h-13 sm:w-10 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-secondary shadow-sm">
                        <img src={anime.cover} alt={anime.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{anime.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{anime.year}</span>
                          <div className="flex items-center gap-0.5">
                            <Star size={9} fill="currentColor" className="text-primary" />
                            <span className="text-[10px] text-muted-foreground">{anime.rating}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary/50">
              <Search size={18} />
            </button>
          )}

          {/* Notifications */}
          <NotificationCenter />

          {/* User menu */}
          {activeProfile && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors bg-secondary">
                  <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
                </div>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-3 w-56 glass-strong border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-in z-50">
                    <div className="px-4 py-3.5 border-b border-border/50">
                      <div className="flex items-center gap-2.5">
                        <img src={activeProfile.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{activeProfile.name}</p>
                          <p className="text-[10px] text-muted-foreground">Piano: {localStorage.getItem("anistream-subscription") || "Free"}</p>
                        </div>
                      </div>
                    </div>
                    {[
                      { to: "/profile", icon: User, label: "Il mio profilo" },
                      { to: "/watchlist", icon: Bookmark, label: "La mia lista" },
                      { to: "/history", icon: Clock, label: "Cronologia" },
                      { to: "/subscription", icon: Crown, label: "Abbonamento" },
                      { to: "/settings", icon: Settings, label: "Impostazioni" },
                    ].map(({ to, icon: ItemIcon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                      >
                        <ItemIcon size={15} />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-border/50">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                      >
                        <LogOut size={15} />
                        Cambia profilo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary/50">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/50 glass-strong animate-fade-in-fast">
          <div className="px-4 py-3 space-y-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                    active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {label}
                </Link>
              );
            })}
            <div className="border-t border-border/50 mt-2 pt-2">
              {[
                { to: "/profile", icon: User, label: "Profilo" },
                { to: "/subscription", icon: Crown, label: "Abbonamento" },
                { to: "/settings", icon: Settings, label: "Impostazioni" },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
