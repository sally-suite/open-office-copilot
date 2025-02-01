import React, { useEffect, useState } from 'react'
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import FileSelector from 'chat-list/components/file-selector'
import { IMessageBody } from 'chat-list/types/chat';
import useLocalStore from 'chat-list/hook/useLocalStore';
import { Trash2, File, Image, ShieldAlert, XCircle } from "lucide-react";
import { chunkText, parseDocument } from 'chat-list/utils/file';
import gptApi from '@api/gpt';
import sheetApi from '@api/sheet'
import { searchIndex } from 'chat-list/utils/vertor';
import { getValues } from 'chat-list/service/sheet'
import { chat } from 'chat-list/service/message';
import { Alert, AlertDescription, AlertTitle } from "chat-list/components/ui/alert";
import VectorCard from 'chat-list/components/card-vector';
import toast from 'chat-list/components/ui/use-toast'
import Loading from '../loading';
export interface IVisionRenderProps {
    images: string[];
}

export default function ChatSheetRender() {
    // const { plugin } = useContext(ChatContext);
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState({
        visible: false,
        content: ''
    })
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const ask = async () => {
        // const titles = ['chunk', 'vector'];
        const values = await getValues();
        if (values.length <= 1 || !values[0].includes('vector')) {
            toast.fail('No vector information is found in the current sheet, you can either upload a file, or select the key columns to build the vector.')
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
        console.log('indexs', indexs)
        const contents = indexs.map(i => rows[i][0]);
        const contenStr = contents.join('\n');
        // return content;
        // parseDocument(files[0])
        // const msg = convertMessage(inputValue, images);
        const content = `You need answer user's quesiton base on reference content.\n[reference]\n${contenStr}\nuser's quesiton :${inputValue}`
        const reuslt = await chat({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content
            }]
        });
        const message = `${reuslt.content}\n\nReference:${indexs.map(i => `[${i + 2}]`).join(',')}`
        setResult(message);
    }

    const checkVector = async () => {
        // const titles = ['chunk', 'vector'];
        setLoading(true);
        const values = await getValues(1);
        if (values.length < 1 || !values[0].includes('vector')) {
            //current sheet no vertor info,alert user upload file or import data
            setAlert({
                visible: true,
                content: 'No vector information is found in the current sheet, you can either upload a file, or select the key columns to build the vector.'
            })
        } else {
            setAlert({
                visible: true,
                content: 'You can either upload a file, or select the key columns to build the vector.'
            })
        }
        setLoading(false);
    }
    useEffect(() => {
        checkVector();
    }, [])
    return (
        <div className="flex flex-col p-2">
            {
                loading && (
                    <Loading className='h-20' text='Checking vecotor information ' />
                )
            }
            {
                !loading && (
                    <VectorCard description={alert.content} />
                )
            }

            <Textarea
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 mt-2"
                placeholder="Enter your question."
            />
            <div className='flex flex-row items-center'>
                <Button
                    className='mt-2 mx-2'
                    onClick={ask}
                >
                    Ask
                </Button>
            </div>
            <Markdown className='mt-2 p-2'>
                {result}
            </Markdown>
        </div>
    );
}
