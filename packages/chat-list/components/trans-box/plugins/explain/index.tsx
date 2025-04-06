import { IPagePlugin } from '../types';
import { ScanSearch } from 'lucide-react';
// import Component from './chat';
import Writing from './writing'
import React from 'react';
import Container from '../../container';

const Expplain: IPagePlugin = {
    id: 'explanation',
    name: 'Explanation',
    icon: ScanSearch,
    shortcut: 'e',
    component: Writing,
    width: 450,
    mode: 'dialog'
}

export default Expplain;