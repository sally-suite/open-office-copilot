import { IPagePlugin } from '../types';
import { PencilLine } from 'lucide-react';
import WritingComponent from './writing';

const Writing: IPagePlugin = {
    id: 'writing',
    name: 'Writing',
    icon: PencilLine,
    shortcut: 'w',
    component: WritingComponent,
    width: 450
}

export default Writing;