import { useState, useEffect } from "react";
import { Bell, X, Check, Trash2, Film, Star, Settings, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

export interface Notification {
  id: string;
  type: "episode" | "recommendation" | "system" | "promotion";
  title: string;
  message: string;
  read: boolean;
  date: number;
  link?: string;
}

const NOTIF_KEY = "anistream-notifications";

function loadNotifications(): Notification[] {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIF_KEY) || "null");
    if (stored) return stored;
  } catch {}
  // Default sample notifications
  const defaults: Notification[] = [
    { id: "n1", type: "episode", title: "Nuovo episodio", message: "Dr. Stone: Science Future - Ep. 5 è ora disponibile!", read: false, date: Date.now() - 3600000, link: "/anime/dr-stone-s4p3" },
    { id: "n2", type: "recommendation", title: "Consigliato per te", message: "Basato sui tuoi gusti, potresti apprezzare Jujutsu Kaisen", read: false, date: Date.now() - 86400000, link: "/anime/jujutsu-kaisen-s1" },
    { id: "n3", type: "system", title: "Benvenuto!", message: "Benvenuto su AniStream! Esplora il catalogo anime.", read: true, date: Date.now() - 172800000 },
    { id: "n4", type: "promotion", title: "Offerta speciale", message: "Prova Premium gratis per 14 giorni!", read: false, date: Date.now() - 259200000, link: "/subscription" },
  ];
  localStorage.setItem(NOTIF_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveNotifications(notifs: Notification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

const ICON_MAP = {
  episode: Film,
  recommendation: Star,
  system: Settings,
  promotion: Megaphone,
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(next);
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      saveNotifications(next);
      return next;
    });
  };

  const formatTime = (date: number) => {
    const diff = Date.now() - date;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min fa`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ore fa`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} giorni fa`;
    return new Date(date).toLocaleDateString('it-IT');
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2">
        <Bell size={18} className="sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 animate-fade-in max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-display font-bold text-foreground">Notifiche</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">Segna tutto letto</button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nessuna notifica</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = ICON_MAP[notif.type];
                  const content = (
                    <div className={`flex items-start gap-3 px-4 py-3 transition-colors group ${!notif.read ? "bg-primary/5" : "hover:bg-secondary/50"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.read ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">{formatTime(notif.date)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {!notif.read && (
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(notif.id); }} className="text-primary p-0.5" title="Segna come letto">
                            <Check size={12} />
                          </button>
                        )}
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotif(notif.id); }} className="text-muted-foreground hover:text-destructive p-0.5">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );

                  if (notif.link) {
                    return (
                      <Link key={notif.id} to={notif.link} onClick={() => { markRead(notif.id); setOpen(false); }}>
                        {content}
                      </Link>
                    );
                  }
                  return <div key={notif.id} onClick={() => markRead(notif.id)} className="cursor-pointer">{content}</div>;
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2">
              <Link to="/settings" onClick={() => setOpen(false)} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                <Settings size={10} /> Gestisci notifiche
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
