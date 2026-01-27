# 11. Stratégie de Gestion des Erreurs

## Approche Générale

Nous adoptons une stratégie défensive :

1. **Fail Gracefully :** L'interface ne doit jamais crasher blanc (White Screen of Death).
2. **User-Friendly Messages :** Traduire les erreurs techniques (500, 402) en messages humains ("Oups, nos serveurs surchauffent", "Quota épuisé").
3. **Logging Serveur :** Toutes les erreurs API/Server Action sont logguées (console Vercel pour le MVP).

## Patterns d'Erreur

### 1. Erreurs API (Backend)

Format de réponse standard JSON pour toutes les routes API :

```tsx
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: any } };
```

Codes d'erreur métier :

- QUOTA_EXCEEDED (402) : Plus de crédits. -> Déclenche la modal Paywall côté front.
- AUTH_REQUIRED (401) : Session invalide. -> Redirection vers Login.
- AI_SERVICE_UNAVAILABLE (503) : Gemini est down ou timeout. -> Retry automatique ou message "Réessayez".
- INVALID_INPUT (400) : Validation Zod échouée.

### 2. Erreurs Frontend (React)

- **Error Boundaries :** Envelopper les composants majeurs (QuizEngine, Dashboard) dans un Error Boundary React pour capturer les crashs JS et afficher une UI de secours ("Reload this section").
- **Toast Notifications :** Utilisation de sonner ou react-hot-toast pour afficher les erreurs transitoires (ex: "Upload échoué").

### 3. Erreurs Critiques (Sécurité)

- **Fuite de données :** Si une requête demande un post qui n'appartient pas à l'user -> 404 Not Found (plutôt que 403 Forbidden, pour ne pas révéler l'existence de la ressource).

## Logging & Monitoring

- **Logs :** console.error structuré côté serveur (Vercel Logs).
    - Format : [SERVICE] [ERROR_CODE] Message { meta }
    - Exemple : [GEMINI] [TIMEOUT] Failed to generate quiz for theme 'Sales' { duration: 15005ms }
- **Alerting (MVP) :** Pas de Sentry pour l'instant. Surveillance manuelle du dashboard Vercel en phase de lancement.
