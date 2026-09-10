import { IProfileUser } from "./auth";
import { IMedia } from "./media";

export interface IStory {
    id?: string;
    userId?: string;
    user: IProfileUser;
    content?: string;
    mediaId?: string;
    media?: IMedia;
    likeCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt?: Date;
    isLiked?: boolean;
    isViewed?: boolean;
}

export interface IResponseGetStory {
    story: IStory;
    isAllViewed?: boolean;
}
