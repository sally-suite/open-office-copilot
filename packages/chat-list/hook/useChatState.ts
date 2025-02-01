import { useContext } from 'react'
import { ChatContext } from '../store/chatContext'

export default function useChatState() {
    const state = useContext(ChatContext);
    return state;
}