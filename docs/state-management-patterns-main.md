# State Management Patterns - Postry AI

**Date:** 2026-01-27
**Part:** main

## Overview

Postry AI uses a hybrid state management approach:
- **Server Components** (default) - No client-side state
- **Client Components** - React hooks (useState, useReducer)
- **Local Storage** - Persistence via custom hooks
- **Server State** - Supabase queries in Server Components

## State Management Architecture

### Pattern: Server Components by Default

Next.js 16 App Router uses Server Components by default. Client Components are only used when interactivity is required (`'use client'` directive).

**Benefits:**
- Reduced JavaScript bundle size
- Better SEO
- Faster initial page load
- Direct database access in components

---

## Client-Side State Management

### 1. useReducer Pattern (Quiz Engine)

**Location:** `components/feature/quiz-engine.tsx`

**Pattern:** Complex state machine with reducer

```typescript
const [state, dispatch] = useReducer(quizReducer, initialState);
```

**State Structure:**
```typescript
interface QuizState {
  step: 'INSTRUCTIONS' | 'PHASE1' | 'TRANSITION' | 'PHASE2' | 'REVEAL';
  themeId: string | null;
  questionsP1: QuizQuestion[];
  questionsP2: QuizQuestion[];
  answersP1: Record<string, 'A' | 'B'>;
  answersP2: Record<string, 'A' | 'B'>;
  archetypeData: { archetype: Archetype; targetDimensions: string[] } | null;
  profileData: { label_final: string; definition_longue: string } | null;
  generatedPost: PostGenerationResponse | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}
```

**Actions:**
- `THEME_SELECTED` - User selects theme
- `API_LOAD_P1_START/SUCCESS/ERROR` - Phase 1 questions loading
- `ANSWER_P1` - User answers Phase 1 question
- `API_ARCHETYPE_START/SUCCESS/ERROR` - Archetype identification
- `API_LOAD_P2_START/SUCCESS/ERROR` - Phase 2 questions loading
- `ANSWER_P2` - User answers Phase 2 question
- `API_REFINE_VECTOR` - Vector refinement
- `API_PROFILE_START/SUCCESS/ERROR` - Profile generation
- `API_POST_START/SUCCESS/ERROR` - Post generation
- `HYDRATE` - Restore from localStorage

**Why useReducer:**
- Complex state transitions
- Multiple related state updates
- Predictable state changes
- Easier testing (pure reducer function)

---

### 2. useState Pattern (Simple Components)

**Used in:**
- `AuthModal` - Email, loading, error, success states
- `FinalReveal` - Topic, loading, post, error states
- `ThemeSelector` - No state (controlled by parent)

**Pattern:**
```typescript
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**When to use:**
- Simple, independent state
- No complex transitions
- Single component scope

---

### 3. Local Storage Persistence

**Location:** `hooks/use-quiz-persistence.ts`

**Pattern:** Custom hook for localStorage sync

```typescript
const { isHydrated, persistedState, saveState } = useQuizPersistence();
```

**Features:**
- Hydrates state on mount
- Saves state on changes
- Handles SSR (isHydrated flag)
- Prevents hydration mismatches

**Implementation:**
- Uses `useEffect` to sync with localStorage
- Stores complete quiz state as JSON
- Cleans up on completion

**Usage:**
```typescript
// Hydrate on mount
useEffect(() => {
  if (isHydrated && persistedState) {
    dispatch({ type: 'HYDRATE', payload: persistedState });
  }
}, [isHydrated, persistedState]);

// Persist on changes
useEffect(() => {
  saveState(state);
}, [state, saveState]);
```

---

## Server-Side State Management

### Supabase Queries in Server Components

**Pattern:** Direct database queries in Server Components

**Example:** `app/dashboard/page.tsx`
```typescript
const { data: post, error } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1)
  .single();
```

**Benefits:**
- No client-side state needed
- Direct database access
- Automatic caching by Next.js
- SEO-friendly

---

## State Flow Patterns

### Quiz Flow State Machine

```
INSTRUCTIONS
  ↓ (theme selected)
PHASE1 (load questions, collect answers)
  ↓ (all answered)
TRANSITION (identify archetype, load Phase 2)
  ↓ (continue)
PHASE2 (load questions, collect answers, refine vector)
  ↓ (all answered)
REVEAL (generate profile, generate post)
```

**State Transitions:**
- Each step triggers API calls
- State updates via reducer actions
- Persistence happens automatically
- Error states handled gracefully

---

### Authentication State

**Pattern:** Supabase Auth session management

**Server Components:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/");
```

**Client Components:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) setShowAuthModal(true);
```

**Middleware:**
- `middleware.ts` checks auth on every request
- Redirects unauthenticated users
- Handles public paths (`/`, `/auth/confirm`, `/quiz`)

---

## Data Fetching Patterns

### 1. Early Loading (Pre-fetching)

**Pattern:** Load data before user needs it

**Example:** Phase 1 questions loaded during INSTRUCTIONS step
```typescript
useEffect(() => {
  if (state.step === 'INSTRUCTIONS' && state.themeId && state.questionsP1.length === 0) {
    loadP1(); // Pre-load
  }
}, [state.step, state.themeId]);
```

**Benefits:**
- Faster perceived performance
- Smoother user experience
- Reduces waiting time

---

### 2. Conditional Loading

**Pattern:** Load data based on conditions

**Example:** Phase 2 questions loaded when archetype identified
```typescript
useEffect(() => {
  if (state.archetypeData && state.questionsP2.length === 0) {
    loadP2(); // Load when ready
  }
}, [state.archetypeData]);
```

---

### 3. Error Handling with Fallbacks

**Pattern:** Fallback to mock data on API failure

**Example:**
```typescript
try {
  const questions = await quizApiClient.generateQuestions({ phase: 1, topic });
  dispatch({ type: 'API_LOAD_P1_SUCCESS', payload: questions });
} catch (error) {
  dispatch({ 
    type: 'API_LOAD_P1_ERROR', 
    payload: { error, fallback: mockData.phase1 } 
  });
}
```

---

## State Synchronization

### Client-Server Sync

**Pattern:** Server actions for mutations

**Example:** Post persistence
```typescript
// Client: Collect data
const postData = { email, stylistic_vector, profile, ... };

// Server: Persist via API route
await fetch('/api/auth/persist-on-login', {
  method: 'POST',
  body: JSON.stringify(postData)
});
```

---

## State Cleanup

### Navigation Locking

**Pattern:** Prevent back navigation after critical actions

**Example:** After post generation
```typescript
useEffect(() => {
  if (isPostGenerated) {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
  }
}, [isPostGenerated]);
```

### LocalStorage Cleanup

**Pattern:** Clear persisted state on completion

**Implementation:** Handled by `useQuizPersistence` hook
- State cleared after successful post generation
- Prevents stale data on next visit

---

## Testing State Management

### Reducer Testing

**Location:** `components/feature/quiz-engine.logic.test.ts`

**Pattern:** Test pure reducer function
```typescript
describe('quizReducer', () => {
  it('should handle THEME_SELECTED', () => {
    const state = quizReducer(initialState, {
      type: 'THEME_SELECTED',
      payload: 'theme-1'
    });
    expect(state.themeId).toBe('theme-1');
  });
});
```

### Component Testing

**Pattern:** Test state transitions in components
- Mock API calls
- Verify state updates
- Test error handling

---

## Best Practices

1. **Use Server Components by default** - Only use Client Components when needed
2. **useReducer for complex state** - Better than multiple useState for related state
3. **Local Storage for persistence** - Sync important state across sessions
4. **Early loading** - Pre-fetch data to improve UX
5. **Error handling** - Always provide fallbacks
6. **State cleanup** - Clear persisted state when done
7. **Type safety** - Use TypeScript for all state types

---

_Generated by BMAD Method document-project workflow_
