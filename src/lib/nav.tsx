import { createContext, useContext } from 'react'

export type Page =
  | 'accueil'
  | 'methode'
  | 'cours'
  | 'lexique'
  | 'cheatsheet'
  | 'pieges'
  | 'playground'
  | 'katas'
  | 'quiz'
  | 'flashcards'
  | 'entretien'
  | 'visualiseur'

type Nav = {
  page: Page
  go: (page: Page, anchor?: string) => void
  /** Charge du code dans le playground et y bascule */
  openInPlayground: (code: string) => void
}

export const NavContext = createContext<Nav>(null as unknown as Nav)
export const useNav = () => useContext(NavContext)

export const DEFAULT_CODE = `// Écris du JavaScript ici, puis ⌘/Ctrl + Entrée.
// Exemple : recherche dichotomique, O(log n).
function binarySearch(arr, target) {
  let lo = 0
  let hi = arr.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}

const sorted = Array.from({ length: 1_000_000 }, (_, i) => i * 2)
console.log(binarySearch(sorted, 424242)) // 212121
console.log(binarySearch(sorted, 7)) // -1
`

/** `#page/ancre` → [page, ancre décodée]. Une ancre mal encodée (`#cours/%`) est rendue telle quelle. */
export function parseHash(hash: string, pageIds: readonly string[]): [Page, string | undefined] {
  const [p, anchor] = hash.replace(/^#/, '').split('/')
  let decoded = anchor
  if (anchor) {
    try {
      decoded = decodeURIComponent(anchor)
    } catch {
      decoded = anchor
    }
  }
  return [pageIds.includes(p) ? (p as Page) : 'accueil', decoded || undefined]
}
