"use server"

import {
    fetchUserContribution, getGithubToken
} from "@/module/github/lib/github"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Octokit } from "octokit"
import { formatDistanceToNow } from "date-fns"

export async function getDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            throw new Error("UnAuthorized");
        }

        const token = await getGithubToken()
        const octokit = new Octokit({ auth: token })

        const { data: user } = await octokit.rest.users.getAuthenticated()

        // Get actual total repos count dynamically
        const totalRepos = (user.public_repos || 0) + (user.total_private_repos || 0)

        const calender = await fetchUserContribution(token, user.login)
        const totalCommits = calender?.totalContributions || 0

        // Fetch recent pull requests as recent activity
        const { data: recentPrs } = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr`,
            sort: "created",
            order: "desc",
            per_page: 5
        })

        const recentActivity = (recentPrs?.items || []).map((pr) => {
            const repoName = pr.repository_url.split("/repos/")[1] || "unknown/repo";
            return {
                id: pr.id,
                type: "review" as const,
                repository: repoName,
                pr: `#${pr.number} - ${pr.title}`,
                status: pr.state === "closed" ? "completed" as const : "in_progress" as const,
                time: formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })
            }
        })

        // Fetch contribution counts for the last 30 days dynamically
        const allDays = calender?.weeks.flatMap(w => w.contributionDays) || [];
        const last30Days = allDays.slice(-30);
        const maxCount = Math.max(...last30Days.map(d => d.contributionCount), 1);
        const contributionHeights = last30Days.length > 0
            ? last30Days.map(d => {
                const count = d.contributionCount || 0;
                if (count === 0) return 10;
                return Math.min(100, Math.round((count / maxCount) * 90) + 10);
            })
            : [45, 60, 30, 80, 50, 75, 40, 90, 65, 35, 70, 85, 25, 60, 55, 30, 80, 45, 75, 50, 90, 40, 65, 35, 70, 85, 25, 60, 55, 30];

        const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr`,
            per_page: 1
        })

        const totalPrs = prs.total_count

        return {
            totalRepos,
            totalCommits,
            totalPrs,
            recentActivity,
            contributionHeights
        }

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalRepos: 0,
            totalCommits: 0,
            totalPrs: 0,
            recentActivity: [],
            contributionHeights: [45, 60, 30, 80, 50, 75, 40, 90, 65, 35, 70, 85, 25, 60, 55, 30, 80, 45, 75, 50, 90, 40, 65, 35, 70, 85, 25, 60, 55, 30]
        }
    }
}