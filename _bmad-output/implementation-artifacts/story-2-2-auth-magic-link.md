# Story 2.2 : Authentification par Magic Link (Backend & SDK)

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Status

[QA Approved]

## Story

**En tant que** Développeur,
**Je veux** implémenter la logique d'authentification et de gestion du Magic Link,
**Afin de** permettre aux utilisateurs de s'inscrire et de se connecter de manière sécurisée sans mot de passe, débloquant ainsi le flux de "Révélation".

## Acceptance Criteria

1.  **Utilitaire Auth :** Fonction `signInWithOtp(email)` implémentée dans `lib/auth.ts` (ou équivalent) utilisant le SDK Supabase.
2.  **Gestionnaire de Callback :** Route Handler Server-side (`app/auth/callback/route.ts`) implémenté pour l'échange de code de session.
3.  **Redirection :** Le flux d'authentification supporte le paramètre `redirectTo` pour rediriger l'utilisateur vers la page appropriée (ex: `/quiz/reveal`) après connexion.
4.  **Gestion des Erreurs :** L'utilitaire retourne des erreurs typées (ex: limite de débit, email invalide).
5.  **Tests :** Les tests unitaires pour `signInWithOtp` (avec mock Supabase) passent avec succès.

## Tasks / Subtasks

- [ ] **Tâche 1 : Implémenter les Utilitaires d'Authentification** (AC: 1, 4)
    - [ ] Créer `lib/auth.ts` (ou mettre à jour `lib/supabase.ts` si pertinent) avec `signInWithEmail`.
    - [ ] Implémenter la gestion des erreurs en mappant les erreurs Supabase vers des erreurs de domaine.
    - [ ] Ajouter la validation Zod pour l'entrée email.
- [ ] **Tâche 2 : Implémenter la Route de Callback Auth** (AC: 2, 3)
    - [ ] Créer `app/auth/callback/route.ts` en utilisant `createServerClient` (SSR) ou en gérant l'échange de code. *Note : Crucial pour le flux PKCE.*
    - [ ] S'assurer que le paramètre de requête `next` est respecté pour la redirection.
- [ ] **Tâche 3 : Tests Unitaires** (AC: 5)
    - [ ] Créer `lib/auth.test.ts`.
    - [ ] Mocker le client `@supabase/supabase-js` et tester les cas de succès/échec de `signInWithEmail`.
- [ ] **Tâche 4 : Vérification de l'Environnement**
    - [ ] Vérifier que `NEXT_PUBLIC_BASE_URL` est correctement défini (Vercel/Local).

## Dev Notes

**Modèles de Données :**
- `auth.users` (Interne Supabase) : Géré automatiquement.
- `public.users` : Créé via le trigger `on_auth_user_created` (voir `../planning-artifacts/architecture/08-schema-de-base-de-donnees.md#script-dinitialisation-sql`). Aucune insertion manuelle requise.

**Spécifications API :**
- **Supabase Auth API :** `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })`.
- **Callback :** `GET /auth/callback?code=...`

**Emplacements des Fichiers :**
- Logique : `lib/auth.ts` (Nouveau fichier recommandé pour séparer la logique de la config, ou fusionner dans `lib/supabase.ts` selon convention).
- Route : `app/auth/callback/route.ts`.
- Tests : `lib/auth.test.ts`.

**Exigences de Test :**
- Utiliser `vitest` pour les tests unitaires.
- Mocker le client `supabase-js`.
- [Source: ../planning-artifacts/architecture/tech-stack.md#testing]

**Contraintes Techniques :**
- **Magic Link Uniquement :** Pas de support de mot de passe.
- **Rate Limits :** Attention aux limites par défaut de Supabase (30/heure/IP). Gérer l'erreur explicitement.
- **Sécurité :** S'assurer que le flux PKCE est utilisé.

## Change Log

| Date | Version | Description | Auteur |
| :--- | :--- | :--- | :--- |
| 2026-01-22 | 1.0 | Brouillon Initial | Bob (Scrum Master) |
| 2026-01-22 | 1.1 | QA Review (Risk & Design) | Alice (QA Architect) |
| 2026-01-22 | 1.2 | QA Review (Code & Test Execution) - APPROVED | Test Architect & Quality Advisor |

## Dev Agent Record

### Agent Model Used
(To be filled by Dev Agent)

### Debug Log References
(To be filled by Dev Agent)

### Completion Notes List
(To be filled by Dev Agent)

### File List
- lib/auth.ts
- app/auth/callback/route.ts
- lib/auth.test.ts

## QA Results

### Risk Assessment
- [Risk Profile](../qa/assessments/2.2-risk-20260122.md)
- **Score:** Critical Risk (Auth Core)

### Test Design
- [Test Design](../qa/assessments/2.2-test-design-20260122.md)
- **Strategy:** Unit Tests for Logic + Manual Verification for E2E Flow.

### Test Execution
- **Unit Tests (`lib/auth.test.ts`)**: Passed (4/4). Confirmed success, email validation, rate limit handling, and generic error handling.
- **Conformity**: Implementation matches all Acceptance Criteria (AC 1 to 5) and adheres to testing standards.
- **Conclusion**: Implementation APPROVED.
