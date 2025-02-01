import React, { useEffect, useState } from 'react';
import api from '@api/index';
import { useParams } from 'react-router-dom'

import Loading from '../loading';
import { Edit, Trash } from 'lucide-react';
// import plugins from '../trans-box/plugins';
export interface INoteListProps {
    onSelect: (note: any) => void;
}
export default function BookMarks(props: INoteListProps) {
    const { onSelect } = props;
    const [list, setList] = useState([])
    const params = useParams();
    const [current, setCurrent] = useState(params.agent)
    const [loading, setLoading] = useState(true)
    const init = async () => {
        setLoading(true);
        const list = await api.getBookmarkList({
            type: 'sheet',
            agent: 'jupyter'
        })

        setList(list)
        setLoading(false);
    }
    const loadMarks = async (agent: string) => {
        setLoading(true);
        setCurrent(agent);
        const list = await api.getBookmarkList({
            type: 'sheet',
            agent: 'jupyter'
        })
        setList(list)
        setLoading(false);
    }
    const onRemove = async (id: string) => {
        await api.removeBookmark({ id });
        await loadMarks(current)
    }
    const onSelectNote = async (item: any) => {
        onSelect(item.data)
    }

    useEffect(() => {
        init();
    }, [])
    if (loading) {
        return (
            <div className='flex flex-col flex-1 overflow-y-auto bg-white'>
                <Loading className='h-40' />
            </div>
        )
    }
    return (
        <div className='flex flex-col flex-1 overflow-y-auto bg-white text-sm'>
            {
                list.map((item: { id: string, name: string }) => {
                    return (
                        <div key={item.id} className='flex flex-row items-center px-2 p-1 border-b hover:bg-gray-100 cursor-pointer ' onClick={() => onSelectNote(item)} >
                            <span className='flex-1'>
                                {item.name}
                            </span>
                            <span className='ml-2 cursor-pointer text-slate-600' onClick={() => onSelectNote(item)}>
                                <Edit height={16} width={16} />
                            </span>
                            <span className='ml-2 cursor-pointer text-slate-600' onClick={() => onRemove(item.id)}>
                                <Trash height={16} width={16} />
                            </span>
                        </div>
                    )
                })
            }
            {
                list.length === 0 && <div className='flex justify-center items-center h-full'>No Notes</div>
            }
        </div>
    )
}
