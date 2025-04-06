import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useChatState from 'chat-list/hook/useChatState';
import ChatHeader from 'chat-list/components/header';
import Loading from '../loading';
import { getSessionsPaginated, Session, deleteSession, clearAllSessions, searchSessions } from '../../service/history';
import imageStore from 'chat-list/utils/image';
import { AlertCircle, Eraser, Search, Trash2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import useLocalStore from 'chat-list/hook/useLocalStore';
import Tooltip from '../tooltip';
import { useAlert } from '../ui/use-alert';
import { Input } from '../ui/input';
import { debounce } from 'chat-list/utils'
import { IChatPlugin } from 'chat-list/types/plugin';
import Avatar from '../avatars';


export default function ChatHistory() {
    const { t } = useTranslation('base');
    const navigate = useNavigate();
    // const params = useParams();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [current] = useState('all');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { plugins, resetList } = useChatState();
    const [agentMap, setAgentMap] = useState<{ [key: string]: IChatPlugin }>({})
    const { value: tipVisible, setValue: setTipVisible } = useLocalStore('sally-chat-history-tip', "1");
    const { showAlert } = useAlert();

    const observer = useRef<IntersectionObserver>();
    const lastSessionElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore(current);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, current, loadingMore]);

    const ITEMS_PER_PAGE = 20;


    const loadMore = async (agent: string) => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const newSessions = await getSessionsPaginated(page * ITEMS_PER_PAGE, ITEMS_PER_PAGE);
            const filteredSessions = agent === 'all' ? newSessions : newSessions.filter(session => session.agent === agent);

            if (filteredSessions.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }

            setSessions(prev => [...prev, ...filteredSessions]);
            setPage(prev => prev + 1);
        } catch (error) {
            console.error('Failed to fetch more sessions:', error);
        }
        setLoadingMore(false);
    };

    const loadSessions = async (agent: string) => {
        setLoading(true);
        setPage(0);
        setHasMore(true);
        try {
            const initialSessions = await getSessionsPaginated(0, ITEMS_PER_PAGE);
            if (agent === 'all') {
                setSessions(initialSessions);
            } else {
                setSessions(initialSessions.filter(session => session.agent === agent));
            }
            if (initialSessions.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
            setPage(prev => prev + 1);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
        setLoading(false);
    };

    const restore = (session: Session) => {
        navigate(`/${session.agent}`);
        resetList(session.messages);
        imageStore.load(session.images);
        const plg = plugins.find(p => p.action === session.agent);
        if (plg) {
            plg.conversationId = session.id;
            plg.memory = session.memory;
        }
    }

    const removeSession = async (sessionId: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        deleteSession(sessionId);
        await loadSessions(current);
    }

    const onBack = () => {
        navigate(-1);
    };

    const closeTip = () => {
        setTipVisible("2");
    };

    const clearHistory = () => {
        // TODO: clear history
        showAlert({
            title: t('common.clear_history'),
            description: t('common.clear_history_tip'),
            confirmText: t('common.confirm'),
            cancelText: t('common.cancel'),
            onConfirm: () => {
                clearAllSessions();
                loadSessions(current);
            }
        })
    }
    // const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value;
    //     const list = await searchSessions(value, 'input');
    //     setSessions(list);
    // }
    const onInputChange = useCallback(debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const list = await searchSessions(value, 'input');
        setSessions(list);
    }, 1000), []);

    const initAgentMap = () => {
        const map: { [key: string]: IChatPlugin } = {};
        plugins.forEach(p => {
            map[p.action] = p;
        })
        console.log(plugins)
        setAgentMap(map);
    }
    useEffect(() => {
        initAgentMap();
        loadSessions(current);
    }, [current])

    const renderSession = (session: Session) => {
        const firstMessage = session.messages[0]?.content || 'No message content';

        return (
            <div
                key={session.id}
                className="bubble text group p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={restore.bind(null, session)}
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                        {/* {plugins.find(p => p.action === session.agent)?.name || session.agent} */}
                        {/* {agentMap[session.agent]?.icon &&} */}
                        <Avatar icon={agentMap[session.agent]?.icon} name={agentMap[session.agent]?.name} />
                    </span>
                    <span className="text-xs text-gray-500">
                        {session.model}
                    </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                    {firstMessage}
                </p>
                <div className="flex flex-row items-center justify-between text-xs text-gray-400 mt-1">
                    <span>
                        {new Date(session.createdAt).toLocaleString()}
                    </span>
                    <Button className='ml-2 h-6 w-6 p-0' onClick={removeSession.bind(null, session.id)} variant='ghost' size='sm' >
                        <Trash2 height={18} width={18} className=' shrink-0' />
                    </Button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className='flex flex-col flex-1 overflow-y-auto bg-white'>
                <ChatHeader onBack={onBack} title={t('common.chat_history')} />
                {/* <div className='flex flex-row text-sm px-2 py-1 flex-wrap w-full'>
                    <div className={cn(
                        'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                        current === 'all' && 'bg-primary text-white'
                    )}
                        onClick={() => setCurrent('all')}
                    >
                        {t('common.all')}
                    </div>
                    {plugins.map((plg) => (
                        <div
                            key={plg.action}
                            className={cn(
                                'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                                current === plg.action && 'bg-primary text-white'
                            )}
                            onClick={() => setCurrent(plg.action)}
                        >
                            {plg.name}
                        </div>
                    ))}
                </div> */}
                <div className='p-2 relative'>
                    <Search height={18} width={18} className=' absolute left-0 top-1/2 transform -translate-y-1/2' />
                    <Input className='h-8 pl-8' placeholder={t('common.search', "Search")} onChange={onInputChange}></Input>
                </div>
                <Loading className='h-40' />
            </div>
        );
    }

    return (
        <div className='flex flex-col flex-1 overflow-y-auto bg-white h-screen'>
            <ChatHeader onBack={onBack} title={t('common.chat_history')} >
                <Tooltip tip={t('common.clear_all_history', "Clear all chat history")} className='mr-2'>
                    <Eraser onClick={clearHistory} width={18} height={18} className=' text-gray-500 hover:text-gray-700 cursor-pointer' />
                </Tooltip>
            </ChatHeader>
            <div className='p-2 relative'>
                <Search height={18} width={18} className=' absolute left-4 top-1/2 transform -translate-y-1/2' />
                <Input className='w-full h-8 pl-8' placeholder={t('common.search', "Search")} onChange={onInputChange}></Input>
            </div>
            {/* <div className='flex flex-row text-sm px-2 py-1 flex-wrap w-full'>
                <div className={cn(
                    'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                    current === 'all' && 'bg-primary text-white'
                )}
                    onClick={() => setCurrent('all')}
                >
                    {t('common.all')}
                </div>
                {plugins.map((plg) => (
                    <div
                        key={plg.action}
                        className={cn(
                            'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                            current === plg.action && 'bg-primary text-white'
                        )}
                        onClick={() => setCurrent(plg.action)}
                    >
                        {plg.name}
                    </div>
                ))}
            </div> */}
            {
                tipVisible === "1" && (
                    <div className='p-2'>
                        <Alert className=' relative items-start'>
                            <AlertCircle className="h-5 w-5 shrink-0 " />
                            <AlertDescription className='pr-5'>
                                {t('common.history_alert')}
                            </AlertDescription>
                            <div className='absolute top-1 w-5 h-5 right-1 '>
                                <XCircle onClick={closeTip} className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer" />
                            </div>
                        </Alert>
                    </div>
                )
            }

            <div className='message-list pb-14 flex flex-col space-y-2 p-2 overflow-auto sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'>
                {sessions.map((session) => renderSession(session))}

                <div ref={lastSessionElementRef}  >
                    {loadingMore && (
                        <div className="col-span-2 flex justify-center py-4">
                            <Loading className='h-8 w-8' />
                        </div>
                    )}
                </div>
            </div>
            {sessions.length === 0 && (
                <div className='flex justify-center items-center text-sm'>
                    {t('common.no_history')}
                </div>
            )}
        </div>
    );
}
