"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from "@/components/ui/fade-in"
import { ExternalLink, Star, Search, FolderGit2, Loader2, Check, Plus } from 'lucide-react'
import { useRepositories } from '@/module/repository/hooks/use-repository'
import { useConnectRepository } from '../hooks/use-connect-repository'

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
}

export function RepositoryList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(null)
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useRepositories()


  const {mutate:connectRepo} = useConnectRepository()

  const allRepositories = (data?.pages.flatMap((page: any) => page) || []) as Repository[]

  const filteredRepositories = allRepositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleConnect = (repo : Repository) => {
    setLocalConnectingId(repo.id)
    connectRepo( {
      owner: repo.full_name.split("/")[0],
      repo : repo.name,
      githubId : repo.id
  })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14 space-y-8">
      {/* Header Section */}
      <FadeIn>
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
              GitHub Repositories
            </h1>
            <p className="text-sm text-neutral-400">
              Select and connect repositories to enable AI code reviews on pull requests.
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

      {/* Repository Cards List */}
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
          <div className="grid grid-cols-1 gap-4">
            {filteredRepositories.map((repo) => (
              <Card
                key={repo.id}
                className="border-neutral-900 bg-neutral-950/40 hover:bg-neutral-950/70 transition-colors duration-200"
              >
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-5">
                  <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <CardTitle className="text-base font-medium text-white hover:text-blue-400 transition-colors truncate">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          {repo.full_name}
                          <ExternalLink className="size-3.5 text-neutral-500" />
                        </a>
                      </CardTitle>
                      {repo.isConnected && (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 px-2 py-0.5">
                          <Check className="size-3" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <CardDescription className="text-xs text-neutral-400 line-clamp-2">
                        {repo.description}
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleConnect(repo)}
                      variant={repo.isConnected ? "outline" : "default"}
                      className={
                        repo.isConnected
                          ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                          : "bg-white text-black hover:bg-neutral-200 font-medium"
                      }
                      disabled={localConnectingId === repo.id}
                    >
                      {localConnectingId === repo.id ? (
                        <>
                          <Loader2 className="size-3.5 mr-1 animate-spin" />
                          Connecting
                        </>
                      ) : repo.isConnected ? (
                        <>
                          <Check className="size-3.5 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0 flex items-center gap-4 text-xs text-neutral-400">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-400" />
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="size-3.5 text-amber-400/80 fill-amber-400/80" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
