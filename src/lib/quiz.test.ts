import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quiz } from '../data/quiz'
import { runSnippet } from './sandbox/node'
import { norm } from './contentCheck'

for (const q of quiz.filter((x) => x.kind === 'output')) {
  test(`quiz ${q.id} (output) : la sortie réelle est la bonne réponse`, async () => {
    assert.ok(q.code, 'code obligatoire')
    const r = await runSnippet(q.code!)
    assert.ok(r.settled, 'minuteurs jamais terminés')
    const out = norm(r.output)
    assert.equal(out, norm(q.choices[q.answer]), `sortie réelle :\n${r.output}`)
    q.choices.forEach((c, i) => {
      if (i !== q.answer) assert.notEqual(norm(c), out, `le choix ${i} est aussi la sortie réelle`)
    })
  })
}

for (const q of quiz.filter((x) => (x.kind === 'complexite' || x.kind === 'bug') && x.code && !/console\./.test(x.code))) {
  test(`quiz ${q.id} (${q.kind}) : le code s'exécute sans erreur`, async () => {
    const r = await runSnippet(q.code!)
    const errs = r.logs.filter((l) => l.level === 'uncaught')
    assert.equal(errs.length, 0, errs.map((e) => e.text).join(' | '))
  })
}
