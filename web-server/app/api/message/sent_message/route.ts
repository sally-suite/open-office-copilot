/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import user from "@/models/users";
import messages from "@/models/messages";
import conversations from '@/models/conversations'

export async function GET(request: Request) {
  const list = await user.findAll();
  return NextResponse.json({ code: 0, data: list, message: "" });
}

export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''

  const body = await request.json();
  // conversationId: conversationId,
  // senderId: message.from?.name,
  // receiverId: message.to,
  // content: JSON.stringify((message.content as any).props),
  // agent: plugin.action,
  // model: model
  const { conversationId, receiverId, content, senderId, model, agent, platform = '' } = body;
  await messages.create({
    conversationId,
    senderId,
    receiverId,
    agent,
    model,
    content,
    timestamp: new Date(),
  });
  await conversations.findOrCreate({
    where: {
      conversationId,
    },
    defaults: {
      conversationId,
      conversationName: platform + '_' + email,
      createdBy: senderId,
      creationDate: new Date(),
    },
  }).then(([conversation, created]) => {
    if (created) {
      return conversation;
    }
    return conversation;
  });

  // const point = PointConfig[model] || 1;
  // await deductPoints(email, point);
  return NextResponse.json({
    code: 0,
    message: "",
  });
}
