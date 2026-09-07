import { IProfileUser } from "./auth";
import { IMedia } from "./media";

export interface IEmoji {
    id?: string;
    _id?: string;
    content: string;
    messageId: string;
    senderId: string;
    sender?: IProfileUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMessage {
    id?: string;
    _id?: string;
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
    _id?: string;
    userId: {
        id?: string;
        _id?: string;
        username: string;
        avatar?: string;
    };
}