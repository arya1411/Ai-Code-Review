# codeSentinel: production setup on Vercel

This is a plain-language handoff for setting up the working local application on Vercel. You can upload this file to ChatGPT and ask it to guide you one step at a time.

**Current instruction:** prepare the setup first. Do not change deployment code, push a release, apply database migrations, change external service settings, or deploy until the owner says **“now we go.”** Creating this guide does not deploy anything.

## What is already working

- The owner reports that the application works locally.
- A persistent **Beta prototype** banner has been added throughout the app.
- The app uses Next.js, PostgreSQL with pgvector, GitHub login, Groq, Google embeddings, and Inngest.
- The app already has an Inngest endpoint at `/api/inngest`.
- There are existing uncommitted changes. Preserve them and review the final changes before release.
- Local success does not yet confirm that production login, background jobs, and GitHub webhooks work.

## What each service does

| Service | Purpose |
| --- | --- |
| Vercel | Hosts the website and API routes. |
| PostgreSQL with pgvector | Stores users, repositories, reviews, and repository embeddings. Neon is the intended database provider. |
| GitHub OAuth app | Lets users sign in with GitHub and authorize repository access. |
| Groq | Generates AI chat responses and pull request reviews. |
| Google AI | Generates embeddings used for repository search and chat. |
| Inngest Cloud | Coordinates background indexing and pull request reviews by calling the hosted app. |

An **environment variable** is a named setting. In Vercel, the **Key** is the variable name, and the **Value** is your URL, credential, or setting. Most values cannot be invented: they come from your service accounts.

## 1. Decide the production website address

Choose the stable production address assigned to the Vercel project, or your custom domain.

Example only:

```text
https://ai-code-review.vercel.app
```

The project name alone does not guarantee that this example address is available. Confirm the actual assigned address in Vercel. Avoid temporary preview addresses and local tunnel addresses.

In the rest of this file, replace `YOUR-DOMAIN` with that actual hostname. All five URL variables must use the same HTTPS address, without a trailing slash.

## 2. Prepare the database

Get the connection string from your hosted PostgreSQL provider. The database must support the `vector` extension used by pgvector.

Save the connection string as `DATABASE_URL`. It contains a password; enter it directly into Vercel rather than sharing it in chat.

The production database also needs the application's migrations. That is a later release step after approval; entering a connection string does not create the database tables. See `DEPLOYMENT.md` for the technical release checks.

## 3. Prepare GitHub login

In GitHub, open **Settings → Developer settings → OAuth Apps**. Prefer a separate production OAuth app so local login keeps working.

Set these fields when production setup is authorized:

| GitHub field | Value |
| --- | --- |
| Application name | `codeSentinel Beta` or your preferred name |
| Homepage URL | `https://YOUR-DOMAIN` |
| Authorization callback URL | `https://YOUR-DOMAIN/api/auth/callback/github` |

Copy its Client ID into `GITHUB_CLIENT_ID` and its Client Secret into `GITHUB_CLIENT_SECRET` in Vercel.

`GITHUB_WEBHOOK_SECRET` is a different value: generate it yourself in the next step. It is not the OAuth Client Secret.

## 4. Generate two independent secrets

Run this command in your local terminal:

```bash
openssl rand -hex 32
```

Use the output as `BETTER_AUTH_SECRET`.

Run the same command again and use the new output as `GITHUB_WEBHOOK_SECRET`.

Keep both values private and stable after setup. You do not need to paste them into ChatGPT.

## 5. Get the AI keys

| Variable | Where to get the value |
| --- | --- |
| `GROQ_API_KEY` | Your Groq Console account. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google AI Studio account. |

Existing working keys can be used if their projects, permissions, and quotas are suitable for the beta. Google embeddings are required for repository indexing and chat with `REPOSITORY_INDEXING_ENABLED=1`.

## 6. Prepare Inngest Cloud

Locally, you run two commands in separate terminals:

```bash
npm run dev
```

```bash
npm run inngest:dev
```

`inngest:dev` starts the local Inngest development server. **Do not add it to Vercel's build command or install command.**

For production, use an Inngest Cloud account. Choose its production environment and obtain:

| Variable | Value |
| --- | --- |
| `INNGEST_EVENT_KEY` | An event key from that production environment. |
| `INNGEST_SIGNING_KEY` | The signing key from the same production environment. |
| `INNGEST_DEV` | `0` |

After deployment, sync the app in Inngest Cloud using:

```text
https://YOUR-DOMAIN/api/inngest
```

Inngest Cloud will call this endpoint to execute background work. The owner does not need to keep a local terminal running.

Alternatively, the official Inngest Vercel integration can supply the keys and sync deployments automatically. Choose manual setup or the integration and check which keys are already present before adding duplicates.

After syncing, confirm these functions are registered:

- `index-repo`
- `recover-cancelled-index`
- `review-pull-request`

The endpoint must be reachable by Inngest. If sync fails, check Vercel deployment protection and the Inngest sync error before changing code.

## 7. Fill in the Vercel import screen

| Field | Value |
| --- | --- |
| Root Directory | `./` |
| Application Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | Leave the Next.js default. |
| Install Command | `npm ci` |

There is no extra Inngest start command to enter.

In **Environment Variables**, select **Production** for these values. Preview setup needs its own matching URLs and service configuration; this guide covers production.

The environment block below is a template. **Replace every placeholder before importing or pasting it into Vercel.** Do not upload your unchanged local `.env`: it can contain localhost URLs, tunnel URLs, and development settings.

```dotenv
DATABASE_URL=<your hosted PostgreSQL connection string>

BETTER_AUTH_SECRET=<first generated random secret>
BETTER_AUTH_URL=https://YOUR-DOMAIN
NEXT_PUBLIC_BETTER_AUTH_URL=https://YOUR-DOMAIN
BETTER_AUTH_TRUSTED_ORIGINS=https://YOUR-DOMAIN

APP_BASE_URL=https://YOUR-DOMAIN
NEXT_PUBLIC_APP_BASE_URL=https://YOUR-DOMAIN

GITHUB_CLIENT_ID=<production GitHub OAuth Client ID>
GITHUB_CLIENT_SECRET=<production GitHub OAuth Client Secret>
GITHUB_WEBHOOK_SECRET=<second generated random secret>

GROQ_API_KEY=<your Groq API key>
GOOGLE_GENERATIVE_AI_API_KEY=<your Google AI API key>
REPOSITORY_INDEXING_ENABLED=1
EMBEDDING_DIMENSIONS=768

INNGEST_DEV=0
INNGEST_EVENT_KEY=<Inngest Cloud production event key>
INNGEST_SIGNING_KEY=<Inngest Cloud production signing key>
```

There are **17 variables** in this configuration. The two `NEXT_PUBLIC_*` values are public website URLs; secret credentials must never be renamed to start with `NEXT_PUBLIC_`.

Leave this block as a template in the repository. Store actual secrets in Vercel or a private local file that is not committed.

**Stop before clicking Create Project until the owner approves deployment.** That button can begin the first build and deployment.

## 8. Release steps after “now we go”

These are pending steps, not actions already completed:

1. Review the existing application changes and `DEPLOYMENT.md`; run the required checks.
2. Confirm the actual production domain and all 17 variable values. Run the existing `deploy:check` script with production values in a private environment; it does not fetch Vercel settings automatically.
3. Confirm that the selected Vercel plan supports the endpoint's configured 300-second maximum duration.
4. Back up the production database and apply the reviewed migrations with `npm run db:deploy`. Do not use `db:push` for production.
5. Deploy the approved code with the production variables available during the build.
6. Confirm the GitHub OAuth URLs and sync Inngest Cloud with `/api/inngest`.
7. Test the full workflow below before inviting beta users.

Changing Vercel environment variables affects new deployments. Redeploy after changing them; this also rebuilds the public URL values used in browser code.

## 9. Check the deployed beta

- Open the homepage and login page; confirm the Beta prototype banner appears.
- Sign in with GitHub and confirm the dashboard loads.
- Connect a small test repository and confirm its webhook points to the production app.
- Confirm indexing completes in Inngest Cloud and repository chat responds.
- Open a test pull request and confirm the review appears in the app and on GitHub.
- Confirm signed GitHub webhook deliveries succeed.
- Sign out and confirm protected pages require login.

Use a controlled beta initially. The technical deployment review records remaining quota, abuse-control, and delayed-review limitations that need consideration before unrestricted public access.

## Prompt to paste into ChatGPT

```text
I am deploying my codeSentinel Next.js beta application to Vercel.
I have attached PRODUCTION_SETUP.md. Please read it first.

The application works locally. Locally I run npm run dev and
npm run inngest:dev in separate terminals. Production should use
Inngest Cloud with my deployed /api/inngest endpoint.

Guide me one step at a time using plain language. Start by checking
which accounts, production domain, and credentials I already have.
For each step, tell me where to click, which field to fill, and where
to get its value. Do not invent my domain or credentials. Do not ask
me to paste secret values into chat; I will enter them directly into
Vercel. Do not assume that any pending production step is complete.

Do not deploy, change deployment code, push a release, apply database
migrations, or change external service settings until I explicitly
say “now we go.” Explain the next step and wait for my progress.
```

## References

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Inngest on Vercel, including integration and manual sync](https://www.inngest.com/docs/durable-execution/deploying-functions/platforms/vercel)
- [Inngest keys and access](https://www.inngest.com/docs/platform-and-operations/keys-and-access)
- [Vercel function duration](https://vercel.com/docs/functions/configuring-functions/duration)
- Repository technical release notes: `DEPLOYMENT.md`.
