import type { LexiqueEntry } from './types'
import { merged } from './packs'

/** Trié par ordre alphabétique (français, sans tenir compte des accents ni de la casse). */
export const lexique: LexiqueEntry[] = merged('lexique').sort((a, b) => a.term.localeCompare(b.term, 'fr', { sensitivity: 'base' }))
