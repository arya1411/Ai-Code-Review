"use server"

import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createWebHook, deleteWebhook, getRepositories } from "../github/lib/github"
import { inngest } from "@/inngest/client"

export const fetchRepositories = async(page:number = 1 , perPage:number = 10) => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("UnAthorized")
    }


    const githubRepos = await getRepositories(page , perPage)

    const dbRepos = await prisma.repository.findMany({
        where: {
            userId : session.user.id
        }
    });


    const connectedRepoIds = new Set(dbRepos.map(repo => Number(repo.githubId)))

    return githubRepos.map((repo : Record<string, unknown> & { id: number | string }) => ({
        ...repo,
        isConnected:connectedRepoIds.has(Number(repo.id))
    }))
 
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
    createdAt: Date
}

export async function getConnectedRepositories(): Promise<ConnectedRepo[]> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) throw new Error("Unauthorized")

    const repos = await prisma.repository.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            owner: true,
            fullName: true,
            url: true,
            createdAt: true,
        },
    })

    return repos
}

