# 🔴 Bugs Critiques Epic 2 - Action Items

**Date de l'audit :** 2026-01-27  
**Auditeur :** AI Assistant  
**Epic :** Epic 2 - Conversion & Identité  
**Priorité :** HAUTE - Bloquants production

---

## 📋 Vue d'ensemble

| # | Bug | Story | Impact | Effort | Status |
|---|-----|-------|--------|--------|--------|
| BUG-001 | Double appel handleAuthSession | 2.4 | 🔴 Données corrompues | 2h | 🔴 TODO |
| BUG-002 | Dashboard crash avec multiple posts | 2.5 | 🔴 User bloqué | 1h | 🔴 TODO |
| BUG-003 | Colonne archetype manquante | 2.1 | 🔴 Affichage cassé | 30min | 🔴 TODO |
| BUG-004 | Data loss si persist-on-login fail | 2.4 | 🔴 Posts perdus | 4h | 🔴 TODO |

**Effort total estimé :** 7h30  
**Sprint recommandé :** Immédiat (hotfix si prod)

---

## 🐛 BUG-001 : Double appel handleAuthSession → Posts dupliqués

### Priorité
🔴 **CRITIQUE** - Corruption de données

### Description
Lorsqu'un utilisateur clique sur le Magic Link, la page `/auth/confirm` peut appeler `handleAuthSession()` deux fois :
1. Via `onAuthStateChange` listener (ligne 143-151)
2. Via `getUser()` initial check (ligne 154-169)

Cela entraîne deux appels à `POST /api/auth/persist-on-login`, créant des posts dupliqués dans la base de données.

### Impact Business
- **Données corrompues** : Création de doublons dans la table `posts`
- **Expérience dégradée** : User voit 2 posts identiques au Dashboard
- **Coûts API** : Appels LLM dupliqués (si génération dans le flow)
- **Confusion** : Metrics faussées (nombre de posts généré)

### Fichiers concernés
- `app/auth/confirm/page.tsx` (lignes 35-179)

### Étapes de reproduction
1. Compléter le quiz (générer un post en localStorage)
2. Saisir email pour recevoir Magic Link
3. Cliquer sur le lien dans l'email
4. Observer dans Supabase : 2 posts identiques créés avec le même `user_id` et `theme`

### Solution proposée

**Approche :** Ajouter un flag `sessionHandled` pour empêcher les appels multiples.

```typescript
// app/auth/confirm/page.tsx

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [sessionHandled, setSessionHandled] = useState(false); // ✅ NEW

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    const handleAuthSession = async (session: Session | null) => {
      // ✅ GUARD: Prevent double execution
      if (sessionHandled) {
        console.log('Session already handled, skipping');
        return;
      }
      
      if (session) {
        setSessionHandled(true); // ✅ Mark as handled IMMEDIATELY
        
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session }),
        });

        if (!response.ok) {
          console.error('Failed to set server session');
          setErrorMsg('Erreur serveur lors de la synchronisation de la session.');
          setSessionResolved(true);
          setSessionHandled(false); // ✅ Reset on error to allow retry
          return;
        }

        // Persist quiz data from localStorage if it exists
        const quizStateRaw = localStorage.getItem('ice_quiz_state_v1');
        if (quizStateRaw) {
          try {
            const quizState = JSON.parse(quizStateRaw);
            
            // Only persist if we have a generated post
            if (quizState.generatedPost && quizState.profileData && quizState.currentVector) {
              const persistResponse = await fetch('/api/auth/persist-on-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: session.user.email,
                  stylistic_vector: quizState.currentVector,
                  profile: quizState.profileData,
                  archetype: quizState.archetypeData?.archetype,
                  theme: quizState.postTopic || 'Sujet non disponible',
                  post_content: `${quizState.generatedPost.hook}\n\n${quizState.generatedPost.content}\n\n${quizState.generatedPost.cta}`,
                  hook: quizState.generatedPost.hook,
                  cta: quizState.generatedPost.cta,
                  style_analysis: quizState.generatedPost.style_analysis,
                  content_body: quizState.generatedPost.content,
                  quiz_answers: {
                    acquisition_theme: quizState.themeId,
                    p1: quizState.answersP1,
                    p2: quizState.answersP2
                  }
                })
              });

              if (persistResponse.ok) {
                console.log('Quiz data persisted successfully');
                // Clean up localStorage after successful persist
                localStorage.removeItem('ice_quiz_state_v1');
              } else {
                console.error('Failed to persist quiz data');
                // ✅ DON'T reset flag here - we already persisted or failed
              }
            }
          } catch (e) {
            console.error('Error persisting quiz data:', e);
          }
        }

        // Redirect directly to dashboard (no intermediate /quiz/reveal)
        router.replace('/dashboard');
        setSessionResolved(true);
      }
    };

    // ... rest of useEffect (hash checking, listeners)
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleAuthSession(session);
      }
      if(event === 'SIGNED_OUT') {
        setSessionResolved(true);
        router.replace('/');
      }
    });

    // Initial check in case the user is already logged in
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Error in initial getUser:", error);
        setErrorMsg("Erreur lors de la récupération de l'utilisateur.");
        setSessionResolved(true);
        return;
      }
      if(user) {
        // Get the session for handleAuthSession
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            handleAuthSession(session);
          }
        });
      }
    }).catch(err => {
        console.error("Error in initial getUser:", err);
        setErrorMsg("Erreur lors de la récupération de l'utilisateur.");
        setSessionResolved(true);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase, searchParams, sessionHandled]); // ✅ Add sessionHandled to deps
  
  // ... rest of component
}
```

### Tests à ajouter

**Test E2E** : `e2e/auth-duplicate-posts.spec.ts`

```typescript
test('Should not create duplicate posts on auth', async ({ page }) => {
  // 1. Complete quiz and generate post
  await completeQuizFlow(page);
  
  // 2. Trigger auth
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Envoyez-moi un lien")');
  
  // 3. Simulate Magic Link callback
  await page.goto('/auth/confirm#access_token=fake_token&refresh_token=fake_refresh');
  
  // 4. Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
  
  // 5. Verify only ONE post exists
  const postCount = await page.evaluate(async () => {
    const response = await fetch('/api/posts/count', {
      headers: { 'Authorization': 'Bearer ...' }
    });
    return response.json();
  });
  
  expect(postCount).toBe(1);
});
```

### Critères d'acceptation
- [ ] Flag `sessionHandled` ajouté
- [ ] Double appel impossible même si `onAuthStateChange` + `getUser` se déclenchent
- [ ] Test E2E valide la non-duplication
- [ ] Log console indique "Session already handled" si double trigger
- [ ] Retry possible si erreur API (flag reset)

---

## 🐛 BUG-002 : Dashboard crash avec multiple posts

### Priorité
🔴 **CRITIQUE** - User bloqué

### Description
Le Dashboard utilise `.single()` pour récupérer le post le plus récent, mais cette méthode Supabase génère une erreur si plusieurs lignes sont retournées. Si un utilisateur a plusieurs posts (ce qui arrivera après Epic 3), le Dashboard crash.

### Impact Business
- **Page blanche** : User ne peut plus accéder au Dashboard
- **Support overhead** : Users vont contacter le support
- **Rétention** : User frustré peut abandonner l'app
- **Blocage Epic 3** : Historique des posts impossible

### Fichiers concernés
- `app/dashboard/page.tsx` (lignes 30-36)

### Étapes de reproduction
1. Créer 2 posts pour le même user dans Supabase
2. Se connecter
3. Naviguer vers `/dashboard`
4. Observer : erreur Supabase "multiple rows returned for single()"

### Solution proposée

**Approche :** Retirer `.single()` et utiliser array indexing + filtrage par status.

```typescript
// app/dashboard/page.tsx

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // ✅ FIXED: Remove .single() and filter by status
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "revealed") // ✅ Only revealed posts
    .order("created_at", { ascending: false })
    .limit(1);

  // ✅ Handle array response
  const post = posts && posts.length > 0 ? posts[0] : null;

  if (error) {
    console.error('Dashboard: Error fetching posts', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Erreur de chargement</h1>
        <p className="mt-2 text-gray-600">Impossible de récupérer vos posts.</p>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        <a href="/quiz" className="mt-4 text-blue-500">Retourner au quiz</a>
      </div>
    );
  }

  if (!post) {
    // ✅ Clear distinction: no posts vs error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Aucun post généré</h1>
        <a href="/quiz" className="mt-4 text-blue-500">Retourner au quiz</a>
      </div>
    );
  }

  return (
      <div>
        <PostRevealView post={post} />
      </div>
    );
}
```

### Tests à ajouter

**Test E2E** : `e2e/dashboard-multiple-posts.spec.ts`

```typescript
test('Dashboard displays most recent post when multiple exist', async ({ page }) => {
  // Setup: Create 2 posts via API
  await createTestPost({ user_id: 'test-user', theme: 'Old Post', created_at: '2025-01-01' });
  await createTestPost({ user_id: 'test-user', theme: 'New Post', created_at: '2026-01-27' });
  
  // Navigate to dashboard
  await page.goto('/dashboard');
  
  // Should display the most recent post
  await expect(page.locator('h2:has-text("New Post")')).toBeVisible();
  await expect(page.locator('h2:has-text("Old Post")')).not.toBeVisible();
});
```

### Critères d'acceptation
- [ ] `.single()` retiré
- [ ] Array indexing utilisé (`posts[0]`)
- [ ] Filtre `status='revealed'` ajouté
- [ ] Messages d'erreur distincts (error vs no posts)
- [ ] Test E2E valide avec 2+ posts
- [ ] Pas de crash si user a 10+ posts

---

## 🐛 BUG-003 : Colonne archetype manquante dans table posts

### Priorité
🔴 **CRITIQUE** - Affichage cassé

### Description
Le composant `PostRevealView` cherche à afficher `post.archetype` (ligne 50), mais la colonne `archetype` n'existe pas dans la table `posts`. Actuellement, le fallback affiche "Archetype Inconnu" pour tous les posts.

### Impact Business
- **UX dégradée** : User voit "Archetype Inconnu" au lieu de son profil
- **Perte de valeur perçue** : L'archetype est une promesse clé du produit
- **Incohérence** : Les données existent (dans `equalizer_settings`) mais pas dans la bonne colonne

### Fichiers concernés
- `supabase/migrations/` (nouvelle migration nécessaire)
- `app/api/auth/persist-on-login/route.ts` (ligne 114-126)
- `app/dashboard/post-reveal-view.tsx` (ligne 50)

### Étapes de reproduction
1. Compléter le quiz
2. Se connecter et aller au Dashboard
3. Observer : "Tone: Archetype Inconnu" au lieu du vrai archetype

### Solution proposée

**Étape 1 : Créer migration**

Fichier : `supabase/migrations/20260127000000_add_archetype_to_posts.sql`

```sql
-- Add archetype column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS archetype TEXT;

COMMENT ON COLUMN public.posts.archetype IS 'Archetype name from ICE profiling (e.g., "Le Stratège")';

-- Backfill existing posts from equalizer_settings
UPDATE public.posts
SET archetype = (equalizer_settings->'archetype'->>'name')
WHERE archetype IS NULL 
  AND equalizer_settings IS NOT NULL 
  AND equalizer_settings->'archetype'->>'name' IS NOT NULL;
```

**Étape 2 : Mettre à jour l'API persist-on-login**

```typescript
// app/api/auth/persist-on-login/route.ts (ligne 114-126)

// Insert post with status='revealed' (not 'pending')
const { data: insertedPost, error: insertError } = await supabaseAdmin
  .from('posts')
  .insert({
    user_id: user.id,
    email: email,
    theme: theme,
    content: post_content,
    archetype: archetype?.name || null, // ✅ ADD archetype field
    quiz_answers: quiz_answers || null,
    equalizer_settings: metaData,
    status: 'revealed'
  })
  .select()
  .single();
```

**Étape 3 : Vérifier le fallback dans PostRevealView**

```typescript
// app/dashboard/post-reveal-view.tsx (ligne 47-51)

const meta = post?.equalizer_settings as any;
const components = meta?.generated_components;

// ✅ UPDATED: Prefer post.archetype (DB column) over nested JSON
const archetypeLabel = 
  post.archetype || // ✅ New: Direct DB column
  meta?.profile?.label_final || 
  meta?.archetype?.name || 
  "Archetype Inconnu";
```

### Tests à ajouter

**Test migration** : `supabase/migrations/20260127000000_add_archetype_to_posts.test.sql`

```sql
-- Test 1: Column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'archetype';
-- Expected: archetype | text

-- Test 2: Insert with archetype works
INSERT INTO public.posts (user_id, theme, content, archetype, status)
VALUES ('test-user-id', 'Test Theme', 'Test content', 'Le Stratège', 'revealed');
-- Expected: Success

-- Test 3: Backfill worked
SELECT COUNT(*) FROM public.posts WHERE archetype IS NOT NULL;
-- Expected: > 0 (if old posts existed)
```

**Test E2E** : Mettre à jour `e2e/dashboard.spec.ts`

```typescript
test('Dashboard displays archetype name correctly', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Should NOT display "Archetype Inconnu"
  await expect(page.locator('text=Archetype Inconnu')).not.toBeVisible();
  
  // Should display actual archetype (or profile label)
  await expect(page.locator('[class*="archetype"]')).toContainText(/Le |L'|The /i);
});
```

### Critères d'acceptation
- [ ] Migration créée et appliquée
- [ ] Colonne `archetype` existe dans table `posts`
- [ ] Backfill des posts existants réussi
- [ ] API `persist-on-login` enregistre l'archetype
- [ ] Dashboard affiche le vrai archetype (plus de "Inconnu")
- [ ] Test E2E valide l'affichage

---

## 🐛 BUG-004 : Data loss si persist-on-login échoue

### Priorité
🔴 **CRITIQUE** - Perte de données

### Description
Si l'API `/api/auth/persist-on-login` échoue (erreur 500, timeout, etc.), le localStorage est quand même nettoyé (ligne 84 de `auth/confirm/page.tsx`). L'utilisateur perd définitivement son post généré et doit refaire tout le quiz.

### Impact Business
- **Perte de valeur** : User perd 5-10 min de travail (quiz complet)
- **Frustration maximale** : Workflow non terminé = abandon
- **Support overhead** : "Mon post a disparu !"
- **Taux de conversion** : Drop critique au moment de l'auth

### Fichiers concernés
- `app/auth/confirm/page.tsx` (lignes 51-92)
- `app/api/auth/persist-on-login/route.ts` (gestion d'erreurs)

### Étapes de reproduction
1. Compléter le quiz
2. Simuler échec API (déconnecter Supabase ou return 500)
3. Cliquer sur Magic Link
4. Observer : Redirect vers Dashboard mais post vide (localStorage nettoyé)

### Solution proposée

**Approche :** Ne nettoyer localStorage QUE si persist réussit. Afficher erreur et permettre retry.

```typescript
// app/auth/confirm/page.tsx

useEffect(() => {
  const handleAuthSession = async (session: Session | null) => {
    if (sessionHandled) return;
    
    if (session) {
      setSessionHandled(true);
      
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });

      if (!response.ok) {
        console.error('Failed to set server session');
        setErrorMsg('Erreur serveur lors de la synchronisation de la session.');
        setSessionResolved(true);
        setSessionHandled(false);
        return;
      }

      // Persist quiz data from localStorage if it exists
      const quizStateRaw = localStorage.getItem('ice_quiz_state_v1');
      if (quizStateRaw) {
        try {
          const quizState = JSON.parse(quizStateRaw);
          
          if (quizState.generatedPost && quizState.profileData && quizState.currentVector) {
            const persistResponse = await fetch('/api/auth/persist-on-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                stylistic_vector: quizState.currentVector,
                profile: quizState.profileData,
                archetype: quizState.archetypeData?.archetype,
                theme: quizState.postTopic || 'Sujet non disponible',
                post_content: `${quizState.generatedPost.hook}\n\n${quizState.generatedPost.content}\n\n${quizState.generatedPost.cta}`,
                hook: quizState.generatedPost.hook,
                cta: quizState.generatedPost.cta,
                style_analysis: quizState.generatedPost.style_analysis,
                content_body: quizState.generatedPost.content,
                quiz_answers: {
                  acquisition_theme: quizState.themeId,
                  p1: quizState.answersP1,
                  p2: quizState.answersP2
                }
              })
            });

            // ✅ CRITICAL FIX: Only clean localStorage if persist succeeded
            if (persistResponse.ok) {
              console.log('Quiz data persisted successfully');
              localStorage.removeItem('ice_quiz_state_v1');
              
              // ✅ Redirect only after successful persist
              router.replace('/dashboard');
              setSessionResolved(true);
            } else {
              // ✅ NEW: Handle persist failure
              console.error('Failed to persist quiz data', await persistResponse.text());
              
              // ✅ Keep localStorage intact
              // ✅ Show error with retry option
              setErrorMsg(
                'Impossible de sauvegarder votre post. Vos données sont conservées. ' +
                'Cliquez sur "Réessayer" ou fermez cette page et reconnectez-vous.'
              );
              setSessionResolved(true);
              setSessionHandled(false); // Allow retry
              
              // ✅ Optional: Auto-retry after 3s
              setTimeout(() => {
                if (confirm('Voulez-vous réessayer de sauvegarder votre post ?')) {
                  setSessionHandled(false);
                  setErrorMsg(null);
                  handleAuthSession(session);
                }
              }, 3000);
            }
          } else {
            // No quiz data to persist, redirect directly
            router.replace('/dashboard');
            setSessionResolved(true);
          }
        } catch (e) {
          console.error('Error persisting quiz data:', e);
          
          // ✅ Keep localStorage intact on exception
          setErrorMsg(
            'Une erreur inattendue est survenue. Vos données sont conservées. ' +
            'Veuillez réessayer en vous reconnectant.'
          );
          setSessionResolved(true);
          setSessionHandled(false);
        }
      } else {
        // No localStorage data, redirect directly
        router.replace('/dashboard');
        setSessionResolved(true);
      }
    }
  };

  // ... rest of useEffect
}, [router, supabase, searchParams, sessionHandled]);

// ✅ Update error UI to show retry button
if (errorMsg) {
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
      <div className="text-red-500 font-bold">Erreur d'authentification</div>
      <div className="max-w-md text-center">{errorMsg}</div>
      
      {/* ✅ NEW: Retry button if localStorage still has data */}
      {localStorage.getItem('ice_quiz_state_v1') && (
        <button 
          onClick={() => {
            setErrorMsg(null);
            setSessionHandled(false);
            // Trigger re-check
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                handleAuthSession(session);
              }
            });
          }}
          className="bg-black text-white px-6 py-3 hover:bg-gray-800"
        >
          Réessayer
        </button>
      )}
      
      <button 
        onClick={() => router.push('/')} 
        className="bg-gray-200 text-black px-4 py-2"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
```

### Amélioration côté API (bonus)

```typescript
// app/api/auth/persist-on-login/route.ts

// Add idempotency: Check if post already exists before insert
const { data: existingPost } = await supabaseAdmin
  .from('posts')
  .select('id')
  .eq('user_id', user.id)
  .eq('theme', theme)
  .eq('status', 'revealed')
  .limit(1)
  .single();

if (existingPost) {
  console.log('Post already exists, skipping insert', existingPost.id);
  return NextResponse.json(
    { success: true, postId: existingPost.id, message: 'Post already saved' },
    { headers: createRateLimitHeaders(rateLimitResult) }
  );
}

// Otherwise proceed with insert...
```

### Tests à ajouter

**Test E2E** : `e2e/auth-persist-failure.spec.ts`

```typescript
test('localStorage preserved if persist-on-login fails', async ({ page }) => {
  // 1. Complete quiz
  await completeQuizFlow(page);
  
  // 2. Mock persist-on-login to fail
  await page.route('**/api/auth/persist-on-login', route => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'DB error' }) });
  });
  
  // 3. Trigger auth
  await triggerMagicLinkAuth(page);
  
  // 4. Verify localStorage NOT cleaned
  const quizState = await page.evaluate(() => {
    return localStorage.getItem('ice_quiz_state_v1');
  });
  expect(quizState).not.toBeNull();
  
  // 5. Verify error message displayed
  await expect(page.locator('text=Impossible de sauvegarder votre post')).toBeVisible();
  
  // 6. Verify retry button exists
  await expect(page.locator('button:has-text("Réessayer")')).toBeVisible();
});

test('Retry successfully persists after initial failure', async ({ page }) => {
  // Same setup as above
  
  // 1. First attempt fails
  await page.route('**/api/auth/persist-on-login', route => {
    route.fulfill({ status: 500 });
  });
  await triggerAuth(page);
  
  // 2. Fix the route (simulate server recovery)
  await page.unroute('**/api/auth/persist-on-login');
  await page.route('**/api/auth/persist-on-login', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ success: true, postId: 'abc123' }) });
  });
  
  // 3. Click retry
  await page.click('button:has-text("Réessayer")');
  
  // 4. Should redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
  
  // 5. localStorage should now be cleaned
  const quizStateAfter = await page.evaluate(() => {
    return localStorage.getItem('ice_quiz_state_v1');
  });
  expect(quizStateAfter).toBeNull();
});
```

### Critères d'acceptation
- [ ] localStorage nettoyé UNIQUEMENT si persist réussit (status 200)
- [ ] Message d'erreur clair si échec
- [ ] Bouton "Réessayer" affiché si localStorage encore présent
- [ ] Auto-retry après 3s (optional, avec confirmation)
- [ ] Test E2E valide la préservation des données
- [ ] Test E2E valide le retry réussi
- [ ] Idempotency API (bonus) : pas de doublon si retry multiple

---

## 📊 Plan d'exécution

### Sprint Planning

**Option A : Hotfix immédiat (si prod active)**
```
Jour 1:
- Matin: BUG-002 (Dashboard crash) - 1h
- Matin: BUG-003 (Migration archetype) - 30min
- AM: Deploy hotfix v1

Jour 2:
- Matin: BUG-001 (Double persist) - 2h
- AM: Tests E2E BUG-001 & BUG-002

Jour 3:
- Journée: BUG-004 (Data loss) - 4h
- Soir: Tests E2E BUG-004
```

**Option B : Sprint normal (si pas encore en prod)**
```
Sprint Items:
1. BUG-003 (30min) ← Quick win Day 1
2. BUG-002 (1h) ← Day 1
3. BUG-001 (2h) ← Day 2
4. BUG-004 (4h) ← Day 3-4
5. Tests E2E complets (2h) ← Day 4
6. QA / Review (1h) ← Day 5
```

### Checklist de déploiement

**Pré-déploiement :**
- [ ] Toutes les migrations testées en local
- [ ] Tous les tests E2E passent (3 runs consécutifs)
- [ ] Code review par un pair
- [ ] Backup de la DB staging avant migration

**Déploiement :**
- [ ] Appliquer migrations sur staging
- [ ] Vérifier backfill archetype
- [ ] Tester flow complet sur staging (Quiz → Auth → Dashboard)
- [ ] Appliquer migrations sur prod
- [ ] Vérifier metrics (error rate, auth success rate)

**Post-déploiement :**
- [ ] Monitorer erreurs Sentry/alerting (2h)
- [ ] Vérifier aucun post dupliqué dans les dernières 24h
- [ ] Vérifier archetype s'affiche correctement pour nouveaux users
- [ ] Fermer les tickets BUG-001 à BUG-004

---

## 📈 Métriques de succès

**Avant fix :**
- Taux d'erreur Dashboard : ??? (à mesurer)
- Posts dupliqués : ??? (requête DB à faire)
- "Archetype Inconnu" : 100% des posts

**Après fix (objectifs) :**
- Taux d'erreur Dashboard : 0%
- Posts dupliqués : 0
- "Archetype Inconnu" : 0%
- Taux de réussite persist-on-login : >99% (avec retry)

**Requêtes SQL de monitoring :**

```sql
-- Count duplicate posts (same user + theme + close timestamps)
SELECT user_id, theme, COUNT(*) as duplicates
FROM public.posts
WHERE status = 'revealed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id, theme
HAVING COUNT(*) > 1;

-- Count posts with missing archetype
SELECT COUNT(*)
FROM public.posts
WHERE archetype IS NULL AND status = 'revealed';

-- Verify no .single() errors in logs (check Vercel/Sentry)
```

---

## 🔗 Ressources

- **PRD :** `_bmad-output/planning-artifacts/prd/`
- **Epic 2 Details :** `_bmad-output/planning-artifacts/prd/07-details-de-lepic-2-conversion-et-identite.md`
- **Architecture :** `docs/architecture-main.md`
- **Audit complet :** (ce document sera lié depuis l'index)

---

## ✅ Validation finale

**Définition of Done :**
- [ ] Les 4 bugs sont fixés dans le code
- [ ] Tous les tests E2E ajoutés et passants
- [ ] Migrations appliquées (dev + staging + prod)
- [ ] Code reviewed et mergé
- [ ] Déployé en production
- [ ] Métriques validées (0 duplicates, 0 unknown archetype, 0 dashboard crashes)
- [ ] Documentation mise à jour (ce fichier marqué comme DONE)

**Date cible de complétion :** _________  
**Developer assigné :** _________  
**Reviewer :** _________

---

**Dernière mise à jour :** 2026-01-27  
**Statut global :** 🔴 EN ATTENTE
