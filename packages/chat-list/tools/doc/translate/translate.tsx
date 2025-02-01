



import { ChatState, ITool } from 'chat-list/types/plugin';
import docApi from '@api/doc';
import { buildTransLateDocMessages } from 'chat-list/service/doc';
import { IChatResult, IMessageBody } from 'chat-list/types/chat';
import { buildChatMessage } from 'chat-list/utils';



export const main: ITool['func'] = async ({ target_language, tone, content, context }: { target_language: string, content: string, tone: string, context: ChatState }): Promise<any> => {
    let text = content;
    if (!content) {
        text = await docApi.getSelectedText();
    }
    const messages = buildTransLateDocMessages(
        text,
        '',
        target_language,
        tone
    ) as IMessageBody[];
    const resMsg = buildChatMessage('', 'text');
    let isAppend = false;
    await context.chat({
        stream: true,
        messages,
        temperature: 0,
    }, (done: boolean, res: IChatResult) => {
        if (!isAppend) {
            resMsg.content = res.content;
            context.appendMsg(resMsg);
            isAppend = true;
        } else {
            resMsg.content = res.content;
            context.updateMsg(resMsg._id, resMsg);
        }
    });

    return 'I have completed translation task. tell user check and insert result to document. ';

};

export default {
    "name": "translate_doc",
    "description": `Translate document or selection text to target language`,
    "parameters": {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "description": `The content need to be translated`
            },
            "target_language": {
                "type": "string",
                "description": `Target language`
            },
            "tone": {
                "type": "string",
                "description": `Tone of translation`
            }
        },
        "required": [
            "target_language", "content"
        ]
    },
    func: main
} as unknown as ITool;