import React, { useState } from 'react';
import Button from "chat-list/components/button";
import { Textarea } from "chat-list/components/ui/textarea";
import { StreamingMarkdownProcessor } from 'chat-list/utils';
import { chatByTemplate } from 'chat-list/service/message';
import prompt from './prompt.md';
import docApi from '@api/doc';
import Markdown from 'chat-list/components/markdown';
import { useTranslation } from 'react-i18next';

const LatexToWordConverter = () => {
    const [input, setInput] = useState('');
    const [marks, setMarks] = useState([]);
    const [error, setError] = useState('');
    const { t } = useTranslation(['paper']);

    const handleConvert = async () => {
        setError('');
        setMarks([]);
        const markdownProcessor = new StreamingMarkdownProcessor();
        try {
            await chatByTemplate(prompt, {
                input: input
            }, { model: 'gpt-4o-mini', stream: true, temperature: 0.8 },
                async (done, result) => {
                    // console.log(result.delta?.content)
                    if (done) {
                        // 处理最后剩余的内容
                        const finalParagraphs = await markdownProcessor.finalize();
                        for (const paragraph of finalParagraphs) {
                            if (paragraph.trim()) {  // 只插入非空段落
                                // range = range.insertOoxml(paragraph, Word.InsertLocation.after);
                                // await insertMarkdown(paragraph)
                                try {
                                    await docApi.insertText(paragraph)
                                } catch (e) {
                                    console.error('Error inserting text:', e);
                                    setError(t('try_insert_manually'));
                                    setMarks((prevMarks) => [...prevMarks, paragraph]);
                                }

                            }
                        }
                        return;
                    }

                    if (result.delta?.content) {
                        // 处理流式内容
                        const { newParagraphs, remainingBuffer } =
                            await markdownProcessor.processStream(result.delta.content);

                        // 只插入新的段落
                        for (const paragraph of newParagraphs) {
                            if (paragraph.trim()) {  // 只插入非空段落
                                // range = range.insertOoxml(paragraph, Word.InsertLocation.after);
                                try {
                                    await docApi.insertText(paragraph)
                                } catch (e) {
                                    console.error('Error inserting text:', e);
                                    setError(t('try_insert_manually'));
                                    setMarks((prevMarks) => [...prevMarks, paragraph]);
                                }
                            }
                        }
                    }
                }
            );
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="w-full flex-1 flex flex-col  mx-auto p-2 space-y-2 overflow-hidden">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('latext_to_word_tip')}
                className="h-[100px] w-full p-4"
            />

            <Button
                className="sm:w-auto px-4"
                onClick={handleConvert}
            >
                {t('convert')}
            </Button>
            {
                error && (
                    <div className='w-full p-2 overflow-auto text-sm'>

                        {error}
                    </div>
                )
            }
            <div className='w-full p-2 flex-1 overflow-auto'>
                {
                    marks.map((mark, index) => {
                        return (
                            <Markdown key={index} className='bubble text mb-8'>
                                {mark}
                            </Markdown>
                        )
                    })
                }
            </div>
        </div>
    );
};

export default LatexToWordConverter;