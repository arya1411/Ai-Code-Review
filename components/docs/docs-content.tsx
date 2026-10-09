"use client"

import {
  GitBranch,
  Webhook,
  Cpu,
  Database,
  Zap,
  Shield,
  ArrowRight,
  Code2,
} from "lucide-react"
import { CodeBlock, Callout, Step, DocTable } from "@/components/docs/docs-primitives"
import { FadeIn } from "@/components/ui/fade-in"

/* ------------------------------------------------------------------ */
/*  Section heading helpers                                             */
/* ------------------------------------------------------------------ */

function SectionHeading({
  id,
  label,
  title,
  description,
}: {
  id: string
  label: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-8">
      <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {label}
      </span>
      <h2 id={id} className="scroll-mt-24 text-2xl font-bold tracking-[-0.03em] text-white md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-neutral-400">{description}</p>
      )}
    </div>
  )
}

function Divider() {
  return <div className="my-16 border-t border-neutral-900" />
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-lg font-semibold tracking-tight text-white">{children}</h3>
  )
}

/* ------------------------------------------------------------------ */
/*  Architecture diagram (pure CSS)                                    */
/* ------------------------------------------------------------------ */

function ArchDiagram() {
  const nodes = [
    { icon: GitBranch, label: "GitHub PR", sub: "Webhook event" },
    { icon: Webhook, label: "Next.js API", sub: "/api/webhooks/github" },
    { icon: Zap, label: "Inngest", sub: "Background job queue" },
    { icon: Cpu, label: "AI Agent", sub: "Groq GPT-OSS 120B" },
    { icon: Database, label: "PostgreSQL", sub: "Durable vector store / RAG" },
  ]

  return (
    <div className="my-8 overflow-x-auto">
      <div className="flex min-w-max items-center gap-0">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center">
            <div className="group flex flex-col items-center gap-2 px-5 py-4 rounded-xl border border-neutral-800 bg-neutral-950 transition-colors hover:border-neutral-700 hover:bg-neutral-900 w-36">
              <div className="flex size-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-400 group-hover:text-white transition-colors">
                <node.icon className="size-4" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-white">{node.label}</p>
                <p className="mt-0.5 text-[10px] text-neutral-500">{node.sub}</p>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div className="flex items-center px-1">
                <div className="h-px w-6 bg-neutral-700" />
                <ArrowRight className="size-3 text-neutral-600 -ml-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tech stack grid                                                     */
/* ------------------------------------------------------------------ */

interface TechCard {
  name: string
  role: string
  badge: string
}

const techItems: TechCard[] = [
  { name: "Next.js 16", role: "App framework, API routes, SSR", badge: "Core" },
  { name: "TypeScript", role: "Full-stack type safety", badge: "Core" },
  { name: "Prisma 7 + PostgreSQL", role: "ORM and pgvector retrieval", badge: "Data" },
  { name: "better-auth", role: "GitHub OAuth session management", badge: "Auth" },
  { name: "Inngest", role: "Durable background job queue", badge: "Jobs" },
  { name: "Google Gemini", role: "Repository embeddings", badge: "AI" },
  { name: "Groq GPT-OSS 120B", role: "Repository chat and pull-request reviews", badge: "AI" },
  { name: "Vercel AI SDK", role: "Streaming AI responses & tooling", badge: "AI" },
  { name: "Octokit", role: "GitHub REST & GraphQL API client", badge: "GitHub" },
  { name: "React Query", role: "Client-side data fetching & cache", badge: "Client" },
  { name: "Tailwind CSS v4", role: "Utility-first styling system", badge: "UI" },
  { name: "Shadcn / Base UI", role: "Headless accessible components", badge: "UI" },
]

const badgeColors: Record<string, string> = {
  Core: "bg-white/10 text-white",
  Data: "bg-blue-900/40 text-blue-300",
  Auth: "bg-purple-900/40 text-purple-300",
  Jobs: "bg-orange-900/40 text-orange-300",
  AI: "bg-green-900/40 text-green-300",
  GitHub: "bg-neutral-800 text-neutral-300",
  Client: "bg-yellow-900/30 text-yellow-300",
  UI: "bg-pink-900/30 text-pink-300",
}

function TechGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {techItems.map((item) => (
        <div
          key={item.name}
          className="group flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-white truncate">{item.name}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColors[item.badge] ?? "bg-neutral-800 text-neutral-400"}`}
              >
                {item.badge}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-500">{item.role}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main docs content                                                   */
/* ------------------------------------------------------------------ */

export function DocsContent() {
  return (
    <article className="min-w-0 flex-1 max-w-3xl space-y-0">

      {/* ── INTRODUCTION ─────────────────────────────────────────── */}
      <FadeIn>
        <section id="introduction">
          <SectionHeading
            id="introduction"
            label="Getting Started"
            title="Introduction"
            description="codeSentinel is an AI-powered code review platform that automatically analyzes GitHub pull requests, detects bugs and security vulnerabilities, and delivers actionable feedback — all without slowing your team down."
          />

          <div className="space-y-4 text-sm leading-relaxed text-neutral-400">
            <p>
              When a developer opens a pull request, codeSentinel receives a GitHub webhook, queues
              an Inngest background job, then runs an AI agent powered by Groq GPT-OSS 120B that
              reads the diff, queries the codebase vector store for context, and stores a structured
              review for the codeSentinel dashboard.
            </p>
            <p>
              The entire pipeline is fully asynchronous and durable — if any step fails, Inngest
              automatically retries it without any manual intervention.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "Security scanning", desc: "Vulnerable patterns flagged automatically" },
              { icon: Code2, label: "Context-aware AI", desc: "RAG over your full codebase" },
              { icon: Zap, label: "Async & durable", desc: "Inngest queues survive failures" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2"
              >
                <item.icon className="size-5 text-neutral-400" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── QUICKSTART ───────────────────────────────────────────── */}
      <FadeIn>
        <section id="quickstart">
          <SectionHeading id="quickstart" label="Getting Started" title="Quickstart" />

          <div className="space-y-6">
            <Step number={1} title="Clone & install dependencies">
              <CodeBlock
                language="bash"
                code={`git clone https://github.com/your-org/codeSentinel.git
cd codeSentinel
npm install`}
              />
            </Step>

            <Step number={2} title="Configure environment variables">
              <p>Copy the example env file and fill in your credentials:</p>
              <CodeBlock
                language=".env"
                code={`DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
APP_BASE_URL=https://your-public-app.example.com
GOOGLE_GENERATIVE_AI_API_KEY=...
GROQ_API_KEY=...
INNGEST_SIGNING_KEY=...
INNGEST_EVENT_KEY=...`}
              />
            </Step>

            <Step number={3} title="Run database migrations">
              <CodeBlock language="bash" code={`npx prisma migrate dev`} />
            </Step>

            <Step number={4} title="Start the dev server + Inngest dev server">
              <CodeBlock
                language="bash"
                code={`# Terminal 1 – Next.js
npm run dev

# Terminal 2 – Inngest dev UI (local background job runner)
npx inngest-cli@latest dev`}
              />
              <Callout type="note">
                The Inngest dev server must be running locally to process background jobs during
                development. It automatically discovers your functions from{" "}
                <code className="font-mono text-xs text-neutral-300">/api/inngest</code>.
              </Callout>
            </Step>

            <Step number={5} title="Connect a repository">
              <p>
                Sign in, open <code className="font-mono text-xs text-neutral-200">/repositories</code>,
                and connect a repository. codeSentinel installs the signed webhook and queues the initial index automatically.
              </p>
            </Step>
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── ARCHITECTURE ─────────────────────────────────────────── */}
      <FadeIn>
        <section id="architecture">
          <SectionHeading
            id="architecture"
            label="How It Works"
            title="Architecture"
            description="codeSentinel is built on a fully asynchronous event-driven pipeline. Each layer has a single responsibility and communicates via well-defined events."
          />

          <ArchDiagram />

          <div className="space-y-4 text-sm leading-relaxed text-neutral-400 mt-6">
            <p>
              <strong className="text-neutral-200">1. GitHub dispatches a webhook</strong> whenever a
              pull request is opened, synchronized, or reopened. The webhook payload contains the
              PR metadata, diff URL, and repository details.
            </p>
            <p>
              <strong className="text-neutral-200">2. The Next.js API route</strong> at{" "}
              <code className="font-mono text-xs text-neutral-300">/api/webhooks/github</code> validates
              the HMAC-SHA256 signature, parses the payload, and immediately fires an Inngest event
              — returning a <code className="font-mono text-xs text-neutral-300">202 Accepted</code> after
              the background work has been queued.
            </p>
            <p>
              <strong className="text-neutral-200">3. Inngest picks up the event</strong> and runs
              the review pipeline as a series of durable steps. Each step can be individually
              retried on failure without re-running successful steps.
            </p>
            <p>
              <strong className="text-neutral-200">4. The AI agent</strong> fetches the PR diff,
              retrieves relevant codebase context through PostgreSQL pgvector, constructs a prompt, and calls Groq
              to produce a structured review object.
            </p>
            <p>
              <strong className="text-neutral-200">5. Results are persisted</strong> to PostgreSQL via
              Prisma and surfaced in the codeSentinel dashboard.
            </p>
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── GITHUB INTEGRATION ───────────────────────────────────── */}
      <FadeIn>
        <section id="github-integration">
          <SectionHeading
            id="github-integration"
            label="How It Works"
            title="GitHub Integration"
            description="codeSentinel connects to GitHub via OAuth (better-auth) for user authentication and via a webhook for real-time PR events."
          />

          <SubHeading>OAuth Flow</SubHeading>
          <div className="space-y-3 text-sm leading-relaxed text-neutral-400 mb-8">
            <p>
              Users authenticate using GitHub OAuth powered by{" "}
              <strong className="text-neutral-300">better-auth</strong>. The access token is stored
              server-side in the database and used later by background jobs to call the GitHub API on
              behalf of the user — fetching file contents and reading PR
              metadata.
            </p>
          </div>

          <SubHeading>Webhook Validation</SubHeading>
          <CodeBlock
            language="typescript"
            code={`// app/api/webhooks/github/route.ts
const signature = request.headers.get("x-hub-signature-256")
const body = await request.text()

const expectedSignature = "sha256=" + createHmac("sha256", secret)
  .update(body)
  .digest("hex")

if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
  return new Response("Unauthorized", { status: 401 })
}`}
          />

          <div className="mt-4">
            <Callout type="note">
              Using <code className="font-mono text-xs">timingSafeEqual</code> prevents timing
              attacks when comparing the HMAC signature.
            </Callout>
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── AI PIPELINE ──────────────────────────────────────────── */}
      <FadeIn>
        <section id="ai-pipeline">
          <SectionHeading
            id="ai-pipeline"
            label="How It Works"
            title="AI Pipeline"
            description="The AI review pipeline is an Inngest function split into isolated durable steps — each step is retried independently if it fails."
          />

          <div className="space-y-4 text-sm leading-relaxed text-neutral-400 mb-8">
            <p>
              The pipelines are defined in{" "}
              <code className="font-mono text-xs text-neutral-300">
                inngest/functions/
              </code>{" "}
              and run as background jobs triggered by{" "}
              <code className="font-mono text-xs text-neutral-300">repository.connected</code> and{" "}
              <code className="font-mono text-xs text-neutral-300">pull-request.review.requested</code> events.
            </p>
          </div>

          <SubHeading>Step breakdown</SubHeading>
          <div className="space-y-3">
            {[
              {
                step: "fetch-files",
                desc: "Fetches repository source for indexing or changed-file patches for a pull request using the authenticated user's GitHub token.",
              },
              {
                step: "index-codebase",
                desc: "Chunks source files, generates Gemini embeddings, upserts current vectors, and removes vectors for deleted or renamed files.",
              },
              {
                step: "run-review",
                desc: "Constructs a prompt with the PR diff and retrieved context. Groq GPT-OSS 120B produces a schema-validated review.",
              },
              {
                step: "persist-results",
                desc: "Writes the review object to PostgreSQL via Prisma. Marks the review as completed and notifies the dashboard.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
              >
                <code className="shrink-0 text-xs font-mono text-neutral-400 pt-0.5">
                  {item.step}
                </code>
                <p className="text-xs leading-relaxed text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── RAG SYSTEM ───────────────────────────────────────────── */}
      <FadeIn>
        <section id="rag-system">
          <SectionHeading
            id="rag-system"
            label="How It Works"
            title="RAG System"
            description="Retrieval-Augmented Generation gives the AI agent full codebase context — not just the diff — so it can reason about cross-file impact and architectural patterns."
          />

          <div className="space-y-4 text-sm leading-relaxed text-neutral-400 mb-8">
            <p>
              When a repository is connected, codeSentinel fetches up to 100 indexable files via the GitHub
              API, splits them into overlapping fixed-size chunks, generates vector embeddings using
              the Gemini Embedding API, and transactionally stores user-scoped chunks in PostgreSQL.
            </p>
            <p>
              At review time, PostgreSQL uses pgvector to perform exact cosine search and returns only
              the top matching chunks for the LLM prompt.
            </p>
          </div>

          <SubHeading>PostgreSQL vector retrieval</SubHeading>
          <CodeBlock
            language="sql"
            code={`SELECT path, content,
       1 - (embedding <=> $1::vector(768)) AS score
FROM repository_code_chunk
WHERE "repoKey" = $2
ORDER BY embedding <=> $1::vector(768)
LIMIT 6;`}
          />

          <div className="mt-6">
            <Callout type="tip">
              Every query uses a user-scoped repository key so retrieved chunks cannot cross between
              connected users&apos; codebases. Embeddings remain 768-dimensional to match the database column.
            </Callout>
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── TECH STACK ───────────────────────────────────────────── */}
      <FadeIn>
        <section id="tech-stack">
          <SectionHeading
            id="tech-stack"
            label="Tech Stack"
            title="Stack Overview"
            description="Every dependency is chosen to be minimal, type-safe, and production-grade."
          />
          <TechGrid />
        </section>
      </FadeIn>

      <Divider />

      {/* ── DATABASE ─────────────────────────────────────────────── */}
      <FadeIn>
        <section id="database">
          <SectionHeading
            id="database"
            label="Tech Stack"
            title="Database & ORM"
            description="codeSentinel uses PostgreSQL with Prisma ORM and the Prisma PostgreSQL adapter."
          />

          <SubHeading>Schema highlights</SubHeading>
          <DocTable
            headers={["Model", "Purpose"]}
            rows={[
              { col1: "User", col2: "Authenticated GitHub user profile" },
              { col1: "Account", col2: "Server-side OAuth account and access token" },
              { col1: "Session", col2: "Active auth session (managed by better-auth)" },
              { col1: "Repository", col2: "Connected GitHub repository metadata" },
              { col1: "Review", col2: "AI-generated review per pull request" },
              { col1: "Finding", col2: "Individual file-level findings from a review" },
            ]}
          />

          <div className="mt-6">
            <Callout type="note">
              All database access goes through Prisma&apos;s type-safe client — there are no raw SQL
              queries in the codebase.
            </Callout>
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── BACKGROUND JOBS ──────────────────────────────────────── */}
      <FadeIn>
        <section id="background-jobs">
          <SectionHeading
            id="background-jobs"
            label="Tech Stack"
            title="Background Jobs"
            description="Inngest handles all long-running work outside the request/response cycle with automatic retries and step-level durability."
          />

          <div className="space-y-4 text-sm leading-relaxed text-neutral-400 mb-8">
            <p>
              Each Inngest function is defined with an <strong className="text-neutral-300">id</strong>,
              one or more <strong className="text-neutral-300">triggers</strong> (event names), and an
              async handler that uses <code className="font-mono text-xs text-neutral-300">step.run()</code>{" "}
              to break work into checkpointed units.
            </p>
          </div>

          <CodeBlock
            language="typescript"
            code={`// inngest/functions/index.ts
export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [{ event: "repository.connected" }],
  },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data

    // Each step.run() is independently retried on failure
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: { userId, providerId: "github" },
      })
      if (!account?.accessToken) throw new Error("No token found")
      return getRepoFileContent(account.accessToken, owner, repo)
    })

    await step.run("index-codebase", async () => {
      // Embed + store files in PostgreSQL as native vectors
    })
  }
)`}
          />
        </section>
      </FadeIn>

      <Divider />

      {/* ── WEBHOOKS API ─────────────────────────────────────────── */}
      <FadeIn>
        <section id="webhooks">
          <SectionHeading
            id="webhooks"
            label="API Reference"
            title="GitHub Webhooks"
            description="codeSentinel exposes a single webhook endpoint that GitHub calls for all repository events."
          />

          <DocTable
            headers={["Route", "Method", "Description"]}
            rows={[
              { col1: "/api/webhooks/github", col2: "POST", col3: "Receives all GitHub webhook payloads" },
              { col1: "/api/auth/[...all]", col2: "GET/POST", col3: "better-auth OAuth routes" },
              { col1: "/api/inngest", col2: "GET/POST/PUT", col3: "Inngest function registration & event handler" },
            ]}
          />

          <div className="mt-6">
            <SubHeading>Supported events</SubHeading>
            <DocTable
              headers={["Event", "Trigger"]}
              rows={[
                { col1: "pull_request.opened", col2: "New PR opened on a connected repo" },
                { col1: "pull_request.synchronize", col2: "New commits pushed to an open PR" },
                { col1: "push", col2: "Direct push to main branch (re-index)" },
                { col1: "repository.connected", col2: "Internal event — repo connected via dashboard" },
              ]}
            />
          </div>
        </section>
      </FadeIn>

      <Divider />

      {/* ── INNGEST EVENTS ───────────────────────────────────────── */}
      <FadeIn>
        <section id="inngest-api">
          <SectionHeading
            id="inngest-api"
            label="API Reference"
            title="Inngest Events"
            description="These are the internal events that trigger background functions."
          />

          <DocTable
            headers={["Event", "Payload fields", "Triggered by"]}
            rows={[
              {
                col1: "repository.connected",
                col2: "owner, repo, userId",
                col3: "Dashboard connect action",
              },
              {
                col1: "pull_request.opened",
                col2: "owner, repo, prNumber, diffUrl, userId",
                col3: "GitHub webhook handler",
              },
              {
                col1: "pull_request.synchronized",
                col2: "owner, repo, prNumber, diffUrl, userId",
                col3: "GitHub webhook handler",
              },
            ]}
          />

          <div className="mt-6">
            <Callout type="tip">
              You can fire any of these events manually from the Inngest dev UI at{" "}
              <code className="font-mono text-xs">http://localhost:8288</code> to test your
              functions without needing a real GitHub webhook.
            </Callout>
          </div>
        </section>
      </FadeIn>

      {/* bottom padding */}
      <div className="h-24" />
    </article>
  )
}
