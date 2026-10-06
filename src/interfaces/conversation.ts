import { IProfileUser } from "./auth";
import { IMessage } from "./message";

export type ConversationRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface IConversationMember {
    id: string;
    conversationId: string;
    userId: string;
    role: ConversationRole;
    nickname?: string | null;
    joinedAt: Date;
    user?: IProfileUser;
}

export interface IConversation {
    id?: string;
    name?: string | null;
    avatarUrl?: string | null;
    members: IConversationMember[];
    lastMessage?: IMessage;
    PinnedMessages?: IMessage[];
    pinnedMessages?: IMessage[];
    isGroup: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IResponseGetConversation {
    conversation: IConversation
}
