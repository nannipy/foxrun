# Contributing to FoxRun

Grazie per il tuo interesse a contribuire a FoxRun! Questo documento fornisce le linee guida per contribuire al progetto.

## 📋 Indice

- [Codice di Condotta](#codice-di-condotta)
- [Come Iniziare](#come-iniziare)
- [Setup Ambiente di Sviluppo](#setup-ambiente-di-sviluppo)
- [Workflow Git](#workflow-git)
- [Standard di Codice](#standard-di-codice)
- [Testing](#testing)
- [Pull Request](#pull-request)
- [Segnalazione Bug](#segnalazione-bug)
- [Richiesta Funzionalità](#richiesta-funzionalit%C3%A0)

## 🤝 Codice di Condotta

Ci aspettiamo che tutti i contributori:
- Siano rispettosi e inclusivi
- Accettino critiche costruttive
- Si concentrino su ciò che è meglio per la community
- Mostrino empatia verso altri membri della community

## 🚀 Come Iniziare

1. **Fork** il repository
2. **Clone** il tuo fork localmente
3. **Crea un branch** per le tue modifiche
4. **Implementa** le modifiche
5. **Testa** le tue modifiche
6. **Commit** e **push** al tuo fork
7. **Apri una Pull Request**

## 🛠️ Setup Ambiente di Sviluppo

### Prerequisiti

- **Bun** runtime ([install](https://bun.sh))
- **Python 3.11+**
- **Git**
- Account [Strava Developer](https://www.strava.com/settings/api)

### Clone e Setup

```bash
# Clone il repository
git clone https://github.com/your-username/foxrun.git
cd foxrun

# Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env  # Configura variabili d'ambiente

# Setup Frontend
cd ../frontend
bun install
cp .env.example .env  # Configura variabili d'ambiente

# Torna alla root
cd ..
```

### Configurazione Strava

1. Vai su [Strava API Settings](https://www.strava.com/settings/api)
2. Crea una nuova applicazione
3. Imposta Authorization Callback Domain: `localhost`
4. Copia Client ID e Client Secret nei file `.env`

### Avvio Dev Servers

```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
bun run dev
```

## 🌳 Workflow Git

### Branching Strategy

Usiamo **Git Flow** semplificato:

- `main` - Branch principale, sempre stabile
- `develop` - Branch di sviluppo
- `feature/*` - Nuove funzionalità
- `fix/*` - Bug fix
- `docs/*` - Documentazione

### Naming Conventions

```bash
# Features
feature/add-activity-comparison
feature/export-to-csv

# Bug fixes
fix/authentication-token-refresh
fix/chart-rendering-issue

# Documentation
docs/update-api-reference
docs/add-setup-guide
```

### Commit Messages

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nuova funzionalità
- `fix`: Bug fix
- `docs`: Solo documentazione
- `style`: Formattazione (no logic change)
- `refactor`: Refactoring del codice
- `test`: Aggiunta/modifica test
- `chore`: Build, config, dipendenze

**Esempi:**

```bash
feat(activities): add activity comparison feature
fix(auth): resolve token refresh infinite loop
docs(readme): update installation instructions
refactor(api): simplify strava service methods
test(activities): add unit tests for sync endpoint
```

### Processo di Commit

```bash
# 1. Crea branch
git checkout -b feature/my-feature

# 2. Fai modifiche e staging
git add .

# 3. Commit con messaggio descrittivo
git commit -m "feat(scope): description"

# 4. Push al tuo fork
git push origin feature/my-feature
```

## 💻 Standard di Codice

### Python (Backend)

#### Style Guide
Seguiamo **PEP 8** con alcune eccezioni:

- **Line length**: max 100 caratteri (non 79)
- **String quotes**: preferenza per `"` (double quotes)
- **Import ordering**: standard, third-party, local

#### Linting e Formatting

```bash
# Install tools
pip install black flake8 isort mypy

# Format code
black app/

# Check linting
flake8 app/

# Sort imports
isort app/

# Type checking
mypy app/
```

#### Best Practices

```python
# ✅ GOOD: Type hints
def get_activity(activity_id: int) -> Activity:
    return db.query(Activity).filter(Activity.id == activity_id).first()

# ❌ BAD: No type hints
def get_activity(activity_id):
    return db.query(Activity).filter(Activity.id == activity_id).first()

# ✅ GOOD: Descriptive names
def calculate_average_pace(distance: float, time: int) -> float:
    return time / distance

# ❌ BAD: Unclear names
def calc(d, t):
    return t / d

# ✅ GOOD: Docstrings
def sync_activities(user: User, months: int = 12) -> int:
    """
    Synchronize activities from Strava.
    
    Args:
        user: User object with valid Strava tokens
        months: Number of months back to sync (default 12)
    
    Returns:
        Number of activities synchronized
    """
    pass
```

### TypeScript/React (Frontend)

#### Style Guide

- **Semicolons**: no (seguiamo standard moderno)
- **Quotes**: preferenza per `"` (double quotes)
- **Indentation**: 2 spazi
- **Line length**: max 100 caratteri

#### Linting

```bash
# Run linter
bun run lint

# Auto-fix issues
bun run lint --fix
```

#### Best Practices

```typescript
// ✅ GOOD: Functional components with TypeScript
interface ActivityCardProps {
  activity: Activity
  onSelect: (id: number) => void
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSelect }) => {
  return <div onClick={() => onSelect(activity.id)}>{activity.name}</div>
}

// ❌ BAD: Class components, no types
export class ActivityCard extends React.Component {
  render() {
    return <div>{this.props.activity.name}</div>
  }
}

// ✅ GOOD: Custom hooks for logic
export const useActivities = (userId: number) => {
  return useQuery({
    queryKey: ['activities', userId],
    queryFn: () => fetchActivities(userId)
  })
}

// ❌ BAD: Logic in components
export const Activities = () => {
  const [activities, setActivities] = useState([])
  useEffect(() => {
    fetch('/api/activities').then(res => res.json()).then(setActivities)
  }, [])
}

// ✅ GOOD: Descriptive component names
export const ActivityDetailMap: React.FC<MapProps> = ({ route }) => { }

// ❌ BAD: Generic names
export const Map: React.FC = () => { }
```

### CSS/Tailwind

```css
/* ✅ GOOD: Utility classes */
<div className="flex items-center gap-4 p-4 rounded-lg bg-glass">

/* ✅ GOOD: Custom classes quando necessario */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
}

/* ❌ BAD: Inline styles per tutto */
<div style={{ display: 'flex', padding: '16px' }}>
```

## 🧪 Testing

### Backend Tests

```bash
# Install pytest
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_activities.py

# Run specific test
pytest tests/test_activities.py::test_sync_activities
```

#### Test Structure

```python
# tests/test_activities.py
import pytest
from app.services.strava_service import StravaService

def test_sync_activities_success(db_session, mock_user):
    """Test successful activity synchronization."""
    service = StravaService()
    count = service.sync_activities(mock_user, months_back=1)
    assert count > 0

def test_sync_activities_no_token(db_session, user_without_token):
    """Test sync fails without valid token."""
    service = StravaService()
    with pytest.raises(ValueError):
        service.sync_activities(user_without_token)
```

### Frontend Tests

```bash
# Install testing libraries
bun add -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

#### Test Example

```typescript
// src/components/ActivityCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityCard } from './ActivityCard'

describe('ActivityCard', () => {
  it('renders activity name', () => {
    const activity = { id: 1, name: 'Morning Run', distance: 5000 }
    render(<ActivityCard activity={activity} onSelect={() => {}} />)
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn()
    const activity = { id: 1, name: 'Morning Run', distance: 5000 }
    render(<ActivityCard activity={activity} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Morning Run'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })
})
```

### Testing Requirements

- **Nuove funzionalità**: Devono includere test
- **Bug fix**: Aggiungi test di regressione
- **Coverage target**: >= 80%

## 📝 Pull Request

### Prima di Aprire una PR

- [ ] Codice segue gli standard del progetto
- [ ] Test aggiunti/aggiornati e passano
- [ ] Documentazione aggiornata se necessario
- [ ] Commit messages seguono convenzioni
- [ ] Branch aggiornato con `main`/`develop`

### Template PR

```markdown
## Descrizione
Breve descrizione delle modifiche.

## Tipo di Modifica
- [ ] Bug fix
- [ ] Nuova funzionalità
- [ ] Breaking change
- [ ] Documentazione

## Come Testare
1. Step 1
2. Step 2
3. Risultato atteso

## Checklist
- [ ] Il codice segue gli standard
- [ ] Test aggiunti e passano
- [ ] Documentazione aggiornata
- [ ] Nessun warning di linting

## Screenshot (se applicabile)
[Aggiungi screenshot per UI changes]
```

### Review Process

1. Almeno un maintainer deve approvare
2. Tutti i CI checks devono passare
3. Nessun conflitto con branch target
4. Codice review completata

## 🐛 Segnalazione Bug

### Dove Segnalare

Apri una **GitHub Issue** con label `bug`.

### Template Bug Report

```markdown
## Descrizione Bug
Descrizione chiara e concisa del bug.

## Come Riprodurre
1. Vai a '...'
2. Clicca su '...'
3. Scrolla fino a '...'
4. Vedi errore

## Comportamento Atteso
Cosa dovrebbe succedere.

## Comportamento Attuale
Cosa succede invece.

## Screenshot
Se applicabile, aggiungi screenshot.

## Ambiente
- OS: [es. macOS 14.0]
- Browser: [es. Chrome 120]
- Versione Frontend: [es. 0.2.0]
- Versione Backend: [es. 1.0.0]

## Informazioni Aggiuntive
Qualsiasi altro contesto sul problema.
```

## 💡 Richiesta Funzionalità

### Template Feature Request

```markdown
## Funzionalità Proposta
Descrizione chiara della funzionalità.

## Problema che Risolve
Quale problema risolve questa funzionalità?

## Soluzione Proposta
Come dovrebbe funzionare?

## Alternative Considerate
Quali alternative hai considerato?

## Informazioni Aggiuntive
Mockup, esempi, riferimenti esterni.
```

## 📚 Risorse Utili

### Documentazione Progetto
- [README principale](./README.md)
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

### Riferimenti Esterni
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [Strava API Reference](https://developers.strava.com)
- [Conventional Commits](https://www.conventionalcommits.org)

## 📞 Contatti

Per domande o discussioni:
- Apri una **GitHub Discussion**
- Contatta i maintainer via issue

## 🙏 Ringraziamenti

Grazie per contribuire a FoxRun! Ogni contributo, grande o piccolo, è apprezzato.

---

**Happy Coding! 🦊🏃**
