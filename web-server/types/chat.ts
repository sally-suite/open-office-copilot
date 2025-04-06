import { ChatCompletionFunctions } from "openai-edge";

export interface Message {
  role: Role;
  content: string;
  name?: string;
  tool_calls?: ToolFunction[];
}

export type Role = "assistant" | "user" | "system" | "ai" | 'tool';

export interface ChatBody {
  messages: Message[];
  key: string;
  prompt: string;
  temperature: number;
}

export interface IChatRequest {
  agent?: string;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o' | 'gpt-4o-mini' | 'glm-4' | 'glm-3-turbo' | 'glm-4v' | 'gpt-4-vision-preview' | 'gemini-pro' | 'ERNIE-Speed-128K' | 'deepseek-chat' | 'glm-4-air' | 'claude-3.5-sonnet' | 'claude-3.5-haiku' | 'openai/gpt-4o-mini' | 'o1' | 'o3';
  messages: Message[],
  max_tokens?: 2400,
  temperature?: number;
  top_p?: number,
  frequency_penalty?: number,
  presence_penalty?: number,
  functions?: ChatCompletionFunctions[],
  tools?: ToolFunction[],
  stream?: boolean,
  response_format?: { type: string }
}


export interface ToolFunction {
  type: 'function',
  function: ChatCompletionFunctions
}

export interface FunctionCall {
  name: string;
  arguments: string;
}