import { NextResponse , NextRequest } from "next/server";

export async function POST(req : NextRequest){
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event");
        console.log(`Recived Github Event ${event}`);


        if(event === "ping"){
                return NextResponse.json({message : "Pong"} , {status : 200})
        }

        return NextResponse.json({message : "Event Process"} ,{status : 200})
    } catch (error){
        console.error("Error Processing webhook" , error);
        return NextResponse.json({error :  "Internal Server Error"} , {status : 500});

    }
}