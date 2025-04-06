import { NextResponse } from "next/server";
import { IChatRequest } from "@/types/chat";
import { chatProxy, chatStreamProxy } from "@/llm/chat_proxy";
import { getModelConfig } from "@/service/model";
import { getOpenaiInstance } from "@/service/openai";

export const maxDuration = 120;
export async function POST(request: Request) {
  const body = await request.json();

  const { agent, messages, model, tools, temperature, max_tokens, stream, response_format, ...rest
  } = body as IChatRequest;
  const config = await getModelConfig('system', model);
  const openaiInstance = await getOpenaiInstance(config.apiKey, config.baseUrl);
  // tools can not be empty array []
  if (stream) {
    return chatStreamProxy({ messages, model, tools, temperature, response_format, max_tokens, ...rest } as IChatRequest, openaiInstance);
  }
  const result = await chatProxy({ messages, model, tools, temperature, response_format, max_tokens, ...rest } as IChatRequest, openaiInstance);

  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
