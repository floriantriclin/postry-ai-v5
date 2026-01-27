# PRD v4.0 - Guide d'Utilisation

## Vue d'Ensemble

Ce dossier contient le **Product Requirements Document (PRD)** complet de **postry.ai**, structuré en sections modulaires pour faciliter la maintenance et la navigation.

**Version actuelle** : 4.0  
**Dernière mise à jour** : 2026-01-27

---

## Structure du Dossier

```
prd/
├── README.md (ce fichier)
├── index.md (table des matières interactive)
├── generate-complete-prd.js (script de génération)
├── PRD-Complete-v4.0.md (document consolidé généré)
│
├── 📋 Fondamentaux
│   ├── 01-objectifs-et-contexte.md
│   ├── 02-exigences.md
│   ├── 03-objectifs-de-design-de-linterface-utilisateur.md
│   └── 04-hypotheses-techniques.md
│
├── 🚀 Epics & Stories
│   ├── 05-liste-des-epics.md
│   ├── 06-details-de-lepic-1-fondation-et-tunnel-public.md
│   ├── 07-details-de-lepic-2-conversion-et-identite.md
│   ├── 08-details-de-lepic-3-dashboard-et-personnalisation.md
│   └── 09-details-de-lepic-4-intelligence-dexpertise.md
│
└── ⚙️ Opérations & Qualité (Nouveau v4.0)
    ├── 10-definition-of-done.md
    ├── 11-testing-strategy.md
    ├── 12-error-handling-strategy.md
    ├── 13-analytics-and-kpis.md
    ├── 14-security-and-compliance.md
    └── 15-deployment-and-rollout.md
```

---

## Comment Utiliser ce PRD

### 📖 Lecture Interactive

Commencez par [`index.md`](./index.md) qui contient une table des matières avec liens vers toutes les sections.

### 📄 Document Complet

Pour générer le document consolidé unique (PDF/partage) :

```bash
cd prd/
node generate-complete-prd.js
```

Cela créera `PRD-Complete-v4.0.md` contenant toutes les sections.

### 🔍 Navigation par Rôle

#### Développeurs
- **Avant chaque story** : [`10-definition-of-done.md`](./10-definition-of-done.md)
- **Pour les tests** : [`11-testing-strategy.md`](./11-testing-strategy.md)
- **Gestion d'erreurs** : [`12-error-handling-strategy.md`](./12-error-handling-strategy.md)
- **Sécurité** : [`14-security-and-compliance.md`](./14-security-and-compliance.md)

#### Product Owners / Scrum Masters
- **Métriques à suivre** : [`13-analytics-and-kpis.md`](./13-analytics-and-kpis.md)
- **Phases de lancement** : [`15-deployment-and-rollout.md`](./15-deployment-and-rollout.md)
- **Epics** : Sections 05 à 09

#### DevOps / Tech Leads
- **CI/CD** : [`15-deployment-and-rollout.md`](./15-deployment-and-rollout.md)
- **Sécurité** : [`14-security-and-compliance.md`](./14-security-and-compliance.md)
- **Testing Strategy** : [`11-testing-strategy.md`](./11-testing-strategy.md)

---

## Nouveautés v4.0 (27/01/2026)

✨ **6 nouvelles sections ajoutées** pour couvrir les aspects opérationnels :

1. **Definition of Done** : Checklist universelle pour valider qu'une story est "Done"
2. **Testing Strategy** : Couverture Unit/Integration/E2E, outils (Vitest, Playwright)
3. **Error Handling Strategy** : Gestion des erreurs par domaine (LLM, Auth, DB, Paiement, CV Upload)
4. **Analytics & KPIs** : Events Posthog, dashboards, métriques de succès (Reveal Rate, MRR, etc.)
5. **Security & Compliance** : RGPD, RLS, chiffrement, audits
6. **Deployment & Rollout** : Phases (Alpha, Beta, Launch), CI/CD, feature flags

📊 **Score de complétude** : 9/10 (vs 6.5/10 en v3.0)

---

## Maintenance du PRD

### ✏️ Modifier une Section

1. Ouvrir le fichier `.md` correspondant
2. Éditer le contenu
3. Commit + Push

```bash
git add prd/10-definition-of-done.md
git commit -m "docs(prd): update DoD checklist"
git push
```

### 📦 Régénérer le Document Complet

Après toute modification :

```bash
cd prd/
node generate-complete-prd.js
git add PRD-Complete-v4.0.md
git commit -m "docs(prd): regenerate complete document"
git push
```

### 🆕 Ajouter une Nouvelle Section

1. Créer `XX-nouvelle-section.md`
2. Ajouter le fichier dans `SECTIONS_ORDER` de `generate-complete-prd.js`
3. Mettre à jour `index.md`
4. Régénérer le document complet

---

## Changelog

| Version | Date | Changements | Auteur |
|---------|------|-------------|--------|
| **4.0** | 27/01/2026 | Ajout de 6 sections opérationnelles + script de génération | Bob (SM) |
| 3.0 | 15/01/2026 | Refonte complète / simplification | FTR |
| 2.3 | 14/01/2026 | Story 3.0 : Spike Technique - Moteur Radar (POC) | FTR |
| 2.2 | 14/01/2026 | Ajout story 1.6 pour fondation données | FTR |
| 2.1 | 14/01/2026 | Création workspace `packages/shared-types` | FTR |
| 2.0 | 13/01/2026 | Alignement Brief v5.1 : Protocoles ICE, RME, ALE | John (PM) |
| 1.1 | 10/01/2026 | Pivot "Zéro Friction" + métriques fidélité | John (PM) |
| 1.0 | 08/01/2026 | Création initiale | John (PM) |

---

## Ressources Complémentaires

### Documentation Projet
- **Brief** : `docs/brief.md`
- **Architecture** : `_bmad-output/planning-artifacts/Architecture.md`
- **Décisions Techniques** : `docs/decisions/`

### Outils
- **Générateur de Politique de Confidentialité** : [Termly.io](https://termly.io/)
- **Analytics** : [Posthog](https://posthog.com/)
- **Testing** : [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

---

## Support

**Questions sur le PRD ?**
- Slack : #prd-questions
- Email : florian@postry.ai

**Scrum Master** : Bob  
**Product Owner** : Florian

---

**Dernière mise à jour** : 2026-01-27  
**Contributeurs** : John (PM), FTR (Dev), Bob (SM)
