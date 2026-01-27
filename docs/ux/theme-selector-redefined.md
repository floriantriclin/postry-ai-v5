# Recommandation UX : Refonte du Sélecteur de Thèmes (Terrains)

**Date** : 21/01/2026
**Auteur** : UX Expert
**Statut** : Implémenté le 21/01/2026

## 1. Problématique
Le format actuel du sélecteur de thèmes manque de rigidité et de cohérence visuelle. L'utilisation d'emojis et de centrages flexibles provoque des déformations de tuiles dès que les libellés sont longs, nuisant à l'aspect professionnel et "organisé" du menu.

## 2. Vision Design : Le concept de "Secteur"
L'objectif est de transformer une grille d'options générique en une interface de sélection de "secteurs d'expertise" (Terrains). On s'éloigne du ludique (emojis) pour aller vers l'éditorial brutaliste.

## 3. Spécifications Détaillées

### 3.1 Structure & Responsivité
*   **Contrainte de format** : Utiliser `aspect-[4/3]` (soit une réduction de 25% de la hauteur par rapport au format carré) avec un `overflow-hidden` strict. Aucun contenu ne doit pouvoir étirer la tuile.
*   **Grille adaptative** : 
    *   Mobile : 2 colonnes (`grid-cols-2`)
    *   Petit Tablette : 3 colonnes (`sm:grid-cols-3`)
    *   Tablette : 4 colonnes (`md:grid-cols-4`)
    *   Desktop : 5 colonnes (`lg:grid-cols-5`)
*   **Espacement** : `gap-3` pour maximiser la surface utile de chaque tuile.

### 3.2 Éléments Visuels
*   **Suppression des Emojis** : Remplacés par un index numérique (ex: 01, 02) pour renforcer l'idée de catalogue ordonné.
*   **Typographie** : 
    *   Libellé en `uppercase` + `font-black`.
    *   Taille de texte dynamique (`text-sm` à `text-base`).
    *   Alignement à gauche (`text-left`) en bas de tuile.
*   **Index** : Police mono, petite taille, opacité 40%, placé en haut à gauche.

### 3.3 Comportement interactif (Hover)
*   **Inversion de couleurs** : Fond Blanc -> Fond Noir / Texte Noir -> Texte Blanc.
*   **Accent "Signal Orange"** : Un élément géométrique (ex: un carré de 8x8px) apparaît dans le coin supérieur droit au survol.
*   **Transition** : Rapide (200-300ms) avec un easing `ease-out`.

## 4. Exemple de structure HTML/Tailwind suggérée
```tsx
<button className="relative aspect-[4/3] border-2 border-carbon p-4 flex flex-col items-start justify-between hover:bg-carbon hover:text-white transition-all group overflow-hidden bg-white">
  <span className="font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">01</span>
  <span className="font-black text-sm sm:text-base leading-none text-left uppercase break-words">MANAGEMENT & RH</span>
  <div className="absolute top-0 right-0 w-8 h-8 bg-signal-orange translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-300 ease-out" />
</button>
```

## 5. Note d'Implémentation
*   **Date d'application** : 21/01/2026
*   **Modifications** : Mise à jour de `components/feature/theme-selector.tsx`.
*   **Patch** : Correction de la translation de l'élément orange (`translate-x-full` au lieu de `translate-x-4`) pour assurer une invisibilité totale hors survol.
