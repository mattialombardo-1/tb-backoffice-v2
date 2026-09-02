# YYYY-MM-DD — <decisione, in una riga>

- **Stato:** presa · da confermare · rimandata · ribaltata il <data>
- **Spec collegata:** `docs/specs/NNN-....md` (se c'è)

> Tracciato: serve a chi legge il codice fra sei mesi e si chiede perché è così.
> Le alternative discusse in call e le dinamiche di chi voleva cosa restano in
> `design/`.

## Decisione

Una o due frasi, al presente. "La difficoltà resta un intero 0-5", non "si è
deciso di valutare la possibilità di mantenere".

## Vincolo che l'ha determinata

Il motivo che vale ancora domani: il backend non espone quel campo, la scala è
condivisa col simulatore, quel dato non è migrabile. Se il vincolo è "non c'era
tempo", scrivilo — è comunque un'informazione utile a chi eredita il codice.

## Conseguenze

Cosa diventa più facile e cosa più difficile da qui in avanti. È la parte che
evita di ridiscutere la stessa cosa fra tre mesi.

## Cosa la ribalterebbe

La condizione che farebbe cambiare idea. Se non riesci a nominarla, la decisione
è più debole di quanto sembri.
