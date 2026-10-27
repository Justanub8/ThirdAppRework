import { IProfileUser } from '~/interfaces/auth';
import { IMessage } from '~/interfaces/message';

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
  nickname?: string | null;
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
  conversation: IConversation;
}
