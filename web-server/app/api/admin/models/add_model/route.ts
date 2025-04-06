/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_models";

export async function POST(req: Request) {
  // const list = await user.findAll();

  const body = await req.json();

  const {
    id,
    model,
    provider,
    baseUrl,
    apiKey,
  } = body;

  if (!model) {
    return NextResponse.json({ code: 1, data: null, message: "model name is required" });
  }
  let result = null;
  if (id && typeof id == 'number') {
    await Models.update(
      {
        model,
        provider,
        baseUrl,
        apiKey
      },
      {
        where: {
          id,
        },
      }
    );
    result = await Models.findByPk(id);
  } else {
    [result] = await Models.findOrCreate({
      where: {
        provider,
        email: 'empty',
        model,
        baseUrl,
        apiKey
      },
      defaults: {
        provider,
        email: 'empty',
        model,
        baseUrl,
        apiKey
      },
    })
  }

  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
