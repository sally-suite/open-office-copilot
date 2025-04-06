import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { OPENAI_API_HOST, OPENAI_API_KEY } from "@/constants/llm";
import { IChatRequest } from '@/types/chat';

export const runtime = 'edge'

const apiConfig = new Configuration({
  apiKey: OPENAI_API_KEY,
  basePath: `${OPENAI_API_HOST}/v1`,
})

const openai = new OpenAIApi(apiConfig)

export async function chat({ messages, temperature }: IChatRequest) {
  // Extract the `messages` from the body of the request

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages as any,
    max_tokens: 2400,
    temperature: temperature || 1,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    functions: []
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)

  // Respond with the stream
  return new StreamingTextResponse(stream)
}