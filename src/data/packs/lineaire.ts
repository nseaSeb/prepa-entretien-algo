import type { ThemePack } from '../types'

/**
 * Pack « linéaire » : piles et files, recherche dichotomique, tris, récursion et backtracking.
 * Identifiants préfixés par `li-`. Règles de vérification : voir l'en-tête de src/data/types.ts.
 */

// =============================================================================
// PILES, FILES, PILE MONOTONE
// =============================================================================
const piles: ThemePack = {
  cours: [
    {
      id: 'piles',
      title: 'Piles, files, pile monotone',
      summary: 'La pile (LIFO) et la file (FIFO) sont les deux structures linéaires de base ; la pile monotone et la deque monotone transforment des problèmes en O(n²) en O(n).',
      blocks: [
        { p: `Une **pile** (*stack*) range les éléments comme une pile d'assiettes : on ajoute et on retire toujours **au sommet** (dernier entré, premier sorti : **LIFO**). Une **file** (*queue*) fonctionne comme une file d'attente : on ajoute à la fin et on retire au début (premier entré, premier sorti : **FIFO**). Ces deux structures paraissent simples, mais une grande partie des exercices d'entretien « en O(n) » reposent sur elles : parenthèses, expressions, parcours en largeur, et surtout la **pile monotone**.` },
        { p: `JavaScript n'a ni classe \`Stack\` ni classe \`Queue\` : on se sert d'un tableau. C'est parfait pour une pile, mais **dangereux pour une file**, car \`shift()\` décale tous les éléments et coûte O(n).` },

        { h: 'La pile avec un tableau', id: 'piles-pile' },
        { p: `\`push\` ajoute à la fin et \`pop\` retire à la fin : les deux sont en **O(1) amorti** (le tableau se réalloue de temps en temps, mais en moyenne chaque opération coûte une constante). Le sommet se lit avec \`stack[stack.length - 1]\` ou \`stack.at(-1)\`. Attention : \`pop()\` sur une pile vide renvoie \`undefined\` sans erreur, il faut donc tester \`stack.length\` soi-même.` },
        {
          title: 'Opérations de base',
          code: `const stack = []
stack.push(1)
stack.push(2)
stack.push(3)
stack.at(-1) // → 3
stack.pop() // → 3
stack.pop() // → 2
stack.length // → 1
stack.pop() // → 1
stack.pop() // → undefined`,
          equiv: {
            python: `stack = []
stack.append(1)
stack.append(2)
stack.append(3)
top = stack[-1]
stack.pop()
stack.pop()
size = len(stack)
stack.pop()
# stack.pop() sur une liste vide lève IndexError (contrairement à JS)`,
            java: `// Stack<Integer> est historique (synchronisée) : on préfère ArrayDeque
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.push(3);
int top = stack.peek();
stack.pop();
stack.pop();
int size = stack.size();
stack.pop();
// stack.pop() sur une pile vide lève NoSuchElementException ; poll() renvoie null`,
            rust: `let mut stack: Vec<i32> = Vec::new();
stack.push(1);
stack.push(2);
stack.push(3);
let top = stack.last(); // Option<&i32>
stack.pop(); // Some(3)
stack.pop(); // Some(2)
let size = stack.len();
stack.pop(); // Some(1)
stack.pop(); // None : pas d'erreur, mais un Option à traiter`,
            php: `$stack = [];
$stack[] = 1;           // ou array_push($stack, 1)
$stack[] = 2;
$stack[] = 3;
$top = end($stack);
array_pop($stack);
array_pop($stack);
$size = count($stack);
array_pop($stack);
// array_pop sur un tableau vide renvoie null
// SplStack existe aussi : $s = new SplStack(); $s->push(1); $s->top(); $s->pop();`,
          },
        },
        { p: `**Quand penser à une pile ?** Dès que l'énoncé parle de structures **imbriquées** (parenthèses, balises, appels de fonctions), d'**annuler la dernière action**, d'évaluer une expression, ou de retrouver « le dernier élément encore ouvert ». Le cas d'école est la vérification des parenthèses : chaque fermante doit correspondre à l'ouvrante la plus récente non encore fermée, c'est-à-dire au sommet de la pile.` },
        {
          title: 'Parenthèses équilibrées : le modèle',
          code: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') stack.push(c)
    else if (stack.pop() !== pairs[c]) return false // fermante orpheline ou mal appariée
  }
  return stack.length === 0 // il ne doit rester aucune ouvrante
}

isValid('([]{})') // → true
isValid('([)]') // → false
isValid('((') // → false
isValid(')') // → false`,
          equiv: {
            python: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif not stack or stack.pop() != pairs[c]:
            return False
    return not stack`,
            java: `static boolean isValid(String s) {
    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') stack.push(c);
        else if (stack.isEmpty() || stack.pop() != pairs.get(c).charValue()) return false;
    }
    return stack.isEmpty();
}`,
          },
        },
        { p: `Deuxième grand classique : l'**évaluation d'une expression en notation polonaise inverse** (RPN, *Reverse Polish Notation*), où l'opérateur suit ses opérandes : \`3 4 + 2 *\` vaut \`(3 + 4) * 2\`. On empile les nombres ; à chaque opérateur, on dépile **b puis a** (l'ordre compte pour \`-\` et \`/\`) et on empile \`a op b\`.` },
        {
          title: 'Évaluation RPN',
          code: `function evalRPN(tokens) {
  const stack = []
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop()
      const a = stack.pop() // a a été empilé AVANT b
      if (t === '+') stack.push(a + b)
      else if (t === '-') stack.push(a - b)
      else if (t === '*') stack.push(a * b)
      else stack.push(Math.trunc(a / b)) // division entière tronquée vers zéro
    } else stack.push(Number(t))
  }
  return stack.pop()
}

evalRPN(['3', '4', '+', '2', '*']) // → 14
evalRPN(['4', '13', '5', '/', '+']) // → 6
evalRPN(['7', '-2', '/']) // → -3`,
        },
        { mnemo: `Pile = assiettes : on pose et on reprend **en haut**. « Le plus récent encore ouvert » = sommet de la pile.`, piege: `\`stack.pop()\` sur une pile vide renvoie \`undefined\` sans erreur : une fermante orpheline passe inaperçue si l'on ne compare pas le résultat. En RPN, dépiler dans le mauvais ordre inverse \`a - b\` en \`b - a\`.` },

        { h: 'La file : pourquoi pas shift()', id: 'piles-file' },
        { p: `La tentation est d'écrire une file avec \`push\` et \`shift\`. Problème : \`shift()\` retire l'élément d'indice 0 puis **renumérote tous les autres**, ce qui coûte O(n). Un parcours en largeur (BFS) qui fait \`queue.shift()\` sur une file de n éléments devient alors O(n²). V8 optimise parfois les petits tableaux, mais il ne faut pas compter dessus : sur 10⁵ éléments la différence est spectaculaire.` },
        { p: `La solution la plus simple en entretien : **garder un index de tête** au lieu de retirer réellement. On lit \`queue[head++]\` ; les cases déjà lues restent en mémoire, ce qui est acceptable pour un BFS. Si la mémoire compte, on utilise un **tampon circulaire** (tableau de taille fixe où les indices tournent modulo la capacité).` },
        {
          title: 'File avec index de tête (BFS)',
          code: `const queue = [1]
let head = 0
const order = []
while (head < queue.length) {
  const x = queue[head++] // O(1), contrairement à queue.shift()
  order.push(x)
  if (x < 4) queue.push(2 * x, 2 * x + 1)
}
console.log(order.join(' '))`,
          output: `1 2 3 4 5 6 7`,
          equiv: {
            python: `from collections import deque

queue = deque([1])
order = []
while queue:
    x = queue.popleft()  # O(1) ; list.pop(0) serait O(n) comme shift()
    order.append(x)
    if x < 4:
        queue.extend([2 * x, 2 * x + 1])
print(' '.join(map(str, order)))`,
            java: `Deque<Integer> queue = new ArrayDeque<>(List.of(1));
List<Integer> order = new ArrayList<>();
while (!queue.isEmpty()) {
    int x = queue.poll(); // O(1)
    order.add(x);
    if (x < 4) { queue.offer(2 * x); queue.offer(2 * x + 1); }
}`,
            rust: `use std::collections::VecDeque;

let mut queue: VecDeque<i32> = VecDeque::from([1]);
let mut order = Vec::new();
while let Some(x) = queue.pop_front() { // O(1) : VecDeque est un tampon circulaire
    order.push(x);
    if x < 4 { queue.push_back(2 * x); queue.push_back(2 * x + 1); }
}`,
            php: `$queue = new SplQueue();
$queue->enqueue(1);
$order = [];
while (!$queue->isEmpty()) {
    $x = $queue->dequeue(); // O(1) ; array_shift serait O(n)
    $order[] = $x;
    if ($x < 4) { $queue->enqueue(2 * $x); $queue->enqueue(2 * $x + 1); }
}`,
          },
        },
        { p: `Le **tampon circulaire** stocke les éléments dans un tableau de capacité fixe ; \`head\` désigne le premier élément et \`(head + size) % cap\` la première case libre. Quand le tableau est plein, on double la capacité en recopiant les éléments dans l'ordre. C'est exactement ainsi que sont implémentés \`collections.deque\` (par blocs), \`ArrayDeque\` en Java et \`VecDeque\` en Rust. Une **deque** (*double-ended queue*) autorise en plus l'ajout et le retrait aux deux bouts, toujours en O(1).` },
        {
          title: 'Deque implémentée à la main (tampon circulaire)',
          code: `class Deque {
  constructor(cap = 4) {
    this.buf = new Array(cap)
    this.head = 0
    this.size = 0
  }
  grow() {
    const old = this.buf
    this.buf = new Array(old.length * 2)
    for (let i = 0; i < this.size; i++) this.buf[i] = old[(this.head + i) % old.length]
    this.head = 0
  }
  pushBack(x) {
    if (this.size === this.buf.length) this.grow()
    this.buf[(this.head + this.size) % this.buf.length] = x
    this.size++
  }
  pushFront(x) {
    if (this.size === this.buf.length) this.grow()
    this.head = (this.head - 1 + this.buf.length) % this.buf.length // jamais d'indice négatif
    this.buf[this.head] = x
    this.size++
  }
  popFront() {
    if (this.size === 0) return undefined
    const x = this.buf[this.head]
    this.buf[this.head] = undefined // libère la référence
    this.head = (this.head + 1) % this.buf.length
    this.size--
    return x
  }
  popBack() {
    if (this.size === 0) return undefined
    const i = (this.head + this.size - 1) % this.buf.length
    const x = this.buf[i]
    this.buf[i] = undefined
    this.size--
    return x
  }
}

const d = new Deque(2)
d.pushBack(1)
d.pushBack(2)
d.pushFront(0) // déclenche l'agrandissement
d.pushBack(3)
console.log(d.popFront(), d.popBack(), d.popFront(), d.popFront(), d.popFront())`,
          output: `0 3 1 2 undefined`,
        },
        { p: `Variante très demandée : **une file avec deux piles**. On pousse dans \`inStack\` ; pour défiler, si \`outStack\` est vide on y transvase tout \`inStack\` (ce qui inverse l'ordre), puis on dépile \`outStack\`. Chaque élément est déplacé au plus une fois de \`inStack\` vers \`outStack\` : le coût est **O(1) amorti** par opération, même si un défilement isolé peut coûter O(n).` },
        {
          title: 'File avec deux piles',
          code: `class TwoStackQueue {
  constructor() {
    this.inStack = []
    this.outStack = []
  }
  enqueue(x) {
    this.inStack.push(x)
  }
  dequeue() {
    if (this.outStack.length === 0) {
      while (this.inStack.length) this.outStack.push(this.inStack.pop())
    }
    return this.outStack.pop()
  }
}

const q = new TwoStackQueue()
q.enqueue('a')
q.enqueue('b')
q.dequeue() // → 'a'
q.enqueue('c')
q.dequeue() // → 'b'
q.dequeue() // → 'c'`,
          equiv: {
            python: `class TwoStackQueue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def enqueue(self, x):
        self.in_stack.append(x)

    def dequeue(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())
        return self.out_stack.pop()`,
            java: `class TwoStackQueue<T> {
    private final Deque<T> inStack = new ArrayDeque<>();
    private final Deque<T> outStack = new ArrayDeque<>();

    void enqueue(T x) { inStack.push(x); }

    T dequeue() {
        if (outStack.isEmpty()) {
            while (!inStack.isEmpty()) outStack.push(inStack.pop());
        }
        return outStack.pop();
    }
}`,
          },
        },
        { mnemo: `File = file d'attente : on entre **derrière**, on sort **devant**. En JS : \`queue[head++]\`, jamais \`shift()\` dans une boucle.`, piege: `\`queue.shift()\` dans un BFS rend l'algorithme quadratique. Dans un tampon circulaire, \`(head - 1) % cap\` vaut \`-1\` quand \`head\` est nul : il faut ajouter \`cap\` avant le modulo.` },

        { h: 'La pile monotone', id: 'piles-monotone' },
        { p: `Une **pile monotone** est une pile dont les éléments restent triés (croissants ou décroissants) du bas vers le haut. Avant d'empiler un élément, on **dépile tous ceux qui violeraient l'ordre**, et c'est au moment où un élément est dépilé qu'on a trouvé sa réponse. Comme chaque élément est empilé une fois et dépilé au plus une fois, le total est **O(n)**, même avec un \`while\` imbriqué dans le \`for\`.` },
        { p: `**Signaux dans l'énoncé** : « le prochain élément plus grand / plus petit », « combien de jours avant une température plus chaude », « la première barre plus basse à gauche et à droite », « la portée d'une action en bourse », « le plus grand rectangle ». Toute recherche du **plus proche élément qui domine** se résout ainsi.` },
        {
          title: "Prochain élément plus grand (pile décroissante d'indices)",
          code: `function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1)
  const stack = [] // indices dont on cherche encore le prochain plus grand ; valeurs décroissantes
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      res[stack.pop()] = nums[i] // nums[i] est le premier plus grand pour cet indice
    }
    stack.push(i)
  }
  return res // les indices restés dans la pile n'ont pas de plus grand : -1
}

nextGreater([2, 1, 2, 4, 3]) // → [ 4, 2, 4, -1, -1 ]`,
          equiv: {
            python: `def next_greater(nums):
    res = [-1] * len(nums)
    stack = []  # indices, valeurs décroissantes
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res`,
            java: `static int[] nextGreater(int[] nums) {
    int[] res = new int[nums.length];
    Arrays.fill(res, -1);
    Deque<Integer> stack = new ArrayDeque<>(); // indices
    for (int i = 0; i < nums.length; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
            res[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return res;
}`,
            rust: `fn next_greater(nums: &[i32]) -> Vec<i32> {
    let mut res = vec![-1; nums.len()];
    let mut stack: Vec<usize> = Vec::new(); // indices
    for i in 0..nums.len() {
        while let Some(&top) = stack.last() {
            if nums[top] >= nums[i] { break; }
            res[top] = nums[i];
            stack.pop();
        }
        stack.push(i);
    }
    res
}`,
          },
        },
        { p: `On empile des **indices** plutôt que des valeurs : on retrouve la valeur avec \`nums[i]\`, et l'indice donne en plus la distance (températures) ou la largeur (rectangle). Pour un **tableau circulaire**, on parcourt \`2n\` positions avec \`i % n\` et l'on n'empile que pendant le premier tour.` },
        { table: [
          ['On cherche…', 'Pile', 'Condition de dépilement'],
          ['le prochain plus grand', 'décroissante', '`nums[top] < nums[i]`'],
          ['le prochain plus petit', 'croissante', '`nums[top] > nums[i]`'],
          ['le précédent plus grand', 'décroissante', 'après dépilement, le sommet est la réponse'],
          ['le plus grand rectangle', 'croissante', '`h[top] >= h[i]` : la barre dépilée est bornée des deux côtés'],
        ] },
        { p: `**Plus grand rectangle dans un histogramme.** Pour chaque barre, le plus grand rectangle de cette hauteur s'étend jusqu'à la première barre plus basse à gauche et à droite. Avec une pile croissante, quand une barre plus basse arrive, la barre dépilée connaît enfin sa borne droite (\`i\`) ; sa borne gauche est le nouveau sommet. Une **sentinelle** de hauteur 0 à la fin vide la pile sans cas particulier.` },
        {
          title: 'Plus grand rectangle dans un histogramme',
          code: `function largestRectangle(heights) {
  const stack = [] // indices, hauteurs croissantes
  let best = 0
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i] // sentinelle finale
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()]
      const left = stack.length ? stack[stack.length - 1] : -1 // première barre plus basse à gauche
      best = Math.max(best, height * (i - left - 1))
    }
    stack.push(i)
  }
  return best
}

largestRectangle([2, 1, 5, 6, 2, 3]) // → 10
largestRectangle([2, 4]) // → 4`,
        },
        { mnemo: `Pile monotone : « j'attends quelqu'un de plus grand que moi ». Quand il arrive, il **résout** tous ceux qu'il dépasse. Chaque élément entre et sort une seule fois : O(n).`, piege: `Le \`while\` dans le \`for\` n'est pas O(n²) : raisonnez en analyse amortie. Inversement, oublier la sentinelle (ou la boucle finale) laisse des barres jamais traitées dans la pile.` },

        { h: 'Deque monotone : maximum de fenêtre glissante', id: 'piles-deque' },
        { p: `Pour le maximum de chaque fenêtre de taille k, une pile ne suffit pas : il faut aussi **retirer par l'avant** les indices sortis de la fenêtre. On garde une **deque d'indices aux valeurs décroissantes** : l'avant est toujours le maximum de la fenêtre courante. On retire à l'arrière les éléments plus petits que le nouveau (ils ne seront plus jamais maximum), et à l'avant l'indice qui vient de sortir. Total : **O(n)** au lieu de O(n·k).` },
        {
          title: 'Maximum de fenêtre glissante',
          code: `function maxSlidingWindow(nums, k) {
  const dq = [] // indices ; nums[dq[...]] décroissants
  let head = 0 // avant de la deque (pas de shift)
  const res = []
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop()
    dq.push(i)
    if (dq[head] <= i - k) head++ // l'indice de tête est sorti de la fenêtre
    if (i >= k - 1) res.push(nums[dq[head]])
  }
  return res
}

maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3) // → [ 3, 3, 5, 5, 6, 7 ]`,
          equiv: {
            python: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()  # indices, valeurs décroissantes
    res = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res`,
            java: `static int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>(); // indices, valeurs décroissantes
    int[] res = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
        dq.offerLast(i);
        if (dq.peekFirst() <= i - k) dq.pollFirst();
        if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
    }
    return res;
}`,
            rust: `use std::collections::VecDeque;

fn max_sliding_window(nums: &[i32], k: usize) -> Vec<i32> {
    let mut dq: VecDeque<usize> = VecDeque::new();
    let mut res = Vec::new();
    for i in 0..nums.len() {
        while let Some(&back) = dq.back() {
            if nums[back] > nums[i] { break; }
            dq.pop_back();
        }
        dq.push_back(i);
        if dq[0] + k <= i { dq.pop_front(); } // évite i - k négatif en usize
        if i + 1 >= k { res.push(nums[dq[0]]); }
    }
    res
}`,
          },
        },
        { p: `Ici l'astuce \`head\` fonctionne car on ne retire à l'avant qu'un élément à la fois et qu'on ne repousse jamais devant : le tableau sert de deque « à sens unique ». La condition \`dq.length > head\` signifie « deque non vide ».` },
        { mnemo: `Deque monotone = pile monotone + sortie par l'avant. Arrière : on chasse les plus petits ; avant : on chasse les périmés.`, piege: `Stocker des valeurs au lieu d'indices empêche de savoir si l'avant est sorti de la fenêtre (et casse avec des doublons).` },

        { h: 'Min-stack et structures augmentées', id: 'piles-minstack' },
        { p: `Problème de conception fréquent : une pile qui donne son **minimum en O(1)** en plus de \`push\`, \`pop\` et \`top\`. L'idée : stocker avec chaque élément **le minimum de la pile à ce moment-là**. Quand on dépile, le minimum précédent réapparaît automatiquement. Variante économe : une seconde pile qui ne reçoit un élément que s'il est \`<=\` au minimum courant (le \`<=\` gère les doublons).` },
        {
          title: 'Min-stack avec paires (valeur, minimum)',
          code: `class MinStack {
  constructor() {
    this.items = [] // [valeur, minimum jusqu'ici]
  }
  push(x) {
    const min = this.items.length ? Math.min(x, this.items[this.items.length - 1][1]) : x
    this.items.push([x, min])
  }
  pop() {
    return this.items.pop()[0]
  }
  top() {
    return this.items[this.items.length - 1][0]
  }
  getMin() {
    return this.items[this.items.length - 1][1]
  }
}

const s = new MinStack()
s.push(5)
s.push(2)
s.push(7)
console.log(s.getMin())
s.pop()
s.pop()
console.log(s.getMin(), s.top())`,
          output: `2
5 5`,
          equiv: {
            python: `class MinStack:
    def __init__(self):
        self.items = []  # paires (valeur, minimum jusqu'ici)

    def push(self, x):
        m = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, m))

    def pop(self):
        return self.items.pop()[0]

    def top(self):
        return self.items[-1][0]

    def get_min(self):
        return self.items[-1][1]`,
            java: `class MinStack {
    private final Deque<int[]> items = new ArrayDeque<>(); // {valeur, minimum jusqu'ici}

    void push(int x) {
        int min = items.isEmpty() ? x : Math.min(x, items.peek()[1]);
        items.push(new int[] {x, min});
    }
    int pop() { return items.pop()[0]; }
    int top() { return items.peek()[0]; }
    int getMin() { return items.peek()[1]; }
}`,
          },
        },
        { p: `Le même principe (« mémoriser l'agrégat avec chaque élément ») donne une **file avec maximum en O(1) amorti** : deux min/max-stacks combinées comme dans la file à deux piles. C'est une bonne réponse à un suivi d'entretien sur la fenêtre glissante.` },

        { h: 'Reconnaître le motif', id: 'piles-reconnaitre' },
        { table: [
          ['Signal dans l\'énoncé', 'Structure', 'Complexité'],
          ['imbrication, parenthèses, balises, « annuler »', 'pile', 'O(n)'],
          ['expression postfixée, calculatrice', 'pile d\'opérandes (et d\'opérateurs)', 'O(n)'],
          ['parcours niveau par niveau, plus court chemin non pondéré', 'file (index de tête)', 'O(V + E)'],
          ['prochain / précédent plus grand ou plus petit', 'pile monotone', 'O(n)'],
          ['max / min de chaque fenêtre de taille k', 'deque monotone', 'O(n)'],
          ['min / max en O(1) dans une pile', 'pile de paires', 'O(1) par opération'],
        ] },
        { list: [
          'Une solution « pour chaque i, parcourir à droite jusqu\'à trouver plus grand » est O(n²) : c\'est le signal d\'une pile monotone.',
          'Une pile simule aussi la récursion : un DFS itératif utilise une pile explicite, ce qui évite le dépassement de la pile d\'appels.',
          'En entretien, annoncez « chaque élément est empilé et dépilé au plus une fois, donc O(n) amorti » : c\'est l\'argument attendu.',
        ] },
      ],
      mnemo: `Pile = LIFO, \`push\`/\`pop\` en O(1). File = FIFO avec un index de tête (jamais \`shift()\` en boucle). « Prochain plus grand » → pile monotone ; « max de fenêtre » → deque monotone.`,
      piege: `\`shift()\` est O(n) : un BFS qui l'utilise devient O(n²). Et \`pop()\` sur un tableau vide renvoie \`undefined\` silencieusement.`,
    },
  ],

  katas: [
    {
      id: 'li-parentheses',
      title: 'Parenthèses équilibrées',
      difficulty: 'facile',
      theme: 'piles',
      pattern: 'pile',
      statement: `Écrivez \`isValid(s)\` qui indique si la chaîne \`s\`, composée uniquement des caractères \`()[]{}\`, est **bien parenthésée** :

- chaque ouvrante est fermée par une fermante du **même type** ;
- les paires sont correctement **imbriquées** (\`([)]\` est invalide) ;
- la chaîne vide est valide.

Exemples :

- \`isValid('()[]{}')\` donne \`true\` ;
- \`isValid('{[()]}')\` donne \`true\` ;
- \`isValid('(]')\` donne \`false\` ;
- \`isValid('(()')\` donne \`false\`.

Contraintes : \`0 <= s.length <= 10^5\`. Visez O(n).`,
      starter: `function isValid(s) {
  // TODO : une pile des ouvrantes encore non fermées
  return true
}`,
      solution: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') stack.push(c)
    else if (stack.pop() !== pairs[c]) return false // pile vide → undefined, donc false aussi
  }
  return stack.length === 0
}`,
      solutionEquiv: {
        python: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif not stack or stack.pop() != pairs[c]:
            return False
    return not stack`,
        java: `static boolean isValid(String s) {
    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') stack.push(c);
        else if (stack.isEmpty() || stack.pop() != pairs.get(c).charValue()) return false;
    }
    return stack.isEmpty();
}`,
        rust: `fn is_valid(s: &str) -> bool {
    let mut stack: Vec<char> = Vec::new();
    for c in s.chars() {
        match c {
            '(' | '[' | '{' => stack.push(c),
            _ => {
                let expected = match c { ')' => '(', ']' => '[', _ => '{' };
                if stack.pop() != Some(expected) { return false; }
            }
        }
    }
    stack.is_empty()
}`,
        php: `function isValid(string $s): bool {
    $pairs = [')' => '(', ']' => '[', '}' => '{'];
    $stack = [];
    foreach (str_split($s) as $c) {
        if ($c === '(' || $c === '[' || $c === '{') {
            $stack[] = $c;
        } elseif (array_pop($stack) !== $pairs[$c]) {
            return false;
        }
    }
    return count($stack) === 0;
}`,
      },
      tests: [
        { name: 'exemples valides', code: `assertEqual(isValid('()[]{}'), true)
assertEqual(isValid('{[()]}'), true)` },
        { name: 'type différent', code: `assertEqual(isValid('(]'), false)` },
        { name: 'mauvaise imbrication', code: `assertEqual(isValid('([)]'), false)` },
        { name: 'ouvrante non fermée', code: `assertEqual(isValid('(()'), false)` },
        { name: 'fermante orpheline au début', code: `assertEqual(isValid(')('), false)
assertEqual(isValid(']'), false)` },
        { name: 'chaîne vide', code: `assertEqual(isValid(''), true)` },
        { name: 'grande entrée', code: `const s = '('.repeat(100000) + ')'.repeat(100000)
const t0 = performance.now()
assertEqual(isValid(s), true)
assertEqual(isValid(s + '('), false)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Quand une fermante arrive, avec quelle ouvrante doit-elle correspondre ? La plus récente non encore fermée.',
        '« La plus récente » : c\'est le sommet d\'une pile. Empilez les ouvrantes, dépilez à chaque fermante et comparez.',
        'N\'oubliez pas deux cas : une fermante alors que la pile est vide, et une pile non vide à la fin.',
      ],
      discussion: `**Complexité** : O(n) en temps, O(n) en mémoire dans le pire cas (que des ouvrantes).

**Astuce de concision** : \`stack.pop()\` sur une pile vide renvoie \`undefined\`, qui n'est égal à aucune ouvrante : le cas « fermante orpheline » est donc traité par la même comparaison.

**Suivis possibles** :

- avec un seul type de parenthèse, un simple compteur suffit (O(1) mémoire) : il ne doit jamais devenir négatif et doit finir à 0 ;
- nombre minimal d'ajouts pour rendre la chaîne valide (compteur des ouvrantes en attente + fermantes orphelines) ;
- plus longue sous-chaîne bien parenthésée : pile d'**indices** avec une sentinelle \`-1\`.`,
    },
    {
      id: 'li-rpn',
      title: 'Évaluer une expression RPN',
      difficulty: 'facile',
      theme: 'piles',
      pattern: 'pile',
      statement: `Écrivez \`evalRPN(tokens)\` qui évalue une expression en **notation polonaise inverse** donnée sous forme de tableau de chaînes. Chaque jeton est soit un entier (éventuellement négatif, comme \`'-11'\`), soit l'un des opérateurs \`+\`, \`-\`, \`*\`, \`/\`.

- l'opérateur s'applique aux deux opérandes qui le précèdent : \`['5', '3', '-']\` vaut \`5 - 3 = 2\` ;
- la division est **entière, tronquée vers zéro** : \`7 / -2\` donne \`-3\` ;
- l'expression est toujours valide et aucune division par zéro ne se produit.

Exemples :

- \`evalRPN(['2', '1', '+', '3', '*'])\` donne \`9\` ;
- \`evalRPN(['4', '13', '5', '/', '+'])\` donne \`6\` ;
- \`evalRPN(['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'])\` donne \`22\`.`,
      starter: `function evalRPN(tokens) {
  // TODO : empiler les nombres, appliquer chaque opérateur aux deux derniers
  return 0
}`,
      solution: `function evalRPN(tokens) {
  const stack = []
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop() // second opérande (empilé en dernier)
      const a = stack.pop()
      if (t === '+') stack.push(a + b)
      else if (t === '-') stack.push(a - b)
      else if (t === '*') stack.push(a * b)
      else stack.push(Math.trunc(a / b)) // pas Math.floor : -3.5 doit donner -3
    } else {
      stack.push(Number(t))
    }
  }
  return stack.pop()
}`,
      solutionEquiv: {
        python: `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            b = stack.pop()
            a = stack.pop()
            if t == '+':
                stack.append(a + b)
            elif t == '-':
                stack.append(a - b)
            elif t == '*':
                stack.append(a * b)
            else:
                stack.append(int(a / b))  # // arrondit vers -inf : int(a / b) tronque vers 0
        else:
            stack.append(int(t))
    return stack.pop()`,
        java: `static int evalRPN(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+", "-", "*", "/" -> {
                int b = stack.pop();
                int a = stack.pop();
                stack.push(switch (t) {
                    case "+" -> a + b;
                    case "-" -> a - b;
                    case "*" -> a * b;
                    default -> a / b; // la division entière Java tronque déjà vers zéro
                });
            }
            default -> stack.push(Integer.parseInt(t));
        }
    }
    return stack.pop();
}`,
        php: `function evalRPN(array $tokens): int {
    $stack = [];
    foreach ($tokens as $t) {
        if (in_array($t, ['+', '-', '*', '/'], true)) {
            $b = array_pop($stack);
            $a = array_pop($stack);
            $stack[] = match ($t) {
                '+' => $a + $b,
                '-' => $a - $b,
                '*' => $a * $b,
                '/' => intdiv($a, $b), // tronque vers zéro
            };
        } else {
            $stack[] = (int) $t;
        }
    }
    return array_pop($stack);
}`,
      },
      tests: [
        { name: 'addition puis multiplication', code: `assertEqual(evalRPN(['2', '1', '+', '3', '*']), 9)` },
        { name: 'ordre des opérandes pour - et /', code: `assertEqual(evalRPN(['5', '3', '-']), 2)
assertEqual(evalRPN(['4', '13', '5', '/', '+']), 6)` },
        { name: 'division tronquée vers zéro', code: `assertEqual(evalRPN(['7', '-2', '/']), -3)
assertEqual(evalRPN(['-7', '2', '/']), -3)` },
        { name: 'nombre seul', code: `assertEqual(evalRPN(['42']), 42)
assertEqual(evalRPN(['-5']), -5)` },
        { name: 'expression longue avec négatifs', code: `assertEqual(evalRPN(['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']), 22)` },
      ],
      hints: [
        'Lisez les jetons de gauche à droite : un nombre est mis de côté, un opérateur consomme les deux derniers nombres mis de côté.',
        'Le dernier empilé est le **second** opérande : dépilez `b` d\'abord, puis `a`, et calculez `a op b`.',
        'Pour la troncature vers zéro, `Math.floor(-3.5)` donne `-4` : utilisez `Math.trunc`.',
      ],
      discussion: `**Complexité** : O(n) en temps et O(n) en mémoire pour la pile.

**Pièges** : l'ordre des opérandes, la troncature (\`Math.trunc\` et non \`Math.floor\`, ni \`| 0\` qui casse au-delà de 2³¹), et la détection des opérateurs : tester \`isNaN(t)\` fonctionne mais \`'-'\` seul est un opérateur alors que \`'-11'\` est un nombre, d'où la comparaison explicite.

**Suivis** : convertir une expression infixe en RPN (algorithme de la **gare de triage** de Dijkstra, avec une pile d'opérateurs et leurs priorités) ; évaluer directement une expression infixe avec parenthèses (calculatrice « Basic Calculator ») à l'aide de deux piles.`,
    },
    {
      id: 'li-temperatures',
      title: 'Températures quotidiennes',
      difficulty: 'moyen',
      theme: 'piles',
      pattern: 'pile monotone',
      statement: `On vous donne \`temps\`, les températures relevées chaque jour. Écrivez \`dailyTemperatures(temps)\` qui renvoie un tableau \`answer\` où \`answer[i]\` est le **nombre de jours à attendre** après le jour \`i\` pour avoir une température **strictement plus chaude**, ou \`0\` si cela n'arrive jamais.

Exemples :

- \`dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])\` donne \`[1, 1, 4, 2, 1, 1, 0, 0]\` ;
- \`dailyTemperatures([30, 40, 50, 60])\` donne \`[1, 1, 1, 0]\` ;
- \`dailyTemperatures([30, 30])\` donne \`[0, 0]\` (une température égale n'est pas plus chaude).

Contraintes : \`1 <= temps.length <= 2 × 10^5\`. Une double boucle est trop lente : visez **O(n)**.`,
      starter: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0)
  // TODO : pour chaque jour, trouver le prochain jour plus chaud
  return answer
}`,
      solution: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0)
  const stack = [] // indices des jours qui attendent un jour plus chaud (températures décroissantes)
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop()
      answer[j] = i - j
    }
    stack.push(i)
  }
  return answer
}`,
      solutionEquiv: {
        python: `def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []  # indices, températures décroissantes
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer`,
        java: `static int[] dailyTemperatures(int[] temps) {
    int[] answer = new int[temps.length];
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < temps.length; i++) {
        while (!stack.isEmpty() && temps[stack.peek()] < temps[i]) {
            int j = stack.pop();
            answer[j] = i - j;
        }
        stack.push(i);
    }
    return answer;
}`,
        rust: `fn daily_temperatures(temps: &[i32]) -> Vec<usize> {
    let mut answer = vec![0; temps.len()];
    let mut stack: Vec<usize> = Vec::new();
    for i in 0..temps.len() {
        while let Some(&j) = stack.last() {
            if temps[j] >= temps[i] { break; }
            stack.pop();
            answer[j] = i - j;
        }
        stack.push(i);
    }
    answer
}`,
      },
      tests: [
        { name: 'exemple de l\'énoncé', code: `assertEqual(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]), [1, 1, 4, 2, 1, 1, 0, 0])` },
        { name: 'croissant', code: `assertEqual(dailyTemperatures([30, 40, 50, 60]), [1, 1, 1, 0])` },
        { name: 'égalités non comptées', code: `assertEqual(dailyTemperatures([30, 30]), [0, 0])
assertEqual(dailyTemperatures([50, 50, 60]), [2, 1, 0])` },
        { name: 'décroissant', code: `assertEqual(dailyTemperatures([60, 50, 40]), [0, 0, 0])` },
        { name: 'un seul jour', code: `assertEqual(dailyTemperatures([42]), [0])` },
        { name: 'grande entrée', code: `const n = 200000
const temps = Array.from({ length: n }, (_, i) => n - i) // décroissant : le pire cas de la double boucle
temps[n - 1] = n + 1 // le dernier jour est plus chaud que tous
const t0 = performance.now()
const res = dailyTemperatures(temps)
const elapsed = performance.now() - t0
assertEqual(res[0], n - 1)
assertEqual(res[n - 2], 1)
assertEqual(res[n - 1], 0)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'La double boucle « pour chaque jour, chercher à droite » est O(n²) : avec 2 × 10⁵ jours décroissants, c\'est 2 × 10¹⁰ comparaisons.',
        'Inversez le point de vue : quand un jour chaud arrive, quels jours précédents « résout »-il ? Tous ceux, encore en attente, qui sont plus froids.',
        'Gardez une pile d\'**indices** en attente ; leurs températures sont décroissantes. Dépilez tant que le sommet est plus froid que le jour courant et notez `i - j`.',
      ],
      discussion: `**Complexité** : O(n) en temps (chaque indice est empilé et dépilé au plus une fois), O(n) en mémoire.

**Pourquoi des indices ?** La réponse est une distance \`i - j\` : la valeur seule ne suffit pas.

**Alternative** : parcourir de droite à gauche en sautant de réponse en réponse (\`j += answer[j]\`), également O(n) amorti et O(1) mémoire supplémentaire, mais plus délicate à justifier.

**Variantes du même motif** : prochain élément plus grand (renvoyer la valeur plutôt que la distance), version circulaire (parcourir \`2n\` indices modulo \`n\`), portée d'une action en bourse (*stock span* : précédent plus grand).`,
    },
    {
      id: 'li-min-stack',
      title: 'Pile avec minimum en O(1)',
      difficulty: 'moyen',
      theme: 'piles',
      pattern: 'pile augmentée',
      statement: `Implémentez une classe \`MinStack\` offrant, **toutes en O(1)** :

- \`push(x)\` : empile \`x\` ;
- \`pop()\` : dépile et **renvoie** le sommet ;
- \`top()\` : renvoie le sommet sans le retirer ;
- \`getMin()\` : renvoie le plus petit élément actuellement dans la pile.

On garantit que \`pop\`, \`top\` et \`getMin\` ne sont jamais appelées sur une pile vide.

Exemple :

- après \`push(-2)\`, \`push(0)\`, \`push(-3)\` : \`getMin()\` donne \`-3\` ;
- puis \`pop()\` renvoie \`-3\`, \`top()\` donne \`0\` et \`getMin()\` donne \`-2\`.

Contraintes : jusqu'à 2 × 10⁵ opérations. Recalculer le minimum en parcourant la pile est trop lent.`,
      starter: `class MinStack {
  constructor() {
    this.items = []
  }
  push(x) {
    this.items.push(x)
  }
  pop() {
    return this.items.pop()
  }
  top() {
    return this.items[this.items.length - 1]
  }
  getMin() {
    // TODO : en O(1)
    return undefined
  }
}`,
      solution: `class MinStack {
  constructor() {
    this.items = [] // valeurs
    this.mins = [] // mins[i] = minimum de items[0..i]
  }
  push(x) {
    this.items.push(x)
    this.mins.push(this.mins.length ? Math.min(x, this.mins[this.mins.length - 1]) : x)
  }
  pop() {
    this.mins.pop()
    return this.items.pop()
  }
  top() {
    return this.items[this.items.length - 1]
  }
  getMin() {
    return this.mins[this.mins.length - 1]
  }
}`,
      solutionEquiv: {
        python: `class MinStack:
    def __init__(self):
        self.items = []
        self.mins = []  # mins[i] = minimum de items[0..i]

    def push(self, x):
        self.items.append(x)
        self.mins.append(min(x, self.mins[-1]) if self.mins else x)

    def pop(self):
        self.mins.pop()
        return self.items.pop()

    def top(self):
        return self.items[-1]

    def get_min(self):
        return self.mins[-1]`,
        java: `class MinStack {
    private final Deque<Integer> items = new ArrayDeque<>();
    private final Deque<Integer> mins = new ArrayDeque<>();

    void push(int x) {
        items.push(x);
        mins.push(mins.isEmpty() ? x : Math.min(x, mins.peek()));
    }
    int pop() { mins.pop(); return items.pop(); }
    int top() { return items.peek(); }
    int getMin() { return mins.peek(); }
}`,
        rust: `struct MinStack { items: Vec<i32>, mins: Vec<i32> }

impl MinStack {
    fn new() -> Self { MinStack { items: Vec::new(), mins: Vec::new() } }
    fn push(&mut self, x: i32) {
        self.items.push(x);
        let m = self.mins.last().map_or(x, |&m| m.min(x));
        self.mins.push(m);
    }
    fn pop(&mut self) -> i32 { self.mins.pop(); self.items.pop().unwrap() }
    fn top(&self) -> i32 { *self.items.last().unwrap() }
    fn get_min(&self) -> i32 { *self.mins.last().unwrap() }
}`,
        php: `class MinStack {
    private array $items = [];
    private array $mins = [];

    public function push(int $x): void {
        $this->items[] = $x;
        $this->mins[] = $this->mins ? min($x, end($this->mins)) : $x;
    }
    public function pop(): int { array_pop($this->mins); return array_pop($this->items); }
    public function top(): int { return end($this->items); }
    public function getMin(): int { return end($this->mins); }
}`,
      },
      tests: [
        { name: 'exemple de l\'énoncé', code: `const s = new MinStack()
s.push(-2)
s.push(0)
s.push(-3)
assertEqual(s.getMin(), -3)
assertEqual(s.pop(), -3)
assertEqual(s.top(), 0)
assertEqual(s.getMin(), -2)` },
        { name: 'doublons du minimum', code: `const s = new MinStack()
s.push(1)
s.push(1)
s.push(2)
s.pop()
s.pop()
assertEqual(s.getMin(), 1)` },
        { name: 'le minimum remonte après pop', code: `const s = new MinStack()
s.push(5)
s.push(3)
s.push(4)
s.push(1)
assertEqual(s.getMin(), 1)
s.pop()
assertEqual(s.getMin(), 3)
s.pop()
s.pop()
assertEqual(s.getMin(), 5)
assertEqual(s.top(), 5)` },
        { name: 'instances indépendantes', code: `const a = new MinStack()
const b = new MinStack()
a.push(1)
b.push(9)
assertEqual(a.getMin(), 1)
assertEqual(b.getMin(), 9)` },
        { name: 'grande entrée', code: `const s = new MinStack()
const n = 200000
const t0 = performance.now()
let ok = true
for (let i = n; i > 0; i--) {
  s.push(i)
  if (s.getMin() !== i) ok = false
}
for (let i = 1; i < n; i++) {
  s.pop()
  if (s.getMin() !== i + 1) ok = false
}
const elapsed = performance.now() - t0
assert(ok, 'minimum incorrect')
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Quand on dépile le minimum, il faut retrouver l\'ancien minimum instantanément : il faut donc l\'avoir mémorisé.',
        'Associez à chaque position le minimum de la pile **jusqu\'à cette position** (une seconde pile parallèle, ou des paires).',
        'Variante économe : ne pousser dans la pile des minimums que si `x <= min` courant ; le `<=` est indispensable avec les doublons.',
      ],
      discussion: `**Complexité** : O(1) par opération, O(n) mémoire supplémentaire.

**Variante économe** : la pile des minimums ne reçoit \`x\` que si \`x <= getMin()\`, et l'on ne la dépile que si la valeur retirée est égale au minimum. Avec \`<\` au lieu de \`<=\`, deux minimums égaux poseraient problème.

**Variante O(1) mémoire supplémentaire** : stocker \`x - min\` et retrouver l'ancien minimum quand la différence est négative. Astucieux, mais sujet aux dépassements d'entiers dans d'autres langages : à mentionner plutôt qu'à coder.

**Suivis** : \`MaxStack\` avec \`popMax()\` (nécessite un tas ou une structure ordonnée, O(log n)), file avec minimum en O(1) amorti (deux min-stacks, comme la file à deux piles).`,
    },
    {
      id: 'li-histogramme',
      title: 'Plus grand rectangle dans un histogramme',
      difficulty: 'difficile',
      theme: 'piles',
      pattern: 'pile monotone',
      statement: `\`heights\` donne la hauteur de barres de largeur 1 posées côte à côte. Écrivez \`largestRectangle(heights)\` qui renvoie l'**aire du plus grand rectangle** entièrement contenu dans l'histogramme.

Exemples :

- \`largestRectangle([2, 1, 5, 6, 2, 3])\` donne \`10\` (barres 5 et 6, hauteur 5, largeur 2) ;
- \`largestRectangle([2, 4])\` donne \`4\` ;
- \`largestRectangle([3, 3, 3])\` donne \`9\` ;
- \`largestRectangle([])\` donne \`0\`.

Contraintes : \`0 <= heights.length <= 2 × 10^5\`, \`0 <= heights[i] <= 10^4\`. Visez **O(n)**.`,
      starter: `function largestRectangle(heights) {
  // TODO : pour chaque barre, jusqu'où peut-on l'étendre à gauche et à droite ?
  return Math.max(0, ...heights)
}`,
      solution: `function largestRectangle(heights) {
  const n = heights.length
  const stack = [] // indices, hauteurs croissantes
  let best = 0
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i] // sentinelle : vide la pile à la fin
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()]
      // bornes : la barre plus basse à gauche (nouveau sommet) et i à droite, exclues
      const left = stack.length ? stack[stack.length - 1] : -1
      best = Math.max(best, height * (i - left - 1))
    }
    stack.push(i)
  }
  return best
}`,
      solutionEquiv: {
        python: `def largest_rectangle(heights):
    n = len(heights)
    stack = []  # indices, hauteurs croissantes
    best = 0
    for i in range(n + 1):
        h = 0 if i == n else heights[i]
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best`,
        java: `static int largestRectangle(int[] heights) {
    int n = heights.length, best = 0;
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i <= n; i++) {
        int h = i == n ? 0 : heights[i];
        while (!stack.isEmpty() && heights[stack.peek()] >= h) {
            int height = heights[stack.pop()];
            int left = stack.isEmpty() ? -1 : stack.peek();
            best = Math.max(best, height * (i - left - 1));
        }
        stack.push(i);
    }
    return best;
}`,
        rust: `fn largest_rectangle(heights: &[i64]) -> i64 {
    let n = heights.len();
    let mut stack: Vec<usize> = Vec::new();
    let mut best = 0;
    for i in 0..=n {
        let h = if i == n { 0 } else { heights[i] };
        while let Some(&top) = stack.last() {
            if heights[top] < h { break; }
            stack.pop();
            // largeur = i - left - 1, avec left = -1 si la pile est vide
            let width = match stack.last() { Some(&left) => i - left - 1, None => i };
            best = best.max(heights[top] * width as i64);
        }
        stack.push(i);
    }
    best
}`,
        php: `function largestRectangle(array $heights): int {
    $n = count($heights);
    $stack = [];
    $best = 0;
    for ($i = 0; $i <= $n; $i++) {
        $h = $i === $n ? 0 : $heights[$i];
        while ($stack && $heights[end($stack)] >= $h) {
            $height = $heights[array_pop($stack)];
            $left = $stack ? end($stack) : -1;
            $best = max($best, $height * ($i - $left - 1));
        }
        $stack[] = $i;
    }
    return $best;
}`,
      },
      tests: [
        { name: 'exemple classique', code: `assertEqual(largestRectangle([2, 1, 5, 6, 2, 3]), 10)` },
        { name: 'deux barres', code: `assertEqual(largestRectangle([2, 4]), 4)` },
        { name: 'hauteurs égales', code: `assertEqual(largestRectangle([3, 3, 3]), 9)` },
        { name: 'vide et zéros', code: `assertEqual(largestRectangle([]), 0)
assertEqual(largestRectangle([0, 0]), 0)` },
        { name: 'la barre basse gagne en largeur', code: `assertEqual(largestRectangle([6, 2, 5, 4, 5, 1, 6]), 12)
assertEqual(largestRectangle([2, 1, 2]), 3)` },
        { name: 'grande entrée', code: `const n = 200000
const heights = Array.from({ length: n }, (_, i) => (i % 10000) + 1) // rampes croissantes
const t0 = performance.now()
const res = largestRectangle(heights)
const elapsed = performance.now() - t0
assertEqual(res, 25005000)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
        { name: 'grande entrée de hauteurs égales', code: `const heights = new Array(200000).fill(5000) // pire cas de « s'étendre à gauche et à droite »
const t0 = performance.now()
const res = largestRectangle(heights)
const elapsed = performance.now() - t0
assertEqual(res, 1000000000)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Le meilleur rectangle a la hauteur d\'une des barres. Pour la barre `i`, il s\'étend jusqu\'à la première barre **strictement plus basse** de chaque côté.',
        'Calculer ces bornes naïvement coûte O(n²). Une pile croissante d\'indices donne les deux bornes au moment où une barre est dépilée : la droite est `i`, la gauche est le nouveau sommet.',
        'Ajoutez une barre fictive de hauteur 0 après la dernière : elle force le dépilement de tout ce qui reste, sans code supplémentaire.',
      ],
      discussion: `**Complexité** : O(n) en temps, O(n) en mémoire.

**Pourquoi \`>=\` au dépilement ?** Avec des hauteurs égales, la barre dépilée sous-estime sa largeur, mais la dernière barre égale, elle, s'étend sur toute la plage : le maximum reste exact. Avec \`>\`, c'est aussi correct ; l'important est de rester cohérent.

**Alternatives** : précalculer deux tableaux \`left[i]\` et \`right[i]\` (précédent et prochain plus petit) avec deux passes de pile monotone, puis \`max(h[i] * (right[i] - left[i] - 1))\` ; diviser pour régner autour du minimum (O(n log n) en moyenne, O(n²) sur un tableau trié).

**Suivi célèbre** : *Maximal Rectangle* dans une matrice binaire. On construit, ligne par ligne, l'histogramme des hauteurs de 1 consécutifs et l'on applique cette fonction à chaque ligne : O(lignes × colonnes).`,
    },
  ],

  quiz: [
    {
      id: 'li-q-piles-bfs',
      theme: 'piles',
      kind: 'qcm',
      q: 'Pour un parcours en largeur (BFS) en JavaScript sur un grand graphe, quelle façon de défiler est la plus adaptée ?',
      choices: ['`queue.shift()`', '`queue.pop()`', '`queue[head++]` avec un index de tête', '`queue.splice(0, 1)`'],
      answer: 2,
      why: '`shift()` et `splice(0, 1)` décalent tous les éléments : O(n) par défilement, donc O(n²) au total. `pop()` retire à la fin et transforme la file en pile (on obtient un parcours en profondeur). Un index de tête lit chaque élément en O(1).',
    },
    {
      id: 'li-q-piles-output-pile',
      theme: 'piles',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `const s = []
s.push(1, 2)
s.push(3)
s.pop()
s.push(4)
console.log(s.pop(), s.pop(), s.length)`,
      choices: ['4 2 1', '1 2 1', '4 3 1', '3 4 1'],
      answer: 0,
      why: 'Après `push(1, 2)` puis `push(3)`, la pile vaut `[1, 2, 3]`. `pop()` retire 3, puis `push(4)` donne `[1, 2, 4]`. On dépile 4 puis 2 : il reste `[1]`, de longueur 1. Les arguments sont évalués de gauche à droite.',
    },
    {
      id: 'li-q-piles-output-monotone',
      theme: 'piles',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `const nums = [3, 1, 4, 2]
const res = [-1, -1, -1, -1]
const stack = []
for (let i = 0; i < nums.length; i++) {
  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) res[stack.pop()] = nums[i]
  stack.push(i)
}
console.log(res.join(','))`,
      choices: ['4,4,-1,2', '-1,3,-1,4', '4,2,-1,-1', '4,4,-1,-1'],
      answer: 3,
      why: 'C\'est le « prochain élément plus grand ». 3 et 1 attendent dans la pile ; 4 les résout tous les deux. 2 n\'a personne de plus grand après lui, et 4 non plus : ils gardent -1.',
    },
    {
      id: 'li-q-piles-cx-monotone',
      theme: 'piles',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code, pour un tableau de taille n ?',
      code: `function f(nums) {
  const stack = []
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && stack[stack.length - 1] <= nums[i]) {
      stack.pop()
      count++
    }
    stack.push(nums[i])
  }
  return count
}
f([5, 3, 4, 1, 6])`,
      choices: ['O(n log n)', 'O(n)', 'O(n²)', 'O(n · k), k = taille de la pile'],
      answer: 1,
      why: 'Chaque élément est empilé une seule fois et dépilé au plus une fois : le nombre total d\'itérations du `while`, toutes boucles confondues, est au plus n. Analyse amortie : O(n).',
    },
    {
      id: 'li-q-piles-cx-shift',
      theme: 'piles',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code (en ne supposant aucune optimisation particulière du moteur) ?',
      code: `function drain(n) {
  const queue = Array.from({ length: n }, (_, i) => i)
  let sum = 0
  while (queue.length) sum += queue.shift()
  return sum
}
drain(1000)`,
      choices: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
      answer: 1,
      why: '`shift()` retire le premier élément et décale les suivants : O(longueur courante). Sur n défilements : n + (n - 1) + … + 1 = O(n²). Avec un index de tête, le même parcours serait O(n).',
    },
    {
      id: 'li-q-piles-bug-paren',
      theme: 'piles',
      kind: 'bug',
      q: 'Cette fonction doit vérifier qu\'une chaîne de parenthèses est bien formée. Quel est le bug ?',
      code: `function isValid(s) {
  const pairs = { ')': '(', ']': '[' }
  const stack = []
  for (const c of s) {
    if (c === '(' || c === '[') stack.push(c)
    else if (stack.pop() !== pairs[c]) return false
  }
  return true
}
isValid('([])')`,
      choices: [
        'Elle rejette `([])`',
        'Elle plante sur une fermante quand la pile est vide',
        '`for...of` ne parcourt pas les caractères d\'une chaîne',
        'Elle accepte des chaînes où des ouvrantes ne sont jamais fermées, comme `((`',
      ],
      answer: 3,
      why: 'Il manque la vérification finale : il faut `return stack.length === 0`. Avec `((`, aucune fermante n\'est lue et la fonction renvoie `true`. Une fermante sur pile vide ne plante pas : `pop()` renvoie `undefined`, différent de l\'ouvrante attendue.',
    },
    {
      id: 'li-q-piles-deque',
      theme: 'piles',
      kind: 'qcm',
      q: 'Pour le maximum de chaque fenêtre glissante de taille k, que contient la deque monotone ?',
      choices: [
        'Les indices de la fenêtre, de valeurs décroissantes de l\'avant vers l\'arrière',
        'Les k dernières valeurs, triées',
        'Les indices de la fenêtre, de valeurs croissantes de l\'avant vers l\'arrière',
        'Uniquement le maximum courant et son indice',
      ],
      answer: 0,
      why: 'L\'avant est le maximum de la fenêtre. Un élément plus petit qu\'un élément plus récent ne pourra plus jamais être maximum : on le retire à l\'arrière. On stocke des indices pour savoir quand l\'avant sort de la fenêtre. Garder seulement le maximum ne permet pas de retrouver le suivant quand il sort.',
    },
    {
      id: 'li-q-piles-deux-piles',
      theme: 'piles',
      kind: 'qcm',
      q: 'Une file implémentée avec deux piles (on transvase `inStack` dans `outStack` seulement quand `outStack` est vide) a pour coût de `dequeue` :',
      choices: [
        'O(n) à chaque appel',
        'O(log n)',
        'O(1) amorti, O(n) dans le pire cas pour un appel isolé',
        'O(1) dans le pire cas pour chaque appel',
      ],
      answer: 2,
      why: 'Chaque élément passe une seule fois de `inStack` à `outStack`. Sur m opérations, le travail total est O(m), donc O(1) amorti. Mais un `dequeue` qui déclenche le transvasement de n éléments coûte O(n) à lui seul.',
    },
  ],

  pieges: [
    {
      id: 'li-p-shift',
      title: '`shift()` dans une boucle',
      theme: 'piles',
      question: 'Combien d\'éléments sont déplacés en mémoire par ces `shift()` successifs ?',
      code: `const n = 5
const queue = [0, 1, 2, 3, 4]
let moved = 0
while (queue.length) {
  moved += queue.length - 1 // shift décale tous les éléments restants
  queue.shift()
}
console.log(moved, n * (n - 1) / 2)`,
      output: `10 10`,
      explanation: `\`shift()\` retire l'indice 0 et renumérote tous les éléments suivants : (n - 1) + (n - 2) + … + 0 = n(n - 1)/2 déplacements, soit O(n²) pour vider la file. Dans un BFS sur 10⁵ nœuds, cela fait de l'ordre de 5 × 10⁹ opérations. Les moteurs optimisent parfois les petits tableaux, mais aucune garantie : utilisez un index de tête.`,
      fix: {
        code: `const queue = [0, 1, 2, 3, 4]
let head = 0
let sum = 0
while (head < queue.length) sum += queue[head++] // O(1) par défilement
console.log(sum)`,
        output: `10`,
        equiv: {
          python: `from collections import deque

queue = deque([0, 1, 2, 3, 4])
total = 0
while queue:
    total += queue.popleft()  # O(1), contrairement à list.pop(0)
print(total)`,
          java: `Deque<Integer> queue = new ArrayDeque<>(List.of(0, 1, 2, 3, 4));
int sum = 0;
while (!queue.isEmpty()) sum += queue.poll(); // O(1)
System.out.println(sum);`,
        },
      },
    },
    {
      id: 'li-p-pop-vide',
      title: '`pop()` sur une pile vide',
      theme: 'piles',
      question: 'Qu\'affiche ce code ?',
      code: `function topAfterPops(arr, k) {
  const stack = [...arr]
  for (let i = 0; i < k; i++) stack.pop()
  return stack[stack.length - 1] * 2
}
console.log(topAfterPops([1, 2], 1))
console.log(topAfterPops([1, 2], 5))`,
      output: `2
NaN`,
      explanation: `Contrairement à Python (\`IndexError\`) ou Java (\`NoSuchElementException\`), \`pop()\` sur un tableau vide renvoie \`undefined\` sans erreur, et lire \`stack[-1]\` aussi. L'erreur se propage silencieusement : \`undefined * 2\` donne \`NaN\`. Testez toujours \`stack.length\` avant de dépiler ou de lire le sommet.`,
      fix: {
        code: `function topAfterPops(arr, k) {
  const stack = [...arr]
  for (let i = 0; i < k && stack.length; i++) stack.pop()
  if (stack.length === 0) return null // cas explicite
  return stack[stack.length - 1] * 2
}
console.log(topAfterPops([1, 2], 1))
console.log(topAfterPops([1, 2], 5))`,
        output: `2
null`,
      },
    },
    {
      id: 'li-p-modulo-negatif',
      title: 'Modulo négatif dans un tampon circulaire',
      theme: 'piles',
      question: 'On recule l\'indice de tête d\'un tampon circulaire de capacité 4. Qu\'affiche ce code ?',
      code: `const cap = 4
let head = 0
head = (head - 1) % cap
console.log(head)
const buf = new Array(cap)
buf[head] = 'x'
console.log(buf.length, buf[3])`,
      output: `-1
4 undefined`,
      explanation: `En JavaScript (comme en Java, C ou Rust avec \`%\`), le reste a le **signe du dividende** : \`-1 % 4\` vaut \`-1\`, pas \`3\`. Écrire à l'indice \`-1\` crée une propriété nommée \`'-1'\` au lieu de remplir la dernière case : la longueur ne change pas et la donnée est perdue. Ajoutez la capacité avant le modulo. (En Python, \`-1 % 4\` vaut \`3\`.)`,
      fix: {
        code: `const cap = 4
let head = 0
head = (head - 1 + cap) % cap
console.log(head)`,
        output: `3`,
      },
    },
  ],

  flashcards: [
    { id: 'li-f-piles-lifo', theme: 'piles', front: 'Pile ou file : laquelle est LIFO, laquelle est FIFO ?', back: `La **pile** est LIFO (dernier entré, premier sorti) : \`push\` et \`pop\` au sommet. La **file** est FIFO (premier entré, premier sorti) : on ajoute à la fin, on retire au début.` },
    { id: 'li-f-piles-shift', theme: 'piles', front: 'Pourquoi éviter `shift()` pour une file en JS ?', back: `\`shift()\` décale tous les éléments restants : O(n) par appel, donc O(n²) pour vider une file. On utilise un **index de tête** (\`queue[head++]\`) ou un tampon circulaire.` },
    { id: 'li-f-piles-monotone', theme: 'piles', front: 'Quel signal dans un énoncé évoque une pile monotone ?', back: `« Prochain (ou précédent) élément plus grand / plus petit », « nombre de jours avant une température plus chaude », « plus grand rectangle dans un histogramme ». Tout ce qui cherche le **plus proche élément qui domine**.` },
    { id: 'li-f-piles-amorti', theme: 'piles', front: 'Pourquoi une pile monotone est-elle O(n) malgré un `while` dans un `for` ?', back: `Chaque élément est empilé **une fois** et dépilé **au plus une fois** : le nombre total d'itérations du \`while\` sur tout l'algorithme est au plus n. C'est une analyse **amortie**.` },
    { id: 'li-f-piles-deque', theme: 'piles', front: 'Comment obtenir le max de chaque fenêtre de taille k en O(n) ?', back: `Deque d'**indices** aux valeurs décroissantes. À chaque i : retirer à l'arrière les valeurs \`<= nums[i]\`, ajouter i, retirer l'avant s'il vaut \`i - k\` ou moins ; l'avant est le maximum.` },
    { id: 'li-f-piles-minstack', theme: 'piles', front: 'Comment donner le minimum d\'une pile en O(1) ?', back: `Stocker avec chaque élément le minimum de la pile **jusqu'à lui** (pile parallèle ou paires). Le dépilement fait réapparaître l'ancien minimum automatiquement.` },
    { id: 'li-f-piles-deuxpiles', theme: 'piles', front: 'File avec deux piles : principe et coût ?', back: `On pousse dans \`inStack\`. Pour défiler, si \`outStack\` est vide, on y transvase tout \`inStack\` (l'ordre s'inverse), puis on dépile \`outStack\`. Chaque élément est transvasé une fois : **O(1) amorti**.` },
    { id: 'li-f-piles-rpn', theme: 'piles', front: 'Évaluation RPN : dans quel ordre dépiler les opérandes ?', back: `On dépile d'abord \`b\` (le second opérande), puis \`a\`, et l'on empile \`a op b\`. Pour \`['5', '3', '-']\` : \`5 - 3 = 2\`.`, code: `const stack = [5, 3]
const b = stack.pop()
const a = stack.pop()
a - b // → 2` },
  ],

  lexique: [
    { term: 'Pile (LIFO)', theme: 'piles', def: `Structure où l'on ajoute et retire au même bout, le sommet : le dernier entré est le premier sorti. En JS, un tableau avec \`push\` et \`pop\` (O(1) amorti).`, see: ['File (FIFO)', 'Pile monotone'] },
    { term: 'File (FIFO)', theme: 'piles', def: `Structure où l'on ajoute à la fin et retire au début : le premier entré est le premier sorti. En JS, un tableau avec un index de tête plutôt que \`shift()\`, qui est O(n).`, see: ['Pile (LIFO)', 'Tampon circulaire', 'Deque'] },
    { term: 'Deque', theme: 'piles', def: `File à double extrémité (*double-ended queue*) : ajout et retrait en O(1) aux deux bouts. \`collections.deque\` en Python, \`ArrayDeque\` en Java, \`VecDeque\` en Rust ; à écrire soi-même en JS.`, see: ['Tampon circulaire', 'Deque monotone'] },
    { term: 'Tampon circulaire', theme: 'piles', def: `Tableau de capacité fixe dont les indices « tournent » modulo la capacité : la tête avance avec \`(head + 1) % cap\`. Il donne une file ou une deque en O(1) sans décaler d'éléments.`, see: ['Deque'] },
    { term: 'Pile monotone', theme: 'piles', def: `Pile dont les éléments restent triés : avant d'empiler, on dépile ceux qui violent l'ordre, et chaque élément dépilé trouve alors sa réponse (prochain plus grand ou plus petit). O(n) amorti.`, see: ['Deque monotone', 'Pile (LIFO)'] },
    { term: 'Deque monotone', theme: 'piles', def: `Deque d'indices aux valeurs monotones, utilisée pour le maximum (ou minimum) de chaque fenêtre glissante en O(n) : on retire à l'arrière les éléments dominés et à l'avant les indices sortis de la fenêtre.`, see: ['Pile monotone', 'Deque'] },
    { term: 'Notation polonaise inverse', theme: 'piles', def: `Écriture postfixée des expressions (RPN), où l'opérateur suit ses opérandes : \`3 4 + 2 *\` vaut \`(3 + 4) × 2\`. Elle s'évalue avec une pile, sans parenthèses ni priorités.` },
  ],

  entretien: [
    {
      id: 'li-e-piles-file',
      section: 'structures',
      q: 'Comment implémenteriez-vous une file efficace en JavaScript ?',
      answer: `JavaScript n'a pas de file native. Un tableau avec \`push\` et \`shift\` fonctionne mais \`shift()\` est **O(n)** : il décale tous les éléments. Trois options :

- un **index de tête** : on lit \`queue[head++]\` ; simple et idéal pour un BFS, au prix de cases mortes en mémoire (on peut compacter quand \`head\` dépasse la moitié) ;
- un **tampon circulaire** : tableau de capacité fixe, indices modulo la capacité, doublement quand il est plein ; O(1) amorti et mémoire bornée ;
- **deux piles** : O(1) amorti, élégant mais moins direct.

Je mentionnerais aussi que les autres langages fournissent ces structures (\`collections.deque\`, \`ArrayDeque\`, \`VecDeque\`), toutes à base de tampon circulaire ou de blocs.`,
      attendu: 'Savoir que `shift()` est O(n), proposer une alternative O(1) et justifier les compromis mémoire.',
    },
    {
      id: 'li-e-piles-monotone',
      section: 'techniques',
      q: 'Expliquez le principe de la pile monotone et justifiez sa complexité.',
      answer: `On parcourt le tableau en maintenant une pile (souvent d'**indices**) dont les valeurs restent triées. Avant d'empiler l'élément courant, on dépile tous les éléments qu'il « domine » ; pour chacun, l'élément courant est la réponse recherchée (par exemple le prochain plus grand). Les éléments qui restent dans la pile à la fin n'ont pas de réponse.

**Complexité** : il y a bien un \`while\` dans un \`for\`, mais chaque indice est empilé une fois et dépilé au plus une fois. Le nombre total de dépilements est donc au plus n : O(n) en temps, O(n) en mémoire.

**Applications** : prochain plus grand, températures quotidiennes, *stock span*, plus grand rectangle dans un histogramme, eau de pluie piégée, suppression de k chiffres pour obtenir le plus petit nombre.`,
      attendu: 'L\'argument amorti (chaque élément entre et sort une fois) et au moins deux applications.',
    },
    {
      id: 'li-e-piles-maxqueue',
      section: 'conception',
      q: 'Concevez une file qui supporte `enqueue`, `dequeue` et `max` en O(1) amorti.',
      answer: `Deux approches :

- **file + deque monotone** : la file normale stocke les éléments ; une deque auxiliaire garde les candidats au maximum en ordre décroissant. À l'\`enqueue(x)\`, on retire à l'arrière de la deque les valeurs \`< x\` puis on ajoute \`x\`. Au \`dequeue\`, si l'élément sorti est égal à l'avant de la deque, on retire aussi cet avant. \`max\` lit l'avant ;
- **deux max-stacks** : une file à deux piles dont chaque pile mémorise son maximum à chaque niveau ; \`max\` est le maximum des sommets des deux piles.

Les deux sont O(1) amorti. Attention aux doublons : dans la première approche, on retire à l'arrière avec \`<\` (et non \`<=\`) pour garder les copies égales au maximum.`,
      attendu: 'Réutiliser la deque monotone ou l\'idée de la min-stack, et gérer correctement les doublons.',
    },
  ],
}

// =============================================================================
// RECHERCHE DICHOTOMIQUE
// =============================================================================
const recherche: ThemePack = {
  cours: [
    {
      id: 'recherche',
      title: 'Recherche dichotomique',
      summary: 'Diviser l\'espace de recherche par deux à chaque étape : O(log n) sur un tableau trié, et bien plus largement sur toute question dont la réponse est monotone.',
      blocks: [
        { p: `La **recherche dichotomique** (*binary search*) compare la cible à l'élément du milieu et élimine la moitié qui ne peut pas la contenir. Sur un million d'éléments, il suffit d'une vingtaine de comparaisons (log₂ 10⁶ ≈ 20). L'idée est simple, mais l'implémentation est réputée piégeuse : bornes décalées d'un, boucles infinies, milieu mal calculé. La parade est d'adopter **un seul modèle**, avec un **invariant** écrit noir sur blanc, et de s'y tenir.` },
        { p: `Surtout, la dichotomie ne se limite pas aux tableaux triés : elle s'applique dès qu'on cherche la frontière d'un **prédicat monotone** (faux, faux, …, faux, vrai, vrai, …). C'est la « recherche sur la réponse », un motif très fréquent en entretien.` },

        { h: 'Le modèle sûr', id: 'recherche-modele' },
        { p: `Le modèle le plus robuste travaille sur un intervalle **semi-ouvert** \`[lo, hi)\` et cherche **le premier indice où un prédicat devient vrai**. L'invariant : tout ce qui est avant \`lo\` est faux, tout ce qui est à partir de \`hi\` est vrai. La boucle tourne tant que \`lo < hi\` ; à la sortie, \`lo === hi\` est la frontière. Comme \`mid < hi\` toujours, \`hi = mid\` et \`lo = mid + 1\` réduisent strictement l'intervalle : **pas de boucle infinie possible**.` },
        {
          title: 'Premier indice où pred est vrai',
          code: `// pred doit être monotone sur [lo, hi) : faux… faux, vrai… vrai
function firstTrue(lo, hi, pred) {
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1) // entier, et toujours < hi
    if (pred(mid)) hi = mid // mid peut être la réponse : on le garde
    else lo = mid + 1 // mid est faux : la réponse est strictement après
  }
  return lo // hi si pred n'est jamais vrai
}

const arr = [1, 3, 3, 5, 8]
firstTrue(0, arr.length, (i) => arr[i] >= 4) // → 3
firstTrue(0, arr.length, (i) => arr[i] >= 100) // → 5`,
          equiv: {
            python: `def first_true(lo, hi, pred):
    while lo < hi:
        mid = (lo + hi) // 2  # entiers de taille arbitraire : pas de débordement
        if pred(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
            java: `static int firstTrue(int lo, int hi, IntPredicate pred) {
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2; // (lo + hi) / 2 peut déborder au-delà de 2^31 - 1
        if (pred.test(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
            rust: `fn first_true(mut lo: usize, mut hi: usize, pred: impl Fn(usize) -> bool) -> usize {
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if pred(mid) { hi = mid; } else { lo = mid + 1; }
    }
    lo
}
// Sur une tranche triée, la bibliothèque standard le fait déjà :
// let i = arr.partition_point(|&v| v < 4);`,
          },
        },
        { p: `**Pourquoi \`lo + ((hi - lo) >> 1)\` ?** Trois raisons :` },
        { list: [
          '`(lo + hi) / 2` n\'est **pas entier** en JavaScript : `(0 + 5) / 2` vaut `2.5`, et `arr[2.5]` vaut `undefined`.',
          'En Java, C ou Rust, `lo + hi` peut **déborder** quand les bornes approchent 2³¹ ; `lo + (hi - lo) / 2` ne dépasse jamais `hi`. C\'est un bug resté des années dans `Arrays.binarySearch` du JDK.',
          '`>> 1` divise par deux en arrondissant vers le bas, mais **convertit en entier 32 bits signé** : au-delà de 2³¹ (fréquent dans une recherche sur la réponse), `(lo + hi) >> 1` devient négatif. `hi - lo` reste petit, d\'où la forme proposée ; sinon, utilisez `Math.floor((lo + hi) / 2)`, exact jusqu\'à 2⁵³.',
        ] },
        {
          title: 'Trois façons de calculer le milieu',
          code: `const lo = 0
const hi = 3000000000 // 3 × 10⁹, typique d'une recherche sur la réponse
console.log((lo + 5) / 2)
console.log((lo + hi) >> 1)
console.log(lo + ((hi - lo) >> 1))
console.log(Math.floor((lo + hi) / 2))`,
          output: `2.5
-647483648
-647483648
1500000000`,
        },
        { p: `La troisième ligne montre que \`lo + ((hi - lo) >> 1)\` n'est sûre que si \`hi - lo < 2³¹\`. Pour des bornes de l'ordre de 10⁹ à 10¹⁸, préférez \`Math.floor((lo + hi) / 2)\` (ou \`BigInt\` au-delà de 2⁵³).` },
        { p: `L'autre modèle classique, sur un intervalle **fermé** \`[lo, hi]\` avec \`while (lo <= hi)\`, convient pour « trouver un élément égal à la cible, sinon -1 » : on renvoie dès que \`arr[mid] === target\`, et l'on avance avec \`lo = mid + 1\` ou \`hi = mid - 1\`.` },
        {
          title: 'Recherche exacte, intervalle fermé',
          code: `function binarySearch(arr, target) {
  let lo = 0
  let hi = arr.length - 1 // fermé : hi est un indice valide
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}

binarySearch([1, 4, 7, 9, 12], 9) // → 3
binarySearch([1, 4, 7, 9, 12], 5) // → -1
binarySearch([], 5) // → -1`,
          equiv: {
            python: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
            java: `static int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
// Arrays.binarySearch(arr, target) existe : il renvoie un indice quelconque parmi les doublons,
// ou -(point d'insertion) - 1 si la cible est absente.`,
            rust: `fn binary_search(arr: &[i32], target: i32) -> i32 {
    // la bibliothèque standard : Ok(indice) ou Err(point d'insertion)
    match arr.binary_search(&target) {
        Ok(i) => i as i32,
        Err(_) => -1,
    }
}`,
          },
        },
        { mnemo: `Semi-ouvert \`[lo, hi)\` : \`while (lo < hi)\`, \`hi = mid\`, \`lo = mid + 1\`, réponse \`lo\`. Fermé \`[lo, hi]\` : \`while (lo <= hi)\`, \`mid ± 1\`. On ne mélange jamais les deux.`, piege: `\`(lo + hi) / 2\` donne un nombre à virgule en JS, et \`>> 1\` casse au-delà de 2³¹. Écrivez l'invariant avant le code.` },

        { h: 'Bornes inférieure et supérieure', id: 'recherche-bornes' },
        { p: `Avec des doublons, « trouver la cible » ne suffit plus : on veut la **première** ou la **dernière** occurrence, ou la position d'insertion. Deux fonctions couvrent tout :` },
        { list: [
          '**lower bound** : premier indice `i` tel que `arr[i] >= x` (position d\'insertion à gauche, `bisect_left` en Python) ;',
          '**upper bound** : premier indice `i` tel que `arr[i] > x` (position d\'insertion à droite, `bisect_right`) ;',
          'première occurrence de `x` : `lowerBound(x)`, si cet indice est dans le tableau et contient `x` ;',
          'dernière occurrence : `upperBound(x) - 1`, avec la même vérification ;',
          'nombre d\'occurrences : `upperBound(x) - lowerBound(x)` ; nombre d\'éléments `< x` : `lowerBound(x)`.',
        ] },
        {
          title: 'lowerBound, upperBound et leurs usages',
          code: `function lowerBound(arr, x) {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (arr[mid] >= x) hi = mid
    else lo = mid + 1
  }
  return lo
}
function upperBound(arr, x) {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (arr[mid] > x) hi = mid // seule différence : > au lieu de >=
    else lo = mid + 1
  }
  return lo
}

const a = [1, 2, 2, 2, 5, 7]
lowerBound(a, 2) // → 1
upperBound(a, 2) // → 4
upperBound(a, 2) - lowerBound(a, 2) // → 3
lowerBound(a, 6) // → 5
lowerBound(a, 9) // → 6`,
          equiv: {
            python: `from bisect import bisect_left, bisect_right

a = [1, 2, 2, 2, 5, 7]
bisect_left(a, 2)                     # lower bound : 1
bisect_right(a, 2)                    # upper bound : 4
bisect_right(a, 2) - bisect_left(a, 2)  # nombre d'occurrences : 3
# insort(a, x) insère en gardant la liste triée (mais l'insertion elle-même est O(n))`,
            java: `static int lowerBound(int[] arr, int x) {
    int lo = 0, hi = arr.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] >= x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
static int upperBound(int[] arr, int x) {
    int lo = 0, hi = arr.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] > x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
// Pour un ensemble trié dynamique : TreeSet.ceiling(x), higher(x), floor(x), lower(x)`,
            rust: `let a = [1, 2, 2, 2, 5, 7];
let lower = a.partition_point(|&v| v < 2); // 1
let upper = a.partition_point(|&v| v <= 2); // 4
let count = upper - lower; // 3`,
            php: `function lowerBound(array $arr, int $x): int {
    $lo = 0;
    $hi = count($arr);
    while ($lo < $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($arr[$mid] >= $x) $hi = $mid;
        else $lo = $mid + 1;
    }
    return $lo;
}
// upperBound : identique avec $arr[$mid] > $x`,
          },
        },
        { mnemo: `lower = « premier ≥ », upper = « premier > ». Compter les x : upper − lower.`, piege: `Après \`lowerBound\`, vérifiez \`i < arr.length && arr[i] === x\` avant de conclure que \`x\` est présent : l'indice renvoyé peut valoir \`arr.length\`.` },

        { h: 'Tableau trié pivoté', id: 'recherche-pivote' },
        { p: `Un tableau trié puis **pivoté** (\`[4, 5, 6, 7, 0, 1, 2]\`) n'est plus trié, mais à chaque étape **au moins une des deux moitiés l'est**. Si \`nums[lo] <= nums[mid]\`, la moitié gauche est triée : on regarde si la cible est dans \`[nums[lo], nums[mid])\` pour savoir de quel côté aller ; sinon c'est la moitié droite qui est triée. Toujours O(log n), à condition que les valeurs soient **distinctes** (avec des doublons, \`[1, 1, 1, 0, 1]\` oblige à dégrader en O(n) dans le pire cas).` },
        {
          title: 'Minimum d\'un tableau pivoté',
          code: `// le minimum est le premier indice i tel que nums[i] <= nums[n - 1]
function findMin(nums) {
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (nums[mid] > nums[hi]) lo = mid + 1 // le point de rupture est à droite de mid
    else hi = mid // mid est dans la partie basse : il peut être le minimum
  }
  return nums[lo]
}

findMin([4, 5, 6, 7, 0, 1, 2]) // → 0
findMin([3, 1, 2]) // → 1
findMin([1, 2, 3]) // → 1`,
          equiv: {
            python: `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
            java: `static int findMin(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo];
}`,
          },
        },
        { p: `On compare à \`nums[hi]\` plutôt qu'à \`nums[lo]\` : c'est ce qui fait fonctionner le cas « pas pivoté du tout » sans traitement spécial.` },

        { h: 'Recherche sur la réponse', id: 'recherche-reponse' },
        { p: `**Signaux** : « trouver la **plus petite** capacité / vitesse / taille telle que… », « **minimiser le maximum** » ou « maximiser le minimum », avec des bornes énormes (jusqu'à 10⁹) mais une vérification facile. On ne cherche plus dans un tableau mais dans l'**intervalle des réponses possibles** : si une capacité \`c\` suffit, toute capacité plus grande suffit aussi. Le prédicat \`feasible(c)\` est donc monotone, et on cherche son premier « vrai ».` },
        { p: `Recette : (1) bornes \`lo\` = plus petite réponse imaginable, \`hi\` = une réponse sûrement valide ; (2) écrire \`feasible(c)\`, souvent un parcours glouton en O(n) ; (3) appliquer le modèle \`firstTrue\`. Complexité : **O(n · log(hi − lo))**.` },
        {
          title: 'Capacité minimale pour livrer en `days` jours',
          code: `function shipWithinDays(weights, days) {
  // peut-on tout livrer en days jours avec cette capacité ? (glouton, dans l'ordre)
  const feasible = (cap) => {
    let needed = 1
    let load = 0
    for (const w of weights) {
      if (load + w > cap) {
        needed++
        load = 0
      }
      load += w
    }
    return needed <= days
  }
  let lo = Math.max(...weights) // il faut au moins pouvoir porter le colis le plus lourd
  let hi = weights.reduce((a, b) => a + b, 0) // tout en un jour
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (feasible(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}

shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) // → 15
shipWithinDays([3, 2, 2, 4, 1, 4], 3) // → 6`,
          equiv: {
            python: `def ship_within_days(weights, days):
    def feasible(cap):
        needed, load = 1, 0
        for w in weights:
            if load + w > cap:
                needed += 1
                load = 0
            load += w
        return needed <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
            java: `static int shipWithinDays(int[] weights, int days) {
    int lo = 0, hi = 0;
    for (int w : weights) { lo = Math.max(lo, w); hi += w; }
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(weights, days, mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
static boolean feasible(int[] weights, int days, int cap) {
    int needed = 1, load = 0;
    for (int w : weights) {
        if (load + w > cap) { needed++; load = 0; }
        load += w;
    }
    return needed <= days;
}`,
          },
        },
        { p: `Même schéma pour la **racine carrée entière** : on cherche le **dernier** \`m\` tel que \`m * m <= x\`. Chercher un « dernier vrai » impose \`lo = mid\`, donc un **milieu arrondi vers le haut**, sinon \`lo = mid\` ne bouge plus quand \`hi = lo + 1\`.` },
        {
          title: 'Racine carrée entière (dernier vrai, milieu haut)',
          code: `function mySqrt(x) {
  let lo = 0
  let hi = x < 2 ? x : Math.floor(x / 2) // pour x >= 2, la racine est <= x / 2
  while (lo < hi) {
    const mid = lo + ((hi - lo + 1) >> 1) // arrondi vers le HAUT, car on fait lo = mid
    if (mid * mid <= x) lo = mid
    else hi = mid - 1
  }
  return lo
}

mySqrt(8) // → 2
mySqrt(16) // → 4
mySqrt(1) // → 1
mySqrt(2147483647) // → 46340`,
        },
        { p: `« **Minimiser le maximum** » (découper un tableau en k morceaux dont la plus grande somme est minimale, répartir des livres entre élèves, Koko et ses bananes) se traite exactement comme la livraison : le prédicat est « peut-on découper avec un maximum ≤ c ? ». « Maximiser le minimum » (placer des vaches le plus loin possible les unes des autres) cherche au contraire le **dernier vrai**.` },
        { mnemo: `« Plus petit X tel que… » + vérification facile + bornes énormes → dichotomie sur la réponse. Complexité : coût de la vérification × log(intervalle).`, piege: `Bornes trop étroites (\`lo = 0\` alors qu'une capacité inférieure au plus lourd colis est impossible, ou \`hi\` qui n'est pas forcément valide) : le prédicat n'est alors plus correct aux extrémités.` },

        { h: 'Pic, matrice triée et autres variantes', id: 'recherche-variantes' },
        { p: `La dichotomie n'exige pas un tableau trié, seulement de savoir **de quel côté se trouve forcément une réponse**. Pour un **élément pic** (strictement plus grand que ses voisins, avec \`nums[-1] = nums[n] = -∞\`), si \`nums[mid] < nums[mid + 1]\`, on monte : un pic existe forcément à droite.` },
        {
          title: 'Trouver un pic en O(log n)',
          code: `function findPeak(nums) {
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1) // mid < hi, donc mid + 1 existe
    if (nums[mid] < nums[mid + 1]) lo = mid + 1 // ça monte : un pic à droite
    else hi = mid // ça descend : mid ou un pic à gauche
  }
  return lo
}

findPeak([1, 2, 3, 1]) // → 2
findPeak([5, 4, 3]) // → 0`,
          equiv: {
            python: `def find_peak(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
            java: `static int findPeak(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
          },
        },
        { p: `Une **matrice** dont chaque ligne est triée et dont la première valeur de chaque ligne dépasse la dernière de la précédente est un tableau trié de \`R × C\` cases : on dichotomise sur l'indice virtuel \`k\`, avec \`ligne = Math.floor(k / C)\` et \`colonne = k % C\`. Si seules les lignes **et** les colonnes sont triées (sans la condition entre lignes), on part du **coin haut droit** et l'on élimine une ligne ou une colonne à chaque pas : O(R + C).` },
        {
          title: 'Matrice entièrement triée : indice virtuel',
          code: `function searchMatrix(matrix, target) {
  const R = matrix.length
  const C = R ? matrix[0].length : 0
  let lo = 0
  let hi = R * C - 1
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1)
    const v = matrix[Math.floor(mid / C)][mid % C]
    if (v === target) return true
    if (v < target) lo = mid + 1
    else hi = mid - 1
  }
  return false
}

const m = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]
searchMatrix(m, 16) // → true
searchMatrix(m, 13) // → false`,
          equiv: {
            python: `def search_matrix(matrix, target):
    R = len(matrix)
    C = len(matrix[0]) if R else 0
    lo, hi = 0, R * C - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = matrix[mid // C][mid % C]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
            java: `static boolean searchMatrix(int[][] matrix, int target) {
    int R = matrix.length, C = R > 0 ? matrix[0].length : 0;
    int lo = 0, hi = R * C - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int v = matrix[mid / C][mid % C];
        if (v == target) return true;
        if (v < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
          },
        },

        { h: 'Pièges de boucle infinie', id: 'recherche-pieges' },
        { p: `La boucle infinie apparaît quand l'intervalle **ne rétrécit plus**. Cas typique : \`lo = mid\` avec un milieu arrondi vers le bas. Quand \`hi = lo + 1\`, \`mid\` vaut \`lo\`, et \`lo = mid\` ne change rien.` },
        { table: [
          ['Mise à jour', 'Milieu à utiliser', 'Ce que l\'on cherche'],
          ['`hi = mid` et `lo = mid + 1`', 'bas : `lo + ((hi - lo) >> 1)`', 'premier vrai'],
          ['`lo = mid` et `hi = mid - 1`', 'haut : `lo + ((hi - lo + 1) >> 1)`', 'dernier vrai'],
          ['`lo = mid + 1` et `hi = mid - 1`', 'bas ou haut', 'égalité exacte (`while (lo <= hi)`)'],
        ] },
        { list: [
          'Testez mentalement l\'intervalle à **deux éléments** : c\'est là que se cachent les boucles infinies.',
          'Testez aussi le tableau vide, un seul élément, la cible plus petite que tout et plus grande que tout.',
          'Si \`while (lo <= hi)\` est utilisé avec \`hi = mid\`, la boucle ne s\'arrête jamais quand \`lo === hi === mid\`.',
        ] },
        { mnemo: `\`lo = mid\` ⇒ milieu **haut**. \`hi = mid\` ⇒ milieu **bas**. Vérifiez toujours le cas à deux éléments.`, piege: `\`while (lo <= hi)\` combiné avec \`hi = mid\` boucle indéfiniment quand \`lo === hi\`.` },
      ],
      mnemo: `Invariant d'abord, code ensuite. Modèle unique : \`[lo, hi)\`, \`while (lo < hi)\`, \`mid = lo + ((hi - lo) >> 1)\`, \`pred(mid) ? hi = mid : lo = mid + 1\`. « Plus petit X tel que… » → dichotomie sur la réponse.`,
      piege: `\`(lo + hi) / 2\` n'est pas entier en JS ; \`>> 1\` déborde au-delà de 2³¹ ; \`lo = mid\` avec un milieu bas boucle à l'infini.`,
    },
  ],

  katas: [
    {
      id: 'li-insertion',
      title: 'Position d\'insertion',
      difficulty: 'facile',
      theme: 'recherche',
      pattern: 'lower bound',
      statement: `\`nums\` est un tableau d'entiers **triés par ordre croissant** (avec d'éventuels doublons). Écrivez \`searchInsert(nums, target)\` qui renvoie l'indice où insérer \`target\` pour garder le tableau trié, en l'insérant **avant** les éléments égaux. Autrement dit : le premier indice \`i\` tel que \`nums[i] >= target\`, ou \`nums.length\` s'il n'y en a pas.

Exemples :

- \`searchInsert([1, 3, 5, 6], 5)\` donne \`2\` ;
- \`searchInsert([1, 3, 5, 6], 2)\` donne \`1\` ;
- \`searchInsert([1, 3, 5, 6], 7)\` donne \`4\` ;
- \`searchInsert([1, 2, 2, 2, 3], 2)\` donne \`1\`.

Contraintes : jusqu'à 10⁵ éléments et 10⁵ appels : chaque appel doit être en **O(log n)**.`,
      starter: `function searchInsert(nums, target) {
  // TODO : dichotomie
  return nums.indexOf(target)
}`,
      solution: `function searchInsert(nums, target) {
  let lo = 0
  let hi = nums.length // la réponse peut être nums.length : intervalle [lo, hi)
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (nums[mid] >= target) hi = mid
    else lo = mid + 1
  }
  return lo
}`,
      solutionEquiv: {
        python: `from bisect import bisect_left

def search_insert(nums, target):
    return bisect_left(nums, target)

# version explicite
def search_insert_manual(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        java: `static int searchInsert(int[] nums, int target) {
    int lo = 0, hi = nums.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        rust: `fn search_insert(nums: &[i32], target: i32) -> usize {
    nums.partition_point(|&v| v < target)
}`,
        php: `function searchInsert(array $nums, int $target): int {
    $lo = 0;
    $hi = count($nums);
    while ($lo < $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($nums[$mid] >= $target) $hi = $mid;
        else $lo = $mid + 1;
    }
    return $lo;
}`,
      },
      tests: [
        { name: 'cible présente', code: `assertEqual(searchInsert([1, 3, 5, 6], 5), 2)` },
        { name: 'cible absente au milieu', code: `assertEqual(searchInsert([1, 3, 5, 6], 2), 1)` },
        { name: 'avant tout et après tout', code: `assertEqual(searchInsert([1, 3, 5, 6], 0), 0)
assertEqual(searchInsert([1, 3, 5, 6], 7), 4)` },
        { name: 'doublons : avant les égaux', code: `assertEqual(searchInsert([1, 2, 2, 2, 3], 2), 1)
assertEqual(searchInsert([2, 2, 2], 2), 0)` },
        { name: 'tableau vide', code: `assertEqual(searchInsert([], 3), 0)` },
        { name: 'grande entrée', code: `const n = 100000
const nums = Array.from({ length: n }, (_, i) => 2 * i) // pairs
const t0 = performance.now()
let ok = true
for (let q = 0; q < n; q++) {
  const t = 2 * n - 1 - 2 * q // impairs, absents : la réponse est n - q
  if (searchInsert(nums, t) !== n - q) ok = false
}
const elapsed = performance.now() - t0
assert(ok, 'position incorrecte')
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Le tableau est trié : une recherche linéaire gaspille cette information. Avec 10⁵ appels sur 10⁵ éléments, O(n) par appel fait 10¹⁰ opérations.',
        'Reformulez : on cherche le **premier** indice où `nums[i] >= target`. Ce prédicat est faux puis vrai : c\'est une frontière.',
        'Intervalle semi-ouvert `[0, nums.length)` : la réponse peut être `nums.length`. `hi = mid` si le prédicat est vrai, `lo = mid + 1` sinon.',
      ],
      discussion: `**Complexité** : O(log n) par appel, O(1) mémoire.

C'est exactement la **borne inférieure** (\`lower_bound\` en C++, \`bisect_left\` en Python, \`partition_point(|v| v < x)\` en Rust). Remplacer \`>=\` par \`>\` donne la borne supérieure, c'est-à-dire l'insertion **après** les égaux.

**Erreurs fréquentes** : initialiser \`hi = nums.length - 1\` (on ne peut plus renvoyer \`nums.length\`), ou utiliser \`Math.floor((lo + hi) / 2)\` puis \`hi = mid - 1\` en mélangeant les modèles.

**Suivi** : dans un ensemble trié qui change (insertions fréquentes), l'insertion dans un tableau coûte O(n) ; on passe à un arbre équilibré (\`TreeSet\`, \`BTreeSet\`) ou une *skip list*.`,
    },
    {
      id: 'li-premiere-derniere',
      title: 'Première et dernière occurrence',
      difficulty: 'facile',
      theme: 'recherche',
      pattern: 'lower / upper bound',
      statement: `\`nums\` est trié par ordre croissant. Écrivez \`searchRange(nums, target)\` qui renvoie \`[premier, dernier]\`, les indices de la première et de la dernière occurrence de \`target\`, ou \`[-1, -1]\` si \`target\` est absent.

Exemples :

- \`searchRange([5, 7, 7, 8, 8, 10], 8)\` donne \`[3, 4]\` ;
- \`searchRange([5, 7, 7, 8, 8, 10], 6)\` donne \`[-1, -1]\` ;
- \`searchRange([2, 2, 2], 2)\` donne \`[0, 2]\`.

Contrainte : **O(log n)**, même si toutes les valeurs sont égales (trouver une occurrence puis « s'étaler » à gauche et à droite est O(n) dans ce cas).`,
      starter: `function searchRange(nums, target) {
  // TODO
  return [-1, -1]
}`,
      solution: `function searchRange(nums, target) {
  // premier indice où pred est vrai, sur [0, n)
  const firstTrue = (pred) => {
    let lo = 0
    let hi = nums.length
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1)
      if (pred(nums[mid])) hi = mid
      else lo = mid + 1
    }
    return lo
  }
  const first = firstTrue((v) => v >= target) // lower bound
  if (first === nums.length || nums[first] !== target) return [-1, -1]
  const last = firstTrue((v) => v > target) - 1 // upper bound - 1
  return [first, last]
}`,
      solutionEquiv: {
        python: `from bisect import bisect_left, bisect_right

def search_range(nums, target):
    first = bisect_left(nums, target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    return [first, bisect_right(nums, target) - 1]`,
        java: `static int[] searchRange(int[] nums, int target) {
    int first = firstTrue(nums, target, false);
    if (first == nums.length || nums[first] != target) return new int[] {-1, -1};
    return new int[] {first, firstTrue(nums, target, true) - 1};
}
// strict = false : premier nums[i] >= target ; strict = true : premier nums[i] > target
static int firstTrue(int[] nums, int target, boolean strict) {
    int lo = 0, hi = nums.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        boolean ok = strict ? nums[mid] > target : nums[mid] >= target;
        if (ok) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        rust: `fn search_range(nums: &[i32], target: i32) -> [i32; 2] {
    let first = nums.partition_point(|&v| v < target);
    if first == nums.len() || nums[first] != target {
        return [-1, -1];
    }
    let last = nums.partition_point(|&v| v <= target) - 1;
    [first as i32, last as i32]
}`,
      },
      tests: [
        { name: 'exemple', code: `assertEqual(searchRange([5, 7, 7, 8, 8, 10], 8), [3, 4])` },
        { name: 'absent', code: `assertEqual(searchRange([5, 7, 7, 8, 8, 10], 6), [-1, -1])
assertEqual(searchRange([5, 7], 11), [-1, -1])
assertEqual(searchRange([5, 7], 1), [-1, -1])` },
        { name: 'tout égal', code: `assertEqual(searchRange([2, 2, 2], 2), [0, 2])` },
        { name: 'occurrence unique et bords', code: `assertEqual(searchRange([1, 2, 3], 1), [0, 0])
assertEqual(searchRange([1, 2, 3], 3), [2, 2])` },
        { name: 'vide', code: `assertEqual(searchRange([], 0), [-1, -1])` },
      ],
      hints: [
        'Deux recherches dichotomiques indépendantes : l\'une pour la première occurrence, l\'autre pour la dernière.',
        'Première occurrence = premier indice avec `nums[i] >= target` ; dernière = (premier indice avec `nums[i] > target`) − 1.',
        'Vérifiez que la borne inférieure tombe bien sur `target` (et pas sur `nums.length` ou une valeur plus grande) avant de calculer la seconde.',
      ],
      discussion: `**Complexité** : deux dichotomies, donc O(log n) ; O(1) mémoire.

**Pourquoi ne pas s'étaler ?** Trouver une occurrence puis avancer à gauche et à droite coûte O(k), k étant le nombre d'occurrences : O(n) si tout est égal.

**Factorisation** : écrire une seule fonction \`firstTrue(pred)\` et l'appeler avec deux prédicats évite deux copies quasi identiques, source classique de fautes d'inattention.

**Suivi** : compter les occurrences (\`upper - lower\`) ; compter les éléments dans un intervalle \`[a, b]\` (\`upperBound(b) - lowerBound(a)\`).`,
    },
    {
      id: 'li-pivote',
      title: 'Recherche dans un tableau trié pivoté',
      difficulty: 'moyen',
      theme: 'recherche',
      pattern: 'dichotomie modifiée',
      statement: `Un tableau d'entiers **distincts**, trié par ordre croissant, a été **pivoté** à un indice inconnu : \`[0, 1, 2, 4, 5, 6, 7]\` peut devenir \`[4, 5, 6, 7, 0, 1, 2]\`. Écrivez \`search(nums, target)\` qui renvoie l'indice de \`target\`, ou \`-1\` s'il est absent, en **O(log n)**.

Exemples :

- \`search([4, 5, 6, 7, 0, 1, 2], 0)\` donne \`4\` ;
- \`search([4, 5, 6, 7, 0, 1, 2], 3)\` donne \`-1\` ;
- \`search([1], 0)\` donne \`-1\` ;
- \`search([3, 1], 1)\` donne \`1\`.

Le tableau peut aussi ne pas être pivoté du tout.`,
      starter: `function search(nums, target) {
  // TODO : au moins une des deux moitiés est triée
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (nums[mid] === target) return mid
    if (nums[mid] < target) lo = mid + 1 // faux si le tableau est pivoté
    else hi = mid - 1
  }
  return -1
}`,
      solution: `function search(nums, target) {
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (nums[mid] === target) return mid
    if (nums[lo] <= nums[mid]) {
      // la moitié gauche [lo, mid] est triée
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1
      else lo = mid + 1
    } else {
      // la moitié droite [mid, hi] est triée
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1
      else hi = mid - 1
    }
  }
  return -1
}`,
      solutionEquiv: {
        python: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
        java: `static int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
        php: `function search(array $nums, int $target): int {
    $lo = 0;
    $hi = count($nums) - 1;
    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($nums[$mid] === $target) return $mid;
        if ($nums[$lo] <= $nums[$mid]) {
            if ($nums[$lo] <= $target && $target < $nums[$mid]) $hi = $mid - 1;
            else $lo = $mid + 1;
        } else {
            if ($nums[$mid] < $target && $target <= $nums[$hi]) $lo = $mid + 1;
            else $hi = $mid - 1;
        }
    }
    return -1;
}`,
      },
      tests: [
        { name: 'cible dans la partie basse', code: `assertEqual(search([4, 5, 6, 7, 0, 1, 2], 0), 4)` },
        { name: 'cible dans la partie haute', code: `assertEqual(search([4, 5, 6, 7, 0, 1, 2], 5), 1)
assertEqual(search([6, 7, 0, 1, 2, 4, 5], 7), 1)` },
        { name: 'absent', code: `assertEqual(search([4, 5, 6, 7, 0, 1, 2], 3), -1)
assertEqual(search([1], 0), -1)
assertEqual(search([], 5), -1)` },
        { name: 'deux éléments', code: `assertEqual(search([3, 1], 1), 1)
assertEqual(search([3, 1], 3), 0)` },
        { name: 'non pivoté', code: `assertEqual(search([1, 2, 3, 4, 5], 4), 3)` },
        { name: 'toutes les rotations', code: `const base = [1, 3, 5, 7, 9, 11]
for (let r = 0; r < base.length; r++) {
  const nums = base.slice(r).concat(base.slice(0, r))
  for (let i = 0; i < nums.length; i++) assertEqual(search(nums, nums[i]), i, 'rotation ' + r)
  assertEqual(search(nums, 4), -1)
}` },
      ],
      hints: [
        'Coupez au milieu : l\'une des deux moitiés est forcément triée. Laquelle ? Comparez `nums[lo]` et `nums[mid]`.',
        'Sur la moitié triée, il est facile de savoir si la cible s\'y trouve : elle doit être entre ses deux extrémités.',
        'Si la cible est dans la moitié triée, allez-y ; sinon allez dans l\'autre. Attention au `<=` dans `nums[lo] <= nums[mid]` : quand `lo === mid`, la moitié gauche (un seul élément) est triée.',
      ],
      discussion: `**Complexité** : O(log n) en temps, O(1) en mémoire.

**Alternative en deux temps** : trouver d'abord l'indice du minimum (le point de rotation) par dichotomie, puis faire une recherche classique dans la bonne partie. Plus long à écrire mais chaque étape est plus simple à justifier.

**Avec doublons** (\`[1, 0, 1, 1, 1]\`) : quand \`nums[lo] === nums[mid] === nums[hi]\`, on ne sait pas quelle moitié est triée ; on fait \`lo++\` et \`hi--\`, et le pire cas devient O(n). C'est un très bon suivi d'entretien.

**Erreur fréquente** : \`nums[lo] < nums[mid]\` (strict) se trompe quand \`lo === mid\`, ce qui arrive sur un intervalle de deux éléments.`,
    },
    {
      id: 'li-livraison',
      title: 'Capacité de livraison minimale',
      difficulty: 'moyen',
      theme: 'recherche',
      pattern: 'dichotomie sur la réponse',
      statement: `Des colis de poids \`weights[i]\` doivent être livrés **dans l'ordre**, en au plus \`days\` jours. Chaque jour, on charge des colis consécutifs tant que leur poids total ne dépasse pas la capacité du navire. Écrivez \`shipWithinDays(weights, days)\` qui renvoie la **capacité minimale** permettant de tout livrer à temps.

Exemples :

- \`shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)\` donne \`15\` (\`[1..5] [6, 7] [8] [9] [10]\`) ;
- \`shipWithinDays([3, 2, 2, 4, 1, 4], 3)\` donne \`6\` ;
- \`shipWithinDays([1, 2, 3, 1, 1], 4)\` donne \`3\`.

Contraintes : \`1 <= days <= weights.length <= 10^5\`, \`1 <= weights[i] <= 500\`. Essayer toutes les capacités une à une est trop lent.`,
      starter: `function shipWithinDays(weights, days) {
  // TODO : quelle est la plus petite capacité qui suffit ?
  return Math.max(...weights)
}`,
      solution: `function shipWithinDays(weights, days) {
  const feasible = (cap) => {
    let needed = 1
    let load = 0
    for (const w of weights) {
      if (load + w > cap) {
        needed++ // le colis part le jour suivant
        load = 0
      }
      load += w
    }
    return needed <= days
  }
  let lo = 0
  let hi = 0
  for (const w of weights) {
    lo = Math.max(lo, w) // au moins le plus lourd colis
    hi += w // tout en un seul jour : toujours possible
  }
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (feasible(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}`,
      solutionEquiv: {
        python: `def ship_within_days(weights, days):
    def feasible(cap):
        needed, load = 1, 0
        for w in weights:
            if load + w > cap:
                needed += 1
                load = 0
            load += w
        return needed <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        java: `static int shipWithinDays(int[] weights, int days) {
    int lo = 0, hi = 0;
    for (int w : weights) { lo = Math.max(lo, w); hi += w; }
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(weights, days, mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
static boolean feasible(int[] weights, int days, int cap) {
    int needed = 1, load = 0;
    for (int w : weights) {
        if (load + w > cap) { needed++; load = 0; }
        load += w;
    }
    return needed <= days;
}`,
        rust: `fn ship_within_days(weights: &[u32], days: u32) -> u32 {
    let feasible = |cap: u32| {
        let (mut needed, mut load) = (1, 0);
        for &w in weights {
            if load + w > cap { needed += 1; load = 0; }
            load += w;
        }
        needed <= days
    };
    let mut lo = *weights.iter().max().unwrap();
    let mut hi: u32 = weights.iter().sum();
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if feasible(mid) { hi = mid; } else { lo = mid + 1; }
    }
    lo
}`,
        php: `function shipWithinDays(array $weights, int $days): int {
    $feasible = function (int $cap) use ($weights, $days): bool {
        $needed = 1;
        $load = 0;
        foreach ($weights as $w) {
            if ($load + $w > $cap) { $needed++; $load = 0; }
            $load += $w;
        }
        return $needed <= $days;
    };
    $lo = max($weights);
    $hi = array_sum($weights);
    while ($lo < $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($feasible($mid)) $hi = $mid;
        else $lo = $mid + 1;
    }
    return $lo;
}`,
      },
      tests: [
        { name: 'exemple 1', code: `assertEqual(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), 15)` },
        { name: 'exemple 2', code: `assertEqual(shipWithinDays([3, 2, 2, 4, 1, 4], 3), 6)` },
        { name: 'exemple 3', code: `assertEqual(shipWithinDays([1, 2, 3, 1, 1], 4), 3)` },
        { name: 'un jour par colis', code: `assertEqual(shipWithinDays([5, 1, 8, 2], 4), 8)` },
        { name: 'un seul jour', code: `assertEqual(shipWithinDays([5, 1, 8, 2], 1), 16)` },
        { name: 'grande entrée', code: `const n = 100000
const weights = Array.from({ length: n }, (_, i) => (i % 500) + 1)
const t0 = performance.now()
const cap = shipWithinDays(weights, 50)
const elapsed = performance.now() - t0
// vérification indépendante : cap suffit, cap - 1 ne suffit pas
const days = (c) => { let d = 1, l = 0; for (const w of weights) { if (l + w > c) { d++; l = 0 } l += w } return d }
assert(days(cap) <= 50 && days(cap - 1) > 50, 'capacité non minimale : ' + cap)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Si une capacité `c` permet de livrer à temps, une capacité `c + 1` aussi : la réponse est la frontière d\'un prédicat monotone.',
        'Écrivez `feasible(cap)` : on remplit chaque jour de façon gloutonne et l\'on compte les jours nécessaires (O(n)).',
        'Bornes : au minimum le colis le plus lourd, au maximum la somme de tous les poids. Puis dichotomie « premier vrai ».',
      ],
      discussion: `**Complexité** : O(n · log(S)), S étant la somme des poids (au plus 5 × 10⁷, soit environ 26 itérations de la dichotomie). Mémoire O(1).

**Pourquoi le glouton est-il correct ?** Pour une capacité donnée, charger le plus possible chaque jour ne peut jamais augmenter le nombre de jours nécessaires : repousser un colis au lendemain ne libère rien d'utile.

**Le motif « minimiser le maximum »** : même code pour *Split Array Largest Sum* (k morceaux, plus grande somme minimale), *Koko Eating Bananas* (vitesse minimale, prédicat \`sum(ceil(p / v)) <= h\`), répartition de pages entre élèves. Quand on maximise un minimum (distance minimale entre vaches), on cherche le **dernier vrai**, avec un milieu arrondi vers le haut.

**Piège** : \`lo = 1\` au lieu du maximum des poids rend \`feasible\` faux pour la mauvaise raison (un colis ne rentre jamais) ; avec le glouton ci-dessus, cela compterait même des jours en trop sans détecter l'impossibilité.`,
    },
    {
      id: 'li-mediane',
      title: 'Médiane de deux tableaux triés',
      difficulty: 'difficile',
      theme: 'recherche',
      pattern: 'dichotomie sur une partition',
      statement: `\`a\` et \`b\` sont deux tableaux triés par ordre croissant (l'un des deux peut être vide, pas les deux). Écrivez \`findMedian(a, b)\` qui renvoie la **médiane** de leur réunion : l'élément du milieu si le nombre total est impair, sinon la moyenne des deux éléments du milieu.

Exemples :

- \`findMedian([1, 3], [2])\` donne \`2\` ;
- \`findMedian([1, 2], [3, 4])\` donne \`2.5\` ;
- \`findMedian([], [1])\` donne \`1\`.

Contraintes : jusqu'à 10⁵ éléments par tableau, et la fonction est appelée de nombreuses fois sur les mêmes tableaux : visez **O(log(min(m, n)))** par appel, sans fusionner.`,
      starter: `function findMedian(a, b) {
  // TODO : couper a et b de sorte que la moitié gauche contienne (m + n + 1) / 2 éléments
  return (a[0] + b[0]) / 2
}`,
      solution: `function findMedian(a, b) {
  if (a.length > b.length) return findMedian(b, a) // on dichotomise sur le plus petit
  const m = a.length
  const n = b.length
  const half = (m + n + 1) >> 1 // taille de la moitié gauche
  let lo = 0
  let hi = m
  while (lo <= hi) {
    const i = (lo + hi) >> 1 // nombre d'éléments pris dans a
    const j = half - i // et dans b
    const aLeft = i === 0 ? -Infinity : a[i - 1]
    const aRight = i === m ? Infinity : a[i]
    const bLeft = j === 0 ? -Infinity : b[j - 1]
    const bRight = j === n ? Infinity : b[j]
    if (aLeft <= bRight && bLeft <= aRight) {
      // partition correcte : tout ce qui est à gauche est <= tout ce qui est à droite
      if ((m + n) % 2 === 1) return Math.max(aLeft, bLeft)
      return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2
    }
    if (aLeft > bRight) hi = i - 1 // trop d'éléments pris dans a
    else lo = i + 1 // pas assez
  }
  throw new Error('tableaux non triés')
}`,
      solutionEquiv: {
        python: `def find_median(a, b):
    if len(a) > len(b):
        return find_median(b, a)
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    inf = float('inf')
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < m else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < n else inf
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2 == 1:
                return max(a_left, b_left)
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1
    raise ValueError('tableaux non triés')`,
        java: `static double findMedian(int[] a, int[] b) {
    if (a.length > b.length) return findMedian(b, a);
    int m = a.length, n = b.length, half = (m + n + 1) / 2;
    int lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        long aLeft = i == 0 ? Long.MIN_VALUE : a[i - 1];
        long aRight = i == m ? Long.MAX_VALUE : a[i];
        long bLeft = j == 0 ? Long.MIN_VALUE : b[j - 1];
        long bRight = j == n ? Long.MAX_VALUE : b[j];
        if (aLeft <= bRight && bLeft <= aRight) {
            if ((m + n) % 2 == 1) return Math.max(aLeft, bLeft);
            return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2.0;
        }
        if (aLeft > bRight) hi = i - 1;
        else lo = i + 1;
    }
    throw new IllegalArgumentException("tableaux non triés");
}`,
      },
      tests: [
        { name: 'total impair', code: `assertEqual(findMedian([1, 3], [2]), 2)` },
        { name: 'total pair', code: `assertEqual(findMedian([1, 2], [3, 4]), 2.5)` },
        { name: 'un tableau vide', code: `assertEqual(findMedian([], [1]), 1)
assertEqual(findMedian([2, 3], []), 2.5)` },
        { name: 'entrelacés et doublons', code: `assertEqual(findMedian([1, 3, 5, 7], [2, 4, 6]), 4)
assertEqual(findMedian([1, 1, 1], [1, 1]), 1)
assertEqual(findMedian([1, 2], [-1, 3]), 1.5)` },
        { name: 'tailles très différentes', code: `assertEqual(findMedian([100], [1, 2, 3, 4, 5, 6]), 4)
assertEqual(findMedian([1, 2, 3, 4, 5, 6, 7, 8], [0]), 4)` },
        { name: 'grande entrée', code: `const n = 100000
const a = Array.from({ length: n }, (_, i) => 2 * i) // pairs
const b = Array.from({ length: n }, (_, i) => 2 * i + 1) // impairs
const t0 = performance.now()
let ok = true
for (let q = 0; q < 20000; q++) {
  if (findMedian(a, b) !== n - 0.5) ok = false
}
const elapsed = performance.now() - t0
assert(ok, 'médiane incorrecte')
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Fusionner coûte O(m + n). Pensez plutôt à **couper** chaque tableau en deux : `i` éléments de `a` et `j` de `b` à gauche, avec `i + j = (m + n + 1) / 2`.',
        'La coupe est correcte si `a[i - 1] <= b[j]` et `b[j - 1] <= a[i]`. Si `a[i - 1] > b[j]`, on a pris trop d\'éléments dans `a` : diminuez `i`. C\'est une dichotomie sur `i`.',
        'Gérez les bords avec `-Infinity` et `Infinity`, et dichotomisez sur le plus petit tableau pour que `j` reste dans `[0, n]`.',
      ],
      discussion: `**Complexité** : O(log(min(m, n))) en temps, O(1) en mémoire.

**Idée clé** : la médiane sépare la réunion en deux moitiés de même taille (à un près). Choisir \`i\` impose \`j\`. Le prédicat « \`a[i - 1] > b[j]\` » est monotone en \`i\` : c'est encore une recherche de frontière.

**Alternatives** : fusion jusqu'au milieu en O(m + n) (à proposer d'abord en entretien) ; **k-ième plus petit élément de deux tableaux triés** en éliminant k/2 éléments à chaque étape, O(log k), plus intuitif pour certains.

**Pièges** : oublier de permuter pour dichotomiser sur le plus petit tableau (alors \`j\` peut devenir négatif) ; renvoyer une division entière dans les langages typés (\`/ 2.0\` en Java).`,
    },
  ],

  quiz: [
    {
      id: 'li-q-rech-milieu',
      theme: 'recherche',
      kind: 'qcm',
      q: 'En JavaScript, pourquoi éviter `const mid = (lo + hi) / 2` dans une recherche dichotomique sur des indices ?',
      choices: [
        'L\'addition déborde au-delà de 2³¹ comme en Java',
        'La division est plus lente qu\'un décalage de bits',
        'Le résultat peut être décimal, et `arr[2.5]` vaut `undefined`',
        'Elle arrondit vers le haut',
      ],
      answer: 2,
      why: 'Les nombres JS sont des flottants : `(0 + 5) / 2` vaut `2.5`. Il faut un entier : `lo + ((hi - lo) >> 1)` ou `Math.floor((lo + hi) / 2)`. Le débordement de `lo + hi` concerne Java, C ou Rust ; en JS, c\'est `>> 1` qui casse au-delà de 2³¹.',
    },
    {
      id: 'li-q-rech-output-bornes',
      theme: 'recherche',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `function lb(arr, x) {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (arr[mid] >= x) hi = mid
    else lo = mid + 1
  }
  return lo
}
const a = [1, 3, 3, 3, 6]
console.log(lb(a, 3), lb(a, 4), lb(a, 0), lb(a, 7))`,
      choices: ['1 4 0 5', '1 4 0 4', '3 4 0 5', '1 3 -1 5'],
      answer: 0,
      why: 'C\'est la borne inférieure : premier indice avec `arr[i] >= x`. Pour 3 : indice 1 (premier 3). Pour 4 : indice 4 (le 6). Pour 0 : indice 0. Pour 7 : aucun élément, donc `arr.length` = 5.',
    },
    {
      id: 'li-q-rech-output-shift',
      theme: 'recherche',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `const lo = 1000000000
const hi = 2000000000
console.log((lo + hi) >> 1)
console.log(lo + ((hi - lo) >> 1))`,
      choices: ['1500000000\n1500000000', '1500000000\n-647483648', '-647483648\n-647483648', '-647483648\n1500000000'],
      answer: 3,
      why: '`>>` convertit son opérande en entier 32 bits signé. `lo + hi` = 3 × 10⁹ dépasse 2³¹ − 1 et devient négatif. `hi - lo` = 10⁹ tient sur 32 bits : la seconde forme est correcte ici.',
    },
    {
      id: 'li-q-rech-cx-reponse',
      theme: 'recherche',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code, avec n = `piles.length` et M = la plus grande pile ?',
      code: `function minSpeed(piles, h) {
  let lo = 1
  let hi = Math.max(...piles)
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    let hours = 0
    for (const p of piles) hours += Math.ceil(p / mid)
    if (hours <= h) hi = mid
    else lo = mid + 1
  }
  return lo
}
minSpeed([3, 6, 7, 11], 8)`,
      choices: ['O(n · M)', 'O(n log M)', 'O(log n + log M)', 'O(n log n)'],
      answer: 1,
      why: 'Dichotomie sur la réponse : environ log₂ M itérations, chacune parcourant les n piles. Le tableau n\'a pas besoin d\'être trié.',
    },
    {
      id: 'li-q-rech-cx-matrice',
      theme: 'recherche',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code pour une matrice R × C dont les lignes et les colonnes sont triées ?',
      code: `function contains(matrix, target) {
  let r = 0
  let c = matrix[0].length - 1 // coin haut droit
  while (r < matrix.length && c >= 0) {
    const v = matrix[r][c]
    if (v === target) return true
    if (v > target) c--
    else r++
  }
  return false
}
contains([[1, 4, 7], [2, 5, 8], [3, 6, 9]], 6)`,
      choices: ['O(log(R · C))', 'O(R + C)', 'O(R · C)', 'O(R log C)'],
      answer: 1,
      why: 'Chaque itération élimine une colonne ou une ligne entière : au plus R + C itérations. Une dichotomie sur l\'indice virtuel (O(log(R · C))) exigerait en plus que chaque ligne commence après la fin de la précédente.',
    },
    {
      id: 'li-q-rech-bug-infini',
      theme: 'recherche',
      kind: 'bug',
      q: 'Cette fonction cherche le **dernier** indice tel que `arr[i] <= x` (tableau trié, `arr[0] <= x` garanti). Quel est le bug ?',
      code: `function lastAtMost(arr, x) {
  let lo = 0
  let hi = arr.length - 1
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (arr[mid] <= x) lo = mid
    else hi = mid - 1
  }
  return lo
}
lastAtMost([4], 5)`,
      choices: [
        'Il faut `while (lo <= hi)`',
        'Il faut `hi = arr.length`',
        'Il faut renvoyer `hi`',
        'Boucle infinie dès que l\'intervalle a deux éléments : avec `lo = mid`, il faut un milieu arrondi vers le haut',
      ],
      answer: 3,
      why: 'Avec `lo = mid` et un milieu arrondi vers le bas, l\'intervalle `[lo, lo + 1]` donne `mid = lo`. Comme `arr[lo] <= x` est garanti, `lo` ne bouge plus : `lastAtMost([1, 5], 3)` boucle indéfiniment (l\'appel ci-dessus, sur un seul élément, n\'entre même pas dans la boucle). Correction : `mid = lo + ((hi - lo + 1) >> 1)`.',
    },
    {
      id: 'li-q-rech-reponse',
      theme: 'recherche',
      kind: 'qcm',
      q: 'Quelle condition rend possible une « dichotomie sur la réponse » ?',
      choices: [
        'Le prédicat « la réponse c convient » est monotone en c',
        'Le tableau d\'entrée est trié',
        'La réponse est un indice du tableau',
        'La fonction à minimiser est dérivable',
      ],
      answer: 0,
      why: 'Il suffit que les valeurs de c se répartissent en « faux… faux, vrai… vrai » (ou l\'inverse). L\'entrée n\'a pas besoin d\'être triée : dans la capacité de livraison, les colis gardent leur ordre d\'origine.',
    },
    {
      id: 'li-q-rech-pivote',
      theme: 'recherche',
      kind: 'qcm',
      q: 'Dans un tableau trié pivoté aux valeurs distinctes, si `nums[lo] <= nums[mid]`, que sait-on ?',
      choices: [
        'La portion `[mid, hi]` est triée',
        'Le minimum est à l\'indice `lo`',
        'La portion `[lo, mid]` est triée',
        'Le tableau n\'est pas pivoté',
      ],
      answer: 2,
      why: 'Si le point de rupture était entre `lo` et `mid`, on aurait `nums[lo] > nums[mid]`. Donc `[lo, mid]` est croissante. La moitié droite peut, elle, contenir la rupture. On ne sait rien du minimum global (il peut être à droite).',
    },
  ],

  pieges: [
    {
      id: 'li-p-milieu-decimal',
      title: 'Milieu décimal',
      theme: 'recherche',
      question: 'Qu\'affiche ce code ?',
      code: `const arr = [10, 20, 30, 40, 50, 60]
let lo = 0
let hi = arr.length - 1
const mid = (lo + hi) / 2
console.log(mid, arr[mid])`,
      output: `2.5 undefined`,
      explanation: `En JavaScript, la division ne tronque pas : \`(0 + 5) / 2\` vaut \`2.5\`. Un tableau n'a pas de propriété \`'2.5'\`, d'où \`undefined\`, et toute comparaison avec \`undefined\` est fausse : la dichotomie part dans une mauvaise direction sans erreur visible. En Java, \`(lo + hi) / 2\` est une division entière, mais l'addition peut déborder.`,
      fix: {
        code: `const arr = [10, 20, 30, 40, 50, 60]
let lo = 0
let hi = arr.length - 1
const mid = lo + ((hi - lo) >> 1)
console.log(mid, arr[mid])`,
        output: `2 30`,
        equiv: {
          python: `arr = [10, 20, 30, 40, 50, 60]
lo, hi = 0, len(arr) - 1
mid = (lo + hi) // 2  # division entière ; pas de débordement en Python
print(mid, arr[mid])`,
          java: `int[] arr = {10, 20, 30, 40, 50, 60};
int lo = 0, hi = arr.length - 1;
int mid = lo + (hi - lo) / 2; // ou (lo + hi) >>> 1
System.out.println(mid + " " + arr[mid]);`,
        },
      },
    },
    {
      id: 'li-p-lo-mid',
      title: 'Boucle infinie avec `lo = mid`',
      theme: 'recherche',
      question: 'On cherche le dernier indice tel que `arr[i] <= 5` (un garde-fou limite la boucle à 10 tours). Qu\'affiche ce code ?',
      code: `const arr = [1, 3]
let lo = 0
let hi = arr.length - 1
let turns = 0
while (lo < hi && turns < 10) {
  turns++
  const mid = lo + ((hi - lo) >> 1)
  if (arr[mid] <= 5) lo = mid
  else hi = mid - 1
}
console.log(lo, hi, turns)`,
      output: `0 1 10`,
      explanation: `Avec deux éléments, \`mid\` (arrondi vers le bas) vaut \`lo\`. Comme \`arr[0] <= 5\`, on fait \`lo = mid\`, c'est-à-dire \`lo = 0\` : rien ne change, et sans garde-fou la boucle ne s'arrête jamais. Règle : si la branche « vrai » fait \`lo = mid\`, le milieu doit être arrondi **vers le haut**.`,
      fix: {
        code: `const arr = [1, 3]
let lo = 0
let hi = arr.length - 1
while (lo < hi) {
  const mid = lo + ((hi - lo + 1) >> 1) // milieu haut
  if (arr[mid] <= 5) lo = mid
  else hi = mid - 1
}
console.log(lo)`,
        output: `1`,
      },
    },
    {
      id: 'li-p-decalage-32',
      title: '`>> 1` au-delà de 2³¹',
      theme: 'recherche',
      question: 'Dichotomie sur la réponse avec des bornes jusqu\'à 4 × 10⁹. Qu\'affiche ce code ?',
      code: `let lo = 1
let hi = 4000000000
const mid = (lo + hi) >> 1
console.log(mid)
console.log(Math.floor((lo + hi) / 2))`,
      output: `-147483648
2000000000`,
      explanation: `Les opérateurs bit à bit (\`>>\`, \`|\`, \`&\`) convertissent leurs opérandes en **entiers 32 bits signés**. \`4000000001\` déborde et le milieu devient négatif : la recherche diverge. \`lo + ((hi - lo) >> 1)\` ne protège que si \`hi - lo < 2³¹\`. Pour de grandes bornes, \`Math.floor((lo + hi) / 2)\` est exact jusqu'à 2⁵³ (ou \`>>> 1\` jusqu'à 2³²).`,
    },
  ],

  flashcards: [
    { id: 'li-f-rech-modele', theme: 'recherche', front: 'Le modèle « premier vrai » en 4 lignes ?', back: `\`[lo, hi)\` semi-ouvert ; \`while (lo < hi)\` ; \`mid = lo + ((hi - lo) >> 1)\` ; \`pred(mid) ? hi = mid : lo = mid + 1\`. À la sortie, \`lo\` est le premier indice où \`pred\` est vrai (ou \`hi\` initial s'il ne l'est jamais).` },
    { id: 'li-f-rech-bornes', theme: 'recherche', front: 'lower bound et upper bound ?', back: `**lower bound** : premier indice avec \`arr[i] >= x\` (\`bisect_left\`). **upper bound** : premier indice avec \`arr[i] > x\` (\`bisect_right\`). Nombre d'occurrences de x : upper − lower.` },
    { id: 'li-f-rech-milieu', theme: 'recherche', front: 'Pourquoi `lo + ((hi - lo) >> 1)` ?', back: `C'est un entier (\`(lo + hi) / 2\` peut valoir 2.5 en JS), il ne déborde pas dans les langages à entiers fixes, et \`hi - lo\` reste petit alors que \`lo + hi\` peut dépasser 2³¹ (limite de \`>>\`).` },
    { id: 'li-f-rech-infini', theme: 'recherche', front: 'Quand faut-il un milieu arrondi vers le haut ?', back: `Quand la branche qui garde \`mid\` fait \`lo = mid\` (recherche du **dernier** vrai). Sinon, sur un intervalle de deux éléments, \`mid === lo\` et la boucle ne progresse plus.`, code: `const lo = 4
const hi = 5
lo + ((hi - lo) >> 1) // → 4
lo + ((hi - lo + 1) >> 1) // → 5` },
    { id: 'li-f-rech-reponse', theme: 'recherche', front: 'Quels signaux évoquent une dichotomie sur la réponse ?', back: `« Plus petite capacité / vitesse / taille telle que… », « minimiser le maximum », « maximiser le minimum », des bornes énormes (10⁹) et une vérification facile en O(n). Complexité : O(n · log(intervalle)).` },
    { id: 'li-f-rech-pivote', theme: 'recherche', front: 'Tableau trié pivoté : idée clé ?', back: `À chaque étape, une des deux moitiés est triée (\`nums[lo] <= nums[mid]\` ⇒ la gauche). On vérifie si la cible est dans la moitié triée pour choisir le côté. Avec des doublons, le pire cas devient O(n).` },
    { id: 'li-f-rech-pic', theme: 'recherche', front: 'Comment trouver un pic en O(log n) sans tableau trié ?', back: `Si \`nums[mid] < nums[mid + 1]\`, la suite monte : un pic existe forcément à droite (\`lo = mid + 1\`) ; sinon il en existe un en \`mid\` ou à gauche (\`hi = mid\`).` },
    { id: 'li-f-rech-matrice', theme: 'recherche', front: 'Matrice triée : deux cas ?', back: `Si chaque ligne commence après la fin de la précédente : dichotomie sur l'indice virtuel \`k\` (\`ligne = Math.floor(k / C)\`, \`col = k % C\`), O(log(R·C)). Si seules lignes et colonnes sont triées : départ du coin haut droit, O(R + C).` },
  ],

  lexique: [
    { term: 'Recherche dichotomique', theme: 'recherche', def: `Recherche qui élimine la moitié de l'espace à chaque comparaison : O(log n). Elle s'applique à un tableau trié, et plus généralement à la frontière de tout prédicat monotone.`, see: ['Prédicat monotone', 'Borne inférieure (lower bound)'] },
    { term: 'Borne inférieure (lower bound)', theme: 'recherche', def: `Premier indice \`i\` tel que \`arr[i] >= x\` dans un tableau trié, ou \`arr.length\` s'il n'y en a pas. C'est la position d'insertion à gauche (\`bisect_left\`).`, see: ['Borne supérieure (upper bound)'] },
    { term: 'Borne supérieure (upper bound)', theme: 'recherche', def: `Premier indice \`i\` tel que \`arr[i] > x\`. \`upperBound(x) - lowerBound(x)\` compte les occurrences de \`x\` ; \`upperBound(x) - 1\` est la dernière occurrence si elle existe.`, see: ['Borne inférieure (lower bound)'] },
    { term: 'Prédicat monotone', theme: 'recherche', def: `Condition qui, sur un intervalle ordonné, est fausse puis vraie (ou l'inverse) sans jamais alterner. C'est la seule hypothèse nécessaire à une recherche dichotomique.`, see: ['Dichotomie sur la réponse'] },
    { term: 'Dichotomie sur la réponse', theme: 'recherche', def: `Recherche dichotomique dans l'intervalle des réponses possibles (capacité, vitesse, distance) plutôt que dans un tableau, à l'aide d'une fonction de vérification monotone. Complexité : coût de la vérification × log(intervalle).`, see: ['Prédicat monotone'] },
    { term: 'Tableau trié pivoté', theme: 'recherche', def: `Tableau trié dont on a déplacé un préfixe à la fin (\`[4, 5, 6, 0, 1, 2]\`). La dichotomie s'y applique encore car l'une des deux moitiés est toujours triée.` },
  ],

  entretien: [
    {
      id: 'li-e-rech-invariant',
      section: 'techniques',
      q: 'Comment évitez-vous les erreurs de bornes dans une recherche dichotomique ?',
      answer: `J'utilise toujours le même modèle et j'énonce l'**invariant** avant de coder : « sur \`[lo, hi)\`, tout ce qui est avant \`lo\` est faux, tout ce qui est à partir de \`hi\` est vrai ». La boucle tourne tant que \`lo < hi\`, le milieu est \`lo + ((hi - lo) >> 1)\` (donc toujours \`< hi\`), et les mises à jour sont \`hi = mid\` ou \`lo = mid + 1\` : l'intervalle rétrécit strictement à chaque tour, il n'y a pas de boucle infinie.

Je ramène ensuite chaque problème à « trouver le premier indice où un prédicat devient vrai » : première occurrence, position d'insertion, minimum d'un tableau pivoté, capacité minimale.

Enfin je teste à la main les cas limites : tableau vide, un élément, **deux éléments**, cible hors de l'intervalle.`,
      attendu: 'Un invariant explicite, une justification de la terminaison, et des cas limites testés.',
    },
    {
      id: 'li-e-rech-reponse',
      section: 'techniques',
      q: 'Comment reconnaissez-vous un problème de « dichotomie sur la réponse » ? Donnez un exemple.',
      answer: `Trois signaux : on demande la **plus petite** (ou la plus grande) valeur qui satisfait une contrainte ; vérifier si une valeur donnée convient est **facile** (souvent un glouton en O(n)) ; et cette vérification est **monotone** (si c convient, c + 1 aussi).

Exemple : *Koko Eating Bananas*. Koko mange à la vitesse v (bananes par heure) et doit finir en h heures. \`feasible(v)\` vaut \`sum(ceil(p / v)) <= h\`. Si une vitesse suffit, une plus grande aussi. On cherche le premier v vrai entre 1 et \`max(piles)\` : O(n log M).

Autres exemples : capacité de livraison, découpage en k sous-tableaux minimisant la somme maximale, placement de k éléments maximisant la distance minimale (on cherche alors le dernier vrai).`,
      attendu: 'Identifier la monotonie, écrire le prédicat, choisir des bornes correctes et donner la complexité.',
    },
    {
      id: 'li-e-rech-complexite',
      section: 'complexite',
      q: 'Combien d\'itérations au maximum pour une recherche dichotomique sur 10⁹ éléments ? Et pourquoi la base du logarithme n\'importe pas dans un O ?',
      answer: `Chaque itération divise l'intervalle par deux : il faut ⌈log₂(10⁹ + 1)⌉ = **30** itérations au plus (2³⁰ ≈ 1,07 × 10⁹).

La base n'importe pas car \`log_a(n) = log_b(n) / log_b(a)\` : changer de base multiplie par une constante, que la notation O ignore. Une recherche « ternaire » n'est donc pas asymptotiquement plus rapide ; elle fait même plus de comparaisons par étape.`,
      attendu: 'Savoir calculer log₂ de tête (2¹⁰ ≈ 10³) et comprendre que les constantes disparaissent.',
    },
  ],
}

// =============================================================================
// TRIS
// =============================================================================
const tri: ThemePack = {
  cours: [
    {
      id: 'tri',
      title: 'Tris',
      summary: 'Savoir utiliser `sort()` correctement (comparateur, stabilité), connaître le tri fusion et le tri rapide de l\'intérieur, et reconnaître quand trier simplifie tout le problème.',
      blocks: [
        { p: `En entretien, on écrit rarement un tri pour lui-même : on **trie pour simplifier** (fusion d'intervalles, deux pointeurs, regroupement, glouton), et l'on s'appuie sur \`sort()\`. Encore faut-il l'utiliser correctement : en JavaScript, le tri par défaut est **lexicographique**, et un comparateur mal écrit produit un résultat faux sans la moindre erreur. On attend aussi de vous que vous sachiez expliquer et écrire le **tri fusion** et le **tri rapide**, leurs complexités et leurs variantes (quickselect, comptage des inversions).` },

        { h: 'sort() et les comparateurs', id: 'tri-sort' },
        { p: `Sans argument, \`Array.prototype.sort\` **convertit les éléments en chaînes** et les compare dans l'ordre des unités UTF-16. \`[10, 9, 1].sort()\` donne donc \`[1, 10, 9]\` : « 10 » précède « 9 » comme « ba » précède « c ». Pour des nombres, il faut **toujours** fournir un comparateur \`(a, b) => a - b\`. Le comparateur renvoie un nombre **négatif** si \`a\` doit venir avant \`b\`, **positif** si après, **zéro** s'ils sont équivalents.` },
        {
          title: 'Le tri par défaut est lexicographique',
          code: `const nums = [10, 9, 1, 100, 25]
console.log([...nums].sort())
console.log([...nums].sort((a, b) => a - b))
console.log([...nums].sort((a, b) => b - a))`,
          output: `[ 1, 10, 100, 25, 9 ]
[ 1, 9, 10, 25, 100 ]
[ 100, 25, 10, 9, 1 ]`,
          equiv: {
            python: `nums = [10, 9, 1, 100, 25]
sorted(nums)                # tri numérique : Python compare les nombres comme des nombres
sorted(nums, reverse=True)
sorted(nums, key=str)       # pour reproduire le tri lexicographique de JS`,
            java: `Integer[] nums = {10, 9, 1, 100, 25};
Arrays.sort(nums);                                // ordre naturel : numérique
Arrays.sort(nums, Comparator.reverseOrder());
// int[] primitifs : Arrays.sort(int[]) (dual-pivot quicksort, non stable mais sans objet ici)`,
            rust: `let mut nums = vec![10, 9, 1, 100, 25];
nums.sort();                          // stable, numérique
nums.sort_by(|a, b| b.cmp(a));        // décroissant
nums.sort_unstable();                 // plus rapide quand la stabilité est inutile`,
            php: `$nums = [10, 9, 1, 100, 25];
sort($nums);                                   // numérique pour des entiers
usort($nums, fn($a, $b) => $b <=> $a);         // décroissant, opérateur « vaisseau spatial »
sort($nums, SORT_STRING);                      // lexicographique, comme JS par défaut`,
            bash: `printf '%s\\n' 10 9 1 100 25 | sort       # lexicographique : 1 10 100 25 9
printf '%s\\n' 10 9 1 100 25 | sort -n    # numérique : 1 9 10 25 100
printf '%s\\n' 10 9 1 100 25 | sort -rn   # numérique décroissant`,
          },
        },
        { p: `**Comparateur multi-critères** : on compare le premier critère et, seulement en cas d'égalité, le suivant. L'opérateur \`||\` s'y prête bien car \`0\` est faux : \`(a.age - b.age) || a.name.localeCompare(b.name)\`. Pour des chaînes, \`a < b ? -1 : a > b ? 1 : 0\` compare les unités UTF-16 ; \`localeCompare\` respecte l'ordre de la langue (accents, majuscules).` },
        {
          title: 'Trier par âge décroissant, puis par nom',
          code: `const people = [
  { name: 'Chloé', age: 30 },
  { name: 'Ali', age: 25 },
  { name: 'Bea', age: 30 },
  { name: 'Dan', age: 25 },
]
const sorted = people.toSorted((a, b) => b.age - a.age || a.name.localeCompare(b.name))
console.log(sorted.map((p) => p.name + ' ' + p.age).join(', '))
console.log(people[0].name) // toSorted (ES2023) ne modifie pas l'original`,
          output: `Bea 30, Chloé 30, Ali 25, Dan 25
Chloé`,
          equiv: {
            python: `people = [
    {'name': 'Chloé', 'age': 30},
    {'name': 'Ali', 'age': 25},
    {'name': 'Bea', 'age': 30},
    {'name': 'Dan', 'age': 25},
]
# une clé tuple : -age pour décroissant, puis name croissant
sorted_people = sorted(people, key=lambda p: (-p['age'], p['name']))`,
            java: `record Person(String name, int age) {}

List<Person> sorted = people.stream()
    .sorted(Comparator.comparingInt(Person::age).reversed()
        .thenComparing(Person::name))
    .toList();`,
            rust: `struct Person { name: String, age: u32 }

let mut sorted: Vec<&Person> = people.iter().collect();
sorted.sort_by(|a, b| b.age.cmp(&a.age).then_with(|| a.name.cmp(&b.name)));`,
            php: `usort($people, fn($a, $b) => [$b['age'], $a['name']] <=> [$a['age'], $b['name']]);
// la comparaison de tableaux avec <=> procède élément par élément`,
          },
        },
        { p: `**Stabilité.** Un tri est **stable** s'il conserve l'ordre d'origine des éléments équivalents. Depuis **ES2019**, \`sort\` est garanti stable (V8 utilise TimSort). On peut donc trier par critère secondaire puis par critère principal, ou trier des objets déjà ordonnés sans casser cet ordre. \`toSorted\` (ES2023) renvoie une copie triée ; \`sort\` trie **en place** et renvoie le même tableau.` },
        { mnemo: `Nombres : \`(a, b) => a - b\` (croissant), \`b - a\` (décroissant). Plusieurs critères : \`critère1 || critère2\`. \`sort\` modifie, \`toSorted\` copie.`, piege: `Un comparateur qui renvoie un booléen (\`(a, b) => a > b\`) ne renvoie jamais de négatif : \`false\` vaut 0 (« égaux ») et le tableau reste souvent dans le désordre, sans erreur. Et \`a - b\` ne convient pas aux chaînes (\`NaN\`).` },

        { h: 'Tris élémentaires : insertion et sélection', id: 'tri-elementaires' },
        { p: `Le **tri par sélection** cherche le minimum de la partie non triée et le place au début : toujours O(n²) comparaisons, mais seulement O(n) échanges. Le **tri par insertion** prend chaque élément et le fait reculer jusqu'à sa place dans la partie déjà triée : O(n²) dans le pire cas, mais **O(n) sur un tableau presque trié**, stable et en place. C'est pourquoi TimSort l'utilise sur les petits morceaux (moins de 32 à 64 éléments).` },
        {
          title: 'Tri par insertion',
          code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const x = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > x) {
      arr[j + 1] = arr[j] // décale vers la droite
      j--
    }
    arr[j + 1] = x
  }
  return arr
}

insertionSort([5, 2, 4, 6, 1, 3]) // → [ 1, 2, 3, 4, 5, 6 ]`,
          equiv: {
            python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        x = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > x:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = x
    return arr`,
            java: `static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int x = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > x) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = x;
    }
}`,
          },
        },
        { p: `Le \`>\` strict dans la condition rend le tri **stable** : un élément ne passe jamais devant un égal. Avec \`>=\`, il ne le serait plus.` },

        { h: 'Tri fusion', id: 'tri-fusion' },
        { p: `**Diviser pour régner** : couper le tableau en deux, trier chaque moitié récursivement, puis **fusionner** deux tableaux triés en un seul avec deux pointeurs. La récursion a une profondeur de log₂ n et chaque niveau fusionne n éléments au total : **O(n log n) dans tous les cas**, stable, mais O(n) de mémoire supplémentaire. C'est le tri de choix pour les listes chaînées et les données externes (sur disque).` },
        {
          title: 'Tri fusion',
          code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = arr.length >> 1
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  const out = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    // <= : à égalité, on prend à gauche d'abord, ce qui rend le tri stable
    if (left[i] <= right[j]) out.push(left[i++])
    else out.push(right[j++])
  }
  while (i < left.length) out.push(left[i++])
  while (j < right.length) out.push(right[j++])
  return out
}

mergeSort([38, 27, 43, 3, 9, 82, 10]) // → [ 3, 9, 10, 27, 38, 43, 82 ]`,
          equiv: {
            python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out`,
            java: `static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) return arr;
    int mid = arr.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));
    int[] out = new int[arr.length];
    int i = 0, j = 0, k = 0;
    while (i < left.length && j < right.length) {
        out[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    }
    while (i < left.length) out[k++] = left[i++];
    while (j < right.length) out[k++] = right[j++];
    return out;
}`,
            rust: `fn merge_sort(arr: &[i32]) -> Vec<i32> {
    if arr.len() <= 1 { return arr.to_vec(); }
    let mid = arr.len() / 2;
    let left = merge_sort(&arr[..mid]);
    let right = merge_sort(&arr[mid..]);
    let mut out = Vec::with_capacity(arr.len());
    let (mut i, mut j) = (0, 0);
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] { out.push(left[i]); i += 1; } else { out.push(right[j]); j += 1; }
    }
    out.extend_from_slice(&left[i..]);
    out.extend_from_slice(&right[j..]);
    out
}`,
          },
        },
        { p: `**Bonus : compter les inversions.** Une inversion est une paire \`i < j\` avec \`arr[i] > arr[j]\`. Pendant la fusion, quand on prend \`right[j]\` alors qu'il reste des éléments dans \`left\`, ces \`left.length - i\` éléments sont tous plus grands que \`right[j]\` et placés avant lui : ce sont autant d'inversions. On les compte en O(n log n) au lieu de O(n²).` },
        { mnemo: `Tri fusion : couper, trier, **fusionner avec deux pointeurs**. O(n log n) garanti, stable, O(n) de mémoire.`, piege: `\`<\` au lieu de \`<=\` dans la fusion rend le tri instable. \`arr.slice\` à chaque niveau alloue O(n log n) au total : une version avec un tampon unique est plus économe.` },

        { h: 'Tri rapide et quickselect', id: 'tri-rapide' },
        { p: `Le **tri rapide** (*quicksort*) choisit un **pivot**, **partitionne** le tableau (plus petits à gauche, plus grands à droite) puis trie récursivement chaque côté. En moyenne O(n log n), en place, très rapide en pratique ; mais **O(n²) dans le pire cas**, quand le pivot est toujours le minimum ou le maximum (tableau déjà trié avec pivot = dernier élément). Parade : un **pivot aléatoire** (pire cas improbable), ou la médiane de trois. Il n'est pas stable.` },
        { p: `**Partition de Lomuto** : le pivot est placé en fin de plage ; \`i\` marque la frontière des éléments plus petits ; on parcourt avec \`j\` et l'on échange vers la gauche tout élément inférieur au pivot. Simple à écrire, mais elle dégénère sur les tableaux de valeurs égales. **Partition de Hoare** : deux indices partent des extrémités et se rapprochent en échangeant les paires mal placées ; environ trois fois moins d'échanges et bon comportement sur les doublons, mais plus subtile (le pivot ne finit pas forcément à sa place).` },
        {
          title: 'Tri rapide, partition de Lomuto et pivot aléatoire',
          code: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr
  const p = partition(arr, lo, hi)
  quickSort(arr, lo, p - 1)
  quickSort(arr, p + 1, hi)
  return arr
}

function partition(arr, lo, hi) {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1)) // pivot aléatoire
  ;[arr[r], arr[hi]] = [arr[hi], arr[r]] // placé en fin de plage
  const pivot = arr[hi]
  let i = lo // arr[lo..i-1] < pivot
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  ;[arr[i], arr[hi]] = [arr[hi], arr[i]] // le pivot rejoint sa place définitive
  return i
}

quickSort([3, 6, 1, 8, 2, 9, 2]) // → [ 1, 2, 2, 3, 6, 8, 9 ]`,
          equiv: {
            python: `import random

def quick_sort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr
    p = partition(arr, lo, hi)
    quick_sort(arr, lo, p - 1)
    quick_sort(arr, p + 1, hi)
    return arr

def partition(arr, lo, hi):
    r = random.randint(lo, hi)  # bornes incluses
    arr[r], arr[hi] = arr[hi], arr[r]
    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i`,
            java: `static void quickSort(int[] arr, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(arr, lo, hi);
    quickSort(arr, lo, p - 1);
    quickSort(arr, p + 1, hi);
}

static int partition(int[] arr, int lo, int hi) {
    int r = ThreadLocalRandom.current().nextInt(lo, hi + 1);
    swap(arr, r, hi);
    int pivot = arr[hi], i = lo;
    for (int j = lo; j < hi; j++) {
        if (arr[j] < pivot) swap(arr, i++, j);
    }
    swap(arr, i, hi);
    return i;
}

static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }`,
          },
        },
        { p: `Le \`;\` en début de ligne n'est pas décoratif : sans lui, une ligne qui commence par \`[\` se colle à la précédente (ASI), et \`arr[hi]\\n[arr[r], …]\` serait lu comme un accès par index.` },
        {
          title: 'Partition de Hoare (pour mémoire)',
          code: `function hoarePartition(arr, lo, hi) {
  const pivot = arr[lo + ((hi - lo) >> 1)]
  let i = lo - 1
  let j = hi + 1
  while (true) {
    do i++; while (arr[i] < pivot)
    do j--; while (arr[j] > pivot)
    if (i >= j) return j // arr[lo..j] <= pivot <= arr[j+1..hi]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function quickSortHoare(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr
  const p = hoarePartition(arr, lo, hi)
  quickSortHoare(arr, lo, p) // p inclus : différence avec Lomuto
  quickSortHoare(arr, p + 1, hi)
  return arr
}

quickSortHoare([5, 5, 5, 1, 5, 2]) // → [ 1, 2, 5, 5, 5, 5 ]`,
        },
        { p: `**Quickselect** : pour le **k-ième plus petit** élément, inutile de tout trier. Après une partition, le pivot est à sa place définitive \`p\` : si \`p === k\`, c'est fini ; sinon on ne continue **que d'un seul côté**. En moyenne n + n/2 + n/4 + … = **O(n)** ; O(n²) dans le pire cas (rare avec un pivot aléatoire). C'est la réponse attendue à « k-ième plus grand élément », en concurrence avec un tas de taille k (O(n log k), voir le thème des tas).` },
        {
          title: 'Quickselect itératif',
          code: `function quickSelect(nums, k) {
  // k-ième plus petit, k à partir de 0 ; modifie nums
  let lo = 0
  let hi = nums.length - 1
  while (true) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1))
    ;[nums[r], nums[hi]] = [nums[hi], nums[r]]
    const pivot = nums[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      if (nums[j] < pivot) {
        ;[nums[i], nums[j]] = [nums[j], nums[i]]
        i++
      }
    }
    ;[nums[i], nums[hi]] = [nums[hi], nums[i]]
    if (i === k) return nums[i]
    if (i < k) lo = i + 1
    else hi = i - 1
  }
}

quickSelect([7, 10, 4, 3, 20, 15], 2) // → 7`,
        },
        { mnemo: `Tri rapide : partitionner autour d'un pivot, puis récursion des deux côtés. Quickselect : partitionner, puis **un seul côté**. Pivot aléatoire contre le pire cas.`, piege: `Pivot fixe (dernier élément) + tableau déjà trié = O(n²) et une récursion de profondeur n, qui dépasse la pile d'appels vers 10⁴ éléments.` },

        { h: 'Borne Ω(n log n) et tris linéaires', id: 'tri-lineaires' },
        { p: `**Aucun tri par comparaisons ne peut faire mieux que Ω(n log n) dans le pire cas.** Argument : il y a n! ordres possibles ; chaque comparaison a deux issues, donc un arbre de décision de hauteur h distingue au plus 2^h cas. Il faut 2^h ≥ n!, soit h ≥ log₂(n!) ≈ n log₂ n. Le tri fusion et le tri par tas (voir le thème des tas : construire un tas en O(n), puis extraire n fois le maximum) atteignent cette borne.` },
        { p: `Pour la battre, il faut **ne pas comparer** et exploiter la forme des clés :` },
        { list: [
          '**tri par comptage** : clés entières dans un petit intervalle `[0, K)` ; on compte les occurrences puis on reconstruit. O(n + K) temps et mémoire ;',
          '**tri par paquets** (*bucket sort*) : valeurs réparties uniformément ; on les distribue dans n paquets que l\'on trie séparément. O(n) en moyenne ;',
          '**tri par base** (*radix sort*) : trier chiffre par chiffre, du moins significatif au plus significatif, avec un tri stable (par comptage) à chaque passe. O(d · (n + b)) pour d chiffres en base b.',
        ] },
        {
          title: 'Tri par comptage (stable)',
          code: `function countingSort(arr, maxValue) {
  const count = new Array(maxValue + 1).fill(0)
  for (const x of arr) count[x]++
  // préfixes : count[v] = nombre d'éléments <= v
  for (let v = 1; v <= maxValue; v++) count[v] += count[v - 1]
  const out = new Array(arr.length)
  for (let i = arr.length - 1; i >= 0; i--) {
    // parcours à l'envers : les égaux gardent leur ordre (stabilité)
    out[--count[arr[i]]] = arr[i]
  }
  return out
}

countingSort([4, 2, 2, 8, 3, 3, 1], 8) // → [ 1, 2, 2, 3, 3, 4, 8 ]`,
          equiv: {
            python: `def counting_sort(arr, max_value):
    count = [0] * (max_value + 1)
    for x in arr:
        count[x] += 1
    for v in range(1, max_value + 1):
        count[v] += count[v - 1]
    out = [0] * len(arr)
    for x in reversed(arr):
        count[x] -= 1
        out[count[x]] = x
    return out`,
            java: `static int[] countingSort(int[] arr, int maxValue) {
    int[] count = new int[maxValue + 1];
    for (int x : arr) count[x]++;
    for (int v = 1; v <= maxValue; v++) count[v] += count[v - 1];
    int[] out = new int[arr.length];
    for (int i = arr.length - 1; i >= 0; i--) out[--count[arr[i]]] = arr[i];
    return out;
}`,
          },
        },
        { table: [
          ['Tri', 'Meilleur', 'Moyen', 'Pire', 'Mémoire', 'Stable'],
          ['insertion', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'oui'],
          ['sélection', 'O(n²)', 'O(n²)', 'O(n²)', 'O(1)', 'non'],
          ['fusion', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'oui'],
          ['rapide', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n) pile', 'non'],
          ['par tas', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'non'],
          ['TimSort (`sort` de V8, Python, Java objets)', 'O(n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'oui'],
          ['comptage', 'O(n + K)', 'O(n + K)', 'O(n + K)', 'O(n + K)', 'oui'],
        ] },

        { h: 'Trier pour simplifier', id: 'tri-simplifier' },
        { p: `**Signaux** : intervalles qui se chevauchent, « regrouper les éléments égaux », « paires dont la somme vaut… » avec deux pointeurs, glouton « traiter dans l'ordre de fin », anagrammes. Un tri en O(n log n) suivi d'un parcours linéaire bat souvent une approche plus astucieuse mais plus fragile. La **fusion d'intervalles** est le modèle : trier par début, puis étendre le dernier intervalle tant que le suivant le chevauche.` },
        {
          title: 'Fusion d\'intervalles',
          code: `function mergeIntervals(intervals) {
  const sorted = intervals.toSorted((a, b) => a[0] - b[0]) // par début
  const res = []
  for (const [start, end] of sorted) {
    const last = res[res.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end) // chevauchement
    else res.push([start, end])
  }
  return res
}

mergeIntervals([[8, 10], [1, 3], [2, 6], [15, 18]]) // → [ [ 1, 6 ], [ 8, 10 ], [ 15, 18 ] ]
mergeIntervals([[1, 4], [2, 3]]) // → [ [ 1, 4 ] ]`,
          equiv: {
            python: `def merge_intervals(intervals):
    res = []
    for start, end in sorted(intervals, key=lambda iv: iv[0]):
        if res and start <= res[-1][1]:
            res[-1][1] = max(res[-1][1], end)
        else:
            res.append([start, end])
    return res`,
            java: `static List<int[]> mergeIntervals(int[][] intervals) {
    int[][] sorted = intervals.clone();
    Arrays.sort(sorted, Comparator.comparingInt(iv -> iv[0]));
    List<int[]> res = new ArrayList<>();
    for (int[] iv : sorted) {
        if (!res.isEmpty() && iv[0] <= res.get(res.size() - 1)[1]) {
            int[] last = res.get(res.size() - 1);
            last[1] = Math.max(last[1], iv[1]);
        } else {
            res.add(new int[] {iv[0], iv[1]});
        }
    }
    return res;
}`,
          },
        },
        { mnemo: `Intervalles → trier par début, puis un seul passage. Le \`Math.max\` gère l'intervalle entièrement contenu dans le précédent.`, piege: `\`last[1] = end\` au lieu de \`Math.max(last[1], end)\` raccourcit à tort \`[1, 4]\` fusionné avec \`[2, 3]\`.` },
      ],
      mnemo: `\`sort()\` sans comparateur = ordre des chaînes. Nombres : \`(a, b) => a - b\`. Stable depuis ES2019. Fusion : O(n log n) garanti et stable ; rapide : O(n log n) en moyenne, pivot aléatoire ; k-ième élément : quickselect O(n) en moyenne.`,
      piege: `\`[10, 9, 1].sort()\` donne \`[1, 10, 9]\`. Un comparateur booléen ne trie pas. \`sort\` modifie le tableau d'origine (utilisez \`toSorted\` ou une copie).`,
    },
  ],

  katas: [
    {
      id: 'li-tri-multicritere',
      title: 'Classement multi-critères',
      difficulty: 'facile',
      theme: 'tri',
      pattern: 'comparateur',
      statement: `\`players\` est un tableau d'objets \`{ name, score, time }\`. Écrivez \`ranking(players)\` qui renvoie un **nouveau tableau** des noms, classés :

- d'abord par \`score\` **décroissant** ;
- à score égal, par \`time\` **croissant** (le plus rapide d'abord) ;
- à score et temps égaux, par \`name\` dans l'ordre croissant des chaînes (comparaison simple avec \`<\`, sans tenir compte de la langue).

Le tableau \`players\` ne doit **pas être modifié**.

Exemple : \`ranking([{ name: 'bo', score: 9, time: 30 }, { name: 'al', score: 10, time: 50 }, { name: 'cy', score: 9, time: 20 }])\` donne \`['al', 'cy', 'bo']\`.

Attention : les scores peuvent dépasser 9 (\`100\` est plus grand que \`20\`).`,
      starter: `function ranking(players) {
  // TODO : trier selon les trois critères
  return players.map((p) => p.name).sort()
}`,
      solution: `function ranking(players) {
  return players
    .toSorted((a, b) => {
      if (a.score !== b.score) return b.score - a.score // décroissant
      if (a.time !== b.time) return a.time - b.time // croissant
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    })
    .map((p) => p.name)
}`,
      solutionEquiv: {
        python: `def ranking(players):
    ordered = sorted(players, key=lambda p: (-p['score'], p['time'], p['name']))
    return [p['name'] for p in ordered]`,
        java: `record Player(String name, int score, int time) {}

static List<String> ranking(List<Player> players) {
    return players.stream()
        .sorted(Comparator.comparingInt(Player::score).reversed()
            .thenComparingInt(Player::time)
            .thenComparing(Player::name))
        .map(Player::name)
        .toList();
}`,
        rust: `struct Player { name: String, score: i32, time: i32 }

fn ranking(players: &[Player]) -> Vec<String> {
    let mut sorted: Vec<&Player> = players.iter().collect();
    sorted.sort_by(|a, b| {
        b.score.cmp(&a.score)
            .then(a.time.cmp(&b.time))
            .then_with(|| a.name.cmp(&b.name))
    });
    sorted.into_iter().map(|p| p.name.clone()).collect()
}`,
        php: `function ranking(array $players): array {
    usort($players, fn($a, $b) =>
        [$b['score'], $a['time'], $a['name']] <=> [$a['score'], $b['time'], $b['name']]);
    // usort trie une copie : les tableaux PHP sont passés par valeur
    return array_column($players, 'name');
}`,
      },
      tests: [
        { name: 'exemple', code: `assertEqual(ranking([{ name: 'bo', score: 9, time: 30 }, { name: 'al', score: 10, time: 50 }, { name: 'cy', score: 9, time: 20 }]), ['al', 'cy', 'bo'])` },
        { name: 'scores à plusieurs chiffres', code: `assertEqual(ranking([{ name: 'a', score: 9, time: 1 }, { name: 'b', score: 100, time: 1 }, { name: 'c', score: 20, time: 1 }]), ['b', 'c', 'a'])` },
        { name: 'départage par le nom', code: `assertEqual(ranking([{ name: 'zoe', score: 5, time: 10 }, { name: 'max', score: 5, time: 10 }, { name: 'Ana', score: 5, time: 10 }]), ['Ana', 'max', 'zoe'])` },
        { name: 'entrée non modifiée', code: `const players = [{ name: 'b', score: 1, time: 1 }, { name: 'a', score: 2, time: 1 }]
const copy = JSON.parse(JSON.stringify(players))
ranking(players)
assertEqual(players, copy)` },
        { name: 'vide et unique', code: `assertEqual(ranking([]), [])
assertEqual(ranking([{ name: 'x', score: 0, time: 0 }]), ['x'])` },
      ],
      hints: [
        'Sans comparateur, `sort` compare des chaînes : écrivez une fonction `(a, b) => …` qui renvoie un nombre négatif, positif ou nul.',
        'Comparez le score ; s\'il est différent, renvoyez `b.score - a.score`. Sinon passez au temps, puis au nom.',
        'Pour ne pas modifier l\'entrée, utilisez `toSorted` ou triez une copie (`[...players].sort(…)`).',
      ],
      discussion: `**Complexité** : O(n log n) comparaisons, chacune en O(1) (ou O(longueur du nom) pour le dernier critère).

**Écriture compacte** : \`b.score - a.score || a.time - b.time || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)\`. Le \`||\` passe au critère suivant quand la différence vaut 0.

**Chaînes** : \`localeCompare\` trie selon la langue (« é » près de « e », majuscules mêlées aux minuscules) ; \`<\` compare les unités UTF-16 (toutes les majuscules avant les minuscules). Choisissez selon le besoin et dites-le.

**Stabilité** : depuis ES2019, on pourrait aussi trier trois fois, du critère le moins important au plus important ; c'est plus lent mais montre que vous connaissez la garantie de stabilité. En Python, la clé tuple \`(-score, time, name)\` est l'idiome.`,
    },
    {
      id: 'li-tri-couleurs',
      title: 'Trier trois couleurs en un passage',
      difficulty: 'facile',
      theme: 'tri',
      pattern: 'partition à trois voies',
      statement: `\`nums\` ne contient que des \`0\`, des \`1\` et des \`2\` (rouge, blanc, bleu). Écrivez \`sortColors(nums)\` qui trie le tableau **en place** (la fonction ne renvoie rien), **sans** utiliser \`sort\`, en **un seul passage** et avec O(1) mémoire supplémentaire.

Exemples :

- \`[2, 0, 2, 1, 1, 0]\` devient \`[0, 0, 1, 1, 2, 2]\` ;
- \`[2, 0, 1]\` devient \`[0, 1, 2]\`.

Contraintes : jusqu'à 2 × 10⁵ éléments.`,
      starter: `function sortColors(nums) {
  // TODO : trois zones, 0 à gauche, 2 à droite
}`,
      solution: `function sortColors(nums) {
  // invariants : nums[0..low-1] = 0, nums[low..mid-1] = 1, nums[high+1..] = 2
  let low = 0
  let mid = 0
  let high = nums.length - 1
  while (mid <= high) {
    if (nums[mid] === 0) {
      ;[nums[low], nums[mid]] = [nums[mid], nums[low]]
      low++
      mid++
    } else if (nums[mid] === 1) {
      mid++
    } else {
      ;[nums[mid], nums[high]] = [nums[high], nums[mid]]
      high-- // pas de mid++ : l'élément reçu de la droite n'a pas encore été examiné
    }
  }
}`,
      solutionEquiv: {
        python: `def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1`,
        java: `static void sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] == 0) swap(nums, low++, mid++);
        else if (nums[mid] == 1) mid++;
        else swap(nums, mid, high--);
    }
}
static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }`,
        rust: `fn sort_colors(nums: &mut [i32]) {
    let (mut low, mut mid) = (0usize, 0usize);
    let mut high = nums.len(); // borne exclusive : évite high = -1 en usize
    while mid < high {
        match nums[mid] {
            0 => { nums.swap(low, mid); low += 1; mid += 1; }
            1 => mid += 1,
            _ => { high -= 1; nums.swap(mid, high); }
        }
    }
}`,
      },
      tests: [
        { name: 'exemple 1', code: `const a = [2, 0, 2, 1, 1, 0]
sortColors(a)
assertEqual(a, [0, 0, 1, 1, 2, 2])` },
        { name: 'exemple 2', code: `const a = [2, 0, 1]
sortColors(a)
assertEqual(a, [0, 1, 2])` },
        { name: 'une seule couleur et vide', code: `const a = [1, 1]
sortColors(a)
assertEqual(a, [1, 1])
const b = []
sortColors(b)
assertEqual(b, [])` },
        { name: 'deux échanges consécutifs depuis la droite', code: `const a = [2, 2, 0, 0]
sortColors(a)
assertEqual(a, [0, 0, 2, 2])
const b = [1, 2, 0]
sortColors(b)
assertEqual(b, [0, 1, 2])` },
        { name: 'sans Array.prototype.sort', code: `const original = Array.prototype.sort
const originalToSorted = Array.prototype.toSorted
Array.prototype.sort = function () { throw new Error('sort est interdit') }
Array.prototype.toSorted = function () { throw new Error('toSorted est interdit') }
try {
  const a = [2, 1, 0, 2, 1, 0, 0]
  sortColors(a)
  assertEqual(a, [0, 0, 0, 1, 1, 2, 2])
} finally {
  Array.prototype.sort = original
  Array.prototype.toSorted = originalToSorted
}` },
        { name: 'grande entrée', code: `const n = 200000
const a = Array.from({ length: n }, (_, i) => (i * 7) % 3)
const t0 = performance.now()
sortColors(a)
const elapsed = performance.now() - t0
let ok = true
for (let i = 1; i < n; i++) if (a[i - 1] > a[i]) ok = false
assert(ok, 'tableau non trié')
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Une solution en deux passages existe : compter les 0, les 1 et les 2, puis réécrire le tableau (tri par comptage). Peut-on le faire en un seul ?',
        'Maintenez trois zones : les 0 au début (avant `low`), les 2 à la fin (après `high`), les 1 au milieu ; `mid` parcourt la zone inconnue.',
        'Quand `nums[mid]` vaut 2, échangez-le avec `nums[high]` et décrémentez `high`, mais **n\'avancez pas** `mid` : l\'élément reçu n\'a pas été examiné.',
      ],
      discussion: `**Complexité** : O(n) en temps, un seul passage, O(1) en mémoire.

C'est le **drapeau hollandais** de Dijkstra, ou partition à trois voies. Il sert aussi dans le tri rapide quand il y a beaucoup de doublons : on partitionne en « < pivot », « = pivot », « > pivot » et l'on ne trie récursivement que les deux zones extrêmes, ce qui évite le pire cas O(n²) des tableaux de valeurs toutes égales.

**Alternative** : tri par comptage en deux passages, tout aussi O(n) et plus simple ; c'est une bonne première réponse avant d'annoncer la version en un passage.

**Erreur classique** : faire \`mid++\` après l'échange avec \`high\`. Avec \`[2, 2, 0, 0]\`, un 2 ou un 0 reçu de la droite resterait mal placé.`,
    },
    {
      id: 'li-fusion-intervalles',
      title: 'Fusionner des intervalles',
      difficulty: 'moyen',
      theme: 'tri',
      pattern: 'trier puis balayer',
      statement: `\`intervals\` est un tableau d'intervalles fermés \`[début, fin]\` (avec \`début <= fin\`), dans un ordre quelconque. Écrivez \`merge(intervals)\` qui fusionne tous les intervalles qui se **chevauchent ou se touchent** et renvoie la liste résultante **triée par début**. L'entrée ne doit pas être modifiée.

Exemples :

- \`merge([[1, 3], [2, 6], [8, 10], [15, 18]])\` donne \`[[1, 6], [8, 10], [15, 18]]\` ;
- \`merge([[1, 4], [4, 5]])\` donne \`[[1, 5]]\` (ils se touchent en 4) ;
- \`merge([[1, 4], [2, 3]])\` donne \`[[1, 4]]\`.

Contraintes : jusqu'à 2 × 10⁵ intervalles ; les bornes peuvent dépasser 10 (attention au tri par défaut).`,
      starter: `function merge(intervals) {
  // TODO : trier puis fusionner
  return intervals
}`,
      solution: `function merge(intervals) {
  const sorted = intervals.toSorted((a, b) => a[0] - b[0])
  const res = []
  for (const [start, end] of sorted) {
    const last = res[res.length - 1]
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end) // l'intervalle courant peut être inclus dans le précédent
    } else {
      res.push([start, end]) // copie : ne pas partager les tableaux de l'entrée
    }
  }
  return res
}`,
      solutionEquiv: {
        python: `def merge(intervals):
    res = []
    for start, end in sorted(intervals, key=lambda iv: iv[0]):
        if res and start <= res[-1][1]:
            res[-1][1] = max(res[-1][1], end)
        else:
            res.append([start, end])
    return res`,
        java: `static int[][] merge(int[][] intervals) {
    int[][] sorted = intervals.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> res = new ArrayList<>();
    for (int[] iv : sorted) {
        int[] last = res.isEmpty() ? null : res.get(res.size() - 1);
        if (last != null && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
        else res.add(new int[] {iv[0], iv[1]});
    }
    return res.toArray(new int[0][]);
}`,
        rust: `fn merge(intervals: &[[i32; 2]]) -> Vec<[i32; 2]> {
    let mut sorted = intervals.to_vec();
    sorted.sort_by_key(|iv| iv[0]);
    let mut res: Vec<[i32; 2]> = Vec::new();
    for [start, end] in sorted {
        match res.last_mut() {
            Some(last) if start <= last[1] => last[1] = last[1].max(end),
            _ => res.push([start, end]),
        }
    }
    res
}`,
        php: `function merge(array $intervals): array {
    usort($intervals, fn($a, $b) => $a[0] <=> $b[0]); // copie locale : l'appelant n'est pas modifié
    $res = [];
    foreach ($intervals as [$start, $end]) {
        $n = count($res);
        if ($n > 0 && $start <= $res[$n - 1][1]) {
            $res[$n - 1][1] = max($res[$n - 1][1], $end);
        } else {
            $res[] = [$start, $end];
        }
    }
    return $res;
}`,
      },
      tests: [
        { name: 'exemple', code: `assertEqual(merge([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]])` },
        { name: 'intervalles qui se touchent', code: `assertEqual(merge([[1, 4], [4, 5]]), [[1, 5]])` },
        { name: 'intervalle inclus', code: `assertEqual(merge([[1, 4], [2, 3]]), [[1, 4]])` },
        { name: 'désordre et bornes à plusieurs chiffres', code: `assertEqual(merge([[10, 12], [2, 3], [9, 10]]), [[2, 3], [9, 12]])` },
        { name: 'vide et unique', code: `assertEqual(merge([]), [])
assertEqual(merge([[5, 5]]), [[5, 5]])` },
        { name: 'entrée non modifiée', code: `const input = [[3, 4], [1, 3]]
merge(input)
assertEqual(input, [[3, 4], [1, 3]])` },
        { name: 'grande entrée', code: `const n = 200000
const input = Array.from({ length: n }, (_, i) => [((i * 7919) % n) * 2, ((i * 7919) % n) * 2 + 1]) // disjoints, mélangés
const t0 = performance.now()
const res = merge(input)
const elapsed = performance.now() - t0
assertEqual(res.length, n)
assertEqual(res[0], [0, 1])
assertEqual(res[n - 1], [2 * n - 2, 2 * n - 1])
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Si les intervalles étaient triés par début, deux intervalles qui se chevauchent seraient forcément voisins.',
        'Triez par début avec un comparateur numérique, puis parcourez : soit l\'intervalle courant prolonge le dernier du résultat, soit il en démarre un nouveau.',
        'En prolongeant, prenez `Math.max(last[1], end)` : l\'intervalle courant peut être entièrement contenu dans le précédent.',
      ],
      discussion: `**Complexité** : O(n log n) pour le tri, puis O(n) pour le balayage ; O(n) en mémoire pour la copie triée et le résultat.

**Points d'attention** : le comparateur numérique (\`sort()\` par défaut placerait \`[10, 12]\` avant \`[2, 3]\`), le \`<=\` pour fusionner les intervalles qui se touchent (selon l'énoncé), et ne pas modifier l'entrée (on pousse des copies \`[start, end]\`).

**Variantes** : insérer un intervalle dans une liste déjà triée et disjointe (O(n), sans tri) ; nombre minimal de salles de réunion (trier les débuts et les fins séparément, ou un tas des fins) ; nombre minimal d'intervalles à retirer pour qu'ils soient disjoints (glouton par **fin** croissante) ; intersection de deux listes d'intervalles (deux pointeurs).`,
    },
    {
      id: 'li-kieme',
      title: 'K-ième plus grand élément',
      difficulty: 'moyen',
      theme: 'tri',
      pattern: 'quickselect',
      statement: `Écrivez \`kthLargest(nums, k)\` qui renvoie le **k-ième plus grand** élément de \`nums\` (au sens de l'ordre trié, doublons compris : dans \`[3, 3, 1]\`, le 2ᵉ plus grand est \`3\`). Vous pouvez modifier \`nums\`.

Exemples :

- \`kthLargest([3, 2, 1, 5, 6, 4], 2)\` donne \`5\` ;
- \`kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)\` donne \`4\`.

Contraintes : \`1 <= k <= nums.length <= 2 × 10^5\`. Visez **O(n) en moyenne** avec quickselect. Les entrées peuvent être déjà triées : un pivot fixe donnerait O(n²).`,
      starter: `function kthLargest(nums, k) {
  // TODO : quickselect avec pivot aléatoire
  return nums[k - 1]
}`,
      solution: `function kthLargest(nums, k) {
  const target = nums.length - k // indice du résultat dans l'ordre croissant
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    // partition à trois voies autour d'un pivot aléatoire : robuste aux doublons
    const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))]
    let lt = lo // nums[lo..lt-1] < pivot
    let i = lo // nums[lt..i-1] === pivot
    let gt = hi // nums[gt+1..hi] > pivot
    while (i <= gt) {
      if (nums[i] < pivot) {
        ;[nums[lt], nums[i]] = [nums[i], nums[lt]]
        lt++
        i++
      } else if (nums[i] > pivot) {
        ;[nums[i], nums[gt]] = [nums[gt], nums[i]]
        gt--
      } else i++
    }
    if (target < lt) hi = lt - 1
    else if (target > gt) lo = gt + 1
    else return pivot // target tombe dans la zone des égaux
  }
  return nums[lo]
}`,
      solutionEquiv: {
        python: `import random

def kth_largest(nums, k):
    target = len(nums) - k
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        pivot = nums[random.randint(lo, hi)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if nums[i] < pivot:
                nums[lt], nums[i] = nums[i], nums[lt]
                lt += 1
                i += 1
            elif nums[i] > pivot:
                nums[i], nums[gt] = nums[gt], nums[i]
                gt -= 1
            else:
                i += 1
        if target < lt:
            hi = lt - 1
        elif target > gt:
            lo = gt + 1
        else:
            return pivot
    return nums[lo]

# alternative idiomatique en O(n log k) : heapq.nlargest(k, nums)[-1]`,
        java: `static int kthLargest(int[] nums, int k) {
    int target = nums.length - k, lo = 0, hi = nums.length - 1;
    ThreadLocalRandom rnd = ThreadLocalRandom.current();
    while (lo < hi) {
        int pivot = nums[rnd.nextInt(lo, hi + 1)];
        int lt = lo, i = lo, gt = hi;
        while (i <= gt) {
            if (nums[i] < pivot) swap(nums, lt++, i++);
            else if (nums[i] > pivot) swap(nums, i, gt--);
            else i++;
        }
        if (target < lt) hi = lt - 1;
        else if (target > gt) lo = gt + 1;
        else return pivot;
    }
    return nums[lo];
}
static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }`,
        rust: `fn kth_largest(nums: &mut Vec<i32>, k: usize) -> i32 {
    let target = nums.len() - k;
    // la bibliothèque standard fournit quickselect (introselect) :
    *nums.select_nth_unstable(target).1
}`,
      },
      tests: [
        { name: 'exemple 1', code: `assertEqual(kthLargest([3, 2, 1, 5, 6, 4], 2), 5)` },
        { name: 'exemple 2 avec doublons', code: `assertEqual(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4)` },
        { name: 'extrêmes', code: `assertEqual(kthLargest([7, 1, 9, 4], 1), 9)
assertEqual(kthLargest([7, 1, 9, 4], 4), 1)
assertEqual(kthLargest([42], 1), 42)` },
        { name: 'négatifs et doublons', code: `assertEqual(kthLargest([-1, -1, -5, 0], 2), -1)
assertEqual(kthLargest([3, 3, 1], 2), 3)` },
        { name: 'comparaison avec le tri', code: `for (let t = 0; t < 30; t++) {
  const arr = Array.from({ length: 50 }, (_, i) => (i * 37 + t * 11) % 23)
  const sorted = [...arr].sort((a, b) => b - a)
  const k = (t % 50) + 1
  assertEqual(kthLargest([...arr], k), sorted[k - 1], 'essai ' + t)
}` },
        { name: 'grande entrée triée et doublons', code: `const n = 200000
const asc = Array.from({ length: n }, (_, i) => i)
const same = new Array(n).fill(7)
const t0 = performance.now()
assertEqual(kthLargest(asc, n / 2), n / 2)
assertEqual(kthLargest(same, 12345), 7)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Trier coûte O(n log n). Mais on n\'a pas besoin de l\'ordre complet : seulement de l\'élément qui serait à l\'indice `n - k` après tri.',
        'Après une partition autour d\'un pivot, le pivot est à sa place définitive. Si c\'est l\'indice cherché, terminé ; sinon on continue **d\'un seul côté**.',
        'Choisissez le pivot au hasard (contre les tableaux triés) et partitionnez en trois zones `<`, `=`, `>` (contre les tableaux de valeurs égales).',
      ],
      discussion: `**Complexité** : O(n) en moyenne (n + n/2 + n/4 + … ≤ 2n), O(n²) dans le pire cas, très improbable avec un pivot aléatoire. Mémoire O(1) grâce à la version itérative.

**Pourquoi trois voies ?** Avec une partition de Lomuto classique, un tableau de valeurs toutes égales place toujours le pivot en bout de plage : O(n²) même avec un pivot aléatoire.

**Alternatives** :

- trier puis lire \`sorted[n - k]\` : O(n log n), simple, souvent acceptable ;
- un **tas min de taille k** : O(n log k), idéal en flux (on ne garde que les k plus grands vus) et pour k petit ;
- la **médiane des médianes** garantit O(n) dans le pire cas, mais avec une grosse constante : à citer, rarement à coder.

En Rust, \`select_nth_unstable\` ; en C++, \`nth_element\` ; en Python, \`heapq.nlargest\`.`,
    },
    {
      id: 'li-inversions',
      title: 'Compter les inversions',
      difficulty: 'difficile',
      theme: 'tri',
      pattern: 'tri fusion augmenté',
      statement: `Une **inversion** dans un tableau \`nums\` est une paire d'indices \`(i, j)\` avec \`i < j\` et \`nums[i] > nums[j]\`. Écrivez \`countInversions(nums)\` qui renvoie le nombre d'inversions. Le tableau d'entrée ne doit pas être modifié.

Exemples :

- \`countInversions([2, 4, 1, 3, 5])\` donne \`3\` (les paires \`(2, 1)\`, \`(4, 1)\`, \`(4, 3)\`) ;
- \`countInversions([5, 4, 3, 2, 1])\` donne \`10\` ;
- \`countInversions([1, 1, 1])\` donne \`0\` (égalité n'est pas inversion).

Contraintes : jusqu'à 10⁵ éléments. Les deux boucles imbriquées (O(n²)) sont trop lentes : visez **O(n log n)**. Le résultat peut dépasser 2³¹ mais reste inférieur à 2⁵³.`,
      starter: `function countInversions(nums) {
  // TODO : compter pendant la fusion d'un tri fusion
  return 0
}`,
      solution: `function countInversions(nums) {
  const a = [...nums] // copie triée progressivement
  const tmp = new Array(a.length)
  // trie a[lo..hi) et renvoie le nombre d'inversions de cette plage
  const sortCount = (lo, hi) => {
    if (hi - lo <= 1) return 0
    const mid = (lo + hi) >> 1
    let count = sortCount(lo, mid) + sortCount(mid, hi)
    let i = lo
    let j = mid
    let k = lo
    while (i < mid && j < hi) {
      if (a[i] <= a[j]) tmp[k++] = a[i++]
      else {
        count += mid - i // a[i..mid-1] sont tous > a[j] et placés avant lui
        tmp[k++] = a[j++]
      }
    }
    while (i < mid) tmp[k++] = a[i++]
    while (j < hi) tmp[k++] = a[j++]
    for (let t = lo; t < hi; t++) a[t] = tmp[t]
    return count
  }
  return sortCount(0, a.length)
}`,
      solutionEquiv: {
        python: `def count_inversions(nums):
    a = list(nums)
    tmp = [0] * len(a)

    def sort_count(lo, hi):
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        count = sort_count(lo, mid) + sort_count(mid, hi)
        i, j, k = lo, mid, lo
        while i < mid and j < hi:
            if a[i] <= a[j]:
                tmp[k] = a[i]
                i += 1
            else:
                count += mid - i
                tmp[k] = a[j]
                j += 1
            k += 1
        while i < mid:
            tmp[k] = a[i]
            i += 1
            k += 1
        while j < hi:
            tmp[k] = a[j]
            j += 1
            k += 1
        a[lo:hi] = tmp[lo:hi]
        return count

    return sort_count(0, len(a))`,
        java: `static long countInversions(int[] nums) {
    int[] a = nums.clone();
    return sortCount(a, new int[a.length], 0, a.length);
}

static long sortCount(int[] a, int[] tmp, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = (lo + hi) >>> 1;
    long count = sortCount(a, tmp, lo, mid) + sortCount(a, tmp, mid, hi); // long : peut dépasser 2^31
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { count += mid - i; tmp[k++] = a[j++]; }
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    System.arraycopy(tmp, lo, a, lo, hi - lo);
    return count;
}`,
        rust: `fn count_inversions(nums: &[i64]) -> u64 {
    fn sort_count(a: &mut [i64]) -> u64 {
        let n = a.len();
        if n <= 1 { return 0; }
        let mid = n / 2;
        let mut count = sort_count(&mut a[..mid]) + sort_count(&mut a[mid..]);
        let mut merged = Vec::with_capacity(n);
        let (mut i, mut j) = (0, mid);
        while i < mid && j < n {
            if a[i] <= a[j] { merged.push(a[i]); i += 1; }
            else { count += (mid - i) as u64; merged.push(a[j]); j += 1; }
        }
        merged.extend_from_slice(&a[i..mid]);
        merged.extend_from_slice(&a[j..]);
        a.copy_from_slice(&merged);
        count
    }
    let mut a = nums.to_vec();
    sort_count(&mut a)
}`,
      },
      tests: [
        { name: 'exemple', code: `assertEqual(countInversions([2, 4, 1, 3, 5]), 3)` },
        { name: 'décroissant', code: `assertEqual(countInversions([5, 4, 3, 2, 1]), 10)` },
        { name: 'égalités', code: `assertEqual(countInversions([1, 1, 1]), 0)
assertEqual(countInversions([2, 1, 2, 1]), 3)` },
        { name: 'vide, un élément, trié', code: `assertEqual(countInversions([]), 0)
assertEqual(countInversions([7]), 0)
assertEqual(countInversions([1, 2, 3]), 0)` },
        { name: 'entrée non modifiée', code: `const input = [3, 1, 2]
assertEqual(countInversions(input), 2)
assertEqual(input, [3, 1, 2])` },
        { name: 'grande entrée', code: `const n = 100000
const desc = Array.from({ length: n }, (_, i) => n - i)
const t0 = performance.now()
const res = countInversions(desc)
const elapsed = performance.now() - t0
assertEqual(res, n * (n - 1) / 2)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Coupez le tableau en deux : les inversions sont soit dans la moitié gauche, soit dans la moitié droite, soit « à cheval » (un élément de chaque côté).',
        'Si les deux moitiés sont triées, les inversions à cheval se comptent pendant la fusion : quand on prend `right[j]` avant les éléments restants de gauche, combien sont-ils ?',
        'Chaque fois que l\'élément de droite passe devant, ajoutez `mid - i`. À égalité, prenez d\'abord à gauche (`<=`) : une égalité n\'est pas une inversion.',
      ],
      discussion: `**Complexité** : O(n log n) en temps, O(n) en mémoire (copie + tampon). La récursion a une profondeur de log₂ n, aucun risque de dépassement de pile.

**Pourquoi un tampon unique ?** Créer des sous-tableaux avec \`slice\` à chaque niveau fonctionne mais alloue O(n log n) au total et met le ramasse-miettes à contribution.

**Alternative** : un **arbre de Fenwick** (BIT) sur les valeurs compressées : on parcourt de droite à gauche et l'on compte les valeurs déjà vues plus petites que l'élément courant ; O(n log n) aussi.

**Interprétation** : le nombre d'inversions est le nombre d'échanges d'éléments adjacents nécessaires pour trier (c'est le nombre d'échanges du tri à bulles et des décalages du tri par insertion) ; il mesure « à quel point » un tableau est désordonné. Le maximum est n(n − 1)/2, d'où la mention de 2⁵³ : en Java, il faut un \`long\`.`,
    },
  ],

  quiz: [
    {
      id: 'li-q-tri-defaut',
      theme: 'tri',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `console.log([10, 9, 1, 2].sort())`,
      choices: ['[ 1, 2, 9, 10 ]', '[ 10, 9, 2, 1 ]', '[ 1, 10, 2, 9 ]', '[ 1, 2, 10, 9 ]'],
      answer: 2,
      why: 'Sans comparateur, les éléments sont convertis en chaînes et comparés caractère par caractère : « 1 » < « 10 » < « 2 » < « 9 ». Pour un tri numérique : `sort((a, b) => a - b)`.',
    },
    {
      id: 'li-q-tri-stable',
      theme: 'tri',
      kind: 'output',
      q: 'Qu\'affiche ce code (moteur conforme à ES2019 ou plus récent) ?',
      code: `const words = ['bb', 'a', 'cc', 'd', 'ee']
console.log(words.sort((x, y) => x.length - y.length).join(' '))`,
      choices: ['a d bb cc ee', 'd a bb cc ee', 'a d ee cc bb', 'bb cc ee a d'],
      answer: 0,
      why: 'Le tri est garanti **stable** depuis ES2019 : à longueur égale, l\'ordre d\'origine est conservé. « a » précède « d », et « bb », « cc », « ee » restent dans cet ordre.',
    },
    {
      id: 'li-q-tri-cx-fusion',
      theme: 'tri',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code, pour un tableau de taille n (sans optimisation particulière du moteur) ?',
      code: `function msort(a) {
  if (a.length < 2) return a
  const m = a.length >> 1
  const l = msort(a.slice(0, m))
  const r = msort(a.slice(m))
  const out = []
  while (l.length && r.length) out.push(l[0] <= r[0] ? l.shift() : r.shift())
  return out.concat(l, r)
}
msort([5, 3, 8, 1, 9, 2])`,
      choices: ['O(n log n)', 'O(n)', 'O(n² log n)', 'O(n²), à cause de `shift()` dans la fusion'],
      answer: 3,
      why: 'Le découpage est celui du tri fusion, mais la fusion utilise `shift()`, qui coûte O(longueur restante) : fusionner deux moitiés de taille m coûte O(m²) au lieu de O(m). Au niveau i de la récursion, il y a 2^i fusions de taille n/2^i, soit n²/2^i : la somme est dominée par le premier niveau et vaut O(n²). Avec deux indices au lieu de `shift()`, on retrouve O(n log n).',
    },
    {
      id: 'li-q-tri-cx-insertion',
      theme: 'tri',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce tri par insertion appliqué à un tableau **déjà trié** de taille n ?',
      code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const x = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > x) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = x
  }
  return arr
}
insertionSort([1, 2, 3, 4, 5, 6])`,
      choices: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'],
      answer: 1,
      why: 'Sur un tableau trié, la condition `arr[j] > x` est fausse dès le premier test : la boucle interne ne s\'exécute jamais. Il reste n − 1 itérations en O(1). C\'est ce qui rend le tri par insertion intéressant sur des données presque triées (et dans TimSort).',
    },
    {
      id: 'li-q-tri-bug-booleen',
      theme: 'tri',
      kind: 'bug',
      q: 'Ce code doit trier des prix par ordre croissant. Quel est le bug ?',
      code: `const prices = [30, 5, 12, 8]
prices.sort((a, b) => a > b)`,
      choices: [
        '`sort` ne trie pas les nombres',
        'Le comparateur renvoie un booléen : jamais de valeur négative, le tri n\'est pas fiable',
        'Il faut `b > a` pour un ordre croissant',
        '`sort` renvoie un nouveau tableau, `prices` n\'est pas modifié',
      ],
      answer: 1,
      why: '`true` et `false` sont convertis en 1 et 0 : le comparateur ne dit jamais « a avant b » (valeur négative), et « 0 » signifie « équivalents ». Avec V8, `[30, 5, 12, 8]` reste inchangé. Il faut `(a, b) => a - b`. Et `sort` trie bien en place.',
    },
    {
      id: 'li-q-tri-borne',
      theme: 'tri',
      kind: 'qcm',
      q: 'Pourquoi le tri par comptage peut-il être en O(n + K) alors que la borne inférieure des tris est Ω(n log n) ?',
      choices: [
        'La borne ne vaut qu\'en moyenne, pas dans le meilleur cas',
        'Le tri par comptage n\'est correct que pour des tableaux presque triés',
        'Parce que K est toujours inférieur à log n',
        'La borne ne concerne que les tris **par comparaisons** ; le comptage utilise les valeurs comme indices',
      ],
      answer: 3,
      why: 'L\'argument de l\'arbre de décision (n! issues, 2 issues par comparaison, donc au moins log₂(n!) ≈ n log n comparaisons) ne s\'applique qu\'aux algorithmes qui ne font que comparer. Le comptage exploite la structure des clés (entiers dans `[0, K)`), ce qui le rend linéaire quand K = O(n).',
    },
    {
      id: 'li-q-tri-pire-rapide',
      theme: 'tri',
      kind: 'qcm',
      q: 'Un tri rapide qui prend toujours le **dernier élément** comme pivot reçoit un tableau déjà trié de n éléments. Que se passe-t-il ?',
      choices: [
        'O(n²) comparaisons et une profondeur de récursion de n',
        'O(n log n) car les partitions sont équilibrées',
        'O(n) car il n\'y a rien à échanger',
        'Le tri est incorrect',
      ],
      answer: 0,
      why: 'Le pivot est toujours le maximum : la partition laisse n − 1 éléments d\'un côté et 0 de l\'autre. Coût total n + (n − 1) + … = O(n²), et la récursion descend n fois, ce qui dépasse la pile d\'appels vers 10⁴ éléments en JS. Le pivot aléatoire rend ce cas improbable.',
    },
    {
      id: 'li-q-tri-stables',
      theme: 'tri',
      kind: 'qcm',
      q: 'Lequel de ces tris n\'est **pas** stable dans sa version classique ?',
      choices: ['Le tri fusion', 'Le tri par insertion', 'Le tri rapide', 'Le tri par comptage (version avec préfixes)'],
      answer: 2,
      why: 'La partition du tri rapide échange des éléments éloignés, ce qui peut inverser deux égaux. Le tri fusion (avec `<=`), le tri par insertion (avec `>` strict) et le tri par comptage (parcours à l\'envers) préservent l\'ordre des égaux. Le tri par tas et le tri par sélection ne sont pas stables non plus.',
    },
  ],

  pieges: [
    {
      id: 'li-p-sort-lexico',
      title: '`sort()` trie des chaînes',
      theme: 'tri',
      question: 'Qu\'affiche ce code ?',
      code: `const scores = [100, 25, 3, 1000, 7]
scores.sort()
console.log(scores)
console.log(Math.max(...scores) === scores[scores.length - 1])`,
      output: `[ 100, 1000, 25, 3, 7 ]
false`,
      explanation: `Sans comparateur, \`sort\` convertit chaque élément en chaîne et compare les chaînes : « 100 » < « 1000 » < « 25 » < « 3 » < « 7 ». Le « maximum » n'est donc pas en dernière position. C'est le même piège qu'en shell avec \`sort\` sans \`-n\`. Pour des nombres, fournissez toujours \`(a, b) => a - b\`.`,
      fix: {
        code: `const scores = [100, 25, 3, 1000, 7]
scores.sort((a, b) => a - b)
console.log(scores)`,
        output: `[ 3, 7, 25, 100, 1000 ]`,
        equiv: {
          python: `scores = [100, 25, 3, 1000, 7]
scores.sort()  # Python compare les nombres numériquement
print(scores)`,
          java: `int[] scores = {100, 25, 3, 1000, 7};
Arrays.sort(scores); // numérique
System.out.println(Arrays.toString(scores));`,
          php: `$scores = [100, 25, 3, 1000, 7];
sort($scores); // numérique pour des entiers ; SORT_STRING donnerait l'ordre de JS
print_r($scores);`,
          bash: `printf '%s\\n' 100 25 3 1000 7 | sort -n   # sans -n : ordre lexicographique, comme JS`,
        },
      },
    },
    {
      id: 'li-p-comparateur-booleen',
      title: 'Comparateur qui renvoie un booléen',
      theme: 'tri',
      question: 'Qu\'affiche ce code (V8) ?',
      code: `const a = [3, 1, 2]
a.sort((x, y) => x > y)
console.log(a)`,
      output: `[ 3, 1, 2 ]`,
      explanation: `Le comparateur doit renvoyer un **nombre** : négatif si \`x\` passe avant \`y\`, positif s'il passe après, 0 s'ils sont équivalents. Un booléen est converti en 1 ou 0 : il ne dit jamais « avant ». Le résultat dépend alors de l'algorithme interne ; avec le TimSort de V8, ce tableau reste inchangé. Les anciennes versions de certains moteurs « marchaient » par hasard, ce qui rend ce bug sournois.`,
      fix: {
        code: `const a = [3, 1, 2]
a.sort((x, y) => x - y)
console.log(a)`,
        output: `[ 1, 2, 3 ]`,
      },
    },
    {
      id: 'li-p-sort-en-place',
      title: '`sort` modifie l\'original',
      theme: 'tri',
      question: 'Qu\'affiche ce code ?',
      code: `const original = [3, 1, 2]
const sorted = original.sort((a, b) => a - b)
console.log(original, sorted === original)`,
      output: `[ 1, 2, 3 ] true`,
      explanation: `\`sort\` trie **en place** et renvoie le même tableau : \`sorted\` et \`original\` sont une seule et même référence. Dans une fonction qui reçoit un tableau, trier directement modifie celui de l'appelant. Utilisez \`toSorted\` (ES2023) ou une copie (\`[...arr].sort(…)\`).`,
      fix: {
        code: `const original = [3, 1, 2]
const sorted = original.toSorted((a, b) => a - b)
console.log(original, sorted)`,
        output: `[ 3, 1, 2 ] [ 1, 2, 3 ]`,
      },
    },
  ],

  flashcards: [
    { id: 'li-f-tri-defaut', theme: 'tri', front: 'Que fait `[10, 9, 1].sort()` ?', back: `Il renvoie \`[1, 10, 9]\` : sans comparateur, les éléments sont comparés **comme des chaînes**. Pour des nombres : \`sort((a, b) => a - b)\`.`, code: `[10, 9, 1].sort(); // → [ 1, 10, 9 ]
[10, 9, 1].sort((a, b) => a - b) // → [ 1, 9, 10 ]` },
    { id: 'li-f-tri-comparateur', theme: 'tri', front: 'Que doit renvoyer un comparateur `(a, b) => …` ?', back: `Un **nombre** : négatif si \`a\` vient avant \`b\`, positif s'il vient après, 0 s'ils sont équivalents. Jamais un booléen. Plusieurs critères : \`c1 || c2 || c3\`.` },
    { id: 'li-f-tri-stable', theme: 'tri', front: 'Qu\'est-ce qu\'un tri stable, et `sort` l\'est-il ?', back: `Un tri stable conserve l'ordre d'origine des éléments équivalents. \`Array.prototype.sort\` est **garanti stable depuis ES2019** (TimSort dans V8).` },
    { id: 'li-f-tri-fusion', theme: 'tri', front: 'Tri fusion : complexité et propriétés ?', back: `O(n log n) dans **tous** les cas, stable, O(n) de mémoire supplémentaire. Idéal pour les listes chaînées et le tri externe. La fusion de deux tableaux triés se fait avec deux pointeurs.` },
    { id: 'li-f-tri-rapide', theme: 'tri', front: 'Tri rapide : pire cas et parade ?', back: `O(n²) quand le pivot est toujours un extrême (tableau trié + pivot fixe). Parade : **pivot aléatoire** ou médiane de trois ; partition à trois voies contre les doublons. En place, non stable, O(n log n) en moyenne.` },
    { id: 'li-f-tri-quickselect', theme: 'tri', front: 'Comment trouver le k-ième plus petit en O(n) en moyenne ?', back: `**Quickselect** : partitionner autour d'un pivot aléatoire ; si le pivot est à l'indice k, c'est fini, sinon continuer d'un seul côté. n + n/2 + … ≤ 2n. Alternative : tas de taille k en O(n log k).` },
    { id: 'li-f-tri-borne', theme: 'tri', front: 'Pourquoi Ω(n log n) pour les tris par comparaisons ?', back: `Il y a n! ordres possibles ; chaque comparaison n'a que 2 issues ; il faut donc au moins log₂(n!) ≈ n log₂ n comparaisons dans le pire cas (arbre de décision). Les tris par comptage ou par base contournent la borne en ne comparant pas.` },
    { id: 'li-f-tri-intervalles', theme: 'tri', front: 'Fusion d\'intervalles : la méthode ?', back: `Trier par début (comparateur numérique), puis parcourir : si \`start <= last[1]\`, faire \`last[1] = Math.max(last[1], end)\`, sinon ajouter un nouvel intervalle. O(n log n).` },
  ],

  lexique: [
    { term: 'Tri stable', theme: 'tri', def: `Tri qui conserve l'ordre relatif d'origine des éléments jugés égaux par le comparateur. \`Array.prototype.sort\` l'est depuis ES2019 ; le tri rapide et le tri par tas ne le sont pas.`, see: ['Comparateur'] },
    { term: 'Comparateur', theme: 'tri', def: `Fonction \`(a, b) => nombre\` passée à \`sort\` : négatif si \`a\` doit précéder \`b\`, positif s'il doit le suivre, 0 s'ils sont équivalents. Elle doit être cohérente (transitive) pour que le tri soit correct.`, see: ['Tri stable'] },
    { term: 'Tri fusion', theme: 'tri', def: `Tri « diviser pour régner » : trier récursivement les deux moitiés puis les fusionner avec deux pointeurs. O(n log n) dans tous les cas, stable, O(n) de mémoire.`, see: ['Inversion'] },
    { term: 'Tri rapide', theme: 'tri', def: `Tri qui partitionne autour d'un pivot puis trie récursivement chaque côté. O(n log n) en moyenne, O(n²) dans le pire cas, en place et non stable. Partitions classiques : Lomuto et Hoare.`, see: ['Quickselect'] },
    { term: 'Quickselect', theme: 'tri', def: `Algorithme de sélection du k-ième plus petit élément : partition comme le tri rapide, puis poursuite d'un seul côté. O(n) en moyenne avec un pivot aléatoire.`, see: ['Tri rapide'] },
    { term: 'Tri par comptage', theme: 'tri', def: `Tri non comparatif pour des clés entières dans \`[0, K)\` : on compte les occurrences, on calcule les préfixes, on place chaque élément. O(n + K), stable ; sert de brique au tri par base (radix).` },
    { term: 'Inversion', theme: 'tri', def: `Paire d'indices \`i < j\` avec \`arr[i] > arr[j]\`. Leur nombre (0 pour un tableau trié, n(n − 1)/2 au maximum) se compte en O(n log n) pendant un tri fusion.`, see: ['Tri fusion'] },
  ],

  entretien: [
    {
      id: 'li-e-tri-choix',
      section: 'complexite',
      q: 'Tri fusion ou tri rapide : lequel choisir, et pourquoi les bibliothèques utilisent-elles des hybrides ?',
      answer: `**Tri fusion** : O(n log n) garanti et stable, mais O(n) de mémoire supplémentaire. Parfait pour les listes chaînées (fusion sans mémoire en plus) et les données trop grandes pour la mémoire (tri externe).

**Tri rapide** : O(n log n) en moyenne, en place, excellente localité de cache, donc souvent le plus rapide en pratique ; mais O(n²) dans le pire cas et non stable.

Les bibliothèques combinent : **TimSort** (V8, Python, Java pour les objets) fusionne des « runs » déjà triés et utilise le tri par insertion sur les petits morceaux, d'où O(n) sur des données presque triées et la stabilité ; **introsort** (C++) part en tri rapide et bascule sur le tri par tas si la récursion devient trop profonde, garantissant O(n log n) ; Java trie les \`int[]\` avec un *dual-pivot quicksort*, la stabilité n'ayant pas de sens pour des primitifs.`,
      attendu: 'Comparer complexités, mémoire et stabilité, et savoir pourquoi les tris réels sont hybrides.',
    },
    {
      id: 'li-e-tri-kieme',
      section: 'techniques',
      q: 'Trouvez le k-ième plus grand élément d\'un tableau. Quelles approches proposeriez-vous ?',
      answer: `Je présenterais trois solutions en montant en finesse :

- **trier** puis lire l'indice \`n - k\` : O(n log n), une ligne, souvent suffisant ;
- un **tas min de taille k** : on parcourt le tableau, on pousse chaque élément et l'on retire le minimum dès que le tas dépasse k éléments ; à la fin, la racine est la réponse. O(n log k) et O(k) mémoire ; idéal pour un **flux** de données ;
- **quickselect** : partition autour d'un pivot aléatoire, puis on ne poursuit que du côté qui contient l'indice cherché. O(n) en moyenne, O(n²) dans le pire cas (improbable), en place.

Je préciserais les cas limites : doublons (partition à trois voies), k = 1 ou k = n, et le fait que quickselect modifie le tableau (copier si nécessaire).`,
      attendu: 'Plusieurs approches avec leurs compromis, en particulier tas contre quickselect.',
    },
    {
      id: 'li-e-tri-gros-fichier',
      section: 'conception',
      q: 'Comment trier un fichier de 100 Go de nombres avec 4 Go de mémoire ?',
      answer: `C'est un **tri externe** par fusion :

- **phase 1** : lire le fichier par blocs d'environ 3 Go, trier chaque bloc en mémoire (n'importe quel tri efficace) et l'écrire sur disque : on obtient environ 34 fichiers triés ;
- **phase 2** : **fusion à k voies**. On ouvre tous les fichiers triés avec un petit tampon de lecture chacun, on place le premier élément de chaque fichier dans un **tas min**, puis on extrait le minimum, on l'écrit dans le fichier de sortie (avec un tampon d'écriture) et on le remplace par l'élément suivant du même fichier. O(N log k) comparaisons.

Si le nombre de fichiers dépasse ce que l'on peut ouvrir ou tamponner, on fusionne en plusieurs passes. Les coûts dominants sont les entrées-sorties : on lit et écrit les données environ deux fois. Si les valeurs sont dans un petit intervalle (par exemple des âges), un simple **comptage** en une passe suffit.`,
      attendu: 'Découpage en blocs triés puis fusion k-voies avec un tas, et conscience du coût des entrées-sorties.',
    },
  ],
}

// =============================================================================
// RÉCURSION ET BACKTRACKING
// =============================================================================
const recursion: ThemePack = {
  cours: [
    {
      id: 'recursion',
      title: 'Récursion et backtracking',
      summary: 'Penser un problème en termes d\'un cas de base et d\'un sous-problème plus petit, connaître le coût réel (arbre d\'appels, pile limitée), puis explorer méthodiquement toutes les solutions avec le backtracking.',
      blocks: [
        { p: `Une fonction **récursive** s'appelle elle-même sur une version plus petite du problème. Deux ingrédients obligatoires : un **cas de base** qui s'arrête sans appel récursif, et une **progression** vers ce cas de base à chaque appel. La récursion est naturelle dès que la donnée est elle-même récursive (arbres, structures imbriquées) ou que la solution se construit par choix successifs (sous-ensembles, permutations, placements).` },
        { p: `En entretien, trois compétences sont attendues : écrire la récursion correctement, **évaluer son coût** (taille de l'arbre d'appels, profondeur de pile), et maîtriser le **backtracking**, qui explore toutes les combinaisons en annulant chaque choix après l'avoir essayé.` },

        { h: 'Cas de base et arbre d\'appels', id: 'recursion-bases' },
        { p: `Pour écrire une récursion, on suppose (« acte de foi ») que l'appel sur le sous-problème renvoie la bonne réponse, et l'on se demande seulement comment en déduire la réponse du problème courant. Chaque appel en cours occupe un **cadre** (*frame*) sur la **pile d'appels** : ses paramètres, ses variables locales et l'endroit où reprendre. Le dernier appel commencé est le premier terminé : c'est une pile au sens LIFO.` },
        {
          title: 'Ordre des appels et des retours',
          code: `function countdown(n, depth = 0) {
  const indent = '  '.repeat(depth)
  if (n === 0) {
    console.log(indent + 'cas de base')
    return 0
  }
  console.log(indent + 'appel ' + n) // avant l'appel récursif : à la descente
  const sum = n + countdown(n - 1, depth + 1)
  console.log(indent + 'retour ' + n + ' → ' + sum) // après : à la remontée
  return sum
}
countdown(3)`,
          output: `appel 3
  appel 2
    appel 1
      cas de base
    retour 1 → 1
  retour 2 → 3
retour 3 → 6`,
        },
        { p: `Le coût d'une récursion se lit sur son **arbre d'appels** : temps ≈ nombre de nœuds × travail par nœud ; mémoire (pile) ≈ **profondeur** de l'arbre. Une fonction qui s'appelle **deux fois** sur \`n - 1\` produit un arbre binaire de profondeur n, donc environ 2ⁿ nœuds : c'est le cas de Fibonacci naïf.` },
        {
          title: 'Fibonacci naïf : l\'arbre explose',
          code: `let calls = 0
function fib(n) {
  calls++
  if (n < 2) return n // cas de base
  return fib(n - 1) + fib(n - 2)
}
console.log(fib(20), calls)
calls = 0
console.log(fib(25), calls)`,
          output: `6765 21891
75025 242785`,
        },
        { table: [
          ['Forme de la récursion', 'Nombre d\'appels', 'Profondeur'],
          ['un appel sur n − 1 (factorielle, somme)', 'O(n)', 'O(n)'],
          ['un appel sur n / 2 (puissance rapide, dichotomie)', 'O(log n)', 'O(log n)'],
          ['deux appels sur n / 2 + travail O(n) (tri fusion)', 'O(n) appels, O(n log n) au total', 'O(log n)'],
          ['deux appels sur n − 1 (Fibonacci naïf)', 'O(2ⁿ)', 'O(n)'],
          ['n choix puis n − 1, … (permutations)', 'O(n!)', 'O(n)'],
        ] },
        { mnemo: `Récursion = **cas de base** + **sous-problème plus petit** + acte de foi. Temps ≈ nœuds de l'arbre d'appels ; mémoire ≈ sa profondeur.`, piege: `Un cas de base manquant ou inatteignable (\`n === 0\` avec un \`n\` négatif ou décimal) donne une récursion infinie, qui se termine par un dépassement de pile.` },

        { h: 'Limite de pile et version itérative', id: 'recursion-pile' },
        { p: `La pile d'appels est **petite** : avec V8 (Chrome, Node), environ **10⁴ cadres** pour une fonction simple (le nombre exact dépend de la taille des cadres et de l'environnement). Au-delà : \`RangeError: Maximum call stack size exceeded\`. JavaScript ne fait **pas d'optimisation des appels terminaux** en pratique (seul Safari l'implémente), donc écrire la récursion « en position terminale » ne protège pas. Une liste chaînée de 10⁵ nœuds, un arbre dégénéré ou un DFS sur une grande grille suffisent à faire planter une version récursive.` },
        {
          title: 'Dépassement de pile',
          code: `function sumTo(n) {
  return n === 0 ? 0 : n + sumTo(n - 1)
}
console.log(sumTo(1000))
try {
  sumTo(100000)
} catch (e) {
  console.log(e instanceof RangeError, e.message)
}`,
          output: `500500
true Maximum call stack size exceeded`,
          equiv: {
            python: `import sys

def sum_to(n):
    return 0 if n == 0 else n + sum_to(n - 1)

print(sum_to(500))
# Python limite la profondeur à 1000 par défaut : RecursionError au-delà
# sys.setrecursionlimit(10**6) repousse la limite, mais la pile C peut alors déborder`,
            java: `static long sumTo(int n) {
    return n == 0 ? 0 : n + sumTo(n - 1);
}
// sumTo(100_000) lève StackOverflowError avec la pile par défaut (~512 Ko à 1 Mo) ;
// on peut l'agrandir avec -Xss ou en lançant le calcul dans un Thread créé avec une taille de pile`,
            rust: `fn sum_to(n: u64) -> u64 {
    if n == 0 { 0 } else { n + sum_to(n - 1) }
}
// thread 'main' has overflowed its stack : le processus s'arrête (pas d'exception à attraper)`,
          },
        },
        { p: `La parade est de **remplacer la pile d'appels par une pile explicite** (un tableau sur le tas, limité seulement par la mémoire). Pour un parcours en profondeur, on empile les nœuds à visiter ; si l'ordre de visite compte, on empile les enfants **à l'envers**. Quand la récursion doit faire du travail **après** les appels (post-ordre), on empile des paires \`[nœud, étape]\`.` },
        {
          title: 'DFS itératif avec une pile explicite',
          code: `// arbre : chaque nœud a une valeur et des enfants
function sumTree(root) {
  let total = 0
  const stack = [root]
  while (stack.length) {
    const node = stack.pop()
    total += node.value
    for (const child of node.children) stack.push(child)
  }
  return total
}

// une chaîne de 100 000 nœuds : la version récursive dépasserait la pile
let root = { value: 1, children: [] }
for (let i = 2; i <= 100000; i++) root = { value: i, children: [root] }
sumTree(root) // → 5000050000`,
          equiv: {
            python: `def sum_tree(root):
    total = 0
    stack = [root]
    while stack:
        node = stack.pop()
        total += node['value']
        stack.extend(node['children'])
    return total`,
            java: `static long sumTree(Node root) {
    long total = 0;
    Deque<Node> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        Node node = stack.pop();
        total += node.value;
        for (Node child : node.children) stack.push(child);
    }
    return total;
}`,
          },
        },
        { mnemo: `Profondeur > quelques milliers ⇒ pile explicite. JS n'a pas d'optimisation des appels terminaux : « récursion terminale » ne sauve rien.`, piege: `Le message exact (\`RangeError: Maximum call stack size exceeded\`) et la limite (≈ 10⁴ en V8, environ 1000 par défaut en Python) varient : ne jamais compter dessus, et ne pas attraper l'erreur pour « continuer ».` },

        { h: 'Mémoïsation', id: 'recursion-memo' },
        { p: `Quand l'arbre d'appels recalcule **les mêmes sous-problèmes** (Fibonacci : \`fib(n - 2)\` est calculé par \`fib(n)\` et par \`fib(n - 1)\`), on mémorise chaque résultat la première fois. Le nombre d'appels utiles devient le nombre de **sous-problèmes distincts** : O(n) pour Fibonacci. C'est la porte d'entrée de la **programmation dynamique** (voir ce thème) : la mémoïsation est la version descendante (*top-down*), la tabulation la version ascendante.` },
        {
          title: 'Fibonacci mémoïsé',
          code: `let calls = 0
function fib(n, memo = new Map()) {
  calls++
  if (n < 2) return n
  if (memo.has(n)) return memo.get(n)
  const r = fib(n - 1, memo) + fib(n - 2, memo)
  memo.set(n, r)
  return r
}
console.log(fib(25), calls)
calls = 0
console.log(fib(90), calls)`,
          output: `75025 49
2880067194370816000 179`,
          equiv: {
            python: `from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
            java: `static long fib(int n, Map<Integer, Long> memo) {
    if (n < 2) return n;
    Long cached = memo.get(n);
    if (cached != null) return cached;
    long r = fib(n - 1, memo) + fib(n - 2, memo);
    memo.put(n, r);
    return r;
}
// attention : memo.computeIfAbsent avec un appel récursif lève ConcurrentModificationException`,
          },
        },
        { p: `\`fib(90)\` dépasse 2⁵³ : le résultat affiché est arrondi (la vraie valeur est 2880067194370816120). Pour des entiers exacts aussi grands, utilisez \`BigInt\`. La mémoïsation ne réduit pas la **profondeur** : \`fib(20000)\` mémoïsé dépasse encore la pile, d'où l'intérêt de la tabulation itérative.` },
        { mnemo: `Mêmes sous-problèmes recalculés ⇒ mémo. Coût = nombre d'états distincts × travail par état.`, piege: `Une clé de mémo qui oublie un paramètre (mémoriser par \`i\` alors que le résultat dépend aussi de \`reste\`) renvoie des résultats faux en silence.` },

        { h: 'Diviser pour régner', id: 'recursion-diviser' },
        { p: `**Diviser** le problème en sous-problèmes **indépendants** plus petits, les **résoudre** récursivement, **combiner** les résultats. Exemples : tri fusion, tri rapide, recherche dichotomique, puissance rapide, plus proche paire de points, multiplication de Karatsuba. Le coût se calcule avec la récurrence \`T(n) = a·T(n / b) + f(n)\` (théorème maître) : deux moitiés plus un travail linéaire donnent O(n log n) ; une moitié plus un travail constant donne O(log n).` },
        {
          title: 'Puissance rapide : O(log n)',
          code: `function power(x, n) {
  if (n === 0) return 1
  const half = power(x, Math.floor(n / 2)) // UN seul appel, réutilisé
  return n % 2 === 0 ? half * half : half * half * x
}

power(2, 10) // → 1024
power(3, 13) // → 1594323
power(2, 0) // → 1`,
          equiv: {
            python: `def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x
# la fonction native pow(x, n, mod) fait l'exponentiation modulaire rapide`,
            java: `static long power(long x, int n) {
    if (n == 0) return 1;
    long half = power(x, n / 2);
    return n % 2 == 0 ? half * half : half * half * x;
}`,
          },
        },
        { p: `Erreur classique : écrire \`power(x, n / 2) * power(x, n / 2)\`. Les deux appels identiques font T(n) = 2T(n / 2) + O(1), soit O(n) : on a perdu tout le gain. Les sous-problèmes doivent être **indépendants** pour que diviser rapporte ; s'ils se recoupent, c'est un problème de mémoïsation.` },

        { h: 'Backtracking : le modèle', id: 'recursion-backtracking' },
        { p: `Le **backtracking** (retour sur trace) construit une solution **choix par choix**. À chaque étape : on **choisit** une option, on **explore** récursivement la suite, puis on **annule** le choix pour essayer la suivante. On explore ainsi l'arbre de toutes les solutions partielles. **Signaux** : « toutes les combinaisons / permutations / partitions », « tous les chemins », « placer n pièces », « remplir une grille », avec de petites entrées (n ≤ 10 à 20), car le résultat est souvent exponentiel.` },
        {
          title: 'Sous-ensembles : choisir, explorer, annuler',
          code: `function subsets(nums) {
  const res = []
  const path = []
  function backtrack(start) {
    res.push([...path]) // COPIE : path va continuer à changer
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choisir
      backtrack(i + 1) // explorer (les éléments suivants seulement : pas de doublon d'ordre)
      path.pop() // annuler
    }
  }
  backtrack(0)
  return res
}

subsets([1, 2, 3]) // → [ [], [ 1 ], [ 1, 2 ], [ 1, 2, 3 ], [ 1, 3 ], [ 2 ], [ 2, 3 ], [ 3 ] ]`,
          equiv: {
            python: `def subsets(nums):
    res = []
    path = []

    def backtrack(start):
        res.append(path[:])  # copie
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()

    backtrack(0)
    return res`,
            java: `static List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), res);
    return res;
}
static void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
    res.add(new ArrayList<>(path)); // copie
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(nums, i + 1, path, res);
        path.remove(path.size() - 1);
    }
}`,
            rust: `fn subsets(nums: &[i32]) -> Vec<Vec<i32>> {
    fn backtrack(nums: &[i32], start: usize, path: &mut Vec<i32>, res: &mut Vec<Vec<i32>>) {
        res.push(path.clone()); // copie
        for i in start..nums.len() {
            path.push(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.pop();
        }
    }
    let mut res = Vec::new();
    backtrack(nums, 0, &mut Vec::new(), &mut res);
    res
}`,
          },
        },
        { p: `**Le point délicat est la copie.** \`path\` est un seul tableau modifié tout au long de l'exploration. Pousser \`path\` lui-même dans \`res\` y place n fois **la même référence**, qui sera vide à la fin. Il faut copier (\`[...path]\`) **au moment où la solution est complète**, et seulement là (copier à chaque appel coûte inutilement).` },
        { p: `Les trois familles se distinguent par la boucle :` },
        { list: [
          '**sous-ensembles** : on enregistre à chaque nœud ; boucle depuis `start`, appel avec `i + 1` ; 2ⁿ solutions ;',
          '**combinaisons de taille k** : comme les sous-ensembles, mais on n\'enregistre que quand `path.length === k` (et l\'on peut élaguer si les éléments restants ne suffisent plus) ; C(n, k) solutions ;',
          '**permutations** : boucle sur **tous** les indices, avec un tableau `used` pour ne pas reprendre un élément ; n! solutions.',
        ] },
        {
          title: 'Permutations avec un tableau `used`',
          code: `function permutations(nums) {
  const res = []
  const path = []
  const used = new Array(nums.length).fill(false)
  function backtrack() {
    if (path.length === nums.length) {
      res.push([...path])
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      used[i] = true
      path.push(nums[i])
      backtrack()
      path.pop()
      used[i] = false // annuler AUSSI le marquage
    }
  }
  backtrack()
  return res
}

permutations([1, 2, 3]).map((p) => p.join('')).join(' ') // → '123 132 213 231 312 321'`,
          equiv: {
            python: `def permutations(nums):
    res, path = [], []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return res
# itertools.permutations(nums) fait la même chose (dans le même ordre)`,
            java: `static void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {
    if (path.size() == nums.length) { res.add(new ArrayList<>(path)); return; }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.add(nums[i]);
        backtrack(nums, used, path, res);
        path.remove(path.size() - 1);
        used[i] = false;
    }
}`,
          },
        },
        { p: `**Avec des doublons** (\`[1, 1, 2]\`) : on **trie** d'abord, puis on saute un élément égal au précédent au même niveau de l'arbre : \`if (i > start && nums[i] === nums[i - 1]) continue\` pour les sous-ensembles, \`if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue\` pour les permutations.` },
        { mnemo: `Backtracking : **choisir → explorer → annuler**. Copier \`[...path]\` quand la solution est complète. Sous-ensembles et combinaisons : \`start\` ; permutations : \`used\`.`, piege: `\`res.push(path)\` sans copie remplit \`res\` de références au même tableau, vide à la fin. Oublier d'annuler (\`pop\`, \`used[i] = false\`) fausse toutes les branches suivantes.` },

        { h: 'Élagage et problèmes de placement', id: 'recursion-elagage' },
        { p: `L'**élagage** (*pruning*) coupe une branche dès qu'on sait qu'elle ne mènera à aucune solution. C'est ce qui rend le backtracking praticable. Dans **combination sum** (combinaisons de candidats, réutilisables, de somme \`target\`), on trie les candidats : dès qu'un candidat dépasse le reste, **tous les suivants aussi**, on peut sortir de la boucle (\`break\`, pas \`continue\`).` },
        {
          title: 'Combination sum avec élagage',
          code: `function combinationSum(candidates, target) {
  const sorted = candidates.toSorted((a, b) => a - b)
  const res = []
  const path = []
  function backtrack(start, remaining) {
    if (remaining === 0) {
      res.push([...path])
      return
    }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break // élagage : les suivants sont encore plus grands
      path.push(sorted[i])
      backtrack(i, remaining - sorted[i]) // i et non i + 1 : réutilisation permise
      path.pop()
    }
  }
  backtrack(0, target)
  return res
}

combinationSum([2, 3, 6, 7], 7) // → [ [ 2, 2, 3 ], [ 7 ] ]
combinationSum([2, 3, 5], 8) // → [ [ 2, 2, 2, 2 ], [ 2, 3, 3 ], [ 3, 5 ] ]`,
          equiv: {
            python: `def combination_sum(candidates, target):
    nums = sorted(candidates)
    res, path = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            res.append(path[:])
            return
        for i in range(start, len(nums)):
            if nums[i] > remaining:
                break  # élagage
            path.append(nums[i])
            backtrack(i, remaining - nums[i])
            path.pop()

    backtrack(0, target)
    return res`,
            java: `static void backtrack(int[] sorted, int start, int remaining, List<Integer> path, List<List<Integer>> res) {
    if (remaining == 0) { res.add(new ArrayList<>(path)); return; }
    for (int i = start; i < sorted.length; i++) {
        if (sorted[i] > remaining) break; // élagage
        path.add(sorted[i]);
        backtrack(sorted, i, remaining - sorted[i], path, res);
        path.remove(path.size() - 1);
    }
}`,
          },
        },
        { p: `Pour les **problèmes de placement** (N-reines, sudoku), on vérifie les contraintes **en O(1)** grâce à des ensembles ou tableaux de marquage, mis à jour au choix et restaurés à l'annulation. Pour les N-reines, on place une reine par ligne ; une case \`(r, c)\` est attaquée si sa colonne \`c\`, sa diagonale \`r - c\` ou son anti-diagonale \`r + c\` est déjà occupée.` },
        {
          title: 'N-reines : compter les solutions',
          code: `function totalNQueens(n) {
  const cols = new Array(n).fill(false)
  const diag = new Array(2 * n - 1).fill(false) // r - c + n - 1
  const anti = new Array(2 * n - 1).fill(false) // r + c
  let count = 0
  function place(r) {
    if (r === n) {
      count++
      return
    }
    for (let c = 0; c < n; c++) {
      if (cols[c] || diag[r - c + n - 1] || anti[r + c]) continue // élagage en O(1)
      cols[c] = diag[r - c + n - 1] = anti[r + c] = true
      place(r + 1)
      cols[c] = diag[r - c + n - 1] = anti[r + c] = false
    }
  }
  place(0)
  return count
}

totalNQueens(4) // → 2
totalNQueens(8) // → 92`,
          equiv: {
            python: `def total_n_queens(n):
    cols = [False] * n
    diag = [False] * (2 * n - 1)  # r - c + n - 1
    anti = [False] * (2 * n - 1)  # r + c
    count = 0

    def place(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if cols[c] or diag[r - c + n - 1] or anti[r + c]:
                continue
            cols[c] = diag[r - c + n - 1] = anti[r + c] = True
            place(r + 1)
            cols[c] = diag[r - c + n - 1] = anti[r + c] = False

    place(0)
    return count`,
            java: `static int count;

static int totalNQueens(int n) {
    count = 0;
    place(0, n, new boolean[n], new boolean[2 * n - 1], new boolean[2 * n - 1]);
    return count;
}
static void place(int r, int n, boolean[] cols, boolean[] diag, boolean[] anti) {
    if (r == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        if (cols[c] || diag[r - c + n - 1] || anti[r + c]) continue;
        cols[c] = diag[r - c + n - 1] = anti[r + c] = true;
        place(r + 1, n, cols, diag, anti);
        cols[c] = diag[r - c + n - 1] = anti[r + c] = false;
    }
}`,
          },
        },
        { p: `**Mot dans une grille** : DFS depuis chaque case, en marquant temporairement la case visitée (pour ne pas la réutiliser dans le même chemin) et en la restaurant au retour. On s'arrête dès que le caractère ne correspond pas : c'est l'élagage.` },
        {
          title: 'Mot dans une grille',
          code: `function exist(board, word) {
  const R = board.length
  const C = board[0].length
  function dfs(r, c, k) {
    if (k === word.length) return true
    if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] !== word[k]) return false
    const saved = board[r][c]
    board[r][c] = '#' // marquer : la case n'est plus disponible dans ce chemin
    const found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1)
    board[r][c] = saved // restaurer
    return found
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return true
  return false
}

const board = [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']]
exist(board, 'ABCCED') // → true
exist(board, 'SEE') // → true
exist(board, 'ABCB') // → false`,
          equiv: {
            python: `def exist(board, word):
    R, C = len(board), len(board[0])

    def dfs(r, c, k):
        if k == len(word):
            return True
        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != word[k]:
            return False
        saved = board[r][c]
        board[r][c] = '#'
        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1)
                 or dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))
        board[r][c] = saved
        return found

    return any(dfs(r, c, 0) for r in range(R) for c in range(C))`,
            java: `static boolean exist(char[][] board, String word) {
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            if (dfs(board, word, r, c, 0)) return true;
    return false;
}
static boolean dfs(char[][] board, String word, int r, int c, int k) {
    if (k == word.length()) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(k)) return false;
    char saved = board[r][c];
    board[r][c] = '#';
    boolean found = dfs(board, word, r + 1, c, k + 1) || dfs(board, word, r - 1, c, k + 1)
        || dfs(board, word, r, c + 1, k + 1) || dfs(board, word, r, c - 1, k + 1);
    board[r][c] = saved;
    return found;
}`,
          },
        },
        { p: `Le **sudoku** suit le même schéma : trouver la prochaine case vide, essayer les chiffres 1 à 9 autorisés (ensembles par ligne, colonne et bloc \`Math.floor(r / 3) * 3 + Math.floor(c / 3)\`), récursion, annulation si échec. Heuristique utile : commencer par la case qui a le **moins** de candidats.` },
        { table: [
          ['Problème', 'Nombre de solutions', 'Coût typique'],
          ['sous-ensembles de n éléments', '2ⁿ', 'O(n · 2ⁿ) (copie de chaque solution)'],
          ['permutations', 'n!', 'O(n · n!)'],
          ['combinaisons de taille k', 'C(n, k)', 'O(k · C(n, k))'],
          ['N-reines', '92 pour n = 8', 'bien moins que nⁿ grâce à l\'élagage'],
        ] },
        { mnemo: `Élaguer tôt : trier pour pouvoir faire \`break\`, vérifier les contraintes en O(1) avec des ensembles, marquer puis **restaurer**.`, piege: `\`continue\` au lieu de \`break\` sur une liste triée explore inutilement tous les candidats trop grands. Oublier de restaurer une case marquée rend la grille fausse pour les départs suivants.` },
      ],
      mnemo: `Récursion : cas de base + plus petit + acte de foi ; coût = arbre d'appels, pile ≈ 10⁴ cadres en V8. Backtracking : choisir → explorer → annuler, copier \`[...path]\` à la feuille, élaguer tôt.`,
      piege: `\`RangeError: Maximum call stack size exceeded\` au-delà d'environ 10⁴ appels imbriqués (pas d'optimisation des appels terminaux en V8) ; \`res.push(path)\` sans copie ; appel récursif dupliqué (\`f(n / 2) * f(n / 2)\`) qui ruine la complexité.`,
    },
  ],

  katas: [
    {
      id: 'li-sous-ensembles',
      title: 'Tous les sous-ensembles',
      difficulty: 'facile',
      theme: 'recursion',
      pattern: 'backtracking',
      statement: `\`nums\` est un tableau d'entiers **distincts**. Écrivez \`subsets(nums)\` qui renvoie **tous** les sous-ensembles possibles (l'ensemble des parties), y compris l'ensemble vide et \`nums\` lui-même.

- l'ordre des sous-ensembles dans le résultat est libre, et l'ordre des éléments dans chaque sous-ensemble aussi ;
- aucun sous-ensemble ne doit apparaître deux fois.

Exemple : \`subsets([1, 2, 3])\` donne (dans un ordre quelconque) \`[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]\`.

Contraintes : \`0 <= nums.length <= 12\`.`,
      starter: `function subsets(nums) {
  const res = []
  const path = []
  function backtrack(start) {
    res.push(path) // TODO : est-ce vraiment ce qu'on veut stocker ?
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1)
      path.pop()
    }
  }
  backtrack(0)
  return res
}`,
      solution: `function subsets(nums) {
  const res = []
  const path = []
  function backtrack(start) {
    res.push([...path]) // copie de la solution courante
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choisir
      backtrack(i + 1) // explorer
      path.pop() // annuler
    }
  }
  backtrack(0)
  return res
}`,
      solutionEquiv: {
        python: `def subsets(nums):
    res, path = [], []

    def backtrack(start):
        res.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()

    backtrack(0)
    return res`,
        java: `static List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), res);
    return res;
}
static void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
    res.add(new ArrayList<>(path));
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(nums, i + 1, path, res);
        path.remove(path.size() - 1);
    }
}`,
        rust: `fn subsets(nums: &[i32]) -> Vec<Vec<i32>> {
    fn backtrack(nums: &[i32], start: usize, path: &mut Vec<i32>, res: &mut Vec<Vec<i32>>) {
        res.push(path.clone());
        for i in start..nums.len() {
            path.push(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.pop();
        }
    }
    let mut res = Vec::new();
    backtrack(nums, 0, &mut Vec::new(), &mut res);
    res
}`,
        php: `function subsets(array $nums): array {
    $res = [];
    $path = [];
    $backtrack = function (int $start) use (&$backtrack, &$res, &$path, $nums) {
        $res[] = $path; // les tableaux PHP sont copiés à l'affectation : pas besoin de copie explicite
        for ($i = $start; $i < count($nums); $i++) {
            $path[] = $nums[$i];
            $backtrack($i + 1);
            array_pop($path);
        }
    };
    $backtrack(0);
    return $res;
}`,
      },
      tests: [
        { name: 'exemple', code: `const key = (xss) => xss.map((xs) => [...xs].sort((a, b) => a - b).join(',')).sort()
const res = subsets([1, 2, 3])
assertEqual(res.length, 8)
assertEqual(key(res), key([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]))` },
        { name: 'tableau vide', code: `assertEqual(subsets([]), [[]])` },
        { name: 'un élément', code: `const res = subsets([5]).map((s) => s.join(',')).sort()
assertEqual(res, ['', '5'])` },
        { name: 'pas de doublon', code: `const res = subsets([4, 7, 1, 9])
const keys = res.map((xs) => [...xs].sort((a, b) => a - b).join(','))
assertEqual(res.length, 16)
assertEqual(new Set(keys).size, 16)` },
        { name: 'taille maximale', code: `const nums = Array.from({ length: 12 }, (_, i) => i * 3 - 10)
const t0 = performance.now()
const res = subsets(nums)
const elapsed = performance.now() - t0
assertEqual(res.length, 4096)
assertEqual(res.reduce((s, xs) => s + xs.length, 0), 12 * 2048)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Chaque élément est soit dans le sous-ensemble, soit dehors : il y a 2ⁿ sous-ensembles.',
        'Backtracking : à chaque appel, enregistrez le chemin courant, puis essayez d\'ajouter chacun des éléments **suivants** (indice `start`), récursion, puis retirez-le.',
        'Si tous vos sous-ensembles sont vides à la fin, vous avez stocké la référence de `path` : stockez une copie `[...path]`.',
      ],
      discussion: `**Complexité** : 2ⁿ sous-ensembles, chacun copié en O(n) : O(n · 2ⁿ) en temps et en mémoire pour le résultat ; O(n) de pile.

**Alternatives** :

- **itérative** : partir de \`[[]]\` et, pour chaque élément, ajouter une copie de chaque sous-ensemble existant augmentée de cet élément ;
- **masques de bits** : pour \`mask\` de 0 à 2ⁿ − 1, le bit \`i\` indique si \`nums[i]\` est pris (\`mask & (1 << i)\`). Élégant, limité à n ≤ 30 ;
- **inclure / exclure** : \`backtrack(i)\` qui appelle d'abord sans \`nums[i]\`, puis avec. Même arbre binaire, enregistrement aux feuilles.

**Suivi** : avec des doublons dans \`nums\`, trier puis sauter \`nums[i] === nums[i - 1]\` quand \`i > start\`.`,
    },
    {
      id: 'li-puissance',
      title: 'Puissance rapide',
      difficulty: 'facile',
      theme: 'recursion',
      pattern: 'diviser pour régner',
      statement: `Écrivez \`myPow(x, n)\` qui calcule xⁿ pour un nombre \`x\` et un **entier** \`n\` (positif, nul ou négatif), **sans** utiliser \`Math.pow\` ni l'opérateur \`**\`.

- \`myPow(2, 10)\` donne \`1024\` ;
- \`myPow(2, -2)\` donne \`0.25\` ;
- \`myPow(5, 0)\` donne \`1\`.

Contraintes : \`|n| <= 2^31\`. Une boucle de |n| multiplications est bien trop lente : visez **O(log |n|)** multiplications.`,
      starter: `function myPow(x, n) {
  // TODO : x^n = (x^(n/2))^2
  return 1
}`,
      solution: `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n)
  if (n === 0) return 1
  const half = myPow(x, Math.floor(n / 2)) // un seul appel récursif
  return n % 2 === 0 ? half * half : half * half * x
}`,
      solutionEquiv: {
        python: `def my_pow(x, n):
    if n < 0:
        return 1 / my_pow(x, -n)
    if n == 0:
        return 1
    half = my_pow(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x`,
        java: `static double myPow(double x, long n) { // long : -(-2^31) ne tient pas dans un int
    if (n < 0) return 1 / myPow(x, -n);
    if (n == 0) return 1;
    double half = myPow(x, n / 2);
    return n % 2 == 0 ? half * half : half * half * x;
}`,
        rust: `fn my_pow(x: f64, n: i64) -> f64 {
    if n < 0 { return 1.0 / my_pow(x, -n); }
    if n == 0 { return 1.0; }
    let half = my_pow(x, n / 2);
    if n % 2 == 0 { half * half } else { half * half * x }
}`,
        php: `function myPow(float $x, int $n): float {
    if ($n < 0) return 1 / myPow($x, -$n);
    if ($n === 0) return 1.0;
    $half = myPow($x, intdiv($n, 2));
    return $n % 2 === 0 ? $half * $half : $half * $half * $x;
}`,
      },
      tests: [
        { name: 'exposants positifs', code: `assertEqual(myPow(2, 10), 1024)
assertEqual(myPow(3, 5), 243)` },
        { name: 'exposant nul', code: `assertEqual(myPow(5, 0), 1)
assertEqual(myPow(0, 0), 1)` },
        { name: 'exposants négatifs', code: `assertEqual(myPow(2, -2), 0.25)
assertEqual(myPow(10, -1), 0.1)` },
        { name: 'base négative', code: `assertEqual(myPow(-2, 3), -8)
assertEqual(myPow(-2, 4), 16)` },
        { name: 'sans Math.pow', code: `const original = Math.pow
Math.pow = () => { throw new Error('Math.pow est interdit') }
try {
  assertEqual(myPow(7, 3), 343)
} finally {
  Math.pow = original
}` },
        { name: 'très grands exposants', code: `const t0 = performance.now()
assertEqual(myPow(-1, 2147483647), -1)
assertEqual(myPow(1, -2147483648), 1)
const r = myPow(1.0000001, 2000000000)
const expected = Math.exp(2000000000 * Math.log(1.0000001))
const elapsed = performance.now() - t0
assert(Math.abs(r / expected - 1) < 1e-5, 'résultat imprécis : ' + r)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'x¹⁰ = (x⁵)², et x⁵ = (x²)² × x. Chaque étape divise l\'exposant par deux.',
        'Calculez `half = myPow(x, Math.floor(n / 2))` **une seule fois**, puis renvoyez `half * half`, multiplié par `x` si `n` est impair.',
        'Pour un exposant négatif : x⁻ⁿ = 1 / xⁿ.',
      ],
      discussion: `**Complexité** : O(log |n|) multiplications, O(log |n|) de pile (32 niveaux au plus ici).

**Version itérative** (exponentiation binaire) : parcourir les bits de n ; à chaque bit, élever \`x\` au carré, et multiplier le résultat par \`x\` courant si le bit vaut 1. O(1) mémoire.

**Pièges** :

- appeler deux fois \`myPow(x, n / 2)\` : T(n) = 2T(n / 2) + O(1) = O(n), on perd tout ;
- en Java ou C, \`-n\` déborde pour \`n = -2³¹\` : passer par un \`long\` ;
- \`n >> 1\` en JS fonctionne pour |n| < 2³¹ mais casse au-delà ; \`Math.floor(n / 2)\` est sûr.

**Applications** : exponentiation modulaire (cryptographie, \`pow(a, b, mod)\` en Python) ; puissance de matrice pour calculer Fibonacci en O(log n).`,
    },
    {
      id: 'li-aplatir',
      title: 'Aplatir un tableau très imbriqué',
      difficulty: 'moyen',
      theme: 'recursion',
      pattern: 'pile explicite',
      statement: `Écrivez \`flatten(nested)\` qui renvoie un tableau contenant toutes les valeurs **non tableaux** de \`nested\`, dans l'ordre où on les rencontre en lisant de gauche à droite (parcours en profondeur), quelle que soit la profondeur d'imbrication.

Exemples :

- \`flatten([1, [2, [3, [4]], 5]])\` donne \`[1, 2, 3, 4, 5]\` ;
- \`flatten([[], [[]], 6])\` donne \`[6]\`.

Contraintes : jusqu'à 10⁵ valeurs, et une profondeur d'imbrication pouvant atteindre **10⁵**. Une version récursive (ou \`flat(Infinity)\`) dépasse alors la pile d'appels : il faut une solution **itérative**.`,
      starter: `function flatten(nested) {
  const out = []
  for (const x of nested) {
    if (Array.isArray(x)) out.push(...flatten(x)) // récursif : que se passe-t-il à 10⁵ niveaux ?
    else out.push(x)
  }
  return out
}`,
      solution: `function flatten(nested) {
  const out = []
  // pile explicite : on dépile par la fin, donc on empile les éléments à l'envers
  const stack = []
  for (let i = nested.length - 1; i >= 0; i--) stack.push(nested[i])
  while (stack.length) {
    const x = stack.pop()
    if (Array.isArray(x)) {
      for (let i = x.length - 1; i >= 0; i--) stack.push(x[i])
    } else {
      out.push(x)
    }
  }
  return out
}`,
      solutionEquiv: {
        python: `def flatten(nested):
    out = []
    stack = list(reversed(nested))
    while stack:
        x = stack.pop()
        if isinstance(x, list):
            stack.extend(reversed(x))
        else:
            out.append(x)
    return out`,
        java: `static List<Object> flatten(List<?> nested) {
    List<Object> out = new ArrayList<>();
    Deque<Object> stack = new ArrayDeque<>();
    for (int i = nested.size() - 1; i >= 0; i--) stack.push(nested.get(i));
    while (!stack.isEmpty()) {
        Object x = stack.pop();
        if (x instanceof List<?> list) {
            for (int i = list.size() - 1; i >= 0; i--) stack.push(list.get(i));
        } else {
            out.add(x);
        }
    }
    return out;
}`,
        php: `function flatten(array $nested): array {
    $out = [];
    $stack = array_reverse($nested);
    while ($stack) {
        $x = array_pop($stack);
        if (is_array($x)) {
            foreach (array_reverse($x) as $y) $stack[] = $y;
        } else {
            $out[] = $x;
        }
    }
    return $out;
}`,
      },
      tests: [
        { name: 'exemple', code: `assertEqual(flatten([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5])` },
        { name: 'tableaux vides', code: `assertEqual(flatten([[], [[]], 6]), [6])
assertEqual(flatten([]), [])` },
        { name: 'types variés et ordre', code: `assertEqual(flatten(['a', [null, [true]], [[0], 'b']]), ['a', null, true, 0, 'b'])` },
        { name: 'entrée non modifiée', code: `const input = [1, [2, 3]]
flatten(input)
assertEqual(input, [1, [2, 3]])` },
        { name: 'imbrication de profondeur 100 000', code: `let deep = [0]
for (let i = 1; i < 100000; i++) deep = [deep, i] // [[[[0], 1], 2], …]
const t0 = performance.now()
const res = flatten(deep)
const elapsed = performance.now() - t0
assertEqual(res.length, 100000)
assertEqual(res[0], 0)
assertEqual(res[99999], 99999)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
        { name: 'imbrication à droite', code: `let deep = [99999]
for (let i = 99998; i >= 0; i--) deep = [i, deep] // [0, [1, [2, …]]]
const res = flatten(deep)
assertEqual(res.length, 100000)
assertEqual(res[12345], 12345)` },
      ],
      hints: [
        'La version récursive est correcte mais chaque niveau d\'imbrication ajoute un cadre sur la pile d\'appels, limitée à environ 10⁴ en V8.',
        'Remplacez la pile d\'appels par un tableau : dépilez une valeur ; si c\'est un tableau, empilez son contenu, sinon ajoutez-la au résultat.',
        'Pour conserver l\'ordre gauche → droite, empilez les éléments **à l\'envers** (le premier doit être dépilé en premier).',
      ],
      discussion: `**Complexité** : O(N) en temps, N étant le nombre total de valeurs et de tableaux ; O(N) en mémoire pour la pile dans le pire cas.

**Pourquoi pas \`out.push(...flatten(x))\` ?** Deux problèmes : la profondeur de pile, et l'étalement \`...\` qui passe chaque élément en argument (un très grand tableau dépasse aussi la limite d'arguments). Même \`nested.flat(Infinity)\` dépasse la pile à cette profondeur dans V8.

**Variante paresseuse** : un générateur (\`function*\` avec \`yield*\`) produit les valeurs à la demande, mais reste récursif ; on peut écrire un itérateur avec une pile explicite de paires \`[tableau, indice]\`, ce qui évite aussi de recopier les éléments sur la pile.

**Leçon générale** : toute récursion se transforme en boucle + pile explicite. C'est à proposer dès que la profondeur dépend de l'entrée (listes chaînées, arbres dégénérés, DFS sur grande grille).`,
    },
    {
      id: 'li-combination-sum',
      title: 'Combinaisons de somme donnée',
      difficulty: 'moyen',
      theme: 'recursion',
      pattern: 'backtracking avec élagage',
      statement: `\`candidates\` est un tableau d'entiers **positifs distincts** et \`target\` un entier positif. Écrivez \`combinationSum(candidates, target)\` qui renvoie toutes les combinaisons **uniques** de candidats dont la somme vaut \`target\`. Un même candidat peut être utilisé **autant de fois** qu'on veut.

- chaque combinaison est renvoyée triée par ordre croissant ;
- l'ordre des combinaisons dans le résultat est libre ;
- deux combinaisons sont identiques si elles contiennent les mêmes nombres avec les mêmes multiplicités (\`[2, 2, 3]\` et \`[2, 3, 2]\` sont la même).

Exemples :

- \`combinationSum([2, 3, 6, 7], 7)\` donne \`[[2, 2, 3], [7]]\` ;
- \`combinationSum([2, 3, 5], 8)\` donne \`[[2, 2, 2, 2], [2, 3, 3], [3, 5]]\` ;
- \`combinationSum([2], 1)\` donne \`[]\`.

Contraintes : \`1 <= candidates.length <= 30\`, \`2 <= candidates[i] <= 40\`, \`1 <= target <= 40\`.`,
      starter: `function combinationSum(candidates, target) {
  const res = []
  // TODO : backtracking ; attention aux doublons d'ordre
  return res
}`,
      solution: `function combinationSum(candidates, target) {
  const sorted = candidates.toSorted((a, b) => a - b)
  const res = []
  const path = []
  function backtrack(start, remaining) {
    if (remaining === 0) {
      res.push([...path])
      return
    }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break // trié : tous les suivants sont trop grands
      path.push(sorted[i])
      backtrack(i, remaining - sorted[i]) // i : on peut reprendre le même candidat
      path.pop()
    }
  }
  backtrack(0, target)
  return res
}`,
      solutionEquiv: {
        python: `def combination_sum(candidates, target):
    nums = sorted(candidates)
    res, path = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            res.append(path[:])
            return
        for i in range(start, len(nums)):
            if nums[i] > remaining:
                break
            path.append(nums[i])
            backtrack(i, remaining - nums[i])
            path.pop()

    backtrack(0, target)
    return res`,
        java: `static List<List<Integer>> combinationSum(int[] candidates, int target) {
    int[] sorted = candidates.clone();
    Arrays.sort(sorted);
    List<List<Integer>> res = new ArrayList<>();
    backtrack(sorted, 0, target, new ArrayList<>(), res);
    return res;
}
static void backtrack(int[] nums, int start, int remaining, List<Integer> path, List<List<Integer>> res) {
    if (remaining == 0) { res.add(new ArrayList<>(path)); return; }
    for (int i = start; i < nums.length; i++) {
        if (nums[i] > remaining) break;
        path.add(nums[i]);
        backtrack(nums, i, remaining - nums[i], path, res);
        path.remove(path.size() - 1);
    }
}`,
        rust: `fn combination_sum(candidates: &[u32], target: u32) -> Vec<Vec<u32>> {
    fn backtrack(nums: &[u32], start: usize, remaining: u32, path: &mut Vec<u32>, res: &mut Vec<Vec<u32>>) {
        if remaining == 0 { res.push(path.clone()); return; }
        for i in start..nums.len() {
            if nums[i] > remaining { break; }
            path.push(nums[i]);
            backtrack(nums, i, remaining - nums[i], path, res);
            path.pop();
        }
    }
    let mut nums = candidates.to_vec();
    nums.sort_unstable();
    let mut res = Vec::new();
    backtrack(&nums, 0, target, &mut Vec::new(), &mut res);
    res
}`,
      },
      tests: [
        { name: 'exemple 1', code: `const key = (xss) => xss.map((xs) => xs.join(',')).sort()
assertEqual(key(combinationSum([2, 3, 6, 7], 7)), key([[2, 2, 3], [7]]))` },
        { name: 'exemple 2', code: `const key = (xss) => xss.map((xs) => xs.join(',')).sort()
assertEqual(key(combinationSum([2, 3, 5], 8)), key([[2, 2, 2, 2], [2, 3, 3], [3, 5]]))` },
        { name: 'aucune solution', code: `assertEqual(combinationSum([2], 1), [])
assertEqual(combinationSum([5, 7], 3), [])` },
        { name: 'candidats non triés, combinaisons triées', code: `const res = combinationSum([7, 3, 2], 7)
for (const xs of res) assertEqual(xs, [...xs].sort((a, b) => a - b), 'combinaison non triée : ' + xs)
assertEqual(res.length, 2)` },
        { name: 'pas de doublon d\'ordre', code: `const res = combinationSum([2, 3], 12)
const keys = res.map((xs) => xs.join(','))
assertEqual(new Set(keys).size, keys.length)
assertEqual(keys.sort(), ['2,2,2,2,2,2', '3,3,3,3'].concat(['2,2,2,3,3']).sort())` },
        { name: 'cas plus grand', code: `const res = combinationSum([2, 3, 5, 7, 11, 13], 40)
assert(res.every((xs) => xs.reduce((a, b) => a + b, 0) === 40), 'somme incorrecte')
const keys = res.map((xs) => xs.join(','))
assertEqual(new Set(keys).size, keys.length)
assertEqual(res.length, 206)` },
      ],
      hints: [
        'Pour éviter de produire `[2, 3, 2]` en plus de `[2, 2, 3]`, imposez un ordre : on ne choisit jamais un candidat d\'indice inférieur au précédent (paramètre `start`).',
        'Comme un candidat est réutilisable, l\'appel récursif repart de `i` (et non `i + 1`).',
        'Triez les candidats : dès que `candidates[i] > remaining`, faites `break` : tous les suivants sont trop grands aussi.',
      ],
      discussion: `**Complexité** : exponentielle dans le pire cas ; une borne classique est O(n^(T/m)), avec T la cible et m le plus petit candidat (profondeur maximale T/m). L'élagage par tri réduit fortement l'exploration en pratique. Pile : O(T/m).

**Les variantes à connaître** :

- **Combination Sum II** : chaque candidat au plus une fois, candidats avec doublons → appel avec \`i + 1\` et saut des égaux (\`i > start && c[i] === c[i - 1]\`) ;
- **Combination Sum III** : k nombres parmi 1..9 → contrainte de taille supplémentaire ;
- **compter** seulement les combinaisons → programmation dynamique de type « rendu de monnaie » en O(n · T), sans énumérer.

**À dire en entretien** : le résultat lui-même peut être exponentiel, donc aucune méthode ne peut énumérer en temps polynomial ; l'enjeu est de ne pas explorer de branches inutiles.`,
    },
    {
      id: 'li-n-reines',
      title: 'N-reines',
      difficulty: 'difficile',
      theme: 'recursion',
      pattern: 'backtracking avec contraintes',
      statement: `Placer \`n\` reines sur un échiquier \`n × n\` de sorte qu'aucune ne puisse en prendre une autre (pas deux reines sur la même ligne, la même colonne ou la même diagonale). Écrivez \`solveNQueens(n)\` qui renvoie **toutes** les solutions, chacune sous forme d'un tableau de \`n\` chaînes où \`'Q'\` marque une reine et \`'.'\` une case vide. L'ordre des solutions est libre.

Exemple : \`solveNQueens(4)\` donne (dans un ordre quelconque)

- \`['.Q..', '...Q', 'Q...', '..Q.']\`
- \`['..Q.', 'Q...', '...Q', '.Q..']\`

\`solveNQueens(1)\` donne \`[['Q']]\` ; \`solveNQueens(2)\` et \`solveNQueens(3)\` donnent \`[]\`.

Contraintes : \`1 <= n <= 10\` ; \`solveNQueens(10)\` (724 solutions) doit répondre en moins d'une seconde.`,
      starter: `function solveNQueens(n) {
  const res = []
  // TODO : une reine par ligne, vérifier colonnes et diagonales
  return res
}`,
      solution: `function solveNQueens(n) {
  const res = []
  const queens = [] // queens[r] = colonne de la reine de la ligne r
  const cols = new Array(n).fill(false)
  const diag = new Array(2 * n - 1).fill(false) // indice r - c + n - 1
  const anti = new Array(2 * n - 1).fill(false) // indice r + c
  function place(r) {
    if (r === n) {
      res.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)))
      return
    }
    for (let c = 0; c < n; c++) {
      if (cols[c] || diag[r - c + n - 1] || anti[r + c]) continue
      cols[c] = diag[r - c + n - 1] = anti[r + c] = true
      queens.push(c)
      place(r + 1)
      queens.pop()
      cols[c] = diag[r - c + n - 1] = anti[r + c] = false
    }
  }
  place(0)
  return res
}`,
      solutionEquiv: {
        python: `def solve_n_queens(n):
    res, queens = [], []
    cols, diag, anti = set(), set(), set()

    def place(r):
        if r == n:
            res.append(['.' * c + 'Q' + '.' * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or (r - c) in diag or (r + c) in anti:
                continue
            cols.add(c); diag.add(r - c); anti.add(r + c)
            queens.append(c)
            place(r + 1)
            queens.pop()
            cols.remove(c); diag.remove(r - c); anti.remove(r + c)

    place(0)
    return res`,
        java: `static List<List<String>> solveNQueens(int n) {
    List<List<String>> res = new ArrayList<>();
    place(0, n, new int[n], new boolean[n], new boolean[2 * n - 1], new boolean[2 * n - 1], res);
    return res;
}
static void place(int r, int n, int[] queens, boolean[] cols, boolean[] diag, boolean[] anti,
                  List<List<String>> res) {
    if (r == n) {
        List<String> board = new ArrayList<>();
        for (int c : queens) board.add(".".repeat(c) + "Q" + ".".repeat(n - c - 1));
        res.add(board);
        return;
    }
    for (int c = 0; c < n; c++) {
        if (cols[c] || diag[r - c + n - 1] || anti[r + c]) continue;
        cols[c] = diag[r - c + n - 1] = anti[r + c] = true;
        queens[r] = c;
        place(r + 1, n, queens, cols, diag, anti, res);
        cols[c] = diag[r - c + n - 1] = anti[r + c] = false;
    }
}`,
        rust: `fn solve_n_queens(n: usize) -> Vec<Vec<String>> {
    struct S { n: usize, queens: Vec<usize>, cols: Vec<bool>, diag: Vec<bool>, anti: Vec<bool>, res: Vec<Vec<String>> }
    fn place(s: &mut S, r: usize) {
        let n = s.n;
        if r == n {
            let board = s.queens.iter()
                .map(|&c| ".".repeat(c) + "Q" + &".".repeat(n - c - 1))
                .collect();
            s.res.push(board);
            return;
        }
        for c in 0..n {
            let (d, a) = (r + n - 1 - c, r + c); // r - c + n - 1 sans passer par un négatif
            if s.cols[c] || s.diag[d] || s.anti[a] { continue; }
            s.cols[c] = true; s.diag[d] = true; s.anti[a] = true;
            s.queens.push(c);
            place(s, r + 1);
            s.queens.pop();
            s.cols[c] = false; s.diag[d] = false; s.anti[a] = false;
        }
    }
    let mut s = S { n, queens: Vec::new(), cols: vec![false; n], diag: vec![false; 2 * n - 1], anti: vec![false; 2 * n - 1], res: Vec::new() };
    place(&mut s, 0);
    s.res
}`,
        php: `function solveNQueens(int $n): array {
    $res = [];
    $queens = [];
    $cols = $diag = $anti = [];
    $place = function (int $r) use (&$place, &$res, &$queens, &$cols, &$diag, &$anti, $n) {
        if ($r === $n) {
            $res[] = array_map(fn($c) => str_repeat('.', $c) . 'Q' . str_repeat('.', $n - $c - 1), $queens);
            return;
        }
        for ($c = 0; $c < $n; $c++) {
            if (isset($cols[$c]) || isset($diag[$r - $c]) || isset($anti[$r + $c])) continue;
            $cols[$c] = $diag[$r - $c] = $anti[$r + $c] = true;
            $queens[] = $c;
            $place($r + 1);
            array_pop($queens);
            unset($cols[$c], $diag[$r - $c], $anti[$r + $c]);
        }
    };
    $place(0);
    return $res;
}`,
      },
      tests: [
        { name: 'n = 4', code: `const res = solveNQueens(4).map((b) => b.join('|')).sort()
assertEqual(res, ['..Q.|Q...|...Q|.Q..', '.Q..|...Q|Q...|..Q.'])` },
        { name: 'petits n', code: `assertEqual(solveNQueens(1), [['Q']])
assertEqual(solveNQueens(2), [])
assertEqual(solveNQueens(3), [])` },
        { name: 'nombre de solutions jusqu\'à 8', code: `const expected = [1, 0, 0, 2, 10, 4, 40, 92]
for (let n = 1; n <= 8; n++) assertEqual(solveNQueens(n).length, expected[n - 1], 'n = ' + n)` },
        { name: 'chaque solution est valide', code: `for (const board of solveNQueens(6)) {
  const pos = board.map((row) => row.indexOf('Q'))
  assert(board.every((row) => row.length === 6 && row.split('Q').length === 2), 'ligne mal formée')
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
    assert(pos[i] !== pos[j], 'même colonne')
    assert(Math.abs(pos[i] - pos[j]) !== j - i, 'même diagonale')
  }
}` },
        { name: 'solutions distinctes', code: `const keys = solveNQueens(7).map((b) => b.join('|'))
assertEqual(new Set(keys).size, 40)` },
        { name: 'n = 10 en moins d\'une seconde', code: `const t0 = performance.now()
const res = solveNQueens(10)
const elapsed = performance.now() - t0
assertEqual(res.length, 724)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
      ],
      hints: [
        'Deux reines ne peuvent pas partager une ligne : placez exactement une reine par ligne, ligne après ligne. Il ne reste qu\'à choisir une colonne à chaque niveau.',
        'Une case `(r, c)` est attaquée si sa colonne, sa diagonale (`r - c` constant) ou son anti-diagonale (`r + c` constant) est déjà prise. Trois tableaux de booléens rendent ce test O(1).',
        'Marquez avant l\'appel récursif, **démarquez** après. À la ligne `n`, construisez les chaînes à partir des colonnes choisies.',
      ],
      discussion: `**Complexité** : borne grossière O(n!) (n choix à la première ligne, au plus n − 1 à la suivante…), bien moins en pratique grâce à l'élagage ; O(n) de pile et de marquage, plus la taille du résultat.

**Pourquoi \`r - c + n - 1\` ?** \`r - c\` varie de \`-(n - 1)\` à \`n - 1\` : on décale pour obtenir un indice de tableau positif (2n − 1 diagonales).

**Optimisations à mentionner** :

- **masques de bits** : trois entiers \`cols\`, \`diag\`, \`anti\` ; les cases libres sont \`~(cols | diag | anti) & ((1 << n) - 1)\`, on extrait le bit le plus bas avec \`x & -x\`, et l'on décale \`diag\` et \`anti\` d'un bit à chaque ligne. Très rapide jusqu'à n ≈ 15 ;
- **symétrie** : ne placer la première reine que dans la moitié gauche et doubler le compte (en traitant à part la colonne du milieu si n est impair).

**Variante** : *N-Queens II* ne demande que le nombre de solutions : même code avec un compteur, sans construire les chaînes.`,
    },
  ],

  quiz: [
    {
      id: 'li-q-rec-output-ordre',
      theme: 'recursion',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `function f(n) {
  if (n === 0) return
  console.log('a' + n)
  f(n - 1)
  console.log('b' + n)
}
f(2)`,
      choices: ['a2\nb2\na1\nb1', 'a2\na1\nb2\nb1', 'a2\na1\nb1\nb2', 'a1\na2\nb2\nb1'],
      answer: 2,
      why: 'Ce qui précède l\'appel récursif s\'exécute à la descente (a2 puis a1) ; ce qui le suit s\'exécute à la remontée, dans l\'ordre inverse (b1 d\'abord, car f(1) se termine avant f(2)).',
    },
    {
      id: 'li-q-rec-output-path',
      theme: 'recursion',
      kind: 'output',
      q: 'Qu\'affiche ce code ?',
      code: `const res = []
const path = []
function bt(i) {
  if (i === 2) {
    res.push(path)
    return
  }
  for (const x of ['a', 'b']) {
    path.push(x)
    bt(i + 1)
    path.pop()
  }
}
bt(0)
console.log(res.length, JSON.stringify(res))`,
      choices: ['4 [[],[],[],[]]', '4 [["a","a"],["a","b"],["b","a"],["b","b"]]', '2 [["a"],["b"]]', '4 [["b","b"],["b","b"],["b","b"],["b","b"]]'],
      answer: 0,
      why: '`res.push(path)` stocke quatre fois **la même référence**. À la fin du backtracking, tous les `pop()` ont vidé `path` : les quatre entrées affichent `[]`. Il fallait `res.push([...path])`.',
    },
    {
      id: 'li-q-rec-cx-fib',
      theme: 'recursion',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code ?',
      code: `function fib(n) {
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
}
fib(15)`,
      choices: ['O(n)', 'O(n²)', 'O(n log n)', 'Exponentielle, O(2ⁿ) (plus précisément O(φⁿ), φ ≈ 1,618)'],
      answer: 3,
      why: 'Chaque appel en lance deux : l\'arbre d\'appels a environ φⁿ nœuds (le nombre d\'appels croît comme fib(n) lui-même). La profondeur, elle, n\'est que de n. Avec mémoïsation : O(n).',
    },
    {
      id: 'li-q-rec-cx-double',
      theme: 'recursion',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps (nombre de multiplications) de cette puissance, pour n puissance de 2 ?',
      code: `function power(x, n) {
  if (n === 0) return 1
  if (n === 1) return x
  return power(x, n / 2) * power(x, n / 2)
}
power(3, 16)`,
      choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
      answer: 1,
      why: 'Deux appels identiques sur n/2 : T(n) = 2T(n/2) + O(1), soit O(n) (l\'arbre a n feuilles). En calculant `power(x, n / 2)` une seule fois et en le mettant au carré, on obtient T(n) = T(n/2) + O(1) = O(log n).',
    },
    {
      id: 'li-q-rec-bug-used',
      theme: 'recursion',
      kind: 'bug',
      q: 'Cette fonction doit produire toutes les permutations. Quel est le bug ?',
      code: `function permutations(nums) {
  const res = []
  const path = []
  const used = new Array(nums.length).fill(false)
  function bt() {
    if (path.length === nums.length) {
      res.push([...path])
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      used[i] = true
      path.push(nums[i])
      bt()
      path.pop()
    }
  }
  bt()
  return res
}
permutations([1, 2, 3])`,
      choices: [
        'Il faut `res.push(path)` sans copie',
        '`used[i]` n\'est jamais remis à `false` : seule la première permutation est produite',
        'La boucle doit partir de `start` et non de 0',
        'Le cas de base doit être `path.length === 0`',
      ],
      answer: 1,
      why: 'Annuler un choix, c\'est annuler **tout** ce qu\'on a modifié : `path.pop()` mais aussi `used[i] = false`. Sinon, après la première feuille, tous les éléments restent marqués et l\'on obtient seulement `[[1, 2, 3]]`.',
    },
    {
      id: 'li-q-rec-tco',
      theme: 'recursion',
      kind: 'qcm',
      q: 'Une fonction récursive en position terminale (`return f(n - 1, acc + n)`) appelée avec n = 10⁶ dans Chrome ou Node :',
      choices: [
        'Fonctionne car V8 optimise les appels terminaux',
        'Fonctionne en mode strict uniquement',
        'Renvoie `undefined`',
        'Lève `RangeError: Maximum call stack size exceeded`',
      ],
      answer: 3,
      why: 'L\'optimisation des appels terminaux figure dans ES2015 mais V8 (Chrome, Node) ne l\'implémente pas ; seul Safari (JavaScriptCore) le fait, en mode strict. Chaque appel garde son cadre : au-delà d\'environ 10⁴ niveaux, la pile déborde. Il faut une boucle.',
    },
    {
      id: 'li-q-rec-memo',
      theme: 'recursion',
      kind: 'qcm',
      q: 'Dans quel cas la mémoïsation améliore-t-elle la complexité d\'une récursion ?',
      choices: [
        'Quand les mêmes sous-problèmes sont recalculés plusieurs fois',
        'Quand la récursion est trop profonde',
        'Quand les sous-problèmes sont tous différents, comme dans le tri fusion',
        'Toujours, quelle que soit la récursion',
      ],
      answer: 0,
      why: 'Le gain vient des sous-problèmes **qui se recoupent** (Fibonacci, chemins dans une grille). Dans le tri fusion, chaque sous-tableau n\'est trié qu\'une fois : mémoriser n\'apporte rien. Et la mémoïsation ne réduit pas la profondeur de pile.',
    },
    {
      id: 'li-q-rec-cx-subsets',
      theme: 'recursion',
      kind: 'complexite',
      q: 'Quelle est la complexité en temps de ce code, pour un tableau de taille n ?',
      code: `function subsets(nums) {
  const res = []
  const path = []
  function bt(start) {
    res.push([...path])
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      bt(i + 1)
      path.pop()
    }
  }
  bt(0)
  return res
}
subsets([1, 2, 3, 4])`,
      choices: ['O(2ⁿ)', 'O(n!)', 'O(n · 2ⁿ)', 'O(n²)'],
      answer: 2,
      why: 'Il y a 2ⁿ appels (un par sous-ensemble) et chacun copie `path`, de longueur jusqu\'à n : O(n · 2ⁿ). C\'est aussi la taille totale de la sortie, donc optimal.',
    },
  ],

  pieges: [
    {
      id: 'li-p-chemin-partage',
      title: 'Chemin partagé non copié',
      theme: 'recursion',
      question: 'Qu\'affiche ce code ?',
      code: `function combine(n, k) {
  const res = []
  const path = []
  function bt(start) {
    if (path.length === k) {
      res.push(path)
      return
    }
    for (let i = start; i <= n; i++) {
      path.push(i)
      bt(i + 1)
      path.pop()
    }
  }
  bt(1)
  return res
}
console.log(combine(3, 2))`,
      output: `[ [], [], [] ]`,
      explanation: `\`res.push(path)\` ne copie pas le tableau : \`res\` contient trois fois **la même référence**. À chaque \`pop()\`, toutes les « solutions » changent, et à la fin de l'exploration \`path\` est vide. En Java, le même bug s'écrit \`res.add(path)\` au lieu de \`res.add(new ArrayList<>(path))\`. En PHP, l'affectation copie les tableaux : le bug n'existe pas.`,
      fix: {
        code: `function combine(n, k) {
  const res = []
  const path = []
  function bt(start) {
    if (path.length === k) {
      res.push([...path]) // copie au moment où la solution est complète
      return
    }
    for (let i = start; i <= n; i++) {
      path.push(i)
      bt(i + 1)
      path.pop()
    }
  }
  bt(1)
  return res
}
console.log(combine(3, 2))`,
        output: `[ [ 1, 2 ], [ 1, 3 ], [ 2, 3 ] ]`,
        equiv: {
          python: `def combine(n, k):
    res, path = [], []

    def bt(start):
        if len(path) == k:
            res.append(path[:])  # ou list(path)
            return
        for i in range(start, n + 1):
            path.append(i)
            bt(i + 1)
            path.pop()

    bt(1)
    return res`,
          java: `static void bt(int n, int k, int start, List<Integer> path, List<List<Integer>> res) {
    if (path.size() == k) {
        res.add(new ArrayList<>(path)); // copie
        return;
    }
    for (int i = start; i <= n; i++) {
        path.add(i);
        bt(n, k, i + 1, path, res);
        path.remove(path.size() - 1);
    }
}`,
        },
      },
    },
    {
      id: 'li-p-pile-profonde',
      title: 'Récursion trop profonde',
      theme: 'recursion',
      question: 'On compte la longueur d\'une liste chaînée de 100 000 nœuds. Qu\'affiche ce code ?',
      code: `let head = null
for (let i = 0; i < 100000; i++) head = { value: i, next: head }
function length(node) {
  return node === null ? 0 : 1 + length(node.next)
}
console.log(length(head))`,
      output: `Uncaught RangeError: Maximum call stack size exceeded`,
      explanation: `Chaque appel ajoute un cadre sur la pile d'appels, limitée à environ 10⁴ cadres dans V8. Cent mille nœuds suffisent à la faire déborder : l'erreur interrompt le script et rien n'est affiché. La récursion est élégante pour les structures **peu profondes** (arbres équilibrés, profondeur log n) ; dès que la profondeur dépend linéairement de l'entrée, écrivez une boucle.`,
      fix: {
        code: `let head = null
for (let i = 0; i < 100000; i++) head = { value: i, next: head }
function length(node) {
  let n = 0
  for (let cur = node; cur !== null; cur = cur.next) n++
  return n
}
console.log(length(head))`,
        output: `100000`,
      },
    },
    {
      id: 'li-p-foreach-return',
      title: '`return` dans un `forEach` de DFS',
      theme: 'recursion',
      question: 'On cherche si une valeur existe dans un arbre. Qu\'affiche ce code ?',
      code: `const tree = { value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [] }] }
function contains(node, target) {
  if (node.value === target) return true
  node.children.forEach((child) => {
    if (contains(child, target)) return true
  })
  return false
}
console.log(contains(tree, 3))`,
      output: `false`,
      explanation: `Le \`return true\` sort seulement de la fonction fléchée passée à \`forEach\`, pas de \`contains\` : la valeur est ignorée et l'exploration continue jusqu'au \`return false\`. Dans une récursion qui doit s'arrêter dès qu'une solution est trouvée (DFS, backtracking « existe-t-il ? »), utilisez une boucle \`for...of\` ou \`some\`.`,
      fix: {
        code: `const tree = { value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [] }] }
function contains(node, target) {
  if (node.value === target) return true
  for (const child of node.children) {
    if (contains(child, target)) return true // sort vraiment de contains
  }
  return false
}
console.log(contains(tree, 3))`,
        output: `true`,
      },
    },
  ],

  flashcards: [
    { id: 'li-f-rec-ingredients', theme: 'recursion', front: 'Les deux ingrédients obligatoires d\'une récursion ?', back: `Un **cas de base** qui renvoie sans appel récursif, et une **progression** stricte vers ce cas à chaque appel (problème plus petit). Sans eux : récursion infinie et dépassement de pile.` },
    { id: 'li-f-rec-pile', theme: 'recursion', front: 'Combien d\'appels imbriqués V8 supporte-t-il, et que se passe-t-il au-delà ?', back: `De l'ordre de **10⁴** cadres (selon la taille des cadres). Au-delà : \`RangeError: Maximum call stack size exceeded\`. V8 n'optimise pas les appels terminaux : il faut une boucle et une pile explicite.` },
    { id: 'li-f-rec-cout', theme: 'recursion', front: 'Comment estimer le coût d\'une fonction récursive ?', back: `Dessiner l'**arbre d'appels** : temps ≈ nombre de nœuds × travail par nœud ; mémoire de pile ≈ profondeur. Deux appels sur n − 1 : O(2ⁿ) ; un appel sur n/2 : O(log n).` },
    { id: 'li-f-rec-memo', theme: 'recursion', front: 'Quand mémoïser, et quel gain ?', back: `Quand les mêmes sous-problèmes reviennent. Le coût devient (nombre d'états distincts) × (travail par état) : Fibonacci passe de O(φⁿ) à O(n). La profondeur de pile, elle, ne change pas.` },
    { id: 'li-f-rec-modele', theme: 'recursion', front: 'Le modèle du backtracking ?', back: `Pour chaque option : **choisir** (modifier l'état), **explorer** (appel récursif), **annuler** (restaurer l'état). Enregistrer une **copie** \`[...path]\` quand la solution est complète.`, code: `const path = [1, 2]
const res = []
res.push([...path])
path.pop()
res // → [ [ 1, 2 ] ]` },
    { id: 'li-f-rec-familles', theme: 'recursion', front: 'Sous-ensembles, combinaisons, permutations : quelle différence de code ?', back: `Sous-ensembles : enregistrer à chaque nœud, boucle depuis \`start\`, appel avec \`i + 1\`. Combinaisons de taille k : idem mais enregistrer quand \`path.length === k\`. Permutations : boucle sur tous les indices avec un tableau \`used\`.` },
    { id: 'li-f-rec-elagage', theme: 'recursion', front: 'Comment élaguer dans combination sum ?', back: `Trier les candidats ; dans la boucle, \`if (c[i] > remaining) break\` : tous les suivants sont plus grands. Appeler avec \`i\` (réutilisation permise) pour éviter les doublons d'ordre.` },
    { id: 'li-f-rec-reines', theme: 'recursion', front: 'N-reines : comment tester une case en O(1) ?', back: `Une reine par ligne ; trois tableaux de booléens : colonnes \`c\`, diagonales \`r - c + n - 1\`, anti-diagonales \`r + c\`. Marquer avant l'appel, démarquer après.` },
  ],

  lexique: [
    { term: 'Cas de base', theme: 'recursion', def: `Condition dans laquelle une fonction récursive renvoie directement un résultat sans s'appeler. Chaque appel doit s'en rapprocher strictement, sinon la récursion ne termine pas.`, see: ['Arbre d\'appels'] },
    { term: 'Arbre d\'appels', theme: 'recursion', def: `Représentation de tous les appels d'une fonction récursive : chaque nœud est un appel, ses enfants les appels qu'il déclenche. Le nombre de nœuds donne le temps, la profondeur donne la mémoire de pile.`, see: ['Cas de base', 'Dépassement de pile'] },
    { term: 'Dépassement de pile', theme: 'recursion', def: `Erreur levée quand trop d'appels sont imbriqués (*stack overflow*) : \`RangeError: Maximum call stack size exceeded\` en V8, vers 10⁴ cadres. Remède : boucle et pile explicite.`, see: ['Récursion terminale'] },
    { term: 'Récursion terminale', theme: 'recursion', def: `Récursion où l'appel récursif est la toute dernière opération (\`return f(n - 1, acc)\`). Certains langages la transforment en boucle ; V8 ne le fait pas, donc elle ne protège pas du dépassement de pile en JS.`, see: ['Dépassement de pile'] },
    { term: 'Diviser pour régner', theme: 'recursion', def: `Stratégie qui découpe un problème en sous-problèmes indépendants plus petits, les résout récursivement et combine leurs résultats : tri fusion, puissance rapide, recherche dichotomique.` },
    { term: 'Backtracking', theme: 'recursion', def: `Exploration récursive de toutes les solutions partielles : on fait un choix, on explore la suite, puis on annule ce choix pour essayer le suivant (retour sur trace). Sert à énumérer sous-ensembles, permutations, placements.`, see: ['Élagage'] },
    { term: 'Élagage', theme: 'recursion', def: `Abandon d'une branche de l'exploration dès qu'on sait qu'elle ne peut mener à aucune solution (contrainte violée, somme dépassée). C'est ce qui rend le backtracking praticable.`, see: ['Backtracking'] },
  ],

  entretien: [
    {
      id: 'li-e-rec-iteratif',
      section: 'techniques',
      q: 'Votre DFS récursif plante en production avec « Maximum call stack size exceeded ». Que faites-vous ?',
      answer: `La profondeur de récursion dépend de l'entrée (arbre dégénéré, longue chaîne, grande grille) et dépasse la pile de V8, qui tient de l'ordre de 10⁴ cadres. JavaScript n'optimise pas les appels terminaux dans V8, donc réécrire en récursion terminale ne suffit pas.

Je transforme la récursion en **boucle avec une pile explicite** (un tableau, limité seulement par la mémoire du tas) :

- pour un pré-ordre, on empile la racine, puis on dépile un nœud, on le traite et on empile ses enfants (à l'envers si l'ordre compte) ;
- si du travail doit être fait **après** les enfants (post-ordre, calcul de hauteur), on empile des paires \`[nœud, visité]\` ou l'on utilise deux piles ;
- pour un parcours en largeur, une file avec index de tête.

J'ajouterais un test avec une entrée de profondeur 10⁵ pour éviter la régression.`,
      attendu: 'Comprendre la cause (profondeur, pas de TCO), savoir dérécursiver avec une pile explicite, y compris en post-ordre.',
    },
    {
      id: 'li-e-rec-backtracking',
      section: 'techniques',
      q: 'Expliquez le backtracking et comment vous en maîtrisez le coût.',
      answer: `Le backtracking construit les solutions **choix par choix** : à chaque niveau, on essaie chaque option valide, on descend récursivement, puis on **annule** le choix (on restaure l'état) avant d'essayer la suivante. On parcourt ainsi l'arbre des solutions partielles en profondeur, avec un seul état mutable partagé (le chemin, des ensembles de marquage) au lieu de copies à chaque niveau.

Le coût est souvent exponentiel par nature (2ⁿ sous-ensembles, n! permutations), donc on le maîtrise par :

- l'**élagage** : couper une branche dès qu'une contrainte est violée (somme dépassée, case attaquée), et trier pour pouvoir sortir de boucle (\`break\`) ;
- des **vérifications en O(1)** grâce à des ensembles ou des tableaux de booléens ;
- l'**ordre des choix** : commencer par la variable la plus contrainte (sudoku) ;
- la **mémoïsation** quand l'état se résume à quelques paramètres et que l'on ne demande qu'un compte ou un booléen : c'est alors de la programmation dynamique.

Je rappellerais enfin de copier le chemin seulement aux feuilles.`,
      attendu: 'Le schéma choisir-explorer-annuler, la conscience du coût exponentiel et des techniques d\'élagage concrètes.',
    },
    {
      id: 'li-e-rec-complexite',
      section: 'complexite',
      q: 'Quelle est la complexité en temps et en espace de la génération de toutes les permutations de n éléments ?',
      answer: `Il y a n! permutations, chacune de longueur n : la sortie seule occupe O(n · n!), ce qui borne inférieurement le temps.

L'arbre d'appels a 1 + n + n(n − 1) + … + n! nœuds, soit environ e · n! = O(n!) nœuds ; chaque nœud fait une boucle de n itérations (test \`used[i]\`), et chaque feuille copie le chemin en O(n). Total : **O(n · n!)** en temps.

En espace, hors sortie : la profondeur de récursion est n, plus \`path\` et \`used\` de taille n : **O(n)**. Avec la sortie : O(n · n!). Concrètement, n = 10 donne 3,6 millions de permutations, déjà lourd ; n = 12, presque 500 millions, irréaliste.`,
      attendu: 'Distinguer taille de la sortie, nombre de nœuds de l\'arbre et mémoire auxiliaire.',
    },
  ],
}

const parts: ThemePack[] = [piles, recherche, tri, recursion]

export const pack: ThemePack = {
  cours: parts.flatMap((p) => p.cours),
  katas: parts.flatMap((p) => p.katas),
  quiz: parts.flatMap((p) => p.quiz),
  pieges: parts.flatMap((p) => p.pieges),
  flashcards: parts.flatMap((p) => p.flashcards),
  lexique: parts.flatMap((p) => p.lexique),
  entretien: parts.flatMap((p) => p.entretien),
}
