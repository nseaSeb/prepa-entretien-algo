import type { ReactNode } from 'react'
import { Callout, Card, Code, H2, P, PageHeader, C } from '../components/ui'
import { useNav } from '../lib/nav'
import type { ThemeId } from '../data/types'

const TOC: [string, string][] = [
  ['evalue', '1. Ce qui est évalué'],
  ['etapes', '2. Les sept étapes d’un exercice'],
  ['clarifier', '3. Clarifier l’énoncé'],
  ['contraintes', '4. Les contraintes donnent l’algorithme'],
  ['motifs', '5. Reconnaître le motif'],
  ['optimiser', '6. Passer de la force brute à l’optimal'],
  ['coder', '7. Coder proprement en JavaScript'],
  ['tester', '8. Tester à la main'],
  ['bloque', '9. Quand on bloque'],
  ['temps', '10. Gérer les 45 minutes'],
]

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{n}</span>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </li>
  )
}

function Say({ children }: { children: ReactNode }) {
  return <blockquote className="my-2 border-l-4 border-indigo-400 bg-indigo-50/60 px-4 py-2 text-[15px] text-slate-800 italic dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-slate-200">« {children} »</blockquote>
}

/** Signal dans l'énoncé → technique, avec lien vers la section du cours. */
const SIGNALS: [string, string, ThemeId][] = [
  ['« trouver une paire / un complément », « déjà vu ? », compter des occurrences', 'Table de hachage (Map, Set)', 'hachage'],
  ['tableau trié, « paire de somme k », « supprimer en place », palindrome', 'Deux pointeurs', 'tableaux'],
  ['« somme d’un sous-tableau », requêtes répétées sur des intervalles', 'Sommes préfixes', 'tableaux'],
  ['« plus long / plus court sous-tableau (ou sous-chaîne) contigu tel que… »', 'Fenêtre glissante', 'fenetre'],
  ['parenthèses, imbrication, « prochain plus grand élément », annuler', 'Pile, pile monotone', 'piles'],
  ['tableau trié, « minimiser le maximum », réponse monotone, n jusqu’à 10⁹', 'Recherche dichotomique', 'recherche'],
  ['« tous les sous-ensembles / permutations / combinaisons », n ≤ 20', 'Backtracking', 'recursion'],
  ['« k plus grands », « k plus proches », flux de données, médiane', 'Tas (file de priorité)', 'tas'],
  ['arbre : hauteur, chemin, ancêtre commun, niveaux', 'DFS récursif, BFS par niveaux', 'arbres'],
  ['grille, réseau, dépendances, « plus court chemin », « nombre de groupes »', 'BFS, DFS, tri topologique, union-find, Dijkstra', 'graphes'],
  ['intervalles, planning, « nombre minimal de… » avec choix évident', 'Glouton (souvent après un tri)', 'glouton'],
  ['« nombre de façons », « minimum / maximum de… », choix qui se recoupent', 'Programmation dynamique', 'dp'],
  ['« élément unique », sous-ensembles d’un petit ensemble, puissances de 2', 'Manipulation de bits', 'bits'],
]

export default function Method() {
  const { go } = useNav()
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Méthode : aborder un exercice d’algorithmique"
        subtitle="En entretien, trouver la solution ne suffit pas : on évalue la façon dont tu comprends le problème, choisis une approche, la justifies, la codes proprement et la vérifies. Cette page donne une méthode reproductible, à appliquer sur chaque kata jusqu’à ce qu’elle devienne un réflexe."
      />

      <Card className="mb-8">
        <div className="mb-2 text-sm font-semibold text-slate-500">Sommaire</div>
        <div className="grid gap-1 sm:grid-cols-2">
          {TOC.map(([id, label]) => (
            <button key={id} onClick={() => go('methode', id)} className="text-left text-sm text-indigo-700 hover:underline dark:text-indigo-300">
              {label}
            </button>
          ))}
        </div>
      </Card>

      <H2 id="evalue">1. Ce qui est évalué</H2>
      <P>
        La plupart des entreprises notent un exercice d’algorithmique sur quatre axes, souvent avec le même poids. Un candidat qui trouve la solution optimale en silence, sans tester, obtient rarement une meilleure note qu’un candidat qui livre une solution un peu moins efficace mais parfaitement expliquée et vérifiée.
      </P>
      <div className="my-4 grid gap-3 sm:grid-cols-2">
        {[
          ['Communication', 'Tu reformules, tu poses des questions, tu annonces ton plan et tu commentes tes choix. On comprend ce que tu fais à chaque instant.'],
          ['Résolution de problème', 'Tu pars d’exemples, tu proposes une approche simple puis tu l’améliores, en justifiant pourquoi elle est correcte.'],
          ['Code', 'Le code est lisible, découpé, avec des noms clairs ; il compile et gère les cas limites sans rustines.'],
          ['Vérification', 'Tu testes toi-même, à la main, sur un exemple normal puis sur les cas limites, et tu trouves tes propres bugs.'],
        ].map(([t, d]) => (
          <Card key={t}>
            <div className="font-semibold">{t}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</div>
          </Card>
        ))}
      </div>

      <H2 id="etapes">2. Les sept étapes d’un exercice</H2>
      <ol className="my-4 space-y-4">
        <Step n={1} title="Comprendre">Reformule l’énoncé avec tes mots. Précise les entrées, la sortie attendue et les contraintes (taille, bornes des valeurs, cas impossibles).</Step>
        <Step n={2} title="Exemples">Écris un exemple normal et calcule le résultat à la main, puis un ou deux cas limites. Fais-les valider : ce sont tes premiers tests.</Step>
        <Step n={3} title="Force brute">Énonce la solution la plus simple qui marche et sa complexité, même si elle est lente. Elle sert de filet de sécurité et de point de départ.</Step>
        <Step n={4} title="Optimiser">Cherche le goulot d’étranglement de la force brute et la structure ou le motif qui le supprime. Annonce la nouvelle complexité avant de coder.</Step>
        <Step n={5} title="Coder">Écris la solution choisie, proprement, en commentant à voix haute les choix importants (et pas chaque ligne).</Step>
        <Step n={6} title="Tester">Déroule le code sur ton exemple en suivant les variables, puis sur les cas limites. Corrige calmement ce que tu trouves.</Step>
        <Step n={7} title="Complexité et suites">Donne la complexité en temps et en mémoire de ce que tu as écrit, puis évoque les variantes : données en flux, mémoire limitée, entrée gigantesque.</Step>
      </ol>
      <Say>Je reformule : je reçois un tableau d’entiers non trié, éventuellement avec des négatifs, et je renvoie les indices de deux éléments dont la somme vaut la cible. La version naïve teste toutes les paires, en O(n²). On peut faire mieux : en mémorisant les valeurs déjà vues dans une Map, chaque complément se cherche en O(1), donc O(n) au total, pour O(n) en mémoire.</Say>

      <H2 id="clarifier">3. Clarifier l’énoncé</H2>
      <P>
        Un énoncé d’entretien est volontairement incomplet. Les questions que tu poses montrent ton expérience, et leurs réponses changent souvent l’algorithme : un tableau trié appelle une dichotomie ou deux pointeurs, l’absence de valeurs négatives autorise une fenêtre glissante.
      </P>
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px]">
        <li>Quelle est la taille maximale de l’entrée ? Quelles sont les bornes des valeurs (négatives, zéro, très grandes) ?</li>
        <li>L’entrée est-elle triée ? Peut-elle contenir des doublons ? Peut-elle être vide ?</li>
        <li>Faut-il modifier l’entrée en place, ou la laisser intacte ?</li>
        <li>S’il y a plusieurs réponses, laquelle renvoyer ? S’il n’y en a aucune, que renvoyer ?</li>
        <li>Le résultat doit-il être dans un ordre particulier ?</li>
        <li>Y a-t-il une contrainte de mémoire (O(1) supplémentaire) ?</li>
      </ul>

      <H2 id="contraintes">4. Les contraintes donnent l’algorithme</H2>
      <P>
        Un ordinateur fait de l’ordre de 10⁸ opérations simples par seconde. Les contraintes de taille indiquent donc la complexité visée, et souvent la famille d’algorithmes attendue. C’est l’un des meilleurs indices disponibles : ne l’ignore jamais.
      </P>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left dark:border-slate-700">
              <th className="py-2 pr-4">Taille n</th>
              <th className="py-2 pr-4">Complexité visée</th>
              <th className="py-2">Techniques typiques</th>
            </tr>
          </thead>
          <tbody className="[&_td]:py-1.5 [&_td]:pr-4 [&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-800">
            <tr><td>n ≤ 10</td><td>O(n!)</td><td>permutations, backtracking complet</td></tr>
            <tr><td>n ≤ 20</td><td>O(2ⁿ)</td><td>sous-ensembles, masques de bits, backtracking</td></tr>
            <tr><td>n ≤ 500</td><td>O(n³)</td><td>DP sur intervalles, Floyd-Warshall</td></tr>
            <tr><td>n ≤ 5 000</td><td>O(n²)</td><td>double boucle, DP 2D</td></tr>
            <tr><td>n ≤ 10⁶</td><td>O(n log n) ou O(n)</td><td>tri, tas, dichotomie, hachage, deux pointeurs, fenêtre</td></tr>
            <tr><td>n ≥ 10⁹</td><td>O(log n) ou O(1)</td><td>dichotomie sur la réponse, mathématiques</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="motifs">5. Reconnaître le motif</H2>
      <P>
        La grande majorité des exercices reposent sur une quinzaine de motifs. Le travail consiste à repérer, dans l’énoncé, le signal qui désigne le bon. Clique sur une technique pour ouvrir la section correspondante du cours.
      </P>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left dark:border-slate-700">
              <th className="py-2 pr-4">Signal dans l’énoncé</th>
              <th className="py-2">Technique</th>
            </tr>
          </thead>
          <tbody>
            {SIGNALS.map(([signal, tech, theme]) => (
              <tr key={signal} className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-1.5 pr-4">{signal}</td>
                <td className="py-1.5">
                  <button className="text-left font-medium text-indigo-700 hover:underline dark:text-indigo-300" onClick={() => go('cours', theme)}>
                    {tech}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="optimiser">6. Passer de la force brute à l’optimal</H2>
      <P>
        Une fois la force brute énoncée, trois questions guident l’optimisation. Où est le <strong>goulot d’étranglement</strong> (la boucle la plus coûteuse) ? Quel <strong>travail inutile</strong> fait-on (des cas qu’on pourrait écarter) ? Quel <strong>travail répété</strong> fait-on (un même calcul refait plusieurs fois) ?
      </P>
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px]">
        <li><strong>Une recherche dans une boucle</strong> : remplace-la par une <C>Map</C> ou un <C>Set</C> (O(n) devient O(1)), ou trie d’abord pour pouvoir chercher par dichotomie.</li>
        <li><strong>Une somme recalculée</strong> sur des intervalles qui se chevauchent : sommes préfixes ou fenêtre glissante.</li>
        <li><strong>Un sous-problème recalculé</strong> dans une récursion : mémoïsation, puis programmation dynamique.</li>
        <li><strong>Un minimum ou maximum recherché à chaque étape</strong> : un tas, ou une pile / file monotone.</li>
        <li><strong>Échanger de la mémoire contre du temps</strong> est presque toujours accepté ; dis-le explicitement.</li>
      </ul>
      <Code
        title="La même question, trois complexités"
        code={`// Existe-t-il deux éléments distincts dont la somme vaut k ?
function bruteForce(nums, k) { // O(n²) en temps, O(1) en mémoire
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === k) return true
  return false
}

function sortedTwoPointers(nums, k) { // O(n log n) en temps, O(n) pour la copie
  const a = [...nums].sort((x, y) => x - y)
  let lo = 0
  let hi = a.length - 1
  while (lo < hi) {
    const s = a[lo] + a[hi]
    if (s === k) return true
    if (s < k) lo++
    else hi--
  }
  return false
}

function withSet(nums, k) { // O(n) en temps, O(n) en mémoire
  const seen = new Set()
  for (const x of nums) {
    if (seen.has(k - x)) return true
    seen.add(x)
  }
  return false
}

const nums = [8, 3, -2, 11, 5]
console.log(bruteForce(nums, 9), sortedTwoPointers(nums, 9), withSet(nums, 9))
console.log(bruteForce(nums, 4), sortedTwoPointers(nums, 4), withSet(nums, 4))`}
        output={`true true true
false false false`}
      />

      <H2 id="coder">7. Coder proprement en JavaScript</H2>
      <P>
        JavaScript est un bon langage d’entretien, à condition de connaître ses pièges et ce qui lui manque. Annonce les petites fonctions utilitaires dont tu as besoin plutôt que de tout écrire dans une seule boucle.
      </P>
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px]">
        <li><C>arr.sort()</C> sans comparateur trie <strong>comme des chaînes</strong> : <C>[10, 9, 1].sort()</C> donne <C>[1, 10, 9]</C>. Toujours écrire <C>{'sort((a, b) => a - b)'}</C> pour des nombres.</li>
        <li><C>shift()</C> et <C>unshift()</C> sont en O(n) : une file de BFS se gère avec un tableau et un index de tête.</li>
        <li>Pas de tas ni de file de priorité natifs : sache écrire un tas binaire en dix minutes, ou demande si tu peux supposer qu’il existe.</li>
        <li><C>new Array(n).fill([])</C> partage <strong>le même</strong> tableau dans chaque case : utilise <C>{'Array.from({ length: n }, () => [])'}</C>.</li>
        <li>Les opérateurs bit à bit travaillent sur 32 bits signés, et les entiers ne sont exacts que jusqu’à 2⁵³ − 1 : au-delà, <C>BigInt</C>.</li>
        <li>Une récursion de plus de quelques milliers de niveaux dépasse la pile : prévois une version itérative pour les grandes profondeurs.</li>
        <li>Des noms qui disent le rôle (<C>left</C>, <C>right</C>, <C>seen</C>, <C>best</C>, <C>dist</C>) valent mieux que <C>i</C>, <C>j</C>, <C>tmp</C> dès que la logique se complique.</li>
      </ul>
      <Callout tone="info" title="Équivalents dans d’autres langages">
        Le cours montre parfois, en onglet, la même idée en Python, Java, Rust, PHP ou Bash. C’est utile si l’entretien se passe dans un autre langage : <C>heapq</C>, <C>PriorityQueue</C> ou <C>BinaryHeap</C> remplacent le tas écrit à la main, <C>deque</C> ou <C>ArrayDeque</C> remplacent la file avec index.
      </Callout>

      <H2 id="tester">8. Tester à la main</H2>
      <P>
        Avant de dire « j’ai fini », déroule ton code sur ton exemple, ligne par ligne, en notant la valeur des variables importantes à chaque tour de boucle. C’est là que se trouvent la plupart des erreurs d’indice. Ensuite, passe en revue les cas limites.
      </P>
      <div className="my-4 grid gap-3 sm:grid-cols-2">
        {[
          ['Tailles', 'entrée vide, un seul élément, deux éléments, taille maximale'],
          ['Valeurs', 'négatifs, zéro, doublons, tous identiques, valeurs extrêmes (débordement)'],
          ['Ordre', 'déjà trié, trié à l’envers, la réponse au tout début ou à la toute fin'],
          ['Structures', 'arbre vide ou dégénéré en liste, graphe non connexe, cycle, grille d’une ligne'],
        ].map(([t, d]) => (
          <Card key={t}>
            <div className="font-semibold">{t}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</div>
          </Card>
        ))}
      </div>
      <Callout tone="warn" title="Les bugs les plus fréquents">
        Bornes de boucle (<C>&lt;</C> ou <C>&lt;=</C>), mise à jour du pointeur oubliée (boucle infinie), réponse calculée avant la dernière mise à jour, état non réinitialisé entre deux itérations, chemin partagé au lieu d’une copie en backtracking.
      </Callout>

      <H2 id="bloque">9. Quand on bloque</H2>
      <P>
        Dis où tu en es et ce qui te bloque précisément. Puis repars d’un exemple plus petit et résous-le à la main en observant ce que tu fais : le motif apparaît souvent. Demande-toi quelle structure de données rendrait l’opération coûteuse instantanée, et si trier l’entrée simplifierait le problème.
      </P>
      <P>
        Un indice du recruteur n’est pas un échec : le saisir et l’exploiter montre ta capacité à travailler en équipe. Ce qui est mal perçu, c’est de s’obstiner en silence ou de coder au hasard en espérant que ça passe.
      </P>
      <Say>Je bloque sur la façon de savoir rapidement si un intervalle chevauche les précédents. Si je triais les intervalles par début, il suffirait de comparer avec le dernier gardé. Je pars là-dessus.</Say>

      <H2 id="temps">10. Gérer les 45 minutes</H2>
      <P>Un entretien typique laisse 35 à 40 minutes pour l’exercice. Un découpage indicatif :</P>
      <ul className="my-3 list-disc space-y-1 pl-6 text-[15px]">
        <li><strong>5 minutes</strong> : comprendre, questions, exemples.</li>
        <li><strong>5 à 10 minutes</strong> : force brute, puis approche optimisée annoncée avec sa complexité.</li>
        <li><strong>15 à 20 minutes</strong> : code.</li>
        <li><strong>5 minutes</strong> : test à la main et corrections.</li>
        <li><strong>Le reste</strong> : complexité, variantes, questions de suivi.</li>
      </ul>
      <Callout tone="tip" title="Entraîne-toi en conditions réelles">
        Sur les <button className="font-semibold underline" onClick={() => go('katas')}>katas</button>, lance un chronomètre (20 minutes pour un « facile », 30 pour un « moyen »), parle à voix haute même seul, et ne regarde les indices qu’après dix minutes de blocage. Le <button className="font-semibold underline" onClick={() => go('visualiseur')}>visualiseur</button> aide à se représenter les algorithmes classiques avant de les écrire.
      </Callout>
    </div>
  )
}
