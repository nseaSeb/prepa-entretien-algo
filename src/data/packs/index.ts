import type { ThemePack } from '../types'
import { themes } from '../themes'
import { pack as fondamentaux } from './fondamentaux'
import { pack as lineaire } from './lineaire'
import { pack as hierarchique } from './hierarchique'
import { pack as graphes } from './graphes'
import { pack as avance } from './avance'

export const packs: ThemePack[] = [fondamentaux, lineaire, hierarchique, graphes, avance]

const order = new Map(themes.map((t, i) => [t.id as string, i]))
/** Fusionne une liste de tous les packs, triée dans l'ordre des thèmes (stable). */
export function merged<K extends keyof ThemePack>(key: K): ThemePack[K] {
  const all = packs.flatMap((p) => p[key] as { theme?: string; id?: string }[])
  const rank = (x: { theme?: string; id?: string }) => order.get(x.theme ?? (key === 'cours' ? (x.id ?? '') : '')) ?? 99
  return [...all].sort((a, b) => rank(a) - rank(b)) as ThemePack[K]
}
