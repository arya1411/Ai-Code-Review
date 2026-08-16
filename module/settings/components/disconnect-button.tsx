"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Unplug } from "lucide-react"
import { disconnectRepository } from "@/module/settings"

interface DisconnectButtonProps {
    repositoryId: string
    repositoryName: string
}

export function DisconnectButton({ repositoryId, repositoryName }: DisconnectButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDisconnect = async () => {
        setIsLoading(true)
        const result = await disconnectRepository(repositoryId)
        setIsLoading(false)

        if (result.success) {
            toast.success(`${repositoryName} disconnected successfully`)
        } else {
            toast.error(`Failed to disconnect ${repositoryName}`)
        }
    }

    return (
        <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
            {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
            ) : (
                <Unplug className="size-3.5" />
            )}
            {isLoading ? "Disconnecting..." : "Disconnect"}
        </button>
    )
}
