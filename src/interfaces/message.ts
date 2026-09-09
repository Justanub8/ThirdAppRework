import { IProfileUser } from "./auth";
import { IMedia } from "./media";

export interface IEmoji {
    id?: string;
    content: string;
    messageId: string;
    senderId: string;
    sender?: IProfileUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMessage {
    id?: string;
    conversationId: string;
    senderId?: string;
    sender?: IProfileUser;
    content?: string | null;
    media?: IMedia[];
    emojis?: IEmoji[];
    createdAt: Date;
    updatedAt?: Date;
}

export interface IResponseGetMessage {
    message: IMessage;
}

export interface INote { 
    id?: string;
    userId: {
        id?: string;
        username: string;
        avatar?: string;
    };
}