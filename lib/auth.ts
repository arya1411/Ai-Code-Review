import {betterAuth} from "better-auth"
import {prismaAdapter}  from "better-auth/adapters/prisma";
import prisma from "./db";
import { env } from "./env";


export const auth = betterAuth({
    database:prismaAdapter(prisma , {
        provider : "postgresql",
    }),
    socialProviders:{
        github:{
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            scope:["repo"]
        }
    },
    trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
        ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
        : [],
});
