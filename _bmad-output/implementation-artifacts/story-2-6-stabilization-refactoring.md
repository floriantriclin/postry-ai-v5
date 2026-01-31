# Story 2.6 : Stabilisation, Refactoring & Fiabilisation

**Parent Epic:** Epic 2 : Conversion & Identité
**Statut:** ✅ **COMPLÉTÉ** (26 Janvier 2026)
**Story Suivante:** [`story-2-7-auth-persistence-simplification.md`](story-2-7-auth-persistence-simplification.md)

## Description

**En tant que** Développeur et Product Owner,
**Je veux** stabiliser le flux de conversion, garantir la persistance des données et fiabiliser les tests,
**Afin de** construire une base solide pour le Dashboard et éviter la perte de données utilisateur.

**Type :** Refactoring / Stability / Security

## Critères d'Acceptation

1.  **Persistance Critique (Data Integrity)** :
    *   L'intégralité des données du post généré (contenu, thème, réponses au quiz, contexte) doit être sauvegardée en base de données (`public.posts`) dès la phase de pré-persistance ou de validation.
    *   Aucune donnée de valeur ne doit rester uniquement en local storage après la conversion.

2.  **Cohérence Post-Magic Link** :
    *   Le post affiché dans le Dashboard après le clic sur le Magic Link doit être **exactement** le même que celui visualisé (flouté) avant l'inscription.
    *   L'intégrité du contenu doit être garantie entre la session anonyme et la session authentifiée.

3.  **Flux UX & Sécurité** :
    *   **Verrouillage du Retour** : Une fois l'email validé (capture effectuée), l'utilisateur ne doit pas pouvoir revenir en arrière vers le post flouté via le bouton "Back" du navigateur.
    *   **Nettoyage** : Les données sensibles stockées localement (localStorage/sessionStorage) doivent être détruites une fois confirmées comme sauvegardées en DB.
    *   **Gestion des Doublons** : Si un email saisi existe déjà et est validé, le système doit gérer le cas élégamment (ex: rattachement du nouveau post ou notification).

4.  **Expérience de Révélation** :
    *   L'effet "Reveal Progressif Dramatique" doit être conforme à l'intention initiale (transition flou -> net fluide et impactante).

5.  **Clarté Sémantique** :
    *   Le code et l'interface doivent distinguer clairement `Thème Quizz` (input utilisateur pour la génération) et `Sujet du Post` (titre/sujet du contenu généré).
    *   Le "Sujet du Post" ne doit plus afficher "Sujet non disponible" dans le reveal du post après le Magic Link (cela indique que le sujet n'a pas été sauvegardé en base, c'est un problème critique de persistance et non d'affichage).

6.  **Qualité & Tests (Fiabilisation)** :
    *   Les tests E2E doivent être refondus selon les recommandations du rapport QA pour être indépendants et résilients (Data Seeding, Smart Auth).

## Notes Techniques / Tâches Détaillées

### 1. Data Persistence & Schema (Critique)
- [x] **Tâche 2.6.1 :** Vérifier et compléter la sauvegarde dans `public.posts` conformément à `../planning-artifacts/architecture/04-modeles-de-donnees.md`.
    - S'assurer que `quiz_answers`, `theme`, et `content` sont correctement mappés.
    - **Documentation :** Mettre à jour [`docs/data-dictionary.md`](../data-dictionary.md) si de nouveaux champs ou statuts sont introduits.
- [x] **Tâche 2.6.2 :** Implémenter la destruction des données locales (localStorage `quiz-storage`, etc.) après confirmation de la sauvegarde en DB (succès de l'appel API `pre-persist` ou hook post-auth).

### 2. Flux d'Authentification & Doublons
- [x] **Tâche 2.6.3 :** Gérer le cas "Email déjà existant".
    - Si l'email existe dans `auth.users`, permettre le login via Magic Link mais s'assurer que le *nouveau* post généré est bien rattaché à cet utilisateur existant (via la logique de `pre-persist` ou un merge).
    - **Note UX :** Le flux utilisateur attendu est le suivant :
        1. L'utilisateur saisit un email existant.
        2. Le Magic Link est envoyé.
        3. Après clic, l'utilisateur est authentifié et redirigé vers le Dashboard.
        4. Le nouveau post généré est automatiquement rattaché à son compte et visible dans le Dashboard, sans étape de confirmation explicite.
- [x] **Tâche 2.6.4 :** Bloquer la navigation retour (History API) après la soumission réussie de l'email pour empêcher la régénération abusive ou les états incohérents.
- [x] **Tâche 2.6.5 :** Vérifier l'état d'authentification immédiatement après le retour du Magic Link pour éviter les redirections intempestives.

### 3. Refactoring Sémantique
- [x] **Tâche 2.6.6 :** Renommer/Clarifier les variables dans le code Front et Back.
    - `quizTheme` -> Le thème sélectionné au début (acquisition).
    - `postTopic` (ou similaire) -> Le sujet spécifique du post généré (valeur produit).
- [x] **Tâche 2.6.7 :** Corriger le bug d'affichage "Sujet non disponible" en s'assurant que le sujet est bien extrait/généré et passé au composant de vue.

### 4. Révélation (UI Fix)
- [x] **Tâche 2.6.8 :** Ajuster l'animation CSS/Framer Motion pour le défloutage.
    - Assurer que le post est chargé *flouté* (SSR ou état initial) puis animé vers *net* uniquement après montage et vérification, sans flash de contenu net au préalable.

### 5. Infrastructure de Test (QA Report Implementation)
*Basé sur `docs/qa/reports/failure-analysis-story-2-6-prep.md`*
- [x] **Tâche 2.6.9 (Smart Auth Setup) :** Refondre `e2e/auth.setup.ts` pour vérifier la validité du token session et forcer le login si nécessaire.
- [x] **Tâche 2.6.10 (Data Seeding) :** Modifier le setup pour garantir qu'un post existe toujours pour l'utilisateur de test (insert via Admin API si manquant).
- [x] **Tâche 2.6.11 (Robust Locators & Fail Fast) :** Remplacer les sélecteurs fragiles par des `data-testid`. Ajouter une vérification d'URL explicite au début des tests Dashboard pour échouer immédiatement si la redirection login a eu lieu.
- [x] **Tâche 2.6.12 (Snapshots) :** Mettre à jour les snapshots visuels une fois la stabilisation des données effectuée (Action 5 du rapport QA).

## Assurance Qualité

- **Référence QA** : [`docs/qa/reports/failure-analysis-story-2-6-prep.md`](../qa/reports/failure-analysis-story-2-6-prep.md)
- **Validation** :
    - Tous les tests E2E (Dashboard, Quiz, Auth) doivent passer (vert) de manière stable (3 runs consécutifs sans flake).
    - Vérification manuelle du flux "Nouvel utilisateur" et "Utilisateur existant".

## Intégration Feedback Utilisateur (Critique - 24/01/2026)

Suite aux tests manuels, les correctifs suivants sont **PRIORITAIRES** :

### A. Data Integrity (CRITIQUE) - Confusion "Hook" vs "Content"
**Constat :** Le champ `Hook` est tronqué ou inexistant dans le Post final. La variable `post.content` en base ne stocke que le corps du texte, perdant la structure générée par l'IA (Hook, CTA, Analyse).
**Correctif Technique :**
- [x] **Schema Update :** Modifier `app/api/quiz/pre-persist/route.ts` pour accepter un objet structuré (`hook`, `content`, `cta`, `style_analysis`) au lieu de juste `post_content`.
- [x] **Database :** Stocker ce contenu structuré. Option recommandée : JSONB dans une nouvelle colonne `structured_content` OU sérialisation JSON dans la colonne `content` existante (moins propre mais rapide).
- [x] **Front-End :** Mettre à jour `app/quiz/reveal/page.tsx` et `app/dashboard/post-reveal-view.tsx` pour lire et afficher ces champs distincts.

### B. UI/UX - Blur & Reveal
**Constat :** Le flou est trop fort ("illisible" au lieu de "devinable") et le reveal est trop rapide/instantané.
**Correctif Technique :**
- [x] **Blur :** Passer de `blur-md` à `blur-sm` (ou custom 4px) dans `app/dashboard/post-reveal-view.tsx`.
- [x] **Transition :** Augmenter la durée de transition de `1000ms` à `2500ms` (2.5s).
- [x] **Timing :** Ajouter un délai initial avant le déclenchement du reveal (ex: 500ms) pour laisser le temps à l'utilisateur de "voir" l'état flouté avant l'animation.

### C. Gestion Utilisateur Existant (White Page)
**Constat :** Risque de page blanche sur `/quiz` après Magic Link pour un utilisateur existant.
**Correctif Technique :**
- [x] **Redirection :** Si `app/quiz/reveal/page.tsx` détecte un utilisateur authentifié AVEC un post déjà révélé/sauvegardé, rediriger vers `/dashboard` au lieu de `/quiz`.
- [x] **QuizEngine :** S'assurer que `QuizEngine` gère gracieusement le chargement depuis le `localStorage` si l'utilisateur est renvoyé sur `/quiz`.

---

## 📊 Résultats & Métriques

### Accomplissements
- ✅ **Data Persistence:** Toutes les données du post sauvegardées en DB (structured content)
- ✅ **Auth Flow:** Flux sécurisé avec verrouillage navigation et nettoyage localStorage
- ✅ **E2E Tests:** Suite complète cross-browser (Chromium, Firefox, WebKit)
- ✅ **Test Infrastructure:** Smart auth setup, data seeding, robust locators
- ✅ **Code Quality:** Tests stables (3 runs consécutifs sans flake)

### Métriques de Succès
| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Tests E2E passants | 60% | 100% | +40% |
| Stabilité tests | Flaky | Stable | ✅ |
| Data integrity | Partielle | Complète | ✅ |
| Cross-browser support | Chromium | 3 navigateurs | +200% |

### Impact Business
- ✅ Base solide pour Epic 3 (Dashboard)
- ✅ Confiance dans le flux de conversion
- ✅ Réduction des bugs de persistance
- ✅ Meilleure expérience utilisateur

---

## 🔗 Stories Liées

### Précédentes
- [`story-2-4-reveal-flow.md`](story-2-4-reveal-flow.md) - Flux de révélation initial
- [`story-2-5-post-view.md`](story-2-5-post-view.md) - Vue post révélé

### Suivante
- [`story-2-7-auth-persistence-simplification.md`](story-2-7-auth-persistence-simplification.md) - Simplification architecture (ROI 1,318%)

---

**Complété par :** Équipe Technique
**Date de complétion :** 26 Janvier 2026
**Statut :** ✅ **PRODUCTION READY**
