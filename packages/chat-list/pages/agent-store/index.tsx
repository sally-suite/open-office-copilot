// src/components/AgentStore.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import prompts from 'chat-list/data/prompts/en-US.json';
import Button from 'chat-list/components/button';
import lunr from 'lunr';
import Loading from 'chat-list/components/loading';
import { Input } from 'chat-list/components/ui/input';
import { debounce } from 'chat-list/utils/common';
import { cn } from 'chat-list/lib/utils';

const AgentStore = () => {
    const [waiting, setWaiting] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [matchs, setMatchs] = useState([]);
    const [showState, setShowState] = useState<{ [x: string]: boolean }>({});
    const index = useRef(null);
    const search = useCallback(debounce((keyword: string) => {
        onSearch(keyword);
    }, 500), []);
    const onSearch = (keyword: string) => {
        const results = index.current.search(keyword);
        setMatchs(results.map((item: any) => prompts[item.ref]));
    };
    const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
        search(e.target.value);
    };
    const onShowMore = (id: string) => {
        setShowState({
            ...showState,
            [id]: !showState[id]
        });
    };
    const init = () => {
        setWaiting(true);
        const idx = lunr(function () {
            this.ref('id');
            this.field('act');
            this.field('prompt');
            prompts.forEach((item, i) => {
                this.add({
                    "id": i,
                    "act": item.act,
                    "prompt": item.prompt
                });
            });

        });
        index.current = idx;
        setWaiting(false);
    };
    useEffect(() => {
        init();
    }, []);
    // console.log(showState)
    return (
        <div className="container mx-auto p-4 h-screen overflow-auto">
            <div className="flex flex-row justify-between mb-4 space-x-1">
                <Input
                    value={keyword}
                    type="text"
                    className="border border-gray-300 p-2 w-full"
                    placeholder="Search..."
                    onChange={onKeywordChange}
                />
            </div>
            {
                waiting && (
                    <Loading />
                )
            }

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {
                    matchs.length > 0 && matchs.map((item, i) => {
                        return (
                            <div key={item.act} className="bg-white p-4 border border-gray-300 rounded">
                                <h2 className="text-lg font-bold mb-2">
                                    {item.act}
                                </h2>
                                <p className={cn("text-gray-600 mb-2  text-ellipsis", showState[item.act] ? "" : "max-h-16 overflow-hidden")}>
                                    {item.prompt}
                                </p>
                                <div className=' text-primary text-sm text-center sm:text-right cursor-pointer' onClick={onShowMore.bind(null, item.act)}>
                                    {
                                        showState[item.act] ? "Hide" : "More"
                                    }
                                </div>
                                <Button className=" text-white px-2 py-2 rounded">Install</Button>
                            </div>
                        );
                    })
                }
                {
                    matchs.length == 0 && prompts.map((item) => {
                        return (
                            <div key={item.act} className="bg-white p-4 border border-gray-300 rounded">
                                <h2 className="text-lg font-bold mb-2">
                                    {item.act}
                                </h2>
                                <p className={cn("text-gray-600 mb-2  text-ellipsis", showState[item.act] ? "" : "max-h-16 overflow-hidden")}>
                                    {item.prompt}
                                </p>
                                <div className=' text-primary text-sm text-center sm:text-right cursor-pointer' onClick={onShowMore.bind(null, item.act)}>
                                    {
                                        showState[item.act] ? "Hide" : "More"
                                    }
                                </div>
                                <Button className=" text-white px-2 py-2 rounded">Install</Button>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
};

export default AgentStore;
