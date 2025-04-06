import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const { url } = await request.json();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch image');
  }
  const res = new Response(response.body);;
  // Set appropriate headers for the response
  // res.headers.set('Content-Type', response.headers.get('content-type'));
  // res.headers.set('Content-Length', response.headers.get('content-length'));
  return res;
}

export async function GET(request: Request) {

  return NextResponse.json({ code: 0, data: null, message: "" });
}
