import type { CoursSection, EntretienQ, Flashcard, Kata, LexiqueEntry, Piege, QuizItem, ThemePack } from '../types'

/**
 * Pack « structures hiérarchiques et chaînées » : listes chaînées, arbres (BST, trie), tas.
 * Chaque partie remplit les tableaux ci-dessous ; l'export final les rassemble.
 * Dans les champs de code : pas d'accent grave ni de dollar-accolade, barres obliques inverses doublées.
 */
const cours: CoursSection[] = []
const katas: Kata[] = []
const quiz: QuizItem[] = []
const pieges: Piege[] = []
const flashcards: Flashcard[] = []
const lexique: LexiqueEntry[] = []
const entretien: EntretienQ[] = []

// =============================================================================
// LISTES CHAÎNÉES
// =============================================================================

/** Aides partagées par les tests des katas de listes (définies dans chaque test). */
const LIST_HELPERS = `function fromArray(values) {
  let head = null
  for (let i = values.length - 1; i >= 0; i--) head = { val: values[i], next: head }
  return head
}
function toArray(head) {
  const out = []
  for (let n = head; n; n = n.next) {
    out.push(n.val)
    if (out.length > 1000000) throw new Error('liste trop longue : un cycle a-t-il été créé ?')
  }
  return out
}`

cours.push({
  id: 'listes',
  title: 'Listes chaînées',
  summary:
    "Une liste chaînée relie des nœuds par des pointeurs : on y gagne l'insertion et la suppression en O(1) quand on tient le bon nœud, on y perd l'accès par indice ; presque tous les exercices se ramènent à quelques gestes (sentinelle, inversion, deux pointeurs).",
  blocks: [
    { h: 'Le nœud, et deux aides pour tester', id: 'listes-noeud' },
    {
      p: "Une liste simplement chaînée est une suite de **nœuds** `{ val, next }` : chaque nœud connaît sa valeur et le nœud suivant, le dernier pointe vers `null`. On ne manipule jamais « la liste » elle-même, seulement une référence vers son premier nœud, la **tête** (`head`). Une liste vide, c'est simplement `head === null`.",
    },
    {
      p: "En entretien comme sur LeetCode, la liste arrive déjà construite. Pour tester son code soi-même, il faut deux petites fonctions : `fromArray` (tableau → liste) et `toArray` (liste → tableau). Elles valent la peine d'être écrites de mémoire en trente secondes, car elles servent dans tous les exercices.",
    },
    {
      title: 'Nœud, construction et conversion',
      code: `class ListNode {
  constructor(val, next = null) {
    this.val = val
    this.next = next
  }
}

// tableau → liste : on construit à l'envers pour que chaque nœud connaisse déjà son suivant
function fromArray(values) {
  let head = null
  for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head)
  return head
}

// liste → tableau : le parcours canonique d'une liste
function toArray(head) {
  const out = []
  for (let node = head; node !== null; node = node.next) out.push(node.val)
  return out
}

const head = fromArray([1, 2, 3])
console.log(head.val, head.next.val, head.next.next.next)
console.log(toArray(head))
console.log(toArray(fromArray([])))`,
      output: `1 2 null
[ 1, 2, 3 ]
[]`,
      equiv: {
        python: `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def from_array(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_array(head):
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        node = node.next
    return out`,
        java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

static ListNode fromArray(int[] values) {
    ListNode head = null;
    for (int i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);
    return head;
}

static List<Integer> toArray(ListNode head) {
    List<Integer> out = new ArrayList<>();
    for (ListNode node = head; node != null; node = node.next) out.add(node.val);
    return out;
}`,
        rust: `// En Rust, un pointeur « possédant » vers le suivant : Option<Box<ListNode>>.
// Un seul propriétaire par nœud : impossible d'avoir deux références mutables
// (pas de liste doublement chaînée ni de cycle sans Rc<RefCell<...>>).
struct ListNode {
    val: i32,
    next: Option<Box<ListNode>>,
}

fn from_array(values: &[i32]) -> Option<Box<ListNode>> {
    let mut head = None;
    for &v in values.iter().rev() {
        head = Some(Box::new(ListNode { val: v, next: head }));
    }
    head
}

fn to_array(head: &Option<Box<ListNode>>) -> Vec<i32> {
    let mut out = Vec::new();
    let mut node = head;
    while let Some(n) = node {
        out.push(n.val);
        node = &n.next;
    }
    out
}`,
      },
    },
    {
      table: [
        ['Opération', 'Tableau', 'Liste simplement chaînée'],
        ['Accès au i-ème élément', 'O(1)', 'O(i) : il faut marcher'],
        ['Insertion / suppression en tête', 'O(n) (décalage)', 'O(1)'],
        ['Insertion / suppression après un nœud connu', 'O(n)', 'O(1)'],
        ['Suppression d’un nœud quelconque', 'O(n)', 'O(n) pour trouver son précédent (O(1) si doublement chaînée)'],
        ['Mémoire', 'contiguë, compacte', 'un pointeur de plus par nœud, éparpillée (moins bon pour le cache)'],
      ],
    },
    {
      mnemo: "Une liste, c'est une tête et des flèches. Tout l'art consiste à ne jamais lâcher une flèche avant d'en avoir gardé une copie.",
      piege: "Écrire `while (node.next)` au lieu de `while (node)` saute le traitement du dernier nœud et plante sur une liste vide (`null.next`).",
    },

    { h: 'Le nœud sentinelle (dummy)', id: 'listes-sentinelle' },
    {
      p: "Dès qu'un exercice peut **modifier la tête** (supprimer le premier nœud, fusionner, insérer en tête, partitionner), créez un faux nœud placé devant : la **sentinelle**. Le premier vrai nœud devient alors un nœud « comme les autres », qui a un précédent. À la fin, on renvoie `dummy.next`, qui est la nouvelle tête quelle qu'elle soit.",
    },
    {
      title: 'Supprimer toutes les occurrences d’une valeur',
      code: `function removeAll(head, target) {
  const dummy = { val: 0, next: head }
  let prev = dummy
  while (prev.next !== null) {
    if (prev.next.val === target) prev.next = prev.next.next // on court-circuite le nœud
    else prev = prev.next // on n'avance que si l'on n'a rien supprimé
  }
  return dummy.next
}

function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function toArray(h) { const out = []; for (; h; h = h.next) out.push(h.val); return out }

console.log(toArray(removeAll(fromArray([7, 7, 1, 7, 2]), 7)))
console.log(toArray(removeAll(fromArray([7, 7]), 7)))`,
      output: `[ 1, 2 ]
[]`,
      equiv: {
        python: `def remove_all(head, target):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None:
        if prev.next.val == target:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next`,
        java: `static ListNode removeAll(ListNode head, int target) {
    ListNode dummy = new ListNode(0, head);
    ListNode prev = dummy;
    while (prev.next != null) {
        if (prev.next.val == target) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
}`,
      },
    },
    {
      p: "Sans sentinelle, il faudrait d'abord une boucle spéciale pour supprimer les `7` de tête, puis une seconde pour le reste : deux fois plus de code et deux fois plus d'occasions de se tromper. Remarquez aussi le geste clé de toute suppression : on se place sur le **précédent** (`prev`) et on regarde `prev.next`, car pour retirer un nœud d'une liste simplement chaînée il faut modifier le pointeur de celui qui le précède.",
    },
    {
      mnemo: "La tête peut changer ? Sentinelle devant, `return dummy.next` à la fin.",
      piege: "Renvoyer `head` au lieu de `dummy.next` : si la tête d'origine a été supprimée ou déplacée, on renvoie un nœud qui ne fait plus partie du résultat.",
    },

    { h: 'Inverser une liste', id: 'listes-inversion' },
    {
      p: "L'inversion est **le** geste de base, à savoir écrire les yeux fermés : trois pointeurs `prev`, `curr` et `next`. À chaque tour, on sauvegarde le suivant, on retourne la flèche du nœud courant vers l'arrière, puis on avance les deux pointeurs. L'ordre des quatre affectations est la seule difficulté : si l'on écrase `curr.next` avant de l'avoir sauvegardé, le reste de la liste est perdu.",
    },
    {
      title: 'Version itérative : O(n) en temps, O(1) en mémoire',
      code: `function reverseList(head) {
  let prev = null
  let curr = head
  while (curr !== null) {
    const next = curr.next // 1. sauvegarder la suite
    curr.next = prev // 2. retourner la flèche
    prev = curr // 3. avancer prev
    curr = next // 4. avancer curr
  }
  return prev // curr vaut null : prev est l'ancien dernier nœud, la nouvelle tête
}

function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function toArray(h) { const out = []; for (; h; h = h.next) out.push(h.val); return out }

console.log(toArray(reverseList(fromArray([1, 2, 3, 4]))))
console.log(reverseList(null))`,
      output: `[ 4, 3, 2, 1 ]
null`,
      equiv: {
        python: `def reverse_list(head):
    prev, curr = None, head
    while curr is not None:
        # l'affectation multiple évalue tout à droite avant d'affecter
        curr.next, prev, curr = prev, curr, curr.next
    return prev`,
        java: `static ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
        rust: `// Avec Option<Box<...>>, take() « vole » le suivant et laisse None à sa place :
// c'est exactement la sauvegarde de next, imposée par le système de propriété.
fn reverse_list(mut head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut prev = None;
    while let Some(mut node) = head {
        head = node.next.take();
        node.next = prev;
        prev = Some(node);
    }
    prev
}`,
        php: `function reverseList(?ListNode $head): ?ListNode {
    $prev = null;
    $curr = $head;
    while ($curr !== null) {
        $next = $curr->next;
        $curr->next = $prev;
        $prev = $curr;
        $curr = $next;
    }
    return $prev;
}`,
      },
    },
    {
      p: "La version récursive est élégante : on inverse le reste de la liste, puis on accroche le nœud courant derrière son ancien suivant (`head.next.next = head`). Mais elle consomme une frame de pile par nœud, donc O(n) en mémoire, et elle **dépasse la pile** de V8 au-delà de quelques milliers de nœuds : sur une liste de 10⁵ éléments, elle lève `RangeError: Maximum call stack size exceeded`. En entretien, donnez l'itérative, citez la récursive.",
    },
    {
      title: 'Version récursive (et sa limite)',
      code: `function reverseRec(head) {
  if (head === null || head.next === null) return head
  const newHead = reverseRec(head.next) // le reste est inversé, head.next est maintenant son dernier nœud
  head.next.next = head // on accroche head derrière
  head.next = null // head devient le dernier
  return newHead
}

function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function toArray(h) { const out = []; for (; h; h = h.next) out.push(h.val); return out }

console.log(toArray(reverseRec(fromArray([1, 2, 3]))))
const big = fromArray(Array.from({ length: 100000 }, (_, i) => i))
try {
  reverseRec(big)
} catch (e) {
  console.log(e.name)
}`,
      output: `[ 3, 2, 1 ]
RangeError`,
    },
    {
      mnemo: "Inversion : « sauve, tourne, avance, avance » (next = curr.next ; curr.next = prev ; prev = curr ; curr = next).",
      piege: "Renvoyer `curr` à la fin de la boucle : il vaut toujours `null`. La nouvelle tête est `prev`.",
    },

    { h: 'Fusionner deux listes triées', id: 'listes-fusion' },
    {
      p: "Fusionner deux listes triées combine la sentinelle et le parcours à deux curseurs : on accroche à la queue du résultat le plus petit des deux nœuds de tête, on avance dans la liste concernée, et quand l'une est épuisée on accroche **tout le reste** de l'autre d'un seul coup (pas besoin de boucler). Aucun nœud n'est créé : on ne fait que réorienter des pointeurs, donc O(1) en mémoire supplémentaire et O(n + m) en temps.",
    },
    {
      title: 'Fusion avec sentinelle',
      code: `function mergeTwoLists(a, b) {
  const dummy = { val: 0, next: null }
  let tail = dummy
  while (a !== null && b !== null) {
    if (a.val <= b.val) { // <= : à égalité on prend d'abord dans a, la fusion est stable
      tail.next = a
      a = a.next
    } else {
      tail.next = b
      b = b.next
    }
    tail = tail.next
  }
  tail.next = a !== null ? a : b // le reste, déjà trié, est accroché en bloc
  return dummy.next
}

function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function toArray(h) { const out = []; for (; h; h = h.next) out.push(h.val); return out }

console.log(toArray(mergeTwoLists(fromArray([1, 4, 6]), fromArray([2, 3, 7, 9]))))
console.log(toArray(mergeTwoLists(null, fromArray([5]))))`,
      output: `[ 1, 2, 3, 4, 6, 7, 9 ]
[ 5 ]`,
      equiv: {
        python: `def merge_two_lists(a, b):
    dummy = ListNode(0)
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a else b
    return dummy.next`,
        java: `static ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0, null), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}`,
      },
    },
    {
      p: "C'est la brique de base du **tri fusion sur liste** (O(n log n), seule méthode de tri vraiment adaptée aux listes, car elle n'a pas besoin d'accès par indice) et de la **fusion de k listes** (avec un tas, voir le thème des tas).",
    },

    { h: 'Deux pointeurs lent / rapide', id: 'listes-pointeurs' },
    {
      p: "Faute d'indices, on raisonne avec **deux pointeurs qui avancent à des vitesses ou des moments différents**. Reconnaissez le motif dès que l'énoncé parle de milieu, de cycle, de « k-ième depuis la fin » ou demande O(1) en mémoire sur une liste.",
    },
    {
      list: [
        "**Milieu** : `slow` avance d'un pas, `fast` de deux ; quand `fast` atteint la fin, `slow` est au milieu.",
        "**Cycle (Floyd, lièvre et tortue)** : s'il y a une boucle, `fast` finit par rattraper `slow` à l'intérieur ; sinon `fast` atteint `null`.",
        "**Entrée du cycle** : après la rencontre, on replace un pointeur sur la tête ; en avançant tous deux d'un pas, ils se retrouvent exactement à l'entrée du cycle.",
        "**k-ième depuis la fin** : on donne `k` pas d'avance à `fast`, puis on avance les deux ensemble ; quand `fast` tombe sur `null`, `slow` est à k nœuds de la fin.",
      ],
    },
    {
      title: 'Milieu, détection de cycle et entrée du cycle',
      code: `function middle(head) {
  let slow = head
  let fast = head
  // on teste fast ET fast.next : fast avance de deux, chacun des deux sauts doit exister
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow // longueur paire : le second des deux milieux
}

function cycleStart(head) {
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) { // rencontre dans le cycle (on compare des références, pas des valeurs)
      let p = head
      while (p !== slow) {
        p = p.next
        slow = slow.next
      }
      return p
    }
  }
  return null // fast a atteint la fin : pas de cycle
}

function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }

console.log(middle(fromArray([1, 2, 3, 4, 5])).val, middle(fromArray([1, 2, 3, 4])).val)
const head = fromArray([3, 2, 0, -4])
head.next.next.next.next = head.next // -4 repointe vers 2 : cycle
console.log(cycleStart(head).val, cycleStart(fromArray([1, 2])))`,
      output: `3 3
2 null`,
      equiv: {
        python: `def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:  # identité, pas égalité de valeur
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None`,
        java: `static ListNode cycleStart(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) { // == compare les références
            ListNode p = head;
            while (p != slow) { p = p.next; slow = slow.next; }
            return p;
        }
    }
    return null;
}`,
      },
    },
    {
      p: "Pourquoi l'entrée du cycle ? Notons `a` la distance de la tête à l'entrée, `b` celle de l'entrée au point de rencontre et `c` la longueur du cycle. À la rencontre, `slow` a parcouru `a + b` et `fast` le double, soit `a + b + k·c` pour un certain entier `k` ≥ 1. D'où `a + b = k·c`, donc `a = k·c − b` : partir de la tête et partir du point de rencontre en avançant au même pas mène, après `a` pas, au même nœud, l'entrée.",
    },
    {
      p: "Ces gestes se combinent. **Liste palindrome en O(1) mémoire** : trouver le milieu, inverser la seconde moitié, comparer les deux moitiés nœud à nœud (puis, par politesse, ré-inverser pour rendre la liste intacte).",
    },
    {
      title: 'Palindrome : milieu + inversion + comparaison',
      code: `function isPalindrome(head) {
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  // inverser la seconde moitié à partir de slow
  let prev = null
  while (slow !== null) {
    const next = slow.next
    slow.next = prev
    prev = slow
    slow = next
  }
  // comparer la première moitié et la seconde, inversée
  for (let p = head, q = prev; q !== null; p = p.next, q = q.next) {
    if (p.val !== q.val) return false
  }
  return true
}

function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }

console.log(isPalindrome(fromArray([1, 2, 2, 1])), isPalindrome(fromArray([1, 2, 3])), isPalindrome(null))`,
      output: `true false true`,
    },
    {
      mnemo: "Milieu, cycle, k-ième depuis la fin, O(1) mémoire : pensez « lièvre et tortue ».",
      piege: "`while (fast.next !== null)` sans tester `fast` d'abord : sur une liste de longueur paire, `fast` devient `null` et `fast.next` lève une TypeError.",
    },

    { h: 'Liste doublement chaînée et cache LRU', id: 'listes-lru' },
    {
      p: "Un **cache LRU** (Least Recently Used) de capacité `c` garde les `c` clés utilisées le plus récemment et évince la plus ancienne quand il est plein. Exigence classique : `get` et `put` en **O(1)**. La solution canonique combine deux structures : une `Map` clé → nœud pour trouver un nœud en O(1), et une **liste doublement chaînée** (`prev` et `next`) ordonnée de la plus ancienne à la plus récente, où l'on peut détacher un nœud et le remettre en queue en O(1), justement parce qu'on connaît son précédent.",
    },
    {
      title: 'Cache LRU : Map + liste doublement chaînée à deux sentinelles',
      code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map() // clé → nœud
    this.head = { prev: null, next: null } // sentinelle côté « le plus ancien »
    this.tail = { prev: this.head, next: null } // sentinelle côté « le plus récent »
    this.head.next = this.tail
  }
  unlink(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }
  pushBack(node) { // insère juste avant la sentinelle de queue
    node.prev = this.tail.prev
    node.next = this.tail
    this.tail.prev.next = node
    this.tail.prev = node
  }
  get(key) {
    const node = this.map.get(key)
    if (node === undefined) return -1
    this.unlink(node)
    this.pushBack(node) // devient le plus récent
    return node.value
  }
  put(key, value) {
    let node = this.map.get(key)
    if (node !== undefined) {
      node.value = value
      this.unlink(node)
    } else {
      if (this.map.size === this.capacity) {
        const oldest = this.head.next
        this.unlink(oldest)
        this.map.delete(oldest.key)
      }
      node = { key, value, prev: null, next: null }
      this.map.set(key, node)
    }
    this.pushBack(node)
  }
}

const cache = new LRUCache(2)
cache.put('a', 1)
cache.put('b', 2)
console.log(cache.get('a')) // a devient le plus récent
cache.put('c', 3) // plein : on évince b
console.log(cache.get('b'), cache.get('c'), [...cache.map.keys()])`,
      output: `1
-1 3 [ 'a', 'c' ]`,
      equiv: {
        python: `# OrderedDict garde l'ordre et sait déplacer une clé en O(1)
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)  # le plus ancien`,
        java: `// LinkedHashMap en « ordre d'accès » + removeEldestEntry : un LRU en quelques lignes
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    LRUCache(int capacity) {
        super(16, 0.75f, true); // true = ordre d'accès, pas d'insertion
        this.capacity = capacity;
    }
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}`,
      },
    },
    {
      p: "**Le raccourci JavaScript** : une `Map` itère ses clés **dans l'ordre d'insertion**, et `delete` puis `set` replace une clé à la fin. La première clé de `map.keys()` est donc la moins récemment utilisée, et l'on obtient un LRU correct en O(1) amorti sans écrire de liste. En entretien, montrez ce raccourci, mais soyez prêt à écrire la version avec liste doublement chaînée : c'est souvent elle que l'on attend, car c'est elle qui montre que vous savez **pourquoi** c'est O(1).",
    },
    {
      title: 'LRU en s’appuyant sur l’ordre d’insertion de Map',
      code: `class LRUMap {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()
  }
  get(key) {
    if (!this.map.has(key)) return -1
    const value = this.map.get(key)
    this.map.delete(key) // on retire…
    this.map.set(key, value) // …et on remet à la fin : la clé devient la plus récente
    return value
  }
  put(key, value) {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value // première clé = la plus ancienne
      this.map.delete(oldest)
    }
  }
}

const lru = new LRUMap(2)
lru.put(1, 'un')
lru.put(2, 'deux')
lru.get(1)
lru.put(3, 'trois')
console.log([...lru.map.keys()], lru.get(2))`,
      output: `[ 1, 3 ] -1`,
    },
    {
      mnemo: "LRU = Map pour trouver, liste doublement chaînée pour réordonner ; deux sentinelles pour ne jamais tester `null`.",
      piege: "Oublier de supprimer la clé évincée de la `Map` (ou de mettre à jour `prev` en plus de `next`) : la structure devient incohérente et la taille ne diminue jamais.",
    },
  ],
  mnemo:
    "Sentinelle si la tête peut changer ; « sauve, tourne, avance » pour inverser ; lièvre et tortue pour milieu, cycle et k-ième depuis la fin ; Map + liste doublement chaînée pour un LRU.",
  piege:
    "La plupart des bugs de listes sont des pointeurs perdus ou des `null` mal gardés : dessinez trois nœuds sur papier et exécutez votre boucle à la main sur la liste vide, à un seul nœud et à deux nœuds.",
})

katas.push(
  // ---------------------------------------------------------------------------
  {
    id: 'hi-inverser-liste',
    title: 'Inverser une liste chaînée',
    difficulty: 'facile',
    theme: 'listes',
    pattern: 'trois pointeurs prev / curr / next',
    statement: `Écrivez \`reverseList(head)\` qui inverse une liste simplement chaînée **en place** et renvoie la nouvelle tête.

Les nœuds sont de simples objets \`{ val, next }\` ; le dernier nœud a \`next === null\` et la liste vide est représentée par \`null\`. Les tests construisent les listes avec leurs propres fonctions \`fromArray\` / \`toArray\` (inutile de les écrire).

- on ne crée **aucun** nouveau nœud : on réoriente les pointeurs \`next\` existants ;
- la solution doit tenir sur une liste de **100 000 nœuds** (attention à la récursion).

Exemples :

- \`[1, 2, 3, 4, 5]\` devient \`[5, 4, 3, 2, 1]\` ;
- \`[1]\` reste \`[1]\` ;
- \`null\` (liste vide) donne \`null\`.`,
    starter: `function reverseList(head) {
  // TODO : inverser les pointeurs next, renvoyer la nouvelle tête
  return head
}`,
    solution: `function reverseList(head) {
  let prev = null
  let curr = head
  while (curr !== null) {
    const next = curr.next // sauvegarder la suite avant d'écraser curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}`,
    solutionEquiv: {
      python: `def reverse_list(head):
    prev, curr = None, head
    while curr is not None:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      java: `static ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      rust: `fn reverse_list(mut head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut prev: Option<Box<ListNode>> = None;
    while let Some(mut node) = head {
        head = node.next.take();
        node.next = prev;
        prev = Some(node);
    }
    prev
}`,
      php: `function reverseList(?ListNode $head): ?ListNode {
    $prev = null;
    $curr = $head;
    while ($curr !== null) {
        $next = $curr->next;
        $curr->next = $prev;
        $prev = $curr;
        $curr = $next;
    }
    return $prev;
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `${LIST_HELPERS}
assertEqual(toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1])` },
      { name: 'deux nœuds', code: `${LIST_HELPERS}
assertEqual(toArray(reverseList(fromArray([1, 2]))), [2, 1])` },
      { name: 'un seul nœud', code: `${LIST_HELPERS}
const one = fromArray([42])
const r = reverseList(one)
assert(r === one, 'la tête doit être le même nœud')
assertEqual(toArray(r), [42])` },
      { name: 'liste vide', code: `assertEqual(reverseList(null), null)` },
      { name: 'en place : mêmes nœuds réutilisés', code: `${LIST_HELPERS}
const head = fromArray([1, 2, 3])
const last = head.next.next
const r = reverseList(head)
assert(r === last, 'la nouvelle tête doit être l’ancien dernier nœud')
assert(head.next === null, 'l’ancienne tête doit devenir le dernier nœud')` },
      { name: 'grande entrée (100 000 nœuds)', code: `${LIST_HELPERS}
const n = 100000
const head = fromArray(Array.from({ length: n }, (_, i) => i))
const t0 = performance.now()
const r = reverseList(head)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
const out = toArray(r)
assertEqual(out.length, n)
assertEqual([out[0], out[1], out[n - 1]], [n - 1, n - 2, 0])` },
    ],
    hints: [
      'Gardez trois références : le nœud précédent (au départ `null`), le nœud courant et le suivant.',
      'À chaque tour : sauvegardez `curr.next`, faites pointer `curr.next` vers `prev`, puis avancez `prev` et `curr`.',
      'Une version récursive passe les petits tests mais lève `RangeError: Maximum call stack size exceeded` sur 100 000 nœuds : il faut une boucle.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire pour la version itérative.

**Points à évoquer** :

- la version récursive (\`newHead = reverse(head.next); head.next.next = head; head.next = null\`) est correcte mais consomme O(n) de pile : sur 10⁵ nœuds elle dépasse la pile d'appels de V8 ; JavaScript ne garantit pas l'optimisation des appels terminaux, et de toute façon cette récursion n'est pas terminale ;
- ne pas renvoyer \`curr\` (il vaut \`null\` en fin de boucle) mais \`prev\` ;
- variantes très fréquentes : inverser la portion entre les positions \`m\` et \`n\` (sentinelle + inversion partielle), inverser par groupes de \`k\`, tester un palindrome (inverser la seconde moitié), additionner deux nombres stockés à l'envers dans des listes.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-fusion-listes-triees',
    title: 'Fusionner deux listes triées',
    difficulty: 'facile',
    theme: 'listes',
    pattern: 'nœud sentinelle',
    statement: `Écrivez \`mergeTwoLists(a, b)\` qui fusionne deux listes simplement chaînées **triées par ordre croissant** en une seule liste triée, et renvoie sa tête.

- les nœuds sont des objets \`{ val, next }\`, la liste vide vaut \`null\` ;
- la fusion se fait en **réutilisant les nœuds** existants (on se contente de réorienter les \`next\`) ;
- à valeurs égales, les nœuds de \`a\` passent avant ceux de \`b\` (fusion stable).

Les tests fournissent leurs propres \`fromArray\` / \`toArray\`.

Exemples :

- \`[1, 2, 4]\` et \`[1, 3, 4]\` donnent \`[1, 1, 2, 3, 4, 4]\` ;
- \`[]\` et \`[0]\` donnent \`[0]\` ;
- \`[]\` et \`[]\` donnent \`[]\` (\`null\`).`,
    starter: `function mergeTwoLists(a, b) {
  // TODO : utiliser un nœud sentinelle et une queue « tail »
  return a
}`,
    solution: `function mergeTwoLists(a, b) {
  const dummy = { val: 0, next: null }
  let tail = dummy
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a
      a = a.next
    } else {
      tail.next = b
      b = b.next
    }
    tail = tail.next
  }
  tail.next = a !== null ? a : b
  return dummy.next
}`,
    solutionEquiv: {
      python: `def merge_two_lists(a, b):
    dummy = ListNode(0)
    tail = dummy
    while a is not None and b is not None:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next`,
      java: `static ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0, null);
    ListNode tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}`,
      rust: `// Avec Option<Box<...>>, la version récursive est la plus lisible :
// la propriété des nœuds est transférée naturellement à chaque appel.
fn merge_two_lists(a: Option<Box<ListNode>>, b: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    match (a, b) {
        (None, rest) | (rest, None) => rest,
        (Some(mut x), Some(mut y)) => {
            if x.val <= y.val {
                x.next = merge_two_lists(x.next.take(), Some(y));
                Some(x)
            } else {
                y.next = merge_two_lists(Some(x), y.next.take());
                Some(y)
            }
        }
    }
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `${LIST_HELPERS}
assertEqual(toArray(mergeTwoLists(fromArray([1, 2, 4]), fromArray([1, 3, 4]))), [1, 1, 2, 3, 4, 4])` },
      { name: 'une liste vide', code: `${LIST_HELPERS}
assertEqual(toArray(mergeTwoLists(null, fromArray([0]))), [0])
assertEqual(toArray(mergeTwoLists(fromArray([2, 5]), null)), [2, 5])` },
      { name: 'deux listes vides', code: `assertEqual(mergeTwoLists(null, null), null)` },
      { name: 'listes de longueurs très différentes', code: `${LIST_HELPERS}
assertEqual(toArray(mergeTwoLists(fromArray([5]), fromArray([1, 2, 3, 4, 6, 7]))), [1, 2, 3, 4, 5, 6, 7])` },
      { name: 'valeurs négatives et doublons', code: `${LIST_HELPERS}
assertEqual(toArray(mergeTwoLists(fromArray([-3, 0, 0]), fromArray([-3, -1, 0]))), [-3, -3, -1, 0, 0, 0])` },
      { name: 'stabilité et réutilisation des nœuds', code: `${LIST_HELPERS}
const a = fromArray([1, 2])
const a2 = a.next
const b = fromArray([1])
const r = mergeTwoLists(a, b)
assert(r === a, 'à égalité, le nœud de a passe en premier')
assert(r.next === b, 'puis celui de b')
assert(r.next.next === a2, 'aucun nœud ne doit être recréé')` },
    ],
    hints: [
      'Créez un nœud sentinelle `dummy` et un pointeur `tail` sur le dernier nœud du résultat.',
      'Tant que les deux listes ont des nœuds, accrochez à `tail` le plus petit des deux et avancez dans sa liste.',
      'Quand une liste est épuisée, accrochez tout le reste de l’autre en une seule affectation, puis renvoyez `dummy.next`.',
    ],
    discussion: `**Complexité** : O(n + m) en temps, O(1) en mémoire supplémentaire (aucun nœud créé).

**Points à évoquer** :

- la sentinelle évite un cas particulier pour choisir la première tête ;
- la version récursive (\`a.next = merge(a.next, b); return a\`) est courte mais utilise O(n + m) de pile : risque de dépassement sur de longues listes ;
- \`<=\` plutôt que \`<\` rend la fusion stable, propriété héritée par le tri fusion ;
- suites naturelles : trier une liste en O(n log n) par tri fusion (milieu avec slow/fast, puis fusion), fusionner **k** listes triées avec un tas en O(N log k).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-supprimer-kieme-fin',
    title: 'Supprimer le k-ième nœud depuis la fin',
    difficulty: 'moyen',
    theme: 'listes',
    pattern: 'deux pointeurs décalés + sentinelle',
    statement: `Écrivez \`removeNthFromEnd(head, k)\` qui supprime le **k-ième nœud en partant de la fin** (\`k = 1\` désigne le dernier) et renvoie la tête de la liste modifiée.

- les nœuds sont des objets \`{ val, next }\`, la liste vide vaut \`null\` ;
- on garantit \`1 <= k <= longueur\` ;
- visez **un seul parcours** de la liste et O(1) en mémoire.

Les tests fournissent leurs propres \`fromArray\` / \`toArray\`.

Exemples :

- \`[1, 2, 3, 4, 5]\`, \`k = 2\` donne \`[1, 2, 3, 5]\` ;
- \`[1]\`, \`k = 1\` donne \`[]\` (\`null\`) ;
- \`[1, 2]\`, \`k = 2\` donne \`[2]\` (on supprime la tête).`,
    starter: `function removeNthFromEnd(head, k) {
  // TODO : un pointeur en avance de k nœuds, puis avancer les deux ensemble
  // (cette version supprime le k-ième depuis le DÉBUT : ce n'est pas ce qu'on veut)
  if (k === 1) return head.next
  let node = head
  for (let i = 1; i < k - 1; i++) node = node.next
  node.next = node.next.next
  return head
}`,
    solution: `function removeNthFromEnd(head, k) {
  const dummy = { val: 0, next: head } // la tête elle-même peut être supprimée
  let fast = dummy
  let slow = dummy
  for (let i = 0; i < k; i++) fast = fast.next // fast a k nœuds d'avance
  while (fast.next !== null) {
    fast = fast.next
    slow = slow.next
  }
  // slow est juste AVANT le nœud à supprimer
  slow.next = slow.next.next
  return dummy.next
}`,
    solutionEquiv: {
      python: `def remove_nth_from_end(head, k):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(k):
        fast = fast.next
    while fast.next is not None:
        fast, slow = fast.next, slow.next
    slow.next = slow.next.next
    return dummy.next`,
      java: `static ListNode removeNthFromEnd(ListNode head, int k) {
    ListNode dummy = new ListNode(0, head);
    ListNode fast = dummy, slow = dummy;
    for (int i = 0; i < k; i++) fast = fast.next;
    while (fast.next != null) {
        fast = fast.next;
        slow = slow.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}`,
      php: `function removeNthFromEnd(?ListNode $head, int $k): ?ListNode {
    $dummy = new ListNode(0, $head);
    $fast = $dummy;
    $slow = $dummy;
    for ($i = 0; $i < $k; $i++) $fast = $fast->next;
    while ($fast->next !== null) {
        $fast = $fast->next;
        $slow = $slow->next;
    }
    $slow->next = $slow->next->next;
    return $dummy->next;
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `${LIST_HELPERS}
assertEqual(toArray(removeNthFromEnd(fromArray([1, 2, 3, 4, 5]), 2)), [1, 2, 3, 5])` },
      { name: 'supprimer le dernier', code: `${LIST_HELPERS}
assertEqual(toArray(removeNthFromEnd(fromArray([1, 2, 3]), 1)), [1, 2])` },
      { name: 'supprimer la tête', code: `${LIST_HELPERS}
assertEqual(toArray(removeNthFromEnd(fromArray([1, 2]), 2)), [2])
assertEqual(toArray(removeNthFromEnd(fromArray([7, 8, 9, 10]), 4)), [8, 9, 10])` },
      { name: 'liste à un seul nœud', code: `${LIST_HELPERS}
assertEqual(removeNthFromEnd(fromArray([1]), 1), null)` },
      { name: 'milieu d’une liste plus longue', code: `${LIST_HELPERS}
assertEqual(toArray(removeNthFromEnd(fromArray([10, 20, 30, 40, 50, 60]), 4)), [10, 20, 40, 50, 60])` },
    ],
    hints: [
      'Avec deux parcours, c’est facile : compter la longueur `L`, puis supprimer le nœud d’indice `L - k`. Peut-on le faire en un seul ?',
      'Donnez `k` pas d’avance à un pointeur `fast`, puis avancez `fast` et `slow` ensemble : l’écart reste de `k` nœuds.',
      'Partez d’une sentinelle placée devant la tête : `slow` s’arrête alors sur le nœud **précédent** celui à supprimer, même quand c’est la tête.',
    ],
    discussion: `**Complexité** : O(n) en temps, un seul parcours, O(1) en mémoire.

**Points à évoquer** :

- la version en deux passes (compter puis supprimer) est aussi en O(n) : l'avantage d'une seule passe est surtout de montrer la technique des pointeurs décalés, utile sur un flux ;
- la sentinelle évite le cas particulier « supprimer la tête » (\`k = longueur\`) ;
- pour supprimer un nœud, on a besoin de son **précédent** : d'où l'arrêt sur \`fast.next !== null\` plutôt que \`fast !== null\` ;
- si \`k\` peut dépasser la longueur, il faut tester \`fast === null\` pendant l'avance et décider du comportement (erreur ou liste inchangée).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-entree-cycle',
    title: 'Entrée d’un cycle (Floyd)',
    difficulty: 'moyen',
    theme: 'listes',
    pattern: 'slow/fast pointers (Floyd)',
    statement: `Écrivez \`detectCycle(head)\` qui renvoie le **nœud** où commence le cycle d'une liste chaînée, ou \`null\` si la liste n'a pas de cycle.

- les nœuds sont des objets \`{ val, next }\` ; dans une liste avec cycle, le \`next\` du « dernier » nœud pointe vers un nœud déjà rencontré ;
- les valeurs **ne sont pas uniques** : comparez des références (\`===\` sur les nœuds), pas des valeurs ;
- ne modifiez pas la liste ; visez O(1) en mémoire.

Exemples (\`pos\` est l'indice du nœud vers lequel repointe la queue, -1 si pas de cycle) :

- \`[3, 2, 0, -4]\`, \`pos = 1\` : renvoie le nœud de valeur \`2\` ;
- \`[1, 2]\`, \`pos = 0\` : renvoie la tête ;
- \`[1]\`, \`pos = -1\` : renvoie \`null\`.`,
    starter: `function detectCycle(head) {
  // TODO : lièvre et tortue, puis retour à la tête
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return slow // point de rencontre ≠ entrée du cycle !
  }
  return null
}`,
    solution: `function detectCycle(head) {
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) {
      // a = k·c − b : depuis la tête et depuis la rencontre, on arrive ensemble à l'entrée
      let p = head
      while (p !== slow) {
        p = p.next
        slow = slow.next
      }
      return p
    }
  }
  return null
}`,
    solutionEquiv: {
      python: `def detect_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None`,
      java: `static ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            ListNode p = head;
            while (p != slow) { p = p.next; slow = slow.next; }
            return p;
        }
    }
    return null;
}`,
      rust: `// Un cycle est impossible avec Option<Box<...>> (un nœud aurait deux propriétaires) :
// il faut Rc<RefCell<...>> et comparer les pointeurs avec Rc::ptr_eq.
use std::{cell::RefCell, rc::Rc};
type Link = Option<Rc<RefCell<Node>>>;
struct Node { val: i32, next: Link }

fn step(n: &Link) -> Link {
    n.as_ref().and_then(|x| x.borrow().next.clone())
}

fn detect_cycle(head: &Link) -> Link {
    let (mut slow, mut fast) = (head.clone(), head.clone());
    loop {
        fast = step(&step(&fast));
        slow = step(&slow);
        match (&slow, &fast) {
            (_, None) => return None,
            (Some(s), Some(f)) if Rc::ptr_eq(s, f) => break,
            _ => {}
        }
    }
    let mut p = head.clone();
    while !Rc::ptr_eq(p.as_ref().unwrap(), slow.as_ref().unwrap()) {
        p = step(&p);
        slow = step(&slow);
    }
    p
}`,
    },
    tests: [
      { name: 'exemple : cycle vers l’indice 1', code: `function build(values, pos) {
  const nodes = values.map((val) => ({ val, next: null }))
  for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1]
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos]
  return nodes
}
const nodes = build([3, 2, 0, -4], 1)
assert(detectCycle(nodes[0]) === nodes[1], 'doit renvoyer le nœud d’indice 1')` },
      { name: 'cycle vers la tête', code: `const a = { val: 1, next: null }
const b = { val: 2, next: a }
a.next = b
assert(detectCycle(a) === a)` },
      { name: 'nœud unique qui pointe sur lui-même', code: `const a = { val: 1, next: null }
a.next = a
assert(detectCycle(a) === a)` },
      { name: 'pas de cycle', code: `assertEqual(detectCycle({ val: 1, next: null }), null)
assertEqual(detectCycle({ val: 1, next: { val: 2, next: { val: 3, next: null } } }), null)
assertEqual(detectCycle(null), null)` },
      { name: 'valeurs identiques : comparer des références', code: `const nodes = Array.from({ length: 8 }, () => ({ val: 7, next: null }))
for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1]
nodes[7].next = nodes[3]
assert(detectCycle(nodes[0]) === nodes[3], 'doit renvoyer le nœud d’indice 3')` },
      { name: 'long préfixe, petit cycle', code: `const nodes = Array.from({ length: 1000 }, (_, i) => ({ val: i, next: null }))
for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1]
nodes[999].next = nodes[995]
assert(detectCycle(nodes[0]) === nodes[995], 'doit renvoyer le nœud d’indice 995')` },
    ],
    hints: [
      'Avec un `Set` des nœuds visités, le premier nœud revu est l’entrée : c’est correct, mais O(n) en mémoire.',
      'En O(1) : `slow` avance d’un pas, `fast` de deux. S’ils se rencontrent, il y a un cycle ; mais le point de rencontre n’est pas forcément l’entrée.',
      'Après la rencontre, replacez un pointeur sur la tête et avancez les deux d’un pas à la fois : ils se rejoignent à l’entrée du cycle.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Pourquoi ça marche** : soit \`a\` la distance tête → entrée, \`b\` entrée → rencontre, \`c\` la longueur du cycle. À la rencontre, \`fast\` a parcouru deux fois la distance de \`slow\` : \`2(a + b) = a + b + k·c\`, donc \`a = k·c − b\`. Un pointeur parti de la tête et un autre parti du point de rencontre se retrouvent donc à l'entrée après \`a\` pas.

**Points à évoquer** :

- la version avec \`Set\` est acceptable si la mémoire n'est pas contrainte, et plus simple à justifier ;
- la condition \`fast !== null && fast.next !== null\` est indispensable : \`fast\` saute deux nœuds ;
- longueur du cycle : après la rencontre, faire un tour complet avec un pointeur en comptant ;
- le même raisonnement résout « trouver le doublon dans un tableau de n + 1 entiers entre 1 et n » (on voit \`i → nums[i]\` comme une liste chaînée).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-lru-cache',
    title: 'Cache LRU en O(1)',
    difficulty: 'difficile',
    theme: 'listes',
    pattern: 'Map + liste doublement chaînée',
    statement: `Implémentez une classe \`LRUCache\` :

- \`new LRUCache(capacity)\` crée un cache vide pouvant contenir \`capacity\` clés (\`capacity >= 1\`) ;
- \`get(key)\` renvoie la valeur associée à \`key\`, ou \`-1\` si elle est absente ; une lecture réussie rend la clé **la plus récemment utilisée** ;
- \`put(key, value)\` insère ou met à jour la clé, qui devient la plus récemment utilisée ; si le cache dépasse alors sa capacité, il évince la clé **la moins récemment utilisée** ;
- \`get\` et \`put\` doivent être en **O(1)** (un test fait 200 000 opérations sur un cache de 50 000 clés).

Les clés sont des nombres ou des chaînes, les valeurs des nombres.

Exemple, avec \`capacity = 2\` : \`put(1, 1)\`, \`put(2, 2)\`, \`get(1)\` donne \`1\`, \`put(3, 3)\` évince la clé \`2\`, \`get(2)\` donne \`-1\`, \`put(4, 4)\` évince la clé \`1\`, \`get(1)\` donne \`-1\`, \`get(3)\` donne \`3\`, \`get(4)\` donne \`4\`.`,
    starter: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    // TODO : une Map clé → nœud et une liste doublement chaînée (ou l'ordre d'insertion d'une Map)
  }
  get(key) {
    // TODO
    return -1
  }
  put(key, value) {
    // TODO
  }
}`,
    solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map() // clé → nœud
    // deux sentinelles : head.next est le plus ancien, tail.prev le plus récent
    this.head = { prev: null, next: null }
    this.tail = { prev: this.head, next: null }
    this.head.next = this.tail
  }
  unlink(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }
  pushBack(node) {
    node.prev = this.tail.prev
    node.next = this.tail
    this.tail.prev.next = node
    this.tail.prev = node
  }
  get(key) {
    const node = this.map.get(key)
    if (node === undefined) return -1
    this.unlink(node)
    this.pushBack(node)
    return node.value
  }
  put(key, value) {
    let node = this.map.get(key)
    if (node !== undefined) {
      node.value = value
      this.unlink(node)
    } else {
      if (this.map.size === this.capacity) {
        const oldest = this.head.next
        this.unlink(oldest)
        this.map.delete(oldest.key)
      }
      node = { key, value, prev: null, next: null }
      this.map.set(key, node)
    }
    this.pushBack(node)
  }
}`,
    solutionEquiv: {
      python: `class Node:
    __slots__ = ("key", "value", "prev", "next")
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_back(self, node):
        node.prev, node.next = self.tail.prev, self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)
        self._push_back(node)
        return node.value

    def put(self, key, value):
        node = self.map.get(key)
        if node is not None:
            node.value = value
            self._unlink(node)
        else:
            if len(self.map) == self.capacity:
                oldest = self.head.next
                self._unlink(oldest)
                del self.map[oldest.key]
            node = Node(key, value)
            self.map[key] = node
        self._push_back(node)`,
      java: `class LRUCache {
    private static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) { this.key = key; this.value = value; }
    }
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);

    LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }
    private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void pushBack(Node n) {
        n.prev = tail.prev; n.next = tail;
        tail.prev.next = n; tail.prev = n;
    }
    int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        unlink(n); pushBack(n);
        return n.value;
    }
    void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) {
            n.value = value;
            unlink(n);
        } else {
            if (map.size() == capacity) {
                Node oldest = head.next;
                unlink(oldest);
                map.remove(oldest.key);
            }
            n = new Node(key, value);
            map.put(key, n);
        }
        pushBack(n);
    }
}`,
      rust: `// Une liste doublement chaînée « à la main » en Rust demande Rc<RefCell<...>> et Weak :
// en pratique on simule les pointeurs par des indices dans un Vec (arène).
use std::collections::HashMap;

struct Node { key: i32, value: i32, prev: usize, next: usize }

struct LRUCache { capacity: usize, map: HashMap<i32, usize>, nodes: Vec<Node> }

const HEAD: usize = 0;
const TAIL: usize = 1;

impl LRUCache {
    fn new(capacity: usize) -> Self {
        let nodes = vec![
            Node { key: 0, value: 0, prev: HEAD, next: TAIL },
            Node { key: 0, value: 0, prev: HEAD, next: TAIL },
        ];
        LRUCache { capacity, map: HashMap::new(), nodes }
    }
    fn unlink(&mut self, i: usize) {
        let (p, n) = (self.nodes[i].prev, self.nodes[i].next);
        self.nodes[p].next = n;
        self.nodes[n].prev = p;
    }
    fn push_back(&mut self, i: usize) {
        let last = self.nodes[TAIL].prev;
        self.nodes[i].prev = last;
        self.nodes[i].next = TAIL;
        self.nodes[last].next = i;
        self.nodes[TAIL].prev = i;
    }
    fn get(&mut self, key: i32) -> i32 {
        match self.map.get(&key).copied() {
            None => -1,
            Some(i) => { self.unlink(i); self.push_back(i); self.nodes[i].value }
        }
    }
    fn put(&mut self, key: i32, value: i32) {
        if let Some(&i) = self.map.get(&key) {
            self.nodes[i].value = value;
            self.unlink(i);
            self.push_back(i);
            return;
        }
        let i = if self.map.len() == self.capacity {
            let oldest = self.nodes[HEAD].next; // on recycle la case du plus ancien
            self.unlink(oldest);
            self.map.remove(&self.nodes[oldest].key);
            self.nodes[oldest].key = key;
            self.nodes[oldest].value = value;
            oldest
        } else {
            self.nodes.push(Node { key, value, prev: HEAD, next: TAIL });
            self.nodes.len() - 1
        };
        self.map.insert(key, i);
        self.push_back(i);
    }
}`,
      php: `// Un tableau PHP est ordonné par insertion : unset puis réaffectation replace la clé à la fin.
class LRUCache {
    private int $capacity;
    private array $data = [];

    public function __construct(int $capacity) { $this->capacity = $capacity; }

    public function get($key): int {
        if (!array_key_exists($key, $this->data)) return -1;
        $value = $this->data[$key];
        unset($this->data[$key]);
        $this->data[$key] = $value;
        return $value;
    }

    public function put($key, int $value): void {
        unset($this->data[$key]);
        $this->data[$key] = $value;
        if (count($this->data) > $this->capacity) {
            unset($this->data[array_key_first($this->data)]);
        }
    }
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `const c = new LRUCache(2)
c.put(1, 1)
c.put(2, 2)
assertEqual(c.get(1), 1)
c.put(3, 3)
assertEqual(c.get(2), -1, 'la clé 2 devait être évincée')
c.put(4, 4)
assertEqual(c.get(1), -1, 'la clé 1 devait être évincée')
assertEqual(c.get(3), 3)
assertEqual(c.get(4), 4)` },
      { name: 'mise à jour d’une clé existante', code: `const c = new LRUCache(2)
c.put('a', 1)
c.put('b', 2)
c.put('a', 10) // a devient la plus récente
c.put('c', 3) // on évince b
assertEqual(c.get('a'), 10)
assertEqual(c.get('b'), -1)
assertEqual(c.get('c'), 3)` },
      { name: 'capacité 1', code: `const c = new LRUCache(1)
c.put(1, 1)
c.put(2, 2)
assertEqual(c.get(1), -1)
assertEqual(c.get(2), 2)
c.put(2, 5)
assertEqual(c.get(2), 5)` },
      { name: 'get absent sur cache vide, et get qui rafraîchit', code: `const c = new LRUCache(3)
assertEqual(c.get(99), -1)
c.put(1, 1)
c.put(2, 2)
c.put(3, 3)
c.get(1) // ordre du plus ancien au plus récent : 2, 3, 1
c.put(4, 4) // évince 2
assertEqual(c.get(2), -1)
c.put(5, 5) // évince 3
assertEqual(c.get(3), -1)
assertEqual([c.get(1), c.get(4), c.get(5)], [1, 4, 5])` },
      { name: 'valeur 0 conservée', code: `const c = new LRUCache(2)
c.put(1, 0)
assertEqual(c.get(1), 0)` },
      { name: 'grande entrée (200 000 opérations)', code: `const c = new LRUCache(50000)
const t0 = performance.now()
let hits = 0
for (let i = 0; i < 100000; i++) c.put(i, i)
for (let i = 0; i < 100000; i++) if (c.get(i) !== -1) hits++
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assertEqual(hits, 50000)` },
    ],
    hints: [
      'Une `Map` donne l’accès en O(1) à une clé ; il reste à savoir en O(1) quelle est la clé la moins récemment utilisée.',
      'Ordonnez les entrées dans une liste doublement chaînée (de la plus ancienne à la plus récente) : la `Map` pointe vers les nœuds, et avec `prev` et `next` on détache un nœud en O(1).',
      'Deux sentinelles (tête et queue) suppriment tous les cas particuliers. Raccourci JS : une `Map` itère dans l’ordre d’insertion, donc `delete` + `set` rafraîchit une clé et `map.keys().next().value` donne la plus ancienne.',
    ],
    discussion: `**Complexité** : O(1) par opération (en moyenne, à cause du hachage), O(capacité) en mémoire.

**Points à évoquer** :

- la liste doit être **doublement** chaînée : pour détacher un nœud en O(1) il faut connaître son précédent ;
- le nœud stocke sa **clé** : sinon, au moment d'évincer le plus ancien, on ne saurait pas quelle entrée retirer de la \`Map\` ;
- la version qui s'appuie sur l'ordre d'insertion de \`Map\` est correcte et idiomatique en JavaScript (comme \`OrderedDict\` en Python et \`LinkedHashMap\` en Java) : la citer, puis montrer qu'on sait l'implémenter sans ;
- une version avec un tableau et \`indexOf\`/\`splice\` est en O(capacité) par opération : elle échoue au test de grande entrée ;
- variantes : LFU (Least Frequently Used, une liste par fréquence), TTL (expiration), cache concurrent (verrous), cache distribué.`,
  },
)

quiz.push(
  {
    id: 'hi-q-listes-sentinelle',
    theme: 'listes',
    kind: 'qcm',
    q: "À quoi sert un nœud sentinelle (dummy) placé devant la tête d'une liste ?",
    choices: [
      "À traiter la tête comme un nœud ordinaire, qui a un précédent, quand elle peut être supprimée ou remplacée",
      "À accélérer l'accès au k-ième élément",
      "À détecter les cycles sans mémoire supplémentaire",
      "À rendre la liste doublement chaînée",
    ],
    answer: 0,
    why: "La sentinelle donne un précédent au premier vrai nœud : suppression, insertion ou fusion en tête deviennent le cas général, et l'on renvoie `dummy.next` à la fin. Elle ne change rien à la complexité de l'accès par indice.",
  },
  {
    id: 'hi-q-listes-milieu',
    theme: 'listes',
    kind: 'output',
    q: "Qu'affiche ce code ?",
    code: `function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function middle(head) {
  let slow = head
  let fast = head.next
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow.val
}
console.log(middle(fromArray([1, 2, 3, 4])), middle(fromArray([1, 2, 3, 4, 5])))`,
    choices: ['2 3', '3 3', '2 2', '3 4'],
    answer: 0,
    why: "En partant avec `fast = head.next`, le pointeur lent s'arrête sur le **premier** des deux milieux quand la longueur est paire (2 pour `[1, 2, 3, 4]`) ; pour une longueur impaire, le milieu reste le même (3). Avec `fast = head`, on obtiendrait le second milieu, 3. Le premier milieu est celui qu'il faut pour couper une liste en deux dans un tri fusion.",
  },
  {
    id: 'hi-q-listes-map-ordre',
    theme: 'listes',
    kind: 'output',
    q: "Qu'affiche ce code ?",
    code: `const m = new Map([['a', 1], ['b', 2], ['c', 3]])
m.set('a', 10)
const v = m.get('b')
m.delete('b')
m.set('b', v)
console.log([...m.keys()].join(''))`,
    choices: ['acb', 'bca', 'abc', 'cab'],
    answer: 0,
    why: "Mettre à jour une clé existante avec `set` **ne change pas** sa place dans l'ordre d'itération : `a` reste en tête. Seul `delete` suivi de `set` replace une clé à la fin. C'est la nuance qui compte pour écrire un LRU avec une `Map` : il faut supprimer puis réinsérer.",
  },
  {
    id: 'hi-q-listes-get-index',
    theme: 'listes',
    kind: 'complexite',
    q: "Quelle est la complexité en temps de `sumList` pour une liste de n nœuds ?",
    code: `function getAt(head, i) {
  let node = head
  for (let k = 0; k < i; k++) node = node.next
  return node.val
}
function length(head) {
  let n = 0
  for (let node = head; node; node = node.next) n++
  return n
}
function sumList(head) {
  let total = 0
  const n = length(head)
  for (let i = 0; i < n; i++) total += getAt(head, i)
  return total
}
let head = null
for (let i = 0; i < 100; i++) head = { val: i, next: head }
sumList(head)`,
    choices: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'],
    answer: 0,
    why: "`getAt(head, i)` marche `i` pas depuis la tête : la boucle coûte 0 + 1 + … + (n − 1) = n(n − 1)/2 pas, soit O(n²). Une liste ne s'utilise pas comme un tableau : on la parcourt une seule fois avec un pointeur, en O(n).",
  },
  {
    id: 'hi-q-listes-floyd',
    theme: 'listes',
    kind: 'complexite',
    q: "Quelles sont les complexités en temps et en mémoire de `hasCycle` (n = nombre de nœuds) ?",
    code: `function hasCycle(head) {
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
const a = { val: 1, next: null }
const b = { val: 2, next: { val: 3, next: a } }
a.next = b
hasCycle(a)`,
    choices: ['O(n) en temps, O(1) en mémoire', 'O(n) en temps, O(n) en mémoire', 'O(n²) en temps, O(1) en mémoire', 'O(n log n) en temps, O(1) en mémoire'],
    answer: 0,
    why: "Sans cycle, `fast` atteint la fin en n/2 tours. Avec un cycle, une fois les deux pointeurs dedans, l'écart se réduit d'un nœud par tour : la rencontre a lieu en moins d'un tour de cycle. Total O(n), avec deux pointeurs seulement. La version avec un `Set` serait O(n) en mémoire.",
  },
  {
    id: 'hi-q-listes-bug-inversion',
    theme: 'listes',
    kind: 'bug',
    q: "Cette inversion renvoie une liste d'un seul nœud. Quel est le bug ?",
    code: `function reverseList(head) {
  let prev = null
  let curr = head
  while (curr !== null) {
    curr.next = prev
    prev = curr
    curr = curr.next
  }
  return prev
}
reverseList({ val: 1, next: { val: 2, next: { val: 3, next: null } } })`,
    choices: [
      "`curr.next` est écrasé avant d'avoir été sauvegardé : `curr = curr.next` revient à `curr = prev`",
      "Il faut renvoyer `curr` et non `prev`",
      "`prev` doit être initialisé à `head`",
      "La condition doit être `curr.next !== null`",
    ],
    answer: 0,
    why: "Après `curr.next = prev` puis `prev = curr`, l'expression `curr.next` vaut le nœud courant lui-même : on ne fait qu'un tour utile et le reste de la liste est perdu. Il faut d'abord sauvegarder `const next = curr.next`, puis avancer avec `curr = next`.",
  },
  {
    id: 'hi-q-listes-bug-suppression',
    theme: 'listes',
    kind: 'bug',
    q: "Cette fonction doit supprimer tous les nœuds de valeur `target`. Pour quelle entrée échoue-t-elle ?",
    code: `function removeAll(head, target) {
  let node = head
  while (node !== null && node.next !== null) {
    if (node.next.val === target) node.next = node.next.next
    else node = node.next
  }
  return head
}
removeAll({ val: 1, next: { val: 2, next: null } }, 2)`,
    choices: [
      "Quand la tête elle-même vaut `target` : elle n'est jamais examinée",
      "Quand deux nœuds consécutifs valent `target`",
      "Quand le dernier nœud vaut `target`",
      "Quand la liste est vide",
    ],
    answer: 0,
    why: "La boucle ne regarde que `node.next` : la tête n'est jamais testée, et `removeAll([2, 1], 2)` renvoie `[2, 1]`. Les autres cas fonctionnent (on n'avance pas après une suppression, et `node !== null` gère la liste vide). Le correctif idiomatique est un nœud sentinelle placé devant la tête, et `return dummy.next`.",
  },
  {
    id: 'hi-q-listes-lru-double',
    theme: 'listes',
    kind: 'qcm',
    q: "Dans un cache LRU « Map + liste », pourquoi la liste doit-elle être doublement chaînée ?",
    choices: [
      "Pour détacher en O(1) un nœud trouvé via la Map, ce qui exige de connaître son précédent",
      "Pour pouvoir parcourir le cache dans les deux sens lors de l'affichage",
      "Parce qu'une liste simplement chaînée ne peut pas avoir de queue",
      "Pour économiser de la mémoire",
    ],
    answer: 0,
    why: "Lors d'un `get`, la `Map` donne directement le nœud, qu'il faut déplacer en fin de liste. Le détacher revient à modifier le `next` de son précédent : sans pointeur `prev`, il faudrait parcourir la liste, en O(n). La double chaîne coûte au contraire un pointeur de plus par nœud.",
  },
)

pieges.push(
  {
    id: 'hi-p-listes-tete-perdue',
    title: 'Supprimer la tête sans sentinelle',
    theme: 'listes',
    question: "On veut retirer tous les 0. Qu'affiche ce code ?",
    code: `function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function toArray(h) { const out = []; for (; h; h = h.next) out.push(h.val); return out }

function removeZeros(head) {
  let prev = null
  for (let node = head; node !== null; node = node.next) {
    if (node.val === 0) {
      if (prev !== null) prev.next = node.next
    } else {
      prev = node
    }
  }
  return head
}
console.log(toArray(removeZeros(fromArray([0, 0, 1, 0, 2]))))`,
    output: `[ 0, 0, 1, 2 ]`,
    explanation: "Les zéros du milieu disparaissent bien, mais pas ceux de **tête** : quand `prev` vaut `null`, on « supprime » sans rien modifier, et l'on renvoie l'ancienne `head`, qui est elle-même un zéro. Il faudrait mettre à jour la tête à part… ou, beaucoup plus simple, placer un nœud sentinelle devant et renvoyer `dummy.next`.",
    fix: {
      code: `function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }
function toArray(h) { const out = []; for (; h; h = h.next) out.push(h.val); return out }

function removeZeros(head) {
  const dummy = { val: null, next: head }
  let prev = dummy
  while (prev.next !== null) {
    if (prev.next.val === 0) prev.next = prev.next.next
    else prev = prev.next
  }
  return dummy.next
}
console.log(toArray(removeZeros(fromArray([0, 0, 1, 0, 2]))))`,
      output: `[ 1, 2 ]`,
    },
  },
  {
    id: 'hi-p-listes-fast-null',
    title: '`while (fast.next)` sans tester `fast`',
    theme: 'listes',
    question: "Qu'affiche ce code, sur une liste de longueur paire ?",
    code: `function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }

function middle(head) {
  let slow = head
  let fast = head
  while (fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow.val
}
console.log(middle(fromArray([1, 2, 3])))
console.log(middle(fromArray([1, 2, 3, 4])))`,
    output: `2
Uncaught TypeError: Cannot read properties of null (reading 'next')`,
    explanation: "Avec une longueur impaire, `fast` s'arrête pile sur le dernier nœud. Avec une longueur paire, `fast.next.next` vaut `null`, et le test suivant `fast.next` lit une propriété de `null`. Le pointeur rapide fait **deux** sauts : il faut vérifier que les deux existent, `fast !== null && fast.next !== null`, dans cet ordre (le `&&` court-circuite).",
    fix: {
      code: `function fromArray(a) { let h = null; for (let i = a.length - 1; i >= 0; i--) h = { val: a[i], next: h }; return h }

function middle(head) {
  let slow = head
  let fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow.val
}
console.log(middle(fromArray([1, 2, 3])))
console.log(middle(fromArray([1, 2, 3, 4])))`,
      output: `2
3`,
    },
  },
  {
    id: 'hi-p-listes-recursion-longue',
    title: 'Récursion sur une longue liste',
    theme: 'listes',
    question: "Qu'affiche ce code ?",
    code: `function length(head) {
  return head === null ? 0 : 1 + length(head.next)
}
let head = null
for (let i = 0; i < 100000; i++) head = { val: i, next: head }
console.log(length({ val: 0, next: { val: 1, next: null } }))
console.log(length(head))`,
    output: `2
Uncaught RangeError: Maximum call stack size exceeded`,
    explanation: "Une récursion sur une liste empile une frame par nœud. La pile de V8 tient de l'ordre de dix mille appels de ce genre (la limite exacte dépend de la taille des frames) : 100 000 nœuds la font déborder. JavaScript n'optimise pas les appels terminaux en pratique (seul Safari le fait), et cet appel n'est même pas terminal (`1 + …` reste à calculer). Sur une liste, préférez une boucle.",
    fix: {
      code: `function length(head) {
  let n = 0
  for (let node = head; node !== null; node = node.next) n++
  return n
}
let head = null
for (let i = 0; i < 100000; i++) head = { val: i, next: head }
console.log(length(head))`,
      output: `100000`,
    },
  },
)

flashcards.push(
  {
    id: 'hi-f-listes-inversion',
    theme: 'listes',
    front: "Inverser une liste simplement chaînée : le geste et sa complexité ?",
    back: "Trois pointeurs. À chaque tour : sauvegarder `next = curr.next`, retourner `curr.next = prev`, avancer `prev = curr` puis `curr = next`. Renvoyer `prev`. O(n) en temps, O(1) en mémoire.",
    code: `function reverseList(head) {
  let prev = null
  let curr = head
  while (curr !== null) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
reverseList({ val: 1, next: { val: 2, next: null } }).val // → 2`,
  },
  {
    id: 'hi-f-listes-sentinelle',
    theme: 'listes',
    front: "Quand utiliser un nœud sentinelle (dummy) ?",
    back: "Dès que la tête peut changer : suppression (y compris de la tête), fusion, insertion en tête, partition. On crée `dummy = { next: head }`, on travaille avec un pointeur sur le **précédent**, et l'on renvoie `dummy.next`.",
  },
  {
    id: 'hi-f-listes-milieu',
    theme: 'listes',
    front: "Trouver le milieu d'une liste en un seul parcours ?",
    back: "`slow` avance d'un nœud, `fast` de deux, tant que `fast !== null && fast.next !== null`. À la fin, `slow` est au milieu (le second des deux si la longueur est paire ; partir de `fast = head.next` donne le premier).",
  },
  {
    id: 'hi-f-listes-floyd',
    theme: 'listes',
    front: "Détecter un cycle et trouver son entrée en O(1) mémoire ?",
    back: "Floyd : lent +1, rapide +2. S'ils se rencontrent, il y a un cycle. Puis un pointeur repart de la tête, l'autre reste au point de rencontre ; en avançant d'un pas chacun, ils se retrouvent à l'entrée (car `a = k·c − b`).",
  },
  {
    id: 'hi-f-listes-kieme-fin',
    theme: 'listes',
    front: "Atteindre le k-ième nœud depuis la fin en un parcours ?",
    back: "Donner `k` pas d'avance à `fast`, puis avancer `fast` et `slow` ensemble jusqu'à ce que `fast` soit `null` : `slow` est le k-ième depuis la fin. Pour le **supprimer**, partir d'une sentinelle et s'arrêter quand `fast.next === null` : `slow` est alors son précédent.",
  },
  {
    id: 'hi-f-listes-fusion',
    theme: 'listes',
    front: "Fusionner deux listes triées : technique et complexité ?",
    back: "Sentinelle + pointeur `tail`. On accroche le plus petit des deux nœuds de tête, on avance dans sa liste ; quand l'une est vide, on accroche l'autre en bloc. O(n + m) en temps, O(1) en mémoire (aucun nœud créé).",
  },
  {
    id: 'hi-f-listes-lru',
    theme: 'listes',
    front: "Cache LRU avec `get`/`put` en O(1) : quelles structures ?",
    back: "Une `Map` clé → nœud et une liste **doublement** chaînée ordonnée du plus ancien au plus récent (deux sentinelles). `get` : détacher et remettre en queue. `put` : idem, et si plein, évincer `head.next` (en le retirant aussi de la `Map`, d'où la clé stockée dans le nœud).",
  },
  {
    id: 'hi-f-listes-map-ordre',
    theme: 'listes',
    front: "Quel raccourci JavaScript permet un LRU sans liste ?",
    back: "Une `Map` itère dans l'ordre d'insertion. `delete(k)` puis `set(k, v)` replace la clé à la fin ; `map.keys().next().value` est la plus ancienne. Attention : un simple `set` sur une clé existante ne la déplace pas.",
    code: `const m = new Map([[1, 'a'], [2, 'b']])
m.delete(1)
m.set(1, 'a')
m.keys().next().value // → 2`,
  },
)

lexique.push(
  {
    term: 'Liste chaînée',
    theme: 'listes',
    def: "Suite de nœuds où chaque nœud contient une valeur et une référence vers le suivant (`{ val, next }`), le dernier pointant vers `null`. Insertion et suppression en O(1) quand on tient le nœud précédent, accès au i-ème élément en O(i).",
    see: ['Nœud sentinelle', 'Liste doublement chaînée'],
  },
  {
    term: 'Nœud sentinelle',
    theme: 'listes',
    def: "Faux nœud (dummy) placé devant la tête, ou aux deux extrémités d'une liste doublement chaînée, pour que chaque vrai nœud ait un précédent et un suivant. Supprime les cas particuliers de la tête et de la liste vide ; on renvoie `dummy.next`.",
    see: ['Liste chaînée'],
  },
  {
    term: 'Liste doublement chaînée',
    theme: 'listes',
    def: "Liste dont chaque nœud connaît son suivant **et** son précédent (`prev`). Elle permet de détacher un nœud connu en O(1), au prix d'un pointeur de plus par nœud. Base du cache LRU et d'une deque.",
    see: ['Cache LRU', 'Liste chaînée'],
  },
  {
    term: 'Algorithme de Floyd (lièvre et tortue)',
    theme: 'listes',
    def: "Détection de cycle avec deux pointeurs, l'un avançant d'un pas et l'autre de deux : ils se rencontrent si et seulement si la liste boucle. En repartant de la tête après la rencontre, on trouve l'entrée du cycle. O(n) en temps, O(1) en mémoire.",
    see: ['Pointeurs lent et rapide'],
  },
  {
    term: 'Pointeurs lent et rapide',
    theme: 'listes',
    def: "Technique où deux pointeurs parcourent une liste à des vitesses différentes (1 et 2) ou avec un décalage fixe (k nœuds d'avance). Donne le milieu, la détection de cycle ou le k-ième nœud depuis la fin en un seul parcours, sans mémoire supplémentaire.",
    see: ['Algorithme de Floyd (lièvre et tortue)'],
  },
  {
    term: 'Cache LRU',
    theme: 'listes',
    def: "Cache de capacité fixe qui évince l'entrée la moins récemment utilisée (Least Recently Used). Implémentation en O(1) : `Map` clé → nœud + liste doublement chaînée ordonnée par récence ; en JavaScript, l'ordre d'insertion d'une `Map` offre un raccourci.",
    see: ['Liste doublement chaînée'],
  },
)

entretien.push(
  {
    id: 'hi-e-listes-tableau-vs-liste',
    section: 'structures',
    q: "Tableau ou liste chaînée : quand une liste chaînée est-elle vraiment préférable ?",
    answer: `Une liste chaînée gagne quand on **insère ou supprime souvent au milieu ou aux extrémités en tenant déjà le nœud concerné** : l'opération est en O(1), sans décalage. C'est le cas d'un cache LRU (on détache un nœud trouvé par une \`Map\`), d'une file implémentée à la main, de l'ordonnanceur d'un noyau, ou d'une structure qu'on découpe et recolle (tri fusion de listes).

Le tableau gagne presque partout ailleurs :

- accès par indice en O(1) (dichotomie, tri en place) ;
- mémoire contiguë, bien plus efficace pour le cache du processeur : en pratique, parcourir un tableau est souvent plusieurs fois plus rapide que parcourir une liste de même taille ;
- pas de pointeur supplémentaire par élément.

En JavaScript, on n'écrit presque jamais de liste chaînée en production : \`Array\` et \`Map\` suffisent. La liste reste un sujet d'entretien car elle teste la manipulation rigoureuse de références.`,
    attendu: "Connaître les complexités des deux structures, citer la localité mémoire et donner un cas d'usage concret (LRU) plutôt qu'une réponse théorique.",
  },
  {
    id: 'hi-e-listes-lru',
    section: 'conception',
    q: "Concevez un cache LRU avec `get` et `put` en O(1). Comment le faire évoluer ?",
    answer: `**Structure** : une \`Map\` clé → nœud et une liste doublement chaînée avec deux sentinelles, ordonnée du plus ancien au plus récent.

- \`get(key)\` : chercher le nœud dans la \`Map\` ; absent, renvoyer -1 ; présent, le détacher et le remettre juste avant la sentinelle de queue ;
- \`put(key, value)\` : si la clé existe, mettre à jour et déplacer en queue ; sinon, si le cache est plein, retirer \`head.next\` de la liste **et** de la \`Map\` (d'où la clé stockée dans le nœud), puis insérer le nouveau nœud en queue.

En JavaScript, on peut s'appuyer sur l'ordre d'insertion de \`Map\` (\`delete\` puis \`set\`, première clé = la plus ancienne) ; il faut savoir expliquer pourquoi c'est équivalent.

**Évolutions** à discuter : expiration (TTL, vérifiée paresseusement à la lecture), éviction par taille en octets plutôt qu'en nombre d'entrées, politique LFU, accès concurrents (verrou, ou découpage en segments indépendants), cache distribué (hachage cohérent pour répartir les clés).`,
    attendu: "Justifier chaque O(1) (Map pour trouver, double chaînage pour détacher), penser à stocker la clé dans le nœud, et savoir élargir vers des contraintes réelles.",
  },
  {
    id: 'hi-e-listes-cycle',
    section: 'techniques',
    q: "Comment détecter un cycle dans une liste chaînée ? Et si l'on veut l'entrée du cycle ?",
    answer: `**Version simple** : parcourir la liste en mémorisant les nœuds vus dans un \`Set\` ; le premier nœud déjà présent est l'entrée du cycle. O(n) en temps et en mémoire.

**Version O(1) en mémoire (Floyd)** : un pointeur lent avance d'un pas, un rapide de deux. Sans cycle, le rapide atteint \`null\`. Avec un cycle, il rattrape le lent. Pour l'entrée : on replace un pointeur sur la tête et on avance les deux d'un pas ; ils se rejoignent à l'entrée, car si \`a\` est la distance jusqu'à l'entrée, \`b\` celle de l'entrée à la rencontre et \`c\` la longueur du cycle, on a \`a = k·c − b\`.

Points d'attention : comparer des **références** (\`===\` sur les nœuds), pas des valeurs, et tester \`fast !== null && fast.next !== null\`.`,
    attendu: "Proposer d'abord la solution simple, puis l'optimisation mémoire avec une justification de l'entrée du cycle.",
  },
)

// =============================================================================
// ARBRES, BST, TRIE
// =============================================================================

/** Construction d'un arbre depuis le format LeetCode (niveau par niveau, null = absent), pour les tests. */
const TREE_HELPERS = `function fromLevel(values) {
  if (values.length === 0 || values[0] === null) return null
  const root = { val: values[0], left: null, right: null }
  const queue = [root]
  let head = 0
  let i = 1
  while (i < values.length && head < queue.length) {
    const node = queue[head++]
    if (i < values.length && values[i] !== null) {
      node.left = { val: values[i], left: null, right: null }
      queue.push(node.left)
    }
    i++
    if (i < values.length && values[i] !== null) {
      node.right = { val: values[i], left: null, right: null }
      queue.push(node.right)
    }
    i++
  }
  return root
}`

/** Même fonction, compacte, pour les exemples du cours. */
const FROM_LEVEL_SHORT = `function fromLevel(a) {
  if (!a.length || a[0] === null) return null
  const root = { val: a[0], left: null, right: null }
  const q = [root]
  for (let h = 0, i = 1; i < a.length; h++) {
    const n = q[h]
    if (a[i] !== null && i < a.length) q.push(n.left = { val: a[i], left: null, right: null })
    i++
    if (a[i] !== null && i < a.length) q.push(n.right = { val: a[i], left: null, right: null })
    i++
  }
  return root
}`

cours.push({
  id: 'arbres',
  title: 'Arbres, BST, trie',
  summary:
    "Un arbre se traite presque toujours récursivement : chaque nœud combine ce que lui remontent ses deux sous-arbres ; il faut savoir parcourir en profondeur (préfixe, infixe, suffixe, récursif ou avec une pile) et en largeur (file, niveau par niveau), exploiter l'ordre d'un BST et reconnaître un trie.",
  blocks: [
    { h: 'Le nœud et le format LeetCode', id: 'arbres-noeud' },
    {
      p: "Un arbre binaire est fait de nœuds `{ val, left, right }`, où `left` et `right` valent `null` en l'absence d'enfant. Le nœud sans parent est la **racine**, les nœuds sans enfant sont les **feuilles**. La **profondeur** d'un nœud est sa distance à la racine ; la **hauteur** d'un arbre est la profondeur de sa feuille la plus basse (on compte ici en nombre de nœuds : l'arbre vide a une hauteur 0, une feuille seule 1).",
    },
    {
      p: "LeetCode décrit un arbre par un tableau **niveau par niveau**, de gauche à droite, avec `null` pour un enfant absent ; les enfants d'un nœud absent ne sont pas listés. Ainsi `[3, 9, 20, null, null, 15, 7]` désigne la racine 3, ses enfants 9 et 20, puis (9 n'ayant pas d'enfant) 15 et 7 sous 20. On le reconstruit avec une file : chaque nœud retiré de la file consomme les deux valeurs suivantes du tableau.",
    },
    {
      title: 'Construire un arbre depuis un tableau niveau par niveau',
      code: `function fromLevel(values) {
  if (values.length === 0 || values[0] === null) return null
  const root = { val: values[0], left: null, right: null }
  const queue = [root]
  let head = 0 // indice de lecture dans la file (shift() serait en O(n))
  let i = 1
  while (i < values.length) {
    const node = queue[head++]
    if (values[i] !== null) { // !== null et pas un test de vérité : 0 est une valeur valide
      node.left = { val: values[i], left: null, right: null }
      queue.push(node.left)
    }
    i++
    if (i < values.length && values[i] !== null) {
      node.right = { val: values[i], left: null, right: null }
      queue.push(node.right)
    }
    i++
  }
  return root
}

const root = fromLevel([3, 9, 20, null, null, 15, 7])
console.log(root.val, root.left.val, root.right.val, root.right.left.val, root.left.left)`,
      output: `3 9 20 15 null`,
      equiv: {
        python: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def from_level(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while i < len(values):
        node = queue.popleft()
        if values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root`,
        java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

static TreeNode fromLevel(Integer[] values) {
    if (values.length == 0 || values[0] == null) return null;
    TreeNode root = new TreeNode(values[0]);
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    int i = 1;
    while (i < values.length) {
        TreeNode node = queue.poll();
        if (values[i] != null) { node.left = new TreeNode(values[i]); queue.add(node.left); }
        i++;
        if (i < values.length && values[i] != null) { node.right = new TreeNode(values[i]); queue.add(node.right); }
        i++;
    }
    return root;
}`,
        rust: `// Représentation de LeetCode : Option<Rc<RefCell<TreeNode>>>.
// Rc pour partager le nœud (la file et son parent le référencent), RefCell pour le muter.
use std::{cell::RefCell, collections::VecDeque, rc::Rc};

pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}

fn new_node(val: i32) -> Rc<RefCell<TreeNode>> {
    Rc::new(RefCell::new(TreeNode { val, left: None, right: None }))
}

fn from_level(values: &[Option<i32>]) -> Option<Rc<RefCell<TreeNode>>> {
    let root = new_node((*values.first()?)?);
    let mut queue = VecDeque::from([Rc::clone(&root)]);
    let mut i = 1;
    while i < values.len() {
        let node = queue.pop_front()?;
        if let Some(v) = values[i] {
            let child = new_node(v);
            node.borrow_mut().left = Some(Rc::clone(&child));
            queue.push_back(child);
        }
        i += 1;
        if let Some(&Some(v)) = values.get(i) {
            let child = new_node(v);
            node.borrow_mut().right = Some(Rc::clone(&child));
            queue.push_back(child);
        }
        i += 1;
    }
    Some(root)
}`,
      },
    },
    {
      mnemo: "Format LeetCode : une file, et chaque nœud sorti mange les deux valeurs suivantes (gauche puis droite).",
      piege: "Tester `if (values[i])` au lieu de `values[i] !== null` fait disparaître les nœuds de valeur `0`.",
    },

    { h: 'Parcours en profondeur : préfixe, infixe, suffixe', id: 'arbres-parcours' },
    {
      p: "Les trois parcours en profondeur (DFS) ne diffèrent que par le moment où l'on traite le nœud par rapport à ses sous-arbres :",
    },
    {
      table: [
        ['Parcours', 'Ordre', 'Usage typique'],
        ['Préfixe (preorder)', 'nœud, gauche, droite', 'copier ou sérialiser un arbre, chemins depuis la racine'],
        ['Infixe (inorder)', 'gauche, nœud, droite', 'BST : donne les valeurs **triées**'],
        ['Suffixe (postorder)', 'gauche, droite, nœud', 'calculer à partir des enfants : hauteur, taille, suppression'],
        ['Largeur (BFS)', 'niveau par niveau', 'plus court chemin en nombre d’arêtes, vue par niveaux'],
      ],
    },
    {
      title: 'Les trois parcours récursifs',
      code: `${FROM_LEVEL_SHORT}

function preorder(node, out = []) {
  if (node === null) return out
  out.push(node.val)
  preorder(node.left, out)
  preorder(node.right, out)
  return out
}
function inorder(node, out = []) {
  if (node === null) return out
  inorder(node.left, out)
  out.push(node.val)
  inorder(node.right, out)
  return out
}
function postorder(node, out = []) {
  if (node === null) return out
  postorder(node.left, out)
  postorder(node.right, out)
  out.push(node.val)
  return out
}

//        4
//      /   \\
//     2     6
//    / \\   /
//   1   3 5
const root = fromLevel([4, 2, 6, 1, 3, 5])
console.log(preorder(root).join(' '))
console.log(inorder(root).join(' '))
console.log(postorder(root).join(' '))`,
      output: `4 2 1 3 6 5
1 2 3 4 5 6
1 3 2 5 6 4`,
    },
    {
      p: "La récursion utilise la pile d'appels, de profondeur égale à la hauteur de l'arbre : O(log n) pour un arbre équilibré, mais O(n) pour un arbre **dégénéré** (une simple chaîne), qui fait déborder la pile de V8 vers quelques milliers de niveaux. Les versions itératives remplacent la pile d'appels par un tableau explicite. La plus demandée est l'infixe : on descend à gauche en empilant, on dépile et on traite, puis on passe au sous-arbre droit.",
    },
    {
      title: 'Parcours itératifs avec une pile explicite',
      code: `${FROM_LEVEL_SHORT}

function inorderIter(root) {
  const out = []
  const stack = []
  let node = root
  while (node !== null || stack.length > 0) {
    while (node !== null) { // descendre à gauche en empilant
      stack.push(node)
      node = node.left
    }
    node = stack.pop() // le plus à gauche non traité
    out.push(node.val)
    node = node.right // puis son sous-arbre droit
  }
  return out
}

function preorderIter(root) {
  const out = []
  const stack = root ? [root] : []
  while (stack.length > 0) {
    const node = stack.pop()
    out.push(node.val)
    if (node.right) stack.push(node.right) // droite d'abord : la gauche sortira en premier
    if (node.left) stack.push(node.left)
  }
  return out
}

// suffixe = préfixe « nœud, droite, gauche » lu à l'envers
function postorderIter(root) {
  const out = []
  const stack = root ? [root] : []
  while (stack.length > 0) {
    const node = stack.pop()
    out.push(node.val)
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return out.reverse()
}

const root = fromLevel([4, 2, 6, 1, 3, 5])
console.log(inorderIter(root), preorderIter(root), postorderIter(root))

// une chaîne de 100 000 nœuds : la version itérative tient sans broncher
let chain = null
for (let i = 0; i < 100000; i++) chain = { val: i, left: chain, right: null }
console.log(inorderIter(chain).length)`,
      output: `[ 1, 2, 3, 4, 5, 6 ] [ 4, 2, 1, 3, 6, 5 ] [ 1, 3, 2, 5, 6, 4 ]
100000`,
      equiv: {
        python: `def inorder_iter(root):
    out, stack, node = [], [], root
    while node is not None or stack:
        while node is not None:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out`,
        java: `static List<Integer> inorderIter(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !stack.isEmpty()) {
        while (node != null) { stack.push(node); node = node.left; }
        node = stack.pop();
        out.add(node.val);
        node = node.right;
    }
    return out;
}`,
      },
    },
    {
      mnemo: "Pré = le nœud **avant** ses enfants, in = **entre**, post = **après**. Infixe d'un BST = trié.",
      piege: "En préfixe itératif, empiler la gauche avant la droite inverse l'ordre : la pile est LIFO, la droite doit entrer d'abord.",
    },

    { h: 'Parcours en largeur, niveau par niveau', id: 'arbres-largeur' },
    {
      p: "Le parcours en largeur (BFS) utilise une **file** : on retire un nœud, on ajoute ses enfants. Pour séparer les niveaux, on note la taille de la file au début de chaque niveau et l'on retire exactement ce nombre de nœuds. Ce gabarit résout « valeurs par niveau », « vue de droite » (dernier de chaque niveau), « profondeur minimale » (première feuille rencontrée), « moyenne par niveau », « zigzag »…",
    },
    {
      title: 'BFS par niveaux',
      code: `${FROM_LEVEL_SHORT}

function levelOrder(root) {
  const levels = []
  let level = root ? [root] : []
  while (level.length > 0) {
    levels.push(level.map((node) => node.val))
    const next = []
    for (const node of level) {
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next // un tableau par niveau : pas de shift(), donc O(n) au total
  }
  return levels
}

const root = fromLevel([3, 9, 20, null, null, 15, 7])
console.log(levelOrder(root))
console.log(levelOrder(root).map((lvl) => lvl[lvl.length - 1])) // vue de droite`,
      output: `[ [ 3 ], [ 9, 20 ], [ 15, 7 ] ]
[ 3, 20, 7 ]`,
      equiv: {
        python: `from collections import deque

def level_order(root):
    levels = []
    queue = deque([root] if root else [])
    while queue:
        size = len(queue)
        level = []
        for _ in range(size):
            node = queue.popleft()  # O(1), contrairement à list.pop(0)
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        levels.append(level)
    return levels`,
        java: `static List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    Deque<TreeNode> queue = new ArrayDeque<>();
    if (root != null) queue.add(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int k = 0; k < size; k++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        levels.add(level);
    }
    return levels;
}`,
      },
    },
    {
      p: "JavaScript n'a pas de file efficace : `Array.prototype.shift()` décale tout le tableau, donc O(n) par appel et O(n²) pour un grand arbre. Trois parades : un tableau par niveau (ci-dessus), un indice de lecture `head` qui avance dans un tableau qu'on ne raccourcit jamais, ou une vraie file circulaire.",
    },

    { h: 'Hauteur, diamètre, équilibre : la valeur remontée', id: 'arbres-recursion' },
    {
      p: "Le gabarit le plus important des arbres : une fonction récursive qui **renvoie une information sur le sous-arbre** (hauteur, taille, somme, « est-il équilibré ? »), et que le parent combine. Il se pose en trois questions : que vaut le cas de base `null` ? Que me renvoient mes enfants ? Comment les combiner ? C'est un parcours suffixe, en O(n).",
    },
    {
      p: "Quand la réponse demandée n'est pas ce qu'on remonte, on la met à jour **à côté**, dans une variable extérieure. Exemple type : le **diamètre** (plus long chemin entre deux nœuds, en arêtes) passe par un certain nœud « sommet » et vaut alors `hauteur(gauche) + hauteur(droite)` ; on remonte la hauteur, et l'on garde le meilleur diamètre vu.",
    },
    {
      title: 'Hauteur, diamètre et équilibre en un seul parcours chacun',
      code: `${FROM_LEVEL_SHORT}

function height(node) {
  if (node === null) return 0
  return 1 + Math.max(height(node.left), height(node.right))
}

function diameter(root) {
  let best = 0
  function h(node) { // renvoie la hauteur, met à jour best au passage
    if (node === null) return 0
    const l = h(node.left)
    const r = h(node.right)
    best = Math.max(best, l + r) // chemin qui « tourne » en ce nœud
    return 1 + Math.max(l, r)
  }
  h(root)
  return best
}

// équilibré : en chaque nœud, les hauteurs des sous-arbres diffèrent d'au plus 1.
// On remonte -1 pour « déjà déséquilibré » : un seul parcours, O(n).
function isBalanced(root) {
  function check(node) {
    if (node === null) return 0
    const l = check(node.left)
    if (l === -1) return -1
    const r = check(node.right)
    if (r === -1 || Math.abs(l - r) > 1) return -1
    return 1 + Math.max(l, r)
  }
  return check(root) !== -1
}

const root = fromLevel([1, 2, 3, 4, 5])
console.log(height(root), diameter(root), isBalanced(root))
console.log(isBalanced(fromLevel([1, 2, null, 3])))`,
      output: `3 3 true
false`,
      equiv: {
        python: `def diameter(root):
    best = 0
    def h(node):
        nonlocal best  # sans nonlocal, best = ... créerait une variable locale
        if node is None:
            return 0
        l, r = h(node.left), h(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    h(root)
    return best`,
        java: `private int best;

int diameter(TreeNode root) {
    best = 0;
    h(root);
    return best;
}
private int h(TreeNode node) {
    if (node == null) return 0;
    int l = h(node.left), r = h(node.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
}`,
        rust: `use std::{cell::RefCell, rc::Rc};

fn h(node: &Option<Rc<RefCell<TreeNode>>>, best: &mut i32) -> i32 {
    match node {
        None => 0,
        Some(n) => {
            let n = n.borrow();
            let l = h(&n.left, best);
            let r = h(&n.right, best);
            *best = (*best).max(l + r);
            1 + l.max(r)
        }
    }
}

fn diameter(root: &Option<Rc<RefCell<TreeNode>>>) -> i32 {
    let mut best = 0;
    h(root, &mut best);
    best
}`,
      },
    },
    {
      mnemo: "Arbre = « que me renvoient mes enfants, et qu'est-ce que j'en fais ? ». La réponse globale vit dans une variable à côté si elle diffère de la valeur remontée.",
      piege: "Vérifier l'équilibre en appelant `height` en chaque nœud recalcule les hauteurs : O(n²) sur un arbre dégénéré. Remonter la hauteur (ou -1) donne O(n).",
    },

    { h: 'Arbre binaire de recherche (BST)', id: 'arbres-bst' },
    {
      p: "Dans un **BST**, pour chaque nœud, **toutes** les valeurs du sous-arbre gauche sont plus petites et **toutes** celles du sous-arbre droit plus grandes. Recherche, insertion et suppression suivent un seul chemin depuis la racine : O(h), soit O(log n) si l'arbre est équilibré, mais O(n) s'il est dégénéré (insertion de valeurs déjà triées). Les arbres auto-équilibrés (AVL, rouge-noir) garantissent h = O(log n) ; c'est ce que fournissent `TreeMap` en Java ou `BTreeMap` en Rust (un B-arbre). JavaScript n'a rien d'équivalent en standard.",
    },
    {
      title: 'Recherche, insertion, validation, k-ième plus petit',
      code: `function insert(root, val) { // renvoie la racine (nouvelle si l'arbre était vide)
  const node = { val, left: null, right: null }
  if (root === null) return node
  let cur = root
  for (;;) {
    if (val < cur.val) {
      if (cur.left === null) { cur.left = node; break }
      cur = cur.left
    } else {
      if (cur.right === null) { cur.right = node; break }
      cur = cur.right
    }
  }
  return root
}

function search(root, val) {
  let cur = root
  while (cur !== null && cur.val !== val) cur = val < cur.val ? cur.left : cur.right
  return cur
}

// valider : chaque nœud doit tenir dans l'intervalle (low, high) hérité de TOUS ses ancêtres
function isValidBST(node, low = -Infinity, high = Infinity) {
  if (node === null) return true
  if (node.val <= low || node.val >= high) return false
  return isValidBST(node.left, low, node.val) && isValidBST(node.right, node.val, high)
}

// k-ième plus petit : parcours infixe itératif, arrêté au k-ième nœud visité
function kthSmallest(root, k) {
  const stack = []
  let node = root
  while (node !== null || stack.length > 0) {
    while (node !== null) { stack.push(node); node = node.left }
    node = stack.pop()
    if (--k === 0) return node.val
    node = node.right
  }
  return undefined
}

let root = null
for (const v of [5, 3, 8, 1, 4, 9]) root = insert(root, v)
console.log(search(root, 4) !== null, search(root, 7))
console.log(isValidBST(root), kthSmallest(root, 3))
root.left.right.val = 6 // 6 est à droite de 3, mais dans le sous-arbre gauche de 5
console.log(isValidBST(root))`,
      output: `true null
true 4
false`,
      equiv: {
        python: `import math

def is_valid_bst(node, low=-math.inf, high=math.inf):
    if node is None:
        return True
    if not (low < node.val < high):
        return False
    return is_valid_bst(node.left, low, node.val) and is_valid_bst(node.right, node.val, high)`,
        java: `// Long plutôt qu'Integer.MIN_VALUE : un nœud peut valoir exactement Integer.MIN_VALUE
static boolean isValidBST(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;
    return isValidBST(node.left, low, node.val) && isValidBST(node.right, node.val, high);
}
// appel : isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE)`,
      },
    },
    {
      p: "**Plus proche ancêtre commun (LCA)**. Dans un BST, on descend depuis la racine : si `p` et `q` sont tous deux plus petits que le nœud, on va à gauche ; tous deux plus grands, à droite ; sinon le nœud courant les sépare, c'est le LCA (O(h)). Dans un arbre binaire quelconque, on remonte une information : un nœud renvoie `p` ou `q` s'il en est un, sinon ce que lui remontent ses enfants ; le premier nœud qui reçoit quelque chose des **deux** côtés est le LCA (O(n)).",
    },
    {
      title: 'LCA dans un BST et dans un arbre quelconque',
      code: `${FROM_LEVEL_SHORT}

function lcaBST(root, p, q) { // p et q sont des valeurs présentes
  let node = root
  for (;;) {
    if (p < node.val && q < node.val) node = node.left
    else if (p > node.val && q > node.val) node = node.right
    else return node.val
  }
}

function lca(node, p, q) { // arbre quelconque, valeurs uniques
  if (node === null || node.val === p || node.val === q) return node
  const left = lca(node.left, p, q)
  const right = lca(node.right, p, q)
  if (left !== null && right !== null) return node // p d'un côté, q de l'autre
  return left !== null ? left : right
}

const bst = fromLevel([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])
console.log(lcaBST(bst, 2, 8), lcaBST(bst, 3, 5), lcaBST(bst, 2, 4))
const tree = fromLevel([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4])
console.log(lca(tree, 5, 1).val, lca(tree, 7, 6).val, lca(tree, 5, 4).val)`,
      output: `6 4 2
3 5 5`,
    },
    {
      mnemo: "Valider un BST = transmettre un intervalle (min, max) vers le bas, pas comparer au seul parent. Ou vérifier que l'infixe est strictement croissant.",
      piege: "Un BST n'est rapide que s'il est équilibré : insérer 1, 2, 3, …, n produit une chaîne de hauteur n, et chaque opération redevient O(n).",
    },

    { h: 'Sérialiser et désérialiser', id: 'arbres-serialisation' },
    {
      p: "Sérialiser un arbre, c'est le transformer en chaîne pour le stocker ou l'envoyer, de sorte qu'on puisse le reconstruire **exactement**. Un parcours préfixe seul ne suffit pas (plusieurs arbres ont le même), mais un préfixe qui **note les `null`** est non ambigu. Le format niveau par niveau de LeetCode fonctionne aussi, et il a l'avantage d'être itératif (pas de risque de pile sur un arbre très profond).",
    },
    {
      title: 'Préfixe avec marqueurs de null',
      code: `${FROM_LEVEL_SHORT}

function serialize(root) {
  const out = []
  function go(node) {
    if (node === null) { out.push('#'); return }
    out.push(node.val)
    go(node.left)
    go(node.right)
  }
  go(root)
  return out.join(',')
}

function deserialize(data) {
  const tokens = data.split(',')
  let i = 0
  function build() {
    const t = tokens[i++]
    if (t === '#') return null
    const node = { val: Number(t), left: null, right: null }
    node.left = build() // même ordre que serialize : nœud, gauche, droite
    node.right = build()
    return node
  }
  return build()
}

const s = serialize(fromLevel([1, 2, 3, null, null, 4, 5]))
console.log(s)
console.log(serialize(deserialize(s)) === s, serialize(null))`,
      output: `1,2,#,#,3,4,#,#,5,#,#
true #`,
      equiv: {
        python: `def serialize(root):
    out = []
    def go(node):
        if node is None:
            out.append("#")
            return
        out.append(str(node.val))
        go(node.left)
        go(node.right)
    go(root)
    return ",".join(out)

def deserialize(data):
    tokens = iter(data.split(","))  # un itérateur : chaque next() consomme un jeton
    def build():
        t = next(tokens)
        if t == "#":
            return None
        node = TreeNode(int(t))
        node.left = build()
        node.right = build()
        return node
    return build()`,
        java: `static String serialize(TreeNode root) {
    StringBuilder sb = new StringBuilder();
    go(root, sb);
    return sb.substring(0, sb.length() - 1); // retirer la dernière virgule
}
private static void go(TreeNode node, StringBuilder sb) {
    if (node == null) { sb.append("#,"); return; }
    sb.append(node.val).append(',');
    go(node.left, sb);
    go(node.right, sb);
}

static TreeNode deserialize(String data) {
    Deque<String> tokens = new ArrayDeque<>(Arrays.asList(data.split(",")));
    return build(tokens);
}
private static TreeNode build(Deque<String> tokens) {
    String t = tokens.poll();
    if (t.equals("#")) return null;
    TreeNode node = new TreeNode(Integer.parseInt(t));
    node.left = build(tokens);
    node.right = build(tokens);
    return node;
}`,
      },
    },

    { h: 'Trie (arbre préfixe)', id: 'arbres-trie' },
    {
      p: "Un **trie** stocke des mots caractère par caractère : chaque nœud a des enfants indexés par une lettre et un drapeau « un mot se termine ici ». Insérer, chercher un mot ou tester un préfixe coûte O(L), où L est la longueur du mot, **indépendamment du nombre de mots** stockés. On le reconnaît dès qu'un énoncé parle de **préfixes** : autocomplétion, « tous les mots commençant par… », recherche de mots dans une grille (backtracking guidé par le trie), plus long préfixe commun, dictionnaire avec jokers.",
    },
    {
      title: 'Trie avec autocomplétion',
      code: `class Trie {
  constructor() {
    this.root = { children: new Map(), end: false }
  }
  insert(word) {
    let node = this.root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false })
      node = node.children.get(ch)
    }
    node.end = true
  }
  findNode(prefix) { // nœud atteint en suivant prefix, ou null
    let node = this.root
    for (const ch of prefix) {
      node = node.children.get(ch)
      if (node === undefined) return null
    }
    return node
  }
  search(word) {
    const node = this.findNode(word)
    return node !== null && node.end
  }
  startsWith(prefix) {
    return this.findNode(prefix) !== null
  }
  suggest(prefix) { // tous les mots qui commencent par prefix, par ordre alphabétique
    const start = this.findNode(prefix)
    const out = []
    function dfs(node, path) {
      if (node.end) out.push(path)
      for (const ch of [...node.children.keys()].sort()) dfs(node.children.get(ch), path + ch)
    }
    if (start !== null) dfs(start, prefix)
    return out
  }
}

const t = new Trie()
for (const w of ['car', 'cat', 'cart', 'care', 'dog']) t.insert(w)
console.log(t.search('car'), t.search('ca'), t.startsWith('ca'))
console.log(t.suggest('car'), t.suggest('x'))`,
      output: `true false true
[ 'car', 'care', 'cart' ] []`,
      equiv: {
        python: `class TrieNode:
    __slots__ = ("children", "end")
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def _find(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._find(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        return self._find(prefix) is not None`,
        java: `class Trie {
    private static class Node {
        Node[] children = new Node[26]; // alphabet a-z : un tableau plutôt qu'une Map
        boolean end;
    }
    private final Node root = new Node();

    void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            int k = c - 'a';
            if (node.children[k] == null) node.children[k] = new Node();
            node = node.children[k];
        }
        node.end = true;
    }
    private Node find(String prefix) {
        Node node = root;
        for (char c : prefix.toCharArray()) {
            node = node.children[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }
    boolean search(String word) { Node n = find(word); return n != null && n.end; }
    boolean startsWith(String prefix) { return find(prefix) != null; }
}`,
        rust: `use std::collections::HashMap;

#[derive(Default)]
struct Trie {
    children: HashMap<char, Trie>,
    end: bool,
}

impl Trie {
    fn insert(&mut self, word: &str) {
        let mut node = self;
        for ch in word.chars() {
            node = node.children.entry(ch).or_default();
        }
        node.end = true;
    }
    fn find(&self, prefix: &str) -> Option<&Trie> {
        let mut node = self;
        for ch in prefix.chars() {
            node = node.children.get(&ch)?;
        }
        Some(node)
    }
    fn search(&self, word: &str) -> bool {
        self.find(word).map_or(false, |n| n.end)
    }
    fn starts_with(&self, prefix: &str) -> bool {
        self.find(prefix).is_some()
    }
}`,
      },
    },
    {
      mnemo: "Un énoncé qui parle de préfixes appelle un trie : O(L) par opération, quel que soit le nombre de mots.",
      piege: "Oublier le drapeau `end` : sans lui, `search('ca')` répondrait vrai dès que `car` est présent, puisque le chemin existe.",
    },
  ],
  mnemo:
    "Trois questions récursives (cas `null`, ce que remontent les enfants, comment combiner) ; une file pour les niveaux ; un intervalle pour valider un BST ; l'infixe d'un BST est trié ; préfixes = trie.",
  piege:
    "La récursion sur un arbre a une profondeur égale à sa hauteur : sur un arbre dégénéré de 10⁵ nœuds, elle fait déborder la pile. Sachez écrire les parcours avec une pile ou une file explicite.",
})

const TREE_FORMAT = `Les nœuds sont des objets \`{ val, left, right }\` (\`null\` pour un enfant absent) ; l'arbre vide vaut \`null\`. Dans les exemples, un arbre est écrit au format LeetCode, niveau par niveau avec \`null\` pour un trou : \`[3, 9, 20, null, null, 15, 7]\` est la racine 3, ses enfants 9 et 20, puis 15 et 7 sous 20. Les tests construisent les arbres avec leur propre fonction \`fromLevel\` (inutile de l'écrire).`

katas.push(
  // ---------------------------------------------------------------------------
  {
    id: 'hi-profondeur-max',
    title: 'Profondeur maximale d’un arbre',
    difficulty: 'facile',
    theme: 'arbres',
    pattern: 'valeur remontée par la récursion',
    statement: `Écrivez \`maxDepth(root)\` qui renvoie la **profondeur maximale** d'un arbre binaire, c'est-à-dire le nombre de nœuds sur le plus long chemin de la racine à une feuille.

${TREE_FORMAT}

Exemples :

- \`[3, 9, 20, null, null, 15, 7]\` donne \`3\` ;
- \`[1, null, 2]\` donne \`2\` ;
- l'arbre vide donne \`0\`.`,
    starter: `function maxDepth(root) {
  // TODO : 0 pour null, sinon 1 + le max des profondeurs des deux sous-arbres
  return root === null ? 0 : 1
}`,
    solution: `function maxDepth(root) {
  if (root === null) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}`,
    solutionEquiv: {
      python: `def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
      java: `static int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
      rust: `use std::{cell::RefCell, rc::Rc};

fn max_depth(root: &Option<Rc<RefCell<TreeNode>>>) -> i32 {
    match root {
        None => 0,
        Some(node) => {
            let n = node.borrow();
            1 + max_depth(&n.left).max(max_depth(&n.right))
        }
    }
}`,
      php: `function maxDepth(?TreeNode $root): int {
    if ($root === null) return 0;
    return 1 + max(maxDepth($root->left), maxDepth($root->right));
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `${TREE_HELPERS}
assertEqual(maxDepth(fromLevel([3, 9, 20, null, null, 15, 7])), 3)` },
      { name: 'arbre penché à droite', code: `${TREE_HELPERS}
assertEqual(maxDepth(fromLevel([1, null, 2])), 2)
assertEqual(maxDepth(fromLevel([1, null, 2, null, 3, null, 4])), 4)` },
      { name: 'arbre vide et nœud seul', code: `${TREE_HELPERS}
assertEqual(maxDepth(null), 0)
assertEqual(maxDepth(fromLevel([0])), 1)` },
      { name: 'branche la plus longue à gauche', code: `${TREE_HELPERS}
assertEqual(maxDepth(fromLevel([1, 2, 3, 4, null, null, null, 5])), 4)` },
      { name: 'arbre complet', code: `${TREE_HELPERS}
assertEqual(maxDepth(fromLevel([1, 2, 3, 4, 5, 6, 7])), 3)` },
    ],
    hints: [
      'Quelle est la profondeur de l’arbre vide ? Et d’un nœud dont on connaît la profondeur de ses deux sous-arbres ?',
      '`1 + Math.max(maxDepth(root.left), maxDepth(root.right))`, avec `0` pour `null`.',
      'Version itérative : un parcours en largeur qui compte les niveaux.',
    ],
    discussion: `**Complexité** : O(n) en temps (chaque nœud est visité une fois), O(h) en mémoire pour la pile d'appels, où h est la hauteur : O(log n) si l'arbre est équilibré, O(n) s'il est dégénéré.

**Points à évoquer** :

- c'est le gabarit « valeur remontée » dans sa forme la plus pure : cas de base, appels sur les enfants, combinaison ;
- alternative itérative : BFS en comptant les niveaux, ou DFS avec une pile de paires \`[nœud, profondeur]\` ; utile si l'arbre peut être très profond ;
- variantes : profondeur **minimale** (attention, un nœud avec un seul enfant n'est pas une feuille ; le BFS s'arrête à la première feuille), arbre équilibré, diamètre.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-parcours-niveaux',
    title: 'Parcours par niveaux',
    difficulty: 'facile',
    theme: 'arbres',
    pattern: 'BFS par niveaux',
    statement: `Écrivez \`levelOrder(root)\` qui renvoie les valeurs de l'arbre **niveau par niveau**, de gauche à droite, sous forme d'un tableau de tableaux.

${TREE_FORMAT}

Exemples :

- \`[3, 9, 20, null, null, 15, 7]\` donne \`[[3], [9, 20], [15, 7]]\` ;
- \`[1]\` donne \`[[1]]\` ;
- l'arbre vide donne \`[]\`.`,
    starter: `function levelOrder(root) {
  // TODO : une file (ou un tableau par niveau)
  return root === null ? [] : [[root.val]]
}`,
    solution: `function levelOrder(root) {
  const levels = []
  let level = root === null ? [] : [root]
  while (level.length > 0) {
    levels.push(level.map((node) => node.val))
    const next = []
    for (const node of level) {
      if (node.left !== null) next.push(node.left)
      if (node.right !== null) next.push(node.right)
    }
    level = next
  }
  return levels
}`,
    solutionEquiv: {
      python: `def level_order(root):
    levels = []
    level = [root] if root else []
    while level:
        levels.append([node.val for node in level])
        level = [child for node in level for child in (node.left, node.right) if child]
    return levels`,
      java: `static List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    Deque<TreeNode> queue = new ArrayDeque<>();
    if (root != null) queue.add(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        List<Integer> level = new ArrayList<>(size);
        for (int k = 0; k < size; k++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        levels.add(level);
    }
    return levels;
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `${TREE_HELPERS}
assertEqual(levelOrder(fromLevel([3, 9, 20, null, null, 15, 7])), [[3], [9, 20], [15, 7]])` },
      { name: 'nœud seul et arbre vide', code: `${TREE_HELPERS}
assertEqual(levelOrder(fromLevel([1])), [[1]])
assertEqual(levelOrder(null), [])` },
      { name: 'arbre complet', code: `${TREE_HELPERS}
assertEqual(levelOrder(fromLevel([1, 2, 3, 4, 5, 6, 7])), [[1], [2, 3], [4, 5, 6, 7]])` },
      { name: 'trous dans les niveaux', code: `${TREE_HELPERS}
assertEqual(levelOrder(fromLevel([1, 2, 3, null, 4, null, 5, 6])), [[1], [2, 3], [4, 5], [6]])` },
      { name: 'chaîne', code: `${TREE_HELPERS}
assertEqual(levelOrder(fromLevel([1, null, 2, 3])), [[1], [2], [3]])` },
      { name: 'valeurs nulles (0) et négatives', code: `${TREE_HELPERS}
assertEqual(levelOrder(fromLevel([0, -1, 0])), [[0], [-1, 0]])` },
    ],
    hints: [
      'Utilisez une file : on retire un nœud, on ajoute ses enfants.',
      'Pour séparer les niveaux, traitez la file « par paquets » : notez sa taille au début du niveau, ou construisez un nouveau tableau pour le niveau suivant.',
      'Évitez `shift()` sur de grands tableaux (O(n) par appel) : un tableau par niveau ou un indice de lecture suffit.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(w) en mémoire où w est la largeur maximale (jusqu'à n/2 pour le dernier niveau d'un arbre complet).

**Points à évoquer** :

- en JavaScript, \`queue.shift()\` est en O(n) : sur un grand arbre, le BFS deviendrait quadratique ; d'où le tableau par niveau ou l'indice \`head\` ;
- une version DFS est possible : passer la profondeur en paramètre et pousser dans \`levels[depth]\` ;
- variantes : zigzag (inverser un niveau sur deux), vue de droite (dernier de chaque niveau), moyenne par niveau, profondeur minimale, relier les nœuds d'un même niveau (« next right pointers »).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-valider-bst',
    title: 'Valider un arbre binaire de recherche',
    difficulty: 'moyen',
    theme: 'arbres',
    pattern: 'DFS avec bornes (min, max)',
    statement: `Écrivez \`isValidBST(root)\` qui indique si un arbre binaire est un **arbre binaire de recherche** strict :

- toutes les valeurs du sous-arbre gauche d'un nœud sont **strictement inférieures** à la sienne ;
- toutes celles du sous-arbre droit sont **strictement supérieures** ;
- les deux sous-arbres sont eux-mêmes des BST (l'arbre vide en est un).

${TREE_FORMAT}

Exemples :

- \`[2, 1, 3]\` donne \`true\` ;
- \`[5, 1, 4, null, null, 3, 6]\` donne \`false\` (4 est à droite de 5) ;
- \`[5, 4, 6, null, null, 3, 7]\` donne \`false\` : 3 est bien à gauche de 6, mais il est dans le sous-arbre **droit** de 5.`,
    starter: `function isValidBST(root) {
  // TODO : chaque nœud doit respecter les contraintes de TOUS ses ancêtres
  // (cette version ne compare qu'au parent direct)
  if (root === null) return true
  if (root.left !== null && root.left.val >= root.val) return false
  if (root.right !== null && root.right.val <= root.val) return false
  return isValidBST(root.left) && isValidBST(root.right)
}`,
    solution: `function isValidBST(root) {
  function check(node, low, high) {
    if (node === null) return true
    if (node.val <= low || node.val >= high) return false
    // à gauche, le nœud devient la borne haute ; à droite, la borne basse
    return check(node.left, low, node.val) && check(node.right, node.val, high)
  }
  return check(root, -Infinity, Infinity)
}`,
    solutionEquiv: {
      python: `import math

def is_valid_bst(root):
    def check(node, low, high):
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return check(node.left, low, node.val) and check(node.right, node.val, high)
    return check(root, -math.inf, math.inf)`,
      java: `static boolean isValidBST(TreeNode root) {
    return check(root, Long.MIN_VALUE, Long.MAX_VALUE);
}
// long : les bornes doivent pouvoir être strictement en dehors de [Integer.MIN_VALUE, Integer.MAX_VALUE]
static boolean check(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;
    return check(node.left, low, node.val) && check(node.right, node.val, high);
}`,
      rust: `use std::{cell::RefCell, rc::Rc};

fn is_valid_bst(root: &Option<Rc<RefCell<TreeNode>>>) -> bool {
    fn check(node: &Option<Rc<RefCell<TreeNode>>>, low: i64, high: i64) -> bool {
        match node {
            None => true,
            Some(n) => {
                let n = n.borrow();
                let v = n.val as i64;
                low < v && v < high && check(&n.left, low, v) && check(&n.right, v, high)
            }
        }
    }
    check(root, i64::MIN, i64::MAX)
}`,
    },
    tests: [
      { name: 'BST simple', code: `${TREE_HELPERS}
assert(isValidBST(fromLevel([2, 1, 3])))` },
      { name: 'enfant droit trop petit', code: `${TREE_HELPERS}
assert(!isValidBST(fromLevel([5, 1, 4, null, null, 3, 6])))` },
      { name: 'violation par un petit-enfant', code: `${TREE_HELPERS}
assert(!isValidBST(fromLevel([5, 4, 6, null, null, 3, 7])), '3 est dans le sous-arbre droit de 5')
assert(!isValidBST(fromLevel([10, 5, 15, 2, 12])), '12 est dans le sous-arbre gauche de 10')` },
      { name: 'doublons interdits', code: `${TREE_HELPERS}
assert(!isValidBST(fromLevel([1, 1])))
assert(!isValidBST(fromLevel([2, null, 2])))` },
      { name: 'arbre vide et nœud seul', code: `${TREE_HELPERS}
assert(isValidBST(null))
assert(isValidBST(fromLevel([0])))` },
      { name: 'BST plus grand et valeurs extrêmes', code: `${TREE_HELPERS}
assert(isValidBST(fromLevel([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15])))
assert(isValidBST(fromLevel([-2147483648, null, 2147483647])))
assert(!isValidBST(fromLevel([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 9])), '9 est sous 6, donc à gauche de 8')` },
    ],
    hints: [
      'Comparer chaque nœud à ses seuls enfants ne suffit pas : contre-exemple `[5, 4, 6, null, null, 3, 7]`.',
      'Transmettez vers le bas un intervalle ouvert `(low, high)` dans lequel la valeur du nœud doit tomber. En descendant à gauche, la borne haute devient la valeur du nœud ; à droite, la borne basse.',
      'Autre approche : le parcours infixe d’un BST est strictement croissant ; il suffit de comparer chaque valeur à la précédente.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(h) en mémoire (pile d'appels).

**Points à évoquer** :

- l'erreur classique est de ne comparer qu'au parent ; la contrainte vient de **tous** les ancêtres, d'où l'intervalle ;
- bornes initiales : \`-Infinity\` et \`Infinity\` en JavaScript ; en Java, \`Integer.MIN_VALUE\` comme borne échoue si un nœud vaut exactement cette valeur, d'où des \`long\` ou des \`Integer\` nullables ;
- variante infixe : garder la valeur précédente et vérifier qu'elle est strictement plus petite ; s'arrête dès la première anomalie ;
- suites possibles : retrouver deux nœuds échangés dans un BST (infixe, repérer les deux inversions), convertir un tableau trié en BST équilibré (le milieu comme racine).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-diametre',
    title: 'Diamètre d’un arbre binaire',
    difficulty: 'moyen',
    theme: 'arbres',
    pattern: 'valeur remontée + réponse globale',
    statement: `Écrivez \`diameterOfBinaryTree(root)\` qui renvoie le **diamètre** de l'arbre : la longueur, **en nombre d'arêtes**, du plus long chemin entre deux nœuds quelconques. Ce chemin ne passe pas forcément par la racine.

${TREE_FORMAT}

Exemples :

- \`[1, 2, 3, 4, 5]\` donne \`3\` (chemin 4 → 2 → 1 → 3, ou 5 → 2 → 1 → 3) ;
- \`[1, 2]\` donne \`1\` ;
- un nœud seul ou l'arbre vide donnent \`0\`.`,
    starter: `function diameterOfBinaryTree(root) {
  // TODO : remonter la hauteur, et garder le meilleur « hauteur gauche + hauteur droite »
  // (cette version suppose que le chemin passe par la racine)
  function height(node) {
    return node === null ? 0 : 1 + Math.max(height(node.left), height(node.right))
  }
  return root === null ? 0 : height(root.left) + height(root.right)
}`,
    solution: `function diameterOfBinaryTree(root) {
  let best = 0
  function height(node) {
    if (node === null) return 0
    const l = height(node.left)
    const r = height(node.right)
    best = Math.max(best, l + r) // plus long chemin dont ce nœud est le sommet
    return 1 + Math.max(l, r)
  }
  height(root)
  return best
}`,
    solutionEquiv: {
      python: `def diameter_of_binary_tree(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    height(root)
    return best`,
      java: `class Solution {
    private int best = 0;

    int diameterOfBinaryTree(TreeNode root) {
        best = 0;
        height(root);
        return best;
    }
    private int height(TreeNode node) {
        if (node == null) return 0;
        int l = height(node.left), r = height(node.right);
        best = Math.max(best, l + r);
        return 1 + Math.max(l, r);
    }
}`,
      php: `function diameterOfBinaryTree(?TreeNode $root): int {
    $best = 0;
    $height = function (?TreeNode $node) use (&$height, &$best): int {
        if ($node === null) return 0;
        $l = $height($node->left);
        $r = $height($node->right);
        $best = max($best, $l + $r);
        return 1 + max($l, $r);
    };
    $height($root);
    return $best;
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `${TREE_HELPERS}
assertEqual(diameterOfBinaryTree(fromLevel([1, 2, 3, 4, 5])), 3)` },
      { name: 'deux nœuds', code: `${TREE_HELPERS}
assertEqual(diameterOfBinaryTree(fromLevel([1, 2])), 1)` },
      { name: 'arbre vide et nœud seul', code: `${TREE_HELPERS}
assertEqual(diameterOfBinaryTree(null), 0)
assertEqual(diameterOfBinaryTree(fromLevel([1])), 0)` },
      { name: 'le chemin ne passe pas par la racine', code: `${TREE_HELPERS}
// sous le nœud 2 : deux longues branches ; la racine n'a qu'un enfant
const root = fromLevel([1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8])
assertEqual(diameterOfBinaryTree(root), 6)` },
      { name: 'chaîne', code: `${TREE_HELPERS}
assertEqual(diameterOfBinaryTree(fromLevel([1, null, 2, null, 3, null, 4])), 3)` },
    ],
    hints: [
      'Le plus long chemin a un nœud « sommet », le plus haut du chemin. Sa longueur vaut alors hauteur(gauche) + hauteur(droite).',
      'Écrivez une fonction qui renvoie la hauteur d’un sous-arbre et, au passage, met à jour une variable `best` avec `l + r`.',
      'Chaque nœud est visité une fois : O(n). Appeler une fonction `height` séparée en chaque nœud donnerait O(n²) sur un arbre dégénéré.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(h) en mémoire.

**Points à évoquer** :

- c'est le motif « on remonte une chose (la hauteur), on répond une autre (le diamètre) » : la réponse globale vit dans une variable de fermeture (en Python, \`nonlocal\` ; en Java, un champ) ;
- attention à l'unité : arêtes (ici) ou nœuds (arêtes + 1) ;
- même structure pour la **somme de chemin maximale** (LeetCode 124) : remonter le meilleur gain d'une branche, \`Math.max(0, …)\` pour ignorer une branche négative, et mettre à jour \`best\` avec \`val + gauche + droite\` ;
- même idée dans un graphe-arbre quelconque : deux BFS (le nœud le plus loin d'un nœud quelconque, puis le plus loin de celui-ci).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-kieme-bst',
    title: 'k-ième plus petite valeur d’un BST',
    difficulty: 'moyen',
    theme: 'arbres',
    pattern: 'infixe itératif (pile)',
    statement: `Écrivez \`kthSmallest(root, k)\` qui renvoie la **k-ième plus petite** valeur d'un arbre binaire de recherche (\`k\` commence à 1).

${TREE_FORMAT}

- on garantit \`1 <= k <= nombre de nœuds\` et des valeurs distinctes ;
- l'arbre peut être **très profond** (un test utilise un BST dégénéré de 100 000 nœuds) : une récursion déborderait de la pile ;
- arrêtez-vous dès que la réponse est connue.

Exemples :

- \`[3, 1, 4, null, 2]\`, \`k = 1\` donne \`1\` ;
- \`[5, 3, 6, 2, 4, null, null, 1]\`, \`k = 3\` donne \`3\`.`,
    starter: `function kthSmallest(root, k) {
  // TODO : parcours infixe ITÉRATIF, arrêté au k-ième nœud visité
  return root.val
}`,
    solution: `function kthSmallest(root, k) {
  const stack = []
  let node = root
  while (node !== null || stack.length > 0) {
    while (node !== null) { // descendre le plus à gauche possible
      stack.push(node)
      node = node.left
    }
    node = stack.pop() // plus petite valeur pas encore visitée
    k--
    if (k === 0) return node.val
    node = node.right
  }
  return undefined
}`,
    solutionEquiv: {
      python: `def kth_smallest(root, k):
    stack, node = [], root
    while node is not None or stack:
        while node is not None:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right
    return None`,
      java: `static int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !stack.isEmpty()) {
        while (node != null) { stack.push(node); node = node.left; }
        node = stack.pop();
        if (--k == 0) return node.val;
        node = node.right;
    }
    throw new IllegalArgumentException("k trop grand");
}`,
      rust: `use std::{cell::RefCell, rc::Rc};

fn kth_smallest(root: Option<Rc<RefCell<TreeNode>>>, mut k: i32) -> i32 {
    let mut stack = Vec::new();
    let mut node = root;
    loop {
        while let Some(n) = node {
            node = n.borrow().left.clone();
            stack.push(n);
        }
        let n = stack.pop().expect("k trop grand");
        k -= 1;
        if k == 0 {
            return n.borrow().val;
        }
        node = n.borrow().right.clone();
    }
}`,
    },
    tests: [
      { name: 'exemples de l’énoncé', code: `${TREE_HELPERS}
assertEqual(kthSmallest(fromLevel([3, 1, 4, null, 2]), 1), 1)
assertEqual(kthSmallest(fromLevel([5, 3, 6, 2, 4, null, null, 1]), 3), 3)` },
      { name: 'toutes les positions', code: `${TREE_HELPERS}
const root = fromLevel([5, 3, 6, 2, 4, null, null, 1])
const got = [1, 2, 3, 4, 5, 6].map((k) => kthSmallest(root, k))
assertEqual(got, [1, 2, 3, 4, 5, 6])` },
      { name: 'nœud seul', code: `${TREE_HELPERS}
assertEqual(kthSmallest(fromLevel([42]), 1), 42)` },
      { name: 'valeurs négatives', code: `${TREE_HELPERS}
assertEqual(kthSmallest(fromLevel([0, -5, 5, -10, -2]), 2), -5)` },
      { name: 'grande entrée : BST dégénéré de 100 000 nœuds', code: `const n = 100000
let root = null
for (let v = 1; v <= n; v++) root = { val: v, left: root, right: null } // chaîne vers la gauche
const t0 = performance.now()
const a = kthSmallest(root, 1)
const b = kthSmallest(root, n)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assertEqual([a, b], [1, n])` },
    ],
    hints: [
      'Le parcours infixe d’un BST visite les valeurs dans l’ordre croissant : la k-ième visitée est la réponse.',
      'Une récursion est naturelle, mais sur un arbre dégénéré de 100 000 nœuds elle dépasse la pile d’appels. Utilisez une pile explicite.',
      'Gabarit : tant qu’il reste un nœud ou une pile non vide, descendre à gauche en empilant, dépiler, compter, puis passer à droite.',
    ],
    discussion: `**Complexité** : O(h + k) en temps (on descend la branche gauche puis on visite k nœuds), O(h) en mémoire pour la pile, où h est la hauteur.

**Points à évoquer** :

- collecter tout l'infixe dans un tableau puis lire l'indice \`k - 1\` est correct mais O(n) en temps et en mémoire, et ne s'arrête pas tôt ;
- la récursion est équivalente mais limitée par la pile d'appels (quelques milliers de niveaux en JavaScript) ;
- **suite classique** : « et si l'arbre est modifié souvent et qu'on demande souvent le k-ième ? » — stocker dans chaque nœud la taille de son sous-arbre ; on descend alors en O(h) en comparant \`k\` à la taille du sous-arbre gauche ;
- symétrique : k-ième plus grand avec un infixe inversé (droite, nœud, gauche).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-trie-autocompletion',
    title: 'Trie et autocomplétion',
    difficulty: 'difficile',
    theme: 'arbres',
    pattern: 'trie (arbre préfixe)',
    statement: `Implémentez une classe \`Trie\` pour des mots en lettres minuscules :

- \`insert(word)\` ajoute un mot (insérer deux fois le même mot ne change rien) ;
- \`search(word)\` renvoie \`true\` si le mot exact a été inséré ;
- \`startsWith(prefix)\` renvoie \`true\` si au moins un mot inséré commence par \`prefix\` (le préfixe vide est accepté dès qu'un mot existe) ;
- \`suggest(prefix, limit)\` renvoie au plus \`limit\` mots insérés commençant par \`prefix\`, **par ordre alphabétique** (un mot égal au préfixe compte), ou \`[]\` s'il n'y en a aucun.

Les opérations doivent être en O(longueur du mot) pour \`insert\`, \`search\` et \`startsWith\`, quel que soit le nombre de mots (un test insère 50 000 mots puis fait 50 000 requêtes). \`suggest\` doit s'arrêter dès qu'elle a trouvé \`limit\` mots.

Exemple : après \`insert\` de \`'car'\`, \`'card'\`, \`'care'\`, \`'cat'\` et \`'dog'\`, \`search('ca')\` donne \`false\`, \`startsWith('ca')\` donne \`true\`, \`suggest('car', 2)\` donne \`['car', 'card']\` et \`suggest('ca', 10)\` donne \`['car', 'card', 'care', 'cat']\`.`,
    starter: `class Trie {
  constructor() {
    // TODO : un nœud racine { children, end }
    this.words = []
  }
  insert(word) {
    this.words.push(word)
  }
  search(word) {
    // TODO
    return false
  }
  startsWith(prefix) {
    // TODO
    return false
  }
  suggest(prefix, limit) {
    // TODO : descendre jusqu'au nœud du préfixe, puis DFS par ordre alphabétique
    return []
  }
}`,
    solution: `class Trie {
  constructor() {
    this.root = { children: new Map(), end: false }
  }
  insert(word) {
    let node = this.root
    for (const ch of word) {
      let next = node.children.get(ch)
      if (next === undefined) {
        next = { children: new Map(), end: false }
        node.children.set(ch, next)
      }
      node = next
    }
    node.end = true
  }
  findNode(prefix) {
    let node = this.root
    for (const ch of prefix) {
      node = node.children.get(ch)
      if (node === undefined) return null
    }
    return node
  }
  search(word) {
    const node = this.findNode(word)
    return node !== null && node.end
  }
  startsWith(prefix) {
    const node = this.findNode(prefix)
    // la racine existe toujours : pour le préfixe vide, il faut au moins un mot
    return node !== null && (node.end || node.children.size > 0)
  }
  suggest(prefix, limit) {
    const out = []
    const start = this.findNode(prefix)
    if (start === null) return out
    // DFS itératif ; les enfants sont empilés en ordre inverse pour sortir en ordre alphabétique
    const stack = [[start, prefix]]
    while (stack.length > 0 && out.length < limit) {
      const [node, word] = stack.pop()
      if (node.end) out.push(word)
      const keys = [...node.children.keys()].sort()
      for (let i = keys.length - 1; i >= 0; i--) stack.push([node.children.get(keys[i]), word + keys[i]])
    }
    return out
  }
}`,
    solutionEquiv: {
      python: `class TrieNode:
    __slots__ = ("children", "end")
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def find_node(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self.find_node(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        node = self.find_node(prefix)
        return node is not None and (node.end or len(node.children) > 0)

    def suggest(self, prefix, limit):
        out = []
        start = self.find_node(prefix)
        if start is None:
            return out
        stack = [(start, prefix)]
        while stack and len(out) < limit:
            node, word = stack.pop()
            if node.end:
                out.append(word)
            for ch in sorted(node.children, reverse=True):
                stack.append((node.children[ch], word + ch))
        return out`,
      java: `class Trie {
    private static class Node {
        // TreeMap : les enfants sont déjà triés, pas besoin de trier à chaque suggestion
        final TreeMap<Character, Node> children = new TreeMap<>();
        boolean end;
    }
    private final Node root = new Node();

    void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) node = node.children.computeIfAbsent(c, x -> new Node());
        node.end = true;
    }
    private Node findNode(String prefix) {
        Node node = root;
        for (char c : prefix.toCharArray()) {
            node = node.children.get(c);
            if (node == null) return null;
        }
        return node;
    }
    boolean search(String word) { Node n = findNode(word); return n != null && n.end; }
    boolean startsWith(String prefix) {
        Node n = findNode(prefix);
        return n != null && (n.end || !n.children.isEmpty());
    }
    List<String> suggest(String prefix, int limit) {
        List<String> out = new ArrayList<>();
        Node start = findNode(prefix);
        if (start == null) return out;
        Deque<Map.Entry<Node, String>> stack = new ArrayDeque<>();
        stack.push(Map.entry(start, prefix));
        while (!stack.isEmpty() && out.size() < limit) {
            Map.Entry<Node, String> top = stack.pop();
            Node node = top.getKey();
            if (node.end) out.add(top.getValue());
            for (Map.Entry<Character, Node> e : node.children.descendingMap().entrySet())
                stack.push(Map.entry(e.getValue(), top.getValue() + e.getKey()));
        }
        return out;
    }
}`,
      rust: `use std::collections::BTreeMap;

// BTreeMap garde les enfants triés : l'ordre alphabétique est gratuit
#[derive(Default)]
struct Trie {
    children: BTreeMap<char, Trie>,
    end: bool,
}

impl Trie {
    fn insert(&mut self, word: &str) {
        let mut node = self;
        for ch in word.chars() {
            node = node.children.entry(ch).or_default();
        }
        node.end = true;
    }
    fn find_node(&self, prefix: &str) -> Option<&Trie> {
        let mut node = self;
        for ch in prefix.chars() {
            node = node.children.get(&ch)?;
        }
        Some(node)
    }
    fn search(&self, word: &str) -> bool {
        self.find_node(word).map_or(false, |n| n.end)
    }
    fn starts_with(&self, prefix: &str) -> bool {
        self.find_node(prefix).map_or(false, |n| n.end || !n.children.is_empty())
    }
    fn suggest(&self, prefix: &str, limit: usize) -> Vec<String> {
        let mut out = Vec::new();
        let Some(start) = self.find_node(prefix) else { return out };
        let mut stack = vec![(start, prefix.to_string())];
        while let Some((node, word)) = stack.pop() {
            if out.len() == limit { break; }
            if node.end { out.push(word.clone()); }
            for (ch, child) in node.children.iter().rev() {
                stack.push((child, format!("{}{}", word, ch)));
            }
        }
        out
    }
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `const t = new Trie()
for (const w of ['car', 'card', 'care', 'cat', 'dog']) t.insert(w)
assertEqual(t.search('ca'), false)
assertEqual(t.search('car'), true)
assertEqual(t.startsWith('ca'), true)
assertEqual(t.suggest('car', 2), ['car', 'card'])
assertEqual(t.suggest('ca', 10), ['car', 'card', 'care', 'cat'])` },
      { name: 'mot préfixe d’un autre', code: `const t = new Trie()
t.insert('apple')
assertEqual(t.search('app'), false)
assertEqual(t.startsWith('app'), true)
t.insert('app')
assertEqual(t.search('app'), true)
assertEqual(t.search('apple'), true)
assertEqual(t.search('apples'), false)` },
      { name: 'préfixe absent et trie vide', code: `const t = new Trie()
assertEqual(t.startsWith(''), false, 'aucun mot : même le préfixe vide est absent')
assertEqual(t.suggest('a', 3), [])
t.insert('bonjour')
assertEqual(t.startsWith(''), true)
assertEqual(t.startsWith('bon'), true)
assertEqual(t.startsWith('bons'), false)
assertEqual(t.suggest('x', 3), [])` },
      { name: 'ordre alphabétique indépendant de l’ordre d’insertion', code: `const t = new Trie()
for (const w of ['zebre', 'abc', 'abd', 'ab', 'a', 'b']) t.insert(w)
assertEqual(t.suggest('', 10), ['a', 'ab', 'abc', 'abd', 'b', 'zebre'])
assertEqual(t.suggest('ab', 2), ['ab', 'abc'])
assertEqual(t.suggest('', 0), [])` },
      { name: 'insertion en double', code: `const t = new Trie()
t.insert('to')
t.insert('to')
assertEqual(t.suggest('t', 5), ['to'])` },
      { name: 'grande entrée : 50 000 mots, 50 000 requêtes', code: `const t = new Trie()
const words = []
let seed = 7
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648)
for (let i = 0; i < 50000; i++) {
  let w = ''
  const len = 3 + (rnd() % 6)
  for (let j = 0; j < len; j++) w += String.fromCharCode(97 + (rnd() % 26))
  words.push(w)
}
const t0 = performance.now()
for (const w of words) t.insert(w)
let found = 0
for (const w of words) if (t.search(w) && t.startsWith(w.slice(0, 2))) found++
const s = t.suggest('ab', 5)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assertEqual(found, 50000)
const expected = [...new Set(words.filter((w) => w.startsWith('ab')))].sort().slice(0, 5)
assertEqual(s, expected)` },
    ],
    hints: [
      'Chaque nœud contient une `Map` lettre → enfant et un booléen `end` (« un mot se termine ici »). `insert` crée les nœuds manquants le long du mot.',
      'Factorisez une méthode `findNode(prefix)` qui suit les lettres et renvoie le nœud atteint ou `null` : `search` teste en plus `end`, `startsWith` teste seulement l’existence.',
      'Pour `suggest`, faites un DFS depuis le nœud du préfixe en visitant les enfants par ordre alphabétique (pré-ordre : le mot du nœud avant ceux de ses enfants), et arrêtez-vous à `limit` mots.',
    ],
    discussion: `**Complexité** : \`insert\`, \`search\`, \`startsWith\` en O(L) où L est la longueur du mot ou du préfixe ; \`suggest\` en O(P + nœuds visités jusqu'à trouver \`limit\` mots), plus le tri des enfants (au plus 26 par nœud). Mémoire : O(somme des longueurs des mots) dans le pire cas, beaucoup moins quand les mots partagent des préfixes.

**Points à évoquer** :

- **pourquoi pas un tableau de mots et \`filter(startsWith)\`** ? C'est O(N·L) par requête, alors que le trie ne dépend pas du nombre de mots ;
- \`Map\` (souple, alphabet quelconque) ou tableau de 26 cases (plus rapide, plus gourmand en mémoire pour les nœuds clairsemés) ;
- le pré-ordre avec enfants triés donne exactement l'ordre lexicographique, car un mot est toujours avant ses prolongements ;
- en production, l'autocomplétion classe par **popularité** : on stocke dans chaque nœud les k meilleurs mots de son sous-arbre (mis à jour à l'insertion), et la suggestion devient O(L) ;
- variantes : recherche de mots dans une grille (Word Search II, backtracking guidé par le trie), jokers \`.\` (DFS sur tous les enfants), plus long préfixe commun, compression des chaînes sans embranchement (radix tree).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-serialiser-arbre',
    title: 'Sérialiser et désérialiser un arbre',
    difficulty: 'difficile',
    theme: 'arbres',
    pattern: 'BFS avec marqueurs de null',
    statement: `Écrivez deux fonctions :

- \`serialize(root)\` transforme un arbre binaire en **chaîne** ;
- \`deserialize(data)\` reconstruit l'arbre à partir de cette chaîne.

Le format est libre, mais \`deserialize(serialize(root))\` doit redonner un arbre **identique** : même forme, mêmes valeurs. Les valeurs sont des entiers (éventuellement négatifs ou nuls).

${TREE_FORMAT}

Les nœuds reconstruits doivent être des objets \`{ val, left, right }\` sans autre propriété. L'arbre peut être très **profond** (un test utilise une chaîne de 100 000 nœuds) : évitez la récursion.

Exemple : avec un format niveau par niveau, \`[1, 2, 3, null, null, 4, 5]\` pourrait devenir \`'1,2,3,#,#,4,5'\`.`,
    starter: `function serialize(root) {
  // TODO : parcours en largeur, '#' pour un enfant absent
  return root === null ? '' : String(root.val)
}

function deserialize(data) {
  // TODO : relire les valeurs dans le même ordre avec une file
  return data === '' ? null : { val: Number(data), left: null, right: null }
}`,
    solution: `function serialize(root) {
  if (root === null) return ''
  const out = []
  const queue = [root]
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    if (node === null) {
      out.push('#')
      continue
    }
    out.push(String(node.val))
    queue.push(node.left, node.right) // les null sont mis en file pour être notés
  }
  while (out[out.length - 1] === '#') out.pop() // les '#' finaux sont inutiles
  return out.join(',')
}

function deserialize(data) {
  if (data === '') return null
  const tokens = data.split(',')
  const root = { val: Number(tokens[0]), left: null, right: null }
  const queue = [root]
  let i = 1
  for (let head = 0; head < queue.length && i < tokens.length; head++) {
    const node = queue[head]
    // chaque nœud consomme deux jetons : son enfant gauche puis son enfant droit
    if (i < tokens.length && tokens[i] !== '#') {
      node.left = { val: Number(tokens[i]), left: null, right: null }
      queue.push(node.left)
    }
    i++
    if (i < tokens.length && tokens[i] !== '#') {
      node.right = { val: Number(tokens[i]), left: null, right: null }
      queue.push(node.right)
    }
    i++
  }
  return root
}`,
    solutionEquiv: {
      python: `from collections import deque

def serialize(root):
    if root is None:
        return ""
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append("#")
            continue
        out.append(str(node.val))
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] == "#":
        out.pop()
    return ",".join(out)

def deserialize(data):
    if data == "":
        return None
    tokens = data.split(",")
    root = TreeNode(int(tokens[0]))
    queue, i = deque([root]), 1
    while queue and i < len(tokens):
        node = queue.popleft()
        if i < len(tokens) and tokens[i] != "#":
            node.left = TreeNode(int(tokens[i]))
            queue.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != "#":
            node.right = TreeNode(int(tokens[i]))
            queue.append(node.right)
        i += 1
    return root`,
      java: `public String serialize(TreeNode root) {
    if (root == null) return "";
    List<String> out = new ArrayList<>();
    Deque<TreeNode> queue = new LinkedList<>(); // LinkedList accepte les null, pas ArrayDeque
    queue.add(root);
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        if (node == null) { out.add("#"); continue; }
        out.add(String.valueOf(node.val));
        queue.add(node.left);
        queue.add(node.right);
    }
    while (!out.isEmpty() && out.get(out.size() - 1).equals("#")) out.remove(out.size() - 1);
    return String.join(",", out);
}

public TreeNode deserialize(String data) {
    if (data.isEmpty()) return null;
    String[] tokens = data.split(",");
    TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    int i = 1;
    while (!queue.isEmpty() && i < tokens.length) {
        TreeNode node = queue.poll();
        if (i < tokens.length && !tokens[i].equals("#")) {
            node.left = new TreeNode(Integer.parseInt(tokens[i]));
            queue.add(node.left);
        }
        i++;
        if (i < tokens.length && !tokens[i].equals("#")) {
            node.right = new TreeNode(Integer.parseInt(tokens[i]));
            queue.add(node.right);
        }
        i++;
    }
    return root;
}`,
    },
    tests: [
      { name: 'aller-retour sur l’exemple', code: `${TREE_HELPERS}
const root = fromLevel([1, 2, 3, null, null, 4, 5])
const s = serialize(root)
assertEqual(typeof s, 'string')
assertEqual(deserialize(s), root)` },
      { name: 'arbre vide', code: `const s = serialize(null)
assertEqual(typeof s, 'string')
assertEqual(deserialize(s), null)` },
      { name: 'nœud seul, zéro et négatifs', code: `${TREE_HELPERS}
for (const arr of [[0], [-7], [-1, 0, -100], [10, -20, null, 0]]) {
  const root = fromLevel(arr)
  assertEqual(deserialize(serialize(root)), root, 'arbre ' + JSON.stringify(arr))
}` },
      { name: 'formes asymétriques', code: `${TREE_HELPERS}
for (const arr of [[1, null, 2, null, 3], [1, 2, null, 3, null, 4], [5, 4, 7, 3, null, 2, null, -1, null, 9]]) {
  const root = fromLevel(arr)
  assertEqual(deserialize(serialize(root)), root, 'arbre ' + JSON.stringify(arr))
}` },
      { name: 'arbre complet de 1 023 nœuds', code: `${TREE_HELPERS}
const root = fromLevel(Array.from({ length: 1023 }, (_, i) => i * 3 - 500))
assertEqual(deserialize(serialize(root)), root)` },
      { name: 'grande entrée : chaîne de 100 000 nœuds', code: `const n = 100000
let root = null
for (let v = n; v >= 1; v--) root = { val: v, left: null, right: root } // chaîne vers la droite
const t0 = performance.now()
const copy = deserialize(serialize(root))
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
// comparaison itérative (une comparaison récursive déborderait aussi)
let a = root
let b = copy
let count = 0
while (a !== null) {
  assert(b !== null && b.val === a.val && b.left === null, 'différence au nœud ' + a.val)
  a = a.right
  b = b.right
  count++
}
assert(b === null, 'la copie est trop longue')
assertEqual(count, n)` },
    ],
    hints: [
      'Un parcours seul est ambigu : notez explicitement les enfants absents avec un marqueur comme `#`.',
      'Sérialisation en largeur : une file dans laquelle on met aussi les `null` ; chaque nœud non nul écrit sa valeur et met en file ses deux enfants.',
      'Désérialisation : relire les jetons dans le même ordre avec une file de nœuds créés ; chaque nœud retiré consomme deux jetons (gauche, puis droite). Utilisez un indice de lecture plutôt que `shift()`.',
    ],
    discussion: `**Complexité** : O(n) en temps et en mémoire pour les deux fonctions (avec un indice de lecture dans la file ; \`shift()\` rendrait l'ensemble quadratique sur une grande entrée).

**Points à évoquer** :

- **préfixe récursif avec marqueurs** (\`1,2,#,#,3,4,#,#,5,#,#\`) : plus court à écrire, mais la récursion déborde sur un arbre de profondeur 10⁵ ; à proposer en précisant la limite ;
- \`JSON.stringify(root)\` fonctionne pour des objets simples, mais est verbeux, récursif lui aussi, et ne répond pas à la question posée en entretien ;
- **BST** : le préfixe seul, sans marqueurs, suffit (on reconstruit avec des bornes), ce qui donne un format plus compact ;
- choix du format : séparateur, valeurs négatives (le \`-\` ne doit pas servir de séparateur), éventuel encodage binaire pour la taille ;
- le format niveau par niveau sans les \`#\` finaux est exactement celui de LeetCode.`,
  },
)

quiz.push(
  {
    id: 'hi-q-arbres-infixe-bst',
    theme: 'arbres',
    kind: 'qcm',
    q: "Quel parcours d'un arbre binaire de recherche visite ses valeurs dans l'ordre croissant ?",
    choices: ['Infixe (gauche, nœud, droite)', 'Préfixe (nœud, gauche, droite)', 'Suffixe (gauche, droite, nœud)', 'En largeur, niveau par niveau'],
    answer: 0,
    why: "Dans un BST, tout le sous-arbre gauche est plus petit que le nœud, et tout le sous-arbre droit plus grand : visiter gauche, puis nœud, puis droite produit donc une suite croissante. C'est la clé du k-ième plus petit, de la validation par infixe et de la conversion BST → tableau trié.",
  },
  {
    id: 'hi-q-arbres-parcours-sortie',
    theme: 'arbres',
    kind: 'output',
    q: "Qu'affiche ce code ?",
    code: `const t = {
  val: 'A',
  left: { val: 'B', left: { val: 'D', left: null, right: null }, right: null },
  right: { val: 'C', left: { val: 'E', left: null, right: null }, right: { val: 'F', left: null, right: null } },
}
const out = []
function visit(n) {
  if (n === null) return
  visit(n.left)
  visit(n.right)
  out.push(n.val)
}
visit(t)
console.log(out.join(''))`,
    choices: ['DBEFCA', 'ABDCEF', 'DBAECF', 'ABCDEF'],
    answer: 0,
    why: "Le nœud est traité **après** ses deux sous-arbres : c'est un parcours suffixe. Sous-arbre gauche (D puis B), sous-arbre droit (E, F puis C), et enfin la racine A. ABDCEF serait le préfixe, DBAECF l'infixe et ABCDEF le parcours en largeur.",
  },
  {
    id: 'hi-q-arbres-bfs-sortie',
    theme: 'arbres',
    kind: 'output',
    q: "Qu'affiche ce code ?",
    code: `const t = {
  val: 1,
  left: { val: 2, left: { val: 4, left: null, right: null }, right: null },
  right: { val: 3, left: null, right: { val: 5, left: null, right: null } },
}
const order = []
const stack = [t]
while (stack.length > 0) {
  const n = stack.shift()
  order.push(n.val)
  if (n.left) stack.push(n.left)
  if (n.right) stack.push(n.right)
}
console.log(order.join(' '))`,
    choices: ['1 2 3 4 5', '1 2 4 3 5', '4 2 1 3 5', '1 3 5 2 4'],
    answer: 0,
    why: "Malgré son nom, `stack` est utilisé comme une **file** : `push` en fin, `shift` en tête. C'est donc un parcours en largeur : 1, puis 2 et 3, puis 4 et 5. Avec `pop()` à la place de `shift()`, on obtiendrait un parcours en profondeur (1 3 5 2 4).",
  },
  {
    id: 'hi-q-arbres-equilibre-naif',
    theme: 'arbres',
    kind: 'complexite',
    q: "Quelle est la complexité en temps, dans le pire cas, de `isBalanced` sur un arbre de n nœuds ?",
    code: `function height(node) {
  return node === null ? 0 : 1 + Math.max(height(node.left), height(node.right))
}
function isBalanced(node) {
  if (node === null) return true
  const okLeft = isBalanced(node.left)
  const okRight = isBalanced(node.right)
  return okLeft && okRight && Math.abs(height(node.left) - height(node.right)) <= 1
}
let root = null
for (let i = 0; i < 50; i++) root = { val: i, left: root, right: null }
isBalanced(root)`,
    choices: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'],
    answer: 0,
    why: "Chaque nœud est visité par `isBalanced`, et chacun appelle `height` sur ses deux sous-arbres, qui les reparcourt entièrement. Sur un arbre dégénéré (une chaîne), cela fait n + (n − 1) + … + 1 soit O(n²) ; sur un arbre équilibré, O(n log n). La version optimale remonte la hauteur (ou -1 pour « déséquilibré ») en un seul parcours suffixe : O(n).",
  },
  {
    id: 'hi-q-arbres-bst-recherche',
    theme: 'arbres',
    kind: 'complexite',
    q: "On insère dans un BST vide les valeurs 1, 2, 3, …, n dans cet ordre, puis on cherche n. Quelle est la complexité de cette recherche ?",
    code: `function insert(root, val) {
  const node = { val, left: null, right: null }
  if (root === null) return node
  let cur = root
  for (;;) {
    if (val < cur.val) { if (!cur.left) { cur.left = node; break } cur = cur.left }
    else { if (!cur.right) { cur.right = node; break } cur = cur.right }
  }
  return root
}
function search(root, val) {
  let cur = root
  while (cur !== null && cur.val !== val) cur = val < cur.val ? cur.left : cur.right
  return cur
}
const n = 1000
let root = null
for (let i = 1; i <= n; i++) root = insert(root, i)
search(root, n)`,
    choices: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    answer: 0,
    why: "Des valeurs insérées dans l'ordre croissant vont toujours à droite : l'arbre devient une chaîne de hauteur n, et la recherche de n parcourt tous les nœuds. Un BST n'offre O(log n) que s'il est équilibré ; c'est le rôle des arbres AVL ou rouge-noir (`TreeMap` en Java). Au passage, construire cet arbre a coûté O(n²).",
  },
  {
    id: 'hi-q-arbres-bug-bst',
    theme: 'arbres',
    kind: 'bug',
    q: "Cette fonction de validation de BST renvoie `true` pour l'arbre construit ici, qui n'est pourtant pas un BST. Pourquoi ?",
    code: `function isValidBST(node) {
  if (node === null) return true
  if (node.left && node.left.val >= node.val) return false
  if (node.right && node.right.val <= node.val) return false
  return isValidBST(node.left) && isValidBST(node.right)
}
const root = {
  val: 10,
  left: { val: 5, left: null, right: { val: 12, left: null, right: null } },
  right: { val: 15, left: null, right: null },
}
isValidBST(root)`,
    choices: [
      "Elle ne compare chaque nœud qu'à son parent : 12 est bien plus grand que 5, mais il est dans le sous-arbre gauche de 10",
      "Elle devrait utiliser `>` au lieu de `>=`",
      "Elle ne traite pas l'arbre vide",
      "Elle devrait visiter le sous-arbre droit avant le gauche",
    ],
    answer: 0,
    why: "La propriété de BST porte sur **tous** les ancêtres : un nœud du sous-arbre gauche de 10 doit être inférieur à 10, quel que soit son parent direct. Il faut transmettre un intervalle `(low, high)` vers le bas (`check(node.left, low, node.val)`, `check(node.right, node.val, high)`), ou vérifier que le parcours infixe est strictement croissant.",
  },
  {
    id: 'hi-q-arbres-bug-preordre',
    theme: 'arbres',
    kind: 'bug',
    q: "Ce parcours préfixe itératif doit produire `[1, 2, 3]` pour la racine 1, d'enfants 2 (gauche) et 3 (droite). Que produit-il, et pourquoi ?",
    code: `function preorder(root) {
  const out = []
  const stack = root ? [root] : []
  while (stack.length > 0) {
    const node = stack.pop()
    out.push(node.val)
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return out
}
preorder({ val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } })`,
    choices: [
      "`[1, 3, 2]` : la pile est LIFO, il faut empiler l'enfant droit avant le gauche",
      "`[2, 1, 3]` : il faut traiter le nœud après l'avoir dépilé",
      "Une boucle infinie : les nœuds sont empilés plusieurs fois",
      "`[1, 2, 3]` : le code est correct",
    ],
    answer: 0,
    why: "Le dernier élément empilé est le premier dépilé : en empilant gauche puis droite, on visite la droite d'abord. En inversant les deux `push`, on obtient bien nœud, gauche, droite. (Cet ordre « nœud, droite, gauche », retourné à la fin, donne d'ailleurs le parcours suffixe.)",
  },
  {
    id: 'hi-q-arbres-trie',
    theme: 'arbres',
    kind: 'qcm',
    q: "Un trie contient N mots de longueur moyenne L. Quel est le coût de `startsWith(prefix)` pour un préfixe de longueur P ?",
    choices: ['O(P), indépendamment de N', 'O(N · P)', 'O(log N)', 'O(N · L)'],
    answer: 0,
    why: "On suit au plus P arêtes depuis la racine, une par caractère, chaque pas coûtant O(1) (accès à une `Map` ou à un tableau de 26 cases). Le nombre de mots stockés n'intervient pas : c'est tout l'intérêt du trie par rapport à un `filter` sur un tableau de mots, en O(N · P).",
  },
)

pieges.push(
  {
    id: 'hi-p-arbres-bst-parent',
    title: 'Valider un BST en ne regardant que le parent',
    theme: 'arbres',
    question: "Qu'affiche ce code ?",
    code: `function isValidBST(node) {
  if (node === null) return true
  if (node.left !== null && node.left.val >= node.val) return false
  if (node.right !== null && node.right.val <= node.val) return false
  return isValidBST(node.left) && isValidBST(node.right)
}
//     5
//    / \\
//   4   6
//      / \\
//     3   7
const root = {
  val: 5,
  left: { val: 4, left: null, right: null },
  right: { val: 6, left: { val: 3, left: null, right: null }, right: { val: 7, left: null, right: null } },
}
console.log(isValidBST(root))`,
    output: `true`,
    explanation: "Chaque nœud respecte bien la règle avec son parent direct (3 < 6), mais 3 se trouve dans le sous-arbre **droit** de 5 et devrait donc être supérieur à 5. La propriété de BST est une contrainte venue de tous les ancêtres : on transmet vers le bas un intervalle ouvert `(low, high)` qui se resserre à chaque descente.",
    fix: {
      code: `function isValidBST(node, low = -Infinity, high = Infinity) {
  if (node === null) return true
  if (node.val <= low || node.val >= high) return false
  return isValidBST(node.left, low, node.val) && isValidBST(node.right, node.val, high)
}
const root = {
  val: 5,
  left: { val: 4, left: null, right: null },
  right: { val: 6, left: { val: 3, left: null, right: null }, right: { val: 7, left: null, right: null } },
}
console.log(isValidBST(root))`,
      output: `false`,
    },
  },
  {
    id: 'hi-p-arbres-zero-falsy',
    title: 'Le nœud de valeur 0 qui disparaît',
    theme: 'arbres',
    question: "On construit un arbre depuis le format LeetCode, puis on compte ses nœuds. Qu'affiche ce code ?",
    code: `function fromLevel(values) {
  if (!values[0]) return null
  const root = { val: values[0], left: null, right: null }
  const queue = [root]
  let head = 0
  for (let i = 1; i < values.length; i += 2) {
    const node = queue[head++]
    if (values[i]) queue.push(node.left = { val: values[i], left: null, right: null })
    if (values[i + 1]) queue.push(node.right = { val: values[i + 1], left: null, right: null })
  }
  return root
}
const count = (n) => (n === null ? 0 : 1 + count(n.left) + count(n.right))
console.log(count(fromLevel([1, 0, 2])), count(fromLevel([0, 1, 2])))`,
    output: `2 0`,
    explanation: "Les tests `if (values[i])` traitent `0` comme `null`, car `0` est *falsy* : le nœud 0 n'est pas créé, et un arbre de racine 0 devient l'arbre vide. Pire, sur un arbre plus grand, le décalage entre la file et le tableau ferait accrocher les nœuds suivants aux mauvais parents. Pour un « absent », testez explicitement `values[i] !== null` (et `i < values.length`).",
    fix: {
      code: `function fromLevel(values) {
  if (values.length === 0 || values[0] === null) return null
  const root = { val: values[0], left: null, right: null }
  const queue = [root]
  let head = 0
  for (let i = 1; i < values.length; i += 2) {
    const node = queue[head++]
    if (values[i] !== null) queue.push(node.left = { val: values[i], left: null, right: null })
    if (i + 1 < values.length && values[i + 1] !== null) queue.push(node.right = { val: values[i + 1], left: null, right: null })
  }
  return root
}
const count = (n) => (n === null ? 0 : 1 + count(n.left) + count(n.right))
console.log(count(fromLevel([1, 0, 2])), count(fromLevel([0, 1, 2])))`,
      output: `3 3`,
    },
  },
  {
    id: 'hi-p-arbres-recursion-chaine',
    title: 'Récursion sur un arbre dégénéré',
    theme: 'arbres',
    question: "On insère 1 à 100 000 dans un BST, puis on calcule sa hauteur récursivement. Qu'affiche ce code ?",
    code: `const n = 100000
const root = { val: 1, left: null, right: null }
let last = root
for (let v = 2; v <= n; v++) { // insérer des valeurs croissantes : toujours à droite du dernier
  last.right = { val: v, left: null, right: null }
  last = last.right
}
function height(node) {
  return node === null ? 0 : 1 + Math.max(height(node.left), height(node.right))
}
try {
  console.log(height(root))
} catch (e) {
  console.log(e instanceof RangeError, e.message)
}`,
    output: `true Maximum call stack size exceeded`,
    explanation: "Insérer des valeurs déjà triées dans un BST non équilibré produit une **chaîne** de hauteur n. Toute récursion qui suit cette chaîne empile n frames, et la pile de V8 n'en tient que quelques milliers à quelques dizaines de milliers. Deux leçons : un BST sans équilibrage peut dégénérer, et sur des données potentiellement profondes, un parcours itératif (pile ou file explicite) est plus sûr.",
    fix: {
      code: `const n = 100000
const root = { val: 1, left: null, right: null }
let last = root
for (let v = 2; v <= n; v++) {
  last.right = { val: v, left: null, right: null }
  last = last.right
}
function height(root) { // BFS : on compte les niveaux
  let depth = 0
  let level = root ? [root] : []
  while (level.length > 0) {
    depth++
    const next = []
    for (const node of level) {
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next
  }
  return depth
}
console.log(height(root))`,
      output: `100000`,
    },
  },
)

flashcards.push(
  {
    id: 'hi-f-arbres-gabarit',
    theme: 'arbres',
    front: "Le gabarit récursif universel sur un arbre binaire ?",
    back: "Trois questions : que vaut le cas `null` ? Que me renvoient mes deux sous-arbres ? Comment les combiner ? Si la réponse globale diffère de la valeur remontée (diamètre, somme de chemin maximale), la mettre à jour dans une variable extérieure. O(n) en temps, O(h) en pile.",
    code: `function height(node) {
  if (node === null) return 0
  return 1 + Math.max(height(node.left), height(node.right))
}
height({ val: 1, left: { val: 2, left: null, right: null }, right: null }) // → 2`,
  },
  {
    id: 'hi-f-arbres-parcours',
    theme: 'arbres',
    front: "Préfixe, infixe, suffixe : ordre et usage ?",
    back: "Préfixe = nœud, gauche, droite (copier, sérialiser). Infixe = gauche, nœud, droite (BST → valeurs triées). Suffixe = gauche, droite, nœud (calculer depuis les enfants : hauteur, taille, libération).",
  },
  {
    id: 'hi-f-arbres-infixe-iteratif',
    theme: 'arbres',
    front: "Écrire le parcours infixe itératif ?",
    back: "Tant que `node !== null` ou que la pile n'est pas vide : descendre à gauche en empilant ; dépiler et traiter ; passer à `node.right`. O(n) en temps, O(h) en mémoire, sans risque de débordement de la pile d'appels.",
  },
  {
    id: 'hi-f-arbres-bfs',
    theme: 'arbres',
    front: "Parcours par niveaux en JavaScript sans `shift()` ?",
    back: "Garder le niveau courant dans un tableau, construire le tableau du niveau suivant avec les enfants, puis remplacer. Ou utiliser un indice de lecture `head` dans un tableau qu'on ne raccourcit pas. `shift()` est O(n) : un BFS qui l'utilise devient O(n²).",
  },
  {
    id: 'hi-f-arbres-valider-bst',
    theme: 'arbres',
    front: "Valider un BST : l'erreur classique et la bonne méthode ?",
    back: "Erreur : comparer chaque nœud à ses seuls enfants. Méthode : transmettre un intervalle ouvert `(low, high)`, initialement `(-Infinity, Infinity)` ; à gauche la borne haute devient `node.val`, à droite la borne basse. Ou vérifier que l'infixe est strictement croissant.",
  },
  {
    id: 'hi-f-arbres-lca',
    theme: 'arbres',
    front: "Plus proche ancêtre commun (LCA) : BST et arbre quelconque ?",
    back: "BST : descendre depuis la racine ; si p et q sont tous deux plus petits, aller à gauche, tous deux plus grands, à droite, sinon le nœud courant est le LCA (O(h)). Arbre quelconque : renvoyer le nœud s'il vaut p ou q, sinon combiner ; le nœud qui reçoit un résultat non nul des deux côtés est le LCA (O(n)).",
  },
  {
    id: 'hi-f-arbres-diametre',
    theme: 'arbres',
    front: "Diamètre d'un arbre binaire en O(n) ?",
    back: "Remonter la hauteur de chaque sous-arbre ; en chaque nœud, `l + r` est la longueur (en arêtes) du plus long chemin dont il est le sommet ; garder le maximum dans une variable extérieure. Le chemin ne passe pas forcément par la racine.",
  },
  {
    id: 'hi-f-arbres-trie',
    theme: 'arbres',
    front: "Trie : structure d'un nœud, complexités, signaux de reconnaissance ?",
    back: "Nœud = enfants indexés par caractère (`Map` ou tableau de 26) + booléen `end`. `insert`, `search`, `startsWith` en O(L), indépendamment du nombre de mots. À reconnaître dès qu'un énoncé parle de préfixes : autocomplétion, dictionnaire, recherche de mots dans une grille.",
  },
)

lexique.push(
  {
    term: 'Arbre binaire',
    theme: 'arbres',
    def: "Structure hiérarchique dont chaque nœud a au plus deux enfants, `left` et `right`. Vocabulaire : racine (sans parent), feuille (sans enfant), profondeur d'un nœud (distance à la racine), hauteur de l'arbre (profondeur maximale).",
    see: ['Arbre binaire de recherche (BST)', 'Arbre équilibré'],
  },
  {
    term: 'Arbre binaire de recherche (BST)',
    theme: 'arbres',
    def: "Arbre binaire où, pour chaque nœud, toutes les valeurs du sous-arbre gauche sont plus petites et toutes celles du sous-arbre droit plus grandes. Recherche, insertion et suppression en O(h) ; le parcours infixe donne les valeurs triées.",
    see: ['Parcours infixe', 'Arbre équilibré'],
  },
  {
    term: 'Arbre équilibré',
    theme: 'arbres',
    def: "Arbre dont la hauteur reste en O(log n). Au sens de LeetCode : en chaque nœud, les hauteurs des deux sous-arbres diffèrent d'au plus 1. Les AVL et les arbres rouge-noir rééquilibrent automatiquement un BST (`TreeMap` en Java) ; sans cela, des insertions triées produisent une chaîne de hauteur n.",
    see: ['Arbre binaire de recherche (BST)'],
  },
  {
    term: 'Parcours infixe',
    theme: 'arbres',
    def: "Parcours en profondeur qui visite le sous-arbre gauche, puis le nœud, puis le sous-arbre droit (inorder). Sur un BST, il produit les valeurs dans l'ordre croissant. Ses cousins : préfixe (nœud d'abord) et suffixe (nœud en dernier).",
    see: ['Arbre binaire de recherche (BST)'],
  },
  {
    term: 'Plus proche ancêtre commun (LCA)',
    theme: 'arbres',
    def: "Pour deux nœuds p et q, le nœud le plus profond qui les a tous deux pour descendants (un nœud est son propre descendant). Lowest Common Ancestor : O(h) dans un BST en descendant selon les valeurs, O(n) dans un arbre quelconque par une récursion qui remonte p ou q.",
    see: ['Arbre binaire'],
  },
  {
    term: 'Trie',
    theme: 'arbres',
    def: "Arbre préfixe : chaque arête porte un caractère, chaque nœud un indicateur de fin de mot. Insertion, recherche et test de préfixe en O(L), où L est la longueur du mot, quel que soit le nombre de mots stockés. Base de l'autocomplétion.",
  },
  {
    term: 'Sérialisation d’arbre',
    theme: 'arbres',
    def: "Transformation d'un arbre en chaîne (et retour) qui permet de le reconstruire à l'identique. Il faut noter les enfants absents (marqueur comme `#`) dans un parcours préfixe ou en largeur ; le format de LeetCode est un parcours en largeur avec `null`.",
    see: ['Arbre binaire'],
  },
)

entretien.push(
  {
    id: 'hi-e-arbres-recursion-ou-iteration',
    section: 'techniques',
    q: "Sur un arbre, quand préférer un parcours itératif à la récursion ?",
    answer: `La récursion est le choix naturel : le code suit la définition de l'arbre et se lit facilement. Sa limite est la **pile d'appels**, dont la profondeur égale la hauteur de l'arbre :

- arbre équilibré : hauteur O(log n), environ 17 niveaux pour 10⁵ nœuds, aucun problème ;
- arbre dégénéré (BST rempli avec des valeurs triées, liste déguisée) : hauteur n, et V8 lève \`RangeError\` au-delà de quelques milliers à dizaines de milliers de niveaux.

On passe donc à l'itératif quand l'arbre peut être profond et vient de données non maîtrisées, ou quand on veut **s'arrêter tôt** proprement (k-ième plus petit, itérateur de BST avec \`next()\`). Les outils : une pile explicite pour la profondeur (préfixe, infixe ; suffixe via « nœud, droite, gauche » inversé), une file pour la largeur.

À dire aussi : JavaScript ne garantit pas l'optimisation des appels terminaux, et la plupart des récursions sur arbre ne sont de toute façon pas terminales.`,
    attendu: "Lier la profondeur de récursion à la hauteur, savoir quand elle devient dangereuse et écrire au moins l'infixe itératif.",
  },
  {
    id: 'hi-e-arbres-bst-vs-hash',
    section: 'structures',
    q: "BST équilibré ou table de hachage : lequel choisir pour stocker des clés ?",
    answer: `La table de hachage (\`Map\`) offre recherche, insertion et suppression en **O(1) en moyenne**, mais aucun ordre exploitable sur les clés.

Un BST équilibré (AVL, rouge-noir ; \`TreeMap\` en Java, \`BTreeMap\` en Rust) garantit **O(log n) dans le pire cas** et garde les clés **triées**, ce qui permet :

- minimum et maximum en O(log n) ;
- successeur et prédécesseur (« la plus petite clé ≥ x », \`ceilingKey\`) ;
- requêtes par intervalle (toutes les clés entre a et b) ;
- k-ième élément, si chaque nœud stocke la taille de son sous-arbre.

On choisit donc le hachage pour un simple dictionnaire, et l'arbre ordonné pour un calendrier de réservations (chevauchements), un carnet d'ordres ou toute question du type « le plus proche de x ». JavaScript n'ayant pas d'arbre ordonné standard, on s'en sort souvent en entretien avec un tableau trié + recherche dichotomique (insertion en O(n)) ou un tas si l'on n'a besoin que du minimum.`,
    attendu: "Opposer moyenne et pire cas, et surtout identifier les opérations d'ordre que le hachage ne sait pas faire.",
  },
  {
    id: 'hi-e-arbres-autocompletion',
    section: 'conception',
    q: "Comment concevriez-vous l'autocomplétion d'une barre de recherche ?",
    answer: `**Structure de base** : un trie des requêtes connues. Taper un préfixe revient à descendre de P nœuds, puis à énumérer les mots du sous-arbre.

**Classement** : on ne veut pas l'ordre alphabétique mais les suggestions les plus **populaires**. Plutôt que de parcourir tout le sous-arbre à chaque frappe, chaque nœud stocke ses k meilleures complétions (par exemple 5), mises à jour lors des insertions ou recalculées périodiquement. Une suggestion devient O(P).

**Contraintes réelles** à évoquer :

- volume : le trie est construit hors ligne à partir des journaux de requêtes et distribué (découpage par préfixe) ;
- latence : cache des préfixes courts (très demandés), requête annulée côté client à chaque nouvelle frappe (debounce) ;
- fraîcheur : agrégation des tendances par fenêtres de temps ;
- tolérance aux fautes de frappe : distance d'édition limitée, ou index de n-grammes.`,
    attendu: "Partir du trie, puis montrer qu'on sait l'adapter au classement et aux contraintes de latence et de volume.",
  },
)

// =============================================================================
// TAS ET FILE DE PRIORITÉ
// =============================================================================

/** Tas binaire générique fourni dans les exemples et dans le code de départ des katas. */
const MINHEAP = `class MinHeap {
  // compare(a, b) < 0 signifie « a sort avant b » (comme pour Array.prototype.sort)
  constructor(compare = (a, b) => a - b) {
    this.compare = compare
    this.data = []
  }
  get size() {
    return this.data.length
  }
  peek() {
    return this.data[0]
  }
  push(value) {
    const a = this.data
    a.push(value)
    let i = a.length - 1
    while (i > 0) { // remonter (sift up) tant qu'on est « meilleur » que son parent
      const p = (i - 1) >> 1
      if (this.compare(a[i], a[p]) >= 0) break
      const t = a[i]; a[i] = a[p]; a[p] = t
      i = p
    }
  }
  pop() {
    const a = this.data
    if (a.length === 0) return undefined
    const top = a[0]
    const last = a.pop()
    if (a.length > 0) {
      a[0] = last
      let i = 0
      for (;;) { // descendre (sift down) vers le meilleur des deux enfants
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && this.compare(a[l], a[m]) < 0) m = l
        if (r < a.length && this.compare(a[r], a[m]) < 0) m = r
        if (m === i) break
        const t = a[i]; a[i] = a[m]; a[m] = t
        i = m
      }
    }
    return top
  }
}`

cours.push({
  id: 'tas',
  title: 'Tas et file de priorité',
  summary:
    "Un tas binaire donne le minimum (ou le maximum) en O(1) et l'insère ou le retire en O(log n) ; JavaScript n'en fournit pas, il faut donc savoir en écrire un, puis reconnaître ses usages : top-k, k-ième plus grand, fusion de k suites triées, médiane en flux, planification.",
  blocks: [
    { h: 'Pourquoi un tas, et comment il est rangé', id: 'tas-principe' },
    {
      p: "Une **file de priorité** est une collection dont on retire toujours l'élément le plus prioritaire (le plus petit, le plus urgent, le plus proche…). Un tableau trié donne le minimum en O(1) mais insère en O(n) ; un tableau non trié insère en O(1) mais cherche le minimum en O(n). Le **tas binaire** coupe la poire en deux : tout en O(log n), et le sommet en O(1).",
    },
    {
      p: "Un **tas min** est un arbre binaire **complet** (tous les niveaux sont pleins sauf le dernier, rempli de gauche à droite) où chaque nœud est inférieur ou égal à ses enfants. Le minimum est donc à la racine, mais rien n'est trié entre frères ou cousins. Comme l'arbre est complet, on le range dans un simple tableau, niveau par niveau, sans aucun pointeur :",
    },
    {
      list: [
        "la racine est à l'indice `0` ;",
        "les enfants du nœud `i` sont aux indices `2i + 1` et `2i + 2` ;",
        "le parent du nœud `i` est à l'indice `(i - 1) >> 1` (division entière par 2) ;",
        "la hauteur vaut ⌊log₂ n⌋ : c'est elle qui borne le coût des opérations.",
      ],
    },
    {
      table: [
        ['Opération', 'Tas binaire', 'Tableau trié', 'Tableau non trié'],
        ['Lire le minimum (`peek`)', 'O(1)', 'O(1)', 'O(n)'],
        ['Insérer (`push`)', 'O(log n)', 'O(n)', 'O(1)'],
        ['Retirer le minimum (`pop`)', 'O(log n)', 'O(1) (par la fin)', 'O(n)'],
        ['Construire à partir de n éléments', 'O(n) (heapify)', 'O(n log n)', 'O(1)'],
        ['Chercher une valeur quelconque', 'O(n)', 'O(log n)', 'O(n)'],
      ],
    },
    {
      p: "**JavaScript n'a pas de tas** dans sa bibliothèque standard (contrairement à `heapq` en Python, `PriorityQueue` en Java ou `BinaryHeap` en Rust). En entretien, deux attitudes sont acceptées : demander si l'on peut supposer qu'une classe `MinHeap` existe, ou l'écrire en quelques minutes. Il faut en être capable sans hésiter.",
    },
    {
      mnemo: "Enfants `2i + 1` et `2i + 2`, parent `(i - 1) >> 1`. Le tas ne trie pas : il garantit seulement que le sommet est le meilleur.",
      piege: "Croire que le tableau interne d'un tas est trié : `[1, 3, 2, 7, 4]` est un tas min valide. Seul le sommet est garanti.",
    },

    { h: 'Implémenter un MinHeap générique', id: 'tas-implementation' },
    {
      p: "Deux opérations internes suffisent. **Remonter** (*sift up*) : après un `push` en fin de tableau, on échange le nouvel élément avec son parent tant qu'il est plus petit. **Descendre** (*sift down*) : pour un `pop`, on met le dernier élément à la racine, puis on l'échange avec le plus petit de ses enfants tant que celui-ci est plus petit que lui. Le **comparateur** suit la convention de `Array.prototype.sort` : `compare(a, b) < 0` signifie que `a` est plus prioritaire. Un tas max s'obtient en inversant le comparateur, `(a, b) => b - a`, et l'on peut ranger des objets ou des paires, par exemple `(a, b) => a[0] - b[0]`.",
    },
    {
      title: 'MinHeap avec comparateur',
      code: `${MINHEAP}

const h = new MinHeap()
for (const x of [5, 3, 8, 1, 9, 2]) h.push(x)
console.log(h.peek(), h.size, h.data)
const sorted = []
while (h.size > 0) sorted.push(h.pop())
console.log(sorted, h.pop())

// tas max : il suffit d'inverser le comparateur
const max = new MinHeap((a, b) => b - a)
for (const x of [5, 3, 8, 1]) max.push(x)
console.log(max.pop(), max.pop())

// des objets : la tâche la plus prioritaire (plus petit p), puis l'ordre alphabétique
const tasks = new MinHeap((a, b) => a.p - b.p || a.name.localeCompare(b.name))
tasks.push({ name: 'déployer', p: 2 })
tasks.push({ name: 'corriger', p: 1 })
tasks.push({ name: 'analyser', p: 2 })
console.log(tasks.pop().name, tasks.pop().name, tasks.pop().name)`,
      output: `1 6 [ 1, 3, 2, 5, 9, 8 ]
[ 1, 2, 3, 5, 8, 9 ] undefined
8 5
corriger analyser déployer`,
      equiv: {
        python: `import heapq

# heapq travaille directement sur une liste : c'est un tas MIN
h = []
for x in [5, 3, 8, 1, 9, 2]:
    heapq.heappush(h, x)
smallest = h[0]                                   # peek
ordered = [heapq.heappop(h) for _ in range(len(h))]

# tas max : on stocke les opposés
mx = []
for x in [5, 3, 8, 1]:
    heapq.heappush(mx, -x)
first, second = -heapq.heappop(mx), -heapq.heappop(mx)

# objets : des tuples, comparés élément par élément (priorité, puis nom)
tasks = []
heapq.heappush(tasks, (2, "déployer"))
heapq.heappush(tasks, (1, "corriger"))
heapq.heappush(tasks, (2, "analyser"))
names = [heapq.heappop(tasks)[1] for _ in range(3)]`,
        java: `// PriorityQueue est un tas MIN ; un Comparator change l'ordre
PriorityQueue<Integer> h = new PriorityQueue<>();
for (int x : new int[] {5, 3, 8, 1, 9, 2}) h.offer(x);
int smallest = h.peek();
List<Integer> ordered = new ArrayList<>();
while (!h.isEmpty()) ordered.add(h.poll());   // poll() renvoie null si vide

PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());

record Task(String name, int p) {}
PriorityQueue<Task> tasks = new PriorityQueue<>(
    Comparator.comparingInt(Task::p).thenComparing(Task::name));`,
        rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

// BinaryHeap est un tas MAX : pour un tas min, on enveloppe dans Reverse
let mut h = BinaryHeap::new();
for x in [5, 3, 8, 1, 9, 2] {
    h.push(Reverse(x));
}
let smallest = h.peek().map(|Reverse(x)| *x);      // Some(1)
let mut ordered = Vec::new();
while let Some(Reverse(x)) = h.pop() {             // pop() renvoie None si vide
    ordered.push(x);
}

let mut max = BinaryHeap::from(vec![5, 3, 8, 1]);  // tas max direct
let first = max.pop();                             // Some(8)

// objets : des tuples, comparés dans l'ordre des champs
let mut tasks = BinaryHeap::new();
tasks.push(Reverse((2, "déployer")));
tasks.push(Reverse((1, "corriger")));
tasks.push(Reverse((2, "analyser")));`,
        php: `// SplMinHeap / SplMaxHeap ; on peut surcharger compare() (attention : sens inversé)
$h = new SplMinHeap();
foreach ([5, 3, 8, 1, 9, 2] as $x) $h->insert($x);
$smallest = $h->top();
$ordered = [];
while (!$h->isEmpty()) $ordered[] = $h->extract();

$max = new SplMaxHeap();

// SplPriorityQueue : la PLUS GRANDE priorité sort en premier
$tasks = new SplPriorityQueue();
$tasks->insert('corriger', -1);   // priorité 1 la plus urgente : on l'inverse
$tasks->insert('déployer', -2);
$next = $tasks->extract();        // 'corriger'`,
      },
    },
    {
      p: "Repérez les **sens par défaut** dans chaque langage, source d'erreurs fréquentes : `heapq` (Python) et `PriorityQueue` (Java) sont des tas **min** ; `BinaryHeap` (Rust), `SplMaxHeap` et `SplPriorityQueue` (PHP) sont des tas **max**. En Python, on simule un tas max en stockant `-x` ; en Rust, on obtient un tas min avec `Reverse(x)`.",
    },
    {
      mnemo: "Push : ajouter en bas, remonter. Pop : le dernier monte en haut, puis redescend vers le plus petit enfant.",
      piege: "Un comparateur qui renvoie un booléen (`(a, b) => a < b`) ne vaut jamais moins que zéro : le tas ne remonte rien et le « minimum » devient le premier élément inséré.",
    },

    { h: 'Heapify en O(n) et tri par tas', id: 'tas-heapify' },
    {
      p: "Construire un tas en faisant n `push` coûte O(n log n). On peut faire mieux : déposer les n éléments tels quels dans le tableau, puis appliquer *sift down* à chaque nœud interne, **du dernier parent (`(n >> 1) - 1`) jusqu'à la racine**. La moitié des nœuds sont des feuilles (rien à faire), un quart descend d'au plus un niveau, un huitième de deux… La somme Σ n/2^(h+1) · h converge vers O(n). C'est ce que fait `heapq.heapify` en Python et le constructeur `PriorityQueue(collection)` en Java.",
    },
    {
      p: "Le **tri par tas** s'en déduit : heapify en tas **max**, puis on échange la racine (le maximum) avec la dernière case et l'on redescend sur un tas raccourci d'une case, n fois. Résultat : O(n log n) dans **tous** les cas, en place, O(1) mémoire supplémentaire, mais pas stable et moins rapide en pratique que le tri rapide ou le Timsort (accès mémoire dispersés).",
    },
    {
      title: 'Heapify et tri par tas, en place',
      code: `function siftDown(a, i, n) { // tas MAX sur a[0..n-1]
  for (;;) {
    const l = 2 * i + 1
    const r = l + 1
    let m = i
    if (l < n && a[l] > a[m]) m = l
    if (r < n && a[r] > a[m]) m = r
    if (m === i) return
    const t = a[i]; a[i] = a[m]; a[m] = t
    i = m
  }
}

function heapSort(a) {
  const n = a.length
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, i, n) // heapify : O(n)
  for (let end = n - 1; end > 0; end--) {
    const t = a[0]; a[0] = a[end]; a[end] = t // le max va à sa place définitive
    siftDown(a, 0, end) // on répare le tas restant
  }
  return a
}

const a = [4, 10, 3, 5, 1, 8]
for (let i = (a.length >> 1) - 1; i >= 0; i--) siftDown(a, i, a.length)
console.log(a) // un tas max, pas un tableau trié
console.log(heapSort([4, 10, 3, 5, 1, 8, -2, 7]))`,
      output: `[ 10, 5, 8, 4, 1, 3 ]
[ -2, 1, 3, 4, 5, 7, 8, 10 ]`,
      equiv: {
        python: `import heapq

a = [4, 10, 3, 5, 1, 8]
heapq.heapify(a)            # tas MIN en O(n), en place
# tri par tas « à la Python » : O(n log n), mais pas en place
ordered = [heapq.heappop(a) for _ in range(len(a))]`,
        java: `// le constructeur à partir d'une collection fait un heapify en O(n)
PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(4, 10, 3, 5, 1, 8));`,
        rust: `use std::collections::BinaryHeap;

let heap = BinaryHeap::from(vec![4, 10, 3, 5, 1, 8]); // heapify en O(n)
let sorted = heap.into_sorted_vec();                   // tri par tas : ordre croissant`,
      },
    },

    { h: 'Top-k et k-ième plus grand', id: 'tas-top-k' },
    {
      p: "Pour garder les **k plus grands** éléments d'une suite, on maintient un tas **min** de taille k : son sommet est le plus petit des k meilleurs, c'est-à-dire le « seuil d'entrée ». Chaque nouvel élément plus grand que le sommet le remplace. À la fin, le sommet est le **k-ième plus grand**. Coût : O(n log k) en temps, O(k) en mémoire, et cela fonctionne sur un **flux** dont on ne connaît pas la fin. Le paradoxe à retenir : les k plus **grands** se gardent dans un tas **min** (et inversement).",
    },
    {
      title: 'k-ième plus grand avec un tas de taille k',
      code: `${MINHEAP}

function kthLargest(nums, k) {
  const heap = new MinHeap() // tas MIN des k plus grands vus jusqu'ici
  for (const x of nums) {
    if (heap.size < k) heap.push(x)
    else if (x > heap.peek()) {
      heap.pop() // on évince le plus petit des k meilleurs
      heap.push(x)
    }
  }
  return heap.peek()
}

console.log(kthLargest([3, 2, 1, 5, 6, 4], 2))
console.log(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))`,
      output: `5
4`,
      equiv: {
        python: `import heapq

def kth_largest(nums, k):
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)  # pop puis push en une seule descente
    return heap[0]

# raccourci de la bibliothèque standard : heapq.nlargest(k, nums)[-1]`,
        java: `static int kthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>(); // tas min
    for (int x : nums) {
        if (heap.size() < k) heap.offer(x);
        else if (x > heap.peek()) { heap.poll(); heap.offer(x); }
    }
    return heap.peek();
}`,
        rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

fn kth_largest(nums: &[i32], k: usize) -> i32 {
    let mut heap = BinaryHeap::new(); // Reverse : tas min
    for &x in nums {
        if heap.len() < k {
            heap.push(Reverse(x));
        } else if x > heap.peek().unwrap().0 {
            heap.pop();
            heap.push(Reverse(x));
        }
    }
    heap.peek().unwrap().0
}`,
      },
    },
    {
      table: [
        ['Méthode', 'Temps', 'Mémoire', 'Quand la choisir'],
        ['Trier puis lire', 'O(n log n)', 'O(n) ou O(log n)', 'n petit, code le plus simple, plusieurs requêtes'],
        ['Tas min de taille k', 'O(n log k)', 'O(k)', 'k ≪ n, flux, données qui ne tiennent pas en mémoire'],
        ['Heapify + k pops', 'O(n + k log n)', 'O(n)', 'tout est en mémoire et k est moyen'],
        ['Quickselect', 'O(n) en moyenne, O(n²) au pire', 'O(1) (en place)', 'une seule requête, tableau modifiable ; pivot aléatoire'],
      ],
    },
    {
      p: "**Quickselect** reprend la partition du tri rapide mais ne descend que dans le côté qui contient la position cherchée : n + n/2 + n/4 + … = O(n) en moyenne. C'est la meilleure complexité, mais elle modifie le tableau, dégénère sans pivot aléatoire et ne marche pas sur un flux. En entretien, proposer le tas, puis citer quickselect comme optimisation, est la réponse attendue.",
    },
    {
      mnemo: "Les k plus grands dans un tas MIN de taille k (le sommet est le seuil à battre) ; les k plus petits dans un tas MAX.",
      piege: "Mettre tous les éléments dans un tas max puis faire k pops est correct, mais O(n log n) en temps et O(n) en mémoire : on perd tout l'intérêt du tas de taille k.",
    },

    { h: 'Fusionner k suites triées', id: 'tas-fusion-k' },
    {
      p: "Pour fusionner k listes ou tableaux triés, on place dans un tas la **tête** de chaque suite, sous forme de triplet `[valeur, indice de la suite, position]`. On retire le plus petit, on l'ajoute au résultat et l'on pousse l'élément suivant de la même suite. Le tas ne contient jamais plus de k éléments : O(N log k) pour N éléments au total. Concaténer puis trier coûterait O(N log N) et ignorerait que les suites sont déjà triées ; fusionner deux à deux en tournoi donne aussi O(N log k).",
    },
    {
      title: 'Fusion de k tableaux triés',
      code: `${MINHEAP}

function mergeK(arrays) {
  const heap = new MinHeap((a, b) => a[0] - b[0]) // [valeur, quelle suite, quelle position]
  arrays.forEach((arr, i) => {
    if (arr.length > 0) heap.push([arr[0], i, 0])
  })
  const out = []
  while (heap.size > 0) {
    const [val, i, j] = heap.pop()
    out.push(val)
    if (j + 1 < arrays[i].length) heap.push([arrays[i][j + 1], i, j + 1])
  }
  return out
}

console.log(mergeK([[1, 4, 7], [2, 5], [], [0, 3, 6, 9]]))`,
      output: `[ 0, 1, 2, 3, 4, 5, 6, 7, 9 ]`,
      equiv: {
        python: `import heapq

def merge_k(arrays):
    heap = [(arr[0], i, 0) for i, arr in enumerate(arrays) if arr]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(arrays[i]):
            heapq.heappush(heap, (arrays[i][j + 1], i, j + 1))
    return out

# raccourci : list(heapq.merge(*arrays)), paresseux et en O(N log k)`,
        java: `static List<Integer> mergeK(int[][] arrays) {
    // int[] {valeur, suite, position}, comparé sur la valeur
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    for (int i = 0; i < arrays.length; i++)
        if (arrays[i].length > 0) heap.offer(new int[] {arrays[i][0], i, 0});
    List<Integer> out = new ArrayList<>();
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        out.add(top[0]);
        int i = top[1], j = top[2];
        if (j + 1 < arrays[i].length) heap.offer(new int[] {arrays[i][j + 1], i, j + 1});
    }
    return out;
}`,
      },
    },

    { h: 'Médiane en flux : deux tas', id: 'tas-mediane' },
    {
      p: "Pour connaître la médiane d'un flux à tout instant, on coupe les valeurs vues en deux moitiés : un **tas max** `low` pour la moitié basse et un **tas min** `high` pour la moitié haute. Invariants : tout élément de `low` est inférieur ou égal à tout élément de `high`, et `low` a autant d'éléments que `high`, ou un de plus. La médiane se lit alors au sommet : `low.peek()` si le total est impair, la moyenne des deux sommets sinon. Insertion O(log n), lecture O(1).",
    },
    {
      title: 'MedianFinder avec deux tas',
      code: `${MINHEAP}

class MedianFinder {
  constructor() {
    this.low = new MinHeap((a, b) => b - a) // tas MAX : moitié basse
    this.high = new MinHeap() // tas MIN : moitié haute
  }
  addNum(x) {
    // 1. passer par low pour que le plus grand des petits rejoigne high
    this.low.push(x)
    this.high.push(this.low.pop())
    // 2. rééquilibrer : low garde la case en plus quand le total est impair
    if (this.high.size > this.low.size) this.low.push(this.high.pop())
  }
  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek()
    return (this.low.peek() + this.high.peek()) / 2
  }
}

const mf = new MedianFinder()
const medians = []
for (const x of [5, 15, 1, 3, 8]) {
  mf.addNum(x)
  medians.push(mf.findMedian())
}
console.log(medians)`,
      output: `[ 5, 10, 5, 4, 5 ]`,
      equiv: {
        python: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []   # tas max simulé : on stocke -x
        self.high = []  # tas min

    def add_num(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
        java: `class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder());
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    void addNum(int x) {
        low.offer(x);
        high.offer(low.poll());
        if (high.size() > low.size()) low.offer(high.poll());
    }
    double findMedian() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + (double) high.peek()) / 2; // double : éviter le débordement et la division entière
    }
}`,
        rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

struct MedianFinder {
    low: BinaryHeap<i32>,           // tas max natif
    high: BinaryHeap<Reverse<i32>>, // tas min
}

impl MedianFinder {
    fn add_num(&mut self, x: i32) {
        self.low.push(x);
        let top = self.low.pop().unwrap();
        self.high.push(Reverse(top));
        if self.high.len() > self.low.len() {
            let Reverse(y) = self.high.pop().unwrap();
            self.low.push(y);
        }
    }
    fn find_median(&self) -> f64 {
        let a = *self.low.peek().unwrap() as f64;
        if self.low.len() > self.high.len() {
            a
        } else {
            (a + self.high.peek().unwrap().0 as f64) / 2.0
        }
    }
}`,
      },
    },
    {
      mnemo: "Médiane = tas max à gauche, tas min à droite, sommets face à face ; la gauche garde l'élément en trop.",
      piege: "Insérer directement dans le tas de son choix selon la taille, sans passer par l'autre, casse l'invariant « tout `low` ≤ tout `high` ».",
    },

    { h: 'Planification : le prochain événement d’abord', id: 'tas-planification' },
    {
      p: "Dès qu'un problème demande de traiter, à chaque étape, **l'élément le plus urgent parmi un ensemble qui évolue** (la réunion qui se termine le plus tôt, la tâche la plus prioritaire disponible, le serveur le moins chargé, le nœud le plus proche dans Dijkstra), pensez file de priorité. Exemple classique : le **nombre minimal de salles** pour un ensemble de réunions. On trie par heure de début, et un tas min garde les heures de fin des salles occupées ; si la salle qui se libère le plus tôt est libre au début de la réunion, on la réutilise.",
    },
    {
      title: 'Nombre minimal de salles de réunion',
      code: `${MINHEAP}

function minRooms(meetings) { // meetings : [début, fin], intervalles semi-ouverts [début, fin)
  const sorted = [...meetings].sort((a, b) => a[0] - b[0])
  const ends = new MinHeap() // heures de fin des salles occupées
  for (const [start, end] of sorted) {
    if (ends.size > 0 && ends.peek() <= start) ends.pop() // une salle se libère à temps
    ends.push(end)
  }
  return ends.size // salles ouvertes au total
}

console.log(minRooms([[0, 30], [5, 10], [15, 20]]))
console.log(minRooms([[9, 10], [10, 11], [11, 12]]))
console.log(minRooms([[1, 5], [2, 6], [3, 7], [6, 8]]))`,
      output: `2
1
3`,
      equiv: {
        python: `import heapq

def min_rooms(meetings):
    ends = []
    for start, end in sorted(meetings):
        if ends and ends[0] <= start:
            heapq.heapreplace(ends, end)  # réutiliser la salle libérée
        else:
            heapq.heappush(ends, end)
    return len(ends)`,
        java: `static int minRooms(int[][] meetings) {
    int[][] sorted = meetings.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));
    PriorityQueue<Integer> ends = new PriorityQueue<>();
    for (int[] m : sorted) {
        if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();
        ends.offer(m[1]);
    }
    return ends.size();
}`,
      },
    },
    {
      p: "Autres problèmes du même moule : ordonnancement de tâches avec temps de refroidissement (tas max des fréquences restantes), « k points les plus proches de l'origine » (top-k sur la distance), « k paires de plus petites sommes » (tas sur les indices, comme la fusion de k suites), simulation d'événements (tas sur le temps), et bien sûr **Dijkstra** et **Prim** dans les graphes, où le tas extrait le prochain sommet le plus proche.",
    },
  ],
  mnemo:
    "Tas = le meilleur en O(1), push/pop en O(log n), heapify en O(n). Top-k : tas inverse de taille k. k suites triées : tas des têtes. Médiane : deux tas. « Le plus urgent parmi un ensemble qui change » : file de priorité.",
  piege:
    "Pas de tas natif en JavaScript : trier tout le tableau à chaque insertion (O(n log n) par opération) ou utiliser `shift` sur un tableau trié fait exploser les grandes entrées. Écrivez (ou demandez) un vrai `MinHeap`, et vérifiez le sens du comparateur.",
})

const HEAP_NOTE = "Le code de départ fournit une classe `MinHeap` fonctionnelle (`push`, `pop`, `peek`, `size`, comparateur facultatif façon `sort` : `new MinHeap((a, b) => b - a)` donne un tas max). Gardez-la : JavaScript n'a pas de tas natif."

katas.push(
  // ---------------------------------------------------------------------------
  {
    id: 'hi-kieme-plus-grand',
    title: 'k-ième plus grand élément',
    difficulty: 'facile',
    theme: 'tas',
    pattern: 'tas de taille k',
    statement: `Écrivez \`findKthLargest(nums, k)\` qui renvoie le **k-ième plus grand** élément du tableau \`nums\` (au sens de l'ordre trié, doublons compris : dans \`[3, 3, 1]\`, le 2e plus grand est \`3\`).

- \`1 <= k <= nums.length\` ;
- ne modifiez pas \`nums\` ;
- visez **O(n log k)** avec un tas de taille \`k\` (un test porte sur 200 000 éléments).

${HEAP_NOTE}

Exemples :

- \`findKthLargest([3, 2, 1, 5, 6, 4], 2)\` donne \`5\` ;
- \`findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)\` donne \`4\`.`,
    starter: `${MINHEAP}

function findKthLargest(nums, k) {
  // TODO : garder les k plus grands dans un tas MIN de taille k
  return Math.max(...nums)
}`,
    solution: `${MINHEAP}

function findKthLargest(nums, k) {
  const heap = new MinHeap() // les k plus grands vus jusqu'ici ; sommet = le plus petit d'entre eux
  for (const x of nums) {
    if (heap.size < k) heap.push(x)
    else if (x > heap.peek()) {
      heap.pop()
      heap.push(x)
    }
  }
  return heap.peek()
}`,
    solutionEquiv: {
      python: `import heapq

def find_kth_largest(nums, k):
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)
    return heap[0]`,
      java: `static int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : nums) {
        if (heap.size() < k) heap.offer(x);
        else if (x > heap.peek()) { heap.poll(); heap.offer(x); }
    }
    return heap.peek();
}`,
      rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

fn find_kth_largest(nums: &[i32], k: usize) -> i32 {
    let mut heap: BinaryHeap<Reverse<i32>> = BinaryHeap::with_capacity(k + 1);
    for &x in nums {
        if heap.len() < k {
            heap.push(Reverse(x));
        } else if x > heap.peek().unwrap().0 {
            heap.pop();
            heap.push(Reverse(x));
        }
    }
    heap.peek().unwrap().0
}`,
      php: `function findKthLargest(array $nums, int $k): int {
    $heap = new SplMinHeap();
    foreach ($nums as $x) {
        if ($heap->count() < $k) {
            $heap->insert($x);
        } elseif ($x > $heap->top()) {
            $heap->extract();
            $heap->insert($x);
        }
    }
    return $heap->top();
}`,
    },
    tests: [
      { name: 'exemples de l’énoncé', code: `assertEqual(findKthLargest([3, 2, 1, 5, 6, 4], 2), 5)
assertEqual(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4)` },
      { name: 'k = 1 et k = n', code: `assertEqual(findKthLargest([7, -1, 4], 1), 7)
assertEqual(findKthLargest([7, -1, 4], 3), -1)` },
      { name: 'un seul élément', code: `assertEqual(findKthLargest([42], 1), 42)` },
      { name: 'doublons et négatifs', code: `assertEqual(findKthLargest([3, 3, 1], 2), 3)
assertEqual(findKthLargest([-5, -5, -5, -2], 3), -5)
assertEqual(findKthLargest([2, 2, 2, 2], 4), 2)` },
      { name: 'le tableau n’est pas modifié', code: `const nums = [5, 1, 4, 2, 3]
findKthLargest(nums, 2)
assertEqual(nums, [5, 1, 4, 2, 3])` },
      { name: 'grande entrée (200 000 éléments)', code: `const n = 200000
let seed = 12345
const nums = Array.from({ length: n }, () => (seed = (seed * 16807) % 2147483647) % 1000000)
const sorted = [...nums].sort((a, b) => b - a)
const t0 = performance.now()
const a = findKthLargest(nums, 1000)
const b = findKthLargest(nums, 1)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assertEqual([a, b], [sorted[999], sorted[0]])` },
    ],
    hints: [
      'Trier une copie et lire `sorted[k - 1]` (ordre décroissant) marche en O(n log n). Peut-on ne garder que ce qui compte ?',
      'Maintenez un tas **min** contenant les k plus grands éléments vus : son sommet est le plus petit d’entre eux, le seuil à battre.',
      'Pour chaque élément : si le tas a moins de k éléments, on pousse ; sinon, s’il dépasse le sommet, on retire le sommet et on pousse. À la fin, le sommet est la réponse.',
    ],
    discussion: `**Complexité** : O(n log k) en temps, O(k) en mémoire.

**Points à évoquer** :

- tri : O(n log n), le plus simple, acceptable si n est modeste ; attention à \`sort()\` sans comparateur, qui trie les nombres comme des chaînes ;
- \`Math.max(...nums)\` (pour k = 1) dépasse la pile d'appels au-delà de ~10⁵ éléments : préférez une boucle ou \`reduce\` ;
- **quickselect** : O(n) en moyenne (O(n²) au pire, atténué par un pivot aléatoire), en place, mais modifie le tableau et ne marche pas sur un flux ;
- le tas de taille k est la seule approche qui fonctionne sur un **flux** infini (« k-ième plus grand d'un flux » sur LeetCode) ;
- \`heapq.nlargest(k, nums)\` en Python fait exactement cela.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-implementer-tas',
    title: 'Implémenter un tas binaire',
    difficulty: 'moyen',
    theme: 'tas',
    pattern: 'tas binaire (sift up / sift down)',
    statement: `Implémentez une classe \`MinHeap\` (tas binaire stocké dans un tableau) :

- \`new MinHeap(compare)\` : \`compare(a, b)\` renvoie un nombre négatif si \`a\` doit sortir avant \`b\`, comme pour \`Array.prototype.sort\` ; par défaut \`(a, b) => a - b\` ;
- \`push(value)\` ajoute une valeur en **O(log n)** ;
- \`pop()\` retire et renvoie la valeur prioritaire en **O(log n)**, ou \`undefined\` si le tas est vide ;
- \`peek()\` renvoie la valeur prioritaire sans la retirer (\`undefined\` si vide) ;
- \`size\` est une propriété (accesseur \`get size()\`) qui donne le nombre d'éléments.

Rappel : enfants de \`i\` en \`2i + 1\` et \`2i + 2\`, parent en \`(i - 1) >> 1\`.

Un test pousse puis retire 200 000 valeurs : une insertion en O(n) (tableau trié, \`sort\` à chaque \`push\`) sera trop lente.`,
    starter: `class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.compare = compare
    this.data = []
  }
  get size() {
    return this.data.length
  }
  peek() {
    // TODO : la racine
    return this.data[this.data.length - 1]
  }
  push(value) {
    // TODO : ajouter en fin, puis remonter (sift up)
    this.data.push(value)
  }
  pop() {
    // TODO : sortir la racine, mettre le dernier à sa place, puis descendre (sift down)
    return this.data.pop()
  }
}`,
    solution: MINHEAP,
    solutionEquiv: {
      python: `class MinHeap:
    def __init__(self, compare=lambda a, b: a - b):
        self.compare = compare
        self.data = []

    def __len__(self):
        return len(self.data)

    def peek(self):
        return self.data[0] if self.data else None

    def push(self, value):
        a = self.data
        a.append(value)
        i = len(a) - 1
        while i > 0:
            p = (i - 1) >> 1
            if self.compare(a[i], a[p]) >= 0:
                break
            a[i], a[p] = a[p], a[i]
            i = p

    def pop(self):
        a = self.data
        if not a:
            return None
        top = a[0]
        last = a.pop()
        if a:
            a[0] = last
            i = 0
            while True:
                l, r, m = 2 * i + 1, 2 * i + 2, i
                if l < len(a) and self.compare(a[l], a[m]) < 0:
                    m = l
                if r < len(a) and self.compare(a[r], a[m]) < 0:
                    m = r
                if m == i:
                    break
                a[i], a[m] = a[m], a[i]
                i = m
        return top`,
      java: `class MinHeap<T> {
    private final List<T> data = new ArrayList<>();
    private final Comparator<? super T> compare;

    MinHeap(Comparator<? super T> compare) { this.compare = compare; }

    int size() { return data.size(); }
    T peek() { return data.isEmpty() ? null : data.get(0); }

    void push(T value) {
        data.add(value);
        int i = data.size() - 1;
        while (i > 0) {
            int p = (i - 1) >> 1;
            if (compare.compare(data.get(i), data.get(p)) >= 0) break;
            Collections.swap(data, i, p);
            i = p;
        }
    }

    T pop() {
        if (data.isEmpty()) return null;
        T top = data.get(0);
        T last = data.remove(data.size() - 1);
        if (!data.isEmpty()) {
            data.set(0, last);
            int i = 0, n = data.size();
            while (true) {
                int l = 2 * i + 1, r = l + 1, m = i;
                if (l < n && compare.compare(data.get(l), data.get(m)) < 0) m = l;
                if (r < n && compare.compare(data.get(r), data.get(m)) < 0) m = r;
                if (m == i) break;
                Collections.swap(data, i, m);
                i = m;
            }
        }
        return top;
    }
}`,
      rust: `struct MinHeap<T, F: Fn(&T, &T) -> std::cmp::Ordering> {
    data: Vec<T>,
    compare: F,
}

impl<T, F: Fn(&T, &T) -> std::cmp::Ordering> MinHeap<T, F> {
    fn new(compare: F) -> Self { MinHeap { data: Vec::new(), compare } }
    fn size(&self) -> usize { self.data.len() }
    fn peek(&self) -> Option<&T> { self.data.first() }

    fn push(&mut self, value: T) {
        self.data.push(value);
        let mut i = self.data.len() - 1;
        while i > 0 {
            let p = (i - 1) >> 1;
            if (self.compare)(&self.data[i], &self.data[p]).is_ge() { break; }
            self.data.swap(i, p);
            i = p;
        }
    }

    fn pop(&mut self) -> Option<T> {
        if self.data.is_empty() { return None; }
        let n = self.data.len();
        self.data.swap(0, n - 1);  // la racine part en fin de Vec, le dernier monte
        let top = self.data.pop();
        let n = self.data.len();
        let mut i = 0;
        loop {
            let (l, r) = (2 * i + 1, 2 * i + 2);
            let mut m = i;
            if l < n && (self.compare)(&self.data[l], &self.data[m]).is_lt() { m = l; }
            if r < n && (self.compare)(&self.data[r], &self.data[m]).is_lt() { m = r; }
            if m == i { break; }
            self.data.swap(i, m);
            i = m;
        }
        top
    }
}`,
    },
    tests: [
      { name: 'ordre de sortie croissant', code: `const h = new MinHeap()
for (const x of [5, 3, 8, 1, 9, 2, 7]) h.push(x)
const out = []
while (h.size > 0) out.push(h.pop())
assertEqual(out, [1, 2, 3, 5, 7, 8, 9])` },
      { name: 'peek, size et tas vide', code: `const h = new MinHeap()
assertEqual(h.size, 0)
assertEqual(h.peek(), undefined)
assertEqual(h.pop(), undefined)
h.push(4)
h.push(2)
assertEqual(h.peek(), 2)
assertEqual(h.size, 2, 'peek ne retire rien')
assertEqual(h.pop(), 2)
assertEqual(h.pop(), 4)
assertEqual(h.pop(), undefined)
assertEqual(h.size, 0)` },
      { name: 'comparateur : tas max', code: `const h = new MinHeap((a, b) => b - a)
for (const x of [5, 3, 8, 1]) h.push(x)
assertEqual([h.pop(), h.pop(), h.pop(), h.pop()], [8, 5, 3, 1])` },
      { name: 'comparateur : objets', code: `const h = new MinHeap((a, b) => a.p - b.p)
h.push({ id: 'b', p: 2 })
h.push({ id: 'c', p: 3 })
h.push({ id: 'a', p: 1 })
assertEqual(h.pop().id, 'a')
assertEqual(h.peek().id, 'b')` },
      { name: 'doublons, négatifs et pushs entrelacés', code: `const h = new MinHeap()
h.push(3); h.push(-1); h.push(3)
assertEqual(h.pop(), -1)
h.push(0); h.push(-7)
const out = []
while (h.size > 0) out.push(h.pop())
assertEqual(out, [-7, 0, 3, 3])` },
      { name: 'invariant sur 1 000 valeurs aléatoires', code: `const h = new MinHeap()
const ref = []
let seed = 99
for (let i = 0; i < 1000; i++) {
  seed = (seed * 16807) % 2147483647
  const x = seed % 500
  h.push(x)
  ref.push(x)
  if (i % 3 === 2) {
    ref.sort((a, b) => a - b)
    assertEqual(h.pop(), ref.shift())
  }
}
ref.sort((a, b) => a - b)
const out = []
while (h.size > 0) out.push(h.pop())
assertEqual(out, ref)` },
      { name: 'grande entrée (200 000 push puis pop)', code: `const n = 200000
const h = new MinHeap()
let seed = 7
const t0 = performance.now()
for (let i = 0; i < n; i++) {
  seed = (seed * 16807) % 2147483647
  h.push(seed)
}
let prev = -Infinity
let ok = true
for (let i = 0; i < n; i++) {
  const x = h.pop()
  if (x < prev) ok = false
  prev = x
}
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assert(ok, 'les valeurs ne sortent pas dans l’ordre')
assertEqual(h.size, 0)` },
    ],
    hints: [
      '`push` : ajoutez la valeur en fin de tableau, puis échangez-la avec son parent `(i - 1) >> 1` tant que `compare(enfant, parent) < 0`.',
      '`pop` : gardez la racine, retirez le dernier élément avec `pop()` et, s’il reste des éléments, placez-le à l’indice 0.',
      'Puis descendez : comparez le nœud à ses enfants `2i + 1` et `2i + 2`, échangez avec le meilleur des deux s’il est meilleur que le nœud, et recommencez depuis sa position. Attention au tas qui devient vide.',
    ],
    discussion: `**Complexité** : \`push\` et \`pop\` en O(log n) (hauteur de l'arbre complet), \`peek\` et \`size\` en O(1), mémoire O(n).

**Points à évoquer** :

- l'arbre est **complet**, d'où le rangement dans un tableau sans pointeurs et la hauteur garantie ⌊log₂ n⌋ ;
- le cas \`pop\` sur un tas d'un seul élément : après \`a.pop()\`, le tableau est vide et il ne faut pas réécrire \`a[0]\` ;
- **heapify** : construire un tas à partir d'un tableau en O(n), en appliquant le *sift down* des derniers parents vers la racine ;
- opérations avancées : \`decreaseKey\` (utile pour Dijkstra) demande de connaître la position de chaque élément (une \`Map\` valeur → indice mise à jour à chaque échange) ; on s'en passe souvent par la « suppression paresseuse » (on repousse la nouvelle priorité et on ignore les entrées périmées au \`pop\`) ;
- comparaison avec les bibliothèques : \`heapq\` (tas min sur une liste), \`PriorityQueue\` (tas min, \`Comparator\`), \`BinaryHeap\` (tas max, \`Reverse\`), \`SplMinHeap\`.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-top-k-frequents',
    title: 'Les k éléments les plus fréquents',
    difficulty: 'moyen',
    theme: 'tas',
    pattern: 'comptage + tas de taille k',
    statement: `Écrivez \`topKFrequent(nums, k)\` qui renvoie les \`k\` valeurs **les plus fréquentes** de \`nums\`.

- le résultat est trié par **fréquence décroissante**, et à fréquence égale par **valeur croissante** ;
- \`1 <= k <=\` nombre de valeurs distinctes ;
- visez O(n log k) après le comptage (un test porte sur 200 000 éléments et 50 000 valeurs distinctes).

${HEAP_NOTE}

Exemples :

- \`topKFrequent([1, 1, 1, 2, 2, 3], 2)\` donne \`[1, 2]\` ;
- \`topKFrequent([4, 4, 5, 5, 6], 2)\` donne \`[4, 5]\` (même fréquence : la plus petite valeur d'abord) ;
- \`topKFrequent([7], 1)\` donne \`[7]\`.`,
    starter: `${MINHEAP}

function topKFrequent(nums, k) {
  // TODO : compter avec une Map, puis garder les k meilleurs dans un tas de taille k
  return [...new Set(nums)].slice(0, k)
}`,
    solution: `${MINHEAP}

function topKFrequent(nums, k) {
  const count = new Map()
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1)

  // « a est moins bon que b » : fréquence plus faible, ou même fréquence et valeur plus grande.
  // Le tas MIN selon cet ordre garde au sommet le moins bon des k meilleurs.
  const worse = (a, b) => a[1] - b[1] || b[0] - a[0]
  const heap = new MinHeap(worse)
  for (const entry of count) { // entry = [valeur, fréquence]
    heap.push(entry)
    if (heap.size > k) heap.pop()
  }
  const out = []
  while (heap.size > 0) out.push(heap.pop()[0]) // du moins bon au meilleur
  return out.reverse()
}`,
    solutionEquiv: {
      python: `import heapq
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    # clé « meilleur d'abord » : (-fréquence, valeur) ; nsmallest garde un tas de taille k
    best = heapq.nsmallest(k, count.items(), key=lambda e: (-e[1], e[0]))
    return [value for value, _ in best]`,
      java: `static List<Integer> topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int x : nums) count.merge(x, 1, Integer::sum);
    // tas min selon « moins bon » : fréquence croissante, puis valeur décroissante
    PriorityQueue<Map.Entry<Integer, Integer>> heap = new PriorityQueue<>(
        (a, b) -> !a.getValue().equals(b.getValue())
            ? Integer.compare(a.getValue(), b.getValue())
            : Integer.compare(b.getKey(), a.getKey()));
    for (Map.Entry<Integer, Integer> e : count.entrySet()) {
        heap.offer(e);
        if (heap.size() > k) heap.poll();
    }
    LinkedList<Integer> out = new LinkedList<>();
    while (!heap.isEmpty()) out.addFirst(heap.poll().getKey());
    return out;
}`,
      rust: `use std::cmp::Reverse;
use std::collections::{BinaryHeap, HashMap};

fn top_k_frequent(nums: &[i32], k: usize) -> Vec<i32> {
    let mut count: HashMap<i32, usize> = HashMap::new();
    for &x in nums {
        *count.entry(x).or_insert(0) += 1;
    }
    // BinaryHeap est un tas max : on y range (Reverse(fréquence), valeur),
    // le sommet est donc le « moins bon » (fréquence faible, puis valeur grande)
    let mut heap = BinaryHeap::new();
    for (&value, &freq) in &count {
        heap.push((Reverse(freq), value));
        if heap.len() > k {
            heap.pop();
        }
    }
    let mut out: Vec<i32> = Vec::with_capacity(k);
    while let Some((_, value)) = heap.pop() {
        out.push(value);
    }
    out.reverse();
    out
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `assertEqual(topKFrequent([1, 1, 1, 2, 2, 3], 2), [1, 2])` },
      { name: 'égalités de fréquence départagées par la valeur', code: `assertEqual(topKFrequent([4, 4, 5, 5, 6], 2), [4, 5])
assertEqual(topKFrequent([9, 8, 7, 9, 8, 7], 3), [7, 8, 9])
assertEqual(topKFrequent([3, 1, 2], 1), [1])` },
      { name: 'un seul élément', code: `assertEqual(topKFrequent([7], 1), [7])` },
      { name: 'k = nombre de valeurs distinctes', code: `assertEqual(topKFrequent([2, 3, 3, 1, 3, 2], 3), [3, 2, 1])` },
      { name: 'valeurs négatives et zéro', code: `assertEqual(topKFrequent([0, -1, -1, 0, -1, 5], 2), [-1, 0])` },
      { name: 'grande entrée (200 000 éléments)', code: `const nums = []
let seed = 3
for (let i = 0; i < 200000; i++) {
  seed = (seed * 16807) % 2147483647
  nums.push(seed % 50000)
}
for (let i = 0; i < 100; i++) nums.push(123456, 654321) // deux valeurs nettement plus fréquentes
const t0 = performance.now()
const got = topKFrequent(nums, 10)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
const count = new Map()
for (const x of nums) count.set(x, (count.get(x) || 0) + 1)
const expected = [...count].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 10).map((e) => e[0])
assertEqual(got, expected)
assertEqual(got.slice(0, 2), [123456, 654321])` },
    ],
    hints: [
      'Commencez par compter les occurrences avec une `Map` valeur → fréquence.',
      'Gardez les k meilleures entrées `[valeur, fréquence]` dans un tas **min** dont le sommet est la moins bonne : poussez chaque entrée et retirez le sommet dès que la taille dépasse k.',
      'Définissez soigneusement le comparateur « moins bon » : fréquence plus faible d’abord, puis, à fréquence égale, valeur plus **grande**. Videz le tas puis inversez le résultat.',
    ],
    discussion: `**Complexité** : O(n) pour compter, puis O(d log k) pour le tas où d est le nombre de valeurs distinctes ; O(d) en mémoire pour la \`Map\`.

**Points à évoquer** :

- trier toutes les entrées par fréquence coûte O(d log d) : simple et souvent suffisant, mais le tas de taille k est meilleur quand k ≪ d ;
- **tri par paquets** (bucket sort) : une fréquence est entre 1 et n, donc un tableau de n + 1 listes indexées par fréquence donne O(n) ; il faut ensuite trier chaque paquet pour le départage par valeur ;
- quickselect sur les entrées : O(d) en moyenne ;
- le départage des égalités est la principale source de bugs : écrire le comparateur une fois, « du meilleur au moins bon », et l'inverser pour le tas ;
- variante sur des chaînes (« top k mots », LeetCode 692) : départage par ordre lexicographique, avec \`localeCompare\` ou une comparaison \`<\`.`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-fusion-k-tableaux',
    title: 'Fusionner k tableaux triés',
    difficulty: 'difficile',
    theme: 'tas',
    pattern: 'tas des têtes (k-way merge)',
    statement: `Écrivez \`mergeKSorted(arrays)\` qui reçoit un tableau de \`k\` tableaux **triés par ordre croissant** et renvoie un nouveau tableau trié contenant tous leurs éléments.

- certains tableaux peuvent être vides, et \`arrays\` lui-même peut être vide ;
- ne modifiez pas les tableaux reçus ;
- visez **O(N log k)** où N est le nombre total d'éléments, en exploitant le fait que chaque tableau est déjà trié (un test fusionne 2 000 tableaux de 100 éléments).

${HEAP_NOTE}

Exemples :

- \`mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]])\` donne \`[1, 1, 2, 3, 4, 4, 5, 6]\` ;
- \`mergeKSorted([])\` donne \`[]\` ;
- \`mergeKSorted([[], [0]])\` donne \`[0]\`.`,
    starter: `${MINHEAP}

function mergeKSorted(arrays) {
  // TODO : un tas des têtes [valeur, indice du tableau, position]
  return arrays.length > 0 ? [...arrays[0]] : []
}`,
    solution: `${MINHEAP}

function mergeKSorted(arrays) {
  const heap = new MinHeap((a, b) => a[0] - b[0]) // [valeur, indice du tableau, position]
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) heap.push([arrays[i][0], i, 0])
  }
  const out = []
  while (heap.size > 0) {
    const [val, i, j] = heap.pop()
    out.push(val)
    if (j + 1 < arrays[i].length) heap.push([arrays[i][j + 1], i, j + 1])
  }
  return out
}`,
    solutionEquiv: {
      python: `import heapq

def merge_k_sorted(arrays):
    heap = [(arr[0], i, 0) for i, arr in enumerate(arrays) if arr]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(arrays[i]):
            heapq.heappush(heap, (arrays[i][j + 1], i, j + 1))
    return out`,
      java: `static List<Integer> mergeKSorted(int[][] arrays) {
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    for (int i = 0; i < arrays.length; i++)
        if (arrays[i].length > 0) heap.offer(new int[] {arrays[i][0], i, 0});
    List<Integer> out = new ArrayList<>();
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        out.add(top[0]);
        int i = top[1], j = top[2];
        if (j + 1 < arrays[i].length) heap.offer(new int[] {arrays[i][j + 1], i, j + 1});
    }
    return out;
}`,
      rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

fn merge_k_sorted(arrays: &[Vec<i32>]) -> Vec<i32> {
    let mut heap = BinaryHeap::new();
    for (i, arr) in arrays.iter().enumerate() {
        if let Some(&first) = arr.first() {
            heap.push(Reverse((first, i, 0usize)));
        }
    }
    let mut out = Vec::new();
    while let Some(Reverse((val, i, j))) = heap.pop() {
        out.push(val);
        if let Some(&next) = arrays[i].get(j + 1) {
            heap.push(Reverse((next, i, j + 1)));
        }
    }
    out
}`,
      php: `function mergeKSorted(array $arrays): array {
    // SplMinHeap compare les tableaux élément par élément : [valeur, i, j]
    $heap = new SplMinHeap();
    foreach ($arrays as $i => $arr) {
        if (count($arr) > 0) $heap->insert([$arr[0], $i, 0]);
    }
    $out = [];
    while (!$heap->isEmpty()) {
        [$val, $i, $j] = $heap->extract();
        $out[] = $val;
        if ($j + 1 < count($arrays[$i])) $heap->insert([$arrays[$i][$j + 1], $i, $j + 1]);
    }
    return $out;
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `assertEqual(mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]]), [1, 1, 2, 3, 4, 4, 5, 6])` },
      { name: 'entrées vides', code: `assertEqual(mergeKSorted([]), [])
assertEqual(mergeKSorted([[], []]), [])
assertEqual(mergeKSorted([[], [0]]), [0])` },
      { name: 'un seul tableau', code: `assertEqual(mergeKSorted([[-3, 0, 2]]), [-3, 0, 2])` },
      { name: 'longueurs très différentes et négatifs', code: `assertEqual(mergeKSorted([[10], [-5, -4, -3, 11, 12], [0, 0], [-10]]), [-10, -5, -4, -3, 0, 0, 10, 11, 12])` },
      { name: 'les tableaux d’entrée ne sont pas modifiés', code: `const input = [[1, 3], [2, 4]]
const out = mergeKSorted(input)
assertEqual(out, [1, 2, 3, 4])
assertEqual(input, [[1, 3], [2, 4]])
assert(out !== input[0], 'il faut renvoyer un nouveau tableau')` },
      { name: 'grande entrée (2 000 tableaux de 100 éléments)', code: `const arrays = []
let seed = 5
for (let i = 0; i < 2000; i++) {
  const arr = []
  let v = 0
  for (let j = 0; j < 100; j++) {
    seed = (seed * 16807) % 2147483647
    v += seed % 1000
    arr.push(v)
  }
  arrays.push(arr)
}
const t0 = performance.now()
const out = mergeKSorted(arrays)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assertEqual(out.length, 200000)
let sorted = true
for (let i = 1; i < out.length; i++) if (out[i - 1] > out[i]) sorted = false
assert(sorted, 'le résultat n’est pas trié')` },
    ],
    hints: [
      'Le plus petit élément restant est forcément en tête de l’un des k tableaux : il suffit de comparer les k têtes.',
      'Comparer les k têtes à chaque étape coûte O(k) : un tas min des têtes fait la même chose en O(log k).',
      'Stockez dans le tas des triplets `[valeur, indice du tableau, position]` ; après chaque `pop`, poussez l’élément suivant du même tableau s’il existe.',
    ],
    discussion: `**Complexité** : O(N log k) en temps, O(k) pour le tas (plus O(N) pour le résultat).

**Points à évoquer** :

- concaténer puis trier : O(N log N), ignore que les tableaux sont triés (le Timsort de V8 tire tout de même parti des séquences déjà triées, ce qui le rend souvent rapide en pratique) ;
- balayer les k têtes à chaque étape : O(N·k) ;
- **fusion en tournoi** (deux à deux, comme le tri fusion) : O(N log k) aussi, sans tas, en log k passes ;
- même gabarit pour fusionner k **listes chaînées** triées (LeetCode 23 : le tas contient des nœuds), k-ième plus petit dans une matrice aux lignes triées, plus petit intervalle couvrant k listes ;
- en dehors de la mémoire : c'est le principe du **tri externe** (fusion de fichiers triés sur disque).`,
  },
  // ---------------------------------------------------------------------------
  {
    id: 'hi-mediane-flux',
    title: 'Médiane d’un flux',
    difficulty: 'difficile',
    theme: 'tas',
    pattern: 'deux tas (max à gauche, min à droite)',
    statement: `Implémentez une classe \`MedianFinder\` :

- \`addNum(x)\` ajoute un nombre au flux, en **O(log n)** ;
- \`findMedian()\` renvoie la médiane de tous les nombres ajoutés jusqu'ici, en **O(1)** : l'élément du milieu si leur nombre est impair, la moyenne des deux éléments du milieu sinon.

On garantit au moins un \`addNum\` avant chaque \`findMedian\`. Un test ajoute 100 000 nombres en demandant la médiane après chacun : trier à chaque appel sera trop lent.

${HEAP_NOTE}

Exemple : \`addNum(1)\`, \`addNum(2)\`, \`findMedian()\` donne \`1.5\`, \`addNum(3)\`, \`findMedian()\` donne \`2\`.`,
    starter: `${MINHEAP}

class MedianFinder {
  constructor() {
    // TODO : un tas max pour la moitié basse, un tas min pour la moitié haute
    this.values = []
  }
  addNum(x) {
    this.values.push(x)
  }
  findMedian() {
    // TODO (cette version oublie de trier, et n'en a de toute façon pas le temps)
    return this.values[this.values.length >> 1]
  }
}`,
    solution: `${MINHEAP}

class MedianFinder {
  constructor() {
    this.low = new MinHeap((a, b) => b - a) // tas MAX : moitié basse
    this.high = new MinHeap() // tas MIN : moitié haute
  }
  addNum(x) {
    // passer par low garantit que tout low reste <= tout high
    this.low.push(x)
    this.high.push(this.low.pop())
    // low garde l'élément en trop quand le total est impair
    if (this.high.size > this.low.size) this.low.push(this.high.pop())
  }
  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek()
    return (this.low.peek() + this.high.peek()) / 2
  }
}`,
    solutionEquiv: {
      python: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []   # tas max simulé : on stocke -x
        self.high = []  # tas min

    def add_num(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
      java: `class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder());
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    void addNum(int x) {
        low.offer(x);
        high.offer(low.poll());
        if (high.size() > low.size()) low.offer(high.poll());
    }

    double findMedian() {
        if (low.size() > high.size()) return low.peek();
        return ((double) low.peek() + high.peek()) / 2;
    }
}`,
      php: `class MedianFinder {
    private SplMaxHeap $low;
    private SplMinHeap $high;

    public function __construct() {
        $this->low = new SplMaxHeap();
        $this->high = new SplMinHeap();
    }

    public function addNum(int $x): void {
        $this->low->insert($x);
        $this->high->insert($this->low->extract());
        if ($this->high->count() > $this->low->count()) {
            $this->low->insert($this->high->extract());
        }
    }

    public function findMedian(): float {
        if ($this->low->count() > $this->high->count()) return $this->low->top();
        return ($this->low->top() + $this->high->top()) / 2;
    }
}`,
    },
    tests: [
      { name: 'exemple de l’énoncé', code: `const m = new MedianFinder()
m.addNum(1)
m.addNum(2)
assertEqual(m.findMedian(), 1.5)
m.addNum(3)
assertEqual(m.findMedian(), 2)` },
      { name: 'un seul nombre', code: `const m = new MedianFinder()
m.addNum(-4)
assertEqual(m.findMedian(), -4)` },
      { name: 'ordre d’arrivée quelconque', code: `const m = new MedianFinder()
const got = []
for (const x of [5, 15, 1, 3, 8, 7, 9, 10]) {
  m.addNum(x)
  got.push(m.findMedian())
}
assertEqual(got, [5, 10, 5, 4, 5, 6, 7, 7.5])` },
      { name: 'doublons et négatifs', code: `const m = new MedianFinder()
for (const x of [-1, -1, -1, 2]) m.addNum(x)
assertEqual(m.findMedian(), -1)
m.addNum(2)
m.addNum(2)
assertEqual(m.findMedian(), 0.5)` },
      { name: 'flux décroissant puis croissant', code: `const m = new MedianFinder()
for (let x = 10; x >= 1; x--) m.addNum(x)
assertEqual(m.findMedian(), 5.5)
for (let x = 11; x <= 20; x++) m.addNum(x)
assertEqual(m.findMedian(), 10.5)` },
      { name: 'grande entrée (100 000 ajouts, médiane après chacun)', code: `const m = new MedianFinder()
let seed = 11
let sum = 0
const t0 = performance.now()
for (let i = 0; i < 100000; i++) {
  seed = (seed * 16807) % 2147483647
  m.addNum(seed % 1000000)
  sum += m.findMedian()
}
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')
assert(Number.isFinite(sum), 'médiane invalide')
// vérification finale contre un tri
seed = 11
const all = []
for (let i = 0; i < 100000; i++) {
  seed = (seed * 16807) % 2147483647
  all.push(seed % 1000000)
}
all.sort((a, b) => a - b)
assertEqual(m.findMedian(), (all[49999] + all[50000]) / 2)` },
    ],
    hints: [
      'Coupez les nombres vus en deux moitiés : la médiane ne dépend que du plus grand de la moitié basse et du plus petit de la moitié haute.',
      'Un tas **max** pour la moitié basse, un tas **min** pour la moitié haute. Invariants : tout élément bas ≤ tout élément haut, et la moitié basse a autant d’éléments que la haute, ou un de plus.',
      'Pour insérer sans casser l’ordre : pousser dans la moitié basse, transférer son maximum dans la haute, puis, si la haute est devenue plus grande, lui reprendre son minimum.',
    ],
    discussion: `**Complexité** : \`addNum\` en O(log n) (au plus trois opérations de tas), \`findMedian\` en O(1), mémoire O(n).

**Points à évoquer** :

- trier à chaque \`findMedian\` : O(n log n) par requête ; insérer à sa place dans un tableau trié (dichotomie + \`splice\`) : O(n) par ajout à cause du décalage, soit O(n²) au total ;
- **suites classiques** : « si toutes les valeurs sont entre 0 et 100 ? » — un tableau de 101 compteurs et un parcours, O(100) par requête ; « si 99 % des valeurs sont entre 0 et 100 ? » — compteurs plus deux tas pour les valeurs extrêmes ;
- médiane sur **fenêtre glissante** : il faut aussi retirer des éléments ; deux tas avec suppression paresseuse (une \`Map\` des éléments à ignorer), ou un arbre ordonné ;
- en Java, attention à \`(a + b) / 2\` sur des \`int\` : division entière et débordement possible ; convertir en \`double\` d'abord.`,
  },
)

quiz.push(
  {
    id: 'hi-q-tas-indices',
    theme: 'tas',
    kind: 'qcm',
    q: "Dans un tas binaire rangé dans un tableau à partir de l'indice 0, où se trouvent les enfants et le parent du nœud d'indice i ?",
    choices: [
      "Enfants en `2i + 1` et `2i + 2`, parent en `(i - 1) >> 1`",
      "Enfants en `2i` et `2i + 1`, parent en `i >> 1`",
      "Enfants en `i + 1` et `i + 2`, parent en `i - 1`",
      "Enfants en `2i - 1` et `2i`, parent en `(i + 1) >> 1`",
    ],
    answer: 0,
    why: "Avec une racine à l'indice 0, les enfants de 0 sont 1 et 2, ceux de 1 sont 3 et 4, etc. : `2i + 1` et `2i + 2`, et le parent `(i - 1) >> 1` (division entière par 2). La formule `2i`, `2i + 1`, `i >> 1` est celle des tas indexés à partir de 1, fréquente dans les manuels.",
  },
  {
    id: 'hi-q-tas-tableau-interne',
    theme: 'tas',
    kind: 'output',
    q: "Qu'affiche ce code ? (`MinHeap` est le tas binaire du cours : `push` ajoute en fin puis remonte.)",
    code: `${MINHEAP}

const h = new MinHeap()
for (const x of [4, 7, 2, 9, 1]) h.push(x)
console.log(h.data.join(' '))`,
    choices: ['1 2 4 9 7', '1 2 4 7 9', '1 4 2 9 7', '9 7 4 2 1'],
    answer: 0,
    why: "Trace : `[4]`, puis 7 reste sous 4 : `[4, 7]` ; 2 remonte à la racine : `[2, 7, 4]` ; 9 reste sous 7 : `[2, 7, 4, 9]` ; 1 est placé à l'indice 4 (enfant de 7), remonte au-dessus de 7 puis de 2 : `[1, 2, 4, 9, 7]`. Le tableau d'un tas n'est **pas trié** : seul le sommet est garanti.",
  },
  {
    id: 'hi-q-tas-top-k-sortie',
    theme: 'tas',
    kind: 'output',
    q: "Qu'affiche ce code ?",
    code: `${MINHEAP}

const heap = new MinHeap()
for (const x of [5, 1, 9, 3, 7, 8]) {
  heap.push(x)
  if (heap.size > 3) heap.pop()
}
const out = []
while (heap.size > 0) out.push(heap.pop())
console.log(out)`,
    choices: ['[ 7, 8, 9 ]', '[ 1, 3, 5 ]', '[ 9, 8, 7 ]', '[ 5, 7, 8 ]'],
    answer: 0,
    why: "Un tas **min** limité à 3 éléments évince à chaque fois le plus petit : il garde donc les 3 plus **grands** (7, 8, 9), et les vide dans l'ordre croissant. C'est le motif du top-k. Pour obtenir les 3 plus petits, il faudrait un tas max.",
  },
  {
    id: 'hi-q-tas-heapify',
    theme: 'tas',
    kind: 'complexite',
    q: "Quelle est la complexité en temps de `heapify` (appliquer `siftDown` des derniers parents jusqu'à la racine) sur un tableau de n éléments ?",
    code: `function siftDown(a, i, n) {
  for (;;) {
    const l = 2 * i + 1
    const r = l + 1
    let m = i
    if (l < n && a[l] < a[m]) m = l
    if (r < n && a[r] < a[m]) m = r
    if (m === i) return
    const t = a[i]; a[i] = a[m]; a[m] = t
    i = m
  }
}
function heapify(a) {
  for (let i = (a.length >> 1) - 1; i >= 0; i--) siftDown(a, i, a.length)
  return a
}
heapify(Array.from({ length: 1000 }, (_, i) => 1000 - i))`,
    choices: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
    answer: 0,
    why: "Chaque `siftDown` coûte au plus la hauteur **sous** le nœud. La moitié des nœuds sont des feuilles (non traitées), un quart descend d'au plus 1 niveau, un huitième d'au plus 2… La somme Σ (n / 2^(h+1)) · h est bornée par n : O(n). C'est mieux que n insertions successives, en O(n log n).",
  },
  {
    id: 'hi-q-tas-k-pops',
    theme: 'tas',
    kind: 'complexite',
    q: "Quelle est la complexité de `smallestK` (n = longueur de `nums`, k ≤ n), en supposant que `push` et `pop` sont en O(log n) ?",
    code: `${MINHEAP}

function smallestK(nums, k) {
  const heap = new MinHeap()
  for (const x of nums) heap.push(x)
  const out = []
  for (let i = 0; i < k; i++) out.push(heap.pop())
  return out
}
smallestK([5, 2, 8, 1, 9, 3], 3)`,
    choices: ['O(n log n + k log n), soit O(n log n)', 'O(n + k log n)', 'O(n log k)', 'O(k log k)'],
    answer: 0,
    why: "Les n `push` successifs coûtent O(n log n), puis les k `pop` O(k log n). Avec un vrai **heapify** (construction en O(n)), on descendrait à O(n + k log n). Et avec un tas **max** limité à k éléments, à O(n log k) en temps et O(k) en mémoire.",
  },
  {
    id: 'hi-q-tas-bug-comparateur',
    theme: 'tas',
    kind: 'bug',
    q: "On veut les k plus **grands** éléments, mais cette fonction renvoie les k plus petits. Où est le bug ?",
    code: `${MINHEAP}

function topK(nums, k) {
  const heap = new MinHeap((a, b) => b - a)
  for (const x of nums) {
    heap.push(x)
    if (heap.size > k) heap.pop()
  }
  return heap.data.slice().sort((a, b) => b - a)
}
topK([5, 1, 9, 3, 7], 2)`,
    choices: [
      "Le comparateur `(a, b) => b - a` fait un tas max : le `pop` évince le plus grand ; il faut un tas min, `(a, b) => a - b`",
      "Il faut faire `heap.pop()` avant `heap.push(x)`",
      "La condition doit être `heap.size >= k`",
      "`heap.data` n'est pas accessible de l'extérieur de la classe",
    ],
    answer: 0,
    why: "Pour garder les k plus grands, on doit pouvoir évincer en O(log n) le plus **petit** des candidats : c'est le sommet d'un tas **min**. Avec un tas max, chaque éviction retire le meilleur candidat, et il ne reste que les k plus petits. Ici, `topK([5, 1, 9, 3, 7], 2)` renvoie `[3, 1]`.",
  },
  {
    id: 'hi-q-tas-bug-pop',
    theme: 'tas',
    kind: 'bug',
    q: "Ce `pop` fonctionne tant que le tas a au moins deux éléments. Que se passe-t-il quand il n'en reste qu'un ?",
    code: `class Heap {
  constructor() { this.a = [] }
  push(x) {
    const a = this.a
    a.push(x)
    let i = a.length - 1
    while (i > 0 && a[i] < a[(i - 1) >> 1]) {
      const p = (i - 1) >> 1
      const t = a[i]; a[i] = a[p]; a[p] = t
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    a[0] = a.pop()
    let i = 0
    for (;;) {
      const l = 2 * i + 1, r = l + 1
      let m = i
      if (l < a.length && a[l] < a[m]) m = l
      if (r < a.length && a[r] < a[m]) m = r
      if (m === i) break
      const t = a[i]; a[i] = a[m]; a[m] = t
      i = m
    }
    return top
  }
}
const h = new Heap()
h.push(1)
h.pop()`,
    choices: [
      "`a.pop()` vide le tableau, puis `a[0] = …` remet l'élément : le tas n'est jamais vidé et `size` reste à 1",
      "Une boucle infinie dans la descente",
      "Une TypeError, car `a[0]` est `undefined`",
      "Rien : le code est correct",
    ],
    answer: 0,
    why: "Avec un seul élément, `a.pop()` le retire et vide le tableau, mais l'affectation `a[0] = …` le réinsère aussitôt. Le tas semble ne jamais se vider (une boucle `while (h.a.length > 0) h.pop()` tournerait à l'infini). Il faut ne replacer le dernier élément à la racine que s'il reste des éléments : `const last = a.pop(); if (a.length > 0) { a[0] = last; … }`. Et penser au tas vide, qui doit renvoyer `undefined`.",
  },
  {
    id: 'hi-q-tas-reconnaitre',
    theme: 'tas',
    kind: 'qcm',
    q: "Lequel de ces problèmes ne se résout PAS naturellement avec une file de priorité ?",
    choices: [
      "Vérifier qu'une chaîne de parenthèses est bien équilibrée",
      "Trouver le nombre minimal de salles pour un ensemble de réunions",
      "Fusionner k listes chaînées triées",
      "Maintenir la médiane d'un flux de nombres",
    ],
    answer: 0,
    why: "Les parenthèses relèvent d'une **pile** (dernier ouvert, premier fermé). Les trois autres demandent d'extraire à répétition le « meilleur » élément d'un ensemble qui évolue : la salle qui se libère le plus tôt, la plus petite tête parmi k listes, les sommets des deux moitiés du flux.",
  },
)

pieges.push(
  {
    id: 'hi-p-tas-comparateur-booleen',
    title: 'Un comparateur qui renvoie un booléen',
    theme: 'tas',
    question: "Le comparateur ressemble à celui d'un tas min. Qu'affiche ce code ?",
    code: `${MINHEAP}

const h = new MinHeap((a, b) => a < b)
for (const x of [5, 3, 8, 1]) h.push(x)
const out = []
while (h.size > 0) out.push(h.pop())
console.log(out)`,
    output: `[ 5, 1, 8, 3 ]`,
    explanation: "Le tas teste `compare(a, b) < 0`. Or `a < b` renvoie `true` ou `false`, convertis en 1 ou 0 : jamais négatifs. Aucun élément ne remonte, aucun ne descend, et le tas rend les éléments dans un ordre arbitraire. Le même piège existe avec `Array.prototype.sort((a, b) => a > b)`. Un comparateur doit renvoyer un **nombre** négatif, nul ou positif : `(a, b) => a - b`.",
    fix: {
      code: `${MINHEAP}

const h = new MinHeap((a, b) => a - b)
for (const x of [5, 3, 8, 1]) h.push(x)
const out = []
while (h.size > 0) out.push(h.pop())
console.log(out)`,
      output: `[ 1, 3, 5, 8 ]`,
    },
  },
  {
    id: 'hi-p-tas-math-max-spread',
    title: '`Math.max(...grandTableau)` dépasse la pile',
    theme: 'tas',
    question: "On cherche le maximum d'un million de valeurs. Qu'affiche ce code ?",
    code: `const values = Array.from({ length: 1000000 }, (_, i) => (i * 7919) % 1000003)
console.log(Math.max(...values.slice(0, 5)))
try {
  console.log(Math.max(...values))
} catch (e) {
  console.log(e.name)
}`,
    output: `31676
RangeError`,
    explanation: "La décomposition `...values` passe chaque élément comme **argument** séparé, et les arguments sont posés sur la pile d'appels. Au-delà de quelques dizaines à centaines de milliers d'éléments (selon le moteur et la taille de pile), V8 lève `RangeError: Maximum call stack size exceeded`. `Math.min.apply(null, values)` a le même défaut. Pour de grands tableaux, une boucle ou `reduce` est en O(n) et sans limite ; pour les k plus grands, un tas de taille k.",
    fix: {
      code: `const values = Array.from({ length: 1000000 }, (_, i) => (i * 7919) % 1000003)
let max = -Infinity
for (const v of values) if (v > max) max = v
console.log(max, values.reduce((a, b) => (b > a ? b : a), -Infinity))`,
      output: `1000002 1000002`,
    },
  },
  {
    id: 'hi-p-tas-tri-par-defaut',
    title: 'Trier des nombres sans comparateur pour un top-k',
    theme: 'tas',
    question: "Plutôt qu'un tas, on trie pour obtenir les 3 plus grands. Qu'affiche ce code ?",
    code: `const scores = [100, 25, 9, 1000, 85, 3]
const top3 = [...scores].sort().reverse().slice(0, 3)
console.log(top3)`,
    output: `[ 9, 85, 3 ]`,
    explanation: "Sans comparateur, `sort` convertit les éléments en **chaînes** et les compare dans l'ordre lexicographique : `'100' < '1000' < '25' < '3' < '85' < '9'`. Retourné, cela donne 9, 85, 3. Il faut toujours passer un comparateur numérique : `sort((a, b) => b - a)`. Et pour k ≪ n, un tas de taille k évite de trier tout le tableau.",
    fix: {
      code: `const scores = [100, 25, 9, 1000, 85, 3]
const top3 = [...scores].sort((a, b) => b - a).slice(0, 3)
console.log(top3)`,
      output: `[ 1000, 100, 85 ]`,
    },
  },
)

flashcards.push(
  {
    id: 'hi-f-tas-definition',
    theme: 'tas',
    front: "Qu'est-ce qu'un tas binaire min, et comment est-il stocké ?",
    back: "Un arbre binaire **complet** où chaque nœud est ≤ à ses enfants : le minimum est à la racine. Stocké dans un tableau niveau par niveau : enfants de `i` en `2i + 1` et `2i + 2`, parent en `(i - 1) >> 1`. Rien n'est trié en dehors du sommet.",
  },
  {
    id: 'hi-f-tas-complexites',
    theme: 'tas',
    front: "Complexités d'un tas binaire ?",
    back: "`peek` O(1) ; `push` et `pop` O(log n) ; construire à partir de n éléments (heapify) O(n) ; chercher ou supprimer une valeur quelconque O(n) ; tri par tas O(n log n) en place, non stable.",
  },
  {
    id: 'hi-f-tas-js',
    theme: 'tas',
    front: "JavaScript a-t-il un tas ? Et les autres langages ?",
    back: "Non : il faut écrire un `MinHeap` (ou demander si l'on peut le supposer). Python : `heapq` (tas min sur une liste, `-x` pour un tas max). Java : `PriorityQueue` (tas min, `Comparator.reverseOrder()`). Rust : `BinaryHeap` (tas **max**, `Reverse` pour un min). PHP : `SplMinHeap`, `SplMaxHeap`, `SplPriorityQueue` (max).",
  },
  {
    id: 'hi-f-tas-top-k',
    theme: 'tas',
    front: "Les k plus grands éléments d'un tableau ou d'un flux ?",
    back: "Un tas **min** de taille k : pousser chaque élément, retirer le sommet dès que la taille dépasse k. Le sommet final est le k-ième plus grand. O(n log k) en temps, O(k) en mémoire. Pour les k plus petits : tas max.",
    code: `const nums = [5, 1, 9, 3, 7]
const k = 2
const best = [] // version sans tas, pour l'idée : garder les k plus grands
for (const x of nums) {
  best.push(x)
  best.sort((a, b) => a - b)
  if (best.length > k) best.shift()
}
best // → [ 7, 9 ]`,
  },
  {
    id: 'hi-f-tas-quickselect',
    theme: 'tas',
    front: "k-ième plus grand : tri, tas ou quickselect ?",
    back: "Tri : O(n log n), simple. Tas de taille k : O(n log k), O(k) mémoire, marche sur un flux. Quickselect : O(n) en moyenne, O(n²) au pire (pivot aléatoire), en place mais modifie le tableau et exige toutes les données.",
  },
  {
    id: 'hi-f-tas-fusion-k',
    theme: 'tas',
    front: "Fusionner k listes ou tableaux triés ?",
    back: "Tas min des têtes `[valeur, indice de la suite, position]`. Retirer le minimum, l'ajouter au résultat, pousser le suivant de la même suite. O(N log k) pour N éléments au total, tas de taille ≤ k.",
  },
  {
    id: 'hi-f-tas-mediane',
    theme: 'tas',
    front: "Médiane d'un flux en O(log n) par ajout ?",
    back: "Tas max `low` (moitié basse) et tas min `high` (moitié haute), avec `low.size` égal à `high.size` ou un de plus. Ajout : push dans `low`, transférer le max de `low` vers `high`, puis rééquilibrer si `high` est plus gros. Médiane : sommet de `low`, ou moyenne des deux sommets.",
  },
  {
    id: 'hi-f-tas-heapify',
    theme: 'tas',
    front: "Pourquoi heapify est-il en O(n) et non O(n log n) ?",
    back: "On applique *sift down* des derniers parents vers la racine. Le coût d'un nœud est la hauteur sous lui : la moitié des nœuds (feuilles) ne coûtent rien, un quart coûte 1, un huitième 2… La somme Σ n·h / 2^(h+1) est bornée par n.",
  },
)

lexique.push(
  {
    term: 'Tas binaire',
    theme: 'tas',
    def: "Arbre binaire complet stocké dans un tableau, où chaque nœud est prioritaire sur ses enfants (≤ pour un tas min, ≥ pour un tas max). Sommet en O(1), insertion et extraction en O(log n), construction en O(n). Implémentation usuelle d'une file de priorité.",
    see: ['File de priorité', 'Heapify'],
  },
  {
    term: 'File de priorité',
    theme: 'tas',
    def: "Type abstrait dont on extrait toujours l'élément le plus prioritaire, quel que soit l'ordre d'insertion. Généralement implémenté par un tas binaire. Absent de la bibliothèque standard JavaScript ; `heapq` en Python, `PriorityQueue` en Java, `BinaryHeap` en Rust.",
    see: ['Tas binaire'],
  },
  {
    term: 'Heapify',
    theme: 'tas',
    def: "Construction d'un tas à partir d'un tableau quelconque, en appliquant la descente (*sift down*) à chaque nœud interne, du dernier parent jusqu'à la racine. Coût O(n), contre O(n log n) pour n insertions successives.",
    see: ['Tas binaire', 'Tri par tas'],
  },
  {
    term: 'Tri par tas',
    theme: 'tas',
    def: "Tri en O(n log n) dans tous les cas et en place : heapify en tas max, puis échanges répétés de la racine avec la dernière case du tas, qui rétrécit d'une case à chaque fois. Non stable, et moins rapide en pratique que le tri rapide (accès mémoire dispersés).",
    see: ['Heapify'],
  },
  {
    term: 'Top-k',
    theme: 'tas',
    def: "Famille de problèmes « les k plus grands / plus petits / plus fréquents / plus proches ». Solution type : un tas de taille k ordonné à l'inverse de ce que l'on cherche (tas min pour les plus grands), en O(n log k) ; alternatives : tri, quickselect.",
    see: ['Tas binaire', 'Fusion à k voies (k-way merge)'],
  },
  {
    term: 'Fusion à k voies (k-way merge)',
    theme: 'tas',
    def: "Fusion de k suites triées en une seule : un tas min contient la tête de chaque suite ; on extrait le minimum et on pousse l'élément suivant de la même suite. O(N log k) pour N éléments. Principe du tri externe (fusion de fichiers triés sur disque).",
    see: ['File de priorité'],
  },
)

entretien.push(
  {
    id: 'hi-e-tas-sans-tas',
    section: 'structures',
    q: "Le problème demande une file de priorité, mais vous codez en JavaScript. Comment réagissez-vous ?",
    answer: `D'abord, **le dire** : JavaScript n'a pas de tas standard. Puis proposer, dans l'ordre :

- demander si l'on peut supposer une classe \`MinHeap\` avec \`push\`, \`pop\`, \`peek\` et \`size\`, et se concentrer sur l'algorithme (beaucoup de recruteurs l'acceptent) ;
- sinon l'écrire : une trentaine de lignes, tableau, comparateur, *sift up* au \`push\`, *sift down* au \`pop\`, en annonçant les indices \`2i + 1\`, \`2i + 2\` et \`(i - 1) >> 1\` ;
- éviter les faux tas : trier le tableau à chaque insertion (O(n log n) par opération) ou insérer à sa place avec \`splice\` (O(n)) ne donnent pas les complexités annoncées ; c'est acceptable seulement pour de très petites tailles, en le disant.

Pour les problèmes où l'on n'a besoin que de k éléments, un simple tableau trié de taille k (insertion en O(k)) est un compromis honnête si k est petit.`,
    attendu: "Savoir écrire un tas correct rapidement, et être lucide sur le coût des contournements.",
  },
  {
    id: 'hi-e-tas-top-k',
    section: 'complexite',
    q: "Trouver les 10 requêtes les plus fréquentes dans un journal de 10 milliards de lignes : comment faites-vous ?",
    answer: `**Si les requêtes distinctes tiennent en mémoire** : une \`Map\` requête → compteur en un passage (O(n)), puis un tas min de taille 10 sur les entrées (O(d log 10)). Trier les d entrées marcherait aussi, mais inutilement en O(d log d).

**Si elles ne tiennent pas en mémoire** :

- partitionner par hachage : chaque ligne va dans le fichier \`hash(requête) % m\` ; une même requête tombe toujours dans le même fichier ;
- traiter chaque fichier indépendamment (compteurs + tas de taille 10), éventuellement en parallèle (c'est un MapReduce) ;
- fusionner les m top-10 partiels avec un dernier tas de taille 10 : c'est exact, puisque chaque requête n'apparaît que dans un fichier.

**Si une réponse approchée suffit** (flux continu) : un *Count-Min Sketch* (mémoire fixe, surestimation bornée) couplé à un tas des candidats, ou l'algorithme de Misra-Gries (« heavy hitters »).`,
    attendu: "Le duo comptage + tas de taille k, puis le passage à l'échelle par partitionnement, et la connaissance d'approches approximatives.",
  },
  {
    id: 'hi-e-tas-planificateur',
    section: 'conception',
    q: "Concevez un planificateur qui exécute des tâches à une date donnée (comme `setTimeout`, mais pour des millions de tâches).",
    answer: `**Cœur** : une file de priorité ordonnée par date d'exécution. Un fil d'exécution attend jusqu'à la date du sommet (\`peek\`), puis \`pop\` et exécute. Ajouter une tâche : \`push\` en O(log n) ; si elle devient le nouveau sommet, on réveille le fil pour qu'il recalcule son attente.

**Annulation** : retirer un élément quelconque d'un tas coûte O(n). On préfère la **suppression paresseuse** : marquer la tâche comme annulée (une \`Set\` d'identifiants) et l'ignorer quand elle arrive au sommet. Si les annulations s'accumulent, on reconstruit le tas (heapify en O(n)).

**Passage à l'échelle** :

- persistance (une table triée par date, interrogée par lots) pour survivre aux redémarrages ;
- partitionnement des tâches entre plusieurs machines ; chaque tâche ne doit être exécutée qu'une fois (verrou ou bail) ;
- pour des délais très nombreux et peu précis, la **roue temporelle** (*timing wheel*) donne O(1) par insertion, au prix de la précision : c'est ce qu'utilisent Kafka ou Netty.`,
    attendu: "Identifier la file de priorité, traiter l'annulation (suppression paresseuse) et discuter des contraintes de fiabilité et d'échelle.",
  },
)

export const pack: ThemePack = { cours, katas, quiz, pieges, flashcards, lexique, entretien }
