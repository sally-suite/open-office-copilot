/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import models from "@/models/user_models";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    id,
  } = body;
  if (!id) {
    return NextResponse.json({ code: 0, data: "", message: "id is required" });
  }
  const deletedRows = await models.destroy({
    where: {
      id
    }
  })
  return NextResponse.json({ code: 0, data: deletedRows, message: "delete success" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
