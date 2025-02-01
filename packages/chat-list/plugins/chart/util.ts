import { template } from 'chat-list/utils';
import genGChartPrompt from './promps/gen-gchart/v1.md';
import genEChartPrompt from './promps/gen-echart/v2.md';
import { getHeaderList } from 'chat-list/service/sheet';
import getFunctions from './promps/functions';
import { IMessageBody, ToolFunction } from 'chat-list/types/chat';
import { getValues } from 'chat-list/service/sheet';
import { IChatMessage } from 'chat-list/types/message';
import { buildChatMessages } from 'chat-list/service/chat';

export const buildGoogleChartMessage = async (messages: IChatMessage[] = []): Promise<{
    messages: IMessageBody[],
    tools: ToolFunction[],
}> => {
    const titles = await getHeaderList();
    const tools: ToolFunction[] = getFunctions(titles);
    const prompt = template(genGChartPrompt, {
        titles: titles.join(',')
    });

    const msgs: IMessageBody[] = await buildChatMessages(messages, 'user', '', prompt);
    // console.log(msgs)
    return {
        messages: msgs,
        tools
    };
};

export const buildGoogleChartPrompt = async (): Promise<{
    prompt: string,
    tools: ToolFunction[],
}> => {
    const titles = await getHeaderList();
    const tools: ToolFunction[] = getFunctions(titles);
    const prompt = template(genGChartPrompt, {
        titles: titles.join(',')
    });

    // console.log(msgs)
    return {
        prompt,
        tools
    };
};

export const buildEChartMessage = async () => {

    const data = await getValues();
    const prompt = template(genEChartPrompt, {
        tableData: JSON.stringify(data)
    });

    return { prompt };
};