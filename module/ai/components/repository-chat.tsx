"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  Bot,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Loader2,
  MessageSquareCode,
  Send,
  Sparkles,
  User,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { askRepository, type RepoChatCitation, type RepoChatMessage } from "@/module/ai/chat"

interface ChatRepository {
  id: string
  name: string
  owner: string
  fullName: string
  url: string
  indexStatus: "NOT_INDEXED" | "INDEXING" | "READY" | "FAILED"
}

interface DisplayMessage extends RepoChatMessage {
  id: string
  citations?: RepoChatCitation[]
}

const suggestions = [
  "Summarize the architecture of this repository.",
  "How does authentication work?",
  "What are the most important entry points?",
]

export function RepositoryChat({ repositories }: { repositories: ChatRepository[] }) {
  const [selectedId, setSelectedId] = useState(repositories[0]?.id ?? "")
  const [messages, setMessages] = useState<Record<string, DisplayMessage[]>>({})
  const [question, setQuestion] = useState("")
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedRepository = repositories.find((repository) => repository.id === selectedId)
  const canAskRepository = Boolean(selectedRepository)
  const activeMessages = selectedId ? messages[selectedId] ?? [] : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeMessages.length, isSending])

  async function submitQuestion(event?: FormEvent, suggestedQuestion?: string) {
    event?.preventDefault()
    const content = (suggestedQuestion ?? question).trim()
    if (!selectedId || !content || isSending) return

    const previousMessages = messages[selectedId] ?? []
    const userMessage: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    setMessages((current) => ({
      ...current,
      [selectedId]: [...(current[selectedId] ?? []), userMessage],
    }))
    setQuestion("")
    setError("")
    setIsSending(true)

    try {
      const result = await askRepository(
        selectedId,
        content,
        previousMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
      )

      if (result.success) {
        const assistantMessage: DisplayMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          citations: result.citations,
        }
        setMessages((current) => ({
          ...current,
          [selectedId]: [...(current[selectedId] ?? []), assistantMessage],
        }))
      } else {
        setError(result.error)
      }
    } catch {
      setError("The repository assistant could not answer right now. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden md:flex-row">
      <aside className="flex max-h-56 w-full shrink-0 flex-col border-b border-neutral-900 bg-black md:max-h-none md:w-72 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2.5 border-b border-neutral-900 px-5 py-4">
          <MessageSquareCode className="size-4 shrink-0 text-neutral-500" />
          <div>
            <h1 className="text-sm font-semibold leading-none text-white">Talk with Repo</h1>
            <p className="mt-1 text-[10px] text-neutral-600">Grounded in your indexed code</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {repositories.length > 0 ? (
            <div className="space-y-1">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-700">
                Connected · {repositories.length}
              </p>
              {repositories.map((repository) => {
                const selected = repository.id === selectedId
                return (
                  <button
                    key={repository.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(repository.id)
                      setError("")
                    }}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selected ? "bg-neutral-900 text-white" : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"
                    }`}
                  >
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${selected ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-neutral-800 bg-neutral-900 text-neutral-500"}`}>
                      <FolderGit2 className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{repository.name}</p>
                      <p className="truncate text-[10px] text-neutral-600">{repository.owner}</p>
                    </div>
                    <span
                      className={`size-1.5 rounded-full ${
                        repository.indexStatus === "READY"
                          ? "bg-emerald-400"
                          : repository.indexStatus === "FAILED"
                            ? "bg-red-400"
                            : "bg-amber-400"
                      }`}
                      title={repository.indexStatus.toLowerCase().replace("_", " ")}
                    />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <FolderGit2 className="size-6 text-neutral-600" />
              <p className="mt-3 text-xs font-medium text-neutral-400">No repositories connected</p>
              <Button render={<Link href="/repositories" />} size="sm" className="mt-4 gap-1.5 bg-white text-xs text-black hover:bg-neutral-200">
                Connect repo <ArrowRight className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-900 px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <GitBranch className="size-4 shrink-0 text-neutral-600" />
            <span className="truncate text-sm font-medium text-neutral-300">
              {selectedRepository?.fullName ?? "Select a repository"}
            </span>
          </div>
          {selectedRepository && (
            <a href={selectedRepository.url} target="_blank" rel="noreferrer" className="text-neutral-600 transition-colors hover:text-neutral-300" aria-label="Open repository on GitHub">
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
          {selectedRepository && activeMessages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                <Sparkles className="size-6" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">Ask about {selectedRepository.name}</h2>
              {selectedRepository.indexStatus === "READY" ? (
                <>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                    Answers use semantic search over the indexed repository and show the source files used.
                  </p>
                  <div className="mt-7 grid w-full gap-2 sm:grid-cols-3">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => submitQuestion(undefined, suggestion)} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-left text-xs leading-relaxed text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-200">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 max-w-md text-sm leading-relaxed text-amber-500/80">
                  {selectedRepository.indexStatus === "FAILED"
                    ? "Semantic indexing is unavailable. Questions will use a direct GitHub fallback until indexing is repaired."
                    : "Semantic indexing is still in progress. Questions can use a direct GitHub fallback in the meantime."}
                </p>
              )}
            </div>
          ) : !selectedRepository ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-600">Connect a repository to start chatting.</div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {activeMessages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300"><Bot className="size-4" /></div>}
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-white text-black" : "border border-neutral-800 bg-neutral-950 text-neutral-300"}`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-neutral-800 pt-3">
                        {message.citations.map((citation, index) => (
                          <span key={`${citation.path}-${index}`} title={citation.path} className="max-w-full truncate rounded-md border border-neutral-800 bg-black px-2 py-1 font-mono text-[10px] text-neutral-500">
                            [{index + 1}] {citation.path}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400"><User className="size-4" /></div>}
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <div className="flex size-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300"><Loader2 className="size-4 animate-spin" /></div>
                  Searching the repository and preparing an answer…
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-neutral-900 px-5 py-4 md:px-6">
          <form onSubmit={(event) => submitQuestion(event)} className="mx-auto max-w-3xl">
            {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
            <div className="flex items-end gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 focus-within:border-neutral-700">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void submitQuestion()
                  }
                }}
                disabled={!canAskRepository || isSending}
                rows={1}
                maxLength={2_000}
                placeholder={canAskRepository ? `Ask about ${selectedRepository?.name}…` : "Select a repository to start chatting…"}
                className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed"
              />
              <button type="submit" disabled={!canAskRepository || !question.trim() || isSending} className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Send message">
                {isSending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-neutral-700">AI answers can be incomplete. Verify important details in the cited source files.</p>
          </form>
        </div>
      </main>
    </div>
  )
}
