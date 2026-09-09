import { IProfileUser } from "./auth";
import { IMessage } from "./message";

export interface IConversation {
    id?: string;
    participants: IProfileUser[];
    lastMessage?: IMessage;
    isGroup: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IResponseGetConversation {
    conversation: IConversation
}
