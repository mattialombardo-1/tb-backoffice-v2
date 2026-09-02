# design/

Ragionamento di design: PRD, decisioni, note, esplorazioni.

**Questa cartella è gitignored.** Nel repo restano solo `README.md`,
`CLAUDE.md` e `_templates/`; tutto il resto vive solo sulla tua macchina e non
finisce mai nel repo del cliente.

```
design/
  CLAUDE.md      regole (dove va cosa, cosa non fare) — leggile prima
  _templates/    template PRD e decisione
  prd/           PRD per feature          NNN-nome-feature.md
  decisions/     decisioni prese e perché YYYY-MM-DD-titolo.md
  notes/         ricerca, benchmark, appunti liberi
```

Per iniziare un PRD:

```bash
mkdir -p design/prd
cp design/_templates/prd.md design/prd/001-nuova-valutazione-domande.md
```

(Il `mkdir` serve: `prd/`, `decisions/` e `notes/` sono ignorate, quindi su un
clone pulito non esistono.)

## Attenzione: qui dentro non c'è storia

Essendo ignorata, questa cartella **non è versionata**. Un `git clean -xdf`, un
clone su un'altra macchina o un disco che muore se la portano via, e i PRD non
tornano indietro.

Se vuoi tenerne la storia senza mai spingerla sul remote del cliente, la via più
semplice è un repo git annidato, invisibile a quello esterno perché la cartella
è ignorata:

```bash
git -C design init
git -C design add -A && git -C design commit -m "design notes"
```

Da quel momento `design/` ha la sua storia, separata, che non finisce mai in un
push del repo principale.
