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

    const query = `
    query($username:String!){
    user(login:$username){
    contributionsCollection{
    contributionCalendar{
    totalContributions
    weeks{
    contributionDays{
    contributionCount date color}}}}}}
    `

    try {
        const response: ContributionData = await octokit.graphql(query, {
            username
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

        const calender = await fetchUserContribution(token  ,user.login)


        if(!calender){
            return [];
        }

        const monthlyData :{
            [key : string] : {commits : number; prs: number ; reviews:number}
        } = {}


        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Julu",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];


        const now = new Date();
        for(let i =  5; i >= 0; i --){
            const date = new Date(now.getFullYear() , now.getMonth() - i , 1);
            const monthKey  = monthNames[date.getMonth()];
            monthlyData[monthKey]  = {commits : 0 , prs : 0 , reviews : 0}; 
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
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6 );


const generateSampleReview = () => {
            const sampleReview = [];
            const now = new Date();


            for(let i = 0; i < 45 ; i++){
                const randomDaysAgo = Math.floor(Math.random() * 180);
                const reviewDate = new Date (now);
                reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);


                sampleReview.push({
                    createdAt : reviewDate,
                });
            }

            return sampleReview;
 };

const reviews = generateSampleReview();


reviews.forEach((review) => {
    const monthKey = monthNames[review.createdAt.getMonth()];
    if(monthlyData[monthKey]){
        monthlyData[monthKey].reviews += 1;
    }
})


const {data : prs} = await octokit.rest.search.issuesAndPullRequests({
    q : `author:${user.login} type:pr created : >${
        sixMonthsAgo.toISOString().split("T")[0]
    }`,
    per_page : 100,
});

    prs.items.forEach((pr) => {
        const date = new Date(pr.created_at);
        const monthkey = monthNames[date.getMonth()];
        if(monthlyData[monthkey]){
            monthlyData[monthkey].prs += 1;
        }
    });


    return Object.keys(monthlyData).map((name)=> ({
        name ,
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