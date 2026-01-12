# Proposta di Progetto: Strava Run Analyzer

## 1. Panoramica del Progetto

**Titolo:** Strava Run Analyzer
**Breve Descrizione:** Strava Run Analyzer è un'applicazione web full-stack progettata per fornire agli atleti, in particolare ai corridori, un'analisi approfondita e personalizzata delle proprie performance basata sui dati delle attività sincronizzate da Strava. L'obiettivo è trasformare i dati grezzi di corsa in insight significativi, aiutando gli utenti a comprendere meglio i propri progressi, identificare tendenze, punti di forza e aree di miglioramento.

**Scopo:**
*   Offrire una piattaforma centralizzata per la visualizzazione e l'analisi delle metriche di corsa.
*   Fornire strumenti avanzati per l'analisi delle tendenze di performance nel tempo.
*   Consentire la comparazione dettagliata tra diverse attività.
*   Garantire un'esperienza utente intuitiva e visivamente accattivante.
*   Mantenere la privacy e la sicurezza dei dati dell'utente.

## 2. Obiettivi del Progetto

*   **Autenticazione e Sincronizzazione:** Implementare un sistema robusto per l'autenticazione OAuth2 con Strava e una sincronizzazione efficiente dei dati delle attività.
*   **Visualizzazione Dati:** Sviluppare una dashboard riepilogativa e pagine di dettaglio attività con grafici interattivi e metriche chiave.
*   **Analisi Avanzata:** Integrare funzionalità per l'analisi delle tendenze, la comparazione delle attività e l'identificazione di pattern di performance.
*   **Usabilità:** Progettare un'interfaccia utente (UI) pulita, intuitiva e responsiva, garantendo un'ottima esperienza utente (UX) su diversi dispositivi.
*   **Scalabilità:** Costruire un'architettura modulare che possa essere facilmente estesa con nuove funzionalità in futuro.
*   **Affidabilità:** Assicurare la stabilità dell'applicazione e la precisione delle analisi.

## 3. Pubblico di Destinazione

*   **Corridori Amatoriali e Semi-Professionisti:** Utenti che utilizzano Strava per tracciare le proprie corse e desiderano un'analisi più dettagliata rispetto a quanto offerto dalla piattaforma nativa.
*   **Allenatori:** Professionisti che cercano uno strumento per analizzare le performance dei propri atleti in modo più granulare.
*   **Appassionati di Dati:** Utenti interessati a esplorare i propri dati di fitness in un contesto più analitico.

## 4. Funzionalità Dettagliate

### 4.1. Autenticazione e Gestione Dati Strava

*   **Connessione Strava (OAuth2):**
    *   Processo di autenticazione sicuro tramite il protocollo OAuth2 di Strava.
    *   Richiesta dei permessi necessari (lettura attività, profilo).
    *   Memorizzazione sicura dei token di accesso e refresh.
*   **Sincronizzazione Attività:**
    *   **Sincronizzazione Iniziale:** Al primo accesso, download di tutte le attività storiche dell'utente da Strava.
    *   **Sincronizzazione Incrementale:** Aggiornamenti periodici (manuali o automatici) per scaricare solo le nuove attività o le modifiche a quelle esistenti.
    *   **Gestione Errori Sincronizzazione:** Feedback chiaro all'utente in caso di problemi di connessione o API.
    *   **Stato Sincronizzazione:** Indicatore visivo dello stato di avanzamento della sincronizzazione.
*   **Memorizzazione Dati:**
    *   Salvataggio dei dati delle attività (dettagli, laps, stream di dati come ritmo, frequenza cardiaca, cadenza, potenza, GPS) in un database locale.
    *   Normalizzazione e pulizia dei dati per analisi efficienti.

### 4.2. Dashboard Riepilogativa

*   **Metriche Totali:** Distanza totale percorsa, tempo totale di attività, dislivello positivo totale, numero totale di attività.
*   **Tendenze Temporali:**
    *   Grafici a barre/linea per visualizzare l'andamento di distanza, tempo, dislivello e ritmo medio su base settimanale, mensile e annuale.
    *   Filtri temporali personalizzabili (es. ultimi 30 giorni, anno corrente, intervallo personalizzato).
*   **Record Personali (PRs):**
    *   Visualizzazione dei migliori tempi su distanze standard (es. 1k, 5k, 10k, Mezza Maratona, Maratona).
    *   Possibilità di visualizzare i PRs per segmenti specifici (se implementato l'analisi dei segmenti).
*   **Heatmap delle Attività:** Una visualizzazione calendario che mostra l'intensità o la frequenza delle corse.

### 4.3. Elenco Attività

*   **Tabella Dettagliata:** Elenco di tutte le attività sincronizzate con colonne configurabili: data, nome attività, distanza, tempo, ritmo medio, dislivello, tipo di attività.
*   **Filtri:** Per tipo di attività, intervallo di date, distanza, durata.
*   **Ordinamento:** Possibilità di ordinare le attività per qualsiasi colonna.
*   **Paginazione:** Gestione efficiente di un gran numero di attività.
*   **Ricerca:** Funzionalità di ricerca per nome attività o note.

### 4.4. Dettaglio Attività Singola

*   **Mappa Interattiva:** Visualizzazione del percorso GPS dell'attività su una mappa (es. OpenStreetMap, Mapbox) con possibilità di zoom e pan.
*   **Grafici Dettagliati Interattivi:**
    *   **Ritmo/Velocità:** Andamento del ritmo/velocità lungo il percorso.
    *   **Frequenza Cardiaca:** Andamento della frequenza cardiaca.
    *   **Cadenza:** Andamento della cadenza.
    *   **Potenza (se disponibile):** Andamento della potenza.
    *   **Dislivello:** Profilo altimetrico del percorso.
    *   Grafici sincronizzati con la mappa (es. cliccando su un punto del grafico, si evidenzia la posizione sulla mappa).
*   **Analisi Laps/Split:**
    *   Tabella con i dati per ogni lap (automatico o manuale): distanza, tempo, ritmo, dislivello.
    *   Visualizzazione grafica dei ritmi per lap.
*   **Analisi Zone:**
    *   Distribuzione del tempo trascorso in diverse zone di ritmo, frequenza cardiaca, cadenza, potenza.
    *   Grafici a torta o a barre per visualizzare la percentuale di tempo in ogni zona.
*   **Metriche Aggiuntive:** Tempo in movimento, calorie bruciate, temperatura, ecc.

### 4.5. Analisi delle Tendenze e Comparazione

*   **Tendenze di Ritmo:** Grafici che mostrano l'evoluzione del ritmo medio su distanze specifiche (es. 1k, 5k, 10k) nel tempo.
*   **Volume di Allenamento:** Analisi del volume (distanza, tempo) e dell'intensità (ritmo medio, dislivello) per periodi selezionati.
*   **Comparazione Attività:**
    *   Strumento per selezionare due o più attività e confrontare i loro grafici (ritmo, HR, ecc.) su un'unica visualizzazione.
    *   Tabella comparativa delle metriche chiave.
    *   Sovrapposizione dei percorsi sulla mappa.
*   **Analisi del Ritmo Dettagliata:**
    *   Identificazione automatica di variazioni significative di ritmo (es. accelerazioni, rallentamenti, salite/discese).
    *   Visualizzazione della distribuzione del ritmo (es. istogramma dei ritmi per km/miglio).

### 4.6. Impostazioni Utente

*   **Unità di Misura:** Selezione tra sistema metrico (km, m/s) e imperiale (miglia, mph).
*   **Zone Personalizzate:** Configurazione delle zone di frequenza cardiaca, ritmo, cadenza, potenza.
*   **Preferenze di Visualizzazione:** Personalizzazione dei colori dei grafici, layout della dashboard.

## 5. Stack Tecnologico

### 5.1. Frontend

*   **React (JavaScript/TypeScript):**
    *   **Motivazione:** Libreria UI leader di mercato, ecosistema vasto, componenti riutilizzabili, forte supporto della community, ideale per applicazioni single-page complesse e interattive. L'uso di TypeScript migliora la manutenibilità e la robustezza del codice.
*   **Librerie di Grafici:**
    *   **Recharts:**
        *   **Motivazione:** Basato su React e D3.js, offre componenti grafici altamente personalizzabili e performanti, ideali per visualizzazioni di dati complesse e interattive. Alternativa: Chart.js (più semplice, ma meno flessibile per interazioni avanzate).
*   **Framework UI:**
    *   **Material-UI (MUI):**
        *   **Motivazione:** Implementazione di Material Design di Google, offre un set completo di componenti UI pre-costruiti, responsivi e personalizzabili, accelerando lo sviluppo e garantendo un'estetica moderna e coerente. Alternativa: Bootstrap.
*   **Gestione dello Stato:**
    *   **React Context API / Redux Toolkit:** Per la gestione dello stato globale dell'applicazione (es. stato di autenticazione, dati utente, dati attività).

### 5.2. Backend

*   **Python con FastAPI:**
    *   **Motivazione:** Framework web moderno, veloce e performante per la costruzione di API. Basato su standard Python (type hints) e OpenAPI (Swagger UI automatico), facilita la documentazione e il testing delle API. Ottimo per l'elaborazione dati intensiva.
*   **Interazione Strava API:**
    *   **`stravalib`:**
        *   **Motivazione:** Libreria Python ben mantenuta che semplifica l'interazione con l'API di Strava, gestendo l'autenticazione OAuth2 e il parsing delle risposte.
*   **Elaborazione Dati:**
    *   **`pandas`:**
        *   **Motivazione:** Libreria fondamentale per l'analisi e la manipolazione di dati tabellari. Essenziale per pulire, trasformare e aggregare i dati delle attività.
    *   **`numpy`:**
        *   **Motivazione:** Base per `pandas`, offre operazioni numeriche efficienti su array, cruciale per calcoli su grandi set di dati (es. ritmi, dislivelli).
    *   **`scipy`:**
        *   **Motivazione:** Per analisi scientifiche e tecniche, inclusi algoritmi di smoothing, interpolazione e statistiche avanzate sui dati di corsa.
    *   **`scikit-learn` (Potenziale):**
        *   **Motivazione:** Per future funzionalità di machine learning, come la previsione delle performance o l'identificazione di pattern di allenamento.
*   **Database:**
    *   **SQLite:**
        *   **Motivazione:** Database leggero, serverless e basato su file, ideale per applicazioni desktop o per la memorizzazione locale dei dati. Facile da configurare e gestire, non richiede un server database separato. Per un'applicazione multi-utente o con requisiti di scalabilità maggiori, si potrebbe considerare PostgreSQL.
*   **ORM (Object-Relational Mapper):**
    *   **SQLAlchemy:**
        *   **Motivazione:** ORM potente e flessibile per interagire con SQLite (o altri database) in modo Pythonico, astraendo le query SQL dirette.

### 5.3. Altri Strumenti

*   **Docker:** Per la containerizzazione dell'applicazione (frontend e backend), facilitando lo sviluppo, il testing e il deployment in ambienti diversi.
*   **Git:** Sistema di controllo versione per la gestione del codice.
*   **Prettier / ESLint (Frontend):** Per la formattazione automatica del codice e il linting.
*   **Black / Flake8 (Backend):** Per la formattazione automatica del codice Python e il linting.

## 6. Architettura del Sistema

L'applicazione seguirà un'architettura client-server standard, con un frontend React che comunica con un backend FastAPI tramite API REST.

```mermaid
graph TD
    A[Utente] -->|Accede tramite Browser| B(Frontend React)
    B -->|Richieste API REST (JSON)| C(Backend FastAPI)
    C -->|OAuth2| D(Strava API)
    C -->|Lettura/Scrittura SQL| E(Database SQLite)
    D -->|Dati Attività (JSON)| C
    E -->|Dati Attività/Utente| C
    C -->|Risposte API REST (JSON)| B
    B -->|Visualizzazione Dati| A
```

**Flusso Dati:**
1.  **Autenticazione:** L'utente avvia il processo di autenticazione dal Frontend, che reindirizza a Strava. Strava autentica l'utente e reindirizza al Backend con un codice di autorizzazione. Il Backend scambia il codice con i token di accesso e refresh di Strava.
2.  **Sincronizzazione:** Il Frontend invia una richiesta al Backend per sincronizzare le attività. Il Backend utilizza `stravalib` per chiamare l'API di Strava, scaricare i dati delle attività e memorizzarli nel database SQLite.
3.  **Visualizzazione:** Il Frontend effettua richieste API al Backend per ottenere i dati necessari per la dashboard, l'elenco attività o i dettagli di una singola attività.
4.  **Analisi:** Il Backend elabora i dati grezzi utilizzando `pandas`, `numpy` e `scipy` prima di inviarli al Frontend per la visualizzazione.

## 7. Modello Dati (Semplificato)

Il database SQLite conterrà le seguenti tabelle principali:

*   **`users`:**
    *   `id` (Primary Key)
    *   `strava_id` (ID utente Strava)
    *   `access_token` (Token OAuth2 per Strava)
    *   `refresh_token` (Token per rinnovare l'access_token)
    *   `expires_at` (Timestamp di scadenza del token)
    *   `first_name`
    *   `last_name`
    *   `profile_picture_url`
    *   `last_sync_timestamp`
*   **`activities`:**
    *   `id` (Primary Key)
    *   `strava_activity_id` (ID attività Strava)
    *   `user_id` (Foreign Key a `users.id`)
    *   `name` (Nome attività)
    *   `distance` (Distanza in metri)
    *   `moving_time` (Tempo in movimento in secondi)
    *   `elapsed_time` (Tempo totale in secondi)
    *   `total_elevation_gain` (Dislivello positivo in metri)
    *   `type` (es. 'Run', 'Ride')
    *   `start_date` (Timestamp di inizio attività)
    *   `average_speed` (m/s)
    *   `max_speed` (m/s)
    *   `average_heartrate`
    *   `max_heartrate`
    *   `average_cadence`
    *   `average_watts` (se disponibile)
    *   `map_polyline` (Stringa codificata del percorso GPS)
    *   `summary_polyline` (Stringa codificata del percorso GPS riassuntivo)
    *   `detailed_data` (JSON/BLOB per stream di dati grezzi: pace, HR, cadenza, GPS points, ecc.)
*   **`laps` (Opzionale, per analisi più granulare):**
    *   `id` (Primary Key)
    *   `activity_id` (Foreign Key a `activities.id`)
    *   `lap_index`
    *   `distance`
    *   `moving_time`
    *   `average_speed`
    *   `start_date`

## 8. Fasi di Sviluppo e Milestones

### Fase 1: Setup e Core Sync (Settimane 1-2)
*   **Setup Progetto:** Inizializzazione repository Git, configurazione ambiente di sviluppo (Docker, virtualenv).
*   **Backend Core:**
    *   Configurazione FastAPI.
    *   Implementazione autenticazione OAuth2 con Strava.
    *   Definizione modello dati SQLite e ORM (SQLAlchemy).
    *   Endpoint API per la sincronizzazione iniziale e incrementale delle attività.
    *   Logica di base per il download e la memorizzazione dei dati Strava.
*   **Frontend Core:**
    *   Configurazione React/TypeScript.
    *   Pagina di login/connessione a Strava.
    *   Componente per visualizzare lo stato della sincronizzazione.
*   **Milestone:** Autenticazione Strava funzionante e sincronizzazione delle attività base nel database locale.

### Fase 2: Dashboard e Elenco Attività (Settimane 3-4)
*   **Backend API:** Endpoint per recuperare metriche aggregate e l'elenco delle attività.
*   **Frontend Dashboard:**
    *   Implementazione della dashboard riepilogativa con metriche totali.
    *   Grafici di tendenza base (distanza, tempo) con Recharts/Chart.js.
*   **Frontend Elenco Attività:**
    *   Tabella delle attività con filtri e ordinamento.
    *   Paginazione.
*   **Milestone:** Dashboard funzionante con metriche riepilogative e elenco attività navigabile.

### Fase 3: Dettaglio Attività Singola (Settimane 5-6)
*   **Backend API:** Endpoint per recuperare tutti i dettagli di una singola attività, inclusi gli stream di dati.
*   **Frontend Dettaglio Attività:**
    *   Mappa interattiva del percorso.
    *   Grafici interattivi per ritmo, frequenza cardiaca, cadenza, dislivello.
    *   Tabella dei laps/split.
    *   Analisi delle zone (ritmo, HR).
*   **Milestone:** Pagina di dettaglio attività completa e interattiva.

### Fase 4: Analisi Avanzata e Refinements (Settimane 7-8)
*   **Backend Logica di Analisi:**
    *   Implementazione logica per l'analisi delle tendenze di ritmo.
    *   Logica per la comparazione di attività.
    *   Calcolo dei PRs.
*   **Frontend UI/UX:**
    *   Interfaccia per la comparazione delle attività.
    *   Visualizzazione dei PRs.
    *   Miglioramenti generali all'UI/UX, responsività.
    *   Implementazione delle impostazioni utente (unità di misura, zone).
*   **Milestone:** Funzionalità di analisi avanzata implementate e UI/UX raffinata.

### Fase 5: Testing e Deployment (Settimane 9-10)
*   **Testing:**
    *   Scrittura e esecuzione di unit test per backend e frontend.
    *   Test di integrazione.
    *   Test end-to-end.
    *   Test di performance e stress (se necessario).
*   **Documentazione:** Aggiornamento della documentazione tecnica e utente.
*   **Deployment:** Preparazione per il deployment (es. Docker Compose per ambiente locale, istruzioni per cloud provider).
*   **Milestone:** Applicazione stabile, testata e pronta per il rilascio.

## 9. Strategia di Testing

*   **Unit Tests:**
    *   **Backend:** Utilizzo di `pytest` per testare singole funzioni e classi (es. parsing dati Strava, logica di calcolo metriche).
    *   **Frontend:** Utilizzo di `Jest` e `React Testing Library` per testare componenti React isolati.
*   **Integration Tests:**
    *   Testare l'interazione tra il frontend e il backend (es. chiamate API).
    *   Testare l'interazione del backend con il database e l'API di Strava (con mock per l'API esterna).
*   **End-to-End Tests:**
    *   Utilizzo di strumenti come `Cypress` o `Playwright` per simulare scenari utente completi nel browser.
*   **Test Manuali:** Esecuzione di test manuali per verificare l'usabilità e la coerenza dell'interfaccia.

## 10. Strategia di Deployment

*   **Ambiente di Sviluppo Locale:** Utilizzo di Docker Compose per avviare facilmente il frontend, il backend e il database SQLite.
*   **Ambiente di Produzione:**
    *   **Backend:** Potrebbe essere deployato su piattaforme PaaS (Platform as a Service) come Heroku, Render, o su un VPS (Virtual Private Server) con Nginx/Gunicorn.
    *   **Frontend:** Può essere deployato come file statici su servizi come Vercel, Netlify, o un bucket S3 con CloudFront.
    *   **Database:** Per un'applicazione multi-utente, si passerebbe da SQLite a un database relazionale più robusto come PostgreSQL, ospitato su un servizio cloud (es. AWS RDS, Google Cloud SQL).

## 11. Considerazioni sulla Sicurezza

*   **OAuth2:** Implementazione corretta del flusso OAuth2 per l'autenticazione con Strava, evitando la memorizzazione di credenziali utente.
*   **Token Management:** Gestione sicura dei token di accesso e refresh di Strava (memorizzazione criptata, refresh automatico).
*   **Validazione Input:** Tutte le API del backend devono validare e sanificare gli input per prevenire attacchi come SQL Injection o XSS.
*   **HTTPS:** Tutte le comunicazioni tra frontend e backend, e con l'API di Strava, devono avvenire tramite HTTPS.
*   **CORS:** Configurazione appropriata delle politiche CORS (Cross-Origin Resource Sharing) sul backend.
*   **Privacy dei Dati:** Assicurarsi che i dati degli utenti siano accessibili solo all'utente proprietario e non vengano condivisi senza consenso esplicito.

## 12. Gestione degli Errori e Logging

*   **Backend:**
    *   Implementazione di un sistema di logging robusto (es. `logging` di Python) per tracciare errori, avvisi e informazioni importanti.
    *   Gestione centralizzata delle eccezioni per fornire risposte API coerenti e informative.
    *   Monitoraggio delle chiamate API a Strava e gestione dei limiti di rate.
*   **Frontend:**
    *   Visualizzazione di messaggi di errore chiari e user-friendly.
    *   Utilizzo di strumenti di monitoraggio degli errori (es. Sentry) in produzione.

## 13. Miglioramenti Futuri (Roadmap)

*   **Analisi dei Segmenti:** Integrazione con i segmenti Strava per analizzare le performance su tratti specifici.
*   **Piani di Allenamento:** Possibilità di creare e tracciare piani di allenamento personalizzati.
*   **Integrazione con Altri Dispositivi/Servizi:** Supporto per Garmin Connect, TrainingPeaks, ecc.
*   **Machine Learning:** Previsione delle performance, suggerimenti di allenamento basati sui dati storici.
*   **Social Features:** Condivisione di analisi, comparazione con amici.
*   **Notifiche:** Notifiche per nuovi PRs, tendenze significative.
*   **Esportazione Dati:** Possibilità di esportare i dati analizzati in formati come CSV, PDF.

## 14. Strategia per i Placeholder e Dati Mock

Per accelerare lo sviluppo e consentire il lavoro parallelo tra frontend e backend, verrà adottata una strategia robusta di utilizzo di dati mock e API simulate:

*   **Dati Mock Generati:**
    *   Verranno creati script Python per generare set di dati di attività di corsa fittizi, ma realistici, che replicano la struttura e la tipologia dei dati forniti dall'API di Strava (es. distanza, tempo, ritmo, frequenza cardiaca, cadenza, punti GPS).
    *   Questi dati includeranno variazioni per simulare diverse performance, tipi di terreno e condizioni.
*   **API Mock del Backend:**
    *   Il backend FastAPI avrà una modalità di sviluppo che, se attivata, servirà i dati mock anziché tentare di connettersi a Strava o al database reale.
    *   Questo permetterà al frontend di svilupparsi e testare le proprie visualizzazioni e interazioni senza dipendere dalla disponibilità dell'API di Strava o dalla logica di sincronizzazione completa.
    *   Gli endpoint API del backend saranno progettati per essere agnostici rispetto alla fonte dei dati (reale o mock).
*   **Frontend con Dati Statici/Simulati:**
    *   Inizialmente, i componenti del frontend (dashboard, grafici) potranno essere popolati con dati statici o generati localmente per testare il layout e l'interattività.
    *   Successivamente, si passerà all'integrazione con le API mock del backend.
*   **Simulazione API Strava:**
    *   Per i test del backend, verranno utilizzati mock object per simulare le risposte dell'API di Strava, garantendo che la logica di parsing e memorizzazione dei dati funzioni correttamente anche senza una connessione attiva a Strava.

Questa strategia garantirà che lo sviluppo possa procedere in modo efficiente, con cicli di feedback rapidi e la possibilità di testare ampiamente l'applicazione prima dell'integrazione finale con i dati reali di Strava.
