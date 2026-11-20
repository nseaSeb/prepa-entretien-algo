# Prépa entretien Algorithmique

[![CI](https://github.com/nseaSeb/prepa-entretien-algo/actions/workflows/ci.yml/badge.svg)](https://github.com/nseaSeb/prepa-entretien-algo/actions/workflows/ci.yml)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

Application web pour préparer un entretien d’algorithmique (live coding type LeetCode) : cours par
motif, katas corrigés automatiquement, visualiseur pas à pas, quiz, pièges, flashcards, lexique et
questions d’entretien. Tout le contenu est en français et **vérifié par des tests** : chaque sortie
affichée, chaque réponse de quiz « qu’affiche ce code ? » et chaque solution de kata est rejouée
automatiquement.

Le code est en **JavaScript** (exécuté et vérifié). Quand cela éclaire l’idée, le cours et les
solutions des katas montrent en onglet l’équivalent en **Python, Java, Rust, PHP** et parfois
**Bash** : ces équivalents sont indicatifs et ne sont pas exécutés (pour les essayer, utiliser le
playground du training du langage concerné).

Frontend uniquement, sans backend ni compte : la progression est stockée dans le `localStorage`
du navigateur.

## Fonctionnalités

- **Cours** en seize thèmes, dans l’ordre conseillé : complexité et Big O ; tableaux, deux pointeurs
  et sommes préfixes ; tables de hachage ; fenêtre glissante ; piles, files et pile monotone ;
  recherche dichotomique ; tris ; récursion et backtracking ; listes chaînées ; arbres, BST et trie ;
  tas et file de priorité ; graphes (BFS, DFS, tri topologique, Dijkstra, union-find) ; gloutons ;
  programmation dynamique ; bits et mathématiques ; chaînes de caractères. Ancres `#cours/<thème>`
  et `#cours/<thème>-<sous-partie>` ;
- **Méthode** : les sept étapes d’un exercice, lire les contraintes (taille → complexité visée),
  tableau « signal dans l’énoncé → technique », pièges propres à JavaScript, gestion du temps ;
- **Katas** classés par thème et étiquetés par motif, avec tests cachés (dont des « grandes
  entrées » qu’une solution naïve ne passe pas à temps), indices progressifs, solution de référence,
  équivalents dans d’autres langages et discussion (complexité, variantes, questions de suivi) ;
- **Visualiseur** : tris (bulles, sélection, insertion, fusion, rapide), recherche dichotomique,
  BFS et DFS sur une grille éditable, pas à pas avec lecture automatique ;
- **Auto-évaluation** : QCM, « qu’affiche ce code ? », « quelle complexité ? », « trouve le bug » ;
- **Pièges** d’implémentation (bornes, `sort()` lexicographique, `shift()` en O(n), références
  partagées, entiers au-delà de 2⁵³, récursion trop profonde…) avec sortie exacte et correction ;
- **Playground** : éditeur CodeMirror et console, exécution dans un Web Worker isolé,
  `performance.now()` disponible pour chronométrer ;
- **Flashcards** avec répétition espacée (système de Leitner), **lexique**, **cheatsheet** (templates
  vérifiés et correspondances entre langages), **questions d’entretien** avec ce que l’interlocuteur
  cherche à vérifier et un espace pour rédiger sa réponse.

## Démarrage rapide

Prérequis : Node.js 20.19 ou plus récent (exigence de Vite 8).

```bash
npm install
npm run dev        # http://localhost:47114
npm test           # vérifie tout le contenu
npm run build      # vérification TypeScript + build de production dans dist/
```

Stack : Vite 8, React 19, TypeScript, Tailwind 4, CodeMirror 6.

## Commandes

```bash
npm run dev        # http://localhost:47114
npm run build      # vérification TypeScript + build de production dans dist/
npm run preview    # sert dist/ sur http://localhost:47114
npm test           # exécute et vérifie tout le contenu
npx tsx scripts/run-snippet.ts fichier.js   # sortie exacte d'un extrait, comme les tests
```

## Structure

```
src/
  App.tsx                 navigation latérale + routage par hash (#page/ancre)
  lib/
    nav.tsx, storage.ts   contexte de navigation, useStored (localStorage)
    highlight.ts          coloration JS (lezer) et coloration légère des équivalents
    visual.ts             générateurs d'étapes du visualiseur (tris, dichotomie, grille)
    sandbox/              bac à sable : worker du navigateur et même cœur sous node:vm pour les tests
    contentCheck.ts       vérification des extraits (tests uniquement)
    *.test.ts             suite `npm test`
  data/
    types.ts              types du contenu et RÈGLES DE VÉRIFICATION (à lire avant d'écrire)
    themes.ts             les seize thèmes et les langages d'équivalents
    packs/                le contenu, par groupe de thèmes (un fichier = un ThemePack)
      fondamentaux.ts     complexité, tableaux, hachage, fenêtre glissante (+ entretien « général »)
      lineaire.ts         piles et files, dichotomie, tris, récursion et backtracking
      hierarchique.ts     listes chaînées, arbres, tas
      graphes.ts          graphes, gloutons
      avance.ts           programmation dynamique, bits, chaînes
    cours.ts katas.ts quiz.ts pieges.ts flashcards.ts lexique.ts entretien.ts
                          agrégation des packs (triés dans l'ordre des thèmes)
    cheatsheet.ts         antisèche
  pages/                  une page par route
  components/             ui (bloc de code avec onglets d'équivalents), éditeur, console, texte enrichi
```

Routes : `#accueil`, `#methode`, `#cours/<theme>`, `#lexique`, `#cheatsheet`, `#pieges`,
`#visualiseur`, `#playground`, `#katas/<id>`, `#quiz`, `#flashcards`, `#entretien`.

## Vérification du contenu (`npm test`)

Les tests rejouent le contenu dans Node avec **le même cœur** que le worker du navigateur :

- chaque question de quiz `output` : la sortie réelle doit être exactement la bonne réponse, et
  aucun autre choix ; le code des questions « complexité » et « bug » doit s’exécuter sans erreur ;
- chaque piège : sortie exacte, et sa correction éventuelle ;
- chaque kata : la solution de référence passe tous les tests cachés, et le code de départ en
  échoue au moins un ;
- chaque extrait du cours, de la cheatsheet, des flashcards, du lexique et de l’entretien : sortie
  exacte s’il affiche quelque chose, valeurs des commentaires `// →` vérifiées, aucune erreur
  inattendue ;
- les équivalents : langage connu, code non vide, aucune affirmation de sortie ;
- le visualiseur : chaque tri aboutit au tableau trié, le BFS trouve le plus court chemin ;
- la structure : identifiants uniques, thèmes valides, une section de cours par thème, ancres
  préfixées, renvois du lexique existants.

Ce qui n’est pas vérifié par machine : la justesse des explications en prose, les réponses des
questions « quelle complexité ? » et les équivalents dans d’autres langages (relus, non exécutés).

## Ajouter du contenu

Lire d’abord l’en-tête de `src/data/types.ts`. Ajouter l’élément dans le pack du thème concerné
(`src/data/packs/`), obtenir la sortie réelle d’un extrait avec `npx tsx scripts/run-snippet.ts`,
puis lancer `npm test`.

**Un kata** :

```ts
{
  id: 'fo-two-sum', title: 'Two Sum', difficulty: 'facile', theme: 'hachage', pattern: 'Map de compléments',
  statement: 'Écrivez `twoSum(nums, target)`…',
  starter: `function twoSum(nums, target) {\n  return null\n}`,   // doit échouer à au moins un test
  solution: `function twoSum(nums, target) { … }`,
  solutionEquiv: { python: `def two_sum(nums, target): …`, java: `…` },
  tests: [
    { name: 'exemple', code: `assertEqual(twoSum([2, 7, 11, 15], 9), [0, 1])` },
    { name: 'grande entrée', code: `const t = performance.now(); twoSum(big, -1); assert(performance.now() - t < 1000, 'trop lent')` },
  ],
  hints: ['…'], discussion: '…',
}
```

Les tests sont le corps d’une fonction async exécutée après le code du candidat, avec les aides
`assert`, `assertEqual` (égalité profonde), `assertThrows` et `sleep`.

Attention à l’insertion automatique de points-virgules : une ligne `// →` qui commence par `[` ou
`(` se colle à la ligne précédente. Terminer la ligne précédente par `;`.

## Contribuer

Les corrections et ajouts sont bienvenus : ouvrir une issue ou une pull request. Avant de
proposer du contenu, lire la section « Ajouter du contenu » et vérifier que `npm test` et
`npm run build` passent.

## Licence

Distribué sous licence [MIT](LICENSE).
