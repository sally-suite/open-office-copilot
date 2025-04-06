/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_plans";

export async function POST(req: Request) {
  const userEmail: string = req.headers.get('user-email') || req.headers.get('email') || ''
  const list = await Models.findAll({
    where: {
      email: userEmail
    }
  });
  const result = list.map(({ dataValues }) => {
    return {
      ...dataValues,
      tasks: JSON.parse(dataValues.tasks || "[]")
    }
  })

  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
