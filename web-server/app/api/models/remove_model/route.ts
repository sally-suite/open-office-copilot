/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import models from "@/models/user_models";

export async function POST(req: Request) {
  // const list = await user.findAll();
  const email: string = req.headers.get('user-email') || req.headers.get('email') || ''
  const body = await req.json();

  const {
    id,
    model,
    provider = ''
  } = body;

  if (id) {
    const deletedRows = await models.destroy({
      where: {
        id
      }
    })
    return NextResponse.json({ code: 0, data: deletedRows, message: "delete success" });
  }
  const deletedRows = await models.destroy({
    where: {
      model,
      email,
      provider
    }
  })

  return NextResponse.json({ code: 0, data: deletedRows, message: "delete success" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
