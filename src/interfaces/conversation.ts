import { IProfileUser } from "./auth";
import { IMessage } from "./message";

export interface IConversation {
    _id: string;
    participants: IProfileUser[];
    lastMessage?: IMessage;
    isGroup: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IResponseGetConversation {
    conversation: IConversation
}
