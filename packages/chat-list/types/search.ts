export interface SearchResult {
    title?: string;
    content: string;
    snippet?: string;
    url: string;
}

export interface ImageSearchResult {
    title?: string;
    imageUrl?: string
}


interface PublicationInfo {
    summary: string;
}

interface CitedBy {
    total: number;
    link: string;
    cites_id: string;
    serpapi_scholar_link: string;
}

interface Versions {
    total: number;
    link: string;
    cluster_id: string;
    serpapi_scholar_link: string;
}

interface InlineLinks {
    serpapi_cite_link: string;
    cited_by: CitedBy;
    related_pages_link: string;
    serpapi_related_pages_link: string;
    versions: Versions;
    cached_page_link: string;
}

export interface SearchPaperResult {
    position: number;
    title: string;
    result_id: string;
    link: string;
    snippet: string;
    publication_info: PublicationInfo;
    inline_links: InlineLinks;
}