# Deployment review

Initial deployment review: 2026-10-19. Repository chat and indexing restored on 2026-10-22. The application has not been deployed by this work. Production URLs, GitHub OAuth settings, and Inngest Cloud must be configured before launch.

The restoration passed TypeScript, ESLint, all 16 test cases, and `npm run build -- --webpack`. The existing live synthetic indexing/retrieval smoke test also passed and cleaned up its temporary chunks. Turbopack remains blocked by the local sandbox's port-binding restriction. Authenticated chat and durable indexing still need an end-to-end test on the final deployment with Inngest Cloud.

## Current release: PR reviews and repository chat

Repository indexing and chat are enabled by default (`REPOSITORY_INDEXING_ENABLED=1`). Provide a Gemini embedding key and Groq key. Setting the flag to `0` preserves a diff-only PR-review mode without embeddings or chat.

Vercel is the intended hosting target, with Neon PostgreSQL and Inngest Cloud. Background indexing now fetches a bounded source snapshot, embeds quota-sized batches in separate durable steps with 61-second Inngest sleeps, then atomically publishes the index. Existing vectors remain available until successful publication. Overlapping jobs use a publication guard to prevent an older run from replacing newer index state.

Source snapshots include at most 150 files, 36,000 characters per file and 240,000 characters total; indexing uses at most 80 chunks. This deliberately samples large repositories to bound Inngest replay payloads and execution time. The Inngest route declares a 300-second maximum duration; confirm that the selected hosting plan supports it. Full authenticated production smoke testing is still required.

## Verified

- TypeScript, ESLint, tests, and optimized Next.js production build. The final patched build passed with `npm run build -- --webpack`; Turbopack hit an environment port-binding restriction, and downloading Google fonts required network access. The default Turbopack build should be rechecked on the selected host.
- Public routes `/`, `/login`, `/docs`, and `/terms` return 200 from the production server.
- Unauthenticated dashboard, repositories, reviews, settings, health, and chat requests redirect to login.
- The session endpoint responds; unsigned GitHub webhooks return 401.
- Prisma schema validation and read-only migration status: all seven migrations are applied to the configured database.
- Live Gemini embeddings return 768 dimensions; Groq chat and structured review generation succeed.
- Synthetic indexing and pgvector retrieval succeed; temporary chunks are removed by the smoke script.
- After compatible security updates, `npm audit --omit=dev` reports zero vulnerabilities. This is a point-in-time dependency advisory check, not proof that every code path is secure.

GitHub token, webhook-management, and arbitrary-token source helpers now live in a `server-only` module. The monthly-activity UI calls an authenticated Server Action wrapper. Next.js was patched from 16.3.6 to 16.3.8, compatible transitive fixes were applied, and shadcn was moved to build dependencies. The full dependency audit still reports nine high advisories in development tooling through `braces`; npm offers a breaking downgrade rather than a compatible fix. Do not run those tools against untrusted input.

## Launch requirements and limits

1. **Replace local configuration.** The checked environment uses localhost auth URLs, an ngrok webhook URL, `INNGEST_DEV=1`, and lacks Inngest production keys. Set the variables below in the hosting provider, then run `npm run deploy:check` with those production values. The check reports variable names without printing secrets.
2. **Enable repository chat for the pilot.** Set `REPOSITORY_INDEXING_ENABLED=1` and provide `GOOGLE_GENERATIVE_AI_API_KEY`. Re-sync Inngest after deployment and manually re-index existing connections. Index one repository at a time during the pilot: pacing is per run and does not enforce a shared provider quota across all users.
3. **Finish the authenticated live smoke test.** A browser GitHub login, repository connection, Inngest Cloud execution, signed webhook delivery, PR review publication, and disconnection still need verification on the final HTTPS domain. No PR comments or webhook changes were made during this review.
4. **Add abuse controls before an unrestricted public launch.** Repeated PR updates and concurrent review jobs can exhaust the shared Groq quota. Chat, indexing, and PR reviews share provider quotas. Add per-user limits and provider-wide rate/concurrency controls before opening signups broadly.
5. **Handle delayed PR jobs before relying on review history accuracy.** Review jobs fetch the PR's current head, while the database review row is keyed by the triggering head SHA. A newer push before execution can associate findings with an older SHA. Compare the live head with the stored head and skip stale jobs, or review an immutable commit snapshot. Concurrent reviews can also race to replace the shared PR comment.

The current code is suitable for a controlled small-repository pilot once production configuration and the live smoke test pass. The remaining limits above should guide a broader launch.

## Production environment

Use a final HTTPS origin such as `https://app.yourdomain.com` consistently:

```dotenv
BETTER_AUTH_URL=https://app.yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://app.yourdomain.com
APP_BASE_URL=https://app.yourdomain.com
NEXT_PUBLIC_APP_BASE_URL=https://app.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.yourdomain.com
INNGEST_DEV=0
REPOSITORY_INDEXING_ENABLED=1
INNGEST_EVENT_KEY=<from the production Inngest environment>
INNGEST_SIGNING_KEY=<from the production Inngest environment>
EMBEDDING_DIMENSIONS=768
```

Also provide `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_WEBHOOK_SECRET`, and `GROQ_API_KEY`. `GOOGLE_GENERATIVE_AI_API_KEY` is required only when indexing is enabled. Generate independent auth and webhook secrets with `openssl rand -hex 32`. Keep secrets in the provider's environment settings. Use a production PostgreSQL database supporting pgvector and backups; the configured development database passing checks does not establish production database readiness. A separate production GitHub OAuth app avoids changing local callbacks.

Set `NEXT_PUBLIC_*` values before building; Next.js embeds them into browser bundles. The CLI configuration check loads `.env` and exported environment variables; it does not automatically load Next.js `.env.production` or `.env.local` files. Export hosting variables, or select a local file with `DOTENV_CONFIG_PATH=/path/to/production.env npm run deploy:check`.

## Deploy to Vercel

1. Import the GitHub repository in Vercel as a Next.js project.
2. Configure the production variables listed above, using the final Vercel production domain or a custom domain consistently. Use `REPOSITORY_INDEXING_ENABLED=1` for repository chat.
3. Use `npm ci` to install, and `npm run build` to build. Keep development dependencies available during the build. If the host reproduces the local Turbopack issue, use `npm run build -- --webpack`.
4. Run `npm run deploy:check` with the production variables. Back up the production database and apply migrations with `npm run db:deploy` as a controlled release step.
5. Configure the GitHub OAuth callback, sync `/api/inngest` in Inngest Cloud, and verify signed PR webhook delivery as described below. Confirm `index-repo`, `recover-cancelled-index`, and `review-pull-request` are registered.
6. Complete the README smoke test on the final domain before opening access.

## Alternative: deploy an always-running Node.js service

Use a supported Node.js release meeting the README's Node 22+ requirement. This review ran on Node 26.11.1; rerun validation on the host's chosen Node version. Install build dependencies as well as runtime dependencies because Prisma generation, TypeScript, and CSS compilation need them.

1. Connect the repository to your chosen Node.js host and configure the production environment above. Use a service that stays running; verify its proxy timeout and the Inngest step timeout for your plan. Indexing pauses are durable and do not occupy an HTTP request.
2. Run the following with the production environment available:

   ```bash
   npm ci
   npm run deploy:check
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```

   The test script currently expects a `.env` file. On a host or CI using injected variables, run the equivalent `node --import tsx --test tests/*.test.ts` instead.

3. Back up the production database, review pending migrations, and run `npm run db:deploy` once as a release step. Do not run `db:push` or `db:migrate` in production. This review did not apply migrations or change existing application records, apart from temporary synthetic chunks cleaned up by the smoke script.
4. Start with `npm run start -- --hostname 0.0.0.0`; the hosting provider should supply `PORT`. Configure HTTPS and automatic restarts. This is a dynamic server application and cannot be published as a static export.
5. Set the production GitHub OAuth homepage to the app origin and callback to `https://app.yourdomain.com/api/auth/callback/github`.
6. Sync the application in Inngest Cloud using `https://app.yourdomain.com/api/inngest`, with event and signing keys belonging to that same Inngest environment. Confirm indexing, cancellation recovery, and PR-review functions are registered. Allow GitHub and Inngest to reach their endpoints without an interactive hosting login screen.
7. For existing connections, review and run `npm run webhooks:reconcile` with production configuration. It creates or updates hooks matching the current URL; it does not delete hooks pointing at an old tunnel/domain. Remove old hooks separately after the production delivery is verified. For a fresh production database, connect repositories through the UI instead.
8. Complete the end-to-end smoke test in README.md. Verify final Inngest runs and both the in-app review and GitHub comment. Watch provider quota errors, failed indexing, and queued reviews during the pilot.

## Switching modes

To enable repository chat, set `REPOSITORY_INDEXING_ENABLED=1`, provide a Google embedding key, restart/redeploy, and sync the Inngest app. Re-index existing connections manually. To run PR reviews only, set the flag to `0`; existing indexes are retained. The workflow change does not migrate already-running jobs: finish or cancel old indexing runs before deploying, then queue new runs.

References: [Vercel function duration configuration](https://vercel.com/docs/functions/configuring-functions/duration), [Inngest durable steps](https://www.inngest.com/docs/durable-execution/primitives), [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying).
