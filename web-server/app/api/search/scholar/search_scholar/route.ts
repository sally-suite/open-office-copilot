import type { NextApiRequest, NextApiResponse } from 'next'
// import SerpApi from 'google-search-results-nodejs'
import { getJson } from "serpapi";

import { NextRequest, NextResponse } from 'next/server'
import { SERPAPI_API_KEY } from '@/constants/search';
import { searchPapers } from '@/service/search';

// const search = new SerpApi(process.env.SERPAPI_API_KEY)

export const maxDuration = 60;
export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''
  if (version == 'free') {
    return NextResponse.json({ code: -1, data: "", message: 'Sorry~ The current version does not support this tool.' });
  }
  const { keyword } = await request.json();

  if (!keyword) {
    return NextResponse.json({ code: 0, data: '', message: "" });
  }

  try {

    const results = await searchPapers(keyword);
    return NextResponse.json({ code: 0, data: results, message: "" })
  } catch (error) {
    console.error('Error searching papers:', error)
    return NextResponse.json({ code: 1, data: '', message: "Error searching papers" })
  }
}

export async function GET(req: NextRequest) {

  return NextResponse.json({ code: 0, data: '', message: "" })
}