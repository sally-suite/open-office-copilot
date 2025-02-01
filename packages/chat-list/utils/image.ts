import { uuid } from "./common";


const IMAGES = new Map();

export default {
    set(value: string, url?: string) {
        const key = url ? `https://${url}.png` : `https://${uuid()}.png`;
        IMAGES.set(key, value);
        return key;
    },
    get(key: string): string {
        return IMAGES.get(key) || ''
    },
}