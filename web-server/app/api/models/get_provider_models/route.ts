/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_models";
import { ProviderBaseUrl } from "@/constants/llm-model";
import OpenAI from "openai";

export async function POST(req: Request) {
  const body = await req.json();
  const { provider } = body;
  const { baseUrl, apiKey, models } = ProviderBaseUrl[provider];

  if (models && models.length > 0) {
    return NextResponse.json({ code: 0, data: { data: models }, message: "" });

  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl
  });

  const list = await openai.models.list();

  return NextResponse.json({ code: 0, data: list, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
