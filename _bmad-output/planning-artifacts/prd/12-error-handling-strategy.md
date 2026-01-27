# 12. Error Handling Strategy

## Philosophie Générale

**"Fail gracefully, recover quickly, inform clearly."**

Les erreurs sont inévitables dans un système distribué avec dépendances externes (LLM, DB, Paiement). Notre stratégie vise à :

1. **Prévenir** : Validation stricte des inputs
2. **Détecter** : Logging et monitoring exhaustifs
3. **Récupérer** : Retries automatiques et fallbacks
4. **Informer** : Messages utilisateur clairs et actionnables

---

## 1. Classification des Erreurs

### Types d'Erreurs

| Type | Exemple | Récupérable ? | Action |
|------|---------|---------------|--------|
| **User Input** | Email invalide, champ vide | ✅ Oui | Validation frontend + message clair |
| **Business Logic** | Quota dépassé (5 posts) | ✅ Oui | Paywall avec CTA "Upgrade" |
| **External Service** | Timeout LLM, DB down | ⚠️ Partiel | Retry + fallback + message temporaire |
| **System** | Out of memory, crash serveur | ❌ Non | Log error + Sentry alert + page erreur 500 |

### Codes d'Erreur HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| **400** | Bad Request | Validation échouée (input invalide) |
| **401** | Unauthorized | User non authentifié |
| **402** | Payment Required | Quota dépassé (paywall) |
| **403** | Forbidden | User authentifié mais pas autorisé (RLS) |
| **404** | Not Found | Ressource inexistante |
| **429** | Too Many Requests | Rate limiting dépassé |
| **500** | Internal Server Error | Erreur serveur générique |
| **503** | Service Unavailable | LLM/DB temporairement indisponible |

---

## 2. Gestion d'Erreurs par Domaine

### 2.1 Erreurs LLM (Gemini/Claude)

**Causes fréquentes** :
- Timeout (>30s sans réponse)
- Rate limiting (trop de requêtes)
- Service unavailable (panne Gemini)
- Invalid response (JSON malformé)

**Stratégie** :

```typescript
// lib/llm/generate-with-retry.ts
async function generateWithRetry(prompt: string, maxRetries = 3) {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await geminiClient.generateContent(prompt);
      return parseResponse(response); // Validation Zod
      
    } catch (error) {
      lastError = error;
      
      // Retry si timeout ou 503
      if (isRetryable(error)) {
        await sleep(attempt * 2000); // Exponential backoff
        continue;
      }
      
      // Ne pas retry si rate limit (429) ou erreur de validation
      break;
    }
  }
  
  // Tous les retries échoués
  throw new LLMError('Génération impossible après 3 tentatives', { cause: lastError });
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Timeout (1ère tentative) | "Génération en cours... Cela prend plus de temps que prévu." |
| Timeout (3 retries) | "⚠️ Le service de génération est surchargé. Réessayez dans 2 minutes." |
| Rate Limit | "⏸️ Limite temporaire atteinte. Réessayez dans 1 minute." |
| Service Down | "🔧 Service temporairement indisponible. Nous travaillons dessus. Réessayez dans 5 minutes." |

**Fallback** : Proposer une génération simplifiée (prompt de secours) si Gemini indisponible.

---

### 2.2 Erreurs d'Authentification

**Causes fréquentes** :
- Email invalide
- Magic Link expiré (>1h)
- Session expirée
- User déjà connecté ailleurs

**Stratégie** :

```typescript
// app/api/auth/callback/route.ts
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Validation
    const emailSchema = z.string().email();
    const validatedEmail = emailSchema.parse(email);
    
    // Send Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email: validatedEmail,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm` }
    });
    
    if (error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Attendez 1 minute.' },
          { status: 429 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email invalide. Vérifiez le format.' },
        { status: 400 }
      );
    }
    
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du lien. Réessayez.' },
      { status: 500 }
    );
  }
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend | Action |
|--------|------------------|--------|
| Email invalide | "⚠️ Email invalide. Exemple : vous@exemple.com" | Reformater input |
| Lien expiré | "⏰ Ce lien a expiré. Demandez un nouveau lien." | Bouton "Renvoyer" |
| Rate limit | "⏸️ Trop de tentatives. Attendez 1 minute." | Désactiver bouton 60s |
| Erreur serveur | "❌ Erreur lors de l'envoi. Réessayez ou contactez support@postry.ai" | Bouton "Réessayer" |

---

### 2.3 Erreurs de Base de Données

**Causes fréquentes** :
- Connexion DB perdue
- Violation de contrainte (unique email)
- RLS policy bloque l'accès
- Timeout de requête (>5s)

**Stratégie** :

```typescript
// lib/db/with-retry.ts
async function queryWithRetry<T>(
  queryFn: () => Promise<PostgrestResponse<T>>,
  maxRetries = 2
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data, error } = await queryFn();
    
    if (!error) return { data, error: null };
    
    // Retry si timeout ou connexion perdue
    if (error.code === 'PGRST301' || error.message.includes('timeout')) {
      await sleep(attempt * 1000);
      continue;
    }
    
    // Ne pas retry si violation de contrainte
    return { data: null, error };
  }
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Timeout | "⏳ La sauvegarde prend du temps. Réessayez dans 30s." |
| Email déjà existant | "📧 Ce compte existe déjà. Connectez-vous ou utilisez un autre email." |
| RLS policy | "🔒 Accès refusé. Reconnectez-vous." |
| Erreur générique | "❌ Erreur de sauvegarde. Vos données sont conservées localement. Réessayez." |

---

### 2.4 Erreurs de Paiement (Stripe)

**Causes fréquentes** :
- Carte refusée
- Webhook Stripe non reçu
- Double paiement (idempotence)

**Stratégie** :

```typescript
// app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Idempotence: Check if already processed
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single();
    
    if (existingPayment) {
      console.log('Payment already processed:', session.id);
      return NextResponse.json({ received: true });
    }
    
    // Process payment...
    await activatePremium(session.customer_email);
  }
  
  return NextResponse.json({ received: true });
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Carte refusée | "💳 Paiement refusé. Vérifiez vos informations bancaires ou essayez une autre carte." |
| Webhook retard | "⏳ Paiement en cours de validation... Rechargez dans 30s." |
| Erreur Stripe | "❌ Erreur de paiement. Vous n'avez PAS été débité. Réessayez ou contactez support@postry.ai" |

---

### 2.5 Erreurs de Upload (CV)

**Causes fréquentes** :
- Fichier trop gros (>5Mo)
- Type invalide (pas PDF/TXT)
- Parsing échoué (PDF corrompu)

**Stratégie** :

```typescript
// app/api/cv/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validation taille
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux. Maximum 5Mo.' },
      { status: 400 }
    );
  }
  
  // Validation type
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format non supporté. Utilisez PDF ou TXT.' },
      { status: 400 }
    );
  }
  
  try {
    const text = await parsePDF(file);
    
    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'CV illisible ou vide. Vérifiez le fichier.' },
        { status: 400 }
      );
    }
    
    // Save to Supabase Storage...
    
  } catch (error) {
    console.error('CV parsing error:', error);
    return NextResponse.json(
      { error: 'Erreur de lecture du CV. Essayez un autre format.' },
      { status: 500 }
    );
  }
}
```

**Messages Utilisateur** :

| Erreur | Message Frontend |
|--------|------------------|
| Fichier trop gros | "📦 Fichier trop volumineux (max 5Mo). Compressez-le ou utilisez un extrait." |
| Format invalide | "📄 Format non supporté. Utilisez PDF ou TXT uniquement." |
| Parsing échoué | "🔍 Impossible de lire ce fichier. Est-il corrompu? Essayez un autre CV." |

---

## 3. Logging et Monitoring

### Outils

- **Frontend** : Sentry (erreurs client)
- **Backend** : Vercel Logs + Sentry (erreurs serveur)
- **Monitoring** : Vercel Analytics + Uptime Robot

### Structure des Logs

```typescript
// lib/logger.ts
export function logError(context: string, error: Error, metadata?: Record<string, any>) {
  console.error(`[${context}]`, {
    message: error.message,
    stack: error.stack,
    ...metadata,
    timestamp: new Date().toISOString()
  });
  
  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { context },
      extra: metadata
    });
  }
}
```

### Alertes Critiques

Déclencher une alerte Slack/Email si :

- Taux d'erreur >5% sur 5 minutes
- LLM timeout >30s pour >3 requêtes consécutives
- Webhook Stripe non reçu pendant >2 minutes
- Base de données inaccessible

---

## 4. Pages d'Erreur Utilisateur

### 404 - Page Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-gray-600">Cette page n'existe pas.</p>
      <a href="/" className="mt-6 text-blue-500">
        Retour à l'accueil
      </a>
    </div>
  );
}
```

### 500 - Internal Server Error

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600">Oups!</h1>
      <p className="mt-4 text-gray-600">
        Une erreur inattendue s'est produite.
      </p>
      <button
        onClick={reset}
        className="mt-6 bg-black text-white px-6 py-3"
      >
        Réessayer
      </button>
      <p className="mt-4 text-sm text-gray-400">
        Si le problème persiste : support@postry.ai
      </p>
    </div>
  );
}
```

---

## 5. Checklist de Gestion d'Erreurs

Avant de merger une nouvelle feature, vérifier :

- [ ] **Validation des inputs** : Schémas Zod appliqués
- [ ] **Try-catch présents** : Tous les appels externes wrapped
- [ ] **Messages utilisateur** : Clairs et actionnables
- [ ] **Logs structurés** : Context + metadata
- [ ] **Retry logic** : Pour erreurs récupérables
- [ ] **Fallbacks** : Plan B si service externe down
- [ ] **Tests d'erreurs** : Scénarios d'échec testés

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0
