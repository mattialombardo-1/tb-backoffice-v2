# Regole per il lavoro di design in questo repo

Questo file governa **dove finisce il ragionamento**. Vale per chiunque lavori
qui, umano o agente.

## La regola

> Il ragionamento sta in `design/`. Il codice sta in `src/`.
> Non si mescolano.

`design/` è **gitignored**: PRD, note, esplorazioni e decisioni non finiscono
mai nel repo del cliente. Tracciati restano solo `README.md`, questo file e
`_templates/`.

Il motivo è concreto: questo codice torna a Edoardo (dev Testbusters). Quello
che gli si consegna è un diff di prodotto, non il percorso mentale che ci ha
portati. Il percorso serve a noi, e serve agli agenti che lavorano qui dopo.

## Dove va cosa

| Cosa | Dove | Naming |
|---|---|---|
| PRD, specifiche di una feature | `design/prd/` | `NNN-nome-feature.md` (`001-`, `002-`, …) |
| Decisioni prese, con il perché | `design/decisions/` | `YYYY-MM-DD-titolo-breve.md` |
| Ricerca, benchmark, analisi, appunti | `design/notes/` | libero |
| Esplorazioni usa-e-getta | `design/notes/` | prefisso `scratch-` |

Template in `design/_templates/`.

Se lanci le skill del flusso emps (`/brief`, `/requirements`, `/use-cases`,
`/insights`, `/research-plan`, `/proposal`) dalla root del repo, scrivono nelle
loro cartelle (`briefs/`, `requirements/`, …). Sono già gitignorate: lasciale
dove sono, non spostarle dentro `design/`.

## Cosa NON fare

- **Non mettere il ragionamento nei commenti del codice.** Un commento spiega
  perché quella riga è così, non quali tre alternative hai scartato. Il resto
  va in `design/decisions/`.
- **Non mettere il ragionamento nei messaggi di commit.** Il commit dice cosa
  cambia e perché tecnicamente. Se serve il contesto lungo, linka il PRD per
  nome file — il file non c'è nel repo del cliente, e va bene così.
- **Non creare altri file `.md` di ragionamento nella root del repo.** Il repo
  originale aveva già questo problema (`docs/MOCK_MIGRATION.md` descriveva un
  sistema rimosso da mesi e ha sviato più di una sessione). Documentazione
  tracciata solo se descrive il codice **com'è adesso**.
- **Non toccare `.claude/*.md` per appunti di design.** Quei file descrivono
  l'architettura e sono tracciati: si aggiornano solo quando cambia il codice.

## Ordine di lavoro

Quando una decisione di prodotto cambia il codice, **scrivi prima la decisione**.
Una riga in `design/decisions/` prima di aprire l'editor costa trenta secondi e
ti evita di ricostruire a posteriori perché avevi scelto così.

## Il vincolo di prodotto, oggi

Il referente prodotto è in transizione: Erica è uscita, Federico è PM ad interim
e le due nuove PM sono in arrivo. Finché non entrano, **ogni proposta di prodotto
è "da confermare"**: validala con Edoardo, Tommaso o Fede prima di trattarla
come decisa. Nei PRD tienilo esplicito nel campo `Stato` — un documento che
sembra approvato quando non lo è fa più danni di uno incompleto.

## Il diff consegnabile

In qualsiasi momento, quello che si riconsegna è:

```bash
git diff <primo-commit>..HEAD -- src/
```

Se quel diff contiene roba che non è una modifica di prodotto, è finita nel
posto sbagliato.
