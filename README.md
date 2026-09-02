# Backoffice Peerpetual

Back office del simulatore Testbusters / Peer4Med / Top Squad.
React 19 + TypeScript + Vite 8, TanStack Router e Query, Tailwind 4, shadcn/ui.

Questa copia è la **baseline per il lavoro di design**: gira sempre in locale con
dati finti, per prototipare la UI e mostrare schermate al cliente. Non si collega
a nessun backend e non è pensata per essere deployata.

## Avvio

```bash
npm install
npm run dev:mock     # → http://localhost:4300
```

Si apre direttamente sulla dashboard, popolata con ~200 domande realistiche.
Nessuna configurazione, nessun login, nessuna chiamata verso l'esterno.

Come funziona e cosa c'è nei dati: **[mock/README.md](./mock/README.md)**.

## Script

| Comando | Cosa fa |
|---|---|
| `npm run dev:mock` | L'unico modo di avviare l'app qui dentro |
| `npm run build` | Typecheck + build di produzione |
| `npm run lint` | ESLint |
| `npm run format` | Prettier su `src/` |

> `npm run lint` riporta ~2000 errori di formattazione **preesistenti** in
> `src/`, ereditati dal repo consegnato. `mock/` è pulito. Non correggerli in
> blocco: un `--fix` di massa renderebbe illeggibile il diff delle modifiche di
> design.

`package.json` contiene anche `dev`, `preview` e `ci`, ereditati dal repo
originale. Qui non servono: `dev` punterebbe al backend vero e si rifiuta di
partire senza `.env.local`, spiegando cosa lanciare al suo posto.

## Cosa sta nel repo e cosa no

Una domanda sola, prima di scrivere un file: **serve a chi implementa, o serve
solo a noi per decidere?**

- Serve a implementare → tracciato: `docs/specs/`, `docs/decisions/`, `.claude/*.md`
- Serve a decidere → `design/`, che è gitignored

Regole complete in **[design/CLAUDE.md](./design/CLAUDE.md)**.

## Struttura

```
src/
  components/      componenti per feature (questions/, collections/, pools/, …)
    ui/            shadcn/ui
  lib/
    api/           APIClient + interceptor di auth
    auth/          OIDC (oidc-client-ts) + capability
    services/      un file per risorsa, adatta le shape backend ↔ frontend
    hooks/         un hook per schermata, sopra i service
    types/         tipi di dominio
  routes/          routing file-based TanStack (rotte protette sotto _authenticated)
mock/              mock server locale (vedi mock/README.md)
docs/specs/        specifiche di cosa costruire
docs/decisions/    decisioni prese e perché
design/            deliberazione, gitignored
```

Altro contesto in [`.claude/`](./.claude/): architettura, contratti dei service,
inventario dei componenti, problemi noti. Lì c'è anche il riferimento al backend
vero ([Testbusters/elliotApiV2](https://github.com/Testbusters/elliotApiV2),
branch `StagingAdminStack`), che serve quando bisogna capire la shape reale di un
endpoint — non per collegarcisi.
