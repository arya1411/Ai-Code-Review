"use server"

import {
    fetchUserContribution , getGithubToken
} from "@/module/github/lib/github"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Octokit } from "octokit"


export async function getDashboardStats(){
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if(!session?.user){
            throw new Error("UnAuthorized");
        }

        const token = await getGithubToken()
        const octokit = new Octokit({auth:token})


        const {data :user } = await octokit.rest.users.getAuthenticated()


        const totalRepos = 30;

        const calender = await fetchUserContribution(token , user.login);
        const totalCommits = calender?.totalContributions || 0

        const {data:prs} = await octokit.rest.search.issuesAndPullRequests({
            q:`author:${user.login} type:pr`,
            per_page:1
        })

        const totalPrs = prs.total_count

        return {
            totalRepos,
            totalCommits,
            totalPrs
        }
        
    } catch(error){
        console.error("Error fetching dashboard stats:", error);
        return {
            totalRepos: 0,
            totalCommits: 0,
            totalPrs: 0
        }
    }
    
}