import type { CheatSection } from './types'

/*
 * Antisèche : résumé dense sur une page. Les lignes `expression // → valeur` sont vérifiées,
 * chaque bloc de code est exécuté par les tests.
 */
export const cheatsheet: CheatSection[] = [
  {
    id: 'cs-complexites',
    title: 'Ordres de grandeur',
    blocks: [
      {
        title: 'Taille de l’entrée → complexité visée',
        items: [
          'n ≤ 10 : O(n!) · n ≤ 20 : O(2ⁿ) · n ≤ 500 : O(n³)',
          'n ≤ 5 000 : O(n²) · n ≤ 10⁶ : O(n log n) ou O(n)',
          'n ≥ 10⁹ : O(log n) ou O(1)',
          'Repère : environ 10⁸ opérations simples par seconde',
        ],
      },
      {
        title: 'Récurrences fréquentes',
        items: [
          'T(n) = T(n/2) + O(1) → O(log n) (dichotomie)',
          'T(n) = 2T(n/2) + O(n) → O(n log n) (tri fusion)',
          'T(n) = 2T(n/2) + O(1) → O(n) (parcours d’arbre)',
          'T(n) = 2T(n − 1) + O(1) → O(2ⁿ) (Fibonacci naïf)',
        ],
      },
    ],
  },
  {
    id: 'cs-structures',
    title: 'Coût des structures',
    blocks: [
      {
        title: 'Tableau (Array)',
        items: [
          'accès `a[i]`, `push`, `pop` : O(1) (push amorti)',
          '`shift`, `unshift`, `splice`, `includes`, `indexOf` : O(n)',
          '`slice`, spread `[...a]`, `concat` : O(k) copié',
          '`sort` : O(n log n), stable depuis ES2019',
        ],
      },
      {
        title: 'Map / Set (hachage)',
        items: ['`get`, `set`, `has`, `delete` : O(1) en moyenne', 'ordre d’itération = ordre d’insertion', 'clés comparées par identité : `[1, 2]` n’est jamais retrouvé, encoder `"1,2"`'],
      },
      {
        title: 'Autres',
        items: [
          'Tas binaire : `push`/`pop` O(log n), `peek` O(1), construction O(n)',
          'BST équilibré : recherche, insertion O(log n) ; dégénéré : O(n)',
          'Liste chaînée : insertion en tête O(1), accès au k-ième O(k)',
          'Union-find (compression + rang) : quasi O(1) par opération',
        ],
      },
    ],
  },
  {
    id: 'cs-pieges-js',
    title: 'Pièges JavaScript',
    blocks: [
      {
        title: 'Tri et tableaux',
        code: `const nums = [10, 9, 1, 100]
nums.slice().sort() // → [ 1, 10, 100, 9 ]
nums.slice().sort((a, b) => a - b) // → [ 1, 9, 10, 100 ]
const grid = Array.from({ length: 2 }, () => Array(3).fill(0))
grid[0][0] = 1
grid // → [ [ 1, 0, 0 ], [ 0, 0, 0 ] ]`,
      },
      {
        title: 'Nombres',
        code: `Number.MAX_SAFE_INTEGER // → 9007199254740991
2 ** 53 + 1 === 2 ** 53 // → true
1 << 31 // → -2147483648
-7 % 3 // → -1
const mod = (a, m) => ((a % m) + m) % m
mod(-7, 3) // → 2
Math.floor(7 / 2) // → 3
7 >> 1 // → 3`,
      },
      {
        title: 'Réflexes',
        items: [
          'milieu : `lo + ((hi - lo) >> 1)` ou `Math.floor((lo + hi) / 2)`',
          'infini : `Infinity` / `-Infinity` pour initialiser un min / max',
          '`Math.max(...arr)` dépasse la pile au-delà de ~10⁵ éléments : boucle ou `reduce`',
          'chaînes immuables : accumuler dans un tableau puis `join("")`',
        ],
      },
    ],
  },
  {
    id: 'cs-dichotomie',
    title: 'Recherche dichotomique',
    blocks: [
      {
        title: 'Borne inférieure : premier indice où a[i] ≥ x',
        code: `function lowerBound(a, x) {
  let lo = 0
  let hi = a.length // intervalle [lo, hi)
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (a[mid] < x) lo = mid + 1
    else hi = mid
  }
  return lo
}
lowerBound([1, 3, 3, 5], 3) // → 1
lowerBound([1, 3, 3, 5], 4) // → 3
lowerBound([1, 3, 3, 5], 9) // → 4`,
      },
      {
        title: 'Sur la réponse',
        items: ['si « ok(v) » est monotone (faux…faux vrai…vrai), chercher le plus petit `v` vrai', 'bornes : plus petite et plus grande réponse possibles', 'coût : O(log(plage) × coût de ok)'],
      },
    ],
  },
  {
    id: 'cs-pointeurs',
    title: 'Deux pointeurs et fenêtre',
    blocks: [
      {
        title: 'Fenêtre variable (plus longue sans répétition)',
        code: `function longestUnique(s) {
  const last = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    if (last.has(s[right]) && last.get(s[right]) >= left) left = last.get(s[right]) + 1
    last.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
longestUnique('abcabcbb') // → 3
longestUnique('pwwkew') // → 3`,
      },
      {
        title: 'Somme préfixe + Map (sous-tableaux de somme k)',
        code: `function countSubarrays(nums, k) {
  const seen = new Map([[0, 1]])
  let sum = 0
  let count = 0
  for (const x of nums) {
    sum += x
    count += seen.get(sum - k) ?? 0
    seen.set(sum, (seen.get(sum) ?? 0) + 1)
  }
  return count
}
countSubarrays([1, 1, 1], 2) // → 2
countSubarrays([1, -1, 0], 0) // → 3`,
      },
    ],
  },
  {
    id: 'cs-graphes',
    title: 'Parcours de graphe',
    blocks: [
      {
        title: 'BFS (file avec index de tête)',
        code: `function bfs(adj, start) {
  const dist = new Map([[start, 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const v of adj[u] ?? []) {
      if (dist.has(v)) continue
      dist.set(v, dist.get(u) + 1) // marquer à l'enfilage
      queue.push(v)
    }
  }
  return dist
}
const adj = { a: ['b', 'c'], b: ['d'], c: ['d'], d: [] }
Object.fromEntries(bfs(adj, 'a')) // → { a: 0, b: 1, c: 1, d: 2 }`,
      },
      {
        title: 'Tri topologique (Kahn)',
        code: `function topoSort(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  const indeg = Array(n).fill(0)
  for (const [u, v] of edges) {
    adj[u].push(v)
    indeg[v]++
  }
  const order = []
  for (let u = 0; u < n; u++) if (indeg[u] === 0) order.push(u)
  for (let head = 0; head < order.length; head++)
    for (const v of adj[order[head]]) if (--indeg[v] === 0) order.push(v)
  return order.length === n ? order : null // null : cycle
}
topoSort(4, [[0, 1], [0, 2], [1, 3], [2, 3]]) // → [ 0, 1, 2, 3 ]
topoSort(2, [[0, 1], [1, 0]]) // → null`,
      },
      {
        title: 'Union-find',
        code: `function makeDSU(n) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const size = Array(n).fill(1)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]] // compression (par saut)
      x = parent[x]
    }
    return x
  }
  const union = (a, b) => {
    let ra = find(a)
    let rb = find(b)
    if (ra === rb) return false
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra]
    parent[rb] = ra
    size[ra] += size[rb]
    return true
  }
  return { find, union }
}
const dsu = makeDSU(4)
dsu.union(0, 1) // → true
dsu.union(1, 0) // → false
dsu.find(1) === dsu.find(0) // → true`,
      },
      {
        title: 'Quel algorithme ?',
        items: [
          'plus court chemin, arêtes de même poids : BFS, O(V + E)',
          'poids positifs : Dijkstra avec tas, O((V + E) log V)',
          'poids négatifs : Bellman-Ford, O(V × E)',
          'dépendances / ordre : tri topologique ; groupes : union-find ou DFS',
        ],
      },
    ],
  },
  {
    id: 'cs-tas',
    title: 'Tas binaire (à savoir écrire)',
    blocks: [
      {
        title: 'MinHeap avec comparateur',
        code: `class MinHeap {
  constructor(cmp = (a, b) => a - b) {
    this.a = []
    this.cmp = cmp
  }
  get size() {
    return this.a.length
  }
  push(x) {
    const a = this.a
    a.push(x)
    let i = a.length - 1
    while (i > 0 && this.cmp(a[i], a[(i - 1) >> 1]) < 0) {
      const p = (i - 1) >> 1
      ;[a[i], a[p]] = [a[p], a[i]]
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l
        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r
        if (m === i) break
        ;[a[i], a[m]] = [a[m], a[i]]
        i = m
      }
    }
    return top
  }
}
const h = new MinHeap((x, y) => y - x) // tas max
for (const x of [3, 1, 4, 1, 5]) h.push(x)
h.pop() // → 5
h.pop() // → 4`,
      },
    ],
  },
  {
    id: 'cs-backtracking-dp',
    title: 'Backtracking et DP',
    blocks: [
      {
        title: 'Squelette de backtracking',
        code: `function subsets(nums) {
  const out = []
  const path = []
  const go = (i) => {
    if (i === nums.length) return void out.push([...path]) // copier !
    go(i + 1) // sans nums[i]
    path.push(nums[i])
    go(i + 1) // avec nums[i]
    path.pop() // défaire le choix
  }
  go(0)
  return out
}
subsets([1, 2]) // → [ [], [ 2 ], [ 1 ], [ 1, 2 ] ]`,
      },
      {
        title: 'DP en 5 étapes',
        items: ['1. état : que représente `dp[i]` (ou `dp[i][j]`) ?', '2. transition : comment le calculer à partir d’états plus petits ?', '3. cas de base', '4. ordre de calcul (les dépendances avant)', '5. où lire la réponse ; puis réduire la mémoire si une ligne suffit'],
      },
      {
        title: 'Rendu de monnaie (nombre minimal de pièces)',
        code: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let s = 1; s <= amount; s++)
    for (const c of coins) if (c <= s) dp[s] = Math.min(dp[s], dp[s - c] + 1)
  return dp[amount] === Infinity ? -1 : dp[amount]
}
coinChange([1, 3, 4], 6) // → 2
coinChange([2], 3) // → -1`,
      },
    ],
  },
  {
    id: 'cs-langages',
    title: 'Correspondances entre langages',
    blocks: [
      {
        title: 'File (deque)',
        items: ['JS : tableau + index de tête (`shift` est O(n))', 'Python : `collections.deque` (`append`, `popleft`)', 'Java : `ArrayDeque` (`offer`, `poll`)', 'Rust : `VecDeque` (`push_back`, `pop_front`)', 'PHP : `SplQueue` (`enqueue`, `dequeue`)'],
      },
      {
        title: 'Tas / file de priorité',
        items: ['JS : à écrire (voir ci-dessus)', 'Python : `heapq` (tas min ; négation pour un tas max)', 'Java : `PriorityQueue` (min par défaut, `Comparator.reverseOrder()`)', 'Rust : `BinaryHeap` (tas max ; `Reverse(x)` pour un tas min)', 'PHP : `SplMinHeap`, `SplMaxHeap`, `SplPriorityQueue` (max d’abord)'],
      },
      {
        title: 'Table de hachage et ensemble',
        items: ['JS : `Map`, `Set`', 'Python : `dict`, `set`, `collections.Counter`, `defaultdict`', 'Java : `HashMap` (`getOrDefault`, `merge`), `HashSet`', 'Rust : `HashMap` (`entry().or_insert`), `HashSet`', 'PHP : tableau associatif, `isset`, `array_count_values`'],
      },
      {
        title: 'Entiers',
        items: ['JS : exacts jusqu’à 2⁵³ − 1, bits sur 32 bits, `BigInt` au-delà', 'Python : précision arbitraire', 'Java : `int` 32 bits, `long` 64 bits, débordement silencieux', 'Rust : débordement = panique en debug ; `checked_add`, `wrapping_add`', 'PHP / Bash : 64 bits (PHP passe en `float` au-delà)'],
      },
    ],
  },
]
