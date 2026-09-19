"use server"

import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createWebHook, deleteWebhook, getRepositories } from "../github/lib/github"
import { inngest } from "@/inngest/client"
import { revalidatePath } from "next/cache"
import { expireStaleRepositoryIndexes } from "./lib/index-status"

export const fetchRepositories = async(page:number = 1 , perPage:number = 10) => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("UnAthorized")
    }

    await expireStaleRepositoryIndexes(session.user.id)

    const githubRepos = await getRepositories(page , perPage)

    const dbRepos = await prisma.repository.findMany({
        where: {
            userId : session.user.id
        }
    });


    const connectedRepos = new Map(dbRepos.map((repo) => [Number(repo.githubId), repo]))

    return githubRepos.map((repo : Record<string, unknown> & { id: number | string }) => {
        const connectedRepository = connectedRepos.get(Number(repo.id))
        return {
            ...repo,
            isConnected: Boolean(connectedRepository),
            connectedRepositoryId: connectedRepository?.id,
            indexStatus: connectedRepository?.indexStatus,
        }
    })
 
}

export const reindexRepository = async (repositoryId: string) => {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error("Unauthorized")

    const repository = await prisma.repository.findFirst({
        where: { id: repositoryId, userId: session.user.id },
        select: { id: true, owner: true, name: true },
    })

    if (!repository) throw new Error("Repository not found or access denied")

    await prisma.repository.update({
        where: { id: repository.id },
        data: { indexStatus: "INDEXING", indexError: null },
    })

    try {
        await inngest.send({
            name: "repository.sync",
            data: {
                owner: repository.owner,
                repo: repository.name,
                userId: session.user.id,
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not queue repository indexing"
        await prisma.repository.update({
            where: { id: repository.id },
            data: { indexStatus: "FAILED", indexError: message.slice(0, 500) },
        })
        throw error
    }

    revalidatePath("/repositories")
    revalidatePath("/dashboard/chat")
    return { success: true }
}


export const connectRepository = async(owner : string , repo : string , githubId : number) => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("Unathorized");
    }

    try {
        const existingRepository = await prisma.repository.findFirst({
            where: {
                githubId: BigInt(githubId),
                userId: session.user.id,
            },
        });

        const webhook = await createWebHook(owner, repo, githubId);

        if(!webhook){
            throw new Error("Failed to create webhook for repository");
        }

        if (existingRepository) {
            return { webhook: webhook.hook, alreadyConnected: true };
        }

        let connectedRepository;
        try {
            connectedRepository = await prisma.repository.create({
                data :{
                    githubId:BigInt(githubId),
                    name:repo,
                    owner,
                    fullName :`${owner}/${repo}`,
                    url : `https://github.com/${owner}/${repo}`,
                    userId : session.user.id
                }
            })
        } catch (dbError) {
            // DB write failed — roll back the webhook we just created on GitHub
            const repositoryReferences = await prisma.repository.count({
                where: { githubId: BigInt(githubId) },
            });

            if (webhook.created && repositoryReferences === 0) {
                await deleteWebhook(owner, repo).catch((e) =>
                    console.error("Webhook rollback failed:", e)
                );
            }
            throw dbError;
        }

        try {
            await inngest.send({
                name : "repository.connected",
                data : {
                    owner ,
                    repo,
                    userId: session.user.id
                }
            })
        } catch (eventError) {
            await prisma.repository.delete({ where: { id: connectedRepository.id } });

            const repositoryReferences = await prisma.repository.count({
                where: { githubId: BigInt(githubId) },
            });
            if (webhook.created && repositoryReferences === 0) {
                await deleteWebhook(owner, repo).catch((e) =>
                    console.error("Webhook rollback failed:", e)
                );
            }

            throw eventError;
        }

        return { webhook: webhook.hook, alreadyConnected: false };
    } catch(error) {
        console.error("Error connecting repository:", error);
        throw error;
    }
}

export interface ConnectedRepo {
    id: string
    name: string
    owner: string
    fullName: string
    url: string
    indexStatus: "NOT_INDEXED" | "INDEXING" | "READY" | "FAILED"
    indexError: string | null
    indexedAt: Date | null
    createdAt: Date
}

export async function getConnectedRepositories(): Promise<ConnectedRepo[]> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) throw new Error("Unauthorized")

    await expireStaleRepositoryIndexes(session.user.id)

    const repos = await prisma.repository.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            owner: true,
            fullName: true,
            url: true,
            indexStatus: true,
            indexError: true,
            indexedAt: true,
            createdAt: true,
        },
    })

    return repos
}

