# 14. Security & Compliance

## Vision

**"Security is not a feature, it's a foundation."**

**postry.ai** traite des données sensibles (emails, CVs, contenu professionnel). La sécurité et la conformité RGPD ne sont pas optionnelles.

---

## 1. Conformité RGPD (Règlement Général sur la Protection des Données)

### Principes RGPD

| Principe | Application postry.ai |
|----------|----------------------|
| **Licéité, loyauté, transparence** | Politique de confidentialité claire + Consentement explicite |
| **Limitation des finalités** | Données utilisées uniquement pour génération de posts et amélioration du service |
| **Minimisation des données** | On ne collecte que le nécessaire (email, CV optionnel, réponses quiz) |
| **Exactitude** | Users peuvent modifier leur profil |
| **Limitation de la conservation** | Rétention: CVs (90j inactivité), Posts (tant que compte actif) |
| **Intégrité et confidentialité** | Chiffrement au repos + HTTPS obligatoire |

---

### 1.1 Données Collectées

| Donnée | Obligatoire ? | Finalité | Rétention |
|--------|---------------|----------|-----------|
| **Email** | ✅ Oui | Authentification + Communication | Tant que compte actif |
| **Réponses Quiz** | ✅ Oui | Calcul archétype + Génération personnalisée | Tant que compte actif |
| **Posts générés** | ✅ Oui | Historique + Régénération | Tant que compte actif |
| **CV (PDF/TXT)** | ❌ Non | Ancrage factuel (RAG) | 90 jours inactivité OU suppression sur demande |
| **Données de paiement** | ⚠️ Stripe only | Abonnement Premium | 7 ans (obligation légale) |
| **Adresse IP** | ⚠️ Logs serveur | Sécurité (rate limiting) | 30 jours |

**Important** : Nous ne collectons **jamais** :
- Numéro de téléphone
- Adresse postale
- Informations bancaires directes (géré par Stripe)

---

### 1.2 Base Légale du Traitement

| Traitement | Base Légale RGPD |
|------------|------------------|
| Authentification + Service | **Exécution du contrat** (Art. 6.1.b) |
| Analytics (Posthog) | **Consentement** (Art. 6.1.a) via Cookie Banner |
| Emails transactionnels (Magic Link) | **Exécution du contrat** |
| Emails marketing (newsletter) | **Consentement** (opt-in explicite) |
| Amélioration du service (feedback) | **Intérêt légitime** (Art. 6.1.f) |

---

### 1.3 Droits des Utilisateurs

**Droits RGPD à implémenter** :

| Droit | Implémentation | Délai de Réponse |
|-------|----------------|------------------|
| **Droit d'accès** (Art. 15) | Bouton "Télécharger mes données" dans Dashboard | <30 jours |
| **Droit de rectification** (Art. 16) | Modification profil + posts dans Dashboard | Immédiat |
| **Droit à l'effacement** (Art. 17) | Bouton "Supprimer mon compte" | <7 jours |
| **Droit à la portabilité** (Art. 20) | Export JSON (profil + posts) | <30 jours |
| **Droit d'opposition** (Art. 21) | Opt-out analytics + emails marketing | Immédiat |

**Workflow de Suppression de Compte** :

```typescript
// app/api/account/delete/route.ts
export async function DELETE(request: Request) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 1. Anonymiser les posts (garder pour analytics agrégées)
  await supabase
    .from('posts')
    .update({
      user_id: 'deleted_user',
      email: null,
      content: '[DELETED]'
    })
    .eq('user_id', user.id);
  
  // 2. Supprimer le CV (Supabase Storage)
  const { data: files } = await supabase.storage
    .from('cvs')
    .list(user.id);
  
  if (files) {
    const filePaths = files.map(f => `${user.id}/${f.name}`);
    await supabase.storage.from('cvs').remove(filePaths);
  }
  
  // 3. Supprimer l'utilisateur (Supabase Auth)
  await supabase.auth.admin.deleteUser(user.id);
  
  // 4. Log l'opération (obligation RGPD)
  console.log(`Account deleted: ${user.id} at ${new Date().toISOString()}`);
  
  return NextResponse.json({ success: true });
}
```

---

### 1.4 Documents Légaux Obligatoires

**À créer avant lancement public** :

1. **Politique de Confidentialité** (`/privacy`)
   - Données collectées
   - Finalités
   - Rétention
   - Droits RGPD
   - Contact DPO (Data Protection Officer) ou équivalent

2. **Conditions Générales d'Utilisation** (`/terms`)
   - Utilisation du service
   - Propriété intellectuelle
   - Limitation de responsabilité
   - Résiliation

3. **Politique de Cookies** (intégrée dans Privacy)
   - Types de cookies (Analytics, Auth)
   - Opt-in/Opt-out

**Templates recommandés** :
- [Termly.io](https://termly.io/) (générateur gratuit)
- [iubenda](https://www.iubenda.com/) (payant mais complet)

---

### 1.5 Cookie Banner

**Implémentation** :

```typescript
// components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { posthog } from '@/lib/analytics';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      posthog.opt_in_capturing();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    posthog.opt_in_capturing();
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    posthog.opt_out_capturing();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Nous utilisons des cookies pour améliorer votre expérience. 
          <a href="/privacy" className="underline ml-1">En savoir plus</a>
        </p>
        <div className="flex gap-4">
          <button onClick={handleReject} className="text-sm underline">
            Refuser
          </button>
          <button onClick={handleAccept} className="bg-white text-black px-4 py-2 rounded">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Sécurité Applicative

### 2.1 Authentification

**Stack** : Supabase Auth (Magic Link)

**Sécurité** :
- ✅ Pas de mot de passe stocké (zero-password)
- ✅ Magic Link valide 1h seulement
- ✅ Token JWT signé (HS256)
- ✅ Refresh token rotation activée

**Rate Limiting** :
- Max 5 Magic Links / 5 minutes / email
- Max 10 tentatives de login / heure / IP

```typescript
// middleware.ts (Next.js Edge Middleware)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '5 m'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/signin') {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 5 minutes.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}
```

---

### 2.2 Autorisation (RLS - Row Level Security)

**Supabase RLS Policies** :

```sql
-- Table: posts
-- Policy: Users can only read their own posts
CREATE POLICY "Users can read own posts"
ON public.posts
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own posts
CREATE POLICY "Users can insert own posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id);
```

**Test RLS** :

```typescript
// __tests__/security/rls.test.ts
test('User cannot read another user\'s posts', async () => {
  const userA = await createTestUser('usera@example.com');
  const userB = await createTestUser('userb@example.com');

  await createTestPost({ user_id: userA.id, content: 'Secret A' });

  const { data } = await supabaseAsUserB
    .from('posts')
    .select('*')
    .eq('user_id', userA.id);

  expect(data).toEqual([]); // UserB ne voit rien
});
```

---

### 2.3 Chiffrement

**Au repos** :
- ✅ Supabase PostgreSQL : Chiffrement AES-256 par défaut
- ✅ Supabase Storage (CVs) : Chiffrement au repos activé

**En transit** :
- ✅ HTTPS obligatoire (TLS 1.3)
- ✅ Vercel force HTTPS redirect

**Données sensibles** :
- CVs stockés dans bucket privé (RLS)
- Posts accessibles uniquement via auth

---

### 2.4 Validation des Entrées

**Stack** : [Zod](https://zod.dev/) pour la validation

**Exemple** :

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const PostGenerationSchema = z.object({
  theme: z.string().min(5).max(200),
  vector: z.object({
    formality: z.number().min(1).max(10),
    logic_emotion: z.number().min(1).max(10),
    // ... autres dimensions
  }),
  profile: z.object({
    label_final: z.string(),
    definition_longue: z.string()
  })
});

// Usage dans API Route
export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const validated = PostGenerationSchema.parse(body);
    // Proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
  }
}
```

---

### 2.5 Protection XSS & CSRF

**XSS (Cross-Site Scripting)** :
- ✅ React échappe automatiquement le contenu par défaut
- ✅ Utiliser `dangerouslySetInnerHTML` **uniquement** si nécessaire (sanitiser avec DOMPurify)

**CSRF (Cross-Site Request Forgery)** :
- ✅ Next.js API Routes protégées par SameSite cookies
- ✅ Supabase JWT token validé côté serveur

**Headers de Sécurité** :

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

---

### 2.6 Gestion des Secrets

**Variables d'Environnement** :

```bash
# .env.local (JAMAIS commité dans Git)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

SUPABASE_SERVICE_ROLE_KEY=eyJyyy... # ⚠️ SENSIBLE - Backend only
STRIPE_SECRET_KEY=sk_test_xxx # ⚠️ SENSIBLE
STRIPE_WEBHOOK_SECRET=whsec_xxx # ⚠️ SENSIBLE
GEMINI_API_KEY=AIzaSyxxx # ⚠️ SENSIBLE
```

**Règles** :
- ❌ JAMAIS commiter `.env.local`
- ✅ Ajouter `.env.local` dans `.gitignore`
- ✅ Utiliser Vercel Environment Variables pour la prod
- ✅ Préfixer les variables publiques avec `NEXT_PUBLIC_`

---

## 3. Audits et Monitoring

### 3.1 Audits Réguliers

| Fréquence | Type d'Audit | Responsable |
|-----------|--------------|-------------|
| **Mensuel** | Revue des logs d'accès (qui accède à quoi?) | Tech Lead |
| **Trimestriel** | Audit des dépendances npm (vulnérabilités) | Dev Team |
| **Annuel** | Audit de sécurité complet (pentesting externe) | RSSI / Consultant |

**Outils** :
- `npm audit` : Détection vulnérabilités npm
- [Snyk](https://snyk.io/) : Monitoring continu
- [OWASP ZAP](https://www.zaproxy.org/) : Pentesting automatisé

---

### 3.2 Logging des Actions Sensibles

**Events à logger** :

```typescript
// lib/audit-log.ts
export function logAuditEvent(event: {
  user_id: string;
  action: string;
  resource: string;
  ip_address: string;
  timestamp: Date;
}) {
  console.log('[AUDIT]', JSON.stringify(event));
  
  // En prod: envoyer vers Supabase ou service dédié
  if (process.env.NODE_ENV === 'production') {
    supabase.from('audit_logs').insert(event);
  }
}

// Usage
logAuditEvent({
  user_id: user.id,
  action: 'DELETE_ACCOUNT',
  resource: 'account',
  ip_address: request.headers.get('x-forwarded-for'),
  timestamp: new Date()
});
```

---

## 4. Incident Response Plan

### En Cas de Breach (Violation de Données)

**Étapes** :

1. **Détection** (0-1h) :
   - Identifier la brèche via monitoring/alertes
   - Isoler le système compromis

2. **Containment** (1-4h) :
   - Bloquer l'accès malveillant
   - Sauvegarder les logs pour investigation

3. **Notification CNIL** (< 72h) :
   - Si données personnelles affectées: notifier la CNIL
   - Email: donnees-personnelles@cnil.fr

4. **Notification Users** (< 72h) :
   - Si risque élevé pour les utilisateurs: les notifier par email

5. **Remediation** (1-2 semaines) :
   - Patcher la vulnérabilité
   - Audit complet post-incident
   - Documentation du post-mortem

---

## 5. Checklist de Sécurité Pré-Lancement

Avant de lancer en production :

- [ ] **RGPD** :
  - [ ] Politique de confidentialité publiée
  - [ ] CGU publiées
  - [ ] Cookie banner implémenté
  - [ ] Bouton "Supprimer mon compte" fonctionnel
  - [ ] Export de données implémenté

- [ ] **Auth** :
  - [ ] Magic Link fonctionnel
  - [ ] Rate limiting activé
  - [ ] Session timeout configuré (7 jours)

- [ ] **Autorisation** :
  - [ ] RLS policies testées
  - [ ] Pas de fuite de données inter-users

- [ ] **Chiffrement** :
  - [ ] HTTPS forcé
  - [ ] CVs chiffrés au repos

- [ ] **Validation** :
  - [ ] Tous les endpoints validés avec Zod

- [ ] **Headers** :
  - [ ] CSP, X-Frame-Options, etc. configurés

- [ ] **Secrets** :
  - [ ] Aucun secret dans le code
  - [ ] Variables d'environnement Vercel configurées

- [ ] **Monitoring** :
  - [ ] Sentry configuré
  - [ ] Alertes critiques activées

---

**Date de dernière mise à jour** : 2026-01-27  
**Version** : 4.0
