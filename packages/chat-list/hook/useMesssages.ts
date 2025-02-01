import { useState, useMemo, useCallback, useRef } from 'react';
import { uuid } from '../utils';
import { IChatMessages, ChatMessageWithoutId } from '../types/message';



const TIME_GAP = 5 * 60 * 1000;
let lastTs = 0;
const TYPING_ID = '_TYPING_';

const makeMsg = (msg: ChatMessageWithoutId, id?: string) => {
    const ts = msg.createdAt || Date.now();
    const hasTime = msg.hasTime || ts - lastTs > TIME_GAP;

    if (hasTime) {
        lastTs = ts;
    }

    return {
        ...msg,
        _id: msg._id || id || uuid(),
        createdAt: ts,
        position: msg.position || 'left',
        hasTime,
    };
};

export default function useMessages(initialState: ChatMessageWithoutId[] = []) {
    const initialMsgs: IChatMessages = useMemo(() => initialState.map((t) => makeMsg(t)), [initialState]);
    const [messages, setMessages] = useState(initialMsgs);
    const isTypingRef = useRef(false);

    const prependMsgs = useCallback((msgs: IChatMessages) => {
        setMessages((prev: IChatMessages) => [...msgs, ...prev]);
    }, []);

    const updateMsg = useCallback((id: string, msg: ChatMessageWithoutId) => {
        setMessages((prev) => prev.map((t) => (t._id === id ? makeMsg(msg, id) : t)));
    }, []);

    const appendMsg = useCallback((msg: ChatMessageWithoutId) => {
        const newMsg = makeMsg(msg);
        if (isTypingRef.current) {
            isTypingRef.current = false;
            updateMsg(TYPING_ID, newMsg);
        } else {
            setMessages((prev) => [...prev, newMsg]);
        }
    }, []);

    const deleteMsg = useCallback((id: string) => {
        setMessages((prev) => prev.filter((t) => t._id !== id));
    }, []);

    const resetList = useCallback((list: IChatMessages = []) => {
        setMessages(list);
    }, []);
    const setTyping = useCallback(function (typing: boolean) {
        if (typing === isTypingRef.current) return;

        if (typing) {
            appendMsg({
                _id: TYPING_ID,
                type: 'typing'
            });
        } else {
            deleteMsg(TYPING_ID);
        }

        isTypingRef.current = typing;
    }, [appendMsg, deleteMsg]);
    return {
        typing: isTypingRef.current,
        messages,
        prependMsgs,
        appendMsg,
        updateMsg,
        deleteMsg,
        resetList,
        setTyping
    };
}
