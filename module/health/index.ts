"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"

const MAX_ANALYZED_REVIEWS = 500

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
}

export async function getRepositoryHealth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const userId = session.user.id
  const reviewWhere = { repository: { userId } }
  const findingWhere = { review: { repository: { userId } } }

  const [repositories, reviews, completedReviews, failedReviews, riskAverage, riskGroups, totalFindings, highFindings] = await Promise.all([
    prisma.repository.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        url: true,
        indexStatus: true,
        indexedAt: true,
        indexError: true,
      },
    }),
    prisma.review.findMany({
      where: reviewWhere,
      orderBy: { createdAt: "desc" },
      take: MAX_ANALYZED_REVIEWS,
      select: {
        id: true,
        title: true,
        url: true,
        status: true,
        riskLevel: true,
        riskScore: true,
        createdAt: true,
        completedAt: true,
        repository: { select: { id: true, fullName: true } },
        findings: {
          select: {
            severity: true,
            category: true,
            filePath: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { ...reviewWhere, status: "COMPLETED" } }),
    prisma.review.count({ where: { ...reviewWhere, status: "FAILED" } }),
    prisma.review.aggregate({
      where: { ...reviewWhere, status: "COMPLETED", riskScore: { not: null } },
      _avg: { riskScore: true },
    }),
    prisma.review.groupBy({
      by: ["riskLevel"],
      where: { ...reviewWhere, riskLevel: { not: null } },
      _count: { _all: true },
    }),
    prisma.finding.count({ where: findingWhere }),
    prisma.finding.count({ where: { ...findingWhere, severity: "HIGH" } }),
  ])

  const readyRepositories = repositories.filter((repository) => repository.indexStatus === "READY").length
  const now = new Date()
  const trendMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1))
    return { key: monthKey(date), month: monthLabel(date), riskTotal: 0, scoredReviews: 0, reviews: 0, highRisk: 0 }
  })
  const trendByMonth = new Map(trendMonths.map((month) => [month.key, month]))

  const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 }
  for (const group of riskGroups) {
    if (group.riskLevel) riskDistribution[group.riskLevel] = group._count._all
  }
  const repositoryStats = new Map(repositories.map((repository) => [repository.id, {
    id: repository.id,
    fullName: repository.fullName,
    url: repository.url,
    indexStatus: repository.indexStatus,
    indexError: repository.indexError,
    reviewCount: 0,
    riskTotal: 0,
    scoredReviews: 0,
    highRiskReviews: 0,
    highFindings: 0,
    lastReviewAt: null as Date | null,
  }]))
  const fileStats = new Map<string, { repository: string; path: string; findings: number; high: number; medium: number }>()
  const categoryStats = new Map<string, number>()

  for (const review of reviews) {
    const trend = trendByMonth.get(monthKey(review.completedAt ?? review.createdAt))
    if (trend) {
      trend.reviews += 1
      if (review.riskScore !== null) {
        trend.riskTotal += review.riskScore
        trend.scoredReviews += 1
      }
      if (review.riskLevel === "HIGH") trend.highRisk += 1
    }

    const repository = repositoryStats.get(review.repository.id)
    if (repository) {
      repository.reviewCount += 1
      repository.lastReviewAt ??= review.createdAt
      if (review.riskScore !== null) {
        repository.riskTotal += review.riskScore
        repository.scoredReviews += 1
      }
      if (review.riskLevel === "HIGH") repository.highRiskReviews += 1
    }

    for (const finding of review.findings) {
      const normalizedCategory = finding.category.trim().toLowerCase() || "uncategorized"
      categoryStats.set(normalizedCategory, (categoryStats.get(normalizedCategory) ?? 0) + 1)

      const key = `${review.repository.id}:${finding.filePath}`
      const file = fileStats.get(key) ?? {
        repository: review.repository.fullName,
        path: finding.filePath,
        findings: 0,
        high: 0,
        medium: 0,
      }
      file.findings += 1
      if (finding.severity === "HIGH") {
        file.high += 1
        if (repository) repository.highFindings += 1
      }
      if (finding.severity === "MEDIUM") file.medium += 1
      fileStats.set(key, file)
    }
  }

  const repositoryHealth = [...repositoryStats.values()]
    .map((repository) => ({
      ...repository,
      averageRisk: repository.scoredReviews > 0
        ? Math.round(repository.riskTotal / repository.scoredReviews)
        : null,
    }))
    .sort((left, right) => {
      const leftAttention = (left.averageRisk ?? 0) + left.highFindings * 8 + (left.indexStatus === "FAILED" ? 100 : 0)
      const rightAttention = (right.averageRisk ?? 0) + right.highFindings * 8 + (right.indexStatus === "FAILED" ? 100 : 0)
      return rightAttention - leftAttention
    })

  const attentionItems = [
    ...repositories
      .filter((repository) => repository.indexStatus === "FAILED")
      .map((repository) => ({
        id: `index:${repository.id}`,
        type: "Index failed" as const,
        title: repository.fullName,
        detail: repository.indexError ?? "Repository indexing needs attention.",
        href: "/repositories",
      })),
    ...reviews
      .filter((review) => review.riskLevel === "HIGH")
      .slice(0, 5)
      .map((review) => ({
        id: `review:${review.id}`,
        type: "High risk" as const,
        title: review.title,
        detail: review.repository.fullName,
        href: review.url,
      })),
  ].slice(0, 6)

  return {
    summary: {
      repositories: repositories.length,
      readyRepositories,
      completedReviews,
      failedReviews,
      averageRisk: riskAverage._avg.riskScore === null ? null : Math.round(riskAverage._avg.riskScore),
      totalFindings,
      highFindings,
    },
    riskDistribution,
    trend: trendMonths.map((month) => ({
      month: month.month,
      reviews: month.reviews,
      highRisk: month.highRisk,
      averageRisk: month.scoredReviews > 0 ? Math.round(month.riskTotal / month.scoredReviews) : 0,
    })),
    categories: [...categoryStats.entries()]
      .map(([category, count]) => ({
        category: category.replace(/(^|[-_\s])\w/g, (value) => value.toUpperCase()),
        count,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 7),
    riskyFiles: [...fileStats.values()]
      .sort((left, right) => (right.high * 10 + right.medium * 3 + right.findings) - (left.high * 10 + left.medium * 3 + left.findings))
      .slice(0, 8),
    repositories: repositoryHealth,
    attentionItems,
    analyzedReviewLimit: MAX_ANALYZED_REVIEWS,
  }
}

export type RepositoryHealthData = Awaited<ReturnType<typeof getRepositoryHealth>>
