# Recommandation Stratégique : Raffinement des Prompts de Génération (ICE Phase 1 & 2) [IMPLÉMENTÉ le 2026-01-21]

**À l'attention de :** James (Dev Team)
**Objet :** Ajustement des bornes cibles dans les instructions de prompt pour réduire la caricature.

## 1. État des Lieux (Preuves du Fix à 0/100)

Actuellement, les instructions envoyées à l'IA pour générer les questions A/B utilisent les bornes extrêmes du modèle (0 et 100), ce qui peut produire des propositions trop clivantes ou "robotiques".

- **Phase 1 (Génération)** : [`app/api/quiz/generate/route.ts:77-99`](app/api/quiz/generate/route.ts:77) définit les dimensions sur les bornes 0 et 100.
- **Phase 2 (Génération)** : [`app/api/quiz/generate/route.ts:145-153`](app/api/quiz/generate/route.ts:145) définit les 9 dimensions sur 0 vs 100.
- **Instruction Explicite** : L'instruction ligne 162 ordonne : *"L'option A doit correspondre à la borne 0, l'option B à la borne 100"*.

## 2. Changement Proposé : Raffinement sémantique

**Note cruciale :** Ce changement concerne **uniquement les prompts**. L'algorithme de calcul de la Phase 2 (attraction de 30% vers 0 ou 100) reste inchangé pour préserver la dynamique du vecteur.

Nous demandons à l'IA de générer des propositions reflétant les positions **15** et **85** sur l'axe, au lieu de 0 et 100. Cela forcera le modèle à produire des nuances plus naturelles.

- **Option A : Cibler la valeur 15** (au lieu de 0)
- **Option B : Cibler la valeur 85** (au lieu de 100)

## 3. Few-Shots pour le Prompt Engineering

Voici comment traduire ce changement dans les instructions de prompt :

### Exemple 1 : Dimension POSTURE (POS)
*   **Avant (0 vs 100)** :
    *   A (0) : "Je ne sais pas trop, j'apprends."
    *   B (100) : "Voici la seule vérité, suivez-moi."
*   **Après (15 vs 85)** :
    *   A (15) : "J'ai découvert cette approche par l'expérience et je vous la partage."
    *   B (85) : "Pour réussir, il est essentiel d'appliquer cette méthode éprouvée."

### Exemple 2 : Dimension TEMPÉRATURE (TEM)
*   **Avant (0 vs 100)** :
    *   A (0) : "Le rapport indique une variation neutre."
    *   B (100) : "C'est absolument incroyable, je hurle de joie !"
*   **Après (15 vs 85)** :
    *   A (15) : "Les données confirment une tendance stable et analysée."
    *   B (85) : "C'est un résultat passionnant qui nous motive énormément."

## 4. Plan d'Action pour James

1.  **Phase 1** : Dans [`app/api/quiz/generate/route.ts`](app/api/quiz/generate/route.ts) (lignes 77-99), mettre à jour les labels de bornes : "Borne 15" et "Borne 85".
2.  **Phase 2** : Même mise à jour dans le référentiel des 9 dimensions (lignes 145-153).
3.  **Consigne Globale** : Modifier la ligne 162 : *"L'option A doit correspondre à la borne 15, l'option B à la borne 85"*.
4.  **Important** : **Ne pas modifier** `lib/ice-constants.ts` ni `lib/ice-logic.ts`. Les cibles mathématiques de calcul restent à 0 et 100.
