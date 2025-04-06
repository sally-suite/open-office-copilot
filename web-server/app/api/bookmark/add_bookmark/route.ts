import { NextResponse } from "next/server";
import bookmarks from "@/models/bookmarks";

export async function POST(req: Request) {
  const email: string = req.headers.get('email') || ''

  const body = await req.json();
  const {
    name,
    description,
    data,
    type,
    agent
  } = body;

  const bookmark = await bookmarks.create({
    name,
    description,
    email,
    data,
    type,
    agent,
  });

  return NextResponse.json({ code: 0, data: bookmark, message: "" });
}

export async function GET(request: Request) {

  return NextResponse.json({ code: 0, data: null, message: "" });
}
