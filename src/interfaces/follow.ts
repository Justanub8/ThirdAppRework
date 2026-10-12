import { IProfileUser } from '~/interfaces/auth';

export type FollowStatus = 'PENDING' | 'ACCEPTED';

export interface IFollow {
  id?: string;
  userId?: string;
  user?: IProfileUser;
  followingId: string;
  following?: IProfileUser;
  status: FollowStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFollowPayload {
  followingId: string;
}

export interface IResponseFollowAction {
  message: string;
  follow?: IFollow;
}
