import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = "bash", className }: CodeBlockProps) {
  return (
    <div className={cn("relative rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden", className)}>
      {language && (
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-neutral-700" />
            <span className="size-2.5 rounded-full bg-neutral-700" />
            <span className="size-2.5 rounded-full bg-neutral-700" />
          </div>
          <span className="ml-2 text-xs font-mono text-neutral-500">{language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4">
        <code className="text-sm font-mono leading-relaxed text-neutral-300">{code}</code>
      </pre>
    </div>
  )
}

interface CalloutProps {
  type?: "note" | "warning" | "tip"
  children: React.ReactNode
}

const calloutStyles = {
  note: "border-neutral-700 bg-neutral-900/50 text-neutral-300",
  warning: "border-yellow-900 bg-yellow-950/30 text-yellow-200",
  tip: "border-green-900 bg-green-950/30 text-green-200",
}

const calloutLabels = {
  note: "Note",
  warning: "Warning",
  tip: "Tip",
}

export function Callout({ type = "note", children }: CalloutProps) {
  return (
    <div className={cn("rounded-lg border px-4 py-3.5 text-sm leading-relaxed", calloutStyles[type])}>
      <span className="font-semibold mr-2">{calloutLabels[type]}:</span>
      {children}
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  children: React.ReactNode
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="relative pl-10 pb-10 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-[17px] top-8 bottom-0 w-px bg-neutral-800 last:hidden" />
      {/* Number circle */}
      <div className="absolute left-0 top-0.5 flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 text-sm font-mono font-bold text-white">
        {number}
      </div>
      <h3 className="mb-3 text-base font-semibold text-white pt-1">{title}</h3>
      <div className="text-sm leading-relaxed text-neutral-400 space-y-3">{children}</div>
    </div>
  )
}

interface TableRow {
  col1: string
  col2: string
  col3?: string
}

interface DocTableProps {
  headers: string[]
  rows: TableRow[]
}

export function DocTable({ headers, rows }: DocTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-950">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-300 text-xs uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-neutral-900/30 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-neutral-300">{row.col1}</td>
              <td className="px-4 py-3 text-neutral-400">{row.col2}</td>
              {row.col3 && <td className="px-4 py-3 text-neutral-500">{row.col3}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
