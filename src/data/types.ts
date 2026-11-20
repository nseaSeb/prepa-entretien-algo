/**
 * Types du contenu. RÈGLES DE VÉRIFICATION (appliquées par `npm test`) :
 *
 * - Un champ `code` qui contient `console.log` (ou warn/error/info) doit avoir un champ `output` :
 *   la sortie console EXACTE (lignes séparées par \n), y compris celle des minuteurs et promesses.
 *   Les erreurs non attrapées s'écrivent « Uncaught TypeError: … » (texte V8, Chrome/Node).
 * - Une ligne de la forme `expression // → valeur` est vérifiée : `valeur` doit être la valeur
 *   inspectée (chaînes entre apostrophes, tableaux `[ 1, 2 ]`, objets `{ a: 1 }`, comme Node).
 * - `run: false` désactive l'exécution : alors aucune affirmation de sortie n'est permise dans ce code
 *   (ni `output`, ni `// →`). À réserver aux extraits volontairement incomplets (pseudo-code).
 * - Le code s'exécute comme un script global non strict (balise <script>), dans un realm neuf.
 *   Une exécution est interrompue au bout de 5 s : un extrait doit rester rapide.
 * - Les textes (`why`, `explanation`, `answer`…) acceptent un markdown minimal :
 *   `code`, **gras**, paragraphes séparés par une ligne vide, listes en lignes « - ».
 *
 * ÉQUIVALENTS DANS D'AUTRES LANGAGES (`equiv`) :
 * - Le JavaScript est le seul langage exécuté et vérifié. `equiv` montre la même idée dans d'autres
 *   langages (onglets à côté du code JS) : ces versions ne sont PAS exécutées. Elles doivent être
 *   la traduction fidèle du JS (mêmes noms, même algorithme), idiomatiques, et ne rien affirmer
 *   de plus que le JS (pas de sortie différente). Les mettre là où elles apportent quelque chose :
 *   structure absente de JS (tas, deque, TreeMap), idiome très différent, piège propre au langage.
 *   Bash seulement quand cela a du sens (traitement de texte, petits calculs), jamais par principe.
 */

export type ThemeId =
  | 'complexite'
  | 'tableaux'
  | 'fenetre'
  | 'hachage'
  | 'piles'
  | 'recherche'
  | 'tri'
  | 'recursion'
  | 'listes'
  | 'arbres'
  | 'tas'
  | 'graphes'
  | 'glouton'
  | 'dp'
  | 'bits'
  | 'chaines'

/** Langages montrés en équivalent (non exécutés). */
export type EquivLang = 'python' | 'java' | 'rust' | 'php' | 'bash'
export type Equiv = Partial<Record<EquivLang, string>>

/** Un extrait exécutable (ou non, avec run: false), avec ses éventuels équivalents. */
export type Snippet = { code: string; output?: string; run?: false; equiv?: Equiv }

export type QuizKind = 'qcm' | 'output' | 'bug' | 'complexite'
export type QuizItem = {
  id: string
  theme: ThemeId
  /**
   * 'output' : « qu'affiche ce code ? » (la sortie réelle doit être exactement choices[answer]) ;
   * 'complexite' : « quelle est la complexité de ce code ? » (code obligatoire, non vérifié par machine) ;
   * 'bug' : trouver le bug (code obligatoire) ; 'qcm' : question de cours.
   */
  kind: QuizKind
  q: string
  code?: string
  choices: string[]
  answer: number
  why: string
}

export type Piege = {
  id: string
  title: string
  theme: ThemeId
  /** Question posée au-dessus de l'extrait, ex. « Qu'affiche ce code ? » */
  question: string
  code: string
  /** Sortie console exacte, vérifiée. */
  output: string
  explanation: string
  /** Version corrigée facultative (Snippet vérifié comme les autres). */
  fix?: Snippet
}

export type KataTest = { name: string; code: string }
export type Kata = {
  id: string
  title: string
  difficulty: 'facile' | 'moyen' | 'difficile'
  theme: ThemeId
  /** Motif à reconnaître (affiché en étiquette), ex. « two pointers », « BFS », « DP 1D ». */
  pattern: string
  statement: string
  starter: string
  solution: string
  /** Traductions de la solution de référence (non exécutées). */
  solutionEquiv?: Equiv
  /**
   * Tests cachés : corps de fonction async exécutés après le code du candidat.
   * Aides disponibles : assert(cond, msg?), assertEqual(actual, expected, msg?) (égalité profonde),
   * assertThrows(fn, msg?), sleep(ms). Un test « grande entrée » peut vérifier la complexité :
   * dimensionné pour qu'une solution naïve dépasse le délai alors que la bonne termine en millisecondes.
   */
  tests: KataTest[]
  hints: string[]
  /** Discussion : complexité, cas limites, variantes à évoquer à l'oral. */
  discussion: string
}

export type Flashcard = { id: string; theme: ThemeId; front: string; back: string } & Partial<Snippet>

export type LexiqueEntry = { term: string; def: string; theme?: ThemeId; see?: string[] } & Partial<Snippet>

export type EntretienSection = 'general' | 'complexite' | 'structures' | 'techniques' | 'conception'
export type EntretienQ = {
  id: string
  section: EntretienSection
  q: string
  /** Piste de réponse (markdown minimal). */
  answer: string
  /** Ce que le recruteur cherche à vérifier. */
  attendu?: string
} & Partial<Snippet>

export type CoursBlock =
  | { p: string }
  /** `id` facultatif : ancre de sous-partie (#cours/<id>), préfixée par le thème (ex. `tri-`). */
  | { h: string; id?: string }
  /** Encadrés « Mnémo » et « Piège » au milieu d'une section (par sous-partie). */
  | { mnemo: string; piege: string }
  | { list: string[] }
  | ({ title?: string } & Snippet)
  | { table: string[][] }

export type CoursSection = {
  id: ThemeId
  title: string
  /** Une phrase de résumé. */
  summary: string
  blocks: CoursBlock[]
  mnemo: string
  piege: string
}

export type CheatBlock = { title: string; items?: string[] } & Partial<Snippet>
export type CheatSection = { id: string; title: string; blocks: CheatBlock[] }

/**
 * Contenu d'un groupe de thèmes (un fichier dans src/data/packs/). Les fichiers d'agrégation
 * (cours.ts, katas.ts, quiz.ts…) fusionnent tous les packs.
 */
export type ThemePack = {
  cours: CoursSection[]
  katas: Kata[]
  quiz: QuizItem[]
  pieges: Piege[]
  flashcards: Flashcard[]
  lexique: LexiqueEntry[]
  entretien: EntretienQ[]
}
