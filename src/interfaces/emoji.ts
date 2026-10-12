import { IProfileUser } from '~/interfaces/auth';

export interface IEmoji {
  id?: string;
  content: string;
  messageId: string;
  senderId: string;
  sender?: IProfileUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEmojiPayload {
  messageId: string;
  content: string;
}

export interface DeleteEmojiPayload {
  messageId: string;
}

export interface GetEmojiQuery {
  messageId: string;
  page?: number;
  limit?: number;
}
