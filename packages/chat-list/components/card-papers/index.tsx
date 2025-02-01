import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "chat-list/components/ui/dialog";
import { Button } from "chat-list/components/ui/button";
import api from '@api/index';
import { Input } from '../ui/input';
import { Loader2, Quote, Search } from 'lucide-react';
import docApi from '@api/doc';
import { Footnote, PublicationInfo } from 'chat-list/types/api/doc';
import placeholder from './placeholder.json';
import { useTranslation } from 'react-i18next';
import { chatByPrompt, chatByTemplate } from 'chat-list/service/message';
import addCitationPrompt from './add_citation.md';
import { extractJsonDataFromMd } from 'chat-list/utils';
import { cn } from 'chat-list/lib/utils';

interface CitedBy {
    total: number;
    link: string;
    cites_id: string;
    serpapi_scholar_link: string;
}

interface InlineLinks {
    serpapi_cite_link: string;
    cited_by: CitedBy;
    related_pages_link: string;
    serpapi_related_pages_link: string;
    versions: any; // You might want to define a more specific type for versions
    cached_page_link: string;
}



interface SearchPaperResult {
    position: number;
    title: string;
    result_id: string;
    link: string;
    snippet: string;
    publication_info: PublicationInfo;
    inline_links: InlineLinks;
}

interface Citation {
    title: string;
    snippet: string;
}

interface CitationLink {
    name: string;
    link: string;
}

interface CitationModalProps {
    type: 'footnote' | 'cite',
    isOpen: boolean;
    onClose: () => void;
    onCitationSelect: (citation: Citation) => void;
    citations: Citation[];
    links: CitationLink[];
}

function extractFootnoteInfo(data: SearchPaperResult): Footnote {
    console.log(data);
    // 提取作者信息
    const authors = data?.publication_info?.authors ?
        data.publication_info?.authors?.map(author => {
            const [lastName, initials] = author.name.split(' ').reduce((acc, name) => {
                acc[0] = name; // lastName
                acc[1] = acc[1] ? acc[1] + name.charAt(0) + '.' : name.charAt(0) + '.'; // initials
                return acc;
            }, ['', '']);
            return { lastName, initials: initials.trim() };
        }) :
        data?.publication_info?.summary?.match(/(.*?)，|(.+?),/g)?.map(author => {
            const name = author.replace('，', '').replace(',', '').trim();
            const [lastName, ...initialsArr] = name.split(' ');
            const initials = initialsArr.map(n => n.charAt(0) + '.').join('');
            return { lastName, initials };
        });

    // 提取年份
    const yearMatch = data?.publication_info?.summary?.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[0]) : undefined;

    // 提取期刊信息
    const journalName = data?.publication_info?.summary?.replace(/…/g, '').match(/-\s*(.+?)\s*,/)?.[1] || "arXiv preprint"; // 从summary中提取期刊名称并去除省略号

    return {
        authors: authors || [],
        year: year,
        title: data.title.replace(/…/g, ''), // 去除标题中的省略号
        url: data.link,
        journal: {
            name: journalName,
            volume: undefined, // 如果有卷号，可以填入
            pages: undefined    // 如果有页码，可以填入
        }
    };
}

const CitationModal: React.FC<CitationModalProps> = ({ type, isOpen, onClose, onCitationSelect, citations, links }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='px-2 pt-4 h-3/4 w-5/6 overflow-hidden rounded-sm' >
                <DialogHeader>
                    <DialogTitle className='px-2'>选择引用格式</DialogTitle>
                </DialogHeader>
                <div className="py-2 w-full overflow-auto">
                    {citations.map((citation, index) => (
                        <div key={index} className="mb-2 p-2 border rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => onCitationSelect(citation)}>
                            <h3 className="font-bold">{citation.title}</h3>
                            <p className="text-sm text-gray-600">{citation.snippet}</p>
                        </div>
                    ))}
                    <div className='flex flex-row items-center space-x-1'>
                        {links.map((link, index) => (
                            <a key={index} href={link.link} target="_blank" rel="noopener noreferrer" className="block mb-2 text-blue-600 hover:underline">
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PaperCache = new Map<string, SearchPaperResult[]>();

export default function PaperList({ papers }: { papers: SearchPaperResult[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState<SearchPaperResult | null>(null);
    const [citations, setCitations] = useState([]);
    const [links, setLinks] = useState([]);
    const [citaMap, setCitaMap] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [paperList, setPaperList] = useState<SearchPaperResult[]>(papers || []);
    const [citaions, setCitaions] = useState([]);
    const [currentCitation, setCurrentCitation] = useState(0);
    const [loadingPaper, setLoadingPaper] = useState(false);
    const [loadingCitation, setLoadingCitation] = useState(false);
    const [message, setMessage] = useState('');
    const lastText = useRef({ text: '' });
    const [text, setText] = useState('');
    const { t } = useTranslation();
    const [type, setType] = useState<"footnote" | "cite" | ''>('');
    const openModal = useCallback((paper: SearchPaperResult) => {
        setSelectedPaper(paper);
        setIsModalOpen(true);
    }, []);

    const addCite = async (paper: SearchPaperResult) => {
        if (!citaMap[paper.result_id]) {
            const result = await api.getCitation({
                cites_id: paper.result_id
            });
            setCitations(result.citations);
            setLinks(result.links);
            setCitaMap({
                ...citaMap,
                [paper.result_id]: {
                    citations: result.citations,
                    links: result.links
                }
            });
        } else {
            setCitations(citaMap[paper.result_id].citations);
            setLinks(citaMap[paper.result_id].links);
        }
        setType('cite');
        openModal(paper);
    };

    const addFootnote = async (paper: SearchPaperResult) => {
        // if (!citaMap[paper.result_id]) {
        //     const result = await api.getCitation({
        //         cites_id: paper.result_id
        //     })
        //     setCitations(result.citations);
        //     setLinks(result.links)
        //     setCitaMap({
        //         ...citaMap,
        //         [paper.result_id]: {
        //             citations: result.citations,
        //             links: result.links
        //         }
        //     })
        // } else {
        //     setCitations(citaMap[paper.result_id].citations);
        //     setLinks(citaMap[paper.result_id].links)
        // }
        const footnote = extractFootnoteInfo(paper);
        console.log(footnote);
        await docApi.insertFootnote(footnote);
        // setType('footnote')
        // openModal(paper)
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedPaper(null);
    }, []);

    const handleCitationSelect = async (citation: Citation) => {
        // 这里应该调用实际的API来将引用插入Word文档
        // console.log(`Inserting citation: ${citation.title} for paper: ${selectedPaper?.title}`)
        // // 模拟API调用
        // setTimeout(() => {
        //     alert(`已将 ${citation.title} 格式的引用插入到Word文档中。`)
        //     closeModal()
        // }, 1000)
        await docApi.insertText(citation.snippet, { type: 'text' });

    };

    const searchPapers = async (keyword: string) => {
        setPaperList([]);
        setLoadingPaper(true);
        if (PaperCache.has(keyword)) {
            setPaperList(PaperCache.get(keyword) as SearchPaperResult[]);
            setLoadingPaper(false);
        } else {
            const result = await api.searchPapers({
                keyword
            });
            PaperCache.set(keyword, result);
            setPaperList(result);
            setLoadingPaper(false);
        }
        // 这里可以添加额外的搜索逻辑，如果需要的话
        console.log(`Searching for: ${searchTerm}`);
    };
    const handleSearch = async () => {
        setCitaions([]);
        setLoadingCitation(true);
        const result = await chatByTemplate(addCitationPrompt, {
            input: searchTerm,
        }, {
            stream: false
        });
        // console.log(result)
        if (result) {
            const content = result.content;
            const foot = extractJsonDataFromMd(content);
            const footNotes = foot.footnotes;
            console.log(footNotes);
            setCitaions(footNotes);
            setCurrentCitation(0);
            setLoadingCitation(false);
            searchPapers(footNotes[0].title);
        } else {
            searchPapers(searchTerm);
        }
    };

    const renderItem = (paper: any) => {
        return (
            <div key={paper.result_id} className="border p-4 rounded-sm shadow-sm text-sm">
                <a href={paper.link} target="_blank" rel="noopener noreferrer" className="flex hover:underline text-base font-semibold mb-2 overflow-hidden text-ellipsis ">
                    {paper.title}
                </a>
                {/* <h2 className="text-base font-semibold mb-2">
                            {paper.title}
                        </h2> */}
                <p className='px-0 text-sm text-green-700 whitespace-nowrap overflow-hidden text-ellipsis'>
                    {paper.publication_info.summary}
                </p>
                <p className="text-gray-600 mb-2">{paper.snippet}</p>
                <div className='flex flex-row mb-2'>
                    <a target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500" href={paper.link}>
                        {t('paper:view')}
                    </a>
                    <span className="mx-2">|</span>
                    <a target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500" href={paper?.inline_links.cited_by?.link}>
                        {t('paper:cited_by', 'Cited by {{num}}', {
                            num: paper.inline_links?.cited_by?.total || 0
                        })}
                    </a>
                    <span className="mx-2">|</span>
                    <a target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500" href={paper?.inline_links?.related_pages_link}>
                        {t('paper:related_articles', 'Related articles')}
                    </a>
                </div>
                <div className="flex flex-row items-center space-x-1">
                    <Button variant='secondary' size="sm" className='w-auto sm:w-auto' onClick={addFootnote.bind(null, paper)}>
                        {t('paper:add_footnote', 'Add Footnote')}
                    </Button>
                    <Button variant='secondary' size="sm" className='w-auto sm:w-auto' onClick={addCite.bind(null, paper)}>
                        {t('paper:add_cite', 'Add Cite')}
                    </Button>
                </div>
            </div>
        );
    };

    // // 模拟引用数据
    // const mockCitations: Citation[] = [
    //     { title: "MLA", snippet: "Schwertmann, U. T. R. M., and Reginald M. Taylor. Iron oxides. Minerals in soil environments 1 (1989): 379-438." },
    //     { title: "APA", snippet: "Schwertmann, U. T. R. M., & Taylor, R. M. (1989). Iron oxides. Minerals in soil environments, 1, 379-438." }
    // ]

    // const mockLinks: CitationLink[] = [
    //     { name: "BibTeX", link: "https://scholar.googleusercontent.com/scholar.bib?q=info:FDc6HiktlqEJ:scholar.google.com/&output=citation&scisdr=ClGWBVL5GAA:AFWwaeYAAAAAZmF3lHkz3kdCUVvSbM5C_Msq62Q&scisig=AFWwaeYAAAAAZmF3lBXgwnMk3BS3W9KIJ9XaCUs&scisf=4&ct=citation&cd=-1&hl=en" }
    // ]

    const updateContext = async () => {
        const selectedText = await docApi.getSelectedText();
        console.log(selectedText);
        // let data = '';
        // if (selectedText) {
        //     data += `${selectedText}`;
        // }
        setText(selectedText);
        setSearchTerm(selectedText);
        // setDataContext(data);
    };


    useEffect(() => {
        const queryString = window.location.search; // 获取查询字符串
        const params = new URLSearchParams(queryString);
        const keyword = params.get('keyword'); // 获取查询参数 foo

        if (!keyword) {
            return;
        }

        if (keyword) {
            searchPapers(keyword);
        }

    }, []);

    useEffect(() => {
        const unregist = docApi.registSelectEvent((text: string) => {
            if (lastText.current.text === text) {
                return;
            }
            lastText.current.text = text;
            // setText(text);
            updateContext();
        });
        return () => {
            unregist?.();
        };
    }, []);

    useEffect(() => {
        updateContext();
    }, []);

    return (
        <div className="container mx-auto p-0 flex flex-col h-full overflow-auto">
            <div className='p-2'>
                <div className="relative p-0">
                    <Input
                        type="text"
                        placeholder={`${t('paper:select_text', 'Select text')}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 md:w-full"
                    />
                    <Button
                        className="absolute right-0 top-0 h-full px-3 rounded-l-none w-10 sm:w-10 md:w-10"
                        onClick={handleSearch}
                    >
                        {
                            (loadingPaper || loadingCitation) && (
                                <Loader2 height={16} width={16} className={'rotate shrink-0'} />
                            )
                        }
                        {
                            (!loadingPaper && !loadingCitation) && (
                                <Quote className="h-4 w-4" />
                            )
                        }
                    </Button>
                </div>
            </div>
            <div className="space-y-2 overflow-auto p-2">
                {
                    loadingCitation && (
                        <div className='flex flex-col items-center space-y-2 my-4'>
                            <Loader2 height={16} width={16} className={'rotate shrink-0'} />
                            {t('paper:ask_for_citations', ' Asking AI for citations...')}
                        </div>
                    )

                }
                {
                    citaions && citaions.length > 0 && (
                        <div className='border p-2 rounded-sm shadow-sm text-sm space-y-1'>
                            {
                                citaions.map((citation, index) => (
                                    <div key={index} className={cn(
                                        'p-2 cursor-pointer hover:bg-gray-100 rounded-sm',
                                        index == currentCitation ? 'bg-gray-200' : ''
                                    )}
                                        onClick={() => {
                                            setCurrentCitation(index);
                                            searchPapers(citation.title);
                                        }}
                                    >
                                        {citation.title}
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
            {
                !loadingPaper && paperList.length == 0 && (
                    <div className='space-y-2 flex-1 p-2 '>
                        <div className="border p-4 rounded-sm shadow-sm text-sm">
                            <div className="flex hover:underline text-base font-semibold mb-2 overflow-hidden text-ellipsis opacity-10 ">
                                {placeholder.title}
                            </div>
                            <p className="text-gray-600 mb-2 opacity-10">{placeholder.snippet}</p>
                            <div className="flex flex-row items-center space-x-1">
                                <Button variant='secondary' size="sm" className='w-auto sm:w-auto border-2 border-primary' >
                                    {t('paper:add_footnote', 'Add Footnote')}
                                </Button>
                                <Button variant='secondary' size="sm" className='w-auto sm:w-auto  border-2 border-primary' >
                                    {t('paper:add_cite', 'Add Cite')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="space-y-2 flex-1 overflow-auto p-2">
                {
                    loadingPaper && (
                        <div className='flex flex-col items-center space-y-2 my-4'>
                            <Loader2 height={16} width={16} className={'rotate shrink-0'} />
                            {t('paper:searching_papers', '  Searching google scholar...')}
                        </div>
                    )
                }
                {!loadingPaper && paperList.map((paper) => {
                    return renderItem(paper);
                })}
            </div>
            <CitationModal
                type={type}
                isOpen={isModalOpen}
                onClose={closeModal}
                onCitationSelect={handleCitationSelect}
                citations={citations}
                links={links}
            />
        </div>
    );
}