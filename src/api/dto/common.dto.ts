export type SortDirection = 'ASC' | 'DESC';

export interface PagedResponse {
    page: number;
    size: number;
    totalItems: number;
    sortField: string;
    sortDirection: string;
}

export interface PagedParams {
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: SortDirection;
}

export interface MessageResponse {
    message: string;
}
