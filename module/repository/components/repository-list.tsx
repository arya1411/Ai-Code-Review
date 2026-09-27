"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { FadeIn } from "@/components/ui/fade-in"
import { ExternalLink, Star, Search, FolderGit2, Loader2, Check, RefreshCw, CircleAlert, X, FileCode2, GitBranch, Braces, Boxes, MoreHorizontal } from 'lucide-react'
import { useRepositories } from '@/module/repository/hooks/use-repository'
import { useConnectRepository, useReindexRepository } from '../hooks/use-connect-repository'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  isConnected?: boolean
  connectedRepositoryId?: string
  indexStatus?: "NOT_INDEXED" | "INDEXING" | "READY" | "FAILED"
}

type IndexPopupState = {
  repositoryId: number
  repositoryName: string
  phase: "CONNECTING" | "INDEXING"
  dataVersionAtStart: number
}

function RepositoryStatus({ repository }: { repository: Repository }) {
  const state = !repository.isConnected
    ? { label: "Not connected", dot: "bg-neutral-700" }
    : repository.indexStatus === "READY"
      ? { label: "Review ready", dot: "bg-emerald-400" }
      : repository.indexStatus === "INDEXING"
        ? { label: "Indexing", dot: "animate-pulse bg-amber-400" }
        : repository.indexStatus === "FAILED"
          ? { label: "Index failed", dot: "bg-red-400" }
          : { label: "Setup required", dot: "bg-neutral-400" }

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-neutral-500">
      <span className={`size-1.5 shrink-0 ${state.dot}`} />
      {state.label}
    </span>
  )
}

function IndexingPopup({
  repositoryName,
  status,
  onClose,
}: {
  repositoryName: string
  status: "CONNECTING" | "INDEXING" | "READY" | "FAILED"
  onClose: () => void
}) {
  const [activityStep, setActivityStep] = useState(0)

  const activities = [
    { icon: GitBranch, code: "FETCH", label: "Collect repository files" },
    { icon: Braces, code: "PARSE", label: "Read symbols and structure" },
    { icon: Boxes, code: "MAP", label: "Build review context" },
  ]

  useEffect(() => {
    if (status !== "INDEXING") return
    const interval = window.setInterval(() => {
      setActivityStep((current) => (current + 1) % activities.length)
    }, 2400)
    return () => window.clearInterval(interval)
  }, [status, activities.length])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const isDone = status === "READY"
  const isFailed = status === "FAILED"
  const title = isDone
    ? "Repository ready"
    : isFailed
      ? "Indexing stopped"
      : status === "CONNECTING"
        ? "Connecting repository"
        : "Indexing repository"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="indexing-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4 pr-14">
          <span className={`size-2 rounded-full ${isDone ? "bg-emerald-400" : isFailed ? "bg-red-400" : "animate-pulse bg-amber-400"}`} />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            {isDone ? "Index complete" : isFailed ? "Index failed" : status === "CONNECTING" ? "Establishing connection" : "Index job running"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-2.5 z-10 rounded-md p-2 text-neutral-600 transition hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
          aria-label="Close indexing progress"
        >
          <X className="size-4" />
        </button>

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border ${
              isDone ? "border-emerald-500/30 text-emerald-400" : isFailed ? "border-red-500/30 text-red-400" : "border-neutral-700 text-neutral-300"
            }`}>
              {isDone ? <Check className="size-5" /> : isFailed ? <CircleAlert className="size-5" /> : <FileCode2 className="size-5" />}
            </div>
            <div className="min-w-0">
              <h2 id="indexing-title" className="text-lg font-semibold tracking-tight text-white">{title}</h2>
              <p className="mt-1 truncate font-mono text-xs text-neutral-500">{repositoryName}</p>
            </div>
          </div>

          <div className="mt-5 border-l border-neutral-800 pl-4">
            <p className="text-sm leading-6 text-neutral-400">
              {isDone
                ? "AI reviews and repository chat now have the context they need."
                : isFailed
                  ? "The background job was interrupted. Close this window and use Retry index to run it again."
                  : status === "CONNECTING"
                    ? "Authorizing access and preparing the background job."
                    : "Your source stays available while we prepare it for code review and repository chat."}
            </p>
          </div>

          {!isDone && !isFailed && (
            <div className="mt-6 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">Pipeline</span>
                <span className="font-mono text-[10px] text-neutral-600">activity, not exact progress</span>
              </div>
              <div className="divide-y divide-neutral-900">
                {activities.map((activity, index) => {
                  const Icon = activity.icon
                  const active = status === "CONNECTING" ? index === 0 : index === activityStep
                  return (
                    <div
                      key={activity.label}
                      className={`relative flex items-center gap-3 px-4 py-3 transition-colors duration-300 ${
                        active ? "bg-neutral-900 text-neutral-200" : "text-neutral-600"
                      }`}
                    >
                      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-amber-400" />}
                      <span className="w-5 font-mono text-[10px] tabular-nums text-neutral-700">0{index + 1}</span>
                      <Icon className={`size-3.5 ${active ? "text-amber-400" : "text-neutral-700"}`} />
                      <span className={`w-10 font-mono text-[10px] font-medium ${active ? "text-amber-400" : "text-neutral-700"}`}>{activity.code}</span>
                      <span className="text-xs">{activity.label}</span>
                      {active && <Loader2 className="ml-auto size-3.5 animate-spin text-neutral-500" />}
                    </div>
                  )
                })}
              </div>
              <div className="h-0.5 overflow-hidden bg-neutral-900">
                <div className="h-full w-1/3 animate-[indexing-slide_1.8s_ease-in-out_infinite] bg-amber-400" />
              </div>
            </div>
          )}

          {!isDone && !isFailed && (
            <div className="mt-4 flex items-start justify-between gap-6 rounded-lg bg-neutral-900/60 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-neutral-300">Usually 5–7 minutes</p>
                <p className="mt-1 text-[11px] leading-4 text-neutral-500">Safe to close. The job keeps running.</p>
              </div>
              <button type="button" onClick={onClose} className="shrink-0 text-xs font-medium text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition hover:text-white">
                Run in background
              </button>
            </div>
          )}

          {(isDone || isFailed) && (
            <Button
              type="button"
              onClick={onClose}
              className={`mt-7 w-full ${isDone ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-white hover:bg-neutral-700"}`}
            >
              {isDone ? "Done" : "Close and retry"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RepositoryList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(null)
  const [localIndexingId, setLocalIndexingId] = useState<number | null>(null)
  const [indexPopup, setIndexPopup] = useState<IndexPopupState | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    dataUpdatedAt,
  } = useRepositories()


  const {mutate:connectRepo} = useConnectRepository({
    onSuccess: () => {
      setLocalConnectingId(null)
      setIndexPopup((current) => current ? { ...current, phase: "INDEXING" } : current)
    },
    onError: () => {
      setLocalConnectingId(null)
      setIsPopupOpen(false)
    },
  })
  const { mutate: reindexRepo } = useReindexRepository({
    onSuccess: () => {
      setLocalIndexingId(null)
      setIndexPopup((current) => current ? { ...current, phase: "INDEXING" } : current)
    },
    onError: () => {
      setLocalIndexingId(null)
      setIsPopupOpen(false)
    },
  })

  const allRepositories = (data?.pages.flatMap((page: unknown) => page) || []) as Repository[]

  const filteredRepositories = allRepositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const isWaitingForFreshStatus = indexPopup?.phase === "INDEXING" && dataUpdatedAt <= indexPopup.dataVersionAtStart
  const hasActiveIndex = allRepositories.some((repo) => repo.indexStatus === "INDEXING") || isWaitingForFreshStatus

  useEffect(() => {
    if (!hasActiveIndex) return
    const interval = window.setInterval(() => void refetch(), 5000)
    return () => window.clearInterval(interval)
  }, [hasActiveIndex, refetch])

  const popupRepository = indexPopup
    ? allRepositories.find((repo) => repo.id === indexPopup.repositoryId)
    : undefined
  const canUseTerminalStatus = indexPopup ? dataUpdatedAt > indexPopup.dataVersionAtStart : false
  const popupStatus = canUseTerminalStatus && (popupRepository?.indexStatus === "READY" || popupRepository?.indexStatus === "FAILED")
    ? popupRepository.indexStatus
    : indexPopup?.phase

  const handleConnect = (repo : Repository) => {
    if (repo.isConnected) {
      if (repo.indexStatus === "INDEXING") {
        setIndexPopup({ repositoryId: repo.id, repositoryName: repo.full_name, phase: "INDEXING", dataVersionAtStart: 0 })
        setIsPopupOpen(true)
        return
      }
      if (!repo.connectedRepositoryId) return
      setLocalIndexingId(repo.id)
      setIndexPopup({ repositoryId: repo.id, repositoryName: repo.full_name, phase: "INDEXING", dataVersionAtStart: dataUpdatedAt })
      setIsPopupOpen(true)
      reindexRepo(repo.connectedRepositoryId)
      return
    }

    setLocalConnectingId(repo.id)
    setIndexPopup({ repositoryId: repo.id, repositoryName: repo.full_name, phase: "CONNECTING", dataVersionAtStart: dataUpdatedAt })
    setIsPopupOpen(true)
    connectRepo( {
      owner: repo.full_name.split("/")[0],
      repo : repo.name,
      githubId : repo.id
  })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14 space-y-8">
      {isPopupOpen && indexPopup && popupStatus && (
        <IndexingPopup
          repositoryName={indexPopup.repositoryName}
          status={popupStatus}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
      {/* Header Section */}
      <FadeIn>
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
              GitHub Repositories
            </h1>
            <p className="text-sm text-neutral-400">
              Connect repositories and prepare them for AI code reviews.
            </p>
          </div>
        </header>
      </FadeIn>

      {/* Search & Filter Bar */}
      <FadeIn delay={0.05}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search repositories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-neutral-950/60 border-neutral-800 text-white placeholder:text-neutral-500 h-10 rounded-lg focus-visible:ring-neutral-700"
          />
        </div>
      </FadeIn>

      {/* Repository workspace list */}
      <FadeIn delay={0.1}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-neutral-900 rounded-lg bg-neutral-950/30">
            <Loader2 className="size-6 animate-spin text-neutral-400" />
            <p className="mt-3 text-sm text-neutral-400">Loading your GitHub repositories...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 border border-neutral-900 rounded-lg bg-neutral-950/30 text-center px-4">
            <p className="text-sm font-medium text-red-400">Failed to load repositories</p>
            <p className="mt-1 text-xs text-neutral-500">Make sure your GitHub account is properly connected.</p>
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-neutral-900 rounded-lg bg-neutral-950/30 text-center px-4">
            <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400">
              <FolderGit2 className="size-5" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-white">No repositories found</h3>
            <p className="mt-1 text-xs text-neutral-500">
              {searchQuery ? "Try adjusting your search terms." : "You do not have any repositories available."}
            </p>
          </div>
        ) : (
          <div className="overflow-visible border-y border-neutral-900">
            <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_10rem] border-b border-neutral-900 bg-neutral-950/40 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-700 md:grid">
              <span>Repository</span>
              <span>Review state</span>
              <span>Source</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-neutral-900">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="group grid gap-4 px-4 py-4 transition-colors hover:bg-neutral-950/70 md:grid-cols-[minmax(0,1fr)_9rem_8rem_10rem] md:items-center"
                >
                  <div className="min-w-0">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 text-[17px] font-medium text-neutral-200 transition hover:text-white"
                    >
                      <span className="truncate">{repo.full_name}</span>
                      <ExternalLink className="size-3 shrink-0 text-neutral-700 transition group-hover:text-neutral-500" />
                    </a>
                    {repo.description && (
                      <p className="mt-1 max-w-2xl truncate text-[13px] leading-5 text-neutral-600">{repo.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:block">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-700 md:hidden">State</span>
                    <RepositoryStatus repository={repo} />
                  </div>

                  <div className="flex items-center justify-between md:block">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-700 md:hidden">Source</span>
                    <div className="flex items-center gap-3 font-mono text-[12px] text-neutral-600">
                      {repo.language && <span>{repo.language}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 text-neutral-700" />
                        {repo.stargazers_count}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {repo.indexStatus === "READY" ? (
                      <details className="group/menu relative">
                        <summary
                          className="flex size-8 cursor-pointer list-none items-center justify-center border border-neutral-800 text-neutral-600 transition hover:border-neutral-700 hover:text-white [&::-webkit-details-marker]:hidden"
                          aria-label={`More actions for ${repo.full_name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </summary>
                        <div className="absolute right-0 top-full z-20 mt-1.5 w-36 border border-neutral-800 bg-neutral-950 p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.currentTarget.closest("details")?.removeAttribute("open")
                              handleConnect(repo)
                            }}
                            disabled={localIndexingId === repo.id}
                            className="flex w-full items-center gap-2 px-2.5 py-2 text-left font-mono text-[12px] uppercase tracking-wide text-neutral-500 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                          >
                            {localIndexingId === repo.id ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                            Re-index
                          </button>
                        </div>
                      </details>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(repo)}
                        variant="outline"
                        className="h-9 min-w-32 rounded-none border-neutral-800 bg-transparent font-mono text-[12px] uppercase tracking-wide text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                        disabled={localConnectingId === repo.id || localIndexingId === repo.id}
                      >
                        {localConnectingId === repo.id || localIndexingId === repo.id ? (
                          <>
                            <Loader2 className="mr-1 size-3.5 animate-spin" />
                            {repo.isConnected ? "Starting" : "Connecting"}
                          </>
                        ) : repo.indexStatus === "INDEXING" ? (
                          <>View activity</>
                        ) : repo.indexStatus === "FAILED" ? (
                          <>Retry index</>
                        ) : repo.isConnected ? (
                          <>Run index</>
                        ) : (
                          <>Connect repo</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                "Load more repositories"
              )}
            </Button>
          </div>
        )}
      </FadeIn>
    </div>
  )
}
