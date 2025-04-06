import React, { useEffect, useRef, useState } from 'react';
import DraggableList from '../draggable-list';
import Button from "chat-list/components/button";
import { Check, List, Paperclip, Undo2 } from "lucide-react";

import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Presentation, generateCatalog, generatePage } from 'chat-list/tools/slide/create/generate_ppt_by_step_v3/util';
import { ISlideItem } from 'chat-list/types/api/slide';
import { getImageSizeByBatch, searchImage } from 'chat-list/utils/img';
import useChatState from 'chat-list/hook/useChatState';
import CardSlideRender from '../card-slide-render';
import FileSelector from 'chat-list/components/file-selector';
import { useTranslation } from 'react-i18next';
import FileList from 'chat-list/components/composer/Composer/FileList';
import { parseDocuments } from 'chat-list/utils/file';
// import slidesData from 'chat-list/plugins/presentation/slides.json';
// import imagesData from 'chat-list/plugins/presentation/images.json';
import { cn } from 'chat-list/lib/utils';

interface Chapter {
    id: string;
    content: string;
    type?: 'list' | 'table' | 'chart';
}

export type IStatus = 'input' | 'confirm' | 'generating' | 'done';

export interface ChapterManagerProps {
    catalog?: Presentation;
    addImages?: boolean;
    reference?: string;
    onConfirm?: (list: Chapter[]) => void;
    language?: string;
    className?: string;
    onStatusChange?: (status: IStatus) => void;
}

const ChapterManager: React.FC<ChapterManagerProps> = (props: ChapterManagerProps) => {
    const {
        className = '',
        catalog: defautlCatalog,
        onConfirm,
        reference: referContent,
        addImages = true,
        language: defaultLanguage,
        onStatusChange
    } = props;
    const { showMessage, docType, setTyping, setPreview, appendMsg, platform } = useChatState();
    const [status, setStatus] = useState<IStatus>('input');
    const [slides, setSlides] = useState<ISlideItem[]>([]);
    const [images, setImages] = useState([]);
    const [chapters, setChapters] = useState<Chapter[]>([
        // {
        //     id: Date.now().toString(),
        //     content: `b`,
        //     type: 'cover'
        // }, {
        //     id: Date.now().toString() + Math.random(),
        //     content: `a`,
        //     type: 'catalog'
        // }, {
        //     id: Date.now().toString() + Math.random(),
        //     content: `c`,
        //     type: 'list'
        // }, {
        //     id: Date.now().toString() + Math.random(),
        //     content: `a`,
        //     type: 'chart'
        // }, {
        //     id: Date.now().toString() + Math.random(),
        //     content: `b`,
        //     type: 'table'
        // }
    ]);
    const [catalog, setCatalog] = useState<Presentation>(defautlCatalog);
    const [reference, setReference] = useState(referContent);
    const [pageNum, setPageNum] = useState(5);
    const [language, setLanguage] = useState('');
    const [isAddImage, setIsAddImage] = useState<boolean>(addImages);
    const [fileList, setFileList] = useState<File[]>([]);
    const msgRef = useRef(null);
    const referenceRef = useRef(null);
    const { t, i18n } = useTranslation(['base', 'tool']);

    const handleChange = (newChapters: Chapter[]) => {
        setChapters(newChapters);
    };

    const addNewChapter = () => {
        const newChapter: Chapter = {
            id: Date.now().toString(),
            content: ``,
            type: 'list'
        };
        setChapters([...chapters, newChapter]);
    };

    const handleConfirm = async () => {
        // 这里可以添加确认逻辑，比如保存到后端

        try {
            await generateSlide();
        } catch (error) {
            console.log(error);
        } finally {
            setTyping(false);
        }

        // setSlides(slidesData);
        // setImages(imagesData);
        // setStatus('done');

    };
    const regenerate = () => {
        setStatus('input');
    };
    const generateOutline = async () => {
        if (!reference) {
            referenceRef.current.focus();
            return;
        }
        // 这里可以添加生成大纲的逻辑
        setChapters([]);
        let fileContent;
        if (fileList.length > 0) {
            fileContent = await parseDocuments(fileList);
        }
        const catalog = await generateCatalog(reference + '\n\n' + fileContent, '', '', '');
        const chapters = catalog.slides.map((item) => {
            return {
                id: Date.now().toString() + Math.random(),
                content: item.title,
                type: item.type || 'list'
            };
        });
        setCatalog(catalog);
        setChapters(chapters);

        setStatus('confirm');
    };
    const renderSlide = (slideElements: ISlideItem[], slideImages: {
        title: string;
        images: string[];
    }[], title: string, subTitle: string, status: 'generating' | 'done' = 'generating') => {
        console.log(slideElements, slideImages, title, subTitle, status);
        if (docType === 'chat') {
            setPreview({
                title: title,
                component: (
                    <CardSlideRender
                        slideData={slideElements}
                        slideImages={slideImages}
                        metadata={{ title: title, subject: subTitle, author: 'Your Name', company: 'Your Company' }}
                        status={status}
                    />
                )
            });
        } else {
            if (!msgRef.current) {
                msgRef.current = showMessage(
                    <CardSlideRender
                        status={status}
                        slideData={slideElements}
                        slideImages={[]}
                        metadata={{
                            title: title,
                            subject: subTitle,
                            author: 'Your Name',
                            company: 'Your Company',
                        }} />
                    , 'assistant', 'card');
            } else {
                msgRef.current.update(
                    <CardSlideRender
                        status={status}
                        slideData={slideElements}
                        slideImages={slideImages}
                        metadata={{
                            title: title,
                            subject: subTitle,
                            author: 'Your Name',
                            company: 'Your Company',
                        }}
                    />
                );
            }

        }
    };
    const generateSlide = async () => {
        const title = catalog.title;
        const subTitle = catalog.subtitle;
        const slides = chapters.map((chapter) => {
            return {
                title: chapter.content,
                description: '',
                type: chapter.type
            };
        });
        let slideElements: ISlideItem[] = [];
        let slideImages: { title: string, images: string[] }[] = [];
        let coverImags: {
            src: string;
            width: number;
            height: number;
        }[] = [];
        if (isAddImage) {
            // coverImags = await searchBase64Image(catalog.title, 4)
            const images = await searchImage(catalog.title + ' png jpeg', 4);
            // appendMsg(buildChatMessage(<CardSlideImages title={page.title} images={images} />, 'card', 'assistant'))
            slideImages.push({ title: catalog.title, images });

            coverImags = await getImageSizeByBatch(images.slice(0, 4));
        }
        slideElements.push({
            type: 'cover',
            title: title,
            text: catalog.overview,
            subtitle: subTitle,
            image: coverImags.slice(0, 2)
        }, {
            type: 'catalog',
            title: title,
            text: catalog.overview,
            list: slides.map((item) => {
                return {
                    title: item.title,
                    description: ''
                };
            }),
            image: coverImags.slice(2, 4)
        });
        setStatus('generating');
        setSlides(slideElements);
        setImages(slideImages);
        // renderSlide(slideElements, slideImages, title, subTitle, 'generating')
        let fileContent;
        if (fileList.length > 0) {
            fileContent = await parseDocuments(fileList);
        }
        const allRefer = reference + '\n\n' + fileContent;

        for (let i = 0; i < slides.length; i++) {
            // setTyping(true)
            const item = slides[i];
            try {
                // const refer = allRefer;
                // if (reference && reference.length > 1000) {
                //     const result = await searchStore('input-content', reference, item.description, 3)
                //     refer = result.join('\n');
                // }
                const page = await generatePage(item.title, item.description, catalog.table_of_contents, allRefer, language, item.type);
                console.log(page);
                let images: string[] = [];
                if (isAddImage && page.type == 'list') {
                    images = await searchImage(page.image_search_keywords + ' png jpeg', 4);
                    slideImages = slideImages.concat([{ title: page.title, images }]);
                }
                // setTyping(true)
                let imageList: any[] = [];
                if (images.length > 0) {
                    imageList = await getImageSizeByBatch(images.slice(0, 5));
                    if (imageList.length < 4) {
                        const others = await getImageSizeByBatch(images.slice(5, 10));
                        imageList = imageList.concat(others);
                    }
                }

                slideElements = slideElements.concat([
                    {
                        type: item.type,
                        title: page.title,
                        text: page.content,
                        list: page.list,
                        table: page.table,
                        notes: page.speaker_notes,
                        data: page.data,
                        image: imageList.map((item) => {
                            return {
                                src: item.src,
                                width: item.width,
                                height: item.height
                            };
                        })
                    }
                ]);
                console.log(slideElements);
                setSlides(slideElements);
                setImages(slideImages);
                // renderSlide(slideElements, slideImages, title, subTitle, 'generating')
            } catch (e) {
                console.log(e);
                continue;
            }
        }
        setSlides(slideElements);
        setImages(slideImages);
        setStatus('done');
        // renderSlide(slideElements, slideImages, title, subTitle, 'done')

        // let promp = `Your slides have been generated, please select the appropriate theme and download it. You can click on Slide to select the appropriate template, or click on the image to select the appropriate image.`;
        // if (platform == 'office') {
        //     promp = `Your slides have been generated, please select the appropriate theme and insert it into the current PowerPoint, You can click on Slide to select the appropriate template, or click on the image to select the appropriate image. if you want a better experience, you can go to https://www.sally.bot/chat#/presentation to generate it, thanks!`;
        // } else if (platform == 'google') {
        //     promp = `Your slides have been generated, please select the appropriate theme and insert it into the current PowerPoint or download it, You can click on Slide to select the appropriate template, or click on the image to select the appropriate image. if you want a better experience, you can go to https://www.sally.bot/chat#/presentation to generate it, thanks!`;
        // }
        // const endContent = `Translate follow content into ${language || i18n.resolvedLanguage || 'english'},only output result:\n\n${promp}`;

        // const endMsg = showMessage('', 'assistant');
        // await chatByPrompt('', endContent, {
        //     stream: true,
        // }, (done: boolean, result: IChatResult,) => {
        //     endMsg.update(result.content)
        // })
        // if (docType == 'chat') {
        //     appendMsg(buildChatMessage(<Button onClick={() => {
        //         renderSlide(slideElements, slideImages, title, subTitle, 'done');
        //     }}>{i18n.t('coder:preview', 'Preview')}</Button>, 'card', 'assistant'))
        // }
    };

    const onFileSelect = async (files: File[]) => {
        const oldFiles = fileList.filter((file: File) => !files.some((item: File) => item.name === file.name && item.size === file.size));
        const newFiles = oldFiles.concat(files);
        setFileList(newFiles);
    };
    const onFileRemove = (index: number) => {
        const newFiles = fileList.filter((item, i) => i !== index);
        setFileList(newFiles);
    };

    const init = () => {
        if (!catalog || !catalog.slides) {
            return;
        }
        const chapters = catalog.slides.map((item) => {
            return {
                id: Date.now().toString() + Math.random(),
                content: item.title,
                type: item.type || 'list'
            };
        });
        setChapters(chapters);
        setStatus('confirm');
    };

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        onStatusChange?.(status);
    }, [status]);

    return (
        <div className={cn('w-full h-full p-2 overflow-auto', className)}>
            {
                status == 'input' && (
                    <>
                        <div className='text-sm font-bold '>
                            {t('common.prompt', ' Prompt:')}
                        </div>
                        <Textarea ref={referenceRef} className='min-w-64' placeholder={t('tool:generate_presentation.tip')} rows={2} value={reference} onChange={(e) => setReference(e.target.value)} ></Textarea>
                        <FileList
                            fileList={fileList}
                            onFileRemove={onFileRemove}
                        />
                        {
                            fileList.length == 0 && (
                                <div className='flex flex-row items-center justify-start mt-2'>
                                    <FileSelector
                                        icon={Paperclip} config={{
                                            maxSize: 2000000,
                                            maxFiles: 1,
                                            multiple: false,
                                            accept: {
                                                image: false,
                                                text: true,
                                                xlsx: false
                                            }
                                        }} onSelect={onFileSelect} >
                                        {t('common.attach_file', 'Attach File')}
                                    </FileSelector>
                                </div>
                            )
                        }
                        <Button icon={List} size='sm' variant='default' className='mt-2 sm:w-auto' onClick={generateOutline} >
                            {t('common.generate_outline', 'Generate Outline')}
                        </Button>
                    </>
                )
            }


            {
                status == 'confirm' && (
                    <>
                        <div className='text-sm font-bold'>
                            {t('common.reference', 'Reference')}:
                        </div>
                        <Textarea className='min-w-64' rows={2} value={reference} onChange={(e) => setReference(e.target.value)} ></Textarea>
                        <div className='text-sm font-bold mt-4'>
                            {t('common.outline', 'Outline')}:
                        </div>
                        <DraggableList items={chapters} onChange={handleChange} />
                        <Button size='sm' variant='secondary' onClick={addNewChapter} >
                            {t('common.add_slide', 'Add Slide')}
                        </Button>
                        <div className='text-sm font-bold mt-4'>
                            {t('common.add_mages', ' Add Images')}:
                        </div>
                        <RadioGroup orientation="horizontal" onValueChange={(e) => {
                            return setIsAddImage(e === 'yes');
                        }} className='flex flex-row mt-2' defaultValue={isAddImage ? 'yes' : 'no'} >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="yes" />
                                <Label className='cursor-pointer' htmlFor="yes">{t('common.yes', 'Yes')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="no" />
                                <Label className='cursor-pointer' htmlFor="no">{t('common.no', 'No')}</Label>
                            </div>
                        </RadioGroup>
                        <div className='flex flex-row items-center text-sm font-bold space-x-1 mt-4'>
                            <Button icon={Check} size='sm' onClick={handleConfirm} >
                                {t('common.confirm')}
                            </Button>
                            <Button icon={Undo2} variant='secondary' size='sm' onClick={regenerate} >
                                {t('common.regenerate')}
                            </Button>
                        </div>
                    </>
                )
            }
            {
                (status == 'generating' || status == 'done') && (
                    <CardSlideRender
                        status={status}
                        slideData={slides}
                        slideImages={images}
                        metadata={{
                            title: catalog?.title || 'Title',
                            subject: catalog?.subtitle || 'Sub Title',
                            author: 'Your Name',
                            company: 'Your Company',
                        }}
                        onRegenerate={regenerate}
                    />
                )
            }
        </div>
    );
};

export default ChapterManager;