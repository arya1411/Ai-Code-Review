# Future changes — codeSentinel

Running log of features, architecture decisions, and product direction discussed so far. Treat this as the planning doc to pull from when scoping actual milestones.

---

## Product positioning

**Core differentiator**: repo-aware review, not diff-aware review. Most AI PR reviewers (CodeRabbit, Greptile, Qodo, Codacy, SonarQube) only read the diff. codeSentinel's wedge is reading the *whole repo* via RAG, catching things line-diff tools structurally can't:

- Breaking change detection — flags when a changed function signature affects callers elsewhere in the repo, even files not in the current PR
- Convention drift — flags when a PR doesn't follow patterns established elsewhere in the codebase
- Duplicate logic detection — flags when a PR reimplements something that already exists
- Stale doc/test detection — flags when related docs or tests weren't updated alongside a behavioral change

**Second differentiator**: reasoning transparency. Instead of "line 42: possible bug," cite *why* — pull actual repo context (prior PRs, commit history, related files) into the explanation, the way a senior human reviewer would.

**Positioning note**: repo-aware review will be slower per-PR by design. Lean into "thorough," not "instant" — don't compete with incumbents on speed.

---

## Feature list (with rough build order)

### 1. Commit / PR risk score — build first
- Runs on every push/PR via existing GitHub webhook + Octokit pipeline
- Outputs a colored badge: Low / Medium / High risk
- 2-3 plain-language reasons attached ("touches auth", "no tests added", "400+ line diff")
- Shown on Reviews page and dashboard activity feed
- Cheapest to ship — no new infra, just prompt engineering on data already being fetched

### 2. Repo chatbot ("chat with your repo") — build second
- Reuses the RAG architecture from the separate chat-with-repo project (Pinecone, namespace-per-repo, webhook-based delta sync)
- Chat panel docked near the Reviews page or as a dashboard tab
- Every answer shows file/line citations as clickable chips (reasoning transparency differentiator)
- Loading state shows retrieval progress ("Reading 3 files, checking commit history…") to build trust that answers are grounded, not hallucinated
- Suggested-prompt row for onboarding: "Summarize this repo", "Riskiest files", "Explain schema"

### 3. Repo health dashboard — build third
- File heatmap (churn/bug-flag frequency) — similar pattern to existing contribution graph
- Complexity/hotspot treemap — size = file size, color = risk
- Review trend line — issues found vs resolved over time
- Mostly UI work (Recharts, already in stack) on data the risk-score + chat features are already producing

### 4. MD file / docs generator — build last
- Generates a structured `REPO_SUMMARY.md` from the RAG-indexed repo — architecture, key modules, entry points, dependencies
- Extends the already-planned "Repo Markdown Export" roadmap item from actual export into AI-generated understanding
- Optional: auto-commit as a bot PR (also already on roadmap)
- Should come after the chatbot because doc quality depends on retrieval quality being solid first

---

## Database schema additions (Prisma)

Extends the existing 5-model schema (`User`, `Repository`, `Session`, `Account`, `Verification`) with:

- **`Review`** — one row per PR/push event; holds `riskLevel`, `riskScore`, `summary`, `reasons` (JSON), diff stats
- **`Finding`** — individual line/file-level issues within a review, separate table so severity/category can be queried fast without scanning JSON blobs
- **`RepoIndex`** — tracks RAG indexing state per repo (`NOT_INDEXED → INDEXING → READY/FAILED`, or `→ STALE` after a webhook); holds the Pinecone namespace and last-indexed commit SHA
- **`ChatSession`** + **`ChatMessage`** — chat history per repo per user; `citations` stored as JSON on each message so sourced answers persist, not just returned at request time

Enums added: `RiskLevel`, `Severity`, `IndexStatus`, `MessageRole`.

Full schema file: `schema-additions.prisma` (delivered separately).

---

## AI provider strategy

Decided against a single AI provider — using a **job-based routing pattern** (`AI_MODELS` config in `module/ai/config.ts`) so each feature uses whichever free-tier model fits its latency/context needs, swappable without touching feature code.

| Job | Provider (current pick) | Why |
|---|---|---|
| `riskScore` | Groq (Llama 3.3 70B) | Fast, cheap, needs to return quickly on every push |
| `repoChat` | Google AI Studio (Gemini 2.5 Flash) | Large context window, good for stuffing retrieved chunks |
| `docsGen` | Google AI Studio (Gemini 2.5 Flash) | Needs to synthesize across many files at once |
| `experimental` | OpenRouter (Nemotron 3 Super, free) | Fallback/testing lane — swap in Nemotron, DeepSeek, etc. without code changes |

**Original consideration**: NVIDIA Nemotron 3 family (Nano/Super/Ultra) — free via NVIDIA NIM or OpenRouter. Kept as the `experimental` lane rather than the primary path; NVIDIA's own "Super + Nano deployment pattern" (Super for planning, Nano for execution) is a reasonable model if Nemotron ends up outperforming Groq/Gemini in testing.

**Caveats to keep in mind**:
- Free tiers are positioned for prototyping/demos, not guaranteed production throughput — plan to move to paid once real users show up
- Some free endpoints serve reduced context windows or quantized weights vs. the model's headline specs — verify on the actual endpoint being used
- Nemotron's agentic tool-calling benchmark scores are notably weaker than its reasoning scores — test structured function-calling specifically before relying on it; prefer JSON-mode prompting with defensive parsing as a fallback

**Implementation**: `module/ai/client.ts` exposes a single `complete()` function every feature calls through — one place for error handling, logging, and provider swapping instead of duplicated fetch logic per feature. `parseJSONSafe()` handles free-tier models being less reliable at strict JSON output than frontier paid models.

Files delivered: `config.ts`, `client.ts`, `risk-score.ts` (first consumer), `README.md`.

---

## Open next steps

- [ ] Wire `assessCommitRisk()` into the existing GitHub webhook handler (diff stats already fetched via Octokit)
- [ ] Build the RAG indexing pipeline (`RepoIndex` state machine + Pinecone sync), reusing delta-sync logic from the other project
- [ ] Build repo chatbot UI on top of the index once ready
- [ ] Dashboard aggregation queries (reads data the above three already produce — do this last)
- [ ] Benchmark Nemotron 3 vs Groq/Gemini on real prompts before deciding if `experimental` lane should become primary for any job
