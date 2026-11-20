import { useEffect, useMemo, useState } from 'react'
import { Button, Callout, Card, PageHeader, C } from '../components/ui'
import { useStored } from '../lib/storage'
import { useNav } from '../lib/nav'
import { binarySearchSteps, gridSteps, key, rng, SORTS, sortSteps, type Cell, type Mark, type SortAlgo } from '../lib/visual'

type Tab = 'tris' | 'dichotomie' | 'grille'
const TABS: { id: Tab; label: string }[] = [
  { id: 'tris', label: 'Tris' },
  { id: 'dichotomie', label: 'Recherche dichotomique' },
  { id: 'grille', label: 'BFS / DFS sur grille' },
]

const SPEEDS = [
  { label: 'Lent', ms: 600 },
  { label: 'Moyen', ms: 220 },
  { label: 'Rapide', ms: 60 },
  { label: 'Turbo', ms: 12 },
]

/** Navigation dans une liste d'étapes : lecture automatique, pas à pas, début / fin. */
function usePlayer(steps: unknown[], speed: number) {
  const length = steps.length
  const [state, setState] = useState({ steps, i: 0 })
  const [playing, setPlaying] = useState(false)
  // nouvelle liste d'étapes : retour au début, dans le même rendu (pas d'index hors bornes)
  if (state.steps !== steps) {
    setState({ steps, i: 0 })
    setPlaying(false)
  }
  const i = state.steps === steps ? Math.min(state.i, length - 1) : 0
  const setI = (v: number | ((x: number) => number)) => setState((s) => ({ ...s, i: typeof v === 'function' ? v(s.i) : v }))
  useEffect(() => {
    if (!playing) return
    if (i >= length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, length - 1)), speed)
    return () => clearTimeout(t)
  }, [playing, i, length, speed])
  return { i, setI, playing, setPlaying, reset: () => { setI(0); setPlaying(false) } }
}

function Controls({ player, length, speed, setSpeed, children }: { player: ReturnType<typeof usePlayer>; length: number; speed: number; setSpeed: (ms: number) => void; children?: React.ReactNode }) {
  const { i, setI, playing, setPlaying } = player
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button variant="primary" onClick={() => (i >= length - 1 ? (setI(0), setPlaying(true)) : setPlaying(!playing))}>
        {playing ? '❚❚ Pause' : i >= length - 1 ? '↺ Rejouer' : '▶ Lecture'}
      </Button>
      <Button onClick={() => { setPlaying(false); setI(Math.max(0, i - 1)) }} disabled={i === 0} title="Étape précédente">◀</Button>
      <Button onClick={() => { setPlaying(false); setI(Math.min(length - 1, i + 1)) }} disabled={i >= length - 1} title="Étape suivante">▶︎</Button>
      <Button onClick={() => { setPlaying(false); setI(length - 1) }} title="Aller à la fin">⏭</Button>
      <input aria-label="Étape" type="range" min={0} max={Math.max(0, length - 1)} value={i} onChange={(e) => { setPlaying(false); setI(Number(e.target.value)) }} className="mx-2 w-40 accent-indigo-600" />
      <span className="font-mono text-xs text-slate-500">{i + 1} / {length}</span>
      <select aria-label="Vitesse" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
        {SPEEDS.map((s) => <option key={s.ms} value={s.ms}>{s.label}</option>)}
      </select>
      {children}
    </div>
  )
}

const markColor: Record<Mark | 'none', string> = {
  none: 'bg-slate-300 dark:bg-slate-600',
  compare: 'bg-amber-400',
  swap: 'bg-rose-500',
  pivot: 'bg-violet-500',
  sorted: 'bg-emerald-500',
  range: 'bg-sky-400',
  write: 'bg-rose-500',
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
      {items.map(([cls, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5"><span className={`inline-block h-3 w-3 rounded-sm ${cls}`} />{label}</span>
      ))}
    </div>
  )
}

function randomArray(n: number, seed: number) {
  const r = rng(seed)
  return Array.from({ length: n }, () => 5 + Math.floor(r() * 95))
}

function Sorts() {
  const [algo, setAlgo] = useStored<SortAlgo>('visu:sort', 'rapide')
  const [n, setN] = useStored('visu:n', 16)
  const [seed, setSeed] = useState(7)
  const [preset, setPreset] = useState<'aleatoire' | 'trie' | 'inverse' | 'presque'>('aleatoire')
  const [speed, setSpeed] = useStored('visu:speed', 220)
  const input = useMemo(() => {
    const a = randomArray(n, seed)
    if (preset === 'trie') return a.sort((x, y) => x - y)
    if (preset === 'inverse') return a.sort((x, y) => y - x)
    if (preset === 'presque') {
      a.sort((x, y) => x - y)
      const r = rng(seed + 1)
      for (let k = 0; k < Math.max(1, n >> 3); k++) {
        const i = Math.floor(r() * n)
        const j = Math.min(n - 1, i + 1)
        ;[a[i], a[j]] = [a[j], a[i]]
      }
    }
    return a
  }, [n, seed, preset])
  const steps = useMemo(() => sortSteps(algo, input), [algo, input])
  const player = usePlayer(steps, speed)
  const step = steps[player.i]
  const info = SORTS[algo]
  const max = Math.max(...input, 1)
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Algorithme de tri">
        {(Object.keys(SORTS) as SortAlgo[]).map((a) => (
          <button key={a} aria-pressed={algo === a} onClick={() => setAlgo(a)} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${algo === a ? 'bg-indigo-600 text-white ring-indigo-600' : 'text-slate-600 ring-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'}`}>
            {SORTS[a].label}
          </button>
        ))}
      </div>
      <Controls player={player} length={steps.length} speed={speed} setSpeed={setSpeed}>
        <select aria-label="Entrée" value={preset} onChange={(e) => setPreset(e.target.value as typeof preset)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="aleatoire">Aléatoire</option>
          <option value="presque">Presque trié</option>
          <option value="trie">Déjà trié</option>
          <option value="inverse">Trié à l’envers</option>
        </select>
        <select aria-label="Taille" value={n} onChange={(e) => setN(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
          {[8, 16, 32, 64].map((x) => <option key={x} value={x}>n = {x}</option>)}
        </select>
        <Button onClick={() => setSeed((s) => s + 1)}>Nouveau tirage</Button>
      </Controls>
      <Card>
        <div className="flex h-64 items-end gap-[2px]" aria-label="Barres du tableau">
          {step.arr.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
              <div className="flex w-full flex-1 items-end">
                <div className={`w-full rounded-t-sm transition-[height] duration-150 ${markColor[step.marks[i] ?? 'none']}`} style={{ height: `${(v / max) * 100}%` }} />
              </div>
              {n <= 16 && <span className="mt-1 font-mono text-[10px] text-slate-500">{v}</span>}
            </div>
          ))}
        </div>
        <div className="mt-4 min-h-[1.5rem] font-mono text-sm">{step.note}</div>
        <div className="mt-1 text-xs text-slate-500">Comparaisons : {step.comparisons} · Écritures : {step.writes}</div>
        <Legend items={[[markColor.compare, 'comparés'], [markColor.swap, 'échangés / écrits'], [markColor.pivot, 'pivot / élément courant'], [markColor.range, 'zone en cours'], [markColor.sorted, 'à sa place']]} />
      </Card>
      <Callout tone="info" title={info.label}>
        {info.idea} <strong>Complexité :</strong> {info.complexity}. <strong>Propriétés :</strong> {info.stable}. Compare le nombre de comparaisons sur une entrée « presque triée » ou « déjà triée » : l’insertion y excelle, le tri rapide avec le dernier élément comme pivot s’y effondre.
      </Callout>
    </div>
  )
}

function Dichotomy() {
  const [seed, setSeed] = useState(3)
  const [speed, setSpeed] = useStored('visu:speed', 220)
  const arr = useMemo(() => {
    const r = rng(seed)
    let x = 0
    return Array.from({ length: 31 }, () => (x += 1 + Math.floor(r() * 6)))
  }, [seed])
  const [target, setTarget] = useState<number | null>(null)
  const t = target ?? arr[19]
  const steps = useMemo(() => binarySearchSteps(arr, t), [arr, t])
  const player = usePlayer(steps, speed)
  const s = steps[player.i]
  return (
    <div>
      <Controls player={player} length={steps.length} speed={speed} setSpeed={setSpeed}>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          Cible{' '}
          <input type="number" value={t} onChange={(e) => setTarget(Number(e.target.value))} className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <Button onClick={() => { setSeed((x) => x + 1); setTarget(null) }}>Nouveau tableau</Button>
      </Controls>
      <Card>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {arr.map((v, i) => {
            const inRange = i >= s.lo && i <= s.hi
            const cls = s.found === i ? 'bg-emerald-500 text-white' : s.mid === i ? 'bg-amber-400 text-slate-900' : inRange ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
            return (
              <button key={i} onClick={() => setTarget(v)} title="Chercher cette valeur" className={`rounded px-1 py-2 text-center font-mono text-xs ${cls}`}>
                <div>{v}</div>
                <div className="text-[9px] opacity-60">{i}</div>
              </button>
            )
          })}
        </div>
        <div className="mt-4 min-h-[1.5rem] font-mono text-sm">{s.note}</div>
        <div className="mt-1 text-xs text-slate-500">lo = {s.lo} · hi = {s.hi} {s.mid !== null && `· mid = ${s.mid}`}</div>
        <Legend items={[['bg-sky-200', 'intervalle [lo, hi] encore possible'], ['bg-amber-400', 'milieu examiné'], ['bg-emerald-500', 'trouvé'], ['bg-slate-200', 'éliminé']]} />
      </Card>
      <Callout tone="info" title="Ce qu’il faut voir">
        À chaque étape, la moitié de l’intervalle est éliminée : 31 éléments demandent au plus 5 comparaisons, un million au plus 20. Clique sur une case pour la chercher, ou tape une valeur absente pour voir où <C>lo</C> s’arrête : c’est la position d’insertion (borne inférieure).
      </Callout>
    </div>
  )
}

const ROWS = 14
const COLS = 24
const START: Cell = [1, 1]
const GOAL: Cell = [ROWS - 2, COLS - 2]

function randomWalls(seed: number) {
  const r = rng(seed)
  const w = new Set<string>()
  for (let rr = 0; rr < ROWS; rr++) for (let c = 0; c < COLS; c++) if (r() < 0.27) w.add(key(rr, c))
  w.delete(key(...START))
  w.delete(key(...GOAL))
  return w
}

function Grid() {
  const [kind, setKind] = useStored<'bfs' | 'dfs'>('visu:grid', 'bfs')
  const [speed, setSpeed] = useStored('visu:speed', 220)
  const [walls, setWalls] = useState(() => randomWalls(2))
  const steps = useMemo(() => gridSteps(kind, ROWS, COLS, walls, START, GOAL), [kind, walls])
  const player = usePlayer(steps, speed)
  const s = steps[player.i]
  const toggle = (r: number, c: number) => {
    const k = key(r, c)
    if (k === key(...START) || k === key(...GOAL)) return
    setWalls((w) => {
      const n = new Set(w)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })
  }
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Parcours">
        {(['bfs', 'dfs'] as const).map((k) => (
          <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${kind === k ? 'bg-indigo-600 text-white ring-indigo-600' : 'text-slate-600 ring-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'}`}>
            {k === 'bfs' ? 'BFS (largeur, file)' : 'DFS (profondeur, pile)'}
          </button>
        ))}
      </div>
      <Controls player={player} length={steps.length} speed={speed} setSpeed={setSpeed}>
        <Button onClick={() => setWalls(randomWalls(Math.floor(Math.random() * 1e6)))}>Nouveaux murs</Button>
        <Button onClick={() => setWalls(new Set())}>Effacer les murs</Button>
      </Controls>
      <Card>
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-label="Grille">
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const k = key(r, c)
              const isStart = r === START[0] && c === START[1]
              const isGoal = r === GOAL[0] && c === GOAL[1]
              const cls = isStart ? 'bg-indigo-600' : isGoal ? 'bg-rose-600' : walls.has(k) ? 'bg-slate-700 dark:bg-slate-300' : s.path.has(k) ? 'bg-emerald-500' : s.current === k ? 'bg-amber-400' : s.frontier.has(k) ? 'bg-sky-300 dark:bg-sky-700' : s.visited.has(k) ? 'bg-sky-100 dark:bg-sky-950' : 'bg-slate-100 dark:bg-slate-800'
              return <button key={k} aria-label={`case ${r}, ${c}`} onClick={() => toggle(r, c)} className={`aspect-square rounded-[2px] ${cls}`} />
            }),
          )}
        </div>
        <div className="mt-4 min-h-[1.5rem] font-mono text-sm">{s.note}</div>
        <Legend items={[['bg-indigo-600', 'départ'], ['bg-rose-600', 'arrivée'], ['bg-amber-400', 'case visitée à cette étape'], ['bg-sky-300', kind === 'bfs' ? 'dans la file' : 'dans la pile'], ['bg-sky-100', 'déjà visitée'], ['bg-emerald-500', 'chemin trouvé'], ['bg-slate-700', 'mur (clic pour basculer)']]} />
      </Card>
      <Callout tone="info" title="Ce qu’il faut voir">
        Le BFS s’étend en « ondes » concentriques : il visite toutes les cases à distance 1, puis 2, etc., d’où la garantie du plus court chemin quand toutes les arêtes ont le même poids. Le DFS fonce dans une direction et revient en arrière quand il est bloqué : il trouve un chemin, rarement le plus court. Les deux sont en O(V + E). Clique sur les cases pour ajouter ou retirer des murs.
      </Callout>
    </div>
  )
}

export default function Visualizer() {
  const { go } = useNav()
  const [tab, setTab] = useStored<Tab>('visu:tab', 'tris')
  return (
    <div>
      <PageHeader
        title="Visualiseur"
        subtitle={
          <>
            Regarde tourner les algorithmes classiques pas à pas, avant de les écrire. Lecture automatique, retour arrière et vitesse réglable ; chaque étape est commentée. Les implémentations correspondent à celles du <button className="underline" onClick={() => go('cours', 'tri')}>cours</button>.
          </>
        }
      />
      <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'tris' && <Sorts />}
      {tab === 'dichotomie' && <Dichotomy />}
      {tab === 'grille' && <Grid />}
    </div>
  )
}
