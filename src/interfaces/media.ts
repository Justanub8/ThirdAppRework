export interface IMedia {
    id?: string;
    _id?: string;
    url: string;
    type?: 'video' | 'image' | string;
    postId?: string | null;
    messageId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
