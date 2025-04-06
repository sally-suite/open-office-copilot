/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_models";

export async function POST(req: Request) {
  const list = await Models.findAll()

  return NextResponse.json({ code: 0, data: list, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
