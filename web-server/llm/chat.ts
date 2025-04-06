import { ChatOpenAI } from "langchain/chat_models/openai";
import { OPENAI_API_HOST, OPENAI_API_KEY } from "@/constants/llm";
import { HumanMessage, AIMessage, ChatMessage } from "langchain/schema";
import { IChatRequest, Message } from "@/types/chat";


export async function chat({ messages }: IChatRequest) {
  console.log('OPENAI_API_KEY', OPENAI_API_KEY)
  const chatInstance = new ChatOpenAI(
    {
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 999999,
      streaming: false,
      temperature: 0,
    },
    {
      basePath: `${OPENAI_API_HOST}/v1`,
    }
  );

  const msgs = messages.map((msg) => {
    if (msg.role === "assistant") {
      return new AIMessage(msg.content);
    }
    return new HumanMessage(msg.content);
  });
  // msgs.push(new HumanMessage(query));
  console.log(OPENAI_API_HOST, OPENAI_API_KEY, msgs)
  const response = await chatInstance.call(msgs);
  console.log(response.content);
  return response.content;
}
