# Cosa sta nel repo e cosa no

## Il criterio

Prima di scrivere un file, una domanda sola:

> **Serve a chi dovrà implementarlo — persona o agente?
> O serve solo a noi per decidere?**

Il primo caso sta nel repo. Il secondo sta in `design/`, che è gitignored.

Non è una questione di segretezza: è che un repo pieno di deliberazione diventa
illeggibile, e un agente che ci lavora dentro non sa più cosa è una specifica e
cosa era un'ipotesi di mezz'ora. Il repo deve contenere il **risultato** del
ragionamento, non il ragionamento.

## Tracciato — serve a implementare

| Cosa | Dove |
|---|---|
| Specifiche: cosa costruire, come si comporta | `docs/specs/NNN-nome.md` |
| Decisioni prese, col vincolo tecnico che le motiva | `docs/decisions/YYYY-MM-DD-titolo.md` |
| Come funziona il codice oggi | `.claude/*.md` |
| Come far girare l'app in locale | `mock/README.md`, `README.md` |

Template in `docs/specs/_TEMPLATE.md` e `docs/decisions/_TEMPLATE.md`.

Regola di scrittura: **scrivili per Edoardo, non per te.** Se una frase ha senso
solo per chi era in call, riscrivila o spostala in `design/`.

## Ignorato — serve solo a noi

`design/` non finisce mai su GitHub.

| Cosa | Dove |
|---|---|
| Note di call, trascrizioni, chi ha detto cosa | `design/notes/` |
| Benchmark, ricerca, riferimenti visivi | `design/notes/` |
| Opzioni scartate, ipotesi non validate | `design/notes/` |
| Dinamiche di team e di cliente, tempi, budget | `design/notes/` |
| Esplorazioni usa-e-getta | `design/scratch/` |

Ci finisce anche l'output delle skill del flusso emps (`briefs/`,
`requirements/`, `use-cases/`, `insights/`, `research-plans/`, `proposals/`,
`meeting-notes/`, `log.md`): sono già gitignorate, lasciale dove atterrano.

## Dove passa la linea, in pratica

| Deliberazione → `design/` | Specifica → `docs/` |
|---|---|
| "Abbiamo valutato tre modi di assegnare la difficoltà" | "La difficoltà si assegna così" |
| "Da confermare perché il referente prodotto è in transizione" | "Stato: da confermare" |
| "Il cliente su questo è sensibile" | *(non entra nel repo)* |
| "Benchmark: come lo fa Quizlet" | "Il pattern scelto è X" |

Stesso contenuto, due usi diversi. La versione in `docs/` dice **cosa vale**, non
come ci siamo arrivati né chi era d'accordo.

## Cosa non fare

- **Niente deliberazione nei commenti del codice.** Un commento dice perché quella
  riga è così, non quali alternative hai scartato.
- **Niente deliberazione nei messaggi di commit.** Il commit dice cosa cambia e
  perché tecnicamente.
- **Niente nuovi `.md` sparsi nella root.** Questo repo aveva già il problema:
  `docs/MOCK_MIGRATION.md` descriveva un sistema rimosso da mesi e ha sviato più
  di una sessione. Documentazione tracciata solo se descrive il codice o la
  specifica **com'è adesso**; quando smette di essere vera, si corregge o si
  marca obsoleta.
- **Non spostare `.claude/*.md` in `design/`.** Sono documentazione del codice,
  arrivata col repo del cliente: restano tracciati e si aggiornano quando il
  codice cambia.

## Il deliverable

Quello che si riconsegna a Edoardo resta:

```bash
git diff <primo-commit>..HEAD -- src/
```

più le specifiche in `docs/`. Se in quel diff finisce qualcosa che non è una
modifica di prodotto, è finita nel posto sbagliato.
