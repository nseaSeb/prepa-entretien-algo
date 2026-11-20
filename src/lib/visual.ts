/**
 * Générateurs d'étapes pour le visualiseur. Chaque algorithme produit la liste complète de ses étapes
 * (instantanés immuables) ; la page se contente de naviguer dans cette liste.
 */

export type Mark = 'compare' | 'swap' | 'pivot' | 'sorted' | 'range' | 'write'
export type SortStep = { arr: number[]; marks: Record<number, Mark>; note: string; comparisons: number; writes: number }
export type SortAlgo = 'bulles' | 'selection' | 'insertion' | 'fusion' | 'rapide'

export const SORTS: Record<SortAlgo, { label: string; complexity: string; stable: string; idea: string }> = {
  bulles: { label: 'Tri à bulles', complexity: 'O(n²) en moyenne et au pire, O(n) si déjà trié (arrêt anticipé)', stable: 'stable, en place', idea: 'On compare les voisins deux à deux et on échange s’ils sont mal ordonnés : à chaque passe, le plus grand restant « remonte » à la fin.' },
  selection: { label: 'Tri par sélection', complexity: 'O(n²) dans tous les cas, mais seulement n − 1 échanges', stable: 'non stable, en place', idea: 'On cherche le minimum de la partie non triée et on le place au début de celle-ci.' },
  insertion: { label: 'Tri par insertion', complexity: 'O(n²) au pire, O(n) sur une entrée presque triée', stable: 'stable, en place', idea: 'On insère chaque élément à sa place dans le préfixe déjà trié, en décalant les plus grands vers la droite.' },
  fusion: { label: 'Tri fusion', complexity: 'O(n log n) dans tous les cas, O(n) de mémoire', stable: 'stable, pas en place', idea: 'On coupe en deux, on trie chaque moitié récursivement, puis on fusionne deux suites triées en une seule.' },
  rapide: { label: 'Tri rapide (Lomuto)', complexity: 'O(n log n) en moyenne, O(n²) au pire (pivot toujours extrême)', stable: 'non stable, en place', idea: 'On choisit un pivot (ici le dernier élément), on range à sa gauche tout ce qui est plus petit, puis on trie récursivement les deux côtés.' },
}

export function sortSteps(algo: SortAlgo, input: number[]): SortStep[] {
  const a = [...input]
  const steps: SortStep[] = []
  const sorted = new Set<number>()
  let comparisons = 0
  let writes = 0
  const snap = (note: string, marks: Record<number, Mark> = {}) => {
    const m: Record<number, Mark> = {}
    for (const i of sorted) m[i] = 'sorted'
    steps.push({ arr: [...a], marks: { ...m, ...marks }, note, comparisons, writes })
  }
  const swap = (i: number, j: number) => {
    ;[a[i], a[j]] = [a[j], a[i]]
    writes += 2
  }
  snap('État initial.')

  if (algo === 'bulles') {
    for (let end = a.length - 1; end > 0; end--) {
      let swapped = false
      for (let i = 0; i < end; i++) {
        comparisons++
        snap(`Compare ${a[i]} et ${a[i + 1]}.`, { [i]: 'compare', [i + 1]: 'compare' })
        if (a[i] > a[i + 1]) {
          swap(i, i + 1)
          swapped = true
          snap(`${a[i + 1]} > ${a[i]} : échange.`, { [i]: 'swap', [i + 1]: 'swap' })
        }
      }
      sorted.add(end)
      if (!swapped) {
        for (let k = 0; k < end; k++) sorted.add(k)
        snap('Aucun échange pendant cette passe : le tableau est trié, on s’arrête.')
        break
      }
    }
    sorted.add(0)
  } else if (algo === 'selection') {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i
      for (let j = i + 1; j < a.length; j++) {
        comparisons++
        snap(`Minimum provisoire : ${a[min]}. Compare avec ${a[j]}.`, { [min]: 'pivot', [j]: 'compare' })
        if (a[j] < a[min]) min = j
      }
      if (min !== i) {
        swap(i, min)
        snap(`Place le minimum ${a[i]} en position ${i}.`, { [i]: 'swap', [min]: 'swap' })
      }
      sorted.add(i)
    }
    sorted.add(a.length - 1)
  } else if (algo === 'insertion') {
    sorted.add(0)
    for (let i = 1; i < a.length; i++) {
      const x = a[i]
      let j = i - 1
      snap(`Insère ${x} dans le préfixe trié.`, { [i]: 'pivot' })
      while (j >= 0) {
        comparisons++
        snap(`Compare ${a[j]} et ${x}.`, { [j]: 'compare', [j + 1]: 'pivot' })
        if (a[j] <= x) break
        a[j + 1] = a[j]
        writes++
        a[j] = x
        snap(`${a[j + 1]} > ${x} : décale ${a[j + 1]} à droite.`, { [j + 1]: 'write', [j]: 'pivot' })
        j--
      }
      if (j + 1 !== i) writes++ // placement final de x
      for (let k = 0; k <= i; k++) sorted.add(k)
    }
  } else if (algo === 'fusion') {
    const merge = (lo: number, mid: number, hi: number) => {
      const left = a.slice(lo, mid + 1)
      const right = a.slice(mid + 1, hi + 1)
      let i = 0
      let j = 0
      let k = lo
      const range: Record<number, Mark> = {}
      for (let t = lo; t <= hi; t++) range[t] = 'range'
      snap(`Fusionne [${left.join(', ')}] et [${right.join(', ')}].`, range)
      while (i < left.length || j < right.length) {
        if (j >= right.length || (i < left.length && (comparisons++, left[i] <= right[j]))) a[k] = left[i++]
        else a[k] = right[j++]
        writes++
        snap(`Écrit ${a[k]} en position ${k}.`, { ...range, [k]: 'write' })
        k++
      }
    }
    const sort = (lo: number, hi: number) => {
      if (lo >= hi) return
      const mid = (lo + hi) >> 1
      sort(lo, mid)
      sort(mid + 1, hi)
      merge(lo, mid, hi)
    }
    sort(0, a.length - 1)
    for (let k = 0; k < a.length; k++) sorted.add(k)
  } else {
    const sort = (lo: number, hi: number) => {
      if (lo > hi) return
      if (lo === hi) {
        sorted.add(lo)
        return
      }
      const pivot = a[hi]
      let store = lo
      for (let j = lo; j < hi; j++) {
        comparisons++
        snap(`Pivot ${pivot}. Compare ${a[j]}.`, { [hi]: 'pivot', [j]: 'compare', [store]: 'range' })
        if (a[j] < pivot) {
          if (j !== store) {
            swap(j, store)
            snap(`${a[store]} < ${pivot} : passe à gauche.`, { [hi]: 'pivot', [j]: 'swap', [store]: 'swap' })
          }
          store++
        }
      }
      if (store !== hi) swap(store, hi)
      sorted.add(store)
      snap(`Le pivot ${pivot} est à sa place définitive (position ${store}).`, { [store]: 'pivot' })
      sort(lo, store - 1)
      sort(store + 1, hi)
    }
    sort(0, a.length - 1)
  }
  for (let k = 0; k < a.length; k++) sorted.add(k)
  snap(`Trié : ${comparisons} comparaisons, ${writes} écritures.`)
  return steps
}

export type SearchStep = { lo: number; hi: number; mid: number | null; found: number | null; note: string }

/** Dichotomie classique sur [lo, hi] inclus. */
export function binarySearchSteps(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = []
  let lo = 0
  let hi = arr.length - 1
  steps.push({ lo, hi, mid: null, found: null, note: `Cherche ${target} dans l’intervalle [0, ${hi}].` })
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, found: mid, note: `a[${mid}] = ${arr[mid]} : trouvé en ${steps.length} étapes.` })
      return steps
    }
    if (arr[mid] < target) {
      steps.push({ lo, hi, mid, found: null, note: `a[${mid}] = ${arr[mid]} < ${target} : la cible est à droite, lo = ${mid + 1}.` })
      lo = mid + 1
    } else {
      steps.push({ lo, hi, mid, found: null, note: `a[${mid}] = ${arr[mid]} > ${target} : la cible est à gauche, hi = ${mid - 1}.` })
      hi = mid - 1
    }
  }
  steps.push({ lo, hi, mid: null, found: null, note: `lo (${lo}) > hi (${hi}) : intervalle vide, ${target} est absent. Il s’insérerait en position ${lo}.` })
  return steps
}

export type Cell = [number, number]
export type GridStep = { visited: Set<string>; frontier: Set<string>; current: string | null; path: Set<string>; note: string }
export const key = (r: number, c: number) => `${r},${c}`

/** BFS (file) ou DFS (pile) de start à goal sur une grille 4-connexe ; `walls` : clés bloquées. */
export function gridSteps(kind: 'bfs' | 'dfs', rows: number, cols: number, walls: Set<string>, start: Cell, goal: Cell): GridStep[] {
  const steps: GridStep[] = []
  const parent = new Map<string, string | null>([[key(...start), null]])
  const visited = new Set<string>()
  const list: Cell[] = [start]
  let head = 0
  const dirs: Cell[] = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  const frontier = () => new Set((kind === 'bfs' ? list.slice(head) : list).map(([r, c]) => key(r, c)).filter((k) => !visited.has(k)))
  steps.push({ visited: new Set(), frontier: frontier(), current: null, path: new Set(), note: kind === 'bfs' ? 'La file contient le départ.' : 'La pile contient le départ.' })
  while (kind === 'bfs' ? head < list.length : list.length > 0) {
    const [r, c] = kind === 'bfs' ? list[head++] : list.pop()!
    const k = key(r, c)
    if (visited.has(k)) continue
    visited.add(k)
    if (r === goal[0] && c === goal[1]) {
      const path = new Set<string>()
      for (let p: string | null = k; p; p = parent.get(p) ?? null) path.add(p)
      steps.push({ visited: new Set(visited), frontier: frontier(), current: k, path, note: `Arrivée atteinte : chemin de ${path.size - 1} pas, ${visited.size} cases visitées.${kind === 'dfs' ? ' Le DFS ne garantit pas le plus court chemin.' : ' Le BFS garantit le plus court chemin.'}` })
      return steps
    }
    for (const [dr, dc] of kind === 'dfs' ? [...dirs].reverse() : dirs) {
      const nr = r + dr
      const nc = c + dc
      const nk = key(nr, nc)
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || walls.has(nk)) continue
      if (kind === 'bfs' ? parent.has(nk) : visited.has(nk)) continue
      parent.set(nk, k)
      list.push([nr, nc])
    }
    steps.push({ visited: new Set(visited), frontier: frontier(), current: k, path: new Set(), note: `Visite (${r}, ${c}). ${kind === 'bfs' ? 'File' : 'Pile'} : ${kind === 'bfs' ? list.length - head : list.length} case(s).` })
  }
  steps.push({ visited: new Set(visited), frontier: new Set(), current: null, path: new Set(), note: `Aucun chemin : ${visited.size} cases atteignables visitées.` })
  return steps
}

/** Générateur pseudo-aléatoire déterministe (mulberry32), pour des tirages reproductibles. */
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
