import type { EquivLang, ThemeId } from './types'

/** Thèmes = sections du cours (ancre #cours/<id>), dans l'ordre conseillé de révision. */
export const themes: { id: ThemeId; label: string }[] = [
  { id: 'complexite', label: 'Complexité et Big O' },
  { id: 'tableaux', label: 'Tableaux, two pointers, préfixes' },
  { id: 'hachage', label: 'Tables de hachage' },
  { id: 'fenetre', label: 'Fenêtre glissante' },
  { id: 'piles', label: 'Piles, files, pile monotone' },
  { id: 'recherche', label: 'Recherche dichotomique' },
  { id: 'tri', label: 'Tris' },
  { id: 'recursion', label: 'Récursion et backtracking' },
  { id: 'listes', label: 'Listes chaînées' },
  { id: 'arbres', label: 'Arbres, BST, trie' },
  { id: 'tas', label: 'Tas et file de priorité' },
  { id: 'graphes', label: 'Graphes' },
  { id: 'glouton', label: 'Algorithmes gloutons' },
  { id: 'dp', label: 'Programmation dynamique' },
  { id: 'bits', label: 'Bits et mathématiques' },
  { id: 'chaines', label: 'Chaînes de caractères' },
]

export const themeLabel = (id: string) => themes.find((t) => t.id === id)?.label ?? id

/** Ordre et libellés des onglets d'équivalents. */
export const equivLangs: { id: EquivLang; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'rust', label: 'Rust' },
  { id: 'php', label: 'PHP' },
  { id: 'bash', label: 'Bash' },
]
