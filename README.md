# Backoffice Peerpetual

Back office del simulatore Testbusters / Peer4Med / Top Squad.
React 19 + TypeScript + Vite 8, TanStack Router e Query, Tailwind 4, shadcn/ui.

Questa copia è la **baseline per il lavoro di design**: si avvia in locale con
dati finti, senza backend e senza SSO, per prototipare la UI e mostrare
schermate al cliente.

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
| `npm run dev:mock` | Dev server con mock API e sessione finta (porta 4300) |
| `npm run dev` | Dev server sul backend vero (porta 3000, richiede `.env.local`) |
| `npm run build` | Typecheck + build di produzione |
| `npm run lint` | ESLint |
| `npm run format` | Prettier su `src/` |

> `npm run lint` riporta ~2000 errori di formattazione **preesistenti** in
> `src/`, ereditati dal repo consegnato. `mock/` è pulito. Non correggerli in
> blocco: un `--fix` di massa renderebbe illeggibile il diff delle modifiche di
> design.

## Backend vero

Copia `.env.example` in `.env.local` e riempi i valori. Serve una sessione SSO
valida su `sso.peerpetual.com`.

Il backend vive in [Testbusters/elliotApiV2](https://github.com/Testbusters/elliotApiV2),
branch `StagingAdminStack`. Per wirare un endpoint nuovo la fonte di verità è il
construct CDK (`lib/constructs/modules/<name>.ts`) più il suo file di modelli.
**Non** usare `docs/openapi.json`: è uno snapshot vecchio e punta a un URL morto.

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
```

Altro contesto in [`.claude/`](./.claude/): architettura, contratti dei service,
inventario dei componenti, problemi noti.
