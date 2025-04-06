/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import Agents from "@/models/agents";

export async function POST(req: Request) {
  // const list = await user.findAll();
  const email: string = req.headers.get('user-email') || req.headers.get('email') || ''

  const body = await req.json();

  const {
    avatar,
    type,
    name,
    description,
    introduce,
    instruction,
    tools = [],
    agents = [],
    visibility = 'private',
    status = 'active',
    version = '1.0',
    dataAsContext = false,
    tags = [],
    acitions = [],
  } = body;

  if (!name || !description || !instruction) {
    return NextResponse.json({ code: 1, data: null, message: "Name, description and instruction are required" });
  }

  const agent = await Agents.create({
    avatar,
    type,
    name,
    description,
    introduce,
    instruction,
    tools,
    agents,
    visibility,
    status,
    version,
    dataAsContext,
    tags,
    acitions,
    owner: email,
  });

  return NextResponse.json({ code: 0, data: agent, message: "" });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
