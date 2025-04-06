/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import agents from "@/models/agents";

export async function POST(req: Request) {
  // const list = await user.findAll();
  const email: string = req.headers.get('user-email') || req.headers.get('email') || ''
  const body = await req.json();

  const {
    id
  } = body;

  const deletedRows = await agents.destroy({
    where: {
      id: id,
      owner: email
    }
  })

  return NextResponse.json({ code: 0, data: deletedRows, message: "delete success" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
