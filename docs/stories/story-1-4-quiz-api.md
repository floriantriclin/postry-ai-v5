# Story 1.4 : API de Génération de Questions (Backend Only)

**Parent Epic:** Epic 1 : Fondation & Tunnel Public (Acquisition)

## Description

**En tant que** Développeur (via Postman/Curl),
**Je veux** appeler l'API `/api/quiz/generate` avec un thème et recevoir un JSON de questions générées par Gemini,
**Afin de** valider la logique de prompt et la structure de données avant l'intégration.

**Type :** Backend API

## Critères d'Acceptation

1.  Endpoint API fonctionnel et sécurisé.
2.  Prompt Système Gemini implémenté pour générer 6+5 questions.
3.  Retourne un JSON valide respectant le schéma attendu par le front.
4.  Temps de réponse acceptable (<5s).
