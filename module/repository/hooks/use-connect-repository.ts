"use client"

import {useMutation , useQueryClient} from "@tanstack/react-query"
import { connectRepository, reindexRepository } from ".."
import {toast} from 'sonner'

interface UseConnectRepositoryOptions {
    onSuccess?: () => void
    onError?: () => void
}

export const useConnectRepository = (options?: UseConnectRepositoryOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:async({owner , repo , githubId} : {owner : string , repo : string , githubId : number}) => {
            return await connectRepository(owner , repo , githubId);
        },
        onSuccess:() =>{
            toast.success("Repository successfully Connected");
            queryClient.invalidateQueries({queryKey:[
                "repositories"
            ]})
            options?.onSuccess?.()
        } , 
        onError : (error) => {
            toast.error("Failed to connect Repository")
            console.error(error);
            options?.onError?.()
        },
        
    })
}

export const useReindexRepository = (options?: UseConnectRepositoryOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: reindexRepository,
        onSuccess: () => {
            toast.success("Repository indexing queued")
            queryClient.invalidateQueries({ queryKey: ["repositories"] })
            options?.onSuccess?.()
        },
        onError: (error) => {
            toast.error("Failed to queue repository indexing")
            console.error(error)
            options?.onError?.()
        },
    })
}
