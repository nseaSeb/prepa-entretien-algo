import type { CoursSection, Kata, QuizItem, Piege, Flashcard, LexiqueEntry, EntretienQ, ThemePack } from '../types'

/*
 * Pack « avancé » : programmation dynamique (dp), bits et mathématiques (bits), chaînes de caractères (chaines).
 * Tous les extraits sont vérifiés par les tests (sortie exacte, valeurs « // → »).
 */

// ═════════════════════════════ PROGRAMMATION DYNAMIQUE ═════════════════════════════

const dpCours: CoursSection = {
  id: 'dp',
  title: 'Programmation dynamique',
  summary: 'Reconnaître un problème de programmation dynamique, le formuler en cinq étapes (état, transition, cas de base, ordre de calcul, réponse), puis l’implémenter en mémoïsation ou en tabulation, avec les grands classiques : escaliers, rendu de monnaie, LIS, grilles, LCS, distance d’édition, sac à dos, intervalles et word break.',
  blocks: [
    { h: 'Reconnaître un problème de programmation dynamique', id: 'dp-reconnaitre' },
    {
      p: 'La **programmation dynamique** (DP) consiste à résoudre un problème en le décomposant en sous-problèmes, à résoudre chaque sous-problème **une seule fois** et à stocker son résultat pour le réutiliser. Elle s’applique quand deux propriétés sont réunies : des **sous-problèmes qui se recoupent** (la récursion naïve recalcule plusieurs fois les mêmes valeurs) et une **sous-structure optimale** (la solution optimale du problème se construit à partir des solutions optimales de ses sous-problèmes).',
    },
    {
      p: 'Dans un énoncé d’entretien, certains signaux doivent faire penser immédiatement à la DP :',
    },
    {
      list: [
        '**« nombre de façons »** de faire quelque chose (monter un escalier, rendre la monnaie, décoder un message) : on additionne les façons des sous-problèmes ;',
        '**« minimum » ou « maximum »** d’un coût, d’un gain, d’une longueur (plus petit nombre de pièces, plus longue sous-séquence) : on prend le `Math.min` ou le `Math.max` des choix possibles ;',
        '**« est-il possible de… »** (atteindre une somme, découper une chaîne en mots) : on combine les sous-problèmes avec un OU logique ;',
        'une entrée qui se parcourt **préfixe par préfixe** (tableau, chaîne) ou **case par case** (grille), et une contrainte où chaque choix influence les choix suivants ;',
        'une solution récursive évidente mais **exponentielle**, où l’on voit les mêmes arguments revenir dans l’arbre d’appels.',
      ],
    },
    {
      p: 'À l’inverse, si un choix local évident suffit toujours (prendre la plus grosse pièce dans un système canonique, trier puis balayer), on est plutôt face à un algorithme **glouton** ; et si l’on doit énumérer toutes les solutions elles-mêmes (et pas seulement les compter), c’est du **backtracking**. La DP compte ou optimise, elle n’énumère pas.',
    },
    {
      title: 'Fibonacci naïf : les mêmes sous-problèmes reviennent sans cesse',
      code: `let calls = 0
function fib(n) {
  calls++
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
}
console.log(fib(25), calls)

const memo = new Map()
let memoCalls = 0
function fibMemo(n) {
  memoCalls++
  if (n < 2) return n
  if (memo.has(n)) return memo.get(n)
  const v = fibMemo(n - 1) + fibMemo(n - 2)
  memo.set(n, v)
  return v
}
console.log(fibMemo(25), memoCalls)`,
      output: `75025 242785
75025 49`,
      equiv: {
        python: `from functools import cache

@cache
def fib_memo(n):
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

print(fib_memo(25))`,
        java: `import java.util.HashMap;
import java.util.Map;

class Fib {
    static Map<Integer, Long> memo = new HashMap<>();

    static long fibMemo(int n) {
        if (n < 2) return n;
        Long cached = memo.get(n);
        if (cached != null) return cached;
        long v = fibMemo(n - 1) + fibMemo(n - 2);
        memo.put(n, v);
        return v;
    }
}`,
      },
    },
    {
      mnemo: '« Compter, optimiser, décider » : nombre de façons, min/max, est-il possible. Si en plus la récursion naïve repasse par les mêmes arguments, c’est de la DP.',
      piege: 'Confondre DP et glouton : pour le rendu de monnaie avec les pièces `[1, 3, 4]` et le montant 6, le glouton prend 4 + 1 + 1 (3 pièces) alors que 3 + 3 (2 pièces) est optimal. Avant de coder un glouton, cherchez un contre-exemple.',
    },

    { h: 'La méthode en cinq étapes', id: 'dp-methode' },
    {
      p: 'Une DP bien posée se décrit entièrement **avant** d’écrire la moindre ligne de code. En entretien, énoncez ces cinq points à voix haute : c’est exactement ce que le recruteur attend.',
    },
    {
      list: [
        '**1. L’état** : que représente `dp[i]` (ou `dp[i][j]`) ? Une phrase précise du type « `dp[i]` = nombre minimal de pièces pour former le montant `i` ». C’est l’étape la plus difficile et la plus importante.',
        '**2. La transition** : comment calculer un état à partir d’états plus petits ? Par exemple `dp[i] = min(dp[i - c] + 1)` pour chaque pièce `c`.',
        '**3. Les cas de base** : les états qu’on connaît sans calcul (`dp[0] = 0`, chaîne vide, grille de taille 1).',
        '**4. L’ordre de calcul** : dans quel ordre remplir le tableau pour que chaque état dépende uniquement d’états déjà calculés (indices croissants, lignes puis colonnes, longueur d’intervalle croissante).',
        '**5. La réponse** : quelle case contient le résultat (`dp[n]`, `dp[m][n]`, le maximum de tout le tableau…).',
      ],
    },
    {
      table: [
        ['Problème', 'État', 'Transition', 'Réponse'],
        ['Escaliers (pas de 1 ou 2)', '`dp[i]` = façons d’atteindre la marche `i`', '`dp[i - 1] + dp[i - 2]`', '`dp[n]`'],
        ['House robber', '`dp[i]` = gain max avec les `i` premières maisons', '`max(dp[i - 1], dp[i - 2] + nums[i - 1])`', '`dp[n]`'],
        ['Coin change (min)', '`dp[a]` = pièces minimales pour le montant `a`', '`min(dp[a - c] + 1)`', '`dp[amount]`'],
        ['LCS', '`dp[i][j]` = LCS des préfixes `a[0..i)` et `b[0..j)`', 'égalité : `dp[i-1][j-1] + 1`, sinon max des deux voisins', '`dp[m][n]`'],
        ['Sac à dos 0/1', '`dp[w]` = valeur max avec une capacité `w`', '`max(dp[w], dp[w - poids] + valeur)`', '`dp[W]`'],
      ],
    },
    {
      mnemo: '« E-T-C-O-R » : État, Transition, Cas de base, Ordre, Réponse. Si vous ne pouvez pas écrire l’état en une phrase, vous n’êtes pas prêt à coder.',
      piege: 'Un état trop pauvre rend la transition impossible : pour house robber circulaire ou pour un problème avec « au plus k transactions », il faut ajouter une dimension (`dp[i][k]`, `dp[i][possède]`). Si la transition a besoin d’une information que l’état ne contient pas, enrichissez l’état.',
    },

    { h: 'Top-down mémoïsé ou bottom-up tabulé', id: 'dp-top-down-bottom-up' },
    {
      p: 'Il existe deux façons d’implémenter la même récurrence. En **top-down** (mémoïsation), on écrit la récursion naturelle et on met en cache chaque résultat : seuls les états réellement atteints sont calculés, et le code suit l’énoncé. En **bottom-up** (tabulation), on remplit un tableau dans l’ordre des dépendances avec des boucles : pas de pile d’appels, pas de risque de « Maximum call stack size exceeded », et l’optimisation mémoire devient possible.',
    },
    {
      title: 'Les deux versions de « grimper un escalier »',
      code: `// top-down : récursion + cache
function climbTopDown(n, memo = new Map()) {
  if (n <= 1) return 1
  if (memo.has(n)) return memo.get(n)
  const v = climbTopDown(n - 1, memo) + climbTopDown(n - 2, memo)
  memo.set(n, v)
  return v
}

// bottom-up : on remplit dp de 0 à n
function climbBottomUp(n) {
  const dp = new Array(n + 1).fill(0)
  dp[0] = 1
  dp[1] = 1
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2]
  return dp[n]
}

climbTopDown(10) // → 89
climbBottomUp(10) // → 89
climbBottomUp(45) // → 1836311903`,
      equiv: {
        python: `from functools import cache

@cache
def climb_top_down(n):
    if n <= 1:
        return 1
    return climb_top_down(n - 1) + climb_top_down(n - 2)

def climb_bottom_up(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    if n >= 1:
        dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
        java: `static long climbBottomUp(int n) {
    long[] dp = new long[n + 1];
    dp[0] = 1;
    if (n >= 1) dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
        rust: `fn climb_bottom_up(n: usize) -> u64 {
    let mut dp = vec![0u64; n + 1];
    dp[0] = 1;
    if n >= 1 {
        dp[1] = 1;
    }
    for i in 2..=n {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    dp[n]
}`,
      },
    },
    {
      p: 'Quand l’état a plusieurs dimensions, la clé du cache doit être **composite** et sans ambiguïté. Avec une `Map`, on utilise une chaîne avec séparateur (`i + "-" + j`) ou, plus rapide, un entier encodé `i * (m + 1) + j`. Un tableau 2D pré-rempli avec une valeur sentinelle (`-1`, `undefined`) est souvent le plus efficace.',
    },
    {
      title: 'Clé composite : chemins dans une grille m × n',
      code: `function uniquePaths(m, n) {
  const memo = new Map()
  function go(i, j) {
    if (i === 0 || j === 0) return 1
    const key = i + ',' + j // séparateur obligatoire
    if (memo.has(key)) return memo.get(key)
    const v = go(i - 1, j) + go(i, j - 1)
    memo.set(key, v)
    return v
  }
  return go(m - 1, n - 1)
}

uniquePaths(3, 7) // → 28
uniquePaths(10, 10) // → 48620`,
      equiv: {
        python: `from functools import cache

def unique_paths(m, n):
    @cache
    def go(i, j):
        if i == 0 or j == 0:
            return 1
        return go(i - 1, j) + go(i, j - 1)
    return go(m - 1, n - 1)`,
        java: `static int uniquePaths(int m, int n) {
    int[][] memo = new int[m][n];
    return go(m - 1, n - 1, memo);
}

static int go(int i, int j, int[][] memo) {
    if (i == 0 || j == 0) return 1;
    if (memo[i][j] != 0) return memo[i][j];
    return memo[i][j] = go(i - 1, j, memo) + go(i, j - 1, memo);
}`,
      },
    },
    {
      table: [
        ['Critère', 'Top-down (mémoïsation)', 'Bottom-up (tabulation)'],
        ['Écriture', 'suit la récurrence, rapide à écrire', 'demande de trouver l’ordre de calcul'],
        ['États calculés', 'seulement ceux atteints', 'tous les états du tableau'],
        ['Pile d’appels', 'profondeur O(n) : risque de débordement vers 10⁴', 'aucune récursion'],
        ['Optimisation mémoire', 'difficile', 'naturelle (rouleau de lignes, variables)'],
        ['Constante', 'plus lente (appels, Map)', 'plus rapide (tableaux typés possibles)'],
      ],
    },
    {
      mnemo: 'Top-down pour **trouver** la récurrence, bottom-up pour la **livrer**. On peut commencer par l’un et convertir vers l’autre en entretien.',
      piege: 'Une clé `i + j` (sans séparateur) confond `(1, 2)` et `(2, 1)` ; une clé `String(i) + j` confond `(1, 12)` et `(11, 2)`. Toujours un séparateur, ou un encodage entier injectif.',
    },

    { h: 'Optimisation mémoire', id: 'dp-memoire' },
    {
      p: 'Si `dp[i]` ne dépend que de `dp[i - 1]` et `dp[i - 2]`, inutile de garder tout le tableau : deux variables suffisent, et la mémoire passe de O(n) à O(1). En 2D, si la ligne `i` ne dépend que de la ligne `i - 1`, on garde **deux lignes** (le « rouleau ») ou même une seule ligne mise à jour en place, et la mémoire passe de O(m × n) à O(n).',
    },
    {
      title: 'Variables glissantes et ligne unique',
      code: `function climb(n) {
  let prev = 1 // dp[i - 2]
  let cur = 1 // dp[i - 1]
  for (let i = 2; i <= n; i++) {
    const next = prev + cur
    prev = cur
    cur = next
  }
  return cur
}

// chemins dans une grille avec une seule ligne : row[j] = au-dessus + à gauche
function uniquePathsRow(m, n) {
  const row = new Array(n).fill(1)
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) row[j] += row[j - 1]
  }
  return row[n - 1]
}

climb(30) // → 1346269
uniquePathsRow(3, 7) // → 28`,
      equiv: {
        python: `def climb(n):
    prev, cur = 1, 1
    for _ in range(2, n + 1):
        prev, cur = cur, prev + cur
    return cur

def unique_paths_row(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[n - 1]`,
        java: `static long climb(int n) {
    long prev = 1, cur = 1;
    for (int i = 2; i <= n; i++) {
        long next = prev + cur;
        prev = cur;
        cur = next;
    }
    return cur;
}`,
      },
    },
    {
      p: 'Le prix à payer : on perd la possibilité de **reconstruire** la solution (le chemin, les objets choisis), car les états intermédiaires sont écrasés. Si l’énoncé demande la solution elle-même, gardez la table complète ou un tableau de « parents ».',
    },
    {
      mnemo: '« De quoi dépend ma case ? » Si c’est seulement la ligne précédente, deux lignes suffisent ; si c’est seulement les deux cases précédentes, deux variables suffisent.',
      piege: 'En compressant une DP 2D sur une seule ligne, l’ordre de parcours de `j` change le sens : de gauche à droite, `row[j - 1]` contient déjà la valeur de la ligne courante ; de droite à gauche, il contient encore celle de la ligne précédente. C’est toute la différence entre sac à dos non borné et 0/1.',
    },

    { h: 'DP 1D : escaliers, house robber, rendu de monnaie, LIS', id: 'dp-1d' },
    {
      p: 'Les DP 1D ont un état indexé par une position ou un montant. **House robber** : on ne peut pas cambrioler deux maisons adjacentes ; à chaque maison, on choisit entre la sauter (`dp[i - 1]`) ou la prendre (`dp[i - 2] + nums[i]`). **Coin change** existe en deux versions : nombre minimal de pièces (min) et nombre de combinaisons (somme).',
    },
    {
      title: 'House robber et coin change (minimum de pièces)',
      code: `function rob(nums) {
  let skip = 0 // meilleur gain sans la maison précédente
  let take = 0 // meilleur gain jusqu’à la maison précédente
  for (const x of nums) {
    const best = Math.max(take, skip + x)
    skip = take
    take = best
  }
  return take
}

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}

rob([2, 7, 9, 3, 1]) // → 12
coinChange([1, 3, 4], 6) // → 2
coinChange([2], 3) // → -1`,
      equiv: {
        python: `def rob(nums):
    skip, take = 0, 0
    for x in nums:
        skip, take = take, max(take, skip + x)
    return take

def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return -1 if dp[amount] == float('inf') else dp[amount]`,
        java: `static int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    java.util.Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && dp[a - c] != Integer.MAX_VALUE && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
        }
    }
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
      },
    },
    {
      p: 'Pour **compter les combinaisons** (coin change II), l’ordre des boucles change le sens du résultat. Pièces à l’extérieur, montants à l’intérieur : chaque combinaison est comptée une seule fois (`1 + 2` et `2 + 1` sont la même). Montants à l’extérieur, pièces à l’intérieur : on compte les **arrangements** ordonnés (permutations).',
    },
    {
      title: 'Combinaisons ou arrangements : l’ordre des boucles',
      code: `function combinations(coins, amount) {
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1
  for (const c of coins) {
    for (let a = c; a <= amount; a++) dp[a] += dp[a - c]
  }
  return dp[amount]
}

function arrangements(coins, amount) {
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a) dp[a] += dp[a - c]
  }
  return dp[amount]
}

combinations([1, 2, 5], 5) // → 4
arrangements([1, 2, 5], 5) // → 9`,
      equiv: {
        python: `def combinations(coins, amount):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
        java: `static long combinations(int[] coins, int amount) {
    long[] dp = new long[amount + 1];
    dp[0] = 1;
    for (int c : coins)
        for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
    return dp[amount];
}`,
      },
    },
    {
      mnemo: '« Pièces dehors = combinaisons, montants dehors = permutations. » Pour un minimum, l’ordre des boucles n’a pas d’importance.',
      piege: 'Initialiser `dp` à `0` pour un minimum : `Math.min(0, …)` vaut toujours 0. Pour un minimum, on part de `Infinity` (et on teste `Infinity` à la fin pour renvoyer `-1`) ; pour un compte, de `0` avec `dp[0] = 1`.',
    },

    { p: '**Plus longue sous-séquence croissante (LIS).** C’est le dernier grand classique 1D, avec deux versions à connaître.' },
    {
      p: 'La version O(n²) est une DP classique : `dp[i]` = longueur de la plus longue sous-séquence strictement croissante **qui se termine en `i`** ; `dp[i] = 1 + max(dp[j])` pour tout `j < i` avec `nums[j] < nums[i]`. La réponse est le maximum du tableau, pas `dp[n - 1]`.',
    },
    {
      p: 'La version O(n log n) maintient un tableau `tails` où `tails[k]` est la **plus petite fin possible** d’une sous-séquence croissante de longueur `k + 1`. Ce tableau est toujours trié : pour chaque élément, on cherche par dichotomie la première fin `>= x` et on la remplace (ou on ajoute `x` à la fin). La longueur de `tails` est la réponse, mais `tails` lui-même n’est pas forcément une sous-séquence valide.',
    },
    {
      title: 'LIS en O(n²) puis en O(n log n)',
      code: `function lisQuadratic(nums) {
  if (nums.length === 0) return 0
  const dp = new Array(nums.length).fill(1)
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1)
    }
  }
  return Math.max(...dp)
}

function lis(nums) {
  const tails = []
  for (const x of nums) {
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < x) lo = mid + 1
      else hi = mid
    }
    tails[lo] = x // remplace ou ajoute à la fin
  }
  return tails.length
}

lisQuadratic([10, 9, 2, 5, 3, 7, 101, 18]) // → 4
lis([10, 9, 2, 5, 3, 7, 101, 18]) // → 4
lis([7, 7, 7]) // → 1`,
      equiv: {
        python: `from bisect import bisect_left

def lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
        java: `static int lis(int[] nums) {
    int[] tails = new int[nums.length];
    int size = 0;
    for (int x : nums) {
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;
        if (lo == size) size++;
    }
    return size;
}`,
        rust: `fn lis(nums: &[i32]) -> usize {
    let mut tails: Vec<i32> = Vec::new();
    for &x in nums {
        let i = tails.partition_point(|&t| t < x);
        if i == tails.len() {
            tails.push(x);
        } else {
            tails[i] = x;
        }
    }
    tails.len()
}`,
      },
    },
    {
      mnemo: '« La plus petite queue gagne » : garder la plus petite fin pour chaque longueur laisse le plus de place aux éléments suivants.',
      piege: 'Strictement croissante : on cherche la première fin `>= x` (`bisect_left`). Pour une sous-séquence **non décroissante**, il faut la première fin `> x` (`bisect_right`) ; se tromper fait accepter ou rejeter les doublons.',
    },

    { h: 'DP 2D : grilles, LCS et distance d’édition', id: 'dp-2d' },
    {
      p: 'Quand l’entrée est une grille, ou quand on compare **deux** séquences, l’état a deux indices. Pour deux chaînes `a` (longueur m) et `b` (longueur n), la convention la plus sûre est `dp[i][j]` = réponse pour les **préfixes** `a.slice(0, i)` et `b.slice(0, j)`, avec un tableau de taille `(m + 1) × (n + 1)` : la ligne 0 et la colonne 0 représentent la chaîne vide et portent les cas de base.',
    },
    {
      list: [
        '**Plus longue sous-séquence commune (LCS)** : si `a[i - 1] === b[j - 1]`, `dp[i][j] = dp[i - 1][j - 1] + 1` ; sinon `max(dp[i - 1][j], dp[i][j - 1])`.',
        '**Distance d’édition (Levenshtein)** : nombre minimal d’insertions, suppressions et remplacements. Si les caractères sont égaux, `dp[i - 1][j - 1]` ; sinon `1 + min(suppression dp[i - 1][j], insertion dp[i][j - 1], remplacement dp[i - 1][j - 1])`. Cas de base : `dp[i][0] = i`, `dp[0][j] = j`.',
        '**Chemin de coût minimal dans une grille** : `dp[i][j] = grid[i][j] + min(dp[i - 1][j], dp[i][j - 1])`, avec la première ligne et la première colonne en sommes cumulées.',
      ],
    },
    {
      title: 'LCS et distance d’édition',
      code: `function lcs(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}

function editDistance(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1).fill(0)
    row[0] = i
    return row
  })
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1]
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

lcs('abcde', 'ace') // → 3
lcs('abc', 'def') // → 0
editDistance('horse', 'ros') // → 3
editDistance('intention', 'execution') // → 5`,
      equiv: {
        python: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
        java: `static int editDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
        }
    }
    return dp[m][n];
}`,
        rust: `fn lcs(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let (m, n) = (a.len(), b.len());
    let mut dp = vec![vec![0usize; n + 1]; m + 1];
    for i in 1..=m {
        for j in 1..=n {
            dp[i][j] = if a[i - 1] == b[j - 1] {
                dp[i - 1][j - 1] + 1
            } else {
                dp[i - 1][j].max(dp[i][j - 1])
            };
        }
    }
    dp[m][n]
}`,
      },
    },
    {
      mnemo: '« Un de plus pour la chaîne vide » : tableau `(m + 1) × (n + 1)`, et `a[i - 1]` désigne le i-ième caractère. Diagonale = on consomme les deux, haut = on consomme `a`, gauche = on consomme `b`.',
      piege: '`Array(m).fill(Array(n).fill(0))` remplit toutes les lignes avec **le même** tableau : modifier `dp[1][2]` modifie toutes les lignes. Utilisez `Array.from({ length: m }, () => new Array(n).fill(0))`.',
    },

    { h: 'Sac à dos 0/1 et non borné', id: 'dp-sac-a-dos' },
    {
      p: 'Le **sac à dos 0/1** : des objets ayant un poids et une valeur, une capacité `W` ; chaque objet est pris **au plus une fois** ; maximiser la valeur. Version 2D : `dp[i][w]` = valeur max avec les `i` premiers objets et la capacité `w`, `dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - poids] + valeur)`. En une seule ligne, il faut parcourir les capacités **à rebours** (de `W` vers `poids`) pour que `dp[w - poids]` désigne encore l’état **sans** l’objet courant.',
    },
    {
      p: 'Le **sac à dos non borné** (chaque objet en quantité illimitée) utilise exactement la même ligne, mais parcourue **à l’endroit** : `dp[w - poids]` contient alors déjà l’objet courant, ce qui autorise à le reprendre. Partition en deux sous-ensembles de même somme, « target sum » et « subset sum » sont des sacs à dos 0/1 déguisés ; coin change est un sac à dos non borné.',
    },
    {
      title: 'Le sens de parcours fait toute la différence',
      code: `function knapsack01(weights, values, W) {
  const dp = new Array(W + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let w = W; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }
  return dp[W]
}

function knapsackUnbounded(weights, values, W) {
  const dp = new Array(W + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let w = weights[i]; w <= W; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }
  return dp[W]
}

knapsack01([1, 3, 4], [15, 20, 30], 4) // → 35
knapsackUnbounded([1, 3, 4], [15, 20, 30], 4) // → 60`,
      equiv: {
        python: `def knapsack01(weights, values, W):
    dp = [0] * (W + 1)
    for wt, val in zip(weights, values):
        for w in range(W, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]`,
        java: `static int knapsack01(int[] weights, int[] values, int W) {
    int[] dp = new int[W + 1];
    for (int i = 0; i < weights.length; i++)
        for (int w = W; w >= weights[i]; w--)
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    return dp[W];
}`,
        rust: `fn knapsack01(weights: &[usize], values: &[u64], cap: usize) -> u64 {
    let mut dp = vec![0u64; cap + 1];
    for (i, &wt) in weights.iter().enumerate() {
        for w in (wt..=cap).rev() {
            dp[w] = dp[w].max(dp[w - wt] + values[i]);
        }
    }
    dp[cap]
}`,
      },
    },
    {
      p: 'Avec la capacité 4, le 0/1 prend les objets de poids 1 et 3 (15 + 20 = 35) ; le non borné prend quatre fois l’objet de poids 1 (4 × 15 = 60). Le sac à dos est **pseudo-polynomial** : O(n × W) dépend de la **valeur** de `W`, pas de sa taille en bits ; avec `W = 10⁹`, cette DP est inutilisable.',
    },
    {
      mnemo: '« 0/1 : à rebours, une seule fois. Non borné : à l’endroit, autant de fois qu’on veut. »',
      piege: 'Parcourir le 0/1 à l’endroit sur une seule ligne réutilise l’objet courant plusieurs fois : on obtient silencieusement la réponse du sac à dos non borné (60 au lieu de 35 ci-dessus).',
    },

    { h: 'DP sur intervalles et sur chaînes : palindromes', id: 'dp-intervalles' },
    {
      p: 'Dans une **DP sur intervalles**, l’état est un sous-tableau ou une sous-chaîne `[i, j]`, et on le calcule à partir d’intervalles plus courts. L’ordre de calcul est donc par **longueur croissante** (ou `i` décroissant et `j` croissant). Exemples : plus longue sous-séquence palindromique, nombre de sous-chaînes palindromiques, découpage minimal en palindromes, burst balloons, multiplication de matrices en chaîne.',
    },
    {
      title: 'Plus longue sous-séquence palindromique',
      code: `function longestPalindromeSubseq(s) {
  const n = s.length
  const dp = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1])
    }
  }
  return n === 0 ? 0 : dp[0][n - 1]
}

longestPalindromeSubseq('bbbab') // → 4
longestPalindromeSubseq('cbbd') // → 2`,
      equiv: {
        python: `def longest_palindrome_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1] if n else 0`,
        java: `static int longestPalindromeSubseq(String s) {
    int n = s.length();
    if (n == 0) return 0;
    int[][] dp = new int[n][n];
    for (int i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < n; j++) {
            if (s.charAt(i) == s.charAt(j)) dp[i][j] = dp[i + 1][j - 1] + 2;
            else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
    }
    return dp[0][n - 1];
}`,
      },
    },
    {
      p: 'Pourquoi `i` décroissant ? `dp[i][j]` dépend de `dp[i + 1][…]` (ligne du dessous) et de `dp[i][j - 1]` (case de gauche) : en remplissant les lignes de bas en haut et chaque ligne de gauche à droite, ces cases sont prêtes. Pour la plus longue **sous-chaîne** palindromique (contiguë), l’expansion autour du centre (thème Chaînes) fait mieux : O(n²) en temps mais O(1) en mémoire.',
    },
    {
      mnemo: '« Intervalle : du plus court au plus long. » Si `dp[i][j]` utilise `dp[i + 1][…]`, la boucle sur `i` descend.',
      piege: 'Remplir une DP d’intervalles ligne par ligne avec `i` croissant : `dp[i + 1][j - 1]` n’est pas encore calculé et vaut 0, d’où des résultats faux sans aucune erreur.',
    },

    { h: 'Reconstruire la solution et word break', id: 'dp-reconstruction' },
    {
      p: 'La table DP donne la **valeur** optimale ; pour obtenir la solution elle-même (la sous-séquence commune, la liste des pièces, les mots), on remonte la table depuis la case réponse en refaisant le choix qui a produit chaque valeur, ou on mémorise à chaque état le choix gagnant (tableau `parent`). Cela impose de garder la table complète.',
    },
    {
      title: 'Retrouver une LCS en remontant la table',
      code: `function lcsString(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const out = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.push(a[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--
    else j--
  }
  return out.reverse().join('')
}

lcsString('ABCBDAB', 'BDCABA') // → 'BCBA'`,
      equiv: {
        python: `def lcs_string(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(dp[i - 1][j], dp[i][j - 1])
    out, i, j = [], m, n
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return ''.join(reversed(out))`,
        java: `// même remontée avec un StringBuilder, puis sb.reverse().toString()`,
      },
    },
    {
      p: '**Word break** : `dp[i]` vaut `true` si le préfixe `s.slice(0, i)` peut être découpé en mots du dictionnaire. `dp[0] = true` (préfixe vide), et `dp[i]` est vrai s’il existe `j < i` tel que `dp[j]` est vrai et `s.slice(j, i)` est un mot. Mettre le dictionnaire dans un `Set` et limiter `i - j` à la longueur du plus long mot accélère beaucoup.',
    },
    {
      title: 'Word break avec Set et longueur maximale',
      code: `function wordBreak(s, words) {
  const dict = new Set(words)
  const maxLen = Math.max(0, ...words.map((w) => w.length))
  const dp = new Array(s.length + 1).fill(false)
  dp[0] = true
  for (let i = 1; i <= s.length; i++) {
    for (let j = Math.max(0, i - maxLen); j < i && !dp[i]; j++) {
      if (dp[j] && dict.has(s.slice(j, i))) dp[i] = true
    }
  }
  return dp[s.length]
}

wordBreak('leetcode', ['leet', 'code']) // → true
wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']) // → false`,
      equiv: {
        python: `def word_break(s, words):
    d = set(words)
    max_len = max((len(w) for w in words), default=0)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if dp[j] and s[j:i] in d:
                dp[i] = True
                break
    return dp[len(s)]`,
        java: `static boolean wordBreak(String s, java.util.List<String> words) {
    java.util.Set<String> dict = new java.util.HashSet<>(words);
    int maxLen = 0;
    for (String w : words) maxLen = Math.max(maxLen, w.length());
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = Math.max(0, i - maxLen); j < i && !dp[i]; j++)
            if (dp[j] && dict.contains(s.substring(j, i))) dp[i] = true;
    return dp[s.length()];
}`,
      },
    },
    {
      mnemo: '« La table dit combien, la remontée dit comment. » Pour reconstruire, on refait à l’envers le choix qui a donné chaque valeur.',
      piege: 'Optimiser la mémoire (deux lignes) puis vouloir reconstruire la solution : les états nécessaires ont été écrasés. Décidez dès le départ si l’énoncé demande la valeur ou la solution.',
    },

    { h: 'Table des complexités', id: 'dp-complexites' },
    {
      p: 'La complexité d’une DP se calcule toujours de la même façon : **nombre d’états × coût d’une transition**. La mémoire est le nombre d’états stockés (réductible si l’on ne garde que les dépendances).',
    },
    {
      table: [
        ['Problème', 'États', 'Transition', 'Temps', 'Mémoire optimisée'],
        ['Escaliers, Fibonacci, house robber', 'n', 'O(1)', 'O(n)', 'O(1)'],
        ['Coin change (min ou combinaisons)', 'amount', 'O(k) pièces', 'O(k × amount)', 'O(amount)'],
        ['LIS', 'n', 'O(n) ou dichotomie O(log n)', 'O(n²) ou O(n log n)', 'O(n)'],
        ['Chemins dans une grille', 'm × n', 'O(1)', 'O(m × n)', 'O(n)'],
        ['LCS, distance d’édition', 'm × n', 'O(1)', 'O(m × n)', 'O(min(m, n))'],
        ['Sac à dos 0/1 ou non borné', 'n × W', 'O(1)', 'O(n × W)', 'O(W)'],
        ['Sous-séquence palindromique', 'n²', 'O(1)', 'O(n²)', 'O(n)'],
        ['Word break', 'n', 'O(L) découpes de longueur ≤ L, slice O(L)', 'O(n × L²)', 'O(n)'],
        ['Burst balloons, matrices en chaîne', 'n²', 'O(n)', 'O(n³)', 'O(n²)'],
      ],
    },
    {
      mnemo: '« Temps = états × transition. » Comptez les dimensions de l’état et la boucle de la transition, la complexité tombe toute seule.',
      piege: 'Oublier le coût caché d’une transition : `s.slice(j, i)` ou `Math.max(...dp)` dans une boucle ne sont pas O(1). Un word break naïf est O(n³) à cause des `slice`, pas O(n²).',
    },
  ],
  mnemo: 'E-T-C-O-R : État, Transition, Cas de base, Ordre de calcul, Réponse. Top-down pour trouver la récurrence, bottom-up pour la livrer, puis on ne garde que ce dont la case dépend.',
  piege: 'Les trois erreurs qui coûtent un entretien : une clé de mémo ambiguë (`i + j`), des lignes partagées par `Array(n).fill(Array(m).fill(0))`, et un sac à dos 0/1 parcouru à l’endroit sur une seule ligne.',
}

const dpKatas: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-escaliers',
    title: 'Grimper un escalier (modulo 10⁹ + 7)',
    difficulty: 'facile',
    theme: 'dp',
    pattern: 'DP 1D',
    statement: `Un escalier compte \`n\` marches. À chaque pas, vous montez **1 ou 2** marches. Écrivez \`climbStairs(n)\` qui renvoie le **nombre de façons distinctes** d’atteindre le sommet, **modulo 1 000 000 007** (le nombre exact dépasse vite \`Number.MAX_SAFE_INTEGER\`).

Contraintes : \`0 <= n <= 100 000\`. Par convention, \`climbStairs(0)\` vaut 1 (une seule façon : ne rien faire).

Exemples :

- \`climbStairs(2)\` donne \`2\` (1 + 1 ou 2) ;
- \`climbStairs(3)\` donne \`3\` (1 + 1 + 1, 1 + 2, 2 + 1) ;
- \`climbStairs(5)\` donne \`8\`.

Une solution récursive naïve est exponentielle, et même mémoïsée elle risque de faire déborder la pile pour \`n = 100 000\` : visez une version itérative en O(n) temps et O(1) mémoire.`,
    starter: `function climbStairs(n) {
  // TODO : nombre de façons modulo 1 000 000 007
  return n
}`,
    solution: `function climbStairs(n) {
  const MOD = 1000000007
  let prev = 1 // façons d'atteindre la marche i - 2
  let cur = 1 // façons d'atteindre la marche i - 1
  for (let i = 2; i <= n; i++) {
    const next = (prev + cur) % MOD // la somme reste < 2^31 : pas de perte de précision
    prev = cur
    cur = next
  }
  return cur
}`,
    solutionEquiv: {
      python: `def climb_stairs(n):
    MOD = 1_000_000_007
    prev, cur = 1, 1
    for _ in range(2, n + 1):
        prev, cur = cur, (prev + cur) % MOD
    return cur`,
      java: `static int climbStairs(int n) {
    final int MOD = 1_000_000_007;
    int prev = 1, cur = 1;
    for (int i = 2; i <= n; i++) {
        int next = (prev + cur) % MOD; // prev + cur < 2^31 : pas de débordement d'int
        prev = cur;
        cur = next;
    }
    return cur;
}`,
      rust: `fn climb_stairs(n: usize) -> u64 {
    const MOD: u64 = 1_000_000_007;
    let (mut prev, mut cur) = (1u64, 1u64);
    for _ in 2..=n {
        let next = (prev + cur) % MOD;
        prev = cur;
        cur = next;
    }
    cur
}`,
      php: `function climbStairs(int $n): int {
    $MOD = 1000000007;
    $prev = 1;
    $cur = 1;
    for ($i = 2; $i <= $n; $i++) {
        $next = ($prev + $cur) % $MOD;
        $prev = $cur;
        $cur = $next;
    }
    return $cur;
}`,
    },
    tests: [
      { name: 'petits cas', code: `assertEqual(climbStairs(1), 1)
assertEqual(climbStairs(2), 2)
assertEqual(climbStairs(3), 3)
assertEqual(climbStairs(5), 8)` },
      { name: 'n = 0', code: `assertEqual(climbStairs(0), 1)` },
      { name: 'avant le modulo', code: `assertEqual(climbStairs(30), 1346269)
assertEqual(climbStairs(44), 1134903170 % 1000000007)` },
      { name: 'le modulo est appliqué', code: `assertEqual(climbStairs(100), 782204094)` },
      { name: 'grande entrée : n = 100 000', code: `const t0 = performance.now()
const r = climbStairs(100000)
const elapsed = performance.now() - t0
assertEqual(r, 967618232)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Pour arriver sur la marche `i`, le dernier pas venait de la marche `i - 1` ou de la marche `i - 2`. Combien de façons en tout ?',
      '`ways(i) = ways(i - 1) + ways(i - 2)`, avec `ways(0) = ways(1) = 1` : c’est Fibonacci décalé.',
      'Deux variables suffisent ; appliquez `% 1000000007` à chaque addition pour rester dans les entiers exacts.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire avec deux variables.

**Points à évoquer** :

- la récursion naïve fait environ φⁿ appels (φ ≈ 1,618) : impraticable dès n = 50 ;
- la version mémoïsée est O(n) mais sa profondeur de récursion est n : vers 10 000 niveaux, JavaScript lève « Maximum call stack size exceeded » ;
- pourquoi le modulo ? \`climbStairs(79)\` dépasse déjà 2^53 : sans modulo (ou BigInt), les additions perdent des chiffres ;
- en Java, \`prev + cur\` reste inférieur à 2 × (10⁹ + 7) < 2^31 - 1, donc un \`int\` suffit ; pour un produit, il faudrait un \`long\` ;
- variantes : pas de 1, 2 ou 3 (somme de trois termes), pas pris dans un ensemble donné, coût par marche (min cost climbing stairs) ;
- suivi possible : O(log n) par exponentiation rapide de la matrice [[1, 1], [1, 0]].`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-house-robber-circulaire',
    title: 'Cambrioleur sur une rue circulaire',
    difficulty: 'moyen',
    theme: 'dp',
    pattern: 'DP 1D (prendre ou sauter)',
    statement: `Des maisons sont disposées **en cercle** : la première et la dernière sont voisines. \`nums[i]\` est la somme d’argent dans la maison \`i\`. Vous ne pouvez pas cambrioler deux maisons **adjacentes** (l’alarme se déclenche). Écrivez \`robCircular(nums)\` qui renvoie le montant maximal que vous pouvez voler.

Contraintes : \`0 <= nums.length <= 10 000\`, \`0 <= nums[i] <= 1000\`. Un tableau vide donne \`0\`.

Exemples :

- \`robCircular([2, 3, 2])\` donne \`3\` (on ne peut pas prendre les deux 2, ils sont voisins par le cercle) ;
- \`robCircular([1, 2, 3, 1])\` donne \`4\` (maisons 0 et 2) ;
- \`robCircular([5])\` donne \`5\`.`,
    starter: `function robCircular(nums) {
  // TODO : maximum sans deux maisons adjacentes, la première et la dernière étant voisines
  let total = 0
  for (let i = 0; i < nums.length; i += 2) total += nums[i]
  return total
}`,
    solution: `// house robber classique sur nums[lo..hi]
function robLine(nums, lo, hi) {
  let skip = 0
  let take = 0
  for (let i = lo; i <= hi; i++) {
    const best = Math.max(take, skip + nums[i])
    skip = take
    take = best
  }
  return take
}

function robCircular(nums) {
  const n = nums.length
  if (n === 0) return 0
  if (n === 1) return nums[0]
  // soit on exclut la dernière maison, soit on exclut la première
  return Math.max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1))
}`,
    solutionEquiv: {
      python: `def rob_line(nums, lo, hi):
    skip, take = 0, 0
    for i in range(lo, hi + 1):
        skip, take = take, max(take, skip + nums[i])
    return take

def rob_circular(nums):
    n = len(nums)
    if n == 0:
        return 0
    if n == 1:
        return nums[0]
    return max(rob_line(nums, 0, n - 2), rob_line(nums, 1, n - 1))`,
      java: `static int robLine(int[] nums, int lo, int hi) {
    int skip = 0, take = 0;
    for (int i = lo; i <= hi; i++) {
        int best = Math.max(take, skip + nums[i]);
        skip = take;
        take = best;
    }
    return take;
}

static int robCircular(int[] nums) {
    int n = nums.length;
    if (n == 0) return 0;
    if (n == 1) return nums[0];
    return Math.max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1));
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(robCircular([2, 3, 2]), 3)
assertEqual(robCircular([1, 2, 3, 1]), 4)
assertEqual(robCircular([1, 2, 3]), 3)` },
      { name: 'vide, une ou deux maisons', code: `assertEqual(robCircular([]), 0)
assertEqual(robCircular([5]), 5)
assertEqual(robCircular([4, 9]), 9)` },
      { name: 'première et dernière voisines', code: `assertEqual(robCircular([200, 3, 140, 20, 10]), 340)
assertEqual(robCircular([5, 1, 1, 5]), 6)` },
      { name: 'il faut parfois sauter deux maisons', code: `assertEqual(robCircular([2, 1, 1, 2, 1, 1]), 4)
assertEqual(robCircular([1, 3, 1, 3, 100]), 103)` },
      { name: 'zéros', code: `assertEqual(robCircular([0, 0, 0]), 0)
assertEqual(robCircular([0, 7, 0, 7]), 14)` },
    ],
    hints: [
      'Sans le cercle, c’est house robber : à chaque maison, on la saute (`dp[i - 1]`) ou on la prend (`dp[i - 2] + nums[i]`).',
      'Le cercle n’interdit qu’une chose : prendre à la fois la première et la dernière maison. Au moins l’une des deux est donc exclue.',
      'Lancez house robber linéaire sur `nums[0..n-2]` puis sur `nums[1..n-1]`, et gardez le maximum. Attention au cas `n = 1`.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire (deux passes de house robber avec deux variables, sans copier le tableau grâce aux bornes \`lo\` et \`hi\`).

**Points à évoquer** :

- l’idée clé est de **casser le cercle** en deux problèmes linéaires ; c’est une technique générale (problèmes circulaires → deux cas) ;
- utiliser \`slice\` pour créer les deux sous-tableaux est correct mais coûte O(n) mémoire supplémentaire ;
- \`n = 1\` est un piège : les deux intervalles seraient vides et la réponse 0 serait fausse ;
- variantes : house robber III (sur un arbre : DP qui renvoie la paire [avec la racine, sans la racine]), delete and earn (se ramène à house robber sur les valeurs).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-coin-change',
    title: 'Rendu de monnaie : nombre minimal de pièces',
    difficulty: 'moyen',
    theme: 'dp',
    pattern: 'sac à dos non borné (min)',
    statement: `Écrivez \`coinChange(coins, amount)\` qui renvoie le **nombre minimal de pièces** nécessaires pour former exactement \`amount\`, chaque valeur de pièce étant disponible en quantité illimitée. Renvoyez \`-1\` si c’est impossible.

Contraintes : \`1 <= coins.length <= 12\`, \`1 <= coins[i] <= 10 000\`, \`0 <= amount <= 10 000\`.

Exemples :

- \`coinChange([1, 2, 5], 11)\` donne \`3\` (5 + 5 + 1) ;
- \`coinChange([2], 3)\` donne \`-1\` ;
- \`coinChange([1], 0)\` donne \`0\` ;
- \`coinChange([1, 3, 4], 6)\` donne \`2\` (3 + 3 : l’algorithme glouton, qui donnerait 4 + 1 + 1, se trompe).`,
    starter: `function coinChange(coins, amount) {
  // TODO : version glouton... qui ne marche pas toujours
  const sorted = [...coins].sort((a, b) => b - a)
  let count = 0
  for (const c of sorted) {
    while (amount >= c) {
      amount -= c
      count++
    }
  }
  return amount === 0 ? count : -1
}`,
    solution: `function coinChange(coins, amount) {
  // dp[a] = nombre minimal de pièces pour former a
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`,
    solutionEquiv: {
      python: `def coin_change(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return -1 if dp[amount] == INF else dp[amount]`,
      java: `static int coinChange(int[] coins, int amount) {
    int INF = amount + 1; // plus grand que toute réponse possible, sans risque de débordement
    int[] dp = new int[amount + 1];
    java.util.Arrays.fill(dp, INF);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    return dp[amount] == INF ? -1 : dp[amount];
}`,
      rust: `fn coin_change(coins: &[usize], amount: usize) -> i32 {
    let inf = amount + 1;
    let mut dp = vec![inf; amount + 1];
    dp[0] = 0;
    for a in 1..=amount {
        for &c in coins {
            if c <= a && dp[a - c] + 1 < dp[a] {
                dp[a] = dp[a - c] + 1;
            }
        }
    }
    if dp[amount] == inf { -1 } else { dp[amount] as i32 }
}`,
      php: `function coinChange(array $coins, int $amount): int {
    $INF = $amount + 1;
    $dp = array_fill(0, $amount + 1, $INF);
    $dp[0] = 0;
    for ($a = 1; $a <= $amount; $a++) {
        foreach ($coins as $c) {
            if ($c <= $a && $dp[$a - $c] + 1 < $dp[$a]) {
                $dp[$a] = $dp[$a - $c] + 1;
            }
        }
    }
    return $dp[$amount] === $INF ? -1 : $dp[$amount];
}`,
    },
    tests: [
      { name: 'exemple classique', code: `assertEqual(coinChange([1, 2, 5], 11), 3)` },
      { name: 'impossible', code: `assertEqual(coinChange([2], 3), -1)
assertEqual(coinChange([5, 10], 3), -1)` },
      { name: 'montant nul', code: `assertEqual(coinChange([1], 0), 0)
assertEqual(coinChange([7], 0), 0)` },
      { name: 'le glouton se trompe', code: `assertEqual(coinChange([1, 3, 4], 6), 2)
assertEqual(coinChange([186, 419, 83, 408], 6249), 20)` },
      { name: 'glouton bloqué alors qu’une solution existe', code: `assertEqual(coinChange([5, 3], 9), 3)` },
      { name: 'grande entrée : montant 10 000', code: `const t0 = performance.now()
const r = coinChange([7, 13, 29, 31], 10000)
const elapsed = performance.now() - t0
assertEqual(r, 324)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Le glouton (toujours la plus grosse pièce) échoue sur `[1, 3, 4]` et 6. Il faut essayer toutes les pièces pour la « dernière » pièce utilisée.',
      'État : `dp[a]` = nombre minimal de pièces pour former `a`. Transition : `dp[a] = min(dp[a - c] + 1)` pour chaque pièce `c <= a`.',
      'Initialisez à `Infinity` avec `dp[0] = 0`, remplissez de 1 à `amount`, et renvoyez `-1` si `dp[amount]` est resté infini.',
    ],
    discussion: `**Complexité** : O(k × amount) en temps (k pièces), O(amount) en mémoire.

**Points à évoquer** :

- le glouton n’est optimal que pour des systèmes de pièces « canoniques » (comme l’euro) ; un contre-exemple suffit à l’écarter ;
- la version récursive naïve explore toutes les combinaisons : exponentielle ; mémoïsée, elle est O(k × amount) mais sa profondeur peut atteindre \`amount\` (10 000 appels imbriqués, à la limite de la pile) ;
- alternative : BFS depuis 0 où chaque arête ajoute une pièce ; le premier niveau qui atteint \`amount\` est la réponse (même complexité) ;
- en Java, initialiser avec \`Integer.MAX_VALUE\` puis faire \`+ 1\` déborde : d’où la sentinelle \`amount + 1\` ;
- variantes : coin change II (nombre de combinaisons), reconstruire la liste des pièces (tableau du dernier choix), perfect squares (pièces = carrés).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-decodage',
    title: 'Décoder un message chiffré',
    difficulty: 'moyen',
    theme: 'dp',
    pattern: 'DP 1D sur une chaîne',
    statement: `Un message composé de lettres A à Z est encodé avec \`A → 1\`, \`B → 2\`, …, \`Z → 26\`, sans séparateur. Écrivez \`numDecodings(s)\` qui renvoie le **nombre de façons** de décoder la chaîne de chiffres \`s\`, **modulo 1 000 000 007**.

Règles : un code est \`1\` à \`9\` (un chiffre) ou \`10\` à \`26\` (deux chiffres). \`0\` seul n’est pas un code, et un code ne commence jamais par \`0\` (\`06\` est invalide).

Contraintes : \`1 <= s.length <= 100 000\`, \`s\` ne contient que des chiffres.

Exemples :

- \`numDecodings('12')\` donne \`2\` (\`AB\` ou \`L\`) ;
- \`numDecodings('226')\` donne \`3\` (\`BZ\`, \`VF\`, \`BBF\`) ;
- \`numDecodings('06')\` donne \`0\` ;
- \`numDecodings('10')\` donne \`1\` (\`J\`).`,
    starter: `function numDecodings(s) {
  // TODO : compter les décodages
  return s.length > 0 ? 1 : 0
}`,
    solution: `function numDecodings(s) {
  const MOD = 1000000007
  // prev2 = dp[i - 2], prev1 = dp[i - 1] ; dp[0] = 1 (préfixe vide)
  let prev2 = 0
  let prev1 = 1
  for (let i = 1; i <= s.length; i++) {
    let cur = 0
    if (s[i - 1] !== '0') cur = prev1 // un chiffre seul
    if (i >= 2) {
      const two = (s.charCodeAt(i - 2) - 48) * 10 + (s.charCodeAt(i - 1) - 48)
      if (two >= 10 && two <= 26) cur = (cur + prev2) % MOD // deux chiffres
    }
    prev2 = prev1
    prev1 = cur
  }
  return prev1
}`,
    solutionEquiv: {
      python: `def num_decodings(s):
    MOD = 1_000_000_007
    prev2, prev1 = 0, 1
    for i in range(1, len(s) + 1):
        cur = prev1 if s[i - 1] != '0' else 0
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            cur = (cur + prev2) % MOD
        prev2, prev1 = prev1, cur
    return prev1`,
      java: `static int numDecodings(String s) {
    final int MOD = 1_000_000_007;
    int prev2 = 0, prev1 = 1;
    for (int i = 1; i <= s.length(); i++) {
        int cur = s.charAt(i - 1) != '0' ? prev1 : 0;
        if (i >= 2) {
            int two = (s.charAt(i - 2) - '0') * 10 + (s.charAt(i - 1) - '0');
            if (two >= 10 && two <= 26) cur = (cur + prev2) % MOD;
        }
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(numDecodings('12'), 2)
assertEqual(numDecodings('226'), 3)
assertEqual(numDecodings('11106'), 2)` },
      { name: 'zéros invalides', code: `assertEqual(numDecodings('0'), 0)
assertEqual(numDecodings('06'), 0)
assertEqual(numDecodings('100'), 0)
assertEqual(numDecodings('30'), 0)` },
      { name: 'zéros valides', code: `assertEqual(numDecodings('10'), 1)
assertEqual(numDecodings('2101'), 1)` },
      { name: 'limite 26 / 27', code: `assertEqual(numDecodings('26'), 2)
assertEqual(numDecodings('27'), 1)` },
      { name: 'grande entrée avec modulo', code: `const t0 = performance.now()
const r = numDecodings('226'.repeat(1000))
const elapsed = performance.now() - t0
assertEqual(r, 56888193)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Le dernier code utilisé couvre soit le dernier chiffre, soit les deux derniers. C’est la structure de l’escalier, avec des conditions.',
      '`dp[i]` = nombre de décodages du préfixe de longueur `i`. On ajoute `dp[i - 1]` si `s[i - 1]` n’est pas le chiffre zéro, et `dp[i - 2]` si les deux derniers chiffres forment un nombre entre 10 et 26.',
      '`dp[0] = 1` (le préfixe vide se décode d’une façon). Deux variables suffisent.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Points à évoquer** :

- les zéros sont toute la difficulté : \`0\` ne peut être que la seconde moitié de \`10\` ou \`20\` ; dès qu’un état vaut 0, la suite le propage ;
- tester « entre 10 et 26 » élimine d’un coup les paires commençant par 0 (\`06\` vaut 6) ;
- la récursion naïve est exponentielle (deux branches par position) ;
- variante difficile : decode ways II avec le joker \`*\` (9 chiffres possibles), même DP avec des multiplicateurs.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-lis',
    title: 'Plus longue sous-séquence strictement croissante',
    difficulty: 'difficile',
    theme: 'dp',
    pattern: 'LIS + dichotomie',
    statement: `Écrivez \`lengthOfLIS(nums)\` qui renvoie la longueur de la plus longue **sous-séquence strictement croissante** de \`nums\`. Une sous-séquence conserve l’ordre des éléments mais n’est pas forcément contiguë.

Contraintes : \`0 <= nums.length <= 100 000\`, les valeurs sont des entiers (éventuellement négatifs). La version O(n²) est trop lente pour la plus grande entrée : visez **O(n log n)**.

Exemples :

- \`lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])\` donne \`4\` (par exemple \`[2, 3, 7, 18]\`) ;
- \`lengthOfLIS([0, 1, 0, 3, 2, 3])\` donne \`4\` ;
- \`lengthOfLIS([7, 7, 7, 7])\` donne \`1\` (strictement croissante).`,
    starter: `function lengthOfLIS(nums) {
  // TODO : plus longue sous-séquence strictement croissante
  // (ceci compte la plus longue suite croissante CONTIGUË : ce n'est pas la même chose)
  let best = nums.length > 0 ? 1 : 0
  let run = 1
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] > nums[i - 1] ? run + 1 : 1
    best = Math.max(best, run)
  }
  return best
}`,
    solution: `function lengthOfLIS(nums) {
  // tails[k] = plus petite fin possible d'une sous-séquence croissante de longueur k + 1
  const tails = []
  for (const x of nums) {
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < x) lo = mid + 1
      else hi = mid
    }
    tails[lo] = x // première fin >= x remplacée, ou ajout à la fin
  }
  return tails.length
}`,
    solutionEquiv: {
      python: `from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
      java: `static int lengthOfLIS(int[] nums) {
    int[] tails = new int[nums.length];
    int size = 0;
    for (int x : nums) {
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;
        if (lo == size) size++;
    }
    return size;
}`,
      rust: `fn length_of_lis(nums: &[i32]) -> usize {
    let mut tails: Vec<i32> = Vec::new();
    for &x in nums {
        let i = tails.partition_point(|&t| t < x);
        if i == tails.len() {
            tails.push(x);
        } else {
            tails[i] = x;
        }
    }
    tails.len()
}`,
      php: `function lengthOfLIS(array $nums): int {
    $tails = [];
    foreach ($nums as $x) {
        $lo = 0;
        $hi = count($tails);
        while ($lo < $hi) {
            $mid = intdiv($lo + $hi, 2);
            if ($tails[$mid] < $x) $lo = $mid + 1;
            else $hi = $mid;
        }
        $tails[$lo] = $x;
    }
    return count($tails);
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]), 4)
assertEqual(lengthOfLIS([0, 1, 0, 3, 2, 3]), 4)` },
      { name: 'vide et un élément', code: `assertEqual(lengthOfLIS([]), 0)
assertEqual(lengthOfLIS([42]), 1)` },
      { name: 'doublons : strictement croissante', code: `assertEqual(lengthOfLIS([7, 7, 7, 7]), 1)
assertEqual(lengthOfLIS([1, 3, 3, 3, 4]), 3)` },
      { name: 'non contiguë et négatifs', code: `assertEqual(lengthOfLIS([3, -1, 4, -5, 5, 0, 9]), 4)
assertEqual(lengthOfLIS([5, 4, 3, 2, 1]), 1)` },
      { name: 'grande entrée : n = 100 000', code: `const nums = []
let x = 12345
for (let i = 0; i < 100000; i++) {
  x = (x * 48271) % 2147483647
  nums.push(x % 100000)
}
const t0 = performance.now()
const r = lengthOfLIS(nums)
const elapsed = performance.now() - t0
assertEqual(r, 624)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Version O(n²) : `dp[i]` = longueur de la plus longue sous-séquence croissante qui se termine en `i` ; `dp[i] = 1 + max(dp[j])` pour `j < i` et `nums[j] < nums[i]`. La réponse est le maximum de `dp`.',
      'Pour aller plus vite, gardez pour chaque longueur `k` la plus petite fin possible d’une sous-séquence de longueur `k`. Ce tableau est trié.',
      'Pour chaque `x`, cherchez par dichotomie la première fin `>= x` et remplacez-la par `x` (ou ajoutez `x` à la fin s’il n’y en a pas).',
    ],
    discussion: `**Complexité** : O(n log n) en temps (une dichotomie par élément), O(n) en mémoire.

**Points à évoquer** :

- la DP O(n²) est la réponse attendue en premier ; la version patience sorting est l’optimisation que le recruteur espère ;
- \`tails\` n’est **pas** une sous-séquence de \`nums\` en général : seule sa longueur a un sens ;
- pour reconstruire la sous-séquence, mémoriser pour chaque élément l’indice de son prédécesseur (l’élément en \`tails[lo - 1]\` au moment de l’insertion) ;
- strictement croissante → première fin \`>= x\` ; non décroissante → première fin \`> x\` ;
- variantes : nombre de LIS (DP O(n²) avec compteurs), poupées russes (trier par largeur croissante puis hauteur décroissante, puis LIS sur les hauteurs), plus longue chaîne de paires.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-partition',
    title: 'Partager en deux sous-ensembles de même somme',
    difficulty: 'moyen',
    theme: 'dp',
    pattern: 'sac à dos 0/1',
    statement: `Écrivez \`canPartition(nums)\` qui indique si l’on peut répartir les éléments de \`nums\` (entiers positifs) en **deux sous-ensembles de même somme**. Chaque élément va dans exactement un des deux sous-ensembles.

Contraintes : \`1 <= nums.length <= 200\`, \`1 <= nums[i] <= 100\`.

Exemples :

- \`canPartition([1, 5, 11, 5])\` donne \`true\` (\`[1, 5, 5]\` et \`[11]\`) ;
- \`canPartition([1, 2, 3, 5])\` donne \`false\` ;
- \`canPartition([2, 2])\` donne \`true\`.`,
    starter: `function canPartition(nums) {
  // TODO : existe-t-il un sous-ensemble de somme totale / 2 ?
  const total = nums.reduce((a, b) => a + b, 0)
  return total % 2 === 0
}`,
    solution: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0)
  if (total % 2 !== 0) return false
  const target = total / 2
  // reachable[s] = une somme s est atteignable avec les éléments déjà vus
  const reachable = new Array(target + 1).fill(false)
  reachable[0] = true
  for (const x of nums) {
    // à rebours : chaque élément n'est utilisé qu'une fois (sac à dos 0/1)
    for (let s = target; s >= x; s--) {
      if (reachable[s - x]) reachable[s] = true
    }
    if (reachable[target]) return true
  }
  return reachable[target]
}`,
    solutionEquiv: {
      python: `def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    reachable = [True] + [False] * target
    for x in nums:
        for s in range(target, x - 1, -1):
            if reachable[s - x]:
                reachable[s] = True
        if reachable[target]:
            return True
    return reachable[target]`,
      java: `static boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] reachable = new boolean[target + 1];
    reachable[0] = true;
    for (int x : nums) {
        for (int s = target; s >= x; s--)
            if (reachable[s - x]) reachable[s] = true;
        if (reachable[target]) return true;
    }
    return reachable[target];
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(canPartition([1, 5, 11, 5]), true)
assertEqual(canPartition([1, 2, 3, 5]), false)` },
      { name: 'somme paire mais impossible', code: `assertEqual(canPartition([1, 1, 4]), false)
assertEqual(canPartition([2, 2, 3, 5]), false)` },
      { name: 'un élément ne sert qu’une fois', code: `assertEqual(canPartition([1, 3]), false)
assertEqual(canPartition([3, 1, 1, 1]), true)` },
      { name: 'petits cas', code: `assertEqual(canPartition([2, 2]), true)
assertEqual(canPartition([7]), false)
assertEqual(canPartition([100, 100]), true)` },
      { name: 'grande entrée : 200 éléments', code: `const nums = []
let x = 7
for (let i = 0; i < 200; i++) {
  x = (x * 48271) % 2147483647
  nums.push((x % 100) + 1)
}
const t0 = performance.now()
const r = canPartition(nums)
const elapsed = performance.now() - t0
assertEqual(r, true)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Si la somme totale est impaire, c’est impossible. Sinon, la question devient : existe-t-il un sous-ensemble de somme `total / 2` ?',
      'C’est un sac à dos 0/1 où l’on ne cherche qu’à savoir si une somme est atteignable : `reachable[s] = reachable[s] || reachable[s - x]`.',
      'Sur un tableau 1D, parcourez les sommes **à rebours** (de `target` vers `x`) pour ne pas réutiliser l’élément courant.',
    ],
    discussion: `**Complexité** : O(n × S) en temps et O(S) en mémoire, avec S = somme / 2 (au plus 10 000 ici, soit 2 millions d’opérations).

**Points à évoquer** :

- le test \`[1, 3]\` détecte le parcours à l’endroit : avec la somme cible 2, \`reachable[2]\` deviendrait vrai en utilisant deux fois le 1 ;
- l’énumération des 2ⁿ sous-ensembles est impraticable pour n = 200 ;
- astuce : un \`BigInt\` comme ensemble de bits, \`bits |= bits << BigInt(x)\`, traite toutes les sommes d’un coup (en Java, \`BitSet\` ; en C++, \`bitset\`) ;
- c’est un algorithme **pseudo-polynomial** : il dépend de la valeur des nombres ; avec des valeurs jusqu’à 10⁹, il faudrait une autre approche (meet in the middle pour n ≤ 40) ;
- variantes : target sum (affecter + ou − : se ramène à un subset sum), last stone weight II, k sous-ensembles de même somme (backtracking ou DP sur masques).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-edit-distance',
    title: 'Distance d’édition (Levenshtein)',
    difficulty: 'difficile',
    theme: 'dp',
    pattern: 'DP 2D sur deux chaînes',
    statement: `Écrivez \`minDistance(a, b)\` qui renvoie le **nombre minimal d’opérations** pour transformer \`a\` en \`b\`. Les trois opérations autorisées, chacune de coût 1, sont : **insérer** un caractère, **supprimer** un caractère, **remplacer** un caractère.

Contraintes : \`0 <= a.length, b.length <= 2000\`, caractères quelconques (comparez avec \`===\`).

Exemples :

- \`minDistance('horse', 'ros')\` donne \`3\` (horse → rorse → rose → ros) ;
- \`minDistance('intention', 'execution')\` donne \`5\` ;
- \`minDistance('', 'abc')\` donne \`3\`.`,
    starter: `function minDistance(a, b) {
  // TODO : distance d'édition
  // (compter les positions différentes ne suffit pas quand les longueurs diffèrent)
  let diff = Math.abs(a.length - b.length)
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) diff++
  return diff
}`,
    solution: `function minDistance(a, b) {
  const m = a.length
  const n = b.length
  // prev[j] = distance entre a[0..i-1) et b[0..j) ; on garde deux lignes
  let prev = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1)
    cur[0] = i
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) cur[j] = prev[j - 1]
      else cur[j] = 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]) // suppression, insertion, remplacement
    }
    prev = cur
  }
  return prev[n]
}`,
    solutionEquiv: {
      python: `def min_distance(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        cur = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[n]`,
      java: `static int minDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[] prev = new int[n + 1];
    for (int j = 0; j <= n; j++) prev[j] = j;
    for (int i = 1; i <= m; i++) {
        int[] cur = new int[n + 1];
        cur[0] = i;
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) cur[j] = prev[j - 1];
            else cur[j] = 1 + Math.min(prev[j - 1], Math.min(prev[j], cur[j - 1]));
        }
        prev = cur;
    }
    return prev[n];
}`,
      rust: `fn min_distance(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let n = b.len();
    let mut prev: Vec<usize> = (0..=n).collect();
    for i in 1..=a.len() {
        let mut cur = vec![0; n + 1];
        cur[0] = i;
        for j in 1..=n {
            cur[j] = if a[i - 1] == b[j - 1] {
                prev[j - 1]
            } else {
                1 + prev[j].min(cur[j - 1]).min(prev[j - 1])
            };
        }
        prev = cur;
    }
    prev[n]
}`,
      php: `function minDistance(string $a, string $b): int {
    $m = strlen($a);
    $n = strlen($b);
    $prev = range(0, $n);
    for ($i = 1; $i <= $m; $i++) {
        $cur = [$i];
        for ($j = 1; $j <= $n; $j++) {
            if ($a[$i - 1] === $b[$j - 1]) $cur[$j] = $prev[$j - 1];
            else $cur[$j] = 1 + min($prev[$j], $cur[$j - 1], $prev[$j - 1]);
        }
        $prev = $cur;
    }
    return $prev[$n];
}
// strlen et $a[$i] travaillent sur des octets : pour de l'UTF-8, passer par mb_str_split`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(minDistance('horse', 'ros'), 3)
assertEqual(minDistance('intention', 'execution'), 5)` },
      { name: 'chaînes vides', code: `assertEqual(minDistance('', ''), 0)
assertEqual(minDistance('', 'abc'), 3)
assertEqual(minDistance('abcd', ''), 4)` },
      { name: 'identiques et un seul remplacement', code: `assertEqual(minDistance('kata', 'kata'), 0)
assertEqual(minDistance('chat', 'chut'), 1)` },
      { name: 'décalage : insertion en tête', code: `assertEqual(minDistance('abc', 'xabc'), 1)
assertEqual(minDistance('kitten', 'sitting'), 3)` },
      { name: 'grande entrée : 1000 × 1000', code: `const a = 'abcde'.repeat(200)
const b = 'badce'.repeat(200)
const t0 = performance.now()
const r = minDistance(a, b)
const elapsed = performance.now() - t0
assertEqual(r, 600)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'État : `dp[i][j]` = distance entre les préfixes `a.slice(0, i)` et `b.slice(0, j)`. Cas de base : `dp[i][0] = i` (tout supprimer), `dp[0][j] = j` (tout insérer).',
      'Si `a[i - 1] === b[j - 1]`, rien à faire : `dp[i - 1][j - 1]`. Sinon, 1 + le minimum des trois voisins : haut (suppression), gauche (insertion), diagonale (remplacement).',
      'Chaque ligne ne dépend que de la précédente : deux lignes de longueur `n + 1` suffisent.',
    ],
    discussion: `**Complexité** : O(m × n) en temps (un million de cases pour 1000 × 1000, quatre millions pour 2000 × 2000), O(n) en mémoire avec deux lignes (O(min(m, n)) en échangeant les chaînes).

**Points à évoquer** :

- la récursion naïve fait jusqu’à trois appels par niveau : O(3^(m+n)) ;
- savoir associer chaque voisin à une opération : c’est ce que le recruteur vérifie ;
- pour reconstruire la suite d’opérations, garder la table complète et remonter depuis \`dp[m][n]\` ;
- variantes : seulement insertions et suppressions (= m + n − 2 × LCS), distance de Damerau (transpositions), one edit distance (O(n) en deux pointeurs), coûts pondérés ;
- usages réels : correcteurs orthographiques, diff, bio-informatique (alignement de séquences).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-dp-word-break',
    title: 'Découper une phrase en mots',
    difficulty: 'moyen',
    theme: 'dp',
    pattern: 'DP sur les préfixes',
    statement: `Écrivez \`wordBreak(s, words)\` qui indique si la chaîne \`s\` peut être découpée en une suite de mots **du dictionnaire** \`words\` (un mot peut être réutilisé autant de fois que nécessaire).

Contraintes : \`1 <= s.length <= 5000\`, \`1 <= words.length <= 1000\`, \`1 <= words[i].length <= 20\`, lettres minuscules.

Exemples :

- \`wordBreak('leetcode', ['leet', 'code'])\` donne \`true\` ;
- \`wordBreak('applepenapple', ['apple', 'pen'])\` donne \`true\` (\`apple\` est réutilisé) ;
- \`wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat'])\` donne \`false\`.`,
    starter: `function wordBreak(s, words) {
  // TODO : découpe gloutonne... qui prend toujours le premier mot trouvé
  let i = 0
  while (i < s.length) {
    const w = words.find((w) => s.startsWith(w, i))
    if (!w) return false
    i += w.length
  }
  return true
}`,
    solution: `function wordBreak(s, words) {
  const dict = new Set(words)
  let maxLen = 0
  for (const w of words) maxLen = Math.max(maxLen, w.length)
  // ok[i] = le préfixe s.slice(0, i) est découpable
  const ok = new Array(s.length + 1).fill(false)
  ok[0] = true
  for (let i = 1; i <= s.length; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (ok[j] && dict.has(s.slice(j, i))) {
        ok[i] = true
        break
      }
    }
  }
  return ok[s.length]
}`,
    solutionEquiv: {
      python: `def word_break(s, words):
    d = set(words)
    max_len = max(len(w) for w in words)
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if ok[j] and s[j:i] in d:
                ok[i] = True
                break
    return ok[len(s)]`,
      java: `static boolean wordBreak(String s, java.util.List<String> words) {
    java.util.Set<String> dict = new java.util.HashSet<>(words);
    int maxLen = 0;
    for (String w : words) maxLen = Math.max(maxLen, w.length());
    boolean[] ok = new boolean[s.length() + 1];
    ok[0] = true;
    for (int i = 1; i <= s.length(); i++) {
        for (int j = Math.max(0, i - maxLen); j < i; j++) {
            if (ok[j] && dict.contains(s.substring(j, i))) {
                ok[i] = true;
                break;
            }
        }
    }
    return ok[s.length()];
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(wordBreak('leetcode', ['leet', 'code']), true)
assertEqual(wordBreak('applepenapple', ['apple', 'pen']), true)
assertEqual(wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']), false)` },
      { name: 'le premier mot trouvé n’est pas le bon', code: `assertEqual(wordBreak('aaaaaaa', ['aaa', 'aaaa']), true)
assertEqual(wordBreak('catsdog', ['cat', 'cats', 'dog']), true)
assertEqual(wordBreak('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']), true)` },
      { name: 'un seul mot ou aucun', code: `assertEqual(wordBreak('a', ['a']), true)
assertEqual(wordBreak('b', ['a']), false)` },
      { name: 'reste impossible à la fin', code: `assertEqual(wordBreak('abcd', ['a', 'abc', 'b', 'cd']), true)
assertEqual(wordBreak('abcde', ['a', 'abc', 'b', 'cd']), false)` },
      { name: 'grande entrée : récursion naïve exponentielle', code: `const s = 'a'.repeat(3000) + 'b'
const words = []
for (let k = 1; k <= 10; k++) words.push('a'.repeat(k))
const t0 = performance.now()
const r = wordBreak(s, words)
const elapsed = performance.now() - t0
assertEqual(r, false)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Un découpage glouton (prendre le premier ou le plus long mot qui convient) échoue : il faut pouvoir revenir sur un choix.',
      '`ok[i]` = le préfixe de longueur `i` est découpable. `ok[0] = true`, et `ok[i]` est vrai s’il existe `j < i` avec `ok[j]` vrai et `s.slice(j, i)` dans le dictionnaire.',
      'Mettez les mots dans un `Set`, et ne testez que les `j` tels que `i - j` ne dépasse pas la longueur du plus long mot.',
    ],
    discussion: `**Complexité** : O(n × L²) en temps (n positions, L découpes au plus, chaque \`slice\` et hachage en O(L)), O(n) en mémoire, plus le \`Set\`.

**Points à évoquer** :

- la récursion naïve sans mémo explore un nombre exponentiel de découpages sur \`aaaa…ab\` ; la version mémoïsée (par position de départ) est équivalente à la DP ;
- alternative : un trie du dictionnaire, parcouru depuis chaque position \`j\` où \`ok[j]\` est vrai, évite les \`slice\` ;
- BFS sur les positions : même complexité, autre point de vue (graphe implicite) ;
- variante word break II : renvoyer **toutes** les phrases ; leur nombre peut être exponentiel, il faut du backtracking mémoïsé, et dire que la sortie elle-même peut être exponentielle.`,
  },
]

const dpQuiz: QuizItem[] = [
  {
    id: 'av-dp-q-signal',
    theme: 'dp',
    kind: 'qcm',
    q: 'Lequel de ces énoncés appelle le plus naturellement une programmation dynamique ?',
    choices: [
      'Afficher toutes les permutations d’un tableau',
      'Compter le nombre de façons de former une somme avec des pièces données',
      'Trouver le maximum d’un tableau non trié',
      'Trier des intervalles par date de début',
    ],
    answer: 1,
    why: '« Nombre de façons » est le signal type : on additionne les façons des sous-problèmes (montants plus petits), qui se recoupent. Énumérer toutes les permutations relève du backtracking (la sortie elle-même est de taille n!), le maximum est un simple parcours et le tri d’intervalles prépare souvent un glouton.',
  },
  {
    id: 'av-dp-q-pile',
    theme: 'dp',
    kind: 'qcm',
    q: 'Quel est le principal avantage pratique d’une DP bottom-up sur sa version top-down mémoïsée en JavaScript ?',
    choices: [
      'Elle a toujours une meilleure complexité asymptotique',
      'Elle ne calcule que les états réellement nécessaires',
      'Elle n’utilise pas la pile d’appels, donc pas de risque de « Maximum call stack size exceeded »',
      'Elle n’a jamais besoin de cas de base',
    ],
    answer: 2,
    why: 'Les deux versions ont la même complexité (nombre d’états × transition). Le top-down ne calcule que les états atteints, c’est même son avantage. Le bottom-up, lui, remplace la récursion par des boucles : pas de pile profonde, et la mémoire peut ensuite être réduite (rouleau de lignes).',
  },
  {
    id: 'av-dp-q-ordre-boucles',
    theme: 'dp',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `function f(coins, amount, coinsOutside) {
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1
  if (coinsOutside) {
    for (const c of coins) for (let a = c; a <= amount; a++) dp[a] += dp[a - c]
  } else {
    for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) dp[a] += dp[a - c]
  }
  return dp[amount]
}
console.log(f([1, 2], 4, true), f([1, 2], 4, false))`,
    choices: ['3 5', '5 3', '3 3', '5 5'],
    answer: 0,
    why: 'Pièces à l’extérieur : chaque combinaison est comptée une fois, {1,1,1,1}, {1,1,2}, {2,2}, soit 3. Montants à l’extérieur : on compte les suites ordonnées, 1111, 112, 121, 211, 22, soit 5 (c’est l’escalier).',
  },
  {
    id: 'av-dp-q-fill-partage',
    theme: 'dp',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const dp = new Array(3).fill(new Array(3).fill(0))
dp[0][0] = 1
console.log(dp[2][0], dp.length)`,
    choices: ['0 3', '1 3', 'undefined 3', '1 9'],
    answer: 1,
    why: '`fill` place **la même référence** de tableau dans les trois cases : `dp[0]`, `dp[1]` et `dp[2]` sont un seul et même tableau. Écrire `dp[0][0]` modifie donc aussi `dp[2][0]`. Il faut `Array.from({ length: 3 }, () => new Array(3).fill(0))`.',
  },
  {
    id: 'av-dp-q-sens-sac',
    theme: 'dp',
    kind: 'output',
    q: 'Un seul objet (poids 2, valeur 3), capacité 6. Qu’affiche ce code ?',
    code: `function best(backward) {
  const dp = new Array(7).fill(0)
  if (backward) {
    for (let w = 6; w >= 2; w--) dp[w] = Math.max(dp[w], dp[w - 2] + 3)
  } else {
    for (let w = 2; w <= 6; w++) dp[w] = Math.max(dp[w], dp[w - 2] + 3)
  }
  return dp[6]
}
console.log(best(true), best(false))`,
    choices: ['3 3', '9 9', '3 9', '9 3'],
    answer: 2,
    why: 'À rebours, `dp[w - 2]` vaut encore 0 (état sans l’objet) : l’objet n’est pris qu’une fois, valeur 3 (sac à dos 0/1). À l’endroit, `dp[2]` vaut déjà 3 quand on calcule `dp[4]`, puis `dp[6]` : l’objet est repris trois fois, valeur 9 (sac à dos non borné).',
  },
  {
    id: 'av-dp-q-cx-lcs',
    theme: 'dp',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction, avec m = a.length et n = b.length ?',
    code: `function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}
lcs('abcde', 'ace')`,
    choices: ['O(m + n)', 'O(m × n)', 'O(2^(m + n))', 'O((m + n) log(m + n))'],
    answer: 1,
    why: '(m + 1) × (n + 1) états, chacun calculé en O(1) : O(m × n) en temps et en mémoire. La mémoire peut descendre à O(min(m, n)) avec deux lignes, le temps non.',
  },
  {
    id: 'av-dp-q-cx-memo',
    theme: 'dp',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de `paths(m, n)` ?',
    code: `function paths(m, n) {
  const memo = new Map()
  function go(i, j) {
    if (i === 0 || j === 0) return 1
    const key = i * n + j
    if (memo.has(key)) return memo.get(key)
    const v = go(i - 1, j) + go(i, j - 1)
    memo.set(key, v)
    return v
  }
  return go(m - 1, n - 1)
}
paths(20, 30)`,
    choices: ['O(m + n)', 'O(2^(m + n))', 'O(m × n)', 'O(m × n × log(m × n))'],
    answer: 2,
    why: 'Chaque couple (i, j) est calculé une seule fois grâce au cache (la clé `i * n + j` est injective car `j < n`), puis lu en O(1) en moyenne : O(m × n) états × O(1). Sans le cache, ce serait exponentiel, de l’ordre de C(m + n, m).',
  },
  {
    id: 'av-dp-q-cx-naif',
    theme: 'dp',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette version sans mémoïsation ?',
    code: `function ways(n) {
  if (n < 0) return 0
  if (n === 0) return 1
  return ways(n - 1) + ways(n - 2) + ways(n - 3)
}
ways(15)`,
    choices: ['O(n)', 'O(n³)', 'O(3ⁿ) (plus précisément O(1,84ⁿ))', 'O(n log n)'],
    answer: 2,
    why: 'Chaque appel en lance trois autres, et les mêmes valeurs de n sont recalculées sans cesse : la croissance est exponentielle (la racine de x³ = x² + x + 1, environ 1,84, donne la base exacte). Avec un tableau de mémo ou trois variables, on tombe à O(n).',
  },
  {
    id: 'av-dp-q-bug-lis',
    theme: 'dp',
    kind: 'bug',
    q: 'Cette fonction doit renvoyer la longueur de la plus longue sous-séquence strictement croissante. Où est le bug ?',
    code: `function lis(nums) {
  const dp = new Array(nums.length).fill(1)
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1)
    }
  }
  return dp[nums.length - 1]
}
lis([1, 2, 3, 0])`,
    choices: [
      'La condition devrait être `nums[j] <= nums[i]`',
      '`dp` devrait être initialisé à 0',
      'La réponse est le maximum de `dp`, pas `dp[nums.length - 1]` : la meilleure sous-séquence ne se termine pas forcément au dernier élément',
      'La boucle sur `j` devrait aller jusqu’à `nums.length`',
    ],
    answer: 2,
    why: '`dp[i]` est la longueur de la meilleure sous-séquence **qui se termine en i**. Pour `[1, 2, 3, 0]`, `dp = [1, 2, 3, 1]` : la fonction renvoie 1 au lieu de 3. Il faut `Math.max(0, ...dp)` (le 0 gère le tableau vide). Bien relire la définition de l’état avant de choisir la case réponse.',
  },
  {
    id: 'av-dp-q-bug-min',
    theme: 'dp',
    kind: 'bug',
    q: 'Cette version de coin change (nombre minimal de pièces) renvoie toujours 0. Pourquoi ?',
    code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(0)
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1)
    }
  }
  return dp[amount]
}
coinChange([1, 2, 5], 11)`,
    choices: [
      'Il faut parcourir les montants à rebours',
      'Le tableau est initialisé à 0 : `Math.min(0, …)` vaut toujours 0. Il faut `Infinity` partout sauf `dp[0] = 0`',
      'Les pièces doivent être triées par ordre décroissant',
      'Il manque `dp[0] = 1`',
    ],
    answer: 1,
    why: 'Pour un minimum, la valeur initiale doit être neutre pour `min`, c’est-à-dire `Infinity` ; seul `dp[0]` vaut 0. À la fin, `Infinity` signale un montant impossible (on renvoie -1). `dp[0] = 1` est la convention des problèmes de comptage, pas de minimum.',
  },
]

const dpPieges: Piege[] = [
  {
    id: 'av-dp-p-cle-memo',
    title: 'Une clé de mémo ambiguë',
    theme: 'dp',
    question: 'On mémoïse C(n, k) = C(n - 1, k - 1) + C(n - 1, k) avec la clé `n + k`. Qu’affiche ce code ?',
    code: `const memo = new Map()
function C(n, k) {
  if (k === 0 || k === n) return 1
  const key = n + k
  if (memo.has(key)) return memo.get(key)
  const v = C(n - 1, k - 1) + C(n - 1, k)
  memo.set(key, v)
  return v
}
console.log(C(5, 2), C(10, 3))`,
    output: `11 101`,
    explanation: 'La clé `n + k` confond des états différents : (4, 1) et (3, 2) ont la même clé 5, donc le second lit la valeur du premier. On obtient 11 et 101 au lieu de 10 et 120, sans aucune erreur. Pire, le cache est global : le second appel réutilise les valeurs erronées du premier. Une clé composite doit être **injective** : `n + \',\' + k`, ou un entier `n * (K + 1) + k`.',
    fix: {
      code: `function C(n, k, memo = new Map()) {
  if (k === 0 || k === n) return 1
  const key = n + ',' + k
  if (memo.has(key)) return memo.get(key)
  const v = C(n - 1, k - 1, memo) + C(n - 1, k, memo)
  memo.set(key, v)
  return v
}
console.log(C(5, 2), C(10, 3))`,
      output: `10 120`,
      equiv: {
        python: `from functools import cache

@cache  # la clé est le tuple (n, k) : jamais ambiguë
def C(n, k):
    if k == 0 or k == n:
        return 1
    return C(n - 1, k - 1) + C(n - 1, k)

print(C(5, 2), C(10, 3))`,
        java: `static java.util.Map<Long, Long> memo = new java.util.HashMap<>();

static long C(int n, int k) {
    if (k == 0 || k == n) return 1;
    long key = ((long) n << 32) | k; // encodage injectif sur un long
    Long cached = memo.get(key);
    if (cached != null) return cached;
    long v = C(n - 1, k - 1) + C(n - 1, k);
    memo.put(key, v);
    return v;
}`,
      },
    },
  },
  {
    id: 'av-dp-p-fill-partage',
    title: 'Une table DP dont toutes les lignes sont la même',
    theme: 'dp',
    question: 'On calcule la LCS de `ab` et `aab` avec une table créée par `fill`. Qu’affiche ce code ?',
    code: `function lcs(a, b) {
  const dp = new Array(a.length + 1).fill(new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}
console.log(lcs('ab', 'aab'))`,
    output: `3`,
    explanation: '`fill(new Array(n + 1).fill(0))` évalue `new Array(...)` **une seule fois** et place cette même référence dans toutes les lignes : `dp[i - 1]` et `dp[i]` sont le même tableau. La diagonale `dp[i - 1][j - 1]` lit alors une valeur déjà mise à jour pour la ligne courante, et la fonction renvoie 3, une LCS plus longue que la chaîne `ab` elle-même. `Array.from` avec une fonction crée un nouveau tableau par ligne. Même piège en Python avec `[[0] * n] * m`.',
    fix: {
      code: `function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}
console.log(lcs('ab', 'aab'))`,
      output: `2`,
      equiv: {
        python: `def lcs(a, b):
    # [[0] * (len(b) + 1)] * (len(a) + 1) aurait le même défaut
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[len(a)][len(b)]

print(lcs('ab', 'aab'))`,
        java: `static int lcs(String a, String b) {
    int[][] dp = new int[a.length() + 1][b.length() + 1]; // chaque ligne est un tableau distinct
    for (int i = 1; i <= a.length(); i++)
        for (int j = 1; j <= b.length(); j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[a.length()][b.length()];
}`,
      },
    },
  },
  {
    id: 'av-dp-p-sac-sens',
    title: 'Sac à dos 0/1 parcouru dans le mauvais sens',
    theme: 'dp',
    question: 'Objets de poids `[1, 3, 4]` et de valeurs `[15, 20, 30]`, capacité 4, chaque objet au plus une fois. Qu’affiche ce code ?',
    code: `const weights = [1, 3, 4]
const values = [15, 20, 30]
const W = 4
const dp = new Array(W + 1).fill(0)
for (let i = 0; i < weights.length; i++) {
  for (let w = weights[i]; w <= W; w++) {
    dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
  }
}
console.log(dp[W])`,
    output: `60`,
    explanation: 'Sur une seule ligne, parcourir les capacités **à l’endroit** fait que `dp[w - poids]` contient déjà l’objet courant : l’objet de poids 1 est pris quatre fois (4 × 15 = 60). C’est la réponse du sac à dos **non borné**. Pour le 0/1, on parcourt `w` de `W` vers le poids : `dp[w - poids]` désigne alors encore l’état sans l’objet, et la réponse est 35 (objets de poids 1 et 3).',
    fix: {
      code: `const weights = [1, 3, 4]
const values = [15, 20, 30]
const W = 4
const dp = new Array(W + 1).fill(0)
for (let i = 0; i < weights.length; i++) {
  for (let w = W; w >= weights[i]; w--) {
    dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
  }
}
console.log(dp[W])`,
      output: `35`,
      equiv: {
        python: `weights, values, W = [1, 3, 4], [15, 20, 30], 4
dp = [0] * (W + 1)
for wt, val in zip(weights, values):
    for w in range(W, wt - 1, -1):
        dp[w] = max(dp[w], dp[w - wt] + val)
print(dp[W])`,
        java: `int[] weights = {1, 3, 4}, values = {15, 20, 30};
int W = 4;
int[] dp = new int[W + 1];
for (int i = 0; i < weights.length; i++)
    for (int w = W; w >= weights[i]; w--)
        dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
System.out.println(dp[W]);`,
      },
    },
  },
]

const dpFlashcards: Flashcard[] = [
  { id: 'av-dp-f-deux-proprietes', theme: 'dp', front: 'Quelles sont les deux propriétés qui rendent la programmation dynamique applicable ?', back: 'Des **sous-problèmes qui se recoupent** (la récursion naïve recalcule les mêmes états) et une **sous-structure optimale** (l’optimum global se construit à partir des optimums des sous-problèmes).' },
  { id: 'av-dp-f-cinq-etapes', theme: 'dp', front: 'Les cinq étapes pour poser une DP ?', back: '**État** (que vaut `dp[i]` ?), **transition** (comment le calculer à partir d’états plus petits), **cas de base**, **ordre de calcul** (chaque état après ses dépendances), **réponse** (quelle case lire).' },
  { id: 'av-dp-f-signaux', theme: 'dp', front: 'Quels mots d’un énoncé doivent faire penser à la DP ?', back: '« Nombre de façons », « minimum / maximum », « est-il possible », « plus longue sous-séquence », sur un tableau, une chaîne ou une grille parcourus préfixe par préfixe, avec une récursion naïve exponentielle.' },
  { id: 'av-dp-f-complexite', theme: 'dp', front: 'Comment calculer la complexité d’une DP ?', back: 'Nombre d’états × coût d’une transition. La mémoire est le nombre d’états conservés, réductible si un état ne dépend que de la ligne ou des deux cases précédentes.' },
  {
    id: 'av-dp-f-cle',
    theme: 'dp',
    front: 'Comment mémoïser une fonction à deux paramètres avec une `Map` ?',
    back: 'Avec une clé **injective** : une chaîne avec séparateur, ou un entier encodé. Jamais `i + j`.',
    code: `const key = (i, j) => i + ',' + j
key(1, 12) === key(11, 2) // → false
1 + 12 === 11 + 2 // → true`,
  },
  { id: 'av-dp-f-sac', theme: 'dp', front: 'Sac à dos sur une ligne : dans quel sens parcourir les capacités ?', back: '**0/1** (chaque objet au plus une fois) : de `W` vers le poids, **à rebours**. **Non borné** : du poids vers `W`, **à l’endroit**, ce qui permet de reprendre l’objet courant.' },
  { id: 'av-dp-f-coin-ordre', theme: 'dp', front: 'Coin change II : quel ordre de boucles compte les combinaisons, et lequel compte les arrangements ?', back: 'Pièces à l’extérieur, montants à l’intérieur : **combinaisons** (1 + 2 et 2 + 1 comptés une fois). Montants à l’extérieur : **arrangements** ordonnés.' },
  { id: 'av-dp-f-lis', theme: 'dp', front: 'Comment obtenir la LIS en O(n log n) ?', back: 'Tableau `tails` trié : `tails[k]` = plus petite fin d’une sous-séquence croissante de longueur `k + 1`. Pour chaque `x`, dichotomie sur la première fin `>= x`, remplacée par `x` (ou ajout). La réponse est `tails.length`.' },
  { id: 'av-dp-f-edition', theme: 'dp', front: 'Distance d’édition : à quelle opération correspond chaque voisin de `dp[i][j]` ?', back: '`dp[i - 1][j]` : **suppression** de `a[i - 1]` ; `dp[i][j - 1]` : **insertion** de `b[j - 1]` ; `dp[i - 1][j - 1]` : **remplacement** (gratuit si les caractères sont égaux). Cas de base `dp[i][0] = i`, `dp[0][j] = j`.' },
  { id: 'av-dp-f-intervalles', theme: 'dp', front: 'Dans quel ordre remplir une DP sur intervalles `dp[i][j]` ?', back: 'Par longueur d’intervalle croissante, ou `i` décroissant et `j` croissant : `dp[i][j]` dépend de `dp[i + 1][…]` et de `dp[i][j - 1]`, qui doivent être prêts.' },
]

const dpLexique: LexiqueEntry[] = [
  { term: 'Programmation dynamique', theme: 'dp', def: 'Technique qui résout un problème en combinant les solutions de sous-problèmes, chacun résolu une seule fois et stocké. Elle s’applique quand les sous-problèmes se recoupent et que le problème a une sous-structure optimale.', see: ['Sous-problèmes qui se recoupent', 'Sous-structure optimale', 'Tabulation'] },
  { term: 'Sous-problèmes qui se recoupent', theme: 'dp', def: 'Propriété d’un problème dont la récursion naïve recalcule plusieurs fois les mêmes sous-problèmes (Fibonacci, chemins dans une grille). C’est ce qui distingue la DP du « diviser pour régner », où les sous-problèmes sont disjoints (tri fusion).', see: ['Programmation dynamique'] },
  { term: 'Sous-structure optimale', theme: 'dp', def: 'Propriété selon laquelle une solution optimale contient des solutions optimales de ses sous-problèmes. Le plus court chemin l’a ; le plus long chemin simple dans un graphe quelconque ne l’a pas.', see: ['Programmation dynamique'] },
  { term: 'Tabulation', theme: 'dp', def: 'Implémentation bottom-up d’une DP : on remplit un tableau dans l’ordre des dépendances avec des boucles, sans récursion. Elle évite le débordement de pile et permet l’optimisation mémoire (rouleau de lignes).', see: ['Programmation dynamique', 'Rouleau de lignes'] },
  { term: 'Rouleau de lignes', theme: 'dp', def: 'Optimisation mémoire d’une DP 2D dont chaque ligne ne dépend que de la précédente : on ne garde que deux lignes (ou une seule mise à jour en place), et la mémoire passe de O(m × n) à O(n). On perd la possibilité de reconstruire la solution.', see: ['Tabulation'] },
  { term: 'Sac à dos 0/1', theme: 'dp', def: 'Problème où chaque objet (poids, valeur) est pris au plus une fois sans dépasser une capacité W, en maximisant la valeur. DP en O(n × W), avec une ligne parcourue à rebours. Partition et subset sum en sont des variantes.', see: ['Pseudo-polynomial'] },
  { term: 'Pseudo-polynomial', theme: 'dp', def: 'Se dit d’un algorithme polynomial en la **valeur** numérique de l’entrée mais pas en sa taille en bits : le sac à dos en O(n × W) devient inutilisable si W vaut 10⁹.', see: ['Sac à dos 0/1'] },
  { term: 'Distance de Levenshtein', theme: 'dp', def: 'Nombre minimal d’insertions, suppressions et remplacements pour transformer une chaîne en une autre. Calculée par une DP 2D en O(m × n) sur les préfixes des deux chaînes.', see: ['Programmation dynamique'] },
]

const dpEntretien: EntretienQ[] = [
  {
    id: 'av-dp-e-methode',
    section: 'techniques',
    q: 'Face à un problème que vous soupçonnez de DP, comment procédez-vous à voix haute ?',
    answer: 'Je commence par une récursion naïve qui exprime le problème (souvent en partant de la fin : quel est le dernier choix ?), et je repère les arguments qui reviennent. J’énonce ensuite les cinq points : **état** en une phrase, **transition**, **cas de base**, **ordre de calcul**, **case réponse**. J’annonce la complexité (états × transition) avant de coder.\n\nJe code d’abord la version mémoïsée si la récurrence est délicate, puis je propose la tabulation et l’optimisation mémoire si l’état ne dépend que de la ligne précédente. Enfin, je teste à la main sur un petit exemple en remplissant la table.',
    attendu: 'Une démarche structurée et explicite, pas une formule récitée ; la capacité à justifier l’état et l’ordre de calcul, et à passer du top-down au bottom-up.',
  },
  {
    id: 'av-dp-e-memo-vs-tab',
    section: 'complexite',
    q: 'Mémoïsation ou tabulation : ont-elles la même complexité ? Laquelle choisir ?',
    answer: 'Même complexité asymptotique : chaque état est calculé une fois. Les différences sont pratiques :\n\n- le top-down ne calcule que les états atteints (utile si beaucoup d’états sont inutiles) et suit directement la récurrence ;\n- il consomme une pile de profondeur égale à la plus longue chaîne de dépendances : en JavaScript, vers 10⁴ niveaux, on obtient « Maximum call stack size exceeded » ;\n- le bottom-up a une meilleure constante (pas d’appels, pas de `Map`) et permet de réduire la mémoire en ne gardant que les dernières lignes.\n\nEn entretien, je commence souvent en top-down pour valider la récurrence, puis je convertis.',
    attendu: 'Savoir que la complexité est identique, citer la pile d’appels et l’optimisation mémoire comme vrais critères de choix.',
  },
  {
    id: 'av-dp-e-reconstruction',
    section: 'conception',
    q: 'Votre DP de rendu de monnaie renvoie le nombre minimal de pièces. Le produit veut maintenant la liste des pièces. Que changez-vous ?',
    answer: 'Je garde, pour chaque montant, la pièce qui a donné le minimum (`last[a] = c`). À la fin, je remonte depuis `amount` : je prends `last[a]`, je retire sa valeur, et je recommence jusqu’à 0. Coût supplémentaire : O(amount) en mémoire, O(nombre de pièces) pour la remontée.',
    code: `function coinList(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  const last = new Array(amount + 1).fill(-1)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) {
        dp[a] = dp[a - c] + 1
        last[a] = c
      }
    }
  }
  if (dp[amount] === Infinity) return null
  const out = []
  for (let a = amount; a > 0; a -= last[a]) out.push(last[a])
  return out
}

coinList([1, 3, 4], 6) // → [ 3, 3 ]
coinList([2], 3) // → null`,
    equiv: {
      python: `def coin_list(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    last = [-1] * (amount + 1)
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
                last[a] = c
    if dp[amount] == INF:
        return None
    out, a = [], amount
    while a > 0:
        out.append(last[a])
        a -= last[a]
    return out`,
      java: `static java.util.List<Integer> coinList(int[] coins, int amount) {
    int INF = amount + 1;
    int[] dp = new int[amount + 1];
    int[] last = new int[amount + 1];
    java.util.Arrays.fill(dp, INF);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a && dp[a - c] + 1 < dp[a]) {
                dp[a] = dp[a - c] + 1;
                last[a] = c;
            }
    if (dp[amount] == INF) return null;
    java.util.List<Integer> out = new java.util.ArrayList<>();
    for (int a = amount; a > 0; a -= last[a]) out.add(last[a]);
    return out;
}`,
    },
    attendu: 'Le réflexe du tableau de « parents » (ou de la remontée de la table) et la conscience qu’une optimisation mémoire agressive aurait rendu la reconstruction impossible.',
  },
]

// ═════════════════════════════ BITS ET MATHÉMATIQUES ═════════════════════════════

const bitsCours: CoursSection = {
  id: 'bits',
  title: 'Bits et mathématiques',
  summary: 'Les opérateurs bit à bit de JavaScript et leur piège des 32 bits signés, les astuces classiques (XOR, Kernighan, puissance de 2, masques de sous-ensembles), les limites des nombres flottants et BigInt, puis l’arithmétique d’entretien : PGCD, crible, exponentiation rapide modulaire, modulo négatif et manipulation de chiffres.',
  blocks: [
    { h: 'Les opérateurs bit à bit et les 32 bits signés', id: 'bits-operateurs' },
    {
      p: 'JavaScript propose `&` (ET), `|` (OU), `^` (OU exclusif), `~` (NON), `<<` (décalage à gauche), `>>` (décalage à droite **arithmétique**, qui recopie le bit de signe) et `>>>` (décalage à droite **logique**, qui insère des zéros). Point capital : les nombres JS sont des flottants 64 bits, mais **ces opérateurs convertissent d’abord leurs opérandes en entiers 32 bits signés** (complément à deux), calculent, puis reconvertissent. Tout ce qui dépasse 32 bits est tronqué.',
    },
    {
      table: [
        ['Opération', 'Effet', 'Exemple'],
        ['`a & b`', 'bit à 1 si les deux bits sont à 1', '`6 & 3` vaut 2 (110 & 011 = 010)'],
        ['`a | b`', 'bit à 1 si au moins un bit est à 1', '`6 | 3` vaut 7'],
        ['`a ^ b`', 'bit à 1 si les bits diffèrent', '`6 ^ 3` vaut 5'],
        ['`~a`', 'inverse tous les bits : vaut `-a - 1`', '`~5` vaut -6'],
        ['`a << k`', 'multiplie par 2^k (sur 32 bits)', '`1 << 4` vaut 16'],
        ['`a >> k`', 'divise par 2^k en arrondissant vers −∞', '`-7 >> 1` vaut -4'],
        ['`a >>> k`', 'décalage non signé, résultat entre 0 et 2^32 − 1', '`-1 >>> 0` vaut 4294967295'],
      ],
    },
    {
      title: 'Le monde des 32 bits signés',
      code: `(5).toString(2) // → '101'
parseInt('1011', 2) // → 11
1 << 30 // → 1073741824
1 << 31 // → -2147483648
1 << 32; // → 1
(1 << 31) >>> 0 // → 2147483648
2 ** 32 | 0 // → 0
~~3.7 // → 3
~~-3.7 // → -3
~~(2 ** 32 + 5); // → 5
(-1 >>> 0).toString(2).length // → 32`,
      equiv: {
        python: `# Les entiers Python sont de précision arbitraire : pas de troncature à 32 bits
print(1 << 31)    # 2147483648
print(1 << 32)    # 4294967296
print(~5)         # -6
# Simuler un entier 32 bits non signé : masquer
print(-1 & 0xFFFFFFFF)  # 4294967295`,
        java: `System.out.println(1 << 31);        // -2147483648 (int 32 bits)
System.out.println(1 << 32);        // 1 : le décalage est pris modulo 32
System.out.println(1L << 32);       // 4294967296 (long 64 bits)
System.out.println(-1 >>> 28);      // 15 : >>> existe aussi en Java
System.out.println(Integer.toBinaryString(5)); // 101`,
        rust: `fn main() {
    let x: i32 = 1 << 30;
    println!("{}", x.wrapping_shl(1));  // -2147483648
    println!("{}", 1u64 << 40);         // 1099511627776
    println!("{:b}", 5);                // 101
    // 1i32 << 32 ne compile pas (débordement détecté) ; checked_shl renvoie None
    println!("{:?}", 1i32.checked_shl(32)); // None
}`,
        bash: `# L'arithmétique Bash travaille sur 64 bits signés
echo $(( 1 << 31 ))    # 2147483648
echo $(( 1 << 40 ))    # 1099511627776
echo $(( 6 & 3 )) $(( 6 | 3 )) $(( 6 ^ 3 ))  # 2 7 5
echo $(( ~5 ))         # -6`,
      },
    },
    {
      p: 'Conséquences pratiques : `x | 0`, `~~x` et `x >> 0` tronquent vers zéro **seulement** pour des valeurs dans [−2^31, 2^31 − 1] ; au-delà, ils donnent un résultat sans rapport. Pour arrondir un grand nombre, utilisez `Math.trunc` ou `Math.floor`. Pour manipuler des masques sur plus de 31 bits, utilisez `BigInt` (`1n << 40n`). Et `(lo + hi) >> 1` reste correct tant que la somme tient sur 31 bits, ce qui est toujours le cas pour des indices de tableau.',
    },
    {
      mnemo: '« Opérateur bit à bit = 32 bits signés. » `>>> 0` pour lire un nombre en non signé, `BigInt` au-delà de 31 bits, `Math.trunc` pour arrondir.',
      piege: '`1 << 31` vaut -2147483648 (le bit 31 est le bit de signe) et `1 << 32` vaut 1 (le décalage est pris modulo 32). Un masque construit avec `1 << i` pour `i >= 31` est faux.',
    },

    { h: 'Les astuces classiques : XOR, Kernighan, puissance de 2', id: 'bits-astuces' },
    {
      list: [
        '**XOR** : `x ^ x = 0`, `x ^ 0 = x`, commutatif et associatif. XOR de tous les éléments d’un tableau où chaque valeur apparaît deux fois sauf une : il ne reste que l’intruse. Même idée pour le nombre manquant de 0..n.',
        '**Échange sans variable temporaire** : `a ^= b; b ^= a; a ^= b`. Curiosité d’entretien ; en JS on écrit plutôt `[a, b] = [b, a]`.',
        '**Kernighan** : `n & (n - 1)` éteint le bit à 1 de poids le plus faible. Compter les tours jusqu’à 0 donne le nombre de bits à 1 en O(nombre de bits à 1).',
        '**Puissance de 2** : `n > 0 && (n & (n - 1)) === 0` (un seul bit à 1).',
        '**Bit de poids faible isolé** : `n & -n` (utile pour l’arbre de Fenwick).',
        '**Tester, allumer, éteindre, basculer le bit i** : `(n >> i) & 1`, `n | (1 << i)`, `n & ~(1 << i)`, `n ^ (1 << i)`.',
      ],
    },
    {
      title: 'XOR, Kernighan et puissance de 2',
      code: `function singleNumber(nums) {
  let x = 0
  for (const v of nums) x ^= v
  return x
}

function popcount(n) {
  n = n >>> 0 // lire les 32 bits comme non signés
  let count = 0
  while (n !== 0) {
    n &= n - 1 // éteint le bit à 1 le plus bas
    count++
  }
  return count
}

const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0

singleNumber([4, 1, 2, 1, 2]) // → 4
popcount(11) // → 3
popcount(-1) // → 32
isPowerOfTwo(64) // → true
isPowerOfTwo(96) // → false
12 & -12 // → 4`,
      equiv: {
        python: `from functools import reduce
from operator import xor

def single_number(nums):
    return reduce(xor, nums, 0)

def popcount(n):
    n &= 0xFFFFFFFF  # même lecture non signée sur 32 bits
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count
# Python 3.10+ : n.bit_count() ; avant : bin(n).count('1')

def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0`,
        java: `static int singleNumber(int[] nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}

static int popcount(int n) {
    return Integer.bitCount(n); // ou la boucle de Kernighan : while (n != 0) { n &= n - 1; count++; }
}

static boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}`,
        rust: `fn single_number(nums: &[i32]) -> i32 {
    nums.iter().fold(0, |acc, &v| acc ^ v)
}

fn popcount(n: i32) -> u32 {
    n.count_ones() // compile en une instruction POPCNT quand elle existe
}

fn is_power_of_two(n: u32) -> bool {
    n.is_power_of_two()
}`,
      },
    },
    {
      mnemo: '« `n & (n - 1)` mange le dernier 1. » Un seul tour suffit à tester une puissance de 2, une boucle compte les bits.',
      piege: 'Un nombre négatif a son bit de signe à 1 : pour compter ses bits ou les parcourir avec `>>>`, normalisez d’abord avec `n >>> 0`. Et n’utilisez jamais `n / 2` pour décaler : c’est une division flottante, `7 / 2` vaut 3.5 et la boucle ne reste pas sur des entiers.',
    },

    { h: 'Masques de bits et énumération des sous-ensembles', id: 'bits-masques' },
    {
      p: 'Un entier de n bits représente un sous-ensemble de n éléments : le bit `i` vaut 1 si l’élément `i` est dans le sous-ensemble. Les 2ⁿ entiers de `0` à `(1 << n) - 1` énumèrent donc tous les sous-ensembles, sans récursion. C’est praticable jusqu’à n ≈ 20 (un million de masques) ; c’est aussi la base de la **DP sur masques** (voyageur de commerce en O(2ⁿ × n²)).',
    },
    {
      title: 'Tous les sous-ensembles par masque',
      code: `function subsets(items) {
  const n = items.length
  const out = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const subset = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(items[i])
    }
    out.push(subset)
  }
  return out
}

subsets(['a', 'b', 'c']) // → [ [], [ 'a' ], [ 'b' ], [ 'a', 'b' ], [ 'c' ], [ 'a', 'c' ], [ 'b', 'c' ], [ 'a', 'b', 'c' ] ]

// sous-masques d'un masque donné : la boucle classique
const subs = []
for (let s = 0b1011; s > 0; s = (s - 1) & 0b1011) subs.push(s.toString(2))
subs // → [ '1011', '1010', '1001', '1000', '11', '10', '1' ]`,
      equiv: {
        python: `def subsets(items):
    n = len(items)
    out = []
    for mask in range(1 << n):
        out.append([items[i] for i in range(n) if mask >> i & 1])
    return out`,
        java: `static java.util.List<java.util.List<String>> subsets(String[] items) {
    int n = items.length;
    java.util.List<java.util.List<String>> out = new java.util.ArrayList<>();
    for (int mask = 0; mask < (1 << n); mask++) {
        java.util.List<String> subset = new java.util.ArrayList<>();
        for (int i = 0; i < n; i++)
            if ((mask & (1 << i)) != 0) subset.add(items[i]);
        out.add(subset);
    }
    return out;
}`,
        bash: `items=(a b c)
n=\${#items[@]}
for (( mask = 0; mask < (1 << n); mask++ )); do
  subset=()
  for (( i = 0; i < n; i++ )); do
    (( mask & (1 << i) )) && subset+=("\${items[i]}")
  done
  echo "{\${subset[*]}}"
done`,
      },
    },
    {
      mnemo: '« Un bit par élément, un entier par sous-ensemble. » 2ⁿ masques, n tests par masque : O(n × 2ⁿ).',
      piege: 'Attention à la priorité des opérateurs : `mask & 1 << i === 0` se lit `mask & ((1 << i) === 0)`. Les comparaisons sont prioritaires sur `&`, `|` et `^` : parenthésez toujours, `(mask & (1 << i)) !== 0`.',
    },

    { h: 'Limites des nombres : MAX_SAFE_INTEGER, BigInt, 0.1 + 0.2', id: 'bits-grands-nombres' },
    {
      p: 'Un `number` est un flottant IEEE 754 double précision : 53 bits de mantisse. Les entiers sont exacts jusqu’à `Number.MAX_SAFE_INTEGER` = 2^53 − 1 = 9 007 199 254 740 991 ; au-delà, des entiers voisins deviennent indiscernables, et les additions ou les produits perdent silencieusement des chiffres. `BigInt` (suffixe `n`) offre des entiers de taille arbitraire, mais ne se mélange pas avec `number` (`1n + 1` lève une `TypeError`) et est nettement plus lent.',
    },
    {
      title: 'Précision des entiers et des décimaux',
      code: `Number.MAX_SAFE_INTEGER // → 9007199254740991
2 ** 53 === 2 ** 53 + 1 // → true
Number.isSafeInteger(2 ** 53) // → false
2n ** 64n // → 18446744073709551616n
7n / 2n // → 3n
BigInt(Number.MAX_SAFE_INTEGER) + 2n // → 9007199254740993n
0.1 + 0.2 // → 0.30000000000000004
0.1 + 0.2 === 0.3 // → false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // → true`,
      equiv: {
        python: `# Les int Python sont exacts quelle que soit leur taille
print(2 ** 53 == 2 ** 53 + 1)   # False
print(2 ** 64)                  # 18446744073709551616
print(7 // 2)                   # 3 (division entière)
print(0.1 + 0.2)                # 0.30000000000000004
import math
print(math.isclose(0.1 + 0.2, 0.3))  # True`,
        java: `long big = Long.MAX_VALUE;            // 2^63 - 1
System.out.println(big + 1);           // -9223372036854775808 : débordement silencieux
System.out.println(Math.addExact(1, 2)); // lève ArithmeticException en cas de débordement
java.math.BigInteger b = java.math.BigInteger.TWO.pow(64);
System.out.println(b);                 // 18446744073709551616
System.out.println(0.1 + 0.2);         // 0.30000000000000004`,
        rust: `fn main() {
    let x: u64 = u64::MAX;
    println!("{:?}", x.checked_add(1));  // None
    println!("{}", x.wrapping_add(1));   // 0
    println!("{}", 0.1 + 0.2);           // 0.30000000000000004
    // en mode debug, x + 1 provoque un panic « attempt to add with overflow »
}`,
        php: `<?php
var_dump(PHP_INT_MAX);          // int(9223372036854775807)
var_dump(PHP_INT_MAX + 1);      // float(9.2233720368547758E+18) : bascule en flottant
var_dump(intdiv(7, 2));         // int(3)
var_dump(0.1 + 0.2 == 0.3);     // bool(false)`,
      },
    },
    {
      mnemo: '« 2^53 : au-delà, les entiers JS mentent. » Sommes et produits qui peuvent dépasser 9 × 10¹⁵ : modulo à chaque étape, ou BigInt.',
      piege: 'Comparer des flottants avec `===` : `0.1 + 0.2 === 0.3` est faux. Pour de l’argent, travaillez en centimes entiers ; pour des calculs, comparez avec une tolérance.',
    },

    { h: 'PGCD, PPCM, crible et modulo négatif', id: 'bits-arithmetique' },
    {
      p: 'L’**algorithme d’Euclide** repose sur `pgcd(a, b) = pgcd(b, a mod b)` et `pgcd(a, 0) = a` : il fait O(log min(a, b)) itérations. Le PPCM s’en déduit : `ppcm(a, b) = a / pgcd(a, b) * b` (diviser **avant** de multiplier limite le risque de dépasser 2^53). Le **crible d’Ératosthène** trouve tous les nombres premiers jusqu’à n en O(n log log n) : pour chaque premier `p`, on raye ses multiples à partir de `p * p`.',
    },
    {
      p: 'Attention, en JavaScript (comme en Java, en C et en PHP), `%` est un **reste** qui prend le signe du dividende : `-7 % 3` vaut `-1`, pas `2`. Pour un vrai modulo mathématique (indices circulaires, hachage), on écrit `((a % m) + m) % m`. Python, lui, renvoie un résultat du signe du diviseur : `-7 % 3` vaut 2.',
    },
    {
      title: 'Euclide, crible et modulo positif',
      code: `function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b]
  return Math.abs(a)
}
const lcm = (a, b) => (a / gcd(a, b)) * b

function sieve(n) {
  const isPrime = new Array(n + 1).fill(true)
  isPrime[0] = false
  isPrime[1] = false
  for (let p = 2; p * p <= n; p++) {
    if (!isPrime[p]) continue
    for (let k = p * p; k <= n; k += p) isPrime[k] = false
  }
  const primes = []
  for (let i = 2; i <= n; i++) if (isPrime[i]) primes.push(i)
  return primes
}

const mod = (a, m) => ((a % m) + m) % m

gcd(48, 18) // → 6
lcm(4, 6) // → 12
sieve(30) // → [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ]
-7 % 3 // → -1
mod(-7, 3) // → 2`,
      equiv: {
        python: `from math import gcd, lcm  # lcm depuis Python 3.9

def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for k in range(p * p, n + 1, p):
                is_prime[k] = False
        p += 1
    return [i for i in range(2, n + 1) if is_prime[i]]

print(-7 % 3)   # 2 : en Python, le reste a le signe du diviseur`,
        java: `static int gcd(int a, int b) {
    while (b != 0) { int t = a % b; a = b; b = t; }
    return Math.abs(a);
}
// -7 % 3 vaut -1 en Java ; Math.floorMod(-7, 3) vaut 2
// BigInteger.valueOf(48).gcd(BigInteger.valueOf(18)) pour les grands nombres`,
        rust: `fn gcd(mut a: i64, mut b: i64) -> i64 {
    while b != 0 {
        let t = a % b;
        a = b;
        b = t;
    }
    a.abs()
}
// -7 % 3 vaut -1 en Rust ; (-7i32).rem_euclid(3) vaut 2`,
        php: `<?php
function gcd(int $a, int $b): int {
    while ($b !== 0) { [$a, $b] = [$b, $a % $b]; }
    return abs($a);
}
var_dump(-7 % 3);        // int(-1)
var_dump(fmod(-7, 3));   // float(-1) : même signe que le dividende`,
      },
    },
    {
      mnemo: '« Euclide : on garde le reste jusqu’à zéro. » Crible : rayer à partir de `p * p`. Modulo JS : `((a % m) + m) % m`.',
      piege: '`-1 % n` vaut `-1` en JS : un index circulaire `(i - 1) % n` devient négatif pour `i = 0`, et `arr[-1]` vaut `undefined`. Écrivez `(i - 1 + n) % n`.',
    },

    { h: 'Exponentiation rapide et produits modulaires', id: 'bits-exponentiation' },
    {
      p: 'Calculer `base^exp mod m` en multipliant `exp` fois est O(exp), impraticable pour `exp = 10¹⁸`. L’**exponentiation rapide** lit `exp` en binaire : à chaque bit, on élève la base au carré, et si le bit vaut 1, on multiplie le résultat par la base courante. O(log exp) multiplications.',
    },
    {
      p: 'Le piège JS : avec `m ≈ 10⁹ + 7`, un produit de deux résidus atteint 10¹⁸, bien au-delà de 2^53. `(a * b) % m` donne alors un résultat **faux sans erreur**. Solutions : `BigInt` pour le produit, ou découper un facteur en deux moitiés de 16 bits (`a * (b >>> 16)` et `a * (b & 0xffff)`, chacun inférieur à 2^53).',
    },
    {
      title: 'powMod : la version naïve se trompe, BigInt corrige',
      code: `function powModUnsafe(base, exp, m) {
  let result = 1
  base %= m
  while (exp > 0) {
    if (exp & 1) result = (result * base) % m // produit jusqu'à 10^18 : imprécis
    base = (base * base) % m
    exp >>= 1
  }
  return result
}

function powMod(base, exp, m) {
  let result = 1n
  let b = BigInt(base) % BigInt(m)
  let e = BigInt(exp)
  const M = BigInt(m)
  while (e > 0n) {
    if (e & 1n) result = (result * b) % M
    b = (b * b) % M
    e >>= 1n
  }
  return Number(result)
}

const MOD = 1000000007
powMod(2, 10, 1000) // → 24
powMod(3, 200, 13) // → 9
powMod(2, MOD - 2, MOD) // → 500000004
powModUnsafe(2, MOD - 2, MOD) === powMod(2, MOD - 2, MOD) // → false`,
      equiv: {
        python: `# pow à trois arguments est natif, exact et en O(log exp)
print(pow(2, 10, 1000))                    # 24
MOD = 10**9 + 7
print(pow(2, MOD - 2, MOD))                # 500000004 (inverse de 2 modulo MOD)

def pow_mod(base, exp, m):
    result, base = 1, base % m
    while exp > 0:
        if exp & 1:
            result = result * base % m
        base = base * base % m
        exp >>= 1
    return result`,
        java: `static long powMod(long base, long exp, long m) {
    long result = 1;
    base %= m;
    while (exp > 0) {
        if ((exp & 1) == 1) result = result * base % m; // < (10^9)^2 < 2^63 : tient dans un long
        base = base * base % m;
        exp >>= 1;
    }
    return result;
}
// BigInteger.valueOf(2).modPow(BigInteger.valueOf(MOD - 2), BigInteger.valueOf(MOD))`,
        rust: `fn pow_mod(mut base: u64, mut exp: u64, m: u64) -> u64 {
    let mut result = 1u64;
    base %= m;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result * base % m; // m < 2^32 : le produit tient dans un u64
        }
        base = base * base % m;
        exp >>= 1;
    }
    result
}`,
      },
    },
    {
      mnemo: '« Carré à chaque tour, multiplier quand le bit vaut 1. » En JS, tout produit de deux nombres proches de 10⁹ passe par BigInt.',
      piege: 'Le test `exp & 1` et le décalage `exp >>= 1` utilisent les 32 bits signés : avec un exposant supérieur à 2^31, ils sont faux. Pour de grands exposants, utilisez `exp % 2` et `Math.floor(exp / 2)`, ou BigInt.',
    },

    { h: 'Arithmétique sur les chiffres', id: 'bits-chiffres' },
    {
      p: 'Inverser un entier, tester un palindrome numérique ou sommer des chiffres se fait sans conversion en chaîne : `n % 10` donne le dernier chiffre, `Math.trunc(n / 10)` le retire. Attention au signe (travaillez sur `Math.abs`) et aux bornes : l’énoncé classique « reverse integer » demande de renvoyer 0 si le résultat sort de l’intervalle 32 bits signé [−2^31, 2^31 − 1].',
    },
    {
      title: 'Inverser un entier et palindrome numérique',
      code: `function reverseInt(x) {
  let n = Math.abs(x)
  let r = 0
  while (n > 0) {
    r = r * 10 + (n % 10)
    n = Math.trunc(n / 10)
  }
  r = x < 0 ? -r : r
  return r < -(2 ** 31) || r > 2 ** 31 - 1 ? 0 : r
}

function isPalindromeNumber(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false
  let half = 0
  while (x > half) {
    half = half * 10 + (x % 10)
    x = Math.trunc(x / 10)
  }
  return x === half || x === Math.trunc(half / 10)
}

reverseInt(-123) // → -321
reverseInt(1534236469) // → 0
isPalindromeNumber(12321) // → true
isPalindromeNumber(10) // → false`,
      equiv: {
        python: `def reverse_int(x):
    n, r = abs(x), 0
    while n > 0:
        r = r * 10 + n % 10
        n //= 10
    r = -r if x < 0 else r
    return 0 if r < -2**31 or r > 2**31 - 1 else r
# attention : en Python, -123 // 10 vaut -13 (arrondi vers -inf), d'où le passage par abs`,
        java: `static int reverseInt(int x) {
    long r = 0; // un long pour détecter le dépassement des 32 bits
    while (x != 0) {
        r = r * 10 + x % 10; // en Java, x % 10 garde le signe de x
        x /= 10;
    }
    return r < Integer.MIN_VALUE || r > Integer.MAX_VALUE ? 0 : (int) r;
}`,
        bash: `reverse_int() {
  local x=$1 n r=0
  n=\${x#-}
  while (( n > 0 )); do
    r=$(( r * 10 + n % 10 ))
    n=$(( n / 10 ))
  done
  [[ $x == -* ]] && r=$(( -r ))
  echo "$r"
}
# ou simplement : echo 123 | rev`,
      },
    },
    {
      mnemo: '« `% 10` lit le dernier chiffre, `trunc(/ 10)` l’efface. » Pour un palindrome, n’inverser que la moitié évite tout dépassement.',
      piege: '`Math.floor(-123 / 10)` vaut -13, pas -12 : pour les négatifs, utilisez `Math.trunc` (ou travaillez sur la valeur absolue). Et en Python, `//` arrondit aussi vers −∞.',
    },
  ],
  mnemo: 'Opérateurs bit à bit = 32 bits signés ; `>>> 0` pour le non signé ; `n & (n - 1)` éteint le dernier 1 ; au-delà de 2^53, modulo à chaque étape ou BigInt ; modulo positif = `((a % m) + m) % m`.',
  piege: 'Les erreurs silencieuses : `1 << 31` négatif, `~~x` et `x | 0` qui tronquent au-delà de 32 bits, un produit modulaire supérieur à 2^53 qui perd des chiffres, et `-7 % 3` qui vaut -1.',
}

const bitsKatas: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'av-bits-nombre-unique',
    title: 'L’élément sans jumeau',
    difficulty: 'facile',
    theme: 'bits',
    pattern: 'XOR',
    statement: `Dans le tableau d’entiers \`nums\`, chaque valeur apparaît **exactement deux fois**, sauf une qui n’apparaît qu’une fois. Écrivez \`singleNumber(nums)\` qui renvoie cette valeur, en **O(n) temps et O(1) mémoire** supplémentaire (pas de \`Set\` ni de \`Map\`).

Contraintes : \`1 <= nums.length <= 3 × 10⁴\` (longueur impaire), valeurs entières dans [−2^31, 2^31 − 1].

Exemples :

- \`singleNumber([2, 2, 1])\` donne \`1\` ;
- \`singleNumber([4, 1, 2, 1, 2])\` donne \`4\` ;
- \`singleNumber([-3, 7, 7])\` donne \`-3\`.`,
    starter: `function singleNumber(nums) {
  // TODO : en O(1) mémoire
  return nums[0]
}`,
    solution: `function singleNumber(nums) {
  // x ^ x = 0 et x ^ 0 = x : les paires s'annulent, il reste l'intruse
  let x = 0
  for (const v of nums) x ^= v
  return x
}`,
    solutionEquiv: {
      python: `from functools import reduce
from operator import xor

def single_number(nums):
    return reduce(xor, nums, 0)`,
      java: `static int singleNumber(int[] nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}`,
      rust: `fn single_number(nums: &[i32]) -> i32 {
    nums.iter().fold(0, |acc, &v| acc ^ v)
}`,
      php: `function singleNumber(array $nums): int {
    $x = 0;
    foreach ($nums as $v) $x ^= $v;
    return $x;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(singleNumber([2, 2, 1]), 1)
assertEqual(singleNumber([4, 1, 2, 1, 2]), 4)` },
      { name: 'un seul élément', code: `assertEqual(singleNumber([9]), 9)` },
      { name: 'négatifs et zéro', code: `assertEqual(singleNumber([-3, 7, 7]), -3)
assertEqual(singleNumber([0, 5, 5]), 0)
assertEqual(singleNumber([-1, -1, -2]), -2)` },
      { name: 'bornes 32 bits', code: `assertEqual(singleNumber([2147483647, -2147483648, 2147483647]), -2147483648)` },
      { name: 'l’intruse n’est pas au début', code: `assertEqual(singleNumber([1, 1, 2, 3, 3]), 2)
assertEqual(singleNumber([6, 8, 6]), 8)` },
    ],
    hints: [
      'Que vaut `x ^ x` ? Et `x ^ 0` ?',
      'Le XOR est commutatif et associatif : l’ordre des éléments ne compte pas, les paires s’annulent.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Points à évoquer** :

- alternatives : un \`Set\` (ajouter/retirer) ou une \`Map\` de comptage, en O(n) mémoire ; trier puis comparer les voisins, en O(n log n) ; \`2 × somme(distincts) − somme(tous)\`, qui risque le dépassement dans d’autres langages ;
- en JS, le XOR fonctionne sur 32 bits signés : parfait pour des entiers de cet intervalle, faux pour des valeurs au-delà de 2^31 ou non entières ;
- variantes : chaque valeur trois fois sauf une (compter chaque bit modulo 3), deux valeurs uniques (le XOR total \`x\` ; le bit \`x & -x\` sépare les deux groupes), nombre manquant de 0..n (XOR des indices et des valeurs).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-bits-compter-bits',
    title: 'Compter les bits de 0 à n',
    difficulty: 'facile',
    theme: 'bits',
    pattern: 'bits + DP',
    statement: `Écrivez \`countBits(n)\` qui renvoie un tableau \`ans\` de longueur \`n + 1\` où \`ans[i]\` est le **nombre de bits à 1** dans l’écriture binaire de \`i\`, pour \`0 <= i <= n\`.

Contraintes : \`0 <= n <= 10⁶\`. Visez O(n) au total : pas de \`toString(2)\` ni de boucle sur les 32 bits de chaque nombre.

Exemples :

- \`countBits(2)\` donne \`[0, 1, 1]\` ;
- \`countBits(5)\` donne \`[0, 1, 1, 2, 1, 2]\`.`,
    starter: `function countBits(n) {
  // TODO : ans[i] = nombre de bits à 1 de i
  return new Array(n + 1).fill(1)
}`,
    solution: `function countBits(n) {
  const ans = new Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    // i a les mêmes bits que i >> 1, plus son bit de poids faible
    ans[i] = ans[i >> 1] + (i & 1)
  }
  return ans
}`,
    solutionEquiv: {
      python: `def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans`,
      java: `static int[] countBits(int n) {
    int[] ans = new int[n + 1];
    for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    return ans;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(countBits(2), [0, 1, 1])
assertEqual(countBits(5), [0, 1, 1, 2, 1, 2])` },
      { name: 'n = 0', code: `assertEqual(countBits(0), [0])` },
      { name: 'puissances de 2 et voisins', code: `const r = countBits(16)
assertEqual(r[7], 3)
assertEqual(r[8], 1)
assertEqual(r[15], 4)
assertEqual(r[16], 1)
assertEqual(r.length, 17)` },
      { name: 'grande entrée : n = 10⁶', code: `const t0 = performance.now()
const r = countBits(1000000)
const elapsed = performance.now() - t0
assertEqual(r.length, 1000001)
assertEqual(r[1000000], 7)
assertEqual(r[524287], 19)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Comment passer du nombre de bits de `i >> 1` à celui de `i` ?',
      '`i >> 1` a exactement les bits de `i` sauf le dernier, qui vaut `i & 1`. Autre relation possible : `ans[i] = ans[i & (i - 1)] + 1` (Kernighan).',
    ],
    discussion: `**Complexité** : O(n) en temps, O(n) pour le tableau de sortie (imposé par l’énoncé).

**Points à évoquer** :

- c’est une petite DP : l’état \`ans[i]\` se déduit d’un état plus petit déjà calculé ;
- appeler Kernighan sur chaque nombre coûte O(n × bits), soit O(n log n) ;
- \`i.toString(2)\` puis compter les 1 crée une chaîne par nombre : correct mais lent et gourmand ;
- les langages offrent le comptage natif : \`Integer.bitCount\`, \`u32::count_ones\`, \`int.bit_count()\` (Python 3.10).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-bits-pow-mod',
    title: 'Exponentiation rapide modulaire',
    difficulty: 'difficile',
    theme: 'bits',
    pattern: 'exponentiation rapide',
    statement: `Écrivez \`powMod(base, exp, m)\` qui renvoie \`base^exp mod m\` sous forme de **number**.

Contraintes : \`0 <= base <= 10⁹\`, \`0 <= exp <= 2^53 − 1\` (un \`number\` entier sûr), \`1 <= m <= 10⁹ + 7\`. Par convention, \`x^0 = 1\` (donc \`powMod(x, 0, m)\` vaut \`1 % m\`).

Deux pièges JavaScript vous attendent :

- un produit de deux résidus proches de 10⁹ dépasse 2^53 et perd des chiffres ;
- les opérateurs \`&\` et \`>>\` tronquent l’exposant à 32 bits signés.

Exemples :

- \`powMod(2, 10, 1000)\` donne \`24\` ;
- \`powMod(2, 1000000005, 1000000007)\` donne \`500000004\` (l’inverse de 2 modulo 10⁹ + 7).`,
    starter: `function powMod(base, exp, m) {
  // TODO : version rapide et exacte
  let result = 1
  for (let i = 0; i < Math.min(exp, 1000); i++) result = (result * base) % m
  return result
}`,
    solution: `function powMod(base, exp, m) {
  // BigInt pour les produits (jusqu'à 10^18) et pour l'exposant (jusqu'à 2^53)
  const M = BigInt(m)
  let b = BigInt(base) % M
  let e = BigInt(exp)
  let result = 1n % M
  while (e > 0n) {
    if (e & 1n) result = (result * b) % M
    b = (b * b) % M
    e >>= 1n
  }
  return Number(result)
}`,
    solutionEquiv: {
      python: `def pow_mod(base, exp, m):
    # natif : pow(base, exp, m)
    result, base = 1 % m, base % m
    while exp > 0:
        if exp & 1:
            result = result * base % m
        base = base * base % m
        exp >>= 1
    return result`,
      java: `static long powMod(long base, long exp, long m) {
    long result = 1 % m;
    base %= m;
    while (exp > 0) {
        if ((exp & 1) == 1) result = result * base % m; // m <= 10^9 + 7 : produit < 2^63
        base = base * base % m;
        exp >>= 1;
    }
    return result;
}`,
      rust: `fn pow_mod(base: u64, mut exp: u64, m: u64) -> u64 {
    let mut result = 1 % m;
    let mut b = base % m;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result * b % m;
        }
        b = b * b % m;
        exp >>= 1;
    }
    result
}`,
      php: `function powMod(int $base, int $exp, int $m): int {
    $result = 1 % $m;
    $base %= $m;
    while ($exp > 0) {
        if ($exp & 1) $result = $result * $base % $m; // entiers PHP 64 bits : produit < 2^63
        $base = $base * $base % $m;
        $exp >>= 1;
    }
    return $result;
}
// ou bcpowmod / gmp_powm pour des nombres arbitraires`,
    },
    tests: [
      { name: 'petits cas', code: `assertEqual(powMod(2, 10, 1000), 24)
assertEqual(powMod(3, 4, 100), 81)` },
      { name: 'exposant nul et modulo 1', code: `assertEqual(powMod(10, 0, 7), 1)
assertEqual(powMod(10, 5, 1), 0)
assertEqual(powMod(0, 0, 5), 1)` },
      { name: 'produits supérieurs à 2^53', code: `assertEqual(powMod(2, 1000000005, 1000000007), 500000004)
assertEqual(powMod(123456789, 987654321, 1000000007), 652541198)` },
      { name: 'exposant supérieur à 2^31', code: `assertEqual(powMod(7, 2147483653, 1000000007), 639469135)
assertEqual(powMod(3, 1000000000000000, 1000000007), 468606845)` },
      { name: 'exposant maximal', code: `const t0 = performance.now()
const r = powMod(5, 9007199254740991, 1000000007)
const elapsed = performance.now() - t0
assertEqual(r, 519045579)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Écrivez l’exposant en binaire : `base^13 = base^8 × base^4 × base^1`. En élevant la base au carré à chaque étape, on obtient toutes les puissances `base^(2^k)`.',
      'Boucle : si le bit de poids faible de `exp` vaut 1, multiplier le résultat par la base courante ; puis base = base², exp = exp / 2. O(log exp) tours.',
      'En JS, faites les produits en BigInt (`10⁹ × 10⁹` dépasse 2^53) et ne testez pas les bits de l’exposant avec `&` ou `>>` sur un `number` supérieur à 2^31.',
    ],
    discussion: `**Complexité** : O(log exp) multiplications modulaires, soit au plus 53 tours ici ; O(1) en mémoire.

**Points à évoquer** :

- la version naïve fait \`exp\` multiplications : impossible pour 2^53 ;
- en JS, \`(a * b) % m\` avec \`a, b < 10⁹ + 7\` est **faux sans erreur** au-delà de 2^53 ; alternatives sans BigInt : découper un facteur en deux moitiés de 16 bits, ou la multiplication « paysanne » (O(log b) additions modulaires) ;
- en Java, Rust et PHP, un entier 64 bits suffit tant que \`m² < 2^63\` ; en Python, les entiers sont exacts et \`pow(b, e, m)\` est natif ;
- usages : inverse modulaire par le petit théorème de Fermat (\`a^(p−2) mod p\` pour p premier), coefficients binomiaux modulo p, hachage, RSA ;
- même idée pour les matrices : Fibonacci en O(log n).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-bits-produit-mots',
    title: 'Produit maximal de longueurs de mots disjoints',
    difficulty: 'moyen',
    theme: 'bits',
    pattern: 'masque de bits',
    statement: `Écrivez \`maxProduct(words)\` qui renvoie la valeur maximale de \`words[i].length * words[j].length\` pour deux mots (i ≠ j) **qui n’ont aucune lettre en commun**. Renvoyez \`0\` s’il n’existe aucune telle paire.

Contraintes : \`2 <= words.length <= 3000\`, \`1 <= words[i].length <= 1000\`, lettres minuscules a à z.

Exemples :

- \`maxProduct(['abcw', 'baz', 'foo', 'bar', 'xtfn', 'abcdef'])\` donne \`16\` (\`abcw\` et \`xtfn\`) ;
- \`maxProduct(['a', 'ab', 'abc', 'd', 'cd', 'bcd', 'abcd'])\` donne \`4\` (\`ab\` et \`cd\`) ;
- \`maxProduct(['a', 'aa', 'aaa', 'aaaa'])\` donne \`0\`.`,
    starter: `function maxProduct(words) {
  // TODO : ignorer les paires qui partagent une lettre
  let best = 0
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      best = Math.max(best, words[i].length * words[j].length)
    }
  }
  return best
}`,
    solution: `function maxProduct(words) {
  // masks[i] : bit k à 1 si la lettre 'a' + k apparaît dans words[i]
  const masks = words.map((w) => {
    let m = 0
    for (let k = 0; k < w.length; k++) m |= 1 << (w.charCodeAt(k) - 97)
    return m
  })
  let best = 0
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if ((masks[i] & masks[j]) === 0) best = Math.max(best, words[i].length * words[j].length)
    }
  }
  return best
}`,
    solutionEquiv: {
      python: `def max_product(words):
    masks = []
    for w in words:
        m = 0
        for ch in w:
            m |= 1 << (ord(ch) - ord('a'))
        masks.append(m)
    best = 0
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            if masks[i] & masks[j] == 0:
                best = max(best, len(words[i]) * len(words[j]))
    return best`,
      java: `static int maxProduct(String[] words) {
    int n = words.length;
    int[] masks = new int[n];
    for (int i = 0; i < n; i++)
        for (char c : words[i].toCharArray()) masks[i] |= 1 << (c - 'a');
    int best = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if ((masks[i] & masks[j]) == 0) best = Math.max(best, words[i].length() * words[j].length());
    return best;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(maxProduct(['abcw', 'baz', 'foo', 'bar', 'xtfn', 'abcdef']), 16)
assertEqual(maxProduct(['a', 'ab', 'abc', 'd', 'cd', 'bcd', 'abcd']), 4)` },
      { name: 'aucune paire disjointe', code: `assertEqual(maxProduct(['a', 'aa', 'aaa', 'aaaa']), 0)
assertEqual(maxProduct(['ab', 'ba']), 0)` },
      { name: 'lettres répétées et lettre z', code: `assertEqual(maxProduct(['zzzz', 'yy', 'zy']), 8)
assertEqual(maxProduct(['abc', 'xyz']), 9)` },
      { name: 'deux mots seulement', code: `assertEqual(maxProduct(['hello', 'world']), 0)
assertEqual(maxProduct(['kata', 'pop']), 12)` },
      { name: 'grande entrée : 2000 mots', code: `const words = []
let x = 42
for (let i = 0; i < 2000; i++) {
  x = (x * 48271) % 2147483647
  const len = (x % 8) + 1
  let w = ''
  for (let k = 0; k < len; k++) {
    x = (x * 48271) % 2147483647
    w += String.fromCharCode(97 + (x % 26))
  }
  words.push(w)
}
const t0 = performance.now()
const r = maxProduct(words)
const elapsed = performance.now() - t0
assertEqual(r, 64)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Comparer deux mots lettre à lettre pour chaque paire coûte cher. Pouvez-vous résumer l’ensemble des lettres d’un mot en un seul nombre ?',
      '26 lettres tiennent dans 26 bits : `mask |= 1 << (code - 97)`. Deux mots sont disjoints si `(maskA & maskB) === 0`.',
    ],
    discussion: `**Complexité** : O(L) pour construire les masques (L = nombre total de lettres), puis O(n²) paires testées chacune en O(1) ; O(n) en mémoire.

**Points à évoquer** :

- sans masques, chaque paire coûte O(longueur des mots) ou O(26) avec des tableaux de présence ;
- 26 bits tiennent dans les 32 bits signés des opérateurs JS ; avec plus de 31 symboles, il faudrait BigInt ou plusieurs entiers ;
- optimisation : pour chaque masque, ne garder que la longueur maximale (\`Map\` masque → longueur), ce qui réduit le nombre de paires quand beaucoup de mots ont les mêmes lettres ;
- la parenthèse dans \`(masks[i] & masks[j]) === 0\` est obligatoire : \`===\` est prioritaire sur \`&\`.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-bits-crible',
    title: 'Compter les nombres premiers',
    difficulty: 'moyen',
    theme: 'bits',
    pattern: 'crible d’Ératosthène',
    statement: `Écrivez \`countPrimes(n)\` qui renvoie le nombre de nombres premiers **strictement inférieurs** à \`n\`.

Contraintes : \`0 <= n <= 5 × 10⁶\`. Tester chaque nombre par divisions successives est trop lent pour la plus grande entrée.

Exemples :

- \`countPrimes(10)\` donne \`4\` (2, 3, 5, 7) ;
- \`countPrimes(0)\` et \`countPrimes(2)\` donnent \`0\` ;
- \`countPrimes(100)\` donne \`25\`.`,
    starter: `function countPrimes(n) {
  // TODO : crible d'Ératosthène
  let count = 0
  for (let i = 2; i < n; i++) if (i === 2 || i % 2 === 1) count++
  return count
}`,
    solution: `function countPrimes(n) {
  if (n < 3) return 0
  // composite[i] = 1 si i a été rayé ; Uint8Array : compact et initialisé à 0
  const composite = new Uint8Array(n)
  let count = 0
  for (let p = 2; p < n; p++) {
    if (composite[p]) continue
    count++
    // les multiples plus petits que p * p ont déjà été rayés par un premier plus petit
    for (let k = p * p; k < n; k += p) composite[k] = 1
  }
  return count
}`,
    solutionEquiv: {
      python: `def count_primes(n):
    if n < 3:
        return 0
    is_prime = bytearray([1]) * n
    is_prime[0] = is_prime[1] = 0
    p = 2
    while p * p < n:
        if is_prime[p]:
            is_prime[p * p::p] = bytes(len(range(p * p, n, p)))
        p += 1
    return sum(is_prime)`,
      java: `static int countPrimes(int n) {
    if (n < 3) return 0;
    boolean[] composite = new boolean[n];
    int count = 0;
    for (int p = 2; p < n; p++) {
        if (composite[p]) continue;
        count++;
        for (long k = (long) p * p; k < n; k += p) composite[(int) k] = true; // p * p déborde un int
    }
    return count;
}`,
      rust: `fn count_primes(n: usize) -> usize {
    if n < 3 {
        return 0;
    }
    let mut composite = vec![false; n];
    let mut count = 0;
    for p in 2..n {
        if composite[p] {
            continue;
        }
        count += 1;
        let mut k = p * p;
        while k < n {
            composite[k] = true;
            k += p;
        }
    }
    count
}`,
      php: `function countPrimes(int $n): int {
    if ($n < 3) return 0;
    $composite = array_fill(0, $n, false);
    $count = 0;
    for ($p = 2; $p < $n; $p++) {
        if ($composite[$p]) continue;
        $count++;
        for ($k = $p * $p; $k < $n; $k += $p) $composite[$k] = true;
    }
    return $count;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(countPrimes(10), 4)
assertEqual(countPrimes(100), 25)` },
      { name: 'petites bornes', code: `assertEqual(countPrimes(0), 0)
assertEqual(countPrimes(1), 0)
assertEqual(countPrimes(2), 0)
assertEqual(countPrimes(3), 1)` },
      { name: 'strictement inférieurs', code: `assertEqual(countPrimes(11), 4)
assertEqual(countPrimes(12), 5)` },
      { name: 'carrés de premiers', code: `assertEqual(countPrimes(26), 9)
assertEqual(countPrimes(50), 15)` },
      { name: 'grande entrée : n = 5 × 10⁶', code: `const t0 = performance.now()
const r = countPrimes(5000000)
const elapsed = performance.now() - t0
assertEqual(r, 348513)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Plutôt que de tester chaque nombre, rayez les multiples de chaque premier trouvé.',
      'Pour un premier `p`, il suffit de commencer à `p * p` : les multiples plus petits ont déjà un facteur premier plus petit.',
      'Un `Uint8Array(n)` est compact et déjà rempli de zéros.',
    ],
    discussion: `**Complexité** : O(n log log n) en temps, O(n) en mémoire (un octet par nombre avec \`Uint8Array\`, un bit avec un vrai tableau de bits).

**Points à évoquer** :

- la division par essais jusqu’à √i coûte O(n√n) au total : environ 10¹⁰ opérations pour 5 × 10⁶ ;
- en Java ou en C, \`p * p\` déborde pour \`p > 46340\` sur 32 bits : d’où le \`long\` ; en JS, les nombres sont des flottants et \`p * p\` reste exact ;
- variantes : crible segmenté pour des intervalles [L, R] avec R jusqu’à 10¹², crible linéaire (chaque composé rayé une seule fois, donne aussi le plus petit facteur premier), factorisation rapide grâce au plus petit facteur premier ;
- test de primalité d’un seul nombre : divisions jusqu’à √n, ou Miller-Rabin pour de très grands nombres.`,
  },
]

const bitsQuiz: QuizItem[] = [
  {
    id: 'av-bits-q-decalage',
    theme: 'bits',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `console.log(1 << 31, (1 << 31) >>> 0, 1 << 32)`,
    choices: ['2147483648 2147483648 4294967296', '-2147483648 2147483648 1', '-2147483648 -2147483648 0', '2147483648 -2147483648 1'],
    answer: 1,
    why: 'Les décalages travaillent sur 32 bits signés : le bit 31 est le bit de signe, donc `1 << 31` vaut -2147483648. `>>> 0` relit ces 32 bits comme non signés (2147483648). Enfin, la quantité de décalage est prise modulo 32 : `1 << 32` équivaut à `1 << 0`, soit 1.',
  },
  {
    id: 'av-bits-q-modulo',
    theme: 'bits',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const n = 5
console.log(-7 % 3, ((-7 % 3) + 3) % 3, (0 - 1) % n)`,
    choices: ['2 2 4', '-1 2 -1', '-1 -1 4', '2 -1 -1'],
    answer: 1,
    why: 'En JavaScript, `%` est un reste du signe du **dividende** : `-7 % 3` vaut -1 et `-1 % 5` vaut -1. La formule `((a % m) + m) % m` ramène le résultat dans [0, m - 1]. Python donnerait directement 2 et 4.',
  },
  {
    id: 'av-bits-q-operateurs',
    theme: 'bits',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `console.log(5 & 3, 5 | 3, 5 ^ 3, ~5)`,
    choices: ['1 7 6 -6', '1 7 6 -5', '8 7 6 -6', '1 7 125 4'],
    answer: 0,
    why: '5 = 101 et 3 = 011. ET : 001 = 1 ; OU : 111 = 7 ; XOR : 110 = 6 (et non une puissance : `^` n’est pas l’exponentiation, c’est `**`). `~x` vaut `-x - 1` en complément à deux, donc `~5` vaut -6.',
  },
  {
    id: 'av-bits-q-tronque',
    theme: 'bits',
    kind: 'qcm',
    q: 'Pourquoi `Math.trunc(x)` est-il préférable à `x | 0` pour tronquer `x = 3000000000.5` ?',
    choices: [
      '`x | 0` arrondit à l’entier le plus proche au lieu de tronquer',
      '`x | 0` convertit en entier 32 bits signé : au-delà de 2^31 − 1, le résultat est négatif et sans rapport',
      '`x | 0` lève une RangeError au-delà de 2^31',
      'Il n’y a aucune différence, `x | 0` est juste plus rapide',
    ],
    answer: 1,
    why: 'Tous les opérateurs bit à bit commencent par une conversion ToInt32 (modulo 2^32, puis interprétation signée). `3000000000.5 | 0` vaut -1294967296. `Math.trunc` travaille sur le flottant 64 bits et reste exact jusqu’à 2^53.',
  },
  {
    id: 'av-bits-q-cx-kernighan',
    theme: 'bits',
    kind: 'complexite',
    q: 'Combien de tours fait cette boucle, en fonction de `n` (entier positif sur 32 bits) ?',
    code: `function popcount(n) {
  let count = 0
  while (n !== 0) {
    n &= n - 1
    count++
  }
  return count
}
popcount(0b1011000)`,
    choices: [
      'Exactement 32 tours, quel que soit n',
      'Autant de tours que de bits à 1 dans n (au plus 32) : O(nombre de bits à 1)',
      'O(n) tours',
      'O(log log n) tours',
    ],
    answer: 1,
    why: '`n & (n - 1)` éteint le bit à 1 de poids le plus faible : chaque tour supprime exactement un bit à 1. Pour `0b1011000`, trois tours. La boucle naïve qui teste chaque bit fait, elle, autant de tours que la position du bit le plus haut.',
  },
  {
    id: 'av-bits-q-cx-masques',
    theme: 'bits',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction pour un tableau de taille n ?',
    code: `function subsetSums(nums) {
  const n = nums.length
  const sums = []
  for (let mask = 0; mask < 1 << n; mask++) {
    let s = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) s += nums[i]
    sums.push(s)
  }
  return sums
}
subsetSums([3, 1, 4, 1, 5])`,
    choices: ['O(n²)', 'O(2ⁿ)', 'O(n × 2ⁿ)', 'O(n!)'],
    answer: 2,
    why: '2ⁿ masques, et pour chacun une boucle de n tests de bits : O(n × 2ⁿ). On peut descendre à O(2ⁿ) en réutilisant la somme du masque sans son bit le plus bas (`sums[mask] = sums[mask & (mask - 1)] + nums[indice de ce bit]`).',
  },
  {
    id: 'av-bits-q-bug-priorite',
    theme: 'bits',
    kind: 'bug',
    q: 'Cette fonction renvoie toujours `false` pour les puissances de 2. Pourquoi ?',
    code: `function isPowerOfTwo(n) {
  return n > 0 && n & (n - 1) === 0
}
isPowerOfTwo(8)`,
    choices: [
      'Il faudrait `n | (n - 1)`',
      'La comparaison `===` est prioritaire sur `&` : on calcule `n & ((n - 1) === 0)`, soit `n & false`, c’est-à-dire 0',
      'Il faudrait `n >>> 0` avant le test',
      '`n - 1` déborde pour n = 8',
    ],
    answer: 1,
    why: 'En JavaScript (comme en C et en Java), les opérateurs `&`, `^` et `|` ont une priorité **plus faible** que `===`. Pour 8, `(n - 1) === 0` vaut `false`, converti en 0, et `8 & 0` vaut 0 (falsy). Il faut écrire `(n & (n - 1)) === 0`.',
  },
]

const bitsPieges: Piege[] = [
  {
    id: 'av-bits-p-bit-31',
    title: 'Le bit 31 est le bit de signe',
    theme: 'bits',
    question: 'On construit un masque avec le bit 31 allumé. Qu’affiche ce code ?',
    code: `const mask = 1 << 31
console.log(mask, mask > 0)
console.log((mask | 1).toString(2))`,
    output: `-2147483648 false
-1111111111111111111111111111111`,
    explanation: 'Les opérateurs bit à bit produisent des entiers 32 bits **signés** : le bit 31 allumé donne un nombre négatif. `toString(2)` affiche alors le signe moins suivi de la valeur absolue, et non les 32 bits. Pour lire le motif binaire, convertissez en non signé avec `>>> 0` ; pour des masques de plus de 31 bits, passez à BigInt.',
    fix: {
      code: `const mask = (1 << 31) >>> 0
console.log(mask, mask > 0)
console.log(((mask | 1) >>> 0).toString(2))
console.log((1n << 40n).toString(2).length)`,
      output: `2147483648 true
10000000000000000000000000000001
41`,
      equiv: {
        python: `mask = 1 << 31            # int Python : pas de signe parasite
print(mask, mask > 0)       # 2147483648 True
print(bin(mask | 1)[2:])
print(len(bin(1 << 40)) - 2)`,
        java: `int mask = 1 << 31;                               // -2147483648
System.out.println(Integer.toUnsignedString(mask)); // 2147483648
System.out.println(Integer.toBinaryString(mask | 1)); // affiche les 32 bits
long big = 1L << 40;                              // au-delà de 31 bits : long`,
        bash: `echo $(( 1 << 31 ))   # 2147483648 : Bash calcule sur 64 bits`,
      },
    },
  },
  {
    id: 'av-bits-p-troncature',
    title: '`~~` et `| 0` au-delà de 32 bits',
    theme: 'bits',
    question: 'On tronque des nombres avec les raccourcis bit à bit. Qu’affiche ce code ?',
    code: `const x = 3000000000.7
console.log(~~x, x | 0, Math.trunc(x))
console.log(~~(2 ** 32 + 5), 2 ** 32 | 0)`,
    output: `-1294967296 -1294967296 3000000000
5 0`,
    explanation: '`~~x` et `x | 0` passent par ToInt32 : la valeur est réduite modulo 2^32 puis interprétée comme un entier signé. 3 000 000 000 dépasse 2^31 − 1 et devient -1 294 967 296 ; 2^32 + 5 devient 5 et 2^32 devient 0. Ces raccourcis ne sont sûrs que dans [−2^31, 2^31 − 1]. `Math.trunc` (vers zéro) ou `Math.floor` (vers −∞) travaillent sur le flottant et restent exacts jusqu’à 2^53.',
    fix: {
      code: `const x = 3000000000.7
console.log(Math.trunc(x), Math.floor(-2.5), Math.trunc(-2.5))`,
      output: `3000000000 -3 -2`,
      equiv: {
        python: `import math
x = 3000000000.7
print(int(x), math.floor(-2.5), math.trunc(-2.5))  # int() tronque vers zéro, sans limite de taille`,
        java: `double x = 3000000000.7;
System.out.println((long) x);   // 3000000000 : le cast vers long tronque
System.out.println((int) x);    // 2147483647 : en Java, le cast vers int SATURE (≠ JavaScript)`,
      },
    },
  },
  {
    id: 'av-bits-p-modulo-negatif',
    title: 'Un index circulaire négatif',
    theme: 'bits',
    question: 'On veut l’élément précédent dans un tableau circulaire. Qu’affiche ce code ?',
    code: `const ring = ['a', 'b', 'c', 'd']
const prev = (i) => ring[(i - 1) % ring.length]
console.log(prev(2), prev(0))
console.log(-7 % 3)`,
    output: `b undefined
-1`,
    explanation: 'En JavaScript, `%` renvoie un reste du signe du dividende : `(0 - 1) % 4` vaut -1, et `ring[-1]` vaut `undefined` (pas de lecture depuis la fin, contrairement à Python ou à `at(-1)`). Pour un vrai modulo, on ajoute le diviseur : `((a % m) + m) % m`, ou ici simplement `(i - 1 + n) % n` puisque `i - 1 >= -n`.',
    fix: {
      code: `const ring = ['a', 'b', 'c', 'd']
const mod = (a, m) => ((a % m) + m) % m
const prev = (i) => ring[mod(i - 1, ring.length)]
console.log(prev(2), prev(0))
console.log(mod(-7, 3))`,
      output: `b d
2`,
      equiv: {
        python: `ring = ['a', 'b', 'c', 'd']
prev = lambda i: ring[(i - 1) % len(ring)]  # % Python : signe du diviseur, déjà positif
print(prev(2), prev(0))
print(-7 % 3)`,
        java: `String[] ring = {"a", "b", "c", "d"};
int i = 0;
String prev = ring[Math.floorMod(i - 1, ring.length)]; // "d" ; (i - 1) % 4 lèverait ArrayIndexOutOfBoundsException`,
        rust: `let ring = ['a', 'b', 'c', 'd'];
let i: i32 = 0;
let prev = ring[(i - 1).rem_euclid(ring.len() as i32) as usize]; // 'd'`,
        php: `<?php
$ring = ['a', 'b', 'c', 'd'];
$mod = fn(int $a, int $m): int => (($a % $m) + $m) % $m;
echo $ring[$mod(0 - 1, count($ring))];  // d ; -1 % 4 vaut -1 en PHP aussi`,
      },
    },
  },
]

const bitsFlashcards: Flashcard[] = [
  { id: 'av-bits-f-32bits', theme: 'bits', front: 'Sur combien de bits travaillent `&`, `|`, `^`, `~`, `<<`, `>>` en JavaScript ?', back: 'Sur des **entiers 32 bits signés** (complément à deux) : les opérandes sont convertis par ToInt32, ce qui tronque tout ce qui dépasse. `>>>` produit un entier 32 bits **non signé**.' },
  {
    id: 'av-bits-f-non-signe',
    theme: 'bits',
    front: 'Comment lire le résultat d’une opération bit à bit comme un entier non signé ?',
    back: 'Avec `>>> 0`, qui réinterprète les 32 bits sans signe.',
    code: `-1 >>> 0; // → 4294967295
(1 << 31) >>> 0 // → 2147483648`,
  },
  { id: 'av-bits-f-kernighan', theme: 'bits', front: 'Que fait `n & (n - 1)` ?', back: 'Il **éteint le bit à 1 de poids le plus faible**. Résultat nul si et seulement si `n` est une puissance de 2 (ou 0). En boucle, il compte les bits à 1 en O(nombre de bits à 1).' },
  { id: 'av-bits-f-xor', theme: 'bits', front: 'Quelles propriétés du XOR servent en entretien ?', back: '`x ^ x = 0`, `x ^ 0 = x`, commutatif et associatif. D’où : trouver l’élément unique parmi des paires, le nombre manquant, échanger deux variables sans temporaire.' },
  {
    id: 'av-bits-f-safe',
    theme: 'bits',
    front: 'Jusqu’où les entiers `number` sont-ils exacts ?',
    back: 'Jusqu’à `Number.MAX_SAFE_INTEGER` = 2^53 − 1. Au-delà, des entiers voisins se confondent : modulo à chaque étape, ou BigInt.',
    code: `Number.MAX_SAFE_INTEGER // → 9007199254740991
2 ** 53 + 1 // → 9007199254740992`,
  },
  {
    id: 'av-bits-f-modulo',
    theme: 'bits',
    front: 'Comment obtenir un modulo toujours positif en JavaScript ?',
    back: '`((a % m) + m) % m`, car `%` garde le signe du dividende.',
    code: `-7 % 3; // → -1
((-7 % 3) + 3) % 3 // → 2`,
  },
  { id: 'av-bits-f-powmod', theme: 'bits', front: 'Principe et complexité de l’exponentiation rapide ?', back: 'On lit l’exposant en binaire : à chaque tour, base = base² et, si le bit courant vaut 1, résultat ×= base ; puis exposant décalé d’un bit. O(log exp) multiplications. En JS, produits modulo 10⁹ + 7 en BigInt.' },
]

const bitsLexique: LexiqueEntry[] = [
  { term: 'Complément à deux', theme: 'bits', def: 'Représentation des entiers signés où le bit de poids fort vaut −2^(n−1). Sur 32 bits, l’intervalle est [−2^31, 2^31 − 1], et `~x` vaut `-x - 1`. C’est la représentation qu’utilisent les opérateurs bit à bit de JavaScript.', see: ['Masque de bits'] },
  { term: 'Masque de bits', theme: 'bits', def: 'Entier dont les bits représentent un ensemble de drapeaux ou un sous-ensemble (bit i à 1 = élément i présent). Les 2ⁿ masques de 0 à `(1 << n) - 1` énumèrent tous les sous-ensembles de n éléments.', see: ['Complément à deux'] },
  { term: 'Crible d’Ératosthène', theme: 'bits', def: 'Algorithme qui trouve tous les nombres premiers jusqu’à n en rayant, pour chaque premier p, ses multiples à partir de p². Complexité O(n log log n) en temps, O(n) en mémoire.' },
  { term: 'Exponentiation rapide', theme: 'bits', def: 'Calcul de `base^exp` (souvent modulo m) en O(log exp) multiplications, en élevant la base au carré à chaque bit de l’exposant. Sert à l’inverse modulaire, au hachage et à Fibonacci en O(log n) par puissance de matrice.', see: ['Algorithme d’Euclide'] },
  { term: 'Algorithme d’Euclide', theme: 'bits', def: 'Calcul du PGCD par `pgcd(a, b) = pgcd(b, a mod b)` jusqu’à un reste nul, en O(log min(a, b)) étapes. Le PPCM s’en déduit : `a / pgcd(a, b) * b`. La version étendue donne aussi les coefficients de Bézout (inverse modulaire).' },
]

const bitsEntretien: EntretienQ[] = [
  {
    id: 'av-bits-e-depassement',
    section: 'techniques',
    q: 'Votre solution calcule des sommes et des produits modulo 10⁹ + 7 en JavaScript. Quels risques de précision voyez-vous et comment les traitez-vous ?',
    answer: 'Les `number` sont exacts jusqu’à 2^53 ≈ 9 × 10¹⁵. Une **somme** de deux résidus (< 2 × 10⁹) ne pose aucun problème. Un **produit** de deux résidus atteint 10¹⁸ : `(a * b) % m` est alors faux sans erreur. Je fais le produit en BigInt (`Number(BigInt(a) * BigInt(b) % BigInt(m))`), ou je découpe un facteur en deux moitiés de 16 bits pour que chaque produit partiel reste sous 2^53.\n\nJe vérifie aussi que je n’utilise pas `| 0`, `~~` ou `>>` sur des valeurs qui dépassent 2^31, et que le modulo d’une différence est ramené en positif.',
    code: `const M = 1000000007
const a = 999999999
const b = 999999999
const unsafe = (a * b) % M
const exact = Number((BigInt(a) * BigInt(b)) % BigInt(M))
unsafe === exact // → false
exact // → 64`,
    equiv: {
      python: `M = 10**9 + 7
a = b = 999_999_999
print(a * b % M)  # 64 : les int Python sont exacts, aucun piège ici`,
      java: `final long M = 1_000_000_007L;
long a = 999_999_999L, b = 999_999_999L;
System.out.println(a * b % M); // 64 : a * b < 2^63, un long suffit (un int déborderait)`,
    },
    attendu: 'Connaître la limite de 2^53, distinguer somme et produit, citer BigInt ; savoir que Java ou Rust ont le problème inverse (débordement d’entiers) et le traitent avec des entiers 64 bits.',
  },
  {
    id: 'av-bits-e-bitset',
    section: 'structures',
    q: 'Quand représenteriez-vous un ensemble par un masque de bits plutôt que par un `Set` ?',
    answer: 'Quand l’univers est **petit et fixe** : 26 lettres, au plus une vingtaine d’éléments, des drapeaux de permissions. Avantages : union, intersection et test d’appartenance en une instruction (`|`, `&`, `>>`), copie gratuite, utilisable comme clé de `Map` ou indice de tableau (DP sur masques), mémoire minimale.\n\nLimites en JS : 32 bits avec les opérateurs sur `number` (31 utiles sans souci de signe) ; au-delà, BigInt (plus lent) ou un `Uint32Array` qui sert de tableau de bits. Pour un univers grand ou inconnu, un `Set` reste le bon choix.',
    attendu: 'Des critères concrets (taille de l’univers, opérations ensemblistes, DP sur masques) et la limite des 32 bits en JavaScript.',
  },
  {
    id: 'av-bits-e-cx-pgcd',
    section: 'complexite',
    q: 'Quelle est la complexité de l’algorithme d’Euclide, et pourquoi ?',
    answer: 'O(log min(a, b)) itérations. Après deux étapes, le plus grand nombre est au moins divisé par deux : si `b <= a / 2`, alors `a mod b < b <= a / 2` ; sinon `a mod b = a - b < a / 2`. Le pire cas est atteint pour deux nombres de Fibonacci consécutifs (théorème de Lamé). Sur des entiers de taille arbitraire, chaque division coûte elle-même plus que O(1), ce qu’il faut préciser si l’on parle de BigInt.',
    attendu: 'La borne logarithmique avec une justification, même informelle ; bonus : Fibonacci comme pire cas.',
  },
]

// ═════════════════════════════ CHAÎNES DE CARACTÈRES ═════════════════════════════

const chainesCours: CoursSection = {
  id: 'chaines',
  title: 'Chaînes de caractères',
  summary: 'Les chaînes JavaScript sont immuables et indexées en unités UTF-16 : construire efficacement, compter des caractères dans un tableau de 26, reconnaître anagrammes et palindromes (deux pointeurs, expansion autour du centre), parser proprement (RLE, atoi), chercher un motif en temps linéaire (KMP, Rabin-Karp) et ne pas casser les emojis.',
  blocks: [
    { h: 'Chaînes immuables et coût des opérations', id: 'chaines-immuables' },
    {
      p: 'Une chaîne JavaScript est **immuable** : `s[0] = \'X\'` est silencieusement ignoré (ou lève une `TypeError` en mode strict), et chaque méthode (`slice`, `toUpperCase`, `replace`…) renvoie une **nouvelle** chaîne. Conséquence algorithmique : modifier une chaîne caractère par caractère, c’est la recopier. Pour construire un résultat morceau par morceau, on accumule dans un **tableau** puis on fait un seul `join` ; pour modifier des caractères en place (inverser, permuter), on travaille sur un tableau de caractères.',
    },
    {
      table: [
        ['Opération', 'Complexité', 'Remarque'],
        ['`s[i]`, `s.charCodeAt(i)`, `s.length`', 'O(1)', 'indexation en unités UTF-16'],
        ['`s.slice(a, b)`, `s.substring(a, b)`', 'O(b − a)', 'crée une nouvelle chaîne'],
        ['`s.indexOf(t)`, `s.includes(t)`', 'O(n × m) au pire', 'les moteurs utilisent des algorithmes rapides en pratique'],
        ['`s.split(\'\')`, `[...s]`, `arr.join(\'\')`', 'O(n)', ''],
        ['`a === b`, `a < b`', 'O(min(n, m))', 'comparaison unité par unité'],
        ['`s += c` dans une boucle', 'O(n²) en théorie', 'V8 utilise des « ropes » qui rendent `+=` rapide en pratique'],
      ],
    },
    {
      title: 'Immuabilité et construction par tableau',
      code: `const s = 'chat'
s[0] = 'C' // ignoré : une chaîne ne se modifie pas
s // → 'chat'

const chars = s.split('')
chars[0] = 'C'
chars.join('') // → 'Chat'

function repeatJoin(word, k) {
  const parts = []
  for (let i = 0; i < k; i++) parts.push(word + i)
  return parts.join('-')
}
repeatJoin('ab', 3) // → 'ab0-ab1-ab2'`,
      equiv: {
        python: `s = 'chat'
# s[0] = 'C' lève TypeError : 'str' object does not support item assignment
chars = list(s)
chars[0] = 'C'
print(''.join(chars))

def repeat_join(word, k):
    return '-'.join(word + str(i) for i in range(k))`,
        java: `String s = "chat";
char[] chars = s.toCharArray();
chars[0] = 'C';
System.out.println(new String(chars));

StringBuilder sb = new StringBuilder(); // le += sur String dans une boucle est O(n²) en Java
for (int i = 0; i < 3; i++) {
    if (i > 0) sb.append('-');
    sb.append("ab").append(i);
}
System.out.println(sb);`,
        rust: `let s = String::from("chat");
// String est modifiable mais indexée en octets : on passe par chars()
let mut chars: Vec<char> = s.chars().collect();
chars[0] = 'C';
let t: String = chars.into_iter().collect();
let parts: Vec<String> = (0..3).map(|i| format!("ab{}", i)).collect();
println!("{} {}", t, parts.join("-"));`,
      },
    },
    {
      mnemo: '« Chaîne immuable : on accumule dans un tableau, on `join` une fois. » Pour modifier en place, `split(\'\')` puis tableau.',
      piege: 'Oublier le coût caché de `slice` dans une boucle : tester `s.slice(i, i + k) === t` pour chaque `i` coûte O(n × k), pas O(n). C’est ce qui rend un word break naïf cubique.',
    },

    { h: 'Codes de caractères, comptage, anagrammes et comparaison', id: 'chaines-codes' },
    {
      p: 'Pour des lettres minuscules ASCII, `s.charCodeAt(i) - 97` donne un indice de 0 à 25 (`97` est le code de `a`). Un tableau de 26 compteurs est plus rapide et plus compact qu’une `Map`, et deux tableaux de comptage se comparent en O(26). C’est la base des problèmes d’**anagrammes** (même multiset de lettres), de « ransom note » et des fenêtres glissantes de permutations.',
    },
    {
      title: 'Anagramme avec un tableau de 26 compteurs',
      code: `function isAnagram(a, b) {
  if (a.length !== b.length) return false
  const count = new Array(26).fill(0)
  for (let i = 0; i < a.length; i++) {
    count[a.charCodeAt(i) - 97]++
    count[b.charCodeAt(i) - 97]--
  }
  return count.every((c) => c === 0)
}

// clé de groupe : les 26 compteurs sérialisés (O(n) au lieu du tri O(n log n))
function anagramKey(w) {
  const count = new Array(26).fill(0)
  for (let i = 0; i < w.length; i++) count[w.charCodeAt(i) - 97]++
  return count.join(',')
}

'a'.charCodeAt(0) // → 97
String.fromCharCode(97 + 25) // → 'z'
isAnagram('anagram', 'nagaram') // → true
isAnagram('rat', 'car') // → false
anagramKey('tea') === anagramKey('eat') // → true`,
      equiv: {
        python: `from collections import Counter

def is_anagram(a, b):
    return Counter(a) == Counter(b)

def anagram_key(w):
    count = [0] * 26
    for ch in w:
        count[ord(ch) - ord('a')] += 1
    return tuple(count)  # un tuple est hachable : utilisable comme clé de dict`,
        java: `static boolean isAnagram(String a, String b) {
    if (a.length() != b.length()) return false;
    int[] count = new int[26];
    for (int i = 0; i < a.length(); i++) {
        count[a.charAt(i) - 'a']++;
        count[b.charAt(i) - 'a']--;
    }
    for (int c : count) if (c != 0) return false;
    return true;
}`,
        bash: `is_anagram() {
  [[ $(echo "$1" | grep -o . | sort | tr -d '\\n') == $(echo "$2" | grep -o . | sort | tr -d '\\n') ]]
}
is_anagram anagram nagaram && echo oui`,
      },
    },
    {
      p: 'Pour **trier** des chaînes, `sort()` sans comparateur compare les unités UTF-16 : les majuscules passent avant les minuscules (`Z` < `a`) et les lettres accentuées après `z`. Pour un ordre humain, utilisez `localeCompare` (ou un `Intl.Collator` réutilisé, plus rapide sur de gros tableaux). Seul le **signe** du résultat de `localeCompare` est garanti, pas sa valeur.',
    },
    {
      title: 'sort par défaut contre localeCompare',
      code: `const words = ['été', 'Zoé', 'abricot', 'école'];
[...words].sort(); // → [ 'Zoé', 'abricot', 'école', 'été' ]
[...words].sort((a, b) => a.localeCompare(b, 'fr')); // → [ 'abricot', 'école', 'été', 'Zoé' ]
'a'.localeCompare('b') < 0 // → true
'e' < 'é' // → true
'é' < 'f' // → false`,
      equiv: {
        python: `import locale
words = ['été', 'Zoé', 'abricot', 'école']
print(sorted(words))  # ordre des points de code, comme sort() en JS
# ordre humain : locale.strxfrm (après locale.setlocale) ou la bibliothèque PyICU
print(sorted(words, key=str.casefold))  # insensible à la casse, mais pas aux accents`,
        java: `java.text.Collator collator = java.text.Collator.getInstance(java.util.Locale.FRENCH);
String[] words = {"été", "Zoé", "abricot", "école"};
java.util.Arrays.sort(words, collator); // abricot, école, été, Zoé`,
        php: `<?php
$words = ['été', 'Zoé', 'abricot', 'école'];
$collator = new Collator('fr_FR'); // extension intl
$collator->sort($words);`,
      },
    },
    {
      mnemo: '« `charCodeAt - 97` : la lettre devient un indice. » Tableau de 26 pour compter, `localeCompare` pour trier comme un humain.',
      piege: '`sort()` sans comparateur sur des nombres les trie comme des chaînes (`[10, 9, 1].sort()` donne `[1, 10, 9]`), et sur des mots accentués il range `é` après `z`. Toujours un comparateur explicite.',
    },

    { h: 'Palindromes : deux pointeurs et expansion autour du centre', id: 'chaines-palindromes' },
    {
      p: 'Tester un palindrome se fait avec **deux pointeurs** qui partent des extrémités et se rejoignent : O(n) en temps, O(1) en mémoire, sans créer de chaîne inversée. Les variantes d’entretien ignorent les caractères non alphanumériques et la casse, ou autorisent la suppression d’un caractère (« valid palindrome II » : au premier désaccord, on essaie de sauter l’un ou l’autre).',
    },
    {
      p: 'Pour la **plus longue sous-chaîne palindromique**, l’**expansion autour du centre** est la technique attendue : chaque palindrome a un centre, qui est soit un caractère (longueur impaire), soit un espace entre deux caractères (longueur paire). Il y a 2n − 1 centres, et l’expansion depuis chacun coûte au plus O(n) : O(n²) en temps, O(1) en mémoire. Manacher fait O(n), mais n’est presque jamais exigé.',
    },
    {
      title: 'Palindrome par deux pointeurs, plus long palindrome par expansion',
      code: `function isPalindrome(s) {
  let i = 0
  let j = s.length - 1
  const ok = (c) => /[a-z0-9]/i.test(c)
  while (i < j) {
    if (!ok(s[i])) i++
    else if (!ok(s[j])) j--
    else if (s[i].toLowerCase() !== s[j].toLowerCase()) return false
    else {
      i++
      j--
    }
  }
  return true
}

function longestPalindrome(s) {
  let start = 0
  let best = 0
  const expand = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--
      hi++
    }
    // le palindrome est s[lo + 1 .. hi - 1]
    if (hi - lo - 1 > best) {
      best = hi - lo - 1
      start = lo + 1
    }
  }
  for (let c = 0; c < s.length; c++) {
    expand(c, c) // centre impair
    expand(c, c + 1) // centre pair
  }
  return s.slice(start, start + best)
}

isPalindrome('A man, a plan, a canal: Panama') // → true
isPalindrome('race a car') // → false
longestPalindrome('babad') // → 'bab'
longestPalindrome('cbbd') // → 'bb'`,
      equiv: {
        python: `def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        elif s[i].lower() != s[j].lower():
            return False
        else:
            i, j = i + 1, j - 1
    return True

def longest_palindrome(s):
    start, best = 0, 0
    def expand(lo, hi):
        nonlocal start, best
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo, hi = lo - 1, hi + 1
        if hi - lo - 1 > best:
            best, start = hi - lo - 1, lo + 1
    for c in range(len(s)):
        expand(c, c)
        expand(c, c + 1)
    return s[start:start + best]`,
        java: `static String longestPalindrome(String s) {
    int start = 0, best = 0;
    for (int c = 0; c < s.length(); c++) {
        for (int k = 0; k < 2; k++) { // k = 0 : centre impair, k = 1 : centre pair
            int lo = c, hi = c + k;
            while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) { lo--; hi++; }
            if (hi - lo - 1 > best) { best = hi - lo - 1; start = lo + 1; }
        }
    }
    return s.substring(start, start + best);
}`,
      },
    },
    {
      mnemo: '« 2n − 1 centres, on s’étale tant que ça colle. » Ne pas oublier les centres pairs (`bb`).',
      piege: 'N’essayer que les centres impairs : `longestPalindrome(\'cbbd\')` renverrait `c` au lieu de `bb`. Et tester tous les couples (i, j) puis vérifier chacun coûte O(n³).',
    },

    { h: 'Parsing : compression RLE et atoi', id: 'chaines-parsing' },
    {
      p: 'Les exercices de parsing testent la rigueur plus que l’algorithme : parcourir la chaîne avec un index, traiter chaque cas explicitement, ne pas oublier le **dernier groupe** et les **bornes**. La compression RLE (run-length encoding) remplace chaque suite de caractères identiques par le caractère suivi de sa longueur. `atoi` convertit une chaîne en entier 32 bits : espaces initiaux ignorés, un signe facultatif, des chiffres jusqu’au premier non-chiffre, puis saturation dans [−2^31, 2^31 − 1].',
    },
    {
      title: 'RLE et atoi avec saturation',
      code: `function rle(s) {
  const out = []
  let i = 0
  while (i < s.length) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    out.push(s[i] + (j - i))
    i = j
  }
  return out.join('')
}

function myAtoi(s) {
  const MAX = 2 ** 31 - 1
  const MIN = -(2 ** 31)
  let i = 0
  while (s[i] === ' ') i++
  let sign = 1
  if (s[i] === '+' || s[i] === '-') {
    if (s[i] === '-') sign = -1
    i++
  }
  let n = 0
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    n = n * 10 + (s.charCodeAt(i) - 48)
    if (sign * n > MAX) return MAX
    if (sign * n < MIN) return MIN
    i++
  }
  return sign * n || 0 // évite -0
}

rle('aaabccdddd') // → 'a3b1c2d4'
myAtoi('   -42abc') // → -42
myAtoi('91283472332') // → 2147483647
myAtoi('-0') // → 0
myAtoi('words 42') // → 0`,
      equiv: {
        python: `from itertools import groupby

def rle(s):
    return ''.join(ch + str(len(list(g))) for ch, g in groupby(s))

def my_atoi(s):
    MAX, MIN = 2**31 - 1, -2**31
    i = 0
    while i < len(s) and s[i] == ' ':
        i += 1
    sign = 1
    if i < len(s) and s[i] in '+-':
        sign = -1 if s[i] == '-' else 1
        i += 1
    n = 0
    while i < len(s) and s[i].isdigit():
        n = n * 10 + int(s[i])
        if sign * n > MAX:
            return MAX
        if sign * n < MIN:
            return MIN
        i += 1
    return sign * n`,
        java: `static int myAtoi(String s) {
    int i = 0, n = s.length(), sign = 1;
    long v = 0;
    while (i < n && s.charAt(i) == ' ') i++;
    if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) sign = s.charAt(i++) == '-' ? -1 : 1;
    while (i < n && Character.isDigit(s.charAt(i))) {
        v = v * 10 + (s.charAt(i++) - '0');
        if (sign * v > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (sign * v < Integer.MIN_VALUE) return Integer.MIN_VALUE;
    }
    return (int) (sign * v);
}`,
        bash: `# RLE en une ligne avec les outils Unix : un caractère par ligne, puis uniq -c
echo aaabccdddd | grep -o . | uniq -c | awk '{ printf "%s%s", $2, $1 } END { print "" }'`,
      },
    },
    {
      mnemo: '« Espaces, signe, chiffres, bornes. » Et pour RLE : deux index, on avance `j` tant que c’est le même caractère.',
      piege: 'En JS, `Number(\'42abc\')` vaut `NaN` mais `parseInt(\'42abc\')` vaut 42 : en entretien, on écrit le parseur à la main. Dans un langage à entiers 32 bits, `n * 10` déborde **avant** le test de borne : il faut tester `n > (MAX - chiffre) / 10` avant de multiplier.',
    },

    { h: 'Recherche de motif : KMP et Rabin-Karp', id: 'chaines-motifs' },
    {
      p: 'La recherche naïve d’un motif de longueur m dans un texte de longueur n compare le motif à chaque position : O(n × m) au pire (`aaaa…ab` dans `aaaa…a`). En entretien, `indexOf` est souvent accepté, mais on peut vous demander une recherche **linéaire**. Deux algorithmes classiques :',
    },
    {
      list: [
        '**KMP (Knuth-Morris-Pratt)** : on précalcule la **fonction d’échec** `lps[i]` = longueur du plus long préfixe propre du motif qui est aussi suffixe de `motif[0..i]`. Lors d’un désaccord, au lieu de repartir de zéro, on recule dans le motif jusqu’à `lps[j - 1]` : le pointeur du texte ne recule jamais. O(n + m) garanti.',
        '**Rabin-Karp** : on compare des **empreintes** (hachages) plutôt que des chaînes. Le hachage polynomial d’une fenêtre se met à jour en O(1) quand elle glisse (on retire le caractère sortant, on ajoute l’entrant). En cas d’égalité d’empreintes, on vérifie la sous-chaîne pour écarter les collisions. O(n + m) en moyenne ; très pratique pour chercher plusieurs motifs ou des sous-chaînes répétées.',
      ],
    },
    {
      title: 'KMP : fonction d’échec puis recherche linéaire',
      code: `function buildLps(p) {
  const lps = new Array(p.length).fill(0)
  let len = 0 // longueur du préfixe-suffixe courant
  for (let i = 1; i < p.length; i++) {
    while (len > 0 && p[i] !== p[len]) len = lps[len - 1]
    if (p[i] === p[len]) len++
    lps[i] = len
  }
  return lps
}

function kmpSearch(text, p) {
  if (p.length === 0) return 0
  const lps = buildLps(p)
  let j = 0 // caractères du motif déjà reconnus
  for (let i = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== p[j]) j = lps[j - 1]
    if (text[i] === p[j]) j++
    if (j === p.length) return i - p.length + 1
  }
  return -1
}

buildLps('ababaca') // → [ 0, 0, 1, 2, 3, 0, 1 ]
kmpSearch('abababacab', 'ababaca') // → 2
kmpSearch('aaaaab', 'aab') // → 3
kmpSearch('abc', 'd') // → -1`,
      equiv: {
        python: `def build_lps(p):
    lps, length = [0] * len(p), 0
    for i in range(1, len(p)):
        while length > 0 and p[i] != p[length]:
            length = lps[length - 1]
        if p[i] == p[length]:
            length += 1
        lps[i] = length
    return lps

def kmp_search(text, p):
    if not p:
        return 0
    lps, j = build_lps(p), 0
    for i, ch in enumerate(text):
        while j > 0 and ch != p[j]:
            j = lps[j - 1]
        if ch == p[j]:
            j += 1
        if j == len(p):
            return i - len(p) + 1
    return -1`,
        java: `static int[] buildLps(String p) {
    int[] lps = new int[p.length()];
    int len = 0;
    for (int i = 1; i < p.length(); i++) {
        while (len > 0 && p.charAt(i) != p.charAt(len)) len = lps[len - 1];
        if (p.charAt(i) == p.charAt(len)) len++;
        lps[i] = len;
    }
    return lps;
}`,
      },
    },
    {
      title: 'Rabin-Karp : empreinte glissante',
      code: `function rabinKarp(text, p) {
  const n = text.length
  const m = p.length
  if (m === 0) return 0
  if (m > n) return -1
  const B = 256
  const M = 1000003 // petit premier : B * hash < 2^53, calculs exacts
  let high = 1 // B^(m-1) mod M, poids du caractère qui sort
  for (let k = 1; k < m; k++) high = (high * B) % M
  let hp = 0
  let ht = 0
  for (let k = 0; k < m; k++) {
    hp = (hp * B + p.charCodeAt(k)) % M
    ht = (ht * B + text.charCodeAt(k)) % M
  }
  for (let i = 0; ; i++) {
    if (hp === ht && text.slice(i, i + m) === p) return i // vérification anti-collision
    if (i + m >= n) return -1
    ht = (ht - ((text.charCodeAt(i) * high) % M) + M) % M // retire le caractère sortant
    ht = (ht * B + text.charCodeAt(i + m)) % M // ajoute l'entrant
  }
}

rabinKarp('le chat et le chien', 'chien') // → 14
rabinKarp('aaaaab', 'aab') // → 3
rabinKarp('abc', 'abcd') // → -1`,
      equiv: {
        python: `def rabin_karp(text, p):
    n, m = len(text), len(p)
    if m == 0:
        return 0
    if m > n:
        return -1
    B, M = 256, 1_000_003
    high = pow(B, m - 1, M)
    hp = ht = 0
    for k in range(m):
        hp = (hp * B + ord(p[k])) % M
        ht = (ht * B + ord(text[k])) % M
    i = 0
    while True:
        if hp == ht and text[i:i + m] == p:
            return i
        if i + m >= n:
            return -1
        ht = ((ht - ord(text[i]) * high) * B + ord(text[i + m])) % M  # % Python toujours positif
        i += 1`,
        java: `// Même algorithme ; avec M ≈ 10^9 + 7, faire les produits en long pour éviter le débordement d'int.`,
      },
    },
    {
      mnemo: '« KMP : le texte n’avance qu’en avant, le motif recule selon `lps`. Rabin-Karp : on compare des empreintes, on vérifie avant de crier victoire. »',
      piege: 'En Rabin-Karp en JavaScript, choisir un grand modulo (10⁹ + 7) avec une base 256 fait dépasser 2^53 dans `hash * B` : les empreintes deviennent fausses. Petit modulo (≈ 10⁶), double hachage, ou BigInt. Et ne jamais oublier la vérification en cas d’égalité d’empreintes.',
    },

    { h: 'Unicode : unités UTF-16, points de code et graphèmes', id: 'chaines-unicode' },
    {
      p: 'Les chaînes JavaScript sont des suites d’**unités de code UTF-16**. Les caractères hors du plan multilingue de base (la plupart des emojis, certains idéogrammes) occupent **deux unités** (une paire de substitution). Donc `\'😀\'.length` vaut 2, `s[0]` peut être une demi-paire invalide, et `split(\'\')` coupe les emojis en deux. Les itérateurs (`for…of`, `[...s]`, `Array.from(s)`) parcourent, eux, les **points de code**. Encore au-dessus, un caractère perçu (graphème) peut combiner plusieurs points de code : drapeaux, familles d’emojis, lettre + accent combinant ; seul `Intl.Segmenter` les découpe correctement.',
    },
    {
      title: 'length, points de code et inversion',
      code: `const s = 'a😀b'
s.length; // → 4
[...s].length // → 3
s.codePointAt(1) // → 128512
s.charCodeAt(1) // → 55357
s.split('').reverse().join('') === 'b😀a'; // → false
[...s].reverse().join('') // → 'b😀a'

const e1 = 'é' // un seul point de code U+00E9
const e2 = 'e\\u0301' // e + accent aigu combinant
e1 === e2 // → false
e1 === e2.normalize('NFC') // → true
e2.length // → 2`,
      equiv: {
        python: `s = 'a😀b'
print(len(s))          # 3 : les str Python sont des suites de points de code
print(s[::-1])         # b😀a
print(len(s.encode('utf-8')))  # 6 octets en UTF-8
import unicodedata
print(unicodedata.normalize('NFC', 'e\\u0301') == 'é')  # True`,
        java: `String s = "a😀b";
System.out.println(s.length());                       // 4 : unités UTF-16, comme en JS
System.out.println(s.codePointCount(0, s.length()));   // 3
System.out.println(new StringBuilder(s).reverse());   // b😀a : reverse() respecte les paires`,
        rust: `let s = "a😀b";
println!("{}", s.len());            // 6 : octets UTF-8
println!("{}", s.chars().count());  // 3 : points de code (char)
let r: String = s.chars().rev().collect();
println!("{}", r);                  // b😀a
// &s[1..2] provoque un panic : 1..2 coupe l'emoji au milieu de ses octets`,
        php: `<?php
$s = 'a😀b';
var_dump(strlen($s));        // int(6) : octets
var_dump(mb_strlen($s));     // int(3) : caractères (UTF-8)
echo implode('', array_reverse(mb_str_split($s)));  // b😀a ; strrev casserait l'emoji`,
        bash: `s='a😀b'
echo \${#s}                 # 3 avec une locale UTF-8 (LANG=fr_FR.UTF-8), 6 en locale C
echo "$s" | rev            # b😀a si rev gère la locale
printf '%s' "$s" | wc -c   # 6 octets`,
      },
    },
    {
      mnemo: '« `length` compte des unités UTF-16, `[...s]` compte des points de code, `Intl.Segmenter` compte ce que l’humain voit. »',
      piege: '`s.split(\'\').reverse().join(\'\')` est l’inversion la plus citée et elle casse les emojis (paires de substitution inversées). `[...s].reverse().join(\'\')` est correct pour les points de code, mais casse encore les drapeaux et les lettres avec accent combinant.',
    },
  ],
  mnemo: 'Immuable → tableau + `join` ; lettre → `charCodeAt - 97` → tableau de 26 ; palindrome → deux pointeurs ou 2n − 1 centres ; motif → KMP (`lps`) ou empreinte glissante ; unicode → `length` en UTF-16, `[...s]` en points de code.',
  piege: 'Les pièges classiques : `\'😀\'.length` vaut 2, `split(\'\').reverse()` casse les emojis, `sort()` sans comparateur range les accents après `z`, et une concaténation ou un `slice` dans une boucle cache un facteur n.',
}

const chainesKatas: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'av-ch-compression',
    title: 'Compression par plages (RLE)',
    difficulty: 'facile',
    theme: 'chaines',
    pattern: 'parcours par groupes',
    statement: `Écrivez \`compress(s)\` qui remplace chaque suite de caractères identiques consécutifs par le caractère suivi du **nombre de répétitions**. Si la chaîne compressée n’est **pas strictement plus courte** que l’originale, renvoyez l’originale.

Contraintes : \`0 <= s.length <= 10⁵\`, lettres ASCII (majuscules et minuscules distinctes).

Exemples :

- \`compress('aabcccccaaa')\` donne \`'a2b1c5a3'\` ;
- \`compress('abc')\` donne \`'abc'\` (\`'a1b1c1'\` serait plus long) ;
- \`compress('aaaaaaaaaaaa')\` donne \`'a12'\` (le compte peut avoir plusieurs chiffres).`,
    starter: `function compress(s) {
  // TODO : compter chaque plage de caractères identiques
  return s
}`,
    solution: `function compress(s) {
  const parts = [] // un tableau puis join : pas de concaténation répétée
  let i = 0
  while (i < s.length) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    parts.push(s[i], String(j - i))
    i = j
  }
  const out = parts.join('')
  return out.length < s.length ? out : s
}`,
    solutionEquiv: {
      python: `from itertools import groupby

def compress(s):
    out = ''.join(ch + str(len(list(g))) for ch, g in groupby(s))
    return out if len(out) < len(s) else s`,
      java: `static String compress(String s) {
    StringBuilder sb = new StringBuilder();
    int i = 0;
    while (i < s.length()) {
        int j = i;
        while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
        sb.append(s.charAt(i)).append(j - i);
        i = j;
    }
    return sb.length() < s.length() ? sb.toString() : s;
}`,
      php: `function compress(string $s): string {
    $out = '';
    $n = strlen($s);
    for ($i = 0; $i < $n; $i = $j) {
        for ($j = $i; $j < $n && $s[$j] === $s[$i]; $j++);
        $out .= $s[$i] . ($j - $i);
    }
    return strlen($out) < $n ? $out : $s;
}
// alternative : preg_replace_callback('/(.)\\1*/', fn($m) => $m[1] . strlen($m[0]), $s)`,
      bash: `compress() {
  local out
  out=$(printf '%s' "$1" | grep -o . | uniq -c | awk '{ printf "%s%s", $2, $1 }')
  if (( \${#out} < \${#1} )); then echo "$out"; else echo "$1"; fi
}`,
    },
    tests: [
      { name: 'exemple', code: `assertEqual(compress('aabcccccaaa'), 'a2b1c5a3')` },
      { name: 'pas plus courte : chaîne d’origine', code: `assertEqual(compress('abc'), 'abc')
assertEqual(compress('aabb'), 'aabb')` },
      { name: 'compte à plusieurs chiffres', code: `assertEqual(compress('aaaaaaaaaaaa'), 'a12')
assertEqual(compress('b'.repeat(100) + 'c'), 'b100c1')` },
      { name: 'vide et un caractère', code: `assertEqual(compress(''), '')
assertEqual(compress('z'), 'z')` },
      { name: 'casse distincte et dernier groupe', code: `assertEqual(compress('aaAAAaaaa'), 'a2A3a4')
assertEqual(compress('xyyyyy'), 'x1y5')` },
    ],
    hints: [
      'Deux index : `i` au début de la plage, `j` avance tant que `s[j] === s[i]`. La longueur de la plage est `j - i`.',
      'Accumulez les morceaux dans un tableau et faites un seul `join`. N’oubliez pas de comparer les longueurs à la fin.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(n) en mémoire pour le résultat.

**Points à évoquer** :

- le dernier groupe est l’oubli classique quand on écrit la boucle avec un compteur qui ne « vide » le groupe qu’au changement de caractère ;
- \`s += …\` dans la boucle est O(n²) en théorie (rapide en pratique dans V8) ; le tableau + \`join\` est l’idiome sûr, comme \`StringBuilder\` en Java ;
- on peut calculer d’abord la longueur compressée pour éviter de construire une chaîne inutile ;
- variantes : décompression (\`a2b1\` → \`aab\`, attention aux nombres à plusieurs chiffres), compression en place dans un tableau de caractères (LeetCode 443), count and say.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-ch-atoi',
    title: 'Convertir une chaîne en entier 32 bits (atoi)',
    difficulty: 'moyen',
    theme: 'chaines',
    pattern: 'parsing avec bornes',
    statement: `Écrivez \`myAtoi(s)\` qui convertit \`s\` en entier signé 32 bits, sans utiliser \`parseInt\`, \`Number\` ni le \`+\` unaire :

1. ignorer les espaces (\`' '\`) en tête ;
2. lire un signe facultatif \`+\` ou \`-\` ;
3. lire les chiffres jusqu’au premier caractère non chiffre ou la fin (les zéros en tête sont permis) ;
4. sans aucun chiffre, renvoyer \`0\` ;
5. si le nombre sort de [−2^31, 2^31 − 1], renvoyer la borne la plus proche (**saturation**).

Le résultat ne doit jamais être \`-0\`.

Exemples :

- \`myAtoi('42')\` donne \`42\` ;
- \`myAtoi('   -042')\` donne \`-42\` ;
- \`myAtoi('1337c0d3')\` donne \`1337\` ;
- \`myAtoi('words and 987')\` donne \`0\` ;
- \`myAtoi('-91283472332')\` donne \`-2147483648\`.`,
    starter: `function myAtoi(s) {
  // TODO : espaces, signe, chiffres, saturation
  let n = 0
  for (const c of s) {
    if (c < '0' || c > '9') break
    n = n * 10 + (c.charCodeAt(0) - 48)
  }
  return n
}`,
    solution: `function myAtoi(s) {
  const MAX = 2 ** 31 - 1
  const MIN = -(2 ** 31)
  let i = 0
  while (i < s.length && s[i] === ' ') i++
  let sign = 1
  if (s[i] === '+' || s[i] === '-') {
    if (s[i] === '-') sign = -1
    i++
  }
  let n = 0
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    n = n * 10 + (s.charCodeAt(i) - 48)
    // on sature dès que la borne est franchie : n reste petit, aucun risque de précision
    if (sign === 1 && n > MAX) return MAX
    if (sign === -1 && -n < MIN) return MIN
    i++
  }
  return n === 0 ? 0 : sign * n
}`,
    solutionEquiv: {
      python: `def my_atoi(s):
    MAX, MIN = 2**31 - 1, -2**31
    i, n = 0, 0
    while i < len(s) and s[i] == ' ':
        i += 1
    sign = 1
    if i < len(s) and s[i] in '+-':
        sign = -1 if s[i] == '-' else 1
        i += 1
    while i < len(s) and '0' <= s[i] <= '9':
        n = n * 10 + ord(s[i]) - ord('0')
        if sign == 1 and n > MAX:
            return MAX
        if sign == -1 and -n < MIN:
            return MIN
        i += 1
    return sign * n`,
      java: `static int myAtoi(String s) {
    int i = 0, len = s.length(), sign = 1, n = 0;
    while (i < len && s.charAt(i) == ' ') i++;
    if (i < len && (s.charAt(i) == '+' || s.charAt(i) == '-')) sign = s.charAt(i++) == '-' ? -1 : 1;
    while (i < len && s.charAt(i) >= '0' && s.charAt(i) <= '9') {
        int d = s.charAt(i++) - '0';
        // test AVANT la multiplication : n * 10 + d déborderait un int
        if (n > (Integer.MAX_VALUE - d) / 10) return sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
        n = n * 10 + d;
    }
    return sign * n;
}`,
      rust: `fn my_atoi(s: &str) -> i32 {
    let b = s.as_bytes();
    let mut i = 0;
    while i < b.len() && b[i] == b' ' {
        i += 1;
    }
    let mut sign: i64 = 1;
    if i < b.len() && (b[i] == b'+' || b[i] == b'-') {
        if b[i] == b'-' {
            sign = -1;
        }
        i += 1;
    }
    let mut n: i64 = 0;
    while i < b.len() && b[i].is_ascii_digit() {
        n = n * 10 + (b[i] - b'0') as i64;
        if sign * n > i32::MAX as i64 {
            return i32::MAX;
        }
        if sign * n < i32::MIN as i64 {
            return i32::MIN;
        }
        i += 1;
    }
    (sign * n) as i32
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(myAtoi('42'), 42)
assertEqual(myAtoi('   -042'), -42)
assertEqual(myAtoi('1337c0d3'), 1337)` },
      { name: 'aucun chiffre', code: `assertEqual(myAtoi('words and 987'), 0)
assertEqual(myAtoi(''), 0)
assertEqual(myAtoi('   '), 0)
assertEqual(myAtoi('+-12'), 0)` },
      { name: 'saturation', code: `assertEqual(myAtoi('-91283472332'), -2147483648)
assertEqual(myAtoi('91283472332'), 2147483647)
assertEqual(myAtoi('2147483648'), 2147483647)` },
      { name: 'bornes exactes', code: `assertEqual(myAtoi('2147483647'), 2147483647)
assertEqual(myAtoi('-2147483648'), -2147483648)` },
      { name: 'jamais -0', code: `assert(Object.is(myAtoi('-0'), 0), 'myAtoi(\\'-0\\') doit valoir 0, pas -0')
assert(Object.is(myAtoi('-abc'), 0), 'pas de -0 sans chiffre')` },
      { name: 'très long nombre et zéros en tête', code: `assertEqual(myAtoi('0000000000012345678'), 12345678)
assertEqual(myAtoi('-' + '9'.repeat(400)), -2147483648)
assertEqual(myAtoi(' +7 8'), 7)` },
    ],
    hints: [
      'Avancez un index `i` étape par étape : espaces, puis signe, puis chiffres. Chaque étape ne fait qu’avancer `i`.',
      'Testez la borne à chaque chiffre ajouté et renvoyez immédiatement la borne si elle est franchie : le nombre ne grandit jamais au-delà de 2^31 × 10.',
      'Attention à `-0` : `-1 * 0` vaut `-0` en JavaScript, et `Object.is(-0, 0)` est faux.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Points à évoquer** :

- la saturation précoce garantit que \`n\` reste sous 2^35 : aucune perte de précision, même pour une chaîne de 400 chiffres (qui vaudrait \`Infinity\` sinon) ;
- dans un langage à entiers 32 bits, il faut tester **avant** de multiplier : \`n > (MAX - d) / 10\` ;
- \`parseInt\` accepte des choses surprenantes (\`parseInt('0x1A')\` vaut 26, \`parseInt('1e3')\` vaut 1) : l’entretien veut un automate explicite ;
- présenter la solution comme un petit automate à états (début, signe, chiffres, fin) montre de la méthode ;
- variantes : valid number (exposants, décimales : automate plus riche), évaluer une expression (\`basic calculator\`, avec une pile).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-ch-anagrammes-fenetre',
    title: 'Toutes les anagrammes d’un motif',
    difficulty: 'moyen',
    theme: 'chaines',
    pattern: 'fenêtre + comptage de 26',
    statement: `Écrivez \`findAnagrams(s, p)\` qui renvoie, dans l’ordre croissant, les **indices de début** de toutes les sous-chaînes de \`s\` qui sont des **anagrammes** de \`p\` (mêmes lettres, mêmes nombres d’occurrences, ordre quelconque).

Contraintes : \`1 <= s.length, p.length <= 10⁵\`, lettres minuscules a à z. Trier chaque fenêtre est trop lent pour la plus grande entrée : visez O(n).

Exemples :

- \`findAnagrams('cbaebabacd', 'abc')\` donne \`[0, 6]\` (\`cba\` et \`bac\`) ;
- \`findAnagrams('abab', 'ab')\` donne \`[0, 1, 2]\` ;
- \`findAnagrams('a', 'ab')\` donne \`[]\`.`,
    starter: `function findAnagrams(s, p) {
  // TODO : indices de début des anagrammes de p dans s
  const out = []
  for (let i = 0; i + p.length <= s.length; i++) {
    if (s.slice(i, i + p.length) === p) out.push(i)
  }
  return out
}`,
    solution: `function findAnagrams(s, p) {
  const out = []
  const m = p.length
  if (m > s.length) return out
  // diff[c] = occurrences dans la fenêtre - occurrences dans p ; bad = nombre de lettres où diff != 0
  const diff = new Array(26).fill(0)
  for (let k = 0; k < m; k++) {
    diff[p.charCodeAt(k) - 97]--
    diff[s.charCodeAt(k) - 97]++
  }
  let bad = diff.filter((d) => d !== 0).length
  const bump = (c, delta) => {
    if (diff[c] === 0) bad++
    diff[c] += delta
    if (diff[c] === 0) bad--
  }
  for (let i = 0; ; i++) {
    if (bad === 0) out.push(i)
    if (i + m >= s.length) break
    bump(s.charCodeAt(i) - 97, -1) // la lettre qui sort
    bump(s.charCodeAt(i + m) - 97, +1) // la lettre qui entre
  }
  return out
}`,
    solutionEquiv: {
      python: `def find_anagrams(s, p):
    m, out = len(p), []
    if m > len(s):
        return out
    diff = [0] * 26
    for k in range(m):
        diff[ord(p[k]) - 97] -= 1
        diff[ord(s[k]) - 97] += 1
    bad = sum(1 for d in diff if d != 0)

    def bump(c, delta):
        nonlocal bad
        if diff[c] == 0:
            bad += 1
        diff[c] += delta
        if diff[c] == 0:
            bad -= 1

    i = 0
    while True:
        if bad == 0:
            out.append(i)
        if i + m >= len(s):
            break
        bump(ord(s[i]) - 97, -1)
        bump(ord(s[i + m]) - 97, 1)
        i += 1
    return out`,
      java: `static java.util.List<Integer> findAnagrams(String s, String p) {
    java.util.List<Integer> out = new java.util.ArrayList<>();
    int m = p.length(), n = s.length();
    if (m > n) return out;
    int[] need = new int[26], win = new int[26];
    for (int k = 0; k < m; k++) { need[p.charAt(k) - 'a']++; win[s.charAt(k) - 'a']++; }
    for (int i = 0; ; i++) {
        if (java.util.Arrays.equals(need, win)) out.add(i); // O(26) par fenêtre : encore linéaire
        if (i + m >= n) break;
        win[s.charAt(i) - 'a']--;
        win[s.charAt(i + m) - 'a']++;
    }
    return out;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(findAnagrams('cbaebabacd', 'abc'), [0, 6])
assertEqual(findAnagrams('abab', 'ab'), [0, 1, 2])` },
      { name: 'motif plus long que le texte', code: `assertEqual(findAnagrams('a', 'ab'), [])` },
      { name: 'lettres répétées', code: `assertEqual(findAnagrams('aaab', 'aab'), [1])
assertEqual(findAnagrams('baa', 'aa'), [1])
assertEqual(findAnagrams('aaaa', 'aa'), [0, 1, 2])` },
      { name: 'aucune ou toute la chaîne', code: `assertEqual(findAnagrams('xyz', 'abc'), [])
assertEqual(findAnagrams('listen', 'silent'), [0])` },
      { name: 'grande entrée : n = 10⁵', code: `let x = 99
let s = ''
const parts = []
for (let i = 0; i < 100000; i++) {
  x = (x * 48271) % 2147483647
  parts.push('abc'[x % 3])
}
s = parts.join('')
let p = ''
for (let i = 0; i < 6; i++) {
  x = (x * 48271) % 2147483647
  p += 'abc'[x % 3]
}
const t0 = performance.now()
const r = findAnagrams(s, p)
const elapsed = performance.now() - t0
assertEqual(p, 'bacaaa')
assertEqual(r.length, 4150)
assertEqual(r.slice(0, 3), [59, 62, 72])
assertEqual(r.reduce((a, b) => a + b, 0), 212510814)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      { name: 'grande entrée : motif long', code: `const s = 'ab'.repeat(50000)
const p = 'ba'.repeat(25000)
const t0 = performance.now()
const r = findAnagrams(s, p)
const elapsed = performance.now() - t0
assertEqual(r.length, 50001)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Deux chaînes de même longueur sont anagrammes si leurs 26 compteurs sont égaux. Trier chaque fenêtre coûte O(m log m) par position.',
      'Faites glisser une fenêtre de longueur `p.length` : quand elle avance, un seul compteur baisse (la lettre qui sort) et un seul augmente (celle qui entre).',
      'Comparer les 26 compteurs à chaque position est déjà linéaire (O(26 n)). Pour faire mieux, maintenez le nombre de lettres dont le compteur diffère de celui de `p`.',
    ],
    discussion: `**Complexité** : O(n + m) en temps, O(1) en mémoire (26 compteurs), plus la sortie.

**Points à évoquer** :

- trier chaque fenêtre donne O(n × m log m) : 10⁵ × 5 × 10⁴ × 16, impraticable avec un motif long ;
- la comparaison des 26 compteurs à chaque pas (O(26 n)) est une réponse tout à fait acceptable ; le compteur \`bad\` est le raffinement ;
- c’est le motif « fenêtre glissante de taille fixe + table de fréquences », le même que permutation in string (LeetCode 567) ;
- pour un alphabet quelconque (Unicode), remplacer le tableau par une \`Map\` ; attention alors aux points de code (\`[...s]\`) ;
- variante : minimum window substring (fenêtre de taille variable, plus difficile).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-ch-plus-long-palindrome',
    title: 'Plus longue sous-chaîne palindromique',
    difficulty: 'moyen',
    theme: 'chaines',
    pattern: 'expansion autour du centre',
    statement: `Écrivez \`longestPalindrome(s)\` qui renvoie la plus longue **sous-chaîne** (contiguë) de \`s\` qui se lit de la même façon dans les deux sens. S’il y en a plusieurs de même longueur, renvoyez **celle qui commence le plus tôt**.

Contraintes : \`0 <= s.length <= 3000\`, caractères ASCII. L’approche qui teste toutes les sous-chaînes est en O(n³) : trop lente pour la plus grande entrée.

Exemples :

- \`longestPalindrome('babad')\` donne \`'bab'\` (\`'aba'\` a la même longueur mais commence plus tard) ;
- \`longestPalindrome('cbbd')\` donne \`'bb'\` ;
- \`longestPalindrome('')\` donne \`''\`.`,
    starter: `function longestPalindrome(s) {
  // TODO : plus long palindrome contigu
  // (cette version ne regarde que les centres impairs, autour d'un caractère)
  let best = s.slice(0, 1)
  for (let c = 0; c < s.length; c++) {
    let lo = c
    let hi = c
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--
      hi++
    }
    if (hi - lo - 1 > best.length) best = s.slice(lo + 1, hi)
  }
  return best
}`,
    solution: `function longestPalindrome(s) {
  let start = 0
  let best = 0
  // s'étale depuis le centre (lo, hi) et met à jour le meilleur palindrome
  const expand = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--
      hi++
    }
    if (hi - lo - 1 > best) {
      best = hi - lo - 1
      start = lo + 1
    }
  }
  for (let c = 0; c < s.length; c++) {
    expand(c, c) // longueur impaire
    expand(c, c + 1) // longueur paire
  }
  return s.slice(start, start + best)
}`,
    solutionEquiv: {
      python: `def longest_palindrome(s):
    start, best = 0, 0

    def expand(lo, hi):
        nonlocal start, best
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo, hi = lo - 1, hi + 1
        if hi - lo - 1 > best:
            best, start = hi - lo - 1, lo + 1

    for c in range(len(s)):
        expand(c, c)
        expand(c, c + 1)
    return s[start:start + best]`,
      java: `static String longestPalindrome(String s) {
    int start = 0, best = 0;
    for (int c = 0; c < s.length(); c++) {
        for (int k = 0; k <= 1; k++) {
            int lo = c, hi = c + k;
            while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) { lo--; hi++; }
            if (hi - lo - 1 > best) { best = hi - lo - 1; start = lo + 1; }
        }
    }
    return s.substring(start, start + best);
}`,
      rust: `fn longest_palindrome(s: &str) -> String {
    let b = s.as_bytes(); // ASCII : indexer les octets est sûr
    let (mut start, mut best) = (0usize, 0usize);
    for c in 0..b.len() {
        for k in 0..=1 {
            let (mut lo, mut hi) = (c as isize, (c + k) as isize);
            while lo >= 0 && (hi as usize) < b.len() && b[lo as usize] == b[hi as usize] {
                lo -= 1;
                hi += 1;
            }
            let len = (hi - lo - 1) as usize;
            if len > best {
                best = len;
                start = (lo + 1) as usize;
            }
        }
    }
    s[start..start + best].to_string()
}`,
      php: `function longestPalindrome(string $s): string {
    $n = strlen($s);
    $start = 0;
    $best = 0;
    for ($c = 0; $c < $n; $c++) {
        foreach ([0, 1] as $k) {
            $lo = $c;
            $hi = $c + $k;
            while ($lo >= 0 && $hi < $n && $s[$lo] === $s[$hi]) { $lo--; $hi++; }
            if ($hi - $lo - 1 > $best) { $best = $hi - $lo - 1; $start = $lo + 1; }
        }
    }
    return substr($s, $start, $best);
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(longestPalindrome('babad'), 'bab')
assertEqual(longestPalindrome('cbbd'), 'bb')` },
      { name: 'vide et un caractère', code: `assertEqual(longestPalindrome(''), '')
assertEqual(longestPalindrome('x'), 'x')` },
      { name: 'longueur paire', code: `assertEqual(longestPalindrome('abba'), 'abba')
assertEqual(longestPalindrome('xabbay'), 'abba')` },
      { name: 'premier en cas d’égalité', code: `assertEqual(longestPalindrome('abc'), 'a')
assertEqual(longestPalindrome('abacdc'), 'aba')` },
      { name: 'chaîne entière et répétitions', code: `assertEqual(longestPalindrome('racecar'), 'racecar')
assertEqual(longestPalindrome('aaaa'), 'aaaa')` },
      { name: 'grande entrée : n = 3000', code: `let x = 5
const parts = []
for (let i = 0; i < 3000; i++) {
  x = (x * 48271) % 2147483647
  parts.push('ab'[x % 2])
}
const s = parts.join('')
const t0 = performance.now()
const r = longestPalindrome(s)
const elapsed = performance.now() - t0
assertEqual(r.length, 27)
assertEqual(r, s.slice(2824, 2851))
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Tout palindrome a un **centre** : un caractère (longueur impaire) ou l’espace entre deux caractères (longueur paire). Combien y a-t-il de centres ?',
      'Depuis chaque centre, étendez deux pointeurs vers l’extérieur tant que les caractères sont égaux.',
      'N’oubliez pas les centres pairs (`expand(c, c + 1)`), et ne remplacez le meilleur que si la nouvelle longueur est **strictement** plus grande, pour garder le premier.',
    ],
    discussion: `**Complexité** : O(n²) en temps dans le pire cas (\`aaaa…\`), O(1) en mémoire hors résultat.

**Points à évoquer** :

- la force brute (toutes les sous-chaînes, vérification de chacune) est O(n³) ;
- la DP \`dp[i][j] = s[i] === s[j] && dp[i + 1][j - 1]\` est aussi O(n²), mais avec O(n²) en mémoire : l’expansion est préférable ;
- l’algorithme de Manacher atteint O(n) en réutilisant les rayons des palindromes déjà trouvés ; le citer suffit généralement ;
- ne pas confondre avec la plus longue **sous-séquence** palindromique (non contiguë), qui demande une vraie DP d’intervalles ;
- variantes : compter toutes les sous-chaînes palindromiques (même expansion, on compte chaque pas), découpage minimal en palindromes.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'av-ch-kmp',
    title: 'Recherche de motif en temps linéaire',
    difficulty: 'difficile',
    theme: 'chaines',
    pattern: 'KMP',
    statement: `Écrivez \`strStr(text, pattern)\` qui renvoie l’indice de la **première occurrence** de \`pattern\` dans \`text\`, ou \`-1\` s’il n’apparaît pas. Un motif vide est trouvé à l’indice \`0\`.

Règle du jeu : **sans** \`indexOf\`, \`includes\`, \`search\`, \`match\` ni expression régulière. Implémentez KMP (ou Rabin-Karp).

Contraintes : \`0 <= pattern.length <= text.length <= 2 × 10⁵\`. La comparaison naïve à chaque position (O(n × m)) est trop lente pour la plus grande entrée.

Exemples :

- \`strStr('sadbutsad', 'sad')\` donne \`0\` ;
- \`strStr('leetcode', 'leeto')\` donne \`-1\` ;
- \`strStr('aaaaab', 'aab')\` donne \`3\`.`,
    starter: `function strStr(text, pattern) {
  // TODO : précalculer lps, puis parcourir le texte une seule fois
  return -1
}`,
    solution: `function strStr(text, pattern) {
  const m = pattern.length
  if (m === 0) return 0
  // lps[i] = longueur du plus long préfixe propre de pattern[0..i] qui en est aussi un suffixe
  const lps = new Array(m).fill(0)
  for (let i = 1, len = 0; i < m; i++) {
    while (len > 0 && pattern[i] !== pattern[len]) len = lps[len - 1]
    if (pattern[i] === pattern[len]) len++
    lps[i] = len
  }
  let j = 0 // nombre de caractères du motif déjà reconnus
  for (let i = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== pattern[j]) j = lps[j - 1] // on recule dans le motif, jamais dans le texte
    if (text[i] === pattern[j]) j++
    if (j === m) return i - m + 1
  }
  return -1
}`,
    solutionEquiv: {
      python: `def str_str(text, pattern):
    m = len(pattern)
    if m == 0:
        return 0
    lps, length = [0] * m, 0
    for i in range(1, m):
        while length > 0 and pattern[i] != pattern[length]:
            length = lps[length - 1]
        if pattern[i] == pattern[length]:
            length += 1
        lps[i] = length
    j = 0
    for i, ch in enumerate(text):
        while j > 0 and ch != pattern[j]:
            j = lps[j - 1]
        if ch == pattern[j]:
            j += 1
        if j == m:
            return i - m + 1
    return -1`,
      java: `static int strStr(String text, String pattern) {
    int m = pattern.length();
    if (m == 0) return 0;
    int[] lps = new int[m];
    for (int i = 1, len = 0; i < m; i++) {
        while (len > 0 && pattern.charAt(i) != pattern.charAt(len)) len = lps[len - 1];
        if (pattern.charAt(i) == pattern.charAt(len)) len++;
        lps[i] = len;
    }
    for (int i = 0, j = 0; i < text.length(); i++) {
        while (j > 0 && text.charAt(i) != pattern.charAt(j)) j = lps[j - 1];
        if (text.charAt(i) == pattern.charAt(j)) j++;
        if (j == m) return i - m + 1;
    }
    return -1;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(strStr('sadbutsad', 'sad'), 0)
assertEqual(strStr('leetcode', 'leeto'), -1)
assertEqual(strStr('aaaaab', 'aab'), 3)` },
      { name: 'motif vide ou égal au texte', code: `assertEqual(strStr('abc', ''), 0)
assertEqual(strStr('', ''), 0)
assertEqual(strStr('abc', 'abc'), 0)` },
      { name: 'occurrence à la toute fin', code: `assertEqual(strStr('hello', 'llo'), 2)
assertEqual(strStr('abcd', 'd'), 3)` },
      { name: 'retour arrière partiel (fonction d’échec)', code: `assertEqual(strStr('abababacab', 'ababaca'), 2)
assertEqual(strStr('aabaaabaaac', 'aabaaac'), 4)` },
      { name: 'absent', code: `assertEqual(strStr('abc', 'abcd'), -1)
assertEqual(strStr('mississippi', 'issipi'), -1)` },
      { name: 'grande entrée : pire cas de la recherche naïve', code: `const text = 'a'.repeat(150000) + 'b'
const pattern = 'a'.repeat(50000) + 'b'
const t0 = performance.now()
const r = strStr(text, pattern)
const elapsed = performance.now() - t0
assertEqual(r, 100000)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'La recherche naïve recommence la comparaison à `i + 1` après un échec, et rejette tout ce qu’elle vient de lire. Sur `aaaa…ab`, c’est quadratique.',
      'Précalculez `lps[i]` : la longueur du plus long préfixe propre du motif qui est aussi suffixe de `pattern[0..i]`. Par exemple, pour `ababaca`, `lps = [0, 0, 1, 2, 3, 0, 1]`.',
      'Pendant la recherche, après un désaccord avec `j` caractères reconnus, reprenez à `j = lps[j - 1]` au lieu de 0, sans reculer dans le texte.',
    ],
    discussion: `**Complexité** : O(n + m) en temps, O(m) en mémoire pour \`lps\`. Le pointeur \`i\` ne recule jamais et \`j\` ne peut redescendre que d’autant qu’il est monté : analyse amortie.

**Points à évoquer** :

- la version naïve est O(n × m) au pire : 10¹⁰ comparaisons ici ; en pratique, \`indexOf\` des moteurs est très optimisé, et le dire est apprécié ;
- Rabin-Karp : empreinte glissante, O(n + m) en moyenne, collisions à vérifier ; idéal pour plusieurs motifs de même longueur ou pour chercher une sous-chaîne répétée (avec une dichotomie sur la longueur) ;
- Z-algorithm : alternative à KMP, calcule pour chaque position la longueur du plus long préfixe commun avec le motif (sur \`pattern + '#' + text\`) ;
- usages de \`lps\` au-delà de la recherche : plus court palindrome par ajout en tête, période d’une chaîne (\`n - lps[n - 1]\`), repeated substring pattern.`,
  },
]

const chainesQuiz: QuizItem[] = [
  {
    id: 'av-ch-q-length',
    theme: 'chaines',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `console.log('😀'.length, [...'😀'].length, 'é'.length)`,
    choices: ['1 1 1', '2 1 1', '2 2 1', '4 1 2'],
    answer: 1,
    why: '`length` compte des unités UTF-16 : l’emoji (U+1F600) est hors du plan de base et occupe une paire de substitution, donc 2. L’itérateur de chaîne (`[...s]`) parcourt les points de code : 1. Le `é` précomposé (U+00E9) tient en une unité ; écrit avec un accent combinant (`e\\u0301`), il en ferait 2.',
  },
  {
    id: 'av-ch-q-immuable',
    theme: 'chaines',
    kind: 'output',
    q: 'Qu’affiche ce code (script non strict) ?',
    code: `const s = 'abc'
s[0] = 'z'
const t = s.toUpperCase()
console.log(s, t, s.replace('b', 'X'), s)`,
    choices: ['zbc ZBC zXc zXc', 'abc ABC aXc abc', 'abc ABC aXc aXc', 'zbc ABC aXc abc'],
    answer: 1,
    why: 'Les chaînes sont immuables : l’affectation `s[0] = \'z\'` est ignorée (elle lèverait une `TypeError` en mode strict). `toUpperCase` et `replace` renvoient de **nouvelles** chaînes sans toucher à `s`.',
  },
  {
    id: 'av-ch-q-sort',
    theme: 'chaines',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `console.log(['b', 'a', 'C', 'é'].sort().join(','))
console.log(['b', 'a', 'C', 'é'].sort((x, y) => x.localeCompare(y, 'fr')).join(','))`,
    choices: ['a,b,C,é\na,b,C,é', 'C,a,b,é\na,b,C,é', 'C,a,b,é\na,b,é,C', 'a,b,é,C\nC,a,b,é'],
    answer: 1,
    why: 'Sans comparateur, `sort` compare les unités UTF-16 : `C` (67) < `a` (97) < `b` (98) < `é` (233). `localeCompare` applique l’ordre de la langue : la casse et les accents ne passent qu’en second critère, d’où a, b, C, é.',
  },
  {
    id: 'av-ch-q-kmp',
    theme: 'chaines',
    kind: 'qcm',
    q: 'Dans KMP, que contient `lps[i]` et pourquoi la recherche est-elle linéaire ?',
    choices: [
      'La position de la dernière occurrence du caractère `pattern[i]` ; on saute directement après elle',
      'La longueur du plus long préfixe propre de `pattern[0..i]` qui en est aussi un suffixe ; le pointeur du texte ne recule jamais',
      'Le hachage du préfixe `pattern[0..i]` ; on compare des empreintes en O(1)',
      'Le nombre d’occurrences de `pattern[i]` dans le texte ; on évite les caractères absents',
    ],
    answer: 1,
    why: 'Après un désaccord avec `j` caractères reconnus, on sait que `pattern[0..j)` vient d’être lu : on peut reprendre à `lps[j - 1]` sans relire le texte. Le pointeur du texte avance n fois, et `j` ne redescend jamais plus qu’il n’est monté : O(n + m). La « dernière occurrence » décrit Boyer-Moore-Horspool, le hachage décrit Rabin-Karp.',
  },
  {
    id: 'av-ch-q-cx-brute',
    theme: 'chaines',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette recherche du plus long palindrome ?',
    code: `function longest(s) {
  let best = ''
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const sub = s.slice(i, j)
      if (sub.length > best.length && sub === [...sub].reverse().join('')) best = sub
    }
  }
  return best
}
longest('forgeeksskeegfor')`,
    choices: ['O(n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)'],
    answer: 2,
    why: 'O(n²) couples (i, j), et pour chacun `slice`, l’inversion et la comparaison coûtent O(j − i), soit O(n) : O(n³) au total. L’expansion autour du centre descend à O(n²) en temps et O(1) en mémoire.',
  },
  {
    id: 'av-ch-q-cx-anagramme',
    theme: 'chaines',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de ce test d’anagramme, avec n = a.length = b.length ?',
    code: `function isAnagram(a, b) {
  if (a.length !== b.length) return false
  const count = new Array(26).fill(0)
  for (let i = 0; i < a.length; i++) {
    count[a.charCodeAt(i) - 97]++
    count[b.charCodeAt(i) - 97]--
  }
  return count.every((c) => c === 0)
}
isAnagram('listen', 'silent')`,
    choices: ['O(n log n)', 'O(n)', 'O(n × 26²)', 'O(n²)'],
    answer: 1,
    why: 'Une seule boucle de n tours en O(1), puis 26 vérifications (une constante) : O(n) en temps et O(1) en mémoire. La version « trier puis comparer » coûte O(n log n).',
  },
  {
    id: 'av-ch-q-bug-palindrome',
    theme: 'chaines',
    kind: 'bug',
    q: 'Cette fonction doit renvoyer la longueur du plus long palindrome contigu. Pour `abba`, elle renvoie 1. Pourquoi ?',
    code: `function longestLen(s) {
  let best = 0
  for (let c = 0; c < s.length; c++) {
    let lo = c
    let hi = c
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--
      hi++
    }
    best = Math.max(best, hi - lo - 1)
  }
  return best
}
longestLen('abba')`,
    choices: [
      'La condition devrait être `lo > 0`',
      'La longueur est `hi - lo + 1`, pas `hi - lo - 1`',
      'Seuls les centres impairs (un caractère) sont essayés : il faut aussi étendre depuis `(c, c + 1)` pour les palindromes de longueur paire',
      'Il faut comparer en minuscules',
    ],
    answer: 2,
    why: 'Un palindrome de longueur paire comme `abba` a pour centre l’espace entre les deux `b` : aucun centre impair ne le trouve. Il y a 2n − 1 centres en tout. La formule `hi - lo - 1` est correcte : après la boucle, `lo` et `hi` sont un cran trop loin de chaque côté.',
  },
]

const chainesPieges: Piege[] = [
  {
    id: 'av-ch-p-emoji-reverse',
    title: '`split(\'\').reverse()` casse les emojis',
    theme: 'chaines',
    question: 'On inverse une chaîne qui contient un emoji. Qu’affiche ce code ?',
    code: `const s = 'ok👍'
console.log(s.length)
const r = s.split('').reverse().join('')
console.log(r === '👍ko', r.length)`,
    output: `4
false 4`,
    explanation: 'L’emoji 👍 (U+1F44D) occupe deux unités UTF-16 (une paire de substitution), d’où une longueur de 4. `split(\'\')` découpe par unités : les deux moitiés de la paire sont séparées puis inversées, ce qui produit une suite invalide (affichée comme deux caractères de remplacement). L’itérateur de chaîne (`[...s]` ou `Array.from(s)`) découpe par points de code et conserve l’emoji. Pour des graphèmes composés (drapeaux, familles, accents combinants), il faut `Intl.Segmenter`.',
    fix: {
      code: `const s = 'ok👍'
const r = [...s].reverse().join('')
console.log(r === '👍ko', [...s].length)`,
      output: `true 3`,
      equiv: {
        python: `s = 'ok👍'
print(s[::-1] == '👍ko', len(s))  # True 3 : str Python = suite de points de code`,
        java: `String s = "ok👍";
String r = new StringBuilder(s).reverse().toString(); // reverse() préserve les paires de substitution
System.out.println(r.equals("👍ko") + " " + s.codePointCount(0, s.length()));`,
        rust: `let s = "ok👍";
let r: String = s.chars().rev().collect(); // chars() = points de code
println!("{} {}", r == "👍ko", s.chars().count());`,
        php: `<?php
$s = 'ok👍';
$r = implode('', array_reverse(mb_str_split($s))); // strrev inverserait les octets UTF-8
var_dump($r === '👍ko', mb_strlen($s));`,
      },
    },
  },
  {
    id: 'av-ch-p-sort-accents',
    title: '`sort()` et les accents',
    theme: 'chaines',
    question: 'On trie une liste de mots français. Qu’affiche ce code ?',
    code: `const mots = ['zèbre', 'éclair', 'Arbre', 'abricot', 'eau']
console.log(mots.sort().join(' '))`,
    output: `Arbre abricot eau zèbre éclair`,
    explanation: 'Sans comparateur, `sort` compare les unités UTF-16 : les majuscules (65 à 90) passent avant les minuscules (97 à 122), et les lettres accentuées (é vaut 233) après `z`. Ce n’est presque jamais l’ordre voulu pour du texte. `localeCompare` (ou un `Intl.Collator` créé une fois et réutilisé, plus rapide) applique les règles de la langue. Au passage, `sort` trie **en place** : `mots` est modifié.',
    fix: {
      code: `const mots = ['zèbre', 'éclair', 'Arbre', 'abricot', 'eau']
const collator = new Intl.Collator('fr')
console.log([...mots].sort(collator.compare).join(' '))`,
      output: `abricot Arbre eau éclair zèbre`,
      equiv: {
        python: `mots = ['zèbre', 'éclair', 'Arbre', 'abricot', 'eau']
# sorted(mots) a le même défaut ; pour l'ordre français : PyICU, ou locale.strxfrm
import locale
locale.setlocale(locale.LC_COLLATE, 'fr_FR.UTF-8')
print(' '.join(sorted(mots, key=locale.strxfrm)))`,
        java: `String[] mots = {"zèbre", "éclair", "Arbre", "abricot", "eau"};
java.util.Arrays.sort(mots, java.text.Collator.getInstance(java.util.Locale.FRENCH));
System.out.println(String.join(" ", mots));`,
        bash: `printf '%s\\n' zèbre éclair Arbre abricot eau | LC_ALL=fr_FR.UTF-8 sort
# avec LC_ALL=C, sort compare les octets, comme sort() sans comparateur en JS`,
      },
    },
  },
  {
    id: 'av-ch-p-replace-premier',
    title: '`replace` avec une chaîne ne remplace que la première occurrence',
    theme: 'chaines',
    question: 'On veut remplacer tous les `a` par des `o`. Qu’affiche ce code ?',
    code: `const s = 'banana'
console.log(s.replace('a', 'o'))
console.log(s.split('a').length - 1)`,
    output: `bonana
3`,
    explanation: 'Avec une chaîne comme motif, `replace` ne remplace que la **première** occurrence. Il faut `replaceAll` (ES2021) ou une expression régulière avec le drapeau `g`. Le second affichage montre une façon simple de compter les occurrences d’un caractère : `split` renvoie un morceau de plus qu’il n’y a de séparateurs.',
    fix: {
      code: `const s = 'banana'
console.log(s.replaceAll('a', 'o'), s.replace(/a/g, 'o'))`,
      output: `bonono bonono`,
      equiv: {
        python: `s = 'banana'
print(s.replace('a', 'o'))     # bonono : replace Python remplace TOUT par défaut
print(s.replace('a', 'o', 1))  # bonana : le 3e argument limite le nombre de remplacements`,
        java: `String s = "banana";
System.out.println(s.replace("a", "o"));      // bonono : replace Java remplace tout
System.out.println(s.replaceFirst("a", "o")); // bonana (replaceFirst prend une regex)`,
        bash: `s=banana
echo "\${s/a/o}"    # bonana : première occurrence
echo "\${s//a/o}"   # bonono : toutes`,
      },
    },
  },
]

const chainesFlashcards: Flashcard[] = [
  { id: 'av-ch-f-immuable', theme: 'chaines', front: 'Comment construire une longue chaîne morceau par morceau en JavaScript ?', back: 'Les chaînes sont **immuables** : on accumule les morceaux dans un tableau et on fait un seul `join`. `+=` est O(n²) en théorie (rapide en pratique dans V8 grâce aux ropes) ; en Java, on utilise `StringBuilder`.' },
  {
    id: 'av-ch-f-26',
    theme: 'chaines',
    front: 'Comment transformer une lettre minuscule en indice de 0 à 25 ?',
    back: '`s.charCodeAt(i) - 97` (97 est le code de `a`), et `String.fromCharCode(97 + k)` pour revenir à la lettre. Un tableau de 26 compteurs remplace avantageusement une `Map`.',
    code: `'z'.charCodeAt(0) - 97 // → 25
String.fromCharCode(97 + 2) // → 'c'`,
  },
  {
    id: 'av-ch-f-unicode',
    theme: 'chaines',
    front: '`length` compte quoi exactement ? Comment compter les points de code ?',
    back: '`length` compte des **unités UTF-16** : un emoji hors plan de base en vaut 2. `[...s].length` compte les points de code ; `Intl.Segmenter` compte les graphèmes.',
    code: `'👍'.length; // → 2
[...'👍'].length // → 1`,
  },
  { id: 'av-ch-f-centre', theme: 'chaines', front: 'Principe de l’expansion autour du centre ?', back: 'Tout palindrome a un centre : un caractère (longueur impaire) ou l’espace entre deux (longueur paire), soit 2n − 1 centres. On étend deux pointeurs depuis chacun tant que les caractères sont égaux : O(n²) en temps, O(1) en mémoire.' },
  { id: 'av-ch-f-lps', theme: 'chaines', front: 'Que contient le tableau `lps` de KMP ?', back: '`lps[i]` = longueur du plus long **préfixe propre** de `motif[0..i]` qui est aussi un **suffixe** de ce préfixe. Pour `ababaca` : `[0, 0, 1, 2, 3, 0, 1]`. Il permet de reprendre la recherche sans reculer dans le texte : O(n + m).' },
  { id: 'av-ch-f-rabin-karp', theme: 'chaines', front: 'Comment fonctionne Rabin-Karp ?', back: 'On compare l’**empreinte** (hachage polynomial) du motif à celle de chaque fenêtre, mise à jour en O(1) quand elle glisse : on retire le caractère sortant (pondéré par `B^(m−1)`), on multiplie par `B`, on ajoute l’entrant. En cas d’égalité, on vérifie la sous-chaîne (collisions). O(n + m) en moyenne.' },
  { id: 'av-ch-f-sort', theme: 'chaines', front: 'Pourquoi `[\'é\', \'z\', \'A\'].sort()` ne donne-t-il pas l’ordre alphabétique ?', back: 'Sans comparateur, `sort` compare les unités UTF-16 : `A` (65) < `z` (122) < `é` (233). Pour l’ordre d’une langue : `sort((a, b) => a.localeCompare(b, \'fr\'))` ou `new Intl.Collator(\'fr\').compare`.' },
]

const chainesLexique: LexiqueEntry[] = [
  { term: 'Unité de code UTF-16', theme: 'chaines', def: 'Valeur de 16 bits qui constitue l’élément de base d’une chaîne JavaScript. `length`, `s[i]` et `charCodeAt` travaillent en unités de code ; un point de code hors du plan de base en occupe deux (paire de substitution).', see: ['Point de code'] },
  { term: 'Point de code', theme: 'chaines', def: 'Numéro attribué par Unicode à un caractère (de U+0000 à U+10FFFF). En JavaScript, `codePointAt`, `for…of` et `[...s]` travaillent en points de code. Un caractère perçu (graphème) peut en combiner plusieurs.', see: ['Unité de code UTF-16'] },
  { term: 'Fonction d’échec (KMP)', theme: 'chaines', def: 'Tableau `lps` de l’algorithme de Knuth-Morris-Pratt : pour chaque préfixe du motif, la longueur de son plus long préfixe propre qui est aussi suffixe. Il indique où reprendre après un désaccord, d’où une recherche en O(n + m).', see: ['Hachage roulant'] },
  { term: 'Hachage roulant', theme: 'chaines', def: 'Empreinte d’une fenêtre glissante mise à jour en O(1) à chaque décalage (on retire le caractère sortant, on ajoute l’entrant). C’est le cœur de Rabin-Karp ; les collisions imposent une vérification ou un double hachage.', see: ['Fonction d’échec (KMP)'] },
  { term: 'Expansion autour du centre', theme: 'chaines', def: 'Technique qui trouve les palindromes contigus en étendant deux pointeurs depuis chacun des 2n − 1 centres possibles (caractères et espaces entre caractères). O(n²) en temps, O(1) en mémoire.' },
]

const chainesEntretien: EntretienQ[] = [
  {
    id: 'av-ch-e-immuable',
    section: 'structures',
    q: 'Les chaînes sont immuables en JavaScript, en Java et en Python. Qu’est-ce que cela change pour vos algorithmes ?',
    answer: 'Toute « modification » crée une nouvelle chaîne : remplacer un caractère, concaténer ou découper coûte O(longueur). Dans une boucle, cela peut transformer un algorithme linéaire en quadratique (concaténation répétée, `slice` à chaque itération).\n\nParades : accumuler dans un tableau puis `join` (`StringBuilder` en Java, `\'\'.join` en Python) ; travailler sur un tableau de caractères pour les modifications en place (inversion, permutation) ; manipuler des **indices** plutôt que des sous-chaînes. En contrepartie, l’immuabilité rend les chaînes sûres comme clés de `Map`, partageables sans copie défensive, et permet au moteur de les interner ou de les représenter en ropes.',
    attendu: 'Identifier le coût caché de la concaténation et de `slice`, proposer tableau + `join` ou indices, et citer au moins un avantage de l’immuabilité.',
  },
  {
    id: 'av-ch-e-cx-recherche',
    section: 'complexite',
    q: 'Quelle est la complexité de la recherche d’un motif de longueur m dans un texte de longueur n, et comment l’améliorer ?',
    answer: 'La recherche naïve compare le motif à chaque position : O(n × m) au pire, atteint sur `aaaa…ab` cherché dans `aaaa…a`. **KMP** garantit O(n + m) grâce à la fonction d’échec : le texte n’est jamais relu. **Rabin-Karp** obtient O(n + m) en moyenne avec une empreinte glissante, au prix d’une vérification en cas de collision ; il brille pour chercher plusieurs motifs. Le **Z-algorithm** est une alternative linéaire à KMP. En pratique, `indexOf` des moteurs combine des heuristiques très rapides (type Boyer-Moore), ce qu’il est bon de mentionner.',
    attendu: 'Le pire cas naïf avec un exemple, au moins un algorithme linéaire expliqué dans ses grandes lignes, et du recul sur l’usage réel de `indexOf`.',
  },
  {
    id: 'av-ch-e-unicode',
    section: 'techniques',
    q: 'On vous demande d’inverser une chaîne. Quelles questions posez-vous, et quel code proposez-vous ?',
    answer: 'Je demande quel est l’alphabet : ASCII seulement, ou du texte Unicode quelconque (emojis, accents combinants) ? En ASCII, deux pointeurs sur un tableau de caractères suffisent. Pour de l’Unicode, `split(\'\')` casse les paires de substitution ; `[...s]` découpe par points de code et suffit pour la plupart des emojis ; pour les graphèmes composés (drapeaux, familles, `e` + accent combinant), il faut `Intl.Segmenter`.',
    code: `const s = 'a👍b'
s.split('').reverse().join('') === 'b👍a'; // → false
[...s].reverse().join('') // → 'b👍a'
const seg = new Intl.Segmenter('fr', { granularity: 'grapheme' })
Array.from(seg.segment('🇫🇷e\\u0301'), (x) => x.segment).length // → 2`,
    equiv: {
      python: `s = 'a👍b'
print(s[::-1])  # b👍a : points de code
# pour les graphèmes : le module tiers « grapheme » ou regex avec \\X`,
      java: `String s = "a👍b";
System.out.println(new StringBuilder(s).reverse()); // b👍a : préserve les paires de substitution
// graphèmes : java.text.BreakIterator.getCharacterInstance()`,
      rust: `let s = "a👍b";
let r: String = s.chars().rev().collect(); // b👍a
// graphèmes : crate unicode-segmentation, s.graphemes(true).rev().collect::<String>()`,
    },
    attendu: 'Clarifier l’alphabet avant de coder, connaître la différence entre unités UTF-16, points de code et graphèmes, et proposer la bonne API pour chaque niveau.',
  },
]

export const pack: ThemePack = {
  cours: [dpCours, bitsCours, chainesCours],
  katas: [...dpKatas, ...bitsKatas, ...chainesKatas],
  quiz: [...dpQuiz, ...bitsQuiz, ...chainesQuiz],
  pieges: [...dpPieges, ...bitsPieges, ...chainesPieges],
  flashcards: [...dpFlashcards, ...bitsFlashcards, ...chainesFlashcards],
  lexique: [...dpLexique, ...bitsLexique, ...chainesLexique],
  entretien: [...dpEntretien, ...bitsEntretien, ...chainesEntretien],
}
