import { requireAuth } from "@/module/auth/utils/auth-utils"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { FadeIn } from "@/components/ui/fade-in"
import { getConnectedRepositories } from "@/module/repository"
import {
  MessageSquareCode,
  GitBranch,
  ArrowRight,
  Sparkles,
  Send,
  FolderGit2,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ChatPage() {
  const session = await requireAuth()
  const repos = await getConnectedRepositories()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <div className="flex h-[calc(100vh-0px)] md:h-screen flex-col md:flex-row overflow-hidden">

          {/* ── Left panel: repo selector ── */}
          <aside className="w-full md:w-72 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-neutral-900 bg-black">

            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-neutral-900 px-5 py-4">
              <MessageSquareCode className="size-4 text-neutral-500 shrink-0" />
              <div>
                <h1 className="text-sm font-semibold text-white leading-none">Talk with Repo</h1>
                <p className="text-[10px] text-neutral-600 mt-0.5">Select a repository to begin</p>
              </div>
            </div>

            {/* Repo list */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              {repos.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-700">
                    Connected · {repos.length}
                  </p>
                  {repos.map((repo) => (
                    <button
                      key={repo.id}
                      disabled
                      className="group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-neutral-900/50 cursor-not-allowed opacity-70"
                      title="Chat coming soon"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-500">
                        <FolderGit2 className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-neutral-300">{repo.name}</p>
                        <p className="truncate text-[10px] text-neutral-600">{repo.owner}</p>
                      </div>
                      <Lock className="size-3 text-neutral-800 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-500">
                    <FolderGit2 className="size-5" />
                  </div>
                  <p className="mt-4 text-xs font-medium text-neutral-400">No repositories connected</p>
                  <p className="mt-1 text-[11px] text-neutral-600 leading-relaxed">
                    Connect a GitHub repo first to chat with it.
                  </p>
                  <Button
                    render={<Link href="/dashboard/repository" />}
                    size="sm"
                    className="mt-4 gap-1.5 bg-white text-black hover:bg-neutral-200 transition-colors text-xs"
                  >
                    Connect repo
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="border-t border-neutral-900 px-4 py-3">
              <p className="text-[10px] text-neutral-700 leading-relaxed">
                Conversations are scoped to a single repository and powered by RAG over indexed code.
              </p>
            </div>
          </aside>

          {/* ── Right panel: chat area ── */}
          <main className="flex flex-1 flex-col overflow-hidden bg-black">

            {/* Chat header */}
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-900 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <GitBranch className="size-4 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-500">No repository selected</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-amber-900/60 bg-amber-950/30 px-2.5 py-1 text-[10px] font-medium text-amber-500">
                <Sparkles className="size-3" />
                Coming soon
              </span>
            </div>

            {/* Empty / coming-soon state */}
            <FadeIn>
              <div className="flex flex-1 flex-col items-center justify-center px-8 py-24 text-center">
                {/* Decorative icon cluster */}
                <div className="relative mb-8">
                  <div className="flex size-16 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 text-neutral-400 shadow-lg">
                    <MessageSquareCode className="size-8" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-amber-900 bg-amber-950 text-[9px] font-bold text-amber-400">
                    ✦
                  </span>
                </div>

                <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
                  Talk with your codebase
                </h2>
                <p className="mt-3 max-w-sm text-sm text-neutral-500 leading-relaxed">
                  Ask questions, explore architecture, understand logic — all
                  in natural language, grounded in your actual source code via
                  RAG-powered semantic search.
                </p>

                {/* Feature preview cards */}
                <div className="mt-10 grid w-full max-w-lg gap-3 sm:grid-cols-3">
                  {[
                    {
                      icon: "💬",
                      title: "Ask anything",
                      desc: "How does auth work in this repo?",
                    },
                    {
                      icon: "🔍",
                      title: "Code search",
                      desc: "Find usages of a function across files.",
                    },
                    {
                      icon: "🧠",
                      title: "RAG context",
                      desc: "Answers grounded in real code, not hallucinations.",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="rounded-lg border border-neutral-900 bg-neutral-950/50 p-4 text-left"
                    >
                      <span className="text-xl">{card.icon}</span>
                      <p className="mt-2 text-xs font-semibold text-neutral-300">{card.title}</p>
                      <p className="mt-0.5 text-[11px] text-neutral-600 leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-xs text-neutral-700">
                  Feature is under development · Select a repo on the left when it launches
                </p>
              </div>
            </FadeIn>

            {/* Disabled chat input bar */}
            <div className="shrink-0 border-t border-neutral-900 px-6 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 opacity-40 cursor-not-allowed">
                <input
                  disabled
                  placeholder="Select a repository to start chatting…"
                  className="flex-1 bg-transparent text-sm text-neutral-400 placeholder:text-neutral-600 outline-none cursor-not-allowed"
                />
                <button
                  disabled
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-500 cursor-not-allowed"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </main>

        </div>
      </DashboardShell>
    </AppBackground>
  )
}
