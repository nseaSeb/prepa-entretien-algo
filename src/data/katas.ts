import type { Kata } from './types'
import { merged } from './packs'

export const katas: Kata[] = merged('katas')
