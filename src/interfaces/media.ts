export interface IMedia {
  id?: string;
  url: string;
  /** Small preview (image thumbnail or video poster). Missing on older media. */
  thumbnailUrl?: string | null;
  type?: 'video' | 'image' | string;
  postId?: string | null;
  messageId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
