# Story 2.3 : Modal de Capture & Déclenchement Auth

**Parent Epic:** Epic 2 : Conversion & Identité (Révélation)

## Objectif (Goal)

Implémenter le composant d'interface utilisateur (Modal/Overlay) qui intercepte l'utilisateur sur la vue du Post Flouté pour capturer son adresse email et initier le processus d'authentification par Magic Link.

## Description (Enrichie)

**En tant que** Visiteur face à mon post flouté,
**Je veux** saisir mon email dans une modal de conversion,
**Afin de** recevoir un lien de connexion unique et immédiat pour débloquer mon contenu.

Cette modal doit s'afficher par-dessus la vue du Post Flouté et servir de point de friction calculé (Lead Capture) avant la Révélation (Story 2.4).
*   **Référence UX:** Voir le [Flux Critique, Section 3.1](docs/front-end-spec.md#section-3--parcours-utilisateurs-user-flows) pour le placement dans le tunnel.

## Dépendances

- [x] **Story 2.2 : Authentification par Magic Link (Backend & SDK)** : Le point d'API pour l'envoi du Magic Link doit être fonctionnel.
- [ ] **Story 2.4 : Flux de Révélation & Persistance Post-Inscription** : Dépend de cette modal pour le déclenchement initial de l'auth.

## Développements Effectués

Un composant `AuthModal.tsx` a été créé et implémenté. Il gère l'ensemble du processus de capture d'email et de connexion :

- **UI & États :** Le modal gère les états `initial`, `loading`, `success` et `error`.
- **Validation :** La validation de l'email est effectuée côté client via une regex simple.
- **API :** Il s'intègre avec `signInWithOtp` de `lib/auth.ts` pour envoyer le lien magique.
- **Accessibilité :** Un "focus trap" basique a été implémenté pour la navigation au clavier.
- **Intégration :** Le modal est déclenché dans `FinalReveal.tsx` lorsque l'utilisateur n'est pas authentifié, superposé au-dessus du contenu flouté.

## Implémentation Technique

### 1. Composant (UI)
*   [x] Créer un nouveau composant `AuthModal.tsx` (ou `ConversionOverlay.tsx`) dans [`components/feature`](components/feature) pour encapsuler la logique du formulaire.
*   [x] **Design System:** Le composant doit respecter les spécifications de style "Raw UI" pour les `Inputs & Formulaires` et les `Boutons` (voir [Section 5.2](docs/front-end-spec.md#section-5--biblioth%C3%A8que-de-composants--design-system)).

### 2. Intégration (Flow)
*   [x] Intégrer le composant `AuthModal` dans la vue du Post Flouté (probablement [`components/feature/FinalReveal.tsx`](components/feature/FinalReveal.tsx) ou `app/quiz/page.tsx`).
*   [x] Le modal doit s'ouvrir lorsque l'utilisateur atteint la vue du post généré (H. Vue "Preuve Floutée").

### 3. Logique (API)
*   [x] Utiliser la fonction `signInWithEmail()` du SDK Supabase (couche d'abstraction dans [`lib/auth.ts`](lib/auth.ts)) pour soumettre l'email à l'API.
*   [x] L'email soumis doit être validé côté client (regex simple) pour améliorer l'UX avant l'appel API.

## Critères d'Acceptation (Testable)

1.  **Fonctionnalité (E2E)** : La soumission d'un email valide doit déclencher l'envoi du Magic Link et afficher un message de succès.
2.  **Validation (UX)** : La saisie d'un email invalide (ex: `test@` ou vide) doit afficher immédiatement une erreur visuelle claire (utilisation de `Signal Orange` selon la charte).
3.  **États** : Le composant doit gérer correctement les états de : `initial`, `soumission` (loading), `succès` (lien envoyé), et `erreur` (API failure ou invalid email).
4.  **Feedback de Soumission** : Après l'envoi réussi, le modal doit afficher un message de confirmation sans se fermer : "Lien de connexion envoyé. Vérifiez votre boîte mail."

## Exigences Non-Fonctionnelles (PO/Validation)

1.  **Accessibilité (WCAG AA)** : Le modal doit être pleinement accessible au clavier (focus trap, ESC pour fermer) et utiliser les rôles ARIA adéquats (`role="dialog"`).
2.  **Mobile First** : Le design du modal doit être optimisé pour un usage mobile, avec un "Touch Target" minimum de 44x44px pour l'input et le CTA (voir [Section 7.1](docs/front-end-spec.md#section-7--accessibilit%C3%A9-responsivit%C3%A9)).
3.  **Performances** : Le déclenchement de la modal doit être instantané (sans décalage visible) lors de l'arrivée sur l'écran.
