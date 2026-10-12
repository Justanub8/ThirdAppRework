import { IProfileUser } from '~/interfaces/auth';

export type ShareTargetType = 'Post' | 'Reel' | 'Story' | string;

export interface IShare {
  id?: string;
  userId?: string;
  user?: IProfileUser;
  targetId: string;
  targetType: ShareTargetType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISharePayload {
  targetId: string;
  targetType: ShareTargetType;
}

export type SharePayload = ISharePayload;

export interface IResponseGetShare {
  share: IShare;
}
