import { NextResponse } from "next/server";
import { chat } from "@/llm/chat_azure";
import { IChatRequest } from "@/types/chat";

export async function POST(request: Request) {
  // const body = await request.json();
  // const { audio } = body as IChatRequest;

  return NextResponse.json({ code: 0, data: 'hello', message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
