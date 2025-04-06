/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/constants/auth";

export async function GET(req: Request) {
    const cook = await cookies();
    const val = await cook.get(COOKIE_NAME)?.value;
    return new NextResponse(val, { status: 200 })
}
