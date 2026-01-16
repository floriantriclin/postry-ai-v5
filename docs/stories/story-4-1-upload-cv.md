# Story 4.1 : Upload & Stockage Sécurisé de CV

**Parent Epic:** Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

## Description

**En tant que** Utilisateur Connecté,
**Je veux** uploader mon CV (PDF/TXT) via une zone de dépôt,
**Afin de** fournir à l'IA le contexte de mon expérience professionnelle.

**Type :** Backend / Feature

## Critères d'Acceptation

1.  Zone "Drag & Drop" dans le Dashboard.
2.  Upload vers Supabase Storage dans un bucket privé (RLS activé : user only).
3.  Validation du type (PDF/TXT uniquement) et de la taille (<5Mo).
4.  Feedback visuel de succès/échec de l'upload.
