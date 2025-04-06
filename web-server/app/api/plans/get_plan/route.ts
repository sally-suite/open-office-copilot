/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_plans";

export async function POST(req: Request) {
  const userEmail: string = req.headers.get('user-email') || req.headers.get('email') || ''
  const body = await req.json();

  const {
    id
  } = body;

  const plan = await Models.findOne({
    where: {
      id
    }
  })

  if (!plan) {
    return NextResponse.json({ code: 1, data: "", message: "Plan not found" });
  }
  const result = {
    ...plan.dataValues,
    tasks: JSON.parse(plan.dataValues.tasks || "[]")
  }
  return NextResponse.json({ code: 0, data: result, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
