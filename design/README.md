# design/

La deliberazione: note di call, benchmark, opzioni scartate, esplorazioni.
Roba nostra, che serve a decidere e non a implementare.

**Questa cartella è gitignored.** Restano tracciati solo `README.md` e
`CLAUDE.md`; tutto il resto vive solo sulla tua macchina.

```
design/
  CLAUDE.md    la regola su cosa sta nel repo e cosa no — leggila
  notes/       note di call, ricerca, benchmark, opzioni scartate
  scratch/     esplorazioni usa-e-getta
```

## Le specifiche invece stanno nel repo

Quando la deliberazione produce qualcosa che serve a chi implementa, quel
qualcosa va **tracciato**:

```bash
cp docs/specs/_TEMPLATE.md docs/specs/001-nuova-valutazione-domande.md
cp docs/decisions/_TEMPLATE.md docs/decisions/2026-09-02-scala-difficolta.md
```

Il criterio sta in `CLAUDE.md`, in una riga: serve a implementare, o serve solo
a noi per decidere?

## Attenzione: qui dentro non c'è storia

Essendo ignorata, questa cartella **non è versionata**. Un `git clean -xdf`, un
clone su un'altra macchina o un disco che muore se la portano via.

Se vuoi tenerne la storia senza mai spingerla sul remote, un repo git annidato
è invisibile a quello esterno proprio perché la cartella è ignorata:

```bash
git -C design init
git -C design add -A && git -C design commit -m "design notes"
```
