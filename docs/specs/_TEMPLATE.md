# NNN — <nome feature>

- **Stato:** bozza · da confermare · confermato · in sviluppo · consegnato
- **Data:** YYYY-MM-DD

> Questo file è tracciato: lo legge chi implementa, umano o agente. Scrivilo per
> loro. Il perché-ci-siamo-arrivati, le opzioni scartate e le note di call
> restano in `design/` (vedi `design/CLAUDE.md`).

## Problema

Cosa non funziona oggi. Concreto e osservabile, non "l'esperienza è migliorabile".
Una o due frasi.

## Comportamento atteso

Cosa deve fare il sistema dopo la modifica. È la parte che si implementa: se una
frase non è verificabile guardando lo schermo, riscrivila.

## Fuori scope

Il confine esplicito. Senza, lo scope si allarga da solo e chi implementa non sa
dove fermarsi.

## Regole e casi limite

Cosa succede quando il dato manca, è vuoto, è troppo lungo, o l'utente non ha il
permesso. È dove si perde più tempo se non è scritto.

## Impatto tecnico

- **File toccati:** percorsi in `src/`
- **Endpoint:** quali servono, quali esistono già, quali il backend non espone
- **Migrazione dati:** se serve, e cosa succede ai record esistenti

Se serve un endpoint nuovo, dillo qui: è la prima cosa che guarderà Edoardo.

## Come si verifica

I passi per dire che è fatto. Scritti come li farebbe una persona sull'app.

## Domande aperte

Quello che non è ancora deciso, e cosa blocca. Se una domanda è aperta perché
manca una conferma di prodotto, tienilo nello `Stato`, non nel testo.
