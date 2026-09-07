import { NextResponse, NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

async function verifyGithubSignature(req: NextRequest, rawBody: string): Promise<boolean> {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        // No secret configured — skip verification in dev, block in production
        if (process.env.NODE_ENV === "production") return false;
        return true;
    }

    const signature = req.headers.get("x-hub-signature-256");
    if (!signature) return false;

    const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;

    try {
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
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

        const body = JSON.parse(rawBody);
        const event = req.headers.get("x-github-event");
        console.log(`Received Github Event ${event}`, body?.action ?? "");

        if (event === "ping") {
            return NextResponse.json({ message: "Pong" }, { status: 200 });
        }

        return NextResponse.json({ message: "Event Processed" }, { status: 200 });
    } catch (error) {
        console.error("Error Processing webhook", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
