# 🎌 Anime Haven - Guida Completa di Deployment su Server Upoint

## 📋 Indice
1. [Requisiti](#requisiti)
2. [Setup Iniziale](#setup-iniziale)
3. [Configurazione Database](#configurazione-database)
4. [Variabili d'Ambiente](#variabili-dambiente)
5. [Deploy con Docker](#deploy-con-docker)
6. [Configurazione Dominio](#configurazione-dominio)
7. [SSL/HTTPS](#sslhttps)
8. [Backup & Maintenance](#backup--maintenance)
9. [API Endpoints](#api-endpoints)
10. [Troubleshooting](#troubleshooting)

---

## Requisiti

**Hardware Minimo:**
- CPU: 2+ cores
- RAM: 4GB+ (8GB consigliato)
- Storage: 50GB+ (dipende da numero episodi video)
- Connessione: 100+ Mbps

**Software:**
- Ubuntu 20.04 LTS o superiore
- Docker & Docker Compose
- Git
- Nginx (opzionale, incluso in docker-compose)

---

## Setup Iniziale

### 1. Installare Docker e Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Add user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clonare il Progetto

```bash
# SSH (recommended)
git clone git@github.com:yourrepo/anime-haven.git
cd anime-haven

# OR HTTPS
git clone https://github.com/yourrepo/anime-haven.git
cd anime-haven
```

### 3. Creare File di Configurazione

```bash
# Copy environment file
cp .env.example .env

# Edit with your values
nano .env
```

---

## Configurazione Database

### 1. Import Schema PostgreSQL

Il schema è automaticamente importato all'avvio di Docker tramite il file `/docker-entrypoint-initdb.d/01-schema.sql`.

Per importare manualmente:

```bash
# Access database
docker-compose exec postgres psql -U postgres -d anime_haven -f /docker-entrypoint-initdb.d/01-schema.sql

# Or via pgAdmin/Adminer
# http://localhost:8080 (included in docker-compose)
```

### 2. Seeding iniziale (Dati di Test)

Creare file `backend/src/database/seed.ts`:

```typescript
import { pool } from '../server';

async function seedDatabase() {
  try {
    // Insert test anime
    await pool.query(`
      INSERT INTO anime (title_ja, title_it, description, studio, year, status, total_episodes)
      VALUES 
        ('進撃の巨人', 'L\'Attacco dei Giganti', 'Una storia epicadi lotta...', 'WIT Studio', 2013, 'completed', 94),
        ('鬼滅の刃', 'Demon Slayer', 'Un ragazzo cerca vendetta...', 'ufotable', 2019, 'ongoing', 50)
    `);
    console.log('✅ Database seeded');
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
}

seedDatabase();
```

Run:
```bash
npm run db:seed
```

---

## Variabili d'Ambiente

### Configurazione Essenziale (.env)

```env
# 🔐 CRITICAL - CHANGE THESE VALUES
DB_PASSWORD=choose_strong_password_32_chars_min
JWT_SECRET=another_strong_secret_key_change_this
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key

# 📧 Email Configuration (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # NOT your gmail password!
# Get app-specific password from: https://myaccount.google.com/apppasswords

# 🌐 Domain Configuration
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://www.yourdomain.com

# 🎯 Stripe Keys (get from https://dashboard.stripe.com)
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# 📝 Optional but Recommended
LOG_LEVEL=info
NODE_ENV=production
PORT=5000
```

---

## Deploy con Docker

### 1. Build & Start Services

```bash
# Build images
docker-compose build

# Start services (in background)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 2. Verificare che tutto funziona

```bash
# Health check API
curl http://localhost:5000/health

# Check database connection
docker-compose exec postgres psql -U postgres -d anime_haven -c "SELECT version();"

# View frontend
open http://localhost:3000
```

### 3. Comandiper Management

```bash
# Stop all services
docker-compose down

# Stop and remove data
docker-compose down -v

# Restart a service
docker-compose restart backend

# View database
docker-compose up -d adminer
# Then visit http://localhost:8080

# Backup database
docker-compose exec postgres pg_dump -U postgres anime_haven > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres anime_haven < backup.sql
```

---

## Configurazione Dominio

### 1. Setup DNS Records (CloudFlare o Provider)

```
A     yourdomain.com        -> your.server.ip
A     www.yourdomain.com    -> your.server.ip
A     api.yourdomain.com    -> your.server.ip
CNAME cdn.yourdomain.com    -> yourdomain.com (for CDN)
```

### 2. Configurare Nginx Reverse Proxy

Creare `nginx/nginx.conf`:

```nginx
upstream frontend {
    server frontend:80;
}

upstream backend {
    server backend:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## SSL/HTTPS

### 1. Let's Encrypt (Certificato Gratuito)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Certificates location
/etc/letsencrypt/live/yourdomain.com/
```

### 2. Aggiornare Nginx con SSL

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Auto-Renew Certificate

```bash
# Create cron job
sudo crontab -e

# Add line
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## Backup & Maintenance

### 1. Database Backup Automatico

Creare `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/anime-haven"
DATE=$(date +\%Y\%m\%d_%H\%M\%S)

mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T postgres pg_dump -U postgres anime_haven | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completato: $BACKUP_DIR/db_$DATE.sql.gz"
```

Aggiungere a crontab:
```bash
0 2 * * * /home/user/anime-haven/scripts/backup.sh
```

### 2. Monitoraggio Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### 3. Update Applicazione

```bash
# Stop services
docker-compose down

# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
POST   /api/auth/refresh-token     - Refresh JWT token
GET    /api/auth/me                - Get current user
```

### Anime
```
GET    /api/anime                  - List all anime (with filters)
GET    /api/anime/:id              - Get anime details
GET    /api/anime/:id/episodes     - Get episodes
POST   /api/anime                  - Create anime (admin)
PUT    /api/anime/:id              - Update anime (admin)
DELETE /api/anime/:id              - Delete anime (admin)
GET    /api/anime/trending/this-week - Trending anime
```

### Episodes
```
GET    /api/episodes/:id           - Get episode details
GET    /api/episodes/:id/streams   - Get video streams
GET    /api/episodes/:id/audio     - Get audio tracks
GET    /api/episodes/:id/subtitles - Get subtitles
```

### Watchlist
```
GET    /api/watchlist              - Get user watchlist
POST   /api/watchlist              - Add to watchlist
PUT    /api/watchlist/:animeId     - Update watchlist entry
DELETE /api/watchlist/:animeId     - Remove from watchlist
```

### Payments
```
POST   /api/payments/create-payment-intent  - Create Stripe payment
POST   /api/payments/webhook               - Stripe webhook
GET    /api/payments/history               - Payment history
GET    /api/payments/current-subscription  - Current subscription
```

---

## Troubleshooting

### 1. Cannot Connect to Database

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# Check connection
docker-compose exec postgres psql -U postgres -d anime_haven -c "SELECT 1;"
```

### 2. Backend API Not Responding

```bash
# Check if backend container is running
docker-compose ps backend

# Check logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Test API
curl http://localhost:5000/health
```

### 3. Frontend Not Loading

```bash
# Check nginx logs
docker-compose logs nginx

# Verify file permissions
docker-compose exec frontend ls -la /usr/share/nginx/html

# Rebuild frontend
docker-compose up -d --build frontend
```

### 4. High Memory Usage

```bash
# Check container memory
docker stats

# Restart all services
docker-compose down
docker-compose up -d

# Check for memory leaks in logs
docker-compose logs --tail=500 backend | grep -i "memory\|error"
```

### 5. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates

# Test SSL
curl -I https://yourdomain.com

# Renew certificate manually
sudo certbot renew --force-renewal
```

---

## Performance Optimization

### 1. Enable Gzip Compression

Nginx already configured in dockerfile.

### 2. Set up CDN

```env
CDN_URL=https://cdn.yourdomain.com
```

Then configure CloudFlare or similar.

### 3. Database Indexing

Indexes already configured in schema.sql. Check:

```bash
docker-compose exec postgres psql -U postgres -d anime_haven -c "\d anime"
```

### 4. Cache Redis (Optional)

```bash
# Enable in docker-compose.yml (already included)
docker-compose up -d redis

# Connect from backend
REDIS_URL=redis://redis:6379
```

---

## Monitoramento & Alerts

### 1. Setup Monitoring

```bash
# Option 1: Using Netdata
docker run -d --name=netdata -p 19999:19999 netdata/netdata

# Visit http://your-server:19999
```

### 2. Email Alerts

Configurare notizie di errore:

```bash
# In crontab, check logs hourly
0 * * * * docker-compose logs --since 1h backend | grep -i error | mail -s "Anime Haven Errors" admin@yourdomain.com
```

---

## Support & Community

- 📚 Documentation: https://docs.animehaven.local
- 🐛 Issues: GitHub Issues
- 💬 Discord: https://discord.gg/animehaven
- 📧 Email: support@yourdomain.com

---

**Versione:** 1.0.0  
**Ultimo Update:** March 2026  
**Maintained by:** Anime Haven Team
