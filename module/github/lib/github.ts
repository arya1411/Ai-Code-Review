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



export async function fetchUserContribution(token:string , username:string){
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

    interface contributindata {
        user:{
            contributionsCollection :{
                contributionCalendar :{
                    totalContributions : number ,
                    weeks :{
                        contributionDays :{
                            contributionCount : number , date :string 
                            | Date , color : string
                        }[]
                    }[]
                }
            }
        }
    }
    try {
        const response:contributindata = await octokit.graphql(query , {
            username
        })

        return response.user.contributionsCollection.contributionCalendar
    } catch(error){
        console.error("Error fetching contribution collection:", error);
    }
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

        calender.weeks.forEach((week:any) => {
            week.contributindata.forEach((day : any) => {
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
    } catch (error){

    }
}