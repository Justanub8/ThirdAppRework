export interface ApiRes<T> {
    status: number;
    datetime: string;
    message: string;
    message_code: string;
    result: T;
}
export interface PaginatedRes<T> {
    data: T[];
    total_record: number;
}