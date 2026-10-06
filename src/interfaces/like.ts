import { IProfileUser } from "./auth";

export type LikeTargetType = 'Post' | 'Reel' | 'Story' | 'Comment' | string;

export interface ILike {
    id?: string;
    userId?: string;
    user?: IProfileUser;
    targetId: string;
    targetType: LikeTargetType;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ILikePayload {
    targetId: string;
    targetType: LikeTargetType;
}

export type LikePayload = ILikePayload;

export interface IResponseGetLikes {
    total: number;
    data: ILike[];
}
