import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useProfile, AVATAR_OPTIONS } from "@/hooks/useProfile";
import { Settings, User, Monitor, Bell, Shield, Key, CreditCard, Trash2, Plus, Save, LogOut, Download, Upload, Smartphone, Globe, Eye, EyeOff, Lock, Clock, Volume2, Languages } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const QUALITY_OPTIONS = ["Auto", "480p", "720p", "1080p", "4K"];
const AUDIO_OPTIONS = ["Italiano (Doppiaggio)", "Inglese (Doppiaggio)", "Giapponese (Originale)"];
const SUB_OPTIONS = ["Italiano", "Inglese", "Nessuno"];
const AUTOPLAY_TIMERS = [0, 3, 5, 10];
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const LANGUAGES = ["Italiano", "English", "Español", "Deutsch", "Français", "日本語"];
const AGE_RESTRICTIONS = [
  { value: "adult", label: "Adulto (tutti i contenuti)" },
  { value: "teen", label: "Teen (13+)" },
  { value: "kid", label: "Bambino (solo contenuti per tutti)" },
];

const SETTINGS_KEY = "anistream-settings";

interface AppSettings {
  defaultQuality: string;
  defaultAudio: string;
  defaultSubtitles: string;
  autoplayTimer: number;
  skipIntro: boolean;
  skipOutro: boolean;
  defaultSpeed: number;
  theaterDefault: boolean;
  resumePlayback: "always" | "ask" | "never";
  interfaceLang: string;
  profileVisibility: "public" | "private";
  showActivity: boolean;
  commentsVisibility: "public" | "private";
  receiveMessages: "anyone" | "friends" | "none";
  emailNotifications: boolean;
  episodeNotifications: boolean;
  commentNotifications: boolean;
  promotionNotifications: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  digestFrequency: "daily" | "weekly" | "never";
  dataCollection: boolean;
  subtitleSize: string;
  subtitleFont: string;
  subtitleColor: string;
  subtitleBg: string;
}

const defaultSettings: AppSettings = {
  defaultQuality: "Auto",
  defaultAudio: "Giapponese (Originale)",
  defaultSubtitles: "Italiano",
  autoplayTimer: 5,
  skipIntro: false,
  skipOutro: false,
  defaultSpeed: 1,
  theaterDefault: false,
  resumePlayback: "always",
  interfaceLang: "Italiano",
  profileVisibility: "private",
  showActivity: false,
  commentsVisibility: "public",
  receiveMessages: "anyone",
  emailNotifications: false,
  episodeNotifications: true,
  commentNotifications: true,
  promotionNotifications: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  digestFrequency: "weekly",
  dataCollection: false,
  subtitleSize: "normal",
  subtitleFont: "Arial",
  subtitleColor: "white",
  subtitleBg: "semi",
};

function loadSettings(): AppSettings {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return defaultSettings; }
}

type Tab = "profiles" | "general" | "video" | "privacy" | "notifications" | "security" | "subscription" | "devices" | "danger";

const SettingsPage = () => {
  const { profiles, activeProfile, createProfile, deleteProfile, logout } = useProfile();
  const [tab, setTab] = useState<Tab>("profiles");
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [newAgeRestr, setNewAgeRestr] = useState("adult");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [parentalPin, setParentalPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleCreateProfile = () => {
    if (newName.trim().length < 2) return;
    createProfile(newName, newAvatar);
    setNewName(""); setCreating(false);
    toast.success("Profilo creato!");
  };

  const handleExport = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("anistream-")) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "anistream-data.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Dati esportati!");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith("anistream-") && typeof value === "string") localStorage.setItem(key, value);
        });
        toast.success("Dati importati! Ricarica la pagina.");
        setTimeout(() => window.location.reload(), 1500);
      } catch { toast.error("File non valido"); }
    };
    input.click();
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profiles", label: "Profili", icon: User },
    { id: "general", label: "Generali", icon: Globe },
    { id: "video", label: "Video", icon: Monitor },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifiche", icon: Bell },
    { id: "security", label: "Sicurezza", icon: Key },
    { id: "devices", label: "Dispositivi", icon: Smartphone },
    { id: "subscription", label: "Abbonamento", icon: CreditCard },
    { id: "danger", label: "Account", icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
          <Settings size={28} className="text-primary" /> Impostazioni
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-56 flex-shrink-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible scrollbar-hide">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 gradient-card rounded-xl border border-border p-5 sm:p-6">
            {/* Profiles */}
            {tab === "profiles" && (
              <div>
                <h2 className="text-lg font-display font-bold text-foreground mb-4">Gestione Profili</h2>
                <p className="text-xs text-muted-foreground mb-2">Massimo 6 profili per account. Ogni profilo ha preferenze e cronologia separate.</p>
                <p className="text-xs text-muted-foreground mb-6">Profilo attivo: <span className="text-primary font-medium">{activeProfile?.name || "Nessuno"}</span></p>

                <div className="space-y-3 mb-6">
                  {profiles.map(p => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${p.id === activeProfile?.id ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                      <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        {p.id === activeProfile?.id && <span className="text-[10px] text-primary">Attivo</span>}
                      </div>
                      <button onClick={() => setConfirmDelete(p.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>

                {profiles.length < 6 && !creating && (
                  <button onClick={() => setCreating(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
                    <Plus size={16} /> Aggiungi profilo
                  </button>
                )}

                {creating && (
                  <div className="border border-border rounded-lg p-4 animate-fade-in space-y-3">
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_OPTIONS.map(char => (
                        <button key={char.name} onClick={() => setNewAvatar(char.url)} className={`rounded-lg overflow-hidden aspect-square ${newAvatar === char.url ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"}`}>
                          <img src={char.url} alt={char.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome profilo" className="w-full bg-secondary text-foreground text-sm px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none" maxLength={20} />
                    <select value={newAgeRestr} onChange={e => setNewAgeRestr(e.target.value)} className="w-full bg-secondary text-foreground text-sm px-4 py-2 rounded-lg border border-border">
                      {AGE_RESTRICTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <div>
                      <label className="text-xs text-muted-foreground">PIN parentale (opzionale)</label>
                      <div className="relative mt-1">
                        <input type={showPin ? "text" : "password"} value={parentalPin} onChange={e => setParentalPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4 cifre" className="w-full bg-secondary text-foreground text-sm px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none" maxLength={4} />
                        <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCreateProfile} disabled={newName.trim().length < 2} className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">Crea</button>
                      <button onClick={() => setCreating(false)} className="bg-secondary text-secondary-foreground text-sm px-4 py-2 rounded-lg">Annulla</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General */}
            {tab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Generali</h2>
                <SettingRow label="Lingua interfaccia">
                  <select value={settings.interfaceLang} onChange={e => updateSetting("interfaceLang", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </SettingRow>
                <SettingRow label="Lingua sottotitoli predefinita">
                  <select value={settings.defaultSubtitles} onChange={e => updateSetting("defaultSubtitles", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border">
                    {SUB_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </SettingRow>
                <SettingRow label="Audio predefinito">
                  <select value={settings.defaultAudio} onChange={e => updateSetting("defaultAudio", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border">
                    {AUDIO_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </SettingRow>
              </div>
            )}

            {/* Video & Playback */}
            {tab === "video" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Video e Riproduzione</h2>
                <SettingRow label="Qualità predefinita"><select value={settings.defaultQuality} onChange={e => updateSetting("defaultQuality", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border">{QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}</select></SettingRow>
                <SettingRow label="Timer autoplay"><select value={settings.autoplayTimer} onChange={e => updateSetting("autoplayTimer", parseInt(e.target.value))} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border">{AUTOPLAY_TIMERS.map(t => <option key={t} value={t}>{t === 0 ? "Disattivato" : `${t} secondi`}</option>)}</select></SettingRow>
                <SettingRow label="Skip intro automatico"><Toggle checked={settings.skipIntro} onChange={v => updateSetting("skipIntro", v)} /></SettingRow>
                <SettingRow label="Skip outro automatico"><Toggle checked={settings.skipOutro} onChange={v => updateSetting("skipOutro", v)} /></SettingRow>
                <SettingRow label="Velocità predefinita"><select value={settings.defaultSpeed} onChange={e => updateSetting("defaultSpeed", parseFloat(e.target.value))} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border">{SPEED_OPTIONS.map(s => <option key={s} value={s}>{s}x</option>)}</select></SettingRow>
                <SettingRow label="Modalità teatro di default"><Toggle checked={settings.theaterDefault} onChange={v => updateSetting("theaterDefault", v)} /></SettingRow>
                <SettingRow label="Riprendi riproduzione"><select value={settings.resumePlayback} onChange={e => updateSetting("resumePlayback", e.target.value as any)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="always">Sempre</option><option value="ask">Chiedi</option><option value="never">Mai</option></select></SettingRow>
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Sottotitoli</h3>
                  <div className="space-y-4">
                    <SettingRow label="Dimensione"><select value={settings.subtitleSize} onChange={e => updateSetting("subtitleSize", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="small">Piccoli</option><option value="normal">Normali</option><option value="large">Grandi</option><option value="xlarge">Extra Grandi</option></select></SettingRow>
                    <SettingRow label="Font"><select value={settings.subtitleFont} onChange={e => updateSetting("subtitleFont", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="Arial">Arial</option><option value="Comic Sans MS">Comic Sans</option><option value="Courier New">Monospace</option><option value="Georgia">Georgia</option></select></SettingRow>
                    <SettingRow label="Colore"><select value={settings.subtitleColor} onChange={e => updateSetting("subtitleColor", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="white">Bianco</option><option value="yellow">Giallo</option><option value="lime">Verde</option><option value="cyan">Ciano</option></select></SettingRow>
                    <SettingRow label="Sfondo"><select value={settings.subtitleBg} onChange={e => updateSetting("subtitleBg", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="none">Nessuno</option><option value="semi">Semi-trasparente</option><option value="opaque">Opaco</option></select></SettingRow>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {tab === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Privacy</h2>
                <SettingRow label="Visibilità profilo"><select value={settings.profileVisibility} onChange={e => updateSetting("profileVisibility", e.target.value as any)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="public">Pubblico</option><option value="private">Privato</option></select></SettingRow>
                <SettingRow label="Mostra attività pubblicamente"><Toggle checked={settings.showActivity} onChange={v => updateSetting("showActivity", v)} /></SettingRow>
                <SettingRow label="Visibilità commenti"><select value={settings.commentsVisibility} onChange={e => updateSetting("commentsVisibility", e.target.value as any)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="public">Pubblico</option><option value="private">Privato</option></select></SettingRow>
                <SettingRow label="Ricevi messaggi da"><select value={settings.receiveMessages} onChange={e => updateSetting("receiveMessages", e.target.value as any)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="anyone">Chiunque</option><option value="friends">Solo amici</option><option value="none">Nessuno</option></select></SettingRow>
                <SettingRow label="Raccolta dati analytics"><Toggle checked={settings.dataCollection} onChange={v => updateSetting("dataCollection", v)} /></SettingRow>
                <p className="text-[10px] text-muted-foreground">Conforme al GDPR. I tuoi dati non vengono mai condivisi con terze parti.</p>
              </div>
            )}

            {/* Notifications */}
            {tab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Notifiche</h2>
                <SettingRow label="Notifiche email"><Toggle checked={settings.emailNotifications} onChange={v => updateSetting("emailNotifications", v)} /></SettingRow>
                <SettingRow label="Nuovi episodi"><Toggle checked={settings.episodeNotifications} onChange={v => updateSetting("episodeNotifications", v)} /></SettingRow>
                <SettingRow label="Risposte ai commenti"><Toggle checked={settings.commentNotifications} onChange={v => updateSetting("commentNotifications", v)} /></SettingRow>
                <SettingRow label="Promozioni"><Toggle checked={settings.promotionNotifications} onChange={v => updateSetting("promotionNotifications", v)} /></SettingRow>
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2"><Clock size={14} /> Ore di silenzio</h3>
                  <div className="flex items-center gap-3">
                    <input type="time" value={settings.quietHoursStart} onChange={e => updateSetting("quietHoursStart", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border" />
                    <span className="text-xs text-muted-foreground">—</span>
                    <input type="time" value={settings.quietHoursEnd} onChange={e => updateSetting("quietHoursEnd", e.target.value)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border" />
                  </div>
                </div>
                <SettingRow label="Frequenza digest"><select value={settings.digestFrequency} onChange={e => updateSetting("digestFrequency", e.target.value as any)} className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border"><option value="daily">Giornaliero</option><option value="weekly">Settimanale</option><option value="never">Mai</option></select></SettingRow>
              </div>
            )}

            {/* Security */}
            {tab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Sicurezza</h2>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Key size={14} className="text-primary" /> Autenticazione a due fattori</h3>
                  <p className="text-xs text-muted-foreground mb-3">Aggiungi un ulteriore livello di sicurezza al tuo account.</p>
                  <button className="bg-primary/15 text-primary text-xs font-medium px-4 py-2 rounded-lg hover:bg-primary/25 transition-colors">Configura 2FA</button>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-sm font-medium text-foreground mb-2">Cronologia accessi</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div><p className="text-foreground">Questo dispositivo</p><p className="text-muted-foreground">Web • Ora</p></div>
                      <span className="text-green-400 text-[10px]">Attivo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Devices */}
            {tab === "devices" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Dispositivi connessi</h2>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border flex items-center gap-3">
                  <Smartphone size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Questo browser</p>
                    <p className="text-xs text-muted-foreground">Web • Attivo ora</p>
                  </div>
                  <span className="text-green-400 text-[10px] bg-green-400/10 px-2 py-0.5 rounded-full">Attivo</span>
                </div>
                <p className="text-xs text-muted-foreground">Le sessioni attive verranno gestite dal server quando configurato.</p>
              </div>
            )}

            {/* Subscription */}
            {tab === "subscription" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Abbonamento</h2>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-sm text-foreground mb-1">Piano attuale: <span className="text-primary font-medium">{localStorage.getItem("anistream-subscription") || "Free"}</span></p>
                  <p className="text-xs text-muted-foreground">Gestisci il tuo piano e i metodi di pagamento.</p>
                </div>
                <Link to="/subscription" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <CreditCard size={14} /> Gestisci abbonamento
                </Link>
              </div>
            )}

            {/* Danger zone */}
            {tab === "danger" && (
              <div className="space-y-6">
                <h2 className="text-lg font-display font-bold text-foreground">Account</h2>
                <button onClick={() => { logout(); toast.success("Disconnesso!"); }} className="w-full bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium px-4 py-2.5 rounded-lg transition-colors text-left flex items-center gap-2">
                  <LogOut size={14} /> Cambia profilo
                </button>

                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Dati</h3>
                  <div className="flex gap-2">
                    <button onClick={handleExport} className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm px-4 py-2 rounded-lg transition-colors"><Download size={14} /> Esporta (JSON)</button>
                    <button onClick={handleImport} className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm px-4 py-2 rounded-lg transition-colors"><Upload size={14} /> Importa</button>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-destructive mb-3">Zona pericolosa</h3>
                  <div className="space-y-2">
                    <button onClick={() => setConfirmDeactivate(true)} className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors text-left">
                      Disattiva account (30 giorni recovery)
                    </button>
                    <button onClick={() => setConfirmDeleteAccount(true)} className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium px-4 py-2 rounded-lg transition-colors text-left">
                      Elimina account permanentemente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete profile modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-xs w-full shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-foreground mb-4">Eliminare questo profilo? La cronologia e le preferenze saranno perse.</p>
            <div className="flex gap-2">
              <button onClick={() => { deleteProfile(confirmDelete); setConfirmDelete(null); toast.success("Profilo eliminato"); }} className="flex-1 bg-destructive text-destructive-foreground font-medium py-2 rounded-lg text-sm">Elimina</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-secondary text-secondary-foreground font-medium py-2 rounded-lg text-sm">Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate modal */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setConfirmDeactivate(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground mb-2">Disattiva account</h3>
            <p className="text-xs text-muted-foreground mb-4">Il tuo account sarà disattivato per 30 giorni. Potrai riattivarlo effettuando il login.</p>
            <div className="flex gap-2">
              <button onClick={() => { setConfirmDeactivate(false); toast.success("Account disattivato. Hai 30 giorni per riattivarlo."); }} className="flex-1 bg-yellow-500 text-white font-medium py-2 rounded-lg text-sm">Disattiva</button>
              <button onClick={() => setConfirmDeactivate(false)} className="flex-1 bg-secondary text-secondary-foreground font-medium py-2 rounded-lg text-sm">Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      {confirmDeleteAccount && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setConfirmDeleteAccount(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-destructive mb-2">Elimina account permanentemente</h3>
            <p className="text-xs text-muted-foreground mb-4">Questa azione è irreversibile. Tutti i tuoi dati, profili, cronologia e preferenze saranno cancellati.</p>
            <div className="flex gap-2">
              <button onClick={() => { localStorage.clear(); setConfirmDeleteAccount(false); toast.success("Account eliminato."); setTimeout(() => window.location.reload(), 1500); }} className="flex-1 bg-destructive text-destructive-foreground font-medium py-2 rounded-lg text-sm">Elimina tutto</button>
              <button onClick={() => setConfirmDeleteAccount(false)} className="flex-1 bg-secondary text-secondary-foreground font-medium py-2 rounded-lg text-sm">Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default SettingsPage;
