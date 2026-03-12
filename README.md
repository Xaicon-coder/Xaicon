# 🎌 AniStream — Guida Deploy Completa

**Stack:** React + TypeScript + Vite + Supabase self-hosted + Nginx + Docker  
**Target:** Server Ubuntu (Upoint) + App Android (Capacitor)

---

## 📁 File da copiare nella root del progetto

```
anime-haven/
├── Dockerfile            ← build multi-stage Node→Nginx
├── docker-compose.yml    ← orchestrazione container
├── nginx.conf            ← SPA + streaming video
├── .env.example          ← template variabili
├── .env                  ← ← il tuo (NON su git!)
├── deploy.sh             ← comandi rapidi website
├── capacitor.config.ts   ← config app Android
└── setup-android.sh      ← setup Capacitor (una volta sola)
```

---

## 🌐 PARTE 1: Deploy Sito Web

### Setup iniziale

```bash
# Entra nella cartella del progetto
cd anime-haven

# Copia i file deploy nella root
cp /path/to/deploy-files/* .

# Crea il tuo .env
cp .env.example .env
nano .env

# Rendi eseguibile lo script
chmod +x deploy.sh setup-android.sh
```

### Configura .env

```env
# URL del tuo Supabase (accessibile dal BROWSER, non dal container)
VITE_SUPABASE_URL=http://192.168.1.95:8000

# Vai su: http://192.168.1.95:8000 → Settings → API → "anon public"
VITE_SUPABASE_ANON_KEY=<la-tua-anon-key>

# Porta dell'app (accedi su http://192.168.1.95:3000)
APP_PORT=3000

# Dove hai i tuoi video MP4
MEDIA_PATH=/srv/anime
```

### Avvia il sito

```bash
./deploy.sh start
```

L'app sarà su: **http://192.168.1.95:3000**  
Accessibile da PC, TV, telefono sulla stessa rete.

### Comandi utili

```bash
./deploy.sh start     # Build + avvia
./deploy.sh stop      # Ferma
./deploy.sh restart   # Riavvia
./deploy.sh update    # Pull git + rebuild
./deploy.sh rebuild   # Rebuild da zero
./deploy.sh logs      # Log live
./deploy.sh status    # Stato + URL
./deploy.sh videos    # Lista file video trovati
./deploy.sh shell     # Shell nel container
```

---

## 📂 Struttura cartella video

I nomi devono corrispondere **esattamente** ai `folderName` in `src/data/animeData.ts`:

```
/srv/anime/
├── Dr. Stone/                         ← anime.folderName (non usato, è il folder padre)
│   ├── Dr. Stone/                     ← season.folderName = "Dr. Stone"
│   │   ├── DrStone_Ep_01_ITA.mp4      ← filePrefix="DrStone_Ep_" + "01" + fileSuffix="_ITA"
│   │   └── DrStone_Ep_02_ITA.mp4
│   └── Dr. Stone: Stone Wars/         ← season.folderName = "Dr. Stone: Stone Wars"
│       └── DrStone2_Ep_01_ITA.mp4
├── Attack on Titan/
│   └── Stagione 1/                    ← season.folderName = "Stagione 1"
│       └── episodio-1.mp4             ← default se no filePrefix
└── Spy x Family/
    └── Stagione 1/
        └── episodio-1.mp4
```

> **URL video generato:** `/anime/<anime.folderName>/<season.folderName>/<episodio.mp4>`  
> **Nginx serve:** `/media/anime/` → montato da `MEDIA_PATH` sul host

---

## 📱 PARTE 2: App Android (Capacitor)

Capacitor converte la web app in un'APK Android nativa.

### Prerequisiti

- **Node.js 18+** sul tuo PC di sviluppo
- **Android Studio** installato: https://developer.android.com/studio
- **Java 17+** (incluso con Android Studio)

### Setup (una volta sola)

```bash
# Nella root del progetto
chmod +x setup-android.sh
./setup-android.sh
```

Lo script installerà Capacitor, builderà l'app e creerà la cartella `android/`.

### Apri in Android Studio

```bash
npx cap open android
```

### Collega il telefono e installa l'APK

1. Sul telefono: **Impostazioni → Info dispositivo → Tocca 7 volte "Numero build"**  
   → Abilita "Opzioni sviluppatore"
2. **Opzioni sviluppatore → Debug USB** → Abilita
3. Collega il telefono via USB
4. In Android Studio: premi il pulsante ▶ verde (Run)

### Build APK da distribuire

In Android Studio:  
**Build → Build Bundle(s)/APK(s) → Build APK(s)**

Il file APK sarà in:  
`android/app/build/outputs/apk/debug/app-debug.apk`

### Aggiornare l'app dopo modifiche

```bash
npm run build
npx cap sync android
# Poi ri-builda in Android Studio
```

### L'app si connette al tuo server

L'app Android si connette al tuo AniStream su `http://192.168.1.95:3000`.  
Quindi il **server deve essere avviato** (`./deploy.sh start`) per usare l'app.

Se vuoi un'app che funziona anche fuori casa → configura un dominio DDNS  
(es. DuckDNS, No-IP) e aggiorna `VITE_SUPABASE_URL` + nginx con HTTPS.

---

## 🔧 Troubleshooting

### Video non si carica (404)
```bash
# Controlla che i nomi cartelle corrispondano esattamente
./deploy.sh videos

# Controlla i log nginx
./deploy.sh logs
```

I `folderName` in `animeData.ts` sono **case-sensitive** e includono spazi/caratteri speciali.

### Supabase non risponde
- `VITE_SUPABASE_URL` deve essere accessibile **dal browser** (non dal container)
- Le variabili `VITE_*` vengono embedded nel JavaScript al momento del build
- Se cambi l'URL devi rifare il build: `./deploy.sh rebuild`

### Errore porta già in uso
```bash
# Cambia porta in .env
APP_PORT=8080
./deploy.sh restart
```

### Reset completo (rimuove container + immagini)
```bash
docker-compose down --rmi all --volumes
./deploy.sh start
```

### Permessi video negati
```bash
sudo chmod -R 755 /srv/anime
sudo chown -R $USER:$USER /srv/anime
```

---

## 🏠 Accesso dalla rete locale

| Dispositivo | URL |
|-------------|-----|
| PC/Mac | http://192.168.1.95:3000 |
| Telefono/Tablet | http://192.168.1.95:3000 |
| TV Smart | http://192.168.1.95:3000 (navigazione frecce ✅) |
| App Android | si connette allo stesso URL |
