# Note Technique: Cleanup Job Posts Orphelins

**Date:** 27 Janvier 2026  
**Créé par:** Scrum Master (Architecture Meeting)  
**Prévu pour:** Story 4 - Mise en prod MVP  
**Priorité:** MEDIUM (Production readiness)  
**Linear:** TODO - Créer issue séparée

---

## 🎯 Contexte

Avec la nouvelle architecture **Persist-First** (BMA-45), les posts sont créés en base de données **AVANT** l'authentification utilisateur, avec `status: 'pending'`.

**Flow:**
```
Quiz → Email Submit → POST /api/posts/anonymous
                      ↓
              Post créé avec status='pending'
                      ↓
              Magic link envoyé
                      ↓
         User clique magic link → Auth
                      ↓
         POST /api/posts/link-to-user
                      ↓
         status: 'pending' → 'revealed'
```

---

## ⚠️ Problème: Posts Orphelins

**Scénario:**
1. User complète quiz
2. Post créé avec `status: 'pending'`
3. User **ne clique jamais** le magic link (oubli, spam, mauvais email)
4. Post reste `pending` **indéfiniment** en DB

**Impact:**
- Croissance linéaire des posts orphelins
- Pollution base de données
- Coût de stockage inutile
- Analytique faussée

---

## ✅ Solution: Cleanup Job

### Objectif

Supprimer automatiquement les posts avec `status: 'pending'` de plus de **24 heures**.

### Spécifications Techniques

**1. Job Cron**
```typescript
// app/api/cron/cleanup-pending-posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  // Vérifier auth token cron (Vercel Cron Secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Supprimer posts pending > 24h
    const { data: deletedPosts, error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo)
      .select('id');

    if (error) {
      console.error('Cleanup job error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log(`Cleanup job: Deleted ${deletedPosts?.length || 0} pending posts`);

    return NextResponse.json({
      success: true,
      deleted: deletedPosts?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Cleanup job exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

**2. Configuration Vercel Cron**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-pending-posts",
      "schedule": "0 3 * * *"  // Tous les jours à 3h du matin (UTC)
    }
  ]
}
```

**3. Variables d'Environnement**
```bash
# .env
CRON_SECRET=your_random_secret_here_generate_with_openssl
```

Générer le secret:
```bash
openssl rand -base64 32
```

---

## 📊 Métriques & Monitoring

### Métriques à Tracker

```sql
-- Nombre de posts pending actuels
SELECT COUNT(*) FROM posts WHERE status = 'pending';

-- Âge moyen des posts pending
SELECT AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600) as avg_age_hours
FROM posts WHERE status = 'pending';

-- Posts pending par jour (historique)
SELECT DATE(created_at), COUNT(*)
FROM posts
WHERE status = 'pending'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;
```

### Alerting

**Seuils d'alerte:**
- 🟡 WARNING: > 100 posts pending
- 🔴 CRITICAL: > 500 posts pending
- 🔴 CRITICAL: Job cleanup échoue 2x consécutives

**Notifications:**
- Slack channel #monitoring
- Email équipe technique
- PagerDuty (si prod critique)

---

## 🧪 Tests Requis

### Test Unitaire
```typescript
// __tests__/api/cron/cleanup-pending-posts.test.ts

describe('Cleanup Pending Posts Cron', () => {
  it('should delete posts pending > 24h', async () => {
    // Create test posts
    const oldPost = await createTestPost({ status: 'pending', createdAt: '2024-01-01' });
    const recentPost = await createTestPost({ status: 'pending', createdAt: new Date() });
    
    // Run cleanup
    const response = await GET(mockRequest);
    
    // Verify
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.deleted).toBe(1);
    
    // Old post deleted, recent kept
    const oldPostExists = await getPost(oldPost.id);
    const recentPostExists = await getPost(recentPost.id);
    expect(oldPostExists).toBeNull();
    expect(recentPostExists).not.toBeNull();
  });

  it('should require valid auth token', async () => {
    const response = await GET(mockRequestWithoutAuth);
    expect(response.status).toBe(401);
  });

  it('should not delete revealed posts', async () => {
    const revealedPost = await createTestPost({ status: 'revealed', createdAt: '2024-01-01' });
    
    await GET(mockRequest);
    
    const postExists = await getPost(revealedPost.id);
    expect(postExists).not.toBeNull();
  });
});
```

### Test Manuel
```bash
# 1. Créer posts de test en DB
INSERT INTO posts (email, status, created_at, content, theme)
VALUES ('test@example.com', 'pending', NOW() - INTERVAL '25 hours', 'test', 'test');

# 2. Déclencher job manuellement
curl -X GET https://yourapp.com/api/cron/cleanup-pending-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 3. Vérifier suppression
SELECT * FROM posts WHERE email = 'test@example.com' AND status = 'pending';
-- Devrait retourner 0 résultat
```

---

## 🚀 Plan de Déploiement

### Phase 1: Development
- [ ] Créer endpoint `/api/cron/cleanup-pending-posts`
- [ ] Tests unitaires (couverture > 90%)
- [ ] Tests manuels en dev

### Phase 2: Staging
- [ ] Déployer sur staging
- [ ] Configurer Vercel Cron (schedule test: toutes les heures)
- [ ] Monitoring 7 jours
- [ ] Valider métriques

### Phase 3: Production
- [ ] Déployer sur prod
- [ ] Configurer Vercel Cron (schedule final: 3h UTC)
- [ ] Setup alerting (Slack + Email)
- [ ] Monitoring 30 jours

---

## 📋 Critères d'Acceptation

### AC1: Cleanup Fonctionnel
- [ ] Job supprime posts `pending` > 24h
- [ ] Job préserve posts `pending` < 24h
- [ ] Job préserve tous posts `revealed`
- [ ] Job s'exécute tous les jours à 3h UTC

### AC2: Sécurité
- [ ] Endpoint protégé par auth token
- [ ] Token stocké dans variable d'environnement
- [ ] Logs ne contiennent pas de secrets

### AC3: Monitoring
- [ ] Métriques tracking nombre de posts deleted
- [ ] Alerting si job échoue
- [ ] Dashboard avec statistiques cleanup

### AC4: Tests
- [ ] Tests unitaires > 90% coverage
- [ ] Tests E2E validant cleanup en staging
- [ ] Test manuel de rollback si problème

---

## 🔗 Références

**Architecture:**
- BMA-45: Architecture Persist-First
- Story 2.11: Epic 2 Bug Fixes

**Documentation:**
- Vercel Cron: https://vercel.com/docs/cron-jobs
- Supabase Admin SDK: https://supabase.com/docs/reference/javascript/auth-admin-api

**Related Issues:**
- TODO: Créer issue Linear pour Story 4

---

## ⏰ Timeline

**Story 4 (Mise en prod MVP):**
- Semaine 1: Développement + Tests
- Semaine 2: Déploiement Staging + Monitoring
- Semaine 3: Déploiement Prod

**Effort estimé:** 4-5 heures
- Endpoint: 1h
- Tests: 1.5h
- Config Vercel: 0.5h
- Monitoring setup: 1h
- Documentation: 1h

---

**Créé le:** 27 Janvier 2026  
**Statut:** 📝 Planifié pour Story 4  
**Owner:** Dev Lead (à assigner)
