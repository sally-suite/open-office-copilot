



import { ChatState, ITool } from 'chat-list/types/plugin';
import emailApi from '@api/email';
import { IChatMessage } from 'chat-list/types/message';
import { buildHtml } from 'chat-list/utils';


interface IRecipients {
    displayName: string;
    emailAddress: string;
}

export const main: ITool['func'] = async ({
    subject,
    body,
    to,
    cc,
    bcc,
    message,
    context
}: {
    subject: string,
    body: string,
    to: IRecipients[],
    cc: IRecipients[],
    bcc: IRecipients[],
    message: IChatMessage,
    context: ChatState
}): Promise<any> => {
    try {
        // 检查必要参数
        if (!subject) {
            throw new Error('Email subject is required');
        }

        // 设置邮件主题
        await emailApi.setSubject(subject);

        // 设置邮件正文
        // 检测是否是 HTML 格式
        // const isHtml = /<[a-z][\s\S]*>/i.test(body);
        // const content = await buildHtml(body)
        await emailApi.setBody(body, 'html');

        // 设置收件人
        if (to) {
            if (to.length > 0) {
                await emailApi.setToRecipients(to);
            }
        }

        // 设置抄送
        if (cc) {
            if (cc.length > 0) {
                await emailApi.setCCRecipients(cc);
            }
        }

        // 设置密送
        if (bcc) {
            if (bcc.length > 0) {
                await emailApi.setBCCRecipients(bcc);
            }
        }

        return 'Email configured successfully';

    } catch (error) {
        return 'Failed to configure email';
    }
};

export interface IEmailRecipient {
    displayName: string;
    emailAddress: string;
}

const description = `This tool helps you write and configure emails in Outlook.
You can set the subject, body (in text or HTML format), and recipients (To, CC, BCC).
The body content can be either plain text or HTML format.`;

export default {
    "name": "write_email",
    "description": description,
    "parameters": {
        "type": "object",
        "properties": {
            "subject": {
                "type": "string",
                "description": "The subject line of the email"
            },
            "body": {
                "type": "string",
                "description": "The content of the email body in markdown format"
            },
            "to": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "displayName": {
                            "type": "string",
                            "description": "The display name of the recipient"
                        },
                        "emailAddress": {
                            "type": "string",
                            "description": "The email address of the recipient"
                        }
                    },
                    "required": ["emailAddress"]
                },
                "description": "Array of recipients in the To field"
            },
            "cc": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "displayName": {
                            "type": "string",
                            "description": "The display name of the CC recipient"
                        },
                        "emailAddress": {
                            "type": "string",
                            "description": "The email address of the CC recipient"
                        }
                    },
                    "required": ["emailAddress"]
                },
                "description": "Array of recipients in the CC field"
            },
            "bcc": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "displayName": {
                            "type": "string",
                            "description": "The display name of the BCC recipient"
                        },
                        "emailAddress": {
                            "type": "string",
                            "description": "The email address of the BCC recipient"
                        }
                    },
                    "required": ["emailAddress"]
                },
                "description": "Array of recipients in the BCC field"
            }
        },
        "required": ["subject"]
    },
    func: main
} as unknown as ITool;