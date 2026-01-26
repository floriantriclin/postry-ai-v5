# Recommandations pour le Composant AuthModal (Story 2.3)

**Date :** 2026-01-23
**Auteur :** Quinn, Conseiller QA

## 1. Résumé Exécutif

Ce document détaille les corrections nécessaires pour le composant `AuthModal.tsx`. Suite à une décision produit, la modal ne doit **pas** être refermable par l'utilisateur. Son seul chemin est la saisie de son email pour continuer.

Les ajustements se concentrent sur la suppression de code redondant, l'assurance que le texte de l'interface est en français, et l'introduction d'une nouvelle exigence pour gérer la navigation arrière du navigateur.

## 2. Modifications Requises dans `components/feature/auth-modal.tsx`

### 2.1. Confirmation : Pas de Fermeture de la Modal

**Décision Produit :** L'utilisateur ne doit pas pouvoir fermer la modal. Il n'y aura **ni bouton de fermeture, ni de gestion de la touche `Echap`**. Le composant actuel respecte déjà cette exigence. Les tests (unitaires et E2E) seront mis à jour pour valider l'absence de cette fonctionnalité.

### 2.2. Suppression de la Validation Redondante Côté Client

**Problème :** Le composant effectue sa propre validation d'email avec une regex, alors que `lib/auth.ts` utilise déjà une validation plus robuste avec Zod.
**Solution :** Supprimer la vérification par regex locale et se fier uniquement à la réponse de l'API pour le retour de validation.

```tsx
// Supprimer ce bloc de la fonction handleSubmit
/*
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError("Adresse email invalide");
  return;
}
*/
```

### 2.3. Amélioration de l'Accessibilité (ARIA)

**Problème :** Les messages d'erreur ne sont pas annoncés par les lecteurs d'écran.
**Solution :** Ajouter un `role="alert"` au paragraphe du message d'erreur pour que les technologies d'assistance l'annoncent immédiatement.

```tsx
// Ajouter role="alert" au message d'erreur
{error && <p id="email-error" role="alert" className="text-red-600 text-sm mt-2">{error}</p>}
```

### 2.4. Assurer la Cohérence du Texte en Français

**Problème :** Certains textes dans les tests et recommandations précédentes étaient en anglais.
**Solution :** Confirmer et maintenir tout le texte de l'interface en français pour rester cohérent avec le reste de l'application.

*   **Titre :** "Sauvegardez votre post" (Actuel est correct)
*   **Placeholder :** "moi@exemple.com" (Actuel est correct)
*   **Bouton :** "Envoyez-moi un lien" / "Envoi..." (Actuel est correct)

## 3. Nouvelle Exigence : Blocage après Navigation Arrière

**Contexte :** Si un utilisateur arrive sur la modal et utilise le bouton "retour" de son navigateur, il ne doit pas pouvoir générer un nouveau post sans repasser par le tunnel de conversion.
**Recommandation :** Cette logique de "verrouillage" dépasse le cadre de la Story 2.3. Il est recommandé de créer une nouvelle **tâche technique** ou **Story** pour implémenter cette gestion d'état.

**Exemple de Story :**
*   **En tant que** développeur,
*   **Je veux** implémenter une gestion d'état qui suit si l'utilisateur a déjà vu la modal d'authentification,
*   **Afin de** désactiver le bouton de génération de post s'il navigue en arrière pour l'empêcher de contourner la capture d'email.

## 4. Prochaines Étapes

- Un développeur ("James") doit implémenter les changements décrits dans ce document (principalement la suppression de la validation).
- Les tests unitaires et E2E seront mis à jour pour refléter ces nouvelles exigences (pas de fermeture, texte en français).
- Une nouvelle Story doit être créée pour le point 3.
