import { OpenAIModel } from './openai';
import { IUsage } from './usage';

// "content": [
//   {
//     "type": "text",
//     "text": "What’s in this image?"
//   },
//   {
//     "type": "image_url",
//     "image_url": {
//       "url": f"data:image/jpeg;base64,{base64_image}"
//     }
//   }
// ]

export interface IMessagePart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

/**
 * Used in GPT chat request
 */
export interface IMessageBody {
  key?: string | number;
  role: Role;
  tool_call_id?: string;
  content: string | (IMessagePart[]);
  name?: string;
  tool_calls?: ToolFunctinCall[];
}

export type Role = 'assistant' | 'user' | 'system' | 'tool';

export type GptModel = 'gpt-3.5-turbo' | 'gpt-4' | 'o1-mini' | 'glm-4v' | 'gemini-pro' | 'gemini-pro-vision' | 'gpt-4-vision-preview' | 'glm-4' | 'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5-sonnet' | 'ERNIE-Speed-128K' | 'deepseek-chat' | 'free' | 'string';//LlmModel[keyof LlmModel];//

export enum LlmModel {
  GPT3_5_TURBO = 'gpt-3.5-turbo',
  GPT4 = 'gpt-4',
  GEMINI_PRO = 'gemini-pro',
  GEMINI_PRO_VISION = 'gemini-pro-vision'
}

export type IToolChoice = 'auto' | {
  type: 'function',
  function: {
    name: string
  }
}

/**
 * Used in GPT chat request
 */
export interface IChatBody {
  agent?: string;
  model?: GptModel;
  messages: IMessageBody[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  functions?: ChatCompletionFunctions[];
  tools?: ToolFunction[];
  stream?: boolean;
  tool_choice?: IToolChoice;
  response_format?: { type: 'json_object' }
}


export interface IChatResult {
  role?: Role;
  content?: string;
  reasoning_content?: string;
  function_call?: FunctionCall;
  tool_calls?: ToolFunctinCall[];
  usage?: IUsage;
  delta?: {
    content: string
  }
}

export interface ICompletionsBody {
  model?: string;
  prompt: string;
  max_tokens?: number;
  temperature: number;
}

export interface IEmbeddingsBody {
  model?: string;
  input: string;
}

export type IModelOption = {
  prompt: string;
  temperature: number;
};


export type ChatFunction = (chatBody: IChatBody) => Promise<IChatResult>;

export interface ChatCompletionFunctions {
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  name: string;
  /**
   * The description of what the function does.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  description?: string;
  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the [guide](/docs/guides/gpt/function-calling) for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
   * @type {{ [key: string]: any }}
   * @memberof ChatCompletionFunctions
   */
  parameters?: {
    [key: string]: any;
  };
}

export interface ToolFunction {
  type: 'function',
  function: ChatCompletionFunctions
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolFunctinCall {
  id?: string,
  type: 'function' | 'tool',
  function: FunctionCall
}


