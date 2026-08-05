"use client"

import {useMutation , useQueryClient} from "@tanstack/react-query"
import { connectRepository } from ".."
import {toast} from 'sonner'
import { number } from "zod"



export const useConnectRepository = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:async({owner , repo , githubId} : {owner : string , repo : string , githubId : number}) => {
            return await connectRepository(owner , repo , githubId);
        },
        onSuccess:() =>{
            toast.success("Repository successfully Connected"),
            queryClient.invalidateQueries({queryKey:[
                "repositories"
            ]})
        } , 
        onError : (error) => {
            toast.error("Failed to connect Repository")
            console.error(error);
        },
        
    })
}