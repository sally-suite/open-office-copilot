import { NextResponse } from "next/server";
import { IChatRequest } from "@/types/chat";
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from "ai";
export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''

  const body = await request.json();
  const { messages, model = 'gpt-3.5-turbo', functions, tools, temperature, max_tokens, stream, ...rest
  } = body as IChatRequest;
  console.log(body)
  // Create an OpenAI API client (that's edge friendly!)
  const openai = new OpenAI({
    apiKey: "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",
    baseURL: "https://api.openai.com"
  });

  const response = await openai.chat.completions.create({
    model,
    stream,
    messages: messages as any,
    tools,
    temperature,
    max_tokens
  });

  // Convert the response into a friendly text-stream
  const openStream = OpenAIStream(response as any);
  // Respond with the stream
  return new StreamingTextResponse(openStream);
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
