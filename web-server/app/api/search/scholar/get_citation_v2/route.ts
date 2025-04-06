import { SEARCHAPI_API_KEY } from '@/constants/search';
import { NextRequest, NextResponse } from 'next/server';
import { getJson } from "@/utils/search";

export const maxDuration = 60;
export async function POST(request: Request) {
    const email: string = request.headers.get('email') || ''
    const version: string = request.headers.get('version') || ''

    const { cites_id } = await request.json();

    if (!cites_id) {
        return NextResponse.json({ code: 0, data: '', message: "" });
    }

    try {

        const params = {
            api_key: SEARCHAPI_API_KEY,
            engine: "google_scholar_cite",
            data_cid: cites_id,
            num: 10
        }

        const results = await getJson(params);
        const { citations, links } = results;

        return NextResponse.json({ code: 0, data: { citations, links }, message: "" })
    } catch (error) {
        console.error('Error searching papers:', error)
        return NextResponse.json({ code: 1, data: '', message: "Error searching papers" })
    }
}

export async function GET(req: NextRequest) {

    return NextResponse.json({ code: 0, data: '', message: "" })
}