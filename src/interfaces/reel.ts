import { IProfileUser } from "./auth";
import { IMedia } from "./media";
export interface IReel {
    _id: string;
    user: IProfileUser;
    media: IMedia;
    likeCount: number;
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