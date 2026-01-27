# 10. Definition of Done (DoD)

## Definition of Done Globale

Chaque User Story doit satisfaire **tous** les critères suivants avant d'être considérée comme "Done" et prête pour la Production.

### 🔧 Développement

- [ ] **Code implémenté** : Toutes les fonctionnalités décrites dans les critères d'acceptation sont codées
- [ ] **Code testé localement** : Le développeur a vérifié que tout fonctionne en environnement local
- [ ] **Linter errors = 0** : Aucune erreur ESLint ou TypeScript
- [ ] **Warnings critiques résolus** : Les warnings de sécurité ou de performance sont traités
- [ ] **Code formaté** : Prettier appliqué (ou formatteur du projet)

### 🧪 Tests

- [ ] **Tests unitaires passants** :
  - Logique métier critique : **>80% de couverture**
  - Protocole ICE : **100% de couverture** (OBLIGATOIRE)
  - Utils et helpers : **>60% de couverture**
- [ ] **Tests d'intégration passants** (si applicable) :
  - API Routes critiques testées
  - Flux de données validés
- [ ] **Tests E2E passants** (si applicable) :
  - Scénarios utilisateur critiques fonctionnels
  - Pas de flakiness (3 runs consécutifs réussis)
- [ ] **Tests manuels effectués** :
  - Happy path vérifié
  - Edge cases testés
  - Responsive design validé (mobile + desktop)

### 👁️ Code Review

- [ ] **Pull Request créée** : Description claire avec contexte
- [ ] **Code reviewed** : Au moins 1 reviewer a approuvé
- [ ] **Commentaires résolus** : Tous les changements demandés appliqués
- [ ] **Pas de conflits** : Branch à jour avec main/master

### 📚 Documentation

- [ ] **README mis à jour** (si nouveaux setup/configs)
- [ ] **ADR créé** (si décision architecturale importante)
- [ ] **Commentaires code** : Fonctions complexes documentées
- [ ] **Types TypeScript** : Interfaces/types exportés et documentés

### 🚀 Déploiement

- [ ] **Déployé en Staging** : Feature accessible sur environnement de test
- [ ] **Validé en Staging** : QA ou PO a testé et approuvé
- [ ] **Migrations DB appliquées** (si applicable) :
  - Migration testée en staging
  - Rollback plan documenté
- [ ] **Variables d'environnement** : Configurées en prod (si nouvelles)

### ✅ Acceptance

- [ ] **PO Approval** : Product Owner a validé la story
- [ ] **Critères d'acceptation remplis** : Tous les AC de la story respectés
- [ ] **Aucun bug bloquant** : Pas de régression introduite

---

## DoD Spécifiques par Type de Story

### 📊 Stories avec Analytics

- [ ] **Events trackés** : Nouveaux events ajoutés à Posthog/Mixpanel
- [ ] **Dashboard mis à jour** : Métriques visibles dans le tableau de bord

### 🔒 Stories avec Sécurité/Auth

- [ ] **Audit de sécurité** : Revue par un pair orienté sécurité
- [ ] **Rate limiting vérifié** : Endpoints protégés contre l'abus
- [ ] **RLS testé** : Row Level Security validé en DB

### 🎨 Stories avec UI/UX

- [ ] **Design System respecté** : Composants conformes aux maquettes
- [ ] **Accessibilité WCAG AA** :
  - Contraste suffisant (4.5:1 minimum)
  - Navigation au clavier fonctionnelle
  - Labels ARIA présents
- [ ] **Mobile tested** : Testé sur au moins 2 tailles d'écran

### 🤖 Stories avec LLM/IA

- [ ] **Prompt versionné** : Prompts stockés et versionnés
- [ ] **Fallbacks implémentés** : Gestion des timeouts/erreurs LLM
- [ ] **Coûts estimés** : Impact sur budget API calculé
- [ ] **Latence mesurée** : Temps de réponse < 15s validé

### 💳 Stories avec Paiement

- [ ] **Webhooks testés** : Scénarios Stripe validés (succès/échec/annulation)
- [ ] **Idempotence vérifiée** : Pas de double facturation possible
- [ ] **Logs de paiement** : Traçabilité complète des transactions

---

## Exceptions et Notes

### Stories Spike/POC

Pour les stories de type "Spike Technique" ou "Proof of Concept" :
- Tests et documentation peuvent être allégés
- DoD réduit : Code fonctionnel + Rapport de findings/décision

### Refactoring Stories

Pour les refactorings internes (pas de changement fonctionnel) :
- Tests E2E optionnels SI couverture unitaire exhaustive
- Focus sur la non-régression

### Hotfixes

Pour les correctifs urgents en production :
- Fast-track possible (review accélérée, déploiement direct en prod)
- **MAIS** : Tests et documentation requis **après coup** sous 48h

---

## Checklist de Vérification (Pre-Merge)

Avant de merger dans `main`, le développeur exécute cette checklist :

```bash
# 1. Tests
npm run test              # Tests unitaires
npm run test:integration  # Tests d'intégration
npm run test:e2e          # Tests E2E (si applicable)

# 2. Linting
npm run lint              # ESLint
npm run type-check        # TypeScript

# 3. Build
npm run build             # Vérifier que le build passe

# 4. Format
npm run format            # Prettier
```

Si **tous** les checks passent ✅ → Prêt pour merge.

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0
