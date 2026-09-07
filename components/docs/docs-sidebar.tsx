"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "How It Works",
    items: [
      { id: "architecture", label: "Architecture" },
      { id: "github-integration", label: "GitHub Integration" },
      { id: "ai-pipeline", label: "AI Pipeline" },
      { id: "rag-system", label: "RAG System" },
    ],
  },
  {
    title: "Tech Stack",
    items: [
      { id: "tech-stack", label: "Stack Overview" },
      { id: "database", label: "Database & ORM" },
      { id: "background-jobs", label: "Background Jobs" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "webhooks", label: "GitHub Webhooks" },
      { id: "inngest-api", label: "Inngest Events" },
    ],
  },
]

export function DocsSidebar() {
  const [activeId, setActiveId] = useState("introduction")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0% -60% 0%" }
    )

    const headings = document.querySelectorAll("section[id]")
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)] pr-4 pb-8">
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setActiveId(item.id)}
                      className={cn(
                        "block py-1 text-sm transition-colors",
                        activeId === item.id
                          ? "text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
