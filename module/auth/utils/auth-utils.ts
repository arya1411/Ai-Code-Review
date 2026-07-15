"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const getOptionalSession = async () => {
    return auth.api.getSession({
        headers: await headers()
    })
}

export const requireAuth = async () => {
    const session = await getOptionalSession()

    if (!session) {
        redirect("/login")
    }

    return session
}

export const requireUnAuth = async () => {
    const session = await getOptionalSession()

    if (session) {
        redirect("/dashboard")
    }

    return session
}