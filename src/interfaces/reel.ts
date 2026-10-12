import { IProfileUser } from '~/interfaces/auth';
import { IMedia } from '~/interfaces/media';
export interface IReel {
  id?: string;
  user: IProfileUser;
  media: IMedia;
  mediaId?: string;
  videoUrl?: string;
  mediaUrl?: string;
  likeCount: number;
  viewCount?: number;
  shareCount: number;
  repostCount: number;
  commentCount: number;
  caption: string;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt?: Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
  isReposted?: boolean;
}
