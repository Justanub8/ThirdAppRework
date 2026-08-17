import { IProfileUser } from "./auth";
import { IMedia } from "./media";

export interface IPost {
    _id: string;
    user: IProfileUser;
    media: IMedia[];
    likeCount: number;
    shareCount: number;
    repostCount: number;
    commentCount: number;
    caption: string;
    createdAt: Date;
    updatedAt?: Date;
    isFollowing?: boolean;
    isLiked?: boolean;
}

export interface IResponseGetPost {
    post: IPost;
}