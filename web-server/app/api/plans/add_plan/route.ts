/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_plans";

export async function POST(req: Request) {
  // const list = await user.findAll();
  const email: string = req.headers.get('user-email') || req.headers.get('email') || ''

  const body = await req.json();

  const {
    name,
    tasks = [],
  } = body;

  if (!name) {
    return NextResponse.json({ code: 1, data: null, message: "name is required" });
  }

  const result = await Models.findOrCreate({
    where: {
      email,
      name,
    },
    defaults: {
      email,
      name,
      tasks: JSON.stringify(tasks),
    },
  })

  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
