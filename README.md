# Ordini Tracker

Prototipo non richiesto, costruito di mia iniziativa durante una candidatura per mostrare come affronterei un problema di go-to-market: mappare le convenzioni di una legaltech con i 139 Ordini degli Avvocati italiani usando solo fonti pubbliche. Non è affiliato all'azienda né approvato da lei.

## Dati dimostrativi

La versione pubblica usa **dati dimostrativi**. L'elenco degli Ordini (CNF) e il numero di iscritti (Cassa Forense 2023, disponibile per 34 Ordini) sono reali; stati, sconti e date delle convenzioni sono inventati.

Il punto del prototipo è il metodo, non i numeri. In particolare tiene separati due stati che sembrano uguali:

- `Non trovata`: l'Ordine è stato cercato e non c'è traccia pubblica di una convenzione;
- `Non verificata`: l'Ordine non è ancora stato cercato.

Così la copertura mostrata è dichiaratamente una stima per difetto, e si vede quanta parte della mappa è ancora da verificare.

## Cosa mostra

- **KPI**: Ordini totali, convenzioni attive, copertura nazionale, regione più e meno coperta.
- **Mappa dell'Italia**: colori per percentuale di copertura; clic su una regione per il dettaglio.
- **Pannello regione**: elenco Ordini della regione con stato e sconto.
- **Tabella**: ricerca, filtri per stato e regione, ordinamento, paginazione.

Stati convenzione: `Attiva`, `Non trovata`, `Scaduta`, `Non verificata`.

## Stack

React 19 · Vite 7 · TypeScript · Tailwind CSS 4 · shadcn/ui · pnpm workspace · hosting statico su Vercel.

Nessun backend né database: i dati sono un file JSON incluso nel bundle.

## Sviluppo locale

Requisiti: Node 24+, pnpm (la versione è fissata in `package.json`; con Corepack attivo viene usata in automatico).

```bash
corepack enable
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # output in artifacts/ordini-tracker/dist/public
pnpm preview      # serve la build
pnpm typecheck
```

## Dati

Tutti i dati sono in [`artifacts/ordini-tracker/src/data/ordini.json`](artifacts/ordini-tracker/src/data/ordini.json), con i tipi in [`src/data/types.ts`](artifacts/ordini-tracker/src/data/types.ts). Ogni Ordine ha regione, iscritti e un oggetto `convention` con stato, sconto, fonte, data di rilevazione ed eventuale scadenza.

## Deploy

La configurazione di build per Vercel è in [`vercel.json`](vercel.json). Sul progetto Vercel servono Node 24.x e `ENABLE_EXPERIMENTAL_COREPACK=1` (per usare la versione di pnpm fissata).

## Struttura

```text
artifacts/ordini-tracker/
├── src/
│   ├── components/      # Dashboard, ItalyMap, KPIBar, RegionPanel, OrdiniTable, StatusBadge
│   │   └── ui/          # componenti shadcn/ui
│   └── data/            # ordini.json, tipi e funzioni di aggregazione
└── vite.config.ts
vercel.json
```
