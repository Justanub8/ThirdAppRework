export interface AuthState {
    user: IProfileUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
}

export interface ILoginPayLoad {
    email?: string;
    password?: string;
}
export interface SignUpPayload {
    username: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export interface IResponseLogin {
    accessToken: string;
    refreshToken?: string;
    user?: IProfileUser;
}
export interface IToken {
    access: string,
    refresh: string,
}
export interface IForgotPasswordPayload {
    email: string;
}
export interface INewPasswordPayload {
    email: string;
    password: string;
}
export interface IVerifyOtpPayload {
    email?: string;
    otp: string;
}
export interface IProfileUser {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    imageUrl?: string;
    postCount: number;
    follower: number;
    following: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IChangePasswordPayload {
    current_password: string;
    new_password: string;
    confirm_password: string;
}
export interface AuthSessionResult {
    token: string;
    refreshToken: string;
    user: IProfileUser;
}

export type RestoreSessionResult = AuthSessionResult | null;