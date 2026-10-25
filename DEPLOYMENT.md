# Deploy codeSentinel to Vercel

Use this guide to recreate the Vercel project using the existing GitHub repository and Neon database. Recreating the hosting project does not require deleting the database or its records.

Run terminal commands from the folder containing this project's `package.json`.

## 1. Push the cleaned code to GitHub

Review the changes, commit the source and documentation changes, and push to the branch you will deploy.

Keep `.env` and `.env.vercel.txt` private. They are excluded from Git. `.env.example` is a template and can be committed. This project uses npm and `package-lock.json`.

## 2. Prepare the production environment file

Use the local `.env.vercel.txt` file prepared for this deployment. It contains your credentials and these 13 variables:

| Variable | Value or source |
| --- | --- |
| `DATABASE_URL` | Production Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Stable random auth secret, at least 32 characters |
| `BETTER_AUTH_URL` | Final production HTTPS origin |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Same production HTTPS origin |
| `APP_BASE_URL` | Same production HTTPS origin |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Matching GitHub OAuth App secret |
| `GITHUB_WEBHOOK_SECRET` | Secret shared with repository webhooks |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google key for repository embeddings |
| `GROQ_API_KEY` | Groq key for chat and PR reviews |
| `INNGEST_DEV` | `0` |
| `INNGEST_EVENT_KEY` | Event key from the Inngest production environment |
| `INNGEST_SIGNING_KEY` | Signing key from that same Inngest environment |

The prepared file currently uses `https://ai-code-review-ten-dusky.vercel.app`. If the new project uses a different domain, replace all three URL values. Use the stable production domain, without a path or trailing slash. Do not use a localhost URL, an ngrok URL, or a URL generated for an individual deployment.

No `NEXT_PUBLIC_*` variables, Pinecone key, or embedding-size variable are needed. Embeddings use a fixed 768 dimensions in code. Repository indexing and chat are enabled by default. Only add `REPOSITORY_INDEXING_ENABLED=0` if you deliberately want diff-only PR reviews without indexing or chat.

## 3. Check the production configuration and database

With the production import file available locally, run:

```bash
npm ci
DOTENV_CONFIG_PATH=.env.vercel.txt npm run deploy:check
DOTENV_CONFIG_PATH=.env.vercel.txt npx prisma migrate status
```

The environment check must pass. The database must support PostgreSQL's `vector` extension.

If migration status shows pending migrations, back up the production database, review the migration SQL, then apply them:

```bash
DOTENV_CONFIG_PATH=.env.vercel.txt npm run db:deploy
```

An existing database with all migrations applied needs no reset. Do not use `db:push`, `db:migrate`, or migration reset commands against production.

## 4. Create the Vercel project

In Vercel, choose **Add New → Project** and import the GitHub repository.

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | The folder containing `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Leave the Next.js default |
| Node.js | A supported version satisfying the project's Node.js 22+ requirement |

Use `./` as the root if `package.json` is at the repository root. Use `code_review` only if that folder appears inside the imported repository and contains `package.json`.

Import `.env.vercel.txt` into the project's **Production** environment. If the import chooser hides dotfiles, enable hidden files or paste the file contents into Vercel's environment-variable import field. The values are already prepared; do not add duplicate keys.

Keep the production site and its webhook endpoints reachable by GitHub and Inngest. An interactive Vercel login screen must not block their requests.

Click **Deploy**. Do not add a local Inngest development-server command to the build or install settings.

## 5. Confirm the final production domain

After Vercel assigns the project domain, check **Settings → Domains**.

If it differs from the domain in the import file, update these values in **Settings → Environment Variables**, selecting **Production**:

```dotenv
APP_BASE_URL=https://YOUR-NEW-DOMAIN
BETTER_AUTH_URL=https://YOUR-NEW-DOMAIN
BETTER_AUTH_TRUSTED_ORIGINS=https://YOUR-NEW-DOMAIN
```

Update your private import file to match, then redeploy. Environment changes take effect in new deployments. Complete this step before testing login.

## 6. Configure GitHub OAuth

Open **GitHub → Settings → Developer settings → OAuth Apps → your OAuth App**.

Set the homepage URL to:

```text
https://YOUR-NEW-DOMAIN
```

Set the authorization callback URL to:

```text
https://YOUR-NEW-DOMAIN/api/auth/callback/github
```

Save the settings. This OAuth App's client ID and secret must match the values in Vercel. If you create a new OAuth App, update both credentials and redeploy.

## 7. Sync Inngest Cloud

In the Inngest dashboard, select the production environment matching your imported keys. Open **Apps → Sync new app** and enter:

```text
https://YOUR-NEW-DOMAIN/api/inngest
```

If the app already exists, update its sync URL and resync it.

Confirm these functions are registered:

- `index-repo`
- `recover-cancelled-index`
- `review-pull-request`

You do not need to keep a local terminal running. With manual setup, resync after deployments that change the function definitions. The official Vercel integration is an alternative that can manage keys and sync deployments automatically; check its configuration before adding keys twice.

If sync fails, inspect the Inngest error, confirm both keys belong to the selected environment, and check Vercel deployment protection.

## 8. Update existing repository webhooks

New repository connections create their webhooks through the application.

For repositories already connected to the database, update the application's webhook under **GitHub repository → Settings → Webhooks**:

```text
https://YOUR-NEW-DOMAIN/api/webhooks/github
```

Use JSON content, subscribe to `push` and `pull_request`, and use the same secret as `GITHUB_WEBHOOK_SECRET`.

Alternatively, with the private import file updated to the final production domain, run:

```bash
DOTENV_CONFIG_PATH=.env.vercel.txt npm run webhooks:reconcile
```

This command creates or updates hooks for the configured URL. It does not delete hooks pointing at old domains. Remove obsolete application hooks after confirming delivery to the new URL.

## 9. Test the deployed application

1. Open the stable production URL and sign in with GitHub.
2. Confirm login reaches the dashboard without a `403` response.
3. Connect a small test repository, or re-index an existing connection.
4. Confirm indexing succeeds in Inngest and the repository becomes **Ready**.
5. Open repository chat and verify an answer includes relevant file citations.
6. Open or update a non-draft pull request in the connected repository.
7. Confirm GitHub delivers the webhook successfully and Inngest completes the review.
8. Confirm the review appears in the application and as a GitHub PR comment.

For the pilot, index one repository at a time and monitor Google/Groq quotas. Large repositories are sampled; indexing is bounded rather than a complete copy of every file. See README.md for implementation limits.

## 10. Diagnose failures before changing configuration

| Symptom | Check |
| --- | --- |
| Sign-in returns `403` | Exact domain in auth URL, trusted origins, and GitHub callback; inspect the response body |
| GitHub reports callback mismatch | OAuth App callback URL and the matching client credentials |
| Inngest sync fails | Endpoint reachability, deployment protection, and production signing key |
| Reviews stay queued | Inngest sync, event key, registered functions, and failed runs |
| Indexing fails | Google key, quotas, migration status, and pgvector support |
| Build fails | First actionable error in Vercel's build log |

The last local checks passed all 20 tests, TypeScript, ESLint, and production environment validation. The local Next.js build stopped because its TypeScript subprocess returned empty output for `--showConfig`; the production build and authenticated production flow remain unverified.

If Vercel reports a Turbopack-specific failure, try `npm run build -- --webpack`. This is a fallback for that specific error, not a fix for missing environment variables or unrelated build failures.

## References

- [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Better Auth GitHub setup](https://better-auth.com/docs/authentication/github)
- [Inngest apps and syncs](https://www.inngest.com/docs/platform-and-operations/apps-and-syncs)
- [Inngest deployment on Vercel](https://www.inngest.com/docs/durable-execution/deploying-functions/platforms/vercel)
