#!/bin/bash
# ══════════════════════════════════════════════════════
#  AniStream — Script Deploy
#  Uso:  chmod +x deploy.sh  →  ./deploy.sh [comando]
# ══════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✘]${NC} $1"; exit 1; }

check_deps() {
    command -v docker >/dev/null 2>&1 || err "Docker non trovato. Installalo: curl -fsSL https://get.docker.com | sh"
    command -v docker-compose >/dev/null 2>&1 || err "Docker Compose non trovato."
}

check_env() {
    if [ ! -f ".env" ]; then
        warn ".env non trovato — copio da .env.example..."
        cp .env.example .env
        warn "⚠️  Modifica .env con i tuoi valori prima di continuare!"
        echo ""
        cat .env
        echo ""
        err "Modifica .env e rilancia ./deploy.sh start"
    fi
}

setup_media() {
    source .env 2>/dev/null || true
    MEDIA="${MEDIA_PATH:-/srv/anime}"
    if [ ! -d "$MEDIA" ]; then
        warn "Cartella media non trovata: $MEDIA"
        sudo mkdir -p "$MEDIA"
        sudo chmod 755 "$MEDIA"
        warn "Cartella creata. Copia i tuoi video MP4 in: $MEDIA"
    fi
    log "Cartella media: $MEDIA"
}

get_ip() {
    hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost"
}

get_port() {
    grep APP_PORT .env 2>/dev/null | cut -d= -f2 || echo "3000"
}

cmd_start() {
    check_deps; check_env; setup_media
    log "Build e avvio AniStream..."
    docker-compose up -d --build
    echo ""
    log "✅ AniStream avviato!"
    info "🌐 Sito web:  http://$(get_ip):$(get_port)"
    info "📱 App mobile: apri lo stesso URL dal telefono sulla stessa rete"
    info "📺 TV:         usa le frecce del telecomando"
}

cmd_stop() {
    check_deps
    log "Fermo AniStream..."
    docker-compose down
    log "Fermato."
}

cmd_restart() {
    cmd_stop
    sleep 1
    cmd_start
}

cmd_update() {
    check_deps; check_env
    log "Aggiornamento da git..."
    git pull origin main 2>/dev/null || warn "git pull fallito, procedo con rebuild."
    log "Rebuild container..."
    docker-compose up -d --build
    log "✅ Aggiornamento completato!"
}

cmd_rebuild() {
    check_deps; check_env
    log "Rebuild forzato (senza cache)..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    log "✅ Rebuild completato!"
}

cmd_logs() {
    docker-compose logs -f --tail=100
}

cmd_status() {
    echo ""
    docker-compose ps
    echo ""
    source .env 2>/dev/null || true
    info "URL: http://$(get_ip):$(get_port)"
}

cmd_shell() {
    docker exec -it anistream sh
}

cmd_video_check() {
    source .env 2>/dev/null || true
    MEDIA="${MEDIA_PATH:-/srv/anime}"
    echo ""
    info "📁 Cartella media: $MEDIA"
    echo ""
    if [ -d "$MEDIA" ]; then
        find "$MEDIA" -name "*.mp4" -o -name "*.mkv" -o -name "*.webm" 2>/dev/null | head -20 | while read f; do
            echo "  ✓ $f"
        done
        TOTAL=$(find "$MEDIA" -name "*.mp4" -o -name "*.mkv" 2>/dev/null | wc -l)
        echo ""
        log "$TOTAL file video trovati"
    else
        warn "Cartella media non esiste: $MEDIA"
    fi
}

# ── Main ─────────────────────────────────────────────
echo ""
echo -e "${CYAN}  ╔═══════════════════════════╗"
echo -e "  ║   🎌  AniStream Deploy    ║"
echo -e "  ╚═══════════════════════════╝${NC}"
echo ""

case "${1:-help}" in
    start)      cmd_start ;;
    stop)       cmd_stop ;;
    restart)    cmd_restart ;;
    update)     cmd_update ;;
    rebuild)    cmd_rebuild ;;
    logs)       cmd_logs ;;
    status)     cmd_status ;;
    shell)      cmd_shell ;;
    videos)     cmd_video_check ;;
    *)
        echo "  Comandi disponibili:"
        echo ""
        echo "    ./deploy.sh start     → Build + avvia il container"
        echo "    ./deploy.sh stop      → Ferma il container"
        echo "    ./deploy.sh restart   → Riavvia"
        echo "    ./deploy.sh update    → Pull git + rebuild"
        echo "    ./deploy.sh rebuild   → Rebuild da zero (senza cache)"
        echo "    ./deploy.sh logs      → Log in tempo reale"
        echo "    ./deploy.sh status    → Stato + URL"
        echo "    ./deploy.sh videos    → Lista file video trovati"
        echo "    ./deploy.sh shell     → Shell dentro il container"
        echo ""
        ;;
esac
