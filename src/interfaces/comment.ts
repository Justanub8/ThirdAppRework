import { IProfileUser } from '~/interfaces/auth';
import { IMedia } from '~/interfaces/media';
export interface IComment {
  id?: string;
  userId?: string;
  user: IProfileUser;
  targetId: string;
  targetType: 'Post' | 'Story' | 'Reel' | 'Comment' | string;
  parentId?: string | null;
  content: string;
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt?: Date;
  isLiked?: boolean;
  media?: IMedia;
}
