import { ITool } from 'chat-list/types/plugin';
import createImage from './create-image';
import searchImage from './search-image';
import search from './search'
import searchPaper from './search_papers'
import searchNews from './search-news'
// import chatWithSite from './chat-with-site'

export const tools: ITool[] = [
    createImage,
    searchImage,
    search,
    searchPaper,
    searchNews,
    // chatWithSite
];

export default tools;