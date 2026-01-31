# Component Inventory - Postry AI

**Date:** 2026-01-27
**Part:** main

## Overview

Postry AI uses React Server Components by default with Client Components (`'use client'`) for interactive features. Components follow the "Raw UI" design philosophy: flat design, strong borders, monospace fonts, no shadows/gradients.

## Component Organization

### Directory Structure

```
components/
├── feature/          # Feature-specific components
│   ├── quiz-engine.tsx
│   ├── auth-modal.tsx
│   ├── theme-selector.tsx
│   ├── question-card.tsx
│   ├── quiz-interstitial.tsx
│   ├── archetype-transition.tsx
│   ├── final-reveal.tsx
│   ├── header.tsx
│   └── [logic/test files]
└── ui/               # Reusable UI primitives
    ├── progress-bar.tsx
    └── loader-machine.tsx
```

## Feature Components

### `QuizEngine` (`components/feature/quiz-engine.tsx`)

**Type:** Client Component  
**Purpose:** Main quiz orchestration component  
**State Management:** useReducer with `quizReducer`  
**Key Features:**
- Manages quiz flow: Theme Selection → Phase 1 → Archetype Transition → Phase 2 → Final Reveal
- Handles API calls for question generation, archetype identification, profile generation, post generation
- Persists state to localStorage via `useQuizPersistence` hook
- Pre-loads Phase 1 questions early (on INSTRUCTIONS step)
- Pre-loads Phase 2 questions during transition screen
- Handles error states and fallback to mock data

**Props:** None (self-contained)

**State:**
- `step`: 'INSTRUCTIONS' | 'PHASE1' | 'TRANSITION' | 'PHASE2' | 'REVEAL'
- `themeId`: Selected theme
- `questionsP1`, `questionsP2`: Quiz questions
- `answersP1`, `answersP2`: User answers
- `archetypeData`: Detected archetype and target dimensions
- `profileData`: Generated augmented profile
- `generatedPost`: Generated LinkedIn post
- `status`: 'idle' | 'loading' | 'error'

---

### `AuthModal` (`components/feature/auth-modal.tsx`)

**Type:** Client Component  
**Purpose:** Email capture modal for magic link authentication  
**Key Features:**
- Email validation with Zod
- Supabase Auth magic link sending
- Success/error state handling
- Keyboard navigation (Tab trap)
- Blocks back navigation after success (History API)
- Accessible (ARIA dialog, labels)

**Props:**
```typescript
interface AuthModalProps {} // No props, self-contained
```

**State:**
- `email`: string
- `loading`: boolean
- `error`: string | null
- `success`: boolean

---

### `ThemeSelector` (`components/feature/theme-selector.tsx`)

**Type:** Client Component  
**Purpose:** Theme selection grid  
**Key Features:**
- Displays themes from `lib/data/themes.json`
- Grid layout (responsive: 2-5 columns)
- Hover effects with orange accent
- Numbered theme cards

**Props:**
```typescript
interface ThemeSelectorProps {
  onSelect: (themeId: string) => void;
}
```

---

### `QuestionCard` (`components/feature/question-card.tsx`)

**Type:** Client Component  
**Purpose:** Displays quiz question with A/B options  
**Key Features:**
- Shows question options side-by-side
- Progress bar integration
- Back button (conditional)
- Hover effects on options
- Accessible (data-testid for testing)

**Props:**
```typescript
interface QuestionCardProps {
  question: {
    id: string;
    option_A: string;
    option_B: string;
  };
  progressValue: number; // 0-100
  onAnswer: (choice: 'A' | 'B') => void;
  onBack: () => void;
  canGoBack: boolean;
}
```

---

### `QuizInterstitial` (`components/feature/quiz-interstitial.tsx`)

**Type:** Client Component  
**Purpose:** Instructions screen before Phase 1  
**Key Features:**
- Explains quiz process
- Shows loading state with LoaderMachine
- Start button

**Props:**
```typescript
interface QuizInterstitialProps {
  onStart: () => void;
  isLoading?: boolean;
}
```

---

### `ArchetypeTransition` (`components/feature/archetype-transition.tsx`)

**Type:** Client Component  
**Purpose:** Displays detected archetype between Phase 1 and Phase 2  
**Key Features:**
- Shows archetype name and description
- Explains next step (refinement)
- Continue button

**Props:**
```typescript
interface ArchetypeTransitionProps {
  archetype: {
    name: string;
    description: string;
  };
  onContinue: () => void;
}
```

---

### `FinalReveal` (`components/feature/final-reveal.tsx`)

**Type:** Client Component  
**Purpose:** Final screen showing profile and post generation  
**Key Features:**
- Displays augmented profile (label + definition)
- Topic input for post generation
- Post generation with loading states
- Auth modal integration (if not authenticated)
- Post display with copy functionality
- Blocks back navigation after post generation
- Expandable style analysis

**Props:**
```typescript
interface FinalRevealProps {
  profile: {
    label_final: string;
    definition_longue: string;
  };
  archetype: Archetype;
  vector: Vstyle;
  initialPost?: PostGenerationResponse | null;
  onPostGenerated?: (post: PostGenerationResponse, topic: string) => void;
  topic?: string;
  acquisitionTheme?: string;
  quizAnswers?: any;
}
```

---

### `Header` (`components/feature/header.tsx`)

**Type:** Client Component  
**Purpose:** Dashboard header with logout  
**Key Features:**
- Postry branding
- Sign out button
- Hard refresh on logout (prevents hanging)
- 2s timeout on signOut to prevent hanging

**Props:** None

---

## UI Components

### `ProgressBar` (`components/ui/progress-bar.tsx`)

**Type:** Server Component  
**Purpose:** Progress indicator (0-100%)  
**Design:** Raw UI - border, flat fill, no gradients

**Props:**
```typescript
interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
}
```

---

### `LoaderMachine` (`components/ui/loader-machine.tsx`)

**Type:** Client Component  
**Purpose:** Terminal-style loading indicator  
**Key Features:**
- Boot sequence messages scrolling
- Terminal window aesthetic
- Optional custom message
- Monospace font, uppercase text

**Props:**
```typescript
interface LoaderMachineProps {
  message?: string; // Optional override
  className?: string;
}
```

**Boot Sequence:**
- BOOTING_ICE_PROTOCOL...
- CALIBRATING_SENSORS...
- ANALYZING_PATTERNS...
- SYNCING_NEURAL_NET...
- LOADING_ARCHETYPE_DATABASE...
- OPTIMIZING_FLUX...
- INITIALIZING_NEURAL_LINK...
- COMPUTING_VECTORS...

---

## Page Components

### `Home` (`app/page.tsx`)

**Type:** Server Component  
**Purpose:** Landing page  
**Features:**
- Minimalist header
- LandingClient component
- Footer with version info

---

### `QuizPage` (`app/quiz/page.tsx`)

**Type:** Server Component  
**Purpose:** Quiz page wrapper  
**Features:**
- Renders QuizEngine component
- Full-screen layout

---

### `DashboardPage` (`app/dashboard/page.tsx`)

**Type:** Server Component  
**Purpose:** Authenticated dashboard  
**Features:**
- Server-side auth check (redirects if not authenticated)
- Fetches latest post from Supabase
- Renders PostRevealView component
- Error handling for missing posts

---

### `PostRevealView` (`app/dashboard/post-reveal-view.tsx`)

**Type:** Client Component  
**Purpose:** Displays revealed post  
**Features:**
- Post content display
- Copy to clipboard functionality
- Header with logout
- Responsive layout

---

## Component Patterns

### Design System

**"Raw UI" Philosophy:**
- Flat design (no shadows, gradients)
- Strong borders (2px black borders)
- Monospace fonts for technical look
- Signal orange accent color
- Carbon/gray color palette

**Common Classes:**
- `raw-card` - Card with border
- `raw-button` - Button with border
- `raw-button-primary` - Primary button style
- `font-heading` - Heading font (Chivo)
- `font-mono` - Monospace font (JetBrains Mono)

### State Management

- **Server Components:** Default, no state
- **Client Components:** React hooks (useState, useReducer)
- **Global State:** localStorage via custom hooks (`useQuizPersistence`)
- **Server State:** Supabase queries in Server Components

### Testing

Components have test files:
- `*.test.tsx` - React Testing Library tests
- `*.logic.test.ts` - Logic/state reducer tests
- E2E tests in `e2e/` directory

---

## Component Dependencies

### External Libraries
- `lucide-react` - Icons (Loader2, ChevronDown, ChevronUp, X)
- `next/navigation` - useRouter, redirect
- `@supabase/ssr` - Supabase client creation
- `zod` - Schema validation

### Internal Dependencies
- `@/lib/types` - TypeScript types
- `@/lib/gemini` - Gemini API client
- `@/lib/auth` - Auth utilities
- `@/lib/supabase` - Supabase client
- `@/lib/ice-logic` - ICE protocol logic
- `@/lib/ice-constants` - ICE constants
- `@/hooks/use-quiz-persistence` - Persistence hook
- `@/lib/quiz-api-client` - Quiz API client

---

## Accessibility

- ARIA labels and roles where appropriate
- Keyboard navigation (Tab trap in modals)
- Focus management
- Semantic HTML
- Screen reader friendly

---

## Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg
- Grid layouts adapt to screen size
- Touch-friendly button sizes (min 44x44px)

---

_Generated by BMAD Method document-project workflow_
