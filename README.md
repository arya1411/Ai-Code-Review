# codeSentinel

Repository-aware AI review and codebase chat for GitHub repositories.

**Repository chat and indexing are enabled by default** (`REPOSITORY_INDEXING_ENABLED=1`). Connect a repository to build its source index, ask questions with file citations, and receive repository-aware PR reviews. A Gemini embedding key and Groq key are required. Set the flag to `0` for diff-only PR reviews without embeddings or chat.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the deployment review, remaining launch requirements, and production setup.

## MVP capabilities

- GitHub OAuth authentication through Better Auth.
- Repository discovery, connection, webhook installation, and disconnection.
- Background source indexing through Inngest, Gemini embeddings, and PostgreSQL with pgvector search.
- Explicit repository index states: `NOT_INDEXED`, `INDEXING`, `READY`, and `FAILED`.
- Retryable indexing with stale-vector cleanup and repository-scoped isolation.
- Groq-powered codebase chat grounded in retrieved source chunks with file citations.
- Signed GitHub `push` and `pull_request` webhook processing.
- Background pull-request analysis with Groq GPT-OSS 120B.
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
             PostgreSQL + pgvector                 Groq GPT-OSS 120B
                                                              │
                                      PostgreSQL Review + Finding ─> GitHub comment
```

## Requirements

- Node.js 22 or newer
- PostgreSQL with the `vector` extension (the project is configured for Neon)
- GitHub OAuth application
- Public HTTPS application URL for GitHub webhooks
- Google Generative AI API key only when repository indexing is enabled
- Groq API key
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
| `REPOSITORY_INDEXING_ENABLED` | Defaults to `1`; set to `0` for diff-only PR reviews without indexing or chat |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Required only when indexing is enabled |
| `GROQ_API_KEY` | Groq key for repository chat and pull-request reviews |
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
3. Confirm `index-repo` runs in Inngest and the repository becomes **Ready**. Existing connections can be indexed with **Re-index**.
4. Open `/dashboard/chat`, select the repository, and ask how authentication works. Verify the answer and its file citations. Chat can use a bounded GitHub source sample while indexing is unavailable.
5. Open or update a non-draft pull request in the connected repository.
6. Confirm the GitHub webhook returns `202` and the Inngest function succeeds.
7. Open `/reviews` and verify the review moves from `QUEUED` to `ANALYZING` to `COMPLETED`, then confirm the single codeSentinel PR comment is created or updated.
8. Disconnect the repository and verify its webhook, database record, reviews, and user-scoped vectors are removed.

After changing the indexing flag or upgrading the workflow, restart/redeploy and sync `/api/inngest` again. With indexing enabled, confirm `index-repo`, `recover-cancelled-index`, and `review-pull-request` are registered. Existing connections can be re-indexed manually; no automatic bulk re-index is performed.

## Important implementation limits

- Source snapshots sample at most 150 GitHub files, 36,000 characters per file, and 240,000 source characters total; background indexing includes at most 80 chunks. Generated and sensitive files are excluded. Large repositories are only partially indexed.
- Background embeddings use bounded durable steps with 61-second Inngest sleeps between batches, leaving serverless requests idle during waits. Completed batches survive later retries, and the previous index stays available until atomic publication. Overlapping runs use a publication guard so an older run cannot replace a newer index.
- Batch pacing applies per indexing run. For the pilot, index one repository at a time and monitor Gemini/Groq quotas; shared provider-wide rate limiting is still needed before unrestricted access.
- Repository chat caps source context at 12,000 characters and recent history at 4,000; citations include only sources supplied to the model.
- Pull-request analysis considers at most 100 changed files and sends up to 14,000 diff characters plus 4,000 repository-context characters to fit the current Groq 8K TPM tier.
- Chat history is session-local and is not persisted.
- PostgreSQL performs exact cosine-distance ranking through pgvector; approximate indexing can be added later after retrieval-quality evaluation.

These are explicit MVP limits, not simulated behavior.
