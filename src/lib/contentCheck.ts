/**
 * Vérification du contenu (tests uniquement, exclu de tsconfig.app).
 * Voir les règles en tête de src/data/types.ts.
 */
import assert from 'node:assert/strict'
import { formatValue } from './sandbox/format'
import { runKata, runSnippet } from './sandbox/node'
import type { Snippet } from '../data/types'

const LOGS = /\bconsole\.(log|warn|error|info|debug|table|dir|trace|assert|count|countReset|group|groupCollapsed|timeEnd|timeLog)\b/
const ARROW = /^(\s*)(.*?)\s*;?\s*\/\/\s*→\s*(.+?)\s*$/

/** Remplace `expr // → valeur` par `__arrow((expr))` et collecte les valeurs attendues. */
export function arrowTransform(code: string) {
  const expected: string[] = []
  const lines = code.split('\n').map((line) => {
    const m = ARROW.exec(line)
    if (!m || !m[2].trim()) return line
    expected.push(m[3])
    return `${m[1]}__arrow((${m[2].replace(/;\s*$/, '')}));`
  })
  return { expected, code: lines.join('\n') }
}

export const norm = (s: string) => s.replace(/\r/g, '').replace(/[ \t]+$/gm, '').trim()

export type CheckResult = 'checked' | 'skipped'

/** Vérifie un extrait : sortie exacte si `output`, flèches `// →`, et aucune erreur inattendue. */
export async function checkSnippet(label: string, s: Partial<Snippet>): Promise<CheckResult> {
  const code = s.code
  if (!code) {
    assert.equal(s.output, undefined, `${label} : output sans code`)
    return 'skipped'
  }
  const arrows = arrowTransform(code)
  if (s.run === false) {
    assert.equal(s.output, undefined, `${label} : run:false interdit toute sortie annoncée (output)`)
    assert.equal(arrows.expected.length, 0, `${label} : run:false interdit les commentaires // →`)
    return 'skipped'
  }
  if (LOGS.test(code)) assert.notEqual(s.output, undefined, `${label} : le code affiche quelque chose, il faut un champ output exact`)

  await checkRuntime(label, code, s.output, arrows)
  return 'checked'
}

/** Exécution d'un code JS : sortie exacte, valeurs `// →`, pas d'erreur imprévue. */
async function checkRuntime(label: string, code: string, output: string | undefined, arrows: { expected: string[]; code: string }) {
  const r = await runSnippet(code)
  assert.ok(r.settled, `${label} : minuteurs jamais terminés`)
  if (output !== undefined) assert.equal(norm(r.output), norm(output), `${label} : sortie console différente`)
  else {
    const errs = r.logs.filter((l) => l.level === 'uncaught')
    assert.equal(errs.length, 0, `${label} : erreur inattendue : ${errs.map((e) => e.text).join(' | ')}`)
  }

  if (arrows.expected.length) {
    const got: string[] = []
    const r2 = await runSnippet(arrows.code, { extraGlobals: { __arrow: (v: unknown) => got.push(formatValue(v, true)) } })
    const errs = r2.logs.filter((l) => l.level === 'uncaught')
    assert.equal(errs.length, 0, `${label} : erreur pendant la vérification des // → : ${errs.map((e) => e.text).join(' | ')}`)
    assert.deepEqual(got, arrows.expected, `${label} : valeurs // → incorrectes`)
  }
}

/** Textes : pas de bloc de code ``` (le code va dans les champs `code`). */
export function checkText(label: string, text: string | undefined) {
  if (!text) return
  assert.ok(!text.includes('```'), `${label} : bloc \`\`\` interdit dans le texte, utiliser un champ code`)
}

/** Équivalents : langages connus, code non vide, aucune affirmation de sortie (ils ne sont pas exécutés). */
export function checkEquiv(label: string, equiv: Record<string, string | undefined> | undefined) {
  if (!equiv) return
  const langs = ['python', 'java', 'rust', 'php', 'bash']
  for (const [lang, code] of Object.entries(equiv)) {
    assert.ok(langs.includes(lang), `${label} : langage d'équivalent inconnu ${lang}`)
    assert.ok(code && code.trim(), `${label} : équivalent ${lang} vide`)
    assert.ok(!/(\/\/|#)\s*→/.test(code!), `${label} : équivalent ${lang} : pas de « // → » (non vérifié)`)
  }
}
