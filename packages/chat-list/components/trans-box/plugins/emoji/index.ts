import { IPagePlugin } from '../types';
import { SmilePlus } from 'lucide-react';
import Component from './chat';

const Writing: IPagePlugin = {
    id: 'emoji',
    name: 'Emoji',
    icon: SmilePlus,
    shortcut: 'm',
    component: Component
}

export default Writing;