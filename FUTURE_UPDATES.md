# Future Updates

This file lists planned future enhancements for the Code Review web app. Add, reorder, or expand items as work progresses.

1. AI Review API
   - Automated PR analysis, diff-aware comments, and suggested patches.

2. Generate repo-MD & auto-commit
   - Produce rich Markdown summaries per repository and optionally commit or open a bot PR.

3. Multi-repo / Org dashboard
   - Cross-repo health metrics, trending issues, and aggregated review backlog.

Additional ideas:
- Security & SCA scanning
- CI / webhook-triggered auto-reviews
- Billing, RBAC, SSO, and integrations (Slack, Jira)

How to use:
- Update this file when you add new features or start work on an item.

## Repo Dashboard & Export

Add an interactive repository dashboard that analyzes a selected GitHub repo and produces a sharable export (Markdown/JSON/ZIP). Key points:

- What it does: collects languages, top package manifests, README gaps, recent commit/PR history, contributors, CI status, and a small dependency/import graph; generates a human-friendly `REPO_SUMMARY.md` and allows downloading or opening a bot PR that adds the file.
- Required scopes: `GITHUB_TOKEN` with `repo`/`public_repo` read (and `contents` + `pull_request` if committing PRs); optional `AI_API_KEY` for enriched summaries.
- Files to add (suggested):
   - `app/api/repo-stats/route.ts` — analysis endpoint
   - `module/repository/stats.ts` — collection and Markdown generator
   - `components/repository/repo-dashboard.tsx` — dashboard UI
   - `app/repositories/[owner]/[repo]/dashboard/page.tsx` — dashboard page
   - `lib/export.ts` — Markdown/JSON/ZIP helpers
- MVP flow: UI triggers `POST /api/repo-stats` → server collects key files (README, package.json, top N source files) + GitHub metadata → returns summary + generated Markdown → UI displays and offers exports or PR creation.
- Notes: use GraphQL to minimize API calls; cache results; for large repos do partial scans (top N files).

Add this to the roadmap when ready to implement the dashboard and export functionality.
