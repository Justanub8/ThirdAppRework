import { IProfileUser } from "./auth";

export type RepostTargetType = 'Post' | 'Reel' | string;

export interface IRepost {
    id?: string;
    userId?: string;
    user?: IProfileUser;
    targetId: string;
    targetType: RepostTargetType;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRepostPayload {
    targetId: string;
    targetType: RepostTargetType;
}

export type RepostPayload = IRepostPayload;

export interface IResponseGetRepost {
    repost: IRepost;
}
