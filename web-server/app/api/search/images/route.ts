import { NextRequest, NextResponse } from "next/server";
import { search, searchImages } from '@/service/search'
export const maxDuration = 60;
export async function POST(request: Request) {

  const { keyword, num = 5 } = await request.json();
  if (!keyword) {
    return NextResponse.json({ code: -1, data: "", message: 'Please input keyword' });
  }
  const images = await searchImages(keyword, num);
  return NextResponse.json({ code: 0, data: images || [], message: "" });
}

export async function GET(request: NextRequest) {

  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword');
  const num = Number(searchParams.get('num') || 3);
  if (!keyword) {
    return NextResponse.json({ code: -1, data: "", message: 'Please input keyword' });
  }
  const images = await searchImages(keyword, num);
  return NextResponse.json({ code: 0, data: images || [], message: "" });
}
