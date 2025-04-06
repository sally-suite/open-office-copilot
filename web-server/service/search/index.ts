import { ImageItem, PaperItem, SearchResult } from "@/types/search";
import { getConfig } from '@/service/config';
import Baidu from './baidu';
import Google from './google';

const Providers = {
    baidu: Baidu,
    google: Google
}


export const search = async (input: string): Promise<SearchResult[]> => {
    const config = await getConfig('search_text') as {
        searchEngine: string,
        apiKey: string,
    }
    if (!config) {
        throw new Error(`Config not found`)
    }
    const searchEngine = Providers[config.searchEngine]
    if (!searchEngine) {
        throw new Error(`Search engine ${config.searchEngine} not found`);
    }
    const engine = Providers[config.searchEngine]
    console.log(config)
    return engine.search(input, config.apiKey)
}


export const searchImages = async (input: string, num = 5): Promise<ImageItem[]> => {
    const config = await getConfig('search_image')
    if (!config) {
        throw new Error(`Config not found`)
    }
    const searchEngine = Providers[config.searchEngine]
    if (!searchEngine) {
        throw new Error(`Search engine ${config.searchEngine} not found`);
    }
    const engine = Providers[config.searchEngine]

    return engine.searchImages(input, num, config.apiKey)
}


export const searchNews = async (input: string): Promise<SearchResult[]> => {
    const config = await getConfig('search')
    return []

}

export const searchPapers = async (q: string): Promise<PaperItem[]> => {
    const config = await getConfig('search')
    return []
}