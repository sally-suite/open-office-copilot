
import { NextResponse } from "next/server";
import accessKey from '@/models/access_key'


export async function POST(req: Request) {
    const body = await req.json();
    const {
        email,
    } = body;
    const result = await accessKey.findOne({
        where: {
            email
        }
    })
    return NextResponse.json({ code: 0, data: !!result, message: "" });
}
