import { Link } from "react-router-dom";
import { Github, Twitter, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 mt-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="text-xl font-display font-bold text-gradient-primary">AniStream</Link>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-[200px]">
              La tua piattaforma di anime preferita. Guarda migliaia di titoli in alta qualità.
            </p>
            <div className="flex gap-3 mt-4">
              {[Github, Twitter, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">Naviga</h4>
            <div className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/explore", label: "Esplora" },
                { to: "/watchlist", label: "La Mia Lista" },
                { to: "/history", label: "Cronologia" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="block text-xs text-muted-foreground hover:text-primary transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">Account</h4>
            <div className="space-y-2">
              {[
                { to: "/profile", label: "Profilo" },
                { to: "/subscription", label: "Abbonamento" },
                { to: "/settings", label: "Impostazioni" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="block text-xs text-muted-foreground hover:text-primary transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">Legale</h4>
            <div className="space-y-2">
              {["Privacy Policy", "Termini di servizio", "Cookie Policy", "Contatti"].map(label => (
                <a key={label} href="#" className="block text-xs text-muted-foreground hover:text-primary transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} AniStream. Tutti i diritti riservati.</p>
          <p className="text-[10px] text-muted-foreground">Fatto con ❤️ per gli amanti degli anime</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
