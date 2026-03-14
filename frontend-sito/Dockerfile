# ══════════════════════════════════════════════════════
#  AniStream — Dockerfile
#  Stage 1: build React con Vite
#  Stage 2: serve con Nginx alpine (immagine tiny ~25MB)
# ══════════════════════════════════════════════════════

# ── Stage 1: Build ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dipendenze prima del codice (layer cache)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copia tutto il sorgente
COPY . .

# Variabili Vite iniettate al build-time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ── Stage 2: Serve ─────────────────────────────────────
FROM nginx:1.27-alpine

# Rimuovi pagina default nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia app compilata
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
