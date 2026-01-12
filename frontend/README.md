<div align="center">
   <h1>FOXRUN</h1>
</div>

<img src="public/FOXRUN-logo.png" alt="Fox Run Analyzer Logo" width="100" height="100" style="display: block; margin: auto;"  align="center" />

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
- **Tailwind CSS** per lo styling
- **Radix UI** per i componenti
- **Recharts** per i grafici
- **React Query** per la gestione dello stato
- **React Router** per la navigazione

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** per l'ORM
- **SQLite** per il database
- **Stravalib** per l'integrazione con Strava
- **Pandas/NumPy** per l'analisi dei dati

## 📋 Prerequisiti

- Node.js 18+ e npm
- Python 3.11+
- Account Strava Developer

## 🔧 Configurazione

### 1. Setup Strava Developer

1. Vai su [Strava API Settings](https://www.strava.com/settings/api)
2. Crea una nuova applicazione
3. Imposta l'URL di redirect a `http://localhost:3000/auth/callback`
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
npm install

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
- Frontend: http://localhost:3000
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
npm run dev
```

## 📱 Utilizzo

1. **Accesso**: Vai su http://localhost:3000
2. **Autenticazione**: Clicca "Connetti con Strava" e autorizza l'applicazione
3. **Sincronizzazione**: Le tue attività verranno scaricate automaticamente
4. **Esplorazione**: Naviga tra Dashboard, Attività e altre sezioni

## 🗂️ Struttura del Progetto

```
run-insights-unleashed/
├── src/                    # Frontend React
│   ├── components/         # Componenti UI
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilità e API
│   ├── pages/             # Pagine dell'applicazione
│   └── ...
├── backend/               # Backend FastAPI
│   ├── app/
│   │   ├── api/           # Endpoint API
│   │   ├── core/          # Configurazione
│   │   ├── db/            # Database
│   │   ├── models/        # Modelli SQLAlchemy
│   │   ├── schemas/       # Schemi Pydantic
│   │   ├── services/      # Logica di business
│   │   └── utils/         # Utilità
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## 🔌 API Endpoints

### Autenticazione
- `GET /auth/strava/authorize` - URL di autorizzazione Strava
- `GET /auth/strava/callback` - Callback OAuth2
- `GET /auth/user/{user_id}` - Dati utente

### Attività
- `POST /activities/sync/{user_id}` - Sincronizza attività
- `GET /activities/{user_id}` - Lista attività
- `GET /activities/{user_id}/activity/{activity_id}` - Dettaglio attività
- `GET /activities/{user_id}/stats` - Statistiche utente
- `GET /activities/{user_id}/trends` - Tendenze temporali

## 🧪 Testing

```bash
# Backend
cd backend
pytest

# Frontend
npm test
```

## 📊 Funzionalità Implementate

### ✅ Fase 1: Setup e Core Sync
- [x] Configurazione FastAPI
- [x] Autenticazione OAuth2 con Strava
- [x] Modelli database SQLAlchemy
- [x] Sincronizzazione attività base
- [x] Frontend React con TypeScript
- [x] Pagina di login/connessione Strava

### ✅ Fase 2: Dashboard e Elenco Attività
- [x] Dashboard con metriche aggregate
- [x] Grafici di tendenza con Recharts
- [x] Tabella attività con filtri
- [x] Paginazione e ricerca

### 🔄 Fase 3: Dettaglio Attività (In Corso)
- [ ] Mappa interattiva del percorso
- [ ] Grafici dettagliati (ritmo, FC, cadenza)
- [ ] Analisi dei laps/split
- [ ] Analisi delle zone

### 📋 Fase 4: Analisi Avanzata (Pianificata)
- [ ] Comparazione attività
- [ ] Record personali
- [ ] Analisi delle tendenze avanzate
- [ ] Impostazioni utente

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 🚀 Deployment su Vercel

### Prerequisiti
- Account Vercel
- Repository GitHub/GitLab con il codice
- Backend deployato (FastAPI su Vercel, Railway, o altro servizio)

### Configurazione Variabili d'Ambiente

1. **Copia il file `env.example` in `.env`**:
```bash
cp env.example .env
```

2. **Configura le variabili d'ambiente su Vercel**:
   - Vai su [Vercel Dashboard](https://vercel.com/dashboard)
   - Seleziona il tuo progetto
   - Vai su "Settings" → "Environment Variables"
   - Aggiungi le seguenti variabili:

```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_REDIRECT_URI=https://your-frontend-url.vercel.app/auth/callback
VITE_USE_MOCK_DATA=false
```

### Deployment

1. **Connetti il repository a Vercel**:
   - Vai su [Vercel Dashboard](https://vercel.com/dashboard)
   - Clicca "New Project"
   - Importa il repository GitHub/GitLab
   - Vercel rileverà automaticamente che è un progetto Vite

2. **Configura il build**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**:
   - Clicca "Deploy"
   - Vercel buildera e deployerà automaticamente l'applicazione

### Configurazione Strava

Dopo il deployment, aggiorna l'URL di redirect su Strava:
1. Vai su [Strava API Settings](https://www.strava.com/settings/api)
2. Cambia l'URL di redirect da `http://localhost:3000/auth/callback` a `https://your-domain.vercel.app/auth/callback`

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
