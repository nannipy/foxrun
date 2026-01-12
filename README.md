<div align="center">
   <h1>FOXRUN</h1>
</div>

<img src="frontend/public/FOXRUN-logo.png" alt="Fox Run Analyzer Logo" width="100" height="100" style="display: block; margin: auto;"  align="center" />

Un'applicazione web full-stack per analizzare le performance di corsa utilizzando i dati di Strava.

## 🚀 Caratteristiche

- **Autenticazione Strava**: Connessione sicura tramite OAuth2
- **Sincronizzazione Dati**: Download automatico delle attività da Strava
- **Dashboard Interattivo**: Visualizzazione delle metriche chiave e tendenze
- **Elenco Attività**: Tabella completa con filtri e ricerca
- **Analisi Dettagliata**: Grafici e statistiche per ogni attività
- **Interfaccia Moderna**: UI responsive con Tailwind CSS e Radix UI

## 🛠️ Stack Tecnologico

### Frontend
- **React 18** con TypeScript
- **Vite** per il build e development
- **Bun** come runtime e package manager
- **Tailwind CSS** per lo styling (liquid glass design)
- **Radix UI** per i componenti accessibili
- **Recharts** per i grafici interattivi
- **Leaflet** per le mappe interattive
- **React Query** per la gestione dello stato
- **React Router** per la navigazione

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** per l'ORM
- **SQLite** per il database
- **JWT** per l'autenticazione
- **Stravalib** per l'integrazione con Strava
- **Pandas/NumPy** per l'analisi dei dati

## 📋 Prerequisiti

- **Bun** runtime (https://bun.sh)
- **Python 3.11+**
- Account Strava Developer

## 🔧 Configurazione

### 1. Setup Strava Developer

1. Vai su [Strava API Settings](https://www.strava.com/settings/api)
2. Crea una nuova applicazione
3. Imposta l'URL di redirect a `http://localhost:5173/auth/callback`
4. Prendi nota di `Client ID` e `Client Secret`

### 2. Configurazione Ambiente

Crea un file `.env` nella root del progetto:

```env
# Strava API
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# Frontend
VITE_API_URL=http://localhost:8000
```

### 3. Installazione Dipendenze

```bash
# Frontend
cd frontend
bun install

# Backend
cd backend
pip install -r requirements.txt
```

## 🚀 Avvio dell'Applicazione

### Opzione 1: Docker Compose (Raccomandato)

```bash
docker-compose up --build
```

L'applicazione sarà disponibile su:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Opzione 2: Sviluppo Locale

#### Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
bun run dev
```

## 📱 Utilizzo

1. **Accesso**: Vai su http://localhost:5173
2. **Autenticazione**: Clicca "Connetti con Strava" e autorizza l'applicazione
3. **Sincronizzazione**: Le tue attività verranno scaricate automaticamente
4. **Esplorazione**: Naviga tra Dashboard, Attività, Trends, Performance, Routes, Calendar e Settings

## 🗂️ Struttura del Progetto

```
foxrun/
├── frontend/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/    # Componenti UI (MetricCard, Layout, etc.)
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilità e API client
│   │   ├── pages/         # Pagine (Dashboard, Activities, Trends, etc.)
│   │   ├── App.tsx        # App principale
│   │   └── index.css      # Stili globali
│   ├── package.json
│   └── bun.lockb          # Bun lockfile
├── backend/               # Backend FastAPI
│   ├── app/
│   │   ├── api/           # Endpoint API (auth, activities, mock)
│   │   ├── core/          # Configurazione e security
│   │   ├── db/            # Database setup
│   │   ├── models/        # Modelli SQLAlchemy
│   │   ├── schemas/       # Schemi Pydantic
│   │   ├── services/      # Logica di business (StravaService)
│   │   ├── utils/         # Utilità
│   │   └── main.py        # App principale FastAPI
│   ├── requirements.txt
│   └── strava_analyzer.db # Database SQLite
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🔌 API Endpoints

### Autenticazione
- `GET /auth/strava/authorize` - URL di autorizzazione Strava
- `GET /auth/strava/callback` - Callback OAuth2 e generazione JWT
- `GET /auth/user/me` - Dati utente corrente (richiede JWT) 🔒
- `GET /auth/user/{user_id}` - Dati utente per ID

### Attività (richiede JWT 🔒)
- `POST /activities/sync` - Sincronizzazione smart (dalla data ultima attività)
- `POST /activities/sync/extend?months_back=12` - Sincronizza X mesi indietro
- `GET /activities?skip=0&limit=50` - Lista attività con paginazione e filtri
- `GET /activities/{activity_id}` - Dettaglio attività con lap e zone
- `GET /activities/stats` - Statistiche aggregate con filtri data
- `GET /activities/trends?period=month` - Tendenze temporali (week/month/year)

### Mock Data (solo in DEBUG mode)
- `GET /mock/user` - Dati utente mock
- `GET /mock/activities` - Attività mock

## 🧪 Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
bun test
```

## 📊 Funzionalità Implementate

### ✅ Autenticazione e Sicurezza
- [x] OAuth2 con Strava
- [x] Autenticazione JWT
- [x] Gestione token e refresh
- [x] Protezione endpoints API

### ✅ Sincronizzazione Dati
- [x] Sincronizzazione smart (dalla data ultima attività)
- [x] Sincronizzazione estesa (X mesi indietro)
- [x] Download automatico attività da Strava
- [x] Salvataggio dati in database SQLite

### ✅ Pagine Frontend
- [x] **Dashboard** - Metriche aggregate e grafici di tendenza
- [x] **Activities** - Lista completa con filtri, ordinamento e ricerca
- [ ] **Activity Detail** - Vista dettagliata con mappa interattiva Leaflet
- [ ] **Trends** - Analisi temporali e tendenze
- [ ] **Performance** - Metriche di performance e progressi
- [ ] **Routes** - Visualizzazione percorsi
- [x] **Calendar** - Vista calendario delle attività
- [ ] **Settings** - Gestione impostazioni utente

### ✅ Analisi e Visualizzazione
- [x] Grafici interattivi con Recharts
- [x] Mappe percorsi con Leaflet
- [x] Statistiche aggregate (distanza, tempo, elevazione)
- [ ] Analisi laps e split
- [x] Metriche di ritmo e velocità

### 🔄 In Sviluppo
- [ ] Analisi zone di frequenza cardiaca avanzate
- [ ] Comparazione multi-attività
- [ ] Record personali automatici
- [ ] Esportazione dati (CSV/PDF)

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Configurazione Variabili d'Ambiente

1. **Copia il file `env.example` in `.env`**:
```bash
cp env.example .env
```

2. **Configura le variabili d'ambiente **:

```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_REDIRECT_URI=https://your-frontend-url.vercel.app/auth/callback
```


### Configurazione Strava

Dopo il deployment, aggiorna l'URL di redirect su Strava:
1. Vai su [Strava API Settings](https://www.strava.com/settings/api)
2. Cambia l'URL di redirect da `http://localhost:5173/auth/callback` a `https://your-domain.vercel.app/auth/callback`

### Note Importanti

- **Backend**: Assicurati che il backend sia deployato e accessibile
- **CORS**: Il backend deve permettere richieste dal dominio Vercel
- **HTTPS**: Vercel fornisce automaticamente HTTPS
- **Environment Variables**: Configura tutte le variabili necessarie su Vercel

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

Per problemi o domande:
1. Controlla la documentazione API su http://localhost:8000/docs
2. Apri una issue su GitHub
3. Controlla i log del backend per errori dettagliati

## 🔮 Roadmap

- [ ] Integrazione con altri servizi (Garmin, TrainingPeaks)
- [ ] Analisi dei segmenti Strava
- [ ] Piani di allenamento personalizzati
- [ ] Notifiche e alert
- [ ] Esportazione dati in CSV/PDF
- [ ] App mobile (React Native)
