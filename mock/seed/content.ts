/**
 * Banca dei contenuti delle domande.
 *
 * Due sorgenti, mescolate dal generatore:
 *  - `AUTHORED`: domande scritte a mano, una per una, plausibili come quelle di
 *    un test di ammissione reale.
 *  - `FAMILIES`: generatori parametrici che producono varianti numeriche vere
 *    (valori, sostanze, organi diversi) invece di ripetere lo stesso testo.
 *
 * Serve entrambe: solo authored non arriva a 200 senza duplicati evidenti,
 * solo parametrico dà pagine che sembrano generate da uno script.
 */
import type { Rng } from '../rng';

export interface QuestionBody {
  topic: string;
  subtopic: string;
  text: string;
  /** Prima alternativa = quella corretta; il generatore le mescola. */
  alternatives: string[];
  explanation: string;
  /** Solo per le COMPLETION. */
  completionAnswer?: string;
  /**
   * True quando la risposta corretta è un valore secco (un numero, una formula)
   * e la domanda regge la trasformazione in COMPLETION senza riscrittura.
   * Le "Quale tra i seguenti..." non lo sono e restano a risposta chiusa.
   */
  completable?: boolean;
}

type Family = (rng: Rng) => QuestionBody;

// ---------------------------------------------------------------------------
// Domande scritte a mano
// ---------------------------------------------------------------------------

const AUTHORED: Record<string, QuestionBody[]> = {
  Biologia: [
    {
      topic: 'La cellula',
      subtopic: 'Membrana plasmatica',
      text: 'Quale tra i seguenti processi <strong>non</strong> richiede consumo diretto di ATP?',
      alternatives: [
        'La diffusione facilitata del glucosio tramite trasportatori GLUT',
        'Il trasporto attivo primario operato dalla pompa sodio-potassio',
        "L'endocitosi mediata da recettore",
        'Il trasporto vescicolare dal reticolo endoplasmatico al Golgi',
      ],
      explanation:
        'La diffusione facilitata sfrutta il gradiente di concentrazione già esistente: il trasportatore accelera il passaggio ma non compie lavoro. Tutti gli altri processi elencati sono forme di trasporto attivo o vescicolare e consumano ATP.',
    },
    {
      topic: 'Bioenergetica',
      subtopic: 'Ciclo di Krebs',
      text: 'Il ciclo di Krebs si svolge:',
      alternatives: [
        'Nella matrice mitocondriale',
        'Nel citosol',
        'Sulla membrana mitocondriale interna',
        'Nello spazio intermembrana',
        'Nel reticolo endoplasmatico liscio',
      ],
      explanation:
        "Gli enzimi del ciclo dell'acido citrico sono solubili nella matrice mitocondriale, con l'unica eccezione della succinato deidrogenasi, che è ancorata alla membrana interna e fa parte del complesso II.",
    },
    {
      topic: 'Riproduzione ed ereditarietà',
      subtopic: 'Mitosi e meiosi',
      text: 'Durante quale fase della meiosi avviene il crossing-over?',
      alternatives: ['Profase I', 'Metafase I', 'Anafase II', 'Telofase I'],
      explanation:
        'Il crossing-over avviene nello stadio di pachitene della profase I, quando i cromosomi omologhi appaiati formano il complesso sinaptonemale e si scambiano tratti di cromatidi.',
    },
    {
      topic: 'Genetica molecolare',
      subtopic: 'Trascrizione e traduzione',
      text: "Negli eucarioti, lo splicing dell'mRNA:",
      alternatives: [
        'Rimuove gli introni e salda gli esoni prima della traduzione',
        'Avviene nel citoplasma subito dopo la traduzione',
        'Aggiunge la coda di poli-A al terminale 5’',
        'È catalizzato esclusivamente da proteine, senza componenti a RNA',
      ],
      explanation:
        "Lo splicing è nucleare e precede l'esportazione dell'mRNA maturo. È operato dallo spliceosoma, un complesso ribonucleoproteico in cui gli snRNA hanno ruolo catalitico.",
    },
    {
      topic: 'La chimica dei viventi',
      subtopic: 'Proteine ed enzimi',
      text: 'Un inibitore enzimatico competitivo:',
      alternatives: [
        'Aumenta la K<sub>M</sub> apparente lasciando invariata la V<sub>max</sub>',
        'Riduce la V<sub>max</sub> lasciando invariata la K<sub>M</sub>',
        'Riduce sia K<sub>M</sub> sia V<sub>max</sub>',
        'Si lega esclusivamente al complesso enzima-substrato',
      ],
      explanation:
        "L'inibitore competitivo contende il sito attivo al substrato: serve più substrato per raggiungere metà della velocità massima (K<sub>M</sub> apparente maggiore), ma con substrato in eccesso la V<sub>max</sub> viene comunque raggiunta.",
    },
    {
      topic: 'La cellula',
      subtopic: 'Organuli citoplasmatici',
      text: 'I lisosomi contengono enzimi idrolitici che lavorano in modo ottimale a pH:',
      alternatives: [
        'Circa 5, quindi acido',
        'Circa 7,4, quindi neutro',
        'Circa 9, quindi basico',
        'Indifferente al pH',
      ],
      explanation:
        'Le pompe protoniche vacuolari acidificano il lume lisosomiale fino a pH ~4,5-5. Questo è anche un meccanismo di sicurezza: se un enzima sfugge nel citosol a pH 7,2 diventa poco attivo.',
    },
    {
      topic: 'Riproduzione ed ereditarietà',
      subtopic: 'Leggi di Mendel',
      text: 'Da un incrocio tra due individui eterozigoti per un carattere autosomico dominante, la probabilità attesa di ottenere un figlio con fenotipo recessivo è pari a ______ .',
      alternatives: [],
      completionAnswer: '1/4',
      explanation:
        'Aa × Aa dà 1 AA : 2 Aa : 1 aa. Solo il genotipo aa esprime il fenotipo recessivo, quindi 1 caso su 4 (25%).',
    },
    {
      topic: 'Ereditarietà e ambiente',
      subtopic: 'Selezione naturale',
      text: 'Il concetto di fitness in biologia evoluzionistica indica:',
      alternatives: [
        'Il successo riproduttivo relativo di un genotipo in un dato ambiente',
        'La resistenza fisica di un individuo agli stress ambientali',
        'La longevità media degli individui di una popolazione',
        'Il numero di mutazioni accumulate in una generazione',
      ],
      explanation:
        'La fitness misura quanti discendenti fertili un genotipo lascia rispetto agli altri presenti nella stessa popolazione. Vivere a lungo conta solo nella misura in cui aumenta quel contributo.',
    },
  ],

  Chimica: [
    {
      topic: 'Struttura della materia',
      subtopic: 'Tavola periodica',
      text: 'Lungo un periodo della tavola periodica, procedendo da sinistra verso destra, il raggio atomico:',
      alternatives: [
        'Diminuisce, perché aumenta la carica nucleare efficace',
        'Aumenta, perché aumenta il numero di elettroni',
        'Resta costante, perché non cambia il livello energetico esterno',
        'Aumenta, perché aumenta il numero di neutroni',
      ],
      explanation:
        'Gli elettroni si aggiungono allo stesso livello, mentre i protoni aumentano: la carica nucleare efficace cresce e attrae più vicino la nuvola elettronica. Il raggio quindi si contrae.',
    },
    {
      topic: 'Legame chimico',
      subtopic: 'Geometria molecolare',
      text: 'Secondo la teoria VSEPR, la molecola di ammoniaca NH<sub>3</sub> ha geometria:',
      alternatives: [
        'Piramidale trigonale, per la presenza di un doppietto non condiviso',
        'Planare trigonale',
        'Tetraedrica regolare',
        'Lineare',
      ],
      explanation:
        "L'azoto ha quattro coppie elettroniche: tre di legame e una solitaria. La disposizione di partenza è tetraedrica, ma considerando solo gli atomi la forma osservata è piramidale, con angoli di ~107°.",
    },
    {
      topic: 'Soluzioni ed equilibri',
      subtopic: 'pH e tamponi',
      text: 'Una soluzione tampone è in grado di:',
      alternatives: [
        'Attenuare le variazioni di pH in seguito ad aggiunta di piccole quantità di acido o base',
        'Mantenere il pH rigorosamente costante qualunque sia la quantità di acido aggiunta',
        'Portare a 7 il pH di qualunque soluzione',
        'Aumentare la solubilità di tutti i sali poco solubili',
      ],
      explanation:
        "Il tampone è una miscela di un acido debole e della sua base coniugata: l'una neutralizza le basi aggiunte, l'altra gli acidi. La capacità tamponante è però finita e viene superata con aggiunte consistenti.",
    },
    {
      topic: 'Chimica organica',
      subtopic: 'Isomeria',
      text: 'Due composti con la stessa formula molecolare ma diversa disposizione spaziale dei sostituenti attorno a un doppio legame sono detti:',
      alternatives: [
        'Isomeri geometrici (cis-trans)',
        'Isomeri di catena',
        'Enantiomeri',
        'Tautomeri',
      ],
      explanation:
        'La rotazione attorno al doppio legame C=C è impedita: i sostituenti restano bloccati dallo stesso lato (cis/Z) o da lati opposti (trans/E). Gli enantiomeri riguardano invece la chiralità, non il doppio legame.',
    },
    {
      topic: 'Chimica organica',
      subtopic: 'Gruppi funzionali',
      text: 'Il gruppo funzionale caratteristico degli acidi carbossilici è ______ .',
      alternatives: [],
      completionAnswer: '-COOH',
      explanation:
        'Il carbossile unisce un carbonile e un ossidrile sullo stesso carbonio. La delocalizzazione della carica nello ione carbossilato spiega perché questi composti sono acidi molto più degli alcoli.',
    },
    {
      topic: 'Struttura della materia',
      subtopic: 'Configurazione elettronica',
      text: 'Il principio di esclusione di Pauli afferma che:',
      alternatives: [
        'Due elettroni nello stesso atomo non possono avere tutti e quattro i numeri quantici uguali',
        'Gli elettroni occupano sempre prima gli orbitali a energia più alta',
        'Gli orbitali degeneri si riempiono prima con elettroni appaiati',
        "L'energia dell'elettrone è quantizzata solo negli atomi idrogenoidi",
      ],
      explanation:
        'Ne consegue che un orbitale, definito da n, l e m<sub>l</sub>, può ospitare al massimo due elettroni, necessariamente con spin opposto.',
    },
  ],

  Fisica: [
    {
      topic: 'Dinamica',
      subtopic: 'Principi della dinamica',
      text: 'Un corpo si muove di moto rettilineo uniforme. Si può affermare che:',
      alternatives: [
        'La risultante delle forze agenti su di esso è nulla',
        'Su di esso non agisce alcuna forza',
        'La sua accelerazione è costante e diversa da zero',
        'La sua energia cinetica sta aumentando',
      ],
      explanation:
        'Velocità costante significa accelerazione nulla, quindi risultante nulla per il secondo principio. Le singole forze possono esistere ed essere anche intense: devono solo bilanciarsi.',
    },
    {
      topic: 'Fluidi',
      subtopic: 'Principio di Archimede',
      text: 'Un corpo immerso in un fluido riceve una spinta verso l’alto pari:',
      alternatives: [
        'Al peso del volume di fluido spostato',
        'Al proprio peso',
        'Alla differenza tra il proprio peso e quello del fluido',
        'Alla pressione atmosferica moltiplicata per la superficie del corpo',
      ],
      explanation:
        'La spinta idrostatica vale $F_A = \\rho_{fluido} \\cdot V_{immerso} \\cdot g$: dipende solo dal fluido e dal volume spostato, non dal materiale del corpo.',
    },
    {
      topic: 'Elettromagnetismo',
      subtopic: 'Circuiti in corrente continua',
      text: 'Due resistenze uguali collegate in parallelo presentano una resistenza equivalente pari:',
      alternatives: [
        'Alla metà del valore di una singola resistenza',
        'Al doppio del valore di una singola resistenza',
        'Allo stesso valore di una singola resistenza',
        'Alla somma dei due valori',
      ],
      explanation:
        'In parallelo $1/R_{eq} = 1/R + 1/R = 2/R$, da cui $R_{eq} = R/2$. Aggiungere un percorso alternativo alla corrente abbassa sempre la resistenza complessiva.',
    },
    {
      topic: 'Termodinamica',
      subtopic: 'Primo principio',
      text: 'In una trasformazione isoterma di un gas ideale la variazione di energia interna è ______ .',
      alternatives: [],
      completionAnswer: 'nulla',
      explanation:
        "L'energia interna di un gas ideale dipende solo dalla temperatura. Se T non cambia, ΔU = 0 e per il primo principio tutto il calore assorbito viene convertito in lavoro.",
    },
    {
      topic: 'Cinematica',
      subtopic: 'Moto circolare',
      text: "Nel moto circolare uniforme l'accelerazione:",
      alternatives: [
        'È diretta verso il centro e ha modulo costante',
        'È nulla, perché il modulo della velocità non cambia',
        'È tangente alla traiettoria',
        'Ha direzione costante nel tempo',
      ],
      explanation:
        "La velocità è un vettore: cambia continuamente direzione anche se il modulo resta costante. L'accelerazione centripeta vale $a_c = v^2/r$ ed è sempre rivolta al centro.",
    },
  ],

  Matematica: [
    {
      topic: 'Funzioni',
      subtopic: 'Logaritmi',
      text: 'Il valore di $\\log_{2}(32)$ è:',
      alternatives: ['5', '6', '16', '4'],
      explanation:
        'Occorre trovare l’esponente da dare a 2 per ottenere 32. Poiché $2^5 = 32$, il logaritmo vale 5.',
    },
    {
      topic: 'Geometria analitica',
      subtopic: 'Retta nel piano',
      text: 'Due rette di equazioni $y = m_1 x + q_1$ e $y = m_2 x + q_2$ sono perpendicolari se:',
      alternatives: ['$m_1 \\cdot m_2 = -1$', '$m_1 = m_2$', '$m_1 + m_2 = 0$', '$q_1 = -q_2$'],
      explanation:
        'La condizione di perpendicolarità richiede coefficienti angolari antireciproci: $m_2 = -1/m_1$, cioè prodotto uguale a $-1$. Le rette parallele hanno invece lo stesso coefficiente angolare.',
    },
    {
      topic: 'Probabilità e statistica',
      subtopic: 'Calcolo combinatorio',
      text: 'In quanti modi diversi si possono disporre in fila 5 libri distinti?',
      alternatives: ['120', '25', '60', '720'],
      explanation:
        'Si tratta delle permutazioni di 5 oggetti distinti: $5! = 5 \\cdot 4 \\cdot 3 \\cdot 2 \\cdot 1 = 120$.',
    },
    {
      topic: 'Algebra',
      subtopic: 'Equazioni di secondo grado',
      text: "Un'equazione di secondo grado ha due soluzioni reali e distinte quando il discriminante è ______ .",
      alternatives: [],
      completionAnswer: 'maggiore di zero',
      explanation:
        'Con $\\Delta = b^2 - 4ac > 0$ la radice quadrata è un numero reale non nullo e la formula risolutiva produce due valori distinti. Con $\\Delta = 0$ le soluzioni coincidono, con $\\Delta < 0$ non ci sono soluzioni reali.',
    },
  ],

  Logica: [
    {
      topic: 'Ragionamento logico',
      subtopic: 'Condizioni necessarie e sufficienti',
      text: 'Se è vero che "tutti gli studenti iscritti hanno superato il test", allora è certamente vero che:',
      alternatives: [
        'Chi non ha superato il test non è uno studente iscritto',
        'Chi ha superato il test è uno studente iscritto',
        'Alcuni studenti iscritti non hanno superato il test',
        'Nessuno studente non iscritto ha superato il test',
      ],
      explanation:
        "La sola inferenza valida da 'tutti gli A sono B' è la contronominale: 'ciò che non è B non è A'. Le altre opzioni invertono indebitamente l'implicazione.",
    },
    {
      topic: 'Ragionamento logico',
      subtopic: 'Negazioni e connettivi',
      text: 'Qual è la corretta negazione della proposizione "Almeno un paziente ha risposto alla terapia"?',
      alternatives: [
        'Nessun paziente ha risposto alla terapia',
        'Non tutti i pazienti hanno risposto alla terapia',
        'Tutti i pazienti hanno risposto alla terapia',
        'Al massimo un paziente ha risposto alla terapia',
      ],
      explanation:
        "La negazione di un quantificatore esistenziale è un quantificatore universale negativo: 'esiste almeno uno' diventa 'non ne esiste nessuno'.",
    },
    {
      topic: 'Ragionamento numerico',
      subtopic: 'Problemi di percentuale',
      text: 'Un prezzo aumenta del 20% e successivamente viene scontato del 20%. Rispetto al valore iniziale, il prezzo finale è:',
      alternatives: ['Inferiore del 4%', 'Uguale', 'Superiore del 4%', 'Inferiore del 20%'],
      explanation:
        'I due fattori si moltiplicano: $1{,}20 \\times 0{,}80 = 0{,}96$. Lo sconto si applica su una base più alta, quindi non compensa l’aumento e resta una perdita del 4%.',
    },
    {
      topic: 'Comprensione del testo',
      subtopic: 'Inferenze',
      text: 'In un brano scientifico, un\'affermazione introdotta da "ne consegue che" svolge la funzione di:',
      alternatives: [
        'Conclusione derivata dalle premesse esposte',
        'Premessa iniziale del ragionamento',
        'Obiezione alla tesi principale',
        'Esempio a supporto di un dato',
      ],
      explanation:
        'I connettivi consecutivi segnalano il passaggio dalle premesse alla conclusione. Riconoscerli è il modo più rapido per individuare la tesi di un brano argomentativo.',
    },
  ],

  Anatomia: [
    {
      topic: 'Apparato cardiocircolatorio',
      subtopic: 'Grande e piccola circolazione',
      text: "L'arteria polmonare trasporta:",
      alternatives: [
        'Sangue povero di ossigeno dal ventricolo destro ai polmoni',
        'Sangue ricco di ossigeno dai polmoni all’atrio sinistro',
        'Sangue ricco di ossigeno dal ventricolo sinistro all’aorta',
        'Sangue povero di ossigeno dalle vene cave all’atrio destro',
      ],
      explanation:
        "È l'eccezione classica: si chiama arteria perché porta sangue *lontano* dal cuore, non perché il sangue sia ossigenato. Le vene polmonari fanno il percorso opposto, con sangue ossigenato.",
    },
    {
      topic: 'Sistema nervoso',
      subtopic: 'Neurone e sinapsi',
      text: 'La guaina mielinica ha la funzione principale di:',
      alternatives: [
        "Aumentare la velocità di conduzione dell'impulso nervoso",
        'Produrre i neurotrasmettitori rilasciati nella sinapsi',
        'Nutrire il corpo cellulare del neurone',
        'Impedire la formazione di nuove sinapsi',
      ],
      explanation:
        'La mielina isola elettricamente l’assone e lascia scoperti solo i nodi di Ranvier: il potenziale d’azione "salta" da un nodo all’altro (conduzione saltatoria), guadagnando un ordine di grandezza in velocità.',
    },
    {
      topic: 'Apparato escretore',
      subtopic: 'Nefrone',
      text: "L'unità funzionale del rene è ______ .",
      alternatives: [],
      completionAnswer: 'il nefrone',
      explanation:
        'Ogni rene contiene circa un milione di nefroni, ciascuno formato da corpuscolo renale (glomerulo e capsula di Bowman) e sistema tubulare.',
    },
    {
      topic: 'Sistema endocrino',
      subtopic: 'Pancreas endocrino',
      text: "L'insulina è prodotta:",
      alternatives: [
        'Dalle cellule beta delle isole di Langerhans',
        'Dalle cellule alfa delle isole di Langerhans',
        'Dalla corticale del surrene',
        'Dalle cellule acinose del pancreas esocrino',
      ],
      explanation:
        'Le cellule alfa producono glucagone, ormone ad azione opposta. Le cellule acinose secernono invece gli enzimi digestivi, che seguono la via esocrina attraverso il dotto di Wirsung.',
    },
    {
      topic: 'Apparato respiratorio',
      subtopic: 'Scambi gassosi',
      text: 'Gli scambi gassosi tra aria e sangue avvengono a livello:',
      alternatives: [
        'Degli alveoli polmonari',
        'Dei bronchi principali',
        'Della trachea',
        'Della laringe',
      ],
      explanation:
        "Solo la barriera alveolo-capillare, spessa meno di un micrometro e con una superficie complessiva di circa 70 m², permette la diffusione passiva di O₂ e CO₂. Il resto delle vie aeree conduce soltanto l'aria.",
    },
    {
      topic: 'Apparato digerente',
      subtopic: 'Fegato e pancreas',
      text: 'La bile prodotta dal fegato ha la funzione di:',
      alternatives: [
        'Emulsionare i lipidi aumentando la superficie di attacco delle lipasi',
        'Digerire chimicamente le proteine in amminoacidi',
        'Neutralizzare completamente il chimo acido nello stomaco',
        'Assorbire direttamente gli acidi grassi nei villi intestinali',
      ],
      explanation:
        'La bile non contiene enzimi digestivi: i sali biliari sono tensioattivi che frammentano le gocce lipidiche in micelle. La digestione chimica dei grassi resta compito della lipasi pancreatica.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Generatori parametrici
// ---------------------------------------------------------------------------

const shuffledWrong = (correct: number, deltas: number[], fmt: (n: number) => string): string[] => [
  fmt(correct),
  ...deltas.map((d) => fmt(correct + d)),
];

const FAMILIES: Record<string, Family[]> = {
  Biologia: [
    (rng) => {
      const organelli = [
        ['mitocondrio', 'la produzione di ATP tramite fosforilazione ossidativa'],
        ['ribosoma', 'la sintesi proteica a partire dall’mRNA'],
        ['apparato di Golgi', 'la modifica e lo smistamento delle proteine'],
        ['lisosoma', 'la digestione intracellulare di macromolecole'],
        ['reticolo endoplasmatico rugoso', 'la sintesi delle proteine destinate alla secrezione'],
        ['perossisoma', 'la degradazione degli acidi grassi a catena molto lunga'],
      ] as const;
      const [organo, funzione] = rng.pick(organelli);
      const altri = organelli.filter(([o]) => o !== organo);
      return {
        topic: 'La cellula',
        subtopic: 'Organuli citoplasmatici',
        text: `Quale organulo cellulare è responsabile principalmente per ${funzione}?`,
        alternatives: [
          `Il ${organo}`.replace('Il apparato', "L'apparato"),
          ...rng
            .shuffle([...altri])
            .slice(0, 3)
            .map(([o]) => `Il ${o}`.replace('Il apparato', "L'apparato")),
        ],
        explanation: `La funzione descritta è specifica del ${organo}. Gli altri organuli elencati svolgono compiti distinti all'interno della compartimentazione cellulare.`,
      };
    },
    (rng) => {
      const n = rng.int(2, 23);
      return {
        topic: 'Riproduzione ed ereditarietà',
        subtopic: 'Mitosi e meiosi',
        text: `Una cellula somatica con ${2 * n} cromosomi va incontro a meiosi. Quanti cromosomi conterrà ciascuna delle cellule figlie al termine del processo?`,
        alternatives: [`${n}`, `${2 * n}`, `${4 * n}`, `${n * 2 - 1}`],
        completable: true,
        explanation: `La meiosi dimezza il corredo cromosomico: da una cellula diploide con ${2 * n} cromosomi si ottengono quattro cellule aploidi con ${n} cromosomi ciascuna.`,
      };
    },
  ],

  Chimica: [
    (rng) => {
      const sostanze = [
        ['H₂O', 18],
        ['CO₂', 44],
        ['NaCl', 58.5],
        ['CH₄', 16],
        ['O₂', 32],
        ['NH₃', 17],
        ['C₆H₁₂O₆', 180],
        ['H₂SO₄', 98],
        ['CaCO₃', 100],
        ['NaOH', 40],
        ['HCl', 36.5],
        ['N₂', 28],
      ] as const;
      const [formula, mm] = rng.pick(sostanze);
      const moli = rng.int(2, 12);
      const massa = Math.round(moli * mm * 10) / 10;
      return {
        topic: 'Stechiometria',
        subtopic: 'Mole e massa molare',
        text: `Quanti grammi corrispondono a ${moli} moli di ${formula} (massa molare ${mm} g/mol)?`,
        alternatives: shuffledWrong(
          massa,
          [mm, -mm, Math.round(massa / 2)],
          (v) => `${Math.round(v * 10) / 10} g`
        ),
        completable: true,
        explanation: `Massa = moli × massa molare = ${moli} × ${mm} = ${massa} g.`,
      };
    },
    (rng) => {
      const conc = rng.pick([1e-2, 1e-3, 1e-4, 1e-5, 1e-6]);
      const pH = Math.round(-Math.log10(conc));
      return {
        topic: 'Soluzioni ed equilibri',
        subtopic: 'pH e tamponi',
        text: `Una soluzione di acido forte monoprotico ha concentrazione $10^{-${pH}}$ M. Qual è il suo pH?`,
        alternatives: [`${pH}`, `${pH + 1}`, `${14 - pH}`, `${pH - 1}`],
        completable: true,
        explanation: `Un acido forte è completamente dissociato, quindi $[H^+] = 10^{-${pH}}$ M e $pH = -\\log[H^+] = ${pH}$.`,
      };
    },
  ],

  Fisica: [
    (rng) => {
      const v = rng.int(4, 45);
      const t = rng.int(3, 18);
      const s = v * t;
      return {
        topic: 'Cinematica',
        subtopic: 'Moto rettilineo uniforme',
        text: `Un corpo si muove di moto rettilineo uniforme alla velocità di ${v} m/s. Quale spazio percorre in ${t} s?`,
        alternatives: shuffledWrong(s, [v, -v, t], (n) => `${n} m`),
        completable: true,
        explanation: `Nel moto uniforme $s = v \\cdot t = ${v} \\cdot ${t} = ${s}$ m.`,
      };
    },
    (rng) => {
      const m = rng.int(2, 35);
      const a = rng.int(2, 14);
      const f = m * a;
      return {
        topic: 'Dinamica',
        subtopic: 'Principi della dinamica',
        text: `A un corpo di massa ${m} kg viene applicata una forza costante che gli imprime un'accelerazione di ${a} m/s². Qual è l'intensità della forza?`,
        alternatives: shuffledWrong(f, [m, a, -a], (n) => `${n} N`),
        completable: true,
        explanation: `Per il secondo principio della dinamica $F = m \\cdot a = ${m} \\cdot ${a} = ${f}$ N.`,
      };
    },
  ],

  Matematica: [
    (rng) => {
      const b = rng.int(2, 9);
      const e = rng.int(2, 6);
      const r = Math.pow(b, e);
      return {
        topic: 'Funzioni',
        subtopic: 'Funzioni esponenziali',
        text: `Qual è il valore dell'espressione $${b}^{${e}}$?`,
        alternatives: shuffledWrong(r, [b * e - r, 1, -b], (n) => `${n}`),
        completable: true,
        explanation: `$${b}^{${e}} = ${r}$. Attenzione a non confondere l'elevamento a potenza con la moltiplicazione $${b} \\cdot ${e} = ${b * e}$.`,
      };
    },
    (rng) => {
      const tot = rng.pick([40, 50, 60, 80, 120, 160, 200, 250, 300, 400]);
      const perc = rng.pick([5, 10, 15, 20, 25, 30, 40, 50]);
      const res = (tot * perc) / 100;
      return {
        topic: 'Probabilità e statistica',
        subtopic: 'Indici di posizione',
        text: `In un campione di ${tot} pazienti, il ${perc}% presenta un determinato sintomo. Quanti pazienti sono?`,
        alternatives: shuffledWrong(res, [perc, -perc / 2, tot - res], (n) => `${Math.round(n)}`),
        completable: true,
        explanation: `$${tot} \\times ${perc}/100 = ${res}$ pazienti.`,
      };
    },
  ],

  Logica: [
    (rng) => {
      const step = rng.int(3, 17);
      const start = rng.int(2, 40);
      const serie = [start, start + step, start + 2 * step, start + 3 * step];
      const next = start + 4 * step;
      return {
        topic: 'Ragionamento numerico',
        subtopic: 'Serie numeriche',
        text: `Individua il termine successivo della serie: ${serie.join(', ')}, ...`,
        alternatives: shuffledWrong(next, [step, -step, 1], (n) => `${n}`),
        completable: true,
        explanation: `La serie cresce con passo costante pari a ${step}, quindi il termine successivo è ${serie[3]} + ${step} = ${next}.`,
      };
    },
  ],

  Anatomia: [
    (rng) => {
      const coppie = [
        ['tiroide', 'la tiroxina, che regola il metabolismo basale'],
        ['ipofisi anteriore', "l'ormone della crescita GH"],
        ['corticale del surrene', 'il cortisolo, ormone dello stress'],
        ['midollare del surrene', "l'adrenalina"],
        ['paratiroidi', 'il paratormone, che innalza la calcemia'],
      ] as const;
      const [ghiandola, ormone] = rng.pick(coppie);
      const altre = coppie.filter(([g]) => g !== ghiandola);
      return {
        topic: 'Sistema endocrino',
        subtopic: 'Ipofisi',
        text: `Quale ghiandola secerne ${ormone}?`,
        alternatives: [
          `La ${ghiandola}`.replace('La ipofisi', "L'ipofisi"),
          ...rng
            .shuffle([...altre])
            .slice(0, 3)
            .map(([g]) => `La ${g}`.replace('La ipofisi', "L'ipofisi")),
        ],
        explanation: `${ormone.charAt(0).toUpperCase() + ormone.slice(1)} è prodotto dalla ${ghiandola}.`,
      };
    },
  ],
};

/**
 * Restituisce un corpo di domanda per la materia richiesta.
 * `index` scorre prima le authored, poi passa ai generatori parametrici.
 */
export function pickQuestionBody(subject: string, index: number, rng: Rng): QuestionBody {
  const authored = AUTHORED[subject] ?? [];
  if (index < authored.length) return authored[index];

  const families = FAMILIES[subject] ?? [];
  if (families.length === 0) return authored[index % authored.length];
  return rng.pick(families)(rng);
}

/** Numero di domande scritte a mano disponibili per una materia. */
export function authoredCount(subject: string): number {
  return (AUTHORED[subject] ?? []).length;
}
