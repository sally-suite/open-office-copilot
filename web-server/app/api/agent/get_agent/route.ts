/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import agents from "@/models/agents";

export async function POST(req: Request) {
    // const list = await user.findAll();
    const userEmail: string = req.headers.get('user-email') || req.headers.get('email') || ''
    const body = await req.json();
    const { id } = body;
    const item = await agents.findOne({
        where: {
            id: id,
            owner: userEmail
        }
    })

    return NextResponse.json({ code: 0, data: item, message: "" });
}

export async function GET(request: Request) {
    return NextResponse.json({ code: 0, data: "", message: "" });
}
