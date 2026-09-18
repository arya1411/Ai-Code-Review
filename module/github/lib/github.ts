"use server"

import {Octokit} from "octokit"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { env } from "@/lib/env"
import { isIndexableRepositoryFile, isProbablyBinaryContent } from "@/module/github/lib/repository-files"



export const getGithubToken = async() => {
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        throw new Error("Unauthorized");
    }
    
    const account = await prisma.account.findFirst({
        where:{
            userId:session.user.id,
            providerId:"github"
        }
    })

    if(!account?.accessToken){
        throw new Error("No Github access Token Found")
    }

    return account.accessToken
}



interface ContributionData {
    user: {
        contributionsCollection: {
            contributionCalendar: {
                totalContributions: number;
                weeks: {
                    contributionDays: {
                        contributionCount: number;
                        date: string;
                        color: string;
                    }[];
                }[];
            };
        };
    };
}

export async function fetchUserContribution(
    token: string,
    username: string
): Promise<ContributionData["user"]["contributionsCollection"]["contributionCalendar"] | undefined> {
    const octokit = new Octokit({auth:token});

    // Calculate date range: Current year only (Jan 1 to today)
    const today = new Date();
    const currentYear = today.getFullYear();
    const fromDate = `${currentYear}-01-01`;
    const toDate = today.toISOString().split('T')[0];

    const query = `
    query($username:String!, $from:DateTime!, $to:DateTime!){
    user(login:$username){
    contributionsCollection(from:$from, to:$to){
    contributionCalendar{
    totalContributions
    weeks{
    contributionDays{
    contributionCount date color}}}}}}
    `

    try {
        const response: ContributionData = await octokit.graphql(query, {
            username,
            from: fromDate + "T00:00:00Z",
            to: toDate + "T23:59:59Z"
        })

        return response.user.contributionsCollection.contributionCalendar
    } catch(error){
        console.error("Error fetching contribution collection:", error);
    }
}


export const getRepositories  = async (page:number = 1, perPage: number= 10 ) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth : token});


    const {data} = await octokit.rest.repos.listForAuthenticatedUser({
        sort:"updated",
        direction:"desc",
        visibility:"all",
        per_page:perPage,
        page:page
    })

    return data;
}


export async function getMonthlyActivity(){
    try {
        const session = await auth.api.getSession({
            headers : await headers(),
        })

        if(!session?.user){
            throw new Error("UnAthorized");
        }

        const token = await getGithubToken();
        const octokit = new Octokit({auth : token});

        const {data : user} = await octokit.rest.users.getAuthenticated();

        const calender = await fetchUserContribution(token, user.login)

        if(!calender){
            return [];
        }

        const monthlyData :{
            [key : string] : {contributions : number; prs: number}
        } = {}

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const now = new Date();
        for(let i = 5; i >= 0; i--){
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = monthNames[date.getMonth()];
            monthlyData[monthKey] = {contributions: 0, prs: 0};
        }

        calender.weeks.forEach((week) => {
            week.contributionDays.forEach((day) => {
                const date = new Date(day.date);
                const monthKey = monthNames[date.getMonth()];
                if(monthlyData[monthKey]){
                    monthlyData[monthKey].contributions += day.contributionCount;
                }
            })
        })

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const {data : prs} = await octokit.rest.search.issuesAndPullRequests({
            q : `author:${user.login} type:pr created:>${sixMonthsAgo.toISOString().split("T")[0]}`,
            per_page : 100,
        });

        prs.items.forEach((pr) => {
            const date = new Date(pr.created_at);
            const monthKey = monthNames[date.getMonth()];
            if(monthlyData[monthKey]){
                monthlyData[monthKey].prs += 1;
            }
        });

        return Object.keys(monthlyData).map((name) => ({
            name,
            ...monthlyData[name]
        }))

    } catch {
        return [];
    }
}


const getWebhookUrl = () => {
    const baseUrl = env.APP_BASE_URL ?? env.NEXT_PUBLIC_APP_BASE_URL!;

    return `${baseUrl.replace(/\/$/, "")}/api/webhooks/github`;
}

const getWebhookSecret = () => {
    return env.GITHUB_WEBHOOK_SECRET;
}

export const createWebHook = async (owner : string , repo : string, expectedGithubId?: number) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth : token});
    const webhookurl = getWebhookUrl();
    const webhookSecret = getWebhookSecret();

    const { data: repository } = await octokit.rest.repos.get({ owner, repo });
    if (expectedGithubId !== undefined && repository.id !== expectedGithubId) {
        throw new Error("Repository identity does not match the selected GitHub repository");
    }

    const {data: hooks}  = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    })

    const existingHook = hooks.find(hook => hook.config.url === webhookurl);

    if(existingHook){
        const { data } = await octokit.rest.repos.updateWebhook({
            owner,
            repo,
            hook_id: existingHook.id,
            active: true,
            events: ["pull_request", "push"],
            config: {
                url: webhookurl,
                content_type: "json",
                secret: webhookSecret,
            },
        });

        return { hook: data, created: false };
    }

    const {data} = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config:{
            url : webhookurl,
            content_type : "json",
            secret: webhookSecret,
        },
        events:["pull_request", "push"]
    });

    return { hook: data, created: true };
}


export const deleteWebhook = async (owner : string , repo : string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth: token});

    const webhookUrl = getWebhookUrl();
    const {data : hooks} = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    });

    const hooktoDelete = hooks.find(hook => hook.config.url === webhookUrl);

    if(hooktoDelete){
        await octokit.rest.repos.deleteWebhook({
            owner,
            repo,
            hook_id : hooktoDelete.id
        })

        return true;
    }

    return false;

}

const MAX_REPOSITORY_FILES = 100;
const FILE_FETCH_CONCURRENCY = 10;

export interface RepositorySnapshot {
    files: { path: string; content: string }[];
    commitSha: string | null;
}

export const getRepoSnapshot = async (
    token: string,
    owner: string,
    repo: string,
    requestedCommitSha?: string,
): Promise<RepositorySnapshot> => {
    const octokit = new Octokit({ auth: token });
    try {
        const { data: repoInfo } = await octokit.rest.repos.get({
            owner,
            repo,
        });

        const defaultBranch = repoInfo.default_branch;

        const commitSha = requestedCommitSha ?? (
            await octokit.rest.repos.getBranch({ owner, repo, branch: defaultBranch })
        ).data.commit.sha;

        const { data: treeData } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: commitSha,
            recursive: "true",
        });

        const files: { path: string; content: string }[] = [];
        const filteredItems = treeData.tree
            .filter(isIndexableRepositoryFile)
            .slice(0, MAX_REPOSITORY_FILES);

        for (let offset = 0; offset < filteredItems.length; offset += FILE_FETCH_CONCURRENCY) {
            const batch = filteredItems.slice(offset, offset + FILE_FETCH_CONCURRENCY);
            const results = await Promise.allSettled(batch.map(async (item) => {
                const { data } = await octokit.rest.git.getBlob({
                    owner,
                    repo,
                    file_sha: item.sha!,
                });
                const content = Buffer.from(data.content, "base64");
                if (isProbablyBinaryContent(content)) return null;

                return {
                    path: item.path!,
                    content: content.toString("utf-8"),
                };
            }));

            for (const result of results) {
                if (result.status === "fulfilled") {
                    if (result.value) files.push(result.value);
                } else {
                    console.error("Error fetching repository file:", result.reason);
                }
            }
        }

        return { files, commitSha };
    } catch (error) {
        console.error("Error getting repository file content:", error);
        throw error;
    }
}

export const getRepoFileContent = async (token: string, owner: string, repo: string) => {
    return (await getRepoSnapshot(token, owner, repo)).files;
}
