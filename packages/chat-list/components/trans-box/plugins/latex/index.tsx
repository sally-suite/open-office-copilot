import { IPagePlugin } from '../types';
import { Braces, } from 'lucide-react';
import WritingComponent from './writing';
import menu from './menu'
const Writing: IPagePlugin = {
    id: 'latex',
    name: 'LaTeX',
    icon: Braces,
    button: menu,
    mode: 'inline',
    shortcut: 'e',
    component: WritingComponent,
    // width: 450,,
    hideTip: true
}

export default Writing;