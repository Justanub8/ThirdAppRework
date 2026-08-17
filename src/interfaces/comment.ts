import { IProfileUser } from "./auth";

export interface IComment {
    _id: string;
    user: IProfileUser;
    targetId: string;
    targetType: 'Post' | 'Story' | 'Reel';
    parentId?: string | IComment;
    content: string;
    likeCount: number;
    replyCount: number;
    createdAt: Date;
    updatedAt?: Date;
}
