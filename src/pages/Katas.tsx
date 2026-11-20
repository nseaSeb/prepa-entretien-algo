import { useEffect, useRef, useState } from 'react'
import { katas } from '../data/katas'
import { themeLabel, themes } from '../data/themes'
import type { Kata } from '../data/types'
import { useStored } from '../lib/storage'
import { KEYS } from '../lib/progress'
import { useNav } from '../lib/nav'
import { runTests, type KataOutcome } from '../lib/sandbox/client'
import { JsEditor } from '../components/JsEditor'
import { ConsoleView } from '../components/ConsoleView'
import { Button, Callout, Card, Code, PageHeader, Reveal, Tag, type TagColor } from '../components/ui'
import { Rich } from '../components/Rich'

const diffColor: Record<Kata['difficulty'], TagColor> = { facile: 'emerald', moyen: 'amber', difficile: 'rose' }
const anchor = () => location.hash.slice(1).split('/')[1]
type Filter = string

type Outcome = KataOutcome

function KataView({ kata, solved, onSolved }: { kata: Kata; solved: boolean; onSolved: () => void }) {
  const { openInPlayground } = useNav()
  const [code, setCode] = useStored(`katas:code:${kata.id}`, kata.starter)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const nTests = kata.tests.length
  const [running, setRunning] = useState(false)
  const [hints, setHints] = useState(0)

  // ⌘/Ctrl+Entrée peut relancer pendant une exécution : l'ancienne est arrêtée et son résultat ignoré
  const runId = useRef(0)
  const current = useRef<AbortController | null>(null)
  useEffect(() => () => current.current?.abort(), [])
  const run = async () => {
    const id = ++runId.current
    current.current?.abort()
    const ctrl = new AbortController()
    current.current = ctrl
    setRunning(true)
    const r: Outcome = await runTests(code, kata.tests, { signal: ctrl.signal })
    if (id !== runId.current) return
    current.current = null
    setOutcome(r)
    setRunning(false)
    if (r.status === 'ok' && r.results?.length === nTests && r.results.every((t) => t.ok)) onSolved()
  }
  const passed = outcome?.results?.filter((t) => t.ok).length ?? 0

  return (
    <div id={kata.id} className="scroll-mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{kata.title}</h2>
        <Tag color={diffColor[kata.difficulty]}>{kata.difficulty}</Tag>
        <Tag color="sky">{themeLabel(kata.theme)}</Tag>
        <Tag color="violet">{kata.pattern}</Tag>
        {solved && <Tag color="emerald">réussi ✓</Tag>}
      </div>
      <Rich text={kata.statement} className="mt-3 text-[15px]" />

      <div className="mt-4 mb-3 flex flex-wrap items-center gap-2">
        <Button variant="success" onClick={run} disabled={running}>
          {running ? 'Tests en cours…' : `▶ Lancer les ${nTests} tests`}
        </Button>
        <Button onClick={() => openInPlayground(code)}>Ouvrir dans le playground</Button>
        <Button
          onClick={() => {
            if (confirm('Remplacer ton code par le code de départ ?')) {
              setCode(kata.starter)
              setOutcome(null)
            }
          }}
        >
          Réinitialiser
        </Button>
        <span className="text-xs text-slate-500">⌘/Ctrl + Entrée lance les tests</span>
      </div>
      <JsEditor key={kata.id} value={code} onChange={setCode} onRun={run} minHeight="300px" />

      {outcome && (
        <Card className="mt-4">
          {outcome.status === 'error' ? (
            <div className="font-semibold text-rose-600">Le bac à sable n'a pas pu exécuter les tests (voir la console ci-dessous).</div>
          ) : outcome.status === 'cancelled' ? (
            <div className="font-semibold text-slate-500">Tests interrompus.</div>
          ) : outcome.status === 'timeout' || !outcome.results ? (
            <div className="font-semibold text-rose-600">Timeout : les tests ne se sont pas terminés dans le temps imparti (boucle infinie, ou complexité trop élevée sur la grande entrée ?). Le worker a été arrêté.</div>
          ) : (
            <>
              <div className={`mb-2 font-semibold ${passed === nTests ? 'text-emerald-600' : 'text-rose-600'}`}>
                {passed} / {nTests} tests réussis {passed === nTests && '— bravo !'}
                <span className="ml-2 text-xs font-normal text-slate-500">({outcome.ms} ms)</span>
              </div>
              <ul className="space-y-1 text-sm">
                {outcome.results.map((t) => (
                  <li key={t.name} className="flex gap-2">
                    <span className={t.ok ? 'text-emerald-600' : 'text-rose-600'}>{t.ok ? '✓' : '✗'}</span>
                    <span>
                      {t.name}
                      {t.error && <span className="ml-2 font-mono text-xs text-rose-600 dark:text-rose-400">{t.error}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {outcome.logs.length > 0 && (
            <div className="mt-3">
              <ConsoleView logs={outcome.logs} status={{ state: 'ok', ms: outcome.ms }} />
            </div>
          )}
        </Card>
      )}

      <div className="mt-6">
        {kata.hints.slice(0, hints).map((h, i) => (
          <Callout key={i} tone="warn" title={`Indice ${i + 1}`}>
            <Rich text={h} />
          </Callout>
        ))}
        {hints < kata.hints.length && (
          <Button onClick={() => setHints(hints + 1)}>
            Afficher un indice ({hints + 1}/{kata.hints.length})
          </Button>
        )}
      </div>
      <Reveal label="Voir les tests cachés" tone="slate">
        <Code code={kata.tests.map((t) => `// ${t.name}\n${t.code.trim()}`).join('\n\n')} run={false} />
      </Reveal>
      <Reveal label="Voir la solution de référence" tone="emerald">
        <Code code={kata.solution} equiv={kata.solutionEquiv} />
        <Rich text={kata.discussion} className="text-[15px]" />
      </Reveal>
    </div>
  )
}

export default function Katas() {
  const { go } = useNav()
  const [solved, setSolved] = useStored<Record<string, boolean>>(KEYS.katas, {})
  const [filter, setFilter] = useStored<Filter>('katas:filter', 'tous')
  const filters = [{ id: 'tous', label: 'Tous' }, ...themes.filter((t) => katas.some((k) => k.theme === t.id))]
  const [current, setCurrent] = useState(
    () => katas.find((k) => k.id === anchor())?.id ?? (katas.find((k) => filter === 'tous' || k.theme === filter) ?? katas[0])?.id,
  )
  useEffect(() => {
    const on = () => {
      const found = katas.find((k) => k.id === anchor())
      if (!found) return
      setCurrent(found.id)
      // un lien direct vers un kata masqué par le filtre courant repasse sur « Tous »
      setFilter((f) => (f !== 'tous' && f !== found.theme ? 'tous' : f))
    }
    on()
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const kata = katas.find((k) => k.id === current)
  const visible = filter === 'tous' ? katas : katas.filter((k) => k.theme === filter)
  const nSolved = katas.filter((k) => solved[k.id]).length
  const count = (f: Filter) => (f === 'tous' ? katas : katas.filter((k) => k.theme === f))

  return (
    <div>
      <PageHeader
        title="Katas de live coding"
        subtitle="Les exercices d'algorithmique les plus demandés en entretien, classés par thème. Lis l'énoncé, annonce ton approche et sa complexité, code, puis lance les tests cachés : ils vérifient les cas limites, et parfois une grande entrée qu'une solution naïve ne traite pas à temps. Ton code est conservé pour chaque kata."
      >
        <div className="mt-3 text-sm text-slate-500">
          {nSolved} / {katas.length} réussis
        </div>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <select
            aria-label="Filtrer les katas par thème"
            value={filter}
            onChange={(e) => {
              const f = e.target.value
              setFilter(f)
              const list = count(f)
              if (f !== 'tous' && kata?.theme !== f && list[0]) go('katas', list[0].id)
            }}
            className="mb-3 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {filters.map((f) => {
              const list = count(f.id)
              return (
                <option key={f.id} value={f.id}>
                  {f.label} ({list.filter((k) => solved[k.id]).length}/{list.length})
                </option>
              )
            })}
          </select>
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {visible.map((k, i) => (
              <li key={k.id}>
                <button
                  onClick={() => go('katas', k.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm whitespace-nowrap lg:whitespace-normal ${k.id === current ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className={`w-5 shrink-0 text-center text-xs ${solved[k.id] ? (k.id === current ? 'text-white' : 'text-emerald-600') : 'opacity-50'}`}>{solved[k.id] ? '✓' : i + 1}</span>
                  {k.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0">{kata ? <KataView key={kata.id} kata={kata} solved={!!solved[kata.id]} onSolved={() => setSolved((s) => ({ ...s, [kata.id]: true }))} /> : <p>Aucun kata.</p>}</div>
      </div>
    </div>
  )
}
