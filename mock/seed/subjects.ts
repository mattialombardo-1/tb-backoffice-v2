/**
 * Materie / argomenti / sotto-argomenti.
 *
 * Ricalca il syllabus reale dei test di ammissione a Medicina, così i filtri
 * gerarchici e le colonne della lista mostrano etichette plausibili invece di
 * placeholder.
 */
export interface SeedSubtopic {
  name: string;
}

export interface SeedTopic {
  name: string;
  subtopics: string[];
}

export interface SeedSubject {
  name: string;
  topics: SeedTopic[];
}

export const SUBJECT_SEED: SeedSubject[] = [
  {
    name: 'Biologia',
    topics: [
      {
        name: 'La chimica dei viventi',
        subtopics: ['Acqua e legami deboli', 'Glucidi e lipidi', 'Proteine ed enzimi'],
      },
      {
        name: 'La cellula',
        subtopics: ['Membrana plasmatica', 'Organuli citoplasmatici', 'Citoscheletro'],
      },
      {
        name: 'Bioenergetica',
        subtopics: ['Glicolisi', 'Ciclo di Krebs', 'Fosforilazione ossidativa', 'Fotosintesi'],
      },
      {
        name: 'Riproduzione ed ereditarietà',
        subtopics: ['Mitosi e meiosi', 'Leggi di Mendel', 'Malattie genetiche'],
      },
      {
        name: 'Genetica molecolare',
        subtopics: ['Struttura del DNA', 'Trascrizione e traduzione', 'Regolazione genica'],
      },
      {
        name: 'Ereditarietà e ambiente',
        subtopics: ['Selezione naturale', 'Speciazione'],
      },
    ],
  },
  {
    name: 'Chimica',
    topics: [
      {
        name: 'Struttura della materia',
        subtopics: ['Modelli atomici', 'Configurazione elettronica', 'Tavola periodica'],
      },
      {
        name: 'Legame chimico',
        subtopics: ['Legame ionico e covalente', 'Geometria molecolare', 'Forze intermolecolari'],
      },
      {
        name: 'Stechiometria',
        subtopics: ['Mole e massa molare', 'Bilanciamento', 'Reagente limitante'],
      },
      {
        name: 'Soluzioni ed equilibri',
        subtopics: ['Concentrazione', 'Acidi e basi', 'pH e tamponi', 'Solubilità'],
      },
      {
        name: 'Chimica organica',
        subtopics: ['Idrocarburi', 'Gruppi funzionali', 'Isomeria'],
      },
    ],
  },
  {
    name: 'Fisica',
    topics: [
      {
        name: 'Cinematica',
        subtopics: ['Moto rettilineo uniforme', 'Moto uniformemente accelerato', 'Moto circolare'],
      },
      {
        name: 'Dinamica',
        subtopics: ['Principi della dinamica', 'Forze di attrito', 'Lavoro ed energia'],
      },
      {
        name: 'Fluidi',
        subtopics: ['Legge di Stevino', 'Principio di Archimede', 'Equazione di continuità'],
      },
      {
        name: 'Termodinamica',
        subtopics: ['Gas ideali', 'Primo principio', 'Secondo principio'],
      },
      {
        name: 'Elettromagnetismo',
        subtopics: ['Legge di Coulomb', 'Circuiti in corrente continua', 'Campo magnetico'],
      },
    ],
  },
  {
    name: 'Matematica',
    topics: [
      {
        name: 'Algebra',
        subtopics: ['Equazioni di secondo grado', 'Disequazioni', 'Sistemi lineari'],
      },
      {
        name: 'Funzioni',
        subtopics: ['Funzioni esponenziali', 'Logaritmi', 'Dominio e codominio'],
      },
      {
        name: 'Geometria analitica',
        subtopics: ['Retta nel piano', 'Circonferenza', 'Parabola'],
      },
      {
        name: 'Trigonometria',
        subtopics: ['Funzioni goniometriche', 'Teoremi sui triangoli'],
      },
      {
        name: 'Probabilità e statistica',
        subtopics: ['Calcolo combinatorio', 'Probabilità condizionata', 'Indici di posizione'],
      },
    ],
  },
  {
    name: 'Logica',
    topics: [
      {
        name: 'Ragionamento logico',
        subtopics: ['Sillogismi', 'Negazioni e connettivi', 'Condizioni necessarie e sufficienti'],
      },
      {
        name: 'Ragionamento numerico',
        subtopics: ['Serie numeriche', 'Problemi di percentuale', 'Proporzioni'],
      },
      {
        name: 'Comprensione del testo',
        subtopics: ['Inferenze', 'Individuazione della tesi'],
      },
      {
        name: 'Ragionamento astratto',
        subtopics: ['Serie di figure', 'Relazioni spaziali'],
      },
    ],
  },
  {
    name: 'Anatomia',
    topics: [
      {
        name: 'Apparato cardiocircolatorio',
        subtopics: ['Cuore', 'Grande e piccola circolazione', 'Sangue'],
      },
      {
        name: 'Apparato respiratorio',
        subtopics: ['Vie aeree', 'Scambi gassosi', 'Meccanica respiratoria'],
      },
      {
        name: 'Sistema nervoso',
        subtopics: ['Neurone e sinapsi', 'Sistema nervoso centrale', 'Sistema nervoso autonomo'],
      },
      {
        name: 'Apparato digerente',
        subtopics: ['Stomaco e intestino', 'Fegato e pancreas', 'Assorbimento dei nutrienti'],
      },
      {
        name: 'Sistema endocrino',
        subtopics: ['Ipofisi', 'Tiroide', 'Pancreas endocrino'],
      },
      {
        name: 'Apparato escretore',
        subtopics: ['Nefrone', 'Filtrazione glomerulare'],
      },
    ],
  },
];
