import { IProfileUser } from '~/interfaces/auth';
import { IMedia } from '~/interfaces/media';

export interface IPost {
  id?: string;
  user: IProfileUser;
  media: IMedia[];
  likeCount: number;
  shareCount: number;
  repostCount: number;
  commentCount: number;
  bookmarkCount?: number;
  caption: string;
  createdAt: Date;
  updatedAt?: Date;
  isFollowing?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
}

export interface IResponseGetPost {
  post: IPost;
}
