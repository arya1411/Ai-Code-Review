import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { env } from "@/lib/env";
import { isDefaultBranchPush, verifyGitHubWebhookSignature } from "@/lib/github-webhook";

interface GithubRepositoryPayload {
    id?: number;
    name?: string;
    owner?: { login?: string };
    default_branch?: string;
}

interface GithubWebhookPayload {
    action?: string;
    ref?: string;
    after?: string;
    deleted?: boolean;
    repository?: GithubRepositoryPayload;
    pull_request?: {
        id?: number;
        number?: number;
        title?: string;
        html_url?: string;
        draft?: boolean;
        user?: { login?: string };
        head?: { sha?: string };
        base?: { sha?: string };
    };
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();

        const isValid = verifyGitHubWebhookSignature(
            rawBody,
            req.headers.get("x-hub-signature-256"),
            env.GITHUB_WEBHOOK_SECRET,
        );
        if (!isValid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody) as GithubWebhookPayload;
        const event = req.headers.get("x-github-event");

        if (event === "ping") {
            return NextResponse.json({ message: "Pong" }, { status: 200 });
        }

        if (event === "push") {
            const repository = body.repository;
            if (!repository?.id || !repository.name || !repository.owner?.login) {
                return NextResponse.json({ error: "Invalid repository payload" }, { status: 400 });
            }

            if (!isDefaultBranchPush(body.ref, repository.default_branch, body.deleted)) {
                return NextResponse.json({ message: "Non-default-branch push ignored" }, { status: 202 });
            }

            if (!body.after || !/^[a-f0-9]{40}$/i.test(body.after)) {
                return NextResponse.json({ error: "Invalid push commit" }, { status: 400 });
            }

            const connections = await prisma.repository.findMany({
                where: { githubId: BigInt(repository.id) },
                select: { id: true, userId: true },
            });

            const deliveryId = req.headers.get("x-github-delivery") ?? randomUUID();
            await Promise.all(connections.map((connection) =>
                inngest.send({
                    id: `${deliveryId}:${connection.id}`,
                    name: "repository.sync",
                    data: {
                        owner: repository.owner!.login!,
                        repo: repository.name!,
                        userId: connection.userId,
                        commitSha: body.after,
                    },
                })
            ));

            return NextResponse.json({ message: "Repository sync queued" }, { status: 202 });
        }

        if (event === "pull_request") {
            const reviewableActions = new Set(["opened", "reopened", "synchronize", "ready_for_review"]);
            if (!body.action || !reviewableActions.has(body.action)) {
                return NextResponse.json({ message: "Pull request action ignored" }, { status: 202 });
            }

            const repository = body.repository;
            const pullRequest = body.pull_request;
            if (
                !repository?.id ||
                !repository.name ||
                !repository.owner?.login ||
                !pullRequest?.id ||
                !pullRequest.number ||
                !pullRequest.title ||
                !pullRequest.html_url ||
                !pullRequest.head?.sha
            ) {
                return NextResponse.json({ error: "Invalid pull request payload" }, { status: 400 });
            }

            if (pullRequest.draft && body.action !== "ready_for_review") {
                return NextResponse.json({ message: "Draft pull request ignored" }, { status: 202 });
            }

            const connections = await prisma.repository.findMany({
                where: { githubId: BigInt(repository.id) },
                select: { id: true, userId: true },
            });
            const deliveryId = req.headers.get("x-github-delivery") ?? randomUUID();

            await Promise.all(connections.map(async (connection) => {
                const review = await prisma.review.upsert({
                    where: {
                        repositoryId_githubPullRequestId_headSha: {
                            repositoryId: connection.id,
                            githubPullRequestId: BigInt(pullRequest.id!),
                            headSha: pullRequest.head!.sha!,
                        },
                    },
                    create: {
                        repositoryId: connection.id,
                        githubPullRequestId: BigInt(pullRequest.id!),
                        pullRequestNumber: pullRequest.number!,
                        title: pullRequest.title!,
                        author: pullRequest.user?.login,
                        url: pullRequest.html_url!,
                        headSha: pullRequest.head!.sha!,
                        baseSha: pullRequest.base?.sha,
                    },
                    update: {
                        title: pullRequest.title!,
                        author: pullRequest.user?.login,
                        url: pullRequest.html_url!,
                        baseSha: pullRequest.base?.sha,
                        status: "QUEUED",
                        error: null,
                    },
                    select: { id: true },
                });

                await inngest.send({
                    id: `${deliveryId}:${connection.id}:review`,
                    name: "pull-request.review.requested",
                    data: {
                        reviewId: review.id,
                        userId: connection.userId,
                        owner: repository.owner!.login!,
                        repo: repository.name!,
                        pullRequestNumber: pullRequest.number!,
                    },
                });
            }));

            return NextResponse.json({
                message: "Pull request review queued",
                connections: connections.length,
            }, { status: 202 });
        }

        return NextResponse.json({ message: "Event accepted", event, action: body.action }, { status: 202 });
    } catch (error) {
        console.error("Error Processing webhook", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
