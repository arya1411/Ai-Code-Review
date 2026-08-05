<h1 align="center">
  <br>
  🛡️ codeSentinel
  <br>
</h1>

<p align="center">
  <strong>AI-powered automated code review for modern development teams</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.10-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Status-In_Development-orange?style=flat-square" alt="Status" />
</p>

---

## 📖 Overview

**codeSentinel** is a SaaS application that integrates with GitHub to provide **AI-powered automated code reviews** for pull requests. It connects to your GitHub account via OAuth, pulls repository and contribution data, and will ultimately analyze pull requests — detecting bugs, security issues, and providing actionable suggestions before code reaches production.

> ⚠️ **Project Status**: Active development / MVP phase. Core authentication and dashboard are complete; AI review engine and repository management are in progress.

---

## ✅ Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| GitHub OAuth Authentication | ✅ Complete | via Better-Auth |
| Landing / Marketing Page | ✅ Complete | Hero, features, how-it-works |
| Dashboard (Stats + Activity) | ✅ Complete | Real GitHub data via Octokit |
| Contribution Graph | ✅ Complete | GitHub GraphQL API |
| Repository List (GitHub) | ✅ Complete | Fetches & connects repos |
| Reviews Page | 🔄 Placeholder | Empty state UI only |
| Repositories Page | 🔄 Placeholder | UI shell ready |
| Settings Page | 🔄 Partial | Shows profile, needs editing |
| AI Review Engine | 📋 Planned | PR analysis + bug detection |
| Repo Markdown Export | 📋 Planned | Auto-commit bot PR support |
| Multi-Repo / Org Dashboard | 📋 Planned | Cross-repo health metrics |
| CI / Webhook Triggers | 📋 Planned | Auto-reviews on push |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.10 |
| **Language** | TypeScript | 5.x |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS | v4 |
| **UI Components** | shadcn/ui + Base UI | 4.13.0 / 1.6.0 |
| **Animations** | Motion (Framer Motion) | 12.42.2 |
| **Icons** | Lucide React | 1.24.0 |
| **Authentication** | Better-Auth | 1.6.23 |
| **Database ORM** | Prisma | 7.8.0 |
| **Database** | PostgreSQL (Neon) | — |
| **GitHub API** | Octokit | 5.0.5 |
| **Forms** | React Hook Form + Zod | 7.81.0 / 4.4.3 |
| **Server State** | TanStack React Query | 5.101.2 |
| **HTTP Client** | Axios | 1.18.1 |
| **Charts** | Recharts | 3.9.2 |
| **Toasts** | Sonner | 2.0.7 |
| **Date Utils** | date-fns | 4.4.0 |

---

## 📁 Folder Structure

```
code_review/
│
├── app/                          # Next.js App Router (pages + API)
│   ├── layout.tsx                # Root layout (fonts: Sora + Geist Mono, dark mode)
│   ├── page.tsx                  # Homepage — renders marketing landing page
│   ├── globals.css               # Global CSS variables, design tokens, radial gradient
│   ├── favicon.ico
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      # Better-Auth catch-all API handler
│   │
│   ├── login/
│   │   └── page.tsx              # Login page (GitHub OAuth)
│   │
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard (stats, contribution graph, activity)
│   │   └── repository/
│   │       └── page.tsx          # Redirect/placeholder for repository sub-pages
│   │
│   ├── reviews/
│   │   └── page.tsx              # Reviews page (empty state)
│   │
│   ├── repositories/
│   │   └── page.tsx              # Repositories page (empty state + CTA)
│   │
│   └── settings/
│       └── page.tsx              # Settings page (user profile + logout)
│
├── components/                   # Reusable React components
│   │
│   ├── brand/
│   │   └── logo.tsx              # Logo + LogoMark SVG component
│   │
│   ├── layout/
│   │   ├── dashboard-shell.tsx   # Responsive layout wrapper (sidebar/mobile)
│   │   ├── sidebar.tsx           # Desktop sidebar (240px, 4 nav items)
│   │   ├── mobile-nav.tsx        # Mobile fixed bottom navigation
│   │   └── app-background.tsx    # Radial gradient background wrapper
│   │
│   ├── marketing/
│   │   ├── homepage.tsx          # Full landing page (hero, stats, features, CTA)
│   │   └── marketing-header.tsx  # Sticky marketing header with auth-aware buttons
│   │
│   ├── providers/
│   │   └── query-provider.tsx    # TanStack Query provider wrapper
│   │
│   └── ui/
│       ├── button.tsx            # Button (Base UI + CVA, 6 variants × 7 sizes)
│       ├── card.tsx              # Card with 6 sub-components
│       ├── avatar.tsx            # User avatar (image or initials fallback)
│       ├── fade-in.tsx           # Motion fade-in animation wrapper
│       ├── LoginUI.tsx           # GitHub OAuth login UI card
│       ├── logout.tsx            # Logout button with router redirect
│       ├── badge.tsx             # Status badge component
│       ├── input.tsx             # Styled input field
│       └── separator.tsx         # Horizontal / vertical separator
│
├── module/                       # Server-only feature modules ("use server")
│   │
│   ├── auth/
│   │   └── utils/
│   │       └── auth-utils.ts     # Auth guards: getOptionalSession, requireAuth, requireUnAuth
│   │
│   ├── dashboard/
│   │   └── index.ts              # getDashboardStats(), getContributionStats()
│   │
│   ├── github/
│   │   └── lib/
│   │       └── github.ts         # getGithubToken(), fetchUserContribution() (GraphQL),
│   │                             # getMonthlyActivity(), getRepositories()
│   │
│   ├── repository/
│   │   ├── index.ts              # fetchRepositories() — merges GitHub + DB repo data
│   │   ├── components/
│   │   │   └── repository-list.tsx  # Repository list UI component
│   │   └── hooks/                # Custom hooks for repository feature
│   │
│   └── test/                     # (empty, reserved for tests)
│
├── lib/                          # Shared utilities and config
│   ├── auth.ts                   # Better-Auth server instance (Prisma adapter + GitHub OAuth)
│   ├── auth-client.ts            # Better-Auth client (signIn, signOut, useSession)
│   ├── db.ts                     # Prisma singleton (PrismaPg adapter, hot-reload safe)
│   ├── utils.ts                  # cn() helper — clsx + tailwind-merge
│   └── generated/
│       └── prisma/               # Auto-generated Prisma client code
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # 5 models: User, Repository, Session, Account, Verification
│   └── migrations/
│       └── 20260710100312_authentication/
│           └── migration.sql     # Initial migration — creates all tables
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .env                          # Environment variables (secrets — not committed)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json               # shadcn/ui config (base-nova style)
├── prisma.config.ts              # Prisma env loader
├── PROJECT_DOCUMENTATION.md      # Full architecture & technical docs
└── FUTURE_UPDATES.md             # Planned feature roadmap
```

---

## 🗄️ Database Schema

Five Prisma models backed by **Neon PostgreSQL**:

```
User ──< Session   (one-to-many)
User ──< Account   (one-to-many)
User ──< Repository (one-to-many)
```

| Model | Purpose |
|-------|---------|
| `User` | Core user identity (id, name, email, image) |
| `Repository` | GitHub repos connected by the user (githubId, owner, fullName, url) |
| `Session` | Active sessions with expiry and token |
| `Account` | OAuth provider accounts — stores GitHub `accessToken` |
| `Verification` | Email verification tokens |

---

## 🔐 Authentication Flow

GitHub OAuth via **Better-Auth**:

```
User → Login Page → "Continue with GitHub"
  → GitHub OAuth (repo scope)
  → Callback → /api/auth/[...all]
  → Better-Auth creates: User + Account (accessToken) + Session rows
  → Session cookie set → redirect /dashboard
```

Auth guards (all server-side):

| Guard | Pages | Behaviour |
|-------|-------|-----------|
| `requireAuth()` | Dashboard, Reviews, Repositories, Settings | Redirects to `/login` if no session |
| `requireUnAuth()` | Login | Redirects to `/dashboard` if already signed in |
| `getOptionalSession()` | Homepage | Returns session or `null` — no redirect |

---

## 🖥️ Page Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Optional | Marketing landing page |
| `/login` | Must be logged out | GitHub OAuth sign-in |
| `/dashboard` | Required | Stats, contribution graph, recent activity |
| `/reviews` | Required | Review history (placeholder) |
| `/repositories` | Required | Repository management (placeholder) |
| `/settings` | Required | User profile + sign out |
| `/api/auth/[...all]` | N/A | Better-Auth catch-all API handler |

---

## ⚙️ Key Server Functions

```typescript
// Auth guards — module/auth/utils/auth-utils.ts
getOptionalSession()  → Session | null        // No redirect
requireAuth()         → Session               // Redirects to /login
requireUnAuth()       → void                  // Redirects to /dashboard

// Dashboard — module/dashboard/index.ts
getDashboardStats()       → { totalRepos, totalCommits, totalPrs, recentActivity, contributionHeights }
getContributionStats()    → { contribution: ContributionDay[] }

// GitHub API — module/github/lib/github.ts
getGithubToken()          → string (OAuth access token from DB)
fetchUserContribution()   → ContributionCalendar (via GraphQL)
getMonthlyActivity()      → MonthlyActivity[]
getRepositories()         → GitHub repo list (paginated)

// Repository — module/repository/index.ts
fetchRepositories(page, perPage) → GitHub repos merged with DB connection status
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) (or any PostgreSQL) database
- A [GitHub OAuth App](https://github.com/settings/developers) (callback: `http://localhost:3000/api/auth/callback/github`)

### 1. Clone and Install

```bash
git clone <repo-url>
cd code_review
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
BETTER_AUTH_SECRET="your-random-secret-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-app-client-secret"
```

### 3. Set Up the Database

```bash
npx prisma generate       # Generate Prisma client
npx prisma migrate dev    # Apply migrations to the database
# OR
npx prisma db push        # Push schema without migration history
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server (hot-reload)
npm run build     # Create production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Prisma CLI

```bash
npx prisma generate       # Regenerate client after schema changes
npx prisma migrate dev    # Create & apply a new migration
npx prisma db push        # Push schema without migration
npx prisma studio         # Open Prisma Studio (DB GUI)
```

---

## 🏗️ Architecture Patterns

- **Server Components by default** — `"use client"` only when interactivity is required
- **Server Modules** — all data fetching lives in `module/` with `"use server"` directive
- **Auth Guards** — `requireAuth()` / `requireUnAuth()` are server-side redirects, not middleware
- **Prisma Singleton** — `lib/db.ts` uses a global singleton to prevent hot-reload connection leaks
- **Path Aliases** — `@/` maps to the project root (`@/lib/auth`, `@/components/ui/button`, etc.)

---

## 🗺️ Roadmap

| Priority | Feature |
|----------|---------|
| 🔴 High | AI Review Engine — automated PR diff analysis + bug detection |
| 🔴 High | Repository Management UI — connect/disconnect repos |
| 🟡 Medium | Repo Markdown Export — auto-generate `REPO_SUMMARY.md` + optional bot PR |
| 🟡 Medium | Review History — filter, search, paginate past reviews |
| 🟡 Medium | Settings Editor — update profile, notification preferences |
| 🟢 Low | Multi-Repo / Org Dashboard — cross-repo health metrics |
| 🟢 Low | CI / Webhook Integration — trigger reviews on push events |
| 🟢 Low | Slack / Jira / GitHub App integrations |
| 🟢 Low | RBAC, SSO, Billing |

---

## 📄 Additional Documentation

- [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) — Full architecture docs, data flow diagrams, component hierarchy, design system, and API reference
- [`FUTURE_UPDATES.md`](./FUTURE_UPDATES.md) — Detailed planned features and implementation notes

---

## 🧱 Design System Highlights

- **Theme**: Dark-first (`#000000` background, `#fafafa` foreground)
- **Typography**: [Sora](https://fonts.google.com/specimen/Sora) (headings & body) + Geist Mono (code)
- **Animations**: Motion (Framer Motion) fade-in with staggered delays
- **Responsive**: Mobile-first — bottom nav on mobile, 240px sidebar on tablet/desktop

---

<p align="center">Built with ❤️ using Next.js, Better-Auth, Prisma, and the GitHub API</p>
