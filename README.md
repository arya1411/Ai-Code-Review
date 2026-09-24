# codeSentinel

Repository-aware AI review and codebase chat for GitHub repositories.

## MVP capabilities

- GitHub OAuth authentication through Better Auth.
- Repository discovery, connection, webhook installation, and disconnection.
- Background source indexing through Inngest, Gemini embeddings, and PostgreSQL with pgvector search.
- Explicit repository index states: `NOT_INDEXED`, `INDEXING`, `READY`, and `FAILED`.
- Retryable indexing with stale-vector cleanup and repository-scoped isolation.
- Codebase chat grounded in retrieved source chunks with file citations.
- Signed GitHub `push` and `pull_request` webhook processing.
- Background pull-request analysis with Gemini 3.6 Flash.
- Persisted review risk scores, reasons, findings, status, and failure details.
- Real GitHub contribution, pull-request, repository, and commit dashboard data.

Completed reviews are displayed inside codeSentinel and published as an idempotent GitHub pull-request comment.

## Architecture

```text
GitHub OAuth ──> Better Auth ──> PostgreSQL
      │
      └── repository connection ──> GitHub webhook
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  │                                           │
                push                                    pull_request
                  │                                           │
             Inngest sync                                Inngest review
                  │                                           │
      GitHub source ─> Gemini embeddings          GitHub diff + retrieved context
                  │                                           │
             PostgreSQL + pgvector                  Gemini 3.6 Flash
                                                              │
                                      PostgreSQL Review + Finding ─> GitHub comment
```

## Requirements

- Node.js 20 or newer
- PostgreSQL with the `vector` extension (the project is configured for Neon)
- GitHub OAuth application
- Public HTTPS application URL for GitHub webhooks
- Google Generative AI API key
- Inngest account in production, or the Inngest dev server locally

## Environment

Copy `.env.example` to `.env` and provide real values. Server configuration is validated on startup.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `BETTER_AUTH_URL` | Server-side application/auth URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Browser-visible auth URL |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated allowed origins |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GITHUB_WEBHOOK_SECRET` | HMAC secret shared by installed webhooks |
| `APP_BASE_URL` | Public base URL used for webhook creation |
| `NEXT_PUBLIC_APP_BASE_URL` | Fallback public base URL |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini generation and embedding key |
| `EMBEDDING_DIMENSIONS` | Optional; must remain `768` to match the pgvector column |
| `INNGEST_DEV` | Set to `1` when using the local Inngest dev server |

Production Inngest signing/event keys are consumed by the Inngest SDK using its standard environment variables.

## Local setup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

In another terminal:

```bash
npm run inngest:dev
```

For local GitHub webhook delivery, `APP_BASE_URL` must point to an HTTPS tunnel that forwards to the Next.js server. Reconcile existing repository webhooks after changing the public URL or webhook secret:

```bash
npm run webhooks:reconcile
```

## GitHub configuration

The OAuth callback is:

```text
<BETTER_AUTH_URL>/api/auth/callback/github
```

The application requests the GitHub `repo` scope because the MVP supports private repositories and manages repository webhooks. Installed webhooks subscribe to `push` and `pull_request` and send JSON to:

```text
<APP_BASE_URL>/api/webhooks/github
```

## Database changes

Development:

```bash
npm run db:migrate
```

Production deployment:

```bash
npx prisma migrate deploy
```

Do not use `prisma db push` for production releases because it bypasses migration history.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The baseline tests cover environment validation, GitHub webhook signatures, source chunking, vector scoring, and structured AI review parsing. `npm run ai:index-smoke` verifies Gemini embedding plus PostgreSQL retrieval with synthetic code.

## End-to-end smoke test

1. Sign in with GitHub.
2. Connect a repository on `/repositories`.
3. Confirm its state becomes `READY`; use **Re-index** if necessary.
4. Open `/dashboard/chat`, select the repository, and ask a source-specific question.
5. Open or update a non-draft pull request in the connected repository.
6. Confirm the GitHub webhook returns `202` and the Inngest function succeeds.
7. Open `/reviews` and verify the review moves from `QUEUED` to `ANALYZING` to `COMPLETED`, then confirm the single codeSentinel PR comment is created or updated.
8. Disconnect the repository and verify its webhook, database record, reviews, and user-scoped vectors are removed.

## Important implementation limits

- Indexing currently reads at most 150 GitHub files and at most 36,000 characters per file; generated directories are excluded.
- Embeddings are sent in quota-aware batches with one-minute spacing for the current 30K-token/minute Gemini tier.
- Pull-request analysis reviews at most 100 changed files and limits the assembled diff to 60,000 characters.
- Chat history is session-local and is not persisted.
- PostgreSQL performs exact cosine-distance ranking through pgvector; approximate indexing can be added later after retrieval-quality evaluation.

These are explicit MVP limits, not simulated behavior.
