import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Check, X, Crown, Zap, Star, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "€0",
    period: "",
    icon: Zap,
    color: "text-muted-foreground",
    borderColor: "border-border",
    features: [
      { text: "Qualità fino a 720p", included: true },
      { text: "Solo doppiaggio (se disponibile)", included: true },
      { text: "Sottotitoli disponibili", included: true },
      { text: "Pubblicità (4-8 ads per episodio)", included: true },
      { text: "1 profilo", included: true },
      { text: "1 dispositivo simultaneo", included: true },
      { text: "Download offline", included: false },
      { text: "Audio originale giapponese", included: false },
      { text: "Accesso anticipato", included: false },
      { text: "Qualità 4K", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "€11.99",
    priceAnnual: "€119.99",
    period: "/mese",
    icon: Star,
    color: "text-primary",
    borderColor: "border-primary/40",
    badge: "Più popolare",
    features: [
      { text: "Qualità fino a 1080p Full HD", included: true },
      { text: "Tutti gli audio disponibili", included: true },
      { text: "Tutti i sottotitoli", included: true },
      { text: "Senza pubblicità", included: true },
      { text: "4 profili", included: true },
      { text: "2 dispositivi simultanei", included: true },
      { text: "Download offline (100 episodi)", included: true },
      { text: "Audio 5.1 surround", included: true },
      { text: "Accesso anticipato +24h", included: true },
      { text: "Qualità 4K", included: false },
    ],
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    price: "€17.99",
    priceAnnual: "€179.99",
    period: "/mese",
    icon: Crown,
    color: "text-yellow-400",
    borderColor: "border-yellow-400/40",
    features: [
      { text: "Qualità fino a 4K UHD", included: true },
      { text: "Tutti gli audio disponibili", included: true },
      { text: "Tutti i sottotitoli", included: true },
      { text: "Senza pubblicità", included: true },
      { text: "6 profili", included: true },
      { text: "4 dispositivi simultanei", included: true },
      { text: "Download offline (250 episodi)", included: true },
      { text: "Audio Dolby Atmos", included: true },
      { text: "Accesso simultaneo con JP (+0h)", included: true },
      { text: "Qualità 4K HDR", included: true },
    ],
  },
];

const SUB_KEY = "anistream-subscription";

function getCurrentPlan(): string {
  return localStorage.getItem(SUB_KEY) || "free";
}

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(getCurrentPlan);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) return;
    if (planId === "free") {
      // Downgrade
      localStorage.setItem(SUB_KEY, planId);
      setCurrentPlan(planId);
      toast.success("Piano cambiato a Free. Le modifiche saranno effettive al prossimo ciclo.");
    } else {
      setShowUpgradeModal(planId);
    }
  };

  const confirmUpgrade = () => {
    if (!showUpgradeModal) return;
    localStorage.setItem(SUB_KEY, showUpgradeModal);
    setCurrentPlan(showUpgradeModal);
    setShowUpgradeModal(null);
    toast.success("Piano aggiornato con successo!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">Scegli il tuo piano</h1>
          <p className="text-muted-foreground text-sm">Guarda anime senza limiti con il piano giusto per te</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${billing === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Mensile</span>
            <button onClick={() => setBilling(prev => prev === "monthly" ? "annual" : "monthly")}
              className={`relative w-12 h-6 rounded-full transition-colors ${billing === "annual" ? "bg-primary" : "bg-secondary"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${billing === "annual" ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-sm ${billing === "annual" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              Annuale <span className="text-primary text-xs font-medium ml-1">-17%</span>
            </span>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {PLANS.map(plan => {
            const isCurrentPlan = currentPlan === plan.id;
            const price = billing === "annual" && plan.priceAnnual ? plan.priceAnnual : plan.price;
            const period = billing === "annual" && plan.priceAnnual ? "/anno" : plan.period;

            return (
              <div key={plan.id} className={`relative gradient-card rounded-2xl border-2 p-6 transition-all ${isCurrentPlan ? plan.borderColor + " ring-1 ring-primary/20" : "border-border hover:border-primary/20"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-6">
                  <plan.icon size={28} className={`${plan.color} mx-auto mb-2`} />
                  <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-display font-bold text-foreground">{price}</span>
                    {period && <span className="text-sm text-muted-foreground">{period}</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {f.included ? (
                        <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={14} className="text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${f.included ? "text-foreground" : "text-muted-foreground/50"}`}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isCurrentPlan
                      ? "bg-secondary text-muted-foreground cursor-default"
                      : plan.id === "premium"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}>
                  {isCurrentPlan ? "Piano attuale" : plan.id === "free" ? "Downgrade" : "Scegli piano"}
                </button>
              </div>
            );
          })}
        </div>

        {/* 14-day trial notice */}
        <div className="text-center mt-8 gradient-card rounded-xl border border-border p-6">
          <Crown size={24} className="text-yellow-400 mx-auto mb-2" />
          <h3 className="text-sm font-display font-bold text-foreground mb-1">14 giorni di prova gratuita</h3>
          <p className="text-xs text-muted-foreground mb-3">Prova Premium gratis per 2 settimane. Cancella in qualsiasi momento.</p>
          {currentPlan === "free" && (
            <button onClick={() => { handleSelectPlan("premium"); toast.info("La prova gratuita inizia ora!"); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
              Inizia prova gratuita <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Current subscription info */}
        {currentPlan !== "free" && (
          <div className="mt-6 gradient-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-display font-bold text-foreground mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" /> Il tuo abbonamento
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Piano</span><span className="text-foreground font-medium">{PLANS.find(p => p.id === currentPlan)?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ciclo</span><span className="text-foreground">{billing === "annual" ? "Annuale" : "Mensile"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Prossimo rinnovo</span><span className="text-foreground">{new Date(Date.now() + 30 * 86400000).toLocaleDateString('it-IT')}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setShowUpgradeModal(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">Conferma upgrade</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Stai per passare al piano <span className="text-primary font-medium">{PLANS.find(p => p.id === showUpgradeModal)?.name}</span>.
              Il pagamento sarà processato al momento della configurazione del server.
            </p>
            <div className="flex gap-2">
              <button onClick={confirmUpgrade} className="flex-1 bg-primary text-primary-foreground font-medium py-2.5 rounded-lg text-sm">Conferma</button>
              <button onClick={() => setShowUpgradeModal(null)} className="flex-1 bg-secondary text-secondary-foreground font-medium py-2.5 rounded-lg text-sm">Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
