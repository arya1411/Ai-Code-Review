# codeSentinel architecture

This document describes the implemented MVP. For setup, environment variables, verification commands, and operational limits, see `README.md`.

## Product flow

### Authentication

1. The user signs in with GitHub through Better Auth.
2. Better Auth stores the user, session, account, and GitHub OAuth access token in PostgreSQL.
3. Authenticated server pages use `requireAuth()`; browser code never receives the OAuth token.

### Repository connection and indexing

1. `/repositories` reads the authenticated user's GitHub repositories with Octokit.
2. `connectRepository()` verifies the selected GitHub repository identity.
3. The server creates or updates a signed GitHub webhook for `push` and `pull_request` events.
4. A user-scoped `Repository` row is created.
5. A `repository.connected` Inngest event starts indexing.
6. The indexing function records `INDEXING`, fetches source files, chunks them, generates embeddings, and transactionally replaces that repository's PostgreSQL chunks.
7. Embeddings are stored in a native PostgreSQL `vector(768)` column.
8. The repository becomes `READY`; failures are recorded as `FAILED` with an error message.

Push webhooks emit `repository.sync`, which runs the same refresh pipeline. Users can also request a refresh from `/repositories`.

### Repository chat

1. `/dashboard/chat` lists only repositories owned by the authenticated database user.
2. Chat uses an existing vector index when available and can fall back to direct GitHub source retrieval while indexing is unavailable.
3. `askRepository()` validates ownership again on the server.
4. The question is embedded and PostgreSQL performs an exact, user-scoped pgvector cosine search; direct lexical source selection is the fallback when no index exists.
5. The most relevant chunks and recent browser-session conversation are passed to Groq's GPT-OSS 120B model.
6. The answer is returned with source-file citations.

Chat messages are intentionally session-local in the MVP.

### Pull-request reviews

1. GitHub sends a signed `pull_request` webhook for `opened`, `reopened`, `synchronize`, or `ready_for_review`.
2. The route validates the raw-body HMAC before parsing or processing the payload.
3. Draft PRs are ignored until `ready_for_review`.
4. A `Review` is upserted for each connected user/repository/head-SHA combination.
5. `pull-request.review.requested` starts a background Inngest function.
6. The function moves the review through `QUEUED`, `ANALYZING`, and either `COMPLETED` or `FAILED`.
7. Octokit loads PR metadata and changed-file patches.
8. The retrieval layer asks PostgreSQL for the top related chunks through pgvector and degrades to diff-only analysis if context retrieval fails.
9. Groq GPT-OSS 120B returns schema-validated JSON containing a risk score, risk level, summary, reasons, and findings.
10. The review and its findings are stored transactionally, displayed on `/reviews`, and published as a create-or-update GitHub PR comment.

## Data model

| Model | Responsibility |
| --- | --- |
| `User` | Authenticated identity |
| `Account` | OAuth provider data and GitHub token |
| `Session` | Better Auth session |
| `Verification` | Better Auth verification data |
| `Repository` | User-scoped GitHub connection and indexing state |
| `Review` | One analysis for a repository, GitHub PR ID, and head SHA |
| `Finding` | Actionable issue belonging to a review |
| `RepositoryCodeChunk` | User-scoped source chunk and Gemini embedding used for retrieval |

Important constraints:

- `Repository` is unique by `(userId, githubId)`.
- `Review` is unique by `(repositoryId, githubPullRequestId, headSha)`.
- Repository, review, and finding relations cascade on deletion.

## Trust boundaries

- OAuth tokens remain server-side in the `Account` table.
- Repository IDs supplied by browser actions are always combined with the current session user ID.
- Webhook signatures use `GITHUB_WEBHOOK_SECRET` and constant-time comparison.
- GitHub delivery IDs are used as Inngest event IDs to reduce duplicate processing.
- Stored vectors contain a user-scoped repository key; retrieval never queries across that key.
- AI responses are parsed through Zod before persistence.
- Prompts explicitly treat repository and PR content as untrusted data, not instructions.
- Environment configuration is validated by `lib/env.ts` during server startup.

## Primary modules

| Path | Responsibility |
| --- | --- |
| `app/api/webhooks/github/route.ts` | Signed webhook ingress and event dispatch |
| `inngest/functions/index.ts` | Repository indexing lifecycle |
| `inngest/functions/review-pull-request.ts` | PR review lifecycle |
| `module/ai/lib/rag.ts` | Chunking, embeddings, vector refresh, retrieval, cleanup |
| `module/ai/chat.ts` | Authenticated repository questions |
| `module/ai/review.ts` | Diff retrieval, contextual analysis, persistence |
| `module/repository/index.ts` | Repository listing, connection, and manual re-indexing |
| `module/reviews/index.ts` | Authenticated review-history query |
| `module/settings/index.ts` | Profile, connected repositories, and disconnection |
| `lib/env.ts` | Validated server configuration |

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Marketing page |
| `/docs` | Public | Product documentation |
| `/login` | Logged-out users | GitHub OAuth login |
| `/dashboard` | Authenticated | Real GitHub and codeSentinel metrics |
| `/repositories` | Authenticated | Connect and re-index repositories |
| `/dashboard/repository` | Authenticated redirect | Legacy redirect to `/repositories` |
| `/dashboard/chat` | Authenticated | Repository-grounded chat |
| `/reviews` | Authenticated | Persisted review results |
| `/settings` | Authenticated | Account and disconnection controls |
| `/api/auth/[...all]` | Better Auth | Auth API |
| `/api/webhooks/github` | Signed GitHub requests | Webhook ingress |
| `/api/inngest` | Inngest | Background-function endpoint |

## Failure behavior

- GitHub API failures do not produce invented dashboard metrics.
- Empty or failed repository fetches cause the index to enter `FAILED`.
- Native vector inserts are transactional, so a failed refresh leaves the previous repository index intact.
- Invalid AI review JSON fails the review rather than persisting guessed output.
- Failed review and index messages are truncated before storage.
- A missing vector index makes chat fetch and rank current GitHub files directly.

## Verification

The standard local gate is:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

An actual end-to-end verification additionally requires GitHub OAuth, webhook delivery, Inngest, PostgreSQL with pgvector, Gemini credentials, and Groq credentials. Follow the smoke test in `README.md`.
