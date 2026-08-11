"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

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

        if(!session?.user){
            throw new Error("Unauthorized");
        }

        const updateUser = await prisma.user.update({
            where :{
                id: session.user.id
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

        revalidatePath("/settings" , "page");

        return {
            success : true,
            user : updateUser
        }

    } catch(error){
        console.error("Error Updating User profile" , error)
        return { success: false, user: null }
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
                    owner : true,
                    createdAt : true
                }
            })
        return repositories;
    } catch(error){
        console.error("Error in auhtorizing the User", error);
        return [];
    }
}

export async function disconnectRepository(repositoryId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const repository = await prisma.repository.findFirst({
            where: {
                id: repositoryId,
                userId: session.user.id
            }
        })

        if (!repository) {
            throw new Error("Repository not found or access denied");
        }

        const { deleteWebhook } = await import("@/module/github/lib/github");
        await deleteWebhook(repository.owner, repository.name);

        await prisma.repository.delete({
            where: { id: repositoryId }
        })

        revalidatePath("/settings", "page");

        return { success: true };
    } catch (error) {
        console.error("Error disconnecting repository:", error);
        return { success: false };
    }
}