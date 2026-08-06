"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveVariant } from "motion/react"
import { success } from "zod"
import { userAgent } from "next/server"

export async function getUserProfile(){
    try {
        const session = await auth.api.getSession({
            headers : await headers()
        })

        if(!session?.user){
            throw new Error("UnAthorized");
        }


        const user = await prisma.user.findUnique({
            where :{
                id : session.user.id,
            },
            select :{
                id : true,
                name : true ,
                email : true,
                image : true,
                createdAt : true,
            }
        })

        return user

    } catch (error) {
        console.error("Error Fetching user profile" , error)
        return null        
    }
}


export async function updateUserProfile(data: { name?: string , email?: string}) {
    try {
        const session = await auth.api.getSession({
            headers : await headers()
        })

        const updateUser = await prisma.user.update({
            where :{
                id: session?.user.id
            },
            data : {
                name : data.name,
                email : data.email,
            },
            select :{
                id : true,
                name : true,
                email : true
            }
        });

        revalidatePath("/dashboard/setting" , "page");


        return {
            success : true,
            user : updateUser
        }

        
    } catch(error){
        console.error("Error Updating User profile" , error)
    }  
}

export async function getConnectedRepositories(){
    try {
        const session = await auth.api.getSession({
            headers : await headers()
        })

        if(!session?.user){
            throw new Error("Unathorized");
        }


        const repositories = await prisma.repository.findMany({
            where:{userId:session.user.id},
                select :{
                    id : true,
                    name : true,
                    fullName :true,
                    url : true,
                    createdAt : true
                }
            })
    } catch(error){
        console.error("Error in auhtorizing the User");
    }

    
}