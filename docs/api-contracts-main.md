# API Contracts - Postry AI

**Date:** 2026-01-27
**Part:** main
**Base URL:** `/api`

## Overview

Postry AI uses Next.js API Routes for backend functionality. All API endpoints are located in `app/api/` directory.

## Authentication

Most endpoints require authentication via Supabase Auth. The middleware (`middleware.ts`) handles authentication checks and redirects.

## Rate Limiting

Some endpoints implement rate limiting using the `rate-limit` utility:
- Default: 10 requests per minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## API Endpoints

### Quiz API

#### `POST /api/quiz/generate`

Generates quiz questions for Phase 1 or Phase 2.

**Request Body:**
```typescript
// Phase 1
{
  phase: 1,
  topic: string // Theme ID or label (max 100 chars)
}

// Phase 2
{
  phase: 2,
  topic: string,
  context: {
    archetypeName: string,
    archetypeVector: number[9], // 9-dimension vector
    targetDimensions: string[5] // 5 dimension codes
  }
}
```

**Response:**
```typescript
Array<{
  id: string, // "Q1", "Q2", etc.
  dimension: string, // Dimension code (POS, TEM, DEN, etc.)
  option_A: string, // Max 250 chars
  option_B: string // Max 250 chars
}>
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (validation error)
- `502` - Generation failed
- `504` - Timeout (45s)

**Notes:**
- Uses Google Gemini 2.5 Flash for generation
- Timeout: 45 seconds
- Sanitizes topic input to prevent prompt injection
- Normalizes dimension codes
- Validates dimension coverage

---

#### `POST /api/quiz/archetype`

Identifies user archetype from Phase 1 answers.

**Request Body:**
```typescript
{
  answers: {
    [dimension: string]: 'A' | 'B' // All 6 Phase 1 dimensions required
  }
}
```

**Response:**
```typescript
{
  archetype: {
    id: number,
    name: string,
    family: string,
    binarySignature: string,
    signature: string,
    description: string,
    baseVector: number[9]
  },
  targetDimensions: string[5] // Dimensions to test in Phase 2
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid payload (missing dimensions or invalid values)
- `500` - Internal server error

**Notes:**
- Converts answers to binary signature (A='0', B='1')
- Uses Hamming distance to find closest archetype
- Determines Phase 2 target dimensions (3 mandatory + 2 closest to 50)

---

#### `POST /api/quiz/refine`

Refines the style vector based on Phase 2 answer.

**Request Body:**
```typescript
{
  currentVector: number[9], // Current 9-dimension vector
  dimension: string, // Dimension code to update
  answer: 'A' | 'B' // User's choice
}
```

**Response:**
```typescript
{
  newVector: number[9] // Updated vector
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid vector length or dimension code
- `500` - Internal server error

**Notes:**
- Formula: `Vnew = Vcurrent + (Target - Vcurrent) * 0.3`
- A → Target 0, B → Target 100

---

#### `POST /api/quiz/profile`

Generates augmented profile with label and definition.

**Request Body:**
```typescript
{
  baseArchetype: string, // Archetype name
  finalVector: number[9], // Final 9-dimension vector
  correlationId?: string // Optional correlation ID
}
```

**Response:**
```typescript
{
  label_final: string, // e.g., "Le Stratège Lumineux"
  definition_longue: string // 45-75 words, in French, using "vous"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid payload
- `502` - Generation failed after 3 retries
- `500` - Internal server error

**Notes:**
- Uses Google Gemini 2.5 Flash
- Retries up to 3 times with exponential backoff
- Validates word count (45-75 words)
- Calculates drift hint (dimension with largest deviation from archetype)

---

#### `POST /api/quiz/post`

Generates a LinkedIn post based on topic and style vector.

**Request Body:**
```typescript
{
  topic: string, // Post topic (min 3 chars)
  archetype: string, // Archetype name
  vector: number[9], // 9-dimension style vector
  profileLabel?: string // Optional augmented profile label
}
```

**Response:**
```typescript
{
  hook: string, // Opening sentence
  content: string, // Main content (min 250 words)
  cta: string, // Call to action
  style_analysis: string // Brief analysis of style application
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request body
- `500` - Internal server error

**Notes:**
- Max duration: 30 seconds
- Uses Google Gemini 2.5 Flash
- Sanitizes topic input
- Generates French content
- Applies style vector constraints strictly

---

### Auth API

#### `POST /api/auth/persist-on-login`

Persists quiz data and post to database after user authentication.

**Authentication:** Required (Supabase Auth)

**Rate Limiting:** 10 requests/minute per IP

**Request Body:**
```typescript
{
  email: string, // Must match authenticated user
  stylistic_vector: number[], // 9-dimension vector
  profile: Record<string, any>, // Profile data
  archetype: any, // Archetype data
  theme: string, // Theme ID
  post_content: string, // Generated post content
  quiz_answers?: any, // Quiz answers
  hook?: string, // Post hook
  cta?: string, // Post CTA
  style_analysis?: string, // Style analysis
  content_body?: string // Post body
}
```

**Response:**
```typescript
{
  success: true,
  postId: string // UUID of created post
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error or email mismatch
- `401` - Unauthorized
- `403` - Email mismatch
- `500` - Database error

**Notes:**
- Verifies email matches authenticated user
- Inserts post with status='revealed' (not 'pending')
- Stores vector/profile in equalizer_settings JSONB field
- Includes alerting for errors (auth, validation, database, unhandled)

---

#### `GET /api/auth/callback`

Handles Supabase Auth callback after magic link click.

**Query Parameters:**
- Standard Supabase Auth callback parameters

**Response:**
- Redirects to dashboard or landing page

**Notes:**
- Handled by Supabase SSR utilities
- Creates user session
- Links pending posts to new user account (via trigger)

---

## Error Handling

All endpoints use consistent error handling:
- Validation errors return `400` with error details
- Authentication errors return `401`
- Database errors return `500` with logging
- Unhandled exceptions are logged and return `500`

## Alerting

Critical endpoints use alerting utilities:
- `alertAuthFailure` - Authentication errors
- `alertValidationError` - Validation errors
- `alertDatabaseError` - Database errors
- `alertUnhandledException` - Unexpected errors

## Testing

API endpoints have comprehensive test coverage:
- Unit tests: `*.test.ts` files alongside routes
- Integration tests: `logic.test.ts` files
- E2E tests: Playwright tests in `e2e/`

---

_Generated by BMAD Method document-project workflow_
