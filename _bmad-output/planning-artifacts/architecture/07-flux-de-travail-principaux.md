# 07. Flux de Travail Principaux

## Diagramme de Séquence : Tunnel d'Acquisition (Discovery -> Reveal)

Ce flux détaille le chemin critique de l'utilisateur anonyme jusqu'à la création de compte.

```mermaid
sequenceDiagram
    actor User as Visiteur
    participant Client as Next.js Client
    participant API as Next.js API
    participant LLM as Gemini 2.5
    participant DB as Supabase

    Note over User, DB: Phase 1 : Découverte (Anonyme)
    User->>Client: Clic "Start" (Thème: "Vente")
    Client->>API: GET /api/quiz?theme=Vente
    API->>LLM: Prompt "Génère 2 choix A/B..."
    LLM-->>API: JSON Questions
    API-->>Client: Questions
    
    loop Quiz Interaction
        User->>Client: Sélectionne A ou B (State Local)
    end
    
    User->>Client: Saisie Sujet Final & "Générer"
    Client->>API: POST /api/post/generate (Réponses + Sujet)
    API->>LLM: Prompt "Ghostwriter" (Profil + Sujet)
    LLM-->>API: Texte du Post
    API-->>Client: Texte Markdown
    Client-->>User: Affichage Flouté (Blurred Preview)

    Note over User, DB: Phase 2 : Conversion (Sécurisée)
    User->>Client: Clic "Révéler" (Saisie Email)
    Client->>Client: Verrouillage Historique (Anti-Back)
    Client->>API: POST /api/quiz/pre-persist (Email + Données Quiz/Post)
    API->>DB: INSERT posts (status: pending, linked to email)
    API-->>Client: Success
    Client->>DB: Auth.signInWithOtp(email)
    DB-->>User: Envoi Email Magic Link
    
    Note over User, DB: Phase 3 : Révélation (Authentifié - Multi-Device)
    User->>Client: Clic Lien Email (Retour sur /dashboard)
    Client->>API: GET /api/quiz/reveal (Session Auth)
    API->>DB: SELECT post WHERE email = auth.email AND status = pending
    DB-->>API: Data
    API->>DB: UPDATE post (status: revealed)
    API-->>Client: Markdown Content
    Client-->>User: Affichage Post Net (Déflouté)
```

## Diagramme de Séquence : Upload et Analyse CV

Ce flux montre comment nous gérons les fichiers lourds et l'IA de manière asynchrone côté serveur.

```mermaid
sequenceDiagram
    actor User as Utilisateur (Auth)
    participant Client as Next.js Client
    participant Action as Server Action (Upload)
    participant Storage as Supabase Storage
    participant Parser as PDF Parser Lib
    participant DB as Supabase DB

    User->>Client: Drag & Drop CV (PDF)
    Client->>Action: POST FormData (Fichier)
    
    par Stockage Physique
        Action->>Storage: Upload vers bucket 'private-cvs'
    and Extraction Texte
        Action->>Parser: Extract Text from Buffer
        Parser-->>Action: Texte Brut
        Action->>DB: UPDATE users SET profile_context = Texte
    end
    
    Action-->>Client: Succès ("CV Analysé")
    Client-->>User: Toast "Profil mis à jour"
```
