# Piano di Miglioramento (Roadmap)

Questo documento definisce i task necessari per risolvere le criticità identificate in `STATUS.md` e migliorare la manutenibilità del progetto.

## 🚀 Priorità Alta (Fix Immediati)

### 1. Pulizia Package Manager Frontend
- [ ] Decidere un unico package manager (consigliato: **NPM** per compatibilità standard o **Bun** per velocità, ma non entrambi).
- [ ] Rimuovere il lockfile non utilizzato (`bun.lockb` se si sceglie NPM, `package-lock.json` se si sceglie Bun).
- [ ] Aggiornare il comando di installazione ed esecuzione nel `README` o nella documentazione.

### 2. Fix Database e Gitignore
- [ ] Aggiungere `*.db` e `*.sqlite` a `backend/.gitignore`.
- [ ] Spostare la logica del DB per usare una cartella dedicata (es. `backend/data/`) invece della root.
- [ ] Rimuovere `strava_analyzer.db` dal tracciamento git se è stato committato (`git rm --cached`).

### 3. Pulizia File "Spazzatura"
- [ ] Rimuovere ricorsivamente tutti i file `.DS_Store`:
  ```bash
  find . -name ".DS_Store" -delete
  ```
- [ ] Pulire la cache Python:
  ```bash
  find . -type d -name "__pycache__" -exec rm -r {} +
  ```
- [ ] Consolidare i file di mock: Tenere solo `backend/app/utils/mock_data.json` ed eliminare le copie nella root `backend/`.

## 🛠 Priorità Media (Organizzazione e DevOps)

### 4. Standardizzazione Ambiente
- [ ] Creare un file `docker-compose.yml` nella root del progetto per orchestrare:
  - Servizio Backend (FastAPI)
  - Servizio Frontend (Vite server o build statica)
  - (Opzionale) Volume persistente per il DB.

### 5. Pulizia Artefatti AI
- [ ] Spostare file di documentazione AI (`PROMPT.md`, `roadmap.md`, `ralph.yml`) in una cartella `docs/` o `.ai-config/`.
- [ ] Aggiungere `.agent/` e `.logs/` al `.gitignore` globale o locale se non presenti.

### 6. Refactoring Minore
- [ ] Backend: Verificare `backend/app/main.py` e assicurarsi che `mock_router` sia esposto solo se `DEBUG=True` o in ambiente di sviluppo (attualmente è incluso sempre).
- [ ] Frontend: Standardizzare i nomi dei file in `src/components` (alcuni usano kebab-case `mode-toggle.tsx`, altri PascalCase `UserAvatar.tsx`).

## 📝 Comandi Utili per la Pulizia
```bash
# Rimuovere lockfile bun (se si sceglie npm)
rm frontend/bun.lockb

# Rimuovere copie duplicate backend
rm backend/mock_data.json backend/my_data.json
```
