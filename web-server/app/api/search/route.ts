import { NextRequest, NextResponse } from "next/server";
import { search } from '@/service/search'
export const maxDuration = 60;
export async function POST(request: Request) {
  // const email: string = request.headers.get('email') || ''
  // const version: string = request.headers.get('version') || ''
  const { keyword } = await request.json();
  if (!keyword) {
    return NextResponse.json({ code: -1, data: "", message: 'Please input keyword' });
  }
  const result = await search(keyword);
  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const keyword = searchParams.get('keyword');
  if (!keyword) {
    return NextResponse.json({ code: -1, data: "", message: 'Please input keyword' });
  }
  const result = await search(keyword);
  return NextResponse.json({ code: 0, data: result, message: "" });
}
