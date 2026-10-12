import { IProfileUser } from '~/interfaces/auth';

export type ViewTargetType = 'Reel' | 'Story' | string;

export interface IView {
  id?: string;
  userId?: string;
  user?: IProfileUser;
  targetId: string;
  targetType: ViewTargetType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IViewPayload {
  targetId: string;
  targetType: ViewTargetType;
}

export type ViewPayload = IViewPayload;

export interface IResponseGetViews {
  total: number;
  data: IView[];
}
