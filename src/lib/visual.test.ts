import { test } from 'node:test'
import assert from 'node:assert/strict'
import { binarySearchSteps, gridSteps, key, rng, SORTS, sortSteps, type SortAlgo } from './visual'

test('visualiseur : chaque tri produit le tableau trié', () => {
  const rand = rng(42)
  for (let trial = 0; trial < 50; trial++) {
    const input = Array.from({ length: 1 + Math.floor(rand() * 20) }, () => 1 + Math.floor(rand() * 30))
    const expected = [...input].sort((a, b) => a - b)
    for (const algo of Object.keys(SORTS) as SortAlgo[]) {
      const steps = sortSteps(algo, input)
      assert.deepEqual(steps.at(-1)!.arr, expected, `${algo} sur ${input}`)
      assert.equal(Object.values(steps.at(-1)!.marks).filter((m) => m === 'sorted').length, input.length)
    }
  }
})

test('visualiseur : dichotomie trouvée / absente', () => {
  const arr = [1, 3, 5, 7, 9, 11]
  assert.equal(binarySearchSteps(arr, 7).at(-1)!.found, 3)
  assert.equal(binarySearchSteps(arr, 4).at(-1)!.found, null)
  assert.equal(binarySearchSteps([], 4).at(-1)!.found, null)
})

test('visualiseur : BFS donne le plus court chemin, DFS un chemin valide', () => {
  const walls = new Set([key(0, 1), key(1, 1), key(2, 1)])
  const bfs = gridSteps('bfs', 4, 3, walls, [0, 0], [0, 2]).at(-1)!
  assert.equal(bfs.path.size - 1, 8)
  const dfs = gridSteps('dfs', 4, 3, walls, [0, 0], [0, 2]).at(-1)!
  assert.ok(dfs.path.size - 1 >= 8)
  const blocked = gridSteps('bfs', 2, 3, new Set([key(0, 1), key(1, 1)]), [0, 0], [0, 2]).at(-1)!
  assert.equal(blocked.path.size, 0)
})
