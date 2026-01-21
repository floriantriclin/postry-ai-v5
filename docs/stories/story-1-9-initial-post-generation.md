# Story 1.9 : API de Génération du Post Initial (Pivot)

**Parent Epic:** [Epic 1 : Fondation & Tunnel Public (Acquisition)](../epics/epic-1-acquisition.md)
**Dépendance :** [Story 1.7 : API de Synthèse du Profil Augmenté](./story-1-7-augmented-profile-api.md)

## Description

**En tant que** Visiteur ayant découvert son profil augmenté,
**Je veux** générer un premier post LinkedIn concret sur un sujet de mon choix en utilisant mon style unique (ICE),
**Afin de** valider immédiatement la promesse de valeur (créer du contenu qui me ressemble) avant de m'inscrire.

**Type :** Feature (Backend + Integration)
**INVEST:**
- **Independent:** Nécessite le résultat du profil (Story 1.7) mais peut être testé avec des mocks.
- **Negotiable:** Le prompt exact et la structure du post peuvent être itérés.
- **Valuable:** C'est le "Proof of Value" ultime qui déclenche la conversion.
- **Estimable:** Similaire aux endpoints précédents (Gemini + Zod).
- **Small:** Une seule route API.
- **Testable:** Sortie vérifiable via Zod et tests d'intégration.

## Contexte Technique

Cette story est le **pivot** entre l'Epic 1 (Acquisition) et l'Epic 2 (Conversion). Elle implémente la route `POST /api/quiz/post` qui prend le vecteur de style final et un sujet utilisateur pour produire un brouillon LinkedIn.

**Attention :** Ce post est destiné à être montré (potentiellement flouté ou partiellement) pour inciter à l'inscription (Story 2.4).

## Critères d'Acceptation

### 1. Endpoint et Validation
- [ ] La route `POST /api/quiz/post` est créée.
- [ ] Un schéma Zod valide le corps de la requête :
  - `topic: string` (Le sujet choisi par l'utilisateur, ex: "L'importance de la pause café", min 3 chars).
  - `archetype: string` (ex: "Le Stratège").
  - `vector: number[]` (Le vecteur final $V_{11}$, array de 9 nombres 0-100).
  - `profileLabel: string` (Optionnel, ex: "Le Stratège Lumineux").
- [ ] Sanitization du topic pour éviter les injections de prompt.

### 2. Logique de Génération (Prompting)
- [ ] Le système utilise `gemini-2.5-flash` via `lib/gemini.ts`.
- [ ] Le prompt injecte :
  - Le **Sujet** (`topic`).
  - Les **Dimensions ICE** dominantes (basées sur le vecteur) pour guider le style.
  - La **Structure** attendue d'un post LinkedIn (Hook, Corps, Call to Action).
- [ ] Le prompt force l'application des bornes ICE (ex: si Densité = 85, utiliser du jargon technique).
- [ ] La réponse doit être en **Français**.

### 3. Format de Sortie
- [ ] L'API retourne un objet JSON validé par Zod :
  - `hook: string` (La phrase d'accroche).
  - `content: string` (Le corps du post, formaté avec sauts de ligne).
  - `cta: string` (La phrase de fin / question).
  - `style_analysis: string` (Court feedback sur comment le style a été appliqué, ex: "Post écrit avec une haute densité technique (85)").

### 4. Robustesse & Performance
- [ ] Timeout géré (Gemini peut être lent pour du texte long, cible < 15s).
- [ ] Retry strategy (3 tentatives) en cas d'erreur de formatage JSON.
- [ ] Logs structurés avec `correlationId`.
- [ ] Rate Limiting basique (ex: par IP) pour éviter les abus de génération.

### 5. Intégration Frontend (UI)
- [ ] Câblage du composant existant `FinalReveal` (`input` topic + bouton).
- [ ] Gestion de l'état "Loading" sur le bouton.
- [ ] **Transition vers une Vue Focus (Page dédiée/Overlay) :**
  - Au succès de la génération, l'interface précédente disparaît pour laisser place à une page épurée (maximise le focus).
  - **Layout Refined (Patch 2026-01-21) :**
    - **En-tête :** Minimal (Bouton Close).
    - **Zone Contextuelle (Haut) :**
      - "Généré par [Archétype]" (Discret).
      - "Analyse Style" masquée par défaut (Accordion/Drawer) pour ne pas polluer.
      - Thème en gros titre (H1/H2) très visible.
    - **Zone Post (Centre) :**
      - Carte Post avec Badge "Draft Mode" très visible (Sticker/Badge).
      - **Accroche (Hook) :** Visible en clair.
      - **Corps (Content) :**
        - Premiers 15% du contenu : Visible en clair.
        - 10% suivants : Flou progressif (Blur Gradient).
        - Reste du post (> 25%) : Totalement illisible / masqué.
- [ ] **Call to Action (Conversion) :**
  - Bouton ou Modal pour entrer l'email et débloquer le post complet (Redirection vers Inscription/Epic 2).

## Stratégie de Test (QA)

- **Tests Unitaires :** Validation du schéma Zod (Input/Output).
- **Tests d'Intégration :** Mock de Gemini pour vérifier que le mapping vecteur -> prompt est correct.
- **Test Manuel :** Vérifier que pour un vecteur "Vulgarisateur" (Densité 10) vs "Expert" (Densité 90), le vocabulaire du post change drastiquement sur le même sujet.

## QA Assessment & Validation (2026-01-21)

### [Analyse des Risques](../qa/assessments/1.9-risk-20260121.md)
**Score Global : 55/100 (Risque Modéré)**
- **Risques Principaux :**
  - **Injection de Prompt (SEC-001) :** Tentatives de détournement du comportement de l'IA via le champ sujet.
  - **Qualité/Hallucination (AI-001) :** Non-respect des contraintes de style (ICE) ou structure du post.
- **Mitigation :** Sanitization stricte des inputs et tests d'intégration avec mocks déterministes.

### [Plan de Test](../qa/assessments/1.9-test-plan-20260121.md)
**Stratégie :** Approche hybride Automatisée (Unit/Int/E2E) et Manuelle.
- **Nouveaux Tests Automatisés :**
  - `TC-API-03` : Validation de la sanitization (Security).
  - `TC-API-02` : Vérification "Whitebox" de la construction du System Prompt.
  - `TC-E2E-01` : Flow complet de génération avec UI Mockée (Playwright).
- **Focus Manuel :** Validation visuelle du floutage progressif et pertinence du style.

### Résultats de Validation
| ID | Critère | Statut | Note |
|---|---|---|---|
| 1 | Endpoint & Validation | ✅ Validé | Route implémentée, Zod schema actif, Sanitization OK. |
| 2 | Logique Prompting | ✅ Validé | Prompt système complet, contraintes ICE et Français respectées. |
| 3 | Format Sortie | ✅ Validé | JSON structuré (hook, content, cta, analysis) retourné. |
| 4 | Robustesse | ✅ Validé | Timeout, Retry (3x) et Logs implémentés via `lib/gemini.ts`. |
| 5 | Intégration UI | ✅ Validé | Composant `FinalReveal` fonctionnel, floutage CSS et transition Focus View OK. |

**Conclusion :** La story est validée et prête pour le déploiement. Le flow E2E est stable (passé sur Chromium).
