import { IProfileUser } from '~/interfaces/auth';

export type BookmarkTargetType = 'Post' | 'Reel' | 'Story' | string;

export interface IBookmark {
  id?: string;
  userId?: string;
  user?: IProfileUser;
  targetId: string;
  targetType: BookmarkTargetType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookmarkPayload {
  targetId: string;
  targetType: BookmarkTargetType;
}

export type BookmarkPayload = IBookmarkPayload;

export interface IResponseGetBookmark {
  bookmark: IBookmark;
}
