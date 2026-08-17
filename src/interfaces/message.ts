import { IProfileUser } from "./auth";

export interface IMessage {
    _id: string;
    conversationId: string;
    senderId: IProfileUser;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IResponseGetMessage {
    message: IMessage
}

export interface INote { 
    _id: string;
    userId: {
        _id: string;
        username: string;
        avatar?: string;
    }
}