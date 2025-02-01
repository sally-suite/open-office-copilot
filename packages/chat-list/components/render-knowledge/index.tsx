import React, { useContext, useEffect, useState } from 'react';
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import gptApi from '@api/gpt';
import { searchIndex } from 'chat-list/utils/vertor';
import { getValues } from 'chat-list/service/sheet';
import VectorCard from 'chat-list/components/card-vector';
import toast from 'chat-list/components/ui/use-toast';
import Loading from '../loading';
import { useTranslation } from 'react-i18next';
import { ChatContext } from 'chat-list/store/chatContext';

export interface IVisionRenderProps {
    images: string[];
}

export default function KnowledgeRender() {
    const { chat } = useContext(ChatContext);
    const { t } = useTranslation(['knowledge']);
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState({
        visible: false,
        content: ''
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const ask = async () => {
        // const titles = ['chunk', 'vector'];
        const values = await getValues();
        if (values.length <= 1 || !values[0].includes('vector')) {
            toast.fail(t('knowledge:no_vector_alert'));
            return;
        }
        const titles = values[0];
        const tarVertor = await gptApi.embeddings({
            model: 'text-embedding-ada-002',
            input: inputValue
        });
        const vectorIndex = titles.indexOf('vector');
        const rows = values.slice(1);
        const indexs = searchIndex(tarVertor, rows.map(v => JSON.parse(v[vectorIndex])));
        console.log('indexs', indexs);
        const contents = indexs.map(i => rows[i][0]);
        const contenStr = contents.join('\n');
        // return content;
        // parseDocument(files[0])
        // const msg = convertMessage(inputValue, images);
        const content = `You need answer user's quesiton base on reference content.\n[reference]\n${contenStr}\nuser's quesiton :${inputValue}`;
        const reuslt = await chat({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content
            }]
        });
        const message = `${reuslt.content}\n\nReference:${indexs.map(i => `[${i + 2}]`).join(',')}`;
        setResult(message);
    };

    const checkVector = async () => {
        // const titles = ['chunk', 'vector'];
        setLoading(true);
        const values = await getValues(1);
        if (values.length < 1 || !values[0].includes('vector')) {
            //current sheet no vertor info,alert user upload file or import data
            setAlert({
                visible: true,
                content: t('knowledge:no_vector_alert')
            });
        } else {
            setAlert({
                visible: true,
                content: t('knowledge:build_by_file_or_sheet')
            });
        }
        setLoading(false);
    };
    useEffect(() => {
        checkVector();
    }, []);
    return (
        <div className="flex flex-col p-1">
            {
                loading && (
                    <Loading className='h-20' text='Checking vecotor information ' />
                )
            }
            {
                !loading && (
                    <VectorCard description={alert.content} className='border-0 p-0 shadow-none' />
                )
            }
            <div className='px-2'>
                <Textarea
                    rows={3}
                    value={inputValue}
                    onChange={handleInputChange}
                    className="border p-2 mt-2"
                    placeholder={t('enter_question', "Enter your question.")}
                />
            </div>

            <div className='flex flex-row items-center'>
                <Button
                    className='mt-2 mx-2'
                    onClick={ask}
                >
                    {t('knowledge:ask', 'Ask')}
                </Button>
            </div>
            <Markdown className='mt-2 p-2'>
                {result}
            </Markdown>
        </div>
    );
}
