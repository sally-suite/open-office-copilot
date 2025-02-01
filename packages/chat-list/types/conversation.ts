
export interface IConversation {
    conversationId: string;
    conversationName: string;
    createdBy: string;
    creationDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
}