import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { debounce } from 'chat-list/utils'
import { IChatMessage } from 'chat-list/types/message';
declare global {
    interface Window {
        indexedDB: IDBFactory;
    }
}

export interface Session {
    id: string;
    agent: string;
    model: string;
    input: string;
    messages: IChatMessage[];
    createdAt: string;
    memory: any[];
    images: any;
}

interface ChatHistorySchema extends DBSchema {
    [x: string]: {
        key: string;
        value: Session;
    };
}

const DB_NAME = 'chat_history';
const STORE_NAME: never = 'sessions' as never;
const DB_VERSION = 1;

class SessionDB {
    private dbPromise: Promise<IDBPDatabase<ChatHistorySchema>>;
    private dbName: string;
    private enabled = true;
    constructor() {
        // this.dbPromise = this.initDB();
    }

    async initDB(docType: string): Promise<IDBPDatabase<ChatHistorySchema>> {
        this.dbName = `${DB_NAME}_${docType}`;
        if (typeof window === 'undefined' || !window.indexedDB) {
            this.enabled = false;
            return Promise.resolve(null);
        }

        this.dbPromise = openDB<ChatHistorySchema>(this.dbName, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('createdAt' as never, 'createdAt', { unique: false }); // 创建索引
            }
        });
        return this.dbPromise;
    }

    async saveSession(session: Session): Promise<void> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Check if session exists before putting
        const existingSession = await store.get(session.id);
        await store.put(session);
        await tx.done;

        console.log(`Session ${existingSession ? 'updated' : 'created'}: ${session.id}`);
    }

    async getSession(id: string): Promise<Session | undefined> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        return db.get(STORE_NAME, id);
    }

    async getAllSessions(): Promise<Session[]> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('createdAt' as never);

        const result: Session[] = [];
        let cursor = await index.openCursor(null, 'prev'); // 逆序遍历

        while (cursor) {
            result.push(cursor.value);
            cursor = await cursor.continue();
        }

        return result;
    }

    async deleteSession(id: string): Promise<void> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.objectStore(STORE_NAME).delete(id);
        await tx.done;
    }

    async clearAllSessions(): Promise<void> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await tx.objectStore(STORE_NAME).clear();
        await tx.done;
    }
    async getSessionsPaginated(offset: number, limit: number): Promise<Session[]> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('createdAt' as never);

        const result: Session[] = [];
        let count = 0;
        let cursor = await index.openCursor(null, 'prev'); // 逆序遍历

        while (cursor && result.length < limit) {
            if (count >= offset) {
                result.push(cursor.value);
            }
            count++;
            cursor = await cursor.continue();
        }

        return result;
    }
    async searchSessions(keyword: string, field: keyof Session): Promise<Session[]> {
        if (!this.enabled) return;
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const result: Session[] = [];

        let cursor = await store.openCursor();
        while (cursor) {
            const value = cursor.value[field];

            // 仅对字符串字段执行模糊搜索
            if (typeof value === 'string' && value.includes(keyword)) {
                result.push(cursor.value);
            }
            cursor = await cursor.continue();
        }

        return result;
    }
}

// Export singleton instance
export const sessionDB = new SessionDB();
export const initDB = (docType: string) => sessionDB.initDB(docType);
// Export convenience methods
export const saveSession = debounce((session: Session) => sessionDB.saveSession(session), 500);
export const getSession = (id: string) => sessionDB.getSession(id);
export const getAllSessions = () => sessionDB.getAllSessions();
export const deleteSession = (id: string) => sessionDB.deleteSession(id);
export const clearAllSessions = () => sessionDB.clearAllSessions();
export const getSessionsPaginated = (offset: number, limit: number) => sessionDB.getSessionsPaginated(offset, limit);
export const searchSessions = (keyword: string, field: keyof Session) => sessionDB.searchSessions(keyword, field);