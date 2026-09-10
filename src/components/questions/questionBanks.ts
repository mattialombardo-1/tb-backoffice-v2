/** Banca di domande finte usata dal flusso di generazione (QuestionGenerationSummaryDialog)
 *  e dalla ricerca del passaggio "simulato" in QuestionsViewDialog — in un file a parte
 *  perché esporta solo dati/funzioni, non componenti (altrimenti react-refresh si lamenta:
 *  "Fast refresh only works when a file only exports components"). */

export interface QuestionTemplate {
  text: string;
  alternatives: string[];
  completionAnswer: string;
  /** Motivazione della risposta corretta — il corpo della "Correzione commentata". */
  explanation: string;
  /** Passaggio del manuale citato come fonte — testo mostrato nella modale "Vedi il passaggio". */
  passage: string;
}

// Proposta di design — banca di domande finte ma di contenuto reale (nessun
// motore AI, come il resto del prototipo), una per argomento fisso di
// Chimica. La prima alternativa è sempre quella corretta: è lo stato
// iniziale del draft, l'utente può comunque cambiarla in fase di revisione.
export const QUESTION_BANKS: Record<string, QuestionTemplate[]> = {
  'La materia e le grandezze chimiche': [
    {
      text: "Qual è l'unità di misura della massa nel Sistema Internazionale?",
      alternatives: [
        'Il chilogrammo (kg)',
        'Il grammo (g)',
        'La libbra (lb)',
        "L'unità di massa atomica (uma)",
        'Il newton (N)',
      ],
      completionAnswer: 'Il chilogrammo (kg)',
      explanation: "Il chilogrammo è l'unità di massa base del Sistema Internazionale.",
      passage:
        'Il Sistema Internazionale di unità di misura definisce sette grandezze fondamentali. La massa è una di queste ed è misurata in chilogrammi (kg), un tempo definiti dal prototipo internazionale conservato a Sèvres, oggi ancorati a costanti fisiche fondamentali.',
    },
    {
      text: 'Quale delle seguenti è una grandezza intensiva?',
      alternatives: ['La densità', 'La massa', 'Il volume', 'Il numero di moli', 'Il peso'],
      completionAnswer: 'La densità',
      explanation:
        'La densità dipende dal tipo di sostanza, non dalla quantità presente, quindi è intensiva.',
      passage:
        'Le grandezze si dividono in estensive, che dipendono dalla quantità di materia considerata (come massa e volume), e intensive, che non ne dipendono. La densità, rapporto tra massa e volume, è intensiva: resta la stessa sia che si consideri un grammo o un chilogrammo della stessa sostanza.',
    },
    {
      text: 'Cosa distingue una sostanza pura da una miscela?',
      alternatives: [
        'La sostanza pura ha una composizione chimica definita e costante',
        'La miscela ha sempre proprietà fisiche costanti',
        'La sostanza pura può essere separata con metodi fisici',
        'La miscela ha una formula chimica unica',
        'Non esiste alcuna differenza sostanziale',
      ],
      completionAnswer: 'Ha una composizione chimica definita e costante',
      explanation:
        'Una sostanza pura ha sempre la stessa composizione chimica, a differenza di una miscela.',
      passage:
        'Una sostanza pura ha composizione chimica definita e costante e proprietà fisiche caratteristiche, come punto di fusione e densità. Una miscela è invece formata da due o più sostanze pure che mantengono le proprie proprietà e possono essere separate con metodi fisici come filtrazione o distillazione.',
    },
  ],
  "La struttura dell'atomo": [
    {
      text: 'Quale particella subatomica ha carica negativa?',
      alternatives: ["L'elettrone", 'Il protone', 'Il neutrone', 'Il nucleone', 'Il fotone'],
      completionAnswer: "L'elettrone",
      explanation: "L'elettrone è la particella subatomica con carica elettrica negativa.",
      passage:
        "L'atomo è costituito da un nucleo centrale, contenente protoni (carica positiva) e neutroni (privi di carica), circondato da elettroni con carica negativa che occupano gli orbitali attorno al nucleo.",
    },
    {
      text: 'Cosa rappresenta il numero atomico di un elemento?',
      alternatives: [
        'Il numero di protoni nel nucleo',
        'Il numero di neutroni nel nucleo',
        'La somma di protoni e neutroni',
        'Il numero di elettroni di valenza',
        "La massa totale dell'atomo",
      ],
      completionAnswer: 'Il numero di protoni nel nucleo',
      explanation:
        'Il numero atomico Z identifica un elemento in base al numero di protoni nel nucleo.',
      passage:
        "Il numero atomico Z indica il numero di protoni presenti nel nucleo di un atomo e identifica univocamente l'elemento chimico nella tavola periodica; in un atomo neutro coincide anche con il numero di elettroni.",
    },
    {
      text: 'Cosa sono gli isotopi di uno stesso elemento?',
      alternatives: [
        'Atomi con lo stesso numero di protoni ma diverso numero di neutroni',
        'Atomi con lo stesso numero di neutroni ma diverso numero di protoni',
        'Atomi con carica elettrica diversa',
        'Molecole con formula identica',
        'Ioni con carica opposta',
      ],
      completionAnswer: 'Stesso numero di protoni, diverso numero di neutroni',
      explanation:
        'Gli isotopi hanno lo stesso numero di protoni ma un numero diverso di neutroni.',
      passage:
        'Gli isotopi sono atomi dello stesso elemento chimico, quindi con lo stesso numero di protoni (stesso numero atomico Z), ma con un numero diverso di neutroni, e quindi massa atomica diversa.',
    },
  ],
  'Tavola periodica e proprietà periodiche': [
    {
      text: 'Come varia il raggio atomico lungo un periodo, da sinistra a destra?',
      alternatives: [
        'Diminuisce',
        'Aumenta',
        'Resta costante',
        'Aumenta poi diminuisce',
        'Non dipende dalla posizione',
      ],
      completionAnswer: 'Diminuisce',
      explanation:
        'Lungo un periodo la carica nucleare aumenta, attirando gli elettroni più vicino al nucleo.',
      passage:
        'Lungo un periodo, da sinistra a destra, la carica nucleare effettiva aumenta mentre il numero di livelli energetici resta costante: gli elettroni di valenza sono attratti con più forza verso il nucleo e il raggio atomico diminuisce.',
    },
    {
      text: "Cosa indica l'elettronegatività di un elemento?",
      alternatives: [
        'La tendenza di un atomo ad attrarre elettroni in un legame',
        'Il numero di elettroni di valenza',
        'La carica nucleare effettiva',
        "Il raggio atomico dell'elemento",
        'La sua energia di ionizzazione assoluta',
      ],
      completionAnswer: 'Tendenza ad attrarre elettroni in un legame',
      explanation:
        "L'elettronegatività misura quanto un atomo attrae gli elettroni condivisi in un legame.",
      passage:
        "L'elettronegatività è una misura relativa della tendenza di un atomo ad attrarre verso di sé gli elettroni condivisi in un legame chimico. Aumenta lungo un periodo e diminuisce lungo un gruppo, con il fluoro come elemento più elettronegativo.",
    },
    {
      text: 'In quale gruppo della tavola periodica si trovano i gas nobili?',
      alternatives: ['Gruppo 18', 'Gruppo 1', 'Gruppo 2', 'Gruppo 17', 'Gruppo 14'],
      completionAnswer: 'Gruppo 18',
      explanation: 'I gas nobili occupano il gruppo 18, con configurazione elettronica completa.',
      passage:
        "I gas nobili occupano il gruppo 18 della tavola periodica. Hanno il guscio di valenza completo (configurazione ns²np⁶, tranne l'elio) e per questo sono chimicamente poco reattivi.",
    },
  ],
  'Legami chimici': [
    {
      text: "Cosa afferma la regola dell'ottetto?",
      alternatives: [
        'Gli atomi tendono a raggiungere 8 elettroni nel guscio di valenza',
        'Ogni atomo può formare al massimo 8 legami',
        'Gli elettroni si dispongono sempre in coppie di 8',
        'Solo i gas nobili seguono questa regola',
        'Riguarda esclusivamente i legami ionici',
      ],
      completionAnswer: 'Raggiungere 8 elettroni nel guscio di valenza',
      explanation:
        'Gli atomi tendono a raggiungere la configurazione stabile a 8 elettroni di valenza.',
      passage:
        "La regola dell'ottetto afferma che gli atomi tendono a formare legami in modo da raggiungere una configurazione elettronica stabile con otto elettroni nel guscio di valenza, simile a quella dei gas nobili.",
    },
    {
      text: 'Che tipo di legame si forma tra un metallo e un non metallo con grande differenza di elettronegatività?',
      alternatives: [
        'Legame ionico',
        'Legame covalente puro',
        'Legame metallico',
        'Legame a idrogeno',
        'Legame covalente dativo',
      ],
      completionAnswer: 'Legame ionico',
      explanation:
        'Una grande differenza di elettronegatività porta al trasferimento di elettroni, tipico del legame ionico.',
      passage:
        "Quando due atomi hanno una differenza di elettronegatività molto elevata, uno di essi (di solito un metallo) cede uno o più elettroni all'altro (un non metallo): si formano ioni di carica opposta che si attraggono elettrostaticamente, dando origine a un legame ionico.",
    },
    {
      text: 'Cosa descrive la teoria VSEPR?',
      alternatives: [
        'La geometria molecolare in base alla repulsione tra coppie elettroniche',
        'La forza dei legami covalenti',
        'La distribuzione di carica nei legami ionici',
        "L'energia di dissociazione dei legami",
        'La polarità dei solventi',
      ],
      completionAnswer: 'La geometria molecolare tramite la repulsione tra coppie elettroniche',
      explanation:
        'La teoria VSEPR predice la geometria molecolare minimizzando la repulsione tra le coppie elettroniche.',
      passage:
        "Il modello VSEPR (Valence Shell Electron Pair Repulsion) prevede la geometria di una molecola assumendo che le coppie di elettroni attorno all'atomo centrale, di legame o solitarie, si dispongano nello spazio in modo da minimizzare la reciproca repulsione.",
    },
  ],
  'Nomenclatura e formule': [
    {
      text: "Come si chiama il composto binario tra un metallo e l'ossigeno?",
      alternatives: ['Ossido', 'Anidride', 'Idrossido', 'Idruro', 'Perossido'],
      completionAnswer: 'Ossido',
      explanation: "Il composto binario tra un metallo e l'ossigeno si chiama ossido.",
      passage:
        "Gli ossidi sono composti binari formati dalla combinazione di un elemento, generalmente un metallo, con l'ossigeno. Si nominano indicando il numero di ossidazione del metallo, ad esempio ossido di ferro(III).",
    },
    {
      text: 'Qual è la formula generale di un idrossido?',
      alternatives: ['Me(OH)n', 'MeOn', 'HnX', 'MeHn', 'MenOm'],
      completionAnswer: 'Me(OH)n',
      explanation:
        "Gli idrossidi si formano dalla reazione di un ossido basico con l'acqua, formula Me(OH)n.",
      passage:
        "Gli idrossidi si ottengono dalla reazione tra un ossido basico e l'acqua e contengono il gruppo OH⁻ legato a un metallo. La loro formula generale è Me(OH)n, dove n corrisponde al numero di ossidazione del metallo.",
    },
    {
      text: 'Come si chiamano i sali derivati dalla sostituzione parziale degli idrogeni di un acido?',
      alternatives: ['Sali acidi', 'Sali neutri', 'Sali basici', 'Sali doppi', 'Ossisali'],
      completionAnswer: 'Sali acidi',
      explanation:
        "I sali acidi conservano almeno un idrogeno sostituibile dell'acido di partenza.",
      passage:
        'I sali acidi derivano dalla sostituzione parziale degli atomi di idrogeno di un acido poliprotico con un metallo: conservano quindi almeno un idrogeno ancora sostituibile, a differenza dei sali neutri in cui tutti gli idrogeni sono stati sostituiti.',
    },
  ],
  'Reazioni e stechiometria': [
    {
      text: 'Cosa rappresenta il numero di Avogadro?',
      alternatives: [
        'Il numero di particelle contenute in una mole di sostanza',
        'La massa in grammi di un atomo',
        'Il volume occupato da un gas a STP',
        'La costante dei gas ideali',
        'Il numero di elettroni in un legame',
      ],
      completionAnswer: 'Il numero di particelle in una mole',
      explanation:
        'Il numero di Avogadro indica quante particelle sono contenute in una mole di sostanza.',
      passage:
        'Il numero di Avogadro (NA ≈ 6,022 × 10²³) indica quante particelle — atomi, molecole o ioni — sono contenute in una mole di sostanza. È la costante che collega la scala microscopica a quella macroscopica in chimica.',
    },
    {
      text: 'In una reazione chimica, cosa si intende per reagente limitante?',
      alternatives: [
        'Il reagente che si esaurisce per primo e determina la quantità di prodotto',
        'Il reagente presente in maggiore quantità',
        'Il reagente con massa molare più bassa',
        'Il prodotto con resa più alta',
        'Il reagente che non partecipa alla reazione',
      ],
      completionAnswer: 'Il reagente che si esaurisce per primo',
      explanation:
        'Il reagente limitante è quello che si esaurisce per primo, fissando la quantità massima di prodotto.',
      passage:
        'In una reazione chimica il reagente limitante è quello presente in quantità stechiometricamente insufficiente rispetto agli altri: si esaurisce per primo e determina quindi la massima quantità di prodotto ottenibile.',
    },
    {
      text: 'Come si calcola la massa molare di un composto?',
      alternatives: [
        'Sommando le masse atomiche di tutti gli atomi nella formula',
        'Dividendo la massa per il volume',
        'Moltiplicando il numero di moli per il numero di Avogadro',
        'Sottraendo la massa dei prodotti da quella dei reagenti',
        "Usando solo la massa dell'elemento più pesante",
      ],
      completionAnswer: 'Somma delle masse atomiche degli atomi nella formula',
      explanation:
        'La massa molare si ottiene sommando le masse atomiche di tutti gli atomi nella formula.',
      passage:
        'La massa molare di un composto si calcola sommando le masse atomiche di tutti gli atomi presenti nella sua formula chimica, espresse in grammi per mole (g/mol), usando i valori riportati nella tavola periodica.',
    },
  ],
  'Stati di aggregazione': [
    {
      text: 'Cosa afferma la legge di Boyle per un gas a temperatura costante?',
      alternatives: [
        'Pressione e volume sono inversamente proporzionali',
        'Pressione e volume sono direttamente proporzionali',
        'Il volume è indipendente dalla pressione',
        'La temperatura determina il volume',
        'La pressione dipende solo dalla massa del gas',
      ],
      completionAnswer: 'Pressione e volume sono inversamente proporzionali',
      explanation:
        'A temperatura costante, la legge di Boyle lega pressione e volume in modo inversamente proporzionale.',
      passage:
        'La legge di Boyle descrive il comportamento di un gas ideale a temperatura costante: il prodotto tra pressione e volume rimane costante, quindi pressione e volume sono inversamente proporzionali (PV = costante).',
    },
    {
      text: 'Cosa si intende per transizione di fase?',
      alternatives: [
        'Il passaggio di una sostanza da uno stato fisico a un altro',
        'Una reazione chimica tra due stati diversi',
        'Il cambiamento della composizione chimica di una sostanza',
        'La formazione di un nuovo composto',
        'La variazione del numero di moli',
      ],
      completionAnswer: 'Il passaggio da uno stato fisico a un altro',
      explanation:
        'Una transizione di fase è un cambiamento di stato fisico, senza variare la composizione chimica.',
      passage:
        'Una transizione di fase (o passaggio di stato) è il cambiamento fisico con cui una sostanza passa da uno stato di aggregazione a un altro, ad esempio da solido a liquido, senza che avvenga alcuna trasformazione della sua composizione chimica.',
    },
    {
      text: 'Cosa rappresenta la pressione di vapore di un liquido?',
      alternatives: [
        'La pressione esercitata dal vapore in equilibrio con il liquido',
        'La pressione atmosferica esterna',
        'La pressione necessaria per congelare il liquido',
        "La pressione minima per l'ebollizione",
        'La pressione osmotica del liquido',
      ],
      completionAnswer: 'La pressione del vapore in equilibrio con il liquido',
      explanation:
        'La pressione di vapore è quella esercitata dal vapore in equilibrio con il proprio liquido.',
      passage:
        'La pressione di vapore di un liquido è la pressione esercitata dal vapore quando questo si trova in equilibrio dinamico con la fase liquida a una data temperatura: aumenta con la temperatura e dipende dalla natura del liquido.',
    },
  ],
  Soluzioni: [
    {
      text: 'Come si definisce la molarità di una soluzione?',
      alternatives: [
        'Moli di soluto per litro di soluzione',
        'Grammi di soluto per litro di solvente',
        'Moli di soluto per chilogrammo di solvente',
        'Percentuale in massa del soluto',
        'Volume di soluto per volume di solvente',
      ],
      completionAnswer: 'Moli di soluto per litro di soluzione',
      explanation: 'La molarità esprime le moli di soluto disciolte in un litro di soluzione.',
      passage:
        "La molarità (M) è l'unità di concentrazione più usata in chimica ed esprime il numero di moli di soluto disciolte in un litro di soluzione (mol/L).",
    },
    {
      text: 'Cosa sono le proprietà colligative di una soluzione?',
      alternatives: [
        'Proprietà che dipendono dal numero di particelle di soluto, non dalla loro natura',
        'Proprietà che dipendono solo dal tipo di solvente',
        'Proprietà legate esclusivamente al colore della soluzione',
        'Proprietà che riguardano solo soluzioni sature',
        'Proprietà determinate dalla massa molare del solvente',
      ],
      completionAnswer: 'Dipendono dal numero di particelle di soluto',
      explanation:
        'Le proprietà colligative dipendono dal numero di particelle di soluto, non dalla loro natura chimica.',
      passage:
        "Le proprietà colligative — come l'innalzamento ebullioscopico, l'abbassamento crioscopico e la pressione osmotica — dipendono esclusivamente dal numero di particelle di soluto disciolte nella soluzione, non dalla loro identità chimica.",
    },
    {
      text: "Cosa succede alla solubilità di un gas in un liquido all'aumentare della temperatura?",
      alternatives: [
        'Generalmente diminuisce',
        'Aumenta sempre',
        'Resta costante',
        'Dipende solo dalla pressione',
        'Diventa nulla',
      ],
      completionAnswer: 'Generalmente diminuisce',
      explanation:
        "All'aumentare della temperatura, la solubilità dei gas nei liquidi generalmente diminuisce.",
      passage:
        "La solubilità di un gas in un liquido diminuisce generalmente all'aumentare della temperatura, poiché l'agitazione termica facilita la fuoriuscita delle molecole di gas dalla fase liquida verso quella gassosa.",
    },
  ],
  'Termodinamica chimica': [
    {
      text: 'Cosa afferma il primo principio della termodinamica?',
      alternatives: [
        "L'energia non si crea né si distrugge, ma si trasforma",
        "L'entropia di un sistema isolato aumenta sempre",
        'Il calore fluisce spontaneamente dal freddo al caldo',
        "L'energia libera è sempre positiva",
        'Ogni reazione chimica è esotermica',
      ],
      completionAnswer: "L'energia non si crea né si distrugge, si trasforma",
      explanation:
        "Il primo principio della termodinamica afferma che l'energia si conserva, si trasforma soltanto.",
      passage:
        "Il primo principio della termodinamica, noto anche come principio di conservazione dell'energia, afferma che l'energia totale di un sistema isolato non si crea né si distrugge, ma può soltanto trasformarsi da una forma all'altra.",
    },
    {
      text: 'Cosa misura la variazione di entalpia (ΔH) di una reazione?',
      alternatives: [
        'Il calore scambiato a pressione costante',
        'Il lavoro compiuto dal sistema',
        'La variazione di entropia',
        'La velocità della reazione',
        'La concentrazione dei prodotti',
      ],
      completionAnswer: 'Il calore scambiato a pressione costante',
      explanation: 'La variazione di entalpia misura il calore scambiato a pressione costante.',
      passage:
        "La variazione di entalpia (ΔH) di una reazione rappresenta il calore scambiato con l'ambiente quando la reazione avviene a pressione costante: se ΔH è negativo la reazione è esotermica, se è positivo è endotermica.",
    },
    {
      text: "Quando una reazione è spontanea secondo l'energia libera di Gibbs?",
      alternatives: [
        'Quando ΔG è negativo',
        'Quando ΔG è positivo',
        'Quando ΔG è uguale a zero',
        'Quando ΔH è sempre positivo',
        "Quando l'entropia diminuisce",
      ],
      completionAnswer: 'Quando ΔG è negativo',
      explanation:
        "Una reazione è spontanea quando l'energia libera di Gibbs diminuisce, cioè ΔG è negativo.",
      passage:
        "L'energia libera di Gibbs (G) combina variazione di entalpia ed entropia per stabilire la spontaneità di una reazione a temperatura e pressione costanti: una reazione è spontanea quando ΔG è negativo.",
    },
  ],
  'Equilibrio chimico': [
    {
      text: 'Cosa descrive il principio di Le Chatelier?',
      alternatives: [
        "Come un sistema all'equilibrio reagisce a una perturbazione esterna",
        'Il calcolo della costante di equilibrio',
        "La velocità con cui si raggiunge l'equilibrio",
        'La relazione tra Kp e Kc',
        "L'effetto dei catalizzatori sulla resa",
      ],
      completionAnswer: 'Come il sistema reagisce a una perturbazione esterna',
      explanation:
        'Il principio di Le Chatelier descrive come il sistema si riassesta dopo una perturbazione esterna.',
      passage:
        "Il principio di Le Chatelier afferma che, se un sistema all'equilibrio subisce una perturbazione esterna — variazione di concentrazione, temperatura o pressione — l'equilibrio si sposta nella direzione che tende a contrastare tale perturbazione.",
    },
    {
      text: 'Cosa rappresenta la costante di equilibrio Kc?',
      alternatives: [
        "Il rapporto tra le concentrazioni di prodotti e reagenti all'equilibrio",
        'La velocità di reazione diretta',
        'La concentrazione iniziale dei reagenti',
        "L'energia di attivazione della reazione",
        "Il tempo necessario per raggiungere l'equilibrio",
      ],
      completionAnswer: "Rapporto tra concentrazioni di prodotti e reagenti all'equilibrio",
      explanation:
        "Kc esprime il rapporto tra le concentrazioni di prodotti e reagenti all'equilibrio.",
      passage:
        "La costante di equilibrio Kc esprime il rapporto tra le concentrazioni molari dei prodotti e dei reagenti all'equilibrio, ciascuna elevata al proprio coefficiente stechiometrico: un valore alto indica che l'equilibrio favorisce i prodotti.",
    },
    {
      text: "Un catalizzatore, aggiunto a un sistema all'equilibrio, cosa modifica?",
      alternatives: [
        "Solo la velocità con cui si raggiunge l'equilibrio, non la sua posizione",
        "Sposta l'equilibrio verso i prodotti",
        "Sposta l'equilibrio verso i reagenti",
        'Aumenta la costante di equilibrio',
        'Diminuisce la temperatura del sistema',
      ],
      completionAnswer: "Solo la velocità di raggiungimento dell'equilibrio",
      explanation:
        "Un catalizzatore accelera il raggiungimento dell'equilibrio ma non ne sposta la posizione.",
      passage:
        "Un catalizzatore abbassa l'energia di attivazione della reazione diretta e di quella inversa nella stessa misura: accelera quindi il raggiungimento dell'equilibrio, ma non ne modifica la posizione né il valore della costante di equilibrio.",
    },
  ],
  'Acidi, basi e pH': [
    {
      text: 'Secondo la teoria di Brønsted-Lowry, cosa è un acido?',
      alternatives: [
        'Una specie capace di donare un protone (H+)',
        'Una specie capace di accettare un protone',
        'Una specie che libera ioni OH- in acqua',
        'Una specie neutra dal punto di vista elettrico',
        'Una specie che dona una coppia di elettroni',
      ],
      completionAnswer: 'Una specie che dona un protone',
      explanation: 'Secondo Brønsted-Lowry, un acido è una specie che cede un protone.',
      passage:
        "Secondo la teoria di Brønsted-Lowry, un acido è una specie chimica capace di donare uno ione idrogeno (protone, H+) a un'altra specie, detta base, che è invece capace di accettarlo.",
    },
    {
      text: 'Qual è il valore del pH di una soluzione neutra a 25°C?',
      alternatives: ['7', '0', '14', '1', '10'],
      completionAnswer: '7',
      explanation: 'A 25°C una soluzione neutra ha pH 7, con concentrazioni uguali di H+ e OH-.',
      passage:
        "Il pH misura l'acidità o basicità di una soluzione acquosa in base alla concentrazione di ioni H+. A 25°C, l'acqua pura ha pH 7: le concentrazioni di ioni H+ e OH- sono uguali e la soluzione è neutra.",
    },
    {
      text: 'Cosa fa una soluzione tampone?',
      alternatives: [
        'Resiste alle variazioni di pH quando si aggiungono piccole quantità di acido o base',
        'Aumenta sempre il pH della soluzione',
        'Neutralizza completamente ogni acido aggiunto',
        'Trasforma un acido forte in uno debole',
        'Non ha alcun effetto sul pH',
      ],
      completionAnswer: 'Resiste alle variazioni di pH',
      explanation:
        'Una soluzione tampone contrasta le variazioni di pH quando si aggiungono piccole quantità di acido o base.',
      passage:
        'Una soluzione tampone è composta da un acido debole e la sua base coniugata (o viceversa) e resiste alle variazioni di pH quando vengono aggiunte piccole quantità di acido o base, mantenendo il pH pressoché costante.',
    },
  ],
  'Ossidoriduzione ed elettrochimica': [
    {
      text: "Cosa avviene durante un'ossidazione?",
      alternatives: [
        'Una specie perde elettroni',
        'Una specie acquista elettroni',
        'Una specie perde protoni',
        'Una specie acquista protoni',
        'Non avviene alcun trasferimento di carica',
      ],
      completionAnswer: 'Una specie perde elettroni',
      explanation:
        "Durante un'ossidazione una specie chimica perde elettroni, aumentando il proprio numero di ossidazione.",
      passage:
        "In una reazione di ossidoriduzione, l'ossidazione è il processo in cui una specie chimica perde uno o più elettroni, aumentando così il proprio numero di ossidazione; il processo opposto, in cui una specie acquista elettroni, è detto riduzione.",
    },
    {
      text: 'In una pila galvanica, dove avviene la riduzione?',
      alternatives: [
        'Al catodo',
        "All'anodo",
        'Nel ponte salino',
        "Nell'elettrolita",
        'In entrambi gli elettrodi contemporaneamente',
      ],
      completionAnswer: 'Al catodo',
      explanation: 'Nella pila galvanica la riduzione avviene sempre al catodo.',
      passage:
        "In una pila galvanica, la riduzione avviene sempre al catodo, dove gli elettroni provenienti dal circuito esterno vengono acquistati dalla specie chimica; l'ossidazione, invece, avviene sempre all'anodo.",
    },
    {
      text: "Cosa stabiliscono le leggi di Faraday sull'elettrolisi?",
      alternatives: [
        'La relazione tra la quantità di carica e la quantità di sostanza trasformata',
        'La velocità con cui avviene la reazione',
        'Il valore del potenziale standard di riduzione',
        'La direzione spontanea del flusso di elettroni',
        "La temperatura ottimale per l'elettrolisi",
      ],
      completionAnswer: 'Relazione tra carica elettrica e sostanza trasformata',
      explanation:
        "Le leggi di Faraday collegano la quantità di carica elettrica alla quantità di sostanza trasformata durante l'elettrolisi.",
      passage:
        "Le leggi di Faraday sull'elettrolisi stabiliscono una relazione quantitativa tra la quantità di carica elettrica che attraversa una cella elettrolitica e la quantità di sostanza che viene trasformata agli elettrodi.",
    },
  ],
};

// Fallback per "Altro" o per un argomento senza banca dedicata — domande di
// chimica generale, non legate a un capitolo specifico.
export const DEFAULT_QUESTION_BANK: QuestionTemplate[] = [
  {
    text: 'Qual è la differenza fondamentale tra un elemento e un composto?',
    alternatives: [
      "L'elemento è costituito da un solo tipo di atomo, il composto da più tipi legati chimicamente",
      'Il composto è sempre uno stato gassoso',
      "L'elemento può essere sempre scomposto in sostanze più semplici",
      'Non c’è alcuna differenza sostanziale',
      'Il composto ha sempre carica elettrica netta',
    ],
    completionAnswer: "L'elemento ha un solo tipo di atomo, il composto più tipi legati",
    explanation:
      'Un elemento contiene un solo tipo di atomo, mentre un composto ne contiene più tipi legati chimicamente.',
    passage:
      'Un elemento chimico è costituito da atomi tutti dello stesso tipo (stesso numero atomico). Un composto è invece formato da due o più elementi diversi legati chimicamente tra loro in proporzioni fisse, e le sue proprietà sono generalmente diverse da quelle degli elementi che lo costituiscono.',
  },
  {
    text: 'Cosa si intende per reazione chimica bilanciata?',
    alternatives: [
      'Una reazione in cui il numero di atomi di ogni elemento è uguale tra reagenti e prodotti',
      'Una reazione che avviene a temperatura costante',
      'Una reazione che produce un solo prodotto',
      'Una reazione priva di catalizzatori',
      'Una reazione con resa del 100%',
    ],
    completionAnswer: 'Numero di atomi uguale tra reagenti e prodotti',
    explanation:
      'Una reazione bilanciata ha lo stesso numero di atomi di ciascun elemento tra reagenti e prodotti.',
    passage:
      "Bilanciare un'equazione chimica significa determinare i coefficienti stechiometrici in modo che il numero di atomi di ciascun elemento sia identico tra reagenti e prodotti, in accordo con la legge di conservazione della massa.",
  },
  {
    text: 'Perché è importante indicare le cifre significative in una misura?',
    alternatives: [
      'Per esprimere correttamente la precisione della misura',
      'Per rendere il numero più lungo',
      'Per evitare di usare la notazione scientifica',
      'Perché lo richiede solo la chimica organica',
      "Per aumentare artificialmente l'accuratezza",
    ],
    completionAnswer: 'Per esprimere la precisione della misura',
    explanation:
      'Le cifre significative comunicano la precisione reale di una misura sperimentale.',
    passage:
      'Le cifre significative di una misura sperimentale indicano il grado di precisione dello strumento utilizzato: riportarle correttamente evita di comunicare una precisione maggiore, o minore, di quella realmente raggiunta.',
  },
  {
    text: 'Cosa distingue una trasformazione chimica da una fisica?',
    alternatives: [
      'Nella trasformazione chimica si formano nuove sostanze con proprietà diverse',
      'Nella trasformazione fisica cambia sempre la composizione chimica',
      'Le trasformazioni chimiche sono sempre reversibili',
      'Le trasformazioni fisiche producono sempre nuovi composti',
      'Non esiste alcuna differenza pratica',
    ],
    completionAnswer: 'Si formano nuove sostanze con proprietà diverse',
    explanation:
      'In una trasformazione chimica si formano nuove sostanze con proprietà diverse da quelle di partenza.',
    passage:
      'In una trasformazione fisica la sostanza cambia stato o forma ma la sua composizione chimica resta invariata, come nella fusione del ghiaccio. In una trasformazione chimica, invece, si rompono e si formano legami e si ottengono nuove sostanze con proprietà diverse.',
  },
  {
    text: 'Qual è il ruolo di un catalizzatore in una reazione chimica?',
    alternatives: [
      'Aumenta la velocità di reazione senza essere consumato',
      "Sposta l'equilibrio verso i prodotti",
      'Aumenta la resa teorica della reazione',
      'Fornisce energia aggiuntiva ai reagenti',
      'Cambia la stechiometria della reazione',
    ],
    completionAnswer: 'Aumenta la velocità di reazione senza essere consumato',
    explanation:
      'Un catalizzatore aumenta la velocità di reazione senza essere consumato nel processo.',
    passage:
      "Un catalizzatore è una sostanza che aumenta la velocità di una reazione chimica abbassandone l'energia di attivazione, senza essere consumata nel processo e senza alterare la posizione di equilibrio finale.",
  },
];

export function pickQuestionBank(argomentoName?: string): QuestionTemplate[] {
  if (argomentoName && QUESTION_BANKS[argomentoName]) return QUESTION_BANKS[argomentoName];
  return DEFAULT_QUESTION_BANK;
}

/** Usata da QuestionsViewDialog per "Vedi il passaggio" su una domanda già persistita: il
 *  passaggio non viene mai salvato sul backend (vedi buildCreatePayload in
 *  QuestionGenerationSummaryDialog), ma le domande generate da quel flusso hanno testo
 *  identico a uno dei template qui sopra — cercandolo per testo si recupera lo stesso
 *  passaggio "simulato" con cui è stata generata, invece di inventarne uno nuovo. Nessun
 *  match per le domande del catalogo reale (mai passate da qui) o per quelle il cui testo è
 *  stato poi modificato a mano. */
export function findPassageForQuestionText(questionText: string): string | undefined {
  const plain = questionText.trim();
  for (const templates of [...Object.values(QUESTION_BANKS), DEFAULT_QUESTION_BANK]) {
    const match = templates.find((tpl) => tpl.text === plain);
    if (match) return match.passage;
  }
  return undefined;
}
