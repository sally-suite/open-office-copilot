import { IPagePlugin } from '../types';
import { PencilLine } from 'lucide-react';
import WritingComponent from './writing';
import Menu from './menu'
const Writing: IPagePlugin = {
    id: 'writing',
    name: 'Writing',
    icon: PencilLine,
    button: Menu,
    mode: 'inline',
    component: WritingComponent,
    shortcut: 'e',
    // width: 450,,
    hideTip: true
}

export default Writing;