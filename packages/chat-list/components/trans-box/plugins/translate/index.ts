import { IPagePlugin } from '../types';
import { Languages } from 'lucide-react';
import Component from './translate';
import menu from './menu';

const Writing: IPagePlugin = {
    id: 'translation',
    name: 'Translation',
    icon: Languages,
    shortcut: 't',
    button: menu,
    component: Component,
    width: 450,
    mode: 'dialog',
    hideTip: true,
}

export default Writing;