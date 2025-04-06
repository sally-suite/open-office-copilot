/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import { checkAccesskey } from "@/service/access";
import { getAccessToken } from "@/service/auth";

export async function POST(req: Request) {
    const { licenseKey } = await req.json();
    const { valid, data, message } = await checkAccesskey(licenseKey)
    if (!valid) {
        return NextResponse.json({ code: 401, data: '', message }, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }

    const email = data.email;
    const token = await getAccessToken(email);
    const key = token.key
    return NextResponse.json({ code: 0, data: key, message: "" }, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });

}

export async function GET(req: Request) {
    console.log(req.method)

    return NextResponse.json({ code: 0, data: '', message: "" });
}
