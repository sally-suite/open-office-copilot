/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_models";

export async function POST(req: Request) {
  // const list = await user.findAll();
  const email: string = req.headers.get('user-email') || req.headers.get('email') || ''

  const body = await req.json();

  const {
    id,
    model,
    provider,
    baseUrl
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
        baseUrl
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
        email,
        model,
        baseUrl
      },
      defaults: {
        provider,
        email,
        model,
        baseUrl
      },
    })
  }

  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
