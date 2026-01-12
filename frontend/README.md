# FoxRun Frontend

Frontend React per l'applicazione FoxRun - un'analisi avanzata delle performance di corsa basata sui dati Strava.

## 🛠️ Stack Tecnologico

- **React 18** con TypeScript
- **Vite** - Build tool e dev server
- **Bun** - Runtime e package manager
- **Tailwind CSS** - Styling con liquid glass design
- **Radix UI** - Componenti accessibili
- **React Router** - Navigazione
- **React Query** - State management e caching
- **Recharts** - Grafici e visualizzazioni
- **Leaflet** - Mappe interattive
- **Zod** - Validazione schemi

## 📁 Struttura Progetto

```
frontend/
├── src/
│   ├── components/          # Componenti riutilizzabili
│   │   ├── ui/             # Componenti UI di base (Radix)
│   │   ├── Layout.tsx      # Layout principale
│   │   ├── Header.tsx      # Header con navigazione
│   │   ├── AppSidebar.tsx  # Sidebar navigazione
│   │   ├── MetricCard.tsx  # Card per metriche
│   │   └── ...
│   ├── pages/              # Pagine dell'applicazione
│   │   ├── Index.tsx       # Landing page / Dashboard
│   │   ├── Activities.tsx  # Lista attività
│   │   ├── ActivityDetail.tsx
│   │   ├── Trends.tsx
│   │   ├── Performance.tsx
│   │   ├── Routes.tsx
│   │   ├── Calendar.tsx
│   │   └── Settings.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Autenticazione
│   │   ├── useActivities.ts # Gestione attività
│   │   ├── useMyData.ts    # Dati utente
│   │   └── use-toast.ts    # Notifiche toast
│   ├── lib/                # Utilità e helpers
│   │   ├── api.ts          # Client API
│   │   └── utils.ts        # Funzioni utility
│   ├── App.tsx             # Componente root
│   ├── main.tsx            # Entry point
│   └── index.css           # Stili globali
├── public/                 # Asset statici
├── package.json
└── bun.lockb
```

## 🚀 Setup Sviluppo

### Prerequisiti

- **Bun** runtime installato ([guida installazione](https://bun.sh))
- Backend API in esecuzione su `http://localhost:8000`

### Installazione

```bash
# Installa le dipendenze
bun install
```

### Variabili d'Ambiente

Crea un file `.env` nella root del frontend:

```env
VITE_API_URL=http://localhost:8000
```

### Comandi Disponibili

```bash
# Sviluppo locale (http://localhost:5173)
bun run dev

# Build per produzione
bun run build

# Build in modalità development
bun run build:dev

# Preview build di produzione
bun run preview

# Linting
bun run lint
```

## 🎨 Design System

### Liquid Glass Aesthetic

Il design utilizza un approccio "liquid glass" con:
- **Glassmorphism** - Effetti vetro sfumato
- **Gradients dinamici** - Transizioni di colore fluide
- **Micro-animations** - Animazioni sottili per interattività
- **Dark mode** - Palette scura predominante

### CSS Custom Properties

Le variabili CSS personalizzate sono definite in `index.css`:

```css
/* Esempi */
--primary: hsl(...)
--gradient-primary: linear-gradient(...)
--glass-bg: rgba(...)
```

### Componenti UI

I componenti base sono costruiti con **Radix UI** per garantire accessibilità e personalizzazione. Tutti i componenti si trovano in `src/components/ui/`.

## 📡 API Integration

### Client API

Il client API è configurato in `src/lib/api.ts` e usa `fetch` con gestione automatica di:
- Base URL da variabili d'ambiente
- JWT token headers
- Error handling

### React Query

Utilizziamo `@tanstack/react-query` per:
- **Caching** - Cache automatica delle risposte
- **Refetching** - Aggiornamento automatico dati
- **Optimistic updates** - UI reattiva

Esempio:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['activities'],
  queryFn: () => fetchActivities()
});
```

## 🔐 Autenticazione

L'autenticazione è gestita tramite:
1. **OAuth2** con Strava (redirect flow)
2. **JWT tokens** per API calls
3. **localStorage** per persistenza sessione

Hook principale: `useAuth.ts`

```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

## 🧩 Custom Hooks

### `useAuth.ts`
Gestisce autenticazione, login/logout, e stato utente.

### `useActivities.ts`
Fetch e gestione lista attività con filtri e paginazione.

### `useMyData.ts`
Carica dati personalizzati e statistiche utente.

### `use-toast.ts`
Sistema di notifiche toast per feedback utente.

## 🗺️ Routing

Le rotte sono definite in `App.tsx`:

| Path | Componente | Descrizione |
|------|-----------|-------------|
| `/` | Index | Landing / Dashboard |
| `/activities` | Activities | Lista attività |
| `/activity/:id` | ActivityDetail | Dettaglio singola attività |
| `/trends` | Trends | Analisi tendenze |
| `/performance` | Performance | Metriche performance |
| `/routes` | Routes | Visualizzazione percorsi |
| `/calendar` | Calendar | Vista calendario |
| `/settings` | Settings | Impostazioni utente |
| `/auth/callback` | AuthCallback | Callback OAuth Strava |

## 📊 Grafici e Visualizzazioni

### Recharts
Utilizzato per grafici:
- Line charts (tendenze nel tempo)
- Bar charts (comparazioni)
- Area charts (volumi)

### Leaflet
Mappe interattive per:
- Visualizzazione percorsi attività
- Polyline da dati GPS
- Markers per punti di interesse

## 🧪 Testing

```bash
# Esegui test
bun test

# Watch mode
bun test --watch
```

## 📦 Build e Deploy

### Build Produzione

```bash
bun run build
```

Output: `dist/` directory

### Ottimizzazioni

- **Code splitting** automatico per rotte
- **Tree shaking** per ridurre bundle size
- **Minification** con Terser
- **Asset optimization** via Vite

### Deploy su Vercel

1. Configura root directory: `frontend`
2. Build command: `bun run build`
3. Output directory: `dist`
4. Variabili d'ambiente: `VITE_API_URL`

## 🐛 Debugging

### Dev Tools

- **React Developer Tools** - Ispeziona componenti
- **React Query Devtools** - Monitora cache e queries
- **Network tab** - Verifica chiamate API

### Console Logging

I log sono disabilitati in produzione. Usa:

```typescript
if (import.meta.env.DEV) {
  console.log('Debug info');
}
```

## 📚 Risorse Utili

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [React Query](https://tanstack.com/query)

## 🤝 Contribuire

Consulta [CONTRIBUTING.md](../CONTRIBUTING.md) per le linee guida.
