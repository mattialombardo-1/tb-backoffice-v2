import type { Alternative, QuestionType } from '@/lib/types/questions';

/** Fonte a cui è ancorata la domanda — tre campi separati (invece di un'unica stringa) così
 *  in UI ogni riga ha l'etichetta attenuata e il valore in evidenza, come da riferimento. */
export interface ParsedSource {
  manuale: string;
  /** Assente nel formato legacy (vedi sotto) — vuota quando non nota, mai inventata. */
  capitolo: string;
  pagina: string;
}

// Il backend reale non ha un campo dedicato per la fonte della "Correzione commentata" —
// QuestionGenerationStep la accoda a explanationText invece di inventare un campo che il
// backend non saprebbe salvare. Due pattern perché il formato è cambiato durante lo sviluppo
// di questa proposta: quello attuale (3 righe, con Capitolo) e uno precedente, più compatto
// (una riga sola, senza Capitolo) — le domande generate prima del cambio hanno ancora quello
// vecchio salvato. Se nessuno dei due combacia (domande del catalogo mai passate da questo
// flusso, o spiegazioni modificate a mano), niente Fonte — si mostra solo il testo così com'è,
// senza inventare nulla.
const SOURCE_SUFFIX_PATTERN = /\n\nManuale: (.+)\nCapitolo: (.+)\nPagina: (.+)$/;
const LEGACY_SOURCE_SUFFIX_PATTERN = /\n\nFonte: (.+), p\. (.+)$/;

export function parseExplanation(explanationText: string): {
  explanation: string;
  source: ParsedSource | null;
} {
  const match = explanationText.match(SOURCE_SUFFIX_PATTERN);
  if (match) {
    const [full, manuale, capitolo, pagina] = match;
    return {
      explanation: explanationText.slice(0, explanationText.length - full.length),
      source: { manuale, capitolo, pagina },
    };
  }
  const legacyMatch = explanationText.match(LEGACY_SOURCE_SUFFIX_PATTERN);
  if (legacyMatch) {
    const [full, manuale, pagina] = legacyMatch;
    return {
      explanation: explanationText.slice(0, explanationText.length - full.length),
      source: { manuale, capitolo: '', pagina },
    };
  }
  return { explanation: explanationText, source: null };
}

export interface QualityCheck {
  title: string;
  subtitle: string;
  passed: boolean;
}

/** 5 controlli — in teoria ogni domanda dovrebbe superarli tutti. Calcolati sui dati reali
 *  della domanda quando possibile ("Duplicati e similarità" fa eccezione: richiederebbe un
 *  vero controllo contro il materiale di riferimento che qui non esiste — resta sempre
 *  superato, promemoria per chi revisiona, non un check automatico vero). Per le domande a
 *  completamento "Unica risposta corretta" e "Formato" non si applicano (non hanno
 *  alternative) — restano sempre superati anche lì.
 *
 *  Condiviso tra QuestionsViewDialog ("Anteprima Domanda") e QuestionEditContent (la vera
 *  pagina di revisione) — stessa logica, non duplicarla. */
export function buildQualityChecks(params: {
  type: QuestionType;
  questionText: string;
  // Id reali, non i nomi derivati (materiaName/argomentoName): quei nomi si risolvono
  // cercando l'id in una lista di materie/argomenti "vere", e per gli argomenti simulati
  // di questa proposta di design (fixedOptions, id tipo __fixed__...) quella ricerca
  // fallisce sempre — il nome resta vuoto anche quando l'argomento è stato scelto per
  // davvero. Gli id restano invece sempre valorizzati.
  subjectId: string;
  topicId: string;
  alternatives: Alternative[];
  completionAnswer: string;
  explanationText: string;
  source: ParsedSource | null;
}): QualityCheck[] {
  const {
    type,
    questionText,
    subjectId,
    topicId,
    alternatives,
    completionAnswer,
    explanationText,
    source,
  } = params;
  const isMultipleChoice = type === 'MULTIPLE_CHOICE';

  const hasAnswerContent = isMultipleChoice
    ? alternatives.length > 0 && alternatives.every((a) => a.text.trim() !== '')
    : completionAnswer.trim() !== '';

  const completezza =
    questionText.trim() !== '' &&
    hasAnswerContent &&
    !!subjectId &&
    !!topicId &&
    explanationText.trim() !== '';

  const correctCount = alternatives.filter((a) => a.isCorrect).length;
  const optionsCount = alternatives.length;

  return [
    {
      title: 'Completezza',
      subtitle: 'Testo, alternative, classificazione e spiegazione sono compilati.',
      passed: completezza,
    },
    {
      title: 'Unica risposta corretta',
      subtitle: 'È indicata una sola alternativa corretta.',
      passed: isMultipleChoice ? correctCount === 1 : true,
    },
    isMultipleChoice
      ? {
          title: `Formato a ${optionsCount} opzioni`,
          subtitle: `La domanda ha ${optionsCount} alternative.`,
          passed: optionsCount >= 2,
        }
      : {
          title: 'Formato a risposta libera',
          subtitle: 'La domanda richiede una risposta scritta.',
          passed: true,
        },
    {
      title: 'Ancoraggio alla fonte',
      subtitle: 'La bozza è collegata a un passaggio del manuale.',
      passed: !!source,
    },
    {
      title: 'Duplicati e similarità',
      subtitle: 'Nessun duplicato evidente rispetto al materiale di riferimento.',
      passed: true,
    },
  ];
}
