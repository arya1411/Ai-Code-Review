# codeSentinel — Complete Project Documentation

> **AI-powered code review automation for modern teams**
> Last Updated: July 2026 | Next.js 16.2.10 | React 19.2.4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Complete File Inventory & Roles](#4-complete-file-inventory--roles)
5. [Architecture Diagram](#5-architecture-diagram)
6. [File Connections & Data Flow](#6-file-connections--data-flow)
7. [Authentication Flow](#7-authentication-flow)
8. [Routing Map](#8-routing-map)
9. [Database Schema](#9-database-schema)
10. [Component Hierarchy](#10-component-hierarchy)
11. [Design System](#11-design-system)
12. [Environment Variables](#12-environment-variables)
13. [Key Dependencies](#13-key-dependencies)
14. [Development Notes](#14-development-notes)

---

## 1. Project Overview

**codeSentinel** is a Software-as-a-Service (SaaS) application that provides **AI-powered automated code review** for GitHub pull requests. It integrates with GitHub via OAuth, analyzes pull requests, detects bugs, and provides actionable suggestions — all before code reaches production.

### Project Status
- **Phase**: Initial development / MVP
- **Authentication**: ✅ Complete (GitHub OAuth via Better-Auth)
- **Dashboard**: ✅ Complete (with real GitHub data)
- **Marketing Page**: ✅ Complete
- **Reviews Page**: ⬜ Placeholder (empty state)
- **Repositories Page**: ⬜ Placeholder (empty state)
- **Settings Page**: ⬜ Partial (shows user profile, needs more features)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.10 |
| **Language** | TypeScript | 5.x |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS | v4 |
| **UI Components** | shadcn/ui (base-nova) | 4.13.0 |
| **Animations** | Motion (Framer Motion) | 12.42.2 |
| **Icons** | Lucide React | 1.24.0 |
| **Authentication** | Better-Auth | 1.6.23 |
| **Database ORM** | Prisma | 7.8.0 |
| **Database** | PostgreSQL (Neon) | — |
| **GitHub API** | Octokit | 5.0.5 |
| **Forms** | React Hook Form | 7.81.0 |
| **Validation** | Zod | 4.4.3 |
| **Server State** | TanStack React Query | 5.101.2 |
| **HTTP Client** | Axios | 1.18.1 |

---

## 3. Directory Structure

```
D:\AI Code Review\
├── PROJECT_DOCUMENTATION.md          ◄── THIS FILE
│
└── code_review/                      ◄── Project root
    ├── .env                          Environment variables (secrets)
    ├── .gitignore                    Git ignore rules
    ├── AGENTS.md                     AI agent instructions (Next.js warnings)
    ├── CLAUDE.md                     Claude AI config (references AGENTS.md)
    ├── PROJECT_STRUCTURE.md          Existing architecture docs (798 lines)
    ├── README.md                     Default Next.js readme
    ├── package.json                  Dependencies & scripts
    ├── package-lock.json             Lock file
    ├── tsconfig.json                 TypeScript config
    ├── next.config.ts                Next.js configuration
    ├── next-env.d.ts                 Next.js type declarations
    ├── components.json               shadcn/ui configuration
    ├── postcss.config.mjs            PostCSS config (Tailwind v4)
    ├── eslint.config.mjs             ESLint configuration
    ├── prisma.config.ts              Prisma env config
    │
    ├── app/                          ◄── Next.js App Router pages
    │   ├── layout.tsx                Root layout (fonts, metadata)
    │   ├── page.tsx                  Homepage / landing page
    │   ├── globals.css               Global styles & design tokens
    │   ├── favicon.ico               Browser tab icon
    │   ├── api/                      API routes
    │   │   └── auth/
    │   │       └── [...all]/
    │   │           └── route.ts      Better-Auth API handler
    │   ├── login/
    │   │   └── page.tsx              Login page
    │   ├── dashboard/
    │   │   └── page.tsx              Dashboard (stats, activity, graph)
    │   ├── reviews/
    │   │   └── page.tsx              Reviews page (empty state)
    │   ├── repositories/
    │   │   └── page.tsx              Repositories page (empty state)
    │   └── settings/
    │       └── page.tsx              Settings page (profile + logout)
    │
    ├── components/                   ◄── React components
    │   ├── brand/
    │   │   └── logo.tsx              Logo component + LogoMark SVG
    │   ├── layout/
    │   │   ├── dashboard-shell.tsx   Dashboard layout wrapper
    │   │   ├── sidebar.tsx           Desktop sidebar navigation
    │   │   ├── mobile-nav.tsx        Mobile bottom navigation
    │   │   └── app-background.tsx    Background wrapper (radial gradient)
    │   ├── marketing/
    │   │   ├── homepage.tsx          Landing page (hero, features, CTA)
    │   │   └── marketing-header.tsx  Sticky marketing header
    │   ├── providers/
    │   │   └── query-provider.tsx    TanStack Query provider
    │   └── ui/
    │       ├── button.tsx            Button (Base UI + CVA variants)
    │       ├── fade-in.tsx           Motion fade-in animation wrapper
    │       ├── LoginUI.tsx           GitHub OAuth login UI
    │       ├── avatar.tsx            User avatar (image or initials)
    │       ├── logout.tsx            Logout button with redirect
    │       ├── card.tsx              Card component (6 parts)
    │       └── separator.tsx         Horizontal/vertical separator
    │
    ├── lib/                          ◄── Shared utilities & configs
    │   ├── auth.ts                   Better-Auth server instance
    │   ├── auth-client.ts            Better-Auth client (browser)
    │   ├── db.ts                     Prisma client singleton
    │   ├── utils.ts                  cn() helper (clsx + tailwind-merge)
    │   └── generated/
    │       └── prisma/               Prisma-generated client code
    │           ├── client.ts         Main Prisma client
    │           ├── browser.ts        Browser-safe types
    │           ├── models.ts         Barrel export for models
    │           ├── enums.ts          Schema enums (empty)
    │           ├── commonInputTypes.ts  Filter types (StringFilter, etc.)
    │           ├── models/           Per-model type definitions
    │           │   ├── User.ts
    │           │   ├── Session.ts
    │           │   ├── Account.ts
    │           │   └── Verification.ts
    │           └── internal/         Runtime Prisma internals
    │               ├── class.ts
    │               ├── prismaNamespace.ts
    │               └── prismaNamespaceBrowser.ts
    │
    ├── module/                       ◄── Feature modules (server-only)
    │   ├── auth/
    │   │   └── utils/
    │   │       └── auth-utils.ts     Server auth: getSession, requireAuth, requireUnAuth
    │   ├── dashboard/
    │   │   └── index.ts              getDashboardStats() — fetches all dashboard data
    │   ├── github/
    │   │   └── lib/
    │   │       └── github.ts         GitHub API: getGithubToken, fetchUserContribution, getMonthlyActivity
    │   └── test/                     (empty/test directory)
    │
    ├── prisma/                       ◄── Database schema & migrations
    │   ├── schema.prisma             Prisma schema (4 models: User, Session, Account, Verification)
    │   └── migrations/
    │       └── 20260710100312_authentication/
    │           └── migration.sql     Initial migration (all tables)
    │
    ├── public/                       ◄── Static assets
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    │
    └── .next/                        ◄── Next.js build output (gitignored)
        └── ...
```

---

## 4. Complete File Inventory & Roles

### 4.1 Root Configuration Files

| File | Role | Key Details |
|------|------|-------------|
| `package.json` | Project manifest & dependencies | 40+ dependencies, Next.js 16.2.10, React 19.2.4 |
| `tsconfig.json` | TypeScript configuration | Strict mode, bundler module resolution, `@/*` path alias |
| `next.config.ts` | Next.js configuration | GitHub avatar images allowed, dev origin `192.168.29.209` |
| `postcss.config.mjs` | PostCSS plugin config | Uses `@tailwindcss/postcss` |
| `eslint.config.mjs` | Linting rules | Next.js core-web-vitals + TypeScript |
| `components.json` | shadcn/ui configuration | base-nova style, RSC enabled, lucide icons |
| `prisma.config.ts` | Prisma env loader | Loads `.env` for Prisma CLI |
| `.env` | Environment variables | **SECRETS**: DB URL, Better-Auth secret, GitHub OAuth credentials |
| `.gitignore` | Git ignore rules | node_modules, .next, .env, logs, OS files |
| `AGENTS.md` | AI agent instructions | Warns: "This is NOT the Next.js you know" — breaking changes |
| `CLAUDE.md` | Claude AI reference | References `@AGENTS.md` |
| `README.md` | Default readme | Standard Next.js bootstrapped project readme |
| `PROJECT_STRUCTURE.md` | Architecture docs | 798 lines with 6 Mermaid diagrams (existing, partially outdated) |

### 4.2 App Router Pages (`app/`)

| File | Role | Key Details |
|------|------|-------------|
| `layout.tsx` | **Root Layout** | Sora (sans) + Geist Mono fonts, dark mode, HTML metadata: "codeSentinel" |
| `page.tsx` | **Homepage (Landing)** | Server component, checks optional session, renders `<Homepage>` |
| `globals.css` | **Global Styles** | 185 lines: CSS custom properties for light/dark themes, `@theme inline` block, `.app-background` radial gradient, font stacks |
| `login/page.tsx` | **Login Page** | Server component, `requireUnAuth()` guard, renders `<LoginUI>` |
| `dashboard/page.tsx` | **Dashboard** | Server component, `requireAuth()` guard, fetches stats via `getDashboardStats()`, renders 4 stat cards + contribution graph + recent activity |
| `reviews/page.tsx` | **Reviews Page** | Server component, empty state — "No open reviews" |
| `repositories/page.tsx` | **Repositories Page** | Server component, empty state — "No repositories connected" + CTA |
| `settings/page.tsx` | **Settings Page** | Server component, displays user profile from session + logout button |
| `api/auth/[...all]/route.ts` | **Auth API Handler** | 4 lines: Exports `POST` and `GET` from `toNextJsHandler(auth)` |

### 4.3 Components (`components/`)

| File | Role | Client/Server | Key Details |
|------|------|---------------|-------------|
| `brand/logo.tsx` | **Logo + LogoMark** | Server | Chevron/arrow SVG icon, optional href, sm/md sizes, "codeSentinel" text |
| `layout/dashboard-shell.tsx` | **Dashboard Layout** | Server | Responsive: sidebar (desktop) vs header + bottom nav (mobile) |
| `layout/sidebar.tsx` | **Desktop Sidebar** | Client (`"use client"`) | 240px width, 4 nav items with active state, user profile + logout |
| `layout/mobile-nav.tsx` | **Mobile Bottom Nav** | Client (`"use client"`) | Fixed bottom, same 4 nav items, `z-50`, hidden on md+ |
| `layout/app-background.tsx` | **Background Wrapper** | Server | `app-background` CSS class with radial gradient |
| `marketing/homepage.tsx` | **Landing Page** | Client (`"use client"`) | Hero, stats bar, 6 features grid, 3 steps, CTA, footer |
| `marketing/marketing-header.tsx` | **Marketing Header** | Server | Sticky, logo, Features/How-it-works links, conditional auth buttons |
| `providers/query-provider.tsx` | **TanStack Query** | Client (`"use client"`) | Wraps children with `QueryClientProvider` |
| `ui/button.tsx` | **Button** | Server | `@base-ui/react/button` + CVA: 6 variants, 7 sizes |
| `ui/fade-in.tsx` | **Fade Animation** | Client (`"use client"`) | Motion: opacity 0→1, y: 6→0, 0.35s, configurable delay |
| `ui/LoginUI.tsx` | **GitHub Login UI** | Client (`"use client"`) | GitHub SVG icon, loading state, calls `signIn.social({ provider: "github" })` |
| `ui/avatar.tsx` | **User Avatar** | Server | Next.js Image if src, else initials fallback, 3 sizes |
| `ui/logout.tsx` | **Logout Button** | Client (`"use client"`) | Calls `signOut()` with redirect to `/login` |
| `ui/card.tsx` | **Card Component** | Server | 6 sub-components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `ui/separator.tsx` | **Separator** | Server | Horizontal or vertical, `role="separator"` |

### 4.4 Library Modules (`lib/`)

| File | Role | Key Details |
|------|------|-------------|
| `auth.ts` | **Better-Auth Server** | Creates `betterAuth()` instance with Prisma adapter + GitHub OAuth (`repo` scope) |
| `auth-client.ts` | **Better-Auth Client** | Creates `createAuthClient()` for browser: `signIn`, `signUp`, `useSession`, `signOut` |
| `db.ts` | **Prisma Client Singleton** | `PrismaPg` adapter + singleton pattern for hot-reload safety |
| `utils.ts` | **Utility Functions** | `cn()` — clsx + tailwind-merge for class merging |
| `generated/prisma/` | **Prisma Generated** | Auto-generated types and client (7 files + subdirectories) |

### 4.5 Feature Modules (`module/`)

| File | Role | Directive | Key Details |
|------|------|-----------|-------------|
| `auth/utils/auth-utils.ts` | **Server Auth Guards** | `"use server"` | `getOptionalSession()`, `requireAuth()`, `requireUnAuth()` |
| `dashboard/index.ts` | **Dashboard Data** | `"use server"` | `getDashboardStats()` — fetches repos, commits, PRs, activity from GitHub |
| `github/lib/github.ts` | **GitHub API** | `"use server"` | `getGithubToken()`, `fetchUserContribution()` (GraphQL), `getMonthlyActivity()` |

### 4.6 Database (`prisma/`)

| File | Role | Key Details |
|------|------|-------------|
| `schema.prisma` | **Database Schema** | 4 models: User, Session, Account, Verification; PostgreSQL |
| `migrations/20260710100312_authentication/migration.sql` | **Initial Migration** | Creates all 4 tables with indexes and foreign keys (CASCADE) |

### 4.7 Static Assets (`public/`)

| File | Type |
|------|------|
| `file.svg` | Generic file icon |
| `globe.svg` | Globe icon |
| `next.svg` | Next.js logo |
| `vercel.svg` | Vercel logo |
| `window.svg` | Window icon |

---

## 5. Architecture Diagram

```mermaid
graph TB
    %% ===== LAYERS =====
    subgraph "🖥️ Presentation Layer (components/)"
        LP[Homepage<br/>homepage.tsx]
        MH[MarketingHeader<br/>marketing-header.tsx]
        LI[LoginUI<br/>LoginUI.tsx]
        DS[DashboardShell<br/>dashboard-shell.tsx]
        SB[Sidebar<br/>sidebar.tsx]
        MN[MobileNav<br/>mobile-nav.tsx]
        ABG[AppBackground<br/>app-background.tsx]
        AV[Avatar<br/>avatar.tsx]
        LO[Logout<br/>logout.tsx]
        BTN[Button<br/>button.tsx]
        FI[FadeIn<br/>fade-in.tsx]
        CARD[Card<br/>card.tsx]
        LOGO[Logo<br/>logo.tsx]
        QP[QueryProvider<br/>query-provider.tsx]
    end

    subgraph "📄 Pages (app/)"
        ROOT[Root Layout<br/>layout.tsx]
        HOME[Homepage<br/>page.tsx]
        LOGIN[Login<br/>login/page.tsx]
        DASH[Dashboard<br/>dashboard/page.tsx]
        REV[Reviews<br/>reviews/page.tsx]
        REPO[Repositories<br/>repositories/page.tsx]
        SETT[Settings<br/>settings/page.tsx]
        AUTH_API[Auth API<br/>api/auth/[...all]/route.ts]
    end

    subgraph "🔧 Server Modules (module/)"
        AUTH_UTILS[Auth Utils<br/>auth-utils.ts]
        DASH_MOD[Dashboard Module<br/>dashboard/index.ts]
        GITHUB_MOD[GitHub Module<br/>github/lib/github.ts]
    end

    subgraph "📚 Library (lib/)"
        AUTH_SERVER[Auth Server<br/>lib/auth.ts]
        AUTH_CLIENT[Auth Client<br/>lib/auth-client.ts]
        DB[Prisma Client<br/>lib/db.ts]
        UTILS[Utils<br/>lib/utils.ts]
        PRISMA_GEN[Generated Prisma<br/>lib/generated/prisma/]
    end

    subgraph "🗄️ Database & External"
        PG[(Neon PostgreSQL)]
        GH_API[GitHub API<br/>octokit]
    end

    %% === PAGE → LAYOUT FLOWS ===
    HOME --> ROOT
    HOME --> ABG
    HOME --> LP
    LP --> MH
    LP --> FI
    LP --> BTN
    LP --> LOGO

    LOGIN --> ROOT
    LOGIN --> LI
    LI --> LOGO
    LI --> BTN
    LI --> FI

    DASH --> ROOT
    DASH --> DS
    DS --> SB
    DS --> MN
    DS --> ABG
    DS --> AV
    DS --> LO
    DS --> LOGO
    SB --> LOGO
    SB --> AV
    SB --> LO
    DASH --> FI
    DASH --> CARD

    REV --> ROOT
    REV --> DS
    REPO --> ROOT
    REPO --> DS
    SETT --> ROOT
    SETT --> DS

    %% === AUTH FLOW ===
    LOGIN --> AUTH_UTILS
    DASH --> AUTH_UTILS
    REV --> AUTH_UTILS
    REPO --> AUTH_UTILS
    SETT --> AUTH_UTILS
    HOME --> AUTH_UTILS
    AUTH_UTILS --> AUTH_SERVER
    AUTH_API --> AUTH_SERVER
    AUTH_CLIENT --> LI
    AUTH_CLIENT --> LO

    %% === DATA FLOW ===
    DASH --> DASH_MOD
    DASH_MOD --> GITHUB_MOD
    GITHUB_MOD --> AUTH_SERVER
    GITHUB_MOD --> DB
    DB --> PG
    GITHUB_MOD --> GH_API
    AUTH_SERVER --> DB
    DB --> PRISMA_GEN

    %% === UI UTILITY ===
    SB --> UTILS
    MN --> UTILS
    BTN --> UTILS
    FI --> UTILS
    DS --> UTILS
    AV --> UTILS
    CARD --> UTILS

    %% === STYLING ===
    ROOT --> GS[globals.css]
    HOME --> GS
    LOGIN --> GS
    DASH --> GS
    REV --> GS
    REPO --> GS
    SETT --> GS

    classDef page fill:#e1f5fe,stroke:#01579b
    classDef component fill:#e8f5e9,stroke:#2e7d32
    classDef module fill:#fff3e0,stroke:#e65100
    classDef lib fill:#f3e5f5,stroke:#6a1b9a
    classDef infra fill:#fce4ec,stroke:#c62828
    classDef external fill:#e0f2f1,stroke:#00695c

    class HOME,LOGIN,DASH,REV,REPO,SETT,ROOT page
    class LP,MH,LI,DS,SB,MN,ABG,AV,LO,BTN,FI,CARD,LOGO,QP component
    class AUTH_UTILS,DASH_MOD,GITHUB_MOD module
    class AUTH_SERVER,AUTH_CLIENT,DB,UTILS,PRISMA_GEN lib
    class AUTH_API,GS infra
    class PG,GH_API external
```

---

## 6. File Connections & Data Flow

### 6.1 Authentication Data Flow

```
User clicks "Continue with GitHub"
        │
        ▼
LoginUI.tsx ──► signIn.social({ provider: "github" })
(client)          │
                  │ calls
                  ▼
            lib/auth-client.ts
            (createAuthClient)
                  │
                  │ POST request to
                  ▼
            app/api/auth/[...all]/route.ts
                  │
                  │ toNextJsHandler(auth)
                  ▼
            lib/auth.ts (betterAuth instance)
                  │
                  ├──► GitHub OAuth (clientId + clientSecret)
                  │       │
                  │       ▼
                  │   GitHub redirects back with token
                  │
                  ├──► Prisma Adapter ──► lib/db.ts ──► PostgreSQL
                  │       │
                  │       ├── Creates User row
                  │       ├── Creates Session row
                  │       └── Creates Account row (with accessToken)
                  │
                  └──► Returns session cookie to browser
```

### 6.2 Dashboard Data Flow

```
Dashboard Page (app/dashboard/page.tsx)
    │
    │ await requireAuth()
    ▼
module/auth/utils/auth-utils.ts
    │
    │ auth.api.getSession() ──► lib/auth.ts ──► lib/db.ts ──► PostgreSQL
    ▼
  Returns session (or redirects to /login)
    │
    │ await getDashboardStats()
    ▼
module/dashboard/index.ts
    │
    ├──► auth.api.getSession() ──► validate session
    │
    ├──► getGithubToken()
    │       │
    │       ▼
    │   module/github/lib/github.ts
    │       │
    │       ├──► auth.api.getSession()
    │       ├──► prisma.account.findFirst({ userId, providerId: "github" })
    │       └──► returns account.accessToken
    │
    ├──► new Octokit({ auth: token })
    │       │
    │       ├──► octokit.rest.users.getAuthenticated()
    │       │       └──► user data (public_repos, total_private_repos)
    │       │
    │       ├──► fetchUserContribution(token, username)
    │       │       │
    │       │       ▼
    │       │   GitHub GraphQL API (contributionsCollection)
    │       │       └──► totalContributions, weeks[], contributionDays[]
    │       │
    │       ├──► octokit.rest.search.issuesAndPullRequests({ author, type:pr })
    │       │       └──► recent PRs → formatted as recentActivity[]
    │       │
    │       └──► Process contribution calendar → contributionHeights[30]
    │
    └──► Returns { totalRepos, totalCommits, totalPrs, recentActivity, contributionHeights }
```

### 6.3 Component Import Map

```
app/layout.tsx
    ├── imports: fonts (Sora, Geist_Mono)
    └── imports: ./globals.css

app/page.tsx
    ├── imports: getOptionalSession() from module/auth/utils/auth-utils
    └── imports: Homepage from components/marketing/homepage

app/login/page.tsx
    └── imports: requireUnAuth() from module/auth/utils/auth-utils
    └── imports: LoginUI from components/ui/LoginUI

app/dashboard/page.tsx
    ├── imports: requireAuth() from module/auth/utils/auth-utils
    ├── imports: getDashboardStats() from module/dashboard
    └── imports: DashboardShell, FadeIn, Card, Button, Avatar

app/reviews/page.tsx ──► imports: requireAuth, DashboardShell
app/repositories/page.tsx ──► imports: requireAuth, DashboardShell
app/settings/page.tsx ──► imports: requireAuth, DashboardShell, Avatar, Logout

components/marketing/homepage.tsx
    ├── imports: MarketingHeader, AppBackground, Button, FadeIn
    └── uses: Link (next/link), Lucide icons

components/layout/dashboard-shell.tsx
    ├── imports: Sidebar, MobileNav, Logo, Avatar, Logout, cn()
    └── Renders: responsive layout (sidebar | header + nav)

components/layout/sidebar.tsx
    ├── imports: Logo, Avatar, Logout, cn(), usePathname()
    └── uses: Lucide icons (LayoutDashboard, GitPullRequest, FolderGit2, Settings)

components/ui/LoginUI.tsx
    ├── imports: signIn from lib/auth-client, Logo, Button, FadeIn
    └── calls: signIn.social({ provider: "github" })

components/ui/logout.tsx
    ├── imports: signOut from lib/auth-client, useRouter
    └── calls: signOut() → router.push("/login")

module/auth/utils/auth-utils.ts
    ├── imports: auth from lib/auth, headers(), redirect()
    └── exports: getOptionalSession, requireAuth, requireUnAuth

module/dashboard/index.ts
    ├── imports: fetchUserContribution, getGithubToken from module/github/lib/github
    ├── imports: auth from lib/auth, Octokit, formatDistanceToNow
    └── exports: getDashboardStats

module/github/lib/github.ts
    ├── imports: Octokit, auth from lib/auth, prisma from lib/db
    └── exports: getGithubToken, fetchUserContribution, getMonthlyActivity

lib/auth.ts
    ├── imports: betterAuth, prismaAdapter, prisma from lib/db
    └── exports: auth (betterAuth instance)

lib/auth-client.ts
    ├── imports: createAuthClient
    └── exports: signIn, signUp, useSession, signOut

lib/db.ts
    ├── imports: PrismaClient from lib/generated/prisma/client, PrismaPg
    └── exports: prisma (singleton)
```

---

## 7. Authentication Flow

### 7.1 Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextAuth as Better-Auth API
    participant GitHub as GitHub OAuth
    participant DB as PostgreSQL

    Note over User,DB: UNAUTHENTICATED FLOW

    User->>Browser: Visit /
    Browser->>NextAuth: getOptionalSession()
    NextAuth->>DB: Check session cookie
    DB-->>NextAuth: No session
    NextAuth-->>Browser: null
    Browser->>User: Show Homepage

    User->>Browser: Click "Get started"
    Browser->>User: Show /login page

    User->>Browser: Click "Continue with GitHub"
    Browser->>GitHub: Redirect to GitHub OAuth
    GitHub->>User: GitHub login page
    User->>GitHub: Enter credentials
    GitHub-->>Browser: Redirect back with auth code
    Browser->>NextAuth: POST /api/auth/callback
    NextAuth->>GitHub: Exchange code for token
    GitHub-->>NextAuth: access_token (+ repo scope)
    NextAuth->>DB: Create User record
    NextAuth->>DB: Create Account record (with accessToken)
    NextAuth->>DB: Create Session record
    NextAuth-->>Browser: Set session cookie, redirect to /dashboard
    Browser->>User: Show Dashboard

    Note over User,DB: AUTHENTICATED FLOW

    User->>Browser: Visit /dashboard
    Browser->>NextAuth: requireAuth() → getSession()
    NextAuth->>DB: Validate session cookie
    DB-->>NextAuth: Session + User
    NextAuth-->>Browser: Session data
    Browser->>User: Render Dashboard

    User->>Browser: Click "Sign out"
    Browser->>NextAuth: signOut()
    NextAuth->>DB: Destroy session
    NextAuth-->>Browser: Redirect to /login
    Browser->>User: Show Login page
```

### 7.2 Auth Guards Summary

| Guard | Used By | Behavior |
|-------|---------|----------|
| `requireAuth()` | Dashboard, Reviews, Repositories, Settings | Redirects to `/login` if no session |
| `requireUnAuth()` | Login page | Redirects to `/dashboard` if session exists |
| `getOptionalSession()` | Homepage | Returns session or null (no redirect) |

---

## 8. Routing Map

```mermaid
flowchart TD
    START([User Visits /]) --> CHECK_AUTH{Is Authenticated?}
    CHECK_AUTH -->|No| HOMEPAGE[Homepage /]
    CHECK_AUTH -->|Yes| DASHBOARD[Dashboard /dashboard]

    HOMEPAGE --> USER_ACTION{User Action}
    USER_ACTION -->|"Get started"| LOGIN[/login]
    USER_ACTION -->|"Features"| FEATURES[#features section]
    USER_ACTION -->|"How it works"| HOW[#how-it-works section]
    USER_ACTION -->|"Sign in"| LOGIN

    LOGIN --> GITHUB_CLICK{"Continue with GitHub?"}
    GITHUB_CLICK -->|Yes| OAUTH[GitHub OAuth Flow]
    GITHUB_CLICK -->|No| LOGIN

    OAUTH --> AUTH_SUCCESS{Success?}
    AUTH_SUCCESS -->|Yes| DASHBOARD
    AUTH_SUCCESS -->|No| LOGIN[Show error]

    DASHBOARD --> NAV{Navigate To}
    NAV -->|Overview| DASH[/dashboard]
    NAV -->|Reviews| REV[/reviews]
    NAV -->|Repositories| REPO[/repositories]
    NAV -->|Settings| SETT[/settings]

    DASH --> STATS[View Stats Cards]
    DASH --> GRAPH[View Contribution Graph]
    DASH --> ACTIVITY[View Recent Activity]
    DASH --> EMPTY_ACT[Empty State: Connect Repo]

    REV --> REV_EMPTY[Empty State: No Reviews]
    REPO --> REPO_EMPTY[Empty State: No Repos + CTA]
    SETT --> PROFILE[View Profile]
    SETT --> SESSION[Session Management / Logout]

    LOGOUT[Logout Click] --> LOGIN

    style HOMEPAGE fill:#e3f2fd
    style LOGIN fill:#fff3e0
    style DASHBOARD fill:#e8f5e9
    style OAUTH fill:#fff9c4
    style REV fill:#e8f5e9
    style REPO fill:#e8f5e9
    style SETT fill:#e8f5e9
```

### Route Table

| Route | File | Auth Required | Page Component | Layout |
|-------|------|---------------|----------------|--------|
| `/` | `app/page.tsx` | Optional | `<Homepage>` | Root Layout + AppBackground |
| `/login` | `app/login/page.tsx` | Must be unauthenticated | `<LoginUI>` | Root Layout |
| `/dashboard` | `app/dashboard/page.tsx` | Yes | `<DashboardPage>` | Root Layout + DashboardShell |
| `/reviews` | `app/reviews/page.tsx` | Yes | `<ReviewsPage>` | Root Layout + DashboardShell |
| `/repositories` | `app/repositories/page.tsx` | Yes | `<RepositoriesPage>` | Root Layout + DashboardShell |
| `/settings` | `app/settings/page.tsx` | Yes | `<SettingsPage>` | Root Layout + DashboardShell |
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | N/A | API handler | N/A (API route) |

---

## 9. Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image nullable
        datetime createdAt
        datetime updatedAt
    }

    Session {
        string id PK
        datetime expiresAt
        string token UK
        datetime createdAt
        datetime updatedAt
        string ipAddress nullable
        string userAgent nullable
        string userId FK
    }

    Account {
        string id PK
        string accountId
        string providerId
        string userId FK
        string accessToken nullable
        string refreshToken nullable
        string idToken nullable
        datetime accessTokenExpiresAt nullable
        datetime refreshTokenExpiresAt nullable
        string scope nullable
        string password nullable
        datetime createdAt
        datetime updatedAt
    }

    Verification {
        string id PK
        string identifier
        string value
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }

    User ||--o{ Session : "has many"
    User ||--o{ Account : "has many"
```

### Table Details

#### `user` (maps to `user` table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | String | Primary Key |
| name | String | Required |
| email | String | Required, Unique |
| emailVerified | Boolean | Default: false |
| image | String? | Nullable |
| createdAt | DateTime | Default: now() |
| updatedAt | DateTime | Auto-updated |

#### `session` (maps to `session` table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | String | Primary Key |
| expiresAt | DateTime | Required |
| token | String | Required, Unique |
| createdAt | DateTime | Default: now() |
| updatedAt | DateTime | Auto-updated |
| ipAddress | String? | Nullable |
| userAgent | String? | Nullable |
| userId | String | Foreign Key → User (CASCADE) |

#### `account` (maps to `account` table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | String | Primary Key |
| accountId | String | Required |
| providerId | String | Required |
| userId | String | Foreign Key → User (CASCADE) |
| accessToken | String? | **Stores GitHub OAuth token** |
| refreshToken | String? | Nullable |
| idToken | String? | Nullable |
| accessTokenExpiresAt | DateTime? | Nullable |
| refreshTokenExpiresAt | DateTime? | Nullable |
| scope | String? | "repo" (GitHub scope) |
| password | String? | Nullable |
| createdAt | DateTime | Default: now() |
| updatedAt | DateTime | Auto-updated |

#### `verification` (maps to `verification` table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | String | Primary Key |
| identifier | String | Required |
| value | String | Required |
| expiresAt | DateTime | Required |
| createdAt | DateTime | Default: now() |
| updatedAt | DateTime | Auto-updated |

---

## 10. Component Hierarchy

### 10.1 Unauthenticated Tree

```
<html> (Root Layout)
├── globals.css (styles)
├── Sora font (sans)
├── Geist Mono font (mono)
└── <body>
    └── <AppBackground>
        └── <MarketingHeader>
            ├── <Logo href="/" />
            ├── <a href="#features">Features</a>
            ├── <a href="#how-it-works">How it works</a>
            ├── <Button>Sign in</Button>
            └── <Button>Get started</Button>
        └── <Homepage>
            ├── Hero Section
            │   ├── <FadeIn>
            │   │   ├── h1: "Automate code reviews. Ship with confidence."
            │   │   ├── p: description
            │   │   ├── <Button>Get started</Button>
            │   │   └── <Button>Learn more</Button>
            │   └── </FadeIn>
            ├── Stats Bar (4 stats: 50%, 10k+, 99.9%, <30s)
            ├── Features Grid (6 features)
            │   ├── <FadeIn> × 6 (staggered 0.05s each)
            │   └── Each: icon + title + description
            ├── How It Works (3 steps)
            │   ├── <FadeIn> × 3 (staggered 0.08s each)
            │   └── Each: step number + title + description
            ├── CTA Section
            │   └── <FadeIn>
            │       ├── h2: "Ship high-quality code today."
            │       └── <Button>Get started</Button>
            └── Footer
                ├── © codeSentinel
                ├── Terms
                ├── Privacy
                └── Sign in

    └── <LoginUI>
        └── <FadeIn>
            ├── h1: "Sign in"
            ├── p: "Continue with GitHub..."
            ├── <Button onClick={signIn.social}>
            │   ├── GitHub SVG icon
            │   └── "Continue with GitHub"
            └── Terms + Privacy links
```

### 10.2 Authenticated Tree (Dashboard)

```
<html> (Root Layout)
├── globals.css
├── Sora + Geist Mono fonts
└── <body>
    └── <DashboardShell user={...}>
        ├── [Desktop: md+]
        │   └── <Sidebar user={...}>
        │       ├── <Logo href="/dashboard" />
        │       ├── Nav Items (4)
        │       │   ├── <Link href="/dashboard"> Overview
        │       │   ├── <Link href="/reviews"> Reviews
        │       │   ├── <Link href="/repositories"> Repositories
        │       │   └── <Link href="/settings"> Settings
        │       ├── User Profile
        │       │   ├── <Avatar src={image} name={name} />
        │       │   ├── User name
        │       │   └── User email
        │       └── <Logout>Sign out</Logout>
        │
        ├── [Mobile: <md]
        │   ├── Header
        │   │   ├── <Logo href="/dashboard" size="sm" />
        │   │   ├── <Avatar size="sm" />
        │   │   └── <Logout>Sign out</Logout>
        │   └── <MobileNav />
        │       └── Nav Items (4) — same as sidebar
        │
        └── <main> (page content)
            ├── [Dashboard] Header + Stats + Graph + Activity
            ├── [Reviews] Empty state
            ├── [Repositories] Empty state + CTA
            └── [Settings] Profile + Logout
```

---

## 11. Design System

### 11.1 Color Palette (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#000000` | Page background |
| `--foreground` | `#fafafa` | Primary text |
| `--card` | `#0a0a0a` | Card backgrounds |
| `--card-foreground` | `#fafafa` | Card text |
| `--border` | `#1a1a1a` | Borders / dividers |
| `--muted` | `#141414` | Muted backgrounds |
| `--muted-foreground` | `#737373` | Secondary text |
| `--secondary` | `#141414` | Secondary elements |
| `--accent` | `#1a1a1a` | Accent backgrounds |
| `--primary` | `#fafafa` | Primary buttons |
| `--primary-foreground` | `#000000` | Button text |
| `--destructive` | `#ef4444` | Error/danger |
| `--sidebar` | `#000000` | Sidebar background |

### 11.2 Typography

| Element | Font | Size | Tracking |
|---------|------|------|----------|
| Headings (h1) | Sora | text-4xl to text-7xl | -0.04em |
| Headings (h2) | Sora | text-3xl to text-4xl | -0.03em |
| Headings (h3) | Sora | text-lg font-semibold | -0.02em |
| Body | Sora | text-sm to text-base | normal |
| Labels | Sora | text-xs to text-sm | normal |
| Code | Geist Mono | text-sm | normal |

### 11.3 Spacing

| Context | Mobile | Desktop |
|---------|--------|---------|
| Page padding | `px-6 py-10` | `md:px-10 md:py-14` |
| Section spacing | `mt-10` to `mt-12` | Same |
| Container width | full | `max-w-5xl` or `max-w-6xl` |

### 11.4 Border Radius

| Element | Radius |
|---------|--------|
| Default | `rounded-md` (0.375rem) |
| Cards | `rounded-lg` (0.5rem) |
| Icons | `rounded-lg` (0.5rem) |

### 11.5 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Bottom nav + header |
| Tablet (md) | 768px+ | Sidebar (240px) + content |
| Desktop (lg) | 1024px+ | Same as tablet |
| Wide (xl) | 1280px+ | Same |

---

## 12. Environment Variables

| Variable | Value (Current) | Purpose |
|----------|----------------|---------|
| `DATABASE_URL` | `postgresql://neondb_owner:...@ep-icy-moon-...aws.neon.tech/neondb?sslmode=require` | Neon PostgreSQL connection |
| `BETTER_AUTH_SECRET` | `eqVKYkSocIPJaqkTjcBYGnzX2mbyfBpt` | Better-Auth encryption secret |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Base URL for auth callbacks |
| `GITHUB_CLIENT_ID` | `Ov23lisVq9OtxvE7AAB9` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | `22583c5df77e12c259e4bc5e0ed2639605cb5e3b` | GitHub OAuth App secret |

---

## 13. Key Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.10 | Framework |
| `react` / `react-dom` | 19.2.4 | UI library |
| `better-auth` | 1.6.23 | Authentication |
| `@prisma/client` | 7.8.0 | Database ORM |
| `@prisma/adapter-pg` | 7.8.0 | PostgreSQL adapter |
| `pg` | 8.22.0 | PostgreSQL driver |
| `octokit` | 5.0.5 | GitHub API client |
| `@tanstack/react-query` | 5.101.2 | Server state management |
| `motion` | 12.42.2 | Animations |
| `tailwindcss` | v4 | Styling |
| `shadcn` | 4.13.0 | UI components |
| `lucide-react` | 1.24.0 | Icons |
| `zod` | 4.4.3 | Validation |
| `react-hook-form` | 7.81.0 | Forms |
| `@base-ui/react` | 1.6.0 | Headless UI primitives |
| `class-variance-authority` | 0.7.1 | Component variants |
| `clsx` / `tailwind-merge` | — | Class merging |
| `date-fns` | 4.4.0 | Date formatting |
| `sonner` | 2.0.7 | Toast notifications |
| `vaul` | 1.1.2 | Drawer component |
| `cmdk` | 1.1.1 | Command palette |
| `embla-carousel-react` | 8.6.0 | Carousel |
| `recharts` | 3.9.2 | Charts |
| `axios` | 1.18.1 | HTTP client |
| `tw-animate-css` | 1.4.0 | Tailwind animation CSS |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 5.x | Type checking |
| `prisma` | 7.8.0 | Prisma CLI |
| `eslint` | 9.x | Linting |
| `eslint-config-next` | 16.2.10 | Next.js ESLint |
| `@tailwindcss/postcss` | v4 | PostCSS plugin |
| `tsx` | 4.23.0 | TypeScript execution |

---

## 14. Development Notes

### 14.1 Running the Project

```bash
cd code_review
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint check
```

### 14.2 Prisma Commands

```bash
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open database UI
```

### 14.3 Architecture Patterns

- **Server Components by default**: Only use `"use client"` when interactivity is needed (event handlers, hooks, state)
- **Server Actions**: All data fetching is done via `"use server"` modules (`module/` directory)
- **Auth guards**: `requireAuth()` and `requireUnAuth()` are server-side redirects
- **Singleton pattern**: Prisma client uses global singleton to prevent hot-reload connection leaks
- **Path aliases**: `@/` maps to `code_review/` root (e.g., `@/lib/auth`, `@/components/ui/button`)

### 14.4 Current Limitations

1. **Reviews page**: Empty state only — no actual review data displayed
2. **Repositories page**: Empty state only — no repository management UI
3. **Settings page**: Only shows profile + logout — no settings editing
4. **Dashboard stats**: Fetches real GitHub data but has fallback mock data on error
5. **GitHub token**: Retrieved from DB but no refresh logic for expired tokens
6. **No loading states**: Dashboard page doesn't have Suspense boundaries
7. **No error boundaries**: API errors may crash the page
8. **QueryProvider**: Created but not yet integrated into the app layout

### 14.5 Planned Features (from codebase context)

- Real-time PR review analysis
- AI-powered bug detection and suggestions
- Team collaboration features
- Security scanning
- Repository management UI
- Review history with filtering
- User settings editing
- Contribution analytics

### 14.6 Next.js 16 Breaking Changes (from AGENTS.md)

> ⚠️ **Important**: This project uses Next.js 16.2.10 which has breaking changes from earlier versions. Before writing any code, read the relevant guides in `node_modules/next/dist/docs/`. Pay attention to deprecation notices.

---

## Appendix: Quick Reference

### Import Paths

```
@/lib/auth              → lib/auth.ts
@/lib/auth-client       → lib/auth-client.ts
@/lib/db                → lib/db.ts
@/lib/utils             → lib/utils.ts
@/components/*          → components/*
@/module/*              → module/*
@/app/*                 → app/*
```

### Key Server Functions

```typescript
// Auth
getOptionalSession()  → Session | null        (module/auth/utils/auth-utils.ts)
requireAuth()         → Session (or redirect)  (module/auth/utils/auth-utils.ts)
requireUnAuth()       → Session | null         (module/auth/utils/auth-utils.ts)

// Dashboard
getDashboardStats()   → DashboardStats         (module/dashboard/index.ts)

// GitHub
getGithubToken()      → string                 (module/github/lib/github.ts)
fetchUserContribution() → ContributionCalendar  (module/github/lib/github.ts)
getMonthlyActivity()  → MonthlyActivity[]       (module/github/lib/github.ts)
```

### Key Client Functions

```typescript
// Auth Client (lib/auth-client.ts)
signIn.social({ provider: "github" })   → Promise<void>
signOut({ fetchOptions: { onSuccess } }) → Promise<void>
useSession()                              → Session | null

// Utils (lib/utils.ts)
cn(...classes) → string   // Merge Tailwind classes
```

---

> **End of Documentation**
> Generated: July 2026
> Total files documented: 47 source files