import { IMessageBody, Role } from "chat-list/types/chat";
import { ChatMessageType, IChatMessage, Sender } from "chat-list/types/message";
import { uuid } from "./common";

export const convertMessages = (messages: IChatMessage[]) => {
    return (messages as IChatMessage[])
        .filter((p) => p.type === 'text')
        .map((item) => {
            return {
                role: item.role,
                content: item.content,
            };
        });
};

export const buildChatMessages = (messages: IChatMessage[], role: Role, content: string) => {
    return (messages as IChatMessage[])
        .filter((p) => p.type === 'text')
        .map((item) => {
            return {
                role: item.role,
                content: item.content,
            };
        })
        .concat([
            {
                role,
                content,
            },
        ]);
};
export const buildChatMessage = (
    content: string | React.ReactNode | File[] | { text: string, fileList: File[] },
    type: ChatMessageType = 'text',
    role: Role = 'assistant',
    from?: Sender,
    mentions?: string[],
    alt?: string
): IChatMessage => {
    let text = '', files: File[] = [], card;
    if (type === 'parts') {
        text = (content as any).text;
        files = (content as any).fileList;
    } else if (type === 'text') {
        text = content as string;
    } else if (type === 'file') {
        files = content as File[]
    } else if (type === 'card') {
        card = content as React.ReactNode
    }

    return {
        _id: uuid(),
        type,
        content: alt || content,
        text,
        files,
        card,
        position: (role == 'assistant' || role == 'system') ? 'left' : 'right',
        role,
        from,
        mentions: mentions || []
    }

}

let memory: IMessageBody[] = [];
export const shortTermMemory = {
    push(msg: IMessageBody | (IMessageBody[])) {
        if (Array.isArray(msg)) {
            memory = memory.concat(msg);
        } else {
            memory.push(msg)
        }
    },
    list(): IMessageBody[] {
        return memory;
    },
    clear() {
        memory = [];
    },
    length() {
        return memory.length;
    }
}
export class summaryMemory<T> extends Array<T> {
    push(element: T): number {

        // 调用父类 Array 的 push 方法添加元素
        return super.push(element);
    }
    clear(): void {
        this.splice(0, this.length);
    }
}
