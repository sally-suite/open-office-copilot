import { NextRequest, NextResponse } from "next/server";
import { search, searchNews } from '@/service/search';
export const maxDuration = 60;
export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''
  if (version == 'free') {
    return NextResponse.json({ code: -1, data: "", message: 'Sorry~ The current version does not support this tool.' });
  }
  // 1:search pages,2:search news
  const { keyword, type = 1 } = await request.json();
  if (!keyword) {
    return NextResponse.json({ code: -1, data: "", message: 'Please input keyword' });
  }
  const result = await search(keyword);
  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: NextRequest) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword');
  if (!keyword) {
    return NextResponse.json({ code: -1, data: "", message: 'Please input keyword' });
  }
  const result = await search(keyword);
  return NextResponse.json({ code: 0, data: result, message: "" });
}
