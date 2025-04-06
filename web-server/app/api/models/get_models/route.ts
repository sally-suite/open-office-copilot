/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Models from "@/models/user_models";
import { Op } from "sequelize";

export async function POST(req: Request) {
  const userEmail: string = req.headers.get('email');
  const list = await Models.findAll({
    where: {
      [Op.or]: [
        { email: userEmail },
        { email: 'empty' }
      ]
    }
  })

  return NextResponse.json({ code: 0, data: list, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
