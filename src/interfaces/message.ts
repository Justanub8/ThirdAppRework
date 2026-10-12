import { IProfileUser } from '~/interfaces/auth';
import { IMedia } from '~/interfaces/media';
import { IEmoji } from '~/interfaces/emoji';

export type MessageStatus = 'Edited' | 'Deleted' | 'Pinned' | 'None';

export type { IEmoji };

export interface IMessage {
  id?: string;
  conversationId: string;
  senderId?: string;
  sender?: IProfileUser;
  content?: string | null;
  status?: MessageStatus;
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
