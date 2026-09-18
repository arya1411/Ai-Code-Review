import type { Octokit } from "octokit"
import type { z } from "zod"
import type { reviewOutputSchema } from "@/module/ai/lib/review-output"

type ReviewOutput = z.infer<typeof reviewOutputSchema>

function escapeInlineCode(value: string) {
  return value.replace(/`/g, "\\`")
}

export function formatGitHubReviewComment(commentKey: string, result: ReviewOutput) {
  const marker = `<!-- codesentinel-review:${commentKey} -->`
  const reasons = result.reasons.length > 0
    ? `\n### Risk factors\n${result.reasons.map((reason) => `- ${reason}`).join("\n")}\n`
    : ""
  const findings = result.findings.length > 0
    ? `\n### Findings\n${result.findings.map((finding, index) => {
      const location = `${escapeInlineCode(finding.filePath)}${finding.line ? `:${finding.line}` : ""}`
      const suggestion = finding.suggestion
        ? `\n\n**Suggested change:** ${finding.suggestion}`
        : ""

      return `#### ${index + 1}. ${finding.severity} · ${finding.category}\n\`${location}\`\n\n${finding.message}${suggestion}`
    }).join("\n\n")}\n`
    : "\n### Findings\nNo concrete issues were found in the supplied diff.\n"

  return `${marker}
## codeSentinel AI review

**Risk: ${result.riskLevel} · ${result.riskScore}/100**

${result.summary}
${reasons}${findings}
---
<sub>Repository-aware AI review. Verify important findings before applying changes.</sub>`
}

export async function upsertGitHubReviewComment(input: {
  octokit: Octokit
  owner: string
  repo: string
  pullRequestNumber: number
  commentKey: string
  result: ReviewOutput
}) {
  const marker = `<!-- codesentinel-review:${input.commentKey} -->`
  const body = formatGitHubReviewComment(input.commentKey, input.result)
  const comments = await input.octokit.paginate(input.octokit.rest.issues.listComments, {
    owner: input.owner,
    repo: input.repo,
    issue_number: input.pullRequestNumber,
    per_page: 100,
  })
  const existingComment = comments.find((comment) => comment.body?.includes(marker))

  if (existingComment) {
    await input.octokit.rest.issues.updateComment({
      owner: input.owner,
      repo: input.repo,
      comment_id: existingComment.id,
      body,
    })
    return { commentId: existingComment.id, created: false }
  }

  const { data } = await input.octokit.rest.issues.createComment({
    owner: input.owner,
    repo: input.repo,
    issue_number: input.pullRequestNumber,
    body,
  })

  return { commentId: data.id, created: true }
}
