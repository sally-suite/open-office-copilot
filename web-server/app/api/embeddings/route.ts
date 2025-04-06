import { NextResponse } from "next/server";
import { embeddings as embeddingsAzure } from '@/llm/embeddings_azure'
import { embeddings as embeddingsGlm } from '@/llm/embeddings_glm'
export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''

  const body = await request.json();
  const { input, model } = body;
  if (model === 'text-embedding-ada-002') {
    const result = await embeddingsAzure(input,);

    if (result.data && result.data.length > 0) {
      return NextResponse.json({ code: 0, data: result.data[0].embedding, message: "" });
    }
  } else if (model === 'embedding-2') {
    const result = await embeddingsGlm(input);

    if (result.data && result.data.length > 0) {
      return NextResponse.json({ code: 0, data: result.data[0].embedding, message: "" });
    }
  }

  return NextResponse.json({ code: 0, data: [], message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
