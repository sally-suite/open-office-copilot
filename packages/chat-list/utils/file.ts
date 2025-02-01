import mammoth from 'mammoth'
// import pdfjsLib from 'pdfjsLib';
// import pdfjsLib from 'pdfjs-dist'
import { blobToBase64, blobToBase64Image } from './common';
// import second from 'pdfjs-dist'
// import { addIndex } from 'chat-list/service/search';
// import parseImage from './image';
import image from './image'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const pdfjsLib = window?.pdfjsLib;
export function chunkText(text: string, chunkSize: number) {
    if (typeof text !== 'string' || typeof chunkSize !== 'number' || chunkSize <= 0) {
        throw new Error('Invalid input. Please provide a valid string and a positive chunk size.');
    }

    const chunks = [];
    const overlap = 100;
    for (let i = 0; i < text.length; i += chunkSize) {
        if (i == 0) {
            chunks.push(text.slice(i, i + chunkSize));
        } else {
            chunks.push(text.slice(i - overlap, i + chunkSize + overlap));
        }
    }
    return chunks;
}

export function parsePDF(file: File): Promise<string> {
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'path/to/pdf.worker.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.mjs';

    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = function () {
            const typedArray = new Uint8Array(this.result);
            // Using PDF.js to parse PDF content
            const doc = pdfjsLib.getDocument(typedArray);
            doc.promise.then(function (pdfDoc: any) {
                let text = '';

                function extractText(pageNum: number) {
                    return pdfDoc.getPage(pageNum).then(function (page: any) {
                        return page.getTextContent().then(function (textContent: any) {
                            return textContent.items.map(function (item: any) {
                                return item.str;
                            }).join(' ');
                        });
                    });
                }

                // Iterate through each page and extract text
                const numPages = pdfDoc.numPages;
                const promises = Array.from({ length: numPages }, (_, i) => extractText(i + 1));
                Promise.all(promises).then(function (pageTexts) {
                    text = pageTexts.join('\n');
                    resolve(text);
                });
            }).catch(reject);
        };

        fileReader.readAsArrayBuffer(file);
    });
}

// Function to parse Word document and return a Promise
export function parseWord(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function (e) {
            console.log('==========')
            debugger;
            const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
            resolve(result.value);
        };

        fileReader.readAsArrayBuffer(file);
    });
}

// Function to parse Word document and return a Promise
export function parseText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function (e) {
            const textContent = e.target.result as string;
            resolve(textContent);
        };

        fileReader.readAsText(file);
    });
}

export const parseImage = async (file: File) => {
    const base64 = await blobToBase64Image(file);
    const url = image.set(base64, file.name)
    return `![${file.name}](${url})`
}

// Function to handle file input and dispatch parsing based on file type
export function parseDocument(file: File): Promise<string> {
    if (!file) {
        return;
    }
    if (file.type === 'application/pdf') {
        return parsePDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return parseWord(file)
    } else if (file.type === 'text/plain' || file.type == "") {
        return parseText(file);
        // console.error('Unsupported file type');
    }
    else if (file.type.startsWith('image')) {
        // return parseImage(file);
        return Promise.resolve('');
    }
    else {
        return Promise.resolve('');
    }

}

export const parseDocuments = async (files: File[], onSuccess?: (file: File, index: number) => void) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await parseDocument(file);
        if (text) {
            (file as any)['content'] = text
            // const chunks = chunkText(text, 1000)
        }
        await onSuccess?.(file, i)

    }
    const content = files.filter((p: any) => p['content']).map((file: any) => {
        return `# File Name: ${file.name}\n\nFile Content:\n\n${file['content']}`
    }).join('\n');
    return content;
}

export const parseDocContents = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await parseDocument(file);
        if (text) {
            (file as any)['content'] = text
            // const chunks = chunkText(text, 1000)
        }
    }
    return files.filter((p: any) => p['content']).map((f: any) => {
        return {
            name: f.name,
            content: f['content']
        }
    })
}


// export async function parseAndIndex(files: File[], onSuccess?: (file: File, index: number) => void) {
//     const fileContents = await parseDocContents(files);
//     for (let i = 0; i < fileContents.length; i++) {
//         const { name, content } = fileContents[i];
//         const chunks = chunkText(content, 1000);
//         // for (let j = 0; j < chunks.length; j++) {
//         //     const chunk = chunks[j];
//         //     addIndex(name + j, chunk);
//         // }
//         addIndex(name, chunks);
//         await onSuccess?.(null, i)
//     }
// }



export function formatFileSize(fileSizeInBytes: number) {
    if (fileSizeInBytes < 1024) {
        return fileSizeInBytes + ' B';
    } else if (fileSizeInBytes < 1024 * 1024) {
        return (fileSizeInBytes / 1024).toFixed(2) + ' KB';
    } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
        return (fileSizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}
