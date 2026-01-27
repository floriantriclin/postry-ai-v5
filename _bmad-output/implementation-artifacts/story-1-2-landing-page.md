# Story 1.2 : Landing Page Statique & Navigation

**Parent Epic:** Epic 1 : Fondation & Tunnel Public (Acquisition)

**Statut :** Done
**Approuvé le :** 2026-01-16

## Description

**En tant que** Visiteur,
**Je veux** voir la proposition de valeur et accéder à l'étape de sélection de thème,
**Afin de** comprendre ce que propose le site et initier le parcours vers le Quiz.

**Type :** Feature

## Critères d'Acceptation

### 1. Structure UI & Sections (Mobile First)
- [x] **Header Minimaliste :** Logo uniquement, pas de menu de navigation (stratégie "Zéro Distraction").
- [x] **Hero Section (Suspense) :**
    - Titre H1 : "Trouvez votre Voix. Pas celle d'un Robot."
    - Sous-titre : "Découvrez votre Archétype d'écriture LinkedIn en 2 minutes."
    - CTA Primaire : Bouton "[ DÉTERMINER MON STYLE ]".
- [x] **Sélecteur de Thème (Pré-Jeu) :**
    - S'affiche après clic sur le CTA ou sur la même page (selon implémentation).
    - Titre : "Sur quel sujet êtes-vous le plus à l'aise ?"
    - Liste/Grille de tuiles (ex: Management, Vente, Tech) ou Input simple pour MVP.
    - Bouton "Démarrer" pour valider.

### 2. Style "Tech & Brut"
- [x] Palette monochrome : Carbon Black (#09090b), Paper White (#ffffff).
- [x] Accent : Signal Orange (#f97316) pour le focus/hover.
- [x] Bordures nettes (`border-2`, `rounded-none`).
- [x] Typographie : `Chivo` ou `Inter` (Black) pour les titres, `Inter` pour le corps, `JetBrains Mono` pour les éléments UI/Labels.

### 3. Navigation & Logique
- [x] Clic sur "Démarrer" redirige vers `/quiz`.
- [x] Passage du thème sélectionné en URL query param (ex: `/quiz?topic=management`).
- [x] Chargement de la page < 1s visé.

## Contraintes Techniques

- **Framework :** Next.js 16 (App Router) + TypeScript.
- **Styling :** Tailwind CSS 4.x (Strictement utilitaire, pas de lib UI lourde).
- **Icons :** Lucide React (stroke-width: 2).
- **Layout :** Utilisation des composants "Raw UI" définis dans `front-end-spec.md` (Buttons primary/secondary).

## Implementation Notes

- **Layout Fix (Overflow) :** Ajout de `overflow-x-hidden` sur le conteneur principal et positionnement `absolute` du Header/Footer pour éviter les décalages de layout sur mobile lors de l'affichage du contenu centré.
- **Grille de Thèmes :** Utilisation de `max-w-4xl` (au lieu de `max-w-2xl`) pour permettre une grille de 10 thèmes plus lisible et aérée sur Desktop.
- **Animations :** Intégration de transitions `animate-in` (fade/slide) via Tailwind pour fluidifier le passage entre le Hero et le Sélecteur.

## Definition of Done

- [x] UI Landing Page implémentée selon les spécifications visuelles (Néo-Brutalisme).
- [x] Responsive design validé :
    - **Mobile (< 640px) :** Layout optimisé (grid 2 colonnes pour les thèmes), cibles tactiles respectées.
    - **Desktop (> 1024px) :** Contenu centré (`max-w-4xl`).
- [x] Accessibilité : Contraste WCAG AA respecté, focus states orange visibles.
- [x] Navigation fonctionnelle vers `/quiz` avec transfert de data.
- [x] Pas de "Layout Shift" (CLS) majeur au chargement.
- [x] Code respectant les `coding-standards.md`.

## QA Results

### Risk Profile
- **Status:** CONCERNS
- **Score:** 78/100
- **Highest Risk:** PERF-001 (Page Load > 1s) - Score 6
- **Link:** [`docs/qa/assessments/1.2-risk-20260116.md`](docs/qa/assessments/1.2-risk-20260116.md)

### Test Design
- **Total Scenarios:** 7 (P0: 2, P1: 3, P2: 2)
- **Levels:** 2 Unit, 5 E2E
- **Link:** [`docs/qa/assessments/1.2-test-design-20260116.md`](docs/qa/assessments/1.2-test-design-20260116.md)

### Recommendations
- **Must Fix:** Performance budget must be strictly enforced (Next.js 16 optimization).
- **Monitor:** Layout Shift (CLS) during Hero CTA interaction.

### Review Date: 2026-01-16
### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment
Implementation is clean and adheres strictly to the "Tech & Brut" aesthetic. Use of Tailwind 4 features is appropriate. Component structure is modular enough for this stage. Pragmatic adjustment of `max-w-2xl` to `max-w-4xl` for the 10-item theme grid improves usability without breaking the minimalist intent.

### Refactoring Performed
No direct refactoring required; implementation is well-structured for a static landing page.

### Compliance Check
- Coding Standards: [✓]
- Project Structure: [✓]
- Testing Strategy: [✓]
- All ACs Met: [✓]

### Improvements Checklist
- [x] Responsive layout adjustments for 10 themes (dev handled)
- [x] Smooth transitions between Hero and Selector (dev handled)
- [ ] Automate Lighthouse CI for PERF-001 validation
- [ ] Add unit test for `handleStart` logic (topic normalization)

### Security Review
No major concerns. Query parameter `topic` is encoded and handled on the client side. Minimal attack surface.

### Performance Considerations
LCP < 1s achieved manually. However, the high probability of regression as the app grows necessitates automated performance gating in the CI pipeline.

### Gate Status
Gate: PASS → [`docs/qa/gates/1.2-landing-page.md`](docs/qa/gates/1.2-landing-page.md)
Risk profile: [`docs/qa/assessments/1.2-risk-20260116.md`](docs/qa/assessments/1.2-risk-20260116.md)
NFR assessment: [`docs/qa/assessments/1.2-nfr-20260116.md`](docs/qa/assessments/1.2-nfr-20260116.md)

### Recommended Status
[DONE]
