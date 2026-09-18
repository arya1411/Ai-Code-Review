"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getReviews() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.review.findMany({
    where: { repository: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      pullRequestNumber: true,
      title: true,
      author: true,
      url: true,
      status: true,
      riskLevel: true,
      riskScore: true,
      summary: true,
      reasons: true,
      error: true,
      createdAt: true,
      completedAt: true,
      repository: { select: { fullName: true } },
      findings: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          severity: true,
          category: true,
          filePath: true,
          line: true,
          message: true,
          suggestion: true,
        },
      },
    },
  })
}
