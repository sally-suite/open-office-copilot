import { SERPAPI_API_KEY } from '@/constants/search';
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import { getJson } from "serpapi";

export const maxDuration = 60;
export async function POST(request: Request) {
    const email: string = request.headers.get('email') || ''
    const version: string = request.headers.get('version') || ''
    if (version == 'free') {
        return NextResponse.json({ code: -1, data: "", message: 'Sorry~ The current version does not support this tool.' });
    }
    const { cites_id } = await request.json();

    if (!cites_id) {
        return NextResponse.json({ code: 0, data: '', message: "" });
    }

    try {
        const params = {
            api_key: SERPAPI_API_KEY,
            engine: "google_scholar_cite",
            q: cites_id,
            num: 10
        }

        // const results = await new Promise((resolve, reject) => {
        //     search.json(params, (data: any) => {
        //         const { citations, links } = data;
        //         resolve({ citations, links })
        //     })
        // })
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