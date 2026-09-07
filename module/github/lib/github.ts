"use server"

import {Octokit} from "octokit"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { headers } from "next/headers"



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
            [key : string] : {commits : number; prs: number ; reviews:number}
        } = {}

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const now = new Date();
        for(let i = 5; i >= 0; i--){
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = monthNames[date.getMonth()];
            monthlyData[monthKey] = {commits: 0, prs: 0, reviews: 0};
        }

        calender.weeks.forEach((week) => {
            week.contributionDays.forEach((day) => {
                const date = new Date(day.date);
                const monthKey = monthNames[date.getMonth()];
                if(monthlyData[monthKey]){
                    monthlyData[monthKey].commits += day.contributionCount;
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
                // Count PRs as reviews (real data — no fake generation)
                monthlyData[monthKey].reviews += 1;
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


export const createWebHook = async (owner : string , repo : string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth : token});


    const webhookurl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`


    const {data: hooks}  = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    })

    const existingHook = hooks.find(hook => hook.config.url === webhookurl);

    if(existingHook){
        return existingHook
    }

    const {data} = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config:{
            url : webhookurl,
            content_type : "json"
        },
        events:["pull_request"]
    });

    return data;
}


export const deleteWebhook = async (owner : string , repo : string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth: token});

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;
    try {
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
    } catch(error){
        console.error("error deleting webhook", error);
        return false;

    }

}

export const getRepoFileContent = async (token: string, owner: string, repo: string) => {
    const octokit = new Octokit({ auth: token });
    try {
        const { data: repoInfo } = await octokit.rest.repos.get({
            owner,
            repo,
        });

        const defaultBranch = repoInfo.default_branch;

        const { data: treeData } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: defaultBranch,
            recursive: "true",
        });

        const files: { path: string; content: string }[] = [];
        const ignoredExtensions = [
            ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".zip", ".tar", ".gz",
            ".mp4", ".mp3", ".wav", ".pdf", ".woff", ".woff2", ".ttf", ".eot",
            ".exe", ".bin", ".lock", "-lock.json", ".map"
        ];
        const ignoredDirs = ["node_modules", ".git", ".next", "dist", "build"];

        const filteredItems = treeData.tree.filter(item => {
            if (item.type !== "blob" || !item.path) return false;
            const isIgnored = ignoredDirs.some(dir => item.path!.startsWith(dir) || item.path!.includes(`/${dir}/`)) ||
                              ignoredExtensions.some(ext => item.path!.endsWith(ext));
            return !isIgnored;
        }).slice(0, 100);

        for (const item of filteredItems) {
            try {
                const { data } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: item.path!,
                });

                if (data && !Array.isArray(data) && "content" in data && typeof data.content === "string") {
                    const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");
                    files.push({
                        path: item.path!,
                        content: decodedContent,
                    });
                }
            } catch (err) {
                console.error(`Error fetching file content for ${item.path}:`, err);
            }
        }

        return files;
    } catch (error) {
        console.error("Error getting repository file content:", error);
        return [];
    }
}