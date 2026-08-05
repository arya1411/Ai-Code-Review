"use server"

import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Octokit } from "octokit"
import { createWebHook, getRepositories } from "../github/lib/github"
import { Webhook } from "lucide-react"

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


    const connectedRepoIds = new Set(dbRepos.map(repo => repo.githubId))

    return githubRepos.map((repo : any) => ({
        ...repo,
        isConnected:connectedRepoIds.has(BigInt(repo.id))
    }))
 
}


export const connectRepository = async(owner : string , repo : string , githubId : number) => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("Unathorized");
    }

    const webhook = await createWebHook(owner ,repo);

    if(webhook){
        await prisma.repository.create({
            data :{
                githubId:BigInt(githubId),
                name:repo,
                owner,
                fullName :`${owner} / ${repo}`,
                url : `https://github.com/${owner}/${repo}`,
                userId : session.user.id
            }
        })
    }
    return webhook
}
