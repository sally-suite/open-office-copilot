import { uuid } from "./common";


const IMAGES = new Map();

export default {
    set(value: string, url?: string) {
        const key = url ? `https://${url}.png` : `https://${uuid()}.png`;
        IMAGES.set(key, value);
        return key;
    },
    get(key: string): string {
        return IMAGES.get(key) || '';
    },
    clear() {
        IMAGES.clear();
    },
    values() {
        // convert IMAGES to json
        return Array.from(IMAGES.entries()).reduce((acc: any, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    },
    load(values: any) {
        // convert json to IMAGES
        Object.keys(values).forEach(key => {
            IMAGES.set(key, values[key]);
        });
    }
};