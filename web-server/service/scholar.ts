const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch("YOUR_API_KEY");

// 查询 Google Scholar，返回论文列表
async function fetchPapers(query) {
    return new Promise((resolve, reject) => {
        search.json({
            engine: "google_scholar",
            q: query,
            hl: "en"
        }, (data) => {
            const papers = data.organic_results.map(result => ({
                title: result.title,
                link: result.link,
                citation_id: result.inline_links.cite,
            }));
            resolve(papers);
        });
    });
}

// 使用citation_id获取APA引用
async function fetchCitationAPA(citationId) {
    return new Promise((resolve, reject) => {
        search.json({
            engine: "google_scholar_cite",
            q: citationId
        }, (data) => {
            const apaCitation = data.citations.find(cite => cite.title === 'APA').snippet;
            resolve(apaCitation);
        });
    });
}
