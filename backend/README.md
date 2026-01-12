# FoxRun Backend API

Backend FastAPI per l'applicazione FoxRun - API REST per l'analisi delle performance di corsa con integrazione Strava.

## 🛠️ Stack Tecnologico

- **FastAPI** - Framework web moderno e veloce
- **Python 3.11+** - Linguaggio di programmazione
- **SQLAlchemy** - ORM per database
- **SQLite** - Database relazionale
- **Alembic** - Migrazioni database
- **Stravalib** - Client Python per API Strava
- **PyJWT** - Autenticazione JWT
- **Pandas/NumPy** - Analisi dati
- **Uvicorn** - Server ASGI

## 📁 Struttura Progetto

```
backend/
├── app/
│   ├── api/                    # Endpoints API
│   │   ├── __init__.py        # Export routers
│   │   ├── auth.py            # Autenticazione OAuth2/JWT
│   │   ├── activities.py      # CRUD attività e stats
│   │   ├── mock.py            # Dati mock (DEBUG only)
│   │   └── deps.py            # Dipendenze comuni
│   ├── core/                   # Configurazione
│   │   ├── config.py          # Settings applicazione
│   │   └── security.py        # JWT e crypto
│   ├── db/                     # Database
│   │   └── database.py        # Setup SQLAlchemy
│   ├── models/                 # Modelli SQLAlchemy
│   │   ├── __init__.py
│   │   ├── base.py            # Base class
│   │   ├── user.py            # User model
│   │   └── activity.py        # Activity model
│   ├── schemas/                # Schemi Pydantic
│   │   ├── user.py            # User schemas
│   │   └── activity.py        # Activity schemas
│   ├── services/               # Business logic
│   │   └── strava_service.py  # Integrazione Strava
│   ├── utils/                  # Utility functions
│   └── main.py                 # Entry point FastAPI
├── data/                       # Database directory
├── uploads/                    # File uploads
├── requirements.txt            # Dipendenze Python
└── .env                        # Variabili d'ambiente
```

## 🚀 Setup Sviluppo

### Prerequisiti

- **Python 3.11+**
- **pip** o **pipenv**
- Account [Strava Developer](https://www.strava.com/settings/api)

### Installazione

```bash
# Crea virtual environment (opzionale ma raccomandato)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oppure
venv\Scripts\activate  # Windows

# Installa dipendenze
pip install -r requirements.txt
```

### Variabili d'Ambiente

Crea un file `.env` nella directory `backend/`:

```env
# Applicazione
APP_NAME=FoxRun API
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///./data/strava_analyzer.db

# Strava API
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:5173/auth/callback

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Avvio Server

```bash
# Development mode con auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# L'API sarà disponibile su:
# - API: http://localhost:8000
# - Docs interattivi: http://localhost:8000/docs
# - Redoc: http://localhost:8000/redoc
```

## 📚 Database

### Modelli

#### User Model (`models/user.py`)
```python
class User:
    id: int
    strava_id: int
    first_name: str
    last_name: str
    profile_picture_url: str
    access_token: str (encrypted)
    refresh_token: str (encrypted)
    expires_at: datetime
    last_sync_timestamp: datetime
```

#### Activity Model (`models/activity.py`)
```python
class Activity:
    id: int
    user_id: int
    strava_activity_id: int
    name: str
    distance: float
    moving_time: int
    elapsed_time: int
    total_elevation_gain: float
    activity_type: str
    start_date: datetime
    average_speed: float
    max_speed: float
    average_heartrate: float
    max_heartrate: float
    # ... e altri campi
```

### Migrazioni

Le tabelle vengono create automaticamente all'avvio con `Base.metadata.create_all()`.

Per migrazioni più complesse, usa Alembic:

```bash
# Genera migrazione
alembic revision --autogenerate -m "descrizione"

# Applica migrazioni
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🔌 API Endpoints

### Autenticazione

#### `GET /auth/strava/authorize`
Genera URL di autorizzazione Strava.

**Response:**
```json
{
  "authorization_url": "https://www.strava.com/oauth/authorize?..."
}
```

#### `GET /auth/strava/callback?code={code}`
Callback OAuth2 Strava, scambia code per tokens.

**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user_id": 1,
  "strava_id": 12345,
  "first_name": "Mario",
  "last_name": "Rossi"
}
```

#### `GET /auth/user/me` 🔒
Ottiene dati utente corrente (richiede JWT).

**Headers:** `Authorization: Bearer {jwt_token}`

**Response:**
```json
{
  "id": 1,
  "strava_id": 12345,
  "first_name": "Mario",
  "last_name": "Rossi",
  "profile_picture_url": "...",
  "last_sync_timestamp": "2024-01-12T10:00:00"
}
```

### Attività 🔒

Tutti gli endpoint attività richiedono autenticazione JWT.

#### `POST /activities/sync`
Sincronizzazione smart: scarica attività dalla data dell'ultima attività salvata.

**Response:**
```json
{
  "message": "Synchronized X activities",
  "count": 15,
  "period": "2024-01-01 to 2024-01-12"
}
```

#### `POST /activities/sync/extend?months_back=12`
Sincronizza attività X mesi indietro.

**Query params:**
- `months_back` (int): Quanti mesi indietro sincronizzare

#### `GET /activities?skip=0&limit=50`
Lista attività con paginazione e filtri.

**Query params:**
- `skip` (int): Offset paginazione
- `limit` (int): Numero risultati (max 100)
- `activity_type` (str): Filtra per tipo (Run, Ride, etc.)
- `start_date` (datetime): Data inizio
- `end_date` (datetime): Data fine
- `sort_by` (str): Campo ordinamento
- `sort_order` (str): asc/desc

**Response:**
```json
{
  "activities": [...],
  "total": 150,
  "skip": 0,
  "limit": 50
}
```

#### `GET /activities/{activity_id}`
Dettaglio singola attività con laps.

**Response:**
```json
{
  "id": 123,
  "name": "Morning Run",
  "distance": 10000,
  "moving_time": 3600,
  "laps": [...]
  // ... tutti i campi
}
```

#### `GET /activities/stats`
Statistiche aggregate con filtri opzionali.

**Query params:**
- `start_date` (datetime)
- `end_date` (datetime)
- `activity_type` (str)

**Response:**
```json
{
  "total_activities": 50,
  "total_distance": 500000,
  "total_moving_time": 180000,
  "total_elevation_gain": 5000,
  "average_pace": 5.5,
  "average_distance": 10000
}
```

#### `GET /activities/trends?period=month`
Tendenze temporali aggregate per periodo.

**Query params:**
- `period` (str): week, month, year

**Response:**
```json
[
  {
    "period": "2024-01",
    "total_distance": 150000,
    "total_activities": 15,
    "avg_pace": 5.2
  },
  // ...
]
```

### Mock Data (DEBUG only)

#### `GET /mock/user`
Restituisce dati utente mock.

#### `GET /mock/activities`
Restituisce lista attività mock.

> **Nota:** Gli endpoint mock sono disponibili solo quando `DEBUG=True`.

## 🔐 Autenticazione e Sicurezza

### JWT Tokens

Dopo il login OAuth2 con Strava, l'API genera un JWT token:

```python
from app.core.security import create_access_token

token = create_access_token(user_id)
```

Il token deve essere incluso in tutte le richieste protette:

```
Authorization: Bearer {token}
```

### Dependency Injection

La dipendenza `get_current_user` verifica il JWT e ritorna l'utente:

```python
from app.api.deps import get_current_user

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id}
```

### CORS

CORS è configurato in `main.py` per permettere richieste da:
- `http://localhost:5173` (frontend dev)
- `http://localhost:3000` (compatibilità)

## 🧩 Services

### StravaService (`services/strava_service.py`)

Gestisce tutte le interazioni con l'API Strava:

```python
service = StravaService()

# OAuth
auth_url = service.get_authorization_url()
tokens = service.exchange_code_for_token(code)

# API calls
athlete = service.get_athlete_info(access_token)
activities = service.get_activities(access_token, after=date)
activity_detail = service.get_activity_detail(access_token, activity_id)
```

**Metodi principali:**
- `get_authorization_url()` - URL OAuth Strava
- `exchange_code_for_token(code)` - Scambia code per tokens
- `refresh_access_token(refresh_token)` - Rinnova token scaduto
- `get_athlete_info(token)` - Info atleta
- `get_activities(token, after, before)` - Lista attività
- `get_activity_detail(token, id)` - Dettaglio con laps e streams

## 🧪 Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Con coverage
pytest --cov=app tests/
```

Struttura test:
```
tests/
├── test_auth.py
├── test_activities.py
├── test_strava_service.py
└── conftest.py  # Fixtures
```

## 📊 Logging

I log sono configurati per mostrare:
- Richieste HTTP
- Errori applicazione
- Query database (in DEBUG)

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Message")
```

## 🚢 Deploy

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

Assicurati che tutte le variabili d'ambiente siano configurate in produzione, specialmente:
- `SECRET_KEY` (genera una chiave sicura)
- `JWT_SECRET_KEY` (genera una chiave sicura)
- `DEBUG=False`
- Credenziali Strava produzione

## 🐛 Debugging

### Interactive API Docs

FastAPI genera automaticamente documentazione interattiva:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Puoi testare tutti gli endpoint direttamente dal browser.

### Database Inspection

```bash
# SQLite CLI
sqlite3 data/strava_analyzer.db

# Query example
SELECT * FROM users;
SELECT COUNT(*) FROM activities;
```

## 📈 Performance

### Ottimizzazioni

- **Eager loading** per relazioni (evita N+1 queries)
- **Indexing** su campi frequenti (user_id, start_date)
- **Pagination** su liste lunghe
- **Caching** (da implementare con Redis)

### Query Ottimizzate

```python
# Uso di join per evitare N+1
activities = db.query(Activity).options(
    joinedload(Activity.laps)
).filter(Activity.user_id == user_id).all()
```

## 🤝 Contribuire

Consulta [CONTRIBUTING.md](../CONTRIBUTING.md) per le linee guida.

## 📚 Risorse

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
- [Strava API Reference](https://developers.strava.com/docs/reference/)
