import { IProfileUser } from "./auth";
import { IMedia } from "./media";

export interface IMessage {
    id?: string;
    _id?: string;
    conversationId: string;
    senderId?: string;
    sender?: IProfileUser;
    content?: string | null;
    media?: IMedia[];
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