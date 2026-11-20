import type { CoursBlock, CoursSection, EntretienQ, Flashcard, Kata, LexiqueEntry, Piege, QuizItem, ThemePack } from '../types'

/**
 * Pack « graphes » : thèmes `graphes` et `glouton`. Préfixe des identifiants : `gr-`.
 * Les champs de code évitent l'accent grave, `${` et la barre oblique inverse.
 */

// ---------------------------------------------------------------------------
// Cours : graphes (première moitié)
// ---------------------------------------------------------------------------

const graphesBlocs1: CoursBlock[] = [
  {
    p: `Un **graphe** est un ensemble de **sommets** (ou nœuds) reliés par des **arêtes**. Les arêtes peuvent être **orientées** (une dépendance « A avant B », un lien web) ou **non orientées** (une amitié, une route à double sens), et **pondérées** (une distance, un coût, un temps) ou non. En entretien, le graphe est rarement annoncé : il se cache derrière une grille, une liste de dépendances, des mots qui diffèrent d'une lettre, des comptes à fusionner ou des villes reliées par des vols.`,
  },
  {
    p: `On note **V** le nombre de sommets et **E** le nombre d'arêtes. Presque tous les parcours coûtent **O(V + E)** : chaque sommet est visité une fois et chaque arête examinée une fois (deux fois si elle est non orientée). Retenez ce chiffre, c'est la réponse attendue à « quelle est la complexité ? » pour BFS, DFS, le tri topologique, la détection de cycle ou le comptage de composantes.`,
  },
  { h: 'Représenter un graphe', id: 'graphes-representations' },
  {
    p: `Quatre représentations reviennent sans cesse. Le choix dépend de la densité du graphe et des opérations dont on a besoin ; dans 90 % des exercices, c'est la **liste d'adjacence** qu'il faut construire en premier à partir de l'entrée.`,
  },
  {
    table: [
      ['Représentation', 'Mémoire', 'Tester une arête u–v', 'Parcourir les voisins de u', 'Quand l’utiliser'],
      ['Liste d’adjacence (tableau de tableaux)', 'O(V + E)', 'O(degré(u))', 'O(degré(u))', 'Cas général, sommets numérotés 0..n-1'],
      ['Liste d’adjacence (`Map`)', 'O(V + E)', 'O(degré(u))', 'O(degré(u))', 'Sommets quelconques : chaînes, coordonnées encodées'],
      ['Matrice d’adjacence', 'O(V²)', 'O(1)', 'O(V)', 'Graphe dense, petit V (≤ quelques milliers), Floyd-Warshall'],
      ['Liste d’arêtes', 'O(E)', 'O(E)', 'O(E)', 'Kruskal, Bellman-Ford, union-find : on traite les arêtes une par une'],
      ['Grille implicite', 'O(1) en plus de la grille', 'O(1)', 'O(4) ou O(8)', 'Labyrinthes, îles, propagation : les voisins se calculent'],
    ],
  },
  {
    title: 'Construire le graphe depuis une liste d’arêtes',
    code: `const n = 4
const edges = [[0, 1], [0, 2], [1, 2], [2, 3]]

// 1. Liste d'adjacence : un tableau NEUF par sommet (surtout pas Array(n).fill([]))
const adj = Array.from({ length: n }, () => [])
for (const [u, v] of edges) {
  adj[u].push(v)
  adj[v].push(u) // non orienté : on ajoute les deux sens
}
console.log(adj)

// 2. Map : pratique quand les sommets sont des chaînes
const g = new Map()
function addEdge(u, v) {
  if (!g.has(u)) g.set(u, [])
  if (!g.has(v)) g.set(v, [])
  g.get(u).push(v)
  g.get(v).push(u)
}
addEdge('paris', 'lyon')
addEdge('lyon', 'nice')
console.log(g)

// 3. Matrice : test d'arête en O(1), mais V² cases
const mat = Array.from({ length: n }, () => new Array(n).fill(0))
for (const [u, v] of edges) mat[u][v] = mat[v][u] = 1
console.log(mat[0][2], mat[0][3])`,
    output: `[ [ 1, 2 ], [ 0, 2 ], [ 0, 1, 3 ], [ 2 ] ]
Map(3) { 'paris' => [ 'lyon' ], 'lyon' => [ 'paris', 'nice' ], 'nice' => [ 'lyon' ] }
1 0`,
    equiv: {
      python: `from collections import defaultdict

n = 4
edges = [(0, 1), (0, 2), (1, 2), (2, 3)]

# 1. Liste d'adjacence : une liste neuve par sommet ([[]] * n partagerait la même liste)
adj = [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)
print(adj)

# 2. Dictionnaire : defaultdict crée la liste au premier accès
g = defaultdict(list)
def add_edge(u, v):
    g[u].append(v)
    g[v].append(u)
add_edge('paris', 'lyon')
add_edge('lyon', 'nice')
print(dict(g))

# 3. Matrice
mat = [[0] * n for _ in range(n)]
for u, v in edges:
    mat[u][v] = mat[v][u] = 1
print(mat[0][2], mat[0][3])`,
      java: `import java.util.*;
import java.util.function.BiConsumer;

int n = 4;
int[][] edges = { {0, 1}, {0, 2}, {1, 2}, {2, 3} };

// 1. Liste d'adjacence
List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);
    adj.get(e[1]).add(e[0]);
}
System.out.println(adj);

// 2. Map : computeIfAbsent crée la liste au besoin
Map<String, List<String>> g = new LinkedHashMap<>();
BiConsumer<String, String> addEdge = (u, v) -> {
    g.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
    g.computeIfAbsent(v, k -> new ArrayList<>()).add(u);
};
addEdge.accept("paris", "lyon");
addEdge.accept("lyon", "nice");
System.out.println(g);

// 3. Matrice
int[][] mat = new int[n][n];
for (int[] e : edges) mat[e[0]][e[1]] = mat[e[1]][e[0]] = 1;
System.out.println(mat[0][2] + " " + mat[0][3]);`,
      rust: `use std::collections::HashMap;

let n = 4;
let edges = [(0, 1), (0, 2), (1, 2), (2, 3)];

// 1. Liste d'adjacence
let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n];
for &(u, v) in &edges {
    adj[u].push(v);
    adj[v].push(u);
}
println!("{:?}", adj);

// 2. HashMap : entry().or_default() crée le vecteur au besoin
let mut g: HashMap<&str, Vec<&str>> = HashMap::new();
for (u, v) in [("paris", "lyon"), ("lyon", "nice")] {
    g.entry(u).or_default().push(v);
    g.entry(v).or_default().push(u);
}

// 3. Matrice
let mut mat = vec![vec![0u8; n]; n];
for &(u, v) in &edges {
    mat[u][v] = 1;
    mat[v][u] = 1;
}
println!("{} {}", mat[0][2], mat[0][3]);`,
    },
  },
  {
    p: `Sur une **grille**, on ne construit pas le graphe : chaque case \`(r, c)\` est un sommet et ses voisins se calculent avec un tableau de directions. On vérifie les bornes **avant** de lire la case. Quand une case doit servir de clé (ensemble de visités, \`Map\`), on l'encode en un entier \`r * cols + c\` plutôt qu'en chaîne \`r + ',' + c\` : c'est plus rapide et plus économe.`,
  },
  {
    title: 'Voisins dans une grille implicite',
    code: `const grid = ['S.#', '..#', '#..']
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] // bas, haut, droite, gauche

function neighbors(r, c) {
  const res = []
  for (const [dr, dc] of DIRS) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nc < 0 || nr >= grid.length || nc >= grid[0].length) continue // hors grille
    if (grid[nr][nc] === '#') continue // mur
    res.push([nr, nc])
  }
  return res
}

console.log(neighbors(1, 1))
console.log(neighbors(0, 0))
const cols = grid[0].length
console.log('case (2, 1) encodée :', 2 * cols + 1)`,
    output: `[ [ 2, 1 ], [ 0, 1 ], [ 1, 0 ] ]
[ [ 1, 0 ], [ 0, 1 ] ]
case (2, 1) encodée : 7`,
  },
  {
    mnemo: `« Liste d'adjacence par défaut, matrice si dense, liste d'arêtes pour Kruskal, grille = graphe implicite. » Et toujours \`Array.from({ length: n }, () => [])\`.`,
    piege: `\`new Array(n).fill([])\` remplit le tableau avec **le même** tableau vide : un \`push\` sur \`adj[0]\` apparaît dans tous les sommets. Autre oubli fréquent : ne pas ajouter l'arête dans les deux sens pour un graphe non orienté.`,
  },

  { h: 'BFS : parcours en largeur et plus court chemin', id: 'graphes-bfs' },
  {
    p: `Le **BFS** (breadth-first search) explore le graphe par **couches** : d'abord la source, puis tous ses voisins (distance 1), puis leurs voisins (distance 2), et ainsi de suite. Il utilise une **file** (FIFO). Sa propriété clé : dans un graphe **non pondéré** (ou à poids tous égaux), la première fois qu'on atteint un sommet, c'est par un **plus court chemin**. C'est donc l'outil de « nombre minimal d'étapes / de coups / de transformations ».`,
  },
  {
    list: [
      'Signaux : « plus court chemin » sans poids, « nombre minimal d’opérations », « distance minimale dans une grille », « niveau par niveau », « le plus proche ».',
      'Complexité : O(V + E) en temps, O(V) en mémoire pour la file et les distances. Sur une grille R × C : O(R × C).',
      'Marquer un sommet comme visité **au moment où on l’enfile**, pas quand on le défile : sinon il peut être ajouté plusieurs fois à la file.',
      'En JavaScript, `queue.shift()` est en O(n) (il décale tout le tableau) : on garde un **index de tête** `head` et on lit `queue[head++]`.',
      'Pour reconstruire le chemin, on mémorise `parent[v] = u` à la découverte de `v`, puis on remonte depuis la cible.',
    ],
  },
  {
    title: 'Gabarit BFS : distances et chemin',
    code: `function buildGraph(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  return adj
}

function bfs(adj, start) {
  const dist = new Array(adj.length).fill(-1) // -1 = pas encore atteint (sert aussi de « visité »)
  const parent = new Array(adj.length).fill(-1)
  const queue = [start]
  let head = 0 // index de tête : défiler en O(1) sans shift()
  dist[start] = 0
  while (head < queue.length) {
    const u = queue[head++]
    for (const v of adj[u]) {
      if (dist[v] !== -1) continue
      dist[v] = dist[u] + 1 // marqué à l'enfilage
      parent[v] = u
      queue.push(v)
    }
  }
  return { dist, parent }
}

function path(parent, target) {
  const p = []
  for (let v = target; v !== -1; v = parent[v]) p.push(v)
  return p.reverse()
}

const adj = buildGraph(6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]])
const { dist, parent } = bfs(adj, 0)
console.log(dist) // le sommet 5 est isolé
console.log(path(parent, 4))`,
    output: `[ 0, 1, 1, 2, 3, -1 ]
[ 0, 1, 3, 4 ]`,
    equiv: {
      python: `from collections import deque

def build_graph(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj

def bfs(adj, start):
    dist = [-1] * len(adj)
    parent = [-1] * len(adj)
    queue = deque([start])  # deque : popleft() en O(1), contrairement à list.pop(0)
    dist[start] = 0
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if dist[v] != -1:
                continue
            dist[v] = dist[u] + 1
            parent[v] = u
            queue.append(v)
    return dist, parent

def path(parent, target):
    p = []
    v = target
    while v != -1:
        p.append(v)
        v = parent[v]
    return p[::-1]

adj = build_graph(6, [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4)])
dist, parent = bfs(adj, 0)
print(dist)
print(path(parent, 4))`,
      java: `import java.util.*;

static List<List<Integer>> buildGraph(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }
    return adj;
}

// renvoie { dist, parent }
static int[][] bfs(List<List<Integer>> adj, int start) {
    int n = adj.size();
    int[] dist = new int[n];
    int[] parent = new int[n];
    Arrays.fill(dist, -1);
    Arrays.fill(parent, -1);
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    queue.add(start);
    dist[start] = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        for (int v : adj.get(u)) {
            if (dist[v] != -1) continue;
            dist[v] = dist[u] + 1;
            parent[v] = u;
            queue.add(v);
        }
    }
    return new int[][] { dist, parent };
}

static List<Integer> path(int[] parent, int target) {
    List<Integer> p = new ArrayList<>();
    for (int v = target; v != -1; v = parent[v]) p.add(v);
    Collections.reverse(p);
    return p;
}`,
      rust: `use std::collections::VecDeque;

fn bfs(adj: &Vec<Vec<usize>>, start: usize) -> (Vec<i64>, Vec<Option<usize>>) {
    let n = adj.len();
    let mut dist = vec![-1i64; n];
    let mut parent = vec![None; n];
    let mut queue = VecDeque::new();
    dist[start] = 0;
    queue.push_back(start);
    while let Some(u) = queue.pop_front() {
        for &v in &adj[u] {
            if dist[v] != -1 {
                continue;
            }
            dist[v] = dist[u] + 1;
            parent[v] = Some(u);
            queue.push_back(v);
        }
    }
    (dist, parent)
}

fn path(parent: &[Option<usize>], target: usize) -> Vec<usize> {
    let mut p = vec![target];
    let mut v = target;
    while let Some(u) = parent[v] {
        p.push(u);
        v = u;
    }
    p.reverse();
    p
}`,
      php: `function bfs(array $adj, int $start): array {
    $n = count($adj);
    $dist = array_fill(0, $n, -1);
    $parent = array_fill(0, $n, -1);
    $queue = new SplQueue(); // array_shift() serait en O(n), comme shift() en JS
    $queue->enqueue($start);
    $dist[$start] = 0;
    while (!$queue->isEmpty()) {
        $u = $queue->dequeue();
        foreach ($adj[$u] as $v) {
            if ($dist[$v] !== -1) continue;
            $dist[$v] = $dist[$u] + 1;
            $parent[$v] = $u;
            $queue->enqueue($v);
        }
    }
    return [$dist, $parent];
}`,
    },
  },
  {
    p: `Variante fréquente : traiter le BFS **niveau par niveau**, quand on veut compter des « minutes », des « étapes » ou des « tours ». On fige la taille de la couche courante avant de la vider. Avec un index de tête, la couche courante est la tranche \`[head, fin)\` de la file au moment où l'on commence le niveau.`,
  },
  {
    title: 'BFS par niveaux',
    code: `function levels(adj, start) {
  const seen = new Array(adj.length).fill(false)
  const queue = [start]
  let head = 0
  seen[start] = true
  const result = []
  while (head < queue.length) {
    const end = queue.length // la couche courante s'arrête ici
    const level = []
    while (head < end) {
      const u = queue[head++]
      level.push(u)
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true
          queue.push(v)
        }
      }
    }
    result.push(level)
  }
  return result
}

const adj = [[1, 2], [0, 3, 4], [0, 4], [1], [1, 2, 5], [4]]
console.log(levels(adj, 0))`,
    output: `[ [ 0 ], [ 1, 2 ], [ 3, 4 ], [ 5 ] ]`,
  },
  {
    mnemo: `« BFS = file + couches = plus court chemin non pondéré. On marque à l'**enfilage**, on défile avec un **index de tête**. »`,
    piege: `Utiliser BFS sur un graphe **pondéré** : il minimise le nombre d'arêtes, pas la somme des poids. Il faut alors Dijkstra (poids positifs), BFS 0-1 (poids 0 ou 1) ou Bellman-Ford (poids négatifs).`,
  },

  { h: 'DFS : parcours en profondeur, récursif et itératif', id: 'graphes-dfs' },
  {
    p: `Le **DFS** (depth-first search) s'enfonce le plus loin possible avant de revenir en arrière. Il utilise une **pile** : implicitement la pile d'appels en version récursive, explicitement un tableau en version itérative. Il ne donne **pas** de plus court chemin, mais il est idéal pour tout ce qui relève de l'**exploration complète** : composantes connexes, détection de cycle, tri topologique, existence d'un chemin, backtracking.`,
  },
  {
    list: [
      'Complexité : O(V + E) en temps ; O(V) en mémoire (tableau des visités + profondeur de pile).',
      'La version récursive est la plus lisible, mais chaque niveau de récursion consomme un cadre de pile : au-delà d’environ 10⁴ niveaux (selon le moteur et la taille des cadres), JavaScript lève `RangeError: Maximum call stack size exceeded`. Une chaîne de 10⁵ sommets ou une grille 500 × 500 en serpentin suffisent à la faire tomber.',
      'La version itérative remplace la pile d’appels par un tableau `stack` : aucune limite autre que la mémoire. C’est le bon réflexe dès que l’entrée peut être grande.',
      'L’ordre de visite des deux versions peut différer : pour retrouver exactement l’ordre récursif, on empile les voisins à l’envers.',
    ],
  },
  {
    title: 'DFS récursif et DFS itératif',
    code: `const adj = [[1, 2], [0, 3], [0], [1], [5], [4]] // deux composantes : {0,1,2,3} et {4,5}

function dfsRec(u, seen, order) {
  seen[u] = true
  order.push(u)
  for (const v of adj[u]) if (!seen[v]) dfsRec(v, seen, order)
}

function dfsIter(start) {
  const seen = new Array(adj.length).fill(false)
  const order = []
  const stack = [start]
  while (stack.length > 0) {
    const u = stack.pop()
    if (seen[u]) continue // un sommet peut être empilé plusieurs fois : on l'ignore au dépilage
    seen[u] = true
    order.push(u)
    // voisins empilés à l'envers pour visiter dans le même ordre que la version récursive
    for (let i = adj[u].length - 1; i >= 0; i--) if (!seen[adj[u][i]]) stack.push(adj[u][i])
  }
  return order
}

const order = []
dfsRec(0, new Array(adj.length).fill(false), order)
console.log(order)
console.log(dfsIter(0))
console.log(dfsIter(4))`,
    output: `[ 0, 1, 3, 2 ]
[ 0, 1, 3, 2 ]
[ 4, 5 ]`,
    equiv: {
      python: `import sys

adj = [[1, 2], [0, 3], [0], [1], [5], [4]]

# Python limite la récursion à 1000 niveaux par défaut :
# sys.setrecursionlimit aide un peu, mais la version itérative reste la plus sûre.
def dfs_rec(u, seen, order):
    seen[u] = True
    order.append(u)
    for v in adj[u]:
        if not seen[v]:
            dfs_rec(v, seen, order)

def dfs_iter(start):
    seen = [False] * len(adj)
    order = []
    stack = [start]
    while stack:
        u = stack.pop()
        if seen[u]:
            continue
        seen[u] = True
        order.append(u)
        for v in reversed(adj[u]):
            if not seen[v]:
                stack.append(v)
    return order`,
      java: `import java.util.*;

static void dfsRec(int u, List<List<Integer>> adj, boolean[] seen, List<Integer> order) {
    seen[u] = true;
    order.add(u);
    for (int v : adj.get(u)) if (!seen[v]) dfsRec(v, adj, seen, order);
}

// ArrayDeque sert aussi de pile (push / pop) ; la classe Stack est à éviter
static List<Integer> dfsIter(List<List<Integer>> adj, int start) {
    boolean[] seen = new boolean[adj.size()];
    List<Integer> order = new ArrayList<>();
    ArrayDeque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (seen[u]) continue;
        seen[u] = true;
        order.add(u);
        List<Integer> nb = adj.get(u);
        for (int i = nb.size() - 1; i >= 0; i--) if (!seen[nb.get(i)]) stack.push(nb.get(i));
    }
    return order;
}`,
    },
  },
  {
    p: `Pour **compter les composantes connexes** d'un graphe non orienté, on lance un parcours (DFS ou BFS, peu importe) depuis chaque sommet non encore visité : chaque lancement découvre exactement une composante. Le coût total reste O(V + E) car chaque sommet n'est visité qu'une fois sur l'ensemble des lancements. Union-find (plus bas) répond à la même question, et brille quand les arêtes arrivent au fil de l'eau.`,
  },
  {
    title: 'Compter les composantes connexes',
    code: `function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  const seen = new Array(n).fill(false)
  let count = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    count++ // nouvelle composante
    const stack = [s]
    seen[s] = true
    while (stack.length > 0) {
      const u = stack.pop()
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true
          stack.push(v)
        }
      }
    }
  }
  return count
}

console.log(countComponents(5, [[0, 1], [1, 2], [3, 4]]))
console.log(countComponents(4, [])) // 4 sommets isolés
console.log(countComponents(0, []))`,
    output: `2
4
0`,
  },
  {
    mnemo: `« DFS = pile = exploration complète. Récursif pour la lisibilité, itératif dès que la profondeur peut dépasser quelques milliers. »`,
    piege: `Un DFS récursif sur une grille 1000 × 1000 entièrement remplie peut descendre à 10⁶ niveaux et faire exploser la pile, alors que le même algorithme en itératif passe sans problème. Annoncez-le en entretien : c'est un point que les recruteurs apprécient.`,
  },

  { h: 'Grilles : îles, flood fill et BFS multi-sources', id: 'graphes-grilles' },
  {
    p: `Beaucoup d'exercices de graphes sont des exercices de **grille** : compter des îles, mesurer la plus grande zone, remplir une région (outil « pot de peinture »), propager une contamination. Le gabarit est toujours le même : double boucle sur les cases, et depuis chaque case « intéressante » non visitée, un parcours qui marque toute sa région. C'est le **flood fill**.`,
  },
  {
    title: 'Nombre d’îles (flood fill itératif)',
    code: `function numIslands(grid) {
  const rows = grid.length
  const cols = rows > 0 ? grid[0].length : 0
  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false))
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1' || seen[r][c]) continue
      count++ // une nouvelle île : on la marque entièrement
      const stack = [[r, c]]
      seen[r][c] = true
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr
          const nc = cc + dc
          if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === '1' && !seen[nr][nc]) {
            seen[nr][nc] = true
            stack.push([nr, nc])
          }
        }
      }
    }
  }
  return count
}

console.log(numIslands(['11000', '11000', '00100', '00011']))
console.log(numIslands(['111', '010', '111']))
console.log(numIslands([]))`,
    output: `3
1
0`,
    equiv: {
      python: `def num_islands(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    seen = [[False] * cols for _ in range(rows)]
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != '1' or seen[r][c]:
                continue
            count += 1
            stack = [(r, c)]
            seen[r][c] = True
            while stack:
                cr, cc = stack.pop()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1' and not seen[nr][nc]:
                        seen[nr][nc] = True
                        stack.append((nr, nc))
    return count`,
      java: `static final int[][] DIRS = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };

static int numIslands(String[] grid) {
    int rows = grid.length, cols = rows > 0 ? grid[0].length() : 0;
    boolean[][] seen = new boolean[rows][cols];
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r].charAt(c) != '1' || seen[r][c]) continue;
            count++;
            ArrayDeque<int[]> stack = new ArrayDeque<>();
            stack.push(new int[] { r, c });
            seen[r][c] = true;
            while (!stack.isEmpty()) {
                int[] cur = stack.pop();
                for (int[] d : DIRS) {
                    int nr = cur[0] + d[0], nc = cur[1] + d[1];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols
                            && grid[nr].charAt(nc) == '1' && !seen[nr][nc]) {
                        seen[nr][nc] = true;
                        stack.push(new int[] { nr, nc });
                    }
                }
            }
        }
    }
    return count;
}`,
    },
  },
  {
    p: `Le **BFS multi-sources** démarre avec **plusieurs sommets dans la file dès le départ**, tous à distance 0. Il calcule, pour chaque case, la distance à la source **la plus proche**, en un seul parcours O(R × C). Lancer un BFS par source coûterait O(sources × R × C). Signaux : « oranges pourries », « distance au 0 le plus proche », « distance à la porte la plus proche », « propagation simultanée ».`,
  },
  {
    title: 'Distance au zéro le plus proche (multi-sources)',
    code: `function nearestZero(mat) {
  const rows = mat.length
  const cols = mat[0].length
  const dist = mat.map((row) => row.map((x) => (x === 0 ? 0 : -1)))
  const queue = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (mat[r][c] === 0) queue.push([r, c])
  let head = 0
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (head < queue.length) {
    const [r, c] = queue[head++]
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return dist
}

console.log(nearestZero([[0, 0, 0], [0, 1, 0], [1, 1, 1]]))`,
    output: `[ [ 0, 0, 0 ], [ 0, 1, 0 ], [ 1, 2, 1 ] ]`,
  },
  {
    p: `**BFS 0-1** (pour mémoire) : quand les arêtes valent 0 ou 1, on utilise une **deque** : une arête de poids 0 place le voisin **en tête**, une arête de poids 1 le place **en queue**. On obtient les plus courts chemins en O(V + E), sans tas. Exemple typique : nombre minimal de murs à casser, ou de flèches à inverser, pour traverser une grille. JavaScript n'ayant pas de deque, on la simule avec un tableau circulaire ou deux piles.`,
  },
  {
    mnemo: `« Une région = un flood fill. Plusieurs départs simultanés = toutes les sources dans la file au temps 0. »`,
    piege: `Modifier la grille d'entrée pour marquer les cases visitées (\`grid[r][c] = '0'\`) est courant et économise de la mémoire, mais c'est un **effet de bord** : demandez si c'est permis, ou utilisez un tableau \`seen\`. Les chaînes JavaScript sont immuables : \`grid[r][c] = '0'\` sur un tableau de chaînes ne fait rien en mode non strict, et lève une \`TypeError\` en mode strict (modules, classes).`,
  },
]

// ---------------------------------------------------------------------------
// Cours : graphes (seconde moitié)
// ---------------------------------------------------------------------------

const graphesBlocs2: CoursBlock[] = [
  { h: 'Cycles et graphes bipartis', id: 'graphes-cycles' },
  {
    p: `**Graphe non orienté.** Pendant un parcours, si l'on rencontre un voisin **déjà visité qui n'est pas le parent** par lequel on est arrivé, on a trouvé un cycle. Il faut ignorer le parent, sinon la moindre arête u–v (vue dans les deux sens) passerait pour un cycle. Alternative très simple : union-find, où une arête dont les deux extrémités sont déjà dans le même ensemble ferme un cycle.`,
  },
  {
    p: `**Graphe orienté.** L'astuce du parent ne suffit plus : dans le losange 0→1, 0→2, 1→2, le sommet 2 est atteint deux fois sans qu'il y ait de cycle. On utilise **trois couleurs** : blanc (jamais vu), gris (sur la pile de récursion en cours), noir (entièrement traité). Un cycle existe si et seulement si l'on tombe sur un sommet **gris** : c'est un ancêtre du sommet courant, donc une arête arrière. L'autre méthode est le tri topologique de Kahn : s'il ne parvient pas à placer tous les sommets, il reste un cycle.`,
  },
  {
    title: 'Cycle dans un graphe non orienté (parent) et orienté (trois couleurs)',
    code: `function hasCycleUndirected(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  const seen = new Array(n).fill(false)
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    const stack = [[s, -1]] // [sommet, parent]
    seen[s] = true
    while (stack.length > 0) {
      const [u, parent] = stack.pop()
      for (const v of adj[u]) {
        if (v === parent) continue // l'arête par laquelle on est arrivé
        if (seen[v]) return true
        seen[v] = true
        stack.push([v, u])
      }
    }
  }
  return false
}

function hasCycleDirected(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) adj[u].push(v)
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color = new Array(n).fill(WHITE)
  function visit(u) {
    color[u] = GRAY // u est sur le chemin en cours
    for (const v of adj[u]) {
      if (color[v] === GRAY) return true // arête arrière : cycle
      if (color[v] === WHITE && visit(v)) return true
    }
    color[u] = BLACK // terminé, plus jamais à revisiter
    return false
  }
  for (let u = 0; u < n; u++) if (color[u] === WHITE && visit(u)) return true
  return false
}

console.log(hasCycleUndirected(3, [[0, 1], [1, 2]]), hasCycleUndirected(3, [[0, 1], [1, 2], [2, 0]]))
console.log(hasCycleDirected(3, [[0, 1], [0, 2], [1, 2]])) // losange : pas de cycle
console.log(hasCycleDirected(3, [[0, 1], [1, 2], [2, 0]]))`,
    output: `false true
false
true`,
  },
  {
    p: `Un graphe est **biparti** si l'on peut colorier ses sommets en deux couleurs de sorte que chaque arête relie deux couleurs différentes (équipes, créneaux, « peut-on séparer ces personnes en deux groupes sans ennemis dans le même groupe ? »). Méthode : BFS ou DFS qui colorie chaque voisin de la couleur opposée ; un conflit (voisin déjà de la même couleur) prouve que c'est impossible. Théorème utile : un graphe est biparti **si et seulement s'il n'a aucun cycle de longueur impaire**. Sans oublier de relancer le parcours sur chaque composante.`,
  },
  {
    title: 'Graphe biparti par 2-coloration',
    code: `function isBipartite(adj) {
  const color = new Array(adj.length).fill(-1)
  for (let s = 0; s < adj.length; s++) {
    if (color[s] !== -1) continue // chaque composante est coloriée séparément
    color[s] = 0
    const queue = [s]
    let head = 0
    while (head < queue.length) {
      const u = queue[head++]
      for (const v of adj[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]
          queue.push(v)
        } else if (color[v] === color[u]) {
          return false // deux voisins de même couleur
        }
      }
    }
  }
  return true
}

console.log(isBipartite([[1, 3], [0, 2], [1, 3], [0, 2]])) // carré
console.log(isBipartite([[1, 2], [0, 2], [0, 1]])) // triangle : cycle impair`,
    output: `true
false`,
  },
  {
    mnemo: `« Non orienté : voisin visité ≠ parent. Orienté : sommet **gris** = cycle. Biparti : 2 couleurs, pas de cycle impair. »`,
    piege: `Utiliser un simple tableau « visité » pour détecter un cycle dans un graphe **orienté** : le losange 0→1→2, 0→2 serait déclaré cyclique à tort. Il faut distinguer « en cours » (gris) de « terminé » (noir).`,
  },

  { h: 'Tri topologique : Kahn et DFS', id: 'graphes-topo' },
  {
    p: `Un **tri topologique** ordonne les sommets d'un graphe orienté de façon que chaque arête u → v place u **avant** v. Il n'existe que si le graphe est **acyclique** (un DAG). Signaux : prérequis de cours, ordre de compilation, tâches dépendantes, « ordre des lettres d'un alphabet extraterrestre ». Il y a souvent **plusieurs** ordres valides : un test sérieux vérifie la validité de l'ordre, pas une permutation précise.`,
  },
  {
    list: [
      '**Kahn (BFS)** : on calcule le degré entrant de chaque sommet, on met dans une file tous les sommets de degré 0, et à chaque sommet retiré on « supprime » ses arêtes sortantes ; un voisin qui tombe à 0 entre dans la file. Si l’on n’a pas retiré n sommets, il reste un cycle.',
      '**DFS** : on ajoute un sommet à une liste **après** avoir exploré tous ses successeurs (post-ordre), puis on inverse la liste. On détecte le cycle avec les trois couleurs.',
      'Les deux coûtent O(V + E). Kahn est itératif (pas de souci de pile) et se prête à des variantes : ordre lexicographique minimal (remplacer la file par un tas), nombre minimal de « semestres » (BFS par niveaux).',
    ],
  },
  {
    title: 'Tri topologique de Kahn',
    code: `function topoKahn(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  const indeg = new Array(n).fill(0)
  for (const [u, v] of edges) {
    adj[u].push(v)
    indeg[v]++
  }
  const queue = []
  for (let u = 0; u < n; u++) if (indeg[u] === 0) queue.push(u)
  let head = 0
  while (head < queue.length) {
    const u = queue[head++]
    for (const v of adj[u]) {
      indeg[v]--
      if (indeg[v] === 0) queue.push(v)
    }
  }
  return queue.length === n ? queue : null // null : un cycle empêche de tout placer
}

console.log(topoKahn(6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]]))
console.log(topoKahn(3, [[0, 1], [1, 2], [2, 0]]))`,
    output: `[ 4, 5, 2, 0, 3, 1 ]
null`,
    equiv: {
      python: `from collections import deque

def topo_kahn(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    queue = deque(u for u in range(n) if indeg[u] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return order if len(order) == n else None`,
      java: `static int[] topoKahn(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        indeg[e[1]]++;
    }
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    for (int u = 0; u < n; u++) if (indeg[u] == 0) queue.add(u);
    int[] order = new int[n];
    int k = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        order[k++] = u;
        for (int v : adj.get(u)) if (--indeg[v] == 0) queue.add(v);
    }
    return k == n ? order : null; // null : cycle
}`,
      rust: `use std::collections::VecDeque;

fn topo_kahn(n: usize, edges: &[(usize, usize)]) -> Option<Vec<usize>> {
    let mut adj = vec![Vec::new(); n];
    let mut indeg = vec![0usize; n];
    for &(u, v) in edges {
        adj[u].push(v);
        indeg[v] += 1;
    }
    let mut queue: VecDeque<usize> = (0..n).filter(|&u| indeg[u] == 0).collect();
    let mut order = Vec::with_capacity(n);
    while let Some(u) = queue.pop_front() {
        order.push(u);
        for &v in &adj[u] {
            indeg[v] -= 1;
            if indeg[v] == 0 {
                queue.push_back(v);
            }
        }
    }
    if order.len() == n { Some(order) } else { None }
}`,
    },
  },
  {
    title: 'Tri topologique par DFS (post-ordre inversé)',
    code: `function topoDfs(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) adj[u].push(v)
  const state = new Array(n).fill(0) // 0 non vu, 1 en cours, 2 terminé
  const post = []
  function visit(u) {
    if (state[u] === 1) return false // cycle
    if (state[u] === 2) return true
    state[u] = 1
    for (const v of adj[u]) if (!visit(v)) return false
    state[u] = 2
    post.push(u) // u n'est ajouté qu'après tous ses successeurs
    return true
  }
  for (let u = 0; u < n; u++) if (!visit(u)) return null
  return post.reverse()
}

console.log(topoDfs(6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]]))`,
    output: `[ 5, 4, 2, 3, 1, 0 ]`,
    equiv: {
      python: `def topo_dfs(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    state = [0] * n  # 0 non vu, 1 en cours, 2 terminé
    post = []
    def visit(u):
        if state[u] == 1:
            return False
        if state[u] == 2:
            return True
        state[u] = 1
        for v in adj[u]:
            if not visit(v):
                return False
        state[u] = 2
        post.append(u)
        return True
    for u in range(n):
        if not visit(u):
            return None
    return post[::-1]`,
      bash: `# tsort (coreutils) fait un tri topologique : chaque ligne « avant après » est une arête.
# L'ordre produit peut différer de celui du JS (plusieurs ordres sont valides) ;
# en cas de cycle, tsort le signale sur la sortie d'erreur.
tsort <<'EOF'
5 2
5 0
4 0
4 1
2 3
3 1
EOF`,
    },
  },
  {
    mnemo: `« Kahn : degrés entrants, file des zéros, on retire et on décrémente. Moins de n sommets sortis = cycle. »`,
    piege: `Inverser le sens des arêtes : dans « [a, b] signifie qu'il faut suivre b avant a », l'arête va de **b vers a**. Se tromper donne l'ordre inverse, qui paraît plausible et échoue aux tests. Relisez l'énoncé et vérifiez sur l'exemple.`,
  },

  { h: 'Dijkstra et plus courts chemins pondérés', id: 'graphes-dijkstra' },
  {
    p: `**Dijkstra** calcule les plus courts chemins depuis une source quand **tous les poids sont positifs ou nuls**. C'est un BFS où la file devient une **file de priorité** : on traite toujours le sommet non finalisé de plus petite distance provisoire, puis on **relâche** ses arêtes (\`dist[v] = min(dist[v], dist[u] + w)\`). Avec un tas binaire, la complexité est **O((V + E) log V)**.`,
  },
  {
    p: `JavaScript n'a **pas de tas** dans sa bibliothèque standard : en entretien, on écrit un \`MinHeap\` de vingt lignes (ou on annonce qu'on le suppose disponible, si le recruteur l'accepte). Plutôt que de coder une opération « diminuer la clé », on pratique la **suppression paresseuse** : on réinsère le sommet avec sa nouvelle distance et, au moment de l'extraire, on **ignore les entrées périmées** (\`d > dist[u]\`).`,
  },
  {
    title: 'MinHeap minimal et Dijkstra',
    code: `class MinHeap {
  constructor() {
    this.a = [] // éléments [priorité, valeur]
  }
  get size() {
    return this.a.length
  }
  push(item) {
    const a = this.a
    a.push(item)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      const t = a[p]
      a[p] = a[i]
      a[i] = t
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    const last = a.pop()
    if (a.length > 0) {
      a[0] = last
      let i = 0
      while (true) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        const t = a[m]
        a[m] = a[i]
        a[i] = t
        i = m
      }
    }
    return top
  }
}

function dijkstra(n, edges, src) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) adj[u].push([v, w])
  const dist = new Array(n).fill(Infinity)
  dist[src] = 0
  const heap = new MinHeap()
  heap.push([0, src])
  while (heap.size > 0) {
    const [d, u] = heap.pop()
    if (d > dist[u]) continue // entrée périmée : u a déjà été finalisé avec mieux
    for (const [v, w] of adj[u]) {
      const nd = d + w
      if (nd < dist[v]) {
        dist[v] = nd // relaxation
        heap.push([nd, v])
      }
    }
  }
  return dist
}

const edges = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]]
console.log(dijkstra(6, edges, 0)) // le sommet 5 est inaccessible`,
    output: `[ 0, 3, 1, 4, 7, Infinity ]`,
    equiv: {
      python: `import heapq

def dijkstra(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    heap = [(0, src)]  # heapq : tas MIN sur une simple liste, tuples comparés élément par élément
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # entrée périmée
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist`,
      java: `static long[] dijkstra(int n, int[][] edges, int src) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) adj.get(e[0]).add(new int[] { e[1], e[2] });
    long[] dist = new long[n];
    Arrays.fill(dist, Long.MAX_VALUE);
    dist[src] = 0;
    // PriorityQueue est un tas MIN ; Long.compare évite le débordement de a[0] - b[0]
    PriorityQueue<long[]> heap = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
    heap.add(new long[] { 0, src });
    while (!heap.isEmpty()) {
        long[] top = heap.poll();
        long d = top[0];
        int u = (int) top[1];
        if (d > dist[u]) continue; // entrée périmée
        for (int[] e : adj.get(u)) {
            long nd = d + e[1];
            if (nd < dist[e[0]]) {
                dist[e[0]] = nd;
                heap.add(new long[] { nd, e[0] });
            }
        }
    }
    return dist;
}`,
      rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

fn dijkstra(n: usize, edges: &[(usize, usize, u64)], src: usize) -> Vec<u64> {
    let mut adj = vec![Vec::new(); n];
    for &(u, v, w) in edges {
        adj[u].push((v, w));
    }
    let mut dist = vec![u64::MAX; n];
    dist[src] = 0;
    // BinaryHeap est un tas MAX : Reverse en fait un tas min
    let mut heap = BinaryHeap::new();
    heap.push(Reverse((0u64, src)));
    while let Some(Reverse((d, u))) = heap.pop() {
        if d > dist[u] {
            continue; // entrée périmée
        }
        for &(v, w) in &adj[u] {
            let nd = d + w;
            if nd < dist[v] {
                dist[v] = nd;
                heap.push(Reverse((nd, v)));
            }
        }
    }
    dist
}`,
      php: `function dijkstra(int $n, array $edges, int $src): array {
    $adj = array_fill(0, $n, []);
    foreach ($edges as [$u, $v, $w]) $adj[$u][] = [$v, $w];
    $dist = array_fill(0, $n, INF);
    $dist[$src] = 0;
    // SplPriorityQueue est un tas MAX : on insère l'opposé de la distance
    $heap = new SplPriorityQueue();
    $heap->setExtractFlags(SplPriorityQueue::EXTR_BOTH);
    $heap->insert($src, 0);
    while (!$heap->isEmpty()) {
        ['data' => $u, 'priority' => $p] = $heap->extract();
        $d = -$p;
        if ($d > $dist[$u]) continue; // entrée périmée
        foreach ($adj[$u] as [$v, $w]) {
            $nd = $d + $w;
            if ($nd < $dist[$v]) {
                $dist[$v] = $nd;
                $heap->insert($v, -$nd);
            }
        }
    }
    return $dist;
}`,
    },
  },
  {
    p: `**Bellman-Ford** (à connaître de nom) accepte les **poids négatifs** : il relâche toutes les arêtes V − 1 fois, en O(V × E). Si un V-ième passage améliore encore une distance, il existe un **cycle de poids négatif** atteignable. Il sert aussi pour « le moins cher avec au plus K escales » (on limite le nombre de passages à K + 1, en relâchant à partir d'une copie des distances). **Floyd-Warshall** calcule toutes les paires en O(V³), raisonnable pour V ≤ 400 environ.`,
  },
  {
    title: 'Bellman-Ford (poids négatifs)',
    code: `function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity)
  dist[src] = 0
  for (let i = 0; i < n - 1; i++) {
    let changed = false
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        changed = true
      }
    }
    if (!changed) break // plus rien ne bouge : on peut s'arrêter tôt
  }
  for (const [u, v, w] of edges) if (dist[u] + w < dist[v]) return null // cycle négatif
  return dist
}

console.log(bellmanFord(4, [[0, 1, 4], [0, 2, 5], [2, 1, -3], [1, 3, 2]], 0))
console.log(bellmanFord(3, [[0, 1, 1], [1, 2, -2], [2, 1, 1]], 0))`,
    output: `[ 0, 2, 5, 4 ]
null`,
  },
  {
    mnemo: `« Dijkstra = BFS + tas. On extrait le plus petit, on ignore le périmé, on relâche. Poids négatifs : Bellman-Ford. »`,
    piege: `Oublier \`if (d > dist[u]) continue\` : l'algorithme reste correct mais retraite des sommets déjà finalisés, et la complexité peut se dégrader nettement sur les graphes denses. Autre piège : Dijkstra avec une arête négative peut finaliser un sommet trop tôt et rendre une distance fausse.`,
  },

  { h: 'Union-find et arbres couvrants minimaux', id: 'graphes-union-find' },
  {
    p: `**Union-find** (ou DSU, *disjoint set union*) maintient une partition d'éléments en ensembles disjoints avec deux opérations : \`find(x)\` renvoie le représentant (la racine) de l'ensemble de x, et \`union(a, b)\` fusionne deux ensembles. Avec la **compression de chemin** (chaque nœud traversé par \`find\` est rattaché directement à la racine) et l'**union par taille** (ou par rang : on accroche le petit arbre sous le grand), chaque opération coûte O(α(n)) amorti, où α est l'inverse de la fonction d'Ackermann : moins de 5 pour toute taille réaliste, donc « quasi constant ».`,
  },
  {
    list: [
      'Signaux : « nombre de groupes / de provinces / de comptes fusionnés », « ces deux éléments sont-ils connectés ? » avec des liens qui **arrivent au fil de l’eau**, « quelle arête crée un cycle ? », Kruskal.',
      'Avantage sur DFS/BFS : pas besoin de construire la liste d’adjacence, ajout dynamique d’arêtes. Limite : ne sait pas **supprimer** une arête, et ne donne pas de chemin.',
      '`union` renvoie `false` quand les deux éléments étaient déjà reliés : c’est exactement « cette arête ferme un cycle ».',
    ],
  },
  {
    title: 'Union-find avec compression de chemin et union par taille',
    code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.size = new Array(n).fill(1)
    this.count = n // nombre d'ensembles
  }
  find(x) {
    let root = x
    while (this.parent[root] !== root) root = this.parent[root]
    while (this.parent[x] !== root) {
      // compression de chemin (itérative : pas de risque de pile)
      const next = this.parent[x]
      this.parent[x] = root
      x = next
    }
    return root
  }
  union(a, b) {
    let ra = this.find(a)
    let rb = this.find(b)
    if (ra === rb) return false // déjà dans le même ensemble
    if (this.size[ra] < this.size[rb]) {
      const t = ra
      ra = rb
      rb = t
    }
    this.parent[rb] = ra // le petit arbre sous le grand
    this.size[ra] += this.size[rb]
    this.count--
    return true
  }
}

const uf = new UnionFind(6)
uf.union(0, 1)
uf.union(1, 2)
uf.union(3, 4)
console.log(uf.count, uf.find(2) === uf.find(0), uf.find(3) === uf.find(5))
console.log(uf.union(0, 2)) // 0 et 2 déjà reliés : cette arête ferait un cycle`,
    output: `3 true false
false`,
    equiv: {
      python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.count = n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.count -= 1
        return True`,
      java: `class UnionFind {
    int[] parent, size;
    int count;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        count = n;
    }

    int find(int x) {
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) {
            int next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        size[ra] += size[rb];
        count--;
        return true;
    }
}`,
      rust: `struct UnionFind {
    parent: Vec<usize>,
    size: Vec<usize>,
    count: usize,
}

impl UnionFind {
    fn new(n: usize) -> Self {
        UnionFind { parent: (0..n).collect(), size: vec![1; n], count: n }
    }

    fn find(&mut self, mut x: usize) -> usize {
        let mut root = x;
        while self.parent[root] != root {
            root = self.parent[root];
        }
        while self.parent[x] != root {
            let next = self.parent[x];
            self.parent[x] = root;
            x = next;
        }
        root
    }

    fn union(&mut self, a: usize, b: usize) -> bool {
        let (mut ra, mut rb) = (self.find(a), self.find(b));
        if ra == rb {
            return false;
        }
        if self.size[ra] < self.size[rb] {
            std::mem::swap(&mut ra, &mut rb);
        }
        self.parent[rb] = ra;
        self.size[ra] += self.size[rb];
        self.count -= 1;
        true
    }
}`,
    },
  },
  {
    p: `Un **arbre couvrant minimal** (MST, *minimum spanning tree*) relie tous les sommets d'un graphe non orienté connexe avec V − 1 arêtes de poids total minimal (câbler des maisons, relier des points au moindre coût). Deux algorithmes **gloutons** :`,
  },
  {
    list: [
      '**Kruskal** : trier les arêtes par poids croissant, puis les ajouter une à une si elles relient deux composantes différentes (union-find). O(E log E), dominé par le tri.',
      '**Prim** : partir d’un sommet et ajouter à chaque fois l’arête la moins chère qui sort de l’arbre (tas). O(E log V). Pratique quand le graphe est donné par une liste d’adjacence ou est complet (points du plan : Prim en O(V²) sans tas).',
      'Les deux sont justifiés par la **propriété de coupe** : l’arête la plus légère qui traverse une coupe appartient à un MST. C’est un argument d’échange typique des algorithmes gloutons.',
    ],
  },
  {
    title: 'Kruskal en aperçu',
    code: `function kruskal(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i)
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]] // compression par division de chemin
      x = parent[x]
    }
    return x
  }
  let total = 0
  const chosen = []
  for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
    const ru = find(u)
    const rv = find(v)
    if (ru === rv) continue // cette arête fermerait un cycle
    parent[ru] = rv
    total += w
    chosen.push([u, v])
  }
  return chosen.length === n - 1 ? { total, chosen } : null // null : graphe non connexe
}

console.log(kruskal(4, [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]))`,
    output: `{ total: 19, chosen: [ [ 2, 3 ], [ 0, 3 ], [ 0, 1 ] ] }`,
  },
  {
    mnemo: `« find remonte et aplatit, union accroche le petit sous le grand. union qui renvoie false = cycle. Kruskal = trier + union-find. »`,
    piege: `Écrire \`parent[a] = b\` au lieu de \`parent[find(a)] = find(b)\` : on rattache un nœud au lieu de sa racine, et les ensembles se retrouvent coupés. Et un \`find\` récursif sans union par taille peut construire une chaîne de 10⁵ nœuds qui fait déborder la pile.`,
  },

  { h: 'Quel algorithme pour quel problème ?', id: 'graphes-choisir' },
  {
    p: `Le plus dur en entretien n'est pas de coder BFS, c'est de **reconnaître** qu'il faut un BFS. Ce tableau résume les associations à connaître par cœur.`,
  },
  {
    table: [
      ['Indice dans l’énoncé', 'Algorithme', 'Complexité'],
      ['Plus court chemin, arêtes sans poids, grille, « nombre minimal d’étapes »', 'BFS', 'O(V + E)'],
      ['Plusieurs départs simultanés, « distance à la source la plus proche »', 'BFS multi-sources', 'O(V + E)'],
      ['Poids 0 ou 1 uniquement', 'BFS 0-1 (deque)', 'O(V + E)'],
      ['Poids positifs, « temps / coût minimal »', 'Dijkstra + tas', 'O((V + E) log V)'],
      ['Poids négatifs, « au plus K escales »', 'Bellman-Ford', 'O(V × E)'],
      ['Toutes les paires, petit V', 'Floyd-Warshall', 'O(V³)'],
      ['Compter des régions, des îles, des groupes', 'DFS / BFS flood fill, ou union-find', 'O(V + E)'],
      ['Liens ajoutés au fil de l’eau, « sont-ils connectés ? »', 'Union-find', 'O(α(n)) par opération'],
      ['Dépendances, prérequis, ordre d’exécution', 'Tri topologique (Kahn ou DFS)', 'O(V + E)'],
      ['« Est-ce possible ? » avec des dépendances orientées', 'Détection de cycle (3 couleurs ou Kahn)', 'O(V + E)'],
      ['Deux groupes, deux couleurs, « sans conflit »', 'Biparti : 2-coloration', 'O(V + E)'],
      ['Relier tout au coût minimal', 'MST : Kruskal ou Prim', 'O(E log E)'],
      ['Énumérer tous les chemins, toutes les configurations', 'DFS + backtracking', 'exponentiel'],
    ],
  },
  {
    p: `Réflexe de conception : **1)** identifier les sommets et les arêtes (une case, un mot, un état « position + clés ramassées »…) ; **2)** décider orienté ou non, pondéré ou non ; **3)** choisir l'algorithme dans le tableau ; **4)** estimer V et E pour valider la complexité (une grille 10³ × 10³ fait 10⁶ sommets : O(V + E) passe, O(V²) non).`,
  },
  {
    mnemo: `« Sans poids : BFS. Poids positifs : Dijkstra. Dépendances : topo. Groupes : union-find ou flood fill. Deux camps : biparti. »`,
    piege: `Construire explicitement un graphe énorme alors qu'il est implicite : pour le word ladder, relier chaque paire de mots coûte O(N² × L) ; générer les voisins à la volée (ou par motifs « h*t ») est bien plus rapide.`,
  },
]

const coursGraphes: CoursSection = {
  id: 'graphes',
  title: 'Graphes',
  summary: 'Représenter un graphe, le parcourir en largeur ou en profondeur, puis reconnaître le bon outil : BFS, tri topologique, Dijkstra, union-find ou 2-coloration.',
  blocks: [...graphesBlocs1, ...graphesBlocs2],
  mnemo: `« Liste d'adjacence d'abord. Sans poids : BFS (file, index de tête, marquer à l'enfilage). Exploration : DFS (itératif si profond). Dépendances : Kahn. Poids positifs : Dijkstra + tas. Groupes dynamiques : union-find. Tout coûte O(V + E), sauf le tas qui ajoute un log. »`,
  piege: `Les trois erreurs qui coûtent le plus cher : marquer « visité » au défilage (doublons dans la file), \`shift()\` dans une boucle (BFS quadratique), et un DFS récursif sur une grande entrée (débordement de pile). Viennent ensuite \`Array(n).fill([])\` et l'oubli des sommets isolés ou des composantes déconnectées.`,
}

// ---------------------------------------------------------------------------
// Cours : algorithmes gloutons
// ---------------------------------------------------------------------------

const coursGlouton: CoursSection = {
  id: 'glouton',
  title: 'Algorithmes gloutons',
  summary: 'Faire à chaque étape le meilleur choix local sans jamais revenir en arrière, et savoir prouver (ou réfuter) que cela mène à l’optimum global.',
  blocks: [
    {
      p: `Un algorithme **glouton** (*greedy*) construit sa solution pas à pas en prenant, à chaque étape, le choix qui paraît **le meilleur sur le moment**, sans jamais le remettre en cause. Quand il fonctionne, il est simple, rapide (souvent un tri en O(n log n) puis un parcours en O(n)) et très apprécié en entretien. Le piège, c'est qu'il ne fonctionne **pas toujours** : tout l'art consiste à savoir le justifier, ou à trouver le contre-exemple qui oblige à passer à la programmation dynamique.`,
    },
    { h: 'Le principe et sa justification', id: 'glouton-principe' },
    {
      p: `Un glouton est correct quand le problème possède deux propriétés : la **propriété du choix glouton** (il existe une solution optimale qui commence par le choix glouton) et la **sous-structure optimale** (après ce choix, il reste un sous-problème de même nature, à résoudre optimalement). La deuxième propriété est partagée avec la programmation dynamique ; c'est la première qui permet de ne pas explorer les alternatives.`,
    },
    {
      p: `La preuve standard est l'**argument d'échange** : on prend une solution optimale quelconque O qui ne fait pas le choix glouton g, et on montre qu'on peut **remplacer** son premier choix par g sans la dégrader. Exemple pour la sélection d'activités : si O commence par une activité a, l'activité g qui **finit le plus tôt** finit au plus tard en même temps que a ; remplacer a par g ne crée aucun chevauchement et garde le même nombre d'activités. Donc il existe une solution optimale qui commence par g, et l'on recommence sur ce qui reste.`,
    },
    {
      list: [
        'Signaux : « nombre minimal / maximal de… » avec un **ordre naturel** (par fin, par taille, par échéance), intervalles, planification, « peut-on atteindre… », distribution de ressources.',
        'Squelette : **trier** selon le bon critère, puis **un seul parcours** qui prend ou rejette chaque élément en O(1) (ou O(log n) avec un tas).',
        'Avant de coder, cherchez un **contre-exemple** de petite taille (2 ou 3 éléments) : s’il n’en existe pas et que l’argument d’échange tient, le glouton est probablement juste.',
        'En entretien, énoncez l’intuition de la preuve en une ou deux phrases : c’est ce qui distingue « j’ai deviné » de « je sais ».',
      ],
    },
    {
      mnemo: `« Trier, puis prendre sans regret. Prouver par échange : remplacer le premier choix d'une solution optimale par le choix glouton ne coûte rien. »`,
      piege: `Le mauvais critère de tri : pour maximiser le nombre d'activités, trier par **début** ou par **durée** échoue (une activité courte peut chevaucher deux autres). Seul le tri par **fin** est correct.`,
    },

    { h: 'Quand le glouton échoue : le rendu de monnaie', id: 'glouton-contre-exemples' },
    {
      p: `Rendre la monnaie avec le moins de pièces possible : le glouton prend toujours la plus grosse pièce qui rentre. Avec les euros (1, 2, 5, 10, 20, 50, 100, 200 centimes), c'est optimal : le système est dit **canonique**. Mais avec les pièces {1, 3, 4} et un montant de 6, le glouton prend 4 + 1 + 1 (trois pièces) alors que 3 + 3 (deux pièces) est meilleur. Pour un système de pièces quelconque, il faut la **programmation dynamique** en O(montant × pièces).`,
    },
    {
      title: 'Glouton contre programmation dynamique sur le rendu de monnaie',
      code: `function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a) // plus grosse pièce d'abord
  const used = []
  for (const c of sorted) {
    while (amount >= c) {
      amount -= c
      used.push(c)
    }
  }
  return amount === 0 ? used : null // null : le glouton reste bloqué
}

function dpCoins(coins, amount) {
  const best = new Array(amount + 1).fill(Infinity)
  best[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1
  }
  return best[amount] === Infinity ? -1 : best[amount]
}

console.log(greedyCoins([1, 2, 5, 10, 20, 50, 100, 200], 289)) // système canonique : optimal
console.log(greedyCoins([1, 3, 4], 6), 'contre', dpCoins([1, 3, 4], 6), 'pièces')
console.log(greedyCoins([4, 3], 6), dpCoins([4, 3], 6)) // le glouton échoue alors qu'une solution existe`,
      output: `[ 200, 50, 20, 10, 5, 2, 2 ]
[ 4, 1, 1 ] contre 2 pièces
null 2`,
      equiv: {
        python: `def greedy_coins(coins, amount):
    used = []
    for c in sorted(coins, reverse=True):
        while amount >= c:
            amount -= c
            used.append(c)
    return used if amount == 0 else None

def dp_coins(coins, amount):
    best = [float('inf')] * (amount + 1)
    best[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return -1 if best[amount] == float('inf') else best[amount]`,
        java: `static List<Integer> greedyCoins(int[] coins, int amount) {
    int[] sorted = coins.clone();
    Arrays.sort(sorted);
    List<Integer> used = new ArrayList<>();
    for (int i = sorted.length - 1; i >= 0; i--) {
        while (amount >= sorted[i]) {
            amount -= sorted[i];
            used.add(sorted[i]);
        }
    }
    return amount == 0 ? used : null;
}

static int dpCoins(int[] coins, int amount) {
    int[] best = new int[amount + 1];
    Arrays.fill(best, Integer.MAX_VALUE);
    best[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a && best[a - c] != Integer.MAX_VALUE && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1;
    return best[amount] == Integer.MAX_VALUE ? -1 : best[amount];
}`,
      },
    },
    {
      p: `D'autres contre-exemples classiques à garder en tête : le **sac à dos 0/1** (prendre l'objet au meilleur ratio valeur/poids échoue, alors que ce glouton est optimal pour le sac à dos **fractionnaire**), le **plus long chemin**, ou « la plus grande somme en descendant dans un triangle » (le meilleur voisin immédiat ne mène pas au meilleur total). Dans tous ces cas, un choix local peut fermer la porte à une meilleure suite.`,
    },
    {
      mnemo: `« Pièces {1, 3, 4}, montant 6 : glouton 4+1+1, optimum 3+3. Un contre-exemple de trois éléments suffit à condamner un glouton. »`,
      piege: `Croire que le glouton du rendu de monnaie est « toujours bon » parce qu'il marche avec les euros. En entretien, l'énoncé « coin change » avec des pièces arbitraires attend la DP ; le glouton n'est correct que si le système est canonique.`,
    },

    { h: 'Intervalles : sélection d’activités et salles de réunion', id: 'glouton-intervalles' },
    {
      p: `Les problèmes d'intervalles sont le terrain favori du glouton. Trois questions reviennent, chacune avec son critère de tri :`,
    },
    {
      table: [
        ['Question', 'Tri', 'Parcours', 'Complexité'],
        ['Nombre maximal d’intervalles disjoints (ou minimal à supprimer)', 'par **fin** croissante', 'garder un intervalle s’il commence après la dernière fin retenue', 'O(n log n)'],
        ['Fusionner les intervalles qui se chevauchent', 'par **début** croissant', 'étendre le dernier intervalle fusionné ou en ouvrir un nouveau', 'O(n log n)'],
        ['Nombre minimal de salles (chevauchement maximal)', 'par **début**, puis tas des fins ; ou débuts et fins triés séparément', 'libérer les salles finies, compter les ouvertes', 'O(n log n)'],
        ['Nombre minimal de flèches pour crever des ballons', 'par **fin**', 'nouvelle flèche quand un ballon commence après la dernière flèche', 'O(n log n)'],
      ],
    },
    {
      title: 'Sélection d’activités : trier par fin',
      code: `function maxActivities(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]) // par fin croissante
  const chosen = []
  let end = -Infinity
  for (const [s, e] of sorted) {
    if (s >= end) {
      // compatible avec la dernière activité retenue
      chosen.push([s, e])
      end = e
    }
  }
  return chosen
}

const acts = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]]
const chosen = maxActivities(acts)
console.log(chosen)
console.log('à supprimer pour ne plus avoir de chevauchement :', acts.length - chosen.length)`,
      output: `[ [ 1, 4 ], [ 5, 7 ], [ 8, 11 ], [ 12, 16 ] ]
à supprimer pour ne plus avoir de chevauchement : 7`,
      equiv: {
        python: `def max_activities(intervals):
    chosen = []
    end = float('-inf')
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if s >= end:
            chosen.append([s, e])
            end = e
    return chosen`,
        java: `static List<int[]> maxActivities(int[][] intervals) {
    int[][] sorted = intervals.clone();
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[1], b[1]));
    List<int[]> chosen = new ArrayList<>();
    long end = Long.MIN_VALUE;
    for (int[] iv : sorted) {
        if (iv[0] >= end) {
            chosen.add(iv);
            end = iv[1];
        }
    }
    return chosen;
}`,
      },
    },
    {
      p: `Pour le **nombre minimal de salles**, on trie les réunions par début et l'on garde dans un **tas min** l'heure de fin de chaque salle occupée. Pour chaque réunion, si la salle qui se libère le plus tôt est libre (\`fin ≤ début\`), on la réutilise (on retire sa fin du tas) ; dans tous les cas on ajoute la fin de la réunion. La taille maximale du tas est la réponse. Le **balayage** donne la même réponse sans tas : on trie séparément les débuts et les fins, et l'on avance deux index ; une salle supplémentaire n'est nécessaire que si une réunion commence avant la plus ancienne fin non encore consommée.`,
    },
    {
      title: 'Nombre minimal de salles : balayage des débuts et des fins',
      code: `function minRooms(intervals) {
  const starts = intervals.map((iv) => iv[0]).sort((a, b) => a - b)
  const ends = intervals.map((iv) => iv[1]).sort((a, b) => a - b)
  let rooms = 0
  let j = 0 // prochaine fin à consommer
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[j]) rooms++ // aucune salle libérée : il en faut une de plus
    else j++ // une réunion s'est terminée : on réutilise sa salle
  }
  return rooms
}

console.log(minRooms([[0, 30], [5, 10], [15, 20]]))
console.log(minRooms([[7, 10], [2, 4]]))
console.log(minRooms([[1, 5], [5, 8]])) // fin à 5, début à 5 : même salle
console.log(minRooms([]))`,
      output: `2
1
1
0`,
      equiv: {
        python: `def min_rooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends = sorted(iv[1] for iv in intervals)
    rooms = 0
    j = 0
    for s in starts:
        if s < ends[j]:
            rooms += 1  # aucune salle libérée : il en faut une de plus
        else:
            j += 1  # une réunion s'est terminée : on réutilise sa salle
    return rooms`,
        java: `static int minRooms(int[][] intervals) {
    int n = intervals.length;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }
    Arrays.sort(starts);
    Arrays.sort(ends);
    int rooms = 0, j = 0;
    for (int i = 0; i < n; i++) {
        if (starts[i] < ends[j]) rooms++;
        else j++;
    }
    return rooms;
}`,
        php: `function minRooms(array $intervals): int {
    $starts = array_column($intervals, 0);
    $ends = array_column($intervals, 1);
    sort($starts);
    sort($ends);
    $rooms = 0;
    $j = 0;
    foreach ($starts as $s) {
        if ($s < $ends[$j]) $rooms++;
        else $j++;
    }
    return $rooms;
}`,
      },
    },
    {
      mnemo: `« Garder le plus d'intervalles : trier par **fin**. Fusionner : trier par **début**. Compter les salles : débuts et fins triés, ou tas des fins. »`,
      piege: `Les bornes : \`[1, 5]\` et \`[5, 8]\` se chevauchent-elles ? Selon l'énoncé (intervalles fermés ou semi-ouverts), il faut \`<\` ou \`<=\`. Faites-le préciser, et testez ce cas exprès.`,
    },

    { h: 'Les grands classiques gloutons', id: 'glouton-classiques' },
    {
      list: [
        '**Jump game** : peut-on atteindre la dernière case si `nums[i]` est le saut maximal depuis i ? On maintient la **portée maximale** `reach` ; si l’on arrive sur une case `i > reach`, c’est perdu. O(n). Version « nombre minimal de sauts » : BFS implicite par fenêtres `[début, fin]` de cases atteignables en k sauts.',
        '**Gas station** : si la somme totale `gas - cost` est négative, impossible ; sinon, on parcourt en cumulant le réservoir, et chaque fois qu’il devient négatif, aucune station entre le départ courant et i ne peut convenir : on repart de i + 1. O(n).',
        '**Assign cookies** : trier enfants (appétits) et cookies (tailles), puis deux pointeurs : on donne à l’enfant le moins exigeant le plus petit cookie qui le satisfait. O(n log n).',
        '**Partition labels** : couper une chaîne en un maximum de morceaux où chaque lettre n’apparaît que dans un seul morceau. On calcule la dernière position de chaque lettre, puis on étend la fin du morceau courant jusqu’à `max(last[c])` ; quand l’index atteint cette fin, on coupe. O(n).',
        '**Tâches avec échéances**, **min de flèches**, **boats to save people** (two pointers après tri), **candy** (deux passes) : même famille.',
      ],
    },
    {
      title: 'Jump game et partition labels',
      code: `function canJump(nums) {
  let reach = 0 // plus loin que l'on sache atteindre
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false // la case i est inaccessible
    reach = Math.max(reach, i + nums[i])
  }
  return true
}

function partitionLabels(s) {
  const last = new Map()
  for (let i = 0; i < s.length; i++) last.set(s[i], i)
  const sizes = []
  let start = 0
  let end = 0
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i])) // le morceau doit contenir toutes les occurrences
    if (i === end) {
      sizes.push(end - start + 1)
      start = i + 1
    }
  }
  return sizes
}

console.log(canJump([2, 3, 1, 1, 4]), canJump([3, 2, 1, 0, 4]))
console.log(partitionLabels('ababcbacadefegdehijhklij'))`,
      output: `true false
[ 9, 7, 8 ]`,
      equiv: {
        python: `def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True

def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}  # la dernière occurrence écrase les précédentes
    sizes = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            sizes.append(end - start + 1)
            start = i + 1
    return sizes`,
        java: `static boolean canJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
    }
    return true;
}

static List<Integer> partitionLabels(String s) {
    int[] last = new int[26];
    for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
    List<Integer> sizes = new ArrayList<>();
    int start = 0, end = 0;
    for (int i = 0; i < s.length(); i++) {
        end = Math.max(end, last[s.charAt(i) - 'a']);
        if (i == end) {
            sizes.add(end - start + 1);
            start = i + 1;
        }
    }
    return sizes;
}`,
      },
    },
    {
      mnemo: `« Jump game : une seule variable, la portée. Gas station : réservoir négatif, on repart d'après. Partition labels : étendre jusqu'à la dernière occurrence. »`,
      piege: `Coder un backtracking ou une DP en O(n²) pour le jump game : elle passe sur les petits exemples mais dépasse le temps sur 10⁵ cases. Le glouton en O(n) est la réponse attendue.`,
    },

    { h: 'Huffman, et glouton contre programmation dynamique', id: 'glouton-vs-dp' },
    {
      p: `Le **codage de Huffman** (aperçu) construit un code préfixe optimal pour compresser un texte : on fusionne à chaque étape les **deux symboles les moins fréquents** en un nœud dont la fréquence est la somme, jusqu'à n'avoir plus qu'un arbre. Avec un tas, O(n log n). Le coût total (somme des fréquences × profondeurs) est la somme des fusions : c'est aussi la solution de « relier des cordes au moindre coût ». L'argument d'échange montre que les deux symboles les plus rares peuvent toujours être frères au plus profond de l'arbre.`,
    },
    {
      title: 'Coût de Huffman (fusionner les deux plus petits)',
      code: `// Tas min de nombres, réduit à l'essentiel
function heapPush(h, x) {
  h.push(x)
  let i = h.length - 1
  while (i > 0 && h[(i - 1) >> 1] > h[i]) {
    const p = (i - 1) >> 1
    const t = h[p]
    h[p] = h[i]
    h[i] = t
    i = p
  }
}
function heapPop(h) {
  const top = h[0]
  const last = h.pop()
  if (h.length > 0) {
    h[0] = last
    let i = 0
    while (true) {
      const l = 2 * i + 1
      let m = i
      if (l < h.length && h[l] < h[m]) m = l
      if (l + 1 < h.length && h[l + 1] < h[m]) m = l + 1
      if (m === i) break
      const t = h[m]
      h[m] = h[i]
      h[i] = t
      i = m
    }
  }
  return top
}

function huffmanCost(freqs) {
  const h = []
  for (const f of freqs) heapPush(h, f)
  let cost = 0
  while (h.length > 1) {
    const merged = heapPop(h) + heapPop(h) // les deux plus rares deviennent frères
    cost += merged
    heapPush(h, merged)
  }
  return cost
}

// a:5 b:9 c:12 d:13 e:16 f:45 → nombre total de bits du texte encodé
console.log(huffmanCost([5, 9, 12, 13, 16, 45]))`,
      output: `224`,
      equiv: {
        python: `import heapq

def huffman_cost(freqs):
    h = list(freqs)
    heapq.heapify(h)  # O(n)
    cost = 0
    while len(h) > 1:
        merged = heapq.heappop(h) + heapq.heappop(h)
        cost += merged
        heapq.heappush(h, merged)
    return cost`,
        java: `static long huffmanCost(int[] freqs) {
    PriorityQueue<Long> h = new PriorityQueue<>();
    for (int f : freqs) h.add((long) f);
    long cost = 0;
    while (h.size() > 1) {
        long merged = h.poll() + h.poll();
        cost += merged;
        h.add(merged);
    }
    return cost;
}`,
      },
    },
    {
      p: `**Glouton ou DP ?** Les deux exploitent une sous-structure optimale. La DP explore **toutes** les décisions possibles à chaque étape et garde la meilleure ; le glouton **parie** sur une seule. Le glouton est donc plus rapide et plus simple, mais seulement correct quand on sait prouver que le pari est sans risque.`,
    },
    {
      table: [
        ['Problème', 'Glouton correct ?', 'Sinon'],
        ['Rendu de monnaie, système canonique (euros)', 'Oui', '—'],
        ['Rendu de monnaie, pièces arbitraires', 'Non ({1, 3, 4}, 6)', 'DP en O(montant × pièces)'],
        ['Sac à dos fractionnaire', 'Oui (meilleur ratio d’abord)', '—'],
        ['Sac à dos 0/1', 'Non', 'DP en O(n × capacité)'],
        ['Sélection d’activités (maximiser le nombre)', 'Oui (tri par fin)', '—'],
        ['Activités pondérées (maximiser la somme des poids)', 'Non', 'DP + dichotomie, O(n log n)'],
        ['Jump game (atteignable ?)', 'Oui (portée maximale)', '—'],
        ['Arbre couvrant minimal', 'Oui (Kruskal, Prim)', '—'],
        ['Plus courts chemins, poids positifs', 'Oui (Dijkstra est glouton)', 'Bellman-Ford si poids négatifs'],
      ],
    },
    {
      mnemo: `« DP = essayer tous les choix et mémoriser. Glouton = un seul choix, justifié par un échange. Pas de preuve, pas de glouton. »`,
      piege: `Annoncer un glouton sans vérifier un petit contre-exemple. Si le recruteur en trouve un en dix secondes, l'entretien bascule. Testez mentalement deux ou trois cas tordus (égalités, valeurs nulles, ordre inverse) avant de coder.`,
    },
  ],
  mnemo: `« Trier selon le bon critère, parcourir une fois, ne jamais revenir en arrière. Prouver par échange, réfuter par contre-exemple : pièces {1, 3, 4}. Intervalles : fin pour garder, début pour fusionner. »`,
  piege: `Le glouton « qui marche sur les exemples » mais qui est faux : c'est l'erreur la plus fréquente sur ce thème. Si vous ne savez pas justifier le choix local, cherchez un contre-exemple ou passez à la programmation dynamique.`,
}

// ---------------------------------------------------------------------------
// Katas : graphes
// ---------------------------------------------------------------------------

const MIN_HEAP_STARTER = `// Tas min fourni : éléments [priorité, valeur]
class MinHeap {
  constructor() {
    this.a = []
  }
  get size() {
    return this.a.length
  }
  push(item) {
    const a = this.a
    a.push(item)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      const t = a[p]
      a[p] = a[i]
      a[i] = t
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    const last = a.pop()
    if (a.length > 0) {
      a[0] = last
      let i = 0
      while (true) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        const t = a[m]
        a[m] = a[i]
        a[i] = t
        i = m
      }
    }
    return top
  }
}`

const VALID_ORDER = `function isValidOrder(order, n, pre) {
  if (!Array.isArray(order) || order.length !== n) return false
  const pos = new Array(n).fill(-1)
  order.forEach((c, i) => {
    if (Number.isInteger(c) && c >= 0 && c < n) pos[c] = i
  })
  if (pos.some((p) => p === -1)) return false
  return pre.every(([a, b]) => pos[b] < pos[a])
}`

const katasGraphes: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'gr-iles',
    title: 'Nombre d’îles',
    difficulty: 'facile',
    theme: 'graphes',
    pattern: 'flood fill (DFS itératif)',
    statement: `Écrivez \`numIslands(grid)\` qui compte les **îles** d'une carte.

- \`grid\` est un tableau de chaînes de même longueur, composées de \`'1'\` (terre) et de \`'0'\` (eau) ;
- une île est un groupe de cases de terre reliées **horizontalement ou verticalement** (les diagonales ne comptent pas) ;
- la grille peut être vide (\`[]\`) ;
- la grille peut atteindre 500 × 500 cases : une récursion par case risque de faire déborder la pile.

Exemples :

- \`numIslands(['11000', '11000', '00100', '00011'])\` donne \`3\` ;
- \`numIslands(['111', '010', '111'])\` donne \`1\` ;
- \`numIslands(['101', '010', '101'])\` donne \`5\`.`,
    starter: `function numIslands(grid) {
  // TODO : parcourir la grille et lancer un flood fill depuis chaque terre non visitée
  return 0
}`,
    solution: `function numIslands(grid) {
  const rows = grid.length
  const cols = rows > 0 ? grid[0].length : 0
  // visités encodés r * cols + c dans un tableau plat (plus léger qu'un tableau de tableaux)
  const seen = new Uint8Array(rows * cols)
  const stack = []
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1' || seen[r * cols + c]) continue
      count++
      seen[r * cols + c] = 1
      stack.push(r * cols + c)
      // DFS itératif : aucune limite de profondeur
      while (stack.length > 0) {
        const id = stack.pop()
        const cr = Math.floor(id / cols)
        const cc = id % cols
        if (cr > 0 && grid[cr - 1][cc] === '1' && !seen[id - cols]) { seen[id - cols] = 1; stack.push(id - cols) }
        if (cr < rows - 1 && grid[cr + 1][cc] === '1' && !seen[id + cols]) { seen[id + cols] = 1; stack.push(id + cols) }
        if (cc > 0 && grid[cr][cc - 1] === '1' && !seen[id - 1]) { seen[id - 1] = 1; stack.push(id - 1) }
        if (cc < cols - 1 && grid[cr][cc + 1] === '1' && !seen[id + 1]) { seen[id + 1] = 1; stack.push(id + 1) }
      }
    }
  }
  return count
}`,
    solutionEquiv: {
      python: `def num_islands(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    seen = [[False] * cols for _ in range(rows)]
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != '1' or seen[r][c]:
                continue
            count += 1
            seen[r][c] = True
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                for nr, nc in ((cr - 1, cc), (cr + 1, cc), (cr, cc - 1), (cr, cc + 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1' and not seen[nr][nc]:
                        seen[nr][nc] = True
                        stack.append((nr, nc))
    return count`,
      java: `static int numIslands(String[] grid) {
    int rows = grid.length, cols = rows > 0 ? grid[0].length() : 0;
    boolean[] seen = new boolean[rows * cols];
    int[] stack = new int[rows * cols]; // chaque case est empilée au plus une fois
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r].charAt(c) != '1' || seen[r * cols + c]) continue;
            count++;
            int top = 0;
            seen[r * cols + c] = true;
            stack[top++] = r * cols + c;
            while (top > 0) {
                int id = stack[--top], cr = id / cols, cc = id % cols;
                int[][] nbs = { {cr - 1, cc}, {cr + 1, cc}, {cr, cc - 1}, {cr, cc + 1} };
                for (int[] nb : nbs) {
                    int nr = nb[0], nc = nb[1];
                    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                    if (grid[nr].charAt(nc) != '1' || seen[nr * cols + nc]) continue;
                    seen[nr * cols + nc] = true;
                    stack[top++] = nr * cols + nc;
                }
            }
        }
    }
    return count;
}`,
      rust: `fn num_islands(grid: &[&str]) -> usize {
    let g: Vec<&[u8]> = grid.iter().map(|row| row.as_bytes()).collect();
    let rows = g.len();
    let cols = if rows > 0 { g[0].len() } else { 0 };
    let mut seen = vec![false; rows * cols];
    let mut stack = Vec::new();
    let mut count = 0;
    for r in 0..rows {
        for c in 0..cols {
            if g[r][c] != b'1' || seen[r * cols + c] {
                continue;
            }
            count += 1;
            seen[r * cols + c] = true;
            stack.push((r, c));
            while let Some((cr, cc)) = stack.pop() {
                let mut nbs = Vec::with_capacity(4);
                if cr > 0 { nbs.push((cr - 1, cc)); }
                if cr + 1 < rows { nbs.push((cr + 1, cc)); }
                if cc > 0 { nbs.push((cr, cc - 1)); }
                if cc + 1 < cols { nbs.push((cr, cc + 1)); }
                for (nr, nc) in nbs {
                    if g[nr][nc] == b'1' && !seen[nr * cols + nc] {
                        seen[nr * cols + nc] = true;
                        stack.push((nr, nc));
                    }
                }
            }
        }
    }
    count
}`,
      php: `function numIslands(array $grid): int {
    $rows = count($grid);
    $cols = $rows > 0 ? strlen($grid[0]) : 0;
    $seen = [];
    $count = 0;
    for ($r = 0; $r < $rows; $r++) {
        for ($c = 0; $c < $cols; $c++) {
            if ($grid[$r][$c] !== '1' || isset($seen[$r * $cols + $c])) continue;
            $count++;
            $seen[$r * $cols + $c] = true;
            $stack = [[$r, $c]];
            while ($stack) {
                [$cr, $cc] = array_pop($stack);
                foreach ([[$cr - 1, $cc], [$cr + 1, $cc], [$cr, $cc - 1], [$cr, $cc + 1]] as [$nr, $nc]) {
                    if ($nr < 0 || $nc < 0 || $nr >= $rows || $nc >= $cols) continue;
                    if ($grid[$nr][$nc] !== '1' || isset($seen[$nr * $cols + $nc])) continue;
                    $seen[$nr * $cols + $nc] = true;
                    $stack[] = [$nr, $nc];
                }
            }
        }
    }
    return $count;
}`,
    },
    tests: [
      { name: 'exemple à trois îles', code: `assertEqual(numIslands(['11000', '11000', '00100', '00011']), 3)` },
      { name: 'une île en anneau', code: `assertEqual(numIslands(['111', '010', '111']), 1)` },
      { name: 'les diagonales ne relient pas', code: `assertEqual(numIslands(['101', '010', '101']), 5)` },
      { name: 'grille vide, que de l’eau, une seule case', code: `assertEqual(numIslands([]), 0)
assertEqual(numIslands(['000', '000']), 0)
assertEqual(numIslands(['1']), 1)
assertEqual(numIslands(['0']), 0)` },
      { name: 'une seule ligne, une seule colonne', code: `assertEqual(numIslands(['1101011']), 3)
assertEqual(numIslands(['1', '1', '0', '1']), 2)` },
      { name: 'forme en U (deux bras reliés par le bas)', code: `assertEqual(numIslands(['101', '101', '111']), 1)` },
      {
        name: 'grande entrée : 500 × 500 de terre (pile et temps)',
        code: `const big = Array.from({ length: 500 }, () => '1'.repeat(500))
const t0 = performance.now()
assertEqual(numIslands(big), 1)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (ou récursion trop profonde)')`,
      },
      {
        name: 'grande entrée : damier 400 × 400',
        code: `const rows = Array.from({ length: 400 }, (_, r) => Array.from({ length: 400 }, (_, c) => ((r + c) % 2 === 0 ? '1' : '0')).join(''))
const t0 = performance.now()
assertEqual(numIslands(rows), 80000)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      'Chaque île doit être comptée une seule fois : quand vous trouvez une terre non visitée, incrémentez le compteur puis marquez **toute** l’île comme visitée.',
      'Le marquage se fait par un parcours (DFS ou BFS) depuis cette case, en ne suivant que les quatre voisins orthogonaux qui sont de la terre et dans la grille.',
      'Sur 500 × 500 cases de terre, un DFS récursif descend à 250 000 niveaux : utilisez une pile explicite (tableau + `pop()`), et marquez au moment d’empiler.',
    ],
    discussion: `**Complexité** : O(R × C) en temps (chaque case est empilée au plus une fois et examine 4 voisins) et O(R × C) en mémoire pour les visités et la pile.

**Alternatives** :

- BFS avec une file et un index de tête : même complexité, même absence de risque de pile.
- Union-find sur les cases de terre : on unit chaque case avec ses voisines droite et basse, la réponse est le nombre d'ensembles restants parmi les cases de terre. Plus long à écrire, mais c'est la bonne approche pour la variante **« Number of Islands II »** où les terres apparaissent une à une (on veut le nombre d'îles après chaque ajout).
- Si la grille est un tableau de tableaux modifiable, on peut marquer en écrivant \`'0'\` dans les cases visitées : O(1) de mémoire supplémentaire (hors pile), mais l'entrée est détruite. Demandez si c'est permis.

**Suites possibles** : surface de la plus grande île (compter les cases pendant le parcours), périmètre d'une île (4 par case moins 2 par adjacence), nombre d'îles de formes distinctes (normaliser le chemin du parcours), îles fermées (exclure celles qui touchent le bord).`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-chemin-grille',
    title: 'Plus court chemin dans une grille',
    difficulty: 'facile',
    theme: 'graphes',
    pattern: 'BFS (plus court chemin non pondéré)',
    statement: `Écrivez \`shortestPath(grid)\` qui renvoie le **nombre minimal de déplacements** pour aller de la case en haut à gauche \`(0, 0)\` à la case en bas à droite \`(R - 1, C - 1)\`.

- \`grid\` est un tableau non vide de chaînes de même longueur : \`'.'\` est une case libre, \`'#'\` un mur ;
- on se déplace d'une case vers l'une des **quatre** voisines (haut, bas, gauche, droite), sans sortir de la grille ni entrer dans un mur ;
- si le départ ou l'arrivée est un mur, ou si l'arrivée est inaccessible, renvoyez \`-1\` ;
- une grille d'une seule case libre donne \`0\` ;
- la grille peut atteindre 500 × 500.

Exemples :

- \`shortestPath(['..', '..'])\` donne \`2\` ;
- \`shortestPath(['.#.', '.#.', '...'])\` donne \`4\` ;
- \`shortestPath(['.#', '#.'])\` donne \`-1\`.`,
    starter: `function shortestPath(grid) {
  // TODO : BFS depuis (0, 0)
  return grid.length + grid[0].length - 2 // distance de Manhattan : ignore les murs
}`,
    solution: `function shortestPath(grid) {
  const rows = grid.length
  const cols = grid[0].length
  if (grid[0][0] === '#' || grid[rows - 1][cols - 1] === '#') return -1
  const target = rows * cols - 1
  const dist = new Int32Array(rows * cols).fill(-1) // -1 : pas encore atteint
  const queue = new Int32Array(rows * cols) // chaque case est enfilée au plus une fois
  let head = 0
  let tail = 0
  queue[tail++] = 0
  dist[0] = 0
  while (head < tail) {
    const id = queue[head++]
    if (id === target) return dist[id]
    const r = Math.floor(id / cols)
    const c = id % cols
    const candidates = [
      r > 0 ? id - cols : -1,
      r < rows - 1 ? id + cols : -1,
      c > 0 ? id - 1 : -1,
      c < cols - 1 ? id + 1 : -1,
    ]
    for (const nid of candidates) {
      if (nid === -1 || dist[nid] !== -1) continue
      if (grid[Math.floor(nid / cols)][nid % cols] === '#') continue
      dist[nid] = dist[id] + 1 // marqué à l'enfilage
      queue[tail++] = nid
    }
  }
  return -1
}`,
    solutionEquiv: {
      python: `from collections import deque

def shortest_path(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == '#' or grid[rows - 1][cols - 1] == '#':
        return -1
    dist = [[-1] * cols for _ in range(rows)]
    dist[0][0] = 0
    queue = deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        if (r, c) == (rows - 1, cols - 1):
            return dist[r][c]
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '.' and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))
    return -1`,
      java: `static int shortestPath(String[] grid) {
    int rows = grid.length, cols = grid[0].length();
    if (grid[0].charAt(0) == '#' || grid[rows - 1].charAt(cols - 1) == '#') return -1;
    int[][] dist = new int[rows][cols];
    for (int[] row : dist) Arrays.fill(row, -1);
    dist[0][0] = 0;
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    queue.add(new int[] { 0, 0 });
    int[][] dirs = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };
    while (!queue.isEmpty()) {
        int[] cur = queue.poll();
        int r = cur[0], c = cur[1];
        if (r == rows - 1 && c == cols - 1) return dist[r][c];
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            if (grid[nr].charAt(nc) == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            queue.add(new int[] { nr, nc });
        }
    }
    return -1;
}`,
    },
    tests: [
      { name: 'grille 2 × 2 ouverte', code: `assertEqual(shortestPath(['..', '..']), 2)` },
      { name: 'contourner un mur', code: `assertEqual(shortestPath(['.#.', '.#.', '...']), 4)` },
      { name: 'arrivée inaccessible', code: `assertEqual(shortestPath(['.#', '#.']), -1)
assertEqual(shortestPath(['..#', '.#.', '#..']), -1)` },
      { name: 'départ ou arrivée bloqués', code: `assertEqual(shortestPath(['#.', '..']), -1)
assertEqual(shortestPath(['..', '.#']), -1)` },
      { name: 'une seule case', code: `assertEqual(shortestPath(['.']), 0)
assertEqual(shortestPath(['#']), -1)` },
      { name: 'labyrinthe en serpentin', code: `assertEqual(shortestPath(['....', '###.', '....', '.###', '....']), 13)` },
      {
        name: 'grande entrée : 500 × 500 avec des murs',
        code: `// une rangée sur deux est un mur percé d'un trou, alternativement à droite et à gauche
const grid = []
for (let r = 0; r < 499; r++) {
  if (r % 2 === 0) grid.push('.'.repeat(500))
  else if (r % 4 === 1) grid.push('#'.repeat(499) + '.')
  else grid.push('.' + '#'.repeat(499))
}
grid.push('.'.repeat(500))
const t0 = performance.now()
const d = shortestPath(grid)
const elapsed = performance.now() - t0
assertEqual(d, 249 * 501 + 1)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      'Toutes les arêtes valent 1 : le plus court chemin se calcule par un **BFS** depuis (0, 0).',
      'Gardez un tableau de distances initialisé à -1 ; une case reçoit sa distance (et est considérée comme visitée) au moment où on l’enfile.',
      'Évitez `queue.shift()` (O(n) par appel) : avec 250 000 cases, utilisez un index de tête. Vous pouvez aussi arrêter le BFS dès que la cible est défilée.',
    ],
    discussion: `**Complexité** : O(R × C) en temps et en mémoire. Chaque case entre au plus une fois dans la file.

**Pourquoi pas un DFS ?** Un DFS trouve **un** chemin, pas le plus court ; il faudrait explorer tous les chemins (exponentiel). Le BFS garantit qu'une case est atteinte pour la première fois par un plus court chemin.

**Variantes à évoquer** :

- 8 directions (LeetCode 1091) : il suffit d'étendre le tableau de directions.
- Pouvoir casser jusqu'à k murs : l'état devient \`(r, c, murs cassés)\` et le BFS se fait sur ce graphe d'états, O(R × C × k).
- Cases à coût variable : Dijkstra ; coûts 0 ou 1 (par exemple « casser un mur coûte 1, avancer coûte 0 ») : BFS 0-1 avec une deque.
- BFS bidirectionnel (depuis le départ et l'arrivée) : divise souvent l'espace exploré, utile quand le facteur de branchement est grand.
- Reconstruire le chemin : mémoriser le parent de chaque case.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-oranges',
    title: 'Oranges pourries',
    difficulty: 'moyen',
    theme: 'graphes',
    pattern: 'BFS multi-sources',
    statement: `Une caisse d'oranges est représentée par une grille \`grid\` (tableau de tableaux de nombres) :

- \`0\` : case vide ;
- \`1\` : orange fraîche ;
- \`2\` : orange pourrie.

Chaque minute, toute orange fraîche **voisine** (haut, bas, gauche, droite) d'une orange pourrie pourrit à son tour. Écrivez \`orangesRotting(grid)\` qui renvoie le **nombre minimal de minutes** au bout duquel il ne reste aucune orange fraîche, ou \`-1\` si c'est impossible. S'il n'y a aucune orange fraîche au départ, la réponse est \`0\`. Vous pouvez modifier \`grid\` si vous le souhaitez.

Exemples :

- \`orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]])\` donne \`4\` ;
- \`orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]])\` donne \`-1\` (l'orange en bas à gauche n'est jamais atteinte) ;
- \`orangesRotting([[0, 2]])\` donne \`0\`.`,
    starter: `function orangesRotting(grid) {
  // TODO : toutes les oranges pourries partent en même temps
  return 0
}`,
    solution: `function orangesRotting(grid) {
  const rows = grid.length
  const cols = rows > 0 ? grid[0].length : 0
  const queue = []
  let fresh = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]) // toutes les sources au temps 0
      else if (grid[r][c] === 1) fresh++
    }
  }
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let head = 0
  let minutes = 0
  while (head < queue.length && fresh > 0) {
    const end = queue.length // une couche = une minute
    while (head < end) {
      const [r, c] = queue[head++]
      for (const [dr, dc] of DIRS) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== 1) continue
        grid[nr][nc] = 2 // marquer à l'enfilage
        fresh--
        queue.push([nr, nc])
      }
    }
    minutes++
  }
  return fresh === 0 ? minutes : -1
}`,
    solutionEquiv: {
      python: `from collections import deque

def oranges_rotting(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh > 0:
        for _ in range(len(queue)):  # une couche = une minute
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`,
      java: `static int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = rows > 0 ? grid[0].length : 0;
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    int fresh = 0;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) queue.add(new int[] { r, c });
            else if (grid[r][c] == 1) fresh++;
        }
    int[][] dirs = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };
    int minutes = 0;
    while (!queue.isEmpty() && fresh > 0) {
        for (int k = queue.size(); k > 0; k--) {
            int[] cur = queue.poll();
            for (int[] d : dirs) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                queue.add(new int[] { nr, nc });
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`,
      rust: `use std::collections::VecDeque;

fn oranges_rotting(mut grid: Vec<Vec<u8>>) -> i32 {
    let rows = grid.len();
    let cols = if rows > 0 { grid[0].len() } else { 0 };
    let mut queue = VecDeque::new();
    let mut fresh = 0;
    for r in 0..rows {
        for c in 0..cols {
            if grid[r][c] == 2 { queue.push_back((r, c)); }
            else if grid[r][c] == 1 { fresh += 1; }
        }
    }
    let mut minutes = 0;
    while !queue.is_empty() && fresh > 0 {
        for _ in 0..queue.len() {
            let (r, c) = queue.pop_front().unwrap();
            let dirs: [(isize, isize); 4] = [(1, 0), (-1, 0), (0, 1), (0, -1)];
            for (dr, dc) in dirs {
                let (nr, nc) = (r as isize + dr, c as isize + dc);
                if nr < 0 || nc < 0 || nr >= rows as isize || nc >= cols as isize { continue; }
                let (nr, nc) = (nr as usize, nc as usize);
                if grid[nr][nc] != 1 { continue; }
                grid[nr][nc] = 2;
                fresh -= 1;
                queue.push_back((nr, nc));
            }
        }
        minutes += 1;
    }
    if fresh == 0 { minutes } else { -1 }
}`,
    },
    tests: [
      { name: 'exemple : 4 minutes', code: `assertEqual(orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]), 4)` },
      { name: 'orange inaccessible', code: `assertEqual(orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]), -1)` },
      { name: 'aucune orange fraîche', code: `assertEqual(orangesRotting([[0, 2]]), 0)
assertEqual(orangesRotting([[0]]), 0)
assertEqual(orangesRotting([[2, 2], [0, 2]]), 0)` },
      { name: 'oranges fraîches sans aucune pourrie', code: `assertEqual(orangesRotting([[1]]), -1)
assertEqual(orangesRotting([[1, 1], [0, 0]]), -1)` },
      { name: 'deux sources simultanées', code: `assertEqual(orangesRotting([[2, 1, 1, 1, 2]]), 2)
assertEqual(orangesRotting([[2, 1, 1, 1, 1, 1, 2]]), 3)` },
      { name: 'colonne et propagation en coin', code: `assertEqual(orangesRotting([[2], [1], [1], [1]]), 3)
assertEqual(orangesRotting([[1, 1, 1], [1, 1, 1], [1, 1, 2]]), 4)` },
    ],
    hints: [
      'Lancer un BFS depuis chaque orange pourrie séparément donne de mauvais temps : elles pourrissent leurs voisines **en même temps**.',
      'Mettez **toutes** les oranges pourries dans la file au départ (temps 0), puis faites un BFS par couches : chaque couche vidée correspond à une minute.',
      'Comptez les oranges fraîches au départ et décrémentez à chaque contamination : s’il en reste à la fin, la réponse est -1. Attention à ne pas compter une minute de trop quand la dernière couche ne contamine personne.',
    ],
    discussion: `**Complexité** : O(R × C) en temps et en mémoire : chaque case entre au plus une fois dans la file.

**Le piège du « +1 »** : si l'on incrémente \`minutes\` après chaque couche sans condition, la dernière couche (qui ne contamine plus rien) ajoute une minute de trop. La condition \`fresh > 0\` dans la boucle, ou le fait de stocker la minute de contamination de chaque case, règle le problème.

**Alternatives** : stocker \`[r, c, t]\` dans la file et garder le maximum de \`t\` ; ou ne pas modifier la grille et utiliser un tableau de distances (préférable si l'entrée ne doit pas être altérée).

**Famille du même motif** : « Walls and Gates » (distance de chaque salle à la porte la plus proche), « 01 Matrix », « As Far from Land as Possible » (maximiser la distance à la terre la plus proche) : chaque fois, toutes les sources sont mises dans la file au temps 0.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-cours',
    title: 'Ordre des cours (prérequis)',
    difficulty: 'moyen',
    theme: 'graphes',
    pattern: 'tri topologique (Kahn)',
    statement: `Il y a \`n\` cours numérotés de \`0\` à \`n - 1\`. Chaque élément \`[a, b]\` de \`prerequisites\` signifie qu'il faut avoir suivi le cours **\`b\` avant le cours \`a\`**.

Écrivez \`findOrder(n, prerequisites)\` qui renvoie un tableau contenant **tous** les cours dans un ordre qui respecte les prérequis, ou \`[]\` si c'est impossible (dépendance circulaire).

- s'il existe plusieurs ordres valides, n'importe lequel est accepté (les tests vérifient la validité) ;
- un cours sans prérequis peut être placé n'importe où avant ses dépendants ;
- \`n\` peut valoir 0 (la réponse est alors \`[]\`) ; une paire \`[a, a]\` est un cycle.

Exemples :

- \`findOrder(2, [[1, 0]])\` donne \`[0, 1]\` ;
- \`findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]])\` donne par exemple \`[0, 1, 2, 3]\` ou \`[0, 2, 1, 3]\` ;
- \`findOrder(2, [[1, 0], [0, 1]])\` donne \`[]\`.`,
    starter: `function findOrder(n, prerequisites) {
  // TODO : tri topologique ; [] en cas de cycle
  return []
}`,
    solution: `function findOrder(n, prerequisites) {
  const adj = Array.from({ length: n }, () => [])
  const indeg = new Array(n).fill(0)
  for (const [a, b] of prerequisites) {
    adj[b].push(a) // b doit précéder a : arête b → a
    indeg[a]++
  }
  const order = []
  for (let u = 0; u < n; u++) if (indeg[u] === 0) order.push(u)
  // l'ordre de sortie sert directement de file (index de tête)
  for (let head = 0; head < order.length; head++) {
    for (const v of adj[order[head]]) {
      indeg[v]--
      if (indeg[v] === 0) order.push(v)
    }
  }
  return order.length === n ? order : []
}`,
    solutionEquiv: {
      python: `from collections import deque

def find_order(n, prerequisites):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in prerequisites:
        adj[b].append(a)
        indeg[a] += 1
    queue = deque(u for u in range(n) if indeg[u] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return order if len(order) == n else []`,
      java: `static int[] findOrder(int n, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] p : prerequisites) {
        adj.get(p[1]).add(p[0]);
        indeg[p[0]]++;
    }
    int[] order = new int[n];
    int tail = 0;
    for (int u = 0; u < n; u++) if (indeg[u] == 0) order[tail++] = u;
    for (int head = 0; head < tail; head++)
        for (int v : adj.get(order[head]))
            if (--indeg[v] == 0) order[tail++] = v;
    return tail == n ? order : new int[0];
}`,
      rust: `fn find_order(n: usize, prerequisites: &[(usize, usize)]) -> Vec<usize> {
    let mut adj = vec![Vec::new(); n];
    let mut indeg = vec![0usize; n];
    for &(a, b) in prerequisites {
        adj[b].push(a);
        indeg[a] += 1;
    }
    let mut order: Vec<usize> = (0..n).filter(|&u| indeg[u] == 0).collect();
    let mut head = 0;
    while head < order.len() {
        let u = order[head];
        head += 1;
        for &v in &adj[u] {
            indeg[v] -= 1;
            if indeg[v] == 0 {
                order.push(v);
            }
        }
    }
    if order.len() == n { order } else { Vec::new() }
}`,
      php: `function findOrder(int $n, array $prerequisites): array {
    $adj = array_fill(0, $n, []);
    $indeg = array_fill(0, $n, 0);
    foreach ($prerequisites as [$a, $b]) {
        $adj[$b][] = $a;
        $indeg[$a]++;
    }
    $order = [];
    for ($u = 0; $u < $n; $u++) if ($indeg[$u] === 0) $order[] = $u;
    for ($head = 0; $head < count($order); $head++) {
        foreach ($adj[$order[$head]] as $v) {
            if (--$indeg[$v] === 0) $order[] = $v;
        }
    }
    return count($order) === $n ? $order : [];
}`,
      bash: `# tsort attend des paires « avant après » : on inverse chaque [a, b] en « b a ».
# Les cours sans aucun prérequis ni dépendant s'écrivent « x x » pour apparaître dans la sortie.
# En cas de cycle, tsort écrit un message sur la sortie d'erreur.
printf '%s\\n' '0 1' '0 2' '1 3' '2 3' | tsort`,
    },
    tests: [
      { name: 'deux cours', code: VALID_ORDER + `
const pre = [[1, 0]]
const order = findOrder(2, pre)
assert(isValidOrder(order, 2, pre), 'ordre invalide : ' + JSON.stringify(order))` },
      { name: 'losange de dépendances', code: VALID_ORDER + `
const pre = [[1, 0], [2, 0], [3, 1], [3, 2]]
const order = findOrder(4, pre)
assert(isValidOrder(order, 4, pre), 'ordre invalide : ' + JSON.stringify(order))` },
      { name: 'cycle : impossible', code: `assertEqual(findOrder(2, [[1, 0], [0, 1]]), [])
assertEqual(findOrder(3, [[0, 1], [1, 2], [2, 0]]), [])
assertEqual(findOrder(1, [[0, 0]]), [])` },
      { name: 'cycle dans une partie seulement du graphe', code: `assertEqual(findOrder(5, [[1, 0], [2, 1], [4, 3], [3, 4]]), [])` },
      { name: 'aucun prérequis, cours isolés, n = 0', code: VALID_ORDER + `
const order = findOrder(3, [])
assert(isValidOrder(order, 3, []), 'il faut renvoyer les 3 cours : ' + JSON.stringify(order))
assertEqual(findOrder(0, []), [])` },
      { name: 'graphe déconnecté et ordre inverse des numéros', code: VALID_ORDER + `
const pre = [[0, 1], [1, 2], [2, 3], [5, 4]]
const order = findOrder(7, pre)
assert(isValidOrder(order, 7, pre), 'ordre invalide : ' + JSON.stringify(order))` },
      { name: 'grande entrée : 10⁵ prérequis', code: VALID_ORDER + `
const n = 20000
const pre = []
for (let i = 1; i < n; i++) pre.push([i, i - 1]) // une longue chaîne
let x = 7
for (let k = 0; k < 80000; k++) {
  x = (x * 48271) % 2147483647
  const a = x % n
  x = (x * 48271) % 2147483647
  const b = x % n
  if (a !== b) pre.push([Math.max(a, b), Math.min(a, b)]) // toujours du plus petit vers le plus grand : pas de cycle
}
const t0 = performance.now()
const order = findOrder(n, pre)
const elapsed = performance.now() - t0
assert(isValidOrder(order, n, pre), 'ordre invalide')
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')` },
    ],
    hints: [
      'Modélisez par un graphe orienté : `[a, b]` donne une arête **b → a**. Un ordre valide est un tri topologique ; il n’existe que sans cycle.',
      'Algorithme de Kahn : calculez le degré entrant de chaque cours, mettez dans une file ceux qui sont à 0, puis retirez-les un à un en décrémentant le degré de leurs successeurs.',
      'Si, à la fin, vous n’avez pas placé les `n` cours, les cours restants forment (ou dépendent d’) un cycle : renvoyez `[]`.',
    ],
    discussion: `**Complexité** : O(V + E) en temps et en mémoire, avec V = \`n\` et E = nombre de prérequis.

**Alternative DFS** : post-ordre inversé avec trois couleurs (blanc, gris, noir) ; un sommet gris rencontré signale un cycle. Attention à la profondeur de récursion sur une longue chaîne de prérequis (20 000 ici) : Kahn, itératif, n'a pas ce problème.

**Variantes classiques** :

- « Course Schedule I » : seulement savoir si c'est possible (\`order.length === n\`).
- Nombre minimal de semestres si l'on peut suivre autant de cours qu'on veut par semestre : BFS de Kahn **par niveaux**, la réponse est le nombre de niveaux.
- Ordre lexicographiquement le plus petit : remplacer la file par un tas min.
- « Alien Dictionary » : déduire les arêtes en comparant les mots consécutifs (première lettre différente), puis tri topologique ; attention au cas \`['abc', 'ab']\`, invalide.
- Ordre de build avec \`tsort\` en shell : la commande Unix fait exactement ce travail.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-delai-reseau',
    title: 'Délai de propagation dans un réseau',
    difficulty: 'moyen',
    theme: 'graphes',
    pattern: 'Dijkstra (tas binaire)',
    statement: `Un réseau compte \`n\` nœuds numérotés de **1 à n**. \`times\` est une liste d'arêtes **orientées** \`[u, v, w]\` : un signal met \`w\` unités de temps (entier ≥ 0) pour aller de \`u\` à \`v\`. Il peut y avoir plusieurs arêtes entre deux mêmes nœuds.

Un signal part du nœud \`k\` à l'instant 0. Écrivez \`networkDelayTime(times, n, k)\` qui renvoie le temps minimal pour que **tous** les nœuds l'aient reçu, ou \`-1\` si un nœud ne le reçoit jamais.

- \`n\` peut atteindre 3 × 10⁴ et \`times\` contenir plus de 10⁵ arêtes ;
- une classe \`MinHeap\` (tas min sur des paires \`[priorité, valeur]\`, méthodes \`push\`, \`pop\` et propriété \`size\`) est fournie dans le code de départ : JavaScript n'a pas de tas natif.

Exemples :

- \`networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2)\` donne \`2\` ;
- \`networkDelayTime([[1, 2, 1]], 2, 1)\` donne \`1\` ;
- \`networkDelayTime([[1, 2, 1]], 2, 2)\` donne \`-1\`.`,
    starter: MIN_HEAP_STARTER + `

function networkDelayTime(times, n, k) {
  // TODO : Dijkstra depuis k, puis maximum des distances
  return -1
}`,
    solution: MIN_HEAP_STARTER + `

function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []) // nœuds 1..n
  for (const [u, v, w] of times) adj[u].push([v, w])
  const dist = new Array(n + 1).fill(Infinity)
  dist[k] = 0
  const heap = new MinHeap()
  heap.push([0, k])
  while (heap.size > 0) {
    const [d, u] = heap.pop()
    if (d > dist[u]) continue // entrée périmée
    for (const [v, w] of adj[u]) {
      const nd = d + w
      if (nd < dist[v]) {
        dist[v] = nd
        heap.push([nd, v])
      }
    }
  }
  let worst = 0
  for (let v = 1; v <= n; v++) worst = Math.max(worst, dist[v])
  return worst === Infinity ? -1 : worst
}`,
    solutionEquiv: {
      python: `import heapq

def network_delay_time(times, n, k):
    adj = [[] for _ in range(n + 1)]
    for u, v, w in times:
        adj[u].append((v, w))
    dist = [float('inf')] * (n + 1)
    dist[k] = 0
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # entrée périmée
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    worst = max(dist[1:])
    return -1 if worst == float('inf') else worst`,
      java: `static int networkDelayTime(int[][] times, int n, int k) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
    for (int[] t : times) adj.get(t[0]).add(new int[] { t[1], t[2] });
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    heap.add(new int[] { 0, k });
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;
        for (int[] e : adj.get(u)) {
            int nd = d + e[1];
            if (nd < dist[e[0]]) {
                dist[e[0]] = nd;
                heap.add(new int[] { nd, e[0] });
            }
        }
    }
    int worst = 0;
    for (int v = 1; v <= n; v++) worst = Math.max(worst, dist[v]);
    return worst == Integer.MAX_VALUE ? -1 : worst;
}`,
      rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

fn network_delay_time(times: &[(usize, usize, u64)], n: usize, k: usize) -> i64 {
    let mut adj = vec![Vec::new(); n + 1];
    for &(u, v, w) in times {
        adj[u].push((v, w));
    }
    let mut dist = vec![u64::MAX; n + 1];
    dist[k] = 0;
    let mut heap = BinaryHeap::new();
    heap.push(Reverse((0u64, k)));
    while let Some(Reverse((d, u))) = heap.pop() {
        if d > dist[u] {
            continue;
        }
        for &(v, w) in &adj[u] {
            let nd = d + w;
            if nd < dist[v] {
                dist[v] = nd;
                heap.push(Reverse((nd, v)));
            }
        }
    }
    let worst = *dist[1..].iter().max().unwrap();
    if worst == u64::MAX { -1 } else { worst as i64 }
}`,
      php: `function networkDelayTime(array $times, int $n, int $k): int {
    $adj = array_fill(0, $n + 1, []);
    foreach ($times as [$u, $v, $w]) $adj[$u][] = [$v, $w];
    $dist = array_fill(0, $n + 1, INF);
    $dist[$k] = 0;
    $heap = new SplPriorityQueue(); // tas MAX : priorités négatives
    $heap->setExtractFlags(SplPriorityQueue::EXTR_BOTH);
    $heap->insert($k, 0);
    while (!$heap->isEmpty()) {
        ['data' => $u, 'priority' => $p] = $heap->extract();
        $d = -$p;
        if ($d > $dist[$u]) continue;
        foreach ($adj[$u] as [$v, $w]) {
            $nd = $d + $w;
            if ($nd < $dist[$v]) {
                $dist[$v] = $nd;
                $heap->insert($v, -$nd);
            }
        }
    }
    $worst = max(array_slice($dist, 1));
    return $worst === INF ? -1 : (int) $worst;
}`,
    },
    tests: [
      { name: 'exemple classique', code: `assertEqual(networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2), 2)` },
      { name: 'une arête, dans les deux sens de départ', code: `assertEqual(networkDelayTime([[1, 2, 1]], 2, 1), 1)
assertEqual(networkDelayTime([[1, 2, 1]], 2, 2), -1)` },
      { name: 'un seul nœud', code: `assertEqual(networkDelayTime([], 1, 1), 0)` },
      { name: 'le détour est plus rapide que l’arête directe', code: `assertEqual(networkDelayTime([[1, 2, 10], [1, 3, 1], [3, 2, 1]], 3, 1), 2)
assertEqual(networkDelayTime([[1, 2, 1], [2, 3, 2], [1, 3, 4]], 3, 1), 3)` },
      { name: 'arêtes multiples et poids nuls', code: `assertEqual(networkDelayTime([[1, 2, 5], [1, 2, 2]], 2, 1), 2)
assertEqual(networkDelayTime([[1, 2, 0], [2, 3, 0]], 3, 1), 0)` },
      { name: 'nœud isolé : -1', code: `assertEqual(networkDelayTime([[1, 2, 1], [2, 3, 1]], 4, 1), -1)` },
      {
        name: 'grande entrée : 3 × 10⁴ nœuds, 1,1 × 10⁵ arêtes',
        code: `const n = 30000
const times = []
for (let i = 1; i < n; i++) times.push([i, i + 1, 1]) // la chaîne 1 → 2 → … → n
let x = 12345
for (let k = 0; k < 80000; k++) {
  x = (x * 48271) % 2147483647
  const u = 1 + (x % n)
  x = (x * 48271) % 2147483647
  const v = 1 + (x % n)
  times.push([u, v, Math.abs(v - u) + 1]) // jamais plus court que la chaîne
}
const t0 = performance.now()
const res = networkDelayTime(times, n, 1)
const elapsed = performance.now() - t0
assertEqual(res, n - 1)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      'Le temps de réception d’un nœud est la longueur du plus court chemin depuis k (poids positifs) ; la réponse est le **maximum** de ces distances.',
      'Dijkstra : tas min de paires `[distance, nœud]`. À chaque extraction, si la distance extraite est plus grande que `dist[u]`, l’entrée est périmée : ignorez-la. Sinon, relâchez les arêtes sortantes.',
      'Les nœuds vont de 1 à n : dimensionnez vos tableaux à `n + 1` et ne prenez pas l’indice 0 en compte dans le maximum. S’il reste une distance infinie, renvoyez -1.',
    ],
    discussion: `**Complexité** : O((V + E) log V) avec un tas binaire et la suppression paresseuse (le tas peut contenir jusqu'à E entrées, et log E = O(log V)). Mémoire O(V + E).

**Pourquoi pas BFS ?** Les arêtes ont des poids différents : le premier chemin trouvé en nombre d'arêtes n'est pas le plus rapide (voir le test du détour).

**Alternatives** :

- Dijkstra « tableau » en O(V²) : on cherche le minimum non finalisé par un parcours linéaire. Acceptable pour un graphe dense et petit, trop lent ici (9 × 10⁸ opérations).
- Bellman-Ford en O(V × E) : inutile sans poids négatifs, bien trop lent sur la grande entrée.
- Floyd-Warshall O(V³) : seulement pour toutes les paires, petit V.

**Suites possibles** : reconstruire le chemin (tableau \`parent\`), « Cheapest Flights Within K Stops » (Bellman-Ford limité à K + 1 passes, ou Dijkstra sur l'état \`(nœud, escales)\`), « Path with Maximum Probability » (Dijkstra avec un tas max sur les produits), « Swim in Rising Water » (Dijkstra où le coût d'un chemin est le maximum, pas la somme).`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-arete-redondante',
    title: 'Arête redondante',
    difficulty: 'moyen',
    theme: 'graphes',
    pattern: 'union-find',
    statement: `Un graphe non orienté était un **arbre** à \`n\` nœuds numérotés de **1 à n** ; on lui a ajouté **une** arête supplémentaire (entre deux nœuds distincts, éventuellement déjà reliés). \`edges\` contient les \`n\` arêtes \`[u, v]\` du graphe obtenu.

Écrivez \`findRedundantConnection(edges)\` qui renvoie une arête dont la suppression redonne un arbre. S'il y a plusieurs réponses, renvoyez **celle qui apparaît en dernier** dans \`edges\`. L'arête est renvoyée telle qu'elle figure dans l'entrée.

- \`n\` peut atteindre 10⁵.

Exemples :

- \`findRedundantConnection([[1, 2], [1, 3], [2, 3]])\` donne \`[2, 3]\` ;
- \`findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]])\` donne \`[1, 4]\`.`,
    starter: `function findRedundantConnection(edges) {
  // TODO : quelle arête ferme le cycle ?
  return edges[edges.length - 1] // la dernière arête n'est pas forcément dans le cycle
}`,
    solution: `function findRedundantConnection(edges) {
  const n = edges.length // un arbre + une arête : autant d'arêtes que de nœuds
  const parent = Array.from({ length: n + 1 }, (_, i) => i)
  const size = new Array(n + 1).fill(1)
  function find(x) {
    let root = x
    while (parent[root] !== root) root = parent[root]
    while (parent[x] !== root) {
      const next = parent[x]
      parent[x] = root
      x = next
    }
    return root
  }
  for (const [u, v] of edges) {
    let ru = find(u)
    let rv = find(v)
    // la première arête qui relie deux nœuds déjà connectés ferme le cycle ;
    // c'est aussi la dernière arête du cycle dans l'ordre de l'entrée
    if (ru === rv) return [u, v]
    if (size[ru] < size[rv]) {
      const t = ru
      ru = rv
      rv = t
    }
    parent[rv] = ru
    size[ru] += size[rv]
  }
  return []
}`,
    solutionEquiv: {
      python: `def find_redundant_connection(edges):
    n = len(edges)
    parent = list(range(n + 1))
    size = [1] * (n + 1)

    def find(x):
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]
        if size[ru] < size[rv]:
            ru, rv = rv, ru
        parent[rv] = ru
        size[ru] += size[rv]
    return []`,
      java: `static int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    int[] parent = new int[n + 1], size = new int[n + 1];
    for (int i = 0; i <= n; i++) { parent[i] = i; size[i] = 1; }
    for (int[] e : edges) {
        int ru = find(parent, e[0]), rv = find(parent, e[1]);
        if (ru == rv) return e;
        if (size[ru] < size[rv]) { int t = ru; ru = rv; rv = t; }
        parent[rv] = ru;
        size[ru] += size[rv];
    }
    return new int[0];
}

static int find(int[] parent, int x) {
    int root = x;
    while (parent[root] != root) root = parent[root];
    while (parent[x] != root) {
        int next = parent[x];
        parent[x] = root;
        x = next;
    }
    return root;
}`,
    },
    tests: [
      { name: 'triangle', code: `assertEqual(findRedundantConnection([[1, 2], [1, 3], [2, 3]]), [2, 3])` },
      { name: 'le cycle n’est pas à la fin', code: `assertEqual(findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]), [1, 4])` },
      { name: 'arête en double', code: `assertEqual(findRedundantConnection([[1, 2], [2, 1]]), [2, 1])` },
      { name: 'dernière arête du cycle dans l’ordre de l’entrée', code: `assertEqual(findRedundantConnection([[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]), [2, 5])
assertEqual(findRedundantConnection([[2, 3], [5, 2], [1, 5], [4, 2], [4, 1]]), [4, 1])` },
      {
        name: 'grande entrée : chaîne de 10⁵ nœuds refermée',
        code: `const n = 100000
const edges = []
for (let i = n; i > 1; i--) edges.push([i - 1, i]) // chaîne ajoutée à rebours
edges.push([1, n])
const t0 = performance.now()
const res = findRedundantConnection(edges)
const elapsed = performance.now() - t0
assertEqual(res, [1, n])
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      'Ajoutez les arêtes une par une. Une arête est redondante si ses deux extrémités sont **déjà connectées** par les arêtes précédentes.',
      'Union-find répond à « sont-ils déjà connectés ? » en temps quasi constant : `find(u) === find(v)`.',
      'La première arête qui échoue est forcément la dernière, dans l’ordre de l’entrée, parmi les arêtes du cycle : le cycle n’existe qu’une fois toutes ses arêtes présentes. Pensez à la compression de chemin (et à l’union par taille) pour la longue chaîne.',
    ],
    discussion: `**Complexité** : O(n × α(n)), quasi linéaire, et O(n) en mémoire.

**Pourquoi la compression compte** : sans compression ni union par taille, la chaîne ajoutée à rebours peut produire un arbre union-find de hauteur n, et chaque \`find\` coûte O(n) : O(n²) au total. Un \`find\` récursif sur une telle chaîne peut aussi dépasser la pile ; la version itérative en deux passes est sûre.

**Alternative** : pour chaque arête, tester par DFS si u et v sont déjà reliés : O(n²). Ou trouver le cycle par DFS (puis choisir la dernière arête du cycle dans l'entrée) : O(n), mais plus délicat à écrire.

**Suite classique** : « Redundant Connection II » (graphe **orienté** enraciné) : il faut distinguer le cas d'un nœud à deux parents du cas d'un cycle, voire les deux à la fois. Autres usages d'union-find : « Number of Provinces », « Accounts Merge », « Satisfiability of Equality Equations », Kruskal.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-biparti',
    title: 'Graphe biparti',
    difficulty: 'moyen',
    theme: 'graphes',
    pattern: '2-coloration (BFS)',
    statement: `Écrivez \`isBipartite(graph)\` qui indique si un graphe non orienté est **biparti**, c'est-à-dire si l'on peut répartir ses sommets en deux groupes de façon que chaque arête relie deux sommets de groupes différents.

- \`graph\` est une liste d'adjacence : \`graph[u]\` est le tableau des voisins du sommet \`u\` (sommets \`0\` à \`n - 1\`) ; si \`v\` est dans \`graph[u]\`, alors \`u\` est dans \`graph[v]\` ;
- pas de boucle ni d'arête multiple ;
- le graphe peut être **déconnecté**, et vide (\`[]\`, qui est biparti).

Exemples :

- \`isBipartite([[1, 3], [0, 2], [1, 3], [0, 2]])\` donne \`true\` (groupes {0, 2} et {1, 3}) ;
- \`isBipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]])\` donne \`false\` (triangle 0-1-2).`,
    starter: `function isBipartite(graph) {
  // TODO : colorier chaque composante en deux couleurs
  return true
}`,
    solution: `function isBipartite(graph) {
  const n = graph.length
  const color = new Array(n).fill(-1)
  const queue = []
  for (let s = 0; s < n; s++) {
    if (color[s] !== -1) continue // nouvelle composante
    color[s] = 0
    queue.length = 0
    queue.push(s)
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head]
      for (const v of graph[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]
          queue.push(v)
        } else if (color[v] === color[u]) {
          return false
        }
      }
    }
  }
  return true
}`,
    solutionEquiv: {
      python: `from collections import deque

def is_bipartite(graph):
    color = [-1] * len(graph)
    for s in range(len(graph)):
        if color[s] != -1:
            continue
        color[s] = 0
        queue = deque([s])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
    return True`,
      java: `static boolean isBipartite(int[][] graph) {
    int n = graph.length;
    int[] color = new int[n];
    Arrays.fill(color, -1);
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    for (int s = 0; s < n; s++) {
        if (color[s] != -1) continue;
        color[s] = 0;
        queue.add(s);
        while (!queue.isEmpty()) {
            int u = queue.poll();
            for (int v : graph[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];
                    queue.add(v);
                } else if (color[v] == color[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}`,
      rust: `use std::collections::VecDeque;

fn is_bipartite(graph: &Vec<Vec<usize>>) -> bool {
    let n = graph.len();
    let mut color = vec![-1i8; n];
    for s in 0..n {
        if color[s] != -1 {
            continue;
        }
        color[s] = 0;
        let mut queue = VecDeque::from([s]);
        while let Some(u) = queue.pop_front() {
            for &v in &graph[u] {
                if color[v] == -1 {
                    color[v] = 1 - color[u];
                    queue.push_back(v);
                } else if color[v] == color[u] {
                    return false;
                }
            }
        }
    }
    true
}`,
      php: `function isBipartite(array $graph): bool {
    $n = count($graph);
    $color = array_fill(0, $n, -1);
    for ($s = 0; $s < $n; $s++) {
        if ($color[$s] !== -1) continue;
        $color[$s] = 0;
        $queue = new SplQueue();
        $queue->enqueue($s);
        while (!$queue->isEmpty()) {
            $u = $queue->dequeue();
            foreach ($graph[$u] as $v) {
                if ($color[$v] === -1) {
                    $color[$v] = 1 - $color[$u];
                    $queue->enqueue($v);
                } elseif ($color[$v] === $color[$u]) {
                    return false;
                }
            }
        }
    }
    return true;
}`,
    },
    tests: [
      { name: 'carré : biparti', code: `assertEqual(isBipartite([[1, 3], [0, 2], [1, 3], [0, 2]]), true)` },
      { name: 'triangle : pas biparti', code: `assertEqual(isBipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]), false)
assertEqual(isBipartite([[1, 2], [0, 2], [0, 1]]), false)` },
      { name: 'graphe vide et sommets isolés', code: `assertEqual(isBipartite([]), true)
assertEqual(isBipartite([[], [], []]), true)` },
      { name: 'cycle impair dans une seconde composante', code: `assertEqual(isBipartite([[1], [0], [3, 4], [2, 4], [2, 3]]), false)
assertEqual(isBipartite([[], [2, 4, 6], [1, 4, 8, 9], [7, 8], [1, 2, 8, 9], [6, 9], [1, 5, 7, 8, 9], [3, 6, 9], [2, 3, 4, 6, 9], [2, 4, 5, 6, 7, 8]]), false)` },
      { name: 'cycle pair de longueur 6 et arbre', code: `assertEqual(isBipartite([[1, 5], [0, 2], [1, 3], [2, 4], [3, 5], [4, 0]]), true)
assertEqual(isBipartite([[1, 2], [0, 3, 4], [0], [1], [1]]), true)` },
      { name: 'cycle impair de longueur 5', code: `assertEqual(isBipartite([[1, 4], [0, 2], [1, 3], [2, 4], [3, 0]]), false)` },
    ],
    hints: [
      'Essayez de colorier : le premier sommet reçoit la couleur 0, ses voisins la couleur 1, leurs voisins la couleur 0, etc.',
      'Si un voisin a déjà la **même** couleur que le sommet courant, le graphe n’est pas biparti (il contient un cycle impair).',
      'Le graphe peut avoir plusieurs composantes : relancez le parcours depuis chaque sommet encore non colorié, sinon une composante non bipartie peut passer inaperçue.',
    ],
    discussion: `**Complexité** : O(V + E) en temps, O(V) en mémoire.

**Caractérisation** : un graphe est biparti si et seulement s'il ne contient aucun cycle de longueur impaire. Tout arbre, toute grille et tout cycle pair sont bipartis.

**Alternatives** : DFS (récursif ou itératif) avec la même coloration ; ou union-find : pour chaque sommet u, unir tous ses voisins entre eux, et échouer si u se retrouve dans le même ensemble qu'un de ses voisins.

**Variantes** : « Possible Bipartition » (on reçoit une liste de paires d'ennemis, il faut d'abord construire la liste d'adjacence, sommets numérotés de 1 à n) ; « Is Graph Bipartite » avec arêtes données en liste ; couplage maximal dans un graphe biparti (algorithme de Hopcroft-Karp, hors du cadre d'un entretien classique, mais bon à citer).`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-word-ladder',
    title: 'Échelle de mots (word ladder)',
    difficulty: 'difficile',
    theme: 'graphes',
    pattern: 'BFS sur graphe implicite',
    statement: `On transforme \`beginWord\` en \`endWord\` en changeant **une seule lettre à la fois** ; chaque mot intermédiaire, ainsi que \`endWord\`, doit appartenir à \`wordList\` (\`beginWord\` n'a pas besoin d'y être).

Écrivez \`ladderLength(beginWord, endWord, wordList)\` qui renvoie le **nombre de mots** de la plus courte séquence de transformation (en comptant \`beginWord\` et \`endWord\`), ou \`0\` si aucune séquence n'existe.

- tous les mots ont la même longueur et sont en minuscules (\`a\` à \`z\`) ;
- \`beginWord\` est différent de \`endWord\` ;
- \`wordList\` peut contenir 10⁴ mots.

Exemples :

- \`ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog'])\` donne \`5\` (hit → hot → dot → dog → cog) ;
- \`ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log'])\` donne \`0\` (\`cog\` n'est pas dans la liste).`,
    starter: `function ladderLength(beginWord, endWord, wordList) {
  // TODO : BFS où les voisins d'un mot sont les mots à une lettre près
  return 0
}`,
    solution: `function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList)
  if (!words.has(endWord)) return 0
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const seen = new Set([beginWord])
  let level = [beginWord]
  let steps = 1
  while (level.length > 0) {
    const next = []
    for (const word of level) {
      // voisins générés à la volée : L × 26 candidats, chacun testé en O(L) dans le Set
      for (let i = 0; i < word.length; i++) {
        const prefix = word.slice(0, i)
        const suffix = word.slice(i + 1)
        for (const ch of letters) {
          if (ch === word[i]) continue
          const cand = prefix + ch + suffix
          if (!words.has(cand) || seen.has(cand)) continue
          if (cand === endWord) return steps + 1
          seen.add(cand) // marquer à l'enfilage
          next.push(cand)
        }
      }
    }
    level = next
    steps++
  }
  return 0
}`,
    solutionEquiv: {
      python: `from string import ascii_lowercase

def ladder_length(begin_word, end_word, word_list):
    words = set(word_list)
    if end_word not in words:
        return 0
    seen = {begin_word}
    level = [begin_word]
    steps = 1
    while level:
        nxt = []
        for word in level:
            for i in range(len(word)):
                for ch in ascii_lowercase:
                    if ch == word[i]:
                        continue
                    cand = word[:i] + ch + word[i + 1:]
                    if cand not in words or cand in seen:
                        continue
                    if cand == end_word:
                        return steps + 1
                    seen.add(cand)
                    nxt.append(cand)
        level = nxt
        steps += 1
    return 0`,
      java: `static int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> words = new HashSet<>(wordList);
    if (!words.contains(endWord)) return 0;
    Set<String> seen = new HashSet<>(List.of(beginWord));
    List<String> level = new ArrayList<>(List.of(beginWord));
    int steps = 1;
    while (!level.isEmpty()) {
        List<String> next = new ArrayList<>();
        for (String word : level) {
            char[] cs = word.toCharArray();
            for (int i = 0; i < cs.length; i++) {
                char orig = cs[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    if (ch == orig) continue;
                    cs[i] = ch;
                    String cand = new String(cs);
                    if (words.contains(cand) && seen.add(cand)) { // add renvoie false si déjà présent
                        if (cand.equals(endWord)) return steps + 1;
                        next.add(cand);
                    }
                }
                cs[i] = orig;
            }
        }
        level = next;
        steps++;
    }
    return 0;
}`,
      rust: `use std::collections::HashSet;

fn ladder_length(begin_word: &str, end_word: &str, word_list: &[&str]) -> usize {
    let words: HashSet<&str> = word_list.iter().copied().collect();
    if !words.contains(end_word) {
        return 0;
    }
    let mut seen: HashSet<String> = HashSet::from([begin_word.to_string()]);
    let mut level = vec![begin_word.to_string()];
    let mut steps = 1;
    while !level.is_empty() {
        let mut next = Vec::new();
        for word in &level {
            let mut cs: Vec<u8> = word.bytes().collect();
            for i in 0..cs.len() {
                let orig = cs[i];
                for ch in b'a'..=b'z' {
                    if ch == orig { continue; }
                    cs[i] = ch;
                    let cand = String::from_utf8(cs.clone()).unwrap();
                    if !words.contains(cand.as_str()) || seen.contains(&cand) { continue; }
                    if cand == end_word { return steps + 1; }
                    seen.insert(cand.clone());
                    next.push(cand);
                }
                cs[i] = orig;
            }
        }
        level = next;
        steps += 1;
    }
    0
}`,
    },
    tests: [
      { name: 'exemple : 5 mots', code: `assertEqual(ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']), 5)` },
      { name: 'mot cible absent de la liste', code: `assertEqual(ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']), 0)` },
      { name: 'une seule transformation', code: `assertEqual(ladderLength('hit', 'hot', ['hot']), 2)
assertEqual(ladderLength('a', 'c', ['a', 'b', 'c']), 2)` },
      { name: 'cible présente mais inaccessible', code: `assertEqual(ladderLength('hot', 'dog', ['hot', 'dog']), 0)
assertEqual(ladderLength('abc', 'xyz', ['abd', 'xyz']), 0)` },
      { name: 'le plus court parmi plusieurs chemins', code: `assertEqual(ladderLength('red', 'tax', ['ted', 'tex', 'red', 'tax', 'tad', 'den', 'rex', 'pee']), 4)
assertEqual(ladderLength('lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish']), 2)` },
      {
        name: 'grande entrée : 10⁴ mots de 4 lettres',
        code: `// tous les mots de 4 lettres sur l'alphabet a..j (10 000 mots)
const L = 'abcdefghij'
const list = []
for (const a of L) for (const b of L) for (const c of L) for (const d of L) list.push(a + b + c + d)
const t0 = performance.now()
assertEqual(ladderLength('aaaa', 'jjjj', list), 5)
assertEqual(ladderLength('abcd', 'dcba', list), 5)
assertEqual(ladderLength('zzzz', 'abcd', list), 0)
const elapsed = performance.now() - t0
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (comparer toutes les paires de mots coûte O(N² × L))')`,
      },
    ],
    hints: [
      'Voyez chaque mot comme un sommet, relié aux mots qui diffèrent d’une seule lettre. La plus courte séquence est un plus court chemin non pondéré : **BFS**.',
      'Ne construisez pas le graphe en comparant toutes les paires (O(N² × L)). Générez les voisins à la volée : pour chaque position, essayez les 25 autres lettres et testez l’appartenance dans un `Set`.',
      'Marquez un mot comme vu dès qu’il entre dans la file. Comptez les **mots** et non les transformations : la réponse vaut le nombre de niveaux + 1 quand on atteint la cible.',
    ],
    discussion: `**Complexité** : O(N × L × 26 × L) en temps (pour chacun des N mots, L × 26 candidats, chacun construit et haché en O(L)), soit O(N × L²) ; O(N × L) en mémoire.

**Alternative par motifs** : regrouper les mots par motif générique (\`h*t\`, \`*ot\`, \`ho*\`) dans une \`Map\` motif → mots ; les voisins d'un mot sont les mots des mêmes motifs. Même complexité, souvent plus rapide quand l'alphabet est grand, mais il faut vider (ou marquer) un motif après usage pour éviter de le reparcourir.

**BFS bidirectionnel** : on avance alternativement depuis \`beginWord\` et depuis \`endWord\`, en développant toujours la plus petite frontière ; on s'arrête quand elles se rencontrent. Le nombre de sommets explorés peut chuter drastiquement : c'est la follow-up attendue au niveau « difficile ».

**Word Ladder II** (toutes les plus courtes séquences) : BFS qui mémorise les parents de chaque mot (tous ceux du niveau précédent), puis DFS / backtracking depuis la cible pour reconstruire les chemins.`,
  },
]

// ---------------------------------------------------------------------------
// Katas : algorithmes gloutons
// ---------------------------------------------------------------------------

const katasGlouton: Kata[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'gr-cookies',
    title: 'Distribuer des cookies',
    difficulty: 'facile',
    theme: 'glouton',
    pattern: 'glouton + tri + two pointers',
    statement: `Chaque enfant \`i\` a un **appétit** \`g[i]\` : il n'est satisfait que par un cookie de taille **au moins** \`g[i]\`. Chaque cookie \`j\` a une taille \`s[j]\`. Un enfant reçoit au plus un cookie, et un cookie ne va qu'à un seul enfant.

Écrivez \`findContentChildren(g, s)\` qui renvoie le **nombre maximal d'enfants satisfaits**.

- les tableaux ne sont pas triés et peuvent être vides ;
- ne modifiez pas les tableaux reçus (travaillez sur des copies si vous triez).

Exemples :

- \`findContentChildren([1, 2, 3], [1, 1])\` donne \`1\` ;
- \`findContentChildren([1, 2], [1, 2, 3])\` donne \`2\` ;
- \`findContentChildren([10, 9, 8, 7], [5, 6, 7, 8])\` donne \`2\`.`,
    starter: `function findContentChildren(g, s) {
  // TODO : un cookie ne satisfait pas forcément un enfant
  return Math.min(g.length, s.length)
}`,
    solution: `function findContentChildren(g, s) {
  const kids = [...g].sort((a, b) => a - b) // copies : on ne modifie pas l'entrée
  const cookies = [...s].sort((a, b) => a - b)
  let i = 0 // enfant le moins exigeant non encore servi
  for (let j = 0; j < cookies.length && i < kids.length; j++) {
    // le plus petit cookie qui convient va à l'enfant le moins exigeant
    if (cookies[j] >= kids[i]) i++
  }
  return i
}`,
    solutionEquiv: {
      python: `def find_content_children(g, s):
    kids = sorted(g)  # sorted renvoie une copie
    cookies = sorted(s)
    i = 0
    for size in cookies:
        if i < len(kids) and size >= kids[i]:
            i += 1
    return i`,
      java: `static int findContentChildren(int[] g, int[] s) {
    int[] kids = g.clone(), cookies = s.clone();
    Arrays.sort(kids);
    Arrays.sort(cookies);
    int i = 0;
    for (int j = 0; j < cookies.length && i < kids.length; j++)
        if (cookies[j] >= kids[i]) i++;
    return i;
}`,
      rust: `fn find_content_children(g: &[i32], s: &[i32]) -> usize {
    let mut kids = g.to_vec();
    let mut cookies = s.to_vec();
    kids.sort_unstable();
    cookies.sort_unstable();
    let mut i = 0;
    for &size in &cookies {
        if i < kids.len() && size >= kids[i] {
            i += 1;
        }
    }
    i
}`,
      php: `function findContentChildren(array $g, array $s): int {
    sort($g); // les tableaux PHP sont passés par valeur : l'appelant n'est pas modifié
    sort($s);
    $i = 0;
    foreach ($s as $size) {
        if ($i < count($g) && $size >= $g[$i]) $i++;
    }
    return $i;
}`,
    },
    tests: [
      { name: 'exemple : un seul enfant satisfait', code: `assertEqual(findContentChildren([1, 2, 3], [1, 1]), 1)` },
      { name: 'assez de cookies', code: `assertEqual(findContentChildren([1, 2], [1, 2, 3]), 2)` },
      { name: 'entrées non triées', code: `assertEqual(findContentChildren([10, 9, 8, 7], [5, 6, 7, 8]), 2)
assertEqual(findContentChildren([3, 1, 2], [3, 1]), 2)` },
      { name: 'tableaux vides', code: `assertEqual(findContentChildren([], [1, 2]), 0)
assertEqual(findContentChildren([1, 2], []), 0)
assertEqual(findContentChildren([], []), 0)` },
      { name: 'aucun cookie assez grand', code: `assertEqual(findContentChildren([5, 6], [1, 2, 3, 4]), 0)` },
      { name: 'les entrées ne sont pas modifiées', code: `const g = [3, 1, 2]
const s = [2, 3, 1]
findContentChildren(g, s)
assertEqual(g, [3, 1, 2])
assertEqual(s, [2, 3, 1])` },
    ],
    hints: [
      'Un gros cookie donné à un enfant peu exigeant est du gaspillage. Quel enfant faut-il servir en premier, et avec quel cookie ?',
      'Triez les deux tableaux. Parcourez les cookies du plus petit au plus grand avec un pointeur sur l’enfant le moins exigeant encore non servi.',
      'Si le cookie courant suffit à cet enfant, servez-le (avancez les deux pointeurs) ; sinon, ce cookie ne servira à personne : passez au suivant.',
    ],
    discussion: `**Complexité** : O(n log n + m log m) pour les tris, puis O(n + m) pour le parcours ; O(n + m) de mémoire pour les copies.

**Argument d'échange** : dans une solution optimale, si l'enfant le moins exigeant n'est pas servi par le plus petit cookie suffisant c, on peut échanger les cookies : c satisfait cet enfant, et le cookie qu'il recevait (au moins aussi grand que c) satisfait celui qui recevait c, puisque ses besoins sont couverts par c. Le nombre d'enfants satisfaits ne diminue pas.

**Variante symétrique** : parcourir les enfants du plus exigeant au moins exigeant en donnant le plus gros cookie restant s'il suffit. Même complexité.

**Problèmes voisins** : « Boats to Save People » (deux pointeurs aux extrémités après tri), « Maximum Matching of Players With Trainers », « Assign tasks to workers ». Si l'enjeu devient la somme des valeurs plutôt que le nombre, le glouton peut ne plus suffire.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-sauts',
    title: 'Nombre minimal de sauts (Jump Game II)',
    difficulty: 'moyen',
    theme: 'glouton',
    pattern: 'glouton par fenêtres (BFS implicite)',
    statement: `On part de l'indice 0 d'un tableau \`nums\` d'entiers positifs ou nuls ; depuis l'indice \`i\`, on peut sauter vers n'importe quel indice de \`i + 1\` à \`i + nums[i]\`.

Écrivez \`jump(nums)\` qui renvoie le **nombre minimal de sauts** pour atteindre le dernier indice. On garantit que le dernier indice est atteignable.

- \`nums\` contient au moins un élément (un tableau d'un élément demande 0 saut) ;
- \`nums\` peut contenir 10⁵ éléments : visez O(n).

Exemples :

- \`jump([2, 3, 1, 1, 4])\` donne \`2\` (0 → 1 → 4) ;
- \`jump([2, 3, 0, 1, 4])\` donne \`2\` ;
- \`jump([1, 1, 1, 1])\` donne \`3\`.`,
    starter: `function jump(nums) {
  // TODO : sauter le plus loin possible n'est pas toujours optimal
  return nums.length - 1
}`,
    solution: `function jump(nums) {
  let jumps = 0
  let currentEnd = 0 // dernière case atteignable avec « jumps » sauts
  let farthest = 0 // plus loin atteignable avec un saut de plus
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])
    if (i === currentEnd) {
      // on a exploré toute la fenêtre courante : un saut de plus est nécessaire
      jumps++
      currentEnd = farthest
      if (currentEnd >= nums.length - 1) break
    }
  }
  return jumps
}`,
    solutionEquiv: {
      python: `def jump(nums):
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
            if current_end >= len(nums) - 1:
                break
    return jumps`,
      java: `static int jump(int[] nums) {
    int jumps = 0, currentEnd = 0, farthest = 0;
    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
            if (currentEnd >= nums.length - 1) break;
        }
    }
    return jumps;
}`,
    },
    tests: [
      { name: 'exemple classique', code: `assertEqual(jump([2, 3, 1, 1, 4]), 2)` },
      { name: 'avec une case nulle', code: `assertEqual(jump([2, 3, 0, 1, 4]), 2)` },
      { name: 'un seul élément', code: `assertEqual(jump([0]), 0)
assertEqual(jump([5]), 0)` },
      { name: 'pas unitaires', code: `assertEqual(jump([1, 1, 1, 1]), 3)
assertEqual(jump([1, 2]), 1)` },
      { name: 'un grand saut suffit', code: `assertEqual(jump([10, 1, 1, 1, 1]), 1)` },
      { name: 'le saut le plus long n’est pas le bon choix', code: `assertEqual(jump([3, 1, 4, 1, 1, 1, 1]), 2)
assertEqual(jump([2, 1, 3, 1, 1, 1]), 2)` },
      {
        name: 'grande entrée : 10⁵ cases',
        code: `const ones = new Array(100000).fill(1)
const mixed = Array.from({ length: 100000 }, (_, i) => (i % 3) + 1)
const t0 = performance.now()
assertEqual(jump(ones), 99999)
const r = jump(mixed)
const elapsed = performance.now() - t0
assert(r > 0 && r < 99999, 'résultat incohérent : ' + r)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      'Voyez le problème comme un BFS : les cases atteignables en k sauts forment un **intervalle contigu** `[début, fin]`.',
      'En parcourant cet intervalle, calculez la case la plus lointaine atteignable avec un saut de plus : elle définit la fin de l’intervalle suivant.',
      'Quand l’indice courant atteint la fin de l’intervalle courant, incrémentez le nombre de sauts et passez à l’intervalle suivant. Arrêtez la boucle avant le dernier indice pour ne pas compter un saut de trop.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire.

**Pourquoi c'est correct** : c'est un BFS sur les indices, où chaque niveau est un intervalle : toutes les cases de \`[currentEnd précédent + 1, currentEnd]\` sont atteignables en exactement \`jumps\` sauts, et pas moins. Le glouton ne choisit pas « le plus grand saut » mais calcule la frontière du niveau suivant.

**Contre-exemple du glouton naïf** : sauter toujours le plus loin possible échoue sur \`[3, 1, 4, 1, 1, 1, 1]\` : sauter de 3 mène à l'indice 3 (valeur 1), puis il faut 3 sauts de plus : 4 au total ; alors qu'aller à l'indice 2 (valeur 4) permet 0 → 2 → 6 en 2 sauts. Le bon critère est « la case qui mène le plus loin », pas « la case la plus lointaine ».

**Alternatives** : DP en O(n²) (\`best[j] = min(best[i] + 1)\` pour tous les i qui atteignent j), trop lente pour 10⁵. **Jump Game I** (atteignable ou non) se résout avec la seule portée maximale.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-chevauchements',
    title: 'Supprimer le minimum d’intervalles',
    difficulty: 'moyen',
    theme: 'glouton',
    pattern: 'intervalles : tri par fin',
    statement: `Écrivez \`eraseOverlapIntervals(intervals)\` qui renvoie le **nombre minimal d'intervalles à supprimer** pour que les intervalles restants ne se chevauchent plus.

- chaque intervalle est un tableau \`[début, fin]\` avec \`début < fin\` ;
- deux intervalles qui se **touchent** (\`[1, 2]\` et \`[2, 3]\`) ne se chevauchent **pas** ;
- le tableau peut être vide et n'est pas trié ; ne le modifiez pas.

Exemples :

- \`eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])\` donne \`1\` (supprimer \`[1, 3]\`) ;
- \`eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]])\` donne \`2\` ;
- \`eraseOverlapIntervals([[1, 2], [2, 3]])\` donne \`0\`.`,
    starter: `function eraseOverlapIntervals(intervals) {
  // TODO : garder le plus d'intervalles compatibles possible
  return 0
}`,
    solution: `function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]) // par fin croissante
  let kept = 0
  let end = -Infinity
  for (const [s, e] of sorted) {
    if (s >= end) {
      // compatible : on le garde (c'est celui qui finit le plus tôt)
      kept++
      end = e
    }
  }
  return intervals.length - kept
}`,
    solutionEquiv: {
      python: `def erase_overlap_intervals(intervals):
    kept = 0
    end = float('-inf')
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if s >= end:
            kept += 1
            end = e
    return len(intervals) - kept`,
      java: `static int eraseOverlapIntervals(int[][] intervals) {
    int[][] sorted = intervals.clone(); // copie superficielle : suffit pour trier
    Arrays.sort(sorted, (a, b) -> Integer.compare(a[1], b[1]));
    int kept = 0;
    long end = Long.MIN_VALUE;
    for (int[] iv : sorted) {
        if (iv[0] >= end) {
            kept++;
            end = iv[1];
        }
    }
    return intervals.length - kept;
}`,
      rust: `fn erase_overlap_intervals(intervals: &[(i64, i64)]) -> usize {
    let mut sorted = intervals.to_vec();
    sorted.sort_by_key(|&(_, e)| e);
    let mut kept = 0;
    let mut end = i64::MIN;
    for (s, e) in sorted {
        if s >= end {
            kept += 1;
            end = e;
        }
    }
    intervals.len() - kept
}`,
      php: `function eraseOverlapIntervals(array $intervals): int {
    usort($intervals, fn($a, $b) => $a[1] <=> $b[1]); // copie locale : l'appelant n'est pas modifié
    $kept = 0;
    $end = -INF;
    foreach ($intervals as [$s, $e]) {
        if ($s >= $end) {
            $kept++;
            $end = $e;
        }
    }
    return count($intervals) - $kept;
}`,
    },
    tests: [
      { name: 'exemple : une suppression', code: `assertEqual(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]), 1)` },
      { name: 'doublons', code: `assertEqual(eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]), 2)` },
      { name: 'intervalles qui se touchent', code: `assertEqual(eraseOverlapIntervals([[1, 2], [2, 3]]), 0)` },
      { name: 'tableau vide et un seul intervalle', code: `assertEqual(eraseOverlapIntervals([]), 0)
assertEqual(eraseOverlapIntervals([[5, 9]]), 0)` },
      { name: 'trier par début ne suffit pas', code: `assertEqual(eraseOverlapIntervals([[1, 100], [2, 3], [4, 5]]), 1)
assertEqual(eraseOverlapIntervals([[1, 100], [11, 22], [1, 11], [2, 12]]), 2)` },
      { name: 'trier par durée ne suffit pas', code: `assertEqual(eraseOverlapIntervals([[0, 5], [4, 7], [6, 11]]), 1)
assertEqual(eraseOverlapIntervals([[-5, -2], [-3, 0], [0, 3]]), 1)` },
      { name: 'l’entrée n’est pas modifiée', code: `const input = [[3, 4], [1, 3], [2, 5]]
eraseOverlapIntervals(input)
assertEqual(input, [[3, 4], [1, 3], [2, 5]])` },
    ],
    hints: [
      'Minimiser les suppressions revient à **maximiser** le nombre d’intervalles gardés deux à deux compatibles.',
      'Parmi les intervalles compatibles avec ceux déjà gardés, lequel laisse le plus de place pour la suite ? Celui qui **finit le plus tôt**.',
      'Triez par fin croissante, gardez un intervalle si son début est ≥ à la fin du dernier gardé, et renvoyez `n - gardés`. Triez une copie.',
    ],
    discussion: `**Complexité** : O(n log n) pour le tri, O(n) pour le parcours ; O(n) pour la copie.

**Preuve par échange** : soit O une solution optimale (ensemble maximal d'intervalles compatibles). Son premier intervalle (par fin) peut être remplacé par l'intervalle qui finit le plus tôt de tous, g : g finit au plus tard comme lui, donc reste compatible avec le reste de O. On recommence sur les intervalles qui commencent après la fin de g.

**Mauvais critères** : trier par début et garder le premier (un intervalle très long bloque tout), ou par durée (un intervalle court peut chevaucher deux intervalles compatibles entre eux, cf. \`[4, 7]\` entre \`[0, 5]\` et \`[6, 11]\`).

**Variante par début** : trier par début et, en cas de chevauchement, supprimer celui qui finit le plus tard (\`end = Math.min(end, e)\`) : également correct.

**Problèmes jumeaux** : « Minimum Number of Arrows to Burst Balloons » (même tri, mais des ballons qui se touchent sont crevés par la même flèche : la comparaison devient stricte), « Non-overlapping Intervals », sélection d'activités. Si les intervalles ont des **poids** à maximiser, il faut une DP avec dichotomie.`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-salles',
    title: 'Nombre minimal de salles de réunion',
    difficulty: 'moyen',
    theme: 'glouton',
    pattern: 'intervalles : balayage ou tas',
    statement: `Chaque réunion est un intervalle **semi-ouvert** \`[début, fin)\` : elle occupe une salle de l'instant \`début\` inclus à l'instant \`fin\` exclu (donc une réunion qui finit à 10 libère sa salle pour une réunion qui commence à 10).

Écrivez \`minMeetingRooms(intervals)\` qui renvoie le **nombre minimal de salles** nécessaires pour tenir toutes les réunions.

- \`intervals\` n'est pas trié, peut être vide et contenir 10⁵ réunions ;
- \`début < fin\` pour chaque réunion.

Exemples :

- \`minMeetingRooms([[0, 30], [5, 10], [15, 20]])\` donne \`2\` ;
- \`minMeetingRooms([[7, 10], [2, 4]])\` donne \`1\` ;
- \`minMeetingRooms([[1, 5], [5, 8]])\` donne \`1\`.`,
    starter: `function minMeetingRooms(intervals) {
  // TODO : combien de réunions se déroulent en même temps, au pire ?
  return intervals.length
}`,
    solution: `function minMeetingRooms(intervals) {
  const starts = intervals.map((iv) => iv[0]).sort((a, b) => a - b)
  const ends = intervals.map((iv) => iv[1]).sort((a, b) => a - b)
  let rooms = 0
  let j = 0 // prochaine fin non encore « consommée »
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[j]) {
      rooms++ // aucune réunion terminée : il faut une salle de plus
    } else {
      j++ // une réunion est finie : sa salle est réutilisée
    }
  }
  return rooms
}`,
    solutionEquiv: {
      python: `def min_meeting_rooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends = sorted(iv[1] for iv in intervals)
    rooms = 0
    j = 0  # prochaine fin non encore consommée
    for s in starts:
        if s < ends[j]:
            rooms += 1
        else:
            j += 1
    return rooms`,
      java: `static int minMeetingRooms(int[][] intervals) {
    int n = intervals.length;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }
    Arrays.sort(starts);
    Arrays.sort(ends);
    int rooms = 0, j = 0;
    for (int i = 0; i < n; i++) {
        if (starts[i] < ends[j]) rooms++;
        else j++;
    }
    return rooms;
}`,
      rust: `fn min_meeting_rooms(intervals: &[(i64, i64)]) -> usize {
    let mut starts: Vec<i64> = intervals.iter().map(|&(s, _)| s).collect();
    let mut ends: Vec<i64> = intervals.iter().map(|&(_, e)| e).collect();
    starts.sort_unstable();
    ends.sort_unstable();
    let mut rooms = 0;
    let mut j = 0;
    for s in starts {
        if s < ends[j] {
            rooms += 1;
        } else {
            j += 1;
        }
    }
    rooms
}`,
      php: `function minMeetingRooms(array $intervals): int {
    $starts = array_column($intervals, 0);
    $ends = array_column($intervals, 1);
    sort($starts);
    sort($ends);
    $rooms = 0;
    $j = 0;
    foreach ($starts as $s) {
        if ($s < $ends[$j]) $rooms++;
        else $j++;
    }
    return $rooms;
}`,
    },
    tests: [
      { name: 'exemple : deux salles', code: `assertEqual(minMeetingRooms([[0, 30], [5, 10], [15, 20]]), 2)` },
      { name: 'réunions disjointes non triées', code: `assertEqual(minMeetingRooms([[7, 10], [2, 4]]), 1)` },
      { name: 'fin et début au même instant', code: `assertEqual(minMeetingRooms([[1, 5], [5, 8]]), 1)
assertEqual(minMeetingRooms([[5, 8], [1, 5], [8, 9]]), 1)` },
      { name: 'aucune réunion, une réunion', code: `assertEqual(minMeetingRooms([]), 0)
assertEqual(minMeetingRooms([[3, 4]]), 1)` },
      { name: 'réunions imbriquées et identiques', code: `assertEqual(minMeetingRooms([[1, 10], [2, 9], [3, 8]]), 3)
assertEqual(minMeetingRooms([[1, 5], [1, 5]]), 2)` },
      { name: 'le chevauchement maximal n’implique pas la première réunion', code: `assertEqual(minMeetingRooms([[1, 3], [4, 9], [5, 7], [6, 8], [10, 12]]), 3)` },
      {
        name: 'grande entrée : 10⁵ réunions',
        code: `// réunions [i, i + 50) dans un ordre mélangé : 50 se chevauchent à tout instant
const n = 100000
const intervals = []
let x = 1
for (let i = 0; i < n; i++) intervals.push([i, i + 50])
for (let i = n - 1; i > 0; i--) {
  x = (x * 48271) % 2147483647
  const k = x % (i + 1)
  const t = intervals[i]
  intervals[i] = intervals[k]
  intervals[k] = t
}
const t0 = performance.now()
const res = minMeetingRooms(intervals)
const elapsed = performance.now() - t0
assertEqual(res, 50)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms')`,
      },
    ],
    hints: [
      'La réponse est le nombre maximal de réunions en cours **au même instant**.',
      'Avec un tas : triez par début, gardez un tas min des fins des salles occupées ; si la plus petite fin est ≤ au début courant, cette salle se libère (retirez-la), puis ajoutez la fin courante. La taille finale du tas est la réponse.',
      'Sans tas : triez séparément les débuts et les fins, et parcourez les débuts avec un pointeur sur les fins ; un début strictement avant la fin pointée exige une salle de plus, sinon une salle se libère.',
    ],
    discussion: `**Complexité** : O(n log n) pour les tris (ou tri + tas), O(n) de mémoire.

**Pourquoi le balayage marche** : à chaque début, le nombre de réunions en cours est (débuts vus) − (fins passées). Le compteur \`rooms\` n'augmente que lorsqu'aucune fin ne précède le début courant ; sinon on « consomme » une fin, ce qui revient à réutiliser une salle.

**Égalités** : avec des intervalles semi-ouverts, une fin égale à un début libère la salle (comparaison \`<\` dans le balayage, \`<=\` dans le test du tas). Si l'énoncé disait « fermés », il faudrait inverser.

**Alternatives** : tableau de différences (+1 au début, -1 à la fin, puis somme préfixe) quand les instants sont de petits entiers ; « carte d'événements » triée \`[instant, ±1]\` en mettant les -1 avant les +1 au même instant.

**Suites** : renvoyer l'affectation salle par salle (tas de paires \`[fin, salle]\`), « Meeting Rooms III » (la salle libre de plus petit numéro, deux tas), « Car Pooling », « My Calendar ».`,
  },

  // ---------------------------------------------------------------------------
  {
    id: 'gr-station',
    title: 'Station-service (gas station)',
    difficulty: 'moyen',
    theme: 'glouton',
    pattern: 'glouton à une passe (réinitialisation)',
    statement: `Il y a \`n\` stations-service sur une route **circulaire**. La station \`i\` fournit \`gas[i]\` litres, et aller de la station \`i\` à la station \`(i + 1) % n\` consomme \`cost[i]\` litres. Le réservoir est illimité et vide au départ.

Écrivez \`canCompleteCircuit(gas, cost)\` qui renvoie l'indice de la station de départ permettant de faire **un tour complet** dans le sens croissant des indices, ou \`-1\` si c'est impossible.

- le réservoir ne doit jamais devenir négatif pendant le trajet (arriver avec 0 litre est permis) ;
- si une solution existe, elle est **unique** ;
- \`n\` peut atteindre 10⁵ : visez O(n).

Exemples :

- \`canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])\` donne \`3\` ;
- \`canCompleteCircuit([2, 3, 4], [3, 4, 3])\` donne \`-1\` ;
- \`canCompleteCircuit([5], [4])\` donne \`0\`.`,
    starter: `function canCompleteCircuit(gas, cost) {
  // TODO : peut-on éviter de simuler chaque départ ?
  return 0
}`,
    solution: `function canCompleteCircuit(gas, cost) {
  let total = 0 // bilan global : négatif => impossible
  let tank = 0 // réservoir depuis le départ candidat
  let start = 0
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i]
    total += diff
    tank += diff
    if (tank < 0) {
      // aucune station entre start et i ne peut convenir : on repart de i + 1
      start = i + 1
      tank = 0
    }
  }
  return total < 0 ? -1 : start
}`,
    solutionEquiv: {
      python: `def can_complete_circuit(gas, cost):
    total = tank = start = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0:
            start = i + 1
            tank = 0
    return -1 if total < 0 else start`,
      java: `static int canCompleteCircuit(int[] gas, int[] cost) {
    long total = 0, tank = 0; // long : la somme peut dépasser un int
    int start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        if (tank < 0) {
            start = i + 1;
            tank = 0;
        }
    }
    return total < 0 ? -1 : start;
}`,
    },
    tests: [
      { name: 'exemple : départ en 3', code: `assertEqual(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), 3)` },
      { name: 'impossible', code: `assertEqual(canCompleteCircuit([2, 3, 4], [3, 4, 3]), -1)` },
      { name: 'une seule station', code: `assertEqual(canCompleteCircuit([5], [4]), 0)
assertEqual(canCompleteCircuit([4], [5]), -1)
assertEqual(canCompleteCircuit([3], [3]), 0)` },
      { name: 'départ en dernière position', code: `assertEqual(canCompleteCircuit([5, 1, 2, 3, 4], [4, 4, 1, 5, 1]), 4)` },
      { name: 'réservoir exactement vide à l’arrivée', code: `assertEqual(canCompleteCircuit([1, 1, 3], [2, 2, 1]), 2)
assertEqual(canCompleteCircuit([3, 1, 1], [1, 2, 2]), 0)` },
      {
        name: 'grande entrée : 10⁵ stations, départ tout à la fin',
        code: `const n = 100000
const gas = new Array(n).fill(1)
const cost = new Array(n).fill(1)
cost[n - 2] = 2 // on tombe en panne juste avant la fin…
gas[n - 1] = 2 // …sauf en partant de la dernière station
const t0 = performance.now()
const res = canCompleteCircuit(gas, cost)
const elapsed = performance.now() - t0
assertEqual(res, n - 1)
assert(elapsed < 1000, 'trop lent : ' + Math.round(elapsed) + ' ms (simuler chaque départ coûte O(n²))')`,
      },
    ],
    hints: [
      'Si la somme totale de `gas[i] - cost[i]` est négative, aucun départ ne fonctionne. Sinon, on peut montrer qu’un départ existe.',
      'Partez de 0 en cumulant le réservoir. S’il devient négatif en arrivant après la station i, alors aucune station entre le départ courant et i ne peut servir de départ.',
      'Pourquoi ? Chacune de ces stations aurait été atteinte avec un réservoir ≥ 0 en partant du départ courant ; partir d’elle à vide ne peut qu’être pire. On repart donc de i + 1 avec un réservoir vide, en une seule passe.',
    ],
    discussion: `**Complexité** : O(n) en temps, O(1) en mémoire, contre O(n²) pour la simulation depuis chaque station.

**Justification** : (1) si \`total < 0\`, il manque du carburant au global, c'est impossible ; (2) si le réservoir tombe sous 0 entre \`start\` et \`i\`, toute station \`k\` de cet intervalle a été atteinte avec un réservoir ≥ 0, donc partir de \`k\` à vide donnerait un réservoir encore plus faible en \`i\` : on élimine tout l'intervalle ; (3) si \`total ≥ 0\`, le dernier \`start\` retenu tient jusqu'à la fin du tableau, et le déficit accumulé avant lui est compensé par son excédent, puisque le bilan global est positif.

**Pièges** : oublier le test global (\`start\` peut valoir \`n\` si le réservoir devient négatif à la dernière station, mais alors \`total < 0\`) ; débordement d'entier en Java ou en C++ sur des sommes de 10⁵ valeurs de 10⁴.

**Variantes** : départ dans le sens inverse, plusieurs tours, ou « Minimum Number of Refueling Stops » (là, un tas max des stations passées : on « reprend rétroactivement » le plus gros plein disponible quand on tombe en panne).`,
  },
]

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

const quiz: QuizItem[] = [
  // --- graphes ---
  {
    id: 'gr-q-ordre-bfs',
    theme: 'graphes',
    kind: 'output',
    q: 'Qu’affiche ce parcours ?',
    code: `const adj = [[1, 2], [3], [3, 4], [], [0]]
const seen = new Set([0])
const queue = [0]
let head = 0
const order = []
while (head < queue.length) {
  const u = queue[head++]
  order.push(u)
  for (const v of adj[u]) {
    if (!seen.has(v)) {
      seen.add(v)
      queue.push(v)
    }
  }
}
console.log(order.join(' '))`,
    choices: ['0 1 3 2 4', '0 1 2 3 4', '0 2 4 1 3', '0 1 2 3 4 0'],
    answer: 1,
    why: `C'est un BFS : on visite d'abord les voisins directs de 0 (1 puis 2), puis ceux de la couche suivante (3 depuis 1 ; 4 depuis 2, 3 étant déjà vu). Le \`0\` voisin de 4 est déjà marqué, il n'est pas revisité. \`0 1 3 2 4\` serait l'ordre d'un DFS.`,
  },
  {
    id: 'gr-q-fill-partage',
    theme: 'graphes',
    kind: 'output',
    q: 'Qu’affiche ce code qui prépare une liste d’adjacence ?',
    code: `const adj = new Array(3).fill([])
adj[0].push(1)
adj[1].push(2)
console.log(adj[2].length, adj[0] === adj[2])`,
    choices: ['0 false', '1 false', '2 true', '2 false'],
    answer: 2,
    why: `\`fill([])\` évalue \`[]\` **une seule fois** et place la même référence dans les trois cases : les deux \`push\` modifient l'unique tableau partagé. Il faut \`Array.from({ length: 3 }, () => [])\`, qui appelle la fonction pour chaque case.`,
  },
  {
    id: 'gr-q-kahn',
    theme: 'graphes',
    kind: 'output',
    q: 'Qu’affiche ce tri topologique ?',
    code: `const n = 4
const edges = [[3, 1], [1, 0], [3, 2], [2, 0]]
const adj = Array.from({ length: n }, () => [])
const indeg = new Array(n).fill(0)
for (const [u, v] of edges) {
  adj[u].push(v)
  indeg[v]++
}
const order = []
for (let u = 0; u < n; u++) if (indeg[u] === 0) order.push(u)
for (let i = 0; i < order.length; i++) {
  for (const v of adj[order[i]]) if (--indeg[v] === 0) order.push(v)
}
console.log(order.join(','), order.length === n)`,
    choices: ['0,1,2,3 true', '3,1,2,0 true', '3,2,1,0 true', '3,1,2 false'],
    answer: 1,
    why: `Seul 3 a un degré entrant nul. En le retirant, 1 puis 2 tombent à 0 (dans l'ordre de la liste d'adjacence de 3). Le sommet 0 attend que ses deux prédécesseurs 1 et 2 soient retirés. Les 4 sommets sont placés : pas de cycle.`,
  },
  {
    id: 'gr-q-shift',
    theme: 'graphes',
    kind: 'complexite',
    q: 'Quelle est la complexité de ce BFS dans le pire cas (V sommets, E arêtes) ?',
    code: `function bfs(adj, start) {
  const seen = new Array(adj.length).fill(false)
  const queue = [start]
  seen[start] = true
  let count = 0
  while (queue.length > 0) {
    const u = queue.shift()
    count++
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true
        queue.push(v)
      }
    }
  }
  return count
}
bfs([[1, 2, 3], [0], [0], [0]], 0)`,
    choices: ['O(V + E)', 'O(V² + E)', 'O((V + E) log V)', 'O(V × E)'],
    answer: 1,
    why: `\`shift()\` décale tous les éléments restants : O(taille de la file). Sur une étoile (un centre relié à V − 1 feuilles), la file contient presque tous les sommets et chaque \`shift\` coûte O(V), d'où O(V²) au total, en plus des O(E) examens d'arêtes. Avec un index de tête (\`queue[head++]\`), on revient à O(V + E). Certains moteurs optimisent \`shift\` sur de petits tableaux, mais on ne peut pas compter dessus.`,
  },
  {
    id: 'gr-q-dijkstra-tableau',
    theme: 'graphes',
    kind: 'complexite',
    q: 'Quelle est la complexité de cette version de Dijkstra sans tas ?',
    code: `function dijkstraArray(adj, src) {
  const n = adj.length
  const dist = new Array(n).fill(Infinity)
  const done = new Array(n).fill(false)
  dist[src] = 0
  for (let k = 0; k < n; k++) {
    let u = -1
    for (let i = 0; i < n; i++) if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i
    if (dist[u] === Infinity) break
    done[u] = true
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w
  }
  return dist
}
dijkstraArray([[[1, 2], [2, 5]], [[2, 1]], []], 0)`,
    choices: ['O((V + E) log V)', 'O(V + E)', 'O(V² + E)', 'O(E log E)'],
    answer: 2,
    why: `À chacune des V itérations, la recherche du minimum parcourt les V sommets : O(V²). Chaque arête est relâchée une fois : O(E). Total O(V² + E) = O(V²) puisque E ≤ V². C'est meilleur que la version avec tas sur un graphe **très dense** (E ≈ V²), moins bon sur un graphe creux.`,
  },
  {
    id: 'gr-q-union-find',
    theme: 'graphes',
    kind: 'complexite',
    q: 'Quelle est la complexité totale de ces m opérations sur n éléments (compression de chemin et union par taille) ?',
    code: `function components(n, pairs) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const size = new Array(n).fill(1)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  let count = n
  for (const [a, b] of pairs) {
    let ra = find(a)
    let rb = find(b)
    if (ra === rb) continue
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra]
    parent[rb] = ra
    size[ra] += size[rb]
    count--
  }
  return count
}
components(5, [[0, 1], [1, 2], [3, 4]])`,
    choices: ['O(n × m)', 'O(n + m log m)', 'O(n + m × α(n))', 'O(m²)'],
    answer: 2,
    why: `L'initialisation coûte O(n). Avec la compression de chemin (ici la variante « division de chemin » \`parent[x] = parent[parent[x]]\`) **et** l'union par taille, chaque \`find\` coûte O(α(n)) amorti, où α (inverse d'Ackermann) ne dépasse pas 4 en pratique. On dit souvent « quasi linéaire ».`,
  },
  {
    id: 'gr-q-marquage',
    theme: 'graphes',
    kind: 'bug',
    q: 'Ce BFS renvoie les bonnes distances, mais il a un défaut. Lequel ?',
    code: `function distances(adj, start) {
  const dist = new Array(adj.length).fill(-1)
  const queue = [[start, 0]]
  let head = 0
  while (head < queue.length) {
    const [u, d] = queue[head++]
    if (dist[u] !== -1) continue
    dist[u] = d
    for (const v of adj[u]) if (dist[v] === -1) queue.push([v, d + 1])
  }
  return dist
}
distances([[1, 2], [0, 2], [0, 1]], 0)`,
    choices: [
      'Les distances sont décalées de 1',
      'Un sommet est marqué au défilage : il peut entrer plusieurs fois dans la file (jusqu’à O(E) entrées)',
      'Il boucle indéfiniment sur un graphe cyclique',
      'Il faut une pile au lieu d’une file',
    ],
    answer: 1,
    why: `\`dist[u]\` n'est fixé qu'au défilage : tant qu'un sommet attend dans la file, tous ses voisins déjà traités peuvent l'enfiler à nouveau. Le résultat reste juste grâce au \`continue\`, mais la file peut grossir jusqu'à O(E) entrées (O(V²) sur un graphe dense). Marquer à l'enfilage garantit qu'un sommet n'entre qu'une fois dans la file.`,
  },
  {
    id: 'gr-q-cycle-oriente',
    theme: 'graphes',
    kind: 'bug',
    q: 'Cette détection de cycle dans un graphe orienté est fausse. Pourquoi ?',
    code: `function hasCycle(adj) {
  const visited = new Set()
  function dfs(u) {
    if (visited.has(u)) return true
    visited.add(u)
    for (const v of adj[u]) if (dfs(v)) return true
    return false
  }
  for (let u = 0; u < adj.length; u++) if (!visited.has(u) && dfs(u)) return true
  return false
}
hasCycle([[1, 2], [2], []])`,
    choices: [
      'Elle ne détecte pas les boucles u → u',
      'Elle déclare un cycle dès qu’un sommet est atteint par deux chemins, comme dans le losange 0→1→2, 0→2',
      'Elle dépasse la pile même sur un petit graphe',
      'Elle oublie les sommets isolés',
    ],
    answer: 1,
    why: `Un sommet déjà **terminé** (noir) peut être atteint à nouveau sans qu'il y ait de cycle : ici 2 est atteint via 1 puis directement depuis 0, et la fonction renvoie \`true\` à tort. Il faut distinguer « en cours » (gris, sur la pile de récursion) de « terminé » (noir) : seul un sommet gris signale une arête arrière, donc un cycle.`,
  },
  {
    id: 'gr-q-choix-algo',
    theme: 'graphes',
    kind: 'qcm',
    q: 'Des villes sont reliées par des routes de durées positives différentes. Quel algorithme donne le trajet le plus rapide depuis une ville ?',
    choices: ['BFS', 'DFS', 'Dijkstra avec un tas', 'Tri topologique'],
    answer: 2,
    why: `Les arêtes sont pondérées (durées différentes) et positives : c'est le domaine de Dijkstra, en O((V + E) log V) avec un tas. Le BFS minimiserait le **nombre** de routes, pas la durée. Le tri topologique ne s'applique qu'aux graphes orientés acycliques.`,
  },
  {
    id: 'gr-q-biparti',
    theme: 'graphes',
    kind: 'qcm',
    q: 'Un graphe non orienté est biparti si et seulement si…',
    choices: [
      'il est connexe',
      'il ne contient aucun cycle',
      'il ne contient aucun cycle de longueur impaire',
      'chaque sommet a un degré pair',
    ],
    answer: 2,
    why: `Un cycle impair empêche toute 2-coloration (en alternant les couleurs, on revient au départ avec la mauvaise couleur). Réciproquement, sans cycle impair, la coloration par BFS réussit sur chaque composante. Un graphe biparti peut avoir des cycles (pairs) et ne pas être connexe. « Degré pair partout » caractérise les graphes eulériens, pas les bipartis.`,
  },

  // --- glouton ---
  {
    id: 'gr-q-pieces',
    theme: 'glouton',
    kind: 'output',
    q: 'Qu’affiche ce rendu de monnaie glouton ?',
    code: `function greedy(coins, amount) {
  const used = []
  for (const c of [...coins].sort((a, b) => b - a)) {
    while (amount >= c) {
      amount -= c
      used.push(c)
    }
  }
  return used
}
console.log(greedy([1, 3, 4], 6).join('+'))`,
    choices: ['3+3', '4+1+1', '4+2', '1+1+4'],
    answer: 1,
    why: `Le glouton prend d'abord la plus grosse pièce, 4, puis complète avec deux pièces de 1 : trois pièces. Pourtant 3 + 3 n'en utilise que deux. Le système {1, 3, 4} n'est pas canonique : il faut la programmation dynamique.`,
  },
  {
    id: 'gr-q-tri-intervalles',
    theme: 'glouton',
    kind: 'output',
    q: 'Qu’affiche ce code, qui applique le même glouton après deux tris différents ?',
    code: `const iv = [[1, 10], [2, 3], [4, 5], [6, 7]]
function count(sorted) {
  let c = 0
  let end = -Infinity
  for (const [s, e] of sorted) {
    if (s >= end) {
      c++
      end = e
    }
  }
  return c
}
const byStart = [...iv].sort((a, b) => a[0] - b[0])
const byEnd = [...iv].sort((a, b) => a[1] - b[1])
console.log(count(byStart), count(byEnd))`,
    choices: ['3 3', '1 3', '1 1', '3 1'],
    answer: 1,
    why: `Trié par début, \`[1, 10]\` passe en premier, est retenu et bloque tous les autres : 1 seul intervalle. Trié par fin, on retient \`[2, 3]\`, \`[4, 5]\` et \`[6, 7]\` : 3 intervalles, l'optimum. Seul le tri par **fin** est justifié par l'argument d'échange.`,
  },
  {
    id: 'gr-q-activites-cx',
    theme: 'glouton',
    kind: 'complexite',
    q: 'Quelle est la complexité de cette sélection d’activités (n intervalles) ?',
    code: `function maxActivities(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1])
  let count = 0
  let end = -Infinity
  for (const [s, e] of sorted) {
    if (s >= end) {
      count++
      end = e
    }
  }
  return count
}
maxActivities([[1, 4], [3, 5], [5, 7]])`,
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    answer: 1,
    why: `Le tri coûte O(n log n) et domine le parcours linéaire O(n). C'est la signature de la plupart des gloutons sur intervalles : « trier, puis une passe ».`,
  },
  {
    id: 'gr-q-jump-dp',
    theme: 'glouton',
    kind: 'complexite',
    q: 'Quelle est la complexité dans le pire cas de cette solution du jump game ?',
    code: `function canJumpDp(nums) {
  const ok = new Array(nums.length).fill(false)
  ok[0] = true
  for (let j = 1; j < nums.length; j++) {
    for (let i = 0; i < j; i++) {
      if (ok[i] && i + nums[i] >= j) {
        ok[j] = true
        break
      }
    }
  }
  return ok[nums.length - 1]
}
canJumpDp([2, 3, 1, 1, 4])`,
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n × max(nums))'],
    answer: 2,
    why: `Pour chaque case j, la boucle interne peut parcourir toutes les cases précédentes (par exemple si les sauts sont tous de 1, la case qui atteint j est la dernière examinée) : O(n²). Le glouton qui maintient la portée maximale résout le même problème en O(n).`,
  },
  {
    id: 'gr-q-salles-bug',
    theme: 'glouton',
    kind: 'bug',
    q: 'Les réunions sont des intervalles [début, fin) : une réunion qui finit à 10 libère sa salle pour une réunion qui commence à 10. Où est le bug ?',
    code: `function minRooms(intervals) {
  const starts = intervals.map((iv) => iv[0]).sort((a, b) => a - b)
  const ends = intervals.map((iv) => iv[1]).sort((a, b) => a - b)
  let rooms = 0
  let j = 0
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= ends[j]) rooms++
    else j++
  }
  return rooms
}
minRooms([[1, 5], [5, 8]])`,
    choices: [
      'Il faut trier les fins par ordre décroissant',
      '`<=` compte deux réunions qui se touchent comme simultanées : il faut `<`',
      'Il faut initialiser `rooms` à 1',
      '`j` doit être réinitialisé à chaque tour',
    ],
    answer: 1,
    why: `Avec \`<=\`, la réunion qui commence à 5 ne réutilise pas la salle libérée à 5 : \`minRooms([[1, 5], [5, 8]])\` renvoie 2 au lieu de 1. La comparaison doit refléter la convention des bornes de l'énoncé : intervalles semi-ouverts, donc \`<\`.`,
  },
  {
    id: 'gr-q-echange',
    theme: 'glouton',
    kind: 'qcm',
    q: 'Quelle technique sert le plus souvent à prouver qu’un algorithme glouton est optimal ?',
    choices: [
      'Tester tous les cas jusqu’à n = 10',
      'L’argument d’échange : transformer une solution optimale en la solution gloutonne sans la dégrader',
      'Montrer que l’algorithme termine',
      'Calculer sa complexité',
    ],
    answer: 1,
    why: `L'argument d'échange part d'une solution optimale quelconque et montre qu'on peut remplacer son premier choix par le choix glouton sans perte ; par récurrence, la solution gloutonne est optimale. Des tests ne prouvent rien (ils peuvent seulement réfuter), et la terminaison ou la complexité ne disent rien de l'optimalité.`,
  },
  {
    id: 'gr-q-sac',
    theme: 'glouton',
    kind: 'qcm',
    q: 'Pour lequel de ces problèmes le glouton « meilleur rapport valeur/poids d’abord » est-il optimal ?',
    choices: [
      'Sac à dos 0/1',
      'Sac à dos fractionnaire (on peut prendre une fraction d’objet)',
      'Rendu de monnaie avec des pièces quelconques',
      'Aucun des trois',
    ],
    answer: 1,
    why: `Dans le sac à dos **fractionnaire**, on peut toujours compléter avec une fraction de l'objet suivant : prendre d'abord le meilleur ratio est optimal (argument d'échange sur les fractions). Dans le sac à dos 0/1, un objet au bon ratio peut gaspiller de la place ; il faut une DP en O(n × capacité).`,
  },
]

// ---------------------------------------------------------------------------
// Pièges
// ---------------------------------------------------------------------------

const pieges: Piege[] = [
  {
    id: 'gr-p-marquage-defilage',
    title: 'Marquer « visité » au défilage',
    theme: 'graphes',
    question: 'Combien d’éléments passent par la file de ce BFS sur un graphe complet à 5 sommets ?',
    code: `const n = 5
// graphe complet : chaque sommet est relié à tous les autres
const adj = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => v).filter((v) => v !== u))
const seen = new Set()
const queue = [0]
let head = 0
while (head < queue.length) {
  const u = queue[head++]
  if (seen.has(u)) continue
  seen.add(u) // marqué seulement au défilage
  for (const v of adj[u]) if (!seen.has(v)) queue.push(v)
}
console.log('entrées dans la file :', queue.length, 'pour', n, 'sommets')`,
    output: `entrées dans la file : 11 pour 5 sommets`,
    explanation: `Tant qu'un sommet attend dans la file sans être marqué, chaque voisin traité l'ajoute à nouveau. Sur un graphe complet, la file reçoit O(V²) = O(E) entrées au lieu de V. Le résultat reste juste grâce au \`continue\`, mais la mémoire et le temps explosent sur un graphe dense, et l'on peut même obtenir des distances fausses si l'on calcule \`dist[v] = dist[u] + 1\` sans ce garde-fou.

La règle : en BFS, on marque un sommet **au moment où on l'enfile**. Chaque sommet entre alors exactement une fois dans la file.`,
    fix: {
      code: `const n = 5
const adj = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => v).filter((v) => v !== u))
const seen = new Set([0]) // la source est marquée dès le départ
const queue = [0]
let head = 0
while (head < queue.length) {
  const u = queue[head++]
  for (const v of adj[u]) {
    if (!seen.has(v)) {
      seen.add(v) // marqué à l'enfilage
      queue.push(v)
    }
  }
}
console.log('entrées dans la file :', queue.length, 'pour', n, 'sommets')`,
      output: `entrées dans la file : 5 pour 5 sommets`,
    },
  },
  {
    id: 'gr-p-fill-adjacence',
    title: '`Array(n).fill([])` pour la liste d’adjacence',
    theme: 'graphes',
    question: 'Qu’affiche ce code qui construit le graphe 0–1, 1–2 ?',
    code: `const n = 3
const adj = new Array(n).fill([])
for (const [u, v] of [[0, 1], [1, 2]]) {
  adj[u].push(v)
  adj[v].push(u)
}
console.log(adj[0])
console.log(adj[0] === adj[2])`,
    output: `[ 1, 0, 2, 1 ]
true`,
    explanation: `\`fill\` reçoit **une valeur**, évaluée une seule fois : le même tableau vide est placé dans les trois cases. Tous les \`push\` modifient ce tableau partagé, et chaque sommet semble voisin de tout le monde (y compris de lui-même). Les parcours deviennent faux sans la moindre erreur.

Il faut une **fabrique** appelée pour chaque case : \`Array.from({ length: n }, () => [])\`. Le même piège existe en Python avec \`[[]] * n\`.`,
    fix: {
      code: `const n = 3
const adj = Array.from({ length: n }, () => [])
for (const [u, v] of [[0, 1], [1, 2]]) {
  adj[u].push(v)
  adj[v].push(u)
}
console.log(adj)`,
      output: `[ [ 1 ], [ 0, 2 ], [ 1 ] ]`,
    },
  },
  {
    id: 'gr-p-pile-recursive',
    title: 'DFS récursif sur une grande entrée',
    theme: 'graphes',
    question: 'Que se passe-t-il avec ce DFS récursif sur une chaîne de 100 000 sommets ?',
    code: `const n = 100000
const adj = Array.from({ length: n }, (_, i) => (i + 1 < n ? [i + 1] : [])) // 0 → 1 → … → n-1
const seen = new Uint8Array(n)
function dfs(u) {
  seen[u] = 1
  for (const v of adj[u]) if (!seen[v]) dfs(v)
}
try {
  dfs(0)
  console.log('terminé')
} catch (e) {
  console.log(e.name + ' : ' + e.message)
}`,
    output: `RangeError : Maximum call stack size exceeded`,
    explanation: `Chaque appel récursif occupe un cadre sur la pile d'appels, dont la taille est limitée (de l'ordre de 10⁴ niveaux selon le moteur et la taille des cadres). Une chaîne, un serpentin dans une grille ou une grille pleine de 500 × 500 suffisent à la dépasser. L'algorithme est correct, mais il plante sur les grandes entrées de test.

La parade : une **pile explicite** (un tableau avec \`push\`/\`pop\`), limitée seulement par la mémoire du tas. En entretien, mentionner ce risque montre que vous pensez aux contraintes réelles.`,
    fix: {
      code: `const n = 100000
const adj = Array.from({ length: n }, (_, i) => (i + 1 < n ? [i + 1] : []))
const seen = new Uint8Array(n)
const stack = [0]
seen[0] = 1
let visited = 0
while (stack.length > 0) {
  const u = stack.pop()
  visited++
  for (const v of adj[u]) {
    if (!seen[v]) {
      seen[v] = 1
      stack.push(v)
    }
  }
}
console.log('sommets visités :', visited)`,
      output: `sommets visités : 100000`,
    },
  },
  {
    id: 'gr-p-pieces-non-canoniques',
    title: 'Glouton sur des pièces non canoniques',
    theme: 'glouton',
    question: 'Combien de pièces ce glouton utilise-t-il pour rendre 6 avec les pièces {1, 3, 4} ?',
    code: `function minCoinsGreedy(coins, amount) {
  let count = 0
  for (const c of [...coins].sort((a, b) => b - a)) {
    count += Math.floor(amount / c)
    amount %= c
  }
  return amount === 0 ? count : -1
}
console.log(minCoinsGreedy([1, 3, 4], 6))
console.log(minCoinsGreedy([3, 4], 6))`,
    output: `3
-1`,
    explanation: `Le glouton prend 4, puis 1 + 1 : **3 pièces**, alors que 3 + 3 en utilise 2. Pire, sans pièce de 1, il prend 4, reste bloqué sur 2 et répond « impossible » alors que 3 + 3 existe. Le glouton n'est optimal que pour un système **canonique** (comme les euros).

Pour des pièces quelconques, la programmation dynamique est la réponse attendue : \`best[a] = 1 + min(best[a - c])\`, en O(montant × pièces).`,
    fix: {
      code: `function minCoins(coins, amount) {
  const best = new Array(amount + 1).fill(Infinity)
  best[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1
  }
  return best[amount] === Infinity ? -1 : best[amount]
}
console.log(minCoins([1, 3, 4], 6))
console.log(minCoins([3, 4], 6))`,
      output: `2
2`,
    },
  },
  {
    id: 'gr-p-tri-par-defaut',
    title: '`sort()` sans comparateur avant un glouton',
    theme: 'glouton',
    question: 'Combien d’enfants ce glouton satisfait-il ? (appétits 2, 10, 1 ; cookies 3, 2)',
    code: `function findContentChildren(g, s) {
  const kids = [...g].sort()
  const cookies = [...s].sort()
  let i = 0
  for (let j = 0; j < cookies.length && i < kids.length; j++) {
    if (cookies[j] >= kids[i]) i++
  }
  return i
}
console.log([2, 10, 1].sort())
console.log(findContentChildren([2, 10, 1], [3, 2]))`,
    output: `[ 1, 10, 2 ]
1`,
    explanation: `Sans comparateur, \`sort()\` convertit les nombres en chaînes et les trie dans l'ordre lexicographique : \`'10' < '2'\`. L'enfant d'appétit 10 se retrouve avant celui d'appétit 2, le glouton s'arrête sur lui, et la réponse est 1 au lieu de 2. Un glouton correct sur une entrée mal triée donne une réponse fausse, souvent seulement sur les tests avec des nombres à plusieurs chiffres.

Toujours trier les nombres avec \`(a, b) => a - b\`.`,
    fix: {
      code: `function findContentChildren(g, s) {
  const kids = [...g].sort((a, b) => a - b)
  const cookies = [...s].sort((a, b) => a - b)
  let i = 0
  for (let j = 0; j < cookies.length && i < kids.length; j++) {
    if (cookies[j] >= kids[i]) i++
  }
  return i
}
console.log(findContentChildren([2, 10, 1], [3, 2]))`,
      output: `2`,
    },
  },
]

// ---------------------------------------------------------------------------
// Flashcards
// ---------------------------------------------------------------------------

const flashcards: Flashcard[] = [
  // --- graphes ---
  {
    id: 'gr-f-complexite-parcours',
    theme: 'graphes',
    front: 'Complexité de BFS et de DFS sur une liste d’adjacence ?',
    back: `**O(V + E)** en temps : chaque sommet est visité une fois, chaque arête examinée une fois (deux fois en non orienté). **O(V)** en mémoire pour les visités et la file ou la pile. Sur une matrice d'adjacence, O(V²), car lister les voisins coûte O(V).`,
  },
  {
    id: 'gr-f-bfs-plus-court',
    theme: 'graphes',
    front: 'Pourquoi le BFS donne-t-il le plus court chemin dans un graphe non pondéré ?',
    back: `Il explore par couches de distance croissante : tous les sommets à distance k sont défilés avant ceux à distance k + 1. La première fois qu'un sommet est atteint, c'est donc par un chemin de longueur minimale. Ce n'est plus vrai si les arêtes ont des poids différents (Dijkstra).`,
  },
  {
    id: 'gr-f-file-js',
    theme: 'graphes',
    front: 'Comment implémenter une file efficace pour un BFS en JavaScript ?',
    back: `Un tableau et un **index de tête** : \`queue.push(x)\` pour enfiler, \`queue[head++]\` pour défiler, \`head < queue.length\` comme condition. \`shift()\` est en O(n) (il décale tout le tableau) et rend le BFS quadratique sur les grandes entrées.`,
  },
  {
    id: 'gr-f-marquage',
    theme: 'graphes',
    front: 'BFS : à quel moment marquer un sommet comme visité ?',
    back: `**Au moment de l'enfiler.** Sinon, un sommet qui attend dans la file peut être ajouté à nouveau par chaque voisin traité entre-temps : la file grossit jusqu'à O(E) et les distances peuvent même devenir fausses.`,
  },
  {
    id: 'gr-f-pile-dfs',
    theme: 'graphes',
    front: 'Quand préférer un DFS itératif à un DFS récursif ?',
    back: `Dès que la profondeur peut dépasser quelques milliers de niveaux : longue chaîne, grille de 500 × 500, arbre dégénéré. La pile d'appels JavaScript déborde vers 10⁴ niveaux (\`RangeError: Maximum call stack size exceeded\`) ; une pile explicite (tableau) n'est limitée que par la mémoire.`,
  },
  {
    id: 'gr-f-trois-couleurs',
    theme: 'graphes',
    front: 'Comment détecter un cycle dans un graphe orienté ?',
    back: `DFS à **trois couleurs** : blanc (non vu), gris (en cours, sur la pile), noir (terminé). Un voisin **gris** signale une arête arrière, donc un cycle. Autre méthode : Kahn ; s'il ne place pas les n sommets, il reste un cycle. Un simple « visité » ne suffit pas (faux positif sur un losange).`,
  },
  {
    id: 'gr-f-kahn',
    theme: 'graphes',
    front: 'Les étapes de l’algorithme de Kahn (tri topologique) ?',
    back: `- calculer le degré entrant de chaque sommet ;
- enfiler tous les sommets de degré 0 ;
- défiler u, l'ajouter à l'ordre, décrémenter le degré de chaque successeur et enfiler ceux qui tombent à 0 ;
- si l'ordre contient moins de n sommets, le graphe a un cycle.

O(V + E).`,
  },
  {
    id: 'gr-f-dijkstra-perime',
    theme: 'graphes',
    front: 'Dijkstra avec un tas sans « decrease-key » : que faire des doublons dans le tas ?',
    back: `On réinsère le sommet à chaque amélioration (suppression paresseuse), et à l'extraction on **ignore les entrées périmées** : \`if (d > dist[u]) continue\`. Le tas contient au plus O(E) entrées, la complexité reste O((V + E) log V).`,
  },
  {
    id: 'gr-f-union-find',
    theme: 'graphes',
    front: 'Les deux optimisations d’union-find et leur effet ?',
    back: `**Compression de chemin** (\`find\` rattache chaque nœud traversé à la racine) et **union par taille ou par rang** (le petit arbre sous le grand). Ensemble, elles donnent O(α(n)) amorti par opération, quasi constant. Sans elles, un \`find\` peut coûter O(n).`,
  },
  {
    id: 'gr-f-dijkstra-negatif',
    theme: 'graphes',
    front: 'Que faire si le graphe a des poids négatifs ?',
    back: `Dijkstra peut se tromper (un sommet finalisé pourrait encore être amélioré). Utiliser **Bellman-Ford** en O(V × E) : V − 1 passes de relaxation de toutes les arêtes ; une amélioration à la V-ième passe révèle un cycle négatif. Pour des poids 0 ou 1 seulement : BFS 0-1 avec une deque.`,
  },

  // --- glouton ---
  {
    id: 'gr-f-glouton-principe',
    theme: 'glouton',
    front: 'Qu’est-ce qu’un algorithme glouton, et quand est-il correct ?',
    back: `Il fait à chaque étape le meilleur choix **local** sans jamais revenir en arrière. Il est correct si le problème a la **propriété du choix glouton** (une solution optimale commence par ce choix) et une **sous-structure optimale**. On le prouve par un argument d'échange.`,
  },
  {
    id: 'gr-f-contre-exemple',
    theme: 'glouton',
    front: 'Le contre-exemple classique du rendu de monnaie glouton ?',
    back: `Pièces {1, 3, 4}, montant 6 : le glouton donne 4 + 1 + 1 (3 pièces), l'optimum est 3 + 3 (2 pièces). Le glouton n'est optimal que pour les systèmes **canoniques** (euros, dollars) ; sinon, programmation dynamique.`,
  },
  {
    id: 'gr-f-intervalles',
    theme: 'glouton',
    front: 'Maximum d’intervalles disjoints : quel tri, quelle règle ?',
    back: `Trier par **fin croissante**, puis garder chaque intervalle qui commence après (ou à) la fin du dernier gardé. O(n log n). Trier par début ou par durée donne des contre-exemples. Le minimum d'intervalles à supprimer vaut n moins ce maximum.`,
  },
  {
    id: 'gr-f-salles',
    theme: 'glouton',
    front: 'Nombre minimal de salles de réunion : deux méthodes ?',
    back: `- **Tas** : trier par début, tas min des fins ; si la plus petite fin ≤ début, on réutilise la salle (retirer du tas) ; ajouter la fin courante. Réponse : taille du tas.
- **Balayage** : trier débuts et fins séparément ; un début avant la fin pointée exige une salle de plus, sinon on avance le pointeur des fins.

Les deux en O(n log n).`,
  },
  {
    id: 'gr-f-jump-game',
    theme: 'glouton',
    front: 'Jump game (peut-on atteindre la fin ?) en O(n) ?',
    back: `Maintenir la **portée maximale** \`reach\`. Pour chaque i : si \`i > reach\`, la case est inaccessible, renvoyer \`false\` ; sinon \`reach = max(reach, i + nums[i])\`. Pour le nombre minimal de sauts : fenêtres \`[début, fin]\` façon BFS.`,
  },
  {
    id: 'gr-f-glouton-vs-dp',
    theme: 'glouton',
    front: 'Glouton ou programmation dynamique : comment choisir ?',
    back: `Si un argument d'échange justifie le choix local et qu'aucun petit contre-exemple n'existe : glouton (plus simple, souvent O(n log n)). Si un choix local peut fermer la porte à une meilleure suite (sac à dos 0/1, pièces arbitraires, activités pondérées) : DP, qui essaie toutes les décisions.`,
  },
]

// ---------------------------------------------------------------------------
// Lexique
// ---------------------------------------------------------------------------

const lexique: LexiqueEntry[] = [
  {
    term: 'Liste d’adjacence',
    theme: 'graphes',
    def: `Représentation d'un graphe où chaque sommet est associé à la liste de ses voisins (tableau de tableaux ou \`Map\`). Mémoire O(V + E), parcours des voisins en O(degré). C'est la représentation par défaut pour BFS, DFS et Dijkstra.`,
    see: ['Composante connexe'],
  },
  {
    term: 'Composante connexe',
    theme: 'graphes',
    def: `Ensemble maximal de sommets d'un graphe non orienté tous reliés entre eux par des chemins. On les compte en lançant un parcours depuis chaque sommet non visité, ou avec union-find. Une île dans une grille est une composante connexe.`,
    see: ['Union-find', 'Liste d’adjacence'],
  },
  {
    term: 'Degré entrant',
    theme: 'graphes',
    def: `Nombre d'arêtes qui arrivent sur un sommet d'un graphe orienté. Les sommets de degré entrant nul n'ont aucun prérequis : c'est par eux que commence l'algorithme de Kahn.`,
    see: ['Tri topologique'],
  },
  {
    term: 'Tri topologique',
    theme: 'graphes',
    def: `Ordre des sommets d'un graphe orienté acyclique (DAG) tel que chaque arête u → v place u avant v. Il existe seulement s'il n'y a pas de cycle, et il n'est en général pas unique. Algorithmes : Kahn (degrés entrants) ou DFS (post-ordre inversé), en O(V + E).`,
    see: ['Degré entrant'],
  },
  {
    term: 'Relaxation',
    theme: 'graphes',
    def: `Opération de base des plus courts chemins pondérés : pour une arête u → v de poids w, si \`dist[u] + w < dist[v]\`, on met à jour \`dist[v]\`. Dijkstra relâche les arêtes dans l'ordre des distances croissantes ; Bellman-Ford relâche toutes les arêtes V − 1 fois.`,
  },
  {
    term: 'Union-find',
    theme: 'graphes',
    def: `Structure (aussi appelée DSU, *disjoint set union*) qui maintient une partition en ensembles disjoints avec \`find\` (représentant d'un élément) et \`union\` (fusion de deux ensembles). Avec compression de chemin et union par taille, chaque opération coûte O(α(n)) amorti. Sert aux composantes dynamiques, à la détection de cycle et à Kruskal.`,
    see: ['Composante connexe', 'Arbre couvrant minimal'],
  },
  {
    term: 'Graphe biparti',
    theme: 'graphes',
    def: `Graphe dont les sommets se répartissent en deux groupes tels que chaque arête relie deux groupes différents. Équivaut à l'absence de cycle de longueur impaire ; se teste par 2-coloration (BFS ou DFS) en O(V + E).`,
  },
  {
    term: 'Arbre couvrant minimal',
    theme: 'graphes',
    def: `Sous-ensemble de V − 1 arêtes d'un graphe non orienté connexe qui relie tous les sommets avec un poids total minimal (MST). Calculé par les algorithmes gloutons de Kruskal (tri des arêtes + union-find) ou de Prim (tas), en O(E log E).`,
    see: ['Union-find', 'Argument d’échange'],
  },
  {
    term: 'Argument d’échange',
    theme: 'glouton',
    def: `Technique de preuve des algorithmes gloutons : on prend une solution optimale qui ne fait pas le choix glouton, et l'on montre qu'on peut échanger un de ses éléments contre le choix glouton sans la dégrader. Par récurrence, la solution gloutonne est optimale.`,
    see: ['Propriété du choix glouton'],
  },
  {
    term: 'Propriété du choix glouton',
    theme: 'glouton',
    def: `Un problème la possède s'il existe toujours une solution optimale qui commence par le choix localement le meilleur. Avec la sous-structure optimale, elle garantit qu'un glouton est correct.`,
    see: ['Argument d’échange'],
  },
  {
    term: 'Système de pièces canonique',
    theme: 'glouton',
    def: `Système de pièces pour lequel le rendu de monnaie glouton (toujours la plus grosse pièce possible) est optimal, comme les euros. Le système {1, 3, 4} n'est pas canonique : pour 6, le glouton donne 4 + 1 + 1 au lieu de 3 + 3.`,
  },
  {
    term: 'Sélection d’activités',
    theme: 'glouton',
    def: `Problème qui consiste à choisir le plus grand nombre d'intervalles deux à deux disjoints. Solution gloutonne : trier par fin croissante et garder chaque intervalle compatible avec le dernier retenu, en O(n log n).`,
    see: ['Argument d’échange'],
  },
]

// ---------------------------------------------------------------------------
// Entretien
// ---------------------------------------------------------------------------

const entretien: EntretienQ[] = [
  // --- graphes ---
  {
    id: 'gr-e-bfs-dfs',
    section: 'techniques',
    q: 'Quand choisissez-vous un BFS plutôt qu’un DFS ?',
    answer: `**BFS** quand la question porte sur une **distance minimale** dans un graphe non pondéré (nombre minimal d'étapes, de transformations, de coups), sur un traitement par niveaux, ou sur une propagation simultanée (BFS multi-sources). Il garantit qu'un sommet est atteint la première fois par un plus court chemin.

**DFS** pour l'**exploration complète** : composantes connexes, détection de cycle, tri topologique, existence d'un chemin, backtracking. Il est souvent plus court à écrire en récursif.

Pour compter des composantes, les deux conviennent. Dans les deux cas, O(V + E). Je précise aussi les détails d'implémentation en JavaScript : file avec index de tête (pas de \`shift()\`), DFS itératif dès que la profondeur peut dépasser quelques milliers.`,
    attendu: 'Associer BFS au plus court chemin non pondéré, DFS à l’exploration ; citer O(V + E) et les pièges d’implémentation (file, pile).',
  },
  {
    id: 'gr-e-dijkstra-complexite',
    section: 'complexite',
    q: 'Quelle est la complexité de Dijkstra, et d’où vient-elle ?',
    answer: `Avec un **tas binaire** et la suppression paresseuse : **O((V + E) log V)**. Chaque relaxation réussie fait un \`push\` en O(log V) (au plus E fois), chaque extraction un \`pop\` en O(log V) (au plus E entrées, dont les périmées qu'on ignore) ; log E = O(log V) car E ≤ V².

Avec un simple **tableau** (recherche linéaire du minimum) : O(V² + E), préférable pour un graphe très dense. Avec un tas de Fibonacci : O(E + V log V), surtout théorique.

Prérequis : poids **positifs ou nuls**. Avec des poids négatifs, Bellman-Ford en O(V × E).`,
    attendu: 'O((V + E) log V) avec tas, justification par les opérations du tas, variante O(V²), condition des poids positifs.',
  },
  {
    id: 'gr-e-modeliser',
    section: 'conception',
    q: 'On vous donne une liste de vols (départ, arrivée, prix) et on demande le trajet le moins cher avec au plus K escales. Comment l’abordez-vous ?',
    answer: `D'abord **modéliser** : villes = sommets, vols = arêtes orientées pondérées par le prix. La contrainte « au plus K escales » limite le nombre d'arêtes, ce qui casse l'hypothèse de Dijkstra classique (un chemin plus cher mais plus court en escales peut être nécessaire).

Deux approches :

- **Bellman-Ford limité** : K + 1 passes de relaxation, chaque passe partant d'une **copie** des distances de la passe précédente (sinon une passe pourrait enchaîner plusieurs vols). O(K × E).
- **Dijkstra sur un état étendu** \`(ville, escales utilisées)\` : on ne pousse un voisin que si l'on reste sous K + 1 vols. O(K × E × log(K × V)).

Je vérifie les cas limites (source = destination, destination inaccessible : -1) et j'estime les tailles pour choisir.`,
    attendu: 'Modélisation en graphe, compréhension de pourquoi Dijkstra simple ne suffit pas, Bellman-Ford à K + 1 passes avec copie, cas limites.',
  },
  // --- glouton ---
  {
    id: 'gr-e-justifier-glouton',
    section: 'techniques',
    q: 'Vous proposez une solution gloutonne. Comment convainquez-vous le recruteur qu’elle est correcte ?',
    answer: `Je donne un **argument d'échange** : je prends une solution optimale quelconque ; si son premier choix diffère du choix glouton, je montre qu'on peut le remplacer par le choix glouton sans la dégrader (même nombre d'éléments, coût inférieur ou égal, contraintes respectées). Par récurrence sur le sous-problème restant, la solution gloutonne est optimale.

Exemple pour la sélection d'activités : l'activité qui finit le plus tôt finit au plus tard comme la première activité de toute solution optimale, donc l'échange ne crée aucun chevauchement.

Je montre aussi que j'ai cherché un **contre-exemple** : je teste mentalement deux ou trois petits cas tordus (égalités, ordre inverse, valeurs nulles). Si j'en trouve un, je bascule vers la programmation dynamique.`,
    attendu: 'Argument d’échange formulé clairement, exemple concret, réflexe du contre-exemple.',
  },
  {
    id: 'gr-e-glouton-complexite',
    section: 'complexite',
    q: 'Pourquoi tant d’algorithmes gloutons sont-ils en O(n log n) ?',
    answer: `Parce qu'ils commencent presque toujours par **trier** selon le critère glouton (fin des intervalles, taille, échéance, ratio), en O(n log n), puis font **une seule passe** où chaque élément est pris ou rejeté en O(1) : O(n). Le tri domine.

Quand le meilleur choix change au fil du temps (salles de réunion, Huffman, tâches avec échéances), on remplace ou complète le tri par un **tas** : n opérations en O(log n), toujours O(n log n).

Certains gloutons évitent même le tri et tournent en O(n) : jump game (portée maximale), gas station (réservoir réinitialisé), partition labels (dernière occurrence).`,
    attendu: 'Tri + passe linéaire, rôle du tas, exemples de gloutons linéaires.',
  },
  {
    id: 'gr-e-glouton-structures',
    section: 'structures',
    q: 'Quelles structures de données accompagnent typiquement un algorithme glouton ?',
    answer: `- Un **tableau trié** : la plupart des gloutons sur intervalles ou sur affectations (cookies, bateaux) se contentent d'un tri et de deux pointeurs.
- Un **tas** (file de priorité) quand le meilleur candidat évolue : salles de réunion (tas des fins), Huffman (les deux fréquences minimales), Dijkstra et Prim (sommet le plus proche), « IPO » ou ravitaillements (tas max des options débloquées).
- **Union-find** pour Kruskal : savoir en temps quasi constant si une arête relierait deux composantes déjà connectées.
- Une **table de hachage** pour des précalculs (dernière occurrence de chaque lettre dans partition labels).

En JavaScript, il n'y a pas de tas natif : je dis que je vais en écrire un de vingt lignes, ou je demande si je peux le supposer disponible.`,
    attendu: 'Tri, tas, union-find, table de hachage, avec un exemple chacun ; mention de l’absence de tas en JS.',
  },
]

// ---------------------------------------------------------------------------

export const pack: ThemePack = {
  cours: [coursGraphes, coursGlouton],
  katas: [...katasGraphes, ...katasGlouton],
  quiz,
  pieges,
  flashcards,
  lexique,
  entretien,
}
