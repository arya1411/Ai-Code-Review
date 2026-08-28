import { getRecentCommits } from "@/module/dashboard"
import { GitCommit, GitBranch, ExternalLink, GitPullRequest } from "lucide-react"

interface RecentCommitsProps {
  limit?: number
}

export default async function RecentCommits({ limit = 4 }: RecentCommitsProps) {
  const commits = await getRecentCommits(limit)

  if (commits.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-900 bg-neutral-950/30 px-6 py-16">
        <div className="mx-auto flex max-w-xs flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
            <GitCommit className="size-5" />
          </div>
          <h3 className="mt-6 text-sm font-medium text-white">No commits found</h3>
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
            Connect a GitHub repository to see your latest commits here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {commits.map((commit) => {
        const [repoOwner, repoName] = commit.repo.split("/")
        return (
          <div
            key={commit.sha}
            className="group relative rounded-lg border border-neutral-900 bg-neutral-950/50 p-4 hover:bg-neutral-950/70 hover:border-neutral-800 transition-all"
          >
            {/* Top row: icon + sha + external link */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-500">
                  <GitCommit className="size-3.5" />
                </div>
                <span className="font-mono text-[11px] text-neutral-500 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5">
                  {commit.shortSha}
                </span>
              </div>
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-neutral-400 mt-0.5"
                aria-label="View on GitHub"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            {/* Commit message */}
            <p className="text-sm font-medium text-neutral-200 leading-snug line-clamp-2 mb-3">
              {commit.message}
            </p>

            {/* Footer meta */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Repo */}
              <div className="flex items-center gap-1 min-w-0">
                <GitPullRequest className="size-3 text-neutral-700 shrink-0" />
                <span className="text-[10px] text-neutral-500 truncate">
                  <span className="text-neutral-600">{repoOwner}/</span>
                  <span className="font-medium">{repoName}</span>
                </span>
              </div>

              {/* Branch */}
              <div className="flex items-center gap-1">
                <GitBranch className="size-3 text-neutral-700 shrink-0" />
                <span className="font-mono text-[10px] text-neutral-600">{commit.branch}</span>
              </div>

              {/* Time */}
              <span className="ml-auto text-[10px] text-neutral-600 shrink-0">
                {commit.relativeTime}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
