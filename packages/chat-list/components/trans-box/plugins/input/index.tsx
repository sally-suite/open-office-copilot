import { IPagePlugin } from '../types';
import { Type } from 'lucide-react';
import WritingComponent from './writing';

const Writing: IPagePlugin = {
    id: 'input',
    name: 'Input',
    icon: Type,
    shortcut: 'i',
    component: WritingComponent
}

export default Writing;