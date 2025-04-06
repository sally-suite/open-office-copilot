import React, { useEffect, useState } from 'react';
import api from '@api/index';
import { DocType, IQuickPrompt } from 'chat-list/types/plugin';


export default function usePrompts(type: DocType) {
    const [prompts, setPrompts] = useState<IQuickPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const loadPrompts = async () => {
        try {
            setLoading(true);
            const list = await api.getUserPrompts({ type });
            setPrompts(list);
            setLoading(false);
        } catch (e) {
            console.log(e)
        }
    }
    const addPrompts = async (name: string, prompt: string, id?: string,) => {
        try {
            const list = await api.addUserPrompt({ id, name, prompt, type });
            setPrompts(list);
        } catch (e) {
            console.log(e)
        }
    }

    const removePropmt = async (id: string) => {
        try {
            await api.removeUserPrompt({ id });
        } catch (e) {
            console.log(e)
        }
    }

    return {
        loading,
        setLoading,
        prompts,
        setPrompts,
        addPrompts,
        loadPrompts,
        removePropmt
    }
}
