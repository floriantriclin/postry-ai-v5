# 01. Introduction

Ce document définit l'architecture technique complète pour **postry.ai**, englobant les systèmes backend (Next.js API/Serverless, Supabase), l'implémentation frontend (Next.js, Tailwind), et leur intégration. Il sert de source de vérité unique pour le développement piloté par l'IA (AI-driven development), garantissant une cohérence totale sur l'ensemble de la stack technologique.

Cette approche unifiée combine ce qui serait traditionnellement des documents d'architecture backend et frontend séparés, rationalisant le processus de développement pour cette application où l'expérience utilisateur ("Preuve Floutée") et la logique backend (Auth différée, Streaming LLM) sont intimement liées.

## Modèle de Démarrage (Starter Template)

*Analyse basée sur le PRD v3.0 :*

Le projet est un **Greenfield** (nouveau projet) mais avec des choix techniques forts qui s'apparentent à une stack moderne standardisée (T3 Stack ou similaire). Cependant, étant donné l'exigence d'un design "Brut" spécifique et d'une architecture "Stateless" pour le LLM, nous partirons d'une installation propre (Clean Slate) pour éviter la dette technique des boilerplates trop lourds.

**Décision :**

- **Type :** N/A - Projet Greenfield (Départ à zéro).
- **Justification :** Bien que des starters comme "Create T3 App" existent, le besoin spécifique d'une UI "Raw/Brut" (Tailwind sans composants pré-faits lourds) et l'intégration spécifique de Gemini via des routes API stateless justifient une configuration manuelle précise (npx create-next-app) pour une maîtrise totale du bundle.

## 1.3 Journal des Modifications (Change Log)

| **Date** | **Version** | **Description** | **Auteur** |
| --- | --- | --- | --- |
| 12/01/2026 | v1.0 | Architecture Initiale Fullstack (Greenfield MVP) | Winston (Architecte) |
| 13/01/2026 | v1.1 | Mise à jour suite nouveau PRD 2.0 | FTR |
| 15/01/2026 | v1.2 | Mise à jour OpenAI vers Gemini | FTR |
| 15/01/2026 | v2.0 | Refonte complète pour simplification | FTR |
