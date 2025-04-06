import React, { useEffect, useState } from 'react';
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import FileSelector from 'chat-list/components/file-selector';
import { IMessageBody } from 'chat-list/types/chat';
import { blobToBase64Image } from 'chat-list/utils';
import { chat } from 'chat-list/service/message';
import { ShieldAlert, XCircle } from 'lucide-react';
import { cn } from 'chat-list/lib/utils';
import useLocalStore from 'chat-list/hook/useLocalStore';
import { Alert, AlertDescription, AlertTitle } from "chat-list/components/ui/alert";
import toast from 'chat-list/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import ModelSelect from 'chat-list/components/model-select';
import { Input } from '../ui/input';
import useChatState from 'chat-list/hook/useChatState';
export interface IVisionRenderProps {
    images: string[];
}

export default function VisionRender(props: IVisionRenderProps) {
    const { images: sourceImages = [] } = props;
    const { t } = useTranslation(['vision']);
    const { fileList, model } = useChatState();
    // const { plugin } = useContext(ChatContext);
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const [images, setImages] = useState(sourceImages);
    // const { value: model, setValue: setModel } = useLocalStore('vision-model', '');
    const { value: tipVisible, setValue: setTipVisible } = useLocalStore('sheet-chat-vison-tip', true);
    const [maxTokens, setMaxTokens] = useState(500);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };
    const convertMessage = (text: string, imgs: string[]): IMessageBody => {
        const images = imgs.map((url: string) => {
            return {
                type: 'image_url',
                image_url: {
                    url
                }
            };
        });

        // const images = await Promise.all(ps);
        const msgs: any = [{ type: 'text', text: text }, ...images];
        return {
            role: 'user',
            content: msgs
        };
    };
    const ask = async () => {
        setResult('');
        if (images.length === 0) {
            toast.fail('Please select an image.');
            return;
        }
        const msg = convertMessage(inputValue, images);
        await chat({
            stream: true,
            model,
            messages: [msg],
            max_tokens: maxTokens
        }, (done, result) => {
            if (!result || !result.content) {
                return;
            }
            // console.log(result.content)
            setResult(result.content);
        });

    };
    const chatWithImage = async (prompt: string, async = true) => {
        setResult('');
        if (images.length === 0) {
            toast.fail('Please select an image.');
            return;
        }
        const msg = convertMessage(prompt, images);
        const res = await chat({
            stream: async,
            model,
            messages: [msg],
            max_tokens: maxTokens
        }, (done, result) => {
            if (!result || !result.content) {
                return;
            }
            if (async) {
                setResult(result.content);
            }
        });
        if (!async) {
            setResult(res.content);
        }
    };
    const extractTable = async () => {
        const prompt = 'Please extracts table information and returns the table.';
        setInputValue(prompt);
        await chatWithImage(prompt);
    };
    const analyzeChart = async () => {
        const prompt = 'You are a data analysis expert, help me analyze this chart for key findings and output your analysis.';
        setInputValue(prompt);
        await chatWithImage(prompt);
    };
    const extractDiagram = async () => {
        const prompt = 'Help me extract the diagram from the image and return the UML Diagram in mermaid format.output format:\nDiagram:\n\n<diagram>';
        setInputValue(prompt);
        await chatWithImage(prompt, false);
    };
    const extractFormula = async () => {
        const prompt = 'Help me extract the Formula from the image and return the Formula in Latex format, Using the $ wrap formula.';
        setInputValue(prompt);
        await chatWithImage(prompt);
    };
    const onFileSelect = async (files: File[]) => {
        const imgs = await Promise.all(files.map(file => blobToBase64Image(file)));
        setImages(images.concat(imgs));
        // setFiles(files);
    };
    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        // setFiles(files.filter((_, i) => i !== index))
    };
    const initQuestions = async () => {
        const prompt = `You're a data analytics expert,can you recommend three questions about this image?`;
        const msg = convertMessage(prompt, images);
        const reuslt = await chat({
            model,
            messages: [msg]
        });
        // console.log(result)
        setInputValue('Preparing questions...');
        setInputValue(reuslt.content);
        // setResult(reuslt.content);
    };
    const closeTip = () => {
        setTipVisible(false);
    };

    const onMaxTokensChange = (e: any) => {
        setMaxTokens(e.target.value);
    };
    const initImageList = async () => {
        const imgs = await Promise.all(fileList.map(file => blobToBase64Image(file)));
        setImages(imgs);
    };
    useEffect(() => {
        if (sourceImages.length > 0) {
            initQuestions();
        }
    }, [sourceImages]);

    useEffect(() => {
        initImageList();
    }, [fileList]);
    return (
        <div className="flex flex-col p-2">
            {
                tipVisible && model == 'gemini-pro-vision' && (
                    <Alert className=' relative'>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle></AlertTitle>
                        <AlertDescription>
                            <p dangerouslySetInnerHTML={{
                                __html: t("notes", '')
                            }}>

                            </p>
                            <XCircle onClick={closeTip} className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer" />

                        </AlertDescription>
                    </Alert>
                )
            }
            <h3 className='input-label'>
                {t('vision_model', 'Vision Model')}
            </h3>
            <ModelSelect className='h-8' type='vision' />
            <h3 className='input-label'>
                MAX TOKENS:
            </h3>
            <Input type='number' value={maxTokens} onChange={onMaxTokensChange} />

            <div className={cn(['grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2'])}>
                {
                    images.map((img, i) => {
                        return (
                            <div key={i} className=' relative' >
                                <img className=' rounded border max-h-[100px]' src={img} alt="" />
                                <XCircle onClick={removeImage.bind(null, i)} className=" absolute top-1 w-4 h-4 right-1 text-gray-500 cursor-pointer" />

                            </div>
                        );
                    })
                }
            </div>
            <div className='flex flex-row justify-start mt-2'>
                <FileSelector config={{ maxFiles: 9, multiple: true }} onSelect={onFileSelect} >
                    {t("upload_images", '')}
                </FileSelector>
            </div>

            <Textarea
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 mt-2"
                placeholder={t("please_upload_images", '')} />
            <div className='flex flex-row items-center'>
                <Button
                    className='mt-2 sm:w-auto'
                    onClick={ask}
                >
                    {t("ask", '')}
                </Button>
            </div>
            {/**帮我实现四宫格布局，使用tailwindcss */}
            <div className='grid grid-cols-2 gap-1 mt-2 sm:grid-cols-4'>
                <Button
                    variant='secondary'
                    className='sm:w-auto'
                    onClick={extractTable}
                >
                    {t("extract_table", 'Extract Table')}
                </Button>
                <Button
                    variant='secondary'
                    className=' sm:w-auto'
                    onClick={extractFormula}
                >
                    {t("extract_formula", 'Extract Formula')}
                </Button>
                <Button
                    variant='secondary'
                    className='sm:w-auto'
                    onClick={extractDiagram}
                >
                    {t("extract_diagram", 'Extract Diagram')}
                </Button>
                <Button
                    variant='secondary'
                    className='sm:w-auto'
                    onClick={analyzeChart}
                >
                    {t("analyze_chart", 'Analyze Chart')}
                </Button>
            </div>
            {
                result && (
                    <Markdown className='mt-2 p-2'>
                        {result}
                    </Markdown>
                )
            }
        </div>
    );
}
