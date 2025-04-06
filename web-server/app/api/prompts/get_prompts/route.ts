
import { NextResponse } from "next/server";
import UserPrompts from "@/models/user_prompts";

export async function POST(req: Request) {
  const userEmail: string = req.headers.get('user-email') || req.headers.get('email') || '';
  const body = await req.json();

  const {
    type
  } = body;

  const list = await UserPrompts.findAll({
    where: {
      type,
      email: userEmail
    }
  })

  return NextResponse.json({ code: 0, data: list, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
