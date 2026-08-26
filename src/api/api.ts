export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface BaseResponse<T = any> {
    message?: string;
    data?: T;
}

// Legacy aliases for backward compatibility
export type ApiRes<T> = BaseResponse<T>;
export type PaginatedRes<T> = PaginatedResponse<T>;