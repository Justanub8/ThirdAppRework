import { IProfileUser } from '~/interfaces/auth';
import { IMedia } from '~/interfaces/media';
import { IEmoji } from '~/interfaces/emoji';

export type MessageStatus =
  | 'Edited'
  | 'Deleted'
  | 'Pinned'
  | 'None'
  | 'Sending'
  | 'Failed';

export type { IEmoji };

export interface IMessage {
  id?: string;
  tempId?: string;
  conversationId: string;
  senderId?: string;
  sender?: Partial<IProfileUser>;
  content?: string | null;
  status?: MessageStatus;
  seq?: number;
  media?: IMedia[];
  emojis?: IEmoji[];
  createdAt: Date | string;
  updatedAt?: Date | string;
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
