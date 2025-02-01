import { chunkText } from "./file";
import gptApi from '@api/gpt';

const vectorStore = new Map<string, { vectors: number[][], chunks: string[] }>();

function euclideanDistance(vector1: number[], vector2: number[]) {
    if (vector1.length !== vector2.length) {
        throw new Error("Vectors must have the same length");
    }

    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
        sum += Math.pow(vector1[i] - vector2[i], 2);
    }

    return Math.sqrt(sum);
}

export function searchIndex(targetVector: number[], vectors: number[][], k = 3): number[] {
    if (vectors.length === 0 || k <= 0) {
        return []; // 没有向量可供比较或 k 不合法
    }

    // 在每个向量上添加一个原始索引
    const vectorsWithIndex = vectors.map((vector, index) => ({ vector, originalIndex: index }));

    // 计算距离并排序
    const distances = vectorsWithIndex.map(item => ({
        vector: item.vector,
        originalIndex: item.originalIndex,
        distance: euclideanDistance(targetVector, item.vector)
    }));
    // console.log(JSON.stringify(distances.map(p => [p.originalIndex, p.distance])));
    distances.sort((a, b) => a.distance - b.distance);
    // console.log(distances)
    // 返回排序前的索引
    return distances.slice(0, k).map(item => item.originalIndex);
}
const CHUNCK_SIZE = 2000;
export const createStore = async (fileId: string, text: string,) => {
    if (!text) {
        return;
    }
    if (vectorStore.has(fileId)) {
        return vectorStore.get(fileId);
    }
    const values = [];
    const pageSize = text.length / 20;
    const chunkSzie = pageSize < CHUNCK_SIZE ? CHUNCK_SIZE : Math.round(pageSize);
    const chunks = chunkText(text, chunkSzie);
    for (let j = 0; j < chunks.length; j++) {
        const result = await gptApi.embeddings({
            model: 'text-embedding-ada-002',
            input: chunks[j]
        });
        values.push(result);
    }

    vectorStore.set(fileId, {
        vectors: values,
        chunks: chunks
    });
    return vectorStore.get(fileId);
};

export const searchStore = async (fileId: string, fileContent: string, query: string, k = 3) => {
    try {


        if (!vectorStore.has(fileId)) {
            await createStore(fileId, fileContent);
        }
        if (vectorStore.has(fileId)) {
            const { vectors, chunks } = vectorStore.get(fileId);
            if (vectors) {
                const targetVector = await gptApi.embeddings({
                    model: 'text-embedding-ada-002',
                    input: query
                });
                const indexs = searchIndex(targetVector, vectors, k);

                return chunks.filter((_, i) => indexs.includes(i));
            }
        }
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
};