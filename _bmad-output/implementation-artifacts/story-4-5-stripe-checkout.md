# Story 4.5 : Intégration Stripe Checkout (Paiement)

**Parent Epic:** Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

## Description

**En tant que** Utilisateur bloqué,
**Je veux** cliquer sur "Passer Premium", payer par carte et être débloqué instantanément,
**Afin de** continuer à utiliser l'outil.

**Type :** Integration

## Critères d'Acceptation

1.  Bouton "Upgrade" redirige vers une URL Stripe Checkout (Session hébergée).
2.  Webhook Stripe configuré pour écouter l'événement `checkout.session.completed`.
3.  À réception du webhook, mise à jour du user : `is_premium = true` (ou `credits = 9999`).
4.  Redirection utilisateur vers Dashboard avec message de succès et crédits débloqués.
