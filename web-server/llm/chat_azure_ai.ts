
import { OPENAI_API_HOST, OPENAI_API_HOST_GPT4, OPENAI_API_KEY, OPENAI_API_KEY_GPT4 } from "@/constants/llm";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { IChatRequest } from "@/types/chat";
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { encodingForModel } from "js-tiktoken";
import { getEndPoint } from "@/constants/endpoint";

// import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
// import model from "tiktoken/encoders/cl100k_base.json";
// import { init, Tiktoken } from "tiktoken/lite/init";

export async function chat({ messages, ...rest }: IChatRequest) {
  const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);

  const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
  const result = await client.getChatCompletions(deploymentId, messages as any, {
    ...rest
  });
  if (result.choices.length > 0) {
    const message = result.choices[0].message;
    const usage = result.usage;
    const {
      role,
      content,
      functionCall,
      toolCalls
    } = message;
    return {
      role,
      content,
      function_call: functionCall,
      tool_calls: toolCalls,
      usage: {
        completion_tokens: usage?.completionTokens,
        prompt_tokens: usage?.promptTokens,
        total_tokens: usage?.totalTokens,
      }
    }
  }
}


export async function chatProxy({ messages, ...rest }: IChatRequest) {
  const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);
  const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
  const result: any = await client.getChatCompletions(deploymentId, messages as any, {
    ...rest
  });
  if (result?.error?.message) {
    return {
      error: {
        message: result.error?.message
      }
    }
  }
  if (result.choices.length > 0) {
    const message = result.choices[0].message;
    const usage = result.usage;
    const {
      role,
      content,
      functionCall,
      toolCalls
    } = message;
    return {
      choices: [{
        message: {
          role,
          content,
          function_call: functionCall,
          tool_calls: toolCalls,
        }
      }],
      usage: {
        completion_tokens: usage?.completionTokens,
        prompt_tokens: usage?.promptTokens,
        total_tokens: usage?.totalTokens,
      }
    }
  }
  return {
    choices: [
      {
        message: {
          content: '',
          function_call: null,
          tool_calls: [],
        }
      }
    ],
    usage: {
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0,
    }
  }
}


export async function chatStreamProxy({ messages, ...rest }: IChatRequest, callback?: (tokenNumber: number) => void) {
  const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);

  const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
  const events = await client.streamChatCompletions(deploymentId, messages as any, { ...rest });
  const encoding = encodingForModel(rest.model as any)
  const msgs = messages.map(p => p.content).join('\n');
  const tokens = encoding.encode(msgs)
  let count = tokens.length;
  const textEncoder = new TextEncoder();
  const response = {
    content: '',
    tool_calls: []
  }
  const stream = new ReadableStream({
    async start(controller) {
      for await (const event of events) {
        // console.log(event.usage)
        controller.enqueue(textEncoder.encode(`\n`));
        const choices = []
        for (const choice of event.choices) {
          choices.push({
            index: choice.index,
            delta: choice.delta,
            message: choice.message
          })

          const content = choice.delta?.content;
          const toolCalls = choice.delta?.toolCalls;
          if (content !== undefined && content != null) {
            response.content += content;
          }

          if (toolCalls != undefined && toolCalls != null) {
            response.tool_calls = mergeToolCalls(response.tool_calls, toolCalls);
          }
        }
        const data = textEncoder.encode(`data:${JSON.stringify({
          choices: choices,
          usage: event.usage
        })}`);
        controller.enqueue(data);
        controller.enqueue(textEncoder.encode(`\n`));
      }

      controller.enqueue(textEncoder.encode(`\n`));
      const done = textEncoder.encode(`[DONE]`);
      controller.enqueue(done);
      controller.enqueue(textEncoder.encode(`\n`));
      controller.close();

      const tokens = encoding.encode(response.content + JSON.stringify(response.tool_calls))
      count += tokens.length;
      if (callback) {
        await callback(count);
      }
    },
  })
  return new Response(stream);
}


export const whisper = async (second) => {

}

function mergeToolCalls(toToolCalls, fromToolCalls) {
  fromToolCalls.forEach(fromToolCall => {
    const matchingIndex = toToolCalls.findIndex(toToolCall => toToolCall.index === fromToolCall.index);

    if (matchingIndex !== -1) {
      // 合并已存在的 toolCall
      const toToolCall = toToolCalls[matchingIndex];

      // 合并 function 对象的属性，例如 arguments 和 name
      Object.keys(fromToolCall.function).forEach(key => {
        toToolCall.function[key] += fromToolCall.function[key];
      });

      // 如果 fromToolCall 中有其他属性，也合并到 toToolCall 中
      Object.keys(fromToolCall).forEach(key => {
        if (key !== 'function') {
          toToolCall[key] = fromToolCall[key];
        }
      });
    } else {
      // 如果不存在，则将整个 fromToolCall 添加到 toToolCalls 中
      toToolCalls.push(fromToolCall);
    }
  });

  return toToolCalls;
}