# 🚨 Story 2.11b - Email Troubleshooting Guide

**Date:** 27 Janvier 2026  
**Issue:** Magic link email not received  
**Status:** 200 in logs, but no email in inbox

---

## 🔍 DIAGNOSTIC RAPIDE

### Symptômes Observés:
- ✅ Supabase logs: `status: 200` (success)
- ✅ Auth event: `user_recovery_requested`
- ✅ Email target: `ftr@triclin.fr`
- ❌ Email NOT received in inbox

### Causes Possibles:
1. 🟡 Email en SPAM/Junk
2. 🟡 Délai d'envoi (1-5 min)
3. 🟠 Configuration Supabase email provider
4. 🟠 Email de test bloqué par provider
5. 🔴 Supabase Free tier email limitations

---

## ✅ SOLUTION #1: Vérifier SPAM (30 sec)

**Actions:**
1. Ouvrir inbox `ftr@triclin.fr`
2. Chercher dans dossier SPAM/Indésirables
3. Filtrer par expéditeur: `@supabase.io` ou `@mail.app.supabase.io`
4. Sujet: Contient "magic", "link", "confirm" ou "sign in"

**Si trouvé:**
- Marquer comme "Non spam"
- Ajouter expéditeur à contacts
- Cliquer le magic link

---

## ✅ SOLUTION #2: Attendre 2-5 min (patience)

**Supabase email queue peut être lent:**
- Status 200 = email queued (pas encore envoyé)
- Délai normal: 30 sec - 5 min
- Plan Free: Parfois plus lent que Plan Pro

**Actions:**
- Attendre 3 minutes
- Rafraîchir inbox
- Vérifier à nouveau SPAM

---

## ✅ SOLUTION #3: Récupérer Magic Link Direct (DEV MODE) 🔧

**Pour tests locaux, bypass email via Supabase Dashboard:**

### Steps:
1. **Ouvrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/hoomcbsfqunrkeapxbvh
   ```

2. **Naviguer vers Authentication > Users**
   ```
   Dashboard > Authentication > Users
   ```

3. **Trouver ton user (`ftr@triclin.fr`)**
   ```
   Liste des users > Chercher par email
   ```

4. **Option A: Récupérer token depuis logs**
   ```
   Dashboard > Logs > Auth Logs
   - Filter: "user_recovery_requested"
   - Timestamp: Last 5 minutes
   - Chercher "token" ou "confirmation_token" dans payload
   ```

5. **Option B: Réinitialiser mot de passe (génère nouveau link)**
   ```
   User details > "Send password reset email"
   - Ou utiliser Supabase CLI:
   ```
   ```bash
   # Via Supabase CLI (si installé)
   supabase auth reset-password --email ftr@triclin.fr
   ```

6. **Option C: Utiliser l'URL de confirmation manuelle**
   ```
   Format magic link:
   http://localhost:3000/auth/confirm?token=XXXX&type=recovery
   
   Remplacer XXXX par le token depuis logs
   ```

---

## ✅ SOLUTION #4: Vérifier Config Supabase Email (5 min)

**Vérifier que email provider est configuré:**

### Check Settings:
1. **Ouvrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/hoomcbsfqunrkeapxbvh
   ```

2. **Naviguer vers Settings > Auth**
   ```
   Dashboard > Settings > Authentication
   ```

3. **Vérifier Email Settings:**
   - [ ] Enable email confirmations: ON/OFF?
   - [ ] Email provider: Supabase default ou custom SMTP?
   - [ ] From email: Configured?
   - [ ] Email templates: Active?

### Si Email Provider = Supabase Default:
```
⚠️ Limitation Supabase Free Tier:
- Max 3 emails/heure par IP
- Emails peuvent être rate-limited
- Parfois bloqués par Gmail/Outlook

Recommendation:
- Utiliser email provider personnel (Gmail, SendGrid)
- Ou passer à Supabase Pro ($25/mois)
```

### Si Email Provider = Custom SMTP:
```
Vérifier credentials:
- SMTP host correct?
- SMTP username/password valides?
- TLS/SSL configuré?
- Port correct? (587 pour TLS, 465 pour SSL)
```

---

## ✅ SOLUTION #5: Utiliser Email de Test Alternatif (2 min)

**Tester avec un autre email provider:**

### Emails recommandés pour tests:
1. **Gmail** (`@gmail.com`)
   - Généralement fiable
   - Vérifier SPAM + Onglet "Promotions"

2. **Outlook/Hotmail** (`@outlook.com`, `@hotmail.com`)
   - Bon pour tests cross-provider

3. **Temp Email Services** (déconseillé pour prod)
   - https://temp-mail.org
   - https://10minutemail.com
   - ⚠️ Uniquement pour tests rapides!

### Actions:
```bash
# Retester le flow avec email différent
1. Revenir à page "Révéler mon profil"
2. Entrer nouveau email (ex: florian.test@gmail.com)
3. Cliquer "Envoyer le lien magique"
4. Vérifier inbox + SPAM du nouveau email
```

---

## ✅ SOLUTION #6: Mode DEV - Skip Email Complètement (YOLO) 🚀

**Pour tests locaux uniquement, créer session manuellement:**

### Option A: Utiliser Supabase Dashboard (RECOMMANDÉ)
```
1. Dashboard > Authentication > Users
2. Trouver user "ftr@triclin.fr"
3. Cliquer "..." menu > "Generate access token"
4. Copy le token
5. Dans browser console (localhost:3000):

localStorage.setItem('sb-access-token', 'TOKEN_ICI');
window.location.href = '/dashboard';
```

### Option B: Désactiver Email Confirmation (DEV ONLY)
```
⚠️ WARNING: Désactive sécurité, uniquement pour tests!

Supabase Dashboard:
1. Settings > Authentication
2. "Enable email confirmations" → OFF
3. Re-tester le flow (pas besoin de magic link)

⚠️ CRITICAL: Re-enable après tests!
```

---

## 🔧 WORKAROUND IMMÉDIAT (Si urgent):

**Si tu veux juste tester le reste du flow maintenant:**

### Steps:
1. **Dashboard Supabase > Authentication > Users**
2. **Trouve ton user `ftr@triclin.fr`**
3. **Vérifie status:**
   - Email verified? 
   - Last sign-in?
4. **Cliquer user → "Verify email"** (manual verification)
5. **Retourner à localhost:3000/dashboard**
6. **Recharger page** (user devrait être auth)

---

## 📊 DEBUG INFO

**Logs à collecter si problème persiste:**

### Supabase Logs:
```
Dashboard > Logs > Auth Logs
- Filter: Last 15 minutes
- Search: "ftr@triclin.fr"
- Export logs si besoin
```

### Browser Console Logs:
```javascript
// Dans console (localhost:3000):
console.log(localStorage.getItem('sb-access-token'));
console.log(localStorage.getItem('sb-refresh-token'));

// Si présent = user déjà auth (pas besoin de magic link!)
```

### Network Tab:
```
DevTools > Network
- Filter: "otp" ou "auth"
- Check request payload
- Check response status
```

---

## 🎯 NEXT STEPS

### Si Email Arrive (Finalement):
- [x] Cliquer magic link
- [x] Vérifier redirect vers dashboard
- [x] Vérifier post visible
- [x] Continuer smoke tests

### Si Email N'Arrive PAS (après 5 min):
- [x] Utiliser Solution #3 (récupérer token depuis logs)
- [x] OU Solution #4 (vérifier config email)
- [x] OU Solution #6 (skip email pour tests locaux)

### Si Rien Ne Marche:
- [x] Documenter issue dans Linear
- [x] Deploy staging SANS tester auth flow complet
- [x] Tester auth flow directement sur staging (différent email provider)

---

## 📞 CONTACTS

**Si problème Supabase email persiste:**
- Supabase Support: https://supabase.com/support
- Supabase Discord: https://discord.supabase.com
- Stack Overflow: Tag `supabase`

---

**Créé le:** 27 Janvier 2026  
**Par:** Bob (Scrum Master)  
**Status:** Troubleshooting guide

---

**🔥 UN PROBLÈME = 6 SOLUTIONS! 🔥**
