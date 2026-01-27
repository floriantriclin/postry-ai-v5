# 09. Détails de l'Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

**Objectif de l'Epic** : Intégrer l'upload et le parsing de CV (RAG), l'injection de faits dans la génération pour l'ancrage d'expertise, et activer le modèle économique (Quotas/Paiement) pour la viabilité business.

### Story 4.1 : Upload & Stockage Sécurisé de CV

**En tant que** Utilisateur Connecté,

**Je veux** uploader mon CV (PDF/TXT) via une zone de dépôt,

**Afin de** fournir à l'IA le contexte de mon expérience professionnelle.

**Type** : Backend / Feature

**INVEST Check** :

- **I** : Indépendant du parsing ou de la génération.
- **S** : Focus sur l'upload fichier et sécurité.
- **V** : Première étape de la personnalisation avancée.
    
    **Critères d'Acceptation** :
    
1. Zone "Drag & Drop" dans le Dashboard.
2. Upload vers Supabase Storage dans un bucket privé (RLS activé : user only).
3. Validation du type (PDF/TXT uniquement) et de la taille (<5Mo).
4. Feedback visuel de succès/échec de l'upload.

### Story 4.2 : Parsing CV & Extraction (Service RAG)

**En tant que** Système,

**Je veux** extraire le texte brut du fichier uploadé et le structurer minimalement,

**Afin de** le rendre consommable par le LLM.

**Type** : Backend

**INVEST Check** :

- **I** : Indépendant de l'upload (déclenché par événement ou API).
- **S** : Focus sur la transformation Fichier -> Texte.
    
    **Critères d'Acceptation** :
    
1. Fonction backend (Edge Function ou API Route) qui lit le fichier.
2. Utilisation d'une librairie de parsing PDF (ex: pdf-parse) pour extraire le texte.
3. Nettoyage basique (suppression caractères spéciaux bizarres).
4. Stockage du texte extrait (ou d'un résumé structuré par LLM) dans la table users (champ profile_context).
5. (Optionnel MVP) : Pas de vectorisation complexe, on stocke le texte brut ou résumé car la fenêtre de contexte Gemini 2.5 Flash est large.

### Story 4.3 : Génération avec Ancrage Factuel (Injection)

**En tant que** Utilisateur avec un CV uploadé,

**Je veux** que mes générations utilisent automatiquement des faits de mon parcours,

**Afin de** produire du contenu qui prouve mon expertise réelle.

**Type** : AI / Feature

**INVEST Check** :

- **I** : Modifie le prompt de génération existant.
- **V** : Délivre la promesse "Ancrage Factuel".
    
    **Critères d'Acceptation** :
    
1. Mise à jour de l'API /api/post/generate et /regenerate.
2. Si profile_context existe, injection dans le System Prompt : "Utilise le contexte suivant pour ancrer le post dans la réalité de l'utilisateur : [Contexte]".
3. Le post généré cite explicitement une expérience ou compétence du CV pertinente pour le sujet.

### Story 4.4 : Compteur de Crédits & Hard Paywall (Logique)

**En tant que** Product Owner,

**Je veux** bloquer la génération si l'utilisateur a consommé ses 5 crédits gratuits,

**Afin de** forcer la conversion vers le payant.

**Type** : Business Logic

**INVEST Check** :

- **I** : Indépendant du paiement (bloque juste).
- **V** : Protège les coûts et pousse à l'achat.
    
    **Critères d'Acceptation** :
    
1. Champ credits_count décrémenté à chaque génération réussie.
2. Les "Régénérations" (Equalizer) sur un *même* post coûtent 0 crédit 
3. API Check : Si credits_count <= 0, l'API retourne une erreur 402 ou 403 "Quota Exceeded".
4. Frontend : Affiche le solde restant (ex: "2/5 posts restants").
5. Frontend : Si solde 0, bouton "Générer" désactivé et remplacé par "Passer Premium".

### Story 4.5 : Intégration Stripe Checkout (Paiement)

**En tant que** Utilisateur bloqué,

**Je veux** cliquer sur "Passer Premium", payer par carte et être débloqué instantanément,

**Afin de** continuer à utiliser l'outil.

**Type** : Integration

**INVEST Check** :

- **I** : Connecte le bouton au service de paiement.
- **V** : Génère du revenu.
    
    **Critères d'Acceptation** :
    
1. Bouton "Upgrade" redirige vers une URL Stripe Checkout (Session hébergée).
2. Webhook Stripe configuré pour écouter l'événement checkout.session.completed.
3. À réception du webhook, mise à jour du user : is_premium = true (ou credits = 9999).
4. Redirection utilisateur vers Dashboard avec message de succès et crédits débloqués.
