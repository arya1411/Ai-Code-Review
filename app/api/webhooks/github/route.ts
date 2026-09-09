import { NextResponse, NextRequest } from "next/server";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

interface GithubRepositoryPayload {
    id?: number;
    name?: string;
    owner?: { login?: string };
}

interface GithubWebhookPayload {
    action?: string;
    repository?: GithubRepositoryPayload;
}

async function verifyGithubSignature(req: NextRequest, rawBody: string): Promise<boolean> {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        return false;
    }

    const signature = req.headers.get("x-hub-signature-256");
    if (!signature) return false;

    if (!signature.startsWith("sha256=")) return false;

    const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "hex");
    const received = Buffer.from(signature.slice("sha256=".length), "hex");

    try {
        return received.length === expected.length && timingSafeEqual(received, expected);
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();

        const isValid = await verifyGithubSignature(req, rawBody);
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
                    },
                })
            ));

            return NextResponse.json({ message: "Repository sync queued" }, { status: 202 });
        }

        return NextResponse.json({ message: "Event accepted", event, action: body.action }, { status: 202 });
    } catch (error) {
        console.error("Error Processing webhook", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
