# Story 3.3 : Régénération de Post via Equalizer (Logique)

**Parent Epic:** Epic 3 : Dashboard & Personnalisation (Engagement)

## Description

**En tant que** Utilisateur,
**Je veux** que mon post se réécrive lorsque je valide mes réglages d'Equalizer,
**Afin de** voir l'impact de mes ajustements sur le style.

**Type :** Feature / AI

## Critères d'Acceptation

1.  Bouton "Appliquer / Régénérer" (ou debounce sur les sliders).
2.  Appel API `/api/post/regenerate` avec : ID du post + nouvelles valeurs Equalizer.
3.  Le LLM génère une nouvelle version en prenant en compte les "System Instructions" modifiées par les sliders.
4.  Le post affiché est mis à jour et sauvegardé comme nouvelle version (ou remplace l'ancienne).
5.  Les régénérations sont limités à 10 par heure et ne sont pas décomptées des crédits
