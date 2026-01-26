# Rapport d'Analyse des Échecs & Stratégie pour la Story 2-6

**Date :** 24 Janvier 2026
**Auteur :** QA Architect
**Sujet :** Analyse des échecs de tests E2E et plan de remédiation
**Standards de Référence :** [Testing Standards](../architecture/testing-standards.md), [Coding Standards](../architecture/coding-standards.md)

---

## 1. État des Lieux

Une exécution complète de la suite de tests a été réalisée pour identifier l'origine des instabilités actuelles.

*   **Tests Unitaires (`vitest`)** : ✅ **SUCCÈS** (93/93 tests passés)
    *   La logique métier (Quiz, Algorithme ICE, Gemini, Hooks) est robuste.
*   **Tests E2E (`playwright`)** : ❌ **ÉCHEC PARTIEL** (10 échecs, 6 succès)
    *   Les échecs sont concentrés exclusivement sur la suite `dashboard.spec.ts`.
    *   Les suites `quiz.spec.ts` (implicite dans les succès) semblent stables.

## 2. Analyse Détaillée des Échecs

Les échecs sur le Dashboard proviennent d'un **problème structurel dans la gestion de l'état des tests (Test Data Management)**, ce qui enfreint la règle "Gérez l'état pour des tests indépendants" des standards de test.

### Cause Racine 1 : Persistance "Naïve" de l'Authentification
Le fichier `e2e/auth.setup.ts` est conçu pour réutiliser un fichier de session (`e2e/.auth/user.json`) s'il existe.
*   **Le Problème :** Il vérifie uniquement l'existence du fichier, sans valider si le token est encore valide auprès de Supabase.
*   **Symptôme :** Si le token est expiré ou si la base de données a été réinitialisée (supprimant l'utilisateur), le test croit être authentifié mais les requêtes serveurs (dans `DashboardPage`) échouent ou redirigent l'utilisateur vers la page d'accueil.

### Cause Racine 2 : Absence de Garanties sur les Données de Test (Data Seeding)
Le script de setup crée un "Post" (résultat de quiz) uniquement lors de la *première* authentification (création du fichier json).
*   **Le Problème :** Lors des exécutions suivantes (réutilisation du json), cette étape de création de données est sautée. Si la base de données a été nettoyée ou si le post a été supprimé, l'utilisateur de test se retrouve sur le Dashboard sans aucun post.
*   **Symptôme :**
    *   L'application affiche l'état "Aucun post généré".
    *   Le test `should display the post reveal view` échoue car il attend l'élément `.blur-sm` (présent uniquement si un post existe).
    *   Le test `should copy the post content` échoue car le bouton "COPIER" est absent.
    *   Le test `should logout` échoue (timeout) car soit l'utilisateur a été redirigé vers la Home (si token invalide), soit le DOM attendu est différent.

### Cause Racine 3 : Fragilité des Sélecteurs
*   Les tests attendent des éléments basés sur des classes CSS (`.blur-sm`) ou du texte (`text=Déconnexion`), ce qui est contraire à la bonne pratique **"Utilisez des `data-testid` pour les locators"** définie dans les standards.
*   Il manque des vérifications d'état préalable (ex: sommes-nous bien sur `/dashboard` ?).

---

## 3. Stratégie de Correction (Story 2-6)

La Story 2-6 devra se concentrer sur la **Fiabilisation de l'Infrastructure de Test**. Nous ne toucherons pas au code de production, sauf pour ajouter des attributs de test (`data-testid`) si nécessaire.

### Action 1 : Durcir `auth.setup.ts` (Smart Authentication)
*Conforme à : Coding Standards (Strict Typing)*
Refondre la logique de `e2e/auth.setup.ts` pour :
1.  Charger le fichier de session s'il existe.
2.  **Vérifier la validité de la session** (appel `getUser` vers Supabase).
3.  Si la session est invalide ou l'utilisateur inexistant : **Forcer une ré-authentification complète**.
4.  Utiliser `lib/env.ts` ou s'assurer que les variables d'environnement sont typées/vérifiées.

### Action 2 : Garantir les Données (Idempotent Data Seeding)
*Conforme à : Testing Standards (Tests Indépendants)*
Modifier le setup pour dissocier l'authentification de la création de données.
1.  Après l'étape d'authentification (qu'elle soit nouvelle ou récupérée), **toujours vérifier l'existence d'un Post** pour l'utilisateur courant.
2.  Si aucun post n'existe, en insérer un via l'API Admin de Supabase (`supabaseAdmin.from('posts').insert(...)`).
3.  Ceci garantit que le test `dashboard.spec.ts` démarre *toujours* avec un utilisateur ayant au moins un post.

### Action 3 : Migrer vers des Locators Robustes
*Conforme à : Testing Standards (Utilisation de `data-testid`)*
1.  Remplacer `page.locator(".blur-sm")` par un sélecteur sémantique ou `data-testid="post-reveal-card"`.
2.  Remplacer les sélecteurs de texte fragiles par `getByRole('button', { name: '...' })` ou des `data-testid` explicites (`data-testid="logout-button"`).

### Action 4 : Améliorer la Résilience de `dashboard.spec.ts`
1.  Ajouter une vérification explicite de l'URL au début des tests `Authenticated` pour confirmer que nous ne sommes pas redirigés vers `/` ou `/login`.
2.  Si l'authentification échoue, le test doit échouer immédiatement avec un message clair ("User redirected to login") plutôt que de timeout sur un élément.

### Action 5 : Fixer les Snapshots Visuels
1.  Une fois les données stabilisées (Action 2), régénérer les snapshots de référence (`npx playwright test --update-snapshots`).

---

## Conclusion
Les tests échouent par **dette technique de test**, pas par régression fonctionnelle majeure. La stratégie proposée rendra la suite de tests **autonome, idempotente et résiliente**, alignée avec les standards du projet.
