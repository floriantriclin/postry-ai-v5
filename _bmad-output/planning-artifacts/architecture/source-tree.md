# Structure du Projet

## Arborescence de Fichiers (Next.js App Router)

Structure orientée "Fonctionnalité" (Feature-based).

```
postry-ai/
├── .env.local                  # Secrets (Gemini Key, Supabase Keys)
├── .eslintrc.json              # Config Linter
├── next.config.mjs             # Config Next.js
├── package.json                # Dépendances
├── tailwind.config.ts          # Config Design System "Brut"
├── tsconfig.json               # Config TypeScript Strict
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root Layout (Font, Metadata)
│   ├── page.tsx                # Landing Page (Public)
│   │
│   ├── (auth)/                 # Route Group Auth (Layout isolé)
│   │   ├── auth/
│   │   │   └── callback/       # Route API pour Magic Link
│   │   │       └── route.ts
│   │   └── login/              # Page de Login (si accès direct)
│   │       └── page.tsx
│   │
│   ├── (dashboard)/            # Route Group App Privée
│   │   ├── layout.tsx          # App Shell (Sidebar, Auth Check)
│   │   ├── dashboard/          # Vue Principale
│   │   │   └── page.tsx
│   │   └── history/            # Vue Historique
│   │       └── page.tsx
│   │
│   ├── quiz/                   # Tunnel Public
│   │   └── page.tsx            # Quiz Interface
│   │
│   └── api/                    # API Routes (Backend Stateless)
│       ├── quiz/               # Génération Questions
│       │   └── route.ts
│       ├── post/               # Moteur de Génération
│       │   ├── generate/       # Création (Anonyme/Auth)
│       │   │   └── route.ts
│       │   └── regenerate/     # Equalizer Update
│       │       └── route.ts
│       └── webhooks/           # Stripe Webhooks
│           └── stripe/
│               └── route.ts
│
├── components/                 # Bibliothèque de Composants
│   ├── ui/                     # Atomes "Raw UI" (Button, Input)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── slider.tsx          # Equalizer component
│   │   └── card.tsx
│   ├── feature/                # Composants Métier
│   │   ├── quiz-engine.tsx     # Logique Quiz
│   │   ├── blurred-preview.tsx # Post Flouté + Overlay
│   │   ├── cv-uploader.tsx     # Drag & Drop Zone
│   │   └── equalizer-panel.tsx # Panneau de contrôle
│   └── layout/                 # Structure
│       ├── header.tsx
│       └── sidebar.tsx
│
├── lib/                        # Logique Partagée & Utils
│   ├── supabase/               # Clients Supabase
│   │   ├── client.ts           # Browser Client
│   │   └── server.ts           # Server Client (Cookie handling)
│   ├── gemini.ts               # SDK Wrapper Gemini
│   ├── stripe.ts               # SDK Wrapper Stripe
│   ├── utils.ts                # cn(), formatters
│   └── types.ts                # Types TypeScript partagés (DB + API)
│
├── actions/                    # Server Actions (Mutations)
│   ├── upload-cv.ts            # Gestion upload + parsing
│   └── save-post.ts            # Sauvegarde post anonyme -> user
│
└── public/                     # Assets statiques
    └── fonts/                  # Polices locales si nécessaire
```
