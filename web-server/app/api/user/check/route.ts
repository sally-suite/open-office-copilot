/**
 * use in google app script
 */

import { NextResponse } from "next/server";
import { getAccessToken } from "@/service/auth";
import { regist } from "@/service/user";

// import UserPoint from "@/models/user_points";

export async function POST(req: Request) {

    const { email } = await req.json();
    await regist(email);
    const token = await getAccessToken(email)
    return NextResponse.json({
        code: 0, data: token
    });
}
