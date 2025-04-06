/**
 * use in office, side
 */

import { NextResponse } from "next/server";
import { getAccessToken } from "@/service/auth";

export async function POST(req: Request) {
    const email: string = req.headers.get('email') || '';
    try {
        const token = await getAccessToken(email);
        return NextResponse.json({
            code: 0, data: token
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({
            code: 0, data: {
                state: 'free',
                email: email,
                order: "",
                version: 'basic',
                interval: 'month',
                exp: (new Date().getTime()) + 100000000000,
            },
            message: e.message
        });
    }

}


export async function GET(request: Request) {
    return NextResponse.json({ code: 0, data: "", message: "" });
}
