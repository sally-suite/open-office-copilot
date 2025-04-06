import { IPagePlugin } from '../types';
import { MessagesSquare } from 'lucide-react';
import Component from './chat';

const Writing: IPagePlugin = {
    id: 'chat',
    name: 'Chat',
    icon: MessagesSquare,
    shortcut: 'o',
    component: Component,
    width: 450,
    mode: 'dialog'
}

export default Writing;