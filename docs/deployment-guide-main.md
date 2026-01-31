# Deployment Guide - Postry AI

**Date:** 2026-01-27
**Part:** main

## Overview

Postry AI is deployed on **Vercel** using GitOps workflow. The deployment is fully automated via GitHub integration.

## Deployment Platform

### Vercel

**Why Vercel:**
- Native Next.js integration
- Automatic deployments from GitHub
- Edge network for global performance
- Serverless functions for API routes
- Built-in CI/CD

**Deployment Types:**
- **Production:** Deploys from `main` branch
- **Preview:** Deploys from PRs and other branches

---

## Deployment Process

### Automatic Deployment (GitOps)

1. **Push to `main` branch** → Triggers production deployment
2. **Create Pull Request** → Triggers preview deployment
3. **Vercel builds** → Runs `npm run build`
4. **Deploys** → To Vercel Edge Network

**Build Command:** `npm run build`  
**Output Directory:** `.next` (Next.js default)  
**Install Command:** `npm install`

### Manual Deployment

1. Connect repository to Vercel dashboard
2. Configure build settings (auto-detected for Next.js)
3. Set environment variables
4. Deploy

---

## Environment Configuration

### Required Environment Variables

Configure in Vercel Dashboard: **Project Settings > Environment Variables**

| Variable | Environment | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anonymous key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | All | **SECRET** - Supabase service role key (server-only) |
| `GEMINI_API_KEY` | All | **SECRET** - Google Gemini API key (optional, falls back to mocks) |
| `NEXT_PUBLIC_BASE_URL` | Production | Canonical URL (e.g., `https://postry.ai`) |

### Optional Environment Variables

| Variable | Environment | Description |
|----------|-------------|-------------|
| `STRIPE_SECRET_KEY` | Production | **SECRET** - Stripe secret key (for payments) |
| `STRIPE_WEBHOOK_SECRET` | Production | **SECRET** - Stripe webhook secret |
| `NEXT_PUBLIC_STRIPE_KEY` | Production | Stripe public key |

### Environment-Specific Configuration

- **Production:** All variables required
- **Preview:** Same as production (for testing)
- **Development:** Local `.env` file

---

## Database Setup

### Supabase Configuration

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note project URL and keys

2. **Run Migrations:**
   ```bash
   # Via Supabase Dashboard SQL Editor
   # Or via Supabase CLI:
   supabase db push
   ```

3. **Migrations to Apply:**
   - `supabase/migrations/08_init.sql` - Initial schema
   - `supabase/migrations/20260123000000_update_posts_schema_and_trigger.sql` - Schema update

4. **Configure RLS Policies:**
   - Policies are included in migrations
   - Verify in Supabase Dashboard > Authentication > Policies

5. **Configure Auth:**
   - Enable Email provider (Magic Link)
   - Set redirect URLs:
     - Production: `https://postry.ai/auth/confirm`
     - Preview: `https://{preview-url}.vercel.app/auth/confirm`
     - Development: `http://localhost:3000/auth/confirm`

---

## Build Configuration

### Next.js Build Settings

**Automatic Detection:** Vercel auto-detects Next.js projects

**Build Settings:**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Node Version:** 20.x (recommended)

### Build Process

1. **Install Dependencies:** `npm install`
2. **Type Check:** TypeScript compilation
3. **Build:** Next.js production build
4. **Optimize:** Code splitting, tree shaking, minification
5. **Generate:** Static pages and server components

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied to production Supabase
- [ ] RLS policies verified
- [ ] Auth redirect URLs configured
- [ ] Build passes locally: `npm run build`
- [ ] Tests pass: `npm run test` and `npm run test:e2e`
- [ ] Code reviewed and approved

### Post-Deployment

- [ ] Verify production URL is accessible
- [ ] Test critical user journeys
- [ ] Verify authentication flow
- [ ] Check API endpoints
- [ ] Monitor error logs in Vercel dashboard
- [ ] Verify Supabase connection

---

## Rollback Strategy

### Instant Rollback (Vercel)

1. Go to Vercel Dashboard
2. Navigate to **Deployments**
3. Find previous successful deployment
4. Click **"Promote to Production"**
5. Rollback complete (instant)

**Note:** Vercel keeps deployment history, allowing instant rollback to any previous version.

---

## Monitoring

### Vercel Dashboard

- **Deployments:** View deployment history and status
- **Analytics:** Performance metrics, page views
- **Logs:** Server-side logs and errors
- **Functions:** API route execution logs

### Supabase Dashboard

- **Database:** View tables, run queries
- **Auth:** User management, session monitoring
- **Logs:** Database and auth logs
- **Storage:** File storage (if used)

### Error Monitoring

- **Console Logs:** Check Vercel function logs
- **Alerting:** `lib/alerting.ts` provides structured logging
- **Future:** Sentry integration planned (see `lib/alerting.ts`)

---

## CI/CD Pipeline

### Current Setup (Vercel Native)

**Trigger:** Git push to `main` branch  
**Build:** Automatic via Vercel  
**Deploy:** Automatic to production  
**Preview:** Automatic for PRs

### Future Enhancements

Consider adding:
- Pre-deployment tests (GitHub Actions)
- Staging environment
- Automated database migrations
- Health checks

---

## Infrastructure

### Current Architecture

- **Hosting:** Vercel Edge Network
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **CDN:** Vercel Edge Network (automatic)
- **Functions:** Vercel Serverless Functions (API routes)

### Scaling

- **Automatic:** Vercel handles scaling automatically
- **Database:** Supabase handles database scaling
- **Edge:** Global edge network for static assets

---

## Security

### Environment Variables

- **Secrets:** Stored securely in Vercel dashboard
- **Access:** Only accessible in server-side code
- **Client Variables:** Only `NEXT_PUBLIC_*` exposed to client

### Database Security

- **RLS:** Row Level Security enabled on all tables
- **Policies:** Users can only access their own data
- **Service Role:** Only used server-side for admin operations

### API Security

- **Rate Limiting:** Implemented on critical endpoints
- **Validation:** Zod schemas for all inputs
- **Error Handling:** No sensitive data in error messages

---

## Performance

### Optimization

- **Static Generation:** Where possible
- **Server Components:** Reduce client bundle
- **Code Splitting:** Automatic via Next.js
- **Image Optimization:** Next.js Image component
- **Edge Caching:** Automatic via Vercel

### Monitoring

- **Vercel Analytics:** Performance metrics
- **Core Web Vitals:** Tracked automatically
- **Function Duration:** Monitored in Vercel dashboard

---

## Troubleshooting

### Build Failures

**Issue:** Build fails on Vercel  
**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check TypeScript errors
5. Verify Node.js version compatibility

### Deployment Issues

**Issue:** Deployment succeeds but app doesn't work  
**Solutions:**
1. Check function logs in Vercel dashboard
2. Verify environment variables are correct
3. Check Supabase connection
4. Verify database migrations are applied
5. Check auth redirect URLs

### Database Connection Issues

**Issue:** Cannot connect to Supabase  
**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Verify Supabase project is active
4. Check network/firewall settings

---

## Best Practices

1. **Always test locally** before pushing to `main`
2. **Use preview deployments** for testing
3. **Monitor logs** after deployment
4. **Keep environment variables** in sync across environments
5. **Document changes** in migrations
6. **Test rollback procedure** periodically
7. **Monitor performance** metrics

---

## Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Deployment:** https://supabase.com/docs/guides/hosting
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

_Generated by BMAD Method document-project workflow_
