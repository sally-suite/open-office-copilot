import React, { useState } from 'react'
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import { useTranslation } from 'react-i18next';
import { ImageGenerations } from 'chat-list/types/image';
import gpt from '@api/gpt'

export default function VisionRender() {
    const { t } = useTranslation(['base', 'image']);
    // const { plugin } = useContext(ChatContext);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };
    const ask = async () => {
        setError('')
        if (!inputValue) {
            return;
        }
        const result: ImageGenerations = await gpt.generateImages({
            prompt: inputValue,
            n: 1,
            style: 'vivid',
            model: 'dall-e-3',
            response_format: 'url'
        });
        if (result?.data?.[0].b64_json) {
            // const content = `![image](data:image/png;base64,${result.data[0].b64_json})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`
            const content = `![image](data:image/png;base64,${result.data[0].b64_json})`
            // appendMsg(buildChatMessage(content, 'text', 'assistant'));
            // return 'Task completed';
            setMessages([...messages, content])
        } if (result?.data?.[0].url) {
            // const content = `![image](${result.data[0].url})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`
            const content = `![image](${result.data[0].url})`
            setMessages([...messages, content])
        } else {
            setError(t('image:fail'))
        }
    }

    return (
        <div className="flex flex-col p-2 h-full">
            <Textarea
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 mt-2"
                placeholder={t('image:placeholder')}
            />
            <div className=' text-red-500 mt-2'>
                {error}
            </div>
            <div className='flex flex-row items-center'>
                <Button
                    className='mt-2 sm:w-auto'
                    onClick={ask}
                >
                    {t('image:generate')}
                </Button>
            </div>
            <div className='flex-1 mt-4 overflow-auto'>
                {
                    messages.map((msg, index) => {
                        return (
                            <Markdown key={index} className='mt-2 p-2'>
                                {msg}
                            </Markdown>
                        )
                    })
                }
            </div>
        </div>
    );
}
