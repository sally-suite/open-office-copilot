import { NextResponse } from "next/server";
import { embeddings as embeddingsAzure } from '@/llm/embeddings_azure'
export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''

  const body = await request.json();
  const { input, model } = body;

  const result = await embeddingsAzure(input);

  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
