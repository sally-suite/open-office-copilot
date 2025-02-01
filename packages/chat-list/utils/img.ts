import { Canvg } from 'canvg';
import { blobToBase64Image } from './common';
import api from '@api/index';
import { ImageSearchResult } from 'chat-list/types/search';

export function resizeImg(base64Data: string, newWidth: number, newHeight: number) {
    const img = new Image();
    img.src = base64Data;
    return new Promise((resolve, reject) => {
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            const resizedBase64Data = canvas.toDataURL('image/png');
            resolve(resizedBase64Data);
        };
        img.onerror = (e) => {
            reject(e);
        };
    });
}

export const getImgSize = (base64Data: string): Promise<{ width: number | string, height: number | string }> => {
    return new Promise((resolve, reject) => {
        if (!base64Data.startsWith('data:image')) {
            resolve({ width: 'auto', height: 'auto' });
        }
        const img = new Image();
        img.src = base64Data;
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            resolve({ width, height });
        };
        img.onerror = (e) => {
            reject(e);
        };
    });
};

export async function svgToImage(svgElement: SVGElement) {
    const rect = svgElement.getBoundingClientRect();
    const width = rect.width * 4;
    const height = rect.height * 4;
    const canvas = document.createElement('canvas');
    // canvas.style.width = `${rect.width * 4}px`;
    // canvas.style.height = `${rect.height * 4}px`;
    const ctx = canvas.getContext('2d');
    const svgXml = new XMLSerializer().serializeToString(svgElement);
    const v = await Canvg.from(ctx, svgXml);
    v.resize(width, height, 'xMidYMid meet');
    await v.render();

    const imageDataURL = canvas.toDataURL('image/png');
    return imageDataURL;
}
export function svgAsPng(svgElement: SVGElement, superScaling = 1): Promise<{ width: number, height: number, data: string }> {
    return new Promise((resolve) => {
        const can = document.createElement('canvas'), // Not shown on page
            ctx = can.getContext('2d'),
            loader = new Image(); // Not shown on page

        // const vb = svgElement.getAttribute('viewBox').split(' ');

        // let width = parseInt(vb[2]),
        //     height = parseInt(vb[3]);
        // debugger;
        // if (!width || !height) {
        //     debugger;
        //     const bound = svgElement.getBoundingClientRect();
        //     width = bound.width;
        //     height = bound.height;
        // }
        let width: any = 800;
        let height: any = 600;
        if (svgElement.getBoundingClientRect) {
            const bound = svgElement.getBoundingClientRect();
            console.log(bound);
            width = bound.width;
            height = bound.height;
        }

        svgElement?.setAttribute?.('width', width + '');
        svgElement?.setAttribute?.('height', height + '');
        loader.width = can.width = width * superScaling;
        loader.height = can.height = height * superScaling;
        loader.onload = function () {
            ctx.drawImage(loader, 0, 0, loader.width, loader.height);
            // cb(can.toDataURL(), loader.width, loader.height);
            resolve({
                width: loader.width,
                height: loader.height,
                data: can.toDataURL()
            });
        };
        const svgAsXML = new XMLSerializer().serializeToString(svgElement);
        loader.src = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);
    });
}

export const isImageLink = (link: string) => {
    try {
        if (link.startsWith('http')) {
            const url = new URL(link);
            const ext = url.pathname.split('.').pop();
            if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'svg') {
                return true;
            }
        }
    } catch (e) {
        return false;
    }
};


export const searchImage = async (keyword: string, num = 1): Promise<string[]> => {
    try {
        const results = await api.searchImages({
            keyword,
            num
        }) as ImageSearchResult[];

        const targets = results.filter(p => p.imageUrl);
        if (targets.length === 0) {
            return [];
        }
        // const url = targets[0].imageUrl;

        // const data = await proxyImage(url)
        // return data;
        return targets.map(p => p.imageUrl);
    } catch (e) {
        return [];
    }
};

export const proxyImage = async (url: string): Promise<string> => {
    try {
        const timeoutPromise = new Promise<string>((resolve) => {
            setTimeout(() => resolve(''), 10000); // 超时10秒返回空字符串
        });

        const imageProxyPromise = api.imageProxy({ url }).then(async (response) => {
            if (response) {
                const blob: Blob = await response.blob();
                const base64Image = await blobToBase64Image(blob);
                return base64Image;
            }
            return '';
        }).catch((e) => {
            console.log('imageProxyError', e);
            return '';
        });

        return await Promise.race([imageProxyPromise, timeoutPromise]);
    } catch (e) {
        return '';
    }
};


export const searchBase64Image = async (keyword: string, num = 1): Promise<{
    src: string;
    width: number;
    height: number;
}[]> => {
    const urls = await searchImage(keyword, num);
    const images = urls.slice(0, num);
    const base64Images = await Promise.all(images.map(proxyImage));
    const imageList = await Promise.all(base64Images.filter(p => p).map(async (image) => {
        const size = await getImgSize(image);
        return { src: image, width: size?.width, height: size?.height };
    }));
    return imageList;
};

export const getImageSizeByBatch = async (images: string[]): Promise<{
    src: string;
    width: number;
    height: number;
}[]> => {
    try {
        if (!images || images.length === 0) {
            return [];
        }
        const base64Images = await Promise.all(images.map(proxyImage));
        const imageList = await Promise.all(base64Images.filter(p => p).map(async (image) => {
            const size = await getImgSize(image);
            if (size) {
                return { src: image, width: size?.width, height: size?.height };
            }
            return { src: image, width: 'auto', height: 'auto' };
        }));
        return imageList;
    } catch (e) {
        return [];
    }
};

/**
 * 裁剪图片函数
 * @param {string} base64Image - Base64格式的图片字符串
 * @param {number} cropWidth - 裁剪区域的宽度
 * @param {number} cropHeight - 裁剪区域的高度
 * @param {number} x - 裁剪区域左上角的X坐标
 * @param {number} y - 裁剪区域左上角的Y坐标
 * @returns {Promise<string>} - 返回裁剪后的图片的Base64字符串
 */
export function cropImage(base64Image: string, cropWidth: number, cropHeight: number, x: number, y: number): Promise<string> {
    if (!base64Image.startsWith('data:image/png;base64,')) {
        return Promise.resolve(base64Image);
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 设置canvas的宽高为裁剪后的大小
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, cropWidth, cropHeight);

            // 绘制裁剪后的图像到canvas
            ctx.drawImage(
                img,
                x, y, cropWidth, cropHeight,  // 原图裁剪区域
                0, 0, cropWidth, cropHeight   // 目标画布上的位置及大小
            );

            // 获取裁剪后的Base64图像
            const croppedImage = canvas.toDataURL('image/png');
            resolve(croppedImage);
        };

        img.onerror = (error) => reject(error);
    });
}

/**
 * 剪裁并调整图片大小 (contain 模式)
 * @param base64Image 原始图片base64
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @param imgWidth 原图宽度
 * @param imgHeight 原图高度
 * @returns 处理后的图片base64
 */
async function cropAndResizeImageContain(
    base64Image: string,
    canvasWidth: number,
    canvasHeight: number,
    imgWidth: number,
    imgHeight: number
): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // 填充白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 计算图片在 canvas 中的位置，使其居中
    const x = (canvasWidth - imgWidth) / 2;
    const y = (canvasHeight - imgHeight) / 2;

    // 绘制原图到 canvas
    const imgElement = new Image();
    imgElement.src = base64Image;
    await new Promise(resolve => {
        imgElement.onload = resolve;
        imgElement.onerror = resolve;
    });
    ctx.drawImage(imgElement, x, y, imgWidth, imgHeight);

    return canvas.toDataURL('image/png');
}

/**
 * 剪裁并调整图片大小 (cover 模式)
 * @param base64Image 原始图片base64
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @param imgWidth 原图宽度
 * @param imgHeight 原图高度
 * @returns 处理后的图片base64
 */
async function cropAndResizeImageCover(
    base64Image: string,
    canvasWidth: number,
    canvasHeight: number,
    imgWidth: number,
    imgHeight: number
): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    const x = (canvasWidth - scaledWidth) / 2;
    const y = (canvasHeight - scaledHeight) / 2;

    const imgElement = new Image();
    imgElement.src = base64Image;
    await new Promise(resolve => {
        imgElement.onload = resolve;
        imgElement.onerror = resolve;
    });
    ctx.drawImage(imgElement, x, y, scaledWidth, scaledHeight);

    return canvas.toDataURL('image/png');
}

/**
 * 按比例调整图片大小
 * @param base64Image 图片base64
 * @param ratio 目标宽高比
 * @param imgWidth 可选的目标宽度
 * @param type 裁剪类型：'contain' 或 'cover'
 * @returns 
 */
export const corpImageByRatio = async (base64Image: string, ratio: number, imgWidth?: number, type: 'contain' | 'cover' = 'cover') => {
    try {
        if (!base64Image.startsWith('data:image/png;base64,')) {
            return Promise.resolve(base64Image);
        }
        const img = await getImgSize(base64Image);
        const width = img?.width as number;
        const height = img?.height as number;

        let canvasWidth, canvasHeight;
        const currentRatio = width / height;

        if (type === 'contain') {
            if (currentRatio > ratio) {
                // 图片比目标比例更宽
                canvasWidth = width;
                canvasHeight = width / ratio;
            } else {
                // 图片比目标比例更高
                canvasHeight = height;
                canvasWidth = height * ratio;
            }
        } else { // cover
            if (currentRatio > ratio) {
                // 图片比目标比例更宽
                canvasHeight = height;
                canvasWidth = height * ratio;
            } else {
                // 图片比目标比例更高
                canvasWidth = width;
                canvasHeight = width / ratio;
            }
        }

        let resultImage: string;

        if (type === 'contain') {
            resultImage = await cropAndResizeImageContain(base64Image, canvasWidth, canvasHeight, width, height);
        } else {
            resultImage = await cropAndResizeImageCover(base64Image, canvasWidth, canvasHeight, width, height);
        }

        // 如果指定了目标宽度，且小于画布宽度，则进行缩放
        if (imgWidth && imgWidth < canvasWidth) {
            const targetHeight = imgWidth / ratio;
            resultImage = await resizeImg(resultImage, imgWidth, targetHeight) as string;
        }

        return resultImage;
    } catch (error) {
        return base64Image;
    }
};