export interface ImageInfo {
    title: string;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    thumbnailUrl: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    source: string;
    domain: string;
    link: string;
    googleUrl: string;
    position: number;
}

export interface ImageItem {
    title: string;
    imageUrl: string;
}

export interface SearchParameters {
    q: string;
    type: string;
    engine: string;
    num: number;
}

export interface ImageSearchResult {
    searchParameters: SearchParameters;
    images: ImageInfo[];
}

export interface PaperItem {
    title: string;
    link: string;
    publicationInfo: string;
    snippet: string;
    year: number;
    citedBy: number;
    pdfUrl: string;
    id: string;
}

export interface SearchResult {
    content: string;
    url: string;
    title?: string;
    date?: string;
    snippet?: string;
}