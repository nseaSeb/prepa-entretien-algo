import { JsEditor } from '../components/JsEditor'
import { ConsoleView } from '../components/ConsoleView'
import { Button, Callout, PageHeader, C } from '../components/ui'
import { DEFAULT_CODE } from '../lib/nav'
import { useRunner } from '../lib/useRunner'

const EXAMPLES: [string, string][] = [
  ['Dichotomie', DEFAULT_CODE],
  [
    'O(n²) vs O(n)',
    `// Mesurer pour sentir la différence : doublon dans un tableau
function hasDupQuadratic(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++) if (arr[i] === arr[j]) return true
  return false
}
function hasDupLinear(arr) {
  const seen = new Set()
  for (const x of arr) {
    if (seen.has(x)) return true
    seen.add(x)
  }
  return false
}

for (const n of [1_000, 5_000, 20_000]) {
  const arr = Array.from({ length: n }, (_, i) => i)
  let t = performance.now()
  hasDupQuadratic(arr)
  const q = performance.now() - t
  t = performance.now()
  hasDupLinear(arr)
  const l = performance.now() - t
  console.log(\`n=\${n}  O(n²): \${q.toFixed(1)} ms   O(n): \${l.toFixed(2)} ms\`)
}`,
  ],
  [
    'BFS sur grille',
    `// Plus court chemin de S à E (4 directions), file avec un index (shift() est O(n))
const grid = [
  'S.#.....',
  '.##.###.',
  '....#...',
  '.##...#E',
]
function shortest(grid) {
  const R = grid.length, C = grid[0].length
  let start
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === 'S') start = [r, c]
  const dist = grid.map((row) => Array(row.length).fill(-1))
  dist[start[0]][start[1]] = 0
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    if (grid[r][c] === 'E') return dist[r][c]
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue
      if (grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return -1
}
console.log(shortest(grid))`,
  ],
  [
    'Tas (MinHeap)',
    `// JavaScript n'a pas de file de priorité : voici un tas binaire minimal
class MinHeap {
  constructor(cmp = (a, b) => a - b) { this.a = []; this.cmp = cmp }
  get size() { return this.a.length }
  peek() { return this.a[0] }
  push(x) {
    const a = this.a
    a.push(x)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.cmp(a[i], a[p]) >= 0) break
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
        const l = 2 * i + 1, r = l + 1
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

const h = new MinHeap()
for (const x of [5, 1, 8, 3, 9, 2]) h.push(x)
const out = []
while (h.size) out.push(h.pop())
console.log(out)`,
  ],
  ['Piège du tri', `console.log([10, 9, 1, 100].sort())\nconsole.log([10, 9, 1, 100].sort((a, b) => a - b))`],
  ['Boucle infinie', `console.log('je vais boucler…')\nwhile (true) {}`],
]

export default function Playground({ code, setCode }: { code: string; setCode: (c: string) => void }) {
  const { logs, status, run, clear } = useRunner()
  const exec = () => run(code)
  return (
    <div>
      <PageHeader
        title="Playground"
        subtitle="Un éditeur JavaScript et une console pour tester un algorithme, mesurer son temps d'exécution ou rejouer un exemple du cours. Le code s'exécute dans un Web Worker isolé : une boucle infinie est interrompue sans geler l'onglet. Ton code est conservé dans ce navigateur."
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={exec} disabled={status.state === 'running'}>
          ▶ Exécuter <span className="ml-1 text-xs opacity-70">⌘/Ctrl + Entrée</span>
        </Button>
        <span className="ml-2 text-sm text-slate-500">Exemples :</span>
        {EXAMPLES.map(([label, src]) => (
          <button key={label} onClick={() => setCode(src)} className="rounded-md px-2 py-1 text-sm text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800">
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <JsEditor value={code} onChange={setCode} onRun={exec} minHeight="420px" />
        <div className="flex min-w-0 flex-col gap-4">
          <ConsoleView logs={logs} status={status} onClear={clear} />
        </div>
      </div>
      <Callout tone="info" title="Bon à savoir">
        Le code est évalué comme une balise <C>{'<script>'}</C> non stricte. <C>performance.now()</C> est disponible pour chronométrer. L'exécution s'arrête au bout de 5 secondes : une solution en O(n²) sur 10⁵ éléments y arrive vite. La pile d'appels de V8 tient environ 10 000 niveaux de récursion : au-delà, <C>RangeError: Maximum call stack size exceeded</C>, d'où l'intérêt des versions itératives. Les équivalents Python, Java, Rust, PHP ou Bash affichés dans le cours ne s'exécutent pas ici : utilise le playground du training du langage concerné.
      </Callout>
    </div>
  )
}
