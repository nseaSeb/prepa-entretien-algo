import type { EquivLang } from '../data/types'
import { parser } from '@lezer/javascript'
import { highlightCode, tagHighlighter, tags as t } from '@lezer/highlight'

// Même palette que l'éditeur CodeMirror (components/JsEditor.tsx)
const highlighter = tagHighlighter([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.definitionKeyword, t.modifier], class: 'text-sky-300 font-semibold' },
  { tag: [t.string, t.special(t.string), t.regexp], class: 'text-amber-300' },
  { tag: [t.number, t.bool, t.null, t.atom], class: 'text-orange-300' },
  { tag: [t.lineComment, t.blockComment], class: 'text-slate-500 italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], class: 'text-emerald-300' },
  { tag: [t.className, t.definition(t.className), t.typeName], class: 'text-violet-300' },
  { tag: [t.self, t.special(t.variableName)], class: 'text-pink-300' },
])

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Code JS → HTML coloré (classes Tailwind). */
export function highlightJs(code: string): string {
  let html = ''
  try {
    highlightCode(
      code,
      parser.parse(code),
      highlighter,
      (text, classes) => {
        html += classes ? `<span class="${classes}">${esc(text)}</span>` : esc(text)
      },
      () => {
        html += '\n'
      },
    )
    return html
  } catch {
    return esc(code)
  }
}

const KEYWORDS: Record<EquivLang, string> = {
  python: 'def return if elif else for while in not and or is None True False class import from as with lambda yield pass break continue try except finally raise global nonlocal del assert',
  java: 'public private protected static final class interface extends implements new return if else for while do switch case default break continue try catch finally throw throws void int long double float boolean char byte short var null true false this super import package record',
  php: 'function return if elseif else for foreach while do as switch case default break continue new class public private protected static fn array null true false use namespace echo isset unset count try catch throw match int float string bool',
  bash: 'function return if then elif else fi for in do done while until case esac local declare readonly echo printf read exit break continue set shift',
  rust: 'fn let mut return if else for while loop match in impl struct enum trait pub use mod const static ref self Self true false as where Some None Ok Err usize i32 i64 u32 u64 f64 bool String Vec',
}

const LINE_COMMENT: Record<EquivLang, string> = { python: '#', java: '//', rust: '//', php: '//', bash: '#' }

/** Coloration légère (mots-clés, chaînes, nombres, commentaires) pour les équivalents non exécutés. */
export function highlightOther(code: string, lang: EquivLang): string {
  const kw = new Set(KEYWORDS[lang].split(' '))
  const lc = LINE_COMMENT[lang] === '#' ? '#' : '\\/\\/'
  const re = new RegExp(`(${lc}.*$)|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_]*)(\\s*\\()?`, 'gm')
  let html = ''
  let last = 0
  for (const m of code.matchAll(re)) {
    html += esc(code.slice(last, m.index))
    last = m.index! + m[0].length
    if (m[1]) html += `<span class="text-slate-500 italic">${esc(m[1])}</span>`
    else if (m[2]) html += `<span class="text-amber-300">${esc(m[2])}</span>`
    else if (m[3]) html += `<span class="text-orange-300">${m[3]}</span>`
    else if (kw.has(m[4])) html += `<span class="text-sky-300 font-semibold">${m[4]}</span>${m[5] ?? ''}`
    else if (m[5]) html += `<span class="text-emerald-300">${m[4]}</span>${m[5]}`
    else html += m[4]
  }
  return html + esc(code.slice(last))
}
