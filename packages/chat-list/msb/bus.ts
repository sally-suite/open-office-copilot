import { extractMentions, uuid } from '../utils/common'


import { ChatMessageType, IChatMessage, Sender } from '../types/message'
import { Role } from '../types/chat';
export class MentionedMessage implements IChatMessage {
    content: string;
    text?: string;
    type: ChatMessageType;
    from: Sender;
    to?: string;
    role: Role;
    mentions: string[];
    constructor(id: string, content: string, type: ChatMessageType, from: Sender, role: Role, mentions: string[] = [], rest: any = {}) {
        this._id = id;
        this.content = content;
        this.type = type;
        this.from = from;
        this.mentions = [...mentions];
        this.role = role;
        this.createdAt = new Date().getTime();
        this.hasTime = true;
        this.position = (role == 'assistant' || role == 'system') ? 'left' : 'right';
        Object.assign(this, rest);
    }
    _id: string;
    position?: 'pop' | 'left' | 'right' | 'center';
    createdAt?: number;
    hasTime?: boolean;
}

export type MessageCallback = (message: MentionedMessage) => void;

export type SubscribeOption = {
    // subscribe message by metions
    mentions: string[],
    sender: string,
    // subscribe message by role
    role?: Role,
    // type: string[];
}

export type SubscribeItem = {
    callback: MessageCallback,
    option: SubscribeOption
}

class MentionedMessageBus {
    private queue: {
        [x: string]: MentionedMessage[]
    } = {};
    private senders = new Map();
    private subscriptions: Record<string, SubscribeItem[]> = {};

    constructor() {
        this.queue = {}
        this.subscriptions = {};
    }

    async subscribe(topic: string, callback: MessageCallback, option: SubscribeOption = { mentions: [], sender: '' }): Promise<void> {
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = [];
        }
        this.subscriptions[topic].push({ callback, option });
        this.senders.set(option.sender, option);
    }
    async publishMessage(topic: string, messageBody: IChatMessage): Promise<void> {

        if (!this.subscriptions[topic] || this.subscriptions[topic].length <= 0) {
            return;
        }
        const { _id, type, content, from, role, mentions: m, ...rest } = messageBody;
        let message: MentionedMessage = messageBody as MentionedMessage;
        let mentions: string[] = [];
        if (type === 'text') {
            mentions = extractMentions(content).filter(x => this.senders.has(x)).map(x => x.toLowerCase());
            message = new MentionedMessage(_id || uuid(), content, type, from, role, mentions, rest);
        } else if (type == 'parts') {
            mentions = extractMentions(messageBody.text).filter(x => this.senders.has(x)).map(x => x.toLowerCase());
            message = new MentionedMessage(_id || uuid(), content, type, from, role, mentions, rest);
        } else {
            message = new MentionedMessage(_id || uuid(), content, type, from, role, [], rest);
        }

        if (!this.queue[topic]) {
            this.queue[topic] = [];
        }
        this.queue[topic].push(message);

        setTimeout(() => {
            this.processQueue(topic);
        }, 0);

    }

    async publish(topic: string, content = '', type: ChatMessageType, sender: Sender, role: Role): Promise<void> {
        if (!content) {
            return;
        }
        if (!this.subscriptions[topic] || this.subscriptions[topic].length <= 0) {
            return;
        }
        let message: MentionedMessage;
        let mentions: string[] = [];
        if (type === 'text') {
            mentions = extractMentions(content).filter(x => this.senders.has(x)).map(x => x.toLowerCase());
            if (mentions.length > 1) {
                // if mentions > 1, send to leader to make task plan
                mentions = ['flow']
            }
            message = new MentionedMessage(uuid(), content, type, sender, role, mentions);
        } else {
            message = new MentionedMessage(uuid(), content, type, sender, role, []);
        }

        if (!this.queue[topic]) {
            this.queue[topic] = [];
        }
        this.queue[topic].push(message);

        setTimeout(() => {
            this.processQueue(topic);
        }, 0);

        // let message: MentionedMessage;
        // let mentions: string[] = [];
        // if (type === 'text') {
        //     mentions = extractMentions(content);
        //     message = new MentionedMessage(uuid(), content, type, sender, role, mentions);
        // } else {
        //     message = new MentionedMessage(uuid(), content, type, sender, role, []);
        // }


        // for (const { callback, option } of this.subscriptions[topic]) {
        //     if (option.sender === sender.name) {
        //         continue;
        //     }
        //     if (type === 'text') {
        //         if (!option) {
        //             await callback(message);
        //             continue;
        //         }
        //         if (option.mentions.length > 0 && mentions.length > 0) {
        //             if (option.mentions.some(name => mentions.includes(name))) {
        //                 await callback(message);
        //                 continue;
        //             }
        //         }
        //         if (option.role && option.role === role) {
        //             await callback(message);
        //             continue;
        //         }
        //     } else if (type === 'card') {
        //         // only user can receive card message
        //         if (option?.role && option.role === role) {
        //             await callback(message);
        //             continue;
        //         }
        //     }

        // }



    }
    async processQueue(topic: string) {
        if (this.queue[topic]) {
            while (this.queue[topic].length > 0) {
                const message = this.queue[topic].shift();
                await this.notifyListeners(topic, message);
            }
        }
    }
    async notifyListeners(topic: string, message: MentionedMessage) {
        // if (this.listeners[event]) {
        //     this.listeners[event].forEach(callback => {
        //         // 模拟异步操作
        //         setTimeout(() => {
        //             callback(data);
        //         }, 0);
        //     });
        // }
        const sender = message.from;
        const type = message.type;
        const mentions = message.mentions;
        const role = message.role;

        for (const { callback, option } of this.subscriptions[topic]) {
            if (option.sender === sender?.name) {
                continue;
            }
            if (type === 'text') {
                if (!option) {
                    await callback(message);
                    continue;
                }
                if (option.mentions.length > 0 && mentions.length > 0) {
                    if (option.mentions.some(name => mentions.includes(name))) {
                        await callback(message);
                        continue;
                    }
                }
                if (option.role && option.role === role) {
                    await callback(message);
                    continue;
                }
            } else if (type === 'card') {
                // only user can receive card message
                if (option?.role && option.role === role) {
                    await callback(message);
                    continue;
                }
            } else if (type === 'file') {
                // only user can receive card message
                if (option?.role && option.role === role) {
                    await callback(message);
                    continue;
                }
            } else {
                if (option?.role && option.role === role) {
                    await callback(message);
                    continue;
                }
            }
        }
    }
    async unsubscribe(topic: string, callback?: MessageCallback): Promise<void> {
        if (this.subscriptions[topic]) {
            if (callback) {
                this.subscriptions[topic] = this.subscriptions[topic].filter(p => p.callback !== callback)
            } else {
                this.subscriptions[topic] = [];
            }
        }
    }
}

export default new MentionedMessageBus();