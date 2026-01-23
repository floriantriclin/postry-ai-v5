# Story 2.4 : Flux de Révélation & Persistance Post-Inscription

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Description

**En tant que** Nouvel Utilisateur (venant de cliquer sur le Magic Link),
**Je veux** être redirigé vers mon post désormais déflouté et sauvegardé,
**Afin de** consommer la valeur promise.

**Type :** Integration / UX / Securité

## Exigences de Sécurité & Persistance (Course Correction)

- **Navigation Sécurisée & Anti-Re-Génération**: Une fois le post flouté généré et l'Auth Modal affiché, la navigation doit être verrouillée. L'utilisateur ne peut pas revenir en arrière (via le bouton "back" du navigateur) pour modifier ses choix ou regénérer un post. L'historique de navigation doit être géré pour empêcher cette action.
- **Magic Link Sécurisé**: L'email envoyé via la Story 2.2 doit impérativement être un Magic Link sécurisé, à usage unique et avec une courte durée d'expiration.
- **Persistance des Données (Logique Améliorée)**: Excellente suggestion. Pour permettre une expérience multi-device, les données seront pré-stockées côté serveur au moment de la génération du Magic Link.
    - **Étape 1 (Pré-Auth)**: Quand l'utilisateur soumet son email, les données (`email`, `stylistic_vector`, `profile`, `theme`, `post`) sont enregistrées dans la base de données avec un statut "en attente de vérification".
    - **Étape 2 (Post-Auth)**: Lorsque l'utilisateur clique sur le Magic Link, son compte est marqué comme "vérifié" et les données pré-enregistrées lui sont définitivement associées.

## Critères d'Acceptation (Flux Multi-Device)

1.  **Verrouillage de la Navigation**: Après la génération du post, le retour en arrière dans l'historique du navigateur est désactivé pour maintenir l'utilisateur dans le tunnel de conversion.
2.  **Pré-Persistance des Données**: Au clic sur "Révéler", les données (vecteur, profil, thème, post) sont envoyées à l'API et stockées en base avec un statut "en attente" lié à l'email fourni.
3.  **Validation & Finalisation du Compte**: Au retour via le Magic Link (depuis n'importe quel appareil), le système identifie l'utilisateur via le token, finalise la création du compte (statut "vérifié"), et associe les données pré-persistées.
4.  **Affichage du Post Révélé**: L'utilisateur est redirigé vers son post, désormais déflouté, indépendamment de l'appareil utilisé pour l'inscription.

## Notes Techniques

- **Migration DB** : Une mise à jour du schéma est nécessaire pour supporter la pré-persistance (voir [`docs/architecture/migrations/20260123-update-posts-schema.md`](docs/architecture/migrations/20260123-update-posts-schema.md)).
- **Navigation** : Utiliser l'API History de Next.js (`pushState` ou interception de route) pour verrouiller le tunnel.
- **API** : Créer un endpoint `/api/quiz/pre-persist` pour sauvegarder les données temporaires.

## QA & Risques

- **Analyse des Risques** : [`docs/qa/assessments/2.4-risk-20260123.md`](../qa/assessments/2.4-risk-20260123.md)
- **Plan de Test** : [`docs/qa/assessments/2.4-test-design-20260123.md`](../qa/assessments/2.4-test-design-20260123.md)

## Plan d'Action SM

- **[Scoping]** Analyse des exigences et des dépendances (DB, API, Front).
- **[Scoping]** Revue de conformité avec les NFRs (Sécurité, UX).
- **[Scoping]** Validation de la migration DB proposée.
- **[DONE]** Analyse des exigences et des dépendances.
    - **Dépendance DB**: La table `posts` doit être migrée pour inclure `email` (TEXT), `status` (TEXT, default 'pending') et rendre `user_id` (UUID) nullable. La migration [`20260123-update-posts-schema.md`](docs/architecture/migrations/20260123-update-posts-schema.md) est confirmée comme étant correcte.
    - **Dépendance API**: Un nouvel endpoint, `POST /api/quiz/pre-persist`, est nécessaire. Il devra accepter `email`, `stylistic_vector`, `profile`, `theme`, et `post` et créer une entrée dans la table `posts` avec le statut `pending`.
    - **Dépendance Frontend**: Le client doit implémenter une logique pour vérouiller la navigation après la génération du post. Il doit appeler le nouvel endpoint `pre-persist` au lieu de l'ancien flux de sauvegarde. La gestion du Magic Link et de la redirection reste critique.
- **[DONE]** Création des sous-tâches techniques pour le développeur.
- **[DONE]** Coordination avec le PO pour valider le flux utilisateur.

## Tâches Techniques

### 1. Base de Données (Migration & Triggers)
- [ ] **Tâche 2.4.1 :** Exécuter la migration [`20260123-update-posts-schema.md`](docs/architecture/migrations/20260123-update-posts-schema.md).
- [ ] **Tâche 2.4.2 :** Créer un Trigger SQL `on_auth_user_created` (ou modifier l'existant) pour :
    - Rechercher les posts dans `public.posts` où `email = new.email` AND `status = 'pending'`.
    - Mettre à jour ces posts avec `user_id = new.id` et `status = 'revealed'`.
    - *Note:* Cette approche garantit que dès que l'utilisateur est confirmé, ses données sont liées atomiquement.

### 2. Backend (API Pre-Persist)
- [ ] **Tâche 2.4.3 :** Implémenter l'endpoint API `POST /api/quiz/pre-persist`.
    - **Input:** `{ email, stylistic_vector, profile, theme, post_content, quiz_answers }` + Validation Zod.
    - **Logic:**
        - Vérifier si un user existe déjà (optionnel, sinon insert direct).
        - Insérer dans `public.posts` via `supabaseAdmin` (Service Role) pour contourner le RLS (qui bloque l'écriture publique).
        - Retourner `success: true`.
    - **Security:** Rate Limiting (si possible via Middleware ou simple check).

### 3. Frontend (Intégration & Sécurisation)
- [ ] **Tâche 2.4.4 :** Mettre à jour `components/feature/auth-modal.tsx` (ou le hook `useQuizPersistence`) pour appeler `/api/quiz/pre-persist` lors de la soumission du formulaire, *avant* d'appeler `signInWithOtp`.
- [ ] **Tâche 2.4.5 :** Implémenter le verrouillage de navigation ("Soft Lock").
    - Utiliser `window.history.pushState` pour empêcher le retour arrière après l'affichage de l'écran "Check your email".
- [ ] **Tâche 2.4.6 :** Créer la page de redirection post-login (`/quiz/reveal` ou similaire) qui affiche le loader puis redirige vers le dashboard ou affiche le post (selon Story 2.5). *Note: Pour cette story, une simple page de succès suffit.*

### 4. Tests
- [ ] **Tâche 2.4.7 :** Test E2E couvrant le flux complet (Génération -> Pre-persist -> Auth -> Reveal).
