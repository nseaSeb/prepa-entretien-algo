import type { CoursSection, EntretienQ, Flashcard, Kata, LexiqueEntry, Piege, QuizItem, ThemePack } from '../types'

/*
 * Pack « fondamentaux » : complexité, tableaux, hachage, fenêtre glissante, et la section
 * d’entretien « général ». Préfixe des identifiants : fo-.
 * Règle d’écriture : pas d’accent grave ni de « ${ » dans les champs de code JS (concaténation à la place).
 */

const cours: CoursSection[] = []
const katas: Kata[] = []
const quiz: QuizItem[] = []
const pieges: Piege[] = []
const flashcards: Flashcard[] = []
const lexique: LexiqueEntry[] = []
const entretien: EntretienQ[] = []

// ═════════════════════════════════════════════════════════════════════════════
// COMPLEXITÉ ET BIG O
// ═════════════════════════════════════════════════════════════════════════════

cours.push({
  id: 'complexite',
  title: 'Complexité et Big O',
  summary: 'Estimer avant de coder : la notation asymptotique, les ordres de grandeur qui relient les contraintes d’un énoncé à la complexité visée, le coût des boucles, de la récursion et des méthodes natives de JavaScript.',
  blocks: [
    { h: 'Big O, Θ et Ω : ce que l’on mesure vraiment', id: 'complexite-notations' },
    {
      p: 'La complexité décrit la façon dont le coût d’un algorithme **croît** avec la taille `n` de l’entrée. On ne compte pas des millisecondes, qui dépendent de la machine, mais un nombre d’opérations élémentaires (comparaison, affectation, accès à une case), dont on ne garde que le terme dominant : `3n² + 10n + 7` devient **O(n²)**. Les constantes disparaissent parce qu’elles ne changent pas la forme de la courbe : un algorithme O(n) finit toujours par battre un O(n²) quand `n` grandit, même s’il est dix fois plus lent par opération.',
    },
    {
      list: [
        '**O (grand O)** : une borne **supérieure**. « f est en O(n²) » signifie que f ne croît pas plus vite que n², à une constante près. C’est la notation employée en entretien, presque toujours pour le **pire cas**.',
        '**Ω (grand Oméga)** : une borne **inférieure**. Tout tri par comparaisons est en Ω(n log n) : aucun ne peut faire mieux dans le pire cas.',
        '**Θ (grand Thêta)** : borne supérieure **et** inférieure, donc la croissance exacte. Parcourir un tableau en entier est en Θ(n). Quand on dit « ce code est en O(n) », on pense souvent Θ(n).',
        '**Pire, moyen, meilleur cas** : une question différente de O/Θ/Ω. La recherche linéaire est en O(1) dans le meilleur cas (élément en tête) et en O(n) dans le pire. Sauf précision, on annonce le pire cas, et l’on précise « en moyenne » pour les tables de hachage ou le tri rapide.',
      ],
    },
    {
      title: 'Meilleur et pire cas d’une recherche linéaire',
      code: `function linearSearch(arr, target) {
  let steps = 0
  for (let i = 0; i < arr.length; i++) {
    steps++
    if (arr[i] === target) return { index: i, steps }
  }
  return { index: -1, steps }
}

const data = [7, 3, 9, 4, 1]
linearSearch(data, 7) // → { index: 0, steps: 1 }
linearSearch(data, 8) // → { index: -1, steps: 5 }`,
    },
    {
      table: [
        ['Complexité', 'Nom', 'Exemple typique'],
        ['O(1)', 'constante', '`arr[i]`, `map.get(k)`, `push`'],
        ['O(log n)', 'logarithmique', 'recherche dichotomique, exponentiation rapide'],
        ['O(n)', 'linéaire', 'un parcours, two pointers, fenêtre glissante'],
        ['O(n log n)', 'quasi linéaire', 'tri fusion, `sort`, n insertions dans un tas'],
        ['O(n²)', 'quadratique', 'toutes les paires, deux boucles imbriquées'],
        ['O(2ⁿ)', 'exponentielle', 'tous les sous-ensembles'],
        ['O(n!)', 'factorielle', 'toutes les permutations'],
      ],
    },
    {
      mnemo: '« On garde le plus gros terme, on jette les constantes. » O borne par le haut, Ω par le bas, Θ des deux côtés.',
      piege: 'Confondre « Θ/O/Ω » (une borne) et « pire/meilleur cas » (une entrée particulière). « Le meilleur cas du tri rapide est en Ω(n log n) » et « le tri rapide est en O(n²) dans le pire cas » sont deux affirmations compatibles.',
    },

    { h: 'Ordres de grandeur : lire les contraintes de l’énoncé', id: 'complexite-ordres' },
    {
      p: 'Repère central : un moteur JavaScript exécute de l’ordre de **10⁸ opérations simples par seconde** (davantage sur une boucle très simple, moins dès qu’on alloue des objets). Un juge en ligne accorde typiquement une à deux secondes. On en déduit la complexité **visée** à partir de la taille maximale de l’entrée, avant même de chercher l’algorithme : c’est l’un des signaux les plus fiables d’un énoncé.',
    },
    {
      table: [
        ['Taille maximale de n', 'Complexité acceptable', 'Techniques probables'],
        ['n ≤ 10–12', 'O(n!) ou O(n · 2ⁿ)', 'permutations, backtracking exhaustif'],
        ['n ≤ 20–25', 'O(2ⁿ)', 'sous-ensembles, masques de bits, DP sur masques'],
        ['n ≤ 500', 'O(n³)', 'trois boucles, Floyd-Warshall, DP sur intervalles'],
        ['n ≤ 5 000 (10³–10⁴)', 'O(n²)', 'toutes les paires, DP 2D'],
        ['n ≤ 10⁵ – 10⁶', 'O(n log n) ou O(n)', 'tri, tas, dichotomie, two pointers, hachage, fenêtre'],
        ['n ≤ 10⁸ et plus', 'O(n) très simple, O(log n) ou O(1)', 'formule, dichotomie sur la réponse'],
      ],
    },
    {
      p: 'Pour vérifier une intuition, on fait le calcul : n = 10⁵ en O(n²) donne 10¹⁰ opérations, soit une centaine de secondes, hors délai ; en O(n log n) on obtient environ 1,7 × 10⁶ opérations, quelques millisecondes. À l’inverse, si n ≤ 20, l’énoncé « autorise » une exploration exhaustive : 2²⁰ ≈ 10⁶.',
    },
    {
      title: 'Quelques valeurs à connaître par cœur',
      code: `Math.round(Math.log2(1e3)) // → 10
Math.round(Math.log2(1e6)) // → 20
Math.round(Math.log2(1e9)) // → 30
2 ** 10 // → 1024
2 ** 20 // → 1048576
Math.round(1e5 * Math.log2(1e5)) // → 1660964`,
    },
    {
      mnemo: '« 10⁸ par seconde » ; log₂ de mille vaut 10, d’un million 20, d’un milliard 30 ; 2¹⁰ ≈ 10³.',
      piege: 'Ignorer les contraintes : proposer du O(n²) pour n = 10⁵, ou s’épuiser à chercher du O(n) quand n ≤ 20 invite au backtracking. Lisez les bornes avant d’écrire la moindre ligne.',
    },

    { h: 'Analyser des boucles', id: 'complexite-boucles' },
    {
      p: 'On compte combien de fois le corps le plus interne s’exécute. Des boucles **successives** s’additionnent, des boucles **imbriquées** se multiplient, et une variable **divisée ou multipliée** par une constante à chaque tour donne un logarithme. Une boucle intérieure qui démarre à `i + 1` fait la moitié des tours, n(n − 1)/2, ce qui reste O(n²).',
    },
    {
      title: 'Compter les tours plutôt que deviner',
      code: `function countOps(n) {
  let linear = 0
  for (let i = 0; i < n; i++) linear++

  let pairs = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) pairs++
  }

  let halving = 0
  for (let i = n; i > 1; i = Math.floor(i / 2)) halving++

  let mixed = 0
  for (let i = 1; i < n; i *= 2) {
    for (let j = 0; j < n; j++) mixed++
  }
  return { linear, pairs, halving, mixed }
}

countOps(16) // → { linear: 16, pairs: 120, halving: 4, mixed: 64 }
countOps(1024) // → { linear: 1024, pairs: 523776, halving: 10, mixed: 10240 }`,
    },
    {
      list: [
        '**Deux entrées distinctes** : deux boucles imbriquées sur `a` et `b` donnent O(n · m), pas O(n²). Deux boucles successives donnent O(n + m).',
        '**Le piège du « while » intérieur** : dans les techniques two pointers ou fenêtre glissante, une boucle `while` à l’intérieur d’un `for` n’implique pas O(n²). Si le pointeur intérieur ne recule jamais, il avance au plus n fois **au total** : l’ensemble est O(n). C’est une analyse amortie.',
        '**Boucle harmonique** : `for (i = 1; i <= n; i++) for (j = i; j <= n; j += i)` fait n/1 + n/2 + … + n/n ≈ n ln n tours, donc O(n log n) (crible d’Ératosthène).',
      ],
    },
    {
      mnemo: 'Successives : on additionne. Imbriquées : on multiplie. Divisée par deux : log. Pointeur qui ne recule jamais : linéaire au total.',
      piege: 'Conclure O(n²) dès qu’on voit deux boucles imbriquées. Regardez combien de fois **au total** la boucle intérieure avance : dans une fenêtre glissante, c’est n, pas n².',
    },

    { h: 'Récursion : arbre d’appels et théorème maître', id: 'complexite-recursion' },
    {
      p: 'Pour une fonction récursive, on dessine l’**arbre d’appels** : coût total = somme du travail fait dans chaque nœud. Deux questions suffisent souvent : combien d’appels au total, et quel travail par appel ? Un appel qui se relance deux fois sur `n − 1` produit un arbre binaire complet de hauteur n, donc environ 2ⁿ appels. La mémoire, elle, est proportionnelle à la **profondeur** de l’arbre (la pile d’appels), pas à son nombre de nœuds.',
    },
    {
      title: 'Fibonacci naïf : l’arbre d’appels explose',
      code: `let calls = 0
function fib(n) {
  calls++
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
}

fib(20) // → 6765
calls // → 21891

calls = 0
const memo = new Map()
function fibMemo(n) {
  calls++
  if (n < 2) return n
  if (memo.has(n)) return memo.get(n)
  const value = fibMemo(n - 1) + fibMemo(n - 2)
  memo.set(n, value)
  return value
}

fibMemo(20) // → 6765
calls // → 39`,
      equiv: {
        python: `from functools import cache

calls = 0

def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

@cache  # mémoïsation intégrée
def fib_memo(n):
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)`,
        java: `import java.util.HashMap;
import java.util.Map;

class Fib {
    static int calls = 0;
    static Map<Integer, Long> memo = new HashMap<>();

    static long fib(int n) {
        calls++;
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);
    }

    static long fibMemo(int n) {
        calls++;
        if (n < 2) return n;
        Long cached = memo.get(n);
        if (cached != null) return cached;
        long value = fibMemo(n - 1) + fibMemo(n - 2);
        memo.put(n, value);
        return value;
    }
}`,
      },
    },
    {
      p: 'Pour les algorithmes « diviser pour régner » de la forme **T(n) = a · T(n / b) + O(nᵈ)** (a sous-problèmes de taille n / b, plus un travail O(nᵈ) pour découper et combiner), le **théorème maître** simplifié compare a et bᵈ :',
    },
    {
      table: [
        ['Cas', 'Résultat', 'Exemple'],
        ['a < bᵈ (la combinaison domine)', 'O(nᵈ)', 'T(n) = T(n/2) + O(n) → O(n)'],
        ['a = bᵈ (chaque niveau coûte pareil)', 'O(nᵈ log n)', 'tri fusion : 2T(n/2) + O(n) → O(n log n) ; dichotomie : T(n/2) + O(1) → O(log n)'],
        ['a > bᵈ (les feuilles dominent)', 'O(n^(log_b a))', 'parcours d’arbre : 2T(n/2) + O(1) → O(n) ; Karatsuba : 3T(n/2) + O(n) → O(n^1,58)'],
      ],
    },
    {
      p: 'Ce théorème ne s’applique pas aux récurrences qui retirent une constante (T(n) = T(n − 1) + O(1) donne O(n) ; T(n) = 2T(n − 1) + O(1) donne O(2ⁿ)) : pour celles-là, on revient à l’arbre d’appels.',
    },
    {
      mnemo: 'Temps = nombre de nœuds × travail par nœud ; mémoire = profondeur de l’arbre. Maître : comparer a à bᵈ (plus petit, égal, plus grand → nᵈ, nᵈ log n, feuilles).',
      piege: 'Confondre T(n/2) et T(n − 1) : deux appels sur n/2 donnent O(n), deux appels sur n − 1 donnent O(2ⁿ). Et oublier la pile : une récursion de profondeur n coûte O(n) en mémoire, même sans aucun tableau.',
    },

    { h: 'Coût amorti, mémoire et pile d’appels', id: 'complexite-amorti' },
    {
      p: 'Le **coût amorti** est le coût moyen d’une opération sur une longue suite d’opérations, dans le pire cas pour la suite entière. Exemple canonique : le tableau dynamique. Quand il est plein, `push` alloue un tableau deux fois plus grand et recopie tout (O(n)), mais ces copies sont si rares que n `push` coûtent au total moins de 2n copies : **O(1) amorti** par `push`. Ce n’est pas une moyenne sur des entrées aléatoires, c’est une garantie sur toute séquence.',
    },
    {
      title: 'Simuler les recopies d’un tableau dynamique',
      code: `function countCopies(n) {
  let capacity = 1
  let size = 0
  let copies = 0
  for (let i = 0; i < n; i++) {
    if (size === capacity) {
      copies += size
      capacity *= 2
    }
    size++
  }
  return copies
}

countCopies(1000) // → 1023
countCopies(1000000) // → 1048575`,
    },
    {
      list: [
        '**Mémoire auxiliaire** : on compte la mémoire **supplémentaire**, sans l’entrée. Un algorithme « en place » est en O(1) de mémoire auxiliaire.',
        '**Compromis temps/mémoire** : un `Set` de n éléments (O(n) en mémoire) transforme une recherche O(n) en O(1). C’est le cœur de la plupart des optimisations d’entretien.',
        '**Pile d’appels** : chaque appel récursif en attente occupe un cadre de pile. Les moteurs JavaScript limitent la profondeur à quelques milliers ou dizaines de milliers d’appels selon la taille des cadres, et JavaScript n’optimise pas les appels terminaux en pratique (seul Safari le fait). Pour n = 10⁵, une récursion linéaire doit être réécrite en boucle ou avec une pile explicite.',
        '**La sortie compte-t-elle ?** Renvoyer un tableau de n résultats coûte O(n) de mémoire, mais on précise souvent « O(1) hors sortie ».',
      ],
    },
    {
      title: 'Une récursion trop profonde fait déborder la pile',
      code: `function sumTo(n) {
  return n === 0 ? 0 : n + sumTo(n - 1)
}

console.log(sumTo(1000))
try {
  sumTo(1e6)
} catch (e) {
  console.log(e.name + ' : ' + e.message)
}

function sumToLoop(n) {
  let total = 0
  for (let i = 1; i <= n; i++) total += i
  return total
}
console.log(sumToLoop(1e6))`,
      output: `500500
RangeError : Maximum call stack size exceeded
500000500000`,
    },
    {
      mnemo: 'Amorti = « cher mais rare » : doubler la capacité rend `push` O(1) amorti. Mémoire = structures auxiliaires + profondeur de pile.',
      piege: 'Annoncer O(1) de mémoire pour une fonction récursive : la pile coûte O(profondeur). Et croire que l’amorti est une moyenne « probabiliste » : c’est une garantie sur toute suite d’opérations.',
    },

    { h: 'Le coût caché des méthodes natives de JavaScript', id: 'complexite-natifs' },
    {
      p: 'Une ligne de code n’est pas une opération : beaucoup de méthodes natives parcourent ou recopient tout le tableau. Les appeler dans une boucle transforme silencieusement un algorithme linéaire en algorithme quadratique. C’est l’erreur la plus fréquente des candidats JavaScript, et les recruteurs la guettent.',
    },
    {
      table: [
        ['Opération', 'Complexité', 'Pourquoi'],
        ['`arr[i]`, `arr.length`, `push`, `pop`', 'O(1) (amorti pour push)', 'travail en fin de tableau'],
        ['`shift`, `unshift`', 'O(n)', 'tous les indices sont décalés'],
        ['`splice(i, k, …)`', 'O(n)', 'décalage de la fin du tableau'],
        ['`includes`, `indexOf`, `find`, `some`, `every`', 'O(n)', 'parcours linéaire'],
        ['`slice(a, b)`, `[...arr]`, `concat`, `Array.from`', 'O(k) (taille copiée)', 'nouvelle copie'],
        ['`sort`', 'O(n log n)', 'TimSort dans V8, stable depuis ES2019'],
        ['`Set` / `Map` : `has`, `get`, `set`, `add`, `delete`', 'O(1) en moyenne', 'table de hachage'],
        ['`Object.keys(obj)`, `JSON.stringify`', 'O(taille)', 'construisent un nouveau tableau ou une chaîne'],
        ['`str.slice`, `split`, `join`, `str.indexOf`, `replace`', 'O(n)', 'les chaînes sont immuables'],
        ['`s += x` dans une boucle', 'O(n²) en théorie', 'recopie à chaque tour ; V8 utilise des « ropes » et le rend rapide en pratique'],
      ],
    },
    {
      title: 'Dédoublonner : includes (O(n²)) contre Set (O(n))',
      code: `function uniqueSlow(arr) {
  const out = []
  for (const x of arr) {
    if (!out.includes(x)) out.push(x) // includes parcourt out : O(n) par tour
  }
  return out
}

function uniqueFast(arr) {
  return [...new Set(arr)] // Set conserve l'ordre d'insertion
}

uniqueSlow([3, 1, 3, 2, 1]) // → [ 3, 1, 2 ]
uniqueFast([3, 1, 3, 2, 1]) // → [ 3, 1, 2 ]`,
      equiv: {
        python: `def unique_fast(arr):
    # dict conserve l'ordre d'insertion (un set ne le garantit pas)
    return list(dict.fromkeys(arr))`,
        java: `import java.util.*;

static List<Integer> uniqueFast(List<Integer> arr) {
    // LinkedHashSet conserve l'ordre d'insertion
    return new ArrayList<>(new LinkedHashSet<>(arr));
}`,
        rust: `use std::collections::HashSet;

fn unique_fast(arr: &[i32]) -> Vec<i32> {
    let mut seen = HashSet::new();
    // insert renvoie false si la valeur était déjà présente
    arr.iter().copied().filter(|x| seen.insert(*x)).collect()
}`,
        php: `function uniqueFast(array $arr): array {
    // array_unique garde la première occurrence ; array_values réindexe
    return array_values(array_unique($arr));
}`,
      },
    },
    {
      title: 'Une file sans shift : un indice de tête',
      code: `const queue = [1, 2, 3]
let head = 0
queue.push(4)
queue[head++] // → 1
queue[head++] // → 2
queue.length - head // → 2`,
      equiv: {
        python: `from collections import deque

queue = deque([1, 2, 3])
queue.append(4)
queue.popleft()  # O(1), alors que list.pop(0) est O(n)
queue.popleft()
len(queue)`,
        java: `import java.util.ArrayDeque;

ArrayDeque<Integer> queue = new ArrayDeque<>(java.util.List.of(1, 2, 3));
queue.addLast(4);
queue.pollFirst(); // O(1), alors que ArrayList.remove(0) est O(n)
queue.pollFirst();
queue.size();`,
        rust: `use std::collections::VecDeque;

let mut queue: VecDeque<i32> = VecDeque::from(vec![1, 2, 3]);
queue.push_back(4);
queue.pop_front(); // O(1), alors que Vec::remove(0) est O(n)
queue.pop_front();
queue.len();`,
        php: `$queue = new SplQueue();
foreach ([1, 2, 3, 4] as $x) $queue->enqueue($x);
$queue->dequeue(); // O(1), alors que array_shift est O(n)
$queue->dequeue();
count($queue);`,
      },
    },
    {
      title: 'Construire une chaîne : accumuler puis join',
      code: `const parts = []
for (let i = 1; i <= 5; i++) parts.push(i * i)
parts.join(',') // → '1,4,9,16,25'

let s = ''
for (let i = 1; i <= 5; i++) s += i * i
s // → '1491625'`,
    },
    {
      p: 'En théorie, `s += x` recopie toute la chaîne à chaque tour, donc O(n²) au total ; c’est vrai en Java (d’où `StringBuilder`) et en Python (d’où `"".join(parts)`). V8 représente les concaténations par des « ropes » et ne les aplatit qu’à la lecture, si bien qu’en JavaScript `+=` reste rapide en pratique. Le dire en entretien montre que l’on connaît à la fois le risque théorique et le comportement réel.',
    },
    {
      mnemo: 'Tout ce qui **décale** (shift, unshift, splice) ou **cherche** (includes, indexOf) ou **copie** (slice, spread, concat) est linéaire. Seuls l’indice, la fin du tableau et le hachage sont en O(1).',
      piege: '`arr.includes(x)` ou `arr.shift()` dans une boucle : l’algorithme paraît linéaire mais il est quadratique. De même, `[...acc, x]` dans un `reduce` recopie l’accumulateur à chaque tour.',
    },
  ],
  mnemo: 'Lire les contraintes → en déduire la complexité visée (10⁸ op/s). Boucles : additionner ou multiplier ; récursion : nœuds × travail, mémoire = profondeur ; méthodes natives : shift, splice, includes et slice sont linéaires.',
  piege: 'Les coûts cachés : une méthode native linéaire dans une boucle, une récursion trop profonde pour la pile, une boucle `while` intérieure prise pour du O(n²) alors que son pointeur ne recule jamais.',
})

katas.push(
  {
    id: 'fo-doublons',
    title: 'Contient un doublon',
    difficulty: 'facile',
    theme: 'complexite',
    pattern: 'Set pour la recherche en O(1)',
    statement: `Écrivez \`containsDuplicate(nums)\` qui renvoie \`true\` si au moins une valeur apparaît **deux fois ou plus** dans le tableau \`nums\`, et \`false\` si toutes les valeurs sont distinctes.

Exemples :

- \`containsDuplicate([1, 2, 3, 1])\` donne \`true\` ;
- \`containsDuplicate([1, 2, 3, 4])\` donne \`false\` ;
- \`containsDuplicate([])\` donne \`false\`.

Contraintes : \`0 ≤ nums.length ≤ 2 × 10⁵\`, valeurs entières quelconques (négatives comprises). Une solution en O(n²) sera trop lente sur la grande entrée : visez **O(n)**.`,
    starter: `function containsDuplicate(nums) {
  // TODO : renvoyer true si une valeur se répète
  return false
}`,
    solution: `function containsDuplicate(nums) {
  const seen = new Set()
  for (const x of nums) {
    if (seen.has(x)) return true // déjà vue : doublon
    seen.add(x)
  }
  return false
}`,
    solutionEquiv: {
      python: `def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
      java: `import java.util.HashSet;
import java.util.Set;

static boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums) {
        // add renvoie false si la valeur était déjà présente
        if (!seen.add(x)) return true;
    }
    return false;
}`,
      rust: `use std::collections::HashSet;

fn contains_duplicate(nums: &[i64]) -> bool {
    let mut seen = HashSet::new();
    for &x in nums {
        // insert renvoie false si la valeur était déjà présente
        if !seen.insert(x) {
            return true;
        }
    }
    false
}`,
      php: `function containsDuplicate(array $nums): bool {
    $seen = [];
    foreach ($nums as $x) {
        if (isset($seen[$x])) return true;
        $seen[$x] = true;
    }
    return false;
}`,
    },
    tests: [
      { name: 'exemple avec doublon', code: `assertEqual(containsDuplicate([1, 2, 3, 1]), true)` },
      { name: 'toutes distinctes', code: `assertEqual(containsDuplicate([1, 2, 3, 4]), false)` },
      { name: 'tableau vide et un seul élément', code: `assertEqual(containsDuplicate([]), false)
assertEqual(containsDuplicate([42]), false)` },
      { name: 'négatifs et zéro', code: `assertEqual(containsDuplicate([-1, 0, 1, -1]), true)
assertEqual(containsDuplicate([0, -0 + 1, -2]), false)` },
      { name: 'doublon en toute fin', code: `assertEqual(containsDuplicate([5, 4, 3, 2, 1, 5]), true)` },
      {
        name: 'grande entrée (n = 200 000, valeurs distinctes)',
        code: `const n = 200000
const big = []
for (let i = 0; i < n; i++) big.push((i * 7919) % n) // permutation de 0..n-1
const t0 = performance.now()
const result = containsDuplicate(big)
const elapsed = performance.now() - t0
assertEqual(result, false)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms pour n = 200 000 (visez O(n))')`,
      },
    ],
    hints: [
      'La version naïve compare chaque paire : n(n − 1)/2 comparaisons, soit 2 × 10¹⁰ pour la grande entrée.',
      'Il faut savoir en O(1) si une valeur a déjà été rencontrée : quelle structure offre cela ?',
      'Parcourez le tableau avec un `Set` : si `seen.has(x)`, c’est un doublon ; sinon `seen.add(x)`.',
    ],
    discussion: `**Complexité** : O(n) en temps en moyenne (chaque \`has\`/\`add\` est O(1) en moyenne), O(n) en mémoire pour le \`Set\`.

**Alternatives à évoquer** :

- trier puis comparer les voisins : O(n log n) en temps, O(1) de mémoire auxiliaire si l'on a le droit de modifier l'entrée (sinon O(n) pour la copie) ;
- en une ligne : \`new Set(nums).size !== nums.length\`, toujours O(n), mais sans sortie anticipée au premier doublon ;
- si les valeurs sont bornées (par exemple entre 0 et 10⁶), un tableau de booléens est plus rapide qu'un \`Set\`.

**Questions de suivi** : « et si la mémoire est limitée à O(1) ? » (tri en place) ; « doublon à distance au plus k ? » (fenêtre glissante avec un \`Set\` de taille k) ; « doublon de valeur à t près ? » (seaux de largeur t + 1).`,
  },
  {
    id: 'fo-intersection',
    title: 'Intersection de deux tableaux',
    difficulty: 'facile',
    theme: 'complexite',
    pattern: 'Set au lieu de includes',
    statement: `Écrivez \`intersection(a, b)\` qui renvoie les valeurs **distinctes** présentes à la fois dans \`a\` et dans \`b\`, dans l'**ordre de leur première apparition dans \`a\`**.

Exemples :

- \`intersection([4, 9, 5, 9], [9, 4, 9, 8, 4])\` donne \`[4, 9]\` ;
- \`intersection([1, 2, 2, 1], [2, 2])\` donne \`[2]\` ;
- \`intersection([1, 2], [])\` donne \`[]\`.

Contraintes : chaque tableau contient jusqu'à 2 × 10⁵ entiers. Une solution qui appelle \`b.includes\` pour chaque élément de \`a\` fait jusqu'à 4 × 10¹⁰ comparaisons : visez **O(n + m)**.`,
    starter: `function intersection(a, b) {
  // TODO : valeurs distinctes communes, dans l'ordre de a, en O(n + m)
  return []
}`,
    solution: `function intersection(a, b) {
  const inB = new Set(b) // O(m), puis has en O(1)
  const added = new Set()
  const result = []
  for (const x of a) {
    if (inB.has(x) && !added.has(x)) {
      added.add(x)
      result.push(x)
    }
  }
  return result
}`,
    solutionEquiv: {
      python: `def intersection(a, b):
    in_b = set(b)
    added = set()
    result = []
    for x in a:
        if x in in_b and x not in added:
            added.add(x)
            result.append(x)
    return result`,
      java: `import java.util.*;

static List<Integer> intersection(int[] a, int[] b) {
    Set<Integer> inB = new HashSet<>();
    for (int x : b) inB.add(x);
    Set<Integer> added = new HashSet<>();
    List<Integer> result = new ArrayList<>();
    for (int x : a) {
        if (inB.contains(x) && added.add(x)) result.add(x);
    }
    return result;
}`,
      rust: `use std::collections::HashSet;

fn intersection(a: &[i32], b: &[i32]) -> Vec<i32> {
    let in_b: HashSet<i32> = b.iter().copied().collect();
    let mut added = HashSet::new();
    let mut result = Vec::new();
    for &x in a {
        if in_b.contains(&x) && added.insert(x) {
            result.push(x);
        }
    }
    result
}`,
      php: `function intersection(array $a, array $b): array {
    $inB = array_flip($b); // valeurs → clés : isset en O(1)
    $added = [];
    $result = [];
    foreach ($a as $x) {
        if (isset($inB[$x]) && !isset($added[$x])) {
            $added[$x] = true;
            $result[] = $x;
        }
    }
    return $result;
}`,
    },
    tests: [
      { name: 'exemple avec répétitions', code: `assertEqual(intersection([4, 9, 5, 9], [9, 4, 9, 8, 4]), [4, 9])` },
      { name: 'une seule valeur commune', code: `assertEqual(intersection([1, 2, 2, 1], [2, 2]), [2])` },
      { name: 'tableaux vides', code: `assertEqual(intersection([1, 2], []), [])
assertEqual(intersection([], [1, 2]), [])
assertEqual(intersection([], []), [])` },
      { name: 'ordre de a et négatifs', code: `assertEqual(intersection([3, -1, 2, -1, 0], [0, 2, -1]), [-1, 2, 0])` },
      { name: 'aucune valeur commune', code: `assertEqual(intersection([1, 3, 5], [2, 4, 6]), [])` },
      {
        name: 'grande entrée (2 × 200 000 valeurs)',
        code: `const n = 200000
const a = []
const b = []
for (let i = 0; i < n; i++) {
  a.push(2 * i)
  b.push(3 * i)
}
const t0 = performance.now()
const result = intersection(a, b)
const elapsed = performance.now() - t0
assertEqual(result.length, Math.ceil((2 * n) / 6))
assertEqual(result.slice(0, 4), [0, 6, 12, 18])
assertEqual(result.length, 66667)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n + m))')`,
      },
    ],
    hints: [
      'La version immédiate, `a.filter((x) => b.includes(x))`, a deux défauts : elle garde les doublons de `a`, et `b.includes` est en O(m) à chaque tour.',
      'Transformez `b` en `Set` une fois pour toutes : la recherche devient O(1) en moyenne.',
      'Un second `Set` mémorise les valeurs déjà ajoutées au résultat pour ne pas les répéter.',
    ],
    discussion: `**Complexité** : O(n + m) en temps en moyenne, O(m) en mémoire pour \`inB\` (plus O(min(n, m)) pour le résultat).

**Points à évoquer** :

- version naïve avec \`includes\` : O(n · m), soit 4 × 10¹⁰ comparaisons pour deux tableaux de 2 × 10⁵ éléments ;
- si les deux tableaux sont **triés**, deux pointeurs donnent O(n + m) en temps et O(1) de mémoire auxiliaire ;
- construire le \`Set\` sur le **plus petit** tableau minimise la mémoire quand l'ordre de sortie n'importe pas ;
- variante « avec multiplicités » (LeetCode 350) : une \`Map\` de comptage au lieu d'un \`Set\` ;
- suivi classique : « et si \`b\` est trop gros pour la mémoire ? » (le lire par morceaux, ou trier et fusionner sur disque).`,
  },
  {
    id: 'fo-file-amortie',
    title: 'Une file en O(1) amorti',
    difficulty: 'moyen',
    theme: 'complexite',
    pattern: 'coût amorti',
    statement: `Implémentez une classe \`Queue\` (file FIFO) **sans utiliser \`shift\`**, dont chaque opération est en **O(1) amorti** :

- \`enqueue(x)\` ajoute \`x\` en queue de file ;
- \`dequeue()\` retire et renvoie l'élément de tête, ou \`undefined\` si la file est vide ;
- \`peek()\` renvoie l'élément de tête sans le retirer, ou \`undefined\` ;
- \`size()\` renvoie le nombre d'éléments.

Exemple :

- après \`q.enqueue(1)\`, \`q.enqueue(2)\`, on a \`q.dequeue()\` qui vaut \`1\`, puis \`q.peek()\` qui vaut \`2\` et \`q.size()\` qui vaut \`1\`.

La mémoire occupée doit rester proportionnelle au nombre d'éléments **présents** (ne pas garder indéfiniment les éléments déjà retirés). Un test enchaîne 600 000 opérations.`,
    starter: `class Queue {
  constructor() {
    this.items = []
  }
  enqueue(x) {
    this.items.push(x)
  }
  dequeue() {
    // TODO : sans shift, en O(1) amorti
    return this.items.pop()
  }
  peek() {
    return this.items[this.items.length - 1]
  }
  size() {
    return this.items.length
  }
}`,
    solution: `class Queue {
  constructor() {
    this.items = []
    this.head = 0 // indice du prochain élément à sortir
  }
  enqueue(x) {
    this.items.push(x)
  }
  dequeue() {
    if (this.head === this.items.length) return undefined
    const value = this.items[this.head]
    this.items[this.head] = undefined // libère la référence
    this.head++
    // compactage quand la moitié du tableau est « morte » : O(n) rare, donc O(1) amorti
    if (this.head > 1024 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head)
      this.head = 0
    }
    return value
  }
  peek() {
    return this.head < this.items.length ? this.items[this.head] : undefined
  }
  size() {
    return this.items.length - this.head
  }
}`,
    solutionEquiv: {
      python: `class Queue:
    def __init__(self):
        self.items = []
        self.head = 0

    def enqueue(self, x):
        self.items.append(x)

    def dequeue(self):
        if self.head == len(self.items):
            return None
        value = self.items[self.head]
        self.items[self.head] = None
        self.head += 1
        if self.head > 1024 and self.head * 2 > len(self.items):
            self.items = self.items[self.head:]
            self.head = 0
        return value

    def peek(self):
        return self.items[self.head] if self.head < len(self.items) else None

    def size(self):
        return len(self.items) - self.head

# En pratique : collections.deque (append / popleft en O(1)).`,
      java: `import java.util.ArrayList;
import java.util.List;

class Queue<T> {
    private List<T> items = new ArrayList<>();
    private int head = 0;

    void enqueue(T x) { items.add(x); }

    T dequeue() {
        if (head == items.size()) return null;
        T value = items.get(head);
        items.set(head, null);
        head++;
        if (head > 1024 && head * 2 > items.size()) {
            items = new ArrayList<>(items.subList(head, items.size()));
            head = 0;
        }
        return value;
    }

    T peek() { return head < items.size() ? items.get(head) : null; }

    int size() { return items.size() - head; }
}
// En pratique : ArrayDeque (addLast / pollFirst en O(1)).`,
    },
    tests: [
      { name: 'ordre FIFO', code: `const q = new Queue()
q.enqueue(1)
q.enqueue(2)
q.enqueue(3)
assertEqual([q.dequeue(), q.dequeue(), q.dequeue()], [1, 2, 3])` },
      { name: 'file vide', code: `const q = new Queue()
assertEqual(q.dequeue(), undefined)
assertEqual(q.peek(), undefined)
assertEqual(q.size(), 0)` },
      { name: 'peek et size', code: `const q = new Queue()
q.enqueue('a')
q.enqueue('b')
assertEqual(q.peek(), 'a')
assertEqual(q.size(), 2)
assertEqual(q.dequeue(), 'a')
assertEqual(q.peek(), 'b')
assertEqual(q.size(), 1)` },
      { name: 'opérations entrelacées et retour à vide', code: `const q = new Queue()
q.enqueue(1)
assertEqual(q.dequeue(), 1)
assertEqual(q.dequeue(), undefined)
q.enqueue(2)
q.enqueue(3)
assertEqual(q.dequeue(), 2)
q.enqueue(4)
assertEqual([q.dequeue(), q.dequeue(), q.size()], [3, 4, 0])` },
      { name: 'pas de shift', code: `const src = Queue.toString()
assert(!src.includes('.shift('), 'shift est en O(n) : utilisez un indice de tête')` },
      {
        name: 'grande entrée (600 000 opérations)',
        code: `const q = new Queue()
const t0 = performance.now()
let sum = 0
for (let i = 0; i < 200000; i++) {
  q.enqueue(i)
  q.enqueue(i)
  sum += q.dequeue()
}
const elapsed = performance.now() - t0
assertEqual(q.size(), 200000)
assertEqual(q.peek(), 100000)
assertEqual(sum, 9999900000)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      '`shift` décale tous les éléments : O(n) par appel. Et si l’on ne déplaçait rien, en retenant simplement où se trouve la tête ?',
      'Gardez un indice `head` : `dequeue` lit `items[head]` puis incrémente `head`. La taille vaut `items.length - head`.',
      'Pour ne pas garder indéfiniment les cases mortes, recopiez la partie vivante (`slice(head)`) quand plus de la moitié du tableau est morte : cette copie O(n) est assez rare pour rester O(1) amorti.',
    ],
    discussion: `**Complexité** : \`enqueue\`, \`peek\` et \`size\` en O(1) ; \`dequeue\` en O(1) amorti. Le compactage coûte O(taille) mais n'a lieu que lorsque \`head\` dépasse la moitié du tableau, c'est-à-dire après au moins autant de \`dequeue\` que d'éléments recopiés : chaque élément est recopié un nombre constant de fois en moyenne. Mémoire : O(nombre d'éléments présents), à un facteur 2 près.

**Alternatives** :

- **deux piles** (entrée et sortie) : on vide la pile d'entrée dans la pile de sortie quand celle-ci est vide ; chaque élément est déplacé une seule fois, donc O(1) amorti ;
- **tampon circulaire** (indices modulo la capacité, que l'on double si besoin) : O(1) sans recopie de compactage, c'est ce que font \`ArrayDeque\` (Java) et \`VecDeque\` (Rust) ;
- une **liste chaînée** donne du O(1) strict, au prix d'une allocation par élément.

**Remarque JavaScript** : V8 optimise parfois \`shift\` sur les petits tableaux, mais rien ne le garantit : en entretien, un BFS qui fait \`queue.shift()\` est en O(V²) dans le pire cas, et le signaler est un bon point.`,
  },
  {
    id: 'fo-puissance-modulaire',
    title: 'Exponentiation rapide modulaire',
    difficulty: 'moyen',
    theme: 'complexite',
    pattern: 'diviser pour régner (O(log n))',
    statement: `Écrivez \`powMod(base, exp, mod)\` qui renvoie \`base^exp mod mod\`.

- \`0 ≤ base ≤ 10⁹\`, \`0 ≤ exp ≤ 10¹⁵\` (entier), \`1 ≤ mod ≤ 10⁶ + 3\` ;
- avec \`mod ≤ 10⁶ + 3\`, le produit de deux restes reste inférieur à 2⁵³ : les nombres JavaScript suffisent, à condition de réduire modulo \`mod\` après **chaque** multiplication ;
- par convention, \`x⁰ = 1\`, donc \`powMod(x, 0, m)\` vaut \`1 % m\`.

Exemples :

- \`powMod(2, 10, 1000)\` donne \`24\` (1024 mod 1000) ;
- \`powMod(3, 0, 7)\` donne \`1\` ;
- \`powMod(5, 3, 1)\` donne \`0\`.

Avec \`exp\` jusqu'à 10¹⁵, une boucle de \`exp\` multiplications est hors de question : visez **O(log exp)**.`,
    starter: `function powMod(base, exp, mod) {
  // TODO : exponentiation rapide en O(log exp)
  return 1
}`,
    solution: `function powMod(base, exp, mod) {
  let result = 1 % mod
  base %= mod
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod // bit de poids faible à 1
    base = (base * base) % mod // base^(2^k)
    exp = Math.floor(exp / 2) // pas exp >> 1 : >> tronque à 32 bits
  }
  return result
}`,
    solutionEquiv: {
      python: `def pow_mod(base, exp, mod):
    result = 1 % mod
    base %= mod
    while exp > 0:
        if exp % 2 == 1:
            result = result * base % mod
        base = base * base % mod
        exp //= 2
    return result

# Natif : pow(base, exp, mod) (entiers de taille arbitraire).`,
      java: `static long powMod(long base, long exp, long mod) {
    long result = 1 % mod;
    base %= mod;
    while (exp > 0) {
        if ((exp & 1) == 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1; // long sur 64 bits : le décalage est sûr ici
    }
    return result;
}
// Pour un module proche de 10^18 : BigInteger.modPow.`,
      rust: `fn pow_mod(mut base: u64, mut exp: u64, modulo: u64) -> u64 {
    let mut result = 1 % modulo;
    base %= modulo;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result * base % modulo;
        }
        base = base * base % modulo;
        exp >>= 1;
    }
    result
}`,
      php: `function powMod(int $base, int $exp, int $mod): int {
    $result = 1 % $mod;
    $base %= $mod;
    while ($exp > 0) {
        if ($exp & 1) $result = $result * $base % $mod;
        $base = $base * $base % $mod;
        $exp >>= 1; // entiers PHP sur 64 bits
    }
    return $result;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(powMod(2, 10, 1000), 24)
assertEqual(powMod(3, 4, 100), 81)` },
      { name: 'exposant nul et module 1', code: `assertEqual(powMod(3, 0, 7), 1)
assertEqual(powMod(5, 3, 1), 0)
assertEqual(powMod(7, 0, 1), 0)` },
      { name: 'base nulle ou plus grande que le module', code: `assertEqual(powMod(0, 5, 13), 0)
assertEqual(powMod(1000000000, 2, 1000003), 999976)` },
      { name: 'petit théorème de Fermat', code: `assertEqual(powMod(12345, 1000002, 1000003), 1)` },
      { name: 'très grand exposant', code: `assertEqual(powMod(3, 1e15, 1000003), 400755)
assertEqual(powMod(123456789, 987654321, 1000003), 943623)` },
      { name: 'exposant au-delà de 2³²', code: `assertEqual(powMod(2, 2 ** 40 + 5, 999983), 382224)` },
    ],
    hints: [
      'Idée : x¹⁰ = (x⁵)², et x⁵ = x · (x²)². On divise l’exposant par deux à chaque étape.',
      'Version itérative : parcourez les bits de `exp` ; quand le bit courant vaut 1, multipliez le résultat par `base`, puis élevez `base` au carré.',
      'Réduisez modulo `mod` après chaque multiplication, et divisez avec `Math.floor(exp / 2)` : `exp >> 1` convertit en entier 32 bits et casse les exposants supérieurs à 2³¹.',
    ],
    discussion: `**Complexité** : O(log exp) multiplications (environ 50 pour 10¹⁵), O(1) en mémoire. La version récursive (\`p = powMod(base, floor(exp / 2))\`, puis \`p · p\` éventuellement multiplié par \`base\`) a la même complexité en temps, mais O(log exp) de pile.

**Pièges à mentionner** :

- **dépassement de 2⁵³** : avec un module de l'ordre de 10⁹ + 7 (le plus courant en entretien), \`result * base\` peut atteindre 10¹⁸, au-delà des entiers exacts des nombres JavaScript. Il faut alors passer en \`BigInt\` (\`(r * b) % m\` avec des \`n\`) ou découper la multiplication ;
- **opérateurs binaires** : \`>>\`, \`&\` et \`|\` travaillent sur 32 bits en JavaScript, d'où \`Math.floor(exp / 2)\` et \`exp % 2\` ;
- \`1 % mod\` et non \`1\` comme valeur initiale, pour que le cas \`mod = 1\` renvoie 0.

**Applications** : inverse modulaire (x^(p − 2) mod p si p est premier), Fibonacci en O(log n) par puissance de matrice, hachage polynomial (Rabin-Karp).`,
  },
  {
    id: 'fo-inversions',
    title: 'Compter les inversions',
    difficulty: 'difficile',
    theme: 'complexite',
    pattern: 'diviser pour régner (tri fusion)',
    statement: `Une **inversion** d'un tableau \`nums\` est une paire d'indices \`(i, j)\` avec \`i < j\` et \`nums[i] > nums[j]\`. Écrivez \`countInversions(nums)\` qui renvoie le nombre d'inversions. Le tableau d'entrée ne doit pas être modifié.

Exemples :

- \`countInversions([2, 4, 1, 3, 5])\` donne \`3\` : les paires (2, 1), (4, 1) et (4, 3) ;
- \`countInversions([1, 2, 3])\` donne \`0\` ;
- \`countInversions([3, 2, 1])\` donne \`3\` ;
- \`countInversions([2, 2])\` donne \`0\` (égalité : pas d'inversion).

Contraintes : \`n ≤ 2 × 10⁵\`. Le résultat peut dépasser 2³¹ mais reste sous 2⁵³. La double boucle en O(n²) dépasse le délai : visez **O(n log n)**.`,
    starter: `function countInversions(nums) {
  // TODO : tri fusion qui compte les inversions croisées pendant la fusion
  return 0
}`,
    solution: `function countInversions(nums) {
  const arr = nums.slice() // ne pas modifier l'entrée
  const tmp = new Array(arr.length)

  // trie arr[lo..hi) et renvoie le nombre d'inversions de cette tranche
  function sortCount(lo, hi) {
    if (hi - lo <= 1) return 0
    const mid = (lo + hi) >> 1
    let count = sortCount(lo, mid) + sortCount(mid, hi)
    let i = lo
    let j = mid
    let k = lo
    while (i < mid && j < hi) {
      if (arr[i] <= arr[j]) {
        tmp[k++] = arr[i++]
      } else {
        // arr[j] est plus petit que tous les éléments restants à gauche
        count += mid - i
        tmp[k++] = arr[j++]
      }
    }
    while (i < mid) tmp[k++] = arr[i++]
    while (j < hi) tmp[k++] = arr[j++]
    for (let t = lo; t < hi; t++) arr[t] = tmp[t]
    return count
  }

  return sortCount(0, arr.length)
}`,
    solutionEquiv: {
      python: `def count_inversions(nums):
    arr = list(nums)
    tmp = [0] * len(arr)

    def sort_count(lo, hi):
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        count = sort_count(lo, mid) + sort_count(mid, hi)
        i, j, k = lo, mid, lo
        while i < mid and j < hi:
            if arr[i] <= arr[j]:
                tmp[k] = arr[i]; i += 1
            else:
                count += mid - i
                tmp[k] = arr[j]; j += 1
            k += 1
        while i < mid:
            tmp[k] = arr[i]; i += 1; k += 1
        while j < hi:
            tmp[k] = arr[j]; j += 1; k += 1
        arr[lo:hi] = tmp[lo:hi]
        return count

    return sort_count(0, len(arr))`,
      java: `static long countInversions(int[] nums) {
    int[] arr = nums.clone();
    int[] tmp = new int[arr.length];
    return sortCount(arr, tmp, 0, arr.length);
}

static long sortCount(int[] arr, int[] tmp, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = (lo + hi) >>> 1;
    long count = sortCount(arr, tmp, lo, mid) + sortCount(arr, tmp, mid, hi);
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (arr[i] <= arr[j]) tmp[k++] = arr[i++];
        else {
            count += mid - i; // long : peut dépasser 2^31
            tmp[k++] = arr[j++];
        }
    }
    while (i < mid) tmp[k++] = arr[i++];
    while (j < hi) tmp[k++] = arr[j++];
    System.arraycopy(tmp, lo, arr, lo, hi - lo);
    return count;
}`,
      rust: `fn count_inversions(nums: &[i64]) -> u64 {
    let mut arr = nums.to_vec();
    let mut tmp = vec![0; arr.len()];
    let n = arr.len();
    sort_count(&mut arr, &mut tmp, 0, n)
}

fn sort_count(arr: &mut [i64], tmp: &mut [i64], lo: usize, hi: usize) -> u64 {
    if hi - lo <= 1 {
        return 0;
    }
    let mid = (lo + hi) / 2;
    let mut count = sort_count(arr, tmp, lo, mid) + sort_count(arr, tmp, mid, hi);
    let (mut i, mut j, mut k) = (lo, mid, lo);
    while i < mid && j < hi {
        if arr[i] <= arr[j] {
            tmp[k] = arr[i];
            i += 1;
        } else {
            count += (mid - i) as u64;
            tmp[k] = arr[j];
            j += 1;
        }
        k += 1;
    }
    while i < mid {
        tmp[k] = arr[i];
        i += 1;
        k += 1;
    }
    while j < hi {
        tmp[k] = arr[j];
        j += 1;
        k += 1;
    }
    arr[lo..hi].copy_from_slice(&tmp[lo..hi]);
    count
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `assertEqual(countInversions([2, 4, 1, 3, 5]), 3)` },
      { name: 'trié, inversé, égalités', code: `assertEqual(countInversions([1, 2, 3]), 0)
assertEqual(countInversions([3, 2, 1]), 3)
assertEqual(countInversions([2, 2]), 0)` },
      { name: 'vide et un seul élément', code: `assertEqual(countInversions([]), 0)
assertEqual(countInversions([7]), 0)` },
      { name: 'négatifs et doublons', code: `assertEqual(countInversions([0, -1, 3, -1, 2]), 4)` },
      { name: 'entrée non modifiée', code: `const input = [5, 1, 4, 2]
countInversions(input)
assertEqual(input, [5, 1, 4, 2])` },
      {
        name: 'comparaison avec la force brute (n = 2 000)',
        code: `let seed = 12345
const arr = []
for (let i = 0; i < 2000; i++) {
  seed = (seed * 1103515245 + 12345) % 2147483648
  arr.push(seed % 1000)
}
let brute = 0
for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) brute++
assertEqual(countInversions(arr), brute)`,
      },
      {
        name: 'grande entrée (n = 200 000, ordre décroissant)',
        code: `const n = 200000
const big = []
for (let i = 0; i < n; i++) big.push(n - i)
const t0 = performance.now()
const result = countInversions(big)
const elapsed = performance.now() - t0
assertEqual(result, (n * (n - 1)) / 2)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms pour n = 200 000 (visez O(n log n))')`,
      },
    ],
    hints: [
      'Coupez le tableau en deux moitiés : inversions totales = inversions à gauche + inversions à droite + inversions « croisées » (un élément à gauche, un à droite).',
      'Si les deux moitiés sont triées, les inversions croisées se comptent pendant la fusion : quand on prend `arr[j]` à droite alors qu’il reste `mid - i` éléments à gauche, ils sont tous plus grands que lui.',
      'C’est exactement un tri fusion qui renvoie un compteur : T(n) = 2T(n/2) + O(n), donc O(n log n). Prenez à gauche en cas d’égalité (`<=`) pour ne pas compter les paires égales.',
    ],
    discussion: `**Complexité** : O(n log n) en temps (théorème maître : a = 2, b = 2, d = 1, cas a = bᵈ), O(n) en mémoire pour la copie et le tampon, plus O(log n) de pile.

**Points à évoquer** :

- le nombre d'inversions mesure le « désordre » d'un tableau ; c'est aussi le nombre d'échanges d'éléments adjacents qu'effectue le tri à bulles ;
- le résultat peut atteindre n(n − 1)/2 ≈ 2 × 10¹⁰ : en Java ou en Rust, il faut un entier 64 bits ; en JavaScript, il reste exact tant qu'il est sous 2⁵³ ;
- **alternative** : un arbre de Fenwick (BIT) sur les valeurs compressées, en parcourant de droite à gauche et en comptant les valeurs plus petites déjà vues, aussi en O(n log n) ;
- variantes : « count of smaller numbers after self » (renvoyer le compte par indice), « reverse pairs » (\`nums[i] > 2 · nums[j]\`, même schéma avec un passage de comptage avant la fusion).`,
  },
)

quiz.push(
  {
    id: 'fo-q1',
    theme: 'complexite',
    kind: 'qcm',
    q: 'Un énoncé annonce `1 ≤ n ≤ 10⁵`. Quelle est la complexité la plus élevée que l’on peut raisonnablement viser ?',
    choices: ['O(n²)', 'O(n log n)', 'O(2ⁿ)', 'O(n³)'],
    answer: 1,
    why: 'Avec environ 10⁸ opérations par seconde, O(n²) donne 10¹⁰ opérations (une centaine de secondes), alors que O(n log n) en fait environ 1,7 × 10⁶. Pour n ≤ 10⁵, on vise O(n log n) ou O(n).',
  },
  {
    id: 'fo-q2',
    theme: 'complexite',
    kind: 'qcm',
    q: 'Que signifie « cet algorithme est en Θ(n log n) » ?',
    choices: [
      'Il fait au plus n log n opérations, à une constante près, mais peut-être beaucoup moins',
      'Sa croissance est exactement de l’ordre de n log n : bornée en haut et en bas par c · n log n',
      'Il est en n log n dans le meilleur cas seulement',
      'Il est en n log n en moyenne, sur des entrées aléatoires',
    ],
    answer: 1,
    why: 'Θ combine O (borne supérieure) et Ω (borne inférieure) : la croissance est encadrée des deux côtés. « Au plus » correspond à O seul. Meilleur, moyen ou pire cas est une question distincte : on peut parler du Θ du pire cas.',
  },
  {
    id: 'fo-q3',
    theme: 'complexite',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `let count = 0
for (let i = 1; i < 1000; i *= 2) count++
console.log(count)`,
    choices: ['10', '9', '11', '1000'],
    answer: 0,
    why: '`i` prend les valeurs 1, 2, 4, …, 512 : dix valeurs avant de dépasser 999 (1024 ne passe pas le test). Une variable doublée à chaque tour donne un nombre de tours logarithmique : ⌈log₂ 1000⌉ = 10.',
  },
  {
    id: 'fo-q4',
    theme: 'complexite',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `let ops = 0
for (let i = 0; i < 10; i++) {
  for (let j = i; j < 10; j++) ops++
}
console.log(ops)`,
    choices: ['100', '45', '55', '50'],
    answer: 2,
    why: 'Pour `i` = 0, la boucle intérieure fait 10 tours, puis 9, …, jusqu’à 1 pour `i` = 9 : 10 + 9 + … + 1 = 55 = n(n + 1)/2. C’est la moitié de n² environ, donc toujours O(n²). Avec `j = i + 1`, on obtiendrait 45.',
  },
  {
    id: 'fo-q5',
    theme: 'complexite',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de ce code (n = `arr.length`) ?',
    code: `function dedupe(arr) {
  const out = []
  for (const x of arr) {
    if (!out.includes(x)) out.push(x)
  }
  return out
}
dedupe([1, 2, 1, 3, 2])`,
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    answer: 2,
    why: '`out.includes(x)` parcourt `out`, qui peut contenir jusqu’à n éléments : O(n) par tour, donc O(n²) au total dans le pire cas (toutes les valeurs distinctes). Avec un `Set`, on descend à O(n).',
  },
  {
    id: 'fo-q6',
    theme: 'complexite',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de ce code ?',
    code: `function f(n) {
  let total = 0
  for (let i = n; i > 0; i = Math.floor(i / 2)) {
    for (let j = 0; j < n; j++) total++
  }
  return total
}
f(1000)`,
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    answer: 1,
    why: 'La boucle extérieure divise `i` par deux : environ log₂ n tours. La boucle intérieure fait toujours n tours. Produit : O(n log n). Attention à ne pas confondre avec la variante où la boucle intérieure va jusqu’à `i` (et non `n`) : n + n/2 + n/4 + … ≤ 2n, soit O(n).',
  },
  {
    id: 'fo-q7',
    theme: 'complexite',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction récursive (n = `hi - lo`) ?',
    code: `function maxOf(arr, lo, hi) {
  if (hi - lo === 1) return arr[lo]
  const mid = Math.floor((lo + hi) / 2)
  return Math.max(maxOf(arr, lo, mid), maxOf(arr, mid, hi))
}
maxOf([3, 9, 2, 7, 5], 0, 5)`,
    choices: ['O(log n)', 'O(n log n)', 'O(n)', 'O(2ⁿ)'],
    answer: 2,
    why: 'T(n) = 2T(n/2) + O(1). Théorème maître : a = 2, b = 2, d = 0, donc a > bᵈ et T(n) = O(n^(log₂ 2)) = O(n). Intuitivement, l’arbre d’appels a n feuilles et n − 1 nœuds internes, chacun en O(1). Deux appels sur n/2 ne donnent pas 2ⁿ : ce serait le cas avec deux appels sur n − 1.',
  },
  {
    id: 'fo-q8',
    theme: 'complexite',
    kind: 'bug',
    q: 'Cette fonction renvoie le bon résultat, mais elle devait être en O(n). Où est le problème ?',
    code: `function squares(nums) {
  return nums.reduce((acc, x) => [...acc, x * x], [])
}
squares([1, 2, 3])`,
    choices: [
      '`reduce` est lui-même en O(n²)',
      'Le spread `[...acc, x * x]` recopie tout l’accumulateur à chaque tour : O(n²) au total',
      '`x * x` peut dépasser `Number.MAX_SAFE_INTEGER`',
      'La valeur initiale `[]` est partagée entre les appels',
    ],
    answer: 1,
    why: 'Chaque tour crée un nouveau tableau de taille i + 1 : 1 + 2 + … + n = O(n²) copies. Il suffit de faire `acc.push(x * x); return acc`, ou plus simplement `nums.map((x) => x * x)`. Ce motif « immuable » est très courant en React et passe inaperçu sur de petites entrées.',
  },
)

pieges.push(
  {
    id: 'fo-p1',
    title: 'Entiers au-delà de 2⁵³',
    theme: 'complexite',
    question: 'Qu’affiche ce code ?',
    code: `let product = 1
for (let i = 1; i <= 25; i++) product *= i
console.log(product)
console.log(Number.isSafeInteger(product))
console.log(2 ** 53 + 1 === 2 ** 53)`,
    output: `1.5511210043330986e+25
false
true`,
    explanation: 'Les nombres JavaScript sont des flottants 64 bits : les entiers ne sont exacts que jusqu’à `Number.MAX_SAFE_INTEGER` = 2⁵³ − 1 ≈ 9 × 10¹⁵. Au-delà, des entiers consécutifs deviennent indiscernables (`2 ** 53 + 1` est arrondi à `2 ** 53`). En entretien, c’est le cas des factorielles, des produits, des hachages polynomiaux et des calculs modulo 10⁹ + 7 où l’on multiplie deux restes (jusqu’à 10¹⁸). Solution : `BigInt`, ou réduire modulo après chaque opération en gardant les opérandes assez petits.',
    fix: {
      code: `let product = 1n
for (let i = 1n; i <= 25n; i++) product *= i
console.log(product)
console.log(product.toString().length)`,
      output: `15511210043330985984000000n
26`,
      equiv: {
        python: `# Les entiers Python sont de taille arbitraire : aucun dépassement.
product = 1
for i in range(1, 26):
    product *= i
print(product)`,
        java: `import java.math.BigInteger;

BigInteger product = BigInteger.ONE;
for (int i = 1; i <= 25; i++) product = product.multiply(BigInteger.valueOf(i));
System.out.println(product); // un long déborderait dès 21!`,
        rust: `// u128 suffit jusqu'à 34! ; au-delà, une crate de grands entiers.
let mut product: u128 = 1;
for i in 1..=25u128 {
    product *= i; // en mode debug, un dépassement provoque un panic
}
println!("{}", product);`,
      },
    },
  },
  {
    id: 'fo-p2',
    title: 'Retirer des éléments pendant qu’on les parcourt',
    theme: 'complexite',
    question: 'On veut traiter tous les éléments de la file. Qu’affiche ce code ?',
    code: `const queue = [1, 2, 3, 4, 5, 6]
const processed = []
for (let i = 0; i < queue.length; i++) processed.push(queue.shift())
console.log(processed)
console.log(queue)`,
    output: `[ 1, 2, 3 ]
[ 4, 5, 6 ]`,
    explanation: 'La condition `i < queue.length` est réévaluée à chaque tour, alors que `i` augmente **et** que `queue.length` diminue : la boucle s’arrête à mi-chemin. Le code est en plus quadratique, car chaque `shift` décale tous les éléments restants. Règle : ne jamais modifier la longueur d’une collection pendant qu’on la parcourt par indice. Pour une file, on avance un indice de tête sans rien retirer.',
    fix: {
      code: `const queue = [1, 2, 3, 4, 5, 6]
const processed = []
let head = 0
while (head < queue.length) processed.push(queue[head++])
console.log(processed)`,
      output: `[ 1, 2, 3, 4, 5, 6 ]`,
    },
  },
  {
    id: 'fo-p3',
    title: 'Récursion trop profonde',
    theme: 'complexite',
    question: 'Qu’affiche ce code ?',
    code: `function depth(n) {
  return n === 0 ? 0 : 1 + depth(n - 1)
}
console.log(depth(5000))
try {
  console.log(depth(200000))
} catch (e) {
  console.log(e instanceof RangeError)
}`,
    output: `5000
true`,
    explanation: 'Chaque appel en attente occupe un cadre sur la pile, dont la taille est limitée (de l’ordre de 10⁴ appels selon le moteur et la taille des cadres). Une récursion linéaire sur une entrée de 10⁵ éléments (liste chaînée, DFS sur un graphe en ligne, somme récursive) lève `RangeError: Maximum call stack size exceeded`. Les appels terminaux ne sont pas optimisés par V8. Remède : une boucle, ou une pile explicite pour les parcours.',
    fix: {
      code: `function depth(n) {
  let d = 0
  while (n > 0) {
    n--
    d++
  }
  return d
}
console.log(depth(200000))`,
      output: `200000`,
    },
  },
)

flashcards.push(
  { id: 'fo-f1', theme: 'complexite', front: 'Combien d’opérations simples par seconde faut-il compter pour estimer un temps d’exécution ?', back: 'Environ **10⁸** par seconde. Pour n = 10⁵, O(n²) = 10¹⁰ est hors délai ; O(n log n) ≈ 1,7 × 10⁶ passe largement.' },
  { id: 'fo-f2', theme: 'complexite', front: 'Quelle complexité viser selon n ?', back: '- n ≤ 10 : O(n!)\n- n ≤ 20 : O(2ⁿ)\n- n ≤ 500 : O(n³)\n- n ≤ 5 000 : O(n²)\n- n ≤ 10⁶ : O(n log n) ou O(n)\n- au-delà : O(log n) ou O(1)' },
  { id: 'fo-f3', theme: 'complexite', front: 'Différence entre O, Ω et Θ ?', back: '**O** : borne supérieure (croît au plus comme…). **Ω** : borne inférieure (au moins comme…). **Θ** : les deux à la fois, croissance exacte. Indépendant de la question pire/moyen/meilleur cas.' },
  { id: 'fo-f4', theme: 'complexite', front: 'Théorème maître simplifié pour T(n) = a·T(n/b) + O(nᵈ) ?', back: 'a < bᵈ : O(nᵈ). a = bᵈ : O(nᵈ log n). a > bᵈ : O(n^(log_b a)). Tri fusion (2, 2, 1) : O(n log n) ; dichotomie (1, 2, 0) : O(log n) ; parcours d’arbre (2, 2, 0) : O(n).' },
  { id: 'fo-f5', theme: 'complexite', front: 'Pourquoi `push` est-il O(1) amorti ?', back: 'Quand le tableau est plein, sa capacité **double** et tout est recopié (O(n)). Les recopies successives coûtent 1 + 2 + 4 + … < 2n pour n `push` : O(1) par opération en moyenne sur toute la suite.' },
  { id: 'fo-f6', theme: 'complexite', front: 'Quelles méthodes de tableau sont en O(n) alors qu’elles semblent instantanées ?', back: '`shift`, `unshift`, `splice`, `includes`, `indexOf`, `find`, `slice`, le spread `[...arr]`, `concat`. Dans une boucle, elles rendent l’algorithme quadratique.', code: `const arr = [1, 2, 3]
arr.unshift(0) // décale 3 éléments
arr // → [ 0, 1, 2, 3 ]` },
  { id: 'fo-f7', theme: 'complexite', front: 'Quelle mémoire coûte une fonction récursive de profondeur d sans aucun tableau ?', back: 'O(d) : chaque appel en attente occupe un cadre de pile. Fibonacci naïf fait O(2ⁿ) appels mais n’utilise que O(n) de pile, car la profondeur maximale est n.' },
  { id: 'fo-f8', theme: 'complexite', front: 'Deux boucles imbriquées : toujours O(n²) ?', back: 'Non. Sur deux entrées différentes, c’est O(n · m). Et si la boucle intérieure fait avancer un pointeur qui ne recule jamais (two pointers, fenêtre glissante), le total est O(n) : on compte les avancées **cumulées** du pointeur.' },
)

lexique.push(
  { term: 'Notation Big O', theme: 'complexite', def: 'Borne supérieure asymptotique du coût d’un algorithme en fonction de la taille n de l’entrée, constantes et termes non dominants ignorés : `3n² + 5n` est en O(n²). Utilisée en entretien pour le pire cas, sauf mention « en moyenne » ou « amorti ».', see: ['Grand Thêta (Θ)', 'Grand Oméga (Ω)'] },
  { term: 'Grand Thêta (Θ)', theme: 'complexite', def: 'Croissance exacte : f est en Θ(g) si elle est à la fois en O(g) et en Ω(g). Parcourir tout un tableau est en Θ(n).', see: ['Notation Big O'] },
  { term: 'Grand Oméga (Ω)', theme: 'complexite', def: 'Borne inférieure asymptotique : l’algorithme fait **au moins** de l’ordre de g(n) opérations. Exemple : tout tri par comparaisons est en Ω(n log n) dans le pire cas.', see: ['Notation Big O'] },
  { term: 'Complexité amortie', theme: 'complexite', def: 'Coût moyen par opération sur **toute** suite d’opérations, dans le pire cas. Une opération rare et chère (redimensionner un tableau) est « payée » par les nombreuses opérations bon marché : `push` est O(1) amorti.' },
  { term: 'Théorème maître', theme: 'complexite', def: 'Règle qui donne la complexité d’une récurrence T(n) = a·T(n/b) + O(nᵈ) en comparant a et bᵈ : O(nᵈ), O(nᵈ log n) ou O(n^(log_b a)). Ne s’applique pas aux récurrences en T(n − 1).' },
  { term: 'Complexité spatiale', theme: 'complexite', def: 'Mémoire **auxiliaire** utilisée par l’algorithme en fonction de n, hors entrée (et souvent hors sortie) : structures créées et profondeur de la pile d’appels. Un algorithme « en place » est en O(1).', see: ['Complexité amortie'] },
)

entretien.push(
  {
    id: 'fo-e1',
    section: 'complexite',
    q: 'Comment utilisez-vous les contraintes de l’énoncé pour choisir votre approche ?',
    answer: 'Je lis la taille maximale de l’entrée avant tout et je la convertis en budget : environ 10⁸ opérations simples par seconde. n ≤ 20 autorise l’exhaustif en 2ⁿ ; n ≤ 5 000 autorise O(n²) ; n jusqu’à 10⁵ ou 10⁶ impose O(n log n) ou O(n) (tri, hachage, two pointers, fenêtre, tas) ; des valeurs jusqu’à 10⁹ sans tableau suggèrent une dichotomie sur la réponse ou une formule.\n\nJe le dis à voix haute : « n vaut au plus 10⁵, donc la force brute en O(n²) ne passera pas ; je la décris rapidement, puis je cherche un O(n log n). » Les bornes sur les **valeurs** comptent aussi : des valeurs dans [0, 10⁶] permettent un tableau de comptage au lieu d’une table de hachage ; un produit de deux valeurs proches de 10⁹ dépasse 2⁵³ en JavaScript.',
    attendu: 'Le réflexe de partir des contraintes, une table de correspondance n → complexité maîtrisée, et l’attention portée aux bornes des valeurs (dépassement, comptage).',
  },
  {
    id: 'fo-e2',
    section: 'complexite',
    q: '« Votre solution est en O(n) avec une boucle while dans une boucle for ? Ce n’est pas plutôt O(n²) ? »',
    answer: 'Je justifie par une **analyse amortie** : dans une fenêtre glissante ou un two pointers, le pointeur de la boucle intérieure ne recule jamais et ne dépasse jamais n. Sur toute l’exécution, il avance donc au plus n fois au total, quel que soit le nombre de tours du `for`. Le travail total vaut n (boucle extérieure) + n (avancées cumulées du pointeur intérieur) = O(n).\n\nMême raisonnement pour une pile monotone : chaque élément est empilé une fois et dépilé au plus une fois, donc 2n opérations au total. En revanche, si le pointeur intérieur repartait de `i` à chaque tour, ce serait bien O(n²).',
    attendu: 'Savoir distinguer imbrication syntaxique et coût réel, et formuler l’argument « chaque élément entre et sort au plus une fois ».',
    code: `function countSteps(n) {
  let inner = 0
  let right = 0
  for (let left = 0; left < n; left++) {
    while (right < n && right - left < 3) {
      right++
      inner++
    }
  }
  return inner
}
countSteps(1000) // → 1000`,
  },
  {
    id: 'fo-e3',
    section: 'complexite',
    q: 'Quel est le coût réel d’un `arr.shift()`, d’un `str += x` ou d’un `[...arr]` en JavaScript, et en quoi cela change votre code ?',
    answer: '`shift` et `unshift` réindexent tous les éléments : O(n). Le spread et `slice` copient : O(k). `includes` et `indexOf` parcourent : O(n). Dans une boucle, chacun rend l’algorithme quadratique ; je les remplace par un indice de tête pour les files, un `Set` pour les appartenances, et je mute l’accumulateur au lieu de le recopier.\n\nPour `str += x`, la théorie dit O(n) par concaténation (chaînes immuables), donc O(n²) au total, comme en Java ou en Python. V8 utilise des « ropes » qui rendent `+=` rapide en pratique ; je le signale, et j’utilise un tableau plus `join` quand la chaîne est grande ou quand je veux un coût garanti.',
    attendu: 'Connaître le coût des méthodes natives et proposer spontanément l’alternative idiomatique, tout en nuançant avec le comportement réel du moteur.',
  },
)

// ═════════════════════════════════════════════════════════════════════════════
// TABLEAUX, TWO POINTERS, PRÉFIXES
// ═════════════════════════════════════════════════════════════════════════════

cours.push({
  id: 'tableaux',
  title: 'Tableaux, two pointers, préfixes',
  summary: 'Les techniques qui transforment des doubles boucles en un seul parcours : deux pointeurs, lecteur/écrivain, sommes préfixes et tableaux de différences, Kadane, manipulations en place et parcours de matrices.',
  blocks: [
    { h: 'Two pointers opposés', id: 'tableaux-two-pointers' },
    {
      p: 'Deux indices partent des **deux extrémités** et se rapprochent. À chaque étape, on compare puis on fait avancer **un seul** des deux pointeurs, celui dont on sait qu’il ne peut plus participer à une meilleure solution. Comme les pointeurs ne reculent jamais, le parcours fait au plus n pas : O(n) en temps, O(1) en mémoire, là où la force brute teste les n²/2 paires.',
    },
    {
      list: [
        '**Signaux dans l’énoncé** : tableau **trié** (ou que l’on peut trier), recherche d’une paire ou d’un triplet de somme donnée, palindrome, « inverser en place », « deux lignes qui forment le plus grand récipient ».',
        '**Justification** : dans un tableau trié, si `a[left] + a[right]` est trop petit, aucune paire utilisant `a[left]` avec un indice ≤ `right` ne peut atteindre la cible : on peut avancer `left` sans rien perdre.',
        '**Variantes** : 3Sum (trier, fixer un élément, two pointers sur le reste : O(n²)) ; container with most water (avancer le côté le plus bas) ; trapping rain water (avancer le côté dont le maximum est le plus petit).',
      ],
    },
    {
      title: 'Paire de somme donnée dans un tableau trié',
      code: `function pairWithSum(sorted, target) {
  let left = 0
  let right = sorted.length - 1
  while (left < right) {
    const sum = sorted[left] + sorted[right]
    if (sum === target) return [left, right]
    if (sum < target) left++ // il faut une somme plus grande
    else right-- // il faut une somme plus petite
  }
  return null
}

pairWithSum([1, 3, 4, 6, 8, 11], 10) // → [ 2, 3 ]
pairWithSum([1, 2, 5], 100) // → null`,
      equiv: {
        python: `def pair_with_sum(sorted_nums, target):
    left, right = 0, len(sorted_nums) - 1
    while left < right:
        s = sorted_nums[left] + sorted_nums[right]
        if s == target:
            return [left, right]
        if s < target:
            left += 1
        else:
            right -= 1
    return None`,
        java: `static int[] pairWithSum(int[] sorted, int target) {
    int left = 0, right = sorted.length - 1;
    while (left < right) {
        int sum = sorted[left] + sorted[right];
        if (sum == target) return new int[] { left, right };
        if (sum < target) left++;
        else right--;
    }
    return null;
}`,
        rust: `fn pair_with_sum(sorted: &[i32], target: i32) -> Option<(usize, usize)> {
    if sorted.is_empty() {
        return None; // évite le dépassement de len() - 1 sur usize
    }
    let (mut left, mut right) = (0, sorted.len() - 1);
    while left < right {
        let sum = sorted[left] + sorted[right];
        if sum == target {
            return Some((left, right));
        }
        if sum < target {
            left += 1;
        } else {
            right -= 1;
        }
    }
    None
}`,
      },
    },
    {
      title: 'Palindrome : comparer les extrémités',
      code: `function isPalindrome(s) {
  let i = 0
  let j = s.length - 1
  while (i < j) {
    if (s[i] !== s[j]) return false
    i++
    j--
  }
  return true
}

isPalindrome('kayak') // → true
isPalindrome('kayaks') // → false
isPalindrome('') // → true`,
    },
    {
      mnemo: 'Trié + paire = deux pointeurs. On avance le pointeur qui ne peut plus servir : trop petit, on avance à gauche ; trop grand, on recule à droite.',
      piege: '`while (left <= right)` au lieu de `left < right` : un élément s’apparie avec lui-même. Et en Rust ou en Java avec des indices non signés, `len - 1` sur un tableau vide déborde.',
    },

    { h: 'Lecteur / écrivain : compacter en place', id: 'tableaux-lecteur-ecrivain' },
    {
      p: 'Deux pointeurs partent du **même côté** : `read` parcourt tout le tableau, `write` indique où écrire le prochain élément conservé. Tout ce qui est avant `write` est le résultat final. On obtient un filtrage **en place** en O(n) et O(1) de mémoire, sans `splice` (qui serait O(n) à chaque suppression).',
    },
    {
      list: [
        '**Signaux** : « en place », « sans tableau supplémentaire », « renvoyez la nouvelle longueur », supprimer des doublons d’un tableau trié, déplacer les zéros à la fin, retirer toutes les occurrences d’une valeur.',
        '**Invariant** : `write <= read` à tout instant, donc on n’écrase jamais un élément pas encore lu.',
        '**Variante « au plus k doublons »** : on garde `nums[read]` si `write < k` ou `nums[read] !== nums[write - k]`.',
      ],
    },
    {
      title: 'Supprimer les doublons d’un tableau trié, en place',
      code: `function removeDuplicates(nums) {
  let write = 0
  for (let read = 0; read < nums.length; read++) {
    if (read === 0 || nums[read] !== nums[read - 1]) {
      nums[write] = nums[read]
      write++
    }
  }
  return write // nouvelle longueur utile
}

const nums = [1, 1, 2, 3, 3, 3, 4]
const k = removeDuplicates(nums)
k // → 4
nums.slice(0, k) // → [ 1, 2, 3, 4 ]`,
      equiv: {
        python: `def remove_duplicates(nums):
    write = 0
    for read in range(len(nums)):
        if read == 0 or nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    return write`,
        java: `static int removeDuplicates(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (read == 0 || nums[read] != nums[read - 1]) {
            nums[write++] = nums[read];
        }
    }
    return write;
}`,
        rust: `fn remove_duplicates(nums: &mut Vec<i32>) -> usize {
    let mut write = 0;
    for read in 0..nums.len() {
        if read == 0 || nums[read] != nums[read - 1] {
            nums[write] = nums[read];
            write += 1;
        }
    }
    write // ou simplement nums.dedup() puis nums.len()
}`,
      },
    },
    {
      mnemo: '`read` lit tout, `write` n’écrit que ce qu’on garde. Ce qui est à gauche de `write` est déjà la réponse.',
      piege: 'Supprimer avec `splice` dans une boucle : chaque suppression décale la fin du tableau (O(n²) au total) et fait sauter l’élément suivant si l’on avance l’indice.',
    },

    { h: 'Sommes préfixes 1D et 2D', id: 'tableaux-prefixes' },
    {
      p: 'Le tableau des sommes préfixes stocke `prefix[i]` = somme des `i` premiers éléments, avec `prefix[0] = 0`. Après un précalcul O(n), la somme de n’importe quelle tranche `nums[l..r]` (bornes incluses) vaut `prefix[r + 1] - prefix[l]`, en O(1). Prendre une case de plus que le tableau évite tous les cas particuliers en `l = 0`.',
    },
    {
      list: [
        '**Signaux** : « somme d’un sous-tableau » demandée de nombreuses fois, requêtes de plage sur un tableau **qui ne change pas**, moyenne sur des intervalles, « nombre de sous-tableaux dont la somme vaut k » (préfixes + `Map`, voir le thème hachage).',
        '**Généralisation** : tout opérateur inversible fonctionne (somme, XOR, comptage) ; pas le minimum ni le maximum, qui demandent une table creuse ou un arbre de segments.',
        '**Si le tableau est modifié** entre les requêtes, il faut un arbre de Fenwick ou un arbre de segments (O(log n) par opération).',
      ],
    },
    {
      title: 'Préfixes 1D : somme d’une tranche en O(1)',
      code: `function buildPrefix(nums) {
  const prefix = new Array(nums.length + 1).fill(0)
  for (let i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i]
  return prefix
}

function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l] // nums[l..r], bornes incluses
}

const prefix = buildPrefix([3, -1, 4, 1, 5])
prefix // → [ 0, 3, 2, 6, 7, 12 ]
rangeSum(prefix, 1, 3) // → 4
rangeSum(prefix, 0, 4) // → 12`,
      equiv: {
        python: `from itertools import accumulate

def build_prefix(nums):
    # initial=0 ajoute la case prefix[0] = 0
    return list(accumulate(nums, initial=0))

def range_sum(prefix, l, r):
    return prefix[r + 1] - prefix[l]`,
        java: `static long[] buildPrefix(int[] nums) {
    long[] prefix = new long[nums.length + 1]; // long : évite le dépassement des sommes
    for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    return prefix;
}

static long rangeSum(long[] prefix, int l, int r) {
    return prefix[r + 1] - prefix[l];
}`,
        rust: `fn build_prefix(nums: &[i64]) -> Vec<i64> {
    let mut prefix = vec![0; nums.len() + 1];
    for i in 0..nums.len() {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    prefix
}`,
        php: `function buildPrefix(array $nums): array {
    $prefix = [0];
    foreach ($nums as $i => $x) $prefix[$i + 1] = $prefix[$i] + $x;
    return $prefix;
}`,
      },
    },
    {
      p: 'En deux dimensions, `P[r + 1][c + 1]` contient la somme du rectangle allant de `(0, 0)` à `(r, c)`. On le construit et on l’interroge par **inclusion-exclusion** : on ajoute les deux bandes, on retire le coin compté deux fois.',
    },
    {
      title: 'Préfixes 2D : somme d’un rectangle en O(1)',
      code: `function buildPrefix2D(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  const P = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    }
  }
  return P
}

function regionSum(P, r1, c1, r2, c2) {
  return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
}

const P = buildPrefix2D([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
])
regionSum(P, 1, 1, 2, 2) // → 28
regionSum(P, 0, 0, 2, 2) // → 45
regionSum(P, 0, 2, 2, 2) // → 18`,
      equiv: {
        python: `def build_prefix_2d(matrix):
    rows, cols = len(matrix), len(matrix[0])
    P = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    return P

def region_sum(P, r1, c1, r2, c2):
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]`,
        java: `static long[][] buildPrefix2D(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    long[][] P = new long[rows + 1][cols + 1];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    return P;
}

static long regionSum(long[][] P, int r1, int c1, int r2, int c2) {
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
}`,
      },
    },
    {
      mnemo: 'Une case de plus, `prefix[0] = 0`, et « fin + 1 moins début ». En 2D : grand rectangle − bande du haut − bande de gauche + coin.',
      piege: 'L’erreur de décalage : écrire `prefix[r] - prefix[l]` (on perd `nums[r]`) ou `prefix[r] - prefix[l - 1]` (indice −1 quand `l = 0`). Et en 2D, `Array(rows).fill(new Array(cols))` partage la même ligne entre toutes les rangées.',
    },

    { h: 'Tableau de différences : mises à jour de plages', id: 'tableaux-differences' },
    {
      p: 'C’est l’opération inverse des préfixes. Pour ajouter `v` à toute la plage `[l, r]`, on fait seulement `diff[l] += v` et `diff[r + 1] -= v` (O(1)). Une fois toutes les mises à jour enregistrées, une somme préfixe de `diff` reconstruit le tableau final en O(n). Idéal quand on a beaucoup de mises à jour de plages et une seule lecture à la fin.',
    },
    {
      list: [
        '**Signaux** : « ajouter v à tous les éléments entre l et r », réservations de vols, covoiturage (« la voiture dépasse-t-elle sa capacité ? »), nombre maximal d’intervalles qui se chevauchent, événements avec début et fin (balayage).',
        'Complexité : O(n + q) pour q mises à jour, contre O(n · q) en appliquant chaque plage case par case.',
      ],
    },
    {
      title: 'Appliquer des ajouts sur des plages',
      code: `function applyRangeAdds(n, updates) {
  const diff = new Array(n + 1).fill(0) // une case de plus pour r + 1
  for (const [l, r, v] of updates) {
    diff[l] += v
    diff[r + 1] -= v
  }
  const result = new Array(n)
  let running = 0
  for (let i = 0; i < n; i++) {
    running += diff[i]
    result[i] = running
  }
  return result
}

const updates = [
  [1, 3, 2],
  [2, 4, 3],
  [0, 2, -1],
]
applyRangeAdds(5, updates) // → [ -1, 1, 4, 5, 3 ]`,
      equiv: {
        python: `def apply_range_adds(n, updates):
    diff = [0] * (n + 1)
    for l, r, v in updates:
        diff[l] += v
        diff[r + 1] -= v
    result, running = [], 0
    for i in range(n):
        running += diff[i]
        result.append(running)
    return result`,
        java: `static int[] applyRangeAdds(int n, int[][] updates) {
    int[] diff = new int[n + 1];
    for (int[] u : updates) {
        diff[u[0]] += u[2];
        diff[u[1] + 1] -= u[2];
    }
    int[] result = new int[n];
    int running = 0;
    for (int i = 0; i < n; i++) {
        running += diff[i];
        result[i] = running;
    }
    return result;
}`,
      },
    },
    {
      mnemo: 'Préfixe = intégrer, différence = dériver. « +v au début, −v juste après la fin », puis un préfixe pour tout reconstruire.',
      piege: 'Oublier la case `n + 1` (écriture hors tableau quand `r = n − 1`) ou appliquer `-v` en `r` au lieu de `r + 1`, ce qui exclut la dernière case de la plage.',
    },

    { h: 'Algorithme de Kadane : sous-tableau de somme maximale', id: 'tableaux-kadane' },
    {
      p: 'Kadane est une programmation dynamique réduite à deux variables. `current` est la meilleure somme d’un sous-tableau **qui se termine à l’indice i** : soit on prolonge le sous-tableau précédent (`current + nums[i]`), soit on repart de zéro à `nums[i]`, si ce qui précède est négatif et ne peut que nuire. `best` retient le maximum rencontré. Un seul parcours : O(n) en temps, O(1) en mémoire.',
    },
    {
      title: 'Kadane avec les bornes du sous-tableau',
      code: `function maxSubArray(nums) {
  let best = nums[0]
  let current = nums[0]
  let start = 0
  let bestRange = [0, 0]
  for (let i = 1; i < nums.length; i++) {
    if (current < 0) {
      current = nums[i] // repartir de zéro : le passé est un poids mort
      start = i
    } else {
      current += nums[i]
    }
    if (current > best) {
      best = current
      bestRange = [start, i]
    }
  }
  return { best, range: bestRange }
}

maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) // → { best: 6, range: [ 3, 6 ] }
maxSubArray([-3, -1, -2]) // → { best: -1, range: [ 1, 1 ] }`,
      equiv: {
        python: `def max_sub_array(nums):
    best = current = nums[0]
    start, best_range = 0, (0, 0)
    for i in range(1, len(nums)):
        if current < 0:
            current, start = nums[i], i
        else:
            current += nums[i]
        if current > best:
            best, best_range = current, (start, i)
    return best, best_range`,
        java: `// renvoie { best, début, fin }
static int[] maxSubArray(int[] nums) {
    int best = nums[0], current = nums[0], start = 0;
    int[] bestRange = { 0, 0 };
    for (int i = 1; i < nums.length; i++) {
        if (current < 0) {
            current = nums[i];
            start = i;
        } else {
            current += nums[i];
        }
        if (current > best) {
            best = current;
            bestRange = new int[] { start, i };
        }
    }
    return new int[] { best, bestRange[0], bestRange[1] };
}`,
      },
    },
    {
      list: [
        '**Variantes** : produit maximal (garder aussi le **minimum** courant, car un négatif fois un négatif devient grand) ; tableau circulaire (max entre Kadane et `total − sous-tableau minimal`) ; meilleur moment pour acheter et vendre une action (Kadane sur les différences de prix consécutives).',
        'Lien avec les préfixes : la somme maximale vaut `max(prefix[j] − min(prefix[i]))` pour i < j, le même calcul vu autrement.',
      ],
    },
    {
      mnemo: '« Si le passé est négatif, on l’oublie. » `current = max(x, current + x)`, `best = max(best, current)`.',
      piege: 'Initialiser `best` à 0 : sur un tableau entièrement négatif, on renvoie 0, la somme d’un sous-tableau vide, alors que l’énoncé l’interdit presque toujours. Initialisez avec `nums[0]` (ou `-Infinity`).',
    },

    { h: 'En place : inversion, rotation, drapeau hollandais', id: 'tableaux-en-place' },
    {
      p: 'Plusieurs transformations s’écrivent en O(1) de mémoire avec des échanges. La **rotation** de k crans vers la droite se fait en trois inversions : tout le tableau, puis les k premiers, puis le reste. Le **drapeau hollandais** (Dijkstra) partitionne en trois zones (`< pivot`, `= pivot`, `> pivot`) en un seul passage avec trois pointeurs ; c’est aussi le cœur du tri rapide à partition en trois.',
    },
    {
      title: 'Rotation par trois inversions',
      code: `function reverse(arr, i, j) {
  while (i < j) {
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
    i++
    j--
  }
}

function rotateRight(arr, k) {
  const n = arr.length
  if (n === 0) return arr
  k %= n // k peut dépasser n
  reverse(arr, 0, n - 1)
  reverse(arr, 0, k - 1)
  reverse(arr, k, n - 1)
  return arr
}

rotateRight([1, 2, 3, 4, 5, 6, 7], 3) // → [ 5, 6, 7, 1, 2, 3, 4 ]
rotateRight([1, 2], 5) // → [ 2, 1 ]`,
      equiv: {
        python: `def rotate_right(arr, k):
    n = len(arr)
    if n == 0:
        return arr
    k %= n
    arr.reverse()
    arr[:k] = reversed(arr[:k])
    arr[k:] = reversed(arr[k:])
    return arr`,
        java: `static void reverse(int[] arr, int i, int j) {
    while (i < j) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        i++; j--;
    }
}

static int[] rotateRight(int[] arr, int k) {
    int n = arr.length;
    if (n == 0) return arr;
    k %= n;
    reverse(arr, 0, n - 1);
    reverse(arr, 0, k - 1);
    reverse(arr, k, n - 1);
    return arr;
}`,
        rust: `fn rotate_right(arr: &mut Vec<i32>, k: usize) {
    let n = arr.len();
    if n == 0 {
        return;
    }
    let k = k % n;
    arr.reverse();
    arr[..k].reverse();
    arr[k..].reverse();
    // ou directement : arr.rotate_right(k)
}`,
      },
    },
    {
      title: 'Drapeau hollandais : trier des 0, 1 et 2 en un passage',
      code: `function sortColors(nums) {
  let low = 0 // nums[0..low) ne contient que des 0
  let mid = 0 // nums[low..mid) ne contient que des 1
  let high = nums.length - 1 // nums(high..] ne contient que des 2
  while (mid <= high) {
    if (nums[mid] === 0) {
      const tmp = nums[low]
      nums[low] = nums[mid]
      nums[mid] = tmp
      low++
      mid++
    } else if (nums[mid] === 1) {
      mid++
    } else {
      const tmp = nums[high]
      nums[high] = nums[mid]
      nums[mid] = tmp
      high-- // on n'avance pas mid : l'élément reçu n'a pas été examiné
    }
  }
  return nums
}

sortColors([2, 0, 2, 1, 1, 0]) // → [ 0, 0, 1, 1, 2, 2 ]
sortColors([2, 2, 0]) // → [ 0, 2, 2 ]`,
    },
    {
      mnemo: 'Rotation à droite de k : « tout, les k premiers, le reste ». Drapeau : 0 → échange en bas et avance les deux ; 1 → avance ; 2 → échange en haut sans avancer.',
      piege: 'Oublier `k %= n` (inversions hors bornes quand k > n), ou avancer `mid` après un échange avec `high` : l’élément ramené depuis la fin n’a jamais été examiné.',
    },

    { h: 'Matrices : parcours, rotation, spirale', id: 'tableaux-matrices' },
    {
      p: 'Une grille `rows × cols` se parcourt par deux boucles imbriquées, en O(rows · cols), qui est ici linéaire en la taille de l’entrée. Les voisins d’une case s’obtiennent avec un tableau de directions, ce qui évite quatre blocs `if` recopiés. La rotation de 90° dans le sens horaire d’une matrice carrée se fait en place : **transposer** (échanger `m[i][j]` et `m[j][i]` pour j > i), puis **inverser chaque ligne**.',
    },
    {
      title: 'Voisins d’une case et rotation de 90°',
      code: `const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

function neighbors(grid, r, c) {
  const out = []
  for (const [dr, dc] of DIRS) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) out.push(grid[nr][nc])
  }
  return out
}

function rotate90(matrix) {
  const n = matrix.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const tmp = matrix[i][j]
      matrix[i][j] = matrix[j][i]
      matrix[j][i] = tmp
    }
  }
  for (const row of matrix) row.reverse()
  return matrix
}

const grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]
neighbors(grid, 0, 0) // → [ 4, 2 ]
neighbors(grid, 1, 1) // → [ 2, 8, 4, 6 ]
rotate90(grid) // → [ [ 7, 4, 1 ], [ 8, 5, 2 ], [ 9, 6, 3 ] ]`,
      equiv: {
        python: `DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def neighbors(grid, r, c):
    out = []
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):
            out.append(grid[nr][nc])
    return out

def rotate90(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
    return matrix`,
        java: `static final int[][] DIRS = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

static int[][] rotate90(int[][] matrix) {
    int n = matrix.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int tmp = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = tmp;
        }
    for (int[] row : matrix)
        for (int a = 0, b = n - 1; a < b; a++, b--) {
            int tmp = row[a]; row[a] = row[b]; row[b] = tmp;
        }
    return matrix;
}`,
      },
    },
    {
      p: 'Le parcours en **spirale** maintient quatre bornes (`top`, `bottom`, `left`, `right`) que l’on resserre après chaque côté. Les deux derniers côtés doivent être protégés par un test, sinon une matrice d’une seule ligne ou d’une seule colonne est parcourue deux fois.',
    },
    {
      title: 'Parcours en spirale',
      code: `function spiralOrder(matrix) {
  const result = []
  if (matrix.length === 0) return result
  let top = 0
  let bottom = matrix.length - 1
  let left = 0
  let right = matrix[0].length - 1
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c])
    top++
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right])
    right--
    if (top <= bottom) {
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c])
      bottom--
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left])
      left++
    }
  }
  return result
}

const m = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]
spiralOrder(m) // → [ 1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7 ]
spiralOrder([[1, 2, 3]]) // → [ 1, 2, 3 ]`,
    },
    {
      mnemo: 'Rotation horaire = transposer puis inverser les lignes (antihoraire : inverser les lignes puis transposer). Spirale : quatre bornes, quatre côtés, deux gardes.',
      piege: 'Confondre `grid[r][c]` et `grid[x][y]` (ligne d’abord !), créer la grille avec `Array(n).fill([])` (lignes partagées), et oublier les gardes de la spirale pour une matrice non carrée.',
    },
  ],
  mnemo: 'Trié → deux pointeurs ; en place → lecteur/écrivain ; sommes de plages → préfixes (et différences pour les mises à jour) ; meilleure tranche → Kadane ; rotation → trois inversions ; matrice → directions et bornes.',
  piege: 'Les décalages d’indice : préfixes avec une case de plus, `r + 1` dans les différences, `left < right` et non `<=`, bornes de la spirale. Testez toujours le tableau vide, un seul élément et tous négatifs.',
})

katas.push(
  {
    id: 'fo-deplacer-zeros',
    title: 'Déplacer les zéros à la fin',
    difficulty: 'facile',
    theme: 'tableaux',
    pattern: 'lecteur / écrivain',
    statement: `Écrivez \`moveZeroes(nums)\` qui déplace tous les \`0\` du tableau à la fin, **en place**, en conservant l'ordre relatif des autres éléments. La fonction ne renvoie rien : elle modifie \`nums\`.

Exemples :

- \`[0, 1, 0, 3, 12]\` devient \`[1, 3, 12, 0, 0]\` ;
- \`[0]\` reste \`[0]\` ;
- \`[4, 2]\` reste \`[4, 2]\`.

Contraintes : O(n) en temps, O(1) de mémoire supplémentaire (pas de second tableau, pas de \`filter\`), et pas de \`splice\` dans une boucle.`,
    starter: `function moveZeroes(nums) {
  // TODO : en place, en O(n)
}`,
    solution: `function moveZeroes(nums) {
  let write = 0 // prochaine case où placer un élément non nul
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      nums[write] = nums[read]
      write++
    }
  }
  // tout ce qui suit write doit valoir 0
  for (let i = write; i < nums.length; i++) nums[i] = 0
}`,
    solutionEquiv: {
      python: `def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):
        nums[i] = 0`,
      java: `static void moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) nums[write++] = nums[read];
    }
    java.util.Arrays.fill(nums, write, nums.length, 0);
}`,
      rust: `fn move_zeroes(nums: &mut Vec<i32>) {
    let mut write = 0;
    for read in 0..nums.len() {
        if nums[read] != 0 {
            nums[write] = nums[read];
            write += 1;
        }
    }
    for x in nums[write..].iter_mut() {
        *x = 0;
    }
}`,
      php: `function moveZeroes(array &$nums): void {
    $write = 0;
    $n = count($nums);
    for ($read = 0; $read < $n; $read++) {
        if ($nums[$read] !== 0) $nums[$write++] = $nums[$read];
    }
    for ($i = $write; $i < $n; $i++) $nums[$i] = 0;
}`,
    },
    tests: [
      { name: 'exemple', code: `const a = [0, 1, 0, 3, 12]
moveZeroes(a)
assertEqual(a, [1, 3, 12, 0, 0])` },
      { name: 'un seul élément et tableau vide', code: `const a = [0]
moveZeroes(a)
assertEqual(a, [0])
const b = []
moveZeroes(b)
assertEqual(b, [])` },
      { name: 'aucun zéro', code: `const a = [4, 2, -1]
moveZeroes(a)
assertEqual(a, [4, 2, -1])` },
      { name: 'que des zéros', code: `const a = [0, 0, 0]
moveZeroes(a)
assertEqual(a, [0, 0, 0])` },
      { name: 'négatifs et zéros consécutifs', code: `const a = [0, 0, -3, 0, 5, -3, 0]
moveZeroes(a)
assertEqual(a, [-3, 5, -3, 0, 0, 0, 0])` },
      { name: 'modification en place (même tableau)', code: `const a = [0, 7]
const ref = a
const r = moveZeroes(a)
assert(ref === a && a[0] === 7, 'le tableau doit être modifié en place')
assertEqual(r, undefined)` },
    ],
    hints: [
      'Pensez à deux indices : l’un lit chaque case, l’autre indique où écrire le prochain élément non nul.',
      'Après le parcours, les `write` premières cases contiennent les non-nuls dans l’ordre ; il ne reste qu’à remplir la fin avec des zéros.',
      'Variante en un seul passage : échanger `nums[read]` et `nums[write]` dès que `nums[read]` est non nul.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Points à évoquer** :

- la variante par **échange** (\`swap(nums, read, write)\`) fait un seul passage et minimise les écritures quand il y a peu de zéros ;
- \`splice\` + \`push\` dans une boucle est O(n²) et oblige à gérer l'indice qui saute après chaque suppression ;
- c'est un cas particulier de **partition stable** : le même gabarit sert à « retirer toutes les occurrences de val », « supprimer les doublons d'un tableau trié » ou « garder au plus deux exemplaires de chaque valeur » ;
- si l'ordre des non-nuls n'avait pas d'importance, deux pointeurs opposés suffiraient (comme dans une partition de tri rapide).`,
  },
  {
    id: 'fo-two-sum-trie',
    title: 'Two Sum sur un tableau trié',
    difficulty: 'facile',
    theme: 'tableaux',
    pattern: 'two pointers opposés',
    statement: `\`numbers\` est trié par ordre **croissant**. Écrivez \`twoSumSorted(numbers, target)\` qui renvoie les indices \`[i, j]\` (avec \`i < j\`) de deux éléments dont la somme vaut \`target\`, ou \`null\` s'il n'en existe pas. Les tests garantissent **au plus une** paire solution.

Exemples :

- \`twoSumSorted([2, 7, 11, 15], 9)\` donne \`[0, 1]\` ;
- \`twoSumSorted([-3, -1, 0, 2, 5], 1)\` donne \`[1, 3]\` ;
- \`twoSumSorted([1, 2, 3], 7)\` donne \`null\`.

Contraintes : O(n) en temps et **O(1) en mémoire** (pas de \`Map\` ni de \`Set\`) ; un même élément ne peut pas être utilisé deux fois.`,
    starter: `function twoSumSorted(numbers, target) {
  // TODO : deux pointeurs, O(1) en mémoire
  return null
}`,
    solution: `function twoSumSorted(numbers, target) {
  let left = 0
  let right = numbers.length - 1
  while (left < right) {
    const sum = numbers[left] + numbers[right]
    if (sum === target) return [left, right]
    if (sum < target) left++
    else right--
  }
  return null
}`,
    solutionEquiv: {
      python: `def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        s = numbers[left] + numbers[right]
        if s == target:
            return [left, right]
        if s < target:
            left += 1
        else:
            right -= 1
    return None`,
      java: `static int[] twoSumSorted(int[] numbers, int target) {
    int left = 0, right = numbers.length - 1;
    while (left < right) {
        long sum = (long) numbers[left] + numbers[right]; // évite le dépassement int
        if (sum == target) return new int[] { left, right };
        if (sum < target) left++;
        else right--;
    }
    return null;
}`,
    },
    tests: [
      { name: 'exemple', code: `assertEqual(twoSumSorted([2, 7, 11, 15], 9), [0, 1])` },
      { name: 'négatifs', code: `assertEqual(twoSumSorted([-3, -1, 0, 2, 5], 1), [1, 3])` },
      { name: 'aucune paire', code: `assertEqual(twoSumSorted([1, 2, 3], 7), null)` },
      { name: 'vide et un seul élément', code: `assertEqual(twoSumSorted([], 0), null)
assertEqual(twoSumSorted([5], 10), null)` },
      { name: 'doublons : deux éléments distincts de même valeur', code: `assertEqual(twoSumSorted([1, 3, 3, 8], 6), [1, 2])
assertEqual(twoSumSorted([1, 3, 8], 6), null)` },
      { name: 'paire aux extrémités', code: `assertEqual(twoSumSorted([1, 4, 5, 6, 10], 11), [0, 4])` },
      {
        name: 'grande entrée (n = 200 000)',
        code: `const n = 200000
const nums = []
for (let i = 0; i < n; i++) nums.push(2 * i) // pairs croissants
const t0 = performance.now()
const r = twoSumSorted(nums, 2 * (n - 1) + 1) // impair : aucune paire
const r2 = twoSumSorted(nums, 2 + 4)
const elapsed = performance.now() - t0
assertEqual(r, null)
assertEqual(nums[r2[0]] + nums[r2[1]], 6)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n))')`,
      },
    ],
    hints: [
      'Le tableau est trié : que vous apprend une somme trop petite sur l’élément de gauche ?',
      'Placez un pointeur à chaque extrémité. Somme trop petite : avancez la gauche ; trop grande : reculez la droite.',
      'Arrêtez-vous quand `left` rejoint `right` : un élément ne peut pas s’apparier avec lui-même.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Pourquoi c'est correct** : si \`numbers[left] + numbers[right] < target\`, alors \`numbers[left]\` combiné à n'importe quel indice ≤ \`right\` donne une somme encore plus petite (ou égale) : il ne peut appartenir à aucune solution restante, on l'élimine. Raisonnement symétrique pour \`right\`. Chaque étape élimine un élément, d'où au plus n − 1 étapes.

**Points à évoquer** :

- la version \`Map\` (Two Sum classique) est aussi O(n) mais coûte O(n) en mémoire et n'exploite pas le tri ;
- une recherche dichotomique du complément pour chaque élément donne O(n log n) ;
- en Java, la somme de deux \`int\` peut déborder : passer en \`long\` ;
- suites naturelles : **3Sum** (trier, fixer \`i\`, two pointers sur la droite, sauter les doublons : O(n²)), **3Sum closest**, **4Sum**, et compter les paires de somme ≤ target (ajouter \`right - left\` d'un coup quand la somme convient).`,
  },
  {
    id: 'fo-kadane-circulaire',
    title: 'Sous-tableau maximal dans un tableau circulaire',
    difficulty: 'moyen',
    theme: 'tableaux',
    pattern: 'Kadane (max et min)',
    statement: `Le tableau \`nums\` est **circulaire** : après le dernier élément vient le premier. Écrivez \`maxCircularSubarray(nums)\` qui renvoie la plus grande somme d'un sous-tableau **non vide** et contigu, en autorisant le passage de la fin au début. Chaque élément est utilisé au plus une fois.

Exemples :

- \`[1, -2, 3, -2]\` donne \`3\` (le sous-tableau \`[3]\`) ;
- \`[5, -3, 5]\` donne \`10\` (\`[5, 5]\` en faisant le tour) ;
- \`[-3, -2, -3]\` donne \`-2\`.

Contraintes : \`1 ≤ nums.length ≤ 2 × 10⁵\`, \`-1000 ≤ nums[i] ≤ 1000\`. Visez O(n).`,
    starter: `function maxCircularSubarray(nums) {
  // TODO : Kadane classique... et le cas qui fait le tour ?
  return 0
}`,
    solution: `function maxCircularSubarray(nums) {
  let total = nums[0]
  let curMax = nums[0] // meilleure somme d'un sous-tableau finissant ici
  let bestMax = nums[0]
  let curMin = nums[0] // plus petite somme d'un sous-tableau finissant ici
  let bestMin = nums[0]
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i]
    total += x
    curMax = curMax > 0 ? curMax + x : x // Kadane pour le maximum
    if (curMax > bestMax) bestMax = curMax
    curMin = curMin < 0 ? curMin + x : x // Kadane pour le minimum
    if (curMin < bestMin) bestMin = curMin
  }
  // tout négatif : total - bestMin vaudrait 0 (sous-tableau vide), interdit
  if (bestMax < 0) return bestMax
  // un sous-tableau qui fait le tour = total moins un sous-tableau central minimal
  return Math.max(bestMax, total - bestMin)
}`,
    solutionEquiv: {
      python: `def max_circular_subarray(nums):
    total = cur_max = best_max = cur_min = best_min = nums[0]
    for x in nums[1:]:
        total += x
        cur_max = max(x, cur_max + x)
        best_max = max(best_max, cur_max)
        cur_min = min(x, cur_min + x)
        best_min = min(best_min, cur_min)
    if best_max < 0:
        return best_max
    return max(best_max, total - best_min)`,
      java: `static int maxCircularSubarray(int[] nums) {
    int total = nums[0], curMax = nums[0], bestMax = nums[0];
    int curMin = nums[0], bestMin = nums[0];
    for (int i = 1; i < nums.length; i++) {
        int x = nums[i];
        total += x;
        curMax = Math.max(x, curMax + x);
        bestMax = Math.max(bestMax, curMax);
        curMin = Math.min(x, curMin + x);
        bestMin = Math.min(bestMin, curMin);
    }
    if (bestMax < 0) return bestMax;
    return Math.max(bestMax, total - bestMin);
}`,
      rust: `fn max_circular_subarray(nums: &[i64]) -> i64 {
    let (mut total, mut cur_max, mut best_max) = (nums[0], nums[0], nums[0]);
    let (mut cur_min, mut best_min) = (nums[0], nums[0]);
    for &x in &nums[1..] {
        total += x;
        cur_max = x.max(cur_max + x);
        best_max = best_max.max(cur_max);
        cur_min = x.min(cur_min + x);
        best_min = best_min.min(cur_min);
    }
    if best_max < 0 {
        return best_max;
    }
    best_max.max(total - best_min)
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(maxCircularSubarray([1, -2, 3, -2]), 3)
assertEqual(maxCircularSubarray([5, -3, 5]), 10)` },
      { name: 'tout négatif', code: `assertEqual(maxCircularSubarray([-3, -2, -3]), -2)` },
      { name: 'un seul élément', code: `assertEqual(maxCircularSubarray([7]), 7)
assertEqual(maxCircularSubarray([-7]), -7)` },
      { name: 'sans passer par le tour', code: `assertEqual(maxCircularSubarray([3, -1, 2, -1]), 4)
assertEqual(maxCircularSubarray([3, -2, 2, -3]), 3)` },
      { name: 'en faisant le tour', code: `assertEqual(maxCircularSubarray([-2, 4, -5, 4, -5, 9, 4]), 15)` },
      { name: 'zéros', code: `assertEqual(maxCircularSubarray([0, 0, 0]), 0)
assertEqual(maxCircularSubarray([-1, 0, -1]), 0)` },
      {
        name: 'grande entrée (n = 200 000)',
        code: `let seed = 42
const big = []
for (let i = 0; i < 200000; i++) {
  seed = (seed * 1103515245 + 12345) % 2147483648
  big.push((seed % 2001) - 1000)
}
const big2 = []
for (let i = 0; i < 200000; i++) big2.push(i < 100000 ? (i % 3 === 0 ? -5 : 3) : -1)
const t0 = performance.now()
const r1 = maxCircularSubarray(big)
const r2 = maxCircularSubarray(big2)
const elapsed = performance.now() - t0
assertEqual(r1, 67521)
assertEqual(r2, 33338)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n))')`,
      },
    ],
    hints: [
      'Deux cas : le meilleur sous-tableau ne fait pas le tour (Kadane classique), ou il le fait.',
      'S’il fait le tour, ce qu’il **exclut** est un sous-tableau contigu au milieu. Maximiser ce qu’on garde revient à minimiser ce qu’on exclut : `total − (sous-tableau de somme minimale)`.',
      'Cas limite : si tous les nombres sont négatifs, le sous-tableau minimal est le tableau entier et `total − min` vaut 0, la somme d’un sous-tableau vide. Renvoyez alors le maximum de Kadane.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire, en un seul parcours.

**Points à évoquer** :

- la solution naïve (Kadane depuis chaque point de départ, ou doubler le tableau et tester toutes les fenêtres de taille ≤ n) est en O(n²) ;
- une autre approche en O(n) : doubler le tableau, calculer les préfixes, et chercher pour chaque \`j\` le plus petit préfixe dans la fenêtre \`[j − n, j)\` avec une **deque monotone** ;
- le piège du « tout négatif » est le point que le recruteur attend : le mentionner avant d'écrire le code est un bon signal ;
- variantes de Kadane à connaître : produit maximal (suivre max **et** min), meilleur achat/vente d'action, sous-matrice de somme maximale (Kadane sur les colonnes compressées, O(rows² · cols)).`,
  },
  {
    id: 'fo-somme-plage-2d',
    title: 'Sommes de rectangles dans une matrice',
    difficulty: 'moyen',
    theme: 'tableaux',
    pattern: 'somme préfixe 2D',
    statement: `Implémentez une classe \`NumMatrix\` :

- \`new NumMatrix(matrix)\` reçoit une matrice d'entiers \`rows × cols\` (au moins une ligne et une colonne), qui ne sera **jamais modifiée** ;
- \`sumRegion(r1, c1, r2, c2)\` renvoie la somme des cases du rectangle de coin supérieur gauche \`(r1, c1)\` et de coin inférieur droit \`(r2, c2)\`, bornes **incluses** (\`r1 ≤ r2\`, \`c1 ≤ c2\`).

Exemple, avec la matrice :

- \`[3, 0, 1, 4, 2]\`
- \`[5, 6, 3, 2, 1]\`
- \`[1, 2, 0, 1, 5]\`
- \`[4, 1, 0, 1, 7]\`
- \`[1, 0, 3, 0, 5]\`

\`sumRegion(2, 1, 4, 3)\` donne \`8\`, \`sumRegion(1, 1, 2, 2)\` donne \`11\` et \`sumRegion(1, 2, 2, 4)\` donne \`12\`.

Contraintes : jusqu'à 300 × 300 cases et 10⁵ appels à \`sumRegion\`. Chaque appel doit être en **O(1)**.`,
    starter: `class NumMatrix {
  constructor(matrix) {
    this.matrix = matrix
  }
  sumRegion(r1, c1, r2, c2) {
    // TODO : O(1) par requête grâce à un précalcul
    return 0
  }
}`,
    solution: `class NumMatrix {
  constructor(matrix) {
    const rows = matrix.length
    const cols = matrix[0].length
    // P[r + 1][c + 1] = somme du rectangle (0, 0) → (r, c)
    this.P = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.P[r + 1][c + 1] = matrix[r][c] + this.P[r][c + 1] + this.P[r + 1][c] - this.P[r][c]
      }
    }
  }
  sumRegion(r1, c1, r2, c2) {
    const P = this.P
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
  }
}`,
    solutionEquiv: {
      python: `class NumMatrix:
    def __init__(self, matrix):
        rows, cols = len(matrix), len(matrix[0])
        self.P = [[0] * (cols + 1) for _ in range(rows + 1)]
        for r in range(rows):
            for c in range(cols):
                self.P[r + 1][c + 1] = (matrix[r][c] + self.P[r][c + 1]
                                        + self.P[r + 1][c] - self.P[r][c])

    def sumRegion(self, r1, c1, r2, c2):
        P = self.P
        return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]`,
      java: `class NumMatrix {
    private final long[][] P;

    NumMatrix(int[][] matrix) {
        int rows = matrix.length, cols = matrix[0].length;
        P = new long[rows + 1][cols + 1];
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    }

    long sumRegion(int r1, int c1, int r2, int c2) {
        return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
    }
}`,
      rust: `struct NumMatrix {
    p: Vec<Vec<i64>>,
}

impl NumMatrix {
    fn new(matrix: Vec<Vec<i64>>) -> Self {
        let (rows, cols) = (matrix.len(), matrix[0].len());
        let mut p = vec![vec![0; cols + 1]; rows + 1];
        for r in 0..rows {
            for c in 0..cols {
                p[r + 1][c + 1] = matrix[r][c] + p[r][c + 1] + p[r + 1][c] - p[r][c];
            }
        }
        NumMatrix { p }
    }

    fn sum_region(&self, r1: usize, c1: usize, r2: usize, c2: usize) -> i64 {
        let p = &self.p;
        p[r2 + 1][c2 + 1] - p[r1][c2 + 1] - p[r2 + 1][c1] + p[r1][c1]
    }
}`,
      php: `class NumMatrix {
    private array $P;

    public function __construct(array $matrix) {
        $rows = count($matrix);
        $cols = count($matrix[0]);
        $this->P = array_fill(0, $rows + 1, array_fill(0, $cols + 1, 0));
        for ($r = 0; $r < $rows; $r++)
            for ($c = 0; $c < $cols; $c++)
                $this->P[$r + 1][$c + 1] = $matrix[$r][$c] + $this->P[$r][$c + 1]
                    + $this->P[$r + 1][$c] - $this->P[$r][$c];
    }

    public function sumRegion(int $r1, int $c1, int $r2, int $c2): int {
        $P = $this->P;
        return $P[$r2 + 1][$c2 + 1] - $P[$r1][$c2 + 1] - $P[$r2 + 1][$c1] + $P[$r1][$c1];
    }
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `const m = new NumMatrix([
  [3, 0, 1, 4, 2],
  [5, 6, 3, 2, 1],
  [1, 2, 0, 1, 5],
  [4, 1, 0, 1, 7],
  [1, 0, 3, 0, 5],
])
assertEqual(m.sumRegion(2, 1, 4, 3), 8)
assertEqual(m.sumRegion(1, 1, 2, 2), 11)
assertEqual(m.sumRegion(1, 2, 2, 4), 12)` },
      { name: 'une seule case et matrice 1 × 1', code: `const m = new NumMatrix([[3, 0], [5, 6]])
assertEqual(m.sumRegion(1, 1, 1, 1), 6)
assertEqual(m.sumRegion(0, 1, 0, 1), 0)
assertEqual(new NumMatrix([[-4]]).sumRegion(0, 0, 0, 0), -4)` },
      { name: 'rectangle en ligne 0 ou colonne 0', code: `const m = new NumMatrix([[1, 2, 3], [4, 5, 6]])
assertEqual(m.sumRegion(0, 0, 0, 2), 6)
assertEqual(m.sumRegion(0, 0, 1, 0), 5)
assertEqual(m.sumRegion(0, 0, 1, 2), 21)` },
      { name: 'valeurs négatives', code: `const m = new NumMatrix([[-1, 2], [3, -4]])
assertEqual(m.sumRegion(0, 0, 1, 1), 0)
assertEqual(m.sumRegion(0, 1, 1, 1), -2)
assertEqual(m.sumRegion(1, 0, 1, 0), 3)` },
      {
        name: 'grande entrée (300 × 300, 100 000 requêtes)',
        code: `const N = 300
const matrix = []
for (let r = 0; r < N; r++) {
  const row = []
  for (let c = 0; c < N; c++) row.push(((r * 31 + c * 17) % 21) - 10)
  matrix.push(row)
}
const query = (q) => [q % 50, (q * 7) % 50, 250 + ((q * 13) % 50), 250 + ((q * 11) % 50)]
const t0 = performance.now()
const m = new NumMatrix(matrix)
const results = []
for (let q = 0; q < 100000; q++) {
  const [r1, c1, r2, c2] = query(q)
  results.push(m.sumRegion(r1, c1, r2, c2))
}
const elapsed = performance.now() - t0
for (let q = 0; q < 20; q++) {
  const [r1, c1, r2, c2] = query(q)
  let expected = 0
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) expected += matrix[r][c]
  assertEqual(results[q], expected, 'requête ' + q)
}
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (chaque requête doit être en O(1))')`,
      },
    ],
    hints: [
      'Sommer le rectangle à chaque appel coûte O(rows · cols) : avec 10⁵ requêtes sur des rectangles de 40 000 cases, c’est 4 × 10⁹ additions.',
      'Précalculez `P[r + 1][c + 1]`, la somme du rectangle allant de `(0, 0)` à `(r, c)`, avec une ligne et une colonne de zéros en plus pour éviter les cas particuliers.',
      'Inclusion-exclusion : `P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]` (on a retiré deux fois le coin supérieur gauche, on le rajoute).',
    ],
    discussion: `**Complexité** : précalcul O(rows · cols) en temps et en mémoire ; chaque requête en O(1).

**Points à évoquer** :

- une solution intermédiaire : des préfixes **par ligne**, soit O(rows) par requête ;
- si la matrice est **modifiée** entre les requêtes (LeetCode 308), il faut un arbre de Fenwick 2D : O(log rows · log cols) pour la mise à jour et la requête ;
- dessiner le rectangle et les quatre zones au tableau rend l'inclusion-exclusion évidente et évite les erreurs de signe ;
- applications : nombre de sous-matrices de somme k (préfixes sur les colonnes + \`Map\`), plus grand carré de somme ≤ seuil (préfixes + dichotomie), flou d'image (moyenne sur une fenêtre k × k).`,
  },
  {
    id: 'fo-eau-de-pluie',
    title: 'Piéger l’eau de pluie',
    difficulty: 'difficile',
    theme: 'tableaux',
    pattern: 'two pointers opposés (maxima)',
    statement: `\`height[i]\` est la hauteur d'une barre de largeur 1. Après la pluie, l'eau s'accumule entre les barres. Écrivez \`trap(height)\` qui renvoie le volume d'eau retenu.

Au-dessus de la barre \`i\`, le niveau de l'eau vaut \`min(plus haute barre à gauche, plus haute barre à droite)\` (barre \`i\` comprise), et l'eau retenue vaut ce niveau moins \`height[i]\`.

Exemples :

- \`trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])\` donne \`6\` ;
- \`trap([4, 2, 0, 3, 2, 5])\` donne \`9\` ;
- \`trap([1, 2, 3])\` donne \`0\`.

Contraintes : \`0 ≤ n ≤ 2 × 10⁵\`, \`0 ≤ height[i] ≤ 10⁵\`. Visez O(n) en temps ; O(1) de mémoire est un bonus apprécié.`,
    starter: `function trap(height) {
  // TODO : niveau d'eau = min(max à gauche, max à droite)
  return 0
}`,
    solution: `function trap(height) {
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0
  while (left < right) {
    if (height[left] < height[right]) {
      // le côté gauche est le facteur limitant : son niveau est fixé par leftMax
      leftMax = Math.max(leftMax, height[left])
      water += leftMax - height[left]
      left++
    } else {
      rightMax = Math.max(rightMax, height[right])
      water += rightMax - height[right]
      right--
    }
  }
  return water
}`,
    solutionEquiv: {
      python: `def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`,
      java: `static long trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0;
    long water = 0; // peut dépasser 2^31
    while (left < right) {
        if (height[left] < height[right]) {
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
            left++;
        } else {
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
            right--;
        }
    }
    return water;
}`,
      rust: `fn trap(height: &[i64]) -> i64 {
    if height.is_empty() {
        return 0;
    }
    let (mut left, mut right) = (0, height.len() - 1);
    let (mut left_max, mut right_max, mut water) = (0, 0, 0);
    while left < right {
        if height[left] < height[right] {
            left_max = left_max.max(height[left]);
            water += left_max - height[left];
            left += 1;
        } else {
            right_max = right_max.max(height[right]);
            water += right_max - height[right];
            right -= 1;
        }
    }
    water
}`,
      php: `function trap(array $height): int {
    $left = 0;
    $right = count($height) - 1;
    $leftMax = $rightMax = $water = 0;
    while ($left < $right) {
        if ($height[$left] < $height[$right]) {
            $leftMax = max($leftMax, $height[$left]);
            $water += $leftMax - $height[$left];
            $left++;
        } else {
            $rightMax = max($rightMax, $height[$right]);
            $water += $rightMax - $height[$right];
            $right--;
        }
    }
    return $water;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), 6)
assertEqual(trap([4, 2, 0, 3, 2, 5]), 9)` },
      { name: 'monotone : rien n’est retenu', code: `assertEqual(trap([1, 2, 3]), 0)
assertEqual(trap([3, 2, 1]), 0)` },
      { name: 'vide, une ou deux barres', code: `assertEqual(trap([]), 0)
assertEqual(trap([5]), 0)
assertEqual(trap([5, 5]), 0)` },
      { name: 'cuvette et plateaux égaux', code: `assertEqual(trap([3, 0, 0, 3]), 6)
assertEqual(trap([2, 0, 2, 0, 2]), 4)
assertEqual(trap([5, 1, 5, 1, 1, 5]), 12)` },
      {
        name: 'comparaison avec la force brute (n = 600)',
        code: `let seed = 7
const h = []
for (let i = 0; i < 600; i++) {
  seed = (seed * 1103515245 + 12345) % 2147483648
  h.push(seed % 50)
}
let expected = 0
for (let i = 0; i < h.length; i++) {
  let lm = 0
  let rm = 0
  for (let j = 0; j <= i; j++) lm = Math.max(lm, h[j])
  for (let j = i; j < h.length; j++) rm = Math.max(rm, h[j])
  expected += Math.min(lm, rm) - h[i]
}
assertEqual(trap(h), expected)`,
      },
      {
        name: 'grande entrée (n = 200 000)',
        code: `const n = 200000
const h = new Array(n).fill(0)
h[0] = 1000
h[n - 1] = 1000
const t0 = performance.now()
const r = trap(h)
const elapsed = performance.now() - t0
assertEqual(r, 1000 * (n - 2))
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n))')`,
      },
    ],
    hints: [
      'La force brute calcule, pour chaque barre, le maximum à gauche et à droite : O(n²). Deux tableaux `leftMax[i]` et `rightMax[i]` précalculés (des « préfixes de maximum ») donnent déjà O(n) en temps et O(n) en mémoire.',
      'Pour O(1) en mémoire : deux pointeurs aux extrémités, et les maxima vus de chaque côté. Lequel des deux côtés peut-on « régler » avec certitude ?',
      'Si `height[left] < height[right]`, il existe à droite une barre au moins aussi haute que tout ce qu’on a vu à gauche : le niveau en `left` vaut exactement `leftMax`. On ajoute `leftMax − height[left]` et on avance `left`. Symétrique sinon.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Trois solutions à savoir présenter, dans l'ordre** :

- **force brute** O(n²) : pour chaque \`i\`, deux balayages pour trouver les maxima ;
- **préfixes de maximum** O(n) / O(n) : \`leftMax[i] = max(leftMax[i − 1], height[i])\`, idem de droite à gauche, puis une somme ; c'est la plus facile à justifier ;
- **deux pointeurs** O(n) / O(1) : l'invariant est que le côté dont la barre courante est la plus basse est borné par son propre maximum, puisque l'autre côté possède une barre au moins aussi haute.

**Alternative** : une **pile monotone** décroissante calcule l'eau couche par couche (horizontalement), aussi en O(n).

**Suites possibles** : version 2D (Trapping Rain Water II) avec un tas et un parcours depuis les bords (O(rows · cols · log)) ; Container With Most Water, qui utilise le même déplacement du côté le plus bas mais un calcul différent.`,
  },
)

quiz.push(
  {
    id: 'fo-q9',
    theme: 'tableaux',
    kind: 'qcm',
    q: 'Énoncé : « Le tableau est trié. Trouvez deux éléments dont la somme vaut k, en O(1) de mémoire. » Quelle technique s’impose ?',
    choices: ['Une table de hachage valeur → indice', 'Deux pointeurs partant des extrémités', 'Une fenêtre glissante de taille fixe', 'Une somme préfixe'],
    answer: 1,
    why: 'Le tri permet d’éliminer un élément à chaque comparaison : somme trop petite, on avance la gauche ; trop grande, on recule la droite. O(n) en temps et O(1) en mémoire. La table de hachage fonctionne aussi, mais coûte O(n) en mémoire et n’exploite pas le tri.',
  },
  {
    id: 'fo-q10',
    theme: 'tableaux',
    kind: 'qcm',
    q: 'On reçoit 10⁵ opérations « ajouter v à tous les éléments d’indice l à r », puis on doit afficher le tableau final (n = 10⁵). Quelle approche est la plus adaptée ?',
    choices: [
      'Appliquer chaque opération case par case',
      'Un tableau de différences : `diff[l] += v`, `diff[r + 1] -= v`, puis une somme préfixe',
      'Trier les opérations par `l`',
      'Une somme préfixe recalculée après chaque opération',
    ],
    answer: 1,
    why: 'Chaque mise à jour coûte O(1) dans le tableau de différences, et une seule somme préfixe finale reconstruit le résultat : O(n + q). Appliquer case par case coûte O(n · q), soit jusqu’à 10¹⁰ opérations.',
  },
  {
    id: 'fo-q11',
    theme: 'tableaux',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const nums = [2, -1, 3, 4]
const prefix = [0]
for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
console.log(prefix[3] - prefix[1])`,
    choices: ['2', '6', '4', '5'],
    answer: 0,
    why: '`prefix` vaut `[0, 2, 1, 4, 8]`. `prefix[3] - prefix[1]` est la somme de `nums[1..2]`, soit −1 + 3 = 2. Règle : `prefix[r + 1] - prefix[l]` donne la somme de `nums[l..r]` inclus ; ici l = 1 et r = 2.',
  },
  {
    id: 'fo-q12',
    theme: 'tableaux',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const nums = [3, 2, 2, 3, 4]
let w = 0
for (let r = 0; r < nums.length; r++) {
  if (nums[r] !== 3) nums[w++] = nums[r]
}
console.log(w, nums)`,
    choices: ['3 [ 2, 2, 4 ]', '3 [ 2, 2, 4, 3, 4 ]', '3 [ 2, 2, 4, 0, 0 ]', '2 [ 2, 2, 4, 3, 4 ]'],
    answer: 1,
    why: 'Le gabarit lecteur/écrivain recopie les éléments conservés au début du tableau, mais ne touche pas à la fin : après `w = 3`, les cases 3 et 4 gardent leurs anciennes valeurs (3 et 4). C’est pourquoi ces exercices renvoient la nouvelle longueur : seule la partie `nums.slice(0, w)` a un sens.',
  },
  {
    id: 'fo-q13',
    theme: 'tableaux',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction (n = `nums.length`) ?',
    code: `function threeSumCount(nums) {
  const a = [...nums].sort((x, y) => x - y)
  let count = 0
  for (let i = 0; i < a.length - 2; i++) {
    let lo = i + 1
    let hi = a.length - 1
    while (lo < hi) {
      const s = a[i] + a[lo] + a[hi]
      if (s === 0) {
        count++
        lo++
        hi--
      } else if (s < 0) lo++
      else hi--
    }
  }
  return count
}
threeSumCount([-1, 0, 1, 2, -1, -4])`,
    choices: ['O(n log n)', 'O(n²)', 'O(n³)', 'O(n² log n)'],
    answer: 1,
    why: 'Le tri coûte O(n log n). Pour chaque `i`, les deux pointeurs se rapprochent et font au plus n pas : O(n) par `i`, donc O(n²) au total, qui domine le tri. La force brute sur les triplets serait en O(n³).',
  },
  {
    id: 'fo-q14',
    theme: 'tableaux',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction (n = `nums.length`, q = `queries.length`) ?',
    code: `function answerQueries(nums, queries) {
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  return queries.map(([l, r]) => prefix[r + 1] - prefix[l])
}
answerQueries([1, 2, 3, 4], [[0, 1], [1, 3]])`,
    choices: ['O(n · q)', 'O(n + q)', 'O(q log n)', 'O(n²)'],
    answer: 1,
    why: 'Construire les préfixes coûte O(n), puis chaque requête est en O(1) : O(n + q). Sommer chaque plage à la demande coûterait O(n · q) dans le pire cas.',
  },
  {
    id: 'fo-q15',
    theme: 'tableaux',
    kind: 'bug',
    q: 'Cette fonction doit renvoyer la plus grande somme d’un sous-tableau **non vide**. Quel est le bug ?',
    code: `function maxSub(nums) {
  let best = 0
  let cur = 0
  for (const x of nums) {
    cur = Math.max(0, cur + x)
    best = Math.max(best, cur)
  }
  return best
}
maxSub([-3, -1, -2])`,
    choices: [
      'Elle renvoie 0 pour un tableau entièrement négatif, au lieu du plus grand élément',
      '`Math.max(0, …)` rend la fonction quadratique',
      'Elle ignore le dernier élément du tableau',
      'Elle plante sur un tableau vide',
    ],
    answer: 0,
    why: 'Partir de 0 et remettre `cur` à 0 revient à autoriser le sous-tableau vide : sur `[-3, -1, -2]`, elle renvoie 0 au lieu de −1. Correction : `best = cur = nums[0]`, puis `cur = Math.max(x, cur + x)` à partir de l’indice 1.',
  },
  {
    id: 'fo-q16',
    theme: 'tableaux',
    kind: 'bug',
    q: '`prefix` a n + 1 cases avec `prefix[0] = 0`. `rangeSum(l, r)` doit renvoyer la somme de `nums[l..r]`, bornes incluses. Quel est le bug ?',
    code: `const nums = [5, 1, 4]
const prefix = [0, 5, 6, 10]
function rangeSum(l, r) {
  return prefix[r] - prefix[l]
}
rangeSum(0, 2)`,
    choices: [
      'Il faudrait `prefix[r] - prefix[l - 1]`',
      'Il faudrait `prefix[r + 1] - prefix[l]` : la version actuelle oublie `nums[r]`',
      'Il faudrait `prefix[r + 1] - prefix[l + 1]`',
      'Aucun bug : `rangeSum(0, 2)` vaut bien 10',
    ],
    answer: 1,
    why: '`prefix[i]` est la somme des i **premiers** éléments, donc des indices 0 à i − 1. La somme de `nums[l..r]` vaut `prefix[r + 1] - prefix[l]`. Ici, la fonction renvoie 6 au lieu de 10. La variante `prefix[l - 1]` correspond à des préfixes inclusifs sans case 0, et casse pour l = 0.',
  },
)

pieges.push(
  {
    id: 'fo-p4',
    title: 'Grille créée avec fill : lignes partagées',
    theme: 'tableaux',
    question: 'On veut une grille 3 × 0 et ajouter un élément à la première ligne. Qu’affiche ce code ?',
    code: `const grid = new Array(3).fill([])
grid[0].push('x')
console.log(grid)
console.log(grid[0] === grid[2])`,
    output: `[ [ 'x' ], [ 'x' ], [ 'x' ] ]
true`,
    explanation: '`fill` évalue son argument **une seule fois** et place la même référence dans chaque case : les trois lignes sont un unique tableau. Même piège avec `fill({})` ou `fill(new Array(cols).fill(0))` pour une matrice. Il faut créer une nouvelle ligne par case, avec `Array.from({ length }, () => …)` ou une boucle.',
    fix: {
      code: `const grid = Array.from({ length: 3 }, () => [])
grid[0].push('x')
console.log(grid)

const matrix = Array.from({ length: 2 }, () => new Array(3).fill(0))
matrix[0][0] = 1
console.log(matrix)`,
      output: `[ [ 'x' ], [], [] ]
[ [ 1, 0, 0 ], [ 0, 0, 0 ] ]`,
      equiv: {
        python: `# Même piège en Python : [[]] * 3 répète la même liste.
grid = [[] for _ in range(3)]
grid[0].append('x')

matrix = [[0] * 3 for _ in range(2)]  # [0] * 3 est sûr : les entiers sont immuables
matrix[0][0] = 1`,
        java: `// new int[2][3] crée des lignes distinctes, déjà remplies de 0.
int[][] matrix = new int[2][3];
matrix[0][0] = 1;

// Avec des listes, une ligne par case :
List<List<String>> grid = new ArrayList<>();
for (int i = 0; i < 3; i++) grid.add(new ArrayList<>());
grid.get(0).add("x");`,
      },
    },
  },
  {
    id: 'fo-p5',
    title: 'splice pendant un parcours vers l’avant',
    theme: 'tableaux',
    question: 'On veut supprimer tous les 2. Qu’affiche ce code ?',
    code: `const nums = [1, 2, 2, 3, 2, 4]
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 2) nums.splice(i, 1)
}
console.log(nums)

const other = [2, 2, 2]
for (let i = 0; i < other.length; i++) {
  if (other[i] === 2) other.splice(i, 1)
}
console.log(other)`,
    output: `[ 1, 2, 3, 4 ]
[ 2 ]`,
    explanation: 'Après `splice(i, 1)`, l’élément suivant glisse à l’indice `i`, mais la boucle passe à `i + 1` : il n’est jamais examiné. Deux 2 consécutifs laissent donc un survivant. En plus, chaque `splice` décale la fin du tableau : O(n²) au total. Solutions : parcourir **à l’envers**, utiliser `filter` (nouveau tableau, O(n)), ou le gabarit lecteur/écrivain en place.',
    fix: {
      code: `const nums = [1, 2, 2, 3, 2, 4]
let write = 0
for (let read = 0; read < nums.length; read++) {
  if (nums[read] !== 2) nums[write++] = nums[read]
}
nums.length = write // tronque en O(1) amorti
console.log(nums)`,
      output: `[ 1, 3, 4 ]`,
    },
  },
  {
    id: 'fo-p6',
    title: 'Trier des nombres avant deux pointeurs : sort() sans comparateur',
    theme: 'tableaux',
    question: 'On trie avant d’appliquer deux pointeurs. Qu’affiche ce code ?',
    code: `const nums = [10, 9, 1, 100, 25]
nums.sort()
console.log(nums)

function hasPair(sorted, target) {
  let l = 0
  let r = sorted.length - 1
  while (l < r) {
    const s = sorted[l] + sorted[r]
    if (s === target) return true
    if (s < target) l++
    else r--
  }
  return false
}
console.log(hasPair(nums, 34))`,
    output: `[ 1, 10, 100, 25, 9 ]
false`,
    explanation: 'Sans comparateur, `sort` convertit les éléments en **chaînes** et les compare dans l’ordre lexicographique : « 100 » vient avant « 25 ». Le tableau n’est pas trié numériquement, l’invariant des deux pointeurs est faux, et la paire 9 + 25 = 34 n’est pas trouvée. Toujours écrire `sort((a, b) => a - b)` pour des nombres. Attention aussi : `sort` modifie le tableau en place (`toSorted` renvoie une copie).',
    fix: {
      code: `const nums = [10, 9, 1, 100, 25]
nums.sort((a, b) => a - b)
console.log(nums)`,
      output: `[ 1, 9, 10, 25, 100 ]`,
    },
  },
)

flashcards.push(
  { id: 'fo-f9', theme: 'tableaux', front: 'Quels signaux évoquent la technique des deux pointeurs opposés ?', back: 'Tableau **trié** (ou triable), paire ou triplet de somme donnée, palindrome, inversion en place, « plus grand récipient ». On avance le pointeur qui ne peut plus faire partie d’une meilleure solution : O(n), O(1) en mémoire.' },
  { id: 'fo-f10', theme: 'tableaux', front: 'Comment supprimer des éléments d’un tableau en place en O(n) ?', back: 'Gabarit **lecteur/écrivain** : `read` parcourt tout, `write` reçoit les éléments conservés (`nums[write++] = nums[read]`). On renvoie `write` (nouvelle longueur), ou l’on tronque avec `nums.length = write`.' },
  { id: 'fo-f11', theme: 'tableaux', front: 'Formule de la somme de `nums[l..r]` avec des préfixes ?', back: '`prefix[r + 1] - prefix[l]`, où `prefix` a n + 1 cases et `prefix[0] = 0`.', code: `const prefix = [0, 3, 2, 6, 7]
prefix[3 + 1] - prefix[1] // → 4` },
  { id: 'fo-f12', theme: 'tableaux', front: 'Somme d’un rectangle (r1, c1)–(r2, c2) avec des préfixes 2D ?', back: '`P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]` : grand rectangle, moins la bande du haut, moins la bande de gauche, plus le coin retiré deux fois.' },
  { id: 'fo-f13', theme: 'tableaux', front: 'À quoi sert un tableau de différences ?', back: 'À appliquer beaucoup de mises à jour « +v sur [l, r] » en O(1) chacune (`diff[l] += v`, `diff[r + 1] -= v`), puis à reconstruire le tableau par une somme préfixe. Total O(n + q).' },
  { id: 'fo-f14', theme: 'tableaux', front: 'Récurrence de Kadane ?', back: '`current = max(x, current + x)` (prolonger ou repartir) puis `best = max(best, current)`. Initialiser avec `nums[0]`, pas 0, sinon un tableau entièrement négatif renvoie 0.' },
  { id: 'fo-f15', theme: 'tableaux', front: 'Comment faire tourner un tableau de k crans vers la droite en O(1) de mémoire ?', back: '`k %= n`, puis trois inversions : tout le tableau, les k premiers, les n − k derniers.', code: `const a = [1, 2, 3, 4, 5]
a.reverse()
a.splice(0, 2, ...a.slice(0, 2).reverse())
a.splice(2, 3, ...a.slice(2).reverse())
a // → [ 4, 5, 1, 2, 3 ]` },
  { id: 'fo-f16', theme: 'tableaux', front: 'Comment faire tourner une matrice carrée de 90° (sens horaire) en place ?', back: '**Transposer** (échanger `m[i][j]` et `m[j][i]` pour j > i), puis **inverser chaque ligne**. Sens antihoraire : inverser chaque ligne, puis transposer (ou transposer puis inverser l’ordre des lignes).' },
)

lexique.push(
  { term: 'Deux pointeurs (two pointers)', theme: 'tableaux', def: 'Technique où deux indices parcourent un tableau, soit depuis les deux extrémités vers le centre (tableau trié, palindrome), soit dans le même sens à des vitesses différentes (lecteur/écrivain, fenêtre). Les pointeurs ne reculent jamais, d’où un coût total O(n).', see: ['Lecteur / écrivain', 'Fenêtre glissante'] },
  { term: 'Lecteur / écrivain', theme: 'tableaux', def: 'Variante des deux pointeurs pour filtrer ou compacter un tableau en place : `read` lit chaque case, `write` désigne la prochaine case où écrire un élément conservé. Tout ce qui précède `write` est le résultat.', see: ['Deux pointeurs (two pointers)'] },
  { term: 'Somme préfixe', theme: 'tableaux', def: 'Tableau `prefix` où `prefix[i]` est la somme des i premiers éléments (`prefix[0] = 0`). Permet de calculer la somme de toute tranche en O(1) après un précalcul O(n) : `prefix[r + 1] - prefix[l]`. Se généralise en 2D par inclusion-exclusion.', see: ['Tableau de différences'] },
  { term: 'Tableau de différences', theme: 'tableaux', def: 'Inverse de la somme préfixe : `diff[i] = a[i] - a[i - 1]`. Ajouter v à une plage [l, r] se fait en modifiant deux cases (`diff[l] += v`, `diff[r + 1] -= v`) ; une somme préfixe finale reconstruit le tableau.', see: ['Somme préfixe'] },
  { term: 'Algorithme de Kadane', theme: 'tableaux', def: 'Calcul en O(n) et O(1) de la plus grande somme d’un sous-tableau contigu : on maintient la meilleure somme d’un sous-tableau finissant à l’indice courant (`max(x, courant + x)`) et le meilleur résultat global.' },
  { term: 'Drapeau hollandais', theme: 'tableaux', def: 'Problème de Dijkstra (Dutch national flag) : partitionner un tableau en trois zones (inférieur, égal, supérieur à un pivot) en un seul passage et en place, avec trois pointeurs `low`, `mid` et `high`. Base du tri rapide à partition en trois.' },
)

entretien.push(
  {
    id: 'fo-e4',
    section: 'techniques',
    q: 'À quoi reconnaissez-vous qu’un problème de tableau se résout avec deux pointeurs, et comment justifiez-vous que l’on ne rate aucune solution ?',
    answer: 'Signaux : tableau trié ou que l’on peut trier sans perdre l’information demandée, recherche d’une paire ou d’un triplet, contrainte « O(1) de mémoire » ou « en place », comparaison des deux extrémités (palindrome, récipient).\n\nJustification : à chaque étape, j’élimine définitivement un élément. Dans un tableau trié, si `a[l] + a[r] < cible`, alors `a[l]` combiné à tout indice ≤ r donne une somme trop petite ; il ne fait partie d’aucune solution restante, j’avance `l`. Symétriquement pour `r`. Chaque pas élimine un candidat, donc au plus n pas.\n\nSi trier fait perdre les indices d’origine, je trie des paires `[valeur, indice]` ou je reviens à une table de hachage.',
    attendu: 'Un argument d’élimination clair (pas seulement « ça marche »), la connaissance des variantes (3Sum, récipient, lecteur/écrivain) et du compromis avec la table de hachage.',
  },
  {
    id: 'fo-e5',
    section: 'techniques',
    q: '« Nombre de sous-tableaux de somme k » : fenêtre glissante ou sommes préfixes ?',
    answer: 'Tout dépend du **signe** des valeurs. La fenêtre glissante repose sur la monotonie : agrandir la fenêtre augmente la somme, la réduire la diminue. C’est vrai seulement si toutes les valeurs sont positives. Avec des négatifs ou des zéros, réduire la fenêtre peut faire remonter la somme, et l’on rate des solutions.\n\nDans le cas général, j’utilise les **sommes préfixes avec une Map** : un sous-tableau `(i, j]` a pour somme `prefix[j] - prefix[i]`, donc je compte, pour chaque `j`, combien de préfixes antérieurs valent `prefix[j] - k`. O(n) en temps et en mémoire. Si l’énoncé garantit des valeurs strictement positives, la fenêtre donne O(n) en temps et O(1) en mémoire.',
    attendu: 'Identifier la condition de monotonie qui rend la fenêtre valide, et connaître le gabarit préfixe + Map comme solution générale.',
  },
  {
    id: 'fo-e6',
    section: 'structures',
    q: 'Faut-il modifier le tableau d’entrée ou travailler sur une copie ? Que demandez-vous au recruteur ?',
    answer: 'Je pose la question explicitement, car elle change la complexité mémoire : trier en place ou compacter avec lecteur/écrivain donne O(1) de mémoire auxiliaire, mais détruit l’entrée, ce qui est inacceptable si l’appelant la réutilise (fonction de bibliothèque, données partagées).\n\nEn JavaScript, je fais attention aux méthodes qui mutent sans le dire (`sort`, `reverse`, `splice`) et j’utilise les versions qui copient (`toSorted`, `toReversed`, `toSpliced`, ou `slice()` d’abord) quand l’entrée doit être préservée. J’annonce alors « O(n) de mémoire pour la copie ». Dans un énoncé qui dit « en place », je renvoie la nouvelle longueur et je ne crée aucun tableau.',
    attendu: 'Le réflexe de clarifier, la connaissance des méthodes mutantes de JavaScript et l’impact sur la complexité mémoire.',
  },
)

// ═════════════════════════════════════════════════════════════════════════════
// TABLES DE HACHAGE
// ═════════════════════════════════════════════════════════════════════════════

cours.push({
  id: 'hachage',
  title: 'Tables de hachage',
  summary: 'La structure qui transforme une recherche linéaire en accès O(1) en moyenne : Map, Set et objets en JavaScript, comptage de fréquences, complément « déjà vu », regroupement par clé canonique, préfixes + Map et clés composites.',
  blocks: [
    { h: 'Principe : hachage, seaux et collisions', id: 'hachage-principe' },
    {
      p: 'Une table de hachage range chaque clé dans un **seau** (bucket) dont l’indice est calculé par une **fonction de hachage** : `indice = hash(clé) mod nombreDeSeaux`. Pour retrouver une clé, on recalcule son indice et l’on ne regarde que ce seau. Tant que les clés se répartissent bien, chaque seau contient peu d’éléments : insertion, recherche et suppression sont en **O(1) en moyenne**.',
    },
    {
      title: 'Une fonction de hachage jouet et ses collisions',
      code: `function hashString(key, buckets) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % buckets
  return h
}

const buckets = Array.from({ length: 4 }, () => [])
for (const word of ['chat', 'chien', 'loup', 'ours', 'lynx', 'puma']) {
  buckets[hashString(word, 4)].push(word)
}
console.log(buckets)`,
      output: `[ [ 'chat' ], [ 'chien', 'puma' ], [ 'loup' ], [ 'ours', 'lynx' ] ]`,
    },
    {
      list: [
        '**Collision** : deux clés différentes tombent dans le même seau (`chien` et `puma` ci-dessus). On les gère par **chaînage** (une liste par seau) ou par **adressage ouvert** (on cherche la case libre suivante). V8 utilise des tables ordonnées pour `Map` et `Set`.',
        '**Facteur de charge** : nombre d’éléments / nombre de seaux. Quand il dépasse un seuil (souvent 0,75), la table **double** de taille et tout est re-haché : O(n) ponctuellement, O(1) amorti, comme `push`.',
        '**Pire cas O(n)** : si toutes les clés collisionnent (fonction de hachage faible ou entrées malveillantes, attaque par « hash flooding »), chaque opération parcourt un seau de taille n. Java convertit les seaux trop longs en arbres équilibrés (O(log n)), Python et Rust rendent le hachage des chaînes aléatoire par processus.',
        '**Le hachage d’une clé coûte sa taille** : hacher une chaîne de longueur k est O(k). Une `Map` de n chaînes de longueur k coûte donc O(n · k), ce qu’il faut dire quand les clés sont longues (anagrammes, mots, sérialisations).',
      ],
    },
    {
      mnemo: 'Hacher → choisir un seau → ne regarder que lui. O(1) en moyenne, O(n) dans le pire cas, et O(k) pour hacher une clé de taille k.',
      piege: 'Annoncer « O(1) » sans préciser « en moyenne », ou oublier que le hachage d’une clé chaîne coûte sa longueur.',
    },

    { h: 'Map, Set et objets en JavaScript', id: 'hachage-map-objet' },
    {
      p: 'JavaScript propose trois outils. **`Map`** accepte des clés de n’importe quel type (nombres, objets, chaînes) sans conversion, garde l’ordre d’insertion, expose `size` et n’hérite d’aucune clé parasite : c’est le choix par défaut en algorithmique. **`Set`** est une `Map` sans valeurs, pour l’appartenance et le dédoublonnage. L’**objet littéral** convertit toutes ses clés en chaînes, hérite de `Object.prototype` (`toString`, `constructor`…) et range les clés de type entier avant les autres.',
    },
    {
      title: 'Les différences qui comptent en entretien',
      code: `const obj = {}
obj[1] = 'nombre'
obj['1'] = 'chaîne' // même clé : '1'
Object.keys(obj) // → [ '1' ]

const map = new Map()
map.set(1, 'nombre')
map.set('1', 'chaîne') // deux clés distinctes
map.size // → 2

'toString' in {} // → true
new Map().has('toString') // → false

const seen = new Set([3, 1, 3, 2])
seen.size // → 3
seen.has(2) // → true
Array.from(seen) // → [ 3, 1, 2 ]`,
      equiv: {
        python: `obj = {}
obj[1] = 'nombre'
obj['1'] = 'chaîne'   # dict Python : 1 et '1' sont deux clés distinctes
len(obj)              # 2

seen = {3, 1, 3, 2}   # set : pas d'ordre garanti
2 in seen
# dict conserve l'ordre d'insertion (depuis Python 3.7), set non`,
        java: `import java.util.*;

Map<Object, String> map = new HashMap<>(); // ordre non garanti
map.put(1, "nombre");
map.put("1", "chaîne");
map.size(); // 2
// LinkedHashMap conserve l'ordre d'insertion, TreeMap trie les clés (O(log n))

Set<Integer> seen = new LinkedHashSet<>(List.of(3, 1, 3, 2));
seen.contains(2);`,
        rust: `use std::collections::{HashMap, HashSet};

let mut map: HashMap<i32, &str> = HashMap::new(); // clés d'un seul type
map.insert(1, "nombre");
map.len();

let seen: HashSet<i32> = [3, 1, 3, 2].into_iter().collect();
seen.contains(&2);
// BTreeMap / BTreeSet : clés triées, O(log n)`,
        php: `// Les tableaux PHP sont des tables de hachage ordonnées.
$obj = [];
$obj[1] = 'nombre';
$obj['1'] = 'chaîne'; // '1' est converti en entier 1 : même clé
count($obj); // 1

$seen = array_flip([3, 1, 3, 2]); // valeurs → clés
isset($seen[2]);`,
      },
    },
    {
      table: [
        ['Critère', '`Map`', 'Objet `{}`'],
        ['Type des clés', 'quelconque, sans conversion', 'chaînes (et symboles) : `1` devient `\'1\'`'],
        ['Taille', '`map.size` en O(1)', '`Object.keys(o).length` en O(n)'],
        ['Clés héritées', 'aucune', '`toString`, `constructor`… (sauf `Object.create(null)`)'],
        ['Ordre d’itération', 'ordre d’insertion', 'entiers croissants d’abord, puis ordre d’insertion'],
        ['Objet comme clé', 'par référence', 'converti en `\'[object Object]\'`'],
      ],
    },
    {
      mnemo: '`Map` par défaut, `Set` pour « déjà vu ? », objet seulement pour des clés chaînes connues à l’avance.',
      piege: 'Utiliser un objet comme compteur avec des clés comme `constructor` ou `__proto__`, ou compter sur l’ordre d’insertion d’un objet dont les clés sont des nombres : ils sont réordonnés.',
    },

    { h: 'Compter les fréquences', id: 'hachage-frequences' },
    {
      p: 'Compter les occurrences est le premier réflexe dès qu’un énoncé parle d’**anagrammes**, de « l’élément le plus fréquent », de « caractère unique », de « peut-on former X avec les lettres de Y ». Un passage remplit la table ; un second l’exploite. Si l’alphabet est petit et connu (26 lettres minuscules), un tableau de 26 entiers indexé par `code - 97` est plus rapide et prend O(1) de mémoire.',
    },
    {
      title: 'Table de fréquences avec une Map',
      code: `function countFrequencies(items) {
  const freq = new Map()
  for (const x of items) freq.set(x, (freq.get(x) ?? 0) + 1)
  return freq
}

const freq = countFrequencies('abracadabra')
freq // → Map(5) { 'a' => 5, 'b' => 2, 'r' => 2, 'c' => 1, 'd' => 1 }
const top = [...freq].sort((a, b) => b[1] - a[1])[0]
top // → [ 'a', 5 ]

function firstUnique(s) {
  const f = countFrequencies(s)
  for (let i = 0; i < s.length; i++) if (f.get(s[i]) === 1) return i
  return -1
}
firstUnique('abracadabra') // → 4`,
      equiv: {
        python: `from collections import Counter

freq = Counter('abracadabra')
top = freq.most_common(1)[0]   # ('a', 5)

def first_unique(s):
    f = Counter(s)
    for i, ch in enumerate(s):
        if f[ch] == 1:
            return i
    return -1`,
        java: `import java.util.*;

static Map<Character, Integer> countFrequencies(String s) {
    Map<Character, Integer> freq = new LinkedHashMap<>();
    for (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);
    return freq;
}

static int firstUnique(String s) {
    Map<Character, Integer> f = countFrequencies(s);
    for (int i = 0; i < s.length(); i++) if (f.get(s.charAt(i)) == 1) return i;
    return -1;
}`,
        rust: `use std::collections::HashMap;

fn count_frequencies(s: &str) -> HashMap<char, usize> {
    let mut freq = HashMap::new();
    for c in s.chars() {
        *freq.entry(c).or_insert(0) += 1; // entry API : une seule recherche
    }
    freq
}

fn first_unique(s: &str) -> i32 {
    let f = count_frequencies(s);
    for (i, c) in s.chars().enumerate() {
        if f[&c] == 1 {
            return i as i32;
        }
    }
    -1
}`,
        php: `$freq = array_count_values(str_split('abracadabra'));
arsort($freq);            // tri par fréquence décroissante, clés conservées
$top = array_key_first($freq); // 'a'`,
        bash: `# Fréquence des caractères d'une chaîne, du plus fréquent au moins fréquent
echo -n "abracadabra" | fold -w1 | sort | uniq -c | sort -rn`,
      },
    },
    {
      mnemo: '`freq.set(x, (freq.get(x) ?? 0) + 1)` : la ligne à savoir écrire sans réfléchir. Alphabet fixe → tableau de 26 cases.',
      piege: '`freq.set(x, freq.get(x) + 1)` sans valeur par défaut : `undefined + 1` donne `NaN`, et tous les compteurs deviennent `NaN` sans la moindre erreur.',
    },

    { h: 'Le complément « déjà vu » (famille two-sum)', id: 'hachage-complement' },
    {
      p: 'Pour chercher une paire qui vérifie une relation (somme, différence, produit), on parcourt le tableau une fois en se demandant, pour chaque élément `x` : « ai-je **déjà vu** l’élément qui me complète ? ». La table contient uniquement les éléments **à gauche** de la position courante, ce qui garantit `i < j` et empêche un élément de s’apparier avec lui-même. On passe ainsi de O(n²) à O(n).',
    },
    {
      list: [
        '**Que stocker comme valeur ?** L’indice (pour renvoyer la paire), un compteur (pour compter les paires), un booléen (pour l’existence).',
        '**Ordre des opérations** : d’abord interroger la table, ensuite y ajouter l’élément courant.',
        '**Variantes** : paires de différence k (chercher `x − k` et `x + k`), paires dont la somme est divisible par k (chercher le reste complémentaire), « contains duplicate II » (table valeur → dernier indice vu).',
      ],
    },
    {
      title: 'Compter les paires de somme donnée en un passage',
      code: `function countPairs(nums, target) {
  const seen = new Map() // valeur → nombre d'occurrences déjà vues
  let count = 0
  for (const x of nums) {
    count += seen.get(target - x) ?? 0 // d'abord chercher le complément
    seen.set(x, (seen.get(x) ?? 0) + 1) // ensuite enregistrer x
  }
  return count
}

countPairs([1, 5, 7, -1, 5], 6) // → 3
countPairs([3, 3, 3], 6) // → 3
countPairs([3], 6) // → 0`,
      equiv: {
        python: `from collections import defaultdict

def count_pairs(nums, target):
    seen = defaultdict(int)
    count = 0
    for x in nums:
        count += seen[target - x]
        seen[x] += 1
    return count`,
        java: `static long countPairs(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    long count = 0;
    for (int x : nums) {
        count += seen.getOrDefault(target - x, 0);
        seen.merge(x, 1, Integer::sum);
    }
    return count;
}`,
      },
    },
    {
      mnemo: '« Chercher avant d’enregistrer. » La table ne contient que le passé.',
      piege: 'Enregistrer `x` avant de chercher son complément : avec `target = 6` et `x = 3`, l’élément s’apparie avec lui-même.',
    },

    { h: 'Regrouper par clé canonique', id: 'hachage-regroupement' },
    {
      p: 'Pour regrouper des éléments « équivalents », on calcule pour chacun une **clé canonique** identique pour tous les membres d’une même classe, puis on regroupe dans une `Map` clé → liste. Tout l’art est dans le choix de la clé : mots triés pour les anagrammes, signature de comptage, suite des écarts entre lettres, forme normalisée d’une forme géométrique.',
    },
    {
      title: 'Regrouper les anagrammes',
      code: `function groupBy(items, keyOf) {
  const groups = new Map()
  for (const item of items) {
    const key = keyOf(item)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(item)
  }
  return [...groups.values()]
}

// clé 1 : lettres triées, O(k log k) par mot
const sortedKey = (w) => [...w].sort().join('')

// clé 2 : signature de comptage sur 26 lettres, O(k) par mot
function countKey(w) {
  const counts = new Array(26).fill(0)
  for (const ch of w) counts[ch.charCodeAt(0) - 97]++
  return counts.join('#')
}

const words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']
groupBy(words, sortedKey) // → [ [ 'eat', 'tea', 'ate' ], [ 'tan', 'nat' ], [ 'bat' ] ]
groupBy(words, countKey).length // → 3
sortedKey('tea') // → 'aet'`,
      equiv: {
        python: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        groups[''.join(sorted(w))].append(w)   # ou tuple(compteurs) comme clé
    return list(groups.values())`,
        java: `static List<List<String>> groupAnagrams(String[] words) {
    Map<String, List<String>> groups = new LinkedHashMap<>();
    for (String w : words) {
        char[] chars = w.toCharArray();
        Arrays.sort(chars);
        groups.computeIfAbsent(new String(chars), k -> new ArrayList<>()).add(w);
    }
    return new ArrayList<>(groups.values());
}`,
        rust: `use std::collections::HashMap;

fn group_anagrams(words: Vec<String>) -> Vec<Vec<String>> {
    let mut groups: HashMap<Vec<char>, Vec<String>> = HashMap::new();
    for w in words {
        let mut key: Vec<char> = w.chars().collect();
        key.sort_unstable();
        groups.entry(key).or_default().push(w);
    }
    groups.into_values().collect() // ordre non garanti
}`,
        php: `function groupAnagrams(array $words): array {
    $groups = [];
    foreach ($words as $w) {
        $chars = str_split($w);
        sort($chars);
        $groups[implode('', $chars)][] = $w;
    }
    return array_values($groups);
}`,
      },
    },
    {
      mnemo: '« Même classe ⇔ même clé. » Trouver la bonne clé canonique, puis `Map` clé → liste.',
      piege: 'Construire la clé de comptage sans séparateur : `[1, 11].join(\'\')` et `[11, 1].join(\'\')` donnent tous deux `\'111\'`. Utilisez un séparateur (`#`, `,`) pour que la clé soit sans ambiguïté.',
    },

    { h: 'Sommes préfixes + Map : sous-tableaux de somme k', id: 'hachage-prefixe-map' },
    {
      p: 'La somme du sous-tableau `nums[i..j]` vaut `prefix[j + 1] − prefix[i]`. Chercher les sous-tableaux de somme k qui se terminent en j revient donc à compter les préfixes antérieurs égaux à `prefix − k` : c’est un two-sum sur les sommes préfixes. On initialise la table avec `{0: 1}` pour compter les sous-tableaux qui commencent à l’indice 0. Contrairement à la fenêtre glissante, cette méthode fonctionne **avec des nombres négatifs**.',
    },
    {
      title: 'Nombre de sous-tableaux de somme k',
      code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]) // le préfixe vide
  let prefix = 0
  let count = 0
  for (const x of nums) {
    prefix += x
    count += seen.get(prefix - k) ?? 0
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1)
  }
  return count
}

subarraySum([1, 1, 1], 2) // → 2
subarraySum([3, 4, 7, 2, -3, 1, 4, 2], 7) // → 4
subarraySum([1, -1, 0], 0) // → 3`,
      equiv: {
        python: `from collections import defaultdict

def subarray_sum(nums, k):
    seen = defaultdict(int)
    seen[0] = 1
    prefix = count = 0
    for x in nums:
        prefix += x
        count += seen[prefix - k]
        seen[prefix] += 1
    return count`,
        java: `static int subarraySum(int[] nums, int k) {
    Map<Long, Integer> seen = new HashMap<>();
    seen.put(0L, 1);
    long prefix = 0;
    int count = 0;
    for (int x : nums) {
        prefix += x;
        count += seen.getOrDefault(prefix - k, 0);
        seen.merge(prefix, 1, Integer::sum);
    }
    return count;
}`,
        rust: `use std::collections::HashMap;

fn subarray_sum(nums: &[i64], k: i64) -> usize {
    let mut seen: HashMap<i64, usize> = HashMap::from([(0, 1)]);
    let (mut prefix, mut count) = (0, 0);
    for &x in nums {
        prefix += x;
        count += seen.get(&(prefix - k)).copied().unwrap_or(0);
        *seen.entry(prefix).or_insert(0) += 1;
    }
    count
}`,
      },
    },
    {
      list: [
        '**Plus long sous-tableau de somme k** : stocker le **premier** indice de chaque préfixe (ne pas l’écraser) et maximiser `j − premierIndice[prefix − k]`.',
        '**Somme divisible par k** : la clé devient le reste `((prefix % k) + k) % k`, et deux préfixes de même reste délimitent un sous-tableau divisible.',
        '**Autant de 0 que de 1** : remplacer les 0 par −1, puis chercher le plus long sous-tableau de somme 0.',
      ],
    },
    {
      mnemo: '« Préfixe − k déjà vu ? » Initialiser avec `[[0, 1]]` (ou `[[0, -1]]` pour les longueurs).',
      piege: 'Oublier le préfixe vide `0 → 1` : tous les sous-tableaux qui commencent à l’indice 0 sont manqués. Et en JavaScript, `-7 % 5` vaut `-2` : normalisez le reste avant de l’utiliser comme clé.',
    },

    { h: 'Clés composites et encodage', id: 'hachage-cles-composites' },
    {
      p: 'Une `Map` compare ses clés objets **par référence** : deux tableaux `[1, 2]` créés séparément sont deux clés différentes. Pour indexer une paire, une case de grille ou un état, on la **sérialise** en une valeur primitive : une chaîne (`r + \',\' + c`, ou le gabarit `\`${r},${c}\``), ou un entier unique (`r * cols + c`, plus rapide et plus économe). Pour un état plus riche (position, direction, clés ramassées), on combine plusieurs champs avec des séparateurs, ou par décalages de bits.',
    },
    {
      title: 'Tableaux comme clés : le piège et deux solutions',
      code: `const visited = new Set()
visited.add([1, 2])
visited.has([1, 2]) // → false

const key = (r, c) => r + ',' + c
visited.add(key(1, 2))
visited.has(key(1, 2)) // → true

const COLS = 1000
const encode = (r, c) => r * COLS + c
const decode = (id) => [Math.floor(id / COLS), id % COLS]
encode(3, 7) // → 3007
decode(3007) // → [ 3, 7 ]`,
      equiv: {
        python: `# Les tuples sont hachables : clé composite native.
visited = set()
visited.add((1, 2))
(1, 2) in visited   # True (une liste [1, 2] lèverait TypeError: unhashable)`,
        java: `// record (Java 16+) : equals et hashCode générés automatiquement
record Cell(int r, int c) {}

Set<Cell> visited = new HashSet<>();
visited.add(new Cell(1, 2));
visited.contains(new Cell(1, 2)); // true
// Attention : un int[] comme clé est comparé par référence, comme en JS.`,
        rust: `use std::collections::HashSet;

// Les tuples implémentent Hash et Eq : clé composite native.
let mut visited: HashSet<(i32, i32)> = HashSet::new();
visited.insert((1, 2));
visited.contains(&(1, 2)); // true`,
        php: `$visited = [];
$visited["1,2"] = true;   // clé chaîne
isset($visited["1,2"]);   // true`,
      },
    },
    {
      mnemo: 'Objet comme clé = référence. Pour une valeur : chaîne avec séparateur, ou entier `r * cols + c`.',
      piege: 'Une clé chaîne sans séparateur est ambiguë : `1 + \'\' + 12` et `11 + \'\' + 2` donnent tous deux `\'112\'`. Et l’encodage entier `r * cols + c` exige `0 ≤ c < cols`.',
    },
  ],
  mnemo: 'Une question « ai-je déjà vu… ? » ou « combien de… ? » appelle une table de hachage. Fréquences, complément, clé canonique, préfixe + Map, clé composite : cinq gabarits couvrent presque tout.',
  piege: '« O(1) » sans « en moyenne », `undefined + 1 = NaN` dans un compteur, enregistrer avant de chercher, oublier le préfixe vide, et des tableaux utilisés comme clés de `Map` ou de `Set`.',
})

katas.push(
  {
    id: 'fo-anagramme',
    title: 'Anagramme valide',
    difficulty: 'facile',
    theme: 'hachage',
    pattern: 'comptage de fréquences',
    statement: `Écrivez \`isAnagram(s, t)\` qui indique si \`t\` est une **anagramme** de \`s\` : les deux chaînes contiennent exactement les mêmes caractères, avec les mêmes multiplicités, dans un ordre quelconque. La comparaison est sensible à la casse et tous les caractères comptent (espaces compris).

Exemples :

- \`isAnagram('anagram', 'nagaram')\` donne \`true\` ;
- \`isAnagram('rat', 'car')\` donne \`false\` ;
- \`isAnagram('aab', 'abb')\` donne \`false\`.

Contraintes : longueurs jusqu'à 10⁵. Visez O(n) (le tri en O(n log n) est accepté, mais présentez la version linéaire).`,
    starter: `function isAnagram(s, t) {
  // TODO : comparer les fréquences
  return s.length === t.length
}`,
    solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false
  const freq = new Map()
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1)
  for (const ch of t) {
    const n = freq.get(ch) ?? 0
    if (n === 0) return false // ch en trop dans t
    freq.set(ch, n - 1)
  }
  return true // mêmes longueurs et aucun excès : tout s'annule
}`,
    solutionEquiv: {
      python: `from collections import Counter

def is_anagram(s, t):
    return len(s) == len(t) and Counter(s) == Counter(t)`,
      java: `static boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    Map<Character, Integer> freq = new HashMap<>();
    for (char ch : s.toCharArray()) freq.merge(ch, 1, Integer::sum);
    for (char ch : t.toCharArray()) {
        int n = freq.getOrDefault(ch, 0);
        if (n == 0) return false;
        freq.put(ch, n - 1);
    }
    return true;
}`,
      rust: `use std::collections::HashMap;

fn is_anagram(s: &str, t: &str) -> bool {
    if s.chars().count() != t.chars().count() {
        return false;
    }
    let mut freq: HashMap<char, i32> = HashMap::new();
    for ch in s.chars() {
        *freq.entry(ch).or_insert(0) += 1;
    }
    for ch in t.chars() {
        let n = freq.entry(ch).or_insert(0);
        if *n == 0 {
            return false;
        }
        *n -= 1;
    }
    true
}`,
      php: `function isAnagram(string $s, string $t): bool {
    // count_chars compte des octets : pour de l'UTF-8, comparer plutôt
    // array_count_values(mb_str_split($s)) et array_count_values(mb_str_split($t))
    return count_chars($s, 1) == count_chars($t, 1);
}`,
    },
    tests: [
      { name: 'exemple positif', code: `assertEqual(isAnagram('anagram', 'nagaram'), true)` },
      { name: 'mêmes longueurs, lettres différentes', code: `assertEqual(isAnagram('rat', 'car'), false)` },
      { name: 'multiplicités différentes', code: `assertEqual(isAnagram('aab', 'abb'), false)` },
      { name: 'chaînes vides et longueurs différentes', code: `assertEqual(isAnagram('', ''), true)
assertEqual(isAnagram('a', 'ab'), false)` },
      { name: 'casse et espaces comptent', code: `assertEqual(isAnagram('Chien', 'niche'), false)
assertEqual(isAnagram('a b', 'ba '), true)` },
      { name: 'un seul caractère', code: `assertEqual(isAnagram('x', 'x'), true)
assertEqual(isAnagram('x', 'y'), false)` },
    ],
    hints: [
      'Deux anagrammes ont la même longueur et la même table de fréquences.',
      'Comptez les caractères de `s` dans une `Map`, puis décrémentez avec ceux de `t`.',
      'Si un compteur tomberait sous zéro, `t` contient un caractère en trop : réponse `false`. Avec des longueurs égales, aucun excès implique aucun manque.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(σ) en mémoire où σ est le nombre de caractères distincts (O(1) pour un alphabet fixe).

**Alternatives** :

- trier les deux chaînes et comparer : O(n log n), une ligne (\`[...s].sort().join('') === [...t].sort().join('')\`) ;
- si l'énoncé garantit 26 lettres minuscules, un tableau \`new Array(26).fill(0)\` indexé par \`charCodeAt(0) - 97\` est plus rapide qu'une \`Map\`.

**Questions de suivi** :

- « et pour de l'Unicode ? » : \`for...of\` parcourt les points de code (un emoji compte pour un caractère), mais les caractères composés (« é » écrit e + accent combinant) nécessitent \`normalize('NFC')\` d'abord ;
- variantes : regrouper des anagrammes (clé canonique), trouver toutes les anagrammes de \`p\` dans \`s\` (fenêtre glissante de taille fixe avec comptage), « ransom note » (peut-on écrire une lettre avec les caractères d'un magazine).`,
  },
  {
    id: 'fo-two-sum',
    title: 'Two Sum',
    difficulty: 'facile',
    theme: 'hachage',
    pattern: 'complément déjà vu (Map)',
    statement: `Écrivez \`twoSum(nums, target)\` qui renvoie les indices \`[i, j]\` (avec \`i < j\`) de deux éléments **distincts** de \`nums\` (non trié) dont la somme vaut \`target\`.

- s'il existe plusieurs solutions, renvoyez celle dont le **second indice \`j\` est le plus petit**, puis, à \`j\` égal, le plus petit \`i\` (c'est ce que donne un parcours de gauche à droite qui garde le premier indice de chaque valeur) ;
- s'il n'y a pas de solution, renvoyez \`null\`.

Exemples :

- \`twoSum([2, 7, 11, 15], 9)\` donne \`[0, 1]\` ;
- \`twoSum([3, 2, 4], 6)\` donne \`[1, 2]\` ;
- \`twoSum([3, 3], 6)\` donne \`[0, 1]\`.

Contraintes : \`n ≤ 2 × 10⁵\`. Visez **O(n)**.`,
    starter: `function twoSum(nums, target) {
  // TODO : une Map valeur → indice
  return null
}`,
    solution: `function twoSum(nums, target) {
  const seen = new Map() // valeur → premier indice
  for (let j = 0; j < nums.length; j++) {
    const need = target - nums[j]
    if (seen.has(need)) return [seen.get(need), j] // chercher d'abord
    if (!seen.has(nums[j])) seen.set(nums[j], j) // puis enregistrer (premier indice seulement)
  }
  return null
}`,
    solutionEquiv: {
      python: `def two_sum(nums, target):
    seen = {}
    for j, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], j]
        seen.setdefault(x, j)
    return None`,
      java: `static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int j = 0; j < nums.length; j++) {
        Integer i = seen.get(target - nums[j]);
        if (i != null) return new int[] { i, j };
        seen.putIfAbsent(nums[j], j);
    }
    return null;
}`,
      rust: `use std::collections::HashMap;

fn two_sum(nums: &[i64], target: i64) -> Option<(usize, usize)> {
    let mut seen: HashMap<i64, usize> = HashMap::new();
    for (j, &x) in nums.iter().enumerate() {
        if let Some(&i) = seen.get(&(target - x)) {
            return Some((i, j));
        }
        seen.entry(x).or_insert(j);
    }
    None
}`,
      php: `function twoSum(array $nums, int $target): ?array {
    $seen = [];
    foreach ($nums as $j => $x) {
        $need = $target - $x;
        if (isset($seen[$need])) return [$seen[$need], $j];
        if (!isset($seen[$x])) $seen[$x] = $j;
    }
    return null;
}`,
    },
    tests: [
      { name: 'exemple classique', code: `assertEqual(twoSum([2, 7, 11, 15], 9), [0, 1])` },
      { name: 'paire non adjacente', code: `assertEqual(twoSum([3, 2, 4], 6), [1, 2])` },
      { name: 'doublons', code: `assertEqual(twoSum([3, 3], 6), [0, 1])
assertEqual(twoSum([1, 3, 3, 3], 6), [1, 2])` },
      { name: 'un élément ne compte pas deux fois', code: `assertEqual(twoSum([3, 1], 6), null)` },
      { name: 'négatifs et zéro', code: `assertEqual(twoSum([-4, 0, 5, 4], 0), [0, 3])
assertEqual(twoSum([0, 4, 0], 0), [0, 2])` },
      { name: 'vide, un élément, aucune solution', code: `assertEqual(twoSum([], 1), null)
assertEqual(twoSum([5], 5), null)
assertEqual(twoSum([1, 2], 7), null)` },
      { name: 'plusieurs solutions : plus petit j', code: `assertEqual(twoSum([1, 4, 2, 3], 5), [0, 1])
assertEqual(twoSum([2, 5, 3, 0, 3], 5), [0, 2])` },
      {
        name: 'grande entrée (n = 200 000)',
        code: `const n = 200000
const nums = []
for (let i = 0; i < n; i++) nums.push(2 * i)
const t0 = performance.now()
const r = twoSum(nums, 4 * n - 6) // seule paire : les deux derniers
const elapsed = performance.now() - t0
assertEqual(r, [n - 2, n - 1])
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms pour n = 200 000 (visez O(n))')`,
      },
    ],
    hints: [
      'La force brute teste toutes les paires : O(n²). Pour chaque `nums[j]`, quelle valeur cherchez-vous exactement ?',
      'Gardez dans une `Map` les valeurs déjà vues et leur indice : `target − nums[j]` y est-elle ?',
      'Cherchez **avant** d’enregistrer `nums[j]`, et n’écrasez pas l’indice d’une valeur déjà présente (pour garder le plus petit `i`).',
    ],
    discussion: `**Complexité** : O(n) en temps en moyenne, O(n) en mémoire.

**Points à évoquer** :

- force brute O(n²) / O(1) : le compromis temps-mémoire classique ;
- trier puis deux pointeurs : O(n log n), mais on perd les indices d'origine (trier des paires \`[valeur, indice]\`) ;
- pourquoi une \`Map\` et pas un objet : les clés restent des nombres, pas de clés héritées, pas de conversion ;
- dans le pire cas théorique (collisions massives), la table de hachage dégrade à O(n²) ; en pratique et en entretien, on annonce O(n) **en moyenne**.

**Suites classiques** : compter toutes les paires (compteurs au lieu d'indices), Two Sum sur un flux (classe avec \`add\` et \`find\`), 3Sum (trier + deux pointeurs), Two Sum dans un BST (parcours + \`Set\`, ou deux itérateurs).`,
  },
  {
    id: 'fo-groupes-decales',
    title: 'Regrouper les chaînes décalées',
    difficulty: 'moyen',
    theme: 'hachage',
    pattern: 'regroupement par clé canonique',
    statement: `Décaler une chaîne consiste à remplacer chaque lettre par la suivante dans l'alphabet, \`z\` devenant \`a\` : \`abc\` → \`bcd\` → … → \`xyz\` → \`yza\`. Deux chaînes appartiennent au même groupe si l'on peut passer de l'une à l'autre par des décalages successifs.

Écrivez \`groupShifted(strings)\` qui regroupe les chaînes (lettres minuscules, non vides) :

- les groupes apparaissent dans l'ordre de la **première apparition** de l'un de leurs membres ;
- à l'intérieur d'un groupe, les chaînes gardent l'ordre de l'entrée (doublons compris).

Exemple : \`groupShifted(['abc', 'bcd', 'acef', 'xyz', 'az', 'ba', 'a', 'z'])\` donne \`[['abc', 'bcd', 'xyz'], ['acef'], ['az', 'ba'], ['a', 'z']]\`.

Contraintes : jusqu'à 10⁴ chaînes de longueur au plus 50. Visez O(total des longueurs).`,
    starter: `function groupShifted(strings) {
  // TODO : quelle clé est identique pour toutes les chaînes d'un groupe ?
  return strings.map((s) => [s])
}`,
    solution: `function groupShifted(strings) {
  const groups = new Map()
  for (const s of strings) {
    // clé : écarts successifs entre lettres, modulo 26 (invariants par décalage)
    let key = ''
    for (let i = 1; i < s.length; i++) {
      const gap = (s.charCodeAt(i) - s.charCodeAt(i - 1) + 26) % 26
      key += gap + ','
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(s)
  }
  return [...groups.values()]
}`,
    solutionEquiv: {
      python: `def group_shifted(strings):
    groups = {}  # dict : ordre d'insertion conservé
    for s in strings:
        key = tuple((ord(s[i]) - ord(s[i - 1])) % 26 for i in range(1, len(s)))
        groups.setdefault(key, []).append(s)
    return list(groups.values())`,
      java: `static List<List<String>> groupShifted(String[] strings) {
    Map<String, List<String>> groups = new LinkedHashMap<>();
    for (String s : strings) {
        StringBuilder key = new StringBuilder();
        for (int i = 1; i < s.length(); i++) {
            int gap = (s.charAt(i) - s.charAt(i - 1) + 26) % 26;
            key.append(gap).append(',');
        }
        groups.computeIfAbsent(key.toString(), k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}`,
      rust: `use std::collections::HashMap;

fn group_shifted(strings: &[&str]) -> Vec<Vec<String>> {
    let mut index: HashMap<Vec<u8>, usize> = HashMap::new(); // clé → numéro de groupe
    let mut groups: Vec<Vec<String>> = Vec::new();
    for s in strings {
        let b = s.as_bytes();
        let key: Vec<u8> = (1..b.len()).map(|i| (b[i] + 26 - b[i - 1]) % 26).collect();
        let g = *index.entry(key).or_insert_with(|| {
            groups.push(Vec::new());
            groups.len() - 1
        });
        groups[g].push(s.to_string());
    }
    groups
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `assertEqual(groupShifted(['abc', 'bcd', 'acef', 'xyz', 'az', 'ba', 'a', 'z']), [['abc', 'bcd', 'xyz'], ['acef'], ['az', 'ba'], ['a', 'z']])` },
      { name: 'liste vide', code: `assertEqual(groupShifted([]), [])` },
      { name: 'un seul élément', code: `assertEqual(groupShifted(['hello']), [['hello']])` },
      { name: 'doublons et passage par z', code: `assertEqual(groupShifted(['ab', 'ba', 'ab', 'zab']), [['ab', 'ab'], ['ba'], ['zab']])` },
      { name: 'longueurs différentes jamais groupées', code: `assertEqual(groupShifted(['a', 'aa', 'bb', 'b']), [['a', 'b'], ['aa', 'bb']])` },
      { name: 'clé non ambiguë', code: `assertEqual(groupShifted(['abl', 'alm']).length, 2)` },
    ],
    hints: [
      'Décaler une chaîne ne change pas l’**écart** entre deux lettres consécutives (modulo 26).',
      'Clé canonique : la suite des écarts `(code[i] − code[i − 1] + 26) % 26`. `az` et `ba` ont toutes deux l’écart 25.',
      'Séparez les écarts dans la clé (par exemple avec des virgules), sinon `1,11` et `11,1` donnent la même chaîne. Une `Map` conserve l’ordre de première insertion.',
    ],
    discussion: `**Complexité** : O(L) en temps et en mémoire, où L est la somme des longueurs (chaque caractère est lu une fois et la clé a la longueur de la chaîne).

**Points à évoquer** :

- autre clé possible : décaler chaque chaîne pour qu'elle commence par \`a\` (\`ycd\` → \`aef\`), puis utiliser cette chaîne normalisée comme clé ;
- le \`+ 26\` évite les écarts négatifs : en JavaScript, \`%\` garde le signe du dividende ;
- l'ordre des groupes est garanti parce qu'une \`Map\` itère dans l'ordre d'insertion ; en Java, il faut une \`LinkedHashMap\`, et en Rust un vecteur de groupes plus un index ;
- même famille : anagrammes (lettres triées ou signature de comptage), « isomorphic strings » (motif des premières occurrences), formes d'îles distinctes dans une grille (suite des déplacements normalisée).`,
  },
  {
    id: 'fo-somme-divisible',
    title: 'Sous-tableaux de somme divisible par k',
    difficulty: 'moyen',
    theme: 'hachage',
    pattern: 'somme préfixe + Map (restes)',
    statement: `Écrivez \`subarraysDivByK(nums, k)\` qui renvoie le nombre de sous-tableaux **non vides et contigus** de \`nums\` dont la somme est divisible par \`k\`.

Exemples :

- \`subarraysDivByK([4, 5, 0, -2, -3, 1], 5)\` donne \`7\` ;
- \`subarraysDivByK([5], 9)\` donne \`0\` ;
- \`subarraysDivByK([-5], 5)\` donne \`1\`.

Contraintes : \`1 ≤ n ≤ 2 × 10⁵\`, \`-10⁴ ≤ nums[i] ≤ 10⁴\`, \`2 ≤ k ≤ 10⁴\`. Les valeurs peuvent être négatives. Visez O(n).`,
    starter: `function subarraysDivByK(nums, k) {
  // TODO : deux préfixes de même reste délimitent un sous-tableau divisible
  return 0
}`,
    solution: `function subarraysDivByK(nums, k) {
  const count = new Map([[0, 1]]) // reste du préfixe vide
  let prefix = 0
  let total = 0
  for (const x of nums) {
    prefix += x
    const r = ((prefix % k) + k) % k // reste toujours dans [0, k)
    total += count.get(r) ?? 0
    count.set(r, (count.get(r) ?? 0) + 1)
  }
  return total
}`,
    solutionEquiv: {
      python: `def subarrays_div_by_k(nums, k):
    count = [0] * k
    count[0] = 1
    prefix = total = 0
    for x in nums:
        prefix += x
        r = prefix % k        # en Python, % renvoie déjà un reste positif
        total += count[r]
        count[r] += 1
    return total`,
      java: `static long subarraysDivByK(int[] nums, int k) {
    long[] count = new long[k];
    count[0] = 1;
    long prefix = 0, total = 0;
    for (int x : nums) {
        prefix += x;
        int r = (int) (((prefix % k) + k) % k); // % Java garde le signe
        total += count[r];
        count[r]++;
    }
    return total;
}`,
      rust: `fn subarrays_div_by_k(nums: &[i64], k: i64) -> u64 {
    let mut count = vec![0u64; k as usize];
    count[0] = 1;
    let (mut prefix, mut total) = (0i64, 0u64);
    for &x in nums {
        prefix += x;
        let r = prefix.rem_euclid(k) as usize; // reste euclidien, toujours >= 0
        total += count[r];
        count[r] += 1;
    }
    total
}`,
      php: `function subarraysDivByK(array $nums, int $k): int {
    $count = [0 => 1];
    $prefix = $total = 0;
    foreach ($nums as $x) {
        $prefix += $x;
        $r = (($prefix % $k) + $k) % $k; // % PHP garde le signe
        $total += $count[$r] ?? 0;
        $count[$r] = ($count[$r] ?? 0) + 1;
    }
    return $total;
}`,
    },
    tests: [
      { name: 'exemple', code: `assertEqual(subarraysDivByK([4, 5, 0, -2, -3, 1], 5), 7)` },
      { name: 'un seul élément', code: `assertEqual(subarraysDivByK([5], 9), 0)
assertEqual(subarraysDivByK([9], 9), 1)` },
      { name: 'négatifs : reste à normaliser', code: `assertEqual(subarraysDivByK([-5], 5), 1)
assertEqual(subarraysDivByK([-1, 2, 9], 2), 2)` },
      { name: 'zéros', code: `assertEqual(subarraysDivByK([0, 0, 0], 3), 6)` },
      { name: 'aucun sous-tableau divisible', code: `assertEqual(subarraysDivByK([1, 1], 3), 0)` },
      {
        name: 'grande entrée (n = 200 000)',
        code: `let seed = 99
const big = []
for (let i = 0; i < 200000; i++) {
  seed = (seed * 1103515245 + 12345) % 2147483648
  big.push((seed % 20001) - 10000)
}
const t0 = performance.now()
const r = subarraysDivByK(big, 7)
const elapsed = performance.now() - t0
assertEqual(r, 2857098534)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms pour n = 200 000 (visez O(n))')`,
      },
    ],
    hints: [
      'La somme de `nums[i..j]` vaut `prefix[j + 1] − prefix[i]`. Quand cette différence est-elle divisible par k ?',
      'Exactement quand les deux préfixes ont le **même reste** modulo k. Comptez, pour chaque préfixe, combien de préfixes antérieurs ont le même reste.',
      'En JavaScript, `-7 % 5` vaut `-2` : normalisez avec `((p % k) + k) % k`. Et n’oubliez pas le préfixe vide, de reste 0.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(k) en mémoire (au plus k restes distincts ; un tableau de taille k remplace avantageusement la \`Map\`).

**Points à évoquer** :

- la force brute sur toutes les paires \`(i, j)\` est en O(n²) : 2 × 10¹⁰ opérations ici ;
- ce n'est pas une fenêtre glissante : avec des négatifs, aucune monotonie ;
- le piège du **reste négatif** est propre à JavaScript, Java, C et PHP ; Python (\`%\`) et Rust (\`rem_euclid\`) donnent directement un reste positif ;
- le résultat peut dépasser 2³¹ (jusqu'à n(n + 1)/2 ≈ 2 × 10¹⁰) : entier 64 bits en Java et en Rust ;
- variante « continuous subarray sum » (LeetCode 523, longueur ≥ 2) : stocker le **premier indice** de chaque reste plutôt qu'un compteur.`,
  },
  {
    id: 'fo-sequence-consecutive',
    title: 'Plus longue séquence consécutive',
    difficulty: 'difficile',
    theme: 'hachage',
    pattern: 'Set + départs de séquence',
    statement: `Écrivez \`longestConsecutive(nums)\` qui renvoie la longueur de la plus longue suite d'entiers **consécutifs** (x, x + 1, x + 2, …) dont toutes les valeurs apparaissent dans \`nums\`, quel que soit leur ordre dans le tableau.

Exemples :

- \`longestConsecutive([100, 4, 200, 1, 3, 2])\` donne \`4\` (1, 2, 3, 4) ;
- \`longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])\` donne \`9\` ;
- \`longestConsecutive([])\` donne \`0\`.

Contraintes : \`n ≤ 2 × 10⁵\`, valeurs entre \`-10⁹\` et \`10⁹\`. Le tri donne O(n log n) ; on demande **O(n)**.`,
    starter: `function longestConsecutive(nums) {
  // TODO : O(n) avec un Set
  return 0
}`,
    solution: `function longestConsecutive(nums) {
  const values = new Set(nums)
  let best = 0
  for (const x of values) {
    if (values.has(x - 1)) continue // x n'est pas le début d'une séquence
    let length = 1
    while (values.has(x + length)) length++
    if (length > best) best = length
  }
  return best
}`,
    solutionEquiv: {
      python: `def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue
        length = 1
        while x + length in values:
            length += 1
        best = max(best, length)
    return best`,
      java: `static int longestConsecutive(int[] nums) {
    Set<Integer> values = new HashSet<>();
    for (int x : nums) values.add(x);
    int best = 0;
    for (int x : values) {
        if (values.contains(x - 1)) continue;
        int length = 1;
        while (values.contains(x + length)) length++;
        best = Math.max(best, length);
    }
    return best;
}`,
      rust: `use std::collections::HashSet;

fn longest_consecutive(nums: &[i64]) -> usize {
    let values: HashSet<i64> = nums.iter().copied().collect();
    let mut best = 0;
    for &x in &values {
        if values.contains(&(x - 1)) {
            continue;
        }
        let mut length = 1;
        while values.contains(&(x + length as i64)) {
            length += 1;
        }
        best = best.max(length);
    }
    best
}`,
      php: `function longestConsecutive(array $nums): int {
    $values = array_flip($nums);
    $best = 0;
    foreach ($values as $x => $_) {
        if (isset($values[$x - 1])) continue;
        $length = 1;
        while (isset($values[$x + $length])) $length++;
        $best = max($best, $length);
    }
    return $best;
}`,
    },
    tests: [
      { name: 'exemples', code: `assertEqual(longestConsecutive([100, 4, 200, 1, 3, 2]), 4)
assertEqual(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 9)` },
      { name: 'vide et un seul élément', code: `assertEqual(longestConsecutive([]), 0)
assertEqual(longestConsecutive([42]), 1)` },
      { name: 'doublons', code: `assertEqual(longestConsecutive([1, 2, 0, 1]), 3)
assertEqual(longestConsecutive([5, 5, 5]), 1)` },
      { name: 'négatifs', code: `assertEqual(longestConsecutive([-1, -2, 0, 5, -3]), 4)` },
      { name: 'grands écarts', code: `assertEqual(longestConsecutive([1000000000, -1000000000, 999999999]), 2)` },
      {
        name: 'grande entrée (n = 200 000, une seule longue séquence)',
        code: `const n = 200000
const nums = []
for (let i = 0; i < n; i++) nums.push((i * 7919) % n) // permutation de 0..n-1
const t0 = performance.now()
const r = longestConsecutive(nums)
const elapsed = performance.now() - t0
assertEqual(r, n)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (chaque séquence doit être parcourue une seule fois)')`,
      },
    ],
    hints: [
      'Mettez toutes les valeurs dans un `Set` : « x + 1 est-il présent ? » devient O(1).',
      'Depuis chaque valeur, on peut compter la séquence qui en part… mais si on le fait pour toutes les valeurs, une séquence de longueur n est recomptée n fois : O(n²).',
      'Ne partez que des **débuts** de séquence : les `x` tels que `x − 1` n’est pas dans le `Set`. Chaque valeur est alors visitée au plus deux fois.',
    ],
    discussion: `**Complexité** : O(n) en temps en moyenne. La boucle \`while\` paraît imbriquée, mais elle ne s'exécute que depuis les débuts de séquence, et chaque valeur n'appartient qu'à une séquence : le total des tours de \`while\` est au plus n (analyse amortie). Mémoire : O(n) pour le \`Set\`.

**Points à évoquer** :

- le tri suivi d'un parcours est O(n log n), plus simple, et souvent suffisant ; le dire, puis proposer l'optimisation ;
- itérer sur le \`Set\` plutôt que sur \`nums\` évite de retraiter les doublons (sans changer la complexité grâce au test de début, mais c'est plus propre) ;
- **alternative** : union-find sur les valeurs (unir x et x + 1 s'ils sont présents), O(n α(n)), utile si les valeurs arrivent en flux ;
- variante : renvoyer la séquence elle-même (garder le meilleur début), ou la plus longue séquence consécutive dans un arbre binaire (DFS).`,
  },
)

quiz.push(
  {
    id: 'fo-q17',
    theme: 'hachage',
    kind: 'qcm',
    q: 'Pourquoi préférer une `Map` à un objet littéral pour compter des nombres en algorithmique ?',
    choices: [
      'Parce que `Map.get` est en O(log n) et l’accès à un objet en O(n)',
      'Parce que la `Map` garde des clés typées (1 et \'1\' sont distinctes), n’a pas de clés héritées et donne sa taille en O(1)',
      'Parce qu’un objet ne peut pas contenir plus de 2³² clés',
      'Parce que la `Map` trie automatiquement ses clés',
    ],
    answer: 1,
    why: 'Les deux structures sont des tables de hachage en O(1) en moyenne. La différence est sémantique : l’objet convertit ses clés en chaînes, hérite de `Object.prototype` (`constructor`, `toString`) et réordonne les clés entières. La `Map` conserve l’ordre d’insertion, ne trie pas, et expose `size`.',
  },
  {
    id: 'fo-q18',
    theme: 'hachage',
    kind: 'qcm',
    q: 'Quelle est la complexité de `set.has(x)` dans le **pire** cas théorique ?',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    answer: 2,
    why: 'Si toutes les clés tombent dans le même seau (collisions massives, fonction de hachage faible ou entrées malveillantes), la recherche parcourt ce seau : O(n). La complexité est O(1) **en moyenne**. Java atténue ce pire cas en transformant les longs seaux en arbres (O(log n)).',
  },
  {
    id: 'fo-q19',
    theme: 'hachage',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const counts = {}
for (const x of [1, '1', 1.0, true]) counts[x] = (counts[x] || 0) + 1
console.log(Object.keys(counts).length, counts['1'])`,
    choices: ['4 1', '2 3', '3 2', '2 2'],
    answer: 1,
    why: 'Les clés d’un objet sont converties en chaînes : `1`, `\'1\'` et `1.0` deviennent toutes `\'1\'`, et `true` devient `\'true\'`. Il reste deux clés, et `\'1\'` a été comptée trois fois. Avec une `Map`, on aurait trois clés distinctes (`1.0` est le même nombre que `1`).',
  },
  {
    id: 'fo-q20',
    theme: 'hachage',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const m = new Map()
m.set([1, 2], 'a')
m.set([1, 2], 'b')
console.log(m.size, m.get([1, 2]))`,
    choices: ['1 b', '2 undefined', '1 a', '2 b'],
    answer: 1,
    why: 'Une `Map` compare les clés objets **par référence**. Chaque littéral `[1, 2]` crée un nouveau tableau : deux clés distinctes, et le troisième `[1, 2]` n’en est aucune. Pour une clé composite, on sérialise : `r + \',\' + c`, ou `r * cols + c`.',
  },
  {
    id: 'fo-q21',
    theme: 'hachage',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction, pour n mots de longueur au plus k ?',
    code: `function groupAnagrams(words) {
  const groups = new Map()
  for (const w of words) {
    const key = [...w].sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(w)
  }
  return [...groups.values()]
}
groupAnagrams(['eat', 'tea', 'tan'])`,
    choices: ['O(n)', 'O(n log n)', 'O(n · k log k)', 'O(n² · k)'],
    answer: 2,
    why: 'Pour chaque mot, le tri des lettres coûte O(k log k), et le hachage de la clé O(k). Total : O(n · k log k). Avec une signature de comptage sur 26 lettres, on descend à O(n · k). Oublier le coût de la clé (« O(n) parce que la Map est en O(1) ») est l’erreur classique.',
  },
  {
    id: 'fo-q22',
    theme: 'hachage',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de ce code (n = `a.length`, m = `b.length`) ?',
    code: `function common(a, b) {
  const result = []
  for (const x of a) {
    if (new Set(b).has(x)) result.push(x)
  }
  return result
}
common([1, 2, 3], [2, 3, 4])`,
    choices: ['O(n + m)', 'O(n · m)', 'O(n log m)', 'O(n)'],
    answer: 1,
    why: 'Le `Set` est reconstruit à **chaque** tour de boucle, ce qui coûte O(m) : O(n · m) au total, pire qu’un simple `includes`. Il faut le construire une seule fois avant la boucle pour obtenir O(n + m).',
  },
  {
    id: 'fo-q23',
    theme: 'hachage',
    kind: 'bug',
    q: 'Ce compteur de fréquences renvoie une `Map` remplie de `NaN`. Pourquoi ?',
    code: `function frequencies(items) {
  const freq = new Map()
  for (const x of items) freq.set(x, freq.get(x) + 1)
  return freq
}
frequencies(['a', 'b', 'a'])`,
    choices: [
      '`for...of` ne fonctionne pas sur un tableau de chaînes',
      'À la première rencontre, `freq.get(x)` vaut `undefined`, et `undefined + 1` donne `NaN`, qui se propage',
      '`Map.set` ne peut pas écraser une clé existante',
      'Les clés chaînes doivent être converties avec `String(x)`',
    ],
    answer: 1,
    why: 'Il manque la valeur par défaut : `freq.set(x, (freq.get(x) ?? 0) + 1)`. Ensuite, `NaN + 1` reste `NaN`, sans aucune erreur. En Python, `defaultdict(int)` ou `Counter` évitent ce piège ; en Java, `merge(x, 1, Integer::sum)`.',
  },
  {
    id: 'fo-q24',
    theme: 'hachage',
    kind: 'bug',
    q: '`twoSum([3, 1], 6)` devrait renvoyer `null`. Que renvoie cette version, et pourquoi ?',
    code: `function twoSum(nums, target) {
  const seen = new Map()
  for (let i = 0; i < nums.length; i++) {
    seen.set(nums[i], i)
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]
  }
  return null
}
twoSum([3, 1], 6)`,
    choices: [
      '`[0, 0]` : l’élément est enregistré avant la recherche, et 3 s’apparie avec lui-même',
      '`null` : la fonction est correcte',
      '`[0, 1]` : l’indice est mal calculé',
      'Une erreur, car `seen.get` renvoie `undefined`',
    ],
    answer: 0,
    why: 'Avec `target = 6` et `nums[0] = 3`, le complément est 3, qui vient d’être ajouté : la fonction renvoie `[0, 0]`. Il faut chercher le complément **avant** d’enregistrer l’élément courant, pour que la table ne contienne que les éléments situés à gauche.',
  },
)

pieges.push(
  {
    id: 'fo-p7',
    title: 'Un objet comme clé d’un objet',
    theme: 'hachage',
    question: 'On veut mémoriser un résultat par objet. Qu’affiche ce code ?',
    code: `const cache = {}
const a = { id: 1 }
const b = { id: 2 }
cache[a] = 'A'
cache[b] = 'B'
console.log(cache[a])
console.log(Object.keys(cache))`,
    output: `B
[ '[object Object]' ]`,
    explanation: 'Une clé d’objet est convertie en chaîne : tout objet ordinaire devient `\'[object Object]\'`. Les deux affectations écrivent donc dans la **même** case, et `cache[a]` renvoie `\'B\'`. Avec une `Map`, les objets sont des clés à part entière (comparées par référence) ; pour comparer par valeur, on sérialise une clé (par exemple `obj.id`).',
    fix: {
      code: `const cache = new Map()
const a = { id: 1 }
const b = { id: 2 }
cache.set(a, 'A')
cache.set(b, 'B')
console.log(cache.get(a), cache.size)`,
      output: `A 2`,
    },
  },
  {
    id: 'fo-p8',
    title: 'Ordre des clés numériques dans un objet',
    theme: 'hachage',
    question: 'On veut les mots dans l’ordre de leur première apparition. Qu’affiche ce code ?',
    code: `const firstSeen = {}
for (const word of ['b', '10', 'a', '2']) firstSeen[word] = true
console.log(Object.keys(firstSeen))`,
    output: `[ '2', '10', 'b', 'a' ]`,
    explanation: 'Les objets JavaScript énumèrent d’abord les clés qui ressemblent à des **indices de tableau** (entiers positifs), dans l’ordre numérique croissant, puis les autres chaînes dans l’ordre d’insertion. Un algorithme qui compte sur l’ordre d’insertion (premier caractère unique, groupes dans l’ordre d’apparition) se trompe dès que des clés sont numériques. `Map` et `Set` garantissent l’ordre d’insertion pour tous les types de clés.',
    fix: {
      code: `const firstSeen = new Map()
for (const word of ['b', '10', 'a', '2']) firstSeen.set(word, true)
console.log([...firstSeen.keys()])`,
      output: `[ 'b', '10', 'a', '2' ]`,
    },
  },
  {
    id: 'fo-p9',
    title: 'Ajouter dans un Set pendant qu’on le parcourt',
    theme: 'hachage',
    question: 'Qu’affiche ce code ?',
    code: `const s = new Set([1, 2, 3])
let visits = 0
for (const x of s) {
  visits++
  if (x < 5) s.add(x + 3)
}
console.log(visits, s.size)`,
    output: `7 7`,
    explanation: 'L’itération d’un `Set` ou d’une `Map` est « vivante » : les éléments ajoutés pendant le parcours sont visités eux aussi (ici 4, 5, 6 et 7). Avec une condition moins restrictive, la boucle ne se termine jamais. Supprimer l’élément courant est sûr ; ajouter ne l’est pas. Pour traiter des éléments découverts en cours de route, utilisez une file explicite, ou parcourez une copie (`[...s]`).',
    fix: {
      code: `const s = new Set([1, 2, 3])
let visits = 0
for (const x of [...s]) {
  visits++
  if (x < 5) s.add(x + 3)
}
console.log(visits, s.size)`,
      output: `3 6`,
    },
  },
)

flashcards.push(
  { id: 'fo-f17', theme: 'hachage', front: 'Complexité des opérations d’une table de hachage ?', back: 'Insertion, recherche, suppression : **O(1) en moyenne**, O(n) dans le pire cas (toutes les clés dans le même seau). Hacher une clé de taille k coûte O(k). Redimensionnement : O(n) ponctuel, O(1) amorti.' },
  { id: 'fo-f18', theme: 'hachage', front: 'Trois différences entre `Map` et objet littéral ?', back: '- Clés : n’importe quel type pour `Map`, chaînes pour l’objet (`1` devient `\'1\'`).\n- `map.size` en O(1) ; `Object.keys(o).length` en O(n).\n- L’objet hérite de `toString`, `constructor`… et réordonne les clés entières.' },
  { id: 'fo-f19', theme: 'hachage', front: 'La ligne de comptage de fréquences en JavaScript ?', back: 'Avec la valeur par défaut, sinon `undefined + 1 = NaN`.', code: `const freq = new Map()
for (const x of 'banana') freq.set(x, (freq.get(x) ?? 0) + 1)
freq.get('a') // → 3` },
  { id: 'fo-f20', theme: 'hachage', front: 'Gabarit « complément déjà vu » : dans quel ordre chercher et enregistrer ?', back: 'D’abord **chercher** `target − x` dans la table, ensuite **enregistrer** `x`. La table ne contient que les éléments à gauche : `i < j` garanti, pas d’auto-appariement.' },
  { id: 'fo-f21', theme: 'hachage', front: 'Quelles clés canoniques pour regrouper des anagrammes ?', back: 'Les lettres triées (`[...w].sort().join(\'\')`, O(k log k)) ou une signature de comptage sur 26 lettres jointe avec un séparateur (O(k)).' },
  { id: 'fo-f22', theme: 'hachage', front: 'Nombre de sous-tableaux de somme k, avec des négatifs ?', back: 'Préfixes + `Map` initialisée à `{0: 1}` : pour chaque préfixe p, ajouter le nombre de préfixes antérieurs égaux à `p − k`, puis enregistrer p. O(n). La fenêtre glissante ne marche pas avec des négatifs.' },
  { id: 'fo-f23', theme: 'hachage', front: 'Comment utiliser une case de grille (r, c) comme clé de `Set` ?', back: 'Pas avec `[r, c]` (comparé par référence). Sérialiser : `r + \',\' + c`, ou encoder en entier `r * cols + c` (plus rapide). En Python, un tuple `(r, c)` est hachable ; en Java, un `record`.' },
  { id: 'fo-f24', theme: 'hachage', front: 'Plus longue séquence consécutive en O(n) : l’astuce ?', back: 'Mettre les valeurs dans un `Set`, et ne compter une séquence qu’à partir de ses **débuts** (x tel que x − 1 est absent). Chaque valeur est visitée au plus deux fois.' },
)

lexique.push(
  { term: 'Table de hachage', theme: 'hachage', def: 'Structure associant des clés à des valeurs, qui range chaque clé dans un seau calculé par une fonction de hachage. Recherche, insertion et suppression en O(1) en moyenne. En JavaScript : `Map`, `Set` et, avec des limites, les objets.', see: ['Fonction de hachage', 'Collision (hachage)', 'Facteur de charge'] },
  { term: 'Fonction de hachage', theme: 'hachage', def: 'Fonction qui transforme une clé en entier, utilisé (modulo le nombre de seaux) comme indice. Elle doit être déterministe, rapide et bien répartir les clés ; deux clés égales ont toujours le même hachage.', see: ['Table de hachage'] },
  { term: 'Collision (hachage)', theme: 'hachage', def: 'Situation où deux clés différentes aboutissent au même seau. Gérée par chaînage (une liste par seau) ou adressage ouvert (chercher une autre case). Trop de collisions dégradent les opérations jusqu’à O(n).', see: ['Table de hachage'] },
  { term: 'Facteur de charge', theme: 'hachage', def: 'Rapport entre le nombre d’éléments et le nombre de seaux. Au-delà d’un seuil (souvent 0,75), la table double sa capacité et re-hache tout, ce qui garde les seaux courts et les opérations en O(1) amorti.', see: ['Complexité amortie'] },
  { term: 'Clé canonique', theme: 'hachage', def: 'Représentant commun à tous les éléments d’une même classe d’équivalence (lettres triées pour des anagrammes, écarts entre lettres pour des chaînes décalées). Sert de clé de `Map` pour regrouper.' },
  { term: 'Clé composite', theme: 'hachage', def: 'Clé formée de plusieurs valeurs (coordonnées, état). En JavaScript, une `Map` compare les tableaux par référence : on sérialise en chaîne avec séparateur (`r + \',\' + c`) ou en entier (`r * cols + c`).', see: ['Clé canonique'] },
)

entretien.push(
  {
    id: 'fo-e7',
    section: 'structures',
    q: 'Expliquez le fonctionnement d’une table de hachage. Quand une opération n’est-elle pas en O(1) ?',
    answer: 'Une fonction de hachage transforme la clé en entier ; modulo le nombre de seaux, cela donne l’emplacement. Les collisions sont gérées par chaînage ou par adressage ouvert. Quand le facteur de charge dépasse un seuil, la table double et re-hache tout : O(n) ponctuellement, O(1) amorti.\n\nCe n’est pas O(1) :\n\n- dans le **pire cas**, si beaucoup de clés collisionnent (fonction faible, entrées choisies pour attaquer) : O(n) par opération ;\n- quand la clé est **longue** : hacher une chaîne de longueur k coûte O(k), donc une `Map` de n chaînes coûte O(n · k) ;\n- au moment d’un **redimensionnement**, pour l’opération concernée.\n\nJ’annonce donc « O(1) en moyenne » et je mentionne la taille des clés quand elle n’est pas négligeable.',
    attendu: 'Comprendre le mécanisme (seaux, collisions, redimensionnement), distinguer moyenne, amorti et pire cas, et penser au coût du hachage des clés.',
  },
  {
    id: 'fo-e8',
    section: 'structures',
    q: 'Les valeurs sont des lettres minuscules : utilisez-vous une `Map` ou un tableau de 26 cases ?',
    answer: 'Quand l’univers des clés est petit et dense (26 lettres, chiffres, valeurs entre 0 et 10⁵), un tableau indexé directement est préférable : pas de hachage, pas de collisions, accès mémoire contigus, et mémoire O(taille de l’univers), soit O(1) pour un alphabet fixe. Il permet aussi de comparer deux signatures en O(26).\n\nSi les clés sont clairsemées (entiers jusqu’à 10⁹, chaînes quelconques, Unicode), la `Map` s’impose. En entretien, je commence souvent par la `Map`, plus générale, puis je propose le tableau si l’énoncé borne l’alphabet ; je le justifie par la constante et la mémoire, pas par la complexité asymptotique, qui est la même.',
    attendu: 'Savoir choisir la structure selon la forme de l’univers des clés, et ne pas prétendre à un gain asymptotique qui n’existe pas.',
  },
  {
    id: 'fo-e9',
    section: 'techniques',
    q: 'Quels énoncés vous font penser immédiatement à une table de hachage ?',
    answer: 'Les formulations « ai-je déjà vu… », « existe-t-il une paire… », « combien de fois… », « regrouper les éléments équivalents », « premier élément unique », « doublon », « nombre de sous-tableaux dont la somme vaut k ».\n\nGabarits associés :\n\n- **ensemble de déjà vus** (`Set`) : doublons, cycle, intersection ;\n- **complément** (`Map` valeur → indice ou compteur) : two-sum et ses variantes ;\n- **fréquences** : anagrammes, top-k, caractère unique ;\n- **clé canonique** : regroupements ;\n- **préfixe + Map** : sous-tableaux de somme ou de reste donné ;\n- **mémoïsation** : une `Map` d’états déjà calculés en programmation dynamique.\n\nLe signal général : une double boucle dont la boucle intérieure ne fait que chercher une valeur précise peut presque toujours être remplacée par une recherche en O(1).',
    attendu: 'Une liste de signaux concrets reliés à des gabarits, et l’idée générale « remplacer la boucle intérieure de recherche par un accès hashé ».',
  },
)

// ═════════════════════════════════════════════════════════════════════════════
// FENÊTRE GLISSANTE
// ═════════════════════════════════════════════════════════════════════════════

cours.push({
  id: 'fenetre',
  title: 'Fenêtre glissante',
  summary: 'Traiter tous les sous-tableaux ou sous-chaînes contigus en un seul passage : fenêtre de taille fixe, fenêtre variable qui s’agrandit et se réduit, comptage avec une Map, fenêtre couvrante minimale et maximum de fenêtre.',
  blocks: [
    { h: 'Reconnaître une fenêtre glissante', id: 'fenetre-reconnaitre' },
    {
      p: 'Une fenêtre est une tranche contiguë `[left, right]` que l’on fait glisser de gauche à droite. Au lieu de recalculer chaque tranche depuis zéro (O(n · k) ou O(n²)), on met à jour un **état** (somme, compteurs, ensemble) quand un élément **entre** à droite et quand un élément **sort** à gauche. Les deux bornes ne reculant jamais, chaque élément entre une fois et sort au plus une fois : O(n) au total.',
    },
    {
      list: [
        '**Signaux** : « sous-tableau » ou « sous-chaîne » **contigu**, « plus long », « plus court », « au plus k », « exactement k fois », « de taille k », « contenant tous les caractères de… ».',
        '**Condition de validité** : la technique variable exige une propriété **monotone** : si une fenêtre est valide, toute fenêtre plus petite qu’elle l’est aussi (ou l’inverse). C’est le cas de « au plus k distincts », « pas de répétition », « somme ≤ S avec des valeurs positives ».',
        '**Contre-signal** : valeurs négatives avec une contrainte de somme. Réduire la fenêtre peut alors augmenter la somme : on passe aux sommes préfixes + `Map` (thème hachage).',
        '**Sous-séquence** (non contiguë) : ce n’est plus une fenêtre, mais souvent de la programmation dynamique ou deux pointeurs sur deux chaînes.',
      ],
    },
    {
      mnemo: '« Contigu + plus long/plus court/au plus k » = fenêtre. Un élément entre à droite, sort à gauche, jamais deux fois.',
      piege: 'Appliquer une fenêtre variable à une somme avec des nombres négatifs : la monotonie disparaît et des solutions sont manquées.',
    },

    { h: 'Fenêtre de taille fixe', id: 'fenetre-fixe' },
    {
      p: 'Pour une taille k imposée, on construit la première fenêtre, puis on la fait glisser : à chaque pas, on ajoute `nums[right]` et l’on retire `nums[right - k]`. L’état est mis à jour en O(1) au lieu d’être recalculé en O(k).',
    },
    {
      title: 'Somme maximale de k éléments consécutifs',
      code: `function maxSumOfK(nums, k) {
  if (k <= 0 || k > nums.length) return null
  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += nums[i] // première fenêtre
  let best = windowSum
  for (let right = k; right < nums.length; right++) {
    windowSum += nums[right] - nums[right - k] // entre à droite, sort à gauche
    if (windowSum > best) best = windowSum
  }
  return best
}

maxSumOfK([2, 1, 5, 1, 3, 2], 3) // → 9
maxSumOfK([-1, -2, -3], 2) // → -3
maxSumOfK([1, 2], 3) // → null`,
      equiv: {
        python: `def max_sum_of_k(nums, k):
    if k <= 0 or k > len(nums):
        return None
    window_sum = sum(nums[:k])
    best = window_sum
    for right in range(k, len(nums)):
        window_sum += nums[right] - nums[right - k]
        best = max(best, window_sum)
    return best`,
        java: `static Long maxSumOfK(int[] nums, int k) {
    if (k <= 0 || k > nums.length) return null;
    long windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += nums[i];
    long best = windowSum;
    for (int right = k; right < nums.length; right++) {
        windowSum += nums[right] - nums[right - k];
        best = Math.max(best, windowSum);
    }
    return best;
}`,
        rust: `fn max_sum_of_k(nums: &[i64], k: usize) -> Option<i64> {
    if k == 0 || k > nums.len() {
        return None;
    }
    // windows(k) existe, mais recalculerait chaque somme en O(k)
    let mut window_sum: i64 = nums[..k].iter().sum();
    let mut best = window_sum;
    for right in k..nums.len() {
        window_sum += nums[right] - nums[right - k];
        best = best.max(window_sum);
    }
    Some(best)
}`,
      },
    },
    {
      list: [
        '**Variantes** : moyenne maximale de k éléments, nombre de fenêtres de taille k dont la moyenne dépasse un seuil, anagrammes de `p` dans `s` (état = compteurs de lettres, taille `p.length`), nombre de voyelles maximal dans une fenêtre.',
        'Si l’état n’est pas « réversible » (le maximum, par exemple), le retrait n’est plus O(1) : il faut une deque monotone ou un tas.',
      ],
    },
    {
      mnemo: '« Ajouter `nums[right]`, retirer `nums[right − k]`. » La première fenêtre se construit à part.',
      piege: 'Oublier le cas `k > n` (fenêtre impossible) ou initialiser `best` à 0 alors que toutes les sommes peuvent être négatives.',
    },

    { h: 'Fenêtre variable : agrandir puis réduire', id: 'fenetre-variable' },
    {
      p: 'Gabarit universel : `right` avance à chaque tour et fait **entrer** un élément ; tant que la fenêtre est **invalide**, on fait **sortir** `nums[left]` et l’on avance `left` ; une fois la fenêtre redevenue valide, on met à jour la réponse. Pour un « plus long », on met à jour après la réduction ; pour un « plus court », on met à jour **pendant** la réduction, tant que la fenêtre reste valide.',
    },
    {
      title: 'Plus long sous-tableau de somme ≤ limite (valeurs positives)',
      code: `function longestWithSumAtMost(nums, limit) {
  let left = 0
  let sum = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right] // entrer
    while (sum > limit) {
      sum -= nums[left] // sortir tant que la fenêtre est invalide
      left++
    }
    best = Math.max(best, right - left + 1) // fenêtre valide : mise à jour
  }
  return best
}

longestWithSumAtMost([3, 1, 2, 7, 4, 2, 1, 1, 5], 8) // → 4
longestWithSumAtMost([10, 20], 5) // → 0`,
      equiv: {
        python: `def longest_with_sum_at_most(nums, limit):
    left = total = best = 0
    for right, x in enumerate(nums):
        total += x
        while total > limit:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
        java: `static int longestWithSumAtMost(int[] nums, long limit) {
    int left = 0, best = 0;
    long sum = 0;
    for (int right = 0; right < nums.length; right++) {
        sum += nums[right];
        while (sum > limit) sum -= nums[left++];
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
        rust: `fn longest_with_sum_at_most(nums: &[u64], limit: u64) -> usize {
    let (mut left, mut sum, mut best) = (0, 0u64, 0);
    for right in 0..nums.len() {
        sum += nums[right];
        while sum > limit {
            sum -= nums[left];
            left += 1;
        }
        best = best.max(right + 1 - left); // right + 1 - left : pas de soustraction négative sur usize
    }
    best
}`,
      },
    },
    {
      list: [
        '**Pourquoi O(n)** : `left` ne dépasse jamais `right` et ne recule jamais, donc la boucle `while` fait au plus n tours **au total** sur tout l’algorithme.',
        '**Longueur de la fenêtre** : `right - left + 1` (bornes incluses). Une fenêtre vide correspond à `left = right + 1`.',
        '**Fenêtre « qui ne rétrécit jamais »** : pour un « plus long », on peut remplacer `while` par `if` : la fenêtre glisse sans jamais diminuer, et sa taille finale est la réponse. Astucieux mais plus difficile à justifier à l’oral.',
      ],
    },
    {
      mnemo: 'Entrer, réduire tant qu’invalide, mettre à jour. « Plus long » : après la réduction. « Plus court » : pendant.',
      piege: 'Mettre à jour la réponse au mauvais moment (avant la réduction pour un « plus long », ce qui compte une fenêtre invalide), ou écrire `right - left` au lieu de `right - left + 1`.',
    },

    { h: 'Sans répétition : la fenêtre avec un Set ou les derniers indices', id: 'fenetre-sans-repetition' },
    {
      p: 'La plus longue sous-chaîne sans caractère répété est l’exemple canonique. L’état est l’ensemble des caractères de la fenêtre. Quand `s[right]` est déjà présent, on retire des caractères à gauche jusqu’à ce qu’il ne le soit plus. Variante plus directe : mémoriser le **dernier indice** de chaque caractère et faire **sauter** `left` juste après l’occurrence précédente, à condition qu’elle soit dans la fenêtre.',
    },
    {
      title: 'Deux versions : réduire pas à pas, ou sauter',
      code: `function longestUniqueSet(s) {
  const inWindow = new Set()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    while (inWindow.has(s[right])) {
      inWindow.delete(s[left])
      left++
    }
    inWindow.add(s[right])
    best = Math.max(best, right - left + 1)
  }
  return best
}

function longestUniqueJump(s) {
  const last = new Map() // caractère → dernier indice vu
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const prev = last.get(s[right])
    if (prev !== undefined && prev >= left) left = prev + 1 // seulement si prev est dans la fenêtre
    last.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}

longestUniqueSet('abcabcbb') // → 3
longestUniqueSet('pwwkew') // → 3
longestUniqueJump('abba') // → 2
longestUniqueJump('') // → 0`,
      equiv: {
        python: `def longest_unique_jump(s):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best`,
        java: `static int longestUniqueJump(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        Integer prev = last.get(s.charAt(right));
        if (prev != null && prev >= left) left = prev + 1;
        last.put(s.charAt(right), right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
        rust: `use std::collections::HashMap;

fn longest_unique_jump(s: &str) -> usize {
    let mut last: HashMap<char, usize> = HashMap::new();
    let (mut left, mut best) = (0, 0);
    for (right, ch) in s.chars().enumerate() {
        if let Some(&prev) = last.get(&ch) {
            if prev >= left {
                left = prev + 1;
            }
        }
        last.insert(ch, right);
        best = best.max(right + 1 - left);
    }
    best
}`,
        php: `function longestUniqueJump(string $s): int {
    $last = [];
    $left = $best = 0;
    for ($right = 0; $right < strlen($s); $right++) {
        $ch = $s[$right];
        if (isset($last[$ch]) && $last[$ch] >= $left) $left = $last[$ch] + 1;
        $last[$ch] = $right;
        $best = max($best, $right - $left + 1);
    }
    return $best;
}`,
      },
    },
    {
      mnemo: 'Set : « tant que doublon, sortir à gauche ». Derniers indices : « `left = max(left, prev + 1)` ».',
      piege: 'Dans la version à sauts, oublier le test `prev >= left` : sur `abba`, le second `a` ramènerait `left` en arrière (de 2 à 1) et la réponse serait fausse (3 au lieu de 2).',
    },

    { h: 'Fenêtre avec Map de comptage', id: 'fenetre-comptage' },
    {
      p: 'Quand la validité dépend du **nombre** d’occurrences (au plus k caractères distincts, au plus k zéros, anagramme), l’état est une `Map` élément → compteur. Le détail qui compte : quand un compteur tombe à 0, on **supprime** la clé, pour que `map.size` reste égal au nombre d’éléments distincts dans la fenêtre.',
    },
    {
      title: 'Compter les sous-tableaux ayant exactement k valeurs distinctes',
      code: `function countAtMostKDistinct(nums, k) {
  const count = new Map()
  let left = 0
  let total = 0
  for (let right = 0; right < nums.length; right++) {
    count.set(nums[right], (count.get(nums[right]) ?? 0) + 1)
    while (count.size > k) {
      const out = nums[left]
      count.set(out, count.get(out) - 1)
      if (count.get(out) === 0) count.delete(out) // garder size = nombre de distincts
      left++
    }
    total += right - left + 1 // sous-tableaux valides qui finissent en right
  }
  return total
}

const exactlyK = (nums, k) => countAtMostKDistinct(nums, k) - countAtMostKDistinct(nums, k - 1)

countAtMostKDistinct([1, 2, 1, 2, 3], 2) // → 12
exactlyK([1, 2, 1, 2, 3], 2) // → 7
exactlyK([1, 2, 1, 3, 4], 3) // → 3`,
      equiv: {
        python: `from collections import defaultdict

def count_at_most_k_distinct(nums, k):
    count = defaultdict(int)
    left = total = 0
    for right, x in enumerate(nums):
        count[x] += 1
        while len(count) > k:
            out = nums[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        total += right - left + 1
    return total

def exactly_k(nums, k):
    return count_at_most_k_distinct(nums, k) - count_at_most_k_distinct(nums, k - 1)`,
        java: `static long countAtMostKDistinct(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    int left = 0;
    long total = 0;
    for (int right = 0; right < nums.length; right++) {
        count.merge(nums[right], 1, Integer::sum);
        while (count.size() > k) {
            int out = nums[left++];
            // merge renvoie null et supprime la clé quand la fonction renvoie null
            count.merge(out, -1, (a, b) -> a + b == 0 ? null : a + b);
        }
        total += right - left + 1;
    }
    return total;
}`,
      },
    },
    {
      list: [
        '**« Exactement k » = « au plus k » − « au plus k − 1 »** : « exactement » n’est pas monotone (agrandir peut rendre invalide puis valide à nouveau), mais « au plus » l’est.',
        '**Compter les fenêtres** plutôt que chercher la plus longue : chaque position de `right` contribue `right - left + 1` sous-tableaux valides (tous ceux qui commencent entre `left` et `right`).',
        '**Au plus k remplacements** (« longest repeating character replacement ») : fenêtre valide si `taille − fréquence maximale ≤ k`.',
      ],
    },
    {
      mnemo: 'Compteur à 0 → `delete`. « Exactement k » = atMost(k) − atMost(k − 1). Compter : `+= right − left + 1`.',
      piege: 'Décrémenter sans supprimer les clés à 0 : `map.size` continue de compter des caractères absents, et la fenêtre se réduit à tort.',
    },

    { h: 'Plus petite fenêtre couvrante', id: 'fenetre-couvrante' },
    {
      p: 'Problème type : la plus petite sous-chaîne de `s` contenant tous les caractères de `t` (avec multiplicités). C’est une fenêtre variable pour un « plus court » : on agrandit jusqu’à couvrir `t`, puis on réduit tant que la couverture tient, en enregistrant la meilleure fenêtre **pendant** la réduction.',
    },
    {
      list: [
        '**État** : `need`, une `Map` caractère → nombre encore requis (initialisée avec les fréquences de `t`), et `missing`, le nombre total de caractères manquants (initialisé à `t.length`).',
        '**Entrée de `s[right]`** : si `need.get(c) > 0`, ce caractère était utile, donc `missing--` ; dans tous les cas, `need.set(c, need.get(c) - 1)` (les valeurs négatives signalent des surplus).',
        '**Tant que `missing === 0`** : la fenêtre couvre `t` ; on enregistre sa longueur, puis l’on sort `s[left]` : `need.set(c, need.get(c) + 1)`, et si ce compteur redevient positif, `missing++`.',
        '**Complexité** : O(|s| + |t|) en temps, O(σ) en mémoire. Comparer deux tables de 26 ou 52 cases à chaque pas donne O(σ · |s|), acceptable mais moins élégant.',
      ],
    },
    {
      title: 'Le compteur « missing » sur un petit exemple',
      code: `const t = 'aab'
const need = new Map()
for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)
let missing = t.length

for (const c of 'baca') {
  if ((need.get(c) ?? 0) > 0) missing-- // caractère encore utile
  need.set(c, (need.get(c) ?? 0) - 1) // négatif = surplus
}
missing // → 0
need // → Map(3) { 'a' => 0, 'b' => 0, 'c' => -1 }`,
    },
    {
      mnemo: '`missing` compte ce qui manque ; on enregistre la fenêtre tant que `missing === 0`, en réduisant à gauche.',
      piege: 'Décrémenter `missing` pour chaque caractère de `t` rencontré, même en surplus : avec `t = \'ab\'` et la fenêtre `\'aa\'`, on croirait la fenêtre complète.',
    },

    { h: 'Maximum de chaque fenêtre : la deque monotone', id: 'fenetre-maximum' },
    {
      p: 'Le maximum n’est pas réversible : quand le maximum sort de la fenêtre, impossible de connaître le suivant sans tout reparcourir (O(n · k)). La solution O(n) garde une **deque d’indices** dont les valeurs sont décroissantes : un élément plus petit que le nouvel arrivant ne pourra plus jamais être le maximum, on le retire par l’arrière. La tête est le maximum courant ; on la retire quand elle sort de la fenêtre. La technique de la pile monotone est détaillée dans le thème « Piles, files, pile monotone ».',
    },
    {
      title: 'Maximum glissant avec une deque d’indices',
      code: `function maxSlidingWindow(nums, k) {
  const deque = [] // indices ; valeurs décroissantes de la tête à la queue
  let head = 0 // tête de la deque (évite shift, qui est O(n))
  const result = []
  for (let i = 0; i < nums.length; i++) {
    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) deque.pop()
    deque.push(i)
    if (deque[head] <= i - k) head++ // la tête est sortie de la fenêtre
    if (i >= k - 1) result.push(nums[deque[head]])
  }
  return result
}

maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3) // → [ 3, 3, 5, 5, 6, 7 ]
maxSlidingWindow([4, 2], 1) // → [ 4, 2 ]`,
      equiv: {
        python: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()  # indices, valeurs décroissantes
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result`,
        java: `static int[] maxSlidingWindow(int[] nums, int k) {
    ArrayDeque<Integer> dq = new ArrayDeque<>(); // indices
    int[] result = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
        dq.addLast(i);
        if (dq.peekFirst() <= i - k) dq.pollFirst();
        if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
    }
    return result;
}`,
        rust: `use std::collections::VecDeque;

fn max_sliding_window(nums: &[i32], k: usize) -> Vec<i32> {
    let mut dq: VecDeque<usize> = VecDeque::new();
    let mut result = Vec::new();
    for i in 0..nums.len() {
        while let Some(&back) = dq.back() {
            if nums[back] <= nums[i] {
                dq.pop_back();
            } else {
                break;
            }
        }
        dq.push_back(i);
        if dq[0] + k <= i {
            dq.pop_front();
        }
        if i + 1 >= k {
            result.push(nums[dq[0]]);
        }
    }
    result
}`,
      },
    },
    {
      mnemo: 'Deque décroissante d’indices : on chasse les plus petits par l’arrière, on périme la tête par l’avant. Chaque indice entre et sort une fois : O(n).',
      piege: 'Stocker des valeurs plutôt que des indices : impossible alors de savoir si la tête est sortie de la fenêtre, surtout avec des doublons.',
    },
  ],
  mnemo: 'Fixe : ajouter à droite, retirer `right − k`. Variable : entrer, réduire tant qu’invalide, mettre à jour. Comptage : `delete` à 0, exactement k = atMost(k) − atMost(k − 1). Maximum : deque monotone.',
  piege: 'Utiliser une fenêtre sans monotonie (sommes avec négatifs), mettre à jour au mauvais moment, oublier `+ 1` dans la longueur, laisser des compteurs à 0 dans la `Map`.',
})

katas.push(
  {
    id: 'fo-moyenne-seuil',
    title: 'Fenêtres de taille k au-dessus d’un seuil',
    difficulty: 'facile',
    theme: 'fenetre',
    pattern: 'fenêtre de taille fixe',
    statement: `Écrivez \`countWindowsAbove(arr, k, threshold)\` qui renvoie le nombre de sous-tableaux contigus de **taille exactement k** dont la **moyenne** est supérieure ou égale à \`threshold\`.

Exemples :

- \`countWindowsAbove([2, 2, 2, 2, 5, 5, 5, 8], 3, 4)\` donne \`3\` (fenêtres \`[2, 5, 5]\`, \`[5, 5, 5]\` et \`[5, 5, 8]\`) ;
- \`countWindowsAbove([11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5)\` donne \`6\` ;
- \`countWindowsAbove([1, 2], 3, 0)\` donne \`0\` (aucune fenêtre de taille 3).

Contraintes : \`n ≤ 2 × 10⁵\`, \`1 ≤ k\`, valeurs entières positives ou nulles. Recalculer chaque fenêtre coûte O(n · k) : visez **O(n)**.`,
    starter: `function countWindowsAbove(arr, k, threshold) {
  // TODO : faire glisser une somme de taille k
  return 0
}`,
    solution: `function countWindowsAbove(arr, k, threshold) {
  if (k > arr.length) return 0
  const target = k * threshold // moyenne >= seuil  <=>  somme >= k * seuil (pas de division)
  let sum = 0
  for (let i = 0; i < k; i++) sum += arr[i]
  let count = sum >= target ? 1 : 0
  for (let right = k; right < arr.length; right++) {
    sum += arr[right] - arr[right - k]
    if (sum >= target) count++
  }
  return count
}`,
    solutionEquiv: {
      python: `def count_windows_above(arr, k, threshold):
    if k > len(arr):
        return 0
    target = k * threshold
    s = sum(arr[:k])
    count = 1 if s >= target else 0
    for right in range(k, len(arr)):
        s += arr[right] - arr[right - k]
        if s >= target:
            count += 1
    return count`,
      java: `static int countWindowsAbove(int[] arr, int k, int threshold) {
    if (k > arr.length) return 0;
    long target = (long) k * threshold;
    long sum = 0;
    for (int i = 0; i < k; i++) sum += arr[i];
    int count = sum >= target ? 1 : 0;
    for (int right = k; right < arr.length; right++) {
        sum += arr[right] - arr[right - k];
        if (sum >= target) count++;
    }
    return count;
}`,
      bash: `# Avec awk : une valeur par ligne sur l'entrée standard
awk -v k=3 -v t=4 '
  { a[NR] = $1; s += $1; if (NR > k) s -= a[NR - k] }
  NR >= k && s >= k * t { c++ }
  END { print c + 0 }'`,
    },
    tests: [
      { name: 'exemple 1', code: `assertEqual(countWindowsAbove([2, 2, 2, 2, 5, 5, 5, 8], 3, 4), 3)` },
      { name: 'exemple 2', code: `assertEqual(countWindowsAbove([11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5), 6)` },
      { name: 'fenêtre plus grande que le tableau', code: `assertEqual(countWindowsAbove([1, 2], 3, 0), 0)
assertEqual(countWindowsAbove([], 1, 0), 0)` },
      { name: 'k = 1 et k = n', code: `assertEqual(countWindowsAbove([1, 5, 3], 1, 3), 2)
assertEqual(countWindowsAbove([1, 5, 3], 3, 3), 1)` },
      { name: 'égalité avec le seuil et moyenne non entière', code: `assertEqual(countWindowsAbove([4, 4, 4], 2, 4), 2)
assertEqual(countWindowsAbove([3, 4], 2, 4), 0)` },
      {
        name: 'grande entrée (n = 200 000, k = 100 000)',
        code: `const n = 200000
const arr = []
for (let i = 0; i < n; i++) arr.push(i % 100)
const t0 = performance.now()
const a = countWindowsAbove(arr, 100000, 49)
const b = countWindowsAbove(arr, 100000, 50)
const elapsed = performance.now() - t0
assertEqual(a, 100001)
assertEqual(b, 0)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n), pas O(n · k))')`,
      },
    ],
    hints: [
      'Comparer une moyenne à un seuil revient à comparer la somme à `k × seuil` : plus de division, plus de flottants.',
      'Calculez la somme des k premiers éléments, puis faites glisser : `sum += arr[right] − arr[right − k]`.',
      'Pensez au cas `k > arr.length` : aucune fenêtre.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Points à évoquer** :

- la version naïve recalcule chaque fenêtre en O(k) : O(n · k), soit 10¹⁰ opérations pour la grande entrée ;
- multiplier plutôt que diviser évite les erreurs d'arrondi des flottants (\`0.1 + 0.2 !== 0.3\`) ; en Java, \`k * threshold\` peut déborder un \`int\` : passer en \`long\` ;
- une somme préfixe donne aussi O(n), au prix de O(n) de mémoire ;
- variantes : moyenne maximale d'une fenêtre de taille k ; de taille **au moins** k (dichotomie sur la réponse + préfixes, problème nettement plus difficile) ; nombre maximal de voyelles dans une fenêtre de taille k.`,
  },
  {
    id: 'fo-sous-tableau-min',
    title: 'Plus court sous-tableau de somme au moins S',
    difficulty: 'facile',
    theme: 'fenetre',
    pattern: 'fenêtre variable (plus court)',
    statement: `\`nums\` contient des entiers **strictement positifs**. Écrivez \`minSubArrayLen(target, nums)\` qui renvoie la longueur du plus court sous-tableau contigu dont la somme est **supérieure ou égale** à \`target\`, ou \`0\` s'il n'en existe aucun.

Exemples :

- \`minSubArrayLen(7, [2, 3, 1, 2, 4, 3])\` donne \`2\` (\`[4, 3]\`) ;
- \`minSubArrayLen(4, [1, 4, 4])\` donne \`1\` ;
- \`minSubArrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1])\` donne \`0\`.

Contraintes : \`n ≤ 10⁵\`, \`1 ≤ nums[i] ≤ 10⁴\`, \`1 ≤ target ≤ 10⁹\`. Visez O(n).`,
    starter: `function minSubArrayLen(target, nums) {
  // TODO : agrandir à droite, réduire à gauche tant que la somme suffit
  return 0
}`,
    solution: `function minSubArrayLen(target, nums) {
  let left = 0
  let sum = 0
  let best = Infinity
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]
    // « plus court » : on enregistre PENDANT la réduction, tant que la fenêtre reste valide
    while (sum >= target) {
      best = Math.min(best, right - left + 1)
      sum -= nums[left]
      left++
    }
  }
  return best === Infinity ? 0 : best
}`,
    solutionEquiv: {
      python: `def min_sub_array_len(target, nums):
    left = total = 0
    best = float('inf')
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float('inf') else best`,
      java: `static int minSubArrayLen(int target, int[] nums) {
    int left = 0, best = Integer.MAX_VALUE;
    long sum = 0;
    for (int right = 0; right < nums.length; right++) {
        sum += nums[right];
        while (sum >= target) {
            best = Math.min(best, right - left + 1);
            sum -= nums[left++];
        }
    }
    return best == Integer.MAX_VALUE ? 0 : best;
}`,
      rust: `fn min_sub_array_len(target: u64, nums: &[u64]) -> usize {
    let (mut left, mut sum, mut best) = (0, 0u64, usize::MAX);
    for right in 0..nums.len() {
        sum += nums[right];
        while sum >= target {
            best = best.min(right + 1 - left);
            sum -= nums[left];
            left += 1;
        }
    }
    if best == usize::MAX { 0 } else { best }
}`,
      php: `function minSubArrayLen(int $target, array $nums): int {
    $left = $sum = 0;
    $best = PHP_INT_MAX;
    foreach ($nums as $right => $x) {
        $sum += $x;
        while ($sum >= $target) {
            $best = min($best, $right - $left + 1);
            $sum -= $nums[$left++];
        }
    }
    return $best === PHP_INT_MAX ? 0 : $best;
}`,
    },
    tests: [
      { name: 'exemple', code: `assertEqual(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]), 2)` },
      { name: 'un seul élément suffit', code: `assertEqual(minSubArrayLen(4, [1, 4, 4]), 1)` },
      { name: 'impossible', code: `assertEqual(minSubArrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1]), 0)
assertEqual(minSubArrayLen(1, []), 0)` },
      { name: 'tout le tableau', code: `assertEqual(minSubArrayLen(15, [1, 2, 3, 4, 5]), 5)` },
      { name: 'somme exactement égale et dépassement', code: `assertEqual(minSubArrayLen(11, [1, 2, 3, 4, 5]), 3)
assertEqual(minSubArrayLen(100, [101]), 1)` },
      {
        name: 'grande entrée (n = 100 000)',
        code: `const n = 100000
const nums = new Array(n).fill(1)
nums[n - 1] = 50000
const t0 = performance.now()
const r1 = minSubArrayLen(60000, nums)
const r2 = minSubArrayLen(200000, nums)
const elapsed = performance.now() - t0
assertEqual(r1, 10001)
assertEqual(r2, 0)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n))')`,
      },
    ],
    hints: [
      'Les valeurs sont positives : agrandir la fenêtre augmente la somme, la réduire la diminue. C’est la monotonie qui autorise la fenêtre glissante.',
      'Faites entrer `nums[right]`, puis, **tant que** la somme atteint la cible, enregistrez la longueur et faites sortir `nums[left]`.',
      'Initialisez la meilleure longueur à `Infinity` et renvoyez 0 si elle n’a pas changé.',
    ],
    discussion: `**Complexité** : O(n) en temps (chaque indice entre et sort au plus une fois), O(1) en mémoire.

**Points à évoquer** :

- **pourquoi enregistrer pendant la réduction** : on cherche le plus court ; chaque fenêtre valide rencontrée en réduisant est un candidat plus court que le précédent ;
- **alternative O(n log n)** : sommes préfixes (croissantes car les valeurs sont positives) puis, pour chaque début, une recherche dichotomique de la plus petite fin ; c'est le suivi classique « et en O(n log n) ? » ;
- **avec des négatifs** (LeetCode 862), la fenêtre ne marche plus : il faut des préfixes et une deque monotone croissante ;
- piège d'implémentation : écrire \`if\` au lieu de \`while\` pour la réduction, ce qui ne réduit que d'un cran par tour et rate des fenêtres plus courtes.`,
  },
  {
    id: 'fo-anagrammes-trouvees',
    title: 'Trouver toutes les anagrammes dans une chaîne',
    difficulty: 'moyen',
    theme: 'fenetre',
    pattern: 'fenêtre fixe + comptage',
    statement: `Écrivez \`findAnagrams(s, p)\` qui renvoie, dans l'ordre croissant, les indices de début de toutes les sous-chaînes de \`s\` qui sont des **anagrammes** de \`p\`. Les deux chaînes ne contiennent que des lettres minuscules \`a\` à \`z\`.

Exemples :

- \`findAnagrams('cbaebabacd', 'abc')\` donne \`[0, 6]\` (\`cba\` et \`bac\`) ;
- \`findAnagrams('abab', 'ab')\` donne \`[0, 1, 2]\` ;
- \`findAnagrams('a', 'ab')\` donne \`[]\`.

Contraintes : longueurs jusqu'à 10⁵. Trier chaque fenêtre coûte O(n · m log m) : visez **O(n)**.`,
    starter: `function findAnagrams(s, p) {
  // TODO : fenêtre de taille p.length avec des compteurs de lettres
  return []
}`,
    solution: `function findAnagrams(s, p) {
  const result = []
  const m = p.length
  if (m > s.length) return result
  const need = new Array(26).fill(0)
  for (let i = 0; i < m; i++) need[p.charCodeAt(i) - 97]++
  const win = new Array(26).fill(0)
  // matches = nombre de lettres (sur 26) dont le compteur est identique
  let matches = 0
  for (let c = 0; c < 26; c++) if (need[c] === 0) matches++

  for (let right = 0; right < s.length; right++) {
    const inC = s.charCodeAt(right) - 97
    if (win[inC] === need[inC]) matches-- // on va casser une égalité
    win[inC]++
    if (win[inC] === need[inC]) matches++ // ou en créer une

    if (right >= m) {
      const outC = s.charCodeAt(right - m) - 97
      if (win[outC] === need[outC]) matches--
      win[outC]--
      if (win[outC] === need[outC]) matches++
    }
    if (right >= m - 1 && matches === 26) result.push(right - m + 1)
  }
  return result
}`,
    solutionEquiv: {
      python: `def find_anagrams(s, p):
    m = len(p)
    if m > len(s):
        return []
    need = [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    win = [0] * 26
    result = []
    for right, ch in enumerate(s):
        win[ord(ch) - 97] += 1
        if right >= m:
            win[ord(s[right - m]) - 97] -= 1
        # comparer deux listes de 26 cases : O(26) par pas, donc O(26 · n)
        if right >= m - 1 and win == need:
            result.append(right - m + 1)
    return result`,
      java: `static List<Integer> findAnagrams(String s, String p) {
    List<Integer> result = new ArrayList<>();
    int m = p.length();
    if (m > s.length()) return result;
    int[] need = new int[26], win = new int[26];
    for (char ch : p.toCharArray()) need[ch - 'a']++;
    for (int right = 0; right < s.length(); right++) {
        win[s.charAt(right) - 'a']++;
        if (right >= m) win[s.charAt(right - m) - 'a']--;
        if (right >= m - 1 && Arrays.equals(win, need)) result.add(right - m + 1);
    }
    return result;
}`,
      rust: `fn find_anagrams(s: &str, p: &str) -> Vec<usize> {
    let (s, p) = (s.as_bytes(), p.as_bytes());
    let m = p.len();
    let mut result = Vec::new();
    if m > s.len() {
        return result;
    }
    let mut need = [0i32; 26];
    let mut win = [0i32; 26];
    for &b in p {
        need[(b - b'a') as usize] += 1;
    }
    for right in 0..s.len() {
        win[(s[right] - b'a') as usize] += 1;
        if right >= m {
            win[(s[right - m] - b'a') as usize] -= 1;
        }
        if right + 1 >= m && win == need {
            result.push(right + 1 - m);
        }
    }
    result
}`,
    },
    tests: [
      { name: 'exemple 1', code: `assertEqual(findAnagrams('cbaebabacd', 'abc'), [0, 6])` },
      { name: 'fenêtres qui se chevauchent', code: `assertEqual(findAnagrams('abab', 'ab'), [0, 1, 2])` },
      { name: 'motif plus long que la chaîne', code: `assertEqual(findAnagrams('a', 'ab'), [])
assertEqual(findAnagrams('', 'a'), [])` },
      { name: 'lettres répétées dans le motif', code: `assertEqual(findAnagrams('aabaa', 'aab'), [0, 1, 2])
assertEqual(findAnagrams('baa', 'aa'), [1])` },
      { name: 'chaîne entière et aucune occurrence', code: `assertEqual(findAnagrams('xyz', 'zyx'), [0])
assertEqual(findAnagrams('abcdef', 'gh'), [])` },
      {
        name: 'grande entrée (|s| = 100 000, |p| = 1 000)',
        code: `let s = ''
for (let i = 0; i < 100000; i++) s += String.fromCharCode(97 + (i % 26))
let p = ''
for (let i = 0; i < 1000; i++) p += String.fromCharCode(97 + ((i * 7) % 26))
const t0 = performance.now()
const r = findAnagrams(s, p)
const elapsed = performance.now() - t0
assertEqual(r.length, 0)
const r2 = findAnagrams(s, s.slice(0, 26 * 40))
assertEqual(r2.length, 100000 - 1040 + 1)
assert(performance.now() - t0 < 1000, 'trop lent : ' + Math.round(performance.now() - t0) + ' ms (visez O(n))')`,
      },
    ],
    hints: [
      'Toutes les fenêtres candidates ont la même taille, `p.length` : c’est une fenêtre fixe.',
      'L’état de la fenêtre : un tableau de 26 compteurs. Une lettre entre à droite, une lettre sort à gauche ; la fenêtre est une anagramme si ses compteurs égalent ceux de `p`.',
      'Comparer les 26 compteurs à chaque pas donne O(26 · n), acceptable. Pour du vrai O(n), maintenez `matches`, le nombre de lettres dont les deux compteurs sont égaux, en le corrigeant avant et après chaque modification.',
    ],
    discussion: `**Complexité** : O(n + m) en temps avec le compteur \`matches\` (O(26 · n) avec la comparaison des tableaux, ce qui est aussi linéaire), O(1) en mémoire (deux tableaux de 26 cases).

**Points à évoquer** :

- trier chaque fenêtre : O(n · m log m), hors délai pour de grandes chaînes ;
- un tableau de 26 cases est plus rapide qu'une \`Map\` quand l'alphabet est fixé ; avec un alphabet quelconque, une \`Map\` et un compteur de clés « satisfaites » donnent la même structure ;
- le motif \`matches\` (ou \`missing\`) est exactement celui de la **fenêtre minimale couvrante** : apprendre à le maintenir en O(1) sert pour tout le thème ;
- variantes : « permutation in string » (renvoyer seulement un booléen), compter les occurrences d'anagrammes, anagrammes avec un caractère joker.`,
  },
  {
    id: 'fo-k-distincts',
    title: 'Plus longue sous-chaîne avec au plus k caractères distincts',
    difficulty: 'moyen',
    theme: 'fenetre',
    pattern: 'fenêtre variable + Map de comptage',
    statement: `Écrivez \`longestKDistinct(s, k)\` qui renvoie la longueur de la plus longue sous-chaîne de \`s\` contenant **au plus k caractères distincts**.

Exemples :

- \`longestKDistinct('eceba', 2)\` donne \`3\` (\`ece\`) ;
- \`longestKDistinct('aa', 1)\` donne \`2\` ;
- \`longestKDistinct('abc', 0)\` donne \`0\`.

Contraintes : \`|s| ≤ 2 × 10⁵\`, \`0 ≤ k\`, caractères quelconques. Visez O(n).`,
    starter: `function longestKDistinct(s, k) {
  // TODO : Map caractère → compteur, réduire quand map.size > k
  return Math.min(s.length, k)
}`,
    solution: `function longestKDistinct(s, k) {
  const count = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) ?? 0) + 1)
    while (count.size > k) {
      const out = s[left]
      const n = count.get(out) - 1
      if (n === 0) count.delete(out) // indispensable : size = nombre de distincts
      else count.set(out, n)
      left++
    }
    if (right - left + 1 > best) best = right - left + 1
  }
  return best
}`,
    solutionEquiv: {
      python: `from collections import defaultdict

def longest_k_distinct(s, k):
    count = defaultdict(int)
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] += 1
        while len(count) > k:
            out = s[left]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      java: `static int longestKDistinct(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        count.merge(s.charAt(right), 1, Integer::sum);
        while (count.size() > k) {
            char out = s.charAt(left++);
            count.merge(out, -1, (a, b) -> a + b == 0 ? null : a + b);
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
      rust: `use std::collections::HashMap;

fn longest_k_distinct(s: &str, k: usize) -> usize {
    let chars: Vec<char> = s.chars().collect();
    let mut count: HashMap<char, usize> = HashMap::new();
    let (mut left, mut best) = (0, 0);
    for right in 0..chars.len() {
        *count.entry(chars[right]).or_insert(0) += 1;
        while count.len() > k {
            let out = chars[left];
            let n = count.get_mut(&out).unwrap();
            *n -= 1;
            if *n == 0 {
                count.remove(&out);
            }
            left += 1;
        }
        best = best.max(right + 1 - left);
    }
    best
}`,
      php: `function longestKDistinct(string $s, int $k): int {
    $count = [];
    $left = $best = 0;
    $n = strlen($s);
    for ($right = 0; $right < $n; $right++) {
        $count[$s[$right]] = ($count[$s[$right]] ?? 0) + 1;
        while (count($count) > $k) {
            $out = $s[$left++];
            if (--$count[$out] === 0) unset($count[$out]);
        }
        $best = max($best, $right - $left + 1);
    }
    return $best;
}`,
    },
    tests: [
      { name: 'exemple', code: `assertEqual(longestKDistinct('eceba', 2), 3)` },
      { name: 'un seul caractère répété', code: `assertEqual(longestKDistinct('aa', 1), 2)` },
      { name: 'k = 0 et chaîne vide', code: `assertEqual(longestKDistinct('abc', 0), 0)
assertEqual(longestKDistinct('', 3), 0)` },
      { name: 'k plus grand que le nombre de distincts', code: `assertEqual(longestKDistinct('abcabc', 5), 6)` },
      { name: 'la fenêtre doit se réduire de plusieurs crans', code: `assertEqual(longestKDistinct('aaabbbcccc', 2), 7)
assertEqual(longestKDistinct('abaccc', 2), 4)` },
      { name: 'clés supprimées à zéro', code: `assertEqual(longestKDistinct('abcbbbbcccbdddadacb', 2), 10)` },
      {
        name: 'grande entrée (n = 200 000)',
        code: `let s = ''
for (let i = 0; i < 200000; i++) s += 'abc'[i % 3]
const t0 = performance.now()
const r1 = longestKDistinct(s, 3)
const r2 = longestKDistinct(s, 2)
const elapsed = performance.now() - t0
assertEqual(r1, 200000)
assertEqual(r2, 2)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(n))')`,
      },
    ],
    hints: [
      '« Au plus k distincts » est monotone : si une fenêtre est valide, toutes ses sous-fenêtres le sont. Une fenêtre variable convient.',
      'Comptez les caractères de la fenêtre dans une `Map`. Quand `map.size` dépasse k, faites sortir des caractères à gauche.',
      'Quand un compteur tombe à 0, **supprimez** la clé, sinon `size` compte encore ce caractère et la fenêtre se réduit trop.',
    ],
    discussion: `**Complexité** : O(n) en temps (chaque caractère entre et sort une fois ; les opérations de \`Map\` sont O(1) en moyenne), O(k) en mémoire (au plus k + 1 clés).

**Points à évoquer** :

- force brute : pour chaque début, étendre tant que le nombre de distincts reste ≤ k : O(n²) dans le pire cas (chaîne de k caractères alternés) ;
- variante qui évite la boucle de réduction : stocker le **dernier indice** de chaque caractère, et quand la taille dépasse k, retirer le caractère de plus petit dernier indice (\`left = cet indice + 1\`) : O(n · k) sans structure triée, O(n log k) avec une structure ordonnée ;
- cas particuliers à citer : « fruit into baskets » (k = 2), « longest substring without repeating characters » (fenêtre où chaque compteur vaut au plus 1) ;
- suite : compter les sous-chaînes avec **exactement** k distincts, par la différence atMost(k) − atMost(k − 1).`,
  },
  {
    id: 'fo-fenetre-minimale',
    title: 'Plus petite fenêtre couvrante',
    difficulty: 'difficile',
    theme: 'fenetre',
    pattern: 'fenêtre variable + compteur de manquants',
    statement: `Écrivez \`minWindow(s, t)\` qui renvoie la plus courte sous-chaîne de \`s\` contenant **tous** les caractères de \`t\`, multiplicités comprises. S'il n'en existe pas, renvoyez \`''\`. En cas d'égalité de longueur, renvoyez la plus à gauche. La casse compte.

Exemples :

- \`minWindow('ADOBECODEBANC', 'ABC')\` donne \`'BANC'\` ;
- \`minWindow('a', 'a')\` donne \`'a'\` ;
- \`minWindow('a', 'aa')\` donne \`''\` (il faut deux \`a\`).

Contraintes : \`|s|, |t| ≤ 2 × 10⁵\`. Visez **O(|s| + |t|)**.`,
    starter: `function minWindow(s, t) {
  // TODO : need (Map), missing (compteur), fenêtre variable
  return ''
}`,
    solution: `function minWindow(s, t) {
  if (t.length === 0 || t.length > s.length) return ''
  const need = new Map() // caractère → nombre encore requis (négatif = surplus)
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)
  let missing = t.length // caractères de t pas encore couverts
  let bestStart = 0
  let bestLen = Infinity
  let left = 0
  for (let right = 0; right < s.length; right++) {
    const c = s[right]
    if (need.has(c)) {
      if (need.get(c) > 0) missing-- // ce caractère était encore utile
      need.set(c, need.get(c) - 1)
    }
    // fenêtre couvrante : on la réduit tant qu'elle le reste
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1
        bestStart = left
      }
      const out = s[left]
      if (need.has(out)) {
        need.set(out, need.get(out) + 1)
        if (need.get(out) > 0) missing++ // on vient de perdre un caractère nécessaire
      }
      left++
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen)
}`,
    solutionEquiv: {
      python: `from collections import Counter

def min_window(s, t):
    if not t or len(t) > len(s):
        return ''
    need = Counter(t)
    missing = len(t)
    best_start, best_len = 0, float('inf')
    left = 0
    for right, c in enumerate(s):
        if c in need:
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_start, best_len = left, right - left + 1
            out = s[left]
            if out in need:
                need[out] += 1
                if need[out] > 0:
                    missing += 1
            left += 1
    return '' if best_len == float('inf') else s[best_start:best_start + best_len]`,
      java: `static String minWindow(String s, String t) {
    if (t.isEmpty() || t.length() > s.length()) return "";
    Map<Character, Integer> need = new HashMap<>();
    for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);
    int missing = t.length(), bestStart = 0, bestLen = Integer.MAX_VALUE, left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        Integer n = need.get(c);
        if (n != null) {
            if (n > 0) missing--;
            need.put(c, n - 1);
        }
        while (missing == 0) {
            if (right - left + 1 < bestLen) {
                bestLen = right - left + 1;
                bestStart = left;
            }
            char out = s.charAt(left++);
            Integer m = need.get(out);
            if (m != null) {
                need.put(out, m + 1);
                if (m + 1 > 0) missing++;
            }
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
}`,
      rust: `use std::collections::HashMap;

fn min_window(s: &str, t: &str) -> String {
    let s: Vec<char> = s.chars().collect();
    let t: Vec<char> = t.chars().collect();
    if t.is_empty() || t.len() > s.len() {
        return String::new();
    }
    let mut need: HashMap<char, i64> = HashMap::new();
    for &c in &t {
        *need.entry(c).or_insert(0) += 1;
    }
    let mut missing = t.len();
    let (mut best_start, mut best_len, mut left) = (0, usize::MAX, 0);
    for right in 0..s.len() {
        if let Some(n) = need.get_mut(&s[right]) {
            if *n > 0 {
                missing -= 1;
            }
            *n -= 1;
        }
        while missing == 0 {
            if right + 1 - left < best_len {
                best_len = right + 1 - left;
                best_start = left;
            }
            if let Some(n) = need.get_mut(&s[left]) {
                *n += 1;
                if *n > 0 {
                    missing += 1;
                }
            }
            left += 1;
        }
    }
    if best_len == usize::MAX {
        String::new()
    } else {
        s[best_start..best_start + best_len].iter().collect()
    }
}`,
    },
    tests: [
      { name: 'exemple classique', code: `assertEqual(minWindow('ADOBECODEBANC', 'ABC'), 'BANC')` },
      { name: 'un seul caractère', code: `assertEqual(minWindow('a', 'a'), 'a')
assertEqual(minWindow('a', 'b'), '')` },
      { name: 'multiplicités', code: `assertEqual(minWindow('a', 'aa'), '')
assertEqual(minWindow('aaflslflsldkalskaaa', 'aaa'), 'aaa')
assertEqual(minWindow('abcabdebac', 'abca'), 'abca')` },
      { name: 'casse et chaîne entière', code: `assertEqual(minWindow('aBc', 'abc'), '')
assertEqual(minWindow('xyz', 'zyx'), 'xyz')` },
      { name: 'égalité : la plus à gauche', code: `assertEqual(minWindow('abXba', 'ab'), 'ab')
assertEqual(minWindow('cabwefgewcwaefgcf', 'cae'), 'cwae')` },
      { name: 't vide ou plus long que s', code: `assertEqual(minWindow('abc', ''), '')
assertEqual(minWindow('ab', 'abc'), '')` },
      {
        name: 'grande entrée (|s| = 200 000)',
        code: `const n = 200000
const s = 'c' + 'a'.repeat(n - 2) + 'b'
const t0 = performance.now()
const r1 = minWindow(s, 'bc')
const r2 = minWindow(s, 'aaab')
const elapsed = performance.now() - t0
assertEqual(r1.length, n)
assertEqual(r2, 'aaab')
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (visez O(|s| + |t|))')`,
      },
    ],
    hints: [
      'Fenêtre variable pour un « plus court » : agrandissez à droite jusqu’à couvrir `t`, puis réduisez à gauche tant que la couverture tient, en enregistrant la meilleure fenêtre pendant la réduction.',
      'Pour savoir en O(1) si la fenêtre couvre `t`, gardez `need` (combien il faut encore de chaque caractère, négatif = surplus) et `missing` (nombre total de caractères encore manquants).',
      'À l’entrée de `c` : si `need[c] > 0`, alors `missing--` ; puis `need[c]--`. À la sortie : `need[c]++`, et si `need[c] > 0`, alors `missing++`. La fenêtre couvre `t` exactement quand `missing === 0`.',
    ],
    discussion: `**Complexité** : O(|s| + |t|) en temps (chaque indice de \`s\` entre et sort une fois), O(σ) en mémoire pour \`need\`, où σ est le nombre de caractères distincts de \`t\`.

**Points à évoquer** :

- force brute : toutes les sous-chaînes (O(n²)) avec une vérification de couverture : O(n² · σ) au mieux ;
- comparer deux tables de fréquences à chaque pas donne O(σ · n), acceptable pour un alphabet de 52 lettres, mais le compteur \`missing\` est l'idée attendue ;
- **optimisation** quand \`t\` est petit et \`s\` très long : filtrer d'abord \`s\` pour ne garder que les positions des caractères de \`t\`, puis faire glisser la fenêtre sur cette liste ;
- renvoyer \`s.slice\` **une seule fois** à la fin : découper à chaque amélioration coûterait O(n) par découpe ;
- variantes : plus petite sous-séquence (non contiguë) couvrante (DP), plus petite fenêtre contenant tous les caractères **distincts** de \`s\` lui-même, plus petit intervalle couvrant un élément de chacune de k listes (tas).`,
  },
)

quiz.push(
  {
    id: 'fo-q25',
    theme: 'fenetre',
    kind: 'qcm',
    q: 'Lequel de ces problèmes ne se résout **pas** avec une fenêtre glissante variable classique ?',
    choices: [
      'Plus longue sous-chaîne sans caractère répété',
      'Plus court sous-tableau de somme ≥ S, valeurs strictement positives',
      'Nombre de sous-tableaux de somme exactement k, valeurs positives et négatives',
      'Plus longue sous-chaîne avec au plus k caractères distincts',
    ],
    answer: 2,
    why: 'Avec des valeurs négatives, la somme n’est plus monotone quand on agrandit ou réduit la fenêtre : réduire peut faire monter la somme. On utilise alors les sommes préfixes avec une `Map` (compter les préfixes égaux à `prefix − k`). Les trois autres reposent sur une propriété monotone.',
  },
  {
    id: 'fo-q26',
    theme: 'fenetre',
    kind: 'qcm',
    q: 'Dans une fenêtre variable qui cherche le **plus court** sous-tableau valide, à quel moment met-on à jour la réponse ?',
    choices: [
      'Avant de faire entrer `nums[right]`',
      'Pendant la boucle de réduction, tant que la fenêtre est encore valide, avant de faire sortir `nums[left]`',
      'Après la boucle de réduction, quand la fenêtre vient de devenir invalide',
      'Uniquement à la fin du parcours',
    ],
    answer: 1,
    why: 'Pour un « plus court », chaque fenêtre valide rencontrée en réduisant est plus courte que la précédente : on enregistre à chaque tour de la boucle `while (valide)`. Pour un « plus long », c’est l’inverse : on réduit tant que la fenêtre est **invalide**, puis on enregistre.',
  },
  {
    id: 'fo-q27',
    theme: 'fenetre',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const nums = [1, 3, 2, 6, -1, 4]
const k = 3
let sum = 0
const sums = []
for (let i = 0; i < nums.length; i++) {
  sum += nums[i]
  if (i >= k) sum -= nums[i - k]
  if (i >= k - 1) sums.push(sum)
}
console.log(sums)`,
    choices: ['[ 6, 11, 7 ]', '[ 6, 11, 7, 9 ]', '[ 1, 4, 6, 11, 7, 9 ]', '[ 11, 7, 9 ]'],
    answer: 1,
    why: 'Il y a n − k + 1 = 4 fenêtres de taille 3 : 1 + 3 + 2 = 6, 3 + 2 + 6 = 11, 2 + 6 − 1 = 7 et 6 − 1 + 4 = 9. On commence à enregistrer quand `i` atteint `k − 1` (première fenêtre complète) et l’on retire `nums[i − k]` dès que `i ≥ k`.',
  },
  {
    id: 'fo-q28',
    theme: 'fenetre',
    kind: 'output',
    q: 'Qu’affiche ce code ?',
    code: `const count = new Map()
for (const ch of 'aabc') count.set(ch, (count.get(ch) ?? 0) + 1)
count.set('a', count.get('a') - 2)
console.log(count.size, count.get('a'))`,
    choices: ['2 0', '3 0', '3 undefined', '2 undefined'],
    answer: 1,
    why: 'Mettre un compteur à 0 ne supprime pas la clé : `size` vaut toujours 3 alors que la « fenêtre » ne contient plus que deux caractères distincts. Dans une fenêtre qui teste `count.size > k`, il faut `count.delete(ch)` quand le compteur tombe à 0.',
  },
  {
    id: 'fo-q29',
    theme: 'fenetre',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction (n = `s.length`) ?',
    code: `function longestUnique(s) {
  const seen = new Set()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left])
      left++
    }
    seen.add(s[right])
    best = Math.max(best, right - left + 1)
  }
  return best
}
longestUnique('abcabcbb')`,
    choices: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n · 26²)'],
    answer: 1,
    why: 'Analyse amortie : `left` ne recule jamais et ne dépasse pas `right`, donc la boucle `while` s’exécute au plus n fois **au total**. Chaque caractère est ajouté une fois et retiré au plus une fois : O(n), avec des opérations de `Set` en O(1) en moyenne.',
  },
  {
    id: 'fo-q30',
    theme: 'fenetre',
    kind: 'complexite',
    q: 'Quelle est la complexité en temps de cette fonction (n = `nums.length`) ?',
    code: `function maxSumOfK(nums, k) {
  let best = -Infinity
  for (let i = 0; i + k <= nums.length; i++) {
    let sum = 0
    for (let j = i; j < i + k; j++) sum += nums[j]
    best = Math.max(best, sum)
  }
  return best
}
maxSumOfK([2, 1, 5, 1, 3, 2], 3)`,
    choices: ['O(n)', 'O(n · k)', 'O(k)', 'O(n log k)'],
    answer: 1,
    why: 'Il y a n − k + 1 fenêtres et chacune est recalculée en O(k) : O((n − k + 1) · k), qu’on résume en O(n · k) (jusqu’à O(n²) quand k ≈ n/2). La fenêtre glissante met la somme à jour en O(1) par pas : O(n).',
  },
  {
    id: 'fo-q31',
    theme: 'fenetre',
    kind: 'bug',
    q: 'Cette version « à sauts » de la plus longue sous-chaîne sans répétition renvoie 3 pour `\'abba\'` au lieu de 2. Où est le bug ?',
    code: `function longestUnique(s) {
  const last = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    if (last.has(s[right])) left = last.get(s[right]) + 1
    last.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
longestUnique('abba')`,
    choices: [
      '`best` devrait être mis à jour avant `last.set`',
      '`left` peut reculer : il faut `left = Math.max(left, last.get(s[right]) + 1)`, car l’occurrence précédente peut être hors de la fenêtre',
      'Il faudrait `right - left` au lieu de `right - left + 1`',
      'Une `Map` ne peut pas avoir de clés d’un seul caractère',
    ],
    answer: 1,
    why: 'Sur `abba`, au second `b` la fenêtre devient `[2, 2]`. Au second `a`, la dernière occurrence de `a` (indice 0) est **avant** la fenêtre, mais le code ramène `left` à 1 : la fenêtre `[1, 3]` = `bba` contient deux `b` et la longueur 3 est fausse. La borne gauche ne doit jamais reculer.',
  },
  {
    id: 'fo-q32',
    theme: 'fenetre',
    kind: 'bug',
    q: 'Cette fonction doit renvoyer la longueur du plus long sous-tableau de somme ≤ `limit` (valeurs positives). Quel est le bug ?',
    code: `function longestAtMost(nums, limit) {
  let left = 0
  let sum = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]
    best = Math.max(best, right - left + 1)
    while (sum > limit) {
      sum -= nums[left]
      left++
    }
  }
  return best
}
longestAtMost([5, 1, 1], 2)`,
    choices: [
      'La réponse est mise à jour **avant** la réduction : une fenêtre invalide peut être comptée',
      '`sum -= nums[left]` devrait être `sum -= nums[right]`',
      'La boucle `while` rend l’algorithme quadratique',
      'Il faut initialiser `best` à `-Infinity`',
    ],
    answer: 0,
    why: 'Pour un « plus long », on réduit d’abord jusqu’à ce que la fenêtre soit valide, puis on met à jour. Ici, une fenêtre dont la somme dépasse `limit` est comptée : `longestAtMost([5], 2)` renvoie 1 au lieu de 0, et `longestAtMost([1, 9], 5)` renvoie 2 au lieu de 1.',
  },
)

pieges.push(
  {
    id: 'fo-p10',
    title: 'Longueur de fenêtre : le + 1 oublié',
    theme: 'fenetre',
    question: '`longestRun` doit renvoyer la longueur de la plus longue suite de caractères identiques. Qu’affiche ce code ?',
    code: `function longestRun(s) {
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    if (s[right] !== s[left]) left = right
    best = Math.max(best, right - left)
  }
  return best
}
console.log(longestRun('aaabb'), longestRun('x'))`,
    output: `2 0`,
    explanation: 'Avec des bornes **incluses** `[left, right]`, la fenêtre contient `right - left + 1` éléments. Oublier le `+ 1` sous-estime toutes les longueurs d’une unité, et une fenêtre d’un seul élément compte pour 0. C’est l’erreur de décalage la plus fréquente du thème ; un test sur une chaîne d’un caractère la révèle immédiatement.',
    fix: {
      code: `function longestRun(s) {
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    if (s[right] !== s[left]) left = right
    best = Math.max(best, right - left + 1)
  }
  return best
}
console.log(longestRun('aaabb'), longestRun('x'), longestRun(''))`,
      output: `3 1 0`,
    },
  },
  {
    id: 'fo-p11',
    title: 'Fenêtre variable et nombres négatifs',
    theme: 'fenetre',
    question: 'On cherche le plus court sous-tableau de somme ≥ 7 dans `[1, -5, 4, 3]` (réponse attendue : 2, avec `[4, 3]`). Qu’affiche ce code ?',
    code: `function minLenAtLeast(nums, target) {
  let left = 0
  let sum = 0
  let best = Infinity
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]
    while (sum >= target) {
      best = Math.min(best, right - left + 1)
      sum -= nums[left]
      left++
    }
  }
  return best === Infinity ? 0 : best
}
console.log(minLenAtLeast([1, -5, 4, 3], 7))`,
    output: `0`,
    explanation: 'La fenêtre ne se réduit que lorsque la somme atteint la cible. Ici, le préfixe `1, -5` plombe la somme (elle n’atteint que 3 au total) et n’est jamais retiré, alors que l’abandonner ferait apparaître `[4, 3]`. Avec des négatifs, la somme n’est plus monotone : la fenêtre glissante est incorrecte. Il faut les sommes préfixes, ici avec une deque monotone croissante d’indices (LeetCode 862).',
    fix: {
      code: `function shortestSubarray(nums, k) {
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  const dq = [] // indices de préfixes croissants
  let head = 0
  let best = Infinity
  for (let j = 0; j < prefix.length; j++) {
    while (dq.length > head && prefix[j] - prefix[dq[head]] >= k) {
      best = Math.min(best, j - dq[head])
      head++
    }
    while (dq.length > head && prefix[dq[dq.length - 1]] >= prefix[j]) dq.pop()
    dq.push(j)
  }
  return best === Infinity ? 0 : best
}
console.log(shortestSubarray([1, -5, 4, 3], 7))`,
      output: `2`,
    },
  },
  {
    id: 'fo-p12',
    title: 'Comparer deux tableaux de compteurs avec ===',
    theme: 'fenetre',
    question: 'Pour tester si la fenêtre est une anagramme du motif, on compare les tableaux de compteurs. Qu’affiche ce code ?',
    code: `const need = [1, 1, 0]
const win = [1, 1, 0]
console.log(need === win)
console.log(need.join() === win.join())`,
    output: `false
true`,
    explanation: '`===` compare des **références** : deux tableaux distincts ne sont jamais égaux, même avec le même contenu. Une fenêtre d’anagrammes testée ainsi ne trouve jamais rien. `join()` fonctionne mais coûte O(σ) et alloue une chaîne à chaque pas ; mieux vaut une boucle de comparaison, ou maintenir un compteur `matches` des lettres dont les deux compteurs sont égaux, mis à jour en O(1).',
    fix: {
      code: `function sameCounts(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}
console.log(sameCounts([1, 1, 0], [1, 1, 0]), sameCounts([1, 1, 0], [1, 0, 1]))`,
      output: `true false`,
      equiv: {
        python: `# == compare le contenu des listes en Python
print([1, 1, 0] == [1, 1, 0])`,
        java: `// == compare les références ; Arrays.equals compare le contenu
System.out.println(java.util.Arrays.equals(new int[] { 1, 1, 0 }, new int[] { 1, 1, 0 }));`,
        rust: `// == compare le contenu des tableaux et des Vec
println!("{}", [1, 1, 0] == [1, 1, 0]);`,
        php: `// == compare les paires clé/valeur, === exige aussi les mêmes types et le même ordre
var_dump([1, 1, 0] === [1, 1, 0]);`,
      },
    },
  },
)

flashcards.push(
  { id: 'fo-f25', theme: 'fenetre', front: 'Quels signaux dans un énoncé évoquent une fenêtre glissante ?', back: 'Sous-tableau ou sous-chaîne **contigu**, « plus long », « plus court », « au plus k », « de taille k », « contenant tous les caractères de… ». Et une propriété **monotone** (valeurs positives, comptage de distincts, pas de répétition).' },
  { id: 'fo-f26', theme: 'fenetre', front: 'Gabarit de la fenêtre variable pour un « plus long » ?', back: 'Pour chaque `right` : faire entrer `nums[right]` ; **tant que** la fenêtre est invalide, faire sortir `nums[left++]` ; puis `best = max(best, right − left + 1)`.' },
  { id: 'fo-f27', theme: 'fenetre', front: 'Pourquoi une fenêtre glissante est-elle en O(n) malgré la boucle `while` imbriquée ?', back: '`left` et `right` ne reculent jamais et ne dépassent pas n : chaque élément entre une fois et sort au plus une fois. La boucle `while` fait au plus n tours **au total**.' },
  { id: 'fo-f28', theme: 'fenetre', front: 'Comment compter les sous-tableaux avec **exactement** k éléments distincts ?', back: '`atMost(k) − atMost(k − 1)`, où `atMost` est une fenêtre variable qui ajoute `right − left + 1` à chaque pas (nombre de sous-tableaux valides finissant en `right`).' },
  { id: 'fo-f29', theme: 'fenetre', front: 'Dans une fenêtre avec `Map` de comptage, que faire quand un compteur tombe à 0 ?', back: 'Supprimer la clé (`map.delete(c)`), sinon `map.size` ne reflète plus le nombre d’éléments distincts présents.' },
  { id: 'fo-f30', theme: 'fenetre', front: 'Plus petite fenêtre couvrante : quel état maintenir ?', back: '`need` (caractère → nombre encore requis, négatif = surplus) et `missing` (total manquant). Entrée : si `need[c] > 0`, `missing--` ; `need[c]--`. Sortie : `need[c]++` ; si `need[c] > 0`, `missing++`. Couvrant ⇔ `missing === 0`.' },
  { id: 'fo-f31', theme: 'fenetre', front: 'Comment obtenir le maximum de chaque fenêtre de taille k en O(n) ?', back: 'Une **deque d’indices** à valeurs décroissantes : retirer par l’arrière les indices de valeur ≤ à l’arrivant, retirer la tête si elle sort de la fenêtre ; la tête est le maximum. Voir le thème des piles monotones.' },
  { id: 'fo-f32', theme: 'fenetre', front: 'Fenêtre de taille fixe : la mise à jour à chaque pas ?', back: 'Ajouter l’entrant, retirer le sortant d’indice `right − k`.', code: `const nums = [2, 1, 5, 1, 3]
let sum = 2 + 1 + 5
sum += nums[3] - nums[0]
sum // → 7` },
)

lexique.push(
  { term: 'Fenêtre glissante', theme: 'fenetre', def: 'Technique qui parcourt les sous-tableaux contigus `[left, right]` en mettant à jour un état quand un élément entre à droite ou sort à gauche, au lieu de tout recalculer. Les deux bornes ne reculent jamais : O(n) au total.', see: ['Fenêtre de taille fixe', 'Fenêtre variable', 'Deux pointeurs (two pointers)'] },
  { term: 'Fenêtre de taille fixe', theme: 'fenetre', def: 'Fenêtre glissante de largeur k imposée : à chaque pas, l’élément `right` entre et l’élément `right − k` sort. Sert pour les sommes, moyennes ou compteurs sur k éléments consécutifs.', see: ['Fenêtre glissante'] },
  { term: 'Fenêtre variable', theme: 'fenetre', def: 'Fenêtre glissante dont la taille s’adapte : on l’agrandit à droite à chaque pas et on la réduit à gauche tant qu’elle viole la contrainte. Exige une contrainte monotone ; donne le plus long ou le plus court sous-tableau valide.', see: ['Propriété monotone (fenêtre)', 'Fenêtre glissante'] },
  { term: 'Propriété monotone (fenêtre)', theme: 'fenetre', def: 'Condition qui rend la fenêtre variable correcte : si une fenêtre est valide, toutes ses sous-fenêtres le sont (ou, inversement, toutes ses sur-fenêtres). Vraie pour « au plus k distincts » ou « somme ≤ S » avec des valeurs positives ; fausse pour une somme avec des négatifs.' },
  { term: 'Compteur de manquants', theme: 'fenetre', def: 'Entier `missing` qui compte les éléments requis encore absents de la fenêtre (fenêtre minimale couvrante, anagrammes). Mis à jour en O(1) à chaque entrée ou sortie, il évite de comparer deux tables de fréquences à chaque pas.', see: ['Fenêtre variable'] },
  { term: 'Exactement k par différence', theme: 'fenetre', def: 'Astuce de comptage : le nombre de sous-tableaux vérifiant « exactement k » (distincts, impairs…) vaut `atMost(k) − atMost(k − 1)`, car « au plus k » est monotone et se compte par fenêtre glissante, contrairement à « exactement k ».', see: ['Fenêtre variable'] },
)

entretien.push(
  {
    id: 'fo-e10',
    section: 'techniques',
    q: 'Présentez le gabarit de la fenêtre glissante variable et justifiez sa complexité.',
    answer: 'Deux indices `left` et `right` délimitent la fenêtre `[left, right]`, plus un état (somme, `Map` de comptage, `Set`). À chaque tour, `right` avance et l’élément entre dans l’état ; tant que la fenêtre viole la contrainte, l’élément `left` sort et `left` avance ; on met ensuite à jour la réponse (pour un « plus court », pendant la réduction).\n\nComplexité : chaque indice entre une fois et sort au plus une fois, donc O(n) mises à jour d’état, chacune en O(1) (en moyenne pour une `Map`). La mémoire est celle de l’état : O(1) pour une somme, O(σ) ou O(k) pour un comptage.\n\nJe précise la condition de validité : la contrainte doit être monotone. Sinon (somme avec des négatifs, « exactement k »), je passe aux préfixes + `Map` ou à la différence atMost(k) − atMost(k − 1).',
    attendu: 'Un gabarit précis (entrer, réduire, mettre à jour), l’argument amorti pour O(n), et la condition de monotonie qui délimite le domaine de validité.',
    code: `function longestAtMostKDistinct(s, k) {
  const count = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) ?? 0) + 1)
    while (count.size > k) {
      const c = s[left++]
      if (count.get(c) === 1) count.delete(c)
      else count.set(c, count.get(c) - 1)
    }
    best = Math.max(best, right - left + 1)
  }
  return best
}
longestAtMostKDistinct('eceba', 2) // → 3`,
  },
  {
    id: 'fo-e11',
    section: 'conception',
    q: 'Concevez une classe qui reçoit un flux de mesures et renvoie à tout moment la moyenne et le maximum des k dernières valeurs.',
    answer: 'C’est une fenêtre glissante de taille fixe sur un flux. Pour la **moyenne**, je garde les k dernières valeurs dans un tampon circulaire (tableau de taille k et indice modulo k) et une somme courante : à chaque ajout, `sum += x − valeurSortante`. Ajout et lecture en O(1), mémoire O(k).\n\nPour le **maximum**, la somme ne suffit pas, car le maximum n’est pas réversible. J’utilise une deque monotone décroissante de paires (indice, valeur) : à l’ajout, je retire par l’arrière les valeurs ≤ x, puis je retire la tête si son indice est sorti de la fenêtre. Ajout en O(1) amorti, maximum en O(1).\n\nQuestions à poser : k est-il fixe ? Faut-il gérer le début du flux (moins de k valeurs) ? La moyenne doit-elle être exacte (somme entière plutôt que flottante pour éviter la dérive) ? Pour une fenêtre définie par le **temps** (les 5 dernières minutes), je stocke des horodatages et je retire en tête tant qu’ils sont trop anciens.',
    attendu: 'Reconnaître une fenêtre fixe sur un flux, distinguer un agrégat réversible (somme) d’un agrégat non réversible (maximum, qui demande une deque monotone), et clarifier les cas limites.',
  },
)

// ═════════════════════════════════════════════════════════════════════════════
// ENTRETIEN : SECTION GÉNÉRALE
// ═════════════════════════════════════════════════════════════════════════════

entretien.push(
  {
    id: 'fo-e12',
    section: 'general',
    q: 'Comment se déroule un entretien d’algorithmique de 45 minutes, et comment répartissez-vous votre temps ?',
    answer: 'Un découpage qui fonctionne :\n\n- **5 minutes** : comprendre et clarifier. Reformuler l’énoncé, poser les questions sur les entrées, les bornes et les cas limites, dérouler un exemple à la main ;\n- **5 à 10 minutes** : concevoir. Annoncer la force brute et sa complexité, puis chercher mieux en s’appuyant sur les contraintes ; se mettre d’accord avec le recruteur sur l’approche **avant** de coder ;\n- **15 à 20 minutes** : coder proprement, en commentant à voix haute les choix (noms explicites, fonctions auxiliaires) ;\n- **5 à 10 minutes** : tester à la main sur l’exemple puis sur les cas limites, corriger, annoncer la complexité finale en temps et en mémoire, évoquer les variantes.\n\nLe piège classique est de coder dès la lecture de l’énoncé : on code la mauvaise solution, ou la bonne solution d’un autre problème.',
    attendu: 'Une démarche structurée et visible : clarifier, concevoir, valider l’approche, coder, tester, analyser. Le recruteur évalue la méthode autant que le résultat.',
  },
  {
    id: 'fo-e13',
    section: 'general',
    q: 'Quelles questions posez-vous avant d’écrire la moindre ligne de code ?',
    answer: 'Je clarifie quatre familles de points :\n\n- **Entrées** : type et taille maximale (c’est elle qui fixe la complexité visée), valeurs négatives, doublons, tableau trié ou non, chaîne ASCII ou Unicode, entrée vide possible ?\n- **Sortie** : indices ou valeurs, ordre imposé, que renvoyer s’il n’y a pas de solution (`null`, `-1`, tableau vide), plusieurs solutions possibles ?\n- **Contraintes** : peut-on modifier l’entrée, mémoire limitée, appels répétés (précalcul rentable), données en flux ?\n- **Cas limites** : un seul élément, tous égaux, valeurs extrêmes (dépassement de 2⁵³ en JavaScript).\n\nJe confirme ensuite ma compréhension sur un petit exemple que je construis moi-même, idéalement un exemple qui contient un piège (doublon, négatif).',
    attendu: 'Montrer que l’on ne fait pas d’hypothèses silencieuses, et que l’on relie les réponses (taille de l’entrée, tri, mutation) aux choix d’algorithme.',
  },
  {
    id: 'fo-e14',
    section: 'general',
    q: 'Faut-il présenter la solution naïve si l’on voit déjà une solution optimale ?',
    answer: 'Oui, brièvement. Énoncer la force brute en une ou deux phrases avec sa complexité (« toutes les paires, O(n²) en temps, O(1) en mémoire ») montre que l’on a compris le problème, donne une référence pour mesurer l’amélioration et constitue un filet de sécurité si l’optimisation échoue.\n\nEnsuite, j’explique **d’où vient** l’optimisation : « la boucle intérieure ne fait que chercher un complément, une `Map` le trouve en O(1) » ; « le tableau est trié, deux pointeurs éliminent un candidat à chaque pas ». Je chiffre la nouvelle complexité et le compromis (souvent de la mémoire contre du temps), puis je demande si l’approche convient avant de coder.\n\nSi le temps est très court ou si la solution optimale est délicate, il vaut mieux coder une force brute correcte que laisser une solution optimale inachevée.',
    attendu: 'Une progression argumentée de la force brute vers l’optimum, avec les complexités annoncées à chaque étape et un accord explicite avant de coder.',
  },
  {
    id: 'fo-e15',
    section: 'general',
    q: 'Vous êtes bloqué depuis plusieurs minutes. Que faites-vous ?',
    answer: 'Je ne reste pas silencieux : le recruteur ne peut aider que s’il voit où j’en suis. Je déroule une liste de leviers, à voix haute :\n\n- **revenir aux exemples** : résoudre un petit cas à la main et observer ce que je fais naturellement ;\n- **relire les contraintes** : n ≤ 20 suggère l’exhaustif, n ≤ 10⁵ impose O(n log n), « trié » suggère dichotomie ou deux pointeurs ;\n- **passer en revue les motifs** : hachage, deux pointeurs, fenêtre, préfixes, tri, pile monotone, BFS/DFS, tas, dichotomie sur la réponse, programmation dynamique ;\n- **simplifier** : résoudre une version plus facile (sans doublons, en 1D, avec k = 1), puis généraliser ;\n- **partir de la force brute** et chercher le travail répété qu’on pourrait mémoriser ou précalculer.\n\nSi un indice vient, je le prends sans me justifier et je l’exploite immédiatement. Accepter un indice coûte bien moins cher que rester bloqué.',
    attendu: 'De la méthode face à l’incertitude, de la communication, et la capacité à rebondir sur un indice.',
  },
  {
    id: 'fo-e16',
    section: 'general',
    q: 'Comment testez-vous votre code quand vous ne pouvez pas l’exécuter ?',
    answer: 'En trois temps :\n\n- **relecture ciblée** : bornes de boucles (`<` ou `<=`), initialisations (0, `-Infinity`, `nums[0]`), indices `i + 1` et `i - 1`, valeur de retour dans chaque branche, mutation involontaire de l’entrée ;\n- **exécution à la main** sur l’exemple de l’énoncé, en tenant un tableau des variables à chaque tour (`left`, `right`, `sum`, contenu de la `Map`) ;\n- **cas limites** : entrée vide, un seul élément, tous égaux, aucun résultat, valeurs négatives, très grandes valeurs, doublons.\n\nQuand je trouve un bug, je l’annonce, je corrige à l’endroit précis et je refais passer le cas qui l’a révélé. Je termine en rappelant la complexité. Si l’environnement permet d’exécuter, j’écris quelques assertions plutôt que des `console.log` épars.',
    attendu: 'Une vérification systématique et non improvisée, avec une liste de cas limites spontanée et une correction posée des erreurs.',
    code: `function maxSub(nums) {
  let best = nums[0]
  let cur = nums[0]
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i])
    best = Math.max(best, cur)
  }
  return best
}

const cases = [
  [[-2, 1, -3, 4, -1, 2, 1, -5, 4], 6],
  [[5], 5],
  [[-3, -1, -2], -1],
]
const failures = cases.filter(([input, expected]) => maxSub(input) !== expected)
failures.length // → 0`,
  },
  {
    id: 'fo-e17',
    section: 'general',
    q: 'Comment annoncez-vous la complexité de votre solution, et quels détails le recruteur attend-il ?',
    answer: 'J’annonce **temps et mémoire**, chacun justifié en une phrase à partir du code : « une boucle sur n éléments, chaque opération de `Map` en O(1) en moyenne : O(n) en temps ; la `Map` contient au plus n entrées : O(n) en mémoire ».\n\nDétails qui font la différence :\n\n- nommer **chaque variable** quand il y en a plusieurs : O(n · m), O(V + E), O(n · k log k) pour n mots de longueur k ;\n- préciser **moyenne, amorti ou pire cas** quand ils diffèrent (table de hachage, tri rapide, `push`) ;\n- ne pas oublier les **coûts cachés** : tri préalable, `slice`, `includes`, hachage de clés longues, pile de récursion ;\n- dire si la mémoire compte ou non la **sortie** ;\n- savoir dire si l’on peut faire mieux, et pourquoi pas (borne inférieure, par exemple Ω(n) car il faut lire l’entrée).',
    attendu: 'Une analyse précise et honnête, qui couvre temps et mémoire, les coûts cachés et la nature de la borne (moyenne, amortie, pire cas).',
  },
)

export const pack: ThemePack = { cours, katas, quiz, pieges, flashcards, lexique, entretien }
