#!/bin/bash
# ══════════════════════════════════════════════════════
#  AniStream — Setup App Android (Capacitor)
#  Da eseguire UNA VOLTA nella root del progetto
# ══════════════════════════════════════════════════════

set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
echo -e "${CYAN}  📱 AniStream — Setup Android App${NC}"
echo ""

# ── 1. Installa dipendenze Capacitor ─────────────────
log "Installazione pacchetti Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/status-bar @capacitor/splash-screen

# ── 2. Inizializza Capacitor (se non ancora fatto) ───
if [ ! -f "capacitor.config.ts" ]; then
    warn "capacitor.config.ts non trovato, copia il file fornito nel deploy."
    exit 1
fi

# ── 3. Build React ────────────────────────────────────
log "Build React (Vite)..."
npm run build

# ── 4. Aggiungi piattaforma Android ──────────────────
if [ ! -d "android" ]; then
    log "Aggiunta piattaforma Android..."
    npx cap add android
else
    log "Cartella android già presente."
fi

# ── 5. Sincronizza build con Android ─────────────────
log "Sincronizzazione con Android..."
npx cap sync android

# ── 6. Permessi Internet in AndroidManifest ───────────
MANIFEST="android/app/src/main/AndroidManifest.xml"
if ! grep -q "INTERNET" "$MANIFEST"; then
    log "Aggiunta permesso INTERNET nel manifest..."
    sed -i 's|<manifest|<manifest\n    <uses-permission android:name="android.permission.INTERNET" />|' "$MANIFEST"
fi

# ── 7. Configura cleartext (HTTP locale) ─────────────
NETWORK_CONFIG="android/app/src/main/res/xml/network_security_config.xml"
mkdir -p "android/app/src/main/res/xml"
cat > "$NETWORK_CONFIG" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Permetti HTTP verso il server locale -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.95</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
EOF
log "Network security config creata."

echo ""
log "✅ Setup Android completato!"
echo ""
info "Prossimi passi:"
info "  1. Apri Android Studio: npx cap open android"
info "  2. Collega il telefono Android via USB (abilita debug USB)"
info "  3. Build APK: Build → Build Bundle(s)/APK(s) → Build APK"
info "  4. APK si trova in: android/app/build/outputs/apk/debug/"
echo ""
info "Per ricompilare dopo modifiche al codice:"
info "  npm run build && npx cap sync android"
echo ""
