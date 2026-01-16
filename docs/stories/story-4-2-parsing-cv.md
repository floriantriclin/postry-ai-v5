# Story 4.2 : Parsing CV & Extraction (Service RAG)

**Parent Epic:** Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

## Description

**En tant que** Système,
**Je veux** extraire le texte brut du fichier uploadé et le structurer minimalement,
**Afin de** le rendre consommable par le LLM.

**Type :** Backend

## Critères d'Acceptation

1.  Fonction backend (Edge Function ou API Route) qui lit le fichier.
2.  Utilisation d'une librairie de parsing PDF (ex: pdf-parse) pour extraire le texte.
3.  Nettoyage basique (suppression caractères spéciaux bizarres).
4.  Stockage du texte extrait (ou d'un résumé structuré par LLM) dans la table `users` (champ `profile_context`).
5.  (Optionnel MVP) : Pas de vectorisation complexe, on stocke le texte brut ou résumé car la fenêtre de contexte Gemini 2.5 Flash est large.
