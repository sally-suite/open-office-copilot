



import { ChatState, ITool } from 'chat-list/types/plugin';
import description from './description.md';
import { buildChatMessage } from 'chat-list/utils';
import CardConfirm from 'chat-list/components/card-confirm';
import Markdown from 'chat-list/components/markdown';
import React from 'react';
import i18n from 'chat-list/locales/i18n';

export const main: ITool['func'] = async ({ uml_code, context }: { uml_code: string, context: ChatState }): Promise<any> => {
    // const result = await chatByPrompt(description, requirement)
    // return result.content;

    const { appendMsg, setPlugin, plugins, setMode } = context;
    const code = uml_code.startsWith("```mermaid") ? uml_code : "```mermaid\n" + uml_code + "\n```";
    appendMsg(buildChatMessage(
        <CardConfirm
            title={i18n.t('doc.agent.uml', 'UML Diagram')}
            content={(
                <Markdown>
                    {code}
                </Markdown>
            )}
            okText='Edit'
            hideCancel={true}
            onOk={() => {
                const plg = plugins.find(p => p.action == 'uml');
                plg['code'] = code;
                setMode(plg.action, 'custom');
                setPlugin(plg);
            }}
        />, 'card', 'assistant'
    ));
    return code;
};

export default {
    "name": "write_uml",
    "description": description,
    "parameters": {
        "type": "object",
        "properties": {
            "uml_code": {
                "type": "string",
                "description": `UML Diagrams code using mermaid UML`
            }
        },
        "required": [
            "uml_code"
        ]
    },
    func: main
} as unknown as ITool;