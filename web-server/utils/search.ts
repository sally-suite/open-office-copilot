
interface SearchParams {
    engine: "google_scholar" | "google_scholar_cite";
    api_key: string; // Get your API_KEY from https://serpapi.com/manage-api-key
    q?: string;
    data_cid?: string;
    num: number;
}

export const getJson = async (params) => {
    const url = "https://www.searchapi.io/api/v1/search";
    const queryParams = new URLSearchParams(params as any).toString();

    try {
        const response = await fetch(`${url}?${queryParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}