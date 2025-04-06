
import { NextResponse } from "next/server";
import UserPrompts from "@/models/user_prompts";

export async function POST(req: Request) {
  // const list = await user.findAll();
  const email: string = req.headers.get('user-email') || req.headers.get('email') || ''

  const body = await req.json();

  const {
    id,
    name,
    prompt,
    type
  } = body;

  if (!prompt) {
    return NextResponse.json({ code: 1, data: null, message: "prompt is required" });
  }
  if (id) {
    await UserPrompts.update({
      name,
      prompt,
    }, {
      where: {
        id,
      }
    })
  }
  const result = await UserPrompts.findOrCreate({
    where: {
      type,
      name,
      email,
      prompt,
    },
    defaults: {
      type,
      name,
      email,
      prompt,
    },
  })

  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
