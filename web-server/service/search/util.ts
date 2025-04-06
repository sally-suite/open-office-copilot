import cheerio from 'cheerio';
import { stripHtml } from "string-strip-html";

const SEARCH_NUM = 2;

function removeTagsScriptsAndWhitespace(input) {
    // console.log(input)
    // // 移除 <style> 标签中的内容
    // let withoutScripts = input
    //   .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    //   .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    //   .replace(/\s+/g, ' ').trim();

    // // // 移除所有的 HTML 标签
    // // let withoutTags = withoutScripts.replace(/<[^>]+>/g, '');

    // // 移除无意义字符
    // return withoutScripts
    // 从html中提取<article>、<main>或<div id="content">或<div id="article">
    const $ = cheerio.load(input);
    const article = $('article').html();
    const main = $('main').html();
    const divContent = $('#content').html();
    const divArticle = $('#article').html();
    // const bodyArticle = $('[data-module=ArticleBody]').html();
    // const docArticle = $('[role=document]').html();
    // const newsContent = $('.news-content').html();
    const divMain = $('#main').html();

    // const tarContent = article || divContent || divArticle || bodyArticle || docArticle || newsContent || divMain || main;
    const tarContent = article || divContent || divArticle || divMain || main || input;
    const result = stripHtml(tarContent).result;
    let withoutScripts = result
        .replace(/(?:https?|ftp)[\n\S]+/gi, '')
        .replace(/\s+/g, ' ').trim();

    return withoutScripts;
}

export const cleanSourceText = (text: string) => {
    return text
        .trim()
        .replace(/(\n){4,}/g, "\n\n\n")
        .replace(/\n\n/g, " ")
        .replace(/ {3,}/g, "  ")
        .replace(/\t/g, "")
        .replace(/\n+(\s*\n)*/g, "\n");
};

interface SearchResult {
    title?: string;
    content: string;
    snippet?: string;
    url: string;
}


export async function getPageContent(url, timeout = 10000): Promise<string> {
    try {
        // Promise.race设置超时
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout while fetching'));
            }, timeout);
        });

        // Fetch请求
        const fetchPromise = fetch(url)
            .then(response => response.text())
            .then(html => removeTagsScriptsAndWhitespace(html));

        // 竞争处理
        const result = await Promise.race([fetchPromise, timeoutPromise]) as string;
        return result;
    } catch (error) {
        console.error('Failed to retrieve page content:', error);
        return null;
    }
}


interface SearchParams {
    engine: "google" | "google_scholar" | "google_scholar_cite" | "google_images" | "baidu" | "bing";
    api_key: string; // Get your API_KEY from https://serpapi.com/manage-api-key
    q?: string;
    data_cid?: string;
    num?: number;
}

export const getSearchapiJson = async (params: SearchParams) => {
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