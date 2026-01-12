# Stato del Progetto Foxrun

## 📊 Panoramica
Il progetto è un'applicazione full-stack per l'analisi di dati Strava, composta da:
- **Backend:** Python (FastAPI) con database SQLite e integrazione StravaLib.
- **Frontend:** TypeScript (React + Vite) con UI basata su Tailwind.

## 🔴 Criticità e Debito Tecnico

### 1. Gestione delle Dipendenze (Frontend)
**Gravità: Alta**
Nel frontend sono presenti sia `package-lock.json` (NPM) che `bun.lockb` (Bun).
- **Problema:** Questo crea conflitti nelle versioni delle dipendenze e confonde il workflow di sviluppo. Non è chiaro quale package manager sia l'autorità ("Source of Truth").
- **Impatto:** Possibili build fallite o comportamenti incoerenti tra ambienti di sviluppo diversi.

### 2. Sicurezza e Dati (Backend)
**Gravità: Alta**
Il file del database `strava_analyzer.db` si trova nella root del backend.
- **Problema:** Non sembra essere escluso dal version control (manca in `.gitignore`). Committare file binari e dati reali/di test nel repository gonfia la repo e pone rischi di privacy.
- **Impatto:** Repository pesante, rischio leak dati, conflitti di merge sul binario del DB.

### 3. Igiene del Repository
**Gravità: Media**
- **File Inutili:** Presenza diffusa di `.DS_Store` (metadati macOS) e cartelle `__pycache__`.
- **Artefatti AI:** Cartelle `.agent/`, `.logs/` e file come `ralph.yml`, `PROMPT.md` nella root del frontend. Questi dovrebbero essere ignorati o organizzati meglio, non mischiati al codice sorgente.
- **File Duplicati:** `mock_data.json` e `my_data.json` esistono sia nella root di `backend/` che in `backend/app/utils/`.

### 4. Architettura
**Gravità: Media**
- **Mancanza di Orchestrazione:** Non esiste un modo semplice per avviare l'intero stack (es. `docker-compose` o script di avvio unificato). Backend e frontend vivono come silos separati.
- **Struttura Cartelle:** La cartella `venv` è presente dentro `backend/`, ma idealmente dovrebbe essere gestita fuori o ricreabile via script, senza rischiare di essere tracciata se `.gitignore` fallisce (anche se attualmente è ignorata, la sua presenza visiva in alberatura suggerisce che sia locale al progetto).

## ✅ Punti di Forza
- **Stack Tecnologico:** Scelta moderna e performante (FastAPI + React/Vite).
- **Struttura Codice:** Il backend segue una buona struttura modulare (`api`, `core`, `services`, `models`).
- **Typing:** Buon uso delle interfacce TypeScript nel frontend per mappare i dati del backend.
