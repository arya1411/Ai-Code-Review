import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL
})

const prismaClientSingleton = () => {
    return new PrismaClient({adapter})
}

declare const globalThis : {
    prismaGlobal:ReturnType<typeof prismaClientSingleton>;
} & typeof global;


const prisma = globalThis.prismaGlobal || prismaClientSingleton();

if(process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
