/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import messages from "@/models/messages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get(
    "conversationId"
  ) as unknown as number;
  const limit: number = Number(searchParams.get('limit')) || 50;
  const offset = Number(searchParams.get('offset'));
  let list = [];
  if (conversationId) {
    list = await messages.findAll({
      where: {
        conversationId,
      },
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });
  } else {
    list = await messages.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }
  return NextResponse.json({ code: 0, data: list, message: "" });

  // const sortedMessages = list.sort(
  //   (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
  // );

}
