import React, { useMemo } from 'react';
import useChatState from 'chat-list/hook/useChatState';

import { useTranslation } from 'react-i18next';
import promptSetting from 'chat-list/service/writing/prompt';
import CardTranslate from 'chat-list/components/card-translate-doc';
import { buildChatMessage, template } from 'chat-list/utils';
import api from '@api/doc';
import commonApi from "@api/index";
import gpt from '@api/gpt';

import { chatByPrompt } from 'chat-list/service/message';
import { ImageSearchResult } from 'chat-list/types/search';
import { ImageGenerations } from 'chat-list/types/image';
import Tooltip from '../tooltip';
import { HelpCircle } from 'lucide-react';


export default function ToolList() {
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, setAgentTools, chat, appendMsg, setTyping, setPlaceholder, showMessage } = useChatState();
    const tooList = useMemo(() => {
        return [
            {
                code: 'translate',
                icon: 'translate',
            },
            {
                code: 'summarize',
                icon: '',
            },
            {
                code: 'rephrase',
                icon: '',
            },
            {
                code: 'contine_write',
                icon: '',
            },
            {
                code: 'make_longer',
                icon: '',
            },
            {
                code: 'make_shorter',
                icon: '',
            },
            {
                code: 'make_titles',
                icon: '',
            },
            {
                code: 'search_images',
                icon: '',
            },
            {
                code: 'add_emoji',
                icon: '',
            },
        ];
    }, []);
    const onSelect = (id: string) => {
        const tip = t(`tool:${id}.tip`, '');
        setPlaceholder(tip);
        setAgentTools([{ id, name: id, enable: true }]);
    };

    const callTool = async (item: any) => {
        // setResult('')
        if (item.code == 'translate') {
            appendMsg(buildChatMessage(
                <CardTranslate
                    onTranslate={(text) => {
                        appendMsg(buildChatMessage(text, 'text', 'assistant'));
                    }}
                />, 'card'));
        } else if (item.code === 'search_images') {
            setTyping(true);
            const text = await api.getSelectedText();
            const result = await chatByPrompt('', 'Help me suggest five keywords based on the following text:\n\n' + text, {
                stream: false,
            });
            const keyword = result.content;
            const results = await commonApi.searchImages({
                keyword,
                num: 5
            }) as ImageSearchResult[];

            const targets = results.filter(p => p.imageUrl);
            if (targets.length == 0) {
                const msg = buildChatMessage('Search result is empty', 'text', 'assistant');
                appendMsg(msg);
                return;
            }
            const content = results.map(({ title, imageUrl }) => {
                return `![${title}](${imageUrl})`;
            }).join('\n\n');

            const msg = buildChatMessage(content, 'text', 'assistant');
            appendMsg(msg);

        } else if (item.code === 'create_images') {
            setTyping(true);
            const text = await api.getSelectedText();
            const prompResult = await chatByPrompt('', 'Extract the scene, style, and characters from the following text in 100 words or less:\n\n' + text, {
                stream: false,
            });
            const prompt = prompResult.content;
            const result: ImageGenerations = await gpt.generateImages({
                prompt,
                n: 1,
                style: 'vivid',
                model: 'dall-e-3',
                response_format: 'url'
            });
            if (result?.data?.[0].b64_json) {
                const content = `![image](data:image/png;base64,${result.data[0].b64_json})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`;
                appendMsg(buildChatMessage(content, 'text', 'assistant'));
            } if (result?.data?.[0].url) {
                const content = `![image](${result.data[0].url})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`;
                appendMsg(buildChatMessage(content, 'text', 'assistant'));
            } else {
                appendMsg(buildChatMessage('Failed to generate image', 'text', 'assistant'));
            }
        } else if (item.code === 'remove_line_breaks') {
            await api.removeLineBreaks();

        } else {

            setTyping(true);
            let text;
            if (item.code == 'summarize' || item.code == 'make_titles') {
                text = await api.getDocumentContent();
            } else {
                text = await api.getSelectedText();
            }
            if (!text) {
                appendMsg(buildChatMessage(t('doc.no_text_selected'), 'text', 'assistant'));
                return;
            }
            const msg = showMessage('', 'assistant');
            const promptTpl = promptSetting[item.code];
            const prompt = template(promptTpl, {
                input: text
            })
            plugin.memory.push({
                role: 'user',
                content: prompt
            });
            await chat({
                stream: true,
                temperature: 0.8,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
            }, (done, result) => {
                if (!result.content) {
                    return;
                }
                msg.update(result.content);
                if (done) {
                    plugin.memory.push({
                        role: 'assistant',
                        content: result.content
                    });
                }
            });
        }
    };

    return (
        <div className='flex flex-col text-sm'>
            {/* <p className='markdown py-1'>
                {t('sheet.agent.sally.choose_tool')}
            </p>
            <div className='grid grid-cols-2 gap-2 mt-1'>
                {
                    plugin.tools?.map((id) => {
                        return (
                            <div
                                className='flex items-center justify-center py-1 px-1 text-center cursor-pointer rounded-xl border border-slate-200 bg-white select-none hover:bg-slate-100 hover:border-slate-100 transform transition-transform duration-200 hover:scale-102 active:scale-[98%] overflow-hidden'
                                key={id}
                                onClick={onSelect.bind(null, id)}
                            >
                                {t(`tool:${id}`)}
                            </div>
                        );
                    })
                }
            </div>
            <p className=' py-1 mt-4'>
                {t('doc.agent.sally.choose_tool')}
            </p> */}
            <p className=' font-semibold text-lg py-1 mb-4'>
                Hi, I&apos;m Sally, Welcome. 👋
            </p>
            <h3 className='py-1 text-base flex flex-row items-center'>
                {t('common.tools')}
                <Tooltip className='' tip={t('common.inside_tool_tip', 'Select the text in the document and use the following tools.')}>
                    <HelpCircle className='text-gray-500 ml-1' height={16} width={16} />
                </Tooltip>
            </h3>
            <div className='grid grid-cols-1 gap-2 mt-1'>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2 '>
                    {
                        tooList.map((tool, i) => {
                            return (
                                <div
                                    className='flex items-center justify-center py-1 px-1 text-center cursor-pointer rounded-xl border border-slate-200 bg-white select-none hover:bg-slate-100 hover:border-slate-100 transform transition-transform duration-200 hover:scale-102 active:scale-[98%] overflow-hidden'
                                    key={i}
                                    onClick={callTool.bind(null, tool)}
                                >
                                    {t(`doc.${tool.code}`)}
                                </div>
                            );
                        })
                    }
                </div>
            </div>

        </div>

    );
}
