# Data Models - Postry AI

**Date:** 2026-01-27
**Part:** main
**Database:** Supabase (PostgreSQL)

## Overview

Postry AI uses Supabase (PostgreSQL) as its database. The schema includes two main tables: `users` and `posts`, with Row Level Security (RLS) policies for data isolation.

## Database Schema

### Table: `public.users`

Mirror of `auth.users` with additional profile data.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, REFERENCES `auth.users(id)` | User UUID (matches Supabase Auth) |
| `email` | `text` | | User email address |
| `credits_count` | `integer` | DEFAULT 5 | Number of credits available |
| `is_premium` | `boolean` | DEFAULT false | Premium subscription status |
| `profile_context` | `text` | NULLABLE | CV/profile text extracted from uploaded CV |
| `archetype` | `text` | NULLABLE | Primary archetype (e.g., "ALCHIMISTE", "STRATÈGE") |
| `vstyle_vector` | `jsonb` | NULLABLE | Style vector (9 dimensions, 0-100 each) |
| `created_at` | `timestamptz` | DEFAULT now() | Account creation timestamp |

**Row Level Security (RLS):**
- ✅ Enabled
- **Policy:** "Users can view own profile" - SELECT where `auth.uid() = id`
- **Policy:** "Users can update own profile" - UPDATE where `auth.uid() = id`

**Triggers:**
- `on_auth_user_created` - Automatically creates `public.users` record when user signs up via Supabase Auth

---

### Table: `public.posts`

Stores generated LinkedIn posts and associated quiz data.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `uuid_generate_v4()` | Post UUID |
| `user_id` | `uuid` | REFERENCES `public.users(id)`, NULLABLE | Owner user ID (nullable for pre-auth posts) |
| `email` | `text` | NULLABLE | Email for pre-auth tracking |
| `theme` | `text` | NOT NULL | Theme ID or label |
| `content` | `text` | NOT NULL | Generated post content (Markdown) |
| `quiz_answers` | `jsonb` | NULLABLE | Complete quiz answers (Phase 1 + Phase 2) |
| `equalizer_settings` | `jsonb` | NULLABLE | Style vector, profile, archetype, and generated components |
| `is_revealed` | `boolean` | DEFAULT false | Legacy field (deprecated, use `status`) |
| `status` | `text` | DEFAULT 'pending' | Post status: 'pending' (pre-auth) or 'revealed' (post-auth) |
| `created_at` | `timestamptz` | DEFAULT now() | Post creation timestamp |

**Row Level Security (RLS):**
- ✅ Enabled
- **Policy:** "Users can manage own posts" - ALL operations where `auth.uid() = user_id`

**Triggers:**
- `on_auth_user_created_link_posts` - Links pending posts to new user account when user signs up
  - Updates `user_id` from NULL to new user ID
  - Updates `status` from 'pending' to 'revealed'
  - Matches by email (case-insensitive)

**Migration History:**
- `08_init.sql` - Initial schema creation
- `20260123000000_update_posts_schema_and_trigger.sql` - Added email, status, and post-linking trigger

---

## JSONB Structures

### `equalizer_settings` (posts table)

Stores complete quiz and generation context:

```typescript
{
  vector: number[9], // 9-dimension style vector
  profile: {
    label_final: string,
    definition_longue: string
  },
  archetype: {
    id: number,
    name: string,
    family: string,
    // ... other archetype fields
  },
  generated_components: {
    hook: string,
    cta: string,
    style_analysis: string,
    content: string
  }
}
```

### `quiz_answers` (posts table)

Stores quiz responses:

```typescript
Array<{
  id: string, // "Q1", "Q2", etc.
  dimension: string, // Dimension code
  option_A: string,
  option_B: string,
  answer?: 'A' | 'B' // User's choice
}>
```

### `vstyle_vector` (users table)

9-dimension style vector:

```typescript
number[9] // Values 0-100 for each dimension
// Order: [CAD, DEN, STR, POS, TEM, REG, INF, PRI, ANC]
```

---

## Relationships

```
auth.users (Supabase Auth)
  ↓ (1:1)
public.users
  ↓ (1:many)
public.posts
```

**Notes:**
- `public.users.id` is a foreign key to `auth.users.id`
- `public.posts.user_id` is a foreign key to `public.users.id`
- Posts can be created before authentication (user_id = NULL, status = 'pending')
- Posts are linked to user account on authentication via trigger

---

## Storage Buckets

### `private-cvs`

Private bucket for user-uploaded CV files.

**Policies:**
- **Insert:** Users can upload own CV (`auth.uid() = owner`)
- **Select:** Users can read own CV (`auth.uid() = owner`)

---

## Data Flow

### Pre-Authentication Flow

1. User completes quiz and generates post
2. Post created with:
   - `user_id`: NULL
   - `email`: User's email
   - `status`: 'pending'
   - Data stored in `equalizer_settings`

### Post-Authentication Flow

1. User clicks magic link and authenticates
2. Supabase Auth creates `auth.users` record
3. Trigger `on_auth_user_created` creates `public.users` record
4. Trigger `on_auth_user_created_link_posts`:
   - Finds posts with matching email and status='pending'
   - Updates `user_id` to new user ID
   - Updates `status` to 'revealed'

### Persist-on-Login Flow

1. User already authenticated
2. Client calls `/api/auth/persist-on-login`
3. Server verifies email matches authenticated user
4. Post inserted with:
   - `user_id`: Authenticated user ID
   - `status`: 'revealed' (direct, not 'pending')
   - All quiz and generation data in `equalizer_settings`

---

## Indexes

Currently no explicit indexes defined. Consider adding:
- Index on `posts.user_id` for faster user post queries
- Index on `posts.email` for trigger performance
- Index on `posts.status` for filtering

---

## Security Considerations

1. **RLS Policies:** All tables have RLS enabled, ensuring users can only access their own data
2. **Email Verification:** `persist-on-login` endpoint verifies email matches authenticated user
3. **Trigger Security:** Post-linking trigger uses `SECURITY DEFINER` for controlled access
4. **Storage Policies:** CV bucket has strict access policies

---

## TypeScript Types

See `lib/types.ts` for TypeScript interfaces:
- `User` - TypeScript interface for `public.users`
- `Post` - TypeScript interface for `public.posts`
- `Vstyle` - Type alias for `number[9]` style vector

---

_Generated by BMAD Method document-project workflow_
