import { arrayToMarkdownTable, letter2columnNum, loadScript, memoize, numberToLetter } from "chat-list/utils";
import { PyodideInterface } from 'pyodide'
import XLSX from 'xlsx';
import sheetApi from '@api/sheet'
import { getValues } from 'chat-list/service/sheet';
import image from 'chat-list/utils/image';
import { getLocalStore, setLocalStore } from "chat-list/local/local";

export const createXlsxFile = async (sheetName?: string) => {
    const sheetInfo = await sheetApi.getSheetInfo();

    if (!sheetInfo) return;

    let sheets = sheetInfo.sheets;
    if (sheetName) {
        if (sheets.includes(sheetName)) {
            sheets = [sheetName];
        }
    }
    const ps = sheets.map(async (name) => {
        const values = await getValues(0, name, {
            range: 'default'
        });
        return {
            name,
            values
        }
    });
    const sheetValues = await Promise.all(ps)
    // 创建新的 Workbook 对象
    // const wb = XLSX.utils.book_new();
    // // 创建新的工作表对象
    // sheetValues.forEach(({ name, values }) => {
    //     const ws = XLSX.utils.aoa_to_sheet(values);
    //     // ws['!ref'] = `A1:${XLSX.utils.encode_cell({ c: values[0].length - 1, r: values.length - 1 })}`;
    //     XLSX.utils.book_append_sheet(wb, ws, name);
    // });
    // const wboutArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    // return wboutArrayBuffer;


    const workbook = XLSX.utils.book_new();
    // 创建并填充工作表
    sheetInfo.sheetInfo.forEach(sheetData => {
        const worksheet = XLSX.utils.aoa_to_sheet([]);

        // 设置标题
        sheetData.headers.forEach(header => {
            XLSX.utils.sheet_add_aoa(worksheet, [[header.name]], { origin: header.addr });
        });

        // 填充数据，从标题的下一行开始
        const dataStartRow = sheetData.headers[0].row + 1;
        const dataStartAddr = `${numberToLetter(sheetData.headers[0].column)}${dataStartRow}`;

        const values = sheetValues.find(s => s.name === sheetData.sheetName)?.values;
        XLSX.utils.sheet_add_aoa(worksheet, values.slice(1), { origin: dataStartAddr });

        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetData.sheetName);
    });
    const wboutArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return wboutArrayBuffer;
}

export const readXlsxFileToJson = async (path: string): Promise<{ name: string, data: any[][] }[]> => {
    const pyodide = await initEnv();

    const modifiedFileData = pyodide.FS.readFile(path, { encoding: "binary" });
    const workbook = XLSX.read(modifiedFileData, { type: "array" });
    // 遍历 workbook.SheetNames，获取二维数组数据 
    const results: { name: string, data: any[][] }[] = [];
    for (let i = 0; i < workbook.SheetNames.length; i++) {
        const name = workbook.SheetNames[i];
        const worksheet = workbook.Sheets[name];

        // 获取工作表的范围
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        // 定义范围以包括数据之前和左面的空白单元格
        const newRange = {
            s: { r: 0, c: 0 },
            e: range.e
        };
        // 更新工作表的范围
        worksheet['!ref'] = XLSX.utils.encode_range(newRange);
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });
        console.log(jsonData)
        results.push({
            name,
            data: jsonData
        });
    }

    return results;
}

export const readCsvFileToJson = async (path: string): Promise<{ name: string, data: any[][] }[]> => {
    const pyodide = await initEnv();
    const modifiedFileData = pyodide.FS.readFile(path, { encoding: "binary" });
    const arrayBuffer = new Uint8Array(modifiedFileData).buffer;
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    // 遍历 workbook.SheetNames，获取二维数组数据 
    const results: { name: string, data: any[][] }[] = [];
    for (let i = 0; i < workbook.SheetNames.length; i++) {
        const name = workbook.SheetNames[i];
        const worksheet = workbook.Sheets[name];
        const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        results.push({
            name,
            data: jsonData
        });
    }

    return results;
}

export async function getPngBase64(fileArrayBuffer: Buffer) {
    const fileBlob = new Blob([new Uint8Array(fileArrayBuffer)], { type: 'image/png' });
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onload = function (event: ProgressEvent<FileReader>) {
            resolve(event.target.result.split(',')[1]);
        };
        fileReader.onerror = function (error) {
            reject(error);
        };
        fileReader.readAsDataURL(fileBlob);
    });
}

export const readFileToBase64Image = async (path: string) => {
    const pyodide = await initEnv();
    const fileArrayBuffer = await pyodide.FS.readFile(path);
    const base64 = await getPngBase64(fileArrayBuffer);
    const ext = path.split('.').pop();
    const base64Image = `data:image/${ext};base64,${base64}`;
    return base64Image;
}

export const readFileToText = async (path: string) => {
    const pyodide = await initEnv();
    const modifiedFileData = pyodide.FS.readFile(path, { encoding: "binary" });
    const text = new TextDecoder("utf-8").decode(modifiedFileData);
    return text;
}

export const getPackages = (): string[] => {
    const pkgs = getLocalStore('python_packages');
    return pkgs || ['pandas', 'matplotlib', 'numpy', 'openpyxl', 'seaborn', 'tabulate'];
}

export const addPackages = (packages: string[] = []) => {
    const existingPackages = new Set(getPackages());
    const uniqueNewPackages = packages.filter((packageItem) => !existingPackages.has(packageItem));
    const mergedPackages = [...existingPackages, ...uniqueNewPackages];
    setLocalStore('python_packages', mergedPackages)
}

export const initEnv = memoize<(packages?: string[]) => Promise<PyodideInterface>>(async (packages: string[] = []): Promise<PyodideInterface> => {
    console.log('Initializing Python environment, please wait for a moment...');
    await loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');
    const pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    const pkgs = getPackages();
    if (packages.length > 0) {
        pkgs.push(...packages)
    }
    await micropip.install(pkgs);
    console.log('Initializing Python environment ends.')
    return pyodide;
});

export const pipInstall = async (packages: string[] = []) => {
    if (!packages || packages.length <= 0) {
        return;
    }
    const env = await initEnv();
    await env.loadPackage("micropip");
    const micropip = env.pyimport("micropip");
    await micropip.install(packages);
    addPackages(packages)
    return env;
}

export async function checkDirectoryExists(directoryPath: string) {
    try {
        const pyodide = await initEnv();
        const stats = await pyodide.FS.stat(directoryPath);
        return pyodide.FS.isDir(stats.mode);
    } catch (error) {
        // 如果发生错误，则说明文件夹不存在
        return false;
    }
}

export async function checkFileExists(directoryPath: string) {
    try {
        const pyodide = await initEnv();
        const stats = await pyodide.FS.stat(directoryPath);
        return pyodide.FS.isFile(stats.mode);
    } catch (error) {
        // 如果发生错误，则说明文件夹不存在
        return false;
    }
}

export async function emptyDirectory(folder: string, fs: any) {
    try {
        const contents = fs.readdir(folder);
        for (let i = 0; i < contents.length; i++) {
            const dir = contents[i];
            if (dir !== "." && dir !== "..") {
                const itemPath = `${folder}/${dir}`;
                console.log(itemPath)
                const exist = await checkDirectoryExists(itemPath)
                if (exist) {
                    await emptyDirectory(itemPath, fs); // 递归删除子目录
                    fs.rmdir(itemPath); // 删除空子目录
                } else {
                    fs.unlink(itemPath); // 删除文件
                }
            }

        }
    } catch (e) {
        console.log(e)
    }
}

export const clearFolder = async (folder: string) => {
    const env = await initEnv();
    // 使用 pyodide 初始化 input 文件夹，判断文件夹是否存在，如果存在，先删除，再创建,使用pyodide的FS API
    const fs = env.FS;
    await emptyDirectory(folder, fs)
}

export const removeFile = async (filePath: string) => {
    const env = await initEnv();
    // 使用 pyodide 初始化 input 文件夹，判断文件夹是否存在，如果存在，先删除，再创建,使用pyodide的FS API
    const fs = env.FS;
    fs.unlink(filePath); // 删除文件
}

function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

export const downloadFile = async (filePath: string) => {
    const pyodide = await initEnv();
    const fileData = pyodide.FS.readFile(filePath, { encoding: 'binary' });
    let mimeType;
    if (filePath.endsWith('.xlsx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (filePath.endsWith('.txt') || filePath.endsWith('.md')) {
        mimeType = 'plain/text';
    } else if (filePath.endsWith('.png')) {
        mimeType = 'image/png';
    } else if (filePath.endsWith('.jpeg') || filePath.endsWith('.jpg')) {
        mimeType = 'image/jpeg';
    } else if (filePath.endsWith('.pptx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else {
        throw new Error('Unsupported file format');
    }

    const blob = new Blob([fileData], { type: mimeType });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = filePath.split('/').pop(); // 获取文件名
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

}

export const prepareFolder = async (folders: string[], clear = true) => {
    const env = await initEnv();
    // 使用 pyodide 初始化 input 文件夹，判断文件夹是否存在，如果存在，先删除，再创建,使用pyodide的FS API

    const fs = env.FS;
    for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        const exist = await checkDirectoryExists(folder);
        if (exist) {
            if (clear) {
                await emptyDirectory(folder, fs);
                // fs.rmdir(folder);
            }
        } else {
            fs.mkdir(folder);
        }
    }
    return env;
}

export const writeFile = async (path: string, dataArrayBuffer: ArrayBuffer) => {
    if (!dataArrayBuffer) {
        return;
    }
    const pyodide = await initEnv();
    pyodide.FS.writeFile(path, dataArrayBuffer, { encoding: "binary" });

}

export const listFiles = async (directoryPath: string): Promise<string[]> => {
    const pyodide = await initEnv();
    const fileNames = [];
    const exist = await checkDirectoryExists(directoryPath);
    if (!exist) {
        return [];
    }
    const dirs = await pyodide.FS.readdir(directoryPath);
    for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        if (dir !== "." && dir !== "..") {
            const filePath = pyodide.PATH.join(directoryPath, dir);
            const mode = pyodide.FS.lookupPath(filePath);
            if (!pyodide.FS.isDir(mode)) {
                // 如果是文件，则将文件路径添加到列表中
                fileNames.push(filePath);
            }
        }
    }
    return fileNames;
}

export const runFunction = async (code: string, functionName = 'main', args: any[] = []) => {
    const pyodide = await initEnv();
    let stdout = '';
    const captureStdout = (s) => {
        stdout += s + '\n';
        // console.log(s);
    };

    // Set Pyodide's stdout and stderr
    pyodide.setStdout({
        batched: (lines) => {
            if (typeof lines === 'string') {
                captureStdout(lines)
            } else if (Array.isArray(lines)) {
                (lines as string[]).forEach(captureStdout);
            }
        }
    });
    // pyodide.setStderr({
    //     batched: (lines) => {
    //         if (typeof lines === 'string') {
    //             captureStdout(lines)
    //         } else if (Array.isArray(lines)) {
    //             (lines as string[]).forEach(captureStdout);
    //         }
    //     }
    // });
    const res = pyodide.runPython(code);
    const func = pyodide.globals.get(functionName);
    // Execute the function if it exists
    let result;
    if (func) {
        result = args ? func(...args) : func();
    } else {
        result = res || '';
    }
    return stdout + '\n\n' + (result || '');
}

export const runFunctionWithLog = async (code: string, functionName = 'main', args: any[] = []) => {
    const pyodide = await initEnv();
    // Create a function to capture stdout
    let stdout = '';
    const captureStdout = (s) => {
        stdout += s + '\n';
        // console.log(s);
    };

    // Set Pyodide's stdout and stderr
    pyodide.setStdout({
        batched: (lines) => {
            if (typeof lines === 'string') {
                captureStdout(lines)
            } else if (Array.isArray(lines)) {
                (lines as string[]).forEach(captureStdout);
            }
        }
    });
    pyodide.setStderr({
        batched: (lines) => {
            if (typeof lines === 'string') {
                captureStdout(lines)
            } else if (Array.isArray(lines)) {
                (lines as string[]).forEach(captureStdout);
            }
        }
    });
    const res = pyodide.runPython(code);
    const func = pyodide.globals.get(functionName);
    // Execute the function if it exists
    let result;
    if (func) {
        result = args ? func(...args) : func();
    } else {
        result = res;
    }

    // Return both the function result and captured stdout
    return { result, stdout };
}

export const readFilesToData = async (folder: string, showFileContent = true): Promise<{
    type: string,
    name: string,
    path: string;
    data?: string | ({
        name: string;

        data: any[][];
    }[])
}[]> => {
    const files = await listFiles(folder);
    if (!files || files.length <= 0) {
        return []
    }
    const results: { type: string, name: string, path: string; data: any }[] = [];
    // JavaScript 从文件系统中读取修改后的文件
    for (let i = 0; i < files.length; i++) {
        const path = files[i];
        const matchResult = /\/?([^/]+)(?=\.\w+$)/.exec(path);
        const fileName = matchResult ? matchResult[1] : path;
        const ext = path.split('.').pop();

        if (ext === 'xlsx') {
            let datas: any = [];
            if (showFileContent) {
                datas = await readXlsxFileToJson(path);
            }

            // const markTable = datas.map(({ data }) => {
            //     return `${arrayToMarkdownTable(data)}`
            // }).join('\n');
            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: datas
            });
        }
        else if (ext === 'csv') {
            let datas: any = [];
            if (showFileContent) {
                datas = await readCsvFileToJson(path);
            }
            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: datas
            });
        }
        else if (ext === 'png' || ext == 'jpeg') {
            // render image
            let base64Image: any = [];
            if (showFileContent) {
                base64Image = await readFileToBase64Image(path)
            }
            // const url = image.set(base64Image, 'python.chart')
            // const msg = `${fileName}\n![${fileName}](${url})`;
            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: base64Image
            });
        } else if (ext === 'txt') {
            let text: any = [];
            if (showFileContent) {
                text = await readFileToText(path)
            }

            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: text
            });
        } else if (ext === 'md') {
            let text: any = [];
            if (showFileContent) {
                text = await readFileToText(path)
            }

            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: text
            });
        } else if (ext === 'pptx') {
            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: ''
            });
        } else {
            results.push({
                type: ext,
                name: fileName || path,
                path,
                data: ''
            });
        }
    }
    return results;
}

export const convertFileToMark = (files: {
    type: string;
    name: string;
    path: string;
    data?: string | ({
        name: string;
        data: any[][];
    }[]);
}[]): { type: string, path: string, name: string, content: string, data?: { name: string; data: any[][] }[] }[] => {
    // const files: {
    //     type: string;
    //     name: string;
    //     data: string | ({
    //         name: string;
    //         data: any[][];
    //     }[]);
    // }[] = await readFilesToData(folder);
    const results = [];
    for (let i = 0; i < files.length; i++) {
        const { type, name, data, path } = files[i];
        if (type === 'xlsx' || type === 'xls') {
            const datas = data as { name: string; data: any[][]; }[]
            const content = datas.map(({ name, data }) => {
                return `**${name}**\n\n${arrayToMarkdownTable(data)}`
            }).join('\n\n');
            results.push({
                type,
                path,
                name,
                data,
                content
            });
        }
        else if (type === 'csv') {
            const datas = data as { name: string; data: any[][]; }[]
            const markTable = datas.map(({ name, data }) => {
                return `**${name}**\n${arrayToMarkdownTable(data)}\n`
            }).join('\n');
            results.push({
                type,
                path,
                name,
                data,
                content: markTable
            });
        }
        else if (type === 'png' || type == 'jpeg') {
            // render image
            const url = image.set(data as string, `python.chart/${name}`)
            const msg = `**${name}**\n![${name}](${url})`;
            results.push({
                type,
                path,
                name,
                content: msg
            });
        } else if (type === 'txt') {
            results.push({
                type,
                path,
                name,
                content: `\`\`\`plaintext\n${data}\n\`\`\`` as string
            });
        } else if (type === 'md') {
            results.push({
                type,
                path,
                name,
                content: data as string
            });
        } else {
            results.push({
                type,
                path,
                name,
                content: ''
            });
        }
    }
    return results;
}


export async function updateFileToSheet(activeSheet: string, fileDatas: {
    type: string;
    name: string;
    data: string | ({ name: string; data: any[][]; }[]);
}[]) {
    for (let i = 0; i < fileDatas.length; i++) {
        const file = fileDatas[i];
        if (file.type === 'xlsx' || file.type == 'xls') {
            const sheets = (file.data as { name: string; data: any[][]; }[]);
            const sheet = sheets.find(p => p.name == activeSheet);
            if (sheet) {
                await sheetApi.setValues(sheet.data, activeSheet)
            } else {
                const values = sheets[0].data;
                await sheetApi.setValues(values)
            }
        } else if (file.type === 'png' || file.type == 'jpg' || file.type == 'jpeg') {
            await sheetApi.insertImage(file.data as string, 500, 350)
        }
    }
}


export const runScript = async (script: string) => {
    try {
        const pyodide = await initEnv();

        const result = await runFunction(script, 'main');
        // debugger;
        const fileNames = await listFiles('/output');

        if (!fileNames || fileNames.length <= 0) {
            return result;
        }
        let execResult = result;
        // JavaScript 从文件系统中读取修改后的文件
        for (let i = 0; i < fileNames.length; i++) {
            const path = fileNames[i];
            const matchResult = /\/?([^/]+)(?=\.\w+$)/.exec(path);
            const fileName = matchResult ? matchResult[1] : path;
            const ext = path.split('.').pop();

            if (ext === 'xlsx') {
                const datas = await readXlsxFileToJson(path);
                const markTable = datas.map(({ data }) => {
                    return `${arrayToMarkdownTable(data)}`
                }).join('\n');

                execResult += `\n\n${result}\n${markTable}`;
            } else if (ext === 'png' || ext == 'jpeg') {
                // render image
                const base64Image = await readFileToBase64Image(path)
                const url = image.set(base64Image)
                const msg = `${result}\n\n${fileName}\n![${fileName}](${url})`;

                execResult += `\n\n${msg}`;

            } else if (ext === 'txt') {
                const modifiedFileData = pyodide.FS.readFile(path, { encoding: "binary" });
                const text = new TextDecoder("utf-8").decode(modifiedFileData);
                execResult += `\n\n${result}\n\n\`\`\`plaintext\n${text}\n\`\`\``;
            } else if (ext === 'md') {
                const modifiedFileData = pyodide.FS.readFile(path, { encoding: "binary" });
                const text = new TextDecoder("utf-8").decode(modifiedFileData);
                execResult += `\n\n${result}\n\n${text}\n`;
            }
        }
        return execResult;
    } catch (e) {
        console.error(e);
        return `Script run failed, Exception:${e.message}`;
    }
}

export const readFileToBase64 = async (path: string, type = ''): Promise<string> => {
    const pyodide = await initEnv();

    const fileArrayBuffer = pyodide.FS.readFile(path, { encoding: 'binary' });

    const fileBlob = new Blob([new Uint8Array(fileArrayBuffer)], { type });

    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onload = function (event: ProgressEvent<FileReader>) {
            resolve(event.target.result.split(',')[1]);
        };
        fileReader.onerror = function (error) {
            reject(error);
        };
        fileReader.readAsDataURL(fileBlob);
    });
}

export function extractPackageNames(command: string) {
    const regex = /^!?(\s*pip install (.+))/;
    const match = command.match(regex);
    if (match) {
        return match[2].split(/\s+/).filter(pkg => pkg.length > 0);
    }
    return [];
}

export async function prepareFont(language = 'en-US') {
    const fontMap: any = {
        ar: '/arabic/NotoNaskhArabic-VariableFont_wght.ttf',
        de: '/roboto/Roboto-Regular-14.ttf',
        "en-US": "/yahei/Microsoft-YaHei.ttf",
        es: '/roboto/Roboto-Regular-14.ttf',
        fr: '/roboto/Roboto-Regular-14.ttf',
        ja: '/jp/NotoSansJP-Regular.ttf',
        ko: '/ko/NanumGothic-Regular.ttf',
        vi: '/roboto/Roboto-Regular-14.ttf',
        'zh-CN': "/yahei/Microsoft-YaHei.ttf",
        'zh-TW': "/yahei/Microsoft-YaHei.ttf",
    }
    try {
        const font = fontMap[language] || '/yahei/Microsoft-YaHei.ttf'
        const fontUrl = `https://cdn.sally.bot/font${font}`;//`font/yahei/${font}`;
        const data = await fetch(fontUrl)
            .then(response => response.arrayBuffer())
        const pyodide = await initEnv();
        // await prepareFolder(['/input'], false)
        await writeFile(`/language.ttf`, new Uint8Array(data));
        // 初始化 Matplotlib 字体设置
        pyodide.runPython(`
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

fpath = Path("/language.ttf")
font_prop = FontProperties(fname=str(fpath))

plt.rcParams['font.family'] = font_prop.get_name()
plt.rcParams['axes.unicode_minus'] = False

`
        );
    } catch (e) {
        console.error(e);
        return;
    }
    //     pyodide.runPython(`
    // from pathlib import Path
    // import matplotlib.pyplot as plt
    // from matplotlib.font_manager import FontProperties

    // fpath = Path("/language.ttf")
    // font_prop = FontProperties(fname=str(fpath))

    // # 绘制图表
    // plt.plot([1, 2, 3], [4, 5, 6])
    // plt.title('hello world', fontproperties=font_prop)
    // plt.xlabel('こんにちは、私はPythonの専門家です', fontproperties=font_prop)
    // plt.ylabel('うむ', fontproperties=font_prop)

    // # 保存图表到 Pyodide 虚拟文件系统中的目录
    // plt.savefig('/input/plot.png')
    //             `);
}