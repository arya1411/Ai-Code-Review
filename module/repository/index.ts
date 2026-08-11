"use server"

import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createWebHook, getRepositories } from "../github/lib/github"

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
        const webhook = await createWebHook(owner, repo);

        if(!webhook){
            throw new Error("Failed to create webhook for repository");
        }

        await prisma.repository.create({
            data :{
                githubId:BigInt(githubId),
                name:repo,
                owner,
                fullName :`${owner}/${repo}`,
                url : `https://github.com/${owner}/${repo}`,
                userId : session.user.id
            }
        })

        return webhook;
    } catch(error) {
        console.error("Error connecting repository:", error);
        throw error;
    }
}
